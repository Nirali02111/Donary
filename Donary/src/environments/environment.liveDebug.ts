import { commonEnvironment } from "./base";
import { IEnvironment } from "./IEnvironment";

export const environment: IEnvironment = {
  ...commonEnvironment,
  baseUrl: "https://livedebug.api.donary.com/",
  jewishDateUrl: "https://livedebug.api.donary.com/jewishdates.js?v=1",
  releaseFeature: {
    ...commonEnvironment.releaseFeature,
    isStandardReportRelease: false,
  },
};
