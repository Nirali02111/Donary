import { Component, OnInit, ViewChild, Input } from "@angular/core";
import {
  NgbActiveModal,
  NgbModal,
  NgbModalOptions,
  NgbPopover,
} from "@ng-bootstrap/ng-bootstrap";
import { DaterangepickerDirective } from "ngx-daterangepicker-material";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { CampaignService } from "./../../../services/campaign.service";
import { CardService } from "./../../../services/card.service";
import { ScheduleService } from "./../../../services/schedule.service";
import { LocalstoragedataService } from "./../../../commons/local-storage-data.service";
import { PaymentlistCardPopupComponent } from "../paymentlist-card-popup/paymentlist-card-popup.component";
import { PledgelistCardPopupComponent } from "../pledgelist-card-popup/pledgelist-card-popup.component";
import { SchedulelistCardPopupComponent } from "../schedulelist-card-popup/schedulelist-card-popup.component";
import { CampaignCardDataResponse } from "./../../../models/campaign-model";
import * as moment from "moment";
import { SaveCampaignPopupComponent } from "../../campaign/save-campaign-popup/save-campaign-popup.component";
import { CampaignFilterPopupComponent } from "../../campaign/campaign-filter-popup/campaign-filter-popup.component";
import { UIPageSettingService } from "src/app/services/uipagesetting.service";
import Swal from "sweetalert2";
import { HebrewEngishCalendarService } from "src/app/services/hebrew-engish-calendar.service";
import { environment } from "./../../../../environments/environment";
import { Subscription } from "rxjs";

declare var $: any;
@Component({
  selector: "app-campaign-card-popup",
  templateUrl: "./campaign-card-popup.component.html",
  styleUrls: ["./campaign-card-popup.component.scss"],
  standalone: false,
})
export class CampaignCardPopupComponent implements OnInit {
  @ViewChild(DaterangepickerDirective, { static: false })
  pickerDirective: DaterangepickerDirective;
  // selectedDateRange: any = { startDate: null, endDate: null };
  @ViewChild(NgbPopover, { static: false }) popContent: NgbPopover;
  @Input("selectedDateRange") selectedDateRange?: any;
  modalOptions: NgbModalOptions;
  popTitle: any;
  isloading: boolean = true;
  objAdvancedSearch: any;
  filtercount = 0;
  campaignId: any;
  startDate: any = null;
  endDate: any = null;
  isDevEnv: boolean;
  campaignNumber: number;
  campaignName: string;
  friendlyName: string;
  parentCampaign: string;
  createdDate: any;
  PageName: any = "CampaignCard";
  isOneDate: any = false;
  payments: number;
  openPledges: number;
  scheduled: number;
  raised: number;

  isinitialize: number = 0;
  newCampaignPermission: boolean = false;
  uiPageSettingId: any;

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
    private campaignService: CampaignService,
    private localstoragedataService: LocalstoragedataService,
    private cardService: CardService,
    private uiPageSettingService: UIPageSettingService,
    private scheduleService: ScheduleService,
    public hebrewEngishCalendarService: HebrewEngishCalendarService,
    public ngbModal: NgbModal
  ) {}

  @Input() CampaignID: any;
  @Input() set CampaignCardData(CampaignCardValue: any) {
    if (CampaignCardValue) {
      this.campaignId = CampaignCardValue.campaignId;
      let objLayout = {
        campaignId: this.campaignId,
        userId: this.localstoragedataService.getLoginUserId(),
        moduleName: "lists",
        screenName: "campaigncard",
      };
      this.uiPageSettingService.Get(objLayout).subscribe((res: any) => {
        if (res) {
          const uiPageSetting = JSON.parse(res.setting);
          if (uiPageSetting.campaigncardFilteritem) {
            this.objAdvancedSearch = uiPageSetting.campaigncardFilteritem;
            if (
              !uiPageSetting.campaigncardStartDate &&
              !uiPageSetting.campaigncardEndDate
            ) {
              this.selectedDateRange = undefined;
            } else {
              this.selectedDateRange = {
                startDate: moment(uiPageSetting.campaigncardStartDate),
                endDate: moment(uiPageSetting.campaigncardEndDate),
              };
            }
            this.searchCampaignCardData();
          }
        } else {
          this.setValue(CampaignCardValue);
        }
      });
    }
  }

  @Input() set CampaignId(CampaignId: any) {
    if (CampaignId) {
      this.campaignId = CampaignId;
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

  setValue(CampaignCardValue: CampaignCardDataResponse) {
    this.campaignNumber = CampaignCardValue.campaignNumber;
    this.campaignName = CampaignCardValue.campaignName;
    this.friendlyName = CampaignCardValue.friendlyName;
    this.parentCampaign = CampaignCardValue.parentCampaign;
    this.createdDate = CampaignCardValue.createdDate;

    this.payments = CampaignCardValue.totalPanel.payments;
    this.openPledges = CampaignCardValue.totalPanel.openPledges;
    this.scheduled = CampaignCardValue.totalPanel.scheduled;
    this.raised = CampaignCardValue.totalPanel.raised;

    this.isloading = false;
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
        cursor: "grab",
        cancel: ".donor_name,.campaign_name",
      });
    });
    this.newCampaignPermission = this.localstoragedataService
      .getPermissionLst()
      .filter((x) => x.permissionName == "New Campaign")
      .map((x) => x.isActive)[0];
  }

  SaveLayoutAsDefault() {
    let setting = {
      campaigncardFilteritem: this.objAdvancedSearch,
      campaigncardStartDate:
        this.selectedDateRange != undefined
          ? this.selectedDateRange.startDate
          : null,
      campaigncardEndDate:
        this.selectedDateRange != undefined
          ? this.selectedDateRange.endDate
          : null,
    };
    let objLayout = {
      campaignId: this.campaignId,
      userId: this.localstoragedataService.getLoginUserId(),
      moduleName: "lists",
      screenName: "campaignCard",
      setting: JSON.stringify(setting),
    };
    this.uiPageSettingService.Save(objLayout).subscribe((res: any) => {
      if (res) {
        this.campaignId = res.uiPageSetting;
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

  closePopup() {
    this.activeModal.dismiss();
  }

  CopyText(event) {
    event.preventDefault();
    let payload = this.campaignName ? `${this.campaignName.toString()}` : "";
    let listener = (e: ClipboardEvent) => {
      let clipboard = e.clipboardData || window["clipboardData"];
      clipboard.setData("text", payload);
      e.preventDefault();
    };

    document.addEventListener("copy", listener, false);
    document.execCommand("copy");
    document.removeEventListener("copy", listener, false);
  }

  CopyFriendlyText(event) {
    event.preventDefault();
    let payload = this.friendlyName ? `${this.friendlyName.toString()}` : "";
    let listener = (e: ClipboardEvent) => {
      let clipboard = e.clipboardData || window["clipboardData"];
      clipboard.setData("text", payload);
      e.preventDefault();
    };

    document.addEventListener("copy", listener, false);
    document.execCommand("copy");
    document.removeEventListener("copy", listener, false);
  }

  openSearchFilterPopup() {
    this.isloading = false;
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "campaign_filter",
    };
    const modalRef = this.commonMethodService.openPopup(
      CampaignFilterPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.AdvancedFilterData = this.objAdvancedSearch;
    modalRef.componentInstance.isTotalPanelOpen = true;
    modalRef.componentInstance.emtOutputAdvancedFilterData.subscribe(
      (objResponse) => {
        this.objAdvancedSearch = objResponse;
        this.searchCampaignCardData();
      }
    );
  }

  searchCampaignCardData() {
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
    var objCollectorCard = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      CampaignId: this.campaignId,
      fromDate:
        this.selectedDateRange.startDate != null
          ? moment(this.selectedDateRange.startDate).format("YYYY-MM-DD")
          : null,
      toDate:
        this.selectedDateRange.endDate != null
          ? moment(this.selectedDateRange.endDate).format("YYYY-MM-DD")
          : null,
      listFilters: {
        locations:
          this.objAdvancedSearch &&
          this.objAdvancedSearch.locationId &&
          this.objAdvancedSearch.locationId.length > 0
            ? this.objAdvancedSearch.locationId.map((s) => s.id)
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
            ? this.objAdvancedSearch.donorId
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

    this.campaignService
      .getCampaignCard(objCollectorCard)
      .subscribe((res: any) => {
        // hide loader
        this.isloading = false;
        if (res) {
          this.setValue(res);
        }
      });
  }

  openPaymentListCardPopup() {
    if (!this.allowPaymentListCard) return;
    this.modalOptions = {
      centered: false,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass:
        "drag_popup payment_list reason_payment  campaign_payment modal-position",
      container: "#card-payment",
    };

    const modalRef = this.commonMethodService.openPopup(
      PaymentlistCardPopupComponent,
      this.modalOptions
    );
    var objPaymentListCard = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      CampaignIds: [this.campaignId],
      DateFrom:
        this.selectedDateRange != undefined
          ? this.selectedDateRange.startDate != null
            ? moment(this.selectedDateRange.startDate).format("YYYY-MM-DD")
            : null
          : null,
      DateTo:
        this.selectedDateRange != undefined
          ? this.selectedDateRange.endDate != null
            ? moment(this.selectedDateRange.endDate).format("YYYY-MM-DD")
            : null
          : null,
      locations:
        this.objAdvancedSearch &&
        this.objAdvancedSearch.locationId &&
        this.objAdvancedSearch.locationId.length > 0
          ? this.objAdvancedSearch.locationId.map((s) => s.id)
          : null,
      reasonIds:
        this.objAdvancedSearch &&
        this.objAdvancedSearch.reasonId &&
        this.objAdvancedSearch.reasonId.length > 0
          ? this.objAdvancedSearch.reasonId.map((s) => s.id)
          : null,
      donors:
        this.objAdvancedSearch &&
        this.objAdvancedSearch.donorId &&
        this.objAdvancedSearch.donorId.length > 0
          ? this.objAdvancedSearch.donorId
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
        modalRef.componentInstance.PaymentCardListData = res;
        modalRef.componentInstance.CampaignId = this.campaignId;

        if (
          this.selectedDateRange != undefined &&
          this.selectedDateRange.startDate != null
        ) {
          modalRef.componentInstance.selectedDateRange = this.selectedDateRange;
        }
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

  openScheduleListCardPopup() {
    if (!this.allowPledgeListCard) return;
    this.isloading = false;
    this.modalOptions = {
      centered: false,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass:
        "drag_popup schedule_list reason_schedule  campaign_schdule modal-position",
      container: "#card-shedule",
    };

    const modalRef = this.commonMethodService.openPopup(
      SchedulelistCardPopupComponent,
      this.modalOptions
    );
    var objScheduleListCard = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      CampaignIds: [this.campaignId],
      dateFrom:
        this.selectedDateRange != undefined
          ? this.selectedDateRange.startDate != null
            ? moment(this.selectedDateRange.startDate).format("YYYY-MM-DD")
            : null
          : null,
      dateTo:
        this.selectedDateRange != undefined
          ? this.selectedDateRange.endDate != null
            ? moment(this.selectedDateRange.endDate).format("YYYY-MM-DD")
            : null
          : null,
      locations:
        this.objAdvancedSearch &&
        this.objAdvancedSearch.locationId &&
        this.objAdvancedSearch.locationId.length > 0
          ? this.objAdvancedSearch.locationId.map((s) => s.id)
          : null,
      reasonIds:
        this.objAdvancedSearch &&
        this.objAdvancedSearch.reasonId &&
        this.objAdvancedSearch.reasonId.length > 0
          ? this.objAdvancedSearch.reasonId.map((s) => s.id)
          : null,
      donors:
        this.objAdvancedSearch &&
        this.objAdvancedSearch.donorId &&
        this.objAdvancedSearch.donorId.length > 0
          ? this.objAdvancedSearch.donorId
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
        modalRef.componentInstance.CampaignId = this.campaignId;
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
        this.allowPledgeListCard = true;
      })
      .catch(() => {
        this.allowPledgeListCard = true;
      });
  }

  openPledgeListCardPopup() {
    if (!this.allowPledgeListCard) return;
    this.modalOptions = {
      centered: false,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass:
        "drag_popup pledge_list reason_pledge  campaign_pledge modal-position",
      container: "#card-pledge",
    };

    const modalRef = this.commonMethodService.openPopup(
      PledgelistCardPopupComponent,
      this.modalOptions
    );
    var objPledgeListCard = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      CampaignIds: [this.campaignId],
      fromDate:
        this.selectedDateRange != undefined
          ? this.selectedDateRange.startDate != null
            ? moment(this.selectedDateRange.startDate).format("YYYY-MM-DD")
            : null
          : null,
      toDate:
        this.selectedDateRange != undefined
          ? this.selectedDateRange.endDate != null
            ? moment(this.selectedDateRange.endDate).format("YYYY-MM-DD")
            : null
          : null,
      locations:
        this.objAdvancedSearch &&
        this.objAdvancedSearch.locationId &&
        this.objAdvancedSearch.locationId.length > 0
          ? this.objAdvancedSearch.locationId.map((s) => s.id)
          : null,
      reasonIds:
        this.objAdvancedSearch &&
        this.objAdvancedSearch.reasonId &&
        this.objAdvancedSearch.reasonId.length > 0
          ? this.objAdvancedSearch.reasonId.map((s) => s.id)
          : null,
      donors:
        this.objAdvancedSearch &&
        this.objAdvancedSearch.donorId &&
        this.objAdvancedSearch.donorId.length > 0
          ? this.objAdvancedSearch.donorId
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
        modalRef.componentInstance.CampaignId = this.campaignId;
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

  EditCampaignPopup(campaignId) {
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup savecampaign_popup",
    };
    const modalRef = this.commonMethodService.openPopup(
      SaveCampaignPopupComponent,
      this.modalOptions
    );
    var macAddress = this.localstoragedataService.getLoginUserGuid();
    var eventGuId = this.localstoragedataService.getLoginUserEventGuId();
    var campaignId = this.CampaignID ? this.CampaignID : this.campaignId;
    this.campaignService
      .getCampaign(campaignId, macAddress, eventGuId)
      .subscribe((res: any) => {
        this.isloading = false;
        modalRef.componentInstance.Type = "edit";
        modalRef.componentInstance.EditCampaignData = res;
      });
    modalRef.componentInstance.emtOutputEditCampaign.subscribe((res: any) => {
      if (res) {
        this.isloading = true;
        this.setValue(res);
        this.isloading = false;
      }
    });
    modalRef.componentInstance.emtOutputDismissCard.subscribe((res: any) => {
      if (res) {
        this.activeModal.dismiss();
      }
    });
  }

  SaveCampaignPopup() {
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup savecampaign_popup",
    };
    const modalRef = this.commonMethodService.openPopup(
      SaveCampaignPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.Type = "add";
  }

  openHebrewCalendarPopup() {
    this.commonMethodService.featureName = null;
    this.commonMethodService.openCalendarPopup(
      this.class_id,
      this.class_hid,
      this.selectedDateRange,
      false,
      "campaignCalender"
    );
    this.calendarSubscription = this.commonMethodService
      .getCalendarArray()
      .subscribe((items) => {
        if (
          items &&
          items.pageName == "CampaignCard" &&
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
          this.searchCampaignCardData();
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
