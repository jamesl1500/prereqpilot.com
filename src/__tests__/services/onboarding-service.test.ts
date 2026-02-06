import { createRouteHandlerClient } from '@/lib/supabase/server';
import {
  getOnboardingStatus,
  updateOnboardingStep,
  completeOnboarding,
  getTutorialProgress,
  markTutorialComplete,
} from '@/services/onboarding-service';
import { createMockQueryBuilder, createMockRequest } from '../utils/test-utils';

jest.mock('@/lib/supabase/server');

describe('Onboarding Service', () => {
  let mockSupabase: any;
  let mockRequest: Request;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = createMockRequest();
    mockSupabase = { from: jest.fn() };
    (createRouteHandlerClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  it('creates onboarding record when missing', async () => {
    const builder = createMockQueryBuilder();
    builder.single
      .mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } })
      .mockResolvedValueOnce({ data: { user_id: 'user-1' }, error: null });

    mockSupabase.from.mockReturnValue(builder);

    const result = await getOnboardingStatus('user-1', mockRequest as any);

    expect(result.success).toBe(true);
    expect(builder.insert).toHaveBeenCalled();
  });

  it('updates onboarding step', async () => {
    const builder = createMockQueryBuilder();
    builder.single.mockResolvedValue({ data: { current_step: 'courses' }, error: null });
    mockSupabase.from.mockReturnValue(builder);

    const result = await updateOnboardingStep(
      'user-1',
      'courses',
      ['dashboard_intro'],
      mockRequest as any
    );

    expect(result.success).toBe(true);
    expect(builder.update).toHaveBeenCalledWith({
      current_step: 'courses',
      steps_completed: ['dashboard_intro'],
    });
  });

  it('returns error when update fails', async () => {
    const builder = createMockQueryBuilder();
    builder.single.mockResolvedValue({ data: null, error: new Error('Update failed') });
    mockSupabase.from.mockReturnValue(builder);

    const result = await updateOnboardingStep(
      'user-1',
      'courses',
      [],
      mockRequest as any
    );

    expect(result).toEqual({ success: false, error: 'Update failed' });
  });

  it('completes onboarding', async () => {
    const builder = createMockQueryBuilder();
    builder.single.mockResolvedValue({ data: { onboarding_completed: true }, error: null });
    mockSupabase.from.mockReturnValue(builder);

    const result = await completeOnboarding('user-1', mockRequest as any);

    expect(result.success).toBe(true);
  });

  it('gets tutorial progress', async () => {
    const builder = createMockQueryBuilder();
    builder.eq.mockResolvedValue({ data: [{ tutorial_type: 'courses' }], error: null });
    mockSupabase.from.mockReturnValue(builder);

    const result = await getTutorialProgress('user-1', mockRequest as any);

    expect(result).toEqual({ success: true, data: [{ tutorial_type: 'courses' }] });
  });

  it('marks tutorial complete', async () => {
    const builder = createMockQueryBuilder();
    builder.single.mockResolvedValue({ data: { id: 't1' }, error: null });
    mockSupabase.from.mockReturnValue(builder);

    const result = await markTutorialComplete('user-1', 'courses', false, mockRequest as any);

    expect(result.success).toBe(true);
    expect(builder.insert).toHaveBeenCalled();
  });
});
