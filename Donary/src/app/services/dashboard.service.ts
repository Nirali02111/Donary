import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class DashboardService {

    version = 'v1/';
    DASHBOARD_MAIN_URL = 'Dashboard';        
    DASHBOARD_GET_TOTAL_URL = `${this.version}${this.DASHBOARD_MAIN_URL}/Summary`;    
    DASHBOARD_GET_RECENT_URL = `${this.version}${this.DASHBOARD_MAIN_URL}/GetRecent`;
    DASHBOARD_GET_UPCOMING_URL =`${this.version}${this.DASHBOARD_MAIN_URL}/GetUpcoming`;
    DASHBOARD_GET_LIST_URL =`${this.version}${this.DASHBOARD_MAIN_URL}/GetLists`;
    DASHBOARD_GET_PAYMENTS_URL =`${this.version}${this.DASHBOARD_MAIN_URL}/GetPayments`;
    constructor(private http: HttpClient) { }       

    getDashBoard(formdata: any): Observable<any> {
        return this.http.post(this.DASHBOARD_GET_TOTAL_URL,formdata ).pipe(response => {
          return response;
        });
      }
      
   getRecent(formdata: any): Observable<any> {
    return this.http.post(this.DASHBOARD_GET_RECENT_URL,formdata ).pipe(response => {
      return response;
    });
   }
   getUpcoming(formdata: any): Observable<any> {
    return this.http.post(this.DASHBOARD_GET_UPCOMING_URL,formdata ).pipe(response => {
      return response;
    });
   }

   getdashboardList(eventGuid: string) {
    return this.http.get(this.DASHBOARD_GET_LIST_URL + '?eventGuId=' + eventGuid).pipe(response => {
        return response;
    });
}
   getdashboardPayments(formdata: any): Observable<any> {
    return this.http.post(this.DASHBOARD_GET_PAYMENTS_URL,formdata ).pipe(response => {
      return response;
    });
   }

}