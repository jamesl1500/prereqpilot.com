import { createRouteHandlerClient } from '@/lib/supabase/server';
import * as service from '@/services/program-requirement-service';
import { createMockQueryBuilder, createMockRequest } from '../utils/test-utils';

jest.mock('@/lib/supabase/server');

describe('Program Requirement Service', () => {
  let mockSupabase: any;
  let mockRequest: Request;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = createMockRequest();
    mockSupabase = {
      auth: { getUser: jest.fn() },
      from: jest.fn(),
    };
    (createRouteHandlerClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns unauthorized when user is missing', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

    const result = await service.getAllProgramRequirements(mockRequest as any);

    expect(result).toEqual({ success: false, error: 'Unauthorized' });
  });

  it('denies access to another user program', async () => {
    const builder = createMockQueryBuilder();
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    builder.single.mockResolvedValue({ data: { id: 'p1', user_id: 'user-2' }, error: null });
    mockSupabase.from.mockReturnValue(builder);

    const result = await service.getProgramRequirement('p1', mockRequest as any);

    expect(result).toEqual({ success: false, error: 'Unauthorized' });
  });

  it('creates a program requirement', async () => {
    const builder = createMockQueryBuilder();
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    builder.single.mockResolvedValue({ data: { id: 'p1' }, error: null });
    mockSupabase.from.mockReturnValue(builder);

    const result = await service.createProgramRequirement({ name: 'Program' }, mockRequest as any);

    expect(result.success).toBe(true);
    expect(builder.insert).toHaveBeenCalled();
  });

  it('returns not found on delete when no rows affected', async () => {
    const builder = createMockQueryBuilder();
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    builder.select.mockResolvedValue({ data: [], error: null });
    mockSupabase.from.mockReturnValue(builder);

    const result = await service.deleteProgramRequirement('p1', mockRequest as any);

    expect(result).toEqual({ success: false, error: 'Not found or not authorized' });
  });

  it('gets required courses', async () => {
    const builder = createMockQueryBuilder();
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    builder.order
      .mockImplementationOnce(() => builder)
      .mockResolvedValueOnce({ data: [{ id: 'c1' }], error: null });
    mockSupabase.from.mockReturnValue(builder);

    const result = await service.getRequiredCourses('p1', mockRequest as any);

    expect(result).toEqual({ success: true, data: [{ id: 'c1' }] });
  });

  it('bubbles error when create required course is not authorized', async () => {
    const builder = createMockQueryBuilder();
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    builder.single.mockResolvedValue({ data: { id: 'p1', user_id: 'user-2' }, error: null });
    mockSupabase.from.mockReturnValue(builder);

    const result = await service.createRequiredCourse(
      { program_requirement_id: 'p1', course_title: 'Course', credits: 3 },
      mockRequest as any
    );

    expect(result).toEqual({ success: false, error: 'Unauthorized' });
  });

  it('creates a course mapping', async () => {
    const builder = createMockQueryBuilder();
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    builder.single.mockResolvedValue({ data: { id: 'm1' }, error: null });
    mockSupabase.from.mockReturnValue(builder);

    const result = await service.createCourseMapping(
      {
        program_requirement_id: 'p1',
        program_required_course_id: 'rc1',
        is_completed: false,
      },
      mockRequest as any
    );

    expect(result.success).toBe(true);
  });

  it('gets program with details', async () => {
    const programBuilder = createMockQueryBuilder();
    const coursesBuilder = createMockQueryBuilder();

    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    programBuilder.single.mockResolvedValue({ data: { id: 'p1', user_id: null, name: 'Program' }, error: null });
    coursesBuilder.order
      .mockImplementationOnce(() => coursesBuilder)
      .mockResolvedValueOnce({
        data: [
          { credits: 3, is_required: true },
          { credits: 2, is_required: false },
        ],
        error: null,
      });

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'program_requirements') return programBuilder;
      return coursesBuilder;
    });

    const result = await service.getProgramWithDetails('p1', mockRequest as any);

    expect(result.success).toBe(true);
    expect(result.data?.total_credits).toBe(5);
    expect(result.data?.required_count).toBe(1);
    expect(result.data?.optional_count).toBe(1);
  });
});
