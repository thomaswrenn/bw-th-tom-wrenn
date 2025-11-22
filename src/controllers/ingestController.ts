import type { Request, Response, NextFunction } from 'express';

import type { UUID, ISO8061Timestamp } from '../utils/sharedTypes.js';

import { ingestData } from '../utils/dataStore.js';
import type { MultiStatusResult } from '../utils/dataStore.js';
import { HTTP202_ACCEPTED, HTTP207_MULTI_STATUS, HTTP400_BAD_REQUEST } from '../utils/httpStatusCodes.js';

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
      res.status(HTTP400_BAD_REQUEST).json({
        error: {
          message: 'Request body is required',
        },
      });
      return;
    }

    const results: MultiStatusResult[] = body.readings.map(
      (reading) => ingestData(body.id, reading.timestamp, reading.count),
    );

    // TODO: Check with the team on this API decision.
    // We are returning a 2XX status code here even if all the results are errors because
    // we expect the client to parse every result to find and process the specific errors.
    // We indicate that that needs to be done with the 207 "Multi-Status" code.
    // If there are no errors we return a 202 "Accepted" code to indicate no parsing and
    // looping are necessary.
    const overallStatus = (
      results.every((result) => result.success)
        ? HTTP202_ACCEPTED
        : HTTP207_MULTI_STATUS
    );

    res.status(overallStatus).json({
      results,
    });
  } catch (err) {
    next(err as Error);
  }
}
