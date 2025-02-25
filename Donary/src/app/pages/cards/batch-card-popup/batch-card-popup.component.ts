import { Component, inject, Input, OnInit } from "@angular/core";
import { NgbActiveModal, NgbModalOptions } from "@ng-bootstrap/ng-bootstrap";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { DonorAddtagPopupComponent } from "../../donor/donor-addtag-popup/donor-addtag-popup.component";
import { CardService } from "src/app/services/card.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { BatchService } from "src/app/services/batch.service";
import Swal from "sweetalert2";
import { TagService } from "src/app/services/tag.service";
import { PaymentCardPopupComponent } from "../payment-card-popup/payment-card-popup.component";
import { DonorCardPopupComponent } from "../donor-card-popup/donor-card-popup.component";
import { AnalyticsService } from "src/app/services/analytics.service";
declare var $: any;

@Component({
  selector: "app-batch-card-popup",
  templateUrl: "./batch-card-popup.component.html",
  styleUrls: ["./batch-card-popup.component.scss"],
  standalone: false,
})
export class BatchCardPopupComponent implements OnInit {
  totalAmount: number;
  paymentType: string;
  dateRange: string;
  batchNum: string;
  status: string;
  createdDate: string;
  batchedBy: string;
  note: string;
  batchTransactions: Array<any> = [];
  badgeToggle = false;
  modalOptions: NgbModalOptions;
  isloading: boolean = false;
  gridData: any;
  batchstatus: string;
  donaryBatchNum: any;
  gatewayTransactionIdsArray: any[];
  isArchived: any;
  gateway: any;
  gatewayBatchNum: any;
  batchId: any;
  modal: any;
  tagsLists: any;
  tagId: number = 61;
  isCardStatus: boolean = false;
  activeTab: number;
  tagName: any = "";
  window_class = "drag_popup donor_card father_card";
  isDownloadIFFVisible: boolean = false;
  showButtons = false;
  initialNote: string;
  skeletoncolitems = [{}, {}, {}];
  refundedStatus: string = "Refunded";

  @Input() set TagList(TagList: any) {
    this.tagsLists = TagList;
  }

  @Input() set BatchCardData(BatchCardData: any) {
    this.isCardStatus = true;
    if (BatchCardData) {
      this.isloading = true;
      this.gridData = BatchCardData;
      this.batchId = BatchCardData.batchId;
      //this.batchstatus = this.status;
      this.totalAmount = BatchCardData.totalAmount;
      this.paymentType = BatchCardData.paymentType;
      this.dateRange = BatchCardData.dateRange;
      this.batchNum = BatchCardData.batchNum;
      this.status = BatchCardData.status;
      this.createdDate = BatchCardData.createdDate;
      this.batchedBy = BatchCardData.batchedBy;
      this.gateway = BatchCardData.gateway;
      this.tagName = BatchCardData.bankName;
      this.batchTransactions = BatchCardData.batchTransactions;
      this.note = BatchCardData.note;
      this.initialNote = BatchCardData.note;
      this.gatewayTransactionIdsArray = this.batchTransactions.map(
        (payment) => payment.gatewayTransactionId
      );
      // this.gatewayTransactionIdsArray = this.batchTransactions.map(payment => {
      //   // Use default value (e.g., -1) or handle null in a way that suits your application
      //   return payment.gatewayTransactionId !== null ? payment.gatewayTransactionId : -1;
      // });
      this.isloading = false;
    }
  }
  private analytics = inject(AnalyticsService);

  constructor(
    public activeModal: NgbActiveModal,
    public commonMethodService: CommonMethodService,
    private localstoragedataService: LocalstoragedataService,
    private cardService: CardService,
    public batchService: BatchService,
    public tagService: TagService
  ) {}
  @Input() set BatchData(BatchData: any) {
    this.donaryBatchNum = BatchData.donaryBatchNum;
    this.isArchived = BatchData.isArchived;
    this.gatewayBatchNum = BatchData.gatewayBatchNum;
  }
  ngOnInit() {
    this.isloading = true;
    $(document).ready(function () {
      let modalContent: any = $(".modal");
      modalContent.draggable({
        handle: ".pop-header",
        cursor: "grab",
      });
    });
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
        windowClass: "drag_popup donor_card modal_responsive batch_card_index",
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
  closePopup() {
    this.activeModal.dismiss();
  }
  tags = [
    {
      id: 1,
      name: "Capital One",
    },
    { id: 2, name: "Discover" },
    {
      id: 3,
      name: "TD Bank",
    },
    {
      id: 4,
      name: "Chase",
    },
    {
      id: 5,
      name: "Donary Bank",
    },
  ];

  selectedTag = this.tags[0].name;
  customButtonClick() {}
  isArchive(event, content) {
    var archiveformData = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      updatedBy: this.localstoragedataService.getLoginUserId(),
      macAddress: this.localstoragedataService.getLoginUserGuid(),
      donaryBatchID: this.batchId,
    };
    this.modal.close();
    this.batchService.getArchiveBatch(archiveformData).subscribe((res: any) => {
      if (res) {
        this.analytics.ArchivedBatch();
        event.preventDefault();
        this.commonMethodService.openPopup(content, {
          centered: true,
          backdrop: "static",
          keyboard: false,
          windowClass: "modal-archive-batch modal-archive-success",
          size: "sm",
          scrollable: true,
        });
        var formData = {
          eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
          batchId: this.batchId,
          gatewayBatchNum: null,
        };
        this.isloading = true;
        this.batchService.getBatchCard(formData).subscribe((res: any) => {
          if (res) {
            this.isloading = false;
            this.status = res.status;
          }
        });
      }
      this.commonMethodService.sendBatch(true);
    });
  }
  statusClass(status: any) {
    var statusClass;
    if (status == "Batched") {
      statusClass = "badge-batched";
    } else if (status === "UnBatched") {
      statusClass = "badge-unbatched";
    } else if (status === "Archived") {
      statusClass = "badge-archived";
    } else if (status === "Deposited") {
      statusClass = "badge-deposited";
    }
    return statusClass;
  }
  search(keyword) {
    //this.isloading=true;
    var record = this.gridData.batchTransactions;

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
        this.batchTransactions = filterdRecord;
        //  record=this.gridFilterData;
      }
    } else {
      this.batchTransactions = this.gridData;
    }
    this.isloading = false;
  }

  toggleButtons(value) {
    if (value) this.showButtons = value;
    else setTimeout(() => (this.showButtons = value), 300);
  }

  CloseDropdown(event) {
    if (event) {
      this.badgeToggle = false;
    }
  }
  SaveNote(tagUpdated) {
    let objSavebatch = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      macAddress: this.localstoragedataService.getLoginUserGuid(),
      batchNote: this.note,
      updatedBy: this.localstoragedataService.getLoginUserId(),
      donaryBatchID: this.batchId,
      batchStatus: this.status,
      gatewayTransactionIDs: null,
      tagId: this.tagId,
    };
    this.batchService.saveBatch(objSavebatch).subscribe(
      (res: any) => {
        if (res && !tagUpdated) {
          Swal.fire({
            title: "Batch Saved successfully",
            icon: "success",
            confirmButtonText: this.commonMethodService.getTranslate(
              "WARNING_SWAL.BUTTON.CONFIRM.OK"
            ),
            customClass: {
              confirmButton: "btn_ok",
            },
          });
          this.initialNote = this.note;
          //  this.emtEditPayment.emit(res);
          // this.commonMethodService.sendPaymentTrans(true);
        }
      },
      (error) => {
        Swal.fire({
          title: this.commonMethodService.getTranslate(
            "WARNING_SWAL.SOMETHING_WENT_WRONG"
          ),
          text: error.error,
          icon: "error",
          confirmButtonText: this.commonMethodService.getTranslate(
            "WARNING_SWAL.BUTTON.CONFIRM.OK"
          ),
          customClass: {
            confirmButton: "btn_ok",
          },
        });
        this.isloading = false;
      }
    );
  }
  onClick(event, content) {
    event.preventDefault();
    this.modal = this.commonMethodService.openPopup(content, {
      centered: true,
      backdrop: "static",
      keyboard: false,
      windowClass: "modal-archive-batch",
      size: "sm",
      scrollable: true,
    });
  }

  openDepositBatch(event, content) {
    this.isloading = true;
    var objSavebatch = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      macAddress: this.localstoragedataService.getLoginUserGuid(),
      batchNote: this.note,
      updatedBy: this.localstoragedataService.getLoginUserId(),
      donaryBatchID: this.batchId,
      batchStatus: "Deposited",
      gatewayTransactionIDs: null,
      tagId: this.tagId,
    };
    this.batchService.saveBatch(objSavebatch).subscribe(
      (res: any) => {
        this.isloading = false;
        this.analytics.DepositedBatch();

        this.modal = this.commonMethodService.openPopup(content, {
          centered: true,
          backdrop: "static",
          keyboard: false,
          windowClass: "modal-archive-batch",
          size: "sm",
          scrollable: true,
        });

        var formData = {
          eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
          batchId: this.batchId,
          gatewayBatchNum: null,
        };
        this.isloading = true;
        this.batchService.getBatchCard(formData).subscribe(
          (res: any) => {
            if (res) {
              this.isloading = false;
              this.status = res.status;
            }
            this.commonMethodService.sendBatch(true);
          },
          () => (this.isloading = false)
        );
      },
      (err) => (this.isloading = false)
    );
  }

  CancelNote() {
    this.note = this.initialNote;
  }

  onSelectTag(tagId: number, tagName: any) {
    this.tagId = tagId;
    this.activeTab = tagId;
    this.tagName = tagName.replace(":", "");
    this.SaveNote(true);
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
      this.tagsLists.push({ ...res });
    });
  }

  addClassForTransactions(active) {
    active
      ? $(".modal").addClass("modal-tab-transection")
      : $(".modal").removeClass("modal-tab-transection");
  }
}
