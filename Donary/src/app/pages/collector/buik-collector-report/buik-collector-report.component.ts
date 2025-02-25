import { Component, Input, OnInit } from "@angular/core";
import {
  UntypedFormGroup,
  UntypedFormBuilder,
  Validators,
} from "@angular/forms";
import { NgbModalOptions, NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import * as moment from "moment";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { CampaignService } from "src/app/services/campaign.service";
import { CollectorService } from "src/app/services/collector.service";
import { DonorService } from "src/app/services/donor.service";
import { MessengerService } from "src/app/services/messenger.service";
import Swal from "sweetalert2";
import { PdfviewerPopupComponent } from "../../cards/payment-card-popup/pdfviewer-popup/pdfviewer-popup.component";

@Component({
  selector: "app-buik-collector-report",
  templateUrl: "./buik-collector-report.component.html",
  standalone: false,
  styleUrls: ["./buik-collector-report.component.scss"],
})
export class BuikCollectorReportComponent implements OnInit {
  isloading: boolean = false;

  modalOptions: NgbModalOptions;
  customReportActionForm: UntypedFormGroup;

  donorList: Array<number> = [];

  stateList: Array<{ label: string; value: string }> = [
    {
      label: "Collector Report",
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
    private collectorService: CollectorService
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
      this.getCollectorReport();
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
  getCollectorReport() {
    const params = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      collectorIds: this.donorList,
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
    this.collectorService.getCollectorReport(params).subscribe(
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
    if (this.ActionControl.value > 0) {
      this.isRunBtnDisable = false;
    } else {
      this.isRunBtnDisable = true;
    }
  }
}
