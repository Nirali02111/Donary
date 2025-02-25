import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PledgeGroupService {
  version = 'v1/';
  PLEDGE_GROUP_MAIN_URL = 'PledgeGroup';
  GET_ALIYA_GROUP_LIST_URL = `${this.version}${this.PLEDGE_GROUP_MAIN_URL}/GetAliyaGroupList`; 
  GET_ALIYA_GROUP = `${this.version}${this.PLEDGE_GROUP_MAIN_URL}/Get`; 
  GET_ALIYA_GROUP_REPORT = `${this.version}${this.PLEDGE_GROUP_MAIN_URL}/GetAliyaGroupReport`; 
  SAVE_ALIYA_GROUP = `${this.version}${this.PLEDGE_GROUP_MAIN_URL}/Save`; 


  constructor(private http: HttpClient) { }

  getAliyaGroupList(formdata: any): Observable<any> {
    return this.http.post(this.GET_ALIYA_GROUP_LIST_URL, formdata).pipe((response) => {
      return response;
    });
  }

  getAliyaGroup(eventGuId:string,groupID:number,): Observable<any> {
    return this.http.get(this.GET_ALIYA_GROUP+ '?eventGuId=' + eventGuId+ '&&groupID=' + groupID).pipe(response => {
      return response;
    });
  }

  getAliyaGroupReport(formdata: any): Observable<any> {
    return this.http.post(this.GET_ALIYA_GROUP_REPORT, formdata).pipe((response) => {
      return response;
    });
  }
  
  saveGroupPledge(formdata: any): Observable<any> {
    return this.http.post(this.SAVE_ALIYA_GROUP, formdata).pipe((response) => {
      return response;
    });
  }

}
