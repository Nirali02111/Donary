import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { Subject } from "rxjs";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { PageSyncService } from "src/app/commons/pagesync.service";
declare var $: any;
@Component({
  selector: "app-source-filter",
  templateUrl: "./source-filter.component.html",
  standalone: false,
  styleUrls: ["./source-filter.component.scss"],
})
export class SourceFilterComponent implements OnInit {
  @Output() emtOutputSourceFilterData: EventEmitter<any> = new EventEmitter();

  @Input() set AdvancedFilterData(selectedAdvancedSearchFilter: any) {
    if (selectedAdvancedSearchFilter) {
      if (
        selectedAdvancedSearchFilter.deviceStatusList &&
        selectedAdvancedSearchFilter.deviceStatusList.length > 0 &&
        !selectedAdvancedSearchFilter.deviceStatusList
      ) {
        this.commonMethodService.selectedOrderDeviceStatus =
          selectedAdvancedSearchFilter.orderDevicesStatusID;
      }
      this.deviceType = selectedAdvancedSearchFilter.deviceTypeId;
      this.commonMethodService.selectedOrderDeviceStatus =
        selectedAdvancedSearchFilter.orderDevicesStatusID;
      this.eventName = selectedAdvancedSearchFilter.eventName;
      this.product = selectedAdvancedSearchFilter.product;
      this.device = selectedAdvancedSearchFilter.device;
      this.activationCode = selectedAdvancedSearchFilter.activationCode;
      this.macAddress = selectedAdvancedSearchFilter.macAddress;
      this.plan = selectedAdvancedSearchFilter.plan;
      this.status = selectedAdvancedSearchFilter.status;
      this.notes = selectedAdvancedSearchFilter.notes;
      this.deviceNum = selectedAdvancedSearchFilter.deviceNum;
      this.simNum = selectedAdvancedSearchFilter.simNum;
      this.collector = selectedAdvancedSearchFilter.collector;
      this.campaign = selectedAdvancedSearchFilter.campaign;
      this.reason = selectedAdvancedSearchFilter.reason;
      this.location = selectedAdvancedSearchFilter.location;
      this.commonMethodService.selectedFromCampaignList =
        selectedAdvancedSearchFilter.campaignId;
      this.commonMethodService.selectedDonors =
        selectedAdvancedSearchFilter.donorId;
      this.commonMethodService.selectedPaymentLocations =
        selectedAdvancedSearchFilter.locationId;
      this.commonMethodService.selectedPaymentCollectors =
        selectedAdvancedSearchFilter.collectorId;
      this.commonMethodService.selectedPaymentReasons =
        selectedAdvancedSearchFilter.reasonId;
      this.deviceStatusList = selectedAdvancedSearchFilter.deviceStatusList;
    }
  }

  @Input() set isTotalPanelOpen(data: any) {
    if (data) {
      this.isTotalPanelVisible = data;
    }
  }

  deviceType = [];
  orderDeviceStatus = [];
  eventName: string;
  product: string;
  device: string;
  activationCode: string;
  macAddress: string;
  plan: string;
  status: string;
  notes: string;
  deviceNum: string;
  simNum: string;
  collector: string;
  campaign: string;
  reason: string;
  location: string;
  isTotalPanelVisible: boolean;
  deviceStatusList: [];
  deviceStatusName: "";

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
    if (this.commonMethodService.localCollectorList.length == 0) {
      this.commonMethodService.getCollectorList();
    }
    if (this.commonMethodService.localReasonList.length == 0) {
      this.commonMethodService.getReasonList();
    }
    this.bindData();
  }

  bindData() {
    this.commonMethodService.bindCommonFieldDropDowns(
      this.ngUnsubscribe,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      true,
      true,
      false,
      false,
      false,
      true
    );
  }

  contains_heb(str) {
    return /[\u0590-\u05FF]/.test(str);
  }

  ngOnDestroy() {
    // This aborts all HTTP requests.
    this.ngUnsubscribe.next();
    // This completes the subject properlly.
    this.ngUnsubscribe.complete();
  }

  searchSource() {
    var objAdvancedSearch = {};
    if (!this.isTotalPanelVisible) {
      objAdvancedSearch = {
        deviceTypeId: this.deviceType,
        orderDevicesStatusID:
          this.commonMethodService.selectedOrderDeviceStatus,
        eventName: this.eventName,
        product: this.product,
        device: this.device,
        activationCode: this.activationCode,
        macAddress: this.macAddress,
        plan: this.plan,
        status: this.status,
        notes: this.notes,
        deviceNum: this.deviceNum,
        simNum: this.simNum,
        collector: this.collector,
        campaign: this.campaign,
        reason: this.reason,
        location: this.location,
        donorId: [],
        locationId: [],
        campaignId: [],
        collectorId: [],
        reasonId: [],
      };
    } else {
      objAdvancedSearch = {
        isTotalPanel: true,
        donorId:
          this.commonMethodService.selectedDonors &&
          this.commonMethodService.selectedDonors.length != 0
            ? this.commonMethodService.selectedDonors
            : [],
        collectorId:
          this.commonMethodService.selectedPaymentCollectors &&
          this.commonMethodService.selectedPaymentCollectors.length != 0
            ? this.commonMethodService.selectedPaymentCollectors
            : [],
        reasonId:
          this.commonMethodService.selectedPaymentReasons &&
          this.commonMethodService.selectedPaymentReasons.length != 0
            ? this.commonMethodService.selectedPaymentReasons
            : [],
        campaignId:
          this.commonMethodService.selectedFromCampaignList &&
          this.commonMethodService.selectedFromCampaignList.length != 0
            ? this.commonMethodService.selectedFromCampaignList
            : [],
        locationId:
          this.commonMethodService.selectedPaymentLocations &&
          this.commonMethodService.selectedPaymentLocations.length != 0
            ? this.commonMethodService.selectedPaymentLocations
            : [],
        deviceTypeId: [],
        orderDevicesStatusID: [],
      };
    }
    this.pageSyncService.sourceFilterData = objAdvancedSearch;
    this.emtOutputSourceFilterData.emit(objAdvancedSearch);
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
    this.deviceType = [];
    this.commonMethodService.selectedOrderDeviceStatus = [];
    this.eventName = "";
    this.product = "";
    this.device = "";
    this.activationCode = "";
    this.macAddress = "";
    this.plan = "";
    this.status = "";
    this.notes = "";
    this.deviceNum = "";
    this.simNum = "";
    this.collector = "";
    this.campaign = "";
    this.collector = "";
    this.reason = "";
    this.location = "";
    this.commonMethodService.selectedPaymentCollectors = [];
    this.commonMethodService.selectedPaymentLocations = [];
    this.commonMethodService.selectedFromCampaignList = [];
    this.commonMethodService.selectedDonors = [];
    this.commonMethodService.selectedPaymentReasons = [];
  }
  removeFilter(filterName) {
    switch (filterName) {
      case "deviceType":
        this.deviceType = [];
        break;
      case "orderDeviceStatus":
        this.commonMethodService.selectedOrderDeviceStatus = [];
        break;
    }
  }
}
