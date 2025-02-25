import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PledgePaymentService {

  version = 'v1/';
  DONOR_PLEDGE_PAYMENT_MAIN_URL = 'donorpledgepayment';
  DONOR_PLEDGE_PAYMENT_LIST_URL = `${this.version}${this.DONOR_PLEDGE_PAYMENT_MAIN_URL}/getunpaidpledges`; 
  DONOR_PLEDGE_PAYMENT_Login_URL = `${this.version}${this.DONOR_PLEDGE_PAYMENT_MAIN_URL}/verify`;
  DONOR_PLEDGE_PAYMENT_SAVE_PLEDGE_PAY_URL = `${this.version}${this.DONOR_PLEDGE_PAYMENT_MAIN_URL}/savepledgepay`;

  constructor(private http: HttpClient) { }

  donorPledgePaymentLogin(formdata: any): Observable<any> {
    return this.http.post(this.DONOR_PLEDGE_PAYMENT_Login_URL, formdata).pipe(response => {
      return response;
    });
  }

  donorPledgePaymentList(accountId: number, eventGuid: string) {
    return this.http.get(this.DONOR_PLEDGE_PAYMENT_LIST_URL + '?accountId=' + accountId + '&&eventGuId=' + eventGuid).pipe(response => {
      return response;
    });
  }  

  SavePledgePayDetails(objPledgePayDetails: any) {
    return this.http.post(this.DONOR_PLEDGE_PAYMENT_SAVE_PLEDGE_PAY_URL, objPledgePayDetails).pipe(response => {
      return response;
    });
  }

}
