import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TutorialTooltip from '@/components/onboarding/TutorialTooltip';
import axios from 'axios';

jest.mock('axios');

jest.mock('lucide-react', () => ({
  Lightbulb: () => <span data-testid="icon-lightbulb" />,
}));

describe('TutorialTooltip', () => {
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NODE_ENV = 'development';
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it('renders when tutorial is not completed', async () => {
    const mockedAxios = axios as jest.Mocked<typeof axios>;
    mockedAxios.get.mockResolvedValueOnce({ data: { data: [] } });

    render(
      <TutorialTooltip
        tutorialType="institutions"
        title="Welcome"
        description="Start here"
      />
    );

    expect(await screen.findByText('Welcome')).toBeInTheDocument();
    expect(screen.getByText('Start here')).toBeInTheDocument();
    expect(mockedAxios.get).toHaveBeenCalledWith('/api/onboarding/tutorials');
  });

  it('dismisses when skipped', async () => {
    const user = userEvent.setup();
    const mockedAxios = axios as jest.Mocked<typeof axios>;
    mockedAxios.get.mockResolvedValueOnce({ data: { data: [] } });
    mockedAxios.post.mockResolvedValueOnce({ data: { success: true } });

    render(
      <TutorialTooltip
        tutorialType="institutions"
        title="Welcome"
        description="Start here"
      />
    );

    await screen.findByText('Welcome');
    await user.click(screen.getByRole('button', { name: /got it, don't show again/i }));

    expect(mockedAxios.post).toHaveBeenCalledWith('/api/onboarding/tutorials', {
      tutorial_type: 'institutions',
      skipped: true,
    });

    await waitFor(() => {
      expect(screen.queryByText('Welcome')).not.toBeInTheDocument();
    });
  });

  it('marks complete and advances onboarding', async () => {
    const user = userEvent.setup();
    const mockedAxios = axios as jest.Mocked<typeof axios>;

    const push = jest.fn();
    const refresh = jest.fn();
    jest.spyOn(require('next/navigation'), 'useRouter').mockReturnValue({
      push,
      refresh,
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
    });

    mockedAxios.get.mockImplementation((url: string) => {
      if (url === '/api/onboarding/tutorials') {
        return Promise.resolve({ data: { data: [] } });
      }
      if (url === '/api/onboarding') {
        return Promise.resolve({ data: { data: { steps_completed: ['institutions'] } } });
      }
      return Promise.resolve({ data: { data: [] } });
    });
    mockedAxios.post.mockResolvedValueOnce({ data: { success: true } });
    mockedAxios.put.mockResolvedValueOnce({ data: { success: true } });

    render(
      <TutorialTooltip
        tutorialType="courses"
        title="Courses"
        description="Add your courses"
      />
    );

    await screen.findByText('Courses');
    await user.click(screen.getByRole('button', { name: /mark as complete/i }));

    expect(mockedAxios.post).toHaveBeenCalledWith('/api/onboarding/tutorials', {
      tutorial_type: 'courses',
      skipped: false,
    });

    await waitFor(() => {
      expect(mockedAxios.put).toHaveBeenCalledWith('/api/onboarding', {
        step: 'programs',
        steps_completed: ['institutions', 'courses'],
      });
    });

    expect(push).toHaveBeenCalledWith('/programs');
    expect(refresh).toHaveBeenCalled();
  });
});
