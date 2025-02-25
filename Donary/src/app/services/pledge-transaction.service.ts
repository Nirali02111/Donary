import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class PledgeTransactionService {

    version = 'v1/';
    PLEDGE_TRANSACTION_MAIN_URL = 'pledgetransaction';
    DOWNLOAD_SAMPLE_FILE_URL = `${this.version}${this.PLEDGE_TRANSACTION_MAIN_URL}/downloadPledgeSampleFile`;
    PLEDGE_TRANSACTION_LIST_URL = `${this.version}${this.PLEDGE_TRANSACTION_MAIN_URL}/getPledgeTrans`;

    constructor(private http: HttpClient) { }    

    getPledgeTransactions(formdata: any): Observable<any> {
        return this.http.post(this.PLEDGE_TRANSACTION_LIST_URL, formdata).pipe(response => {
          return response;
        });
      }
}
