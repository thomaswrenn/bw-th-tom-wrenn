import dotenv from 'dotenv';
import { describe, expect, it } from 'vitest';

import express from 'express';

import { buildRouteTree, type RouteTree } from '../../src/utils/routeTree.js';

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;
const BASE_URL = `http://localhost:${PORT}`;

describe('routeTree utils (unit)', () => {
  it('populates root route methods', () => {
    const app = express();
    app.get('/', () => {});
    app.post('/', () => {});
    const routeTree = buildRouteTree(app.router);

    expect(routeTree.METHODS).toHaveProperty('GET');
    expect(routeTree.METHODS?.GET).toBe(`${BASE_URL}/`);
  });
  it('populates nested route methods', () => {
    const app = express();
    app.get('/it/done', () => {});
    const routeTree = buildRouteTree(app.router);

    const itNode = routeTree.it as RouteTree | undefined;
    const doneNode = itNode?.done as RouteTree | undefined;

    expect(routeTree.METHODS).toBeUndefined();
    expect(itNode?.METHODS).toBeUndefined();
    expect(doneNode?.METHODS).toHaveProperty('GET');
    expect(doneNode?.METHODS?.GET).toBe(`${BASE_URL}/it/done`);
  });
});
