import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { Guid } from "guid-typescript";
import { CommonMethodService } from "../../../commons/common-methods.service";
import { LocalstoragedataService } from "../../../commons/local-storage-data.service";
import { NotificationService } from "../../../commons/notification.service";
import { PledgePaymentModel } from "../../../models/pledge-payment-model";
import { PledgePaymentService } from "../../../services/pledge-payment.service";
import { CreditCardService } from "src/app/services/helpers/credit-card.service";
import Swal from "sweetalert2";

import * as moment from "moment";
import { debounceTime } from "rxjs/operators";

declare var $: any;
@Component({
  selector: "app-pledge-payment-pay-popup",
  templateUrl: "./pledge-payment-pay-popup.component.html",
  standalone: false,
  styleUrls: ["./pledge-payment-pay-popup.component.scss"],
})
export class PledgePaymentPayPopupComponent implements OnInit {
  @Input() lstSelectedPledgeDetailsObj: Array<PledgePaymentModel>;
  @Input() totalPaidAmount: number;
  @Output() emtOutputreloadList: EventEmitter<any> = new EventEmitter();
  isloading: boolean = false;
  payButtonClickLoading: boolean = false;
  creditCardNumber: any = "";
  expMonth: any = "";
  expYear: any = "";
  creditCardCVV: any = "";
  emailAddress: string;
  accountId: number;
  eventGuid: string;
  collectorID: number;
  note: string = "";
  maskValue: string;
  macAddress: string;
  cvvMaxLength: number = 3;
  uniqueTransactionId: Guid;
  isCvvVisible: boolean = true;
  inValidCCNum: boolean = false;

  isSchedulePayment: boolean = false;
  swingAnimate: boolean = false;
  eventCurrency: string;
  scheduleCount: string = "";
  scheduleDonationAmount: string;
  scheduleFreg: any;
  scheduleStart: any;
  oninitialize = 1;
  isDateError: boolean = false;
  minDate = moment(new Date());
  buttonDisabled: boolean = false;
  expDate: any = "";
  isInValid: boolean = false;
  isHighCount: boolean = false;
  isFocusedSetClass: string = "";
  isFocusedSetClass2: string = "";
  isFocusedSetClass3: string = "";
  amtPerPayment: number = 0;
  isToday: boolean = false;
  fullNameJewish: string;
  fullName: string;
  sub;
  isDinerCard: boolean;
  constructor(
    public activeModal: NgbActiveModal,
    public localstoragedataService: LocalstoragedataService,
    private pledgePaymentService: PledgePaymentService,
    private notificationService: NotificationService,
    public commonMethodService: CommonMethodService,
    private creditCardService: CreditCardService,
    public element: ElementRef<HTMLElement>
  ) {}

  ngOnInit() {
    let logInUserObj = this.localstoragedataService.getLoginUserPayData();

    this.accountId = logInUserObj.accountId;
    this.eventGuid = logInUserObj.eventGuid;
    this.macAddress = logInUserObj.macAddress;
    this.emailAddress = logInUserObj.emailAddress;
    this.collectorID = logInUserObj.collectorID;
    this.uniqueTransactionId = Guid.create();
    this.fullNameJewish = logInUserObj.fullNameJewish;
    this.fullName = logInUserObj.fullName;
    this.eventCurrency = logInUserObj.eventCurrency;
    if (this.commonMethodService.localscheduleRepatTypeList.length == 0) {
      this.commonMethodService.getScheduleRepeatTypeList();
    }
    this.scheduleFreg = [{ id: 4, itemName: "Monthly" }];
  }

  ngAfterViewInit() {
    document.getElementById("input-creditCardNumber").focus();

    //this.ChangeMask();
    this.isFocusedSetClass = "is-focused";
  }

  ChangeFrequency(event) {}

  datesUpdated(event) {}

  isExpiryDateValid = true;
  PayPledgeAmount(form) {
    if (form.invalid) {
      if (form.controls.txtexpDate.status == "VALID") {
        this.isExpiryDateValid = true;
      } else {
        this.isExpiryDateValid = false;
      }

      this.swingAnimate = true;
      setTimeout(() => {
        this.swingAnimate = false;
      }, 800);
    } else {
      if (!this.swingAnimate) {
        if (this.totalPaidAmount == 0) {
          this.notificationService.showError(
            "Total pay amount should be greater than 0",
            "Error !!"
          );
        } else if (!this.eventGuid) {
          this.notificationService.showError(
            "Event Guid should not be empty",
            "Error !!"
          );
        } else if (this.accountId == 0) {
          this.notificationService.showError(
            "Event id should not be 0 or empty",
            "Error !!"
          );
        } else if (this.lstSelectedPledgeDetailsObj.length == 0) {
          this.notificationService.showError(
            "Total amount should be greater than 0.",
            "Error !!"
          );
        } else {
          if (this.isSchedulePayment) {
            this.scheduleDonationAmount = this.totalPaidAmount.toString();
            if (
              this.scheduleStart.startDate.format("YYYY-MM-DD") ==
              moment(new Date()).format("YYYY-MM-DD")
            ) {
              this.isToday = false;
              this.totalPaidAmount =
                Number(this.scheduleDonationAmount) /
                Number(this.scheduleCount);
              this.scheduleDonationAmount = this.totalPaidAmount.toString();
              var count = Number(this.scheduleCount) - 1;
              this.scheduleCount = count.toString();
            }
            if (
              this.scheduleStart.startDate.format("YYYY-MM-DD") >
              moment(new Date()).format("YYYY-MM-DD")
            ) {
              this.isToday = true;
              this.totalPaidAmount = 0;
              var scheduleAmt =
                Number(this.scheduleDonationAmount) /
                Number(this.scheduleCount);
              this.scheduleDonationAmount = scheduleAmt.toString();
            }
          } else {
            this.isToday = false;
            this.scheduleDonationAmount = null;
            this.scheduleCount = "0";
            this.scheduleStart = null;
            this.scheduleFreg = null;
          }
          var expiryDate = this.expDate;
          this.expMonth = expiryDate.substring(0, 2);
          this.expYear = expiryDate.substring(3, 5);
          this.buttonDisabled = true;
          this.isloading = true;
          this.payButtonClickLoading = true;
          let objPledgePayInputParameterModel = {
            EventGuid: this.eventGuid,
            AccountId: this.accountId,
            collectorId: this.collectorID,
            TotalPaidAmount: this.totalPaidAmount,
            lstSelectedPledges: this.lstSelectedPledgeDetailsObj.map((o) => ({
              ...o,
              pledgePaidAmount: Number(o.pledgeDefaultDisplayAmount),
            })),
            CreditCardNumber: this.creditCardNumber,
            ExpiryMonth: this.expMonth,
            ExpiryYear: this.expYear,
            CVVNumber: this.creditCardCVV,
            note: this.note,
            MacAddress: this.macAddress,
            EmailAddress: this.emailAddress,
            UniqueTransId: this.uniqueTransactionId.toString(),
            currency: this.eventCurrency,
            PaymentRecurringModel: {
              RecurrenceAmount: parseFloat(this.scheduleDonationAmount),
              RecurrenceCount: parseInt(this.scheduleCount),
              ScheduleDateTime:
                this.scheduleStart != undefined
                  ? moment(this.scheduleStart.startDate).format("YYYY-MM-DD")
                  : null,
              RecurrenceFrequency:
                this.scheduleFreg != undefined
                  ? parseInt(this.scheduleFreg.map((s) => s.id))
                  : null,
            },
          };
          this.sub = this.pledgePaymentService
            .SavePledgePayDetails(objPledgePayInputParameterModel)
            .pipe(debounceTime(5000))
            .subscribe(
              (res: any) => {
                this.isloading = false;
                this.payButtonClickLoading = false;
                this.buttonDisabled = false;
                this.fullNameJewish =
                  this.fullNameJewish != null
                    ? this.fullNameJewish
                    : this.fullName;
                if (res.paymentStatus != "Error") {
                  res.forEach((element) => {
                    if (element.isSucceed) {
                      Swal.fire({
                        title: "Thanks for your payment!",
                        html:
                          this.fullNameJewish +
                          "<h2>" +
                          this.commonMethodService.formatAmount(
                            this.totalPaidAmount
                          ) +
                          "</h2> ",
                        icon: "success",
                        showConfirmButton: false,
                        showCloseButton: true,
                        iconHtml:
                          '<img src="assets/dist/images/check-circle.png" >',
                        customClass: {
                          icon: "custom-icon",
                          popup: "swal2-payment",
                        },
                      });
                      //partial payment status popup code started
                      if (element.paymentResponse.paymentStatus === "Partial") {
                        Swal.fire({
                          title: "Thanks for your payment!",
                          html:
                            this.fullNameJewish +
                            "<h2>" +
                            this.commonMethodService.formatAmount(
                              this.totalPaidAmount
                            ) +
                            "</h2>" +
                            "<h4>" +
                            element.message +
                            "</h4>",
                          icon: "success",
                          showConfirmButton: false,
                          showCloseButton: true,
                          iconHtml:
                            '<img src="assets/dist/images/Cautionico.svg">',
                          customClass: {
                            icon: "custom-icon",
                            popup: "swal2-payment",
                          },
                        });
                      }
                      //code ended
                      // this.notificationService.showSuccess(element.message, "Success !!");
                      this.emtOutputreloadList.emit(true);
                    } else {
                      Swal.fire({
                        title: "Try Again!",
                        text: element.message,
                        icon: "error",
                        confirmButtonText:
                          this.commonMethodService.getTranslate(
                            "WARNING_SWAL.BUTTON.CONFIRM.OK"
                          ),
                        customClass: {
                          confirmButton: "btn_ok",
                        },
                      });
                      // this.notificationService.showError(element.message, "Error !!");
                    }
                  });
                  this.localstoragedataService.changeMessage(true);
                  //this.ref.close({ "success": true });
                  this.closePopup();
                } else {
                  Swal.fire({
                    title: res.responseTitle,
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
              (error: any) => {
                this.isloading = false;
                this.payButtonClickLoading = false;
                console.log(error);
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
      }
    }
  }

  GetAmtPerPayment() {
    if (this.scheduleCount != "") {
      if (parseInt(this.scheduleCount) < 37) {
        this.amtPerPayment = this.totalPaidAmount / Number(this.scheduleCount);
        this.isHighCount = false;
      } else {
        this.isHighCount = true;
      }
    } else {
      this.amtPerPayment = 0.0;
    }
  }

  closePopup() {
    this.activeModal.dismiss({ success: true });
    this.sub.unsubscribe();
  }

  DinerCard() {
    if (this.creditCardNumber.length == 14) {
      this.maskValue = this.creditCardService.getDinersMask(true);
    } else if (this.creditCardNumber.length == 16) {
      this.maskValue = this.creditCardService.getDinersMask();
    }
  }
  EnterCreditCard(event) {
    this.inValidCCNum = false;

    // added by new
    if (event.target.value.length >= 2) {
      var twodigit = this.creditCardNumber.substring(0, 2);
      if (twodigit == "34" || twodigit == "37") {
        this.maskValue = this.creditCardService.getAmexMask();
      } else {
        this.maskValue = this.creditCardService.getDefaultMask();
      }
    }

    const charCode = event.which ? event.which : event.keyCode;
    if (charCode == 13) {
      $("#expiryDate").focus();
    }
    var cardlength = event.target.value.replace(/[_-]/g, "").length;
    var masklength = this.maskValue.replace(/[-]/g, "").length;
    if (cardlength == masklength || (this.isDinerCard && cardlength == 14)) {
      var result = this.creditCardService.luhnCheck(
        event.target.value.replace(/[_-]/g, "")
      );
      if (result == true) {
        this.inValidCCNum = false;
      } else {
        this.inValidCCNum = true;
      }

      $("#input-ddlExpMonth").focus();
      $("#expiryDate").focus();
    }
    // added new by clear expdate
    if (charCode == 8) {
      this.expDate = null;
    }
  }

  ChangeMask() {
    if (
      this.creditCardNumber != "" &&
      this.creditCardNumber.replace(/[_-]/g, "") != ""
    ) {
      var twodigit = this.creditCardNumber.substring(0, 2);
      var threedigit = this.creditCardNumber.substring(0, 3);
      if (twodigit == "34" || twodigit == "37") {
        this.maskValue = this.creditCardService.getAmexMask();
      } else {
        if (
          twodigit == "36" ||
          twodigit == "38" ||
          twodigit == "39" ||
          threedigit == "300" ||
          threedigit == "301" ||
          threedigit == "302" ||
          threedigit == "303" ||
          threedigit == "304" ||
          threedigit == "305"
        ) {
          this.isDinerCard = true;
          this.DinerCard();
        } else {
          this.isDinerCard = false;
          this.maskValue = this.creditCardService.getDefaultMask();
        }
      }
    } else {
      this.maskValue = this.creditCardService.getDefaultMask();
    }
  }
  MaskNumber() {
    var twodigit = this.creditCardNumber.substring(0, 2);
    var threedigit = this.creditCardNumber.substring(0, 3);
    if (twodigit == "34" || twodigit == "37") {
      this.maskValue = this.creditCardService.getAmexMask();
    } else {
      if (
        twodigit == "36" ||
        twodigit == "38" ||
        twodigit == "39" ||
        threedigit == "300" ||
        threedigit == "301" ||
        threedigit == "302" ||
        threedigit == "303" ||
        threedigit == "304" ||
        threedigit == "305"
      ) {
        this.isDinerCard = true;
        this.DinerCard();
      } else {
        this.isDinerCard = false;
        this.maskValue = this.creditCardService.getDefaultMask();
        if (this.creditCardNumber.length == 16) {
          this.maskValue = this.creditCardService.getDefaultMask();
        } else if (this.creditCardNumber.length == 15) {
          this.maskValue = this.creditCardService.getDefaultMask(true);
        } else {
          this.maskValue = this.creditCardService.getDefaultMask();
        }
      }
    }
    var firstdigit = this.creditCardNumber.substring(0, 1);
    this.cvvMaxLength = firstdigit == "3" ? 4 : 3;
    var sixdigit = this.creditCardNumber.substring(0, 6);
    this.isCvvVisible = sixdigit == "690066" ? false : true;
  }

  onSchedulePaymentSwitch() {
    if (this.isSchedulePayment) {
      this.isSchedulePayment = false;
    } else {
      this.isSchedulePayment = true;
    }
  }

  OnPayClick(form) {
    if (form.invalid) {
      this.swingAnimate = true;
      setTimeout(() => {
        this.swingAnimate = false;
      }, 800);
    }
  }
  // exp date text box
  EnterExpiryDate(event) {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode == 13) {
      $("#input-txtcreditCardCVV").focus();
    }
    var expirydatelength = event.target.value.replace(/[_/]/g, "").length;
    //if(expirydatelength==2){

    if (event.target.value.length == 2) {
      if (charCode == 8) {
      } else {
        var k = event.target.value;
        var thisVal = k;
        thisVal += "/";
        this.expDate = thisVal;
      }
    }
    //}
    if (expirydatelength == 4) {
      $("#input-txtcreditCardCVV").focus();
    }
  }

  ValidExpiryDate(event) {
    if (event.target.value.length == 5) {
      this.isInValid = false;
      var currentMonth = new Date().getMonth() + 1;
      var currentYear = new Date().getFullYear().toString();
      var intCurYear = Number(currentYear.substring(2, 5));
      var expiryDate = event.target.value;
      var month = expiryDate.substring(0, 2);
      var year = expiryDate.substring(3, 5);

      if (Number(month) > 12) {
        this.isInValid = true;
      }

      if (Number(year) < intCurYear) {
        this.isInValid = true;
      }
      if (Number(year) == intCurYear && Number(month) < currentMonth) {
        this.isInValid = true;
      }
    }
    if (event.target.value.length == 2) {
    }
  }
  isCvvHideShow = true;
  onCvvHideShow(event) {
    if (this.creditCardNumber.length == 4) {
      var strFirstFour = this.creditCardNumber.substring(0, 4);
      if (strFirstFour == "8628") {
        this.isCvvHideShow = false;
      } else if (strFirstFour == "6900") {
        this.isCvvHideShow = false;
      } else {
        this.isCvvHideShow = true;
      }
    } else if (this.creditCardNumber.length < 4) {
      this.isCvvHideShow = true;
    }
  }
}
