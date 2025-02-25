import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class BatchService {

    version = 'v2/';
    version1 = 'v1/'
    BATCH_MAIN_URL = 'Batch';
    BATCH_SAVE_URL = `${this.version}${this.BATCH_MAIN_URL}/Save`;
    BATCH_SAVE_V1_URL = `${this.version1}${this.BATCH_MAIN_URL}/Save`;
    BATCH_GETLIST_URL = `${this.version}${this.BATCH_MAIN_URL}/GetBatchList`;
    BATCH_GETCARD_URL= `${this.version}${this.BATCH_MAIN_URL}/GetBatchCard`;
    BATCH_GETTRANSACTION_URL= `${this.version}${this.BATCH_MAIN_URL}/GetBatchTransactions`;
    ARCHIVE_BATCH_URL= `${this.version}${this.BATCH_MAIN_URL}/ArchiveBatch`;
    GET_BATCH_EXTERNAL_NUMBER = `${this.version}/common/GetExternalBatchNumbers`;


    constructor(private http: HttpClient) { }

    saveBatch(formdata: any): Observable<any> {
        return this.http.post(this.BATCH_SAVE_URL,formdata ).pipe(response => {
          return response;
        });
      }

      saveBatchV1(formdata: any): Observable<any> {
        return this.http.post(this.BATCH_SAVE_V1_URL,formdata ).pipe(response => {
          return response;
        });
      }

    getBatchNumbers(eventGuid: string): Observable<any> {
      return this.http
        .get(this.GET_BATCH_EXTERNAL_NUMBER, {
          params: {
            eventGuid,
          },
        })
        .pipe((response) => {
          return response;
        });
    }

    getBatchList(formdata: any): Observable<any> {
      return this.http
        .post(this.BATCH_GETLIST_URL,formdata)
        .pipe((response) => {
          return response;
        });
    }

    getBatchCard(formdata: any): Observable<any> {
      return this.http.post(this.BATCH_GETCARD_URL,formdata).pipe(response => {
        return response;
      });
    }

    getBatchTransactions(gatewayBatchNum:string, eventGuid: string): Observable<any> {
      return this.http
        .get(this.BATCH_GETTRANSACTION_URL, {
          params: {
            gatewayBatchNum,
            eventGuid
          },
        })
        .pipe((response) => {
          return response;
        });
    }
    
    getArchiveBatch(formdata: any): Observable<any> {
      return this.http.post(this.ARCHIVE_BATCH_URL,formdata).pipe(response => {
        return response;
      });
    }



}
