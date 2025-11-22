import { describe, expect, it } from 'vitest';
import request from 'supertest';

import express from 'express';

import errorHandler from '../../src/middleware/errorHandler.js';
import { HTTP500_INTERNAL_SERVER_ERROR } from '../../src/utils/httpStatusCodes.js';

describe('errorHandler (unit)', () => {
  it('errorHandler catches and responds appropriately when errors are thrown', async () => {
    const app = express();
    app.get('/failing-route', () => {
      throw new Error('This is a test error');
    });
    app.use(errorHandler);

    const response = await request(app).get('/failing-route');

    expect(response.status).toBe(HTTP500_INTERNAL_SERVER_ERROR);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toHaveProperty('message');
    expect(response.body.error.message).toBe('This is a test error');
  });
});
