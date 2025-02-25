import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  ViewChild,
} from "@angular/core";
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
import { ReasonService } from "src/app/services/reason.service";
import { ScheduleService } from "src/app/services/schedule.service";
import { ReasonFilterPopupComponent } from "../../reason/reason-filter-popup/reason-filter-popup.component";
import { SaveReasonPopupComponent } from "../../reason/save-reason-popup/save-reason-popup.component";
import { PaymentlistCardPopupComponent } from "../paymentlist-card-popup/paymentlist-card-popup.component";
import { SchedulelistCardPopupComponent } from "../schedulelist-card-popup/schedulelist-card-popup.component";
import { PledgelistCardPopupComponent } from "./../pledgelist-card-popup/pledgelist-card-popup.component";
import { CampaignService } from "src/app/services/campaign.service";
import { CampaignCardPopupComponent } from "../../cards/campaign-card-popup/campaign-card-popup.component";
import { UIPageSettingService } from "src/app/services/uipagesetting.service";
import Swal from "sweetalert2";

import { HebrewEngishCalendarService } from "src/app/services/hebrew-engish-calendar.service";
import { environment } from "./../../../../environments/environment";
import { Subscription } from "rxjs";

declare var $: any;
@Component({
  selector: "app-reason-card-popup",
  templateUrl: "./reason-card-popup.component.html",
  standalone: false,
  styleUrls: ["./reason-card-popup.component.scss"],
})
export class ReasonCardPopupComponent implements OnInit {
  @ViewChild(NgbPopover, { static: false }) popContent: NgbPopover;
  @ViewChild(DaterangepickerDirective, { static: false })
  pickerDirective: DaterangepickerDirective;
  selectedDateRange: any = { startDate: null, endDate: null };
  //@Input('selectedDateRange') selectedDateRange?: any;
  objAdvancedSearch: any;
  filterCount = 0;
  popTitle: any;
  modalOptions: NgbModalOptions;
  isloading: boolean = true;
  reasonId: string;
  parentreasonId: number;
  reasonName: string;
  reasonJewishName: string;
  campaign: string;
  campaignID: number;
  email: string;
  fundRaisedPercent: string;
  goal: number;
  openPledges: number;
  parentReasonName: number;
  payments: number;
  skeletonitems: any = [{}, {}];
  skeletonitems2: any = [{}, {}, {}, {}];
  phone1: string;
  phone2: string;
  PageName: any = "ReasonCard";
  isOneDate: any = false;
  raised: number;
  scheduled: number;
  reasonNum: number;
  donatePageUrl: string;
  startDate: any = null;
  endDate: any = null;
  campaignId: number;
  isinitialize: number = 0;
  fundRaisedPercentWidth: number;
  newReasonPermission: boolean = false;
  uiPageSettingId: any;
  uiPageSetting: any;
  isDevEnv: boolean;
  private calendarSubscription: Subscription;
  @Input() ReasonId: any;
  @Input() set ReasonCardData(ReasonCardValue: any) {
    this.isloading = true;
    if (ReasonCardValue) {
      this.reasonId = ReasonCardValue.reasonId;
      let objLayout = {
        reasonId: this.reasonId,
        userId: this.localstoragedataService.getLoginUserId(),
        moduleName: "lists",
        screenName: "reasoncard",
      };
      this.uiPageSettingService.Get(objLayout).subscribe((res: any) => {
        if (res) {
          this.uiPageSettingId = res.uiPageSettingId;
          this.uiPageSetting = JSON.parse(res.setting);
          if (this.uiPageSetting.reasoncardFilteritem) {
            this.objAdvancedSearch = this.uiPageSetting.reasoncardFilteritem;
            if (
              !this.uiPageSetting.reasoncardStartDate &&
              !this.uiPageSetting.reasoncardEndDate
            ) {
              this.selectedDateRange = undefined;
              this.startDate = null;
              this.endDate = null;
            } else {
              this.selectedDateRange = {
                startDate: moment(this.uiPageSetting.reasoncardStartDate),
                endDate: moment(this.uiPageSetting.reasoncardEndDate),
              };
              this.startDate = this.uiPageSetting.reasoncardStartDate;
              this.endDate = this.uiPageSetting.reasoncardEndDate;
            }
            this.searchReasonCardData();
          }
        } else {
          this.setValue(ReasonCardValue);
        }
      });
    }
  }

  @Input() set selectDateRange(date: any) {
    if (date) {
      this.startDate = date.startDate;
      this.endDate = date.endDate;
      this.selectedDateRange.startDate = date.startDate;
      this.selectedDateRange.endDate = date.endDate;
    }
  }

  @Input() set objAdvanceSearch(advanceSearch: any) {
    if (advanceSearch) {
      this.objAdvancedSearch = advanceSearch;
      this.filterCount = 0;
      for (let key of Object.keys(this.objAdvancedSearch)) {
        let filtervalue = this.objAdvancedSearch[key];
        if (
          filtervalue == undefined ||
          filtervalue.length == 0 ||
          filtervalue == true ||
          filtervalue == false
        ) {
        } else {
          this.filterCount += 1;
        }
      }
    }
  }

  EngHebCalPlaceholder: string = "All Time";
  class_id: string;
  class_hid: string;
  allowPaymentListCard: boolean = true;
  allowPledgeListCard: boolean = true;
  allowScheduleListCard: boolean = true;
  constructor(
    public activeModal: NgbActiveModal,
    public commonMethodService: CommonMethodService,
    private cardService: CardService,
    private reasonService: ReasonService,
    private campaignService: CampaignService,
    private uiPageSettingService: UIPageSettingService,
    private scheduleService: ScheduleService,
    private localstoragedataService: LocalstoragedataService,
    public hebrewEngishCalendarService: HebrewEngishCalendarService,
    private readonly changeDetectorRef: ChangeDetectorRef,
    public ngbModal: NgbModal
  ) {}

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
        handle:
          ".cards_secton,.progressbar_wrap,.modal__custom_header,.donor_information",
        cursor: "grab",
        cancel: ".donor_name",
      });
    });
    this.newReasonPermission = this.localstoragedataService
      .getPermissionLst()
      .filter((x) => x.permissionName == "New Reason")
      .map((x) => x.isActive)[0];
    this.isloading = true;
  }

  SaveLayoutAsDefault() {
    let setting = {
      reasoncardFilteritem: this.objAdvancedSearch,
      reasoncardStartDate:
        this.selectedDateRange != undefined
          ? this.selectedDateRange.startDate
          : null,
      reasoncardEndDate:
        this.selectedDateRange != undefined
          ? this.selectedDateRange.endDate
          : null,
    };
    let objLayout = {
      reasonId: this.reasonId,
      userId: this.localstoragedataService.getLoginUserId(),
      moduleName: "lists",
      screenName: "reasoncard",
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

  setValue(ReasonCardValue: any) {
    this.reasonId = ReasonCardValue.reasonId;
    this.parentreasonId = ReasonCardValue.parentID;
    this.reasonName = ReasonCardValue.reasonName;
    this.reasonJewishName = ReasonCardValue.reasonJewishName;
    this.payments = ReasonCardValue.totalPanel.payments;
    this.campaign = ReasonCardValue.campaign;
    this.campaignID = ReasonCardValue.campaignID;
    this.email = ReasonCardValue.email;
    this.fundRaisedPercent =
      ReasonCardValue.fundRaisedPercent == null
        ? "0"
        : ReasonCardValue.fundRaisedPercent;
    this.fundRaisedPercentWidth =
      Number(this.fundRaisedPercent) > 100
        ? 100
        : Number(this.fundRaisedPercent);
    this.goal = ReasonCardValue.goal;
    this.openPledges = ReasonCardValue.totalPanel.openPledges;
    this.parentReasonName = ReasonCardValue.parentReasonName;
    this.phone1 = ReasonCardValue.phone1;
    this.phone2 = ReasonCardValue.phone2;
    this.raised = ReasonCardValue.totalPanel.raised;
    this.scheduled = ReasonCardValue.totalPanel.scheduled;
    this.reasonNum = ReasonCardValue.reasonNum;
    this.donatePageUrl = ReasonCardValue.donatePageUrl;
    if (this.fundRaisedPercent == "0") {
      $("#progressNumberId").addClass("zero_no");
    } else if (this.fundRaisedPercent == "100") {
      $("#progressNumberId").addClass("hundred_no");
    }
    document.getElementById("progressbarId").style.width =
      this.fundRaisedPercentWidth + "%";
    document.getElementById("progressNumberId").style.left =
      this.fundRaisedPercentWidth + "%";
    this.isloading = false;
  }
  closePopup() {
    this.activeModal.dismiss();
  }

  getCopyText(): string {
    if (this.reasonName && this.reasonJewishName)
      return `${this.reasonName.toString()} ${this.reasonJewishName.toString()}`;
    if (this.reasonName && !this.reasonJewishName)
      return `${this.reasonName.toString()}`;
    if (!this.reasonName && this.reasonJewishName)
      return `${this.reasonJewishName.toString()}`;
    return "";
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

  openSearchFilterPopup() {
    this.isloading = false;
    this.modalOptions = {
      centered: true,
      size: "lg",
      //backdrop : 'static',
      keyboard: true,
      windowClass: "reason_filter",
    };
    const modalRef = this.commonMethodService.openPopup(
      ReasonFilterPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.AdvancedFilterData = this.objAdvancedSearch;
    modalRef.componentInstance.isTotalPanelOpen = true;
    modalRef.componentInstance.emtOutputAdvancedFilterData.subscribe(
      (objResponse) => {
        this.objAdvancedSearch = objResponse;
        this.searchReasonCardData();
      }
    );
  }

  datesUpdated(event) {
    this.selectedDateRange = event;
    this.startDate = this.selectedDateRange.startDate;
    this.endDate = this.selectedDateRange.endDate;
    if (this.isinitialize == 1) {
      this.searchReasonCardData();
      if (event.startDate == null && event.endDate == null) {
        this.selectedDateRange = undefined;
      }
    }
    this.isinitialize = 1;
  }
  CalendarFocus() {
    this.pickerDirective.open();
  }

  searchReasonCardData() {
    this.isloading = true;
    if (this.objAdvancedSearch) {
      this.filterCount = 0;
      for (let key of Object.keys(this.objAdvancedSearch)) {
        let filtervalue = this.objAdvancedSearch[key];
        if (
          filtervalue == undefined ||
          filtervalue.length == 0 ||
          filtervalue == true ||
          filtervalue == false
        ) {
        } else {
          this.filterCount += 1;
        }
      }
    }
    var objReasonCard = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      reasonId: this.reasonId,
      fromDate:
        this.startDate != null
          ? moment(this.selectedDateRange.startDate).format("YYYY-MM-DD")
          : null,
      toDate:
        this.endDate != null
          ? moment(this.selectedDateRange.endDate).format("YYYY-MM-DD")
          : null,
      listFilters: {
        locations:
          this.objAdvancedSearch &&
          this.objAdvancedSearch.locationId &&
          this.objAdvancedSearch.locationId.length > 0
            ? this.objAdvancedSearch.locationId.map((s) => s.id)
            : null,
        campaigns:
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
        sources:
          this.objAdvancedSearch &&
          this.objAdvancedSearch.sourceId &&
          this.objAdvancedSearch.sourceId.length > 0
            ? this.objAdvancedSearch.sourceId.map((s) => s.id)
            : null,
      },
    };
    this.reasonService.getReasonCard(objReasonCard).subscribe((res: any) => {
      // hide loader
      if (res) {
        this.setValue(res);
      }
      this.isloading = false;
    });
  }

  openPaymentListCardPopup(reasonId) {
    if (!this.allowPaymentListCard) return;
    this.modalOptions = {
      centered: false,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup payment_list reason_payment modal-position",
      container: "#card-payment",
    };
    const modalRef = this.commonMethodService.openPopup(
      PaymentlistCardPopupComponent,
      this.modalOptions
    );
    var objPaymentListCard = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      ReasonIds: [reasonId],
      dateFrom:
        this.startDate != null
          ? moment(this.selectedDateRange.startDate).format("YYYY-MM-DD")
          : null,
      dateTo:
        this.endDate != null
          ? moment(this.selectedDateRange.endDate).format("YYYY-MM-DD")
          : null,
      locations:
        this.objAdvancedSearch &&
        this.objAdvancedSearch.locationId &&
        this.objAdvancedSearch.locationId.length > 0
          ? this.objAdvancedSearch.locationId.map((s) => s.id)
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
        modalRef.componentInstance.ReasonId = reasonId;
      });
    modalRef.componentInstance.emtOutputPaymentCloseCard.subscribe((res) => {
      if (res) {
        let modalContent: any = $(".modal");
        modalContent.draggable({
          handle:
            ".cards_secton,.progressbar_wrap,.modal__custom_header,.donor_information",
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

  openScheduleListCardPopup(reasonId) {
    if (!this.allowScheduleListCard) return;
    this.isloading = false;
    this.modalOptions = {
      centered: false,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup schedule_list reason_schedule modal-position",
      container: "#card-shedule",
    };
    const modalRef = this.commonMethodService.openPopup(
      SchedulelistCardPopupComponent,
      this.modalOptions
    );
    var objScheduleListCard = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      ReasonIds: [reasonId],
      dateFrom:
        this.startDate != null
          ? moment(this.selectedDateRange.startDate).format("YYYY-MM-DD")
          : null,
      dateTo:
        this.endDate != null
          ? moment(this.selectedDateRange.endDate).format("YYYY-MM-DD")
          : null,
      locations:
        this.objAdvancedSearch &&
        this.objAdvancedSearch.locationId &&
        this.objAdvancedSearch.locationId.length > 0
          ? this.objAdvancedSearch.locationId.map((s) => s.id)
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
        modalRef.componentInstance.ReasonId = reasonId;
      });
    modalRef.componentInstance.emtOutputScheduleCloseCard.subscribe((res) => {
      if (res) {
        let modalContent: any = $(".modal");
        modalContent.draggable({
          handle:
            ".cards_secton,.progressbar_wrap,.modal__custom_header,.donor_information",
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

  openPledgeListCardPopup(reasonId) {
    if (!this.allowPledgeListCard) return;
    this.modalOptions = {
      centered: false,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup pledge_list reason_pledge modal-position",
      container: "#card-pledge",
    };
    const modalRef = this.commonMethodService.openPopup(
      PledgelistCardPopupComponent,
      this.modalOptions
    );
    var objPledgeListCard = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      reasonIds: [reasonId],
      fromDate:
        this.startDate != null
          ? moment(this.selectedDateRange.startDate).format("YYYY-MM-DD")
          : null,
      toDate:
        this.endDate != null
          ? moment(this.selectedDateRange.endDate).format("YYYY-MM-DD")
          : null,
      locations:
        this.objAdvancedSearch &&
        this.objAdvancedSearch.locationId &&
        this.objAdvancedSearch.locationId.length > 0
          ? this.objAdvancedSearch.locationId.map((s) => s.id)
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
        modalRef.componentInstance.ReasonId = reasonId;
      });
    modalRef.componentInstance.emtOutputPledgeCloseCard.subscribe((res) => {
      if (res) {
        let modalContent: any = $(".modal");
        modalContent.draggable({
          handle:
            ".cards_secton,.progressbar_wrap,.modal__custom_header,.donor_information",
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

  openAddReasonPopup() {
    this.isloading = false;
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup savereason_popup",
    };
    const modalRef = this.commonMethodService.openPopup(
      SaveReasonPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.Type = "add";
  }

  openEditReasonPopup(reasonId) {
    this.isloading = false;
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup savereason_popup",
    };
    const modalRef = this.commonMethodService.openPopup(
      SaveReasonPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.Type = "edit";
    var eventGuId = this.localstoragedataService.getLoginUserEventGuId();
    var macAddress = this.localstoragedataService.getLoginUserGuid();
    var reasonID = this.ReasonId ? this.ReasonId : reasonId;
    this.reasonService
      .getReason(reasonID, macAddress, eventGuId)
      .subscribe((res: any) => {
        this.isloading = false;
        modalRef.componentInstance.Type = "Edit";
        modalRef.componentInstance.EditReasonData = res;
      });
    modalRef.componentInstance.emtOutputEditReason.subscribe((res: any) => {
      if (res) {
        this.isloading = true;
        var objReasonCard = {
          eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
          reasonId: reasonId,
        };
        this.reasonService
          .getReasonCard(objReasonCard)
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

  openReasonCardPopup(reasonId) {
    this.isloading = false;
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup reason_card parent_reason",
    };
    const modalRef = this.commonMethodService.openPopup(
      ReasonCardPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.ReasonId = reasonId;
    var objReasonCard = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      reasonId: reasonId,
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
    };

    this.reasonService.getReasonCard(objReasonCard).subscribe((res: any) => {
      // hide loader
      this.isloading = false;
      if (res) {
        if (
          this.selectedDateRange != undefined &&
          this.selectedDateRange.startDate != null
        ) {
          modalRef.componentInstance.selectedDateRange = this.selectedDateRange;
        }
        modalRef.componentInstance.ReasonCardData = res;
      }
    });
  }

  openCampaignCardPopup(campaignId) {
    this.isloading = false;
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup campaign_reason",
    };
    const modalRef = this.commonMethodService.openPopup(
      CampaignCardPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.CampaignID = campaignId;
    const obj = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      CampaignId: campaignId,
    };
    this.campaignService.getCampaignCard(obj).subscribe(
      (res: any) => {
        this.isloading = false;
        modalRef.componentInstance.CampaignCardData = res;
        modalRef.componentInstance.CampaignId = campaignId;
      },
      (err) => {
        this.isloading = false;
      }
    );
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
          items.pageName == "ReasonCard" &&
          this.commonMethodService.isCalendarClicked == true
        ) {
          this.commonMethodService.isCalendarClicked = false;
          this.calendarSubscription.unsubscribe();
          if (this.popContent) {
            this.popContent.close();
          }
          this.selectedDateRange = items.obj;
          this.startDate = this.selectedDateRange.startDate;
          this.endDate = this.selectedDateRange.endDate;
          this.EngHebCalPlaceholder =
            this.hebrewEngishCalendarService.EngHebCalPlaceholder;
          this.searchReasonCardData();
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
