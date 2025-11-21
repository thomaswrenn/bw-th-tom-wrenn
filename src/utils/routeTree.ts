import type { Router } from 'express';
import dotenv from 'dotenv';

type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
type MethodsObject = Partial<Record<HTTPMethod, string>>;
export type RouteTree = {
  [segment: string]: RouteTree | MethodsObject | undefined;
  METHODS?: MethodsObject;
};

dotenv.config();

const port = Number(process.env.PORT) || 3000;
const BASE_URL = `http://localhost:${port}`;

export function buildRouteTree(router: Router): RouteTree {
  const tree: RouteTree = {};

  router.stack.forEach((layer) => {
    const route = layer?.route;
    if (!route) return;

    let current = tree;

    const segments = route.path.split('/').filter(Boolean);
    const fullUrl = `${BASE_URL}/${segments.join('/')}`;

    segments.forEach((segment) => {
      current = (current[segment] ??= {}) as RouteTree;
    });

    // IRoute.methods is a private API, but widely used for route introspection
    Object.keys((route as any).methods ?? {}).forEach((method) => {
      (current.METHODS ??= {})[method.toUpperCase() as HTTPMethod] = fullUrl;
    });
  });

  return tree;
}

export function scopeRouteTreeToPath(
  tree: RouteTree,
  requestPath: string,
): { validSubroutes: RouteTree; validRoot: string; } {
  const [path] = requestPath.split('?');
  const segments = path.split('/').filter(Boolean);

  let node: RouteTree = tree;
  const validRoot: string[] = [];

  segments.forEach((segment) => {
    const child = node[segment] as RouteTree;
    if (!child) return;

    validRoot.push(segment);
    node = child;
  });

  return {
    validSubroutes: node,
    validRoot: `${BASE_URL}/${validRoot.join('/')}`,
  };
}
