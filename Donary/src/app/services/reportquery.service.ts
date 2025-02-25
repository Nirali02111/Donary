import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

export interface ReportQueryDataset {
  ReportQueryDataSetId?: number;
  DataSetObject: string;
}

export interface SaveQueryParams {
  EventGuId: string;
  LoginUserId: number;
  ReportQueryId?: number;
  QueryName: string;
  Description: string;
  BaseColumn: string;
  DisplayFields: string;
  AdditionalFields: string;
  AdvancedSearch:string;
  ReportQueryDatasets: Array<ReportQueryDataset>;
}

@Injectable({
  providedIn: "root",
})
export class ReportQueryService {
  version = "v1/";
  REPORTQUERY_MAIN_URL = "ReportQuery";
  REPORT_MAIN_URL = "Report";
  REPORTQUERY_GET_CAMPAIGN_LIST_URL = `${this.version}${this.REPORTQUERY_MAIN_URL}/Campaigns`;

  REPORTQUERY_GET_LIST_URL = `${this.version}${this.REPORTQUERY_MAIN_URL}/GetAll`;
  REPORTQUERY_GET_URL = `${this.version}${this.REPORTQUERY_MAIN_URL}/Get`;
  REPORTQUERY_SAVE_URL = `${this.version}${this.REPORTQUERY_MAIN_URL}/Save`;
  REPORTQUERY_DELETE_URL = `${this.version}${this.REPORTQUERY_MAIN_URL}/DeleteQuery`;
  SCHEDULE_TOTAL_LIST_URL = `${this.version}${this.REPORT_MAIN_URL}/GetSchedulesTotal`;
  

  constructor(private http: HttpClient) {}

  getCampaignList(formdata: any): Observable<any> {
    return this.http
      .post(this.REPORTQUERY_GET_CAMPAIGN_LIST_URL, formdata)
      .pipe((response) => {
        return response;
      });
  }

  getAllQuery(eventGuId: string) {
    return this.http
      .get(this.REPORTQUERY_GET_LIST_URL, {
        params: {
          eventGuId,
        },
      })
      .pipe((response) => {
        return response;
      });
  }

  getQuery(eventGuId: string, reportQueryId: string) {
    return this.http
      .get(this.REPORTQUERY_GET_URL, {
        params: {
          eventGuId,
          reportQueryId,
        },
      })
      .pipe((response) => {
        return response;
      });
  }

  saveQuery(formdata: SaveQueryParams) {
    return this.http
      .post(this.REPORTQUERY_SAVE_URL, formdata)
      .pipe((response) => {
        return response;
      });
  }

  deleteQuery(reportQueryId: string, deletedBy: string) {
    return this.http
      .delete(this.REPORTQUERY_DELETE_URL,  {
        params: {
          reportQueryId,
          deletedBy,
        },
      })
      .pipe((response) => {
        return response;
      });
  }

  getScheduleTotal(formdata: any): Observable<any> {
    return this.http
      .post(this.SCHEDULE_TOTAL_LIST_URL, formdata)
      .pipe((response) => {
        return response;
      });
  }
}
