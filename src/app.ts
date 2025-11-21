import express, { Application } from 'express';

import { buildRouteTree } from './utils/routeTree.js';

import notFoundHandler from './middleware/notFoundHandler.js';
import errorHandler from './middleware/errorHandler.js';

export default function createApp(): Application {
  const app: Application = express();
  app.use(express.json());

  // Precompute and cache the route tree on startup so the 404 handler
  // can reuse it without recalculating on every request.
  (app.locals ??= {}).availableRoutes = buildRouteTree(app.router);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
