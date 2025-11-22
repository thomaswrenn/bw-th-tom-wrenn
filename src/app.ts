import express, { Application } from 'express';

import { buildRouteTree } from './utils/routeTree.js';

import notFoundHandler from './middleware/notFoundHandler.js';
import errorHandler from './middleware/errorHandler.js';
import ingestController from './controllers/ingestController.js';
import {
  deviceLatestTimestamp,
  deviceCumulativeCount,
  deviceInfo,
} from './controllers/deviceController.js';

export default function createApp(): Application {
  const app: Application = express();
  app.use(express.json());

  app.post('/ingest', ingestController);
  app.get('/devices/:deviceId/latest_timestamp', deviceLatestTimestamp);
  app.get('/devices/:deviceId/cumulative_count', deviceCumulativeCount);
  app.get('/devices/:deviceId', deviceInfo);
  //   deviceRouter.get('/', deviceController.listDevices);
  //   app.use('/devices', devicesRouter);

  // Precompute and cache the route tree on startup for the 404 handler.
  (app.locals ??= {}).availableRoutes = buildRouteTree(app.router);
  app.use(notFoundHandler);

  app.use(errorHandler);

  return app;
}
