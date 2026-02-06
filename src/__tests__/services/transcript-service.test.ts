import { createRouteHandlerClient } from '@/lib/supabase/server';
import { parseTranscriptWithAI, importTranscriptData } from '@/services/transcript-service';
import { createMockQueryBuilder, createMockRequest } from '../utils/test-utils';

jest.mock('@/lib/supabase/server');

describe('Transcript Service', () => {
  let mockSupabase: any;
  let mockRequest: Request;

  const sampleData = {
    institution: { name: 'Test University', shortCode: 'TU' },
    courses: [
      { title: 'Course 1', credits: 3, grade: 'A', term: 'Fall 2024' },
      { title: 'Course 2', credits: 4, grade: 'B', term: 'Fall 2024' },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = createMockRequest();
    mockSupabase = { from: jest.fn() };
    (createRouteHandlerClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns error when API key is missing', async () => {
    const originalKey = process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY;

    const result = await parseTranscriptWithAI('text');

    expect(result).toEqual({ success: false, error: 'OpenAI API key not configured' });
    process.env.OPENAI_API_KEY = originalKey;
  });

  it('parses transcript and fills grade values', async () => {
    process.env.OPENAI_API_KEY = 'test-key';

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({
                institution: { name: 'Test University', shortCode: 'TU' },
                courses: [{ title: 'Course 1', credits: 3, grade: 'A', term: 'Fall 2024' }],
              }),
            },
          },
        ],
      }),
    }) as any;

    const result = await parseTranscriptWithAI('text');

    expect(result.success).toBe(true);
    expect(result.data?.courses[0].gradeValue).toBe(4.0);
  });

  it('imports transcript data with existing institution and term', async () => {
    const institutionsBuilder = createMockQueryBuilder();
    const termsBuilder = createMockQueryBuilder();
    const coursesBuilder = createMockQueryBuilder();

    institutionsBuilder.single.mockResolvedValue({ data: { id: 'inst-1' }, error: null });
    termsBuilder.single.mockResolvedValue({ data: { id: 'term-1' }, error: null });
    coursesBuilder.insert.mockResolvedValue({ error: null });

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'institutions') return institutionsBuilder;
      if (table === 'terms') return termsBuilder;
      return coursesBuilder;
    });

    const result = await importTranscriptData('user-1', sampleData as any, mockRequest as any);

    expect(result.success).toBe(true);
    expect(result.result?.totalCourses).toBe(2);
  });

  it('creates institution when missing', async () => {
    const institutionsBuilder = createMockQueryBuilder();
    const termsBuilder = createMockQueryBuilder();
    const coursesBuilder = createMockQueryBuilder();

    institutionsBuilder.single
      .mockResolvedValueOnce({ data: null, error: null })
      .mockResolvedValueOnce({ data: { id: 'inst-2' }, error: null });

    termsBuilder.single
      .mockResolvedValueOnce({ data: null, error: null })
      .mockResolvedValueOnce({ data: { id: 'term-2' }, error: null });

    coursesBuilder.insert.mockResolvedValue({ error: null });

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'institutions') return institutionsBuilder;
      if (table === 'terms') return termsBuilder;
      return coursesBuilder;
    });

    const result = await importTranscriptData('user-1', sampleData as any, mockRequest as any);

    expect(result.success).toBe(true);
    expect(institutionsBuilder.insert).toHaveBeenCalled();
  });
});
