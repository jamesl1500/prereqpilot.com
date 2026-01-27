/**
 * Integration tests for Transcript Upload and Parsing
 */

import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders, mockUser, mockCourse } from '../utils/test-helpers';
import TranscriptPage from '@/app/transcript/TranscriptPage';

describe('Transcript Upload Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render transcript upload interface', () => {
    renderWithProviders(<TranscriptPage user={mockUser} takenCourses={[]} institutions={[]} />);
    
    expect(screen.getByText(/upload your transcript/i)).toBeInTheDocument();
    expect(screen.getByText(/drag and drop/i)).toBeInTheDocument();
  });

  it('should handle file selection', async () => {
    const { user } = renderWithProviders(<TranscriptPage user={mockUser} takenCourses={[]} institutions={[]} />);
    
    const file = new File(['transcript content'], 'transcript.pdf', { type: 'application/pdf' });
    const input = screen.getByLabelText(/upload/i, { selector: 'input[type="file"]' });
    
    await user.upload(input, file);
    
    await waitFor(() => {
      expect(screen.getByText('transcript.pdf')).toBeInTheDocument();
    });
  });

  it('should validate file type', async () => {
    const { user } = renderWithProviders(<TranscriptPage user={mockUser} takenCourses={[]} institutions={[]} />);
    
    const file = new File(['content'], 'document.txt', { type: 'text/plain' });
    const input = screen.getByLabelText(/upload/i, { selector: 'input[type="file"]' });
    
    await user.upload(input, file);
    
    await waitFor(() => {
      expect(screen.getByText(/only pdf files are supported/i)).toBeInTheDocument();
    });
  });

  it('should parse transcript and extract courses', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: {
            courses: [
              { code: 'CS101', title: 'Intro to CS', credits: 3, grade: 'A' },
              { code: 'MATH201', title: 'Calculus I', credits: 4, grade: 'B+' },
            ],
            gpa: 3.7,
          },
        }),
      } as Response)
    );

    const { user } = renderWithProviders(<TranscriptPage user={mockUser} takenCourses={[]} institutions={[]} />);
    
    const file = new File(['transcript content'], 'transcript.pdf', { type: 'application/pdf' });
    const input = screen.getByLabelText(/upload/i, { selector: 'input[type="file"]' });
    
    await user.upload(input, file);
    
    const uploadButton = screen.getByRole('button', { name: /process transcript/i });
    await user.click(uploadButton);
    
    await waitFor(() => {
      expect(screen.getByText('CS101')).toBeInTheDocument();
      expect(screen.getByText('MATH201')).toBeInTheDocument();
      expect(screen.getByText(/3\.7/)).toBeInTheDocument();
    });
  });

  it('should allow reviewing extracted courses', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: {
            courses: [mockCourse],
          },
        }),
      } as Response)
    );

    const { user } = renderWithProviders(<TranscriptPage user={mockUser} takenCourses={[]} institutions={[]} />);
    
    const file = new File(['content'], 'transcript.pdf', { type: 'application/pdf' });
    const input = screen.getByLabelText(/upload/i, { selector: 'input[type="file"]' });
    await user.upload(input, file);
    
    const uploadButton = screen.getByRole('button', { name: /process/i });
    await user.click(uploadButton);
    
    await waitFor(() => {
      expect(screen.getByText(/review courses/i)).toBeInTheDocument();
    });
  });

  it('should allow editing extracted course data', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: {
            courses: [{ ...mockCourse, grade: 'B' }],
          },
        }),
      } as Response)
    );

    const { user } = renderWithProviders(<TranscriptPage user={mockUser} takenCourses={[]} institutions={[]} />);
    
    const file = new File(['content'], 'transcript.pdf', { type: 'application/pdf' });
    const input = screen.getByLabelText(/upload/i, { selector: 'input[type="file"]' });
    await user.upload(input, file);
    
    await user.click(screen.getByRole('button', { name: /process/i }));
    
    await waitFor(async () => {
      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);
    });
    
    const gradeInput = screen.getByLabelText(/grade/i);
    await user.clear(gradeInput);
    await user.type(gradeInput, 'A');
    
    await user.click(screen.getByRole('button', { name: /save/i }));
    
    await waitFor(() => {
      expect(screen.getByText('A')).toBeInTheDocument();
    });
  });

  it('should save approved courses to database', async () => {
    const saveCoursesFetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      } as Response)
    );

    global.fetch = saveCoursesFetch;

    const { user } = renderWithProviders(<TranscriptPage user={mockUser} takenCourses={[]} institutions={[]} />);
    
    // Mock already parsed courses
    const file = new File(['content'], 'transcript.pdf', { type: 'application/pdf' });
    const input = screen.getByLabelText(/upload/i, { selector: 'input[type="file"]' });
    await user.upload(input, file);
    
    await user.click(screen.getByRole('button', { name: /process/i }));
    
    await waitFor(async () => {
      const saveButton = screen.getByRole('button', { name: /save courses/i });
      await user.click(saveButton);
    });
    
    await waitFor(() => {
      expect(saveCoursesFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/courses'),
        expect.objectContaining({ method: 'POST' })
      );
    });
  });

  it('should show progress during transcript processing', async () => {
    global.fetch = jest.fn(() => new Promise(() => {})); // Never resolves

    const { user } = renderWithProviders(<TranscriptPage user={mockUser} takenCourses={[]} institutions={[]} />);
    
    const file = new File(['content'], 'transcript.pdf', { type: 'application/pdf' });
    const input = screen.getByLabelText(/upload/i, { selector: 'input[type="file"]' });
    await user.upload(input, file);
    
    const uploadButton = screen.getByRole('button', { name: /process/i });
    await user.click(uploadButton);
    
    expect(screen.getByText(/processing/i)).toBeInTheDocument();
    expect(uploadButton).toBeDisabled();
  });

  it('should handle parsing errors gracefully', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Unable to parse transcript' }),
      } as Response)
    );

    const { user } = renderWithProviders(<TranscriptPage user={mockUser} takenCourses={[]} institutions={[]} />);
    
    const file = new File(['content'], 'transcript.pdf', { type: 'application/pdf' });
    const input = screen.getByLabelText(/upload/i, { selector: 'input[type="file"]' });
    await user.upload(input, file);
    
    await user.click(screen.getByRole('button', { name: /process/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/unable to parse transcript/i)).toBeInTheDocument();
    });
  });
});
