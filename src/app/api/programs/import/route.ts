import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/lib/supabase/server';
import { logApiError } from '@/lib/error_logs';

interface AiInstitution {
  name: string;
  short_code?: string | null;
  website_url?: string | null;
}

interface AiPrerequisite {
  course_code?: string | null;
  course_title?: string | null;
  credits?: number | null;
  min_grade?: string | null;
  description?: string | null;
  category?: string | null;
}

interface AiProgram {
  name: string;
  description?: string | null;
  min_prereq_gpa?: number | null;
  min_overall_gpa?: number | null;
  requirements_text?: string | null;
}

interface AiImportResult {
  institution: AiInstitution;
  program: AiProgram;
  prerequisites?: AiPrerequisite[];
}

function extractTextFromHtml(html: string) {
  const withoutScripts = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ');
  const text = withoutScripts.replace(/<[^>]+>/g, ' ');
  return text.replace(/\s+/g, ' ').trim().slice(0, 12000);
}

function normalizeNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function deriveShortCode(name: string) {
  const words = name
    .replace(/[^a-zA-Z0-9 ]/g, ' ')
    .split(' ')
    .filter(Boolean);
  if (words.length === 0) return null;
  if (words.length === 1) return words[0].slice(0, 6).toUpperCase();
  return words.map((word) => word[0]).join('').slice(0, 6).toUpperCase();
}

async function runAiExtraction(url: string, text: string): Promise<AiImportResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  const systemPrompt =
    'You are an assistant that extracts structured program requirements from university webpages. ' +
    'Return a JSON object with keys: institution, program, prerequisites. ' +
    'institution must include name, optional short_code, optional website_url. ' +
    'program must include name, optional description, optional min_prereq_gpa, optional min_overall_gpa, optional requirements_text. ' +
    'prerequisites is an array of objects with course_code, course_title, credits, min_grade, description, category.';

  const userPrompt = `URL: ${url}\n\nPAGE TEXT:\n${text}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      max_tokens: 900,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI extraction failed: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('AI response was empty');
  }

  return JSON.parse(content) as AiImportResult;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient(request);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const url = typeof body?.url === 'string' ? body.url.trim() : '';

    if (!url) {
      return NextResponse.json({ error: 'A valid URL is required.' }, { status: 400 });
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json({ error: 'URL is invalid.' }, { status: 400 });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    let pageText = '';

    try {
      const response = await fetch(parsedUrl.toString(), {
        signal: controller.signal,
        headers: {
          'User-Agent': 'PrereqPilotBot/1.0',
        },
      });

      if (!response.ok) {
        return NextResponse.json({ error: 'Failed to fetch the page content.' }, { status: 400 });
      }

      const html = await response.text();
      pageText = extractTextFromHtml(html);
    } finally {
      clearTimeout(timeout);
    }

    if (!pageText) {
      return NextResponse.json({ error: 'No readable text found on the page.' }, { status: 400 });
    }

    const aiResult = await runAiExtraction(parsedUrl.toString(), pageText);

    const institutionName = aiResult?.institution?.name?.trim();
    const programName = aiResult?.program?.name?.trim();

    if (!institutionName || !programName) {
      return NextResponse.json({ error: 'Unable to extract institution or program name from the page.' }, { status: 422 });
    }

    const institutionShortCode = aiResult.institution.short_code?.trim() || deriveShortCode(institutionName);
    const institutionWebsite = aiResult.institution.website_url?.trim() || parsedUrl.origin;

    let institutionId: string | null = null;

    if (institutionShortCode) {
      const { data: existingByCode } = await supabase
        .from('institutions')
        .select('id')
        .eq('short_code', institutionShortCode)
        .maybeSingle();

      institutionId = existingByCode?.id || null;
    }

    if (!institutionId) {
      const { data: existingByName } = await supabase
        .from('institutions')
        .select('id')
        .ilike('name', institutionName)
        .maybeSingle();

      institutionId = existingByName?.id || null;
    }

    if (!institutionId) {
      const { data: newInstitution, error: institutionError } = await supabase
        .from('institutions')
        .insert([
          {
            name: institutionName,
            short_code: institutionShortCode,
            website_url: institutionWebsite,
            user_id: user.id,
            status: 'pending',
            is_official: false,
          },
        ])
        .select('id')
        .single();

      if (institutionError) throw institutionError;
      institutionId = newInstitution.id;
    }

    const { data: program, error: programError } = await supabase
      .from('program_requirements')
      .insert([
        {
          name: programName,
          description: aiResult.program.description || null,
          min_prereq_gpa: normalizeNumber(aiResult.program.min_prereq_gpa),
          min_overall_gpa: normalizeNumber(aiResult.program.min_overall_gpa),
          requirements_text: aiResult.program.requirements_text || null,
          institution_id: institutionId,
          user_id: user.id,
          is_official: false,
        },
      ])
      .select('id, name')
      .single();

    if (programError) throw programError;

    const prerequisites = Array.isArray(aiResult.prerequisites) ? aiResult.prerequisites : [];
    const prerequisiteRows = prerequisites
      .map((prereq, index) => {
        const title = prereq.course_title?.trim() || prereq.course_code?.trim();
        if (!title) return null;

        return {
          program_requirement_id: program.id,
          course_title: title,
          course_code: prereq.course_code?.trim() || null,
          credits: normalizeNumber(prereq.credits) ?? 0,
          min_grade: prereq.min_grade?.trim() || null,
          description: prereq.description?.trim() || null,
          category: prereq.category?.trim() || null,
          is_required: true,
          display_order: index + 1,
        };
      })
      .filter(Boolean);

    if (prerequisiteRows.length > 0) {
      const { error: prereqError } = await supabase
        .from('program_required_courses')
        .insert(prerequisiteRows as Array<Record<string, unknown>>);

      if (prereqError) throw prereqError;
    }

    return NextResponse.json({
      success: true,
      programId: program.id,
      programName: program.name,
      institutionId,
      prerequisitesAdded: prerequisiteRows.length,
    });
  } catch (error) {
    await logApiError({
      request,
      error,
      functionName: 'POST',
    });

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to import program from website.' },
      { status: 500 }
    );
  }
}
