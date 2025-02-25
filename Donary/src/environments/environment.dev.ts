import { commonEnvironment } from "./base";
import { IEnvironment } from "./IEnvironment";

export const environment: IEnvironment = {
  ...commonEnvironment,
  baseUrl: "https://dev-api.donary.com/",
  jewishDateUrl:
    "hhttps://dev-api.donary.com/jewishdates.js?v=1",
    releaseFeature: {
      ...commonEnvironment.releaseFeature,
      isStandardReportRelease: true,
      isNewAliyaPopupRelease: true,
      isSelectCountryInAddAPIKeyRelease: true,
      isNewCreateSeasonRelease: true,
      isNewTransactionPopupsRelease: true
    },
};
