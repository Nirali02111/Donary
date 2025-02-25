import { Component, OnInit } from "@angular/core";
import { Input } from "@angular/core";
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { NgbActiveModal, NgbModalOptions } from "@ng-bootstrap/ng-bootstrap";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { DonorService } from "src/app/services/donor.service";
import { CampaignService } from "src/app/services/campaign.service";
import { MessengerService } from "src/app/services/messenger.service";
import Swal from "sweetalert2";
import { PdfviewerPopupComponent } from "../../cards/payment-card-popup/pdfviewer-popup/pdfviewer-popup.component";
import { ReasonService } from "src/app/services/reason.service";
import * as moment from "moment";
@Component({
  selector: "app-bulk-reason-report",
  templateUrl: "./bulk-reason-report.component.html",
  styleUrls: ["./bulk-reason-report.component.scss"],
  standalone: false,
})
export class BulkReasonReportComponent implements OnInit {
  isloading: boolean = false;

  modalOptions: NgbModalOptions;
  customReportActionForm: UntypedFormGroup;

  donorList: Array<number> = [];

  stateList: Array<{ label: string; value: string }> = [
    {
      label: "Reason Report",
      value: "1",
    },
  ];
  @Input("selectedDateRange") selectedDateRange?: any;
  @Input() set SelectedIds(list: Array<number>) {
    if (list && list.length !== 0) {
      this.donorList = list;
    }
  }

  constructor(
    public activeModal: NgbActiveModal,
    private fb: UntypedFormBuilder,
    private messengerService: MessengerService,
    private localstoragedataService: LocalstoragedataService,
    private donorService: DonorService,
    public commonMethodService: CommonMethodService,
    private campaignService: CampaignService,
    private reasonService: ReasonService
  ) {}

  get ActionControl() {
    return this.customReportActionForm.get("action");
  }

  ngOnInit() {
    this.customReportActionForm = this.fb.group({
      action: this.fb.control("", Validators.required),
    });
  }

  closePopup() {
    this.activeModal.dismiss();
  }

  onSubmit() {
    if (this.ActionControl.invalid) {
      return;
    }

    if (this.ActionControl.value === "1") {
      this.getReasonReport();
    }
  }

  onColumn() {
    const params = {
      EventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      AccountIds: this.donorList,
    };
    const modalRef = this.displayReport();
    this.donorService.getDonorColumns(params).subscribe(
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

  onLabels() {
    const params = {
      EventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      AccountIds: this.donorList,
    };
    const modalRef = this.displayReport();
    this.donorService.getDonorLabels(params).subscribe(
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

  displayReport() {
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
  getPledgeBalanceDropdown() {
    const params = {
      EventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      AccountIds: this.donorList,
    };
    const modalRef = this.displayReport();
    this.donorService.getPledgeBalance(params).subscribe(
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
  getReasonReport() {
    const params = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      reasonIds: this.donorList,
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
    const modalRef = this.displayReport();
    this.reasonService.getReasonReport(params).subscribe(
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

  isRunBtnDisable = true;
  onOptionsSelected() {
    console.log("the selected value is " + this.ActionControl.value);
    if (this.ActionControl.value > 0) {
      this.isRunBtnDisable = false;
    } else {
      this.isRunBtnDisable = true;
    }
  }
}
