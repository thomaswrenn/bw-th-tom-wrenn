import type { Request, Response, NextFunction } from 'express';

import {
  getDeviceLatestTimestamp,
  getDeviceCumulativeCount,
  getDeviceData,
} from '../utils/dataStore.js';
import {
  HTTP200_OK,
  HTTP404_NOT_FOUND,
} from '../utils/httpStatusCodes.js';
import { ISO8061Timestamp } from '../utils/sharedTypes.js';

type DeviceParams = {
  deviceId: string;
};

type DeviceInfoResponse = {
  data: Record<ISO8061Timestamp, number>;
  latest_timestamp: ISO8061Timestamp;
  cumulative_count: number;
};

type LatestTimestampResponse = {
  latest_timestamp: string;
};

type CumulativeCountResponse = {
  cumulative_count: number;
};

export async function deviceLatestTimestamp(
  req: Request<DeviceParams>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { deviceId } = req.params;
    const latestTimestamp = getDeviceLatestTimestamp(deviceId);
    if (!latestTimestamp) {
      res.status(HTTP404_NOT_FOUND).json({
        error: {
          message: `Device ${deviceId} not found`,
        },
      });
      return;
    }

    res.status(HTTP200_OK).json({
      latest_timestamp: latestTimestamp,
    } as LatestTimestampResponse);
  } catch (err) {
    next(err as Error);
  }
}

export async function deviceCumulativeCount(
  req: Request<DeviceParams>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { deviceId } = req.params;
    const cumulativeCount = getDeviceCumulativeCount(deviceId);
    if (!cumulativeCount) {
      res.status(HTTP404_NOT_FOUND).json({
        error: {
          message: `Device ${deviceId} not found`,
        },
      });
      return;
    }

    res.status(HTTP200_OK).json({
      cumulative_count: cumulativeCount,
    } as CumulativeCountResponse);
  } catch (err) {
    next(err as Error);
  }
}

export async function deviceInfo(
  req: Request<DeviceParams>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { deviceId } = req.params;
    const deviceData = getDeviceData(deviceId);
    if (!deviceData) {
      res.status(HTTP404_NOT_FOUND).json({
        error: {
          message: `Device ${deviceId} not found`,
        },
      });
      return;
    }

    res.status(HTTP200_OK).json(deviceData as DeviceInfoResponse);
  } catch (err) {
    next(err as Error);
  }
}
