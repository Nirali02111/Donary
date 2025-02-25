import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PlanService {

  version = 'v1/';
  PLAN_MAIN_URL = 'Plan';
  FEATURE_SETTING_URL = `${this.version}${this.PLAN_MAIN_URL}/GetFeatureSettings`;
  SEND_UPGRADE_URL = `${this.version}${this.PLAN_MAIN_URL}/SendUpgradeEmail`;
  constructor(private http: HttpClient) { }

  getFeatureSettings(formdata: any): Observable<any> {
    return this.http.post(this.FEATURE_SETTING_URL, formdata).pipe(response => {
      return response;
    });
  }

  sendUpgradeEmail(formdata: any): Observable<any> {
    return this.http.post(this.SEND_UPGRADE_URL, formdata).pipe(response => {
      return response;
    });
  }
}
