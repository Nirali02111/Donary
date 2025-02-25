import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LocalstoragedataService } from '../commons/local-storage-data.service';
import { MailResponseData, MultipleMailResponseData } from '../models/messenger-models';
import xml2js from 'xml2js';

@Injectable({
  providedIn: 'root'
})
export class MessengerService {

   version = 'v1/';
   MESSENGERCARD_MAIN_URL = 'Messenger';
   MESSENGER_SEND_EMAILRECEIPT_URL = `${this.version}${this.MESSENGERCARD_MAIN_URL}/SendEmailReceipt`;
   MESSENGER_SEND_SMSRECEIPT_URL = `${this.version}${this.MESSENGERCARD_MAIN_URL}/SendSMSReceipt`;
   MESSENGER_SEND_MAILRECEIPT_URL=`${this.version}${this.MESSENGERCARD_MAIN_URL}/SendMailReceipt`;
   MESSENGER_SEND_PRINTRECEIPT_URL=`${this.version}${this.MESSENGERCARD_MAIN_URL}/PrintReceipt`;
   MESSENGER_BULK_SMSRECEIPT_URL = `${this.version}${this.MESSENGERCARD_MAIN_URL}/BulkSMSReceipt`;
   MESSENGER_BULK_EMAILRECEIPT_URL = `${this.version}${this.MESSENGERCARD_MAIN_URL}/BulkEmailReceipt`;
   MESSENGER_BULK_MAILRECEIPT_URL = `${this.version}${this.MESSENGERCARD_MAIN_URL}/BulkMailReceipt`;
   MESSENGER_BULK_PRINTRECEIPT_URL=`${this.version}${this.MESSENGERCARD_MAIN_URL}/BulkPrintReceipt`;
   MESSEGER_GET_STATEMENT_TEMPLATE=`${this.version}${this.MESSENGERCARD_MAIN_URL}/GetStatementTemplates`;
    VALIDATEADDRESS_API_URL = 'https://production.shippingapis.com/ShippingAPI.dll?API=Verify';

    constructor(private http: HttpClient,
      private localstoragedataService:LocalstoragedataService) { }
    accessToken = this.localstoragedataService.getloginUserAccessToken();
    httpXMLOptions={
      headers: new HttpHeaders({
        'Content-Type': 'text/xml' ,
       // 'Authorization': 'Bearer '+this.accessToken ,
          //'Accept' : 'text/xml',
      })
    }

    ValidateAddress(formdata: string):Observable<any> {
      return new Observable<any>(observer => {
        fetch(this.VALIDATEADDRESS_API_URL + '&XML='+formdata, {
          mode: "cors",
          method: "GET",
          headers: {
            "Accept": "text/xml"
          }
          })
          .then(res => {
            return res.text();
          })
          .then(body => {

            xml2js.parseStringPromise(body, {ignoreAttrs: true, explicitArray: false}).then((result: MailResponseData) => {

              if (result.AddressValidateResponse.Address.Error) {

                observer.next({
                  isValid: false,
                  message: result.AddressValidateResponse.Address.Error.Description,
                  address: "",
                  cityStateZip: "",
                  city: "",
                  state: "",
                  zip: ""
                });
                observer.complete();
                return;
              }

              if (result.AddressValidateResponse.Address.ReturnText) {
                let tmpStr = result.AddressValidateResponse.Address.ReturnText.split(":");
                if (tmpStr.length !== 0) {


                  observer.next({
                    isValid: false,
                    message: tmpStr[1],
                    address: "",
                    cityStateZip: "",
                    city: "",
                  state: "",
                  zip: ""
                  });
                  observer.complete();
                  return;
                } else {

                  observer.next({
                    isValid: false,
                    message: result.AddressValidateResponse.Address.ReturnText,
                    address: "",
                    cityStateZip: "",
                    city: "",
                    state: "",
                    zip: ""
                  });
                  observer.complete();
                  return;
                }
              }

              observer.next({
                isValid: true,
                message: "",
                address: result.AddressValidateResponse.Address.Address2,
                cityStateZip: `${result.AddressValidateResponse.Address.City} ${result.AddressValidateResponse.Address.State} ${result.AddressValidateResponse.Address.Zip5}`,
                city: result.AddressValidateResponse.Address.City,
                state: result.AddressValidateResponse.Address.State,
                zip: result.AddressValidateResponse.Address.Zip5
              });
              observer.complete();

            })
            .catch((err) => {

              observer.next({
                isValid: false,
                message: "Invalid Request",
                address: "",
                cityStateZip: ""
              });
              observer.complete();

            });
          })
          .catch(err => observer.error(err));
      })
    }

    ValidateMultipleAddress(formdata: string):Observable<any> {
      return new Observable<any>(observer => {
        fetch(this.VALIDATEADDRESS_API_URL + '&XML='+formdata, {
          mode: "cors",
          method: "GET",
          headers: {
            "Accept": "text/xml"
          }
          })
          .then(res => {
            return res.text();
          })
          .then(body => {

            xml2js.parseStringPromise(body, {explicitArray: false, mergeAttrs: true }).then((result: MultipleMailResponseData) => {
              let finalResult=[]
              if(result.AddressValidateResponse.Address.length ==undefined && result.AddressValidateResponse.Address!=null)
              {
                finalResult=this.checkAddressValidation(result.AddressValidateResponse.Address)
              }
              for (let index = 0; index < result.AddressValidateResponse.Address.length; index++) {
                finalResult.push(...this.checkAddressValidation(result.AddressValidateResponse.Address[index]));
              }

              observer.next(finalResult);
              observer.complete();
            })
            .catch((err) => {
              observer.next("Invalid Request");
              observer.complete();
            });
          })
          .catch(err => observer.error(err));
      })
    }

    checkAddressValidation(result)
    {
      const returnResult = [];
      const element = result;
                if (element.Error) {
                  returnResult.push({
                    ID: element.ID,
                    isValid: false,
                    message: element.Error.Description
                  })
                } else if (element.ReturnText) {

                  let tmp = element.ReturnText.split(":")

                  if (tmp.length !== 0) {
                    returnResult.push({
                      ID: element.ID,
                      isValid: true,
                      message: tmp[1]
                    });
                  } else {
                    returnResult.push({
                      ID: element.ID,
                      isValid: true,
                      message: element.ReturnText
                    });
                  }
                } else {
                  returnResult.push({
                    ID: element.ID,
                    isValid: true,
                    message: ''
                  });
                }
      return returnResult;
    }

    SendSMSReceipt(formdata: any): Observable<any> {
        return this.http.post(this.MESSENGER_SEND_SMSRECEIPT_URL, formdata).pipe(response => {
          return response;
        });
      }

    SendEmailReceipt(formdata: any): Observable<any> {
        return this.http.post(this.MESSENGER_SEND_EMAILRECEIPT_URL,formdata ).pipe(response => {
          return response;
        });
      }

      PrintReceipt(formdata: any): Observable<any> {
        return this.http.post(this.MESSENGER_SEND_PRINTRECEIPT_URL,formdata ).pipe(response => {
          return response;
        });
      }
      SendMailReceipt(formdata: any): Observable<any> {
        return this.http.post(this.MESSENGER_SEND_MAILRECEIPT_URL,formdata ).pipe(response => {
          return response;
        });
      }

  //Bulk
  BulkSMSReceipt(formdata: any): Observable<any> {
    return this.http.post(this.MESSENGER_BULK_SMSRECEIPT_URL, formdata).pipe(response => {
      return response;
    });
  }

  BulkEmailReceipt(formdata: any): Observable<any> {
    return this.http.post(this.MESSENGER_BULK_EMAILRECEIPT_URL, formdata).pipe(response => {
      return response;
    });
  }

  BulkMailReceipt(formdata: any) : Observable<any> {
    return this.http.post(this.MESSENGER_BULK_MAILRECEIPT_URL, formdata).pipe(response => {
      return response;
    });
  }

  BulkPrintReceipt(formdata: any): Observable<any> {
    return this.http.post(this.MESSENGER_BULK_PRINTRECEIPT_URL,formdata).pipe(response => {
      return response;
    });
  }
  getStatementTemplates() {
    return this.http.get(this.MESSEGER_GET_STATEMENT_TEMPLATE).pipe(response => {
      return response
    });
  }
}
