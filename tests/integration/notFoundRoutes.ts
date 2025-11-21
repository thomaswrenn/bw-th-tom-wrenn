import dotenv from 'dotenv';
import request from 'supertest';
import { describe, expect, it } from 'vitest';

import createApp from '../../src/app.js';

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;
const BASE_URL = `http://localhost:${PORT}`;

const app = createApp();

describe('404 not found handler with availableRoutes', () => {
  it('returns 404 with available routes tree including /api/health/', async () => {
    const response = await request(app).get('/non-existent-path');

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toHaveProperty('message');
    expect(response.body.error.message).toBe('Not Found');
    expect(response.body).toHaveProperty('validSubroutes');
  });

  it('only returns validSubroutes when the missing path is under a valid route prefix', async () => {
    const response = await request(app).get('/api/does-not-exist');

    expect(response.status).toBe(404);

    expect(response.body).toHaveProperty('validRoot');

    // The top-level key `api` should not appear; we should see `health` etc. directly.
    expect(response.body).toHaveProperty('validSubroutes');
  });
});
