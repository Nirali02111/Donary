import { Component, OnInit } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import * as moment from "moment";
import { CommonMethodService } from "src/app/commons/common-methods.service";

@Component({
  selector: "app-option-tab-popup",
  templateUrl: "./option-tab-popup.component.html",
  standalone: false,
  styleUrls: ["./option-tab-popup.component.scss"],
})
export class OptionTabPopupComponent implements OnInit {
  isLockCollector: boolean = JSON.parse(
    localStorage.getItem("isLockCollector")
  );
  isLockLocation: boolean = JSON.parse(localStorage.getItem("isLockLocation"));
  isLockCampaign: boolean = JSON.parse(localStorage.getItem("isLockCampaign"));
  isLockReason: boolean = JSON.parse(localStorage.getItem("isLockReason"));
  isLockDate: boolean = JSON.parse(localStorage.getItem("isLockDate"));
  isOptionList: boolean = true;
  isCollectorDropdown: boolean = false;
  isLocationDropdown: boolean = false;
  isCampaignDropdown: boolean = false;
  isReasonDropdown: boolean = false;
  isDateSelection: boolean = false;
  collectorList: any = this.commonMethodService.paymentCollectorList;
  locationList: any = this.commonMethodService.paymentLocationList;
  campaignList: any = this.commonMethodService.CampaignList;
  reasonList: any = this.commonMethodService.paymentReasonList;
  selectedCollector: string = localStorage.getItem("selectedCollector");
  selectedLocation: string = localStorage.getItem("selectedLocation");
  selectedCampaign: string = localStorage.getItem("selectedCampaign");
  selectedReason: string = localStorage.getItem("selectedReason");
  selectedDate: any = { startDate: moment(new Date()) };
  constructor(
    public commonMethodService: CommonMethodService,
    public activeModal: NgbActiveModal
  ) {}

  ngOnInit() {}
  closePopup() {
    this.activeModal.dismiss();
  }
  OpenDropdown(type) {
    this.isOptionList = false;
    this.isLocationDropdown = false;
    this.isCollectorDropdown = false;
    this.isCampaignDropdown = false;
    this.isReasonDropdown = false;
    this.isDateSelection = false;

    if (type == "optionlist") this.isOptionList = true;

    if (type == "collector") {
      this.isCollectorDropdown = true;
      this.collectorList = this.commonMethodService.paymentCollectorList;
    }

    if (type == "location") {
      this.isLocationDropdown = true;
      this.locationList = this.commonMethodService.paymentLocationList;
    }

    if (type == "campaign") {
      this.isCampaignDropdown = true;
      this.campaignList = this.commonMethodService.CampaignList;
    }

    if (type == "reason") {
      this.isReasonDropdown = true;
      this.reasonList = this.commonMethodService.paymentReasonList;
    }

    if (type == "date") this.isDateSelection = true;
  }
  SearchCollector(keyword) {
    this.collectorList = this.commonMethodService.paymentCollectorList;
    if (keyword != "") {
      var filterdRecord = this.collectorList.filter(
        (obj) =>
          obj.itemName &&
          obj.itemName.toString().toLowerCase().indexOf(keyword) > -1
      );
      this.collectorList = filterdRecord;
    }
  }
  SelectCollector(name) {
    this.selectedCollector = name;
    localStorage.setItem("selectedCollector", this.selectedCollector);
    this.isCollectorDropdown = false;
    this.isOptionList = true;
  }

  SelectLocation(name) {
    this.selectedLocation = name;
    localStorage.setItem("selectedLocation", this.selectedLocation);
    this.isLocationDropdown = false;
    this.isOptionList = true;
  }

  SearchLocation(keyword) {
    this.locationList = this.commonMethodService.paymentLocationList;
    if (keyword != "") {
      var filterdRecord = this.locationList.filter(
        (obj) =>
          obj.itemName &&
          obj.itemName.toString().toLowerCase().indexOf(keyword) > -1
      );
      this.locationList = filterdRecord;
    }
  }

  SelectCampaign(name) {
    this.selectedCampaign = name;
    localStorage.setItem("selectedCampaign", this.selectedCampaign);
    this.isCampaignDropdown = false;
    this.isOptionList = true;
  }

  SearchCampaign(keyword) {
    this.campaignList = this.commonMethodService.CampaignList;
    if (keyword != "") {
      var filterdRecord = this.campaignList.filter(
        (obj) =>
          obj.itemName &&
          obj.itemName.toString().toLowerCase().indexOf(keyword) > -1
      );
      this.campaignList = filterdRecord;
    }
  }

  SelectReason(name) {
    this.selectedReason = name;
    localStorage.setItem("selectedReason", this.selectedReason);
    this.isReasonDropdown = false;
    this.isOptionList = true;
  }

  SearchReason(keyword) {
    this.reasonList = this.commonMethodService.paymentReasonList;
    if (keyword != "") {
      var filterdRecord = this.reasonList.filter(
        (obj) =>
          obj.itemName &&
          obj.itemName.toString().toLowerCase().indexOf(keyword) > -1
      );
      this.reasonList = filterdRecord;
    }
  }
  contains_heb(str) {
    return /[\u0590-\u05FF]/.test(str);
  }

  datesUpdated(event) {
    if (event.startDate != null) {
      localStorage.setItem("selectedDate", this.selectedDate.startDate);
      this.isDateSelection = false;
      this.isOptionList = true;
    }
  }

  UnLock(value, type) {
    if (type == "collector") {
      this.isLockCollector = value;
      localStorage.setItem("isLockCollector", value);
    }

    if (type == "location") {
      this.isLockLocation = value;
      localStorage.setItem("isLockLocation", value);
    }

    if (type == "campaign") {
      this.isLockCampaign = value;
      localStorage.setItem("isLockCampaign", value);
    }

    if (type == "reason") {
      this.isLockReason = value;
      localStorage.setItem("isLockReason", value);
    }
    if (type == "date") {
      this.isLockDate = value;
      localStorage.setItem("isLockDate", value);
    }
  }
}
