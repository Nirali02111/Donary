import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PrintableReportService {
  version = 'v1/';
  PRINTABLE_REPORT_MAIN_URL = 'PrintableReport';
  PRINTABLE_REPORT_GETALL = `${this.version}${this.PRINTABLE_REPORT_MAIN_URL}/GetAll`;
  constructor(private http: HttpClient) { }

  getAllPrintableReport(listName: string, orgId: string) {
    return this.http.get(this.PRINTABLE_REPORT_GETALL + '?listName=' + listName + "&&orgId=" + orgId ).pipe(response => {
    return response;
      });
   }
   getCampaignsComparison(formdata: any,generateReportUrl:string): Observable<any> {
    let reportUrl = generateReportUrl.substring(1);
    return this.http.post(reportUrl, formdata).pipe((response) => {
      return response;
    });
  }
}
