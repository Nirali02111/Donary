import { commonEnvironment } from "./base";
import { IEnvironment } from "./IEnvironment";

export const environment: IEnvironment = {
  ...commonEnvironment,
  RECAPTCHA_V3_SITE_KEY: "6Le5HB8qAAAAACVrDjBtWwnN3Ry5W1zCoV8EZoCj",
  baseUrl:"https://beta-api.donary.com/",
  jewishDateUrl:"https://beta-api.donary.com/jewishdates.js?v=1",
  releaseFeature: {
    ...commonEnvironment.releaseFeature,
    isStandardReportRelease: false,
  },
};
