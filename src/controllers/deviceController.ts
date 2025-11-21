import type { Request, Response, NextFunction } from 'express';

import { getDeviceLatestTimestamp, getDeviceCumulativeCount } from '../utils/dataStore.js';

type DeviceParams = {
  deviceId: string;
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
      res.status(404).json({
        error: {
          message: `Device ${deviceId} not found`,
        },
      });
      return;
    }

    res.status(200).json({
      latestTimestamp,
    });
  } catch (err) {
    next(err as Error);
  }
}

export async function deviceCummulativeCount(
  req: Request<DeviceParams>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { deviceId } = req.params;
    const cumulativeCount = getDeviceCumulativeCount(deviceId);
    if (!cumulativeCount) {
      res.status(404).json({
        error: {
          message: `Device ${deviceId} not found`,
        },
      });
      return;
    }

    res.status(200).json({
      cumulativeCount,
    });
  } catch (err) {
    next(err as Error);
  }
}
