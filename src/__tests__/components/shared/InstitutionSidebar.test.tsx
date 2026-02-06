import React from 'react';
import { render, screen } from '@testing-library/react';
import InstitutionSidebar from '@/components/shared/InstitutionSidebar';

jest.mock('lucide-react', () => ({
  LayoutDashboard: () => <span data-testid="icon-dashboard" />,
  Building2: () => <span data-testid="icon-building" />,
  Users: () => <span data-testid="icon-users" />,
  BookOpen: () => <span data-testid="icon-book" />,
  FileText: () => <span data-testid="icon-file" />,
  Settings: () => <span data-testid="icon-settings" />,
  BarChart3: () => <span data-testid="icon-chart" />,
}));

describe('InstitutionSidebar', () => {
  it('renders navigation links', () => {
    render(<InstitutionSidebar />);

    expect(screen.getByRole('link', { name: /dashboard/i })).toHaveAttribute(
      'href',
      '/institution/dashboard'
    );
    expect(screen.getByRole('link', { name: /institution profile/i })).toHaveAttribute(
      'href',
      '/institution/profile'
    );
    expect(screen.getByRole('link', { name: /programs/i })).toHaveAttribute(
      'href',
      '/institution/programs'
    );
    expect(screen.getByRole('link', { name: /students/i })).toHaveAttribute(
      'href',
      '/institution/students'
    );
    expect(screen.getByRole('link', { name: /reports/i })).toHaveAttribute(
      'href',
      '/institution/reports'
    );
    expect(screen.getByRole('link', { name: /settings/i })).toHaveAttribute(
      'href',
      '/institution/settings'
    );
  });
});
