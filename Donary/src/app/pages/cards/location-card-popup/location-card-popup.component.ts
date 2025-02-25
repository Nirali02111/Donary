import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  ViewChild,
} from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";

import {
  NgbActiveModal,
  NgbModal,
  NgbModalOptions,
  NgbPopover,
} from "@ng-bootstrap/ng-bootstrap";
import * as moment from "moment";
import { DaterangepickerDirective } from "ngx-daterangepicker-material";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { CardService } from "src/app/services/card.service";
import { LocationService } from "src/app/services/location.sevice";
import { ScheduleService } from "src/app/services/schedule.service";
import { LocationFilterPopupComponent } from "../../location/location-filter-popup/location-filter-popup.component";
import { SaveLocationPopupComponent } from "../../location/save-location-popup/save-location-popup.component";
import { PaymentlistCardPopupComponent } from "../paymentlist-card-popup/paymentlist-card-popup.component";
import { PledgelistCardPopupComponent } from "../pledgelist-card-popup/pledgelist-card-popup.component";
import { SchedulelistCardPopupComponent } from "../schedulelist-card-popup/schedulelist-card-popup.component";
import { environment } from "./../../../../environments/environment";
import { UIPageSettingService } from "src/app/services/uipagesetting.service";
import Swal from "sweetalert2";
import { HebrewEngishCalendarService } from "src/app/services/hebrew-engish-calendar.service";
import { Subscription } from "rxjs";

declare var $: any;
@Component({
  selector: "app-location-card-popup",
  templateUrl: "./location-card-popup.component.html",
  standalone: false,
  styleUrls: ["./location-card-popup.component.scss"],
})
export class LocationCardPopupComponent implements OnInit {
  @ViewChild(DaterangepickerDirective, { static: false })
  pickerDirective: DaterangepickerDirective;
  @ViewChild(NgbPopover, { static: false }) popContent: NgbPopover;
  @Input() LocationId: any;
  @Input("selectedDateRange") selectedDateRange?: any;
  modalOptions: NgbModalOptions;
  isloading: boolean = true;
  objAdvancedSearch: any;
  filtercount = 0;
  popTitle: any;
  startDate: any = null;
  endDate: any = null;
  address: string;
  skeletonitems: any = [{}];
  city: string;
  country: string;
  locationId: number;
  isGlobal: boolean;
  locationJewishName: string;
  locationName: string;
  locationNameShort: string;
  state: string;
  zip: string;
  payments: number;
  openPledges: number;
  scheduled: number;
  raised: number;
  cityStateZip: string;
  isDevEnv: boolean;
  iFrameUrl: any;
  isMapShow: Boolean = false;
  PageName: any = "LocationCard";
  isOneDate: any = false;
  isinitialize: number = 0;
  newLocationPermission: boolean = false;
  uiPageSettingId = null;
  uiPageSetting: any;

  EngHebCalPlaceholder: string = "All Time";
  class_id: string;
  class_hid: string;

  allowPaymentListCard: boolean = true;
  allowPledgeListCard: boolean = true;
  allowScheduleListCard: boolean = true;
  private calendarSubscription: Subscription;

  constructor(
    public activeModal: NgbActiveModal,
    public commonMethodService: CommonMethodService,
    private cardService: CardService,
    private scheduleService: ScheduleService,
    private locationService: LocationService,
    private localstoragedataService: LocalstoragedataService,
    private uiPageSettingService: UIPageSettingService,
    public sanitizer: DomSanitizer,
    public hebrewEngishCalendarService: HebrewEngishCalendarService,
    public ngbModal: NgbModal,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) {}

  @Input() set LocationCardData(LocationCardValue: any) {
    if (LocationCardValue) {
      this.locationId = LocationCardValue.locationId;
      let objLayout = {
        uiPageSettingId: this.uiPageSettingId,
        userId: this.localstoragedataService.getLoginUserId(),
        moduleName: "lists",
        screenName: "locationcard",
      };
      this.uiPageSettingService.Get(objLayout).subscribe((res: any) => {
        if (res) {
          this.uiPageSettingId = res.uiPageSettingId;
          this.uiPageSetting = JSON.parse(res.setting);
          this.setValue(LocationCardValue);
          if (this.uiPageSetting.locationCardFilteritem) {
            this.objAdvancedSearch = this.uiPageSetting.locationCardFilteritem;
            if (
              !this.uiPageSetting.locationCardStartDate &&
              !this.uiPageSetting.locationCardEndDate
            ) {
              this.selectedDateRange = undefined;
            } else {
              this.selectedDateRange = {
                startDate: moment(this.uiPageSetting.locationCardStartDate),
                endDate: moment(this.uiPageSetting.locationCardEndDate),
              };
            }
            this.searchLocationCardData();
          }
        } else {
          this.setValue(LocationCardValue);
        }
      });
    }
  }

  @Input() set objAdvanceSearch(advanceSearch: any) {
    if (advanceSearch) {
      this.objAdvancedSearch = advanceSearch;
      this.filtercount = 0;
      for (let key of Object.keys(this.objAdvancedSearch)) {
        let filtervalue = this.objAdvancedSearch[key];
        if (
          filtervalue == undefined ||
          filtervalue.length == 0 ||
          filtervalue == true ||
          filtervalue == false
        ) {
        } else {
          this.filtercount += 1;
        }
      }
    }
  }

  ngOnInit() {
    this.ngbModal.activeInstances.subscribe((i) => {
      if (i.length !== 0) {
        const havePaymentCard = i.filter((o) => {
          return o.componentInstance instanceof PaymentlistCardPopupComponent;
        });
        const havePledgeCard = i.filter((o) => {
          return o.componentInstance instanceof PledgelistCardPopupComponent;
        });
        const haveScheduleCard = i.filter((o) => {
          return o.componentInstance instanceof SchedulelistCardPopupComponent;
        });

        if (havePaymentCard.length !== 0) {
          this.allowPaymentListCard = false;
        } else {
          this.allowPaymentListCard = true;
        }
        if (havePledgeCard.length !== 0) {
          this.allowPledgeListCard = false;
        } else {
          this.allowPledgeListCard = true;
        }
        if (haveScheduleCard.length !== 0) {
          this.allowScheduleListCard = false;
        } else {
          this.allowScheduleListCard = true;
        }
      }
    });
    this.isDevEnv = environment.baseUrl.includes("https://dev-api.donary.com/");
    $(document).ready(function () {
      let modalContent: any = $(".modal");
      modalContent.draggable({
        handle: ".cards_secton,.modal__custom_header,.donor_information",
        cursor: "-webkit-grab",
        cancel: ".donor_name,.sort_num",
      });
    });
    this.newLocationPermission = this.localstoragedataService
      .getPermissionLst()
      .filter((x) => x.permissionName == "New Location")
      .map((x) => x.isActive)[0];
  }

  setValue(data) {
    this.iFrameUrl = `https://www.google.com/maps/embed/v1/place?key=${environment.GOOGLE_MAP_API_KEY}&q=`;
    this.address = data.address;
    this.city = data.city;
    this.country = data.country;
    this.locationId = data.locationId;
    this.locationJewishName = data.locationJewishName;
    this.locationName = data.locationName;
    this.locationNameShort = data.locationNameShort;
    this.state = data.state;
    this.isGlobal = data.isGlobal;
    this.payments = data.totalPanel.payments;
    this.openPledges = data.totalPanel.openPledges;
    this.scheduled = data.totalPanel.scheduled;
    this.raised = data.totalPanel.raised;
    this.cityStateZip =
      (data.city == null ? "" : data.city + " ") +
      (data.state == null ? "" : data.state + " ") +
      (data.zip == null ? "" : data.zip + " ,") +
      (data.country == null ? "" : data.country);
    this.isloading = false;

    this.iFrameUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      `${this.iFrameUrl}${this.address} ${this.cityStateZip}`
    );
    this.isMapShow = true;
  }

  closePopup() {
    this.activeModal.dismiss();
  }

  getCopyText(): string {
    if (this.locationName && this.locationJewishName)
      return `${this.locationName.toString()} ${this.locationJewishName.toString()}`;
    if (this.locationName && !this.locationJewishName)
      return `${this.locationName.toString()}`;
    if (!this.locationName && this.locationJewishName)
      return `${this.locationJewishName.toString()}`;
    return "";
  }

  canEditGlobalLocation() {
    if (this.isGlobal) {
      return false;
    }

    return true;
  }

  SaveLayout() {
    let setting = {
      locationCardFilteritem: this.objAdvancedSearch,
      locationCardStartDate:
        this.selectedDateRange != undefined
          ? this.selectedDateRange.startDate
          : null,
      locationCardEndDate:
        this.selectedDateRange != undefined
          ? this.selectedDateRange.endDate
          : null,
    };
    let objLayout = {
      uiPageSettingId: this.uiPageSettingId,
      userId: this.localstoragedataService.getLoginUserId(),
      moduleName: "lists",
      screenName: "locationcard",
      setting: JSON.stringify(setting),
    };
    this.uiPageSettingService.Save(objLayout).subscribe((res: any) => {
      if (res) {
        this.uiPageSetting = res.uiPageSetting;
        Swal.fire({
          title: "Layout Saved Successfully",
          icon: "success",
          confirmButtonText: this.commonMethodService.getTranslate(
            "WARNING_SWAL.BUTTON.CONFIRM.OK"
          ),
          customClass: {
            confirmButton: "btn_ok",
          },
        });
      }
    });
  }

  CopyText(event) {
    event.preventDefault();
    let payload = this.getCopyText();
    let listener = (e: ClipboardEvent) => {
      let clipboard = e.clipboardData || window["clipboardData"];
      clipboard.setData("text", payload);
      e.preventDefault();
    };

    document.addEventListener("copy", listener, false);
    document.execCommand("copy");
    document.removeEventListener("copy", listener, false);
  }

  CopyShortText(event) {
    event.preventDefault();
    let payload = this.locationNameShort
      ? `${this.locationNameShort.toString()}`
      : "";
    let listener = (e: ClipboardEvent) => {
      let clipboard = e.clipboardData || window["clipboardData"];
      clipboard.setData("text", payload);
      e.preventDefault();
    };

    document.addEventListener("copy", listener, false);
    document.execCommand("copy");
    document.removeEventListener("copy", listener, false);
  }

  searchLocationCardData() {
    this.isloading = true;
    if (this.objAdvancedSearch) {
      this.filtercount = 0;
      for (let key of Object.keys(this.objAdvancedSearch)) {
        let filtervalue = this.objAdvancedSearch[key];
        if (
          filtervalue == undefined ||
          filtervalue.length == 0 ||
          filtervalue == true ||
          filtervalue == false
        ) {
        } else {
          this.filtercount += 1;
        }
      }
    }
    var objLocationCard = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      locationId: this.locationId,
      fromDate:
        this.selectedDateRange && this.selectedDateRange.startDate != null
          ? moment(this.selectedDateRange.startDate).format("YYYY-MM-DD")
          : null,
      toDate:
        this.selectedDateRange && this.selectedDateRange.endDate != null
          ? moment(this.selectedDateRange.endDate).format("YYYY-MM-DD")
          : null,
      listFilters: {
        campaigns:
          this.objAdvancedSearch &&
          this.objAdvancedSearch.campaignId &&
          this.objAdvancedSearch.campaignId.length > 0
            ? this.objAdvancedSearch.campaignId.map((s) => s.id)
            : null,
        reasons:
          this.objAdvancedSearch &&
          this.objAdvancedSearch.reasonId &&
          this.objAdvancedSearch.reasonId.length > 0
            ? this.objAdvancedSearch.reasonId.map((s) => s.id)
            : null,
        donors:
          this.objAdvancedSearch &&
          this.objAdvancedSearch.donorId &&
          this.objAdvancedSearch.donorId.length > 0
            ? this.objAdvancedSearch.donorId.map((s) => s.id)
            : null,
        collectors:
          this.objAdvancedSearch &&
          this.objAdvancedSearch.collectorId &&
          this.objAdvancedSearch.collectorId.length > 0
            ? this.objAdvancedSearch.collectorId.map((s) => s.id)
            : null,
        sources:
          this.objAdvancedSearch &&
          this.objAdvancedSearch.sourceId &&
          this.objAdvancedSearch.sourceId.length > 0
            ? this.objAdvancedSearch.sourceId.map((s) => s.id)
            : null,
      },
    };
    this.locationService
      .getLocationCard(objLocationCard)
      .subscribe((res: any) => {
        // hide loader
        this.isloading = false;
        if (res) {
          this.setValue(res);
        }
      });
  }

  openSearchFilterPopup() {
    this.isloading = false;
    this.modalOptions = {
      centered: true,
      size: "lg",
      //backdrop : 'static',
      keyboard: true,
      windowClass: "location_filter",
    };
    const modalRef = this.commonMethodService.openPopup(
      LocationFilterPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.AdvancedFilterData = this.objAdvancedSearch;
    modalRef.componentInstance.isTotalPanelOpen = true;
    modalRef.componentInstance.emtOutputAdvancedFilterData.subscribe(
      (objResponse) => {
        this.objAdvancedSearch = objResponse;
        this.searchLocationCardData();
      }
    );
  }

  openPaymentListCardPopup(locationId) {
    if (!this.allowPaymentListCard) return;
    this.modalOptions = {
      centered: false,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass:
        "drag_popup payment_list location_payment reason_payment modal-position",
      container: "#card-payment",
    };
    const modalRef = this.commonMethodService.openPopup(
      PaymentlistCardPopupComponent,
      this.modalOptions
    );
    var objPaymentListCard = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      DateFrom:
        this.startDate != null
          ? moment(this.selectedDateRange.startDate).format("YYYY-MM-DD")
          : null,
      DateTo:
        this.endDate != null
          ? moment(this.selectedDateRange.endDate).format("YYYY-MM-DD")
          : null,
      locations: [locationId],
      reasonIds:
        this.objAdvancedSearch &&
        this.objAdvancedSearch.reasonId &&
        this.objAdvancedSearch.reasonId.length > 0
          ? this.objAdvancedSearch.reasonId.map((s) => s.id)
          : null,
      campaignIds:
        this.objAdvancedSearch &&
        this.objAdvancedSearch.campaignId &&
        this.objAdvancedSearch.campaignId.length > 0
          ? this.objAdvancedSearch.campaignId.map((s) => s.id)
          : null,
      donors:
        this.objAdvancedSearch &&
        this.objAdvancedSearch.donorId &&
        this.objAdvancedSearch.donorId.length > 0
          ? this.objAdvancedSearch.donorId.map((s) => s.id)
          : null,
      collectors:
        this.objAdvancedSearch &&
        this.objAdvancedSearch.collectorId &&
        this.objAdvancedSearch.collectorId.length > 0
          ? this.objAdvancedSearch.collectorId.map((s) => s.id)
          : null,
      deviceIds:
        this.objAdvancedSearch &&
        this.objAdvancedSearch.sourceId &&
        this.objAdvancedSearch.sourceId.length > 0
          ? this.objAdvancedSearch.sourceId.map((s) => s.id)
          : null,
    };
    this.cardService
      .getPaymentCardList(objPaymentListCard)
      .subscribe((res: any) => {
        if (
          this.selectedDateRange != undefined &&
          this.selectedDateRange.startDate != null
        ) {
          modalRef.componentInstance.selectedDateRange = this.selectedDateRange;
        }
        modalRef.componentInstance.PaymentCardListData = res;
        modalRef.componentInstance.LocationId = locationId;
      });
    modalRef.componentInstance.emtOutputPaymentCloseCard.subscribe((res) => {
      if (res) {
        let modalContent: any = $(".modal");
        modalContent.draggable({
          handle: ".cards_secton,.modal__custom_header,.donor_information",
          cursor: "grab",
        });
      }
    });

    modalRef.result
      .then(() => {
        this.allowPaymentListCard = true;
      })
      .catch(() => {
        this.allowPaymentListCard = true;
      });
  }

  openScheduleListCardPopup(locationId) {
    if (!this.allowScheduleListCard) return;
    this.isloading = false;
    this.modalOptions = {
      centered: false,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass:
        "drag_popup schedule_list location_schedule reason_schedule modal-position",
      container: "#card-shedule",
    };
    const modalRef = this.commonMethodService.openPopup(
      SchedulelistCardPopupComponent,
      this.modalOptions
    );
    var objScheduleListCard = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      dateFrom:
        this.startDate != null
          ? moment(this.selectedDateRange.startDate).format("YYYY-MM-DD")
          : null,
      dateTo:
        this.endDate != null
          ? moment(this.selectedDateRange.endDate).format("YYYY-MM-DD")
          : null,
      locations: [locationId],
      reasonIds:
        this.objAdvancedSearch &&
        this.objAdvancedSearch.reasonId &&
        this.objAdvancedSearch.reasonId.length > 0
          ? this.objAdvancedSearch.reasonId.map((s) => s.id)
          : null,
      campaignIds:
        this.objAdvancedSearch &&
        this.objAdvancedSearch.campaignId &&
        this.objAdvancedSearch.campaignId.length > 0
          ? this.objAdvancedSearch.campaignId.map((s) => s.id)
          : null,
      donors:
        this.objAdvancedSearch &&
        this.objAdvancedSearch.donorId &&
        this.objAdvancedSearch.donorId.length > 0
          ? this.objAdvancedSearch.donorId.map((s) => s.id)
          : null,
      collectors:
        this.objAdvancedSearch &&
        this.objAdvancedSearch.collectorId &&
        this.objAdvancedSearch.collectorId.length > 0
          ? this.objAdvancedSearch.collectorId.map((s) => s.id)
          : null,
      deviceIds:
        this.objAdvancedSearch &&
        this.objAdvancedSearch.sourceId &&
        this.objAdvancedSearch.sourceId.length > 0
          ? this.objAdvancedSearch.sourceId.map((s) => s.id)
          : null,
    };
    this.scheduleService
      .getSchedulePaymentPledgeList(objScheduleListCard)
      .subscribe((res: any) => {
        if (
          this.selectedDateRange != undefined &&
          this.selectedDateRange.startDate != null
        ) {
          modalRef.componentInstance.selectedPaymentDateRange =
            this.selectedDateRange;
          modalRef.componentInstance.selectedPledgeDateRange =
            this.selectedDateRange;
        }

        modalRef.componentInstance.ScheduleCardListData = res;
        modalRef.componentInstance.LocationId = locationId;
      });
    modalRef.componentInstance.emtOutputScheduleCloseCard.subscribe((res) => {
      if (res) {
        let modalContent: any = $(".modal");
        modalContent.draggable({
          handle: ".cards_secton,.modal__custom_header,.donor_information",
          cursor: "grab",
        });
      }
    });

    modalRef.result
      .then(() => {
        this.allowScheduleListCard = true;
      })
      .catch(() => {
        this.allowScheduleListCard = true;
      });
  }

  openPledgeListCardPopup(locationId) {
    if (!this.allowPledgeListCard) return;
    this.modalOptions = {
      centered: false,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass:
        "drag_popup pledge_list location_pledge reason_pledge modal-position",
      container: "#card-pledge",
    };
    const modalRef = this.commonMethodService.openPopup(
      PledgelistCardPopupComponent,
      this.modalOptions
    );
    var objPledgeListCard = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      fromDate:
        this.startDate != null
          ? moment(this.selectedDateRange.startDate).format("YYYY-MM-DD")
          : null,
      toDate:
        this.endDate != null
          ? moment(this.selectedDateRange.endDate).format("YYYY-MM-DD")
          : null,
      locations: [locationId],
      reasonIds:
        this.objAdvancedSearch &&
        this.objAdvancedSearch.reasonId &&
        this.objAdvancedSearch.reasonId.length > 0
          ? this.objAdvancedSearch.reasonId.map((s) => s.id)
          : null,
      campaignIds:
        this.objAdvancedSearch &&
        this.objAdvancedSearch.campaignId &&
        this.objAdvancedSearch.campaignId.length > 0
          ? this.objAdvancedSearch.campaignId.map((s) => s.id)
          : null,
      donors:
        this.objAdvancedSearch &&
        this.objAdvancedSearch.donorId &&
        this.objAdvancedSearch.donorId.length > 0
          ? this.objAdvancedSearch.donorId.map((s) => s.id)
          : null,
      collectors:
        this.objAdvancedSearch &&
        this.objAdvancedSearch.collectorId &&
        this.objAdvancedSearch.collectorId.length > 0
          ? this.objAdvancedSearch.collectorId.map((s) => s.id)
          : null,
      deviceIds:
        this.objAdvancedSearch &&
        this.objAdvancedSearch.sourceId &&
        this.objAdvancedSearch.sourceId.length > 0
          ? this.objAdvancedSearch.sourceId.map((s) => s.id)
          : null,
    };
    this.cardService
      .getPledgeCardList(objPledgeListCard)
      .subscribe((res: any) => {
        if (
          this.selectedDateRange != undefined &&
          this.selectedDateRange.startDate != null
        ) {
          modalRef.componentInstance.selectedDateRange = this.selectedDateRange;
        }
        modalRef.componentInstance.PledgeCardListData = res;
        modalRef.componentInstance.LocationId = locationId;
      });
    modalRef.componentInstance.emtOutputPledgeCloseCard.subscribe((res) => {
      if (res) {
        let modalContent: any = $(".modal");
        modalContent.draggable({
          handle: ".cards_secton,.modal__custom_header,.donor_information",
          cursor: "grab",
        });
      }
    });

    modalRef.result
      .then(() => {
        this.allowPledgeListCard = true;
      })
      .catch(() => {
        this.allowPledgeListCard = true;
      });
  }

  openSaveLocationPopup() {
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup savelocation_popup",
    };
    const modalRef = this.commonMethodService.openPopup(
      SaveLocationPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.Type = "add";
  }

  openEditLocationPopup(locationId) {
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup savelocation_popup",
    };
    const modalRef = this.commonMethodService.openPopup(
      SaveLocationPopupComponent,
      this.modalOptions
    );
    var macAddress = this.localstoragedataService.getLoginUserGuid();
    var eventGuId = this.localstoragedataService.getLoginUserEventGuId();
    var locationID = this.LocationId ? this.LocationId : locationId;
    this.locationService
      .getLocation(locationID, eventGuId, macAddress)
      .subscribe((res: any) => {
        this.isloading = false;
        modalRef.componentInstance.Type = "edit";
        modalRef.componentInstance.EditLocationData = res;
      });

    modalRef.componentInstance.emtOutputEditLocation.subscribe((res: any) => {
      if (res) {
        this.isloading = true;
        var objDonorCard = {
          eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
          locationId: locationId,
        };
        this.locationService
          .getLocationCard(objDonorCard)
          .subscribe((res: any) => {
            this.isloading = false;
            if (res) {
              this.setValue(res);
            }
          });
      }
    });
    modalRef.componentInstance.emtOutputDismissCard.subscribe((res: any) => {
      if (res) {
        this.activeModal.dismiss();
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  openHebrewCalendarPopup() {
    this.commonMethodService.featureName = null;
    this.commonMethodService.openCalendarPopup(
      this.class_id,
      this.class_hid,
      this.selectedDateRange,
      false
    );
    this.calendarSubscription = this.commonMethodService
      .getCalendarArray()
      .subscribe((items) => {
        if (
          items &&
          items.pageName == "LocationCard" &&
          this.commonMethodService.isCalendarClicked == true
        ) {
          this.commonMethodService.isCalendarClicked = false;
          this.calendarSubscription.unsubscribe();
          if (this.popContent) {
            this.popContent.close();
          }
          this.selectedDateRange = items.obj;
          this.EngHebCalPlaceholder =
            this.hebrewEngishCalendarService.EngHebCalPlaceholder;
          this.searchLocationCardData();
        }
      });
  }

  onClickedOutsidePopover(p1: any) {
    if (!(event.target as HTMLElement).closest(".popover")) {
      p1.close();
    } else {
    }
  }
}
