---
language: go
framework: ''
layout: single-app
package_manager: go
source_paths: [cmd, internal, pkg]
qa_mode: cli
fix_agent: ''
commands:
  install: go mod download
  dev: ''
  test: go test -race ./...
  lint: golangci-lint run
  format_check: 'gofmt -l .'
  typecheck: ''
  build: go build -o bin/tool ./cmd/tool
services: ''
---

# Stack

A Go command-line tool. Entry point is `cmd/tool`; shared code is under `internal/`
and `pkg/`.

## Commands

There is no dev server — `commands.dev` is empty on purpose. QA builds the binary and
runs it. `typecheck` is empty because the compiler covers it via `build`.

`format_check` prints unformatted files; a non-empty output means the gate failed
(`gofmt -l .` exits 0 either way, so check the output, not the exit code).

## QA mode

`cli` — build to `bin/tool`, then run real invocations against sample input and check
stdout and exit codes.

## Fix agent

None.
