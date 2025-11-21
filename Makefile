APP_NAME      := bw-th-tom-wrenn
IMAGE         := $(APP_NAME)
PROJECT_ROOT  := $(shell pwd)

# Common mounts
SRC_MOUNT     := -v $(PROJECT_ROOT)/src:/usr/src/app/src
TESTS_MOUNT   := -v $(PROJECT_ROOT)/tests:/usr/src/app/tests

.PHONY: docker-build docker-dev docker-test docker-typecheck docker-format

# Build development image (includes devDependencies, dev tooling)
docker-build:
	docker build --target development -t $(IMAGE) .

# Generic docker runner
# Target-specific vars it uses:
#   CONTAINER_NAME  - container name
#   MOUNTS          - list of -v mounts
#   DOCKER_ARGS     - extra docker run args (ports, env, etc.)
#   CMD             - command to run *after* the image (can be empty)
define docker_run
	docker run --rm -it $(DOCKER_ARGS) $(MOUNTS) \
	  --name $(CONTAINER_NAME) \
	  $(IMAGE) \
	  $(CMD)
endef

# --- Docker run targets ---

# Dev: uses image CMD (no explicit command), binds port 3000, mounts src
docker-start: CONTAINER_NAME := $(APP_NAME)
docker-start: MOUNTS         := $(SRC_MOUNT)
docker-start: DOCKER_ARGS    := -p 3000:3000
docker-start: CMD            := 
docker-start: docker-build
	$(docker_run)

# Dev: uses image CMD (no explicit command), binds port 3000, mounts src
docker-dev: CONTAINER_NAME := $(APP_NAME)-dev
docker-dev: MOUNTS         := $(SRC_MOUNT)
docker-dev: DOCKER_ARGS    := -p 3000:3000
docker-dev: CMD            := bun --watch src/server.ts
docker-dev: docker-build
	$(docker_run)

# Tests: bun run test:watch
docker-test: CONTAINER_NAME := $(APP_NAME)-test-watch
docker-test: MOUNTS         := $(SRC_MOUNT) $(TESTS_MOUNT)
docker-test: DOCKER_ARGS    := 
docker-test: CMD            := vitest
docker-test: docker-build
	$(docker_run)


# Typecheck: bun run typecheck:watch
docker-typecheck: CONTAINER_NAME := $(APP_NAME)-typecheck-watch
docker-typecheck: MOUNTS         := $(SRC_MOUNT) $(TESTS_MOUNT)
docker-typecheck: DOCKER_ARGS    := 
docker-typecheck: CMD            := tsc --noEmit --watch
docker-typecheck: docker-build
	$(docker_run)

# Format: bun run format
docker-format: CONTAINER_NAME := $(APP_NAME)-format
docker-format: MOUNTS         := $(SRC_MOUNT) $(TESTS_MOUNT)
docker-format: DOCKER_ARGS    := 
docker-format: CMD            := prettier --write "src/**/*.{ts,tsx}" "tests/**/*.ts"
docker-format: docker-build
	$(docker_run)