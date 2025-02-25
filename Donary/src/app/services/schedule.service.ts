import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ScheduleService {

version = 'v1/';
SCHEDULE_MAIN_URL = 'Schedule';        
Schedule_GET_LIST_URL = `${this.version}${this.SCHEDULE_MAIN_URL}/GetSchedules`; 
Schedule_GET_PAYMENTPLEDGELIST_URL = `${this.version}${this.SCHEDULE_MAIN_URL}/GetDonorCardSchedules`; 
Schedule_UPDATE_WALLET_URL = `${this.version}${this.SCHEDULE_MAIN_URL}/UpdateScheduleWallet`; 
Schedule_UPDATE_SINGLE_URL = `${this.version}${this.SCHEDULE_MAIN_URL}/UpdateSingleSchedule`; 
Schedule_CANCEL_URL = `${this.version}${this.SCHEDULE_MAIN_URL}/Cancel`; 
Schedule_FullUpdate_URL = `${this.version}${this.SCHEDULE_MAIN_URL}/UpdateFullSchedule`; 
Schedule_EXECUTE_URL = `${this.version}${this.SCHEDULE_MAIN_URL}/ExecuteSchedule`; 

    constructor(private http: HttpClient) { }       

    getScheduleList(formdata: any): Observable<any> {
        return this.http.post(this.Schedule_GET_LIST_URL,formdata ).pipe(response => {
          return response;
        });
      }
    getSchedulePaymentPledgeList(formdata: any): Observable<any> {
        return this.http.post(this.Schedule_GET_PAYMENTPLEDGELIST_URL,formdata ).pipe(response => {
        return response;
        });
      }

    putScheduleUpdateWallet(formdata: any): Observable<any> {
        return this.http.put(this.Schedule_UPDATE_WALLET_URL,formdata ).pipe(response => {
        return response;
        });
      }
  updateSingleSchedule(formdata: any): Observable<any> {
        return this.http.put(this.Schedule_UPDATE_SINGLE_URL,formdata ).pipe(response => {
        return response;
        });
      }

  cancelSchedule(formdata: any): Observable<any> {
        return this.http.post(this.Schedule_CANCEL_URL,formdata ).pipe(response => {
        return response;
        });
      }

   updateFullSchedule(formdata:any): Observable<any>{
     return this.http.put(this.Schedule_FullUpdate_URL,formdata ).pipe(response => {
      return response;
      });
   }
   executeSchedule(formdata:any): Observable<any>{
    return this.http.put(this.Schedule_EXECUTE_URL,formdata ).pipe(response => {
     return response;
     });
  }
}