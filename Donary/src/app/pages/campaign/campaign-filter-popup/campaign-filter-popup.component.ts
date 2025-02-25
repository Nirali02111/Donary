import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { PageSyncService } from "src/app/commons/pagesync.service";
declare var $: any;
@Component({
  selector: "app-campaign-filter-popup",
  templateUrl: "./campaign-filter-popup.component.html",
  styleUrls: ["./campaign-filter-popup.component.scss"],
  standalone: false,
})
export class CampaignFilterPopupComponent implements OnInit {
  campaignName: string;
  friendlyName: string;
  status: string;
  isTotalPanelVisible: boolean;

  @Output() emtOutputAdvancedFilterData: EventEmitter<any> = new EventEmitter();

  @Input() set AdvancedFilterData(selectedAdvancedSearchFilter: any) {
    if (selectedAdvancedSearchFilter) {
      this.campaignName = selectedAdvancedSearchFilter.campaignName;
      this.friendlyName = selectedAdvancedSearchFilter.friendlyName;
      this.status = selectedAdvancedSearchFilter.status;
      this.commonMethodService.selectedPaymentReasons =
        selectedAdvancedSearchFilter.reasonId;
      this.commonMethodService.selectedDonors =
        selectedAdvancedSearchFilter.donorId;
      this.commonMethodService.selectedPaymentLocations =
        selectedAdvancedSearchFilter.locationId;
      this.commonMethodService.selectedPaymentCollectors =
        selectedAdvancedSearchFilter.collectorId;
      this.commonMethodService.selectedPaymentDeviceTypes =
        selectedAdvancedSearchFilter.sourceId;
    }
  }

  @Input() set isTotalPanelOpen(data: any) {
    if (data) {
      this.isTotalPanelVisible = data;
    }
  }

  constructor(
    public activeModal: NgbActiveModal,
    public commonMethodService: CommonMethodService,
    public pageSyncService: PageSyncService
  ) {}

  ngOnInit() {
    $(document).ready(function () {
      let modalContent: any = $(".modal");
      modalContent.draggable({
        handle: ".modal-body",
        cursor: " grab",
      });
    });
    if (this.commonMethodService.localReasonList.length == 0) {
      this.commonMethodService.getReasonList();
    }
    if (this.commonMethodService.localLocationList.length == 0) {
      this.commonMethodService.getLocationList();
    }
    if (this.commonMethodService.localCollectorList.length == 0) {
      this.commonMethodService.getCollectorList();
    }
    if (this.commonMethodService.localDeviceTypeList.length == 0) {
      this.commonMethodService.getSourceList();
    }
    if (this.commonMethodService.localCampaignList.length == 0) {
      this.commonMethodService.getCampaignList();
    }
    if (this.commonMethodService.localLocationList.length == 0) {
      this.commonMethodService.getLocationList();
    }
    if (this.commonMethodService.localCollectorList.length == 0) {
      this.commonMethodService.getCollectorList();
    }
    if (this.commonMethodService.localDeviceTypeList.length == 0) {
      this.commonMethodService.getSourceList();
    }
  }

  searchReasons() {
    var objAdvancedSearch = {};
    if (!this.isTotalPanelVisible) {
      objAdvancedSearch = {
        isTotalPanel: false,
        campaignName: this.campaignName,
        friendlyName: this.friendlyName,
        status: this.status,
        donorId: [],
        locationId: [],
        collectorId: [],
        reasonId: [],
        sourceId: [],
      };
    } else {
      objAdvancedSearch = {
        isTotalPanel: true,
        donorId:
          this.commonMethodService.selectedDonors &&
          this.commonMethodService.selectedDonors.length != 0
            ? this.commonMethodService.selectedDonors.map((s) => s.id)
            : [],
        collectorId:
          this.commonMethodService.selectedPaymentCollectors &&
          this.commonMethodService.selectedPaymentCollectors.length != 0
            ? this.commonMethodService.selectedPaymentCollectors
            : [],
        locationId:
          this.commonMethodService.selectedPaymentLocations &&
          this.commonMethodService.selectedPaymentLocations.length != 0
            ? this.commonMethodService.selectedPaymentLocations
            : [],
        reasonId:
          this.commonMethodService.selectedPaymentReasons &&
          this.commonMethodService.selectedPaymentReasons.length != 0
            ? this.commonMethodService.selectedPaymentReasons
            : [],
        sourceId:
          this.commonMethodService.selectedPaymentDeviceTypes &&
          this.commonMethodService.selectedPaymentDeviceTypes.length != 0
            ? this.commonMethodService.selectedPaymentDeviceTypes
            : [],
      };
    }
    this.pageSyncService.campaignFilterData = objAdvancedSearch;
    this.emtOutputAdvancedFilterData.emit(objAdvancedSearch);
    this.activeModal.dismiss();
  }

  closePopup() {
    this.activeModal.dismiss();
    this.resetSearchBox();
  }

  resetSearchBox() {
    this.campaignName = "";
    this.friendlyName = "";
    this.status = "";
    this.commonMethodService.selectedPaymentCollectors = [];
    this.commonMethodService.selectedPaymentLocations = [];
    this.commonMethodService.selectedPaymentReasons = [];
    this.commonMethodService.selectedDonors = [];
    this.commonMethodService.selectedPaymentDeviceTypes = [];
  }
}
