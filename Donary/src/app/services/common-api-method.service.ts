import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
export interface GetCurrenciesObj{
    currencyId: number | null;
    currencyName: string| null;
  }
  export interface SaveLabelApiPayload{
    eventGuId: any;
    labelName: any;
    labelType: string;
    createdBy: any;
    labelID ?:any
  }
@Injectable({
    providedIn: 'root'
})

export class CommonAPIMethodService {

    private version = 'v1/';
    private version_2 = 'v2/';
    private COMMON_METHOD_MAIN_URL = 'common';
    private CAMPAIGN_URL='campaign';
    private LABEL_URL='label';

    private DOWNLOAD_SAMPLE_FILE_URL = `${this.version}${this.COMMON_METHOD_MAIN_URL}/downloadSampleFile`;
    private GET_DONORS_URL = `${this.version}${this.COMMON_METHOD_MAIN_URL}/donors`;
    private GET_PAYMENTTYPES_URL = `${this.version_2}${this.COMMON_METHOD_MAIN_URL}/paymentTypes`;
    private GET_PAYMENTREASONS_URL = `${this.version}${this.COMMON_METHOD_MAIN_URL}/paymentReasons`;
    private GET_CAMPAIGNS_URL = `${this.version}${this.CAMPAIGN_URL}/GetCampaigns`;
    private GET_PAYMENTLOCATIONS_URL = `${this.version}${this.COMMON_METHOD_MAIN_URL}/paymentLocations`;
    private GET_PAYMENTSTATUS_URL = `${this.version}${this.COMMON_METHOD_MAIN_URL}/paymentStatuses`;
    private GET_PLEDGESTATUS_URL = `${this.version}${this.COMMON_METHOD_MAIN_URL}/pledgeStatuses`;
    private GET_SCHEDULESTATUS_URL = `${this.version}${this.COMMON_METHOD_MAIN_URL}/scheduleStatuses`;
    private GET_PAYMENTCOLLECTORS_URL = `${this.version}${this.COMMON_METHOD_MAIN_URL}/paymentCollectors`;
    private GET_PAYMENTDEVICES_URL = `${this.version}${this.COMMON_METHOD_MAIN_URL}/paymentDevices`;
    private GET_PAYMENTAPPROVALS_URL = `${this.version}${this.COMMON_METHOD_MAIN_URL}/paymentApprovals`;
    private GET_SCHEDULEREPEATTYPES_URL = `${this.version}${this.COMMON_METHOD_MAIN_URL}/scheduleRepeatTypes`;
    private GET_DEVICETYPES_URL = `${this.version}${this.COMMON_METHOD_MAIN_URL}/deviceTypes`;
    private GET_ORDERDEVICESTATUSES_URL = `${this.version}${this.COMMON_METHOD_MAIN_URL}/orderDeviceStatuses`;
    private GET_LOCATIONTYPES_URL = `${this.version}${this.COMMON_METHOD_MAIN_URL}/locationTypes`;
    private GET_STATES_URL = `${this.version}${this.COMMON_METHOD_MAIN_URL}/getStates`;
    private GET_PLANTYPES_URL = `${this.version}${this.COMMON_METHOD_MAIN_URL}/planTypes`;
    private GET_API_GATEWAYS_URL = `${this.version}${this.COMMON_METHOD_MAIN_URL}/APIGateways`;
    private GET_API_GetPledgeAliyaNames_URL = `${this.version}${this.COMMON_METHOD_MAIN_URL}/GetPledgeAliyaNames`;
    private GET_API_GetPledgeAliyaTypes_URL = `${this.version}${this.COMMON_METHOD_MAIN_URL}/GetPledgeAliyaTypes`;
    private GET_SHULKIOSTYPES_URL = `${this.version}${this.COMMON_METHOD_MAIN_URL}/GetShulKioskTypes`;
    private GET_CURRENCIES_URL = `${this.version}${this.COMMON_METHOD_MAIN_URL}/GetCurrencies`;
    private GET_GATEWAY_API_TYPE_URL = `${this.version}${this.COMMON_METHOD_MAIN_URL}/GetGatewayAPITypes`;
    private LABEL_API_TYPE_URL = `${this.version}${this.LABEL_URL}/GetAll`;
    private SAVE_LABEL_API_TYPE_URL = `${this.version}${this.LABEL_URL}/Save`;
    private GET_MESSAGE_VARIABLES_URL = `${this.version}${this.COMMON_METHOD_MAIN_URL}/GetMessageVariables`;
    private GET_PAYMENTREASONS_URL_V2 = `${this.version_2}${this.COMMON_METHOD_MAIN_URL}/paymentReasons`;
    private GET_PAYMENTCOLLECTORS_URL_V2 = `${this.version_2}${this.COMMON_METHOD_MAIN_URL}/paymentCollectors`;
    private GET_COUNTRY_CODES =`${this.version}${this.COMMON_METHOD_MAIN_URL}/GetCountryCodes`

    constructor(private http: HttpClient) { }

    downloadSampleFile(entityType: number): Observable<any> {
        return this.http.get(this.DOWNLOAD_SAMPLE_FILE_URL + '?entityType=' + entityType, { responseType: 'arraybuffer' }).pipe(response => {
            return response;
        });
    }

    getDonors(eventGuid: string, searchText: string="",accountId:number=0,isAlwaysReturnPhoneAndEmail=false,isSearchGlobalList=false) {
        return this.http.get(this.GET_DONORS_URL + '?eventGuId=' + eventGuid + "&&searchText=" + searchText + "&&accountId=" + accountId + "&&isAlwaysReturnPhoneAndEmail=" + isAlwaysReturnPhoneAndEmail+ "&&isSearchGlobalList="+isSearchGlobalList).pipe(response => {
            return response;
        });
    }
    getPaymentTypes(eventGuid: string) {
        return this.http.get(this.GET_PAYMENTTYPES_URL + '?eventGuId=' + eventGuid).pipe(response => {
            return response;
        });
    }

    getPlanTypes(eventGuid: string) {
        return this.http.get(this.GET_PLANTYPES_URL + '?eventGuId=' + eventGuid).pipe(response => {
            return response;
        });
    }

    getPaymentReasons(eventGuid: string) {
        return this.http.get(this.GET_PAYMENTREASONS_URL + '?eventGuId=' + eventGuid).pipe(response => {
            return response;
        });
    }

    getCampaigns(orgId: string, userId: string, isGlobal: string, eventGuid: string) {
        return this.http.get(this.GET_CAMPAIGNS_URL + '?orgId=' + orgId + '&&userId=' + userId + '&&isGlobal=' + isGlobal + '&&eventGuid=' + eventGuid+'&&inActive=true')
            .pipe(response => {
                return response;
            });
    }

    getPaymentStatus(eventGuid:string){
        return this.http.get(this.GET_PAYMENTSTATUS_URL + '?eventGuid=' + eventGuid).pipe(response => {
            return response;
        });
    }

    getLocationType(eventGuid:string,macAddress:string){
        return this.http.get(this.GET_LOCATIONTYPES_URL  + '?eventGuid=' + eventGuid +'&&macAddress='+macAddress).pipe(response => {
            return response;
        });
    }
    getCountryCodes(eventGuid: string) {
        return this.http.get(this.GET_COUNTRY_CODES + '?eventGuId=' + eventGuid).pipe(response => {
            return response;
        });
    }

    getPledgeStatus(eventGuid:string){
        return this.http.get(this.GET_PLEDGESTATUS_URL + '?eventGuid=' + eventGuid).pipe(response => {
            return response;
        });
    }

    getScheduleStatus(eventGuid:string){
        return this.http.get(this.GET_SCHEDULESTATUS_URL + '?eventGuid=' + eventGuid).pipe(response => {
            return response;
        });
    }

    getPaymentLocations(eventGuid: string,searchText:string="", isGlobal: Boolean = false) {
        return this.http.get(this.GET_PAYMENTLOCATIONS_URL + '?eventGuid=' + eventGuid + '&searchText='+ searchText+ '&isGlobal=' + isGlobal).pipe(response => {
            return response;
        });
    }

    getPaymentCollectors(eventGuid: string) {
        return this.http.get(this.GET_PAYMENTCOLLECTORS_URL + '?eventGuId=' + eventGuid).pipe(response => {
            return response;
        });
    }

    getPaymentDevices(eventGuid: string) {
        return this.http.get(this.GET_PAYMENTDEVICES_URL + '?eventGuid=' + eventGuid).pipe(response => {
            return response;
        });
    }

    getDeviceTypes(eventGuid: string) {
        return this.http.get(this.GET_DEVICETYPES_URL + '?eventGuid=' + eventGuid).pipe(response => {
            return response;
        });
    }

    getOrderDeviceStatuses(eventGuid: string) {
        return this.http.get(this.GET_ORDERDEVICESTATUSES_URL + '?eventGuid=' + eventGuid).pipe(response => {
            return response;
        });
    }

    getPaymentApprovals(eventGuid: string) {
        return this.http.get(this.GET_PAYMENTAPPROVALS_URL + '?eventGuid=' + eventGuid).pipe(response => {
            return response;
        });
    }

    getScheduleRepeatTypes() {
        return this.http.get(this.GET_SCHEDULEREPEATTYPES_URL).pipe(response => {
            return response;
        });
    }

    getStates(eventGuid?:string){
        const params = eventGuid ? {eventGuid}: {}
        return this.http.get(this.GET_STATES_URL,{
            params:{
                ...params
            }
        }).pipe(response => {
            return response;
        });
    }

    getAPIGateways() {
        return this.http.get(this.GET_API_GATEWAYS_URL).pipe(response => {
            return response;
        });
    }

    GetPledgeAliyaNames(date:string) {
        return this.http.get(this.GET_API_GetPledgeAliyaNames_URL+'?date='+date).pipe(response => {
            return response;
        });
    }

    GetPledgeAliyaTypes() {
        return this.http.get(this.GET_API_GetPledgeAliyaTypes_URL).pipe(response => {
            return response;
        });
    }
    getShulKioskTypes() {
        return this.http.get(this.GET_SHULKIOSTYPES_URL).pipe(response => {
            return response;
        });
    }
    getCurrencies(eventGuid?:string): Observable<Array<GetCurrenciesObj>> {
        const params = eventGuid ? {eventGuid}: {}
        return this.http.get<Array<GetCurrenciesObj>>(this.GET_CURRENCIES_URL,{
            params:{
                ...params
            }
        }).pipe(response => {
            return response;
        });
    }
    getGatewayApiTypes() {
        return this.http.get(this.GET_GATEWAY_API_TYPE_URL).pipe(response => {
            return response;
        });
    }

    getLabelText(eventGuid: string,typeFilter=null) {
        return this.http.get(this.LABEL_API_TYPE_URL + '?eventGuId=' + eventGuid).pipe(
            map((response:any) => {
               const result= response.map(item=>{
                return {
                    ...item,
                    isLabelNameChecked:false
                  }
               })
               if (!typeFilter) {
                return result;
              }
              return response.filter((x) => x.labelType == typeFilter);
            }),
            map((response:any)=>{
              if (!typeFilter) {
                return response;
              }
              return response.map(element => {
                return {'id':element.labelID, 'itemName':element.labelName}
              })
            })

        );
    }
    saveLabelText(formdata: any): Observable<any> {
        return this.http.post(this.SAVE_LABEL_API_TYPE_URL,formdata ).pipe(response => {
          return response;
        });
      }
      GetMessageVariables() {
        return this.http.get(this.GET_MESSAGE_VARIABLES_URL).pipe(response => {
            return response;
        });
    }
      getPaymentReasonsV2(eventGuid: string) {
        return this.http.get(this.GET_PAYMENTREASONS_URL_V2 + '?eventGuId=' + eventGuid).pipe(response => {
            return response;
        });
    }
    getPaymentCollectorsV2(eventGuid: string) {
        return this.http.get(this.GET_PAYMENTCOLLECTORS_URL_V2 + '?eventGuId=' + eventGuid).pipe(response => {
            return response;
        });
    }
}
