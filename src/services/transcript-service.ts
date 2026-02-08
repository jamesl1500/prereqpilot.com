/**
 * Transcript Parsing Service
 * Handles AI-powered transcript parsing and data import
 */

import { createRouteHandlerClient } from '@/lib/supabase/server';

interface ParsedCourse {
  title: string;
  code?: string;
  credits: number;
  grade?: string;
  gradeValue?: number;
  term: string;
}

interface ParsedData {
  institution: {
    name: string;
    shortCode: string;
    country?: string;
  };
  courses: ParsedCourse[];
}

interface TranscriptImportResult {
  institution: {
    name: string;
    short_code: string;
  };
  terms: Array<{ name: string; courses: number }>;
  totalCourses: number;
  totalCredits: number;
}

const gradeToGPA: Record<string, number> = {
  'A+': 4.0, 'A': 4.0, 'A-': 3.7,
  'B+': 3.3, 'B': 3.0, 'B-': 2.7,
  'C+': 2.3, 'C': 2.0, 'C-': 1.7,
  'D+': 1.3, 'D': 1.0, 'D-': 0.7,
  'F': 0.0
};

/**
 * Parse transcript PDF text with OpenAI
 */
export async function parseTranscriptWithAI(text: string): Promise<{ success: boolean; data?: ParsedData; error?: string }> {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return { success: false, error: 'OpenAI API key not configured' };
    }

    const prompt = `You are a transcript parser. Extract structured data from this academic transcript.

TRANSCRIPT TEXT:
${text}

Extract and return ONLY a JSON object with this exact structure:
{
  "institution": {
    "name": "Full institution name",
    "shortCode": "Short code or abbreviation (e.g., UCLA, MIT)",
    "country": "Country name (optional)"
  },
  "courses": [
    {
      "title": "Course title",
      "code": "Course code (e.g., CS101)",
      "credits": numeric value,
      "grade": "Letter grade (e.g., A, B+)",
      "gradeValue": numeric GPA value (0.0-4.0),
      "term": "Term name (e.g., Fall 2023, Spring 2024)"
    }
  ]
}

Rules:
1. Extract ALL courses with their exact titles
2. Include course codes if present
3. Convert letter grades to 4.0 scale GPA values
4. Use standardized term format: Season YYYY (e.g., "Fall 2023")
5. If credits are in semester hours, use those values
6. Skip repeated/retaken courses (use the most recent)
7. Return valid JSON only, no markdown or explanation`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a precise transcript parser that extracts structured data from academic transcripts. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData.error?.message || 'OpenAI API error' };
    }

    const result = await response.json();
    const content = result.choices[0].message.content;
    const parsedData: ParsedData = JSON.parse(content);

    // Validate the parsed data
    if (!parsedData.institution || !parsedData.institution.name) {
      return { success: false, error: 'Could not identify institution from transcript' };
    }

    if (!parsedData.courses || parsedData.courses.length === 0) {
      return { success: false, error: 'No courses found in transcript' };
    }

    // Fill in missing GPA values
    parsedData.courses.forEach(course => {
      if (course.grade && !course.gradeValue) {
        const upperGrade = course.grade.toUpperCase();
        if (gradeToGPA[upperGrade] !== undefined) {
          course.gradeValue = gradeToGPA[upperGrade];
        }
      }
    });

    return { success: true, data: parsedData };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to parse transcript',
    };
  }
}

/**
 * Import parsed transcript data to database
 */
export async function importTranscriptData(
  userId: string,
  data: ParsedData,
  request: Request
): Promise<{ success: boolean; result?: TranscriptImportResult; error?: string }> {
  try {
    const supabase = createRouteHandlerClient(request);

    // Create or find institution
    let institutionId: string;
    
    // Check if institution already exists for this user
    const { data: existingInst } = await supabase
      .from('institutions')
      .select('id')
      .eq('user_id', userId)
      .eq('short_code', data.institution.shortCode)
      .single();

    if (existingInst) {
      institutionId = existingInst.id;
    } else {
      // Create new institution
      const { data: newInst, error: instError } = await supabase
        .from('institutions')
        .insert({
          name: data.institution.name,
          short_code: data.institution.shortCode,
          country: data.institution.country || null,
          user_id: userId,
        })
        .select('id')
        .single();

      if (instError || !newInst) {
        throw new Error('Failed to create institution');
      }

      institutionId = newInst.id;
    }

    // Group courses by term
    const termMap = new Map<string, string>();
    const coursesByTerm = new Map<string, ParsedCourse[]>();

    data.courses.forEach(course => {
      if (!coursesByTerm.has(course.term)) {
        coursesByTerm.set(course.term, []);
      }
      coursesByTerm.get(course.term)!.push(course);
    });

    // Create terms and courses
    let totalImported = 0;
    let totalCredits = 0;

    for (const [termName, courses] of coursesByTerm) {
      // Check if term exists
      const { data: existingTerm } = await supabase
        .from('terms')
        .select('id')
        .eq('user_id', userId)
        .eq('name', termName)
        .single();

      let termId: string;

      if (existingTerm) {
        termId = existingTerm.id;
      } else {
        // Create new term
        const { data: newTerm, error: termError } = await supabase
          .from('terms')
          .insert({
            user_id: userId,
            name: termName,
          })
          .select('id')
          .single();

        if (termError || !newTerm) {
          console.error('Failed to create term:', termName);
          continue;
        }

        termId = newTerm.id;
      }

      termMap.set(termName, termId);

      // Import courses for this term
      const coursesToInsert = courses.map(course => ({
        user_id: userId,
        institution_id: institutionId,
        term_id: termId,
        course_title: course.title,
        credits: course.credits,
        grade: course.grade || null,
        grade_value: course.gradeValue || null,
      }));

      const { error: courseError } = await supabase
        .from('taken_courses')
        .insert(coursesToInsert);

      if (!courseError) {
        totalImported += courses.length;
        totalCredits += courses.reduce((sum, c) => sum + c.credits, 0);
      }
    }

    return {
      success: true,
      result: {
        institution: {
          name: data.institution.name,
          short_code: data.institution.shortCode,
        },
        terms: Array.from(coursesByTerm.entries()).map(([name, courses]) => ({
          name,
          courses: courses.length,
        })),
        totalCourses: totalImported,
        totalCredits,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to import transcript data',
    };
  }
}
