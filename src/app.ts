import express, { Application } from 'express';

import { buildRouteTree } from './utils/routeTree.js';

import notFoundHandler from './middleware/notFoundHandler.js';
import errorHandler from './middleware/errorHandler.js';
import ingestController from './controllers/ingestController.js';
import { deviceLatestTimestamp, deviceCummulativeCount } from './controllers/deviceController.js';

export default function createApp(): Application {
  const app: Application = express();
  app.use(express.json());

  app.post('/ingest', ingestController);
  // const devicesRouter = express.Router();
  app.get('/devices/:deviceId/latest_timestamp', deviceLatestTimestamp);
  app.get('/devices/:deviceId/cumulative_count', deviceCummulativeCount);
  // deviceRouter.get('/:deviceId', deviceController.getDevice);
  //   deviceRouter.get('/', deviceController.listDevices);
  //   app.use('/devices', devicesRouter);

  // Precompute and cache the route tree on startup so the 404 handler
  // can reuse it without recalculating on every request.
  (app.locals ??= {}).availableRoutes = buildRouteTree(app.router);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
