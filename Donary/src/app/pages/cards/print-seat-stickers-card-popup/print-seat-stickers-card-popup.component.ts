import { Component, Input, Output, OnInit, EventEmitter } from "@angular/core";
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { NgbActiveModal, NgbModalOptions } from "@ng-bootstrap/ng-bootstrap";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { SeatService } from "src/app/services/seat.service";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { PdfviewerPopupComponent } from "../../cards/payment-card-popup/pdfviewer-popup/pdfviewer-popup.component";
import Swal from "sweetalert2";

@Component({
  selector: "app-print-seat-stickers-card-popup",
  templateUrl: "./print-seat-stickers-card-popup.component.html",
  styleUrls: ["./print-seat-stickers-card-popup.component.scss"],
  standalone: false,
})
export class PrintSeatStickersCardPopupComponent implements OnInit {
  isPrintSeatMap: boolean = false;
  isLoading: boolean = false;
  modalOptions: NgbModalOptions;
  formGroup!: UntypedFormGroup;
  formGroup1!: UntypedFormGroup;

  @Input() set allData(data: any) {
    if (data === "PrintMap") {
      this.isPrintSeatMap = true;
    }
  }
  @Input() seatLocationId: any;
  @Input() seasonId: any;
  @Output() refresh = new EventEmitter();
  @Output() emtMapPrint = new EventEmitter();

  get SeatInfo() {
    return this.formGroup.get("seatInfo");
  }
  get SeatRowCol() {
    return this.formGroup1.get("seatRowCol");
  }
  constructor(
    public activeModal: NgbActiveModal,
    public seatService: SeatService,
    protected localstoragedataService: LocalstoragedataService,
    private fb: UntypedFormBuilder,
    public commonMethodService: CommonMethodService
  ) {}

  ngOnInit() {
    this.iniControl();
    this.seatControl();
  }

  closePopup() {
    this.activeModal.dismiss();
  }

  private iniControl() {
    this.formGroup = this.fb.group({
      eventGuId: this.fb.control(null, Validators.compose([])),
      seatInfo: this.fb.control(null, Validators.compose([])),
    });
  }

  private seatControl() {
    this.formGroup1 = this.fb.group({
      eventGuId: this.fb.control(null, Validators.compose([])),
      seatRowCol: this.fb.control(null, Validators.compose([])),
    });
  }

  onPrint() {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }
    this.doApiCall();
  }

  onMapPrint() {
    if (this.formGroup1.invalid) {
      this.formGroup1.markAllAsTouched();
      return;
    }
    this.emtMapPrint.emit(this.SeatRowCol.value);
    this.closePopup();
  }

  private doApiCall() {
    this.isLoading = true;
    const modalRef = this.displayReport();

    const objPrintSticker = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      seasonId: this.seasonId,
      seatLocationId: this.seatLocationId,
      seatInfo: !this.SeatInfo.value ? null : this.SeatInfo.value,
    };
    this.seatService.printSeatStickers(objPrintSticker).subscribe(
      (res) => {
        if (res) {
          this.isLoading = false;
          this.closePopup();
          modalRef.componentInstance.filePath = res;
          this.refresh.emit(true);
        }
      },
      (err) => {
        this.isLoading = false;
        Swal.fire({
          title: this.commonMethodService.getTranslate(
            "WARNING_SWAL.SOMETHING_WENT_WRONG"
          ),
          text: err.error,
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
}
