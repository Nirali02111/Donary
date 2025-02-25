import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import {
  NgbActiveModal,
  NgbModalOptions,
  NgbPopover,
} from "@ng-bootstrap/ng-bootstrap";
import * as moment from "moment";
import { DaterangepickerDirective } from "ngx-daterangepicker-material";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { CardService } from "src/app/services/card.service";
import { LocationService } from "src/app/services/location.sevice";
import Swal from "sweetalert2";
import { TransactionAdvancedFilterPopupComponent } from "../../transaction/transaction-advanced-filter-popup/transaction-advanced-filter-popup.component";
import { DonorCardPopupComponent } from "../donor-card-popup/donor-card-popup.component";
import { PaymentCardPopupComponent } from "../payment-card-popup/payment-card-popup.component";
import { CollectorService } from "./../../../services/collector.service";
import { HebrewEngishCalendarService } from "src/app/services/hebrew-engish-calendar.service";
import { Subscription } from "rxjs";
declare var $: any;
@Component({
  selector: "app-paymentlist-card-popup",
  templateUrl: "./paymentlist-card-popup.component.html",
  standalone: false,
  styleUrls: ["./paymentlist-card-popup.component.scss"],
})
export class PaymentlistCardPopupComponent implements OnInit {
  @ViewChild(DaterangepickerDirective, { static: false })
  pickerDirective: DaterangepickerDirective;
  // selectedDateRange: any = { startDate: null, endDate: null };
  @ViewChild(NgbPopover, { static: false }) popContent: NgbPopover;
  @Input("selectedDateRange") selectedDateRange?: any;
  // objAdvancedSearch: any;
  objAdvancedSearch: any = {
    paymentStatus: [
      { id: 1, itemName: "Success" },
      { id: 10, itemName: "Deposited" },
      { id: 9, itemName: "Pending" },
    ],
  };
  gridData: Array<any>;
  gridFilterData: Array<any>;
  window_class = "drag_popup donor_card father_card";
  accountId: number;
  popTitle: any;
  reasonId: any;
  collectorId: any;
  campaignId: any;
  locationId: any;
  deviceId: any;
  PageName: any = "PaymentListCard";
  isOneDate: any = false;
  page = 1;
  pageSize = 5;
  showArrow = false;
  isDonorNameOrJewishName: string;

  isinitialize: number = 0;

  EngHebCalPlaceholder: string = "All Time";
  class_id: string;
  class_hid: string;
  private calendarSubscription: Subscription;

  constructor(
    private localstoragedataService: LocalstoragedataService,
    private cardService: CardService,
    public commonService: CommonMethodService,
    public collectorService: CollectorService,
    public locationService: LocationService,
    public activeModal: NgbActiveModal,
    public hebrewEngishCalendarService: HebrewEngishCalendarService
  ) {}

  @Output() emtOutputPaymentListCardData: EventEmitter<any> =
    new EventEmitter();
  @Output() emtOutputPaymentCloseCard: EventEmitter<any> = new EventEmitter();
  @Input() set PaymentCardListData(PaymentListCardValue: any) {
    if (PaymentListCardValue) {
      this.setValue(PaymentListCardValue);
    } else {
      this.gridData = null;
      this.gridFilterData = this.gridFilterData;
    }
    this.isloading = false;
  }
  @Input() set AccountId(accountId: number) {
    this.accountId = accountId;
    this.colFields = this.colFields.filter((o) => o.sortName !== "donorJewish");
    this.colFields = this.colFields.filter(
      (o) => o.sortName !== "reasonAmount"
    );
    this.colFields = this.colFields.filter(
      (o) => o.sortName !== "campaignAmount"
    );
  }
  @Input() set ReasonId(reasonId: any) {
    if (reasonId) {
      this.reasonId = reasonId;
      this.colFields = this.colFields.filter((o) => o.sortName !== "reasonId");
      this.colFields = this.colFields.filter(
        (o) => o.sortName !== "appliedAmount"
      );
      this.colFields = this.colFields.filter(
        (o) => o.sortName !== "campaignAmount"
      );
    }
  }
  @Input() set CollectorId(collectorId: any) {
    if (collectorId) {
      this.collectorId = collectorId;
      this.colFields = this.colFields.filter(
        (o) => o.sortName !== "collectorId"
      );
      this.removeCardSpecificColumn();
    }
  }

  @Input() set CampaignId(campaignId: any) {
    if (campaignId) {
      this.campaignId = campaignId;
      this.colFields = this.colFields.filter(
        (o) => o.sortName !== "campaignId"
      );
      this.colFields = this.colFields.filter(
        (o) => o.sortName !== "appliedAmount"
      );
      this.colFields = this.colFields.filter(
        (o) => o.sortName !== "reasonAmount"
      );
    }
  }

  @Input() set LocationId(locationId: any) {
    if (locationId) {
      this.locationId = locationId;
      this.colFields = this.colFields.filter(
        (o) => o.sortName !== "locationId"
      );
      this.removeCardSpecificColumn();
    }
  }

  @Input() set DeviceId(deviceId: any) {
    if (deviceId) {
      this.deviceId = deviceId;
      this.colFields = this.colFields.filter((o) => o.sortName !== "deviceId");
      this.removeCardSpecificColumn();
    }
  }

  private removeCardSpecificColumn() {
    this.colFields = this.colFields.filter(
      (o) => o.sortName !== "appliedAmount"
    );
    this.colFields = this.colFields.filter(
      (o) => o.sortName !== "reasonAmount"
    );
    this.colFields = this.colFields.filter(
      (o) => o.sortName !== "campaignAmount"
    );
  }

  isPaymentReceiptNoColVisible: boolean = true;
  isPaymentDateColVisible: boolean = true;
  isPaymentTypeColVisible: boolean = true;
  isPaymentAmountColVisible: boolean = true;
  isPaymentStatusColVisible: boolean = true;

  isPaymentFullNameColVisible: boolean = true;
  isPaymentFullNameJewishColVisible: boolean = true;
  skeletonitems2 = [{}, {}, {}, {}, {}, {}, {}];
  // other fields
  isPaymentNameColVisible: boolean = true; //changes
  isPaymentReasonNameColVisible: boolean = true; //changes
  isPaymentCampaignColVisible: boolean = true; //changes
  isPaymentLocationNameColVisible: boolean = false;
  isPaymentCollectorColVisible: boolean = false;
  isPaymentSourceColVisible: boolean = false;
  skeletonitems = [{}, {}, {}, {}];
  isPaymentTotalOfThisAppliedPaymentColVisible: boolean = true;
  isPaymentTotalOfThisReasonColVisible: boolean = true;
  isPaymentTotalOfThisCampaignColVisible: boolean = true;

  isloading: boolean;
  modalOptions: NgbModalOptions;

  // Date-range picker related properties
  open: string = "left";
  drop: string = "down";
  showClearButton: boolean = true;
  alwaysShowCalendars: boolean = true;
  placeholder: string = "All time";
  showCustomRangeLabel: boolean = true;
  linkedCalendars: boolean = true;

  filtercount: number = 1;

  colFields: any = [];

  setValue(PaymentCardValue: any) {
    PaymentCardValue.forEach((s) => {
      if (s.paymentStatus == "Success") {
        s.status_class = "paymnt_success";
      } else if (s.paymentStatus == "Declined") {
        s.status_class = "paymnt_declined";
      } else if (s.paymentStatus == "Error") {
        s.status_class = "paymnt_error";
      } else if (s.paymentStatus == "Voided") {
        s.status_class = "paymnt_voided";
      } else if (s.paymentStatus == "Pending") {
        s.status_class = "paymnt_pending";
      } else if (s.paymentStatus == "Deposited") {
        s.status_class = "paymnt_deposited";
      } else if (s.paymentStatus == "Running") {
        s.status_class = "paymnt_running";
      }
    });
    this.gridData = PaymentCardValue;
    //for dynamically setting donorName & donorJewish value based on PaymentCardValue data to fix name sorting issue
    this.isDonorNameOrJewishName = PaymentCardValue[0].donorName
      ? "donorName"
      : "donorJewish";
    this.setColFieldsData();

    this.filterLocalData();
    this.showArrow = this.gridFilterData.length <= 5 ? false : true;
    this.isloading = false;
  }

  ngOnInit() {
    $(document).ready(function () {
      let modalContent: any = $(".modal");
      modalContent.draggable({
        start: (event, ui) => {
          // Find the parent modal element
          let parentModal = ui.helper.closest(".modal");
          // Remove 'modal-position' and add 'modal-position-drag'
          parentModal
            .removeClass("modal-position")
            .addClass("modal-position-drag");
        },
        handle: ".modal__custom_header",
      });
    });

    this.isloading = true;
    this.gridData = null;
  }

  setGridColVisibility($event, colName, isVisible) {
    colName = colName.toLowerCase().replace(/\s/g, "");
    switch (colName) {
      case "receiptno":
        this.isPaymentReceiptNoColVisible = isVisible;
        break;
      case "paymentdate":
        this.isPaymentDateColVisible = isVisible;
        break;
      case "paymenttype":
        this.isPaymentTypeColVisible = isVisible;
        break;
      case "amount":
        this.isPaymentAmountColVisible = isVisible;
        break;
      case "paymentstatus":
        this.isPaymentStatusColVisible = isVisible;
        break;
      case "name":
        this.isPaymentNameColVisible = isVisible;
        break;
      case "reason":
        this.isPaymentReasonNameColVisible = isVisible;
        break;
      case "campaign":
        this.isPaymentCampaignColVisible = isVisible;
        break;
      case "location":
        this.isPaymentLocationNameColVisible = isVisible;
        break;
      case "collector":
        this.isPaymentCollectorColVisible = isVisible;
        break;
      case "source":
        this.isPaymentSourceColVisible = isVisible;
        break;
      case "applied_payment":
        this.isPaymentTotalOfThisAppliedPaymentColVisible = isVisible;
        break;
      case "total_of_this_reason":
        this.isPaymentTotalOfThisReasonColVisible = isVisible;
        break;
      case "total_of_this_campaign":
        this.isPaymentTotalOfThisCampaignColVisible = isVisible;
        break;
    }

    $event.stopPropagation();
  }

  checkGridColVisibility(colName) {
    colName = colName.toLowerCase().replace(/\s/g, "");

    switch (colName) {
      case "receiptno":
        return this.isPaymentReceiptNoColVisible;
      case "paymentdate":
        return this.isPaymentDateColVisible;
      case "paymenttype":
        return this.isPaymentTypeColVisible;
      case "amount":
        return this.isPaymentAmountColVisible;
      case "paymentstatus":
        return this.isPaymentStatusColVisible;
      case "name":
        return this.isPaymentNameColVisible;
      case "reason":
        return this.isPaymentReasonNameColVisible;
      case "campaign":
        return this.isPaymentCampaignColVisible;
      case "location":
        return this.isPaymentLocationNameColVisible;
      case "collector":
        return this.isPaymentCollectorColVisible;
      case "source":
        return this.isPaymentSourceColVisible;
      case "applied_payment":
        return this.isPaymentTotalOfThisAppliedPaymentColVisible;
      case "total_of_this_reason":
        return this.isPaymentTotalOfThisReasonColVisible;
      case "total_of_this_campaign":
        return this.isPaymentTotalOfThisCampaignColVisible;
    }
  }

  dropFields(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.colFields, event.previousIndex, event.currentIndex);
    moveItemInArray(
      this.gridFilterData,
      event.previousIndex,
      event.currentIndex
    );
  }

  dropColumn(event: CdkDragDrop<string[]>) {
    moveItemInArray(
      this.gridFilterData,
      event.previousIndex,
      event.currentIndex
    );
    moveItemInArray(this.colFields, event.previousIndex, event.currentIndex);
  }

  closePopup() {
    this.activeModal.dismiss();
    this.emtOutputPaymentCloseCard.emit(true);
  }

  ChangePageSize(val, className) {
    $("#page_id5").removeClass("active");
    $("#page_id10").removeClass("active");
    $("#page_id15").removeClass("active");
    this.pageSize = val;
    $("#" + className).addClass("active");
    if (this.gridFilterData.length / this.pageSize <= 1) {
      this.showArrow = false;
    } else {
      this.showArrow = true;
    }
  }

  openPaymentCardPopup(paymentId) {
    this.isloading = false;
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup payment_card edit_payment-modal-popup",
    };
    const modalRef = this.commonService.openPopup(
      PaymentCardPopupComponent,
      this.modalOptions
    );
    var objDonorCard = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      paymentId: paymentId,
    };

    this.cardService.getPaymentCard(objDonorCard).subscribe((res: any) => {
      // hide loader

      this.isloading = false;
      modalRef.componentInstance.PaymentCardData = res;
    });
  }

  getSearchParametrs() {
    let searchObj = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
    };

    if (this.collectorId != undefined) {
      return {
        ...searchObj,
        fromDate:
          this.selectedDateRange.startDate != null
            ? moment(this.selectedDateRange.startDate).format("YYYY-MM-DD")
            : null,
        toDate:
          this.selectedDateRange.endDate != null
            ? moment(this.selectedDateRange.endDate).format("YYYY-MM-DD")
            : null,
      };
    }

    return {
      ...searchObj,
      DateFrom:
        this.selectedDateRange.startDate != null
          ? moment(this.selectedDateRange.startDate).format("YYYY-MM-DD")
          : null,
      DateTo:
        this.selectedDateRange.endDate != null
          ? moment(this.selectedDateRange.endDate).format("YYYY-MM-DD")
          : null,
    };
  }

  searchPaymentListData() {
    this.isloading = true;
    var objDonorCard = {};
    if (this.collectorId != undefined) {
      objDonorCard = {
        ...this.getSearchParametrs(),
        collectorId: this.collectorId,
      };
      this.collectorService
        .getCollectorPaymentList(objDonorCard)
        .subscribe((res: any) => {
          if (res) {
            this.setValue(res);
          } else {
            this.gridData = null;
            this.gridFilterData = null;
          }
          this.isloading = false;
        });

      return;
    }

    let searchParams: any = this.getSearchParametrs();

    if (this.campaignId != undefined) {
      searchParams = {
        ...searchParams,
        CampaignIds: [this.campaignId],
      };
    }

    if (this.locationId != undefined) {
      searchParams = {
        ...searchParams,
        locations: [this.locationId],
      };
    }

    if (this.deviceId != undefined) {
      searchParams = {
        ...searchParams,
        deviceIds: [this.deviceId],
      };
    }

    if (this.reasonId != undefined) {
      searchParams = {
        ...searchParams,
        ReasonIds: [this.reasonId],
      };
    }

    if (this.accountId != undefined) {
      searchParams = {
        ...searchParams,
        accountId: this.accountId,
      };
    }

    this.cardService.getPaymentCardList(searchParams).subscribe((res: any) => {
      if (res) {
        this.setValue(res);
      } else {
        this.gridData = null;
        this.gridFilterData = null;
      }
      this.isloading = false;
    });
  }

  search(keyword) {
    this.isloading = true;
    var record = this.gridData;
    var filterdRecord;
    keyword = keyword.toLowerCase();
    if (keyword != "") {
      var searchArray = keyword.split(" ");
      for (var searchValue of searchArray) {
        filterdRecord = record.filter(
          (obj) =>
            (obj.amount &&
              obj.amount.toString().toLowerCase().indexOf(searchValue) > -1) ||
            (obj.receiptNum &&
              obj.receiptNum.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.paymentType &&
              obj.paymentType.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.paymentStatus &&
              obj.paymentStatus.toString().toLowerCase().indexOf(searchValue) >
                -1)
        );
        this.gridFilterData = filterdRecord;
        record = this.gridFilterData;
        this.showArrow = this.gridFilterData.length <= 5 ? false : true;
      }
    } else {
      this.gridFilterData = this.gridData;
    }
    this.isloading = false;
  }

  // popup
  openAdvanceSearchFilterPopup() {
    this.modalOptions = {
      centered: true,
      size: "lg",
      //backdrop : 'static',
      keyboard: true,
      windowClass: "advance_search payment-list-donar",
    };
    const modalRef = this.commonService.openPopup(
      TransactionAdvancedFilterPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.isPaymentTab = true;
    modalRef.componentInstance.isListPage = true;
    modalRef.componentInstance.AdvancedFilterData = this.objAdvancedSearch;

    modalRef.componentInstance.emtOutputAdvancedFilterData.subscribe(
      (objResponse) => {
        this.objAdvancedSearch = objResponse;
        this.filtercount = 0;
        for (let key of Object.keys(this.objAdvancedSearch)) {
          let filtervalue = this.objAdvancedSearch[key];
          if (
            filtervalue == undefined ||
            filtervalue.length == 0 ||
            filtervalue == false
          ) {
          } else {
            if (key == "isBatchClicked" || key == "batchNum") {
              if (
                (key == "isBatchClicked" && filtervalue) ||
                (key == "batchNum" && filtervalue)
              ) {
                this.filtercount += 1;
              }
            } else {
              this.filtercount += 1;
            }
          }
        }

        this.filterLocalData();
      }
    );
  }
  //

  filterLocalData(data = this.gridData) {
    this.gridFilterData = data.filter((o) => {
      if (!this.objAdvancedSearch) {
        return true;
      }
      return this.inAllFields(o);
    });
  }

  inAllFields(o) {
    return this.inArray(this.objAdvancedSearch.paymentStatus, o.paymentStatus);
  }
  inArray(filterKeyArray: Array<{ itemName: any }> | null, rowFieldValue: any) {
    if (!filterKeyArray || filterKeyArray.length === 0) {
      return true;
    }
    const result = filterKeyArray.find((d) => d.itemName == rowFieldValue);
    if (result) {
      return true;
    }
    return false;
  }
  // local filter

  ChangeShowEntriesDwn() {
    $(".dropwond-page").toggleClass("no-open");
    $(".btn-show-entries").toggleClass("active");
  }
  OpenDonorCard(accountID) {
    this.isloading = true;
    this.window_class =
      "drag_popup donor_card father_card" +
      "_" +
      this.commonService.initialDonorCard;
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: this.window_class,
    };
    this.commonService.initialDonorCard += 1;

    var objDonorCard = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      accountId: accountID,
    };
    this.cardService.getDonorCard(objDonorCard).subscribe((res: any) => {
      if (res) {
        const modalRef = this.commonService.openPopup(
          DonorCardPopupComponent,
          this.modalOptions
        );
        modalRef.componentInstance.AccountId = accountID;
        this.isloading = false;
        modalRef.componentInstance.DonorCardData = res;
      } else {
        Swal.fire({
          title: "No data found",
          text: "",
          icon: "error",
          confirmButtonText: this.commonService.getTranslate(
            "WARNING_SWAL.BUTTON.CONFIRM.OK"
          ),
          customClass: {
            confirmButton: "btn_ok",
          },
        });
      }
    });
  }
  checkLenDonorName(donorJewish, donorName) {
    if (donorJewish) {
      return donorJewish.length > 10 ? true : false;
    } else if (donorName) {
      return donorName.length > 10 ? true : false;
    }
  }

  openHebrewCalendarPopup() {
    this.commonService.openCalendarPopup(
      this.class_id,
      this.class_hid,
      this.selectedDateRange,
      false,
      "paymentListDynamicsCalender"
    );
    this.calendarSubscription = this.commonService
      .getCalendarArray()
      .subscribe((items) => {
        if (
          items &&
          items.pageName == "PaymentListCard" &&
          this.commonService.isCalendarClicked == true
        ) {
          this.commonService.isCalendarClicked = false;
          this.calendarSubscription.unsubscribe();
          if (this.popContent) {
            this.popContent.close();
          }
          this.selectedDateRange = items.obj;
          this.EngHebCalPlaceholder =
            this.hebrewEngishCalendarService.EngHebCalPlaceholder;
          this.searchPaymentListData();
        }
      });
  }
  onClickedOutsidePopover(p1: any) {
    if (!(event.target as HTMLElement).closest(".popover")) {
      p1.close();
    }
  }

  setColFieldsData() {
    this.colFields = [
      {
        colName: "RECEIPTNO",
        visibleCondition: this.isPaymentReceiptNoColVisible,
        sortName: "receiptNum",
      },
      {
        colName: "AMOUNT",
        visibleCondition: this.isPaymentAmountColVisible,
        sortName: "amount",
      },

      {
        colName: "APPLIED_PAYMENT",
        visibleCondition: this.isPaymentTotalOfThisAppliedPaymentColVisible,
        sortName: "appliedAmount",
      }, // visible only by donor card
      {
        colName: "TOTAL_OF_THIS_REASON",
        visibleCondition: this.isPaymentTotalOfThisReasonColVisible,
        sortName: "reasonAmount",
      }, // visible only by reason card
      {
        colName: "TOTAL_OF_THIS_CAMPAIGN",
        visibleCondition: this.isPaymentTotalOfThisCampaignColVisible,
        sortName: "campaignAmount",
      }, // visible only by campaign card

      {
        colName: "PAYMENTTYPE",
        visibleCondition: this.isPaymentTypeColVisible,
        sortName: "paymentType",
      },

      {
        colName: "PAYMENTDATE",
        visibleCondition: this.isPaymentDateColVisible,
        sortName: "paymentDate",
      },
      {
        colName: "NAME",
        visibleCondition: this.isPaymentNameColVisible,
        sortName: "donorJewish",
      },
      {
        colName: "CAMPAIGN",
        visibleCondition: this.isPaymentCampaignColVisible,
        sortName: "campaignId",
      },
      {
        colName: "REASON",
        visibleCondition: this.isPaymentReasonNameColVisible,
        sortName: "reasonId",
      },
      {
        colName: "PAYMENTSTATUS",
        visibleCondition: this.isPaymentStatusColVisible,
        sortName: "paymentStatus",
      },
      {
        colName: "LOCATION",
        visibleCondition: this.isPaymentLocationNameColVisible,
        sortName: "locationId",
      },
      {
        colName: "COLLECTOR",
        visibleCondition: this.isPaymentCollectorColVisible,
        sortName: "collectorId",
      },
      {
        colName: "SOURCE",
        visibleCondition: this.isPaymentSourceColVisible,
        sortName: "deviceId",
      },
    ];
  }
}
