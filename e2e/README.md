# E2E Tests

This package contains an E2E test suite using the [Playwright](https://playwright.dev)
framework. 

## Getting Started

Please ensure that you have followed the basic installation guide in the
[root README](./../../README.md).
Once everything is setup 


```sh
# Given that you start in the repository's root:
cd packages/playwright
```
```sh
# Run all playwright tests:
yarn test
```
By default, the test suite will run against the https://dev3.openmrs.org server.
You can override this by exporting `UI_BASE_URL` and `WS_BASE_URL` environment variables beforehand:

```sh
# Set the server URL to localhost:
export UI_BASE_URL=http://localhost/openmrs/spa/
export WS_BASE_URL=http://localhost/openmrs/ws/

# Run all playwright tests:
yarn test
```

It is also highly recommended to install the companion VS Code extension:
https://playwright.dev/docs/getting-started-vscode


## Writing New Tests

In general, it is recommended to read through the official [Playwright docs](https://playwright.dev/docs/intro)
before writing new test cases. The project uses the official Playwright test runner and,
generally, follows a very simple project stucture:

```
src
|__ commands
|   ^ Contains "commands" (simple reusable functions) that can be used in test cases/specs.
|__ core
|   ^ Contains code related to the test runner itself, e.g. setting up the custom fixtures.
|     You probably need to touch this infrequently.
|__ fixtures
|   ^ Contains fixtures (https://playwright.dev/docs/test-fixtures) which are used
|     to run reusable setup/teardown tasks, e.g. logging in.
|__ pages
|   ^ Contains page object model classes for interacting with the frontend.
|     See https://playwright.dev/docs/test-pom for details.
|__ specs
    ^ Contains the actual test cases/specs. New tests should be placed in this folder.
```

When you want to write a new test case, start by creating a new spec in `./src/specs`.
Depending on what you want to achieve, you might want to create new fixtures and/or
page object models. To see examples, have a look at the existing code to see how these
different concepts play together.


## Configuration

This is very much underdeveloped/WIP. At the moment, there exists a (git-shared) `.env`
file which can be used for configuring certain test attributes. This is most likely
about to change in the future when the test suite is supposed to be used in, e.g.,
GitHub Actions pipelines. Stay tuned for updates!

## Troubleshooting tips

On MacOS, you might run into the following error:
```browserType.launch: Executable doesn't exist at /Users/<user>/Library/Caches/ms-playwright/chromium-1015/chrome-mac/Chromium.app/Contents/MacOS/Chromium```
In order to fix this, you can attempt to force the browser reinstallation by running:
```PLAYWRIGHT_BROWSERS_PATH=/Users/$USER/Library/Caches/ms-playwright npx playwright install```
