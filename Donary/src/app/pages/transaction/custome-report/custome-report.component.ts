import { Component, Input, OnInit } from "@angular/core";
import {
  UntypedFormGroup,
  UntypedFormBuilder,
  Validators,
} from "@angular/forms";
import { NgbModalOptions, NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import * as moment from "moment";
import Swal from "sweetalert2";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { DonorService } from "src/app/services/donor.service";
import { PaymentTransactionService } from "src/app/services/payment-transaction.service";

import { PdfviewerPopupComponent } from "../../cards/payment-card-popup/pdfviewer-popup/pdfviewer-popup.component";

@Component({
  selector: "app-custome-report",
  templateUrl: "./custome-report.component.html",
  styleUrls: ["./custome-report.component.scss"],
  standalone: false,
})
export class CustomeReportComponent implements OnInit {
  isloading: boolean = false;

  modalOptions: NgbModalOptions;
  customReportActionForm: UntypedFormGroup;

  donorList: Array<number> = [];
  stateList: Array<{ label: string; value: string }> = [];
  selectedDateRange: any = {
    startDate: moment(new Date()).startOf("week"),
    endDate: moment(new Date()).endOf("week"),
  };

  @Input() set SelectedIds(list: Array<number>) {
    if (list && list.length !== 0) {
      this.donorList = list;
    }
  }
  @Input() set DropDownOptions(list: Array<any>) {
    this.stateList = list;
  }
  @Input() set selectedDate(list: any) {
    this.selectedDateRange = list;
  }

  get ActionControl() {
    return this.customReportActionForm.get("action");
  }

  constructor(
    public activeModal: NgbActiveModal,
    private fb: UntypedFormBuilder,
    private localstoragedataService: LocalstoragedataService,
    private paymentTransactionService: PaymentTransactionService,
    private donorService: DonorService,
    public commonMethodService: CommonMethodService
  ) {}

  ngOnInit() {
    this.customReportActionForm = this.fb.group({
      action: this.fb.control("", Validators.required),
      selectedDateRange: this.fb.control("", Validators.required),
    });
    this.customReportActionForm.patchValue({
      selectedDateRange: {
        startDate: moment(new Date()).startOf("week"),
        endDate: moment(new Date()).endOf("week"),
      },
    });
    this.customReportActionForm.updateValueAndValidity();
  }

  closePopup() {
    this.activeModal.dismiss();
  }

  onSubmit() {
    if (this.ActionControl.invalid) {
      return;
    }

    if (this.ActionControl.value === "Generate Payment Report") {
      if (this.donorList.length < 500) {
        this.getPaymentTransactionsReport();
      } else {
        Swal.fire({
          title: "Print Receipt",
          text: `Report will be send to ${this.localstoragedataService.getLoginUserEmail()}`,
          icon: "info",
          showCancelButton: true,
          confirmButtonText: "Proceed",
          confirmButtonColor: "#7b5bc4",
          cancelButtonText: this.commonMethodService.getTranslate("CANCEL"),
        }).then((result) => {
          // On Confirm
          if (result.isConfirmed) {
            this.getPaymentTransactionsReport();
            this.closePopup();
          } else if (result.dismiss === Swal.DismissReason.cancel) {
          }
        });
      }
    }
    if (this.ActionControl.value === "Generate Pledge Report") {
      if (this.donorList.length < 500) {
        this.getPledgeReport();
      } else {
        Swal.fire({
          title: "Print Receipt",
          text: `Report will be send to ${this.localstoragedataService.getLoginUserEmail()}`,
          icon: "info",
          showCancelButton: true,
          confirmButtonText: "Proceed",
          confirmButtonColor: "#7b5bc4",
          cancelButtonText: this.commonMethodService.getTranslate("CANCEL"),
        }).then((result) => {
          // On Confirm
          if (result.isConfirmed) {
            this.getPledgeReport();
            this.closePopup();
          } else if (result.dismiss === Swal.DismissReason.cancel) {
          }
        });
      }
    }

    if (
      ["NameEng", "NameHeb", "ReceiptNum"].includes(this.ActionControl.value)
    ) {
      if (this.donorList.length < 500) {
        this.getSortByPaymentTransactionsReport(this.ActionControl.value);
      } else {
        Swal.fire({
          title: "Print Receipt",
          text: `Report will be send to ${this.localstoragedataService.getLoginUserEmail()}`,
          icon: "info",
          showCancelButton: true,
          confirmButtonText: "Proceed",
          confirmButtonColor: "#7b5bc4",
          cancelButtonText: this.commonMethodService.getTranslate("CANCEL"),
        }).then((result) => {
          // On Confirm
          if (result.isConfirmed) {
            this.getSortByPaymentTransactionsReport(this.ActionControl.value);
            this.closePopup();
          } else if (result.dismiss === Swal.DismissReason.cancel) {
          }
        });
      }
    }
  }

  displayReport() {
    if (this.donorList && this.donorList.length < 500) {
      this.modalOptions = {
        centered: true,
        size: "lg",
        backdrop: "static",
        keyboard: true,
        windowClass: "drag_popup print_receipt",
      };
      const modalRef = this.commonMethodService.openPopup(
        PdfviewerPopupComponent,
        this.modalOptions
      );
      modalRef.componentInstance.Title = "Document print";
      return modalRef;
    }
  }
  getPaymentTransactionsReport() {
    const params = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      paymentIds: this.donorList,
      fromDate:
        this.selectedDateRange.startDate != null
          ? moment(this.selectedDateRange.startDate).format("YYYY-MM-DD")
          : null,
      toDate:
        this.selectedDateRange.endDate != null
          ? moment(this.selectedDateRange.endDate).format("YYYY-MM-DD")
          : null,
      email:
        this.donorList && this.donorList.length > 500
          ? this.localstoragedataService.getLoginUserEmail()
          : null,
    };
    const modalRef = this.displayReport();
    this.paymentTransactionService.getTransactionsReport(params).subscribe(
      (res) => {
        if (res) {
          modalRef.componentInstance.filePath = res;
        }
      },
      (error) => {
        modalRef.close();
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
      }
    );
  }

  getPledgeReport() {
    this.isloading = true;
    const params = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      pledgeIds: this.donorList,
      fromDate:
        this.selectedDateRange && this.selectedDateRange.startDate != null
          ? moment(this.selectedDateRange.startDate).format("YYYY-MM-DD")
          : null,
      toDate:
        this.selectedDateRange && this.selectedDateRange.endDate != null
          ? moment(this.selectedDateRange.endDate).format("YYYY-MM-DD")
          : null,
      email:
        this.donorList && this.donorList.length > 500
          ? this.localstoragedataService.getLoginUserEmail()
          : null,
    };

    this.donorService.getPledgeBalance(params).subscribe(
      (res) => {
        this.isloading = false;
        if (res) {
          if (res.toString().includes("pdf")) {
            const modalRef = this.displayReport();
            modalRef.componentInstance.filePath = res;
          } else {
            res = res
              .toString()
              .replace(
                "login user",
                this.localstoragedataService.getLoginUserFullName()
              );
            Swal.fire({
              title: res.toString(),
              icon: "info",
              confirmButtonText: this.commonMethodService.getTranslate(
                "WARNING_SWAL.BUTTON.CONFIRM.OK"
              ),
              customClass: {
                confirmButton: "btn_ok",
                container: "email-info",
              },
            });
          }
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
      }
    );
  }
  datesUpdated(event) {}

  isRunBtnDisable = true;
  onOptionsSelected() {
    if (this.ActionControl.value != "0") {
      this.isRunBtnDisable = false;
    } else {
      this.isRunBtnDisable = true;
    }
  }
  getSortByPaymentTransactionsReport(sortBy: string) {
    const params = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      paymentIds: this.donorList,
      fromDate:
        this.selectedDateRange.startDate != null
          ? moment(this.selectedDateRange.startDate).format("YYYY-MM-DD")
          : null,
      toDate:
        this.selectedDateRange.endDate != null
          ? moment(this.selectedDateRange.endDate).format("YYYY-MM-DD")
          : null,
      sortBy: sortBy,
      email:
        this.donorList && this.donorList.length > 500
          ? this.localstoragedataService.getLoginUserEmail()
          : null,
    };
    const modalRef = this.displayReport();
    this.paymentTransactionService.getTransactionsReport(params).subscribe(
      (res) => {
        if (res) {
          modalRef.componentInstance.filePath = res;
        }
      },
      (error) => {
        modalRef.close();
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
        console.log(error);
      }
    );
  }
}
