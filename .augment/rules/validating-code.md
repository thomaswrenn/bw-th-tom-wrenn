---
type: "always_apply"
---

Never use:
- `npx run test`
- `bun run tests`
- `bun run vitest`
- `bun run eslint ...` 
- `bun run tsc...` etc etc.

Always run using the makefile commands:
- `make docker-dev`
- `make docker-start`
- `make docker-test`
- `make docker-typecheck`