import React from 'react';
import { render, screen } from '@testing-library/react';
import Sidebar from '@/components/shared/Sidebar';

jest.mock('lucide-react', () => ({
  FileQuestionMark: () => <span data-testid="icon-question" />,
  LayoutDashboard: () => <span data-testid="icon-dashboard" />,
  PcCase: () => <span data-testid="icon-classes" />,
  School: () => <span data-testid="icon-school" />,
  SquareFunction: () => <span data-testid="icon-programs" />,
  FileText: () => <span data-testid="icon-transcript" />,
}));

describe('Sidebar', () => {
  it('renders navigation links', () => {
    render(<Sidebar />);

    expect(screen.getByRole('link', { name: /dashboard/i })).toHaveAttribute(
      'href',
      '/dashboard'
    );
    expect(screen.getByRole('link', { name: /classes/i })).toHaveAttribute('href', '/classes');
    expect(screen.getByRole('link', { name: /transcript/i })).toHaveAttribute('href', '/transcript');
    expect(screen.getByRole('link', { name: /institutions/i })).toHaveAttribute(
      'href',
      '/institutions'
    );
    expect(screen.getByRole('link', { name: /programs/i })).toHaveAttribute('href', '/programs');
    expect(screen.getByRole('link', { name: /scenarios/i })).toHaveAttribute('href', '/scenarios');
  });
});
