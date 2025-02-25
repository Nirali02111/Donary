import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LocalstoragedataService } from '../commons/local-storage-data.service';

@Injectable({
  providedIn: 'root'
})
export class PaymentApiGatewayService {
  version = "v1/";
  PAYMENT_API_GATEWAY = "PaymentAPIGateway";
  PAYMENT_API_GATEWAY_LIST_URL = `${this.version}${this.PAYMENT_API_GATEWAY}/GetAll`;
  PAYMENT_API_GATEWAY_SAVE_URL = `${this.version}${this.PAYMENT_API_GATEWAY}/Save`;
  PAYMENT_API_GATEWAY_Delete_URL = `${this.version}${this.PAYMENT_API_GATEWAY}/Delete`;
  constructor(private http: HttpClient,
    private localstoragedataService:LocalstoragedataService) { }
  accessToken = this.localstoragedataService.getloginUserAccessToken();
    httpOptions ={
      headers: new HttpHeaders({
        'Content-Type': 'application/json' ,
        'Authorization': 'Bearer '+this.accessToken ,
        'Accept' : 'application/json'
      })
    };
  getAllPaymentAPIGateway(eventGuid: string) {
    return this.http
      .get(this.PAYMENT_API_GATEWAY_LIST_URL +"?eventGuId="+eventGuid)
      .pipe((response) => {
        return response;
      });
  }
  save(formdata: any): Observable<any> {
    return this.http
      .post(this.PAYMENT_API_GATEWAY_SAVE_URL, formdata)
      .pipe((response) => {
        return response;
      });
  }
  delete(formdata:any) {
    return this.http.request('delete', this.PAYMENT_API_GATEWAY_Delete_URL, { body: formdata }).pipe(response => {
      return response;
    });
}
}
