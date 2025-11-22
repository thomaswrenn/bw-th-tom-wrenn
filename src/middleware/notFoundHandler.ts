import type { Request, Response } from 'express';

import { scopeRouteTreeToPath } from '../utils/routeTree.js';
import { HTTP404_NOT_FOUND } from '../utils/httpStatusCodes.js';

export default function notFoundHandler(req: Request, res: Response): void {
  // Since this is a developer facing API, make the 404 response more helpful when
  // a developer hits a non-existent path by sharing a list of (clickable) routes that
  // *are* available under the correct portion of the attempted path.
  // i.e. GET /api/does-not-exist might return a 404 with a payload of:
  // {
  //   error: {
  //     code: 'RESOURCE_NOT_FOUND',
  //     message: 'Not Found',
  //   },
  //   validRoot: 'http://localhost:3000/api',
  //   validSubroutes: {
  //     'health': {
  //       'GET': 'http://localhost:3000/api/health'
  //     }
  //   }
  // }

  // The cached route tree will be attached to the app instance at startup
  const allRoutes = req.app.locals?.availableRoutes ?? {};
  const { validSubroutes, validRoot } = scopeRouteTreeToPath(allRoutes, req.url ?? '');

  res.status(HTTP404_NOT_FOUND).json({
    error: {
      code: 'RESOURCE_NOT_FOUND',
      message: 'Not Found',
    },
    validRoot,
    validSubroutes,
  });
}
