import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import {
  CampaignListRequestData,
  CampaignListResponseData,
  CampaignCardDataResponse,
} from "./../models/campaign-model";

@Injectable({
  providedIn: "root",
})
export class CampaignService {
  version = "v1/";
  CAMPAIGN__MAIN_URL = "Campaign";
  private GET_CAMPAIGNS_URL = `${this.version}${this.CAMPAIGN__MAIN_URL}/GetCampaigns`;
  private GET_CAMPAIGNS_LIST_URL = `${this.version}${this.CAMPAIGN__MAIN_URL}/GetCampaignList`;
  private GET_CAMPAIGNS_CARD_URL = `${this.version}${this.CAMPAIGN__MAIN_URL}/GetCampaignCard`;
  private GET_CAMPAIGN_URL = `${this.version}${this.CAMPAIGN__MAIN_URL}/GetCampaign`;
  private SAVE_CAMPAIGN_URL = `${this.version}${this.CAMPAIGN__MAIN_URL}/Save`;
  private DELETE_CAMPAIGN_URL = `${this.version}${this.CAMPAIGN__MAIN_URL}/Delete`;
  private GET_CAMPAINGS_REPORT_URL = `${this.version}${this.CAMPAIGN__MAIN_URL}/GetCampaignsReport`;
  private GET_CAMPAINGS_IMPORT_URL = `${this.version}${this.CAMPAIGN__MAIN_URL}/Import`;

  constructor(private http: HttpClient) {}

  getCampaigns(
    orgId: string,
    userId: string,
    isGlobal: string,
    eventGuid: string
  ) {
    return this.http
      .get(
        this.GET_CAMPAIGNS_URL +
          "?orgId=" +
          orgId +
          "&&userId=" +
          userId +
          "&&isGlobal=" +
          isGlobal +
          "&&eventGuid=" +
          eventGuid +
          "&&inActive=true"
      )
      .pipe((response) => {
        return response;
      });
  }

  getCampaignList(
    formdata: CampaignListRequestData
  ): Observable<CampaignListResponseData> {
    return this.http
      .post<CampaignListResponseData>(this.GET_CAMPAIGNS_LIST_URL, formdata)
      .pipe((response) => {
        return response;
      });
  }

  getCampaignCard(formdata): Observable<CampaignCardDataResponse> {
    return this.http
      .post<CampaignCardDataResponse>(this.GET_CAMPAIGNS_CARD_URL, formdata)
      .pipe((response) => {
        return response;
      });
  }

  saveCampaign(formdata: any): Observable<any> {
    return this.http.post(this.SAVE_CAMPAIGN_URL, formdata).pipe((response) => {
      return response;
    });
  }

  getCampaign(
    campaignId: number,
    macAddress: string,
    eventGuid: string
  ): Observable<any> {
    return this.http
      .get(
        this.GET_CAMPAIGN_URL +
          "?campaignId=" +
          campaignId +
          "&&macAddress=" +
          macAddress +
          "&&eventGuid=" +
          eventGuid
      )
      .pipe((response) => {
        return response;
      });
  }
  deleteCampaign(formdata: any) {
    return this.http
      .request("delete", this.DELETE_CAMPAIGN_URL, { body: formdata })
      .pipe((response) => {
        return response;
      });
  }
  getCampaingsReport(formdata: any): Observable<any> {
    return this.http
      .post(this.GET_CAMPAINGS_REPORT_URL, formdata)
      .pipe((response) => {
        return response;
      });
  }

  uploadResonFile(formdata: any) {
    return this.http
      .post(this.GET_CAMPAINGS_IMPORT_URL, formdata)
      .pipe((respone) => {
        return respone;
      });
  }
}
