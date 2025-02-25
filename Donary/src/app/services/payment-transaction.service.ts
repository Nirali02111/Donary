import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { CommonMethodService } from "../commons/common-methods.service";
import { AdvancedFieldService } from "./advancedfield.service";

@Injectable({
  providedIn: "root",
})
export class PaymentTransactionService {
  version = "v1/";
  version2 = "v2/";
  PAYMENT_TRANSACTION_MAIN_URL = "paymenttransaction";
  REPORT_MAIN_URL = "Report";
  //DOWNLOAD_SAMPLE_FILE_URL = `${this.version}${this.PLEDGE_TRANSACTION_MAIN_URL}/downloadPledgeSampleFile`;
  PAYMENT_TRANSACTION_LIST_URL = `${this.version}${this.PAYMENT_TRANSACTION_MAIN_URL}/GetPaymentTrans`;
  PAY_TRANSACTION_LIST_URL = `${this.version}${this.PAYMENT_TRANSACTION_MAIN_URL}/Pay`;
  TRANSACTION_REPORT_LIST_URL = `${this.version}${this.PAYMENT_TRANSACTION_MAIN_URL}/TransactionReport`;
  PAYMENT_TOTAL_LIST_URL = `${this.version}${this.REPORT_MAIN_URL}/GetPaymentsTotal`;
  PAYMENT_TRANSACTION_URL = `${this.version2}${this.PAYMENT_TRANSACTION_MAIN_URL}/GetPaymentTrans`;
  GENERATE_LEGAL_RECEIPT_URL = `${this.version}${this.PAYMENT_TRANSACTION_MAIN_URL}/GenerateLegalReceipt`;
  BULK_GENERATE_LEGAL_RECEIPT_URL = `${this.version}${this.PAYMENT_TRANSACTION_MAIN_URL}/BulkGenerateLegalReceipt`;
  constructor(
    private http: HttpClient,
    private commonMethodService: CommonMethodService,
    private advancedFieldService: AdvancedFieldService
  ) { }

  private getStatusClass(paymentStatus) {
    if (paymentStatus === "Success") {
      return "paymnt_success";
    }
    if (paymentStatus == "Error") {
      return "paymnt_error";
    }
    if (paymentStatus == "Voided") {
      return "paymnt_voided";
    }
    if (paymentStatus == "Refunded") {
      return "paymnt_refunded";
    }
    if (paymentStatus == "Deleted") {
      return "paymnt_deleted";
    }
    if (paymentStatus == "Pending") {
      return "status-pill check-pending";
    }
    if (paymentStatus == "Deposited") {
      return "status-pill check-deposited";
    }
    if (paymentStatus == "Declined") {
      return "status-pill check-declined";
    }
  }

  getPaymentTransactions(formdata: any): Observable<any> {
    return this.http.post(this.PAYMENT_TRANSACTION_LIST_URL, formdata).pipe(
      map((response: any) => {
        if (!response) {
          return {
            paymentTransGridModel: [],
          };
        }

        if (response && !response.paymentTransGridModel) {
          return {
            ...response,
            paymentTransGridModel: [],
          };
        }
        return response;
      }),

      map((response: any) => {
        const modelArray = response.paymentTransGridModel.map((item) => {
          const status_class = this.getStatusClass(item.paymentStatus);

          item.isPaymentActionsVisible = false;
          if (item.phoneNumbers && item.phoneNumbers.indexOf(",") > -1) {
            var phoneNoArray = item.phoneNumbers.split(",");
            item.phoneNumberList = phoneNoArray;
            phoneNoArray = phoneNoArray.slice(0, 2);

            const phoneArray = phoneNoArray.map((obj) => {
              if (item.phoneNo2)
                item.phoneNo2 =
                  item.phoneNo2 +
                  "<br>" +
                  this.commonMethodService.formatPhoneNumber(obj);
              else
                item.phoneNo2 = this.commonMethodService.formatPhoneNumber(obj);
              return obj;
            });
            phoneNoArray = phoneArray;
          } else {
            item.phoneNo2 = this.commonMethodService.formatPhoneNumber(
              item.phoneNumbers
            );
            item.phoneNumberList = item.phoneNumbers;
          }

          if (item.emailAddresses && item.emailAddresses.indexOf(",") > -1) {
            var emailArray = item.emailAddresses.split(",");
            item.emailList = emailArray;
            emailArray = emailArray.slice(0, 2);
            const emailAray = emailArray.map((obj) => {
              if (item.emailLabels2)
                item.emailLabels2 = item.emailLabels2 + "<br>" + obj;
              else item.emailLabels2 = obj;

              return obj;
            });
            emailArray = emailAray;
          } else {
            item.emailLabels2 = item.emailAddresses;
            item.emailList = item.emailAddresses;
          }
          if (item.emailSent && item.emailSent.indexOf(",") > -1) {
            var emailSentArray = item.emailSent.split(",");
            item.emailSentList = emailSentArray;
          } else {
            item.emailSentList = item.emailSent;
          }
          if (item.smsSent && item.smsSent.indexOf(",") > -1) {
            var smsSentArray = item.smsSent.split(",");
            item.smsSentList = smsSentArray;
          } else {
            item.smsSentList = item.smsSent;
          }

          if (item.advancedFieldNames && item.advancedFieldValues) {
            const fieldOfFinalArray = [];
            const arraynames = item.advancedFieldNames.split(",");
            const arrayValues = item.advancedFieldValues.split(",");
            if (arraynames.length !== 0) {
              const arayNames = arraynames.map((obj, i) => {
                const element = obj;
                const elementValue = arrayValues[i];
                const fieldTmp = {
                  fieldName: element,
                  fieldValue: elementValue,
                };
                fieldOfFinalArray.push(fieldTmp);
              });

              item.advancedFieldArray = fieldOfFinalArray;
            } else {
              item.advancedFieldArray = [];
            }
          } else {
            item.advancedFieldArray = [];
          }
          if (item.fullNameJewish == "") {
            item.fullNameJewish = item.fullName;
          }

          if (item.tagNames) {
            item.tagNames = item.tagNames.replaceAll(":", "");
            if (item.tagNames.indexOf(",") > -1) {
              let tagNameArray = item.tagNames.split(",");
              let tagValueArray = item.tagValues.split(",");
              const resultNameArray = tagNameArray.map((obj, j) => {
                if (item.tagFormat)
                  item.tagFormat =
                    item.tagFormat +
                    '<span class="tag_' +
                    tagValueArray[j].trim() +
                    '">' +
                    obj +
                    "</span>";
                else
                  item.tagFormat =
                    '<span class="tag_' +
                    tagValueArray[j].trim() +
                    '">' +
                    obj +
                    "</span>";
              });
            } else {
              item.tagFormat =
                '<span class="tag_' +
                item.tagValues +
                '">' +
                item.tagNames +
                "</span>";
            }
          }

          return {
            ...item,
            status_class,
            advancedFieldNameAndValue: [],
          };
        });

        return {
          ...response,
          paymentTransGridModel: modelArray,
        };
      }),

      map((response: any) => {
        const modelArray = response.paymentTransGridModel.map((x) => {
          const advancedFieldNames = x.advancedFieldNames
            ? x.advancedFieldNames.split(",")
            : null;
          const advancedFieldValues = x.advancedFieldValues
            ? x.advancedFieldValues.split(",")
            : null;
          if (advancedFieldNames && advancedFieldValues) {
            let keys = advancedFieldNames;
            let values = advancedFieldValues;
            const obj = keys.reduce(
              (obj, key, index) => ({ ...obj, [key]: values[index] }),
              {}
            );
            for (const property in obj) {
              let trimKey = this.advancedFieldService.formatFieldName(property);
              x.advancedFieldNameAndValue.push({
                fieldname: trimKey,
                fieldValue: obj[property],
              });
            }
          }

          return x;
        });

        return {
          ...response,
          paymentTransGridModel: modelArray,
        };
      })
    );
  }

  PayTransaction(formdata: any): Observable<any> {
    return this.http
      .post(this.PAY_TRANSACTION_LIST_URL, formdata)
      .pipe((response) => {
        return response;
      });
  }


  GenerateLegalReceipt(formdata: any): Observable<any> {
    return this.http
      .post(this.GENERATE_LEGAL_RECEIPT_URL, formdata)
      .pipe((response) => {
        return response;
      });
  }

  BulkGenerateLegalReceipt(formdata: any): Observable<any> {
    return this.http
      .post(this.BULK_GENERATE_LEGAL_RECEIPT_URL, formdata)
      .pipe((response) => {
        return response;
      });
  }
  getTransactionsReport(formdata: any): Observable<any> {
    return this.http
      .post(this.TRANSACTION_REPORT_LIST_URL, formdata)
      .pipe((response) => {
        return response;
      });
  }

  getPaymentTotal(formdata: any): Observable<any> {
    return this.http
      .post(this.PAYMENT_TOTAL_LIST_URL, formdata)
      .pipe((response) => {
        return response;
      });
  }

  getTransactionData(formdata: any): Observable<any> {
    return this.http.post(this.PAYMENT_TRANSACTION_URL, formdata).pipe(
      map((response: any) => {
        if (!response) {
          return {
            paymentTransGridModel: [],
          };
        }

        if (response && !response.paymentTransGridModel) {
          return {
            ...response,
            paymentTransGridModel: [],
          };
        }
        return response;
      }),

      map((response: any) => {
        const modelArray = response.paymentTransGridModel.map((item) => {
          const status_class = this.getStatusClass(item.paymentStatus);

          item.isPaymentActionsVisible = false;
          if (item.phoneNumbers && item.phoneNumbers.indexOf(",") > -1) {
            var phoneNoArray = item.phoneNumbers.split(",");
            item.phoneNumberList = phoneNoArray;
            phoneNoArray = phoneNoArray.slice(0, 2);

            const phoneArray = phoneNoArray.map((obj) => {
              if (item.phoneNo2)
                item.phoneNo2 =
                  item.phoneNo2 +
                  "<br>" +
                  this.commonMethodService.formatPhoneNumber(obj);
              else
                item.phoneNo2 = this.commonMethodService.formatPhoneNumber(obj);
              return obj;
            });
            phoneNoArray = phoneArray;
          } else {
            item.phoneNo2 = this.commonMethodService.formatPhoneNumber(
              item.phoneNumbers
            );
            item.phoneNumberList = item.phoneNumbers;
          }

          if (item.emailAddresses && item.emailAddresses.indexOf(",") > -1) {
            var emailArray = item.emailAddresses.split(",");
            item.emailList = emailArray;
            emailArray = emailArray.slice(0, 2);
            const emailAray = emailArray.map((obj) => {
              if (item.emailLabels2)
                item.emailLabels2 = item.emailLabels2 + "<br>" + obj;
              else item.emailLabels2 = obj;

              return obj;
            });
            emailArray = emailAray;
          } else {
            item.emailLabels2 = item.emailAddresses;
            item.emailList = item.emailAddresses;
          }
          if (item.emailSent && item.emailSent.indexOf(",") > -1) {
            var emailSentArray = item.emailSent.split(",");
            item.emailSentList = emailSentArray;
          } else {
            item.emailSentList = item.emailSent;
          }
          if (item.smsSent && item.smsSent.indexOf(",") > -1) {
            var smsSentArray = item.smsSent.split(",");
            item.smsSentList = smsSentArray;
          } else {
            item.smsSentList = item.smsSent;
          }

          if (item.advancedFieldNames && item.advancedFieldValues) {
            const fieldOfFinalArray = [];
            const arraynames = item.advancedFieldNames.split(",");
            const arrayValues = item.advancedFieldValues.split(",");
            if (arraynames.length !== 0) {
              const arayNames = arraynames.map((obj, i) => {
                const element = obj;
                const elementValue = arrayValues[i];
                const fieldTmp = {
                  fieldName: element,
                  fieldValue: elementValue,
                };
                fieldOfFinalArray.push(fieldTmp);
              });

              item.advancedFieldArray = fieldOfFinalArray;
            } else {
              item.advancedFieldArray = [];
            }
          } else {
            item.advancedFieldArray = [];
          }
          if (item.fullNameJewish == "") {
            item.fullNameJewish = item.fullName;
          }

          if (item.tagNames) {
            item.tagNames = item.tagNames.replaceAll(":", "");
            if (item.tagNames.indexOf(",") > -1) {
              let tagNameArray = item.tagNames.split(",");
              let tagValueArray = item.tagValues.split(",");
              const resultNameArray = tagNameArray.map((obj, j) => {
                if (item.tagFormat)
                  item.tagFormat =
                    item.tagFormat +
                    '<span class="tag_' +
                    tagValueArray[j].trim() +
                    '">' +
                    obj +
                    "</span>";
                else
                  item.tagFormat =
                    '<span class="tag_' +
                    tagValueArray[j].trim() +
                    '">' +
                    obj +
                    "</span>";
              });
            } else {
              item.tagFormat =
                '<span class="tag_' +
                item.tagValues +
                '">' +
                item.tagNames +
                "</span>";
            }
          }

          return {
            ...item,
            status_class,
            advancedFieldNameAndValue: [],
          };
        });

        return {
          ...response,
          paymentTransGridModel: modelArray,
        };
      }),

      map((response: any) => {
        const modelArray = response.paymentTransGridModel.map((x) => {
          const advancedFieldNames = x.advancedFieldNames
            ? x.advancedFieldNames.split(",")
            : null;
          const advancedFieldValues = x.advancedFieldValues
            ? x.advancedFieldValues.split(",")
            : null;
          if (advancedFieldNames && advancedFieldValues) {
            let keys = advancedFieldNames;
            let values = advancedFieldValues;
            const obj = keys.reduce(
              (obj, key, index) => ({ ...obj, [key]: values[index] }),
              {}
            );
            for (const property in obj) {
              let trimKey = this.advancedFieldService.formatFieldName(property);
              x.advancedFieldNameAndValue.push({
                fieldname: trimKey,
                fieldValue: obj[property],
              });
            }
          }

          return x;
        });

        return {
          ...response,
          paymentTransGridModel: modelArray,
        };
      })
    );
  }
}
