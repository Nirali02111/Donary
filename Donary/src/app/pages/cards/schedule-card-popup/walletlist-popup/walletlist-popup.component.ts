import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { NgbActiveModal, NgbModalOptions } from "@ng-bootstrap/ng-bootstrap";
import { Subject } from "rxjs";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { DonorService } from "src/app/services/donor.service";
import { PaymentService } from "src/app/services/payment.service";
import { ScheduleService } from "src/app/services/schedule.service";
import Swal from "sweetalert2";
import { SavecardPopupComponent } from "../../donor-card-popup/savecard-popup/savecard-popup.component";
declare var $: any;
@Component({
  selector: "app-walletlist-popup",
  templateUrl: "./walletlist-popup.component.html",
  styleUrls: ["./walletlist-popup.component.scss"],
  standalone: false,
})
export class WalletlistPopupComponent implements OnInit {
  modalOptions: NgbModalOptions;
  protected ngUnsubscribe: Subject<void> = new Subject<void>();
  walletList: any = [];
  isloading: boolean = true;
  accountId: number;
  selectedWalletId: string = null;
  scheduleId: number = 0;
  paymentId: number = 0;
  wallet: number;
  isProcess: boolean = false;
  isDisable = true;

  @Output() emtUpdateWallet: EventEmitter<any> = new EventEmitter();
  @Input() set WalletData(data: any) {
    if (data) {
      this.walletList = data;
      this.isloading = false;
    }
  }
  @Input() set AccountId(data: any) {
    if (data) {
      this.accountId = data;
    }
  }
  @Input() set ProccessButton(data: boolean) {
    if (data) {
      this.isProcess = data;
    }
  }
  @Input() set ScheduleId(data: any) {
    if (data) {
      this.scheduleId = data;
    }
  }
  @Input() set PaymentId(data: any) {
    if (data) {
      this.paymentId = data;
    }
  }

  @Input() set DeclinedWalletId(data: any) {
    this.walletList.sort((x, y) => {
      return x.walletId === data ? -1 : y.code === data ? 1 : 0;
    });
    this.walletList.forEach((element) => {
      if (element.walletId == data) {
        element.declined = true;
      }
    });
  }
  @Input() set SelectedWallet(data: any) {
    if (data) {
      this.wallet = data;
      this.selectedWalletId = data;
      var haswallet = this.walletList.filter(
        (x) => x.walletId == this.selectedWalletId
      );
      //this.walletList.unshift(haswallet);
      this.isDisable = haswallet.length > 0 ? false : true;
    }
  }

  constructor(
    public activeModal: NgbActiveModal,
    public commonMethodService: CommonMethodService,
    public localstoragedataService: LocalstoragedataService,
    public scheduleService: ScheduleService,
    public paymentService: PaymentService,
    private donorService: DonorService
  ) {}

  ngOnInit() {
    this.getFeatureSettingValues();
    $(document).ready(function () {
      let modalContent: any = $(".modal");
      modalContent.draggable({
        handle: ".modal__custom_header",
      });
    });
    this.isloading = false;
  }

  closePopup() {
    this.activeModal.dismiss();
  }
  EditWallet(type, walletId) {
    this.isloading = false;
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup edit_wallet",
    };

    if (type == "add") {
      const modalRef = this.commonMethodService.openPopup(
        SavecardPopupComponent,
        this.modalOptions
      );
      modalRef.componentInstance.Type = type;
      modalRef.componentInstance.AccountId = this.accountId;
      modalRef.componentInstance.emtSaveWallet.subscribe((res) => {
        if (res) {
          this.isloading = true;
          var eventGuId = this.localstoragedataService.getLoginUserEventGuId();
          this.donorService
            .getWalletByAccountId(eventGuId, this.accountId)
            .subscribe((res: any) => {
              // hide loader
              this.isloading = false;
              if (res) {
                this.walletList = res;
              }
            });
        }
      });
    } else {
      var eventGuId = this.localstoragedataService.getLoginUserEventGuId();
      this.donorService
        .getWalletById(eventGuId, walletId)
        .subscribe((res: any) => {
          if (res) {
            const modalRef = this.commonMethodService.openPopup(
              SavecardPopupComponent,
              this.modalOptions
            );
            this.isloading = false;
            modalRef.componentInstance.WalletData = res;
            modalRef.componentInstance.Type = type;
            modalRef.componentInstance.emtSaveWallet.subscribe((res) => {
              if (res) {
                this.donorService
                  .getWalletByAccountId(eventGuId, this.accountId)
                  .subscribe((res: any) => {
                    // hide loader
                    this.isloading = false;
                    {
                      this.walletList = res;
                    }
                  });
              }
            });
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

  changeWallet(walletId) {
    this.selectedWalletId = walletId;
    this.isDisable = false;
  }
  UpdateWallet() {
    this.isloading = true;
    var objWalletData = {};
    if (this.paymentId != 0) {
      objWalletData = {
        eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
        paymentId: this.paymentId,
        accountId: this.accountId,
        walletId: Number(this.selectedWalletId),
        updatedBy: this.localstoragedataService.getLoginUserId(),
      };
      this.paymentService
        .UpdatePaymentWallet(objWalletData)
        .subscribe((res: any) => {
          // hide loader
          this.isloading = false;
          if (res) {
            Swal.fire({
              title: res,
              text: "",
              icon: "success",
              confirmButtonText: this.commonMethodService.getTranslate(
                "WARNING_SWAL.BUTTON.CONFIRM.OK"
              ),
              customClass: {
                confirmButton: "btn_ok",
              },
            });
            this.activeModal.dismiss();
            this.emtUpdateWallet.emit(true);
          } else {
            Swal.fire({
              title: this.commonMethodService.getTranslate(
                "WARNING_SWAL.SOMETHING_WENT_WRONG"
              ),
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
    } else {
      objWalletData = {
        eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
        scheduleId: this.scheduleId,
        walletId: Number(this.selectedWalletId),
        updatedBy: this.localstoragedataService.getLoginUserId(),
      };
      this.scheduleService
        .putScheduleUpdateWallet(objWalletData)
        .subscribe((res: any) => {
          // hide loader
          this.isloading = false;
          if (res) {
            Swal.fire({
              title: res,
              text: "",
              icon: "success",
              confirmButtonText: this.commonMethodService.getTranslate(
                "WARNING_SWAL.BUTTON.CONFIRM.OK"
              ),
              customClass: {
                confirmButton: "btn_ok",
              },
            });
            this.activeModal.dismiss();
            this.emtUpdateWallet.emit(true);
          } else {
            Swal.fire({
              title: this.commonMethodService.getTranslate(
                "WARNING_SWAL.SOMETHING_WENT_WRONG"
              ),
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

  ProcessPayment() {
    this.isloading = true;
    if (this.scheduleId != 0) {
      this.UpdateWallet();
    } else {
      var objPayTransaction = {
        PaymentId: this.paymentId,
        UpdatedBy: Number(this.localstoragedataService.getLoginUserId()),
        WalletId: Number(this.selectedWalletId),
        uniqueTransactionId:
          this.commonMethodService.generateUniqueTransactionId(),
      };

      this.paymentService.RetryPayment(objPayTransaction).subscribe(
        (res: any) => {
          this.isloading = false;
          if (res.paymentStatus === "Success") {
            Swal.fire({
              title: "Payment done successfully",
              text: "",
              icon: "success",
              confirmButtonText: this.commonMethodService.getTranslate(
                "WARNING_SWAL.BUTTON.CONFIRM.OK"
              ),
              customClass: {
                confirmButton: "btn_ok",
              },
            }).then((result) => {
              if (result.value) {
                this.UpdateWallet();
                this.activeModal.dismiss();
                this.emtUpdateWallet.emit(true);
                this.commonMethodService.sendPaymentTrans(true);
              }
            });
          } else {
            Swal.fire({
              title: this.commonMethodService.getTranslate(
                "WARNING_SWAL.SOMETHING_WENT_WRONG"
              ),
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
          this.activeModal.dismiss();
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
  }
  getFeatureSettingValues() {
    this.commonMethodService.featureName =
      "Retry_declined_or_error_payment_on_card";
    this.commonMethodService.getFeatureSettingValues();
  }
  onUpgrade() {
    // this.activeModal.dismiss();
    this.commonMethodService.commenSendUpgradeEmail(
      this.commonMethodService.featureDisplayName
    );
  }
}
