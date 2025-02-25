import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class PledgeService {
  version = "v1/";
  PLEDGE_MAIN_URL = "pledge";

  PLEDGE_CARD_URL = `${this.version}${this.PLEDGE_MAIN_URL}/GetPledgeCard`;
  PLEDGE_GET_URL = `${this.version}${this.PLEDGE_MAIN_URL}/GetPledge`;
  PLEDGE_UPDATE_URL = `${this.version}${this.PLEDGE_MAIN_URL}/UpdatePledge`;
  PLEDGE_ADD_URL = `${this.version}${this.PLEDGE_MAIN_URL}/AddPledge`;
  PLEDGE_ADDGROUP_URL = `${this.version}${this.PLEDGE_MAIN_URL}/AddGroupPledge`;

  protected BULK_PLEDGE_ACTION_URL = `${this.version}${this.PLEDGE_MAIN_URL}/BulkUpdate`;
  protected PLEDGE_DOWNLOAD_TEMPLATE = `${this.version}${this.PLEDGE_MAIN_URL}/DonwloadTemplate`;
  protected PLEDGE_IMPORT = `${this.version}${this.PLEDGE_MAIN_URL}/Import`;
  PLEDGE_VOID = `${this.version}${this.PLEDGE_MAIN_URL}/VoidPledge`;
  constructor(private http: HttpClient) {}

  GetPledgeCard(eventGuid: string, pledgeId: number) {
    return this.http
      .get(
        this.PLEDGE_CARD_URL +
          "?eventGuId=" +
          eventGuid +
          "&&pledgeId=" +
          pledgeId
      )
      .pipe((response) => {
        return response;
      });
  }

  addPledge(formdata: any): Observable<any> {
    return this.http.post(this.PLEDGE_ADD_URL, formdata).pipe((response) => {
      return response;
    });
  }

  updatePledge(formdata: any): Observable<any> {
    return this.http.post(this.PLEDGE_UPDATE_URL, formdata).pipe((response) => {
      return response;
    });
  }

  addGroupPledge(formdata: any): Observable<any> {
    return this.http
      .post(this.PLEDGE_ADDGROUP_URL, formdata)
      .pipe((response) => {
        return response;
      });
  }

  GetPledge(pledgeId: number, eventGuid: string) {
    return this.http
      .get(
        this.PLEDGE_GET_URL +
          "?pledgeId=" +
          pledgeId +
          "&&eventGuId=" +
          eventGuid
      )
      .pipe((response) => {
        return response;
      });
  }

  BulkUpdatePledgeTransactions(formdata: any): Observable<any> {
    return this.http
      .put(this.BULK_PLEDGE_ACTION_URL, formdata)
      .pipe((response) => {
        return response;
      });
  }

  downloadPledgeTemplate(): Observable<any> {
    return this.http
      .get(this.PLEDGE_DOWNLOAD_TEMPLATE, { responseType: "blob" })
      .pipe((response) => {
        return response;
      });
  }
  importPledge(formdata: any) {
    return this.http.post(this.PLEDGE_IMPORT, formdata).pipe((response) => {
      return response;
    });
  }
  voidPledge(formdata: any) {
    return this.http.post(this.PLEDGE_VOID, formdata).pipe((response) => {
      return response;
    });
  }
}
