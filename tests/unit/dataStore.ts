import {
  afterEach,
  describe,
  expect,
  it,
} from 'vitest';

import {
  clearDataStore,
  getDeviceCumulativeCount,
  getDeviceData,
  getDeviceLatestTimestamp,
  ingestData,
} from '../../src/utils/dataStore.js';
import {
  HTTP202_ACCEPTED,
  HTTP409_CONFLICT,
} from '../../src/utils/httpStatusCodes.js';

describe('dataStore utilities', () => {
  afterEach(() => {
    clearDataStore();
  });

  it('ingests a new reading and initializes device info', () => {
    const DEVICE_ID = 'device-1';
    const TIMESTAMP = '2023-01-01T00:00:00Z';
    const COUNT = 5;

    const result = ingestData(DEVICE_ID, TIMESTAMP, COUNT);

    expect(result).toEqual({
      id: DEVICE_ID,
      timestamp: TIMESTAMP,
      status: HTTP202_ACCEPTED,
      success: true,
    });

    const deviceInfo = getDeviceData(DEVICE_ID);
    expect(deviceInfo).toBeDefined();
    expect(deviceInfo?.data[TIMESTAMP]).toBe(COUNT);
    expect(deviceInfo?.latest_timestamp).toBe(TIMESTAMP);
    expect(deviceInfo?.cumulative_count).toBe(COUNT);
  });

  it('accumulates counts and updates latest_timestamp for later readings', () => {
    const DEVICE_ID = 'device-1';
    const FIRST_TIMESTAMP = '2023-01-01T00:00:00Z';
    const LATER_TIMESTAMP = '2023-01-02T00:00:00Z';
    const FIRST_COUNT = 3;
    const LATER_COUNT = 2;

    ingestData(DEVICE_ID, FIRST_TIMESTAMP, FIRST_COUNT);
    const secondResult = ingestData(DEVICE_ID, LATER_TIMESTAMP, LATER_COUNT);

    expect(secondResult.status).toBe(HTTP202_ACCEPTED);
    expect(secondResult.success).toBe(true);

    const deviceInfo = getDeviceData(DEVICE_ID);
    expect(deviceInfo).toBeDefined();
    expect(deviceInfo?.latest_timestamp).toBe(LATER_TIMESTAMP);
    expect(deviceInfo?.cumulative_count).toBe(FIRST_COUNT + LATER_COUNT);
    expect(deviceInfo?.data[FIRST_TIMESTAMP]).toBe(FIRST_COUNT);
    expect(deviceInfo?.data[LATER_TIMESTAMP]).toBe(LATER_COUNT);
  });

  it('rejects duplicate timestamps for the same device and does not change stored counts', () => {
    const DEVICE_ID = 'device-1';
    const TIMESTAMP = '2023-01-01T00:00:00Z';
    const COUNT = 3;

    const firstResult = ingestData(DEVICE_ID, TIMESTAMP, COUNT);
    expect(firstResult.success).toBe(true);
    expect(firstResult.status).toBe(HTTP202_ACCEPTED);

    const secondResult = ingestData(DEVICE_ID, TIMESTAMP, COUNT);

    expect(secondResult.success).toBe(false);
    expect(secondResult.status).toBe(HTTP409_CONFLICT);
    expect(secondResult.error).toBe(
      `A reading for device ${DEVICE_ID} at ${TIMESTAMP} has already been recorded. Duplicates are not allowed.`,
    );

    const deviceInfo = getDeviceData(DEVICE_ID);
    expect(deviceInfo).toBeDefined();
    expect(deviceInfo?.latest_timestamp).toBe(TIMESTAMP);
    expect(deviceInfo?.cumulative_count).toBe(COUNT);
    expect(Object.keys(deviceInfo?.data ?? {})).toEqual([TIMESTAMP]);
  });

  it('getters return undefined for unknown devices', () => {
    const unknownId = 'does-not-exist';

    expect(getDeviceData(unknownId)).toBeUndefined();
    expect(getDeviceLatestTimestamp(unknownId)).toBeUndefined();
    expect(getDeviceCumulativeCount(unknownId)).toBeUndefined();
  });

  it('clearDataStore removes all entries', () => {
    const deviceId = 'device-1';

    ingestData(deviceId, '2023-01-01T00:00:00Z', 1);
    expect(getDeviceData(deviceId)).toBeDefined();

    clearDataStore();

    expect(getDeviceData(deviceId)).toBeUndefined();
    expect(getDeviceLatestTimestamp(deviceId)).toBeUndefined();
    expect(getDeviceCumulativeCount(deviceId)).toBeUndefined();
  });
});
