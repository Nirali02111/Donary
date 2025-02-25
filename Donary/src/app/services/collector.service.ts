import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class CollectorService {

    version = 'v1/';
    COLLECTORCARD_MAIN_URL = 'Collector';    
   COLLECTOR_CARD_DATA_URL = `${this.version}${this.COLLECTORCARD_MAIN_URL}/GetCollectorCard`;   
   COLLECTOR_GET_LIST_URL = `${this.version}${this.COLLECTORCARD_MAIN_URL}/GetCollectors`;
   COLLECTOR_PAYMENT_LIST_URL = `${this.version}${this.COLLECTORCARD_MAIN_URL}/GetCollectorCardPayments`; 
   COLLECTOR_PLEDGE_LIST_URL = `${this.version}${this.COLLECTORCARD_MAIN_URL}/GetCollectorCardPledges`; 
   COLLECTOR_SCHEDULE_LIST_URL = `${this.version}${this.COLLECTORCARD_MAIN_URL}/GetCollectorCardSchedules`; 
   COLLECTOR_GET_REPORT = `${this.version}${this.COLLECTORCARD_MAIN_URL}/GetCollectorsReport`; 
   

    constructor(private http: HttpClient) { }    
    getCollectorCard(formdata: any): Observable<any> {
        return this.http.post(this.COLLECTOR_CARD_DATA_URL, formdata).pipe(response => {
          return response;
        });
      }

    getCollectorList(formdata: any): Observable<any> {
        return this.http.post(this.COLLECTOR_GET_LIST_URL,formdata ).pipe(response => {
          return response;
        });
      }

  getCollectorPaymentList(formdata: any): Observable<any> {
        return this.http.post(this.COLLECTOR_PAYMENT_LIST_URL,formdata ).pipe(response => {
          return response;
        });
      }
  getCollectorPledgeList(formdata: any): Observable<any> {
        return this.http.post(this.COLLECTOR_PLEDGE_LIST_URL,formdata ).pipe(response => {
          return response;
        });
      }

  getCollectorScheduleList(formdata: any): Observable<any> {
      return this.http.post(this.COLLECTOR_SCHEDULE_LIST_URL,formdata ).pipe(response => {
      return response;
      });
      }
      getCollectorReport(formdata: any): Observable<any> {
        return this.http.post(this.COLLECTOR_GET_REPORT,formdata ).pipe(response => {
        return response;
        });
        }
}