import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class ReasonService {
  version = "v1/";
  REASON_MAIN_URL = "Reason";
  REASON_GET_LIST_URL = `${this.version}${this.REASON_MAIN_URL}/GetReasons`;
  REASON_SAVE_DATA_URL = `${this.version}${this.REASON_MAIN_URL}/SaveReason`;
  REASON_CARD_DATA_URL = `${this.version}${this.REASON_MAIN_URL}/GetReasonCard`;
  REASON_GET_DATA_URL = `${this.version}${this.REASON_MAIN_URL}/GetReason`;
  REASON_DELETE_DATA_URL = `${this.version}${this.REASON_MAIN_URL}/Delete`;
  REASON_DOWNLOAD_TEMPLATE_URL = `${this.version}${this.REASON_MAIN_URL}/DownloadReasonTemplate`;
  REASON_BULK_URL = `${this.version}${this.REASON_MAIN_URL}/ReasonBulk`;
  REASON_GET_REPORT = `${this.version}${this.REASON_MAIN_URL}/GetReasonsReport`;
  REASON_BULK_ACTIONS = `${this.version}${this.REASON_MAIN_URL}/BulkActions`;

  constructor(private http: HttpClient) {}
  getReasonList(formdata: any): Observable<any> {
    return this.http
      .post(this.REASON_GET_LIST_URL, formdata)
      .pipe((response) => {
        return response;
      });
  }

  getReasonCard(formdata: any): Observable<any> {
    return this.http
      .post(this.REASON_CARD_DATA_URL, formdata)
      .pipe((response) => {
        return response;
      });
  }
  saveReason(formdata: any): Observable<any> {
    return this.http
      .post(this.REASON_SAVE_DATA_URL, formdata)
      .pipe((response) => {
        return response;
      });
  }

  getReason(
    reasonId: number,
    macAddress: string,
    eventGuid: string
  ): Observable<any> {
    return this.http
      .get(
        this.REASON_GET_DATA_URL +
          "?reasonId=" +
          reasonId +
          "&&macAddress=" +
          macAddress +
          "&&eventGuId=" +
          eventGuid
      )
      .pipe((response) => {
        return response;
      });
  }

  deleteReason(formdata: any) {
    return this.http
      .request("delete", this.REASON_DELETE_DATA_URL, { body: formdata })
      .pipe((response) => {
        return response;
      });
  }

  downloadReasonTemplate(): Observable<any> {
    return this.http
      .get(this.REASON_DOWNLOAD_TEMPLATE_URL, { responseType: "blob" })
      .pipe((response) => {
        return response;
      });
  }
  uploadResonFile(formdata: any) {
    return this.http.post(this.REASON_BULK_URL, formdata).pipe((respone) => {
      return respone;
    });
    // return this.http.post(this.REASON_BULK_URL, { body: formdata ,headers:new HttpHeaders({
    //   "Content-Type": "multipart/form-data"
    //  })}).pipe(
    //   respone=>{
    //     return respone
    //   }
    // )
  }
  getReasonReport(formdata: any) {
    return this.http.post(this.REASON_GET_REPORT, formdata).pipe((respone) => {
      return respone;
    });
  }

  reasonBulkAction(formdata: any) {
    return this.http
      .post(this.REASON_BULK_ACTIONS, formdata)
      .pipe((respone) => {
        return respone;
      });
  }
}
