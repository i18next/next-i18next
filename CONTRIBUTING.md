# Contributing

The base branch is **`master`**.

## Workflow

- Create a [github fork](https://docs.github.com/en/get-started/quickstart/fork-a-repo).
- On your fork, create a branch make the changes, commit and push.
- Create the pull-request and provide a clear description to help maintainers.

## Checklist

When applicable:

- [x] **tests** should be included part of your PR.
- [x] **lint** Be sure to run `npm run lint`.
- [x] **documentation** should be updated.


## Install

```bash
npm install && npm install:examples
```

## Tests

### Unit tests

```bash
npm run test
```

### E2E tests

```bash
npm run test:e2e
```

### Test a build

```bash
npm run build
npm run build:example:simple
npm run build:example:ssg
```

### Clean

```bash
npm run clean
```

## Structure

```
.
├── examples
│   ├── simple
│   └── ssg
└── src  
```
