import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class CardService {

    version = 'v1/';
    DONORCARD_MAIN_URL = 'DonaryCard';
    //DOWNLOAD_SAMPLE_FILE_URL = `${this.version}${this.CAMPAIGN_TRANSACTION_MAIN_URL}/downloadCampaignSampleFile`;
   DONOR_CARD_DATA_URL = `${this.version}${this.DONORCARD_MAIN_URL}/GetDonorCard`;
   PAYMENT_CARD_DATA_URL = `${this.version}${this.DONORCARD_MAIN_URL}/GetPaymentCard`;
   PAYMENTLIST_CARD_DATA_URL = `${this.version}${this.DONORCARD_MAIN_URL}/GetCardPaymentList`;
   PLEDGELIST_CARD_DATA_URL = `${this.version}${this.DONORCARD_MAIN_URL}/getpledgelistcard`;
   SCHEDULE_CARD_DATA_URL = `${this.version}${this.DONORCARD_MAIN_URL}/getschedulecard`;
   

    constructor(private http: HttpClient) { }    

    getDonorCard(formdata: any): Observable<any> {
        return this.http.post(this.DONOR_CARD_DATA_URL, formdata).pipe(response => {
          return response;
        });
      }

      getPaymentCard(formdata: any): Observable<any> {
        return this.http.post(this.PAYMENT_CARD_DATA_URL, formdata).pipe(response => {
          return response;
        });
      }

      getPaymentCardList(formdata: any): Observable<any> {
        return this.http.post(this.PAYMENTLIST_CARD_DATA_URL, formdata).pipe(response => {
          return response;
        });
      }
      
      getPledgeCardList(formdata: any): Observable<any> {
        return this.http.post(this.PLEDGELIST_CARD_DATA_URL, formdata).pipe(response => {
          return response;
        });
      }

      getScheduleCard(formdata: any): Observable<any> {
        return this.http.post(this.SCHEDULE_CARD_DATA_URL, formdata).pipe(response => {
          return response;
        });
      }
    }