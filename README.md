# bw-th-tom-wrenn

## Running with Docker

Development server (hot reload):

```bash
make docker-dev
```

The server will come up on http://localhost:3000 by default. You can change the port by copying `.env.example` to `.env` and editing the port.

Test suite (watch mode):

```bash
make docker-test
```


## Running without Docker

If you prefer not to use Docker, you can run the app directly with Bun:

```bash
bun run start
```

Requires Node 20+ and Bun installed.