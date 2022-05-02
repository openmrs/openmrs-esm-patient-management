:wave: *New to our project? Be sure to review the [OpenMRS 3 Frontend Developer Documentation](https://openmrs.github.io/openmrs-esm-core/#/). You may find the [Map of the Project](https://openmrs.github.io/openmrs-esm-core/#/main/map) especially helpful.* :teacher:

![Node.js CI](https://github.com/openmrs/openmrs-esm-patient-management/workflows/Node.js%20CI/badge.svg)

# OpenMRS Patient Management

This is a frontend module for the OpenMRS SPA. It bundles together various microfrontends that handle registering and editing patients, searching for existing patients, creating patient lists and managing patients in an outpatient setting. The microfrontends within this module include:

-  [Patient search](packages/esm-patient-search-app)
-  [Patient registration](packages/esm-patient-registration-app)
-  [Patient list](packages/esm-patient-list-app)
-  [Outpatient app](packages/esm-outpatient-app/README.md)

## Setup

Check out the developer documentation [here](http://o3-dev.docs.openmrs.org).

This monorepo uses [yarn](https://yarnpkg.com) and [lerna](https://github.com/lerna/lerna).

To start a dev server for a specific microfrontend, run:

```bash
yarn start --sources 'packages/esm-<insert-package-name>-app'
```

This command uses the [openmrs](https://www.npmjs.com/package/openmrs) tooling to fire up a dev server running `esm-patient-chart` as well as the specified microfrontend.

To start a dev server running all the packages, run:

```bash
yarn start-all
```

Note that this is very resource-intensive. 

There are two approaches for working on multiple microfrontends simultaneously.

You could run `yarn start` with as many `sources` arguments as you require. For example, to run the biometrics and vitals microfrontends simultaneously, you'd use:

```bash
yarn start --sources 'packages/esm-patient-registration-app' --sources 'packages/esm-patient-search-app'
```

Alternatively, you could run `yarn serve` from within the individual packages and then use [import map overrides](http://o3-dev.docs.openmrs.org/#/getting_started/setup?id=import-map-overrides).

## Contributing

Please read our [contributing](http://o3-dev.docs.openmrs.org/#/getting_started/contributing) guide.

## Running tests

To run tests, use:

```sh
yarn test
```

## Deployment

The `main` branch of this repo is deployed in a [demo environment](https://openmrs-spa.org/openmrs/spa).

## Configuration

This module is designed to be driven by configuration files.
