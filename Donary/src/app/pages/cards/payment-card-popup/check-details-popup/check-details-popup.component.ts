import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  inject,
} from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import Swal from "sweetalert2";

import { CommonMethodService } from "src/app/commons/common-methods.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { PaymentService } from "src/app/services/payment.service";
import { AnalyticsService } from "src/app/services/analytics.service";

declare var $: any;
@Component({
  selector: "app-check-details-popup",
  templateUrl: "./check-details-popup.component.html",
  standalone: false,
  styleUrls: ["./check-details-popup.component.scss"],
})
export class CheckDetailsPopupComponent implements OnInit {
  refNum: number;
  paymentId: number;

  isloading: boolean = false;

  @Output() emtPaymentCheckUpdate: EventEmitter<any> = new EventEmitter();

  @Input() set RefNum(value: number) {
    if (value) {
      this.refNum = value;
    }
  }

  @Input() set PaymentId(value: number) {
    if (value) {
      this.paymentId = value;
    }
  }
  private analytics = inject(AnalyticsService);

  constructor(
    public activeModal: NgbActiveModal,
    public commonMethodService: CommonMethodService,
    private localstoragedataService: LocalstoragedataService,
    private paymentService: PaymentService
  ) {}

  ngOnInit() {
    $(document).ready(function () {
      let modalContent: any = $(".modal");
      modalContent.draggable({
        handle: ".modal__custom_header",
      });
    });
  }

  closePopup() {
    this.activeModal.dismiss();
  }

  SaveCheckInfo() {
    const obj = {
      PaymentId: this.paymentId,
      MacAddress: this.localstoragedataService.getLoginUserGuid(),
      RefNum: this.refNum,
      UpdatedBy: this.localstoragedataService.getLoginUserId(),
    };
    this.isloading = true;
    this.paymentService.UpdatePayment(obj).subscribe(
      (res: any) => {
        this.analytics.editedPayment();
        this.isloading = false;
        this.closePopup();

        if (res) {
          Swal.fire({
            title: this.commonMethodService.getTranslate(
              "WARNING_SWAL.SUCCESS_TITLE"
            ),
            text: res.message,
            icon: "success",
            confirmButtonText: this.commonMethodService.getTranslate(
              "WARNING_SWAL.BUTTON.CONFIRM.OK"
            ),
            customClass: {
              confirmButton: "btn_ok",
            },
          }).then(() => {
            this.emtPaymentCheckUpdate.emit(true);
          });
        } else {
          Swal.fire({
            title: this.commonMethodService.getTranslate(
              "WARNING_SWAL.SOMETHING_WENT_WRONG"
            ),
            text: res.message,
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
      (err) => {
        this.isloading = false;
        console.log(err);
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

  checkLocationName() {
    return true;
  }
}
