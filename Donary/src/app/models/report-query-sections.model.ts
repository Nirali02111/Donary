export interface Sections {
    sectionID: number | string
    sectionName: string
    sort: number
  }

export interface StandardReportObj {
    sectionID: string;
    reportId: number;
    reportName: string;
    groupName: string;
    reportSort: number,
    isAutoRun: boolean,
    reportParameters: [
      {
        gridReportQueryParamId: number;
        gridReportQueryId: number;
        paramName: string;
        uiDataType: string;
        uiControl: string;
        isRequired: boolean;
        isServerParam: boolean;
        parameterDisplayName: string;
      }
    ];
    eventId: number;
  }
  