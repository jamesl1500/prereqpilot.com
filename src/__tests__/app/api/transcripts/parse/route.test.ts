import { NextRequest } from 'next/server';
import { POST } from '@/app/api/transcripts/parse/route';
import { createRouteHandlerClient } from '@/lib/supabase/server';
import { parseTranscriptWithAI, importTranscriptData } from '@/services/transcript-service';
import { logApiError } from '@/lib/error_logs';

jest.mock('@/lib/supabase/server');
jest.mock('@/services/transcript-service');
jest.mock('@/lib/error_logs');

let mockPdfData: any = null;
let mockPdfError: string | null = null;

jest.mock('pdf2json', () => {
  return function PDFParser(this: any) {
    this.handlers = {};
    this.on = (event: string, cb: (arg: any) => void) => {
      this.handlers[event] = cb;
    };
    this.parseBuffer = () => {
      if (mockPdfError && this.handlers.pdfParser_dataError) {
        this.handlers.pdfParser_dataError({ parserError: mockPdfError });
        return;
      }
      if (this.handlers.pdfParser_dataReady) {
        this.handlers.pdfParser_dataReady(mockPdfData ?? {
          Pages: [{ Texts: [{ R: [{ T: 'Hello%20World' }] }] }],
        });
      }
    };
  };
});

describe('Transcript Parse API', () => {
  const mockSupabase = {
    auth: {
      getUser: jest.fn(),
    },
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPdfData = null;
    mockPdfError = null;
    (createRouteHandlerClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  it('returns 401 when unauthorized', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

    const request = {
      formData: async () => ({ get: () => null }),
    } as NextRequest;

    const response = await POST(request);
    expect(response.status).toBe(401);
  });

  it('returns 400 when file missing', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });

    const request = {
      formData: async () => ({ get: () => null }),
    } as NextRequest;

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('returns 400 for non-pdf file', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });

    const request = {
      formData: async () => ({
        get: () => ({
          type: 'text/plain',
          size: 4,
          arrayBuffer: async () => new ArrayBuffer(4),
        }),
      }),
    } as NextRequest;

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('returns 400 when AI parse fails', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    (parseTranscriptWithAI as jest.Mock).mockResolvedValue({ success: false, error: 'AI failed' });

    const request = {
      formData: async () => ({
        get: () => ({
          type: 'application/pdf',
          size: 10,
          arrayBuffer: async () => new ArrayBuffer(8),
        }),
      }),
    } as NextRequest;

    const response = await POST(request);
    expect(response.status).toBe(400);
    expect(logApiError).toHaveBeenCalled();
  });

  it('imports transcript when parse succeeds', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    (parseTranscriptWithAI as jest.Mock).mockResolvedValue({ success: true, data: { terms: [] } });
    (importTranscriptData as jest.Mock).mockResolvedValue({ success: true, result: { inserted: 1 } });

    const request = {
      formData: async () => ({
        get: () => ({
          type: 'application/pdf',
          size: 10,
          arrayBuffer: async () => new ArrayBuffer(8),
        }),
      }),
    } as NextRequest;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});
