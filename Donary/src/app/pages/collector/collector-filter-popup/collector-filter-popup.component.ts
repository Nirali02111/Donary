import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { Subject } from "rxjs";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { PageSyncService } from "src/app/commons/pagesync.service";
declare var $: any;
@Component({
  selector: "app-collector-filter-popup",
  templateUrl: "./collector-filter-popup.component.html",
  styleUrls: ["./collector-filter-popup.component.scss"],
  standalone: false,
})
export class CollectorFilterPopupComponent implements OnInit {
  @Output() emtOutputCollectorFilterData: EventEmitter<any> =
    new EventEmitter();

  @Input() set AdvancedFilterData(selectedAdvancedSearchFilter: any) {
    if (selectedAdvancedSearchFilter) {
      this.accountNo = selectedAdvancedSearchFilter.accountNo;
      this.fullNameJewish = selectedAdvancedSearchFilter.fullNameJewish;
      this.fullName = selectedAdvancedSearchFilter.fullName;
      this.address = selectedAdvancedSearchFilter.address;
      this.city = selectedAdvancedSearchFilter.city;
      this.state = selectedAdvancedSearchFilter.state;
      this.zip = selectedAdvancedSearchFilter.zip;
      this.defaultLocations = selectedAdvancedSearchFilter.defaultLocation;
      this.group = selectedAdvancedSearchFilter.group;
      this.class = selectedAdvancedSearchFilter.class;
      this.phone = selectedAdvancedSearchFilter.phone;
      this.email = selectedAdvancedSearchFilter.email;
      this.father = selectedAdvancedSearchFilter.father;
      this.fatherInLaw = selectedAdvancedSearchFilter.fatherInLaw;
      this.status = selectedAdvancedSearchFilter.status;
      this.commonMethodService.selectedFromCampaignList =
        selectedAdvancedSearchFilter.campaignId;
      this.commonMethodService.selectedDonors =
        selectedAdvancedSearchFilter.donorId;
      this.commonMethodService.selectedPaymentLocations =
        selectedAdvancedSearchFilter.locationId;
      this.commonMethodService.selectedPaymentReasons =
        selectedAdvancedSearchFilter.reasonId;
      this.commonMethodService.selectedPaymentDeviceTypes =
        selectedAdvancedSearchFilter.sourceId;
    }
  }

  @Input() set isTotalPanelOpen(data: any) {
    if (data) {
      this.isTotalPanelVisible = data;
    }
  }

  accountNo: string;
  fullNameJewish: string;
  fullName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  group: string;
  class: string;
  phone: string;
  email: string;
  father: string;
  fatherInLaw: string;
  status: string;
  defaultLocations = [];
  isTotalPanelVisible: boolean = false;
  protected ngUnsubscribe: Subject<void> = new Subject<void>();
  constructor(
    public activeModal: NgbActiveModal,
    public commonMethodService: CommonMethodService,
    public localstoragedataService: LocalstoragedataService,
    public pageSyncService: PageSyncService
  ) {}

  ngOnInit() {
    $(document).ready(function () {
      let modalContent: any = $(".modal");
      modalContent.draggable({
        handle: ".modal-body",
      });
    });
    if (this.commonMethodService.localCampaignList.length == 0) {
      this.commonMethodService.getCampaignList();
    }
    if (this.commonMethodService.localLocationList.length == 0) {
      this.commonMethodService.getLocationList();
    }
    if (this.commonMethodService.localReasonList.length == 0) {
      this.commonMethodService.getReasonList();
    }
    if (this.commonMethodService.localDeviceTypeList.length == 0) {
      this.commonMethodService.getSourceList();
    }
    this.bindData();
  }

  bindData() {
    this.commonMethodService.bindCommonFieldDropDowns(
      this.ngUnsubscribe,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      false,
      false,
      true,
      true,
      true,
      true
    );
  }

  ngOnDestroy() {
    // This aborts all HTTP requests.
    this.ngUnsubscribe.next();
    // This completes the subject properlly.
    this.ngUnsubscribe.complete();
  }

  contains_heb(str) {
    return /[\u0590-\u05FF]/.test(str);
  }

  searchCollector() {
    var objAdvancedSearch = {};
    if (!this.isTotalPanelVisible) {
      objAdvancedSearch = {
        accountNo: this.accountNo,
        fullName: this.fullName,
        fullNameJewish: this.fullNameJewish,
        address: this.address,
        city: this.city,
        state: this.state,
        zip: this.zip,
        defaultLocation: this.defaultLocations,
        group: this.group,
        class: this.class,
        phone: this.phone,
        email: this.email,
        father: this.father,
        fatherinlaw: this.fatherInLaw,
        status: this.status,
        donorId: [],
        locationId: [],
        campaignId: [],
        reasonId: [],
        sourceId: [],
      };
    } else {
      objAdvancedSearch = {
        isTotalPanel: true,
        donorId:
          this.commonMethodService.selectedDonors &&
          this.commonMethodService.selectedDonors.length != 0
            ? this.commonMethodService.selectedDonors
            : [],
        reasonId:
          this.commonMethodService.selectedPaymentReasons &&
          this.commonMethodService.selectedPaymentReasons.length != 0
            ? this.commonMethodService.selectedPaymentReasons
            : [],
        locationId:
          this.commonMethodService.selectedPaymentLocations &&
          this.commonMethodService.selectedPaymentLocations.length != 0
            ? this.commonMethodService.selectedPaymentLocations
            : [],
        campaignId:
          this.commonMethodService.selectedFromCampaignList &&
          this.commonMethodService.selectedFromCampaignList.length != 0
            ? this.commonMethodService.selectedFromCampaignList
            : [],
        sourceId:
          this.commonMethodService.selectedPaymentDeviceTypes &&
          this.commonMethodService.selectedPaymentDeviceTypes.length != 0
            ? this.commonMethodService.selectedPaymentDeviceTypes
            : [],
        defaultLocation: [],
      };
    }
    this.pageSyncService.collectorFilterData = objAdvancedSearch;
    this.emtOutputCollectorFilterData.emit(objAdvancedSearch);
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
    this.fullName = "";
    this.fullNameJewish = "";
    this.accountNo = "";
    this.address = "";
    this.city = "";
    this.state = "";
    this.zip = "";
    this.defaultLocations = [];
    this.group = "";
    this.class = "";
    this.phone = "";
    this.email = "";
    this.father = "";
    this.fatherInLaw = "";
    this.status = "";
    this.commonMethodService.selectedPaymentReasons = [];
    this.commonMethodService.selectedPaymentLocations = [];
    this.commonMethodService.selectedFromCampaignList = [];
    this.commonMethodService.selectedDonors = [];
    this.commonMethodService.selectedPaymentDeviceTypes = [];
  }
}
