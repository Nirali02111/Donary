import { Component, Input, OnInit, ViewChild } from "@angular/core";
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
import { DonorService } from "src/app/services/donor.service";
import { CollectorFilterPopupComponent } from "../../collector/collector-filter-popup/collector-filter-popup.component";
import { SaveCollectorPopupComponent } from "../../collector/save-collector-popup/save-collector-popup.component";
import { PaymentlistCardPopupComponent } from "../paymentlist-card-popup/paymentlist-card-popup.component";
import { PledgelistCardPopupComponent } from "../pledgelist-card-popup/pledgelist-card-popup.component";
import { SchedulelistCardPopupComponent } from "../schedulelist-card-popup/schedulelist-card-popup.component";
import { CollectorService } from "./../../../services/collector.service";
import { UIPageSettingService } from "src/app/services/uipagesetting.service";
import Swal from "sweetalert2";
import { HebrewEngishCalendarService } from "src/app/services/hebrew-engish-calendar.service";
import { environment } from "./../../../../environments/environment";
import { Subscription } from "rxjs";
declare var $: any;
@Component({
  selector: "app-collector-card-popup",
  templateUrl: "./collector-card-popup.component.html",
  standalone: false,
  styleUrls: ["./collector-card-popup.component.scss"],
})
export class CollectorCardPopupComponent implements OnInit {
  @ViewChild(DaterangepickerDirective, { static: false })
  pickerDirective: DaterangepickerDirective;
  @Input() CollectorId: any;
  @Input("selectedDateRange") selectedDateRange?: any;
  @ViewChild(NgbPopover, { static: false }) popContent: NgbPopover;
  modalOptions: NgbModalOptions;
  collectorId: Int32Array;
  fullName: string;
  lstEmail: [];
  lstPhoneNumber: [];
  fullNameJewish: string;
  address: string;
  cityStateZip: string;
  group: string;
  class: string;
  PageName: any = "CollectorCard";
  skeletonitems: any = [{}, {}, {}, {}];
  isOneDate: any = false;
  totalPayments: string;
  totalPledges: string;
  totalSchedules: string;
  totalRaised: string;
  mostRecentPayment: string;
  mostRecentPaymentDate: string;
  mostRecentPledge: string;
  mostRecentPledgeDate: string;
  upcomingScheduleDate: string;
  fatherName: string;
  fatherInLawName: string;
  phoneList: string;
  isloading: boolean = true;
  locationDetails: any;
  lstAccountWalletDetails: any;
  startDate: any = null;
  endDate: any = null;
  objAdvancedSearch: any;
  filtercount = 0;
  newCollectorPermission: boolean = false;
  isDevEnv: boolean;
  isinitialize: number = 0;
  uiPageSettingId = null;
  uiPageSetting: any;
  popTitle: any;
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
    private collectorService: CollectorService,
    private donorService: DonorService,
    private uiPageSettingService: UIPageSettingService,
    private localstoragedataService: LocalstoragedataService,
    public hebrewEngishCalendarService: HebrewEngishCalendarService,
    public ngbModal: NgbModal
  ) {}

  @Input() set CollectorCardData(CollectorCardValue: any) {
    if (CollectorCardValue) {
      this.collectorId = CollectorCardValue.collectorId;
      let objLayout = {
        uiPageSettingId: this.uiPageSettingId,
        userId: this.localstoragedataService.getLoginUserId(),
        moduleName: "lists",
        screenName: "collectorcard",
      };
      this.uiPageSettingService.Get(objLayout).subscribe((res: any) => {
        if (res) {
          this.uiPageSettingId = res.uiPageSettingId;
          this.uiPageSetting = JSON.parse(res.setting);
          this.setValue(CollectorCardValue);
          if (this.uiPageSetting.collectorCardFilteritem) {
            this.objAdvancedSearch = this.uiPageSetting.collectorCardFilteritem;
            if (
              !this.uiPageSetting.collectorCardStartDate &&
              !this.uiPageSetting.collectorCardEndDate
            ) {
              this.selectedDateRange = undefined;
            } else {
              this.selectedDateRange = {
                startDate: moment(this.uiPageSetting.collectorCardStartDate),
                endDate: moment(this.uiPageSetting.collectorCardEndDate),
              };
            }
            this.searchCollectorCardData();
          }
        } else {
          this.setValue(CollectorCardValue);
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

  setValue(CollectorCardValue: any) {
    if (CollectorCardValue.lstPhoneNumber) {
      let phoneNumberList = [];
      for (var i = 0; i < CollectorCardValue.lstPhoneNumber.length; i++) {
        var phoneLbl = CollectorCardValue.lstPhoneNumber[i].split(":");
        var formattedphone = this.formatPhoneNumber(phoneLbl[1]);
        phoneNumberList.push({ number: formattedphone, type: phoneLbl[0] });
      }
      CollectorCardValue.phoneNumberList = phoneNumberList;
    }
    if (CollectorCardValue.lstEmail) {
      let emaillist = [];
      for (var i = 0; i < CollectorCardValue.lstEmail.length; i++) {
        var emailLbl = CollectorCardValue.lstEmail[i].split(":");
        emaillist.push({ email: emailLbl[1], type: emailLbl[0] });
      }
      CollectorCardValue.emaillist = emaillist;
    }
    this.phoneList = CollectorCardValue.phoneNumberList;
    this.fullName = CollectorCardValue.fullName;
    // this.fullNameJewish = CollectorCardValue.fullNameJewish;
    this.fullNameJewish = CollectorCardValue.fullJewishName;
    this.address = CollectorCardValue.address;
    this.cityStateZip = CollectorCardValue.cityStateZip;
    this.group = CollectorCardValue.group;
    this.class = CollectorCardValue.class;
    this.totalPayments = CollectorCardValue.totalPanel.payments;
    this.totalPledges = CollectorCardValue.totalPanel.openPledges;
    this.totalSchedules = CollectorCardValue.totalPanel.scheduled;
    this.totalRaised = CollectorCardValue.totalPanel.raised;

    this.mostRecentPaymentDate = CollectorCardValue.mostRecentPaymentDate;
    this.mostRecentPledge = CollectorCardValue.mostRecentPledge;
    this.mostRecentPledgeDate = CollectorCardValue.mostRecentPledgeDate;
    this.upcomingScheduleDate = CollectorCardValue.upcomingScheduleDate;
    this.lstPhoneNumber = CollectorCardValue.lstPhoneNumber;
    this.lstEmail = CollectorCardValue.emaillist;
    this.collectorId = CollectorCardValue.collectorId;
    this.fatherName = CollectorCardValue.fatherName;
    this.fatherInLawName = CollectorCardValue.fatherInLawName;
    this.lstAccountWalletDetails = CollectorCardValue.lstAccountWalletDetails;
    this.locationDetails = CollectorCardValue.locationDetails;
    this.isloading = false;
  }
  formatPhoneNumber(phoneNumberString) {
    return this.commonMethodService.formatPhoneNumber(phoneNumberString);
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
        cancel: ".donor_name",
      });
    });
    this.newCollectorPermission = this.localstoragedataService
      .getPermissionLst()
      .filter((x) => x.permissionName == "New Collector")
      .map((x) => x.isActive)[0];
  }

  closePopup() {
    this.activeModal.dismiss();
  }

  SaveLayout() {
    let setting = {
      collectorCardFilteritem: this.objAdvancedSearch,
      collectorCardStartDate:
        this.selectedDateRange != undefined
          ? this.selectedDateRange.startDate
          : null,
      collectorCardEndDate:
        this.selectedDateRange != undefined
          ? this.selectedDateRange.endDate
          : null,
    };
    let objLayout = {
      uiPageSettingId: this.uiPageSettingId,
      userId: this.localstoragedataService.getLoginUserId(),
      moduleName: "lists",
      screenName: "collectorcard",
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

  getCopyText(): string {
    if (this.fullName && this.fullNameJewish)
      return `${this.fullName.toString()} ${this.fullNameJewish.toString()}`;
    if (this.fullName && !this.fullNameJewish)
      return `${this.fullName.toString()}`;
    if (!this.fullName && this.fullNameJewish)
      return `${this.fullNameJewish.toString()}`;
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

  openSaveCollectorPopup() {
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup savecollector_popup",
    };
    const modalRef = this.commonMethodService.openPopup(
      SaveCollectorPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.Type = "add";
  }

  searchCollectorCardData() {
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
      collectorId: this.collectorId,
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
        locations:
          this.objAdvancedSearch &&
          this.objAdvancedSearch.locationId &&
          this.objAdvancedSearch.locationId.length > 0
            ? this.objAdvancedSearch.locationId.map((s) => s.id)
            : null,
        sources:
          this.objAdvancedSearch &&
          this.objAdvancedSearch.sourceId &&
          this.objAdvancedSearch.sourceId.length > 0
            ? this.objAdvancedSearch.sourceId.map((s) => s.id)
            : null,
      },
    };

    this.collectorService
      .getCollectorCard(objCollectorCard)
      .subscribe((res: any) => {
        // hide loader
        this.isloading = false;
        if (res) {
          this.setValue(res);
        }
      });
  }

  openPaymentListCardPopup(collectorId) {
    if (!this.allowPaymentListCard) return;
    this.modalOptions = {
      centered: false,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass:
        "drag_popup payment_list collector_payment reason_payment modal-position",
      container: "#card-payment",
    };
    const modalRef = this.commonMethodService.openPopup(
      PaymentlistCardPopupComponent,
      this.modalOptions
    );
    var objPaymentListCard = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      collectorId: collectorId,
      fromDate:
        this.startDate != null
          ? moment(this.selectedDateRange.startDate).format("YYYY-MM-DD")
          : null,
      toDate:
        this.endDate != null
          ? moment(this.selectedDateRange.endDate).format("YYYY-MM-DD")
          : null,
      listFilters: {
        donors:
          this.objAdvancedSearch &&
          this.objAdvancedSearch.donorId &&
          this.objAdvancedSearch.donorId.length > 0
            ? this.objAdvancedSearch.donorId.map((x) => x.id)
            : null,
        campaigns:
          this.objAdvancedSearch &&
          this.objAdvancedSearch.campaignId &&
          this.objAdvancedSearch.campaignId.length > 0
            ? this.objAdvancedSearch.campaignId.map((s) => s.id)
            : null,
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
        sources:
          this.objAdvancedSearch &&
          this.objAdvancedSearch.sourceId &&
          this.objAdvancedSearch.sourceId.length > 0
            ? this.objAdvancedSearch.sourceId.map((s) => s.id)
            : null,
      },
    };
    this.collectorService
      .getCollectorPaymentList(objPaymentListCard)
      .subscribe((res: any) => {
        if (
          this.selectedDateRange != undefined &&
          this.selectedDateRange.startDate != null
        ) {
          modalRef.componentInstance.selectedDateRange = this.selectedDateRange;
        }
        modalRef.componentInstance.PaymentCardListData = res;
        modalRef.componentInstance.CollectorId = collectorId;
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

  openScheduleListCardPopup(collectorId) {
    if (!this.allowScheduleListCard) return;
    this.isloading = false;
    this.modalOptions = {
      centered: false,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass:
        "drag_popup schedule_list collector_schedule reason_schedule modal-position",
      container: "#card-shedule",
    };
    const modalRef = this.commonMethodService.openPopup(
      SchedulelistCardPopupComponent,
      this.modalOptions
    );
    var objScheduleListCard = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      collectorId: collectorId,
      dateFrom:
        this.startDate != null
          ? moment(this.selectedDateRange.startDate).format("YYYY-MM-DD")
          : null,
      dateTo:
        this.endDate != null
          ? moment(this.selectedDateRange.endDate).format("YYYY-MM-DD")
          : null,
      listFilters: {
        donors:
          this.objAdvancedSearch &&
          this.objAdvancedSearch.donorId &&
          this.objAdvancedSearch.donorId.length > 0
            ? this.objAdvancedSearch.donorId.map((x) => x.id)
            : null,
        campaigns:
          this.objAdvancedSearch &&
          this.objAdvancedSearch.campaignId &&
          this.objAdvancedSearch.campaignId.length > 0
            ? this.objAdvancedSearch.campaignId.map((s) => s.id)
            : null,
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
        sources:
          this.objAdvancedSearch &&
          this.objAdvancedSearch.sourceId &&
          this.objAdvancedSearch.sourceId.length > 0
            ? this.objAdvancedSearch.sourceId.map((s) => s.id)
            : null,
      },
    };
    this.collectorService
      .getCollectorScheduleList(objScheduleListCard)
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
        modalRef.componentInstance.CollectorId = collectorId;
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

  openSearchFilterPopup() {
    this.isloading = false;
    this.modalOptions = {
      centered: true,
      size: "lg",
      //backdrop : 'static',
      keyboard: true,
      windowClass: "collector_filter",
    };
    const modalRef = this.commonMethodService.openPopup(
      CollectorFilterPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.AdvancedFilterData = this.objAdvancedSearch;
    modalRef.componentInstance.isTotalPanelOpen = true;
    modalRef.componentInstance.emtOutputCollectorFilterData.subscribe(
      (objResponse) => {
        this.objAdvancedSearch = objResponse;
        this.searchCollectorCardData();
      }
    );
  }

  openPledgeListCardPopup(collectorId) {
    if (!this.allowPledgeListCard) return;
    this.modalOptions = {
      centered: false,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass:
        "drag_popup pledge_list collector_pledge reason_pledge modal-position",
      container: "#card-pledge",
    };
    const modalRef = this.commonMethodService.openPopup(
      PledgelistCardPopupComponent,
      this.modalOptions
    );
    var objPledgeListCard = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      collectorId: collectorId,
      fromDate:
        this.startDate != null
          ? moment(this.selectedDateRange.startDate).format("YYYY-MM-DD")
          : null,
      toDate:
        this.endDate != null
          ? moment(this.selectedDateRange.endDate).format("YYYY-MM-DD")
          : null,
      listFilters: {
        donors:
          this.objAdvancedSearch &&
          this.objAdvancedSearch.donorId &&
          this.objAdvancedSearch.donorId.length > 0
            ? this.objAdvancedSearch.donorId.map((x) => x.id)
            : null,
        campaigns:
          this.objAdvancedSearch &&
          this.objAdvancedSearch.campaignId &&
          this.objAdvancedSearch.campaignId.length > 0
            ? this.objAdvancedSearch.campaignId.map((s) => s.id)
            : null,
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
        sources:
          this.objAdvancedSearch &&
          this.objAdvancedSearch.sourceId &&
          this.objAdvancedSearch.sourceId.length > 0
            ? this.objAdvancedSearch.sourceId.map((s) => s.id)
            : null,
      },
    };

    this.collectorService
      .getCollectorPledgeList(objPledgeListCard)
      .subscribe((res: any) => {
        if (
          this.selectedDateRange != undefined &&
          this.selectedDateRange.startDate != null
        ) {
          modalRef.componentInstance.selectedDateRange = this.selectedDateRange;
        }
        res = res.map((x) => {
          x.status = x.pledgeStatus;
          return x;
        });
        modalRef.componentInstance.PledgeCardListData = res;
        modalRef.componentInstance.CollectorId = collectorId;
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

  EditCollectorPopup(collectorId) {
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup savecollector_popup",
    };
    const modalRef = this.commonMethodService.openPopup(
      SaveCollectorPopupComponent,
      this.modalOptions
    );
    var eventGuId = this.localstoragedataService.getLoginUserEventGuId();
    var collectorID = this.CollectorId ? this.CollectorId : collectorId;
    this.donorService
      .getDonorById(eventGuId, collectorID)
      .subscribe((res: any) => {
        this.isloading = false;
        modalRef.componentInstance.Type = "edit";
        modalRef.componentInstance.EditCollectorData = res;
      });
    modalRef.componentInstance.emtOutputEditCollector.subscribe((res: any) => {
      if (res) {
        this.isloading = true;
        var objCollectorCard = {
          eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
          collectorId: collectorId,
        };
        this.collectorService
          .getCollectorCard(objCollectorCard)
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
      }
    });
  }

  makeTransactionPopup() {
    this.isloading = false;
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup transaction_modal",
    };
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
          items.pageName == "CollectorCard" &&
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
          this.searchCollectorCardData();
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
