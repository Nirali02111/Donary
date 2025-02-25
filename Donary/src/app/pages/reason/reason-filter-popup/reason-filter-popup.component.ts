import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonMethodService } from 'src/app/commons/common-methods.service';
import { PageSyncService } from 'src/app/commons/pagesync.service';
declare var $: any;
@Component({
  selector: 'app-reason-filter-popup',
  templateUrl: './reason-filter-popup.component.html',
  styleUrls: ['./reason-filter-popup.component.scss'],
  standalone:false,
})
export class ReasonFilterPopupComponent implements OnInit {

  reasonName:string;
  reasonNo:string;
  goalMin:number;
  goalMax:number;
  percentageMin:number;
  percentageMax:number;
  email:string;
  homePhone:string;
  cell:string;
  status:string;
  isTotalPanelVisible:boolean = false;
  greaterThanValidate:boolean=false;
  linkedCampaignName: "";
  linkedCampaignList= [];

  @Output() emtOutputAdvancedFilterData: EventEmitter<any> = new EventEmitter();

  @Input() set AdvancedFilterData(selectedAdvancedSearchFilter: any) {
    if (selectedAdvancedSearchFilter) {
      this.reasonName=selectedAdvancedSearchFilter.reasonName;
      this.reasonNo=selectedAdvancedSearchFilter.reasonNum;
      this.goalMin = selectedAdvancedSearchFilter.minGoal;
      this.goalMax=selectedAdvancedSearchFilter.maxGoal;
      this.percentageMax = selectedAdvancedSearchFilter.maxPercentage;
      this.percentageMin = selectedAdvancedSearchFilter.minPercentage;
      this.email = selectedAdvancedSearchFilter.email;
      this.homePhone = selectedAdvancedSearchFilter.homePhone;
      this.cell = selectedAdvancedSearchFilter.cell;
      this.status =   selectedAdvancedSearchFilter.status;
      this.commonMethodService.selectedFromCampaignList=selectedAdvancedSearchFilter.campaignId;
      this.commonMethodService.selectedDonors=selectedAdvancedSearchFilter.donorId;
      this.commonMethodService.selectedPaymentLocations=selectedAdvancedSearchFilter.locationId;
      this.commonMethodService.selectedPaymentCollectors=selectedAdvancedSearchFilter.collectorId;
      this.commonMethodService.selectedPaymentDeviceTypes=selectedAdvancedSearchFilter.sourceId;
      this.linkedCampaignName =selectedAdvancedSearchFilter.linkedCampaignName;

    }
  };
  @Input() set data(data: any) {
    if (data) {
      let linkedCampaign = []
      const resultData = data.map(x => {
        if (x.linkedCampaignName) {
          linkedCampaign.push({ id: x.linkedCampaignName, itemName: x.linkedCampaignName });
        }
      });
      this.linkedCampaignList = this.removeDuplicates(linkedCampaign);
    }
  }
  @Input() set isTotalPanelOpen(data:any){
    if(data)
    {
     this.isTotalPanelVisible=data;
    }
  }

  @Input() set listFilters(data:any)
  {

  }


  constructor(public activeModal: NgbActiveModal,
    public commonMethodService: CommonMethodService,
    public pageSyncService:PageSyncService) { }

  ngOnInit() {
    $(document).ready(function () {
      let modalContent: any = $('.modal');
      modalContent.draggable({
     handle: '.modal-body'
   });
    });
    if(this.commonMethodService.localCampaignList.length ==0){
      this.commonMethodService.getCampaignList()
   }
   if(this.commonMethodService.localLocationList.length ==0){
     this.commonMethodService.getLocationList()
   }
   if(this.commonMethodService.localCollectorList.length ==0){
     this.commonMethodService.getCollectorList()
   }
   if(this.commonMethodService.localDeviceTypeList.length ==0){
     this.commonMethodService.getSourceList()
   }
  }
  contains_heb(str) {
    return (/[\u0590-\u05FF]/).test(str);
  }
  searchReasons(){
    var objAdvancedSearch={}
    if(!this.isTotalPanelVisible){
    objAdvancedSearch = {
      "isTotalPanel":false,
      "reasonName" :this.reasonName,
      "reasonNum": this.reasonNo,
      "minGoal":this.goalMin,
      "maxGoal":this.goalMax,
      "minPercentage": this.percentageMin,
      "maxPercentage":this.percentageMax,
      "email": this.email,
      "homePhone": this.homePhone,
      "cell": this.cell,
      "status": this.status,
      "donorId":[],
      "locationId":[],
      "campaignId":[],
      "collectorId":[],
      "sourceId":[],
      "linkedCampaignName":this.linkedCampaignName,
    }
  }
    else{
      objAdvancedSearch={
        "isTotalPanel":true,
        "donorId":this.commonMethodService.selectedDonors &&this.commonMethodService.selectedDonors.length!=0? this.commonMethodService.selectedDonors
        : [],
        "collectorId":this.commonMethodService.selectedPaymentCollectors &&this.commonMethodService.selectedPaymentCollectors.length != 0
          ? this.commonMethodService.selectedPaymentCollectors
          : [],
       "locationId":
       this.commonMethodService.selectedPaymentLocations &&this.commonMethodService.selectedPaymentLocations.length != 0
          ? this.commonMethodService.selectedPaymentLocations
          : [],
      "campaignId":
      this.commonMethodService.selectedFromCampaignList &&this.commonMethodService.selectedFromCampaignList.length != 0
          ? this.commonMethodService.selectedFromCampaignList
          : [],
      "sourceId":
      this.commonMethodService.selectedPaymentDeviceTypes &&this.commonMethodService.selectedPaymentDeviceTypes.length != 0
            ? this.commonMethodService.selectedPaymentDeviceTypes
            : []
    }
    }
    this.pageSyncService.reasonFilterData = objAdvancedSearch;
    this.emtOutputAdvancedFilterData.emit(objAdvancedSearch);
    this.activeModal.dismiss();
  }

  closePopup() {
    this.activeModal.dismiss();
    this.resetSearchBox();
  }

  clearFilter() {
    this.resetSearchBox();
  }


  resetSearchBox() {
    this.reasonName = '';
    this.reasonNo = '';
    this.goalMin = 0;
    this.goalMax = 0;
    this.percentageMax = 0;
    this.percentageMin= 0;
    this.homePhone ='';
    this.email = '';
    this.cell = '';
    this.status = '';
    this.linkedCampaignName = '';
    this.commonMethodService.selectedPaymentCollectors=[];
    this.commonMethodService.selectedPaymentLocations=[];
    this.commonMethodService.selectedFromCampaignList=[];
    this.commonMethodService.selectedDonors=[];
    this.commonMethodService.selectedPaymentDeviceTypes=[];
}

  removeDuplicates(items) {
    const uniqueVal = items.reduce((unique, o) => {
      if (!unique.some(obj => obj.id === o.id)) {
        unique.push(o);
      }
      return unique;
    }, []);
    return uniqueVal;
  }
}
