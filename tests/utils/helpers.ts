import { expect } from 'vitest';

import request from 'supertest';
import type { Application } from 'express';

import { HTTP200_OK, HTTP202_ACCEPTED } from '../../src/utils/httpStatusCodes.js';

export default async function ingestFirstReadingAndValidate(
  app: Application,
  deviceId: string,
  timestamp: string,
  count: number,
) {
  const response = await request(app).post('/ingest').send({
    id: deviceId,
    readings: [
      {
        timestamp,
        count,
      },
    ],
  });
  expect(response.status).toBe(HTTP202_ACCEPTED);
  expect(response.body.results[0].success).toBe(true);
  expect(response.body.results[0].status).toBe(HTTP202_ACCEPTED);
  expect(response.body.results[0].id).toBe(deviceId);
  expect(response.body.results[0].timestamp).toBe(timestamp);

  const latestTimestampResponse = await request(app).get(`/devices/${deviceId}/latest_timestamp`);
  expect(latestTimestampResponse.status).toBe(HTTP200_OK);
  expect(latestTimestampResponse.body).toHaveProperty('latest_timestamp', timestamp);

  const cumulativeCountResponse = await request(app).get(`/devices/${deviceId}/cumulative_count`);
  expect(cumulativeCountResponse.status).toBe(HTTP200_OK);
  expect(cumulativeCountResponse.body).toHaveProperty('cumulative_count', count);
}
