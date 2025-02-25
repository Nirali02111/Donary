import { HttpClient } from "@angular/common/http";
import { Injectable, signal } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import * as _ from "lodash";
import { Sections } from "../models/report-query-sections.model";

@Injectable({
  providedIn: "root",
})
export class DynamicGridReportService {
  version = "v1/";
  DYNAMICGRIDREPORT_MAIN_URL = "DynamicGridReport";
  DYNAMICGRIDREPORT_GET_ALL_LIST_URL = `${this.version}${this.DYNAMICGRIDREPORT_MAIN_URL}/GetAll`;
  GET_PARAMAS_URL = `${this.version}${this.DYNAMICGRIDREPORT_MAIN_URL}/GetParams`;
  EXCECUTE_URL = `${this.version}${this.DYNAMICGRIDREPORT_MAIN_URL}/Execute`;
  GRID_REPORT_SECTIONS_URL = `${this.version}GridReportQuerySections`;
  isAutoRun = signal<boolean>(false);
  constructor(private http: HttpClient) {}

  getReportGroups(
    eventGuid: string,
    reportType: string
  ): Observable<Array<Sections>> {
    return this.http
      .get<Array<Sections>>(this.GRID_REPORT_SECTIONS_URL, {
        params: {
          eventGuid,
          reportType,
        },
      })
      .pipe(
        map((res) => {
          if (!res || res.length === 0) {
            return [];
          }

          return _.sortBy(res, ["sort"]);
        })
      );
  }

  getAllDynamicGridReport(eventGuid: string, reportType: string) {
    return this.http
      .get(this.DYNAMICGRIDREPORT_GET_ALL_LIST_URL, {
        params: {
          eventGuid,
          reportType,
        },
      })
      .pipe((response) => {
        return response;
      });
  }

  getParams(reportId: string) {
    return this.http
      .get(this.GET_PARAMAS_URL, {
        params: {
          reportId,
        },
      })
      .pipe((response) => {
        return response;
      });
  }

  getExecute(formdata: any): Observable<any> {
    return this.http.post(this.EXCECUTE_URL, formdata).pipe((response) => {
      return response;
    });
  }

  setAutoRun(val: boolean) {
    this.isAutoRun.update(() => val);
  }
}
