type UUID = string;
type ISO8061Timestamp = string;
type DeviceData = Record<ISO8061Timestamp, number>;
type DeviceInfo = {
  data: DeviceData,
  latestTimestamp: ISO8061Timestamp,
  cumulativeCount: number
};
type DataStore = Record<UUID, DeviceInfo>;

const dataStore: DataStore = {};

export function clearDataStore(): void {
  Object.keys(dataStore).forEach((key) => {
    delete dataStore[key as UUID];
  });
}

export function ingestData(deviceId: UUID, timestamp: ISO8061Timestamp, count: number): void {
  dataStore[deviceId] ??= {
    data: {},
    latestTimestamp: timestamp,
    cumulativeCount: 0,
  };
  const deviceInfo = dataStore[deviceId];
  if (deviceInfo.data[timestamp]) {
    // TODO: Do not just throw, need to loop the full list and collect errors.
    throw new Error(`Duplicate Device Data. Device ${deviceId} at ${timestamp} has already been recorded.`);
    return;
  }
  deviceInfo.data[timestamp] = count;

  if (timestamp > deviceInfo.latestTimestamp) {
    deviceInfo.latestTimestamp = timestamp;
  }
  deviceInfo.cumulativeCount += count;
}

export function getDeviceData(deviceId: UUID): DeviceInfo | undefined {
  return dataStore[deviceId];
}

export function getDeviceLatestTimestamp(deviceId: UUID): ISO8061Timestamp | undefined {
  return dataStore[deviceId]?.latestTimestamp;
}

export function getDeviceCumulativeCount(deviceId: UUID): number | undefined {
  return dataStore[deviceId]?.cumulativeCount;
}
