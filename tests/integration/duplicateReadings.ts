import dotenv from 'dotenv';
import request from 'supertest';
import {
  describe,
  expect,
  it,
} from 'vitest';

import createApp from '../../src/app.js';

dotenv.config();

const app = createApp();

describe('Ensure Duplicate Readings are Discarded', () => {
  it('Error on a single item duplicate reading ingestion', async () => {
    const DEVICE_ID = '1234';
    const TIMESTAMP = '2023-01-01T00:00:00Z';
    const COUNT = 3;
    const response = await request(app).post('/ingest').send({
      id: DEVICE_ID,
      readings: [
        {
          timestamp: TIMESTAMP,
          count: COUNT,
        },
      ],
    });
    expect(response.status).toBe(202);
    expect(response.body).toHaveProperty('status', 'accepted');

    const latestTimestampResponse = await request(app).get(`/devices/${DEVICE_ID}/latest_timestamp`);
    expect(latestTimestampResponse.status).toBe(200);
    expect(latestTimestampResponse.body).toHaveProperty('latestTimestamp', TIMESTAMP);

    const cumulativeCountResponse = await request(app).get(`/devices/${DEVICE_ID}/cumulative_count`);
    expect(cumulativeCountResponse.status).toBe(200);
    expect(cumulativeCountResponse.body.cumulativeCount).toBe(COUNT);

    const response2 = await request(app).post('/ingest').send({
      id: DEVICE_ID,
      readings: [
        {
          timestamp: TIMESTAMP,
          count: 1,
        },
      ],
    });
    expect(response2.status).toBe(500);
    expect(response2.body.error.message).toBe(
      'Duplicate Device Data. Device 1234 at 2023-01-01T00:00:00Z has already been recorded.',
    );

    const cumulativeCountResponse2 = await request(app).get(`/devices/${DEVICE_ID}/cumulative_count`);
    expect(cumulativeCountResponse2.status).toBe(200);
    expect(cumulativeCountResponse2.body.cumulativeCount).toBe(COUNT);
  });
});
