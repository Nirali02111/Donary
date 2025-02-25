import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class CampaignTransactionService {

    version = 'v1/';
    CAMPAIGN_TRANSACTION_MAIN_URL = 'CampaignTransactions';
    DOWNLOAD_SAMPLE_FILE_URL = `${this.version}${this.CAMPAIGN_TRANSACTION_MAIN_URL}/downloadCampaignSampleFile`;
    CAMPAIGN_TRANSACTION_LIST_URL = `${this.version}${this.CAMPAIGN_TRANSACTION_MAIN_URL}/GetCampaignTran`;

    constructor(private http: HttpClient) { }    

    getCampaignTransactions(formdata: any): Observable<any> {
        return this.http.post(this.CAMPAIGN_TRANSACTION_LIST_URL, formdata).pipe(response => {
          return response;
        });
      }
}