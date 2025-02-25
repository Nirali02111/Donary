import { Component, Input, OnInit } from "@angular/core";
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { NgbActiveModal, NgbModalOptions } from "@ng-bootstrap/ng-bootstrap";
import * as moment from "moment";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { LocationService } from "src/app/services/location.sevice";

import Swal from "sweetalert2";

import { PdfviewerPopupComponent } from "../../cards/payment-card-popup/pdfviewer-popup/pdfviewer-popup.component";
declare var $: any;

@Component({
  selector: "app-bulk-custom-report",
  templateUrl: "./bulk-custom-report.component.html",
  standalone: false,
  styleUrls: ["./bulk-custom-report.component.scss"],
})
export class BulkCustomReportComponent implements OnInit {
  isloading: boolean = false;

  modalOptions: NgbModalOptions;
  customReportActionForm: UntypedFormGroup;

  donorList: Array<number> = [];

  selectedDateRange: any;
  selectList;
  bulkDonorList: any = [];
  includeTotals: boolean = false;
  isRunBtnDisable = true;
  customRepostList = [{ id: "1", itemName: "Location Report" }];
  @Input() set SelectedIds(list: Array<number>) {
    if (list && list.length !== 0) {
      this.donorList = list;
    }
  }

  @Input() set SelectedDateRange(list) {
    this.selectedDateRange = list;
  }

  constructor(
    public activeModal: NgbActiveModal,
    private fb: UntypedFormBuilder,
    private localstoragedataService: LocalstoragedataService,
    private locationService: LocationService,
    public commonMethodService: CommonMethodService
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
    if (this.ActionControl.value[0].id === "1") {
      this.getLocationsReport();
    }
  }
  onDeSelectAll(event) {}
  OnItemDeSelect(item: any) {
    if (this.selectList && this.selectList.length > 0) {
      this.isRunBtnDisable = false;
    } else {
      this.isRunBtnDisable = true;
    }
  }
  getLocationsReport() {
    const params = {
      EventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      LocationIds: this.donorList,
      FromDate:
        this.selectedDateRange != undefined
          ? this.selectedDateRange.startDate != null
            ? moment(this.selectedDateRange.startDate).format("YYYY-MM-DD")
            : null
          : null,
      ToDate:
        this.selectedDateRange != undefined
          ? this.selectedDateRange.endDate != null
            ? moment(this.selectedDateRange.endDate).format("YYYY-MM-DD")
            : null
          : null,
    };
    const modalRef = this.displayReport();
    this.locationService.getLocationsReport(params).subscribe(
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
  onItemSelect(item: any) {
    if (this.selectList && this.selectList.length > 0) {
      this.isRunBtnDisable = false;
    } else {
      this.isRunBtnDisable = true;
    }
  }
}
