import { commonEnvironment } from "./base";
import { IEnvironment } from "./IEnvironment";

export const environment: IEnvironment = {
  ...commonEnvironment,
  baseUrl: "https://qa-api.donary.com/",
  RECAPTCHA_V3_SITE_KEY: "6Le5HB8qAAAAACVrDjBtWwnN3Ry5W1zCoV8EZoCj",
  jewishDateUrl:
    "https://qa-api.donary.com/jewishdates.js?v=1",
    releaseFeature: {
      ...commonEnvironment.releaseFeature,
      isStandardReportRelease: false,
      isNewAliyaPopupRelease: false,
      isSelectCountryInAddAPIKeyRelease: true,
      isNewCreateSeasonRelease: true,
      isNewTransactionPopupsRelease: false
    },
};
