/**
 * API Route Tests for Health
 */

import { GET } from '@/app/api/health/route';

describe('Health API Route', () => {
  it('should return ok true', async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ ok: true });
  });
});
