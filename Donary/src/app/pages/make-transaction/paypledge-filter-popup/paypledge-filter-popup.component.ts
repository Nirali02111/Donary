import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { CommonMethodService } from "src/app/commons/common-methods.service";
declare var $: any;

@Component({
  selector: "app-paypledge-filter-popup",
  templateUrl: "./paypledge-filter-popup.component.html",
  standalone: false,
  styleUrls: ["./paypledge-filter-popup.component.scss"],
})
export class PaypledgeFilterPopupComponent implements OnInit {
  @Output() emtFilterValues: EventEmitter<any> = new EventEmitter();
  selectedReasons = [];
  selectedLocations = [];
  selectedCollectors = [];
  isloading = false;
  selectedCampaigns = [];
  @Input() set objFilterValues(data) {
    this.selectedReasons = this.commonMethodService.localReasonList.filter(
      (s) => s.id == data.reasonId
    );
    this.selectedCampaigns = this.commonMethodService.localCampaignList.filter(
      (s) => s.id == data.campaignId
    );
    this.selectedLocations = this.commonMethodService.localLocationList.filter(
      (s) => s.id == data.locationId
    );
    this.selectedCollectors =
      this.commonMethodService.localCollectorList.filter(
        (s) => s.id == data.collectorId
      );
  }
  constructor(
    public activeModal: NgbActiveModal,
    public commonMethodService: CommonMethodService
  ) {}

  ngOnInit() {
    $(document).ready(function () {
      let modalContent: any = $(".modal");
      modalContent.draggable({
        handle:
          ".modal__custom_header,.modal__custom_footer,.modal__custom_footer_inside,.modal_custom_footer",
        cursor: "grab",
        // cancel: ".name_colm,.sub_tab_wrap",
      });
    });
  }

  closePopup() {
    this.activeModal.dismiss();
  }

  clearFilter() {
    this.selectedReasons = [];
    this.selectedLocations = [];
    this.selectedCollectors = [];
    this.selectedCampaigns = [];
  }

  contains_heb(str) {
    return /[\u0590-\u05FF]/.test(str);
  }

  onDeSelectAll(filterName: any) {
    switch (filterName) {
      case "reasonList":
        this.selectedReasons = [];
        break;
      case "locationList":
        this.selectedLocations = [];
        break;
      case "collectorList":
        this.selectedCollectors = [];
        break;
      case "campaignList":
        this.selectedCampaigns = [];
        break;
    }
  }

  filterPayPledge() {
    var objFilterValues = {
      reasonId:
        this.selectedReasons.length != 0
          ? this.selectedReasons.reduce((s) => s.id).id
          : null,
      locationId:
        this.selectedLocations.length != 0
          ? this.selectedLocations.reduce((s) => s.id).id
          : null,
      collectorId:
        this.selectedCollectors.length != 0
          ? this.selectedCollectors.reduce((s) => s.id).id
          : null,
      campaignId:
        this.selectedCampaigns.length != 0
          ? this.selectedCampaigns.reduce((s) => s.id).id
          : null,
    };
    this.emtFilterValues.emit(objFilterValues);
    this.activeModal.dismiss();
  }
}
