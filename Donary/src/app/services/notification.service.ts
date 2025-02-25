import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
export interface alertRuleResponseObj{
  ruleId: number|null,
  title: string |null,
  assigneeName: string |null,
  receipents: string|null
}

export interface AlertRuleObj{
  eventGuid : string | null
}
export interface editAlertRuleObj{
  ruleId:number|null,
  eventGuid : string | null
}
export interface DeleteAlertObj{
  "ruleId": number|null,
  "eventGuid":string
}
export interface saveRuleObj{
  "eventGuid": string|null,
  "trigger": number|null,
  "note": string|null,
  "conditions": Array<conditionObj>,
  "ruleId": number|null,
  "title": string|null,
  "assigneeName": string|null,
  "receipents": string|null
}
export interface conditionObj {
  "campaignId": number|null,
  "reasonId": number|null,
  "collectorId": number|null,
  "sourceId":number|null,
  "locationId": number|null,
  "minAmount":number|null,
  "maxAmount": number|null,
}
export interface editAlertRuleResponseObj{
  "trigger": number|null,
  "note": string|null,
  "conditions":Array<editConditionObj>
  "ruleId": number|null,
  "title": string|null,
  "assigneeName": string|null,
  "assigneeID": number | null,
  "receipents": string|null
}
export interface   editConditionObj{
  "campaignId": number|null,
  "reasonId": number|null,
  "collectorId": number|null,
  "sourceId": number|null,
  "locationId": number|null,
  "minAmount": number|null,
  "maxAmount": number|null
}
@Injectable({
  providedIn: 'root'
})


export class NotificationService {

  version = 'v1/';
  MAIN_URL = 'Notification';
  MAIN_COMMON_URL = 'common';
  NOTIFICATION_GET_LIST_URL = `${this.version}${this.MAIN_URL}/GetNotifications`;
  NOTIFICATION_SAVE_DATA_URL = `${this.version}${this.MAIN_URL}/SaveNotification`;
  NOTIFICATION_GETBY_ID_URL = `${this.version}${this.MAIN_URL}/GetNotification`;
  NOTIFICATION_ALERT_URL = `${this.version}${this.MAIN_URL}/GetAlerts`;
  NOTIFICATION_GET_NOTIFICATION_TYPE_URL = `${this.version}${this.MAIN_COMMON_URL}/GetNotificationType`;
  NOTIFICATION_GET_NOTIFICATION_CATEGORY_URL = `${this.version}${this.MAIN_COMMON_URL}/GetNotificationCategory`;
  NOTIFICATION_GET_NOTIFICATION_STATUS_URL = `${this.version}${this.MAIN_COMMON_URL}/GetNotificationStatus`;
  NOTIFICATION_GET_NOTIFICATION_TRANSACTIONS_DONOR_URL = `${this.version}${this.MAIN_URL}/GetDonorAllTransactions`;
  NOTIFICATION_SAVE_COMMENT_URL = `${this.version}${this.MAIN_URL}/SaveComment`;
  NOTIFICATION_GET_ALERT_RULES = `${this.version}${this.MAIN_URL}/GetAlertRules`;
  NOTIFICATION_DELETE_ALERT_RULE = `${this.version}${this.MAIN_URL}/DeleteAlertRule`;
  NOTIFICATION_SAVE_ALERT_RULE = `${this.version}${this.MAIN_URL}/SaveAlertRule`;
  NOTIFICATION_GET_ALERT_RULE = `${this.version}${this.MAIN_URL}/GetAlertRule`;
  alert$: BehaviorSubject<number> = new BehaviorSubject(0)
  constructor(private http: HttpClient) { }

  // getNotificationList(eventGuid: string,): Observable<any> {
  //   return this.http.get(this.NOTIFICATION_GET_LIST_URL + '?eventGuid=' + eventGuid).pipe(response => {
  //     return response;
  //   });
  // }
  getNotificationList(eventGuid: string,fromDate:string,toDate:string,count:string): Observable<any> {
    return this.http.get(this.NOTIFICATION_GET_LIST_URL, {
      params: { eventGuid,fromDate,toDate, count},
    }).pipe(response => {
      return response;
    });
  }

  saveNotification(formdata: any): Observable<any> {
    return this.http.post(this.NOTIFICATION_SAVE_DATA_URL, formdata).pipe(response => {
      return response;
    });
  }

  getNotificationById(notificationId: number, eventGuid: string): Observable<any> {
    return this.http.get(this.NOTIFICATION_GETBY_ID_URL + '?notificationId=' + notificationId + '&&eventGuid=' + eventGuid).pipe(response => {
      return response;
    });
  }

  getNotificationType(): Observable<any> {
    return this.http.get(this.NOTIFICATION_GET_NOTIFICATION_TYPE_URL).pipe(response => {
      return response;
    });
  }

  GetNotificationCategory(): Observable<any> {
    return this.http.get(this.NOTIFICATION_GET_NOTIFICATION_CATEGORY_URL).pipe(response => {
      return response;
    });
  }

  GetNotificationStatus(): Observable<any> {
    return this.http.get(this.NOTIFICATION_GET_NOTIFICATION_CATEGORY_URL).pipe(response => {
      return response;
    });
  }


  getNotificationTransactionsDonors(eventGuid: string,accountId: any): Observable<any> {
    return this.http.get(this.NOTIFICATION_GET_NOTIFICATION_TRANSACTIONS_DONOR_URL + '?eventGuid=' + eventGuid+ '&accountId=' + accountId).pipe(response => {
      return response;
    });
  }

  saveComment(formdata: any): Observable<any> {
    return this.http.post(this.NOTIFICATION_SAVE_COMMENT_URL, formdata).pipe(response => {
      return response;
    });
  }

  getAlert(formdata: any): Observable<any> {
    return this.http.post(this.NOTIFICATION_ALERT_URL, formdata).pipe(response => {
      return response;
    });
  }
 
  getAlertRules(formdata:AlertRuleObj): Observable<Array<alertRuleResponseObj>> {
    return this.http
      .post<Array<alertRuleResponseObj>>(this.NOTIFICATION_GET_ALERT_RULES, formdata)
      .pipe((response) => {
        return response;
      });
  }
  getAlertRule(formdata:editAlertRuleObj): Observable<Array<editAlertRuleResponseObj>> {
    return this.http
      .post<Array<editAlertRuleResponseObj>>(this.NOTIFICATION_GET_ALERT_RULE, formdata)
      .pipe((response) => {
        return response;
      });
  }
  deleteAlertRule(formdata:DeleteAlertObj): Observable<string> {
    return this.http.delete<string>(this.NOTIFICATION_DELETE_ALERT_RULE,{body:formdata}
    )}
  saveAlertRule(formdata:saveRuleObj): Observable<string> {
    return this.http
    .post<string>(this.NOTIFICATION_SAVE_ALERT_RULE, formdata)
    .pipe((response) => {
     return response;
     });
    }




}
