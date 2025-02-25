// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { commonEnvironment } from "./base";
import { IEnvironment } from "./IEnvironment";

export const environment: IEnvironment = {
  ...commonEnvironment,
  production: false,
  baseUrl: "https://dev-api.donary.com/",
  jewishDateUrl:
    "https://dev-api.donary.com/jewishdates.js?v=1",
  releaseFeature: {
    ...commonEnvironment.releaseFeature,
    isStandardReportRelease: true,
    isNewAliyaPopupRelease: true,
    isSelectCountryInAddAPIKeyRelease: true,
    isNewCreateSeasonRelease: true,
    isNewTransactionPopupsRelease: true
  },
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
