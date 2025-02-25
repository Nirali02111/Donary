import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { RetryRequestData, RetryResponseData } from "./../models/payment-model";

@Injectable({
  providedIn: "root",
})
export class PaymentService {
  version = "v1/";
  PAYMENT_MAIN_URL = "payment";
  //DOWNLOAD_SAMPLE_FILE_URL = `${this.version}${this.PLEDGE_TRANSACTION_MAIN_URL}/downloadPledgeSampleFile`;

  PAY_URL = `${this.version}${this.PAYMENT_MAIN_URL}/Pay`;
  EDIT_PAYMENT_URL = `${this.version}${this.PAYMENT_MAIN_URL}/GetPaymentByPaymentId`;
  UPDATE_PAYMENT_URL = `${this.version}${this.PAYMENT_MAIN_URL}/UpdatePayment`;
  VOID_PAYMENT_URL = `${this.version}${this.PAYMENT_MAIN_URL}/VoidPayment`;
  protected RETRY_PAYMENT_URL = `${this.version}${this.PAYMENT_MAIN_URL}/RetryPayment`;
  protected UPDATE_PAYMENTWALLET_URL = `${this.version}${this.PAYMENT_MAIN_URL}/UpdatePaymentWallet`;

  protected BULK_UPDATE_PAYMENT_URL = `${this.version}${this.PAYMENT_MAIN_URL}/BulkUpdate`;
  protected BULK_VOID_PAYMENT_URL = `${this.version}${this.PAYMENT_MAIN_URL}/VoidPaymentBulk`;

  private DONATE_DEVICE_PAY_URL = `${this.version}${this.PAYMENT_MAIN_URL}/DevicePay`;

  protected PAYMENT_DELETE_URL = `${this.version}${this.PAYMENT_MAIN_URL}/Delete`;

  protected REFUND_PAYMENT = `${this.version}${this.PAYMENT_MAIN_URL}/RefundPayment`;
  protected DOWNLOAD_TEMPATE = `${this.version}${this.PAYMENT_MAIN_URL}/DownloadTempate`;
  protected IMPORT_PAYMENTS = `${this.version}${this.PAYMENT_MAIN_URL}/ImportPayments`;
  protected BULK_UPDATE_CHECK_STATUS_PAYMENT_URL = `${this.version}${this.PAYMENT_MAIN_URL}/BulkUpdateCheckStatus`;
  protected ACH_URL = `${this.version}${this.PAYMENT_MAIN_URL}/ACH`;
  protected BULK_PAYMENT_URL = `${this.version}${this.PAYMENT_MAIN_URL}/BulkPay`;
  constructor(private http: HttpClient) {}

  PayTransaction(formdata: any): Observable<any> {
    return this.http.post(this.PAY_URL, formdata).pipe((response) => {
      return response;
    });
  }

  EditPayment(eventGuid: string, paymentId: number) {
    return this.http
      .get(
        this.EDIT_PAYMENT_URL +
          "?eventGuId=" +
          eventGuid +
          "&&paymentId=" +
          paymentId
      )
      .pipe((response) => {
        return response;
      });
  }

  UpdatePayment(formdata: any): Observable<any> {
    return this.http
      .post(this.UPDATE_PAYMENT_URL, formdata)
      .pipe((response) => {
        return response;
      });
  }

  VoidPayment(formdata: any): Observable<any> {
    return this.http.post(this.VOID_PAYMENT_URL, formdata).pipe((response) => {
      return response;
    });
  }

  RetryPayment(formdata: RetryRequestData): Observable<any> {
    return this.http.post(this.RETRY_PAYMENT_URL, formdata).pipe((response) => {
      return response;
    });
  }

  UpdatePaymentWallet(formdata: any): Observable<any> {
    return this.http
      .put(this.UPDATE_PAYMENTWALLET_URL, formdata)
      .pipe((response) => {
        return response;
      });
  }

  BulkUpdatePaymentTransactions(formdata: any): Observable<any> {
    return this.http
      .put(this.BULK_UPDATE_PAYMENT_URL, formdata)
      .pipe((response) => {
        return response;
      });
  }
  BulkVoidPayment(formdata: any): Observable<any> {
    return this.http
      .post(this.BULK_VOID_PAYMENT_URL, formdata)
      .pipe((response) => {
        return response;
      });
  }

  DevicePay(formdata: any) {
    return this.http
      .post(this.DONATE_DEVICE_PAY_URL, formdata)
      .pipe((response) => {
        return response;
      });
  }
  DeletePayment(paymentIds: any) {
    return this.http
      .post(this.PAYMENT_DELETE_URL, paymentIds)
      .pipe((response) => {
        return response;
      });
  }
  RefundPayment(formdata: any) {
    return this.http.post(this.REFUND_PAYMENT, formdata).pipe((response) => {
      return response;
    });
  }
  downloadPaymentTemplate(): Observable<any> {
    return this.http
      .get(this.DOWNLOAD_TEMPATE, { responseType: "blob" })
      .pipe((response) => {
        return response;
      });
  }
  importPayments(formdata: any) {
    return this.http.post(this.IMPORT_PAYMENTS, formdata).pipe((response) => {
      return response;
    });
  }
  bulkUpdateCheckStatusPayment(formdata: any): Observable<any> {
    return this.http
      .post(this.BULK_UPDATE_CHECK_STATUS_PAYMENT_URL, formdata)
      .pipe((response) => {
        return response;
      });
  }

  AchTransaction(formdata: any): Observable<any> {
    return this.http.post(this.ACH_URL, formdata).pipe((response) => {
      return response;
    });
  }
  BulkPayTransaction(formdata: any): Observable<any> {
    return this.http.post(this.BULK_PAYMENT_URL, formdata).pipe((response) => {
      return response;
    });
  }
}
