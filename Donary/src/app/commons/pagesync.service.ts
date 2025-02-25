import { Injectable } from '@angular/core';
import { CampaignListResponseData } from '../models/campaign-model';
import { CommonMethodService } from './common-methods.service';
import * as moment_tz from 'moment-timezone';
@Injectable({
    providedIn: 'root'
})

export class PageSyncService {

  paymentTransList:any;
  paymentFilterData:any;
  paymentFieldsCol:Array<any> =[];
  aliyosFieldsCol:Array<any> = []; 
  pledgeTransList:any;
  schedulePaymentTransList:any;
  schedulePledgeTransList:any;
  donorList:any;
  reasonList:any;
 campaignList:CampaignListResponseData;
 totalPanelcampaignList:CampaignListResponseData;
 locationList:any;
 collectorList:any;
 sourceList:any;
 seatLayout:Array<any> =[];
 seatList:Array<any> =[];
 labelList:Array<any> =[];
 tagList:Array<any> =[];
 advancedFieldList:Array<any> =[];
 seasonsList:Array<any> =[];
 seatLocationList:Array<any> =[];
 isPledgeTabClicked:boolean = false;
 isScheduleTabClicked:boolean = false;
 isPaymentTabClicked:boolean = false;
 isListClicked:boolean = false;
 isDonorListClicked:boolean = false;
 isReasonListClicked:boolean = false;
 isCampaignListClicked:boolean = false;
 isLocationListClicked:boolean = false;
 isCollectorListClicked:boolean = false;
 isSourceListClicked:boolean = false;
 isSeatsListClicked:boolean = false;
 lastSyncPaymentTime:any;
 syncTimeDifference:any;
 lastSyncPledgeTime:any;
 lastSyncScheduleTime:any;
 lastSyncListTime:any;
 paymentFlag:boolean = true;
 pledgeFlag:boolean = true;
 scheduleFlag:boolean = true;
 listFlag:boolean = true;
 donorlistTotalPanel:boolean;
 campaignlistTotalPanel:boolean;
 reasonlistTotalPanel:boolean;
 locationlistTotalPanel:boolean;
 collectorlistTotalPanel:boolean;
 sourcelistTotalPanel:boolean;
 SoucetotalPanel:any;
 DonortotalPanel:any;
 ReasontotalPanel:any;
 CampaigntotalPanel:any;
 LocationtotalPanel:any;
 CollectortotalPanel:any;
  pageClicked: boolean = false;
  schedulepaymentFieldsCol: Array<any> =[];
  pledgeFieldsCol: Array<any> =[];
  schedulepledgeFieldsCol: Array<any> =[];
  donorFieldsCol: Array<any> =[];
  reasonFieldsCol: Array<any> =[];
  campaignFieldsCol: Array<any> =[];
  locationFieldsCol: Array<any> =[];
  collectorFieldsCol: Array<any> =[];
  sourceFieldsCol: Array<any> =[];
  seatsFieldsCol: Array<any> =[];
  pledgeFilterData: any;
  donorFilterData: any;
  sumbyDonor: any;
  reasonFilterData: any;
  sumbyReason: any;
  campaignFilterData: {};
  sumbyCampaign: any;
  campaignFilterDataTotalPanel: {};
  locationFilterData: {};
  sumbyLocation: any;
  sumbyCollector: any;
  collectorFilterData: {};
  sourceFilterData: {};
  sumbySource: any;
  seatsFilterData: {};
  sumbyPayment: any;
  sumbyPledge: any;
  sumbySchedulePayment: any;
  sumbySchedulePledge: any;
  schedulepaymentFilterData: any;
  advancedDonorFields: any;
  paymentCalDate: any;
  pledgeCalDate: any;
  schedulepaymentCalDate: any;
  schedulepledgeCalDate: any;
  DonorCalDate: any;
  DonorEngCalPlaceholder: string = "";
  ReasonCalDate: any;
  ReasonEngCalPlaceholder: string = "";
  CampaignCalDate: any;
  CampaignEngCalPlaceholder: string;
  LocationEngCalPlaceholder: string;
  LocationCalDate: any;
  CollectorCalDate: any;
  CollectorEngCalPlaceholder: string;
  SourceCalDate: any;
  SourceEngCalPlaceholder: string;
  PaymentEngCalPlaceholder: any;
  pledgeEngCalPlaceholder: any;
  schedulepledgeEngCalPlaceholder: any;
  schedulepaymentEngCalPlaceholder: any;
  seatSelectedLocation:any;
  seatSelectedSeason: any;
  seatListData: any;
  sections:Array<any>
  uiPageSettings: any = {};
  constructor(public commonMethodService: CommonMethodService,) { 
   }

  calculateTimeDifference(type)
  {
    if(type){
      if(type == "payment"){
       this.syncTimeDifference = this.lastSyncPaymentTime
      }
      if(type == "pledge"){
       this.syncTimeDifference = this.lastSyncPledgeTime
      }
      if(type =="schedule"){
       this.syncTimeDifference = this.lastSyncScheduleTime
      }
      if(type =="list"){
        this.syncTimeDifference = this.lastSyncListTime
       }
    if(this.syncTimeDifference){
      // // Check if the date and time differences are more than 1 hour
      const timezone = this.commonMethodService.getTimeZoneFromLoginCurrency();
      const momentDate = moment_tz().tz(timezone); // Get the current date in the specified timezone
      const currentTime = momentDate.format("MM/DD/YY hh:mm a");

      const dateDifference = moment_tz(currentTime, "MM/DD/YY hh:mm a").diff(moment_tz(this.syncTimeDifference, "MM/DD/YY hh:mm a"), 'days');
      const timeDifference = moment_tz(currentTime, "MM/DD/YY hh:mm a").diff(moment_tz(this.syncTimeDifference, "MM/DD/YY hh:mm a"), 'hours');
      if (dateDifference > 0 || (dateDifference === 0 && timeDifference >= 1)) {
       // If date or time difference is more than 1 hour, set flagValue to false
       this.paymentFlag=type=="payment"? false:true;
       this.pledgeFlag=type=="pledge"? false:true;
       this.scheduleFlag=type=="schedule"? false:true;
       this.listFlag=type=="list"? false:true;
      }
    }
  }


  }
}
