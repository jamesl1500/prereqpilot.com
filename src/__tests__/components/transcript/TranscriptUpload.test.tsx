import React from 'react';
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TranscriptUpload from '@/components/transcript/TranscriptUpload';
import axios from 'axios';

jest.mock('axios');

jest.mock('lucide-react', () => ({
  Upload: () => <span data-testid="icon-upload" />,
  FileText: () => <span data-testid="icon-file" />,
  Loader: () => <span data-testid="icon-loader" />,
  CheckCircle: () => <span data-testid="icon-check" />,
  AlertCircle: () => <span data-testid="icon-alert" />,
  X: () => <span data-testid="icon-x" />,
}));

describe('TranscriptUpload', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('shows error for non-PDF file', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<TranscriptUpload onImportComplete={jest.fn()} />);

    const dropzoneText = screen.getByText('Drag and drop your transcript PDF here');
    const dropzone = dropzoneText.closest('div') as HTMLElement;

    const file = new File(['hello'], 'notes.txt', { type: 'text/plain' });
    fireEvent.drop(dropzone, { dataTransfer: { files: [file] } });

    expect(await screen.findByText('Please upload a PDF file')).toBeInTheDocument();
  });

  it('uploads transcript and shows success', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const onImportComplete = jest.fn();
    const mockedAxios = axios as jest.Mocked<typeof axios>;

    mockedAxios.post.mockResolvedValueOnce({
      data: {
        success: true,
        result: {
          institution: { name: 'Test University', short_code: 'TU' },
          terms: [{ name: 'Fall 2024', courses: 3 }],
          totalCourses: 3,
          totalCredits: 9.0,
        },
      },
    });

    render(<TranscriptUpload onImportComplete={onImportComplete} />);

    const label = screen.getByText('Browse Files').closest('label');
    const input = label?.querySelector('input[type="file"]') as HTMLInputElement;

    const file = new File(['pdf'], 'transcript.pdf', { type: 'application/pdf' });
    await user.upload(input, file);

    await user.click(screen.getByRole('button', { name: /process transcript/i }));

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/transcripts/parse',
        expect.any(FormData),
        expect.any(Object)
      );
    });

    expect(await screen.findByText('Import Successful!')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(onImportComplete).toHaveBeenCalled();
  });

  it('shows server error message', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const mockedAxios = axios as jest.Mocked<typeof axios>;

    mockedAxios.post.mockResolvedValueOnce({
      data: {
        success: false,
        error: 'Failed to process transcript',
      },
    });

    render(<TranscriptUpload onImportComplete={jest.fn()} />);

    const label = screen.getByText('Browse Files').closest('label');
    const input = label?.querySelector('input[type="file"]') as HTMLInputElement;

    const file = new File(['pdf'], 'transcript.pdf', { type: 'application/pdf' });
    await user.upload(input, file);

    await user.click(screen.getByRole('button', { name: /process transcript/i }));

    expect(await screen.findByText('Failed to process transcript')).toBeInTheDocument();
  });
});
