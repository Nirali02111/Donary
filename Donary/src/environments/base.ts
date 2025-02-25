import { IEnvironment } from "./IEnvironment";

export const commonEnvironment: IEnvironment = {
  production: true,
  GOOGLE_AUTH_CLIENT_ID:
    "267255164786-djp6icf4msq9t0a2u11k4ru6dbmt1u4h.apps.googleusercontent.com",
  GOOGLE_MAP_API_KEY: "AIzaSyCZvlaBaSOVmHNCqlUBYKiQ0EFH6PHACP0",
  RECAPTCHA_V3_SITE_KEY: "6LfuyxwpAAAAAHjU3lSAtgtYNmGpL-Ii1XVyAQ-T",
  isDevelopmentFeature: false,
  baseUrl: "",
  jewishDateUrl: "",
  releaseFeature: {
    isStandardReportRelease: false,
    isNewAliyaPopupRelease: false,
    isSelectCountryInAddAPIKeyRelease: true,
    isNewCreateSeasonRelease:false,
    isNewTransactionPopupsRelease: false
  },
  GA_MEASUREMENT_ID: "G-Y18ZWHC445",
  GA_KEEP_UTM_PARAMETER: false
};
