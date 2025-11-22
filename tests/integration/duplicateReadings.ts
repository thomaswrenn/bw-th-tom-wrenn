import dotenv from 'dotenv';
import request from 'supertest';
import {
  afterEach,
  describe,
  expect,
  it,
} from 'vitest';

import ingestFirstReadingAndValidate from '../utils/helpers.js';

import createApp from '../../src/app.js';

import { clearDataStore } from '../../src/utils/dataStore.js';
import {
  HTTP200_OK,
  HTTP202_ACCEPTED,
  HTTP207_MULTI_STATUS,
  HTTP409_CONFLICT,
} from '../../src/utils/httpStatusCodes.js';

dotenv.config();

const app = createApp();

describe('Ensure Duplicate Readings are Discarded', () => {
  afterEach(() => {
    clearDataStore();
  });
  it('Error on a single item duplicate reading ingestion', async () => {
    const DEVICE_ID = '1234';
    const TIMESTAMP = '2023-01-01T00:00:00Z';
    const FIRST_COUNT = 3;
    await ingestFirstReadingAndValidate(app, DEVICE_ID, TIMESTAMP, FIRST_COUNT);

    const response2 = await request(app).post('/ingest').send({
      id: DEVICE_ID,
      readings: [
        {
          timestamp: TIMESTAMP,
          count: FIRST_COUNT,
        },
      ],
    });
    expect(response2.status).toBe(HTTP207_MULTI_STATUS);
    expect(response2.body.results[0].id).toBe(DEVICE_ID);
    expect(response2.body.results[0].timestamp).toBe(TIMESTAMP);
    expect(response2.body.results[0].success).toBe(false);
    expect(response2.body.results[0].status).toBe(HTTP409_CONFLICT);
    expect(response2.body.results[0].error).toBe(
      'A reading for device 1234 at 2023-01-01T00:00:00Z has already been recorded. Duplicates are not allowed.',
    );

    const cumulativeCountResponse2 = await request(app).get(`/devices/${DEVICE_ID}/cumulative_count`);
    expect(cumulativeCountResponse2.status).toBe(HTTP200_OK);
    expect(cumulativeCountResponse2.body.cumulative_count).toBe(FIRST_COUNT);
  });

  it('Only partial failure when a duplicate reading is among valid readings', async () => {
    const DEVICE_ID = '1234';
    const DUPLICATE_TIMESTAMP = '2023-01-01T00:00:00Z';
    const LATER_TIMESTAMP = '2025-01-01T00:00:01Z';
    const DUPLICATE_COUNT = 3;
    const GOOD_ADDED_COUNT = 2;
    await ingestFirstReadingAndValidate(app, DEVICE_ID, DUPLICATE_TIMESTAMP, DUPLICATE_COUNT);

    const response2 = await request(app).post('/ingest').send({
      id: DEVICE_ID,
      readings: [
        {
          timestamp: DUPLICATE_TIMESTAMP,
          count: DUPLICATE_COUNT,
        },
        {
          timestamp: LATER_TIMESTAMP,
          count: GOOD_ADDED_COUNT,
        },
      ],
    });
    expect(response2.status).toBe(HTTP207_MULTI_STATUS);
    expect(response2.body.results.length).toBe(2);
    expect(response2.body.results[0].id).toBe(DEVICE_ID);
    expect(response2.body.results[0].timestamp).toBe(DUPLICATE_TIMESTAMP);

    expect(response2.body.results[0].success).toBe(false);
    expect(response2.body.results[0].status).toBe(HTTP409_CONFLICT);
    expect(response2.body.results[0].error).toBe(
      'A reading for device 1234 at 2023-01-01T00:00:00Z has already been recorded. Duplicates are not allowed.',
    );
    expect(response2.body.results[1].id).toBe(DEVICE_ID);
    expect(response2.body.results[1].timestamp).toBe(LATER_TIMESTAMP);
    expect(response2.body.results[1].success).toBe(true);
    expect(response2.body.results[1].status).toBe(HTTP202_ACCEPTED);

    const cumulativeCountResponse2 = await request(app).get(`/devices/${DEVICE_ID}/cumulative_count`);
    expect(cumulativeCountResponse2.status).toBe(HTTP200_OK);
    expect(cumulativeCountResponse2.body.cumulative_count).toBe(DUPLICATE_COUNT + GOOD_ADDED_COUNT);
  });
});
