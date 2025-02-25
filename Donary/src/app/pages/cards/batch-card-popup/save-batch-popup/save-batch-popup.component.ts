import {
  Component,
  ElementRef,
  Input,
  OnInit,
  QueryList,
  ViewChildren,
  ChangeDetectorRef,
  inject,
} from "@angular/core";
import { NgbActiveModal, NgbModalOptions } from "@ng-bootstrap/ng-bootstrap";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { DonorCardPopupComponent } from "../../donor-card-popup/donor-card-popup.component";
import Swal from "sweetalert2";
import { CardService } from "src/app/services/card.service";
import { BatchService } from "src/app/services/batch.service";
import { PaymentCardPopupComponent } from "../../payment-card-popup/payment-card-popup.component";
import { DonorAddtagPopupComponent } from "src/app/pages/donor/donor-addtag-popup/donor-addtag-popup.component";
import { AnalyticsService } from "src/app/services/analytics.service";

declare var $: any;
@Component({
  selector: "app-save-batch-popup",
  templateUrl: "./save-batch-popup.component.html",
  standalone: false,
  styleUrls: ["./save-batch-popup.component.scss"],
})
export class SaveBatchPopupComponent implements OnInit {
  batchCardData: any;
  recordSelectedArray = [];
  isloading: boolean = false;
  gridData: Array<any>;
  batchId: any;
  batchStatus: any;
  batchNote: any;
  tagName: any = "";
  badgeToggle: boolean = false;
  batchTransactionId: any;
  gridFilterData: Array<any>;
  modalOptions: NgbModalOptions;
  window_class = "drag_popup donor_card father_card";
  checkedData: number = 0;
  amount: number = 0;
  amountPositive: number = 0;
  amountMinus: number = 0;
  @ViewChildren("checkboxes") checkboxes: QueryList<ElementRef>;
  note: string = "";
  tagId: any = "";
  isSaveBatchEnabled: boolean = false;
  gatewayTransactionId: any;
  donaryBatchNum: any;
  batchedStatus: string = "Batched";
  gatewayName: string;
  objSavebatch: any;
  gatewayBatchNum: any;
  skeletonitems = [{}, {}, {}, {}];
  isRowsSelected: boolean = false;
  tagsList: any;
  v2Gateways: string[] = ["cardknox", "pelecard", "banquest", "ojc"];
  activeTab: number;
  recordSelectedGatewarTrans: any = [];
  refundedStatus: string = "Refunded";
  private analytics = inject(AnalyticsService);
  featureName: string = "Finance_save_batch";

  constructor(
    public activeModal: NgbActiveModal,
    public commonMethodService: CommonMethodService,
    private localstoragedataService: LocalstoragedataService,
    private cardService: CardService,
    public batchService: BatchService,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) {}

  @Input() set TagList(TagList: any) {
    this.tagsList = TagList;
  }

  @Input() set BatchCardData(BatchCardData: any) {
    if (BatchCardData) {
      this.isloading = true;
      this.gridData = BatchCardData.batchTransGridModel;

      this.gridFilterData = BatchCardData.batchTransGridModel.map(
        (item: any) => ({
          ...item,
          isRowsSelected: false, // Add isRowsSelected property with value false
        })
      );
      this.tagId = BatchCardData.batchTransGridModel[0].tagId || "";

      this.gatewayTransactionId =
        BatchCardData.batchTransGridModel[0].gatewayTransactionId;
      this.isloading = false;
    } else {
      this.isloading = false;
    }
  }
  @Input() set BatchData(BatchData: any) {
    this.gatewayBatchNum = BatchData.gatewayBatchNum;
    this.batchId = BatchData.batchId;
    this.batchStatus = BatchData.batchStatus;
    this.batchNote = BatchData.batchNote;
    this.batchTransactionId = BatchData.batchTransaction;
    this.donaryBatchNum = BatchData.donaryBatchNum;
    this.gatewayName = BatchData.gatewayName;
  }
  ngOnInit() {
    this.commonMethodService.getFeatureSetting(this.featureName);
    this.isloading = true;
    $(document).ready(function () {
      let modalContent: any = $(".modal");
      modalContent.draggable({
        handle: ".modal-header",
        cursor: "grab",
      });
    });
  }
  CloseDropdown(event) {
    if (event) {
      this.badgeToggle = false;
    }
  }
  closePopup() {
    this.activeModal.dismiss();
  }
  AddNewTag() {
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup addtag add-new-tag-modal",
    };
    const modalRef = this.commonMethodService.openPopup(
      DonorAddtagPopupComponent,
      this.modalOptions
    );

    modalRef.componentInstance.Type = "add";
    modalRef.componentInstance.emtOutputTagUpdate.subscribe((res) => {
      this.tagsList.push({ ...res });
    });
  }
  get isCardknox() {
    return this.gatewayName === "CardKnox";
  }
  selectRecord(event, type, gatewayTransactionId, payment) {
    if (type == "selectAll") {
      if (event.target.checked) {
        //logic to dynamically add class for selected rows
        this.gridFilterData.forEach((element) => {
          element.isRowsSelected = true;
        });
        this.recordSelectedArray = [];
        if (
          this.gatewayName &&
          this.checkV2Gateway(this.gatewayName.toLowerCase())
        ) {
          this.gridFilterData.forEach((element) => {
            const idToPush = this.isCardknox
              ? element.gatewayTransactionId
              : element.paymentId;
            this.recordSelectedArray.push(idToPush);
            this.recordSelectedGatewarTrans.push(element.gatewayTransactionId);
          });
        } else {
          this.gridFilterData.forEach((element) => {
            const idToPush = this.isCardknox
              ? element.gatewayTransactionId
              : element.paymentId;
            this.recordSelectedArray.push(idToPush);
          });
        }
      } else {
        //logic to dynamically remove class for selected rows
        this.gridFilterData.forEach((element) => {
          element.isRowsSelected = false;
        });

        this.checkboxes.forEach((element) => {
          element.nativeElement.checked = false;
        });
        this.recordSelectedArray = [];
      }
    } else {
      if (event.target.checked) {
        //logic to dynamically add class for selected rows
        this.gridFilterData.forEach((element) => {
          if (element.paymentId == payment) {
            element.isRowsSelected = true;
          }
        });

        if (
          this.gatewayName &&
          this.checkV2Gateway(this.gatewayName.toLowerCase())
        ) {
          if (!this.recordSelectedArray.includes(gatewayTransactionId)) {
            this.recordSelectedArray.push(gatewayTransactionId);
            this.recordSelectedGatewarTrans.push(gatewayTransactionId);
          }
        } else {
          if (!this.recordSelectedArray.includes(payment)) {
            this.recordSelectedArray.push(payment);
          }
        }
      } else {
        //logic to dynamically remove class for selected rows
        this.gridFilterData.forEach((element) => {
          if (element.paymentId == payment) {
            element.isRowsSelected = false;
          }
        });

        if (this.checkV2Gateway(this.gatewayName?.toLowerCase())) {
          if (this.recordSelectedArray.includes(gatewayTransactionId)) {
            this.recordSelectedArray.forEach((element, index) => {
              if (element == gatewayTransactionId)
                this.recordSelectedArray.splice(index, 1);
            });
            $("#select_all").prop("checked", false);
          }
        } else {
          if (this.recordSelectedArray.includes(payment)) {
            this.recordSelectedArray.forEach((element, index) => {
              if (element == payment) this.recordSelectedArray.splice(index, 1);
            });
            $("#select_all").prop("checked", false);
          }
        }
      }
    }
    this.isSaveBatchEnabled = this.recordSelectedArray.length > 0;

    this.Totalpayment(this.recordSelectedArray);
    this.changeDetectorRef.detectChanges();
  }

  openPaymentCardPopup(paymentId) {
    if (paymentId != null && paymentId != 0) {
      this.isloading = false;
      this.modalOptions = {
        centered: true,
        size: "lg",
        backdrop: false,
        keyboard: true,
        windowClass:
          "drag_popup payment_card modal_responsive batch_card_index",
      };
      const modalRef = this.commonMethodService.openPopup(
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
      // modalRef.componentInstance.emtRetryPayment.subscribe(($e) => {
      //   this.searchPaymentTransactionsData();
      // });
    }
  }

  checkselectRecord(gatewayTransactionId, paymentId): Boolean {
    if (this.gatewayName === "CardKnox") {
      return this.recordSelectedArray.includes(gatewayTransactionId);
    } else {
      return this.recordSelectedArray.includes(paymentId);
    }
  }

  search(keyword) {
    //this.isloading=true;
    var record = this.gridData;
    var filterdRecord;
    keyword = keyword.toLowerCase();
    if (keyword != "") {
      var searchArray = keyword.split(" ");
      for (var searchValue of searchArray) {
        filterdRecord = record.filter(
          (obj) =>
            (obj.receiptNum &&
              obj.receiptNum.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.paymentType &&
              obj.paymentType.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.refNum &&
              obj.refNum.toString().toLowerCase().indexOf(searchValue) > -1) ||
            (obj.fullNameJewish &&
              obj.fullNameJewish.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.amount &&
              obj.amount.toString().toLowerCase().indexOf(searchValue) > -1) ||
            (obj.fullName &&
              obj.fullName.toString().toLowerCase().indexOf(searchValue) > -1)
        );
        this.gridFilterData = filterdRecord;
        //  record=this.gridFilterData;
      }
    } else {
      this.gridFilterData = this.gridData;
    }
    this.isloading = false;
  }

  OpenDonorCardPopup(accountId, fullNameJewish, fullName) {
    if (!(fullNameJewish == null && fullName == null)) {
      this.window_class =
        "drag_popup donor_card father_card" +
        "_" +
        this.commonMethodService.initialDonorCard;
      // this.navTabId= SecondCardId;
      this.modalOptions = {
        centered: true,
        size: "lg",
        backdrop: "static",
        keyboard: true,
        windowClass: "drag_popup donor_card modal_responsive",
      };

      var objBatchCard = {
        eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
        accountId: accountId,
      };
      this.cardService.getDonorCard(objBatchCard).subscribe((res: any) => {
        if (res) {
          const modalRef = this.commonMethodService.openPopup(
            DonorCardPopupComponent,
            this.modalOptions
          );
          modalRef.componentInstance.AccountId = accountId;
          modalRef.componentInstance.DonorCardData = res;
        } else {
          Swal.fire({
            title: "No data found",
            text: "",
            icon: "error",
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
  }

  Totalpayment(recordSelectedArray) {
    this.checkedData = recordSelectedArray.length;
    let filterData = this.gridData;
    let dataArray = [];
    // Use Array.flatMap to get an array of items for all unique paymentIds in recordSelectedArray
    //  dataArray = recordSelectedArray.flatMap((paymentId) =>
    //   filterData.filter((data) => data.paymentId == paymentId)
    // );

    recordSelectedArray.forEach((paymentId) => {
      if (this.gatewayName === "CardKnox") {
        const filteredItems = filterData.filter(
          (item) => item.gatewayTransactionId === paymentId
        );

        dataArray = dataArray.concat(filteredItems);
      } else {
        const filteredItems = filterData.filter(
          (item) => item.paymentId === paymentId
        );
        dataArray = dataArray.concat(filteredItems);
      }
    });

    let totalAmount = 0;
    let totalPositiveAmount = 0;
    let totalMinusAmount = 0;

    // Iterate through dataArray
    dataArray.forEach((data) => {
      const amountValue = data.amount;
      totalAmount += amountValue;

      if (amountValue < 0) {
        totalMinusAmount += amountValue;
      } else {
        totalPositiveAmount += amountValue;
      }
    });
    this.amount = totalAmount;
    this.amountPositive = totalPositiveAmount;
    this.amountMinus = totalMinusAmount;
  }

  checkV2Gateway(gateway) {
    return this.v2Gateways.includes(gateway);
  }

  SaveBatch() {
    let saveBatchService =
      this.gatewayName && this.checkV2Gateway(this.gatewayName.toLowerCase())
        ? this.batchService.saveBatch
        : this.batchService.saveBatchV1;

    if (
      this.checkV2Gateway(this.gatewayName && this.gatewayName.toLowerCase())
    ) {
      this.objSavebatch = {
        eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
        macAddress: this.localstoragedataService.getLoginUserGuid(),
        batchNote: this.note,
        updatedBy: this.localstoragedataService.getLoginUserId(),
        donaryBatchID: this.batchId,
        batchStatus: this.batchedStatus,
        gatewayTransactionIDs: this.recordSelectedGatewarTrans,
        tagId: this.tagId,
      };
    } else {
      this.objSavebatch = {
        paymentIds: this.recordSelectedArray,
        eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
        macAddress: this.localstoragedataService.getLoginUserGuid(),
        batchNote: this.note,
        updatedBy: this.localstoragedataService.getLoginUserId(),
        donaryBatchID: this.batchId,
      };
    }

    // this.isloading = true;
    saveBatchService.call(this.batchService, this.objSavebatch).subscribe(
      (res: any) => {
        this.isloading = false;
        if (res) {
          this.analytics.closedBatch();
          Swal.fire({
            title: "",
            text: "Batch saved successfully",
            icon: "success",
            confirmButtonText: this.commonMethodService.getTranslate(
              "WARNING_SWAL.BUTTON.CONFIRM.OK"
            ),
            customClass: {
              confirmButton: "btn_ok",
            },
          });

          this.commonMethodService.sendBatch(true);
          this.activeModal.dismiss();
        }
      },
      (error) => {
        console.log(error);
        this.isloading = false;
        Swal.fire({
          title: "Try Again!",
          text: error.error,
          icon: "error",
          confirmButtonText: this.commonMethodService.getTranslate(
            "WARNING_SWAL.BUTTON.CONFIRM.OK"
          ),
          customClass: {
            confirmButton: "btn_ok",
          },
        });
      }
    );
  }

  onSelectTag(tagId: number, tagName: any) {
    this.tagId = tagId;
    this.activeTab = tagId;
    this.tagName = tagName.replace(":", "");
  }
}
