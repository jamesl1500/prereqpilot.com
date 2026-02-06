/**
 * API Route Tests for Program Course Mappings
 */

import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/programs/[id]/mappings/route';
import { getCourseMappings, createCourseMapping, updateCourseMapping } from '@/services/program-requirement-service';

jest.mock('@/services/program-requirement-service');

describe('Program Course Mappings API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET should return mappings', async () => {
    (getCourseMappings as jest.Mock).mockResolvedValue({ success: true, data: [{ id: 'map-1' }] });

    const request = new NextRequest('http://localhost:3000/api/programs/prog-1/mappings');
    const response = await GET(request, { params: Promise.resolve({ id: 'prog-1' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveLength(1);
  });

  it('POST should update mapping when exists', async () => {
    (updateCourseMapping as jest.Mock).mockResolvedValue({ success: true, data: { id: 'map-1' } });

    const request = new NextRequest('http://localhost:3000/api/programs/prog-1/mappings', {
      method: 'POST',
      body: JSON.stringify({ program_required_course_id: 'req-1', taken_course_id: 'course-1', is_completed: true }),
    });

    const response = await POST(request, { params: Promise.resolve({ id: 'prog-1' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.id).toBe('map-1');
  });

  it('POST should create mapping when update fails', async () => {
    (updateCourseMapping as jest.Mock).mockResolvedValue({ success: false, error: 'Not found' });
    (createCourseMapping as jest.Mock).mockResolvedValue({ success: true, data: { id: 'map-2' } });

    const request = new NextRequest('http://localhost:3000/api/programs/prog-1/mappings', {
      method: 'POST',
      body: JSON.stringify({ program_required_course_id: 'req-1', taken_course_id: 'course-1', is_completed: false }),
    });

    const response = await POST(request, { params: Promise.resolve({ id: 'prog-1' }) });
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.id).toBe('map-2');
  });
});
