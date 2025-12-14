/**
 * Transcript Parsing API Route
 * Handles PDF upload and AI-powered parsing
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/lib/supabase/server';
import { parseTranscriptWithAI, importTranscriptData } from '@/services/transcript-service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Helper to extract text from PDF
async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const PDFParser = require('pdf2json');
      const pdfParser = new PDFParser();

      pdfParser.on('pdfParser_dataError', (errData: any) => {
        reject(new Error('PDF parsing error: ' + errData.parserError));
      });

      pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
        try {
          // Extract text from all pages
          let text = '';
          if (pdfData.Pages) {
            pdfData.Pages.forEach((page: any) => {
              if (page.Texts) {
                page.Texts.forEach((textItem: any) => {
                  if (textItem.R) {
                    textItem.R.forEach((r: any) => {
                      if (r.T) {
                        // Decode URI component and add space
                        text += decodeURIComponent(r.T) + ' ';
                      }
                    });
                  }
                });
                text += '\n'; // New line after each page
              }
            });
          }
          resolve(text.trim());
        } catch (error) {
          reject(new Error('Failed to process PDF data: ' + (error instanceof Error ? error.message : String(error))));
        }
      });

      // Parse the buffer
      pdfParser.parseBuffer(buffer);
    } catch (error) {
      reject(new Error('Failed to initialize PDF parser: ' + (error instanceof Error ? error.message : String(error))));
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient(request);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'File must be a PDF' },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Extract text from PDF
    const text = await extractTextFromPDF(buffer);

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Could not extract text from PDF. Please ensure the PDF contains readable text.' },
        { status: 400 }
      );
    }

    // Parse with AI
    const parseResult = await parseTranscriptWithAI(text);

    if (!parseResult.success || !parseResult.data) {
      return NextResponse.json(
        { error: parseResult.error || 'Failed to parse transcript' },
        { status: 400 }
      );
    }

    // Import data to database
    const importResult = await importTranscriptData(user.id, parseResult.data, request);

    if (!importResult.success) {
      return NextResponse.json(
        { error: importResult.error || 'Failed to import transcript data' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      result: importResult.result,
    });

  } catch (error) {
    console.error('Transcript parsing error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
