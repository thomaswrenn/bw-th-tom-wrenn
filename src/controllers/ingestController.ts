import type { Request, Response, NextFunction } from 'express';

import type { UUID, ISO8061Timestamp } from '../utils/sharedTypes.js';

import { ingestData } from '../utils/dataStore.js';

type ReadingPayload = {
  timestamp: ISO8061Timestamp;
  count: number;
};

type IngestPayload = {
  id: UUID;
  readings: ReadingPayload[];
};

// Handles POST /ingest requests.
export default function ingestController(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  try {
    const body = req.body as IngestPayload;
    // const hasBody = body && (typeof body !== 'object' || Object.keys(body).length > 0);
    if (!body) {
      res.status(400).json({
        error: {
          message: 'Request body is required',
        },
      });
      return;
    }

    body.readings.forEach((reading) => {
      ingestData(body.id, reading.timestamp, reading.count);
    });

    res.status(202).json({ status: 'accepted' });
  } catch (err) {
    next(err as Error);
  }
}
