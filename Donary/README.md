<h1 align="center">Donary</h1>

- Node 20.11.1

- NPM 10.2.4

- Angular 17.3.5

## NVM

If your node version is not 20.11.1 then Download and install [NVM](https://github.com/coreybutler/nvm-windows/releases)

after installation open terminal and run this commands

```
nvm install 20.11.1
```

```
nvm use 20.11.1
```

## Project Setup

```
npm install
```

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 8.3.6.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

- Development Environment : ```npm run build:dev``` to generate development environment with isDevelopmentFeature as ```TRUE``` default

- QA Environment: 

    - QA: ```npm run build:qa``` to generate QA environment this will not enable isDevelopmentFeature as ```FALSE```
    - QA Feature: ```npm run build:qa:feature``` to generate QA environment with isDevelopmentFeature as ```TRUE```

- liveDebug Environment:

    - liveDebug: ```npm run build:liveDebug``` to generate liveDebug environment this will not enable isDevelopmentFeature as ```FALSE```
    - liveDebug Feature: ```npm run build:liveDebug:feature``` to generate liveDebug environment with isDevelopmentFeature as ```TRUE```

- Beta Environment:

    - Beta: ```npm run build:beta``` to generate Beta environment this will not enable isDevelopmentFeature as ```FALSE```
    - Beta Feature: ```npm run build:beta:feature``` to generate Beta environment with isDevelopmentFeature as ```TRUE```

- Production Environment:

    - Production: ```npm run build``` to generate Production environment this will not enable isDevelopmentFeature as ```FALSE```
    - Production Feature: ```npm run build:prod:feature``` to generate Production environment with isDevelopmentFeature as ```TRUE```


Run `ng build` to build the project. The build artifacts will be stored in the `dist/browser` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
