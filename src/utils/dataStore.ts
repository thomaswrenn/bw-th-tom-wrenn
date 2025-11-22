import { HTTP409_CONFLICT } from './httpStatusCodes.js';

type UUID = string;
type ISO8061Timestamp = string;
type DeviceData = Record<ISO8061Timestamp, number>;
type DeviceInfo = {
  data: DeviceData,
  latest_timestamp: ISO8061Timestamp,
  cumulative_count: number
};
type DataStore = Record<UUID, DeviceInfo>;

export type MultiStatusResult = {
  id: UUID;
  timestamp: ISO8061Timestamp;
  status: number;
  success: boolean;
  error?: string;
};

const dataStore: DataStore = {};

export function clearDataStore(): void {
  Object.keys(dataStore).forEach((key) => {
    delete dataStore[key as UUID];
  });
}

export function ingestData(
  deviceId: UUID,
  timestamp: ISO8061Timestamp,
  count: number,
): MultiStatusResult {
  dataStore[deviceId] ??= {
    data: {},
    latest_timestamp: timestamp,
    cumulative_count: 0,
  };
  const deviceInfo = dataStore[deviceId];
  if (deviceInfo.data[timestamp]) {
    return {
      id: deviceId,
      timestamp,
      status: HTTP409_CONFLICT,
      success: false,
      error: `A reading for device ${deviceId} at ${timestamp} has already been recorded. Duplicates are not allowed.`,
    };
  }
  deviceInfo.data[timestamp] = count;

  if (timestamp > deviceInfo.latest_timestamp) {
    deviceInfo.latest_timestamp = timestamp;
  }
  deviceInfo.cumulative_count += count;

  return {
    id: deviceId,
    timestamp,
    status: 202,
    success: true,
  };
}

export function getDeviceData(deviceId: UUID): DeviceInfo | undefined {
  return dataStore[deviceId];
}

export function getDeviceLatestTimestamp(deviceId: UUID): ISO8061Timestamp | undefined {
  return dataStore[deviceId]?.latest_timestamp;
}

export function getDeviceCumulativeCount(deviceId: UUID): number | undefined {
  return dataStore[deviceId]?.cumulative_count;
}
