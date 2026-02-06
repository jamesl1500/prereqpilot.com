/**
 * API Route Tests for Onboarding
 */

import { NextRequest } from 'next/server';
import { GET, PUT } from '@/app/api/onboarding/route';
import { createRouteHandlerClient } from '@/lib/supabase/server';
import { getOnboardingStatus, updateOnboardingStep, completeOnboarding } from '@/services/onboarding-service';

jest.mock('@/lib/supabase/server');
jest.mock('@/services/onboarding-service');

describe('Onboarding API Routes', () => {
  let mockSupabase: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabase = {
      auth: {
        getUser: jest.fn(),
      },
    };
    (createRouteHandlerClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  it('GET should return 401 when unauthorized', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

    const request = new NextRequest('http://localhost:3000/api/onboarding');
    const response = await GET(request);

    expect(response.status).toBe(401);
  });

  it('GET should return onboarding data', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    (getOnboardingStatus as jest.Mock).mockResolvedValue({
      success: true,
      data: { onboarding_completed: false },
    });

    const request = new NextRequest('http://localhost:3000/api/onboarding');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.onboarding_completed).toBe(false);
  });

  it('PUT should update onboarding step', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    (updateOnboardingStep as jest.Mock).mockResolvedValue({ success: true, data: {} });

    const request = new NextRequest('http://localhost:3000/api/onboarding', {
      method: 'PUT',
      body: JSON.stringify({ step: 'courses', steps_completed: ['institutions'] }),
    });

    const response = await PUT(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('PUT should complete onboarding', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    (completeOnboarding as jest.Mock).mockResolvedValue({ success: true, data: {} });

    const request = new NextRequest('http://localhost:3000/api/onboarding', {
      method: 'PUT',
      body: JSON.stringify({ complete: true }),
    });

    const response = await PUT(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});
