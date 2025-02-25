import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { PageSyncService } from "src/app/commons/pagesync.service";
declare var $: any;
@Component({
  selector: "app-location-filter-popup",
  templateUrl: "./location-filter-popup.component.html",
  styleUrls: ["./location-filter-popup.component.scss"],
  standalone: false,
})
export class LocationFilterPopupComponent implements OnInit {
  locationName: string;
  nusach: string;
  rabbi: string;
  phone: string;
  shortName: string;
  status: string;
  locationTypeId: any = [];
  isTotalPanelVisible: boolean;

  @Output() emtOutputAdvancedFilterData: EventEmitter<any> = new EventEmitter();

  @Input() set AdvancedFilterData(selectedAdvancedSearchFilter: any) {
    if (selectedAdvancedSearchFilter) {
      this.locationName = selectedAdvancedSearchFilter.locationName;
      this.nusach = selectedAdvancedSearchFilter.nusach;
      this.rabbi = selectedAdvancedSearchFilter.rabbi;
      this.phone = selectedAdvancedSearchFilter.phone;
      this.shortName = selectedAdvancedSearchFilter.shortName;
      this.status = selectedAdvancedSearchFilter.status;
      this.locationTypeId = selectedAdvancedSearchFilter.locationTypeId;
      this.commonMethodService.selectedFromCampaignList =
        selectedAdvancedSearchFilter.campaignId;
      this.commonMethodService.selectedDonors =
        selectedAdvancedSearchFilter.donorId;
      this.commonMethodService.selectedPaymentReasons =
        selectedAdvancedSearchFilter.reasonId;
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
      });
    });
    if (this.commonMethodService.localReasonList.length == 0) {
      this.commonMethodService.getReasonList();
    }
    if (this.commonMethodService.localCampaignList.length == 0) {
      this.commonMethodService.getCampaignList();
    }
    if (this.commonMethodService.localCollectorList.length == 0) {
      this.commonMethodService.getCollectorList();
    }
    if (this.commonMethodService.localDeviceTypeList.length == 0) {
      this.commonMethodService.getSourceList();
    }
  }

  contains_heb(str) {
    return /[\u0590-\u05FF]/.test(str);
  }

  searchReasons() {
    var objAdvancedSearch = {};
    if (!this.isTotalPanelVisible) {
      objAdvancedSearch = {
        isTotalPanel: false,
        locationName: this.locationName,
        nusach: this.nusach,
        rabbi: this.rabbi,
        phone: this.phone,
        shortName: this.shortName,
        typeId: this.locationTypeId,
        status: this.status,
        donorId: [],
        reasonId: [],
        campaignId: [],
        collectorId: [],
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
        sourceId:
          this.commonMethodService.selectedPaymentDeviceTypes &&
          this.commonMethodService.selectedPaymentDeviceTypes.length != 0
            ? this.commonMethodService.selectedPaymentDeviceTypes
            : [],
      };
    }
    this.pageSyncService.locationFilterData = objAdvancedSearch;
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
    this.locationName = "";
    this.nusach = "";
    this.rabbi = "";
    this.shortName = "";
    this.phone = "";
    this.status = "";
    this.locationTypeId = [];
    this.commonMethodService.selectedPaymentCollectors = [];
    this.commonMethodService.selectedPaymentReasons = [];
    this.commonMethodService.selectedFromCampaignList = [];
    this.commonMethodService.selectedDonors = [];
    this.commonMethodService.selectedPaymentDeviceTypes = [];
  }
}
