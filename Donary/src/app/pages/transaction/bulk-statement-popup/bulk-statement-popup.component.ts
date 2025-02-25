import { Component, Input, OnInit } from "@angular/core";
import { NgbActiveModal, NgbModalOptions } from "@ng-bootstrap/ng-bootstrap";
import * as moment from "moment";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { MessengerService } from "src/app/services/messenger.service";
import Swal from "sweetalert2";
import { PrintReceiptPopupComponent } from "../../transaction/receipt-actions/print-receipt-popup/print-receipt-popup.component";
import { PrintSingleReceiptPopupComponent } from "../receipt-actions/print-singlereceipt-popup/print-singlereceipt-popup.component";

@Component({
  selector: "app-bulk-statement-popup",
  templateUrl: "./bulk-statement-popup.component.html",
  standalone: false,
  styleUrls: ["./bulk-statement-popup.component.scss"],
})
export class BulkStatementPopupComponent implements OnInit {
  modalOptions: NgbModalOptions;
  selectedDateRange: any;
  recordSelectedArray: any = [];
  isSelected: boolean;
  minBalance: number;
  maxBalance: number;
  isloading: boolean = false;
  statementType: any;
  statementTypeList: Array<{ id: string; itemName: string }> = [
    {
      id: "StatementWithNotes",
      itemName: "Statement With Notes",
    },
  ];

  @Input() set SelectedId(data) {
    if (data) {
      this.recordSelectedArray = data;
    }
  }

  constructor(
    public activeModal: NgbActiveModal,
    public commonMethodService: CommonMethodService,
    public localstoragedataService: LocalstoragedataService,
    public messengerService: MessengerService
  ) {}

  ngOnInit() {}

  closePopup() {
    this.activeModal.dismiss();
    this.commonMethodService.selectedPaymentReasons = [];
    this.commonMethodService.selectedPaymentLocations = [];
    this.commonMethodService.selectedFromCampaignList = [];
    this.commonMethodService.selectedPaymentCollectors = [];
  }

  datesUpdated(event) {
    this.isSelected = false;
  }

  isOnlyPledgePayment: boolean = false;
  Print() {
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup print_receipt",
    };
    var paymentIds = this.recordSelectedArray;
    var objAdvancedSearch = {
      reasonIds:
        this.commonMethodService.selectedPaymentReasons.length > 0
          ? this.commonMethodService.selectedPaymentReasons.map((s) => s.id)
          : null,
      collectorIds:
        this.commonMethodService.selectedPaymentCollectors.length > 0
          ? this.commonMethodService.selectedPaymentCollectors.map((s) => s.id)
          : null,
      locationIds:
        this.commonMethodService.selectedPaymentLocations.length > 0
          ? this.commonMethodService.selectedPaymentLocations.map((s) => s.id)
          : null,
      campaignIds:
        this.commonMethodService.selectedFromCampaignList.length > 0
          ? this.commonMethodService.selectedFromCampaignList.map((s) => s.id)
          : null,
    };
    let objMailReceipt = {
      type: "Statement",
      id: paymentIds[0],
      queueId: 0,
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
      requestId: "",
      StatementSpecificFilters: objAdvancedSearch,
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      statementType:
        this.statementType === undefined || this.statementType === null
          ? "StatementWithNotes"
          : this.statementType[0].id,
      isOnlyPledgePayment: this.isOnlyPledgePayment,
    };

    if (paymentIds.length < 50) {
      const modalRef = this.commonMethodService.openPopup(
        PrintSingleReceiptPopupComponent,
        this.modalOptions
      );
      this.messengerService.PrintReceipt(objMailReceipt).subscribe(
        (res: any) => {
          this.isloading = false;
          if (res) {
            modalRef.componentInstance.fileDetails = {
              filename: res.receiptFileUrl,
              filetype: res.contentType,
            };
          } else {
            Swal.fire({
              title: "Try Again!",
              text: res.errorResponse,
              icon: "error",
              confirmButtonText: this.commonMethodService.getTranslate(
                "WARNING_SWAL.BUTTON.CONFIRM.OK"
              ),
              customClass: {
                confirmButton: "btn_ok",
              },
            });
          }
        },
        (error) => {
          this.isloading = false;
          console.log(error);
          modalRef.close(PrintReceiptPopupComponent);
          Swal.fire({
            title: "Error while fetching data !!",
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
    } else {
      Swal.fire({
        title: "Print Receipt",
        text: `Receipts will be send to ${this.localstoragedataService.getLoginUserEmail()}`,
        icon: "info",
        showCancelButton: true,
        confirmButtonText: "Process",
        confirmButtonColor: "#7b5bc4",
        cancelButtonText: "Cancel",
      }).then((result) => {
        // On Confirm
        if (result.isConfirmed) {
          this.isloading = true;
          this.messengerService.PrintReceipt(objMailReceipt).subscribe(
            (res: any) => {
              this.isloading = false;
              if (res) {
                Swal.fire({
                  title: this.commonMethodService.getTranslate(
                    "WARNING_SWAL.SUCCESS_TITLE"
                  ),
                  text: res,
                  icon: "success",
                  confirmButtonText: this.commonMethodService.getTranslate(
                    "WARNING_SWAL.BUTTON.CONFIRM.OK"
                  ),
                  customClass: {
                    confirmButton: "btn_ok",
                  },
                });
              } else {
                Swal.fire({
                  title: "Try Again!",
                  text: res.errorResponse,
                  icon: "error",
                  confirmButtonText: this.commonMethodService.getTranslate(
                    "WARNING_SWAL.BUTTON.CONFIRM.OK"
                  ),
                  customClass: {
                    confirmButton: "btn_ok",
                  },
                });
              }
            },
            (error) => {
              this.isloading = false;
              console.log(error);
              Swal.fire({
                title: "Error while fetching data !!",
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
        } else if (result.dismiss === Swal.DismissReason.cancel) {
        }
      });
    }
  }
}
