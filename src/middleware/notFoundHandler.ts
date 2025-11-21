import type { Request, Response } from 'express';

import { scopeRouteTreeToPath } from '../utils/routeTree.js';

export default function notFoundHandler(req: Request, res: Response): void {
  // The cached route tree will be attached to the app instance at startup
  const allRoutes = req.app.locals?.availableRoutes ?? {};
  const { validSubroutes, validRoot } = scopeRouteTreeToPath(allRoutes, req.url ?? '');

  res.status(404).json({
    error: {
      code: 'RESOURCE_NOT_FOUND',
      message: 'Not Found',
    },
    validRoot,
    validSubroutes,
  });
}
