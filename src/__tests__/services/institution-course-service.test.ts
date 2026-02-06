import { createRouteHandlerClient } from '@/lib/supabase/server';
import {
  getInstitutionCourses,
  getInstitutionCourse,
  createInstitutionCourse,
  updateInstitutionCourse,
  deleteInstitutionCourse,
} from '@/services/institution-course-service';
import { createMockQueryBuilder, createMockRequest } from '../utils/test-utils';

jest.mock('@/lib/supabase/server');

describe('Institution Course Service', () => {
  let mockSupabase: any;
  let mockRequest: Request;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = createMockRequest();
    mockSupabase = {
      auth: {
        getUser: jest.fn(),
      },
      from: jest.fn(),
    };
    (createRouteHandlerClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  it('returns unauthorized when user is missing', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

    const result = await getInstitutionCourses(mockRequest as any);

    expect(result).toEqual({ success: false, error: 'Unauthorized' });
  });

  it('fetches institution courses', async () => {
    const institutionBuilder = createMockQueryBuilder();
    const coursesBuilder = createMockQueryBuilder();

    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    institutionBuilder.single.mockResolvedValue({ data: { id: 'inst-1' }, error: null });
    coursesBuilder.order.mockResolvedValue({
      data: [{ id: 'course-1', course_code: 'CS101' }],
      error: null,
    });

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'institutions') return institutionBuilder;
      return coursesBuilder;
    });

    const result = await getInstitutionCourses(mockRequest as any);

    expect(result.success).toBe(true);
    expect(coursesBuilder.select).toHaveBeenCalledWith('*');
    expect(coursesBuilder.eq).toHaveBeenCalledWith('institution_id', 'inst-1');
  });

  it('fetches a single institution course', async () => {
    const coursesBuilder = createMockQueryBuilder();
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    coursesBuilder.single.mockResolvedValue({ data: { id: 'course-1' }, error: null });
    mockSupabase.from.mockReturnValue(coursesBuilder);

    const result = await getInstitutionCourse('course-1', mockRequest as any);

    expect(result).toEqual({ success: true, data: { id: 'course-1' } });
    expect(coursesBuilder.eq).toHaveBeenCalledWith('id', 'course-1');
  });

  it('creates an institution course', async () => {
    const institutionBuilder = createMockQueryBuilder();
    const coursesBuilder = createMockQueryBuilder();

    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    institutionBuilder.single.mockResolvedValue({ data: { id: 'inst-1' }, error: null });
    coursesBuilder.single.mockResolvedValue({ data: { id: 'course-1' }, error: null });

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'institutions') return institutionBuilder;
      return coursesBuilder;
    });

    const result = await createInstitutionCourse(
      { course_code: 'CS101', course_title: 'Intro' },
      mockRequest as any
    );

    expect(result.success).toBe(true);
    expect(coursesBuilder.insert).toHaveBeenCalled();
  });

  it('handles update errors', async () => {
    const coursesBuilder = createMockQueryBuilder();
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    coursesBuilder.single.mockResolvedValue({
      data: null,
      error: { message: 'Update failed' },
    });
    mockSupabase.from.mockReturnValue(coursesBuilder);

    const result = await updateInstitutionCourse(
      'course-1',
      { course_title: 'Updated' },
      mockRequest as any
    );

    expect(result).toEqual({ success: false, error: 'Update failed' });
  });

  it('deletes an institution course', async () => {
    const coursesBuilder = createMockQueryBuilder();
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    coursesBuilder.eq.mockResolvedValue({ error: null });
    mockSupabase.from.mockReturnValue(coursesBuilder);

    const result = await deleteInstitutionCourse('course-1', mockRequest as any);

    expect(result).toEqual({ success: true });
    expect(coursesBuilder.delete).toHaveBeenCalled();
  });
});
