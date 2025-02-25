import {
  Component,
  ElementRef,
  OnInit,
  EventEmitter,
  Input,
  QueryList,
  ViewChildren,
  Output,
} from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import { CommonMethodService } from "src/app/commons/common-methods.service";
declare var $: any;

@Component({
  selector: "app-donor-transaction-card-popup",
  templateUrl: "./donor-transaction-card-popup.component.html",
  styleUrls: ["./donor-transaction-card-popup.component.scss"],
  standalone: false,
})
export class DonorTransactionCardPopupComponent implements OnInit {
  objAdvancedSearch: any;
  gridData: Array<any>;
  gridFilterData: Array<any>;
  isloading: boolean;
  page = 1;
  pageSize = 25;
  showArrow = false;
  isCheckBoxSelected = false;
  skeletonitems = [{}, {}, {}, {}];
  skeletonitems2 = [{}, {}, {}, {}, {}, {}];
  isPaymentReceiptNoColVisible: boolean = true;
  isPaymentDateColVisible: boolean = true;
  isTransactionTypeColVisible: boolean = true;
  isPaymentTypeColVisible: boolean = true;
  isPaymentAmountColVisible: boolean = true;
  isPaymentStatusColVisible: boolean = true;
  // other fields
  isPaymentNameColVisible: boolean = false;
  isPaymentReasonNameColVisible: boolean = false;
  isPaymentCampaignColVisible: boolean = false;
  isPaymentLocationNameColVisible: boolean = false;
  isPaymentCollectorColVisible: boolean = false;
  isPaymentSourceColVisible: boolean = false;

  accountId: number;
  paymentId: number;
  reasonId: any;
  collectorId: any;
  campaignId: any;
  locationId: any;
  deviceId: any;
  recordSelectedArray = [];
  isSelected: boolean = false;

  colFields: any = [
    {
      colName: "Receipt No",
      visibleCondition: this.isPaymentReceiptNoColVisible,
      sortName: "receiptNum",
    },
    {
      colName: "Transaction Type",
      visibleCondition: this.isTransactionTypeColVisible,
      sortName: "transactionType",
    },
    {
      colName: "Amount",
      visibleCondition: this.isPaymentAmountColVisible,
      sortName: "amount",
    },
    {
      colName: "Payment Date",
      visibleCondition: this.isPaymentDateColVisible,
      sortName: "paymentDate",
    },
    {
      colName: "Payment Type",
      visibleCondition: this.isPaymentTypeColVisible,
      sortName: "paymentType",
    },
    {
      colName: "Payment Status",
      visibleCondition: this.isPaymentStatusColVisible,
      sortName: "paymentStatus",
    },
    {
      colName: "Name",
      visibleCondition: this.isPaymentNameColVisible,
      sortName: "nameId",
    },
    {
      colName: "Reason",
      visibleCondition: this.isPaymentReasonNameColVisible,
      sortName: "reason",
    },
    {
      colName: "Campaign",
      visibleCondition: this.isPaymentCampaignColVisible,
      sortName: "campaign",
    },
    {
      colName: "Location",
      visibleCondition: this.isPaymentLocationNameColVisible,
      sortName: "location",
    },
    {
      colName: "Collector",
      visibleCondition: this.isPaymentCollectorColVisible,
      sortName: "collector",
    },
    {
      colName: "Source",
      visibleCondition: this.isPaymentSourceColVisible,
      sortName: "device",
    },
  ];
  constructor(
    public activeModal: NgbActiveModal,
    public commonService: CommonMethodService
  ) {}

  ngOnInit() {
    $(document).ready(function () {
      let modalContent: any = $(".modal");
      modalContent.draggable({
        handle: ".modal__custom_header",
      });
    });
    this.isloading = true;
    this.gridData = null;
  }

  @Output() emtOutputPaymentData: EventEmitter<any> = new EventEmitter();

  @Input() set DonorTransactionCardListData(PaymentListCardValue: any) {
    if (PaymentListCardValue) {
      this.setValue(PaymentListCardValue);
    } else {
      this.gridData = null;
      this.gridFilterData = this.gridFilterData;
    }
  }

  @Input() set AccountId(accountId: number) {
    this.accountId = accountId;
    this.colFields = this.colFields.filter((o) => o.sortName !== "nameId");
  }
  @Input() set ReasonId(reasonId: any) {
    if (reasonId) {
      this.reasonId = reasonId;
      this.colFields = this.colFields.filter((o) => o.sortName !== "reasonId");
    }
  }
  @Input() set CollectorId(collectorId: any) {
    if (collectorId) {
      this.collectorId = collectorId;
      this.colFields = this.colFields.filter(
        (o) => o.sortName !== "collectorId"
      );
    }
  }

  @Input() set CampaignId(campaignId: any) {
    if (campaignId) {
      this.campaignId = campaignId;
      this.colFields = this.colFields.filter(
        (o) => o.sortName !== "campaignId"
      );
    }
  }

  @Input() set LocationId(locationId: any) {
    if (locationId) {
      this.locationId = locationId;
      this.colFields = this.colFields.filter(
        (o) => o.sortName !== "locationId"
      );
    }
  }

  @Input() set DeviceId(deviceId: any) {
    if (deviceId) {
      this.deviceId = deviceId;
      this.colFields = this.colFields.filter((o) => o.sortName !== "deviceId");
    }
  }

  SelectedPaymentArray = [];
  @ViewChildren("checkboxes") checkboxes: QueryList<ElementRef>;
  selectRecord(event, paymentId, data) {
    this.paymentId = paymentId;
    this.checkboxes.forEach((element) => {
      if (paymentId != element.nativeElement.id || !event.target.checked) {
        element.nativeElement.checked = false;
      }
    });

    if (event.target.checked) {
      this.recordSelectedArray = [];
      this.SelectedPaymentArray = [];
      this.SelectedPaymentArray = data;
      if (!this.recordSelectedArray.includes(paymentId)) {
        this.recordSelectedArray.push(paymentId);
      }
      if (this.recordSelectedArray.length > 0) {
        this.isCheckBoxSelected = true;
      }
    } else {
      if (this.recordSelectedArray.includes(paymentId)) {
        this.recordSelectedArray.forEach((element, index) => {
          if (element == paymentId) this.recordSelectedArray.splice(index, 1);
        });
        if (this.recordSelectedArray.length <= 0) {
          this.isCheckBoxSelected = false;
        }
      }
      if (this.recordSelectedArray.includes(Number(paymentId))) {
        this.recordSelectedArray.forEach((element, index) => {
          if (element == paymentId) this.recordSelectedArray.splice(index, 1);
        });
        if (this.recordSelectedArray.length <= 0) {
          this.isCheckBoxSelected = false;
        }
      }
    }
  }

  selectPaymentData() {
    this.activeModal.close();
    this.emtOutputPaymentData.emit(this.SelectedPaymentArray);
  }

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
      } else if (s.scheduleStatus == "Cancelled") {
        s.status_class = "schdl_canceled";
      } else if (s.scheduleStatus == "Completed") {
        s.status_class = "schdl_completed";
      } else if (s.scheduleStatus == "Failed") {
        s.status_class = "schdl_failed";
      } else if (s.scheduleStatus == "Pending") {
        s.status_class = "schdl_pending";
      } else if (s.scheduleStatus == "Scheduled") {
        s.status_class = "schdl_scheduled";
      } else if (s.scheduleStatus == "Paused") {
        s.status_class = "schdl_paused";
      }
      if (!s.paymentId) {
        s.paymentId = s.pledgeId;
        if (s.scheduleId != null) {
          s.paymentId = s.scheduleId;
          s.paymentType = s.scheduleType;
          s.paymentStatus = s.scheduleStatus;
          s.paymentDate = s.nextScheduleDate;
        }
      }
    });
    this.gridData = PaymentCardValue;
    this.gridFilterData = this.gridData;
    this.showArrow = this.gridFilterData.length <= 5 ? false : true;
    this.isloading = false;
  }

  setGridColVisibility($event, colName, isVisible) {
    colName = colName.toLowerCase().replace(/\s/g, "");
    switch (colName) {
      case "receiptnum":
        this.isPaymentReceiptNoColVisible = isVisible;
        break;
      case "paymentdate":
        this.isPaymentDateColVisible = isVisible;
        break;
      case "transactiontype":
        this.isTransactionTypeColVisible = isVisible;
        break;
      case "amount":
        this.isPaymentAmountColVisible = isVisible;
        break;
      case "paymenttype":
        return this.isPaymentTypeColVisible;
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
      case "transactiontype":
        return this.isTransactionTypeColVisible;
      case "amount":
        return this.isPaymentAmountColVisible;
      case "paymenttype":
        return this.isPaymentTypeColVisible;
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
    }
  }

  closePopup() {
    this.activeModal.dismiss();
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
            (obj.transactionType &&
              obj.transactionType
                .toString()
                .toLowerCase()
                .indexOf(searchValue) > -1) ||
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
}
