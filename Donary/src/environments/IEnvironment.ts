export interface IEnvironment {
  production: boolean;
  GOOGLE_AUTH_CLIENT_ID: string;
  GOOGLE_MAP_API_KEY: string;
  RECAPTCHA_V3_SITE_KEY: string;
  baseUrl: string;
  jewishDateUrl: string;
  isDevelopmentFeature: boolean;
  releaseFeature: IReleaseEnvironment;
  GA_MEASUREMENT_ID: string,
  GA_KEEP_UTM_PARAMETER: boolean
}

interface IReleaseEnvironment {
  isStandardReportRelease: boolean;
  isNewAliyaPopupRelease: boolean;
  isSelectCountryInAddAPIKeyRelease: boolean,
  isNewCreateSeasonRelease:boolean;
  isNewTransactionPopupsRelease: boolean
}
