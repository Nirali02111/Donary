import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
  ViewChild,
} from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { DetailsOfTransactionComponent } from "../details-of-transaction/details-of-transaction.component";
import {
  AfterOfTransactionItem,
  TransactionControlProviderService,
} from "../transaction-control-provider.service";
import { ScheduleOfTransactionComponent } from "../schedule-of-transaction/schedule-of-transaction.component";
import { PaymentMethodOfTransactionComponent } from "../payment-method-of-transaction/payment-method-of-transaction.component";
import { CommonModule, JsonPipe, NgTemplateOutlet } from "@angular/common";
import {
  NgbActiveModal,
  NgbModalOptions,
  NgbPopoverModule,
} from "@ng-bootstrap/ng-bootstrap";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { NgSelectModule } from "@ng-select/ng-select";
import { TranslateModule } from "@ngx-translate/core";

import { DoanryDirective } from "src/app/commons/modules/doanry-directive.module/doanry-directive.module.module";
import { DonorDropdownOfTransactionComponent } from "../donor-dropdown-of-transaction/donor-dropdown-of-transaction.component";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";

import { Guid } from "guid-typescript";

import { AfterOffTransactionComponent } from "../after-off-transaction/after-off-transaction.component";
import { PaymentService } from "./../../../services/payment.service";
import { DonaryInputModule } from "src/app/commons/modules/donary-input/donary-input.module";
import { AmountOfTransactionComponent } from "../amount-of-transaction/amount-of-transaction.component";
import Swal from "sweetalert2";
import { AnalyticsService } from "src/app/services/analytics.service";
import { EmailAddressPopupComponent } from "../email-address-popup/email-address-popup.component";
import { PhoneNumberPopupComponent } from "../phone-number-popup/phone-number-popup.component";
import { MessengerService } from "src/app/services/messenger.service";
declare var $: any;

@Component({
  selector: "app-donation-transaction-popup",
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgSelectModule,
    TranslateModule,
    NgbPopoverModule,
    DoanryDirective,
    CommonModule,
    NgSelectModule,
    DonaryInputModule,
    DonorDropdownOfTransactionComponent,
    PaymentMethodOfTransactionComponent,
    DetailsOfTransactionComponent,
    ScheduleOfTransactionComponent,
    AmountOfTransactionComponent,
  ],
  templateUrl: "./donation-transaction-popup.component.html",
  styleUrl: "./donation-transaction-popup.component.scss",
  providers: [TransactionControlProviderService],
})
export class DonationTransactionPopupComponent
  implements OnInit, AfterViewInit
{
  readonly changeDetectorRef = inject(ChangeDetectorRef);
  controlsProvider = inject(TransactionControlProviderService);
  commonMethodService = inject(CommonMethodService);
  private activeModal = inject(NgbActiveModal);
  private localStorageDataService = inject(LocalstoragedataService);
  private paymentService = inject(PaymentService);
  messengerService = inject(MessengerService);

  formGroup = this.controlsProvider.formGroup;
  EmailCheckbox: boolean = false;
  PhoneCheckbox: boolean = false;
  isDonorBulkSelected: boolean = false;
  isDropDownOpen: boolean = false;
  isSmsDropDownOpen: boolean = false;

  notifyDonarEmailArray = [];
  notifyDonarEmail: any;
  isNotifyDonarEmailShow = false;
  notifyDonarPhoneArray = [];
  notifyDonarPhoneNumber: any = { phone: "Select Phone", label: "" };
  accountId: number;
  modalOptions: NgbModalOptions;
  isEmailLoading: boolean;
  isEmailSuccess: boolean;
  isEmailError: boolean;
  isloading: boolean;
  isPhoneLoading: boolean;
  isPhoneSuccess: boolean;
  isPhoneError: boolean;
  isOnlyPledgePayment: any;
  paymentId: number;
  type: string;
  tempemailCheckbox: boolean;
  tempnotifyDonarEmail: any;

  get Amount() {
    return this.formGroup.get("amount");
  }

  get account() {
    return this.formGroup.get("accountId");
  }

  @ViewChild(PaymentMethodOfTransactionComponent)
  paymentMethodOfTransactionCmp!: PaymentMethodOfTransactionComponent;

  @ViewChild(DetailsOfTransactionComponent)
  detailsOfTransactionCmp!: DetailsOfTransactionComponent;
  private analytics = inject(AnalyticsService);

  ngOnInit(): void {
    this.controlsProvider.initializeRecurringValidation();
  }

  ngAfterViewInit(): void {
    this.changeDetectorRef.detectChanges();
  }

  onClose() {
    this.activeModal.close();
  }

  private generateTransactionObj() {
    const formValues = this.formGroup.value;

    const paymentFields = this.paymentMethodOfTransactionCmp.getFinalValue();
    const paymentMethodId =
      this.paymentMethodOfTransactionCmp.getFinalPaymentId();

    let objPayTransaction: any = {
      loginUserGuId: this.localStorageDataService.getLoginUserGuid(),
      uniqueTransactionId: Guid.create().toString(),
      createdBy: this.localStorageDataService.getLoginUserId(),

      accountId: formValues.accountId,
      amount: formValues.amount,
      paymentReasonId: formValues.details.paymentReasonId,
      campaignId: formValues.details.campaignId,
      locationId: formValues.details.locationId,
      paymentDate: formValues.details.paymentDate,
      collectorId: formValues.details.collectorId,
      note: formValues.paymentMethod.noteType.note,
      paymentMethodId,
      ...paymentFields,
    };

    if (formValues.recurring.isRecurring) {
      objPayTransaction.paymentRecurringModel = {
        recurrenceAmount: parseFloat(formValues.recurring.amount),
        recurrenceCount: parseInt(formValues.recurring.count),
        scheduleDateTime: this.detailsOfTransactionCmp.selectedStartDate,
        recurrenceFrequency: parseInt(formValues.recurring.frequency),
      };
    }

    return objPayTransaction;
  }

  processTransaction() {
    if (this.formGroup.invalid) {
      return false;
    }
    const formValues = this.formGroup.value;
    if (formValues.paymentMethod.paymentMethodId === 9) {
      this.doAchTransaction();
      return;
    }

    const objPayTransaction = this.generateTransactionObj();

    this.paymentService.PayTransaction(objPayTransaction).subscribe(
      (res) => {
        if (!res || !res.paymentStatus) {
          return;
        }

        this.type = "Pledge";
        this.paymentId = res.responseMessage[0].paymentId;
        if (res) {
          if (this.EmailCheckbox) {
            this.sendEmailRecieptApi(this.type, this.paymentId);
          }
          if (this.PhoneCheckbox) {
            this.sendPhoneRecieptApi(this.type, this.paymentId);
          }
        }

        this.analytics.createdPayment();

        let modalRef = this.getAfterOfTransactionModal();

        if (!res.isDBTransSucceed || res.paymentStatus !== "Success") {
          modalRef.componentInstance.isError = true;

          const firstObj = res.responseMessage[0];

          modalRef.componentInstance.item = {
            accountId: firstObj.accountId,
            donorJewishName: firstObj.donorJewishName,
            donorFullName: firstObj.donorFullName
              ? firstObj.donorFullName
              : firstObj.donorName,
            paymentId: firstObj.paymentId,
            emails: firstObj.email,
            phoneNums: firstObj.phone,
            accountNum: firstObj.accountNum,
            amount: formValues.amount,
            paymentModeMessage: res.responseTitle,
            status: res.paymentStatus,
            receiptNum: firstObj.receiptNum,
          };

          return;
        }

        const firstObj = res.responseMessage[0];

        modalRef.componentInstance.isError = false;
        const item: AfterOfTransactionItem = {
          accountId: firstObj.accountId,
          donorJewishName: firstObj.donorJewishName,
          donorFullName: firstObj.donorFullName
            ? firstObj.donorFullName
            : firstObj.donorName,
          paymentId: firstObj.paymentId,
          emails: firstObj.email,
          phoneNums: firstObj.phone,
          accountNum: firstObj.accountNum,
          amount: formValues.amount,
          paymentModeMessage: res.responseTitle,
          status: res.paymentStatus,
          receiptNum: firstObj.receiptNum,
        };

        modalRef.componentInstance.item = item;
        this.activeModal.close();
        // this.onClose();
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

  private doAchTransaction() {
    const formValues = this.formGroup.value;

    const objPayTransaction = this.generateTransactionObj();

    this.paymentService
      .AchTransaction({
        ...objPayTransaction,
        paymentMethodId: 9,
      })
      .subscribe(
        (res) => {
          if (res && res.paymentStatus) {
            this.activeModal.close();
            let modalRef = this.getAfterOfTransactionModal();
            if (res.isDBTransSucceed || res.paymentStatus == "Success") {
              const firstObj = res.responseMessage[0];

              modalRef.componentInstance.isError = false;
              const item: AfterOfTransactionItem = {
                accountId: firstObj.accountId,
                donorJewishName: firstObj.donorJewishName,
                donorFullName: firstObj.donorFullName
                  ? firstObj.donorFullName
                  : firstObj.donorName,
                paymentId: firstObj.paymentId,
                emails: firstObj.email,
                phoneNums: firstObj.phone,
                accountNum: firstObj.accountNum,
                amount: formValues.amount,
                paymentModeMessage: res.responseTitle,
                status: res.paymentStatus,
                receiptNum: firstObj.receiptNum,
              };
              modalRef.componentInstance.item = item;
              return;
            }

            modalRef.componentInstance.isError = true;
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

  private getAfterOfTransactionModal() {
    const modalRef = this.commonMethodService.openPopup(
      AfterOffTransactionComponent,
      {
        centered: true,
        size: "xl",
        keyboard: true,
        backdropClass: "backdrop-show",
        windowClass: "modal-main modal-success",
      }
    );

    modalRef.componentInstance.type = "Transaction";

    return modalRef;
  }

  ChangeEmail($event) {
    this.EmailCheckbox = $event.target.checked;
  }

  ChangePhone($event) {
    this.PhoneCheckbox = $event.target.checked;
  }

  //if clicked outside close dropdown for email and sms code started
  closeTransactionEmailDropdown(event: any) {
    if (this.isDropDownOpen) {
      this.isDropDownOpen = false;
      let cls = "notify-credit-card";
      let clsSelected = `.${cls}`;
      $(clsSelected).removeClass("show");
    }
  }

  closeTransactionSmsDropdown(event: any) {
    if (this.isSmsDropDownOpen) {
      this.isSmsDropDownOpen = false;
      let cls = "notify-sms-credit-card";
      let clsSelected = `.${cls}`;
      $(clsSelected).removeClass("show");
    }
  }
  //if clicked outside close dropdown for email and sms code ended

  donarNotifyDwnHideShow(cls) {
    if (this.account.value == "" || this.account.value == null) {
      return false;
    }
    this.isDropDownOpen = true;
    let clsSelected = `.${cls}`;
    $(clsSelected).toggleClass("show");
  }
  donarSmsNotifyDwnHideShow(cls) {
    if (this.account.value == "" || this.account.value == null) {
      return false;
    }
    this.isSmsDropDownOpen = true;
    let clsSelected = `.${cls}`;
    $(clsSelected).toggleClass("show");
  }

  selectNotifyDonarEmail(item) {
    if (!!item && item.email != "Select Email") {
      this.EmailCheckbox = true;
      this.notifyDonarEmail = item;
    }
  }
  get getEmailSelected() {
    if (this.notifyDonarEmail) {
      return this.notifyDonarEmail.email != "Select Email"
        ? `${this.notifyDonarEmail.email} (${this.notifyDonarEmail.label})`
        : this.notifyDonarEmail.email;
    }
    return "Select Email";
  }

  openEmailAddressPopup() {
    this.modalOptions = {
      centered: true,
      size: "md",
      backdrop: "static",
      keyboard: true,
      windowClass: " send_emailreceipt",
    };
    const modalRef = this.commonMethodService.openPopup(
      EmailAddressPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.DonorDetails = {
      accountId: this.account.value,
    };
    modalRef.componentInstance.emtOutput.subscribe((res) => {
      if (res) {
        let result = res;
        let obj = {
          email: result.emailAddress,
          label: result.emailLabel,
        };
        this.notifyDonarEmail = obj;
        this.notifyDonarEmailArray.push(obj);
      }
    });
  }

  selectNotifyDonarPhone(item) {
    if (!!item && item.phone != "Select Phone") {
      this.PhoneCheckbox = true;
      this.notifyDonarPhoneNumber = item;
    }
  }

  get getPhoneSelected() {
    if (this.notifyDonarPhoneNumber) {
      return this.notifyDonarPhoneNumber.phone != "Select Phone"
        ? `${this.notifyDonarPhoneNumber.phone} (${this.notifyDonarPhoneNumber.label})`
        : this.notifyDonarPhoneNumber.phone;
    }
    return "";
  }

  openPhoneNumberPopup() {
    this.modalOptions = {
      centered: true,
      size: "md",
      backdrop: "static",
      keyboard: true,
      windowClass: "send_emailreceipt",
    };
    const modalRef = this.commonMethodService.openPopup(
      PhoneNumberPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.DonorDetails = {
      accountId: this.account.value,
    };
    modalRef.componentInstance.emtOutput.subscribe((res) => {
      if (res) {
        const result = res;
        const obj = {
          phone: result.phoneNumber,
          label: result.phoneLabel,
        };
        this.notifyDonarPhoneNumber = obj;
        this.notifyDonarPhoneArray.push(obj);
      }
    });
  }

  sendEmailRecieptApi(type, id) {
    this.isEmailLoading = true;
    this.isEmailSuccess = false;
    this.isEmailError = false;
    if (!this.notifyDonarEmail) {
      return false;
    }
    if (this.notifyDonarEmail.email == "Select Email") {
      return false;
    }
    const objEmailReceipt = {
      type: type,
      id: id,
      emailAddress: this.notifyDonarEmail.email,
      eventGuId: this.localStorageDataService.getLoginUserEventGuId(),
    };
    this.messengerService.SendEmailReceipt(objEmailReceipt).subscribe(
      (res) => {
        if (res) {
          this.isEmailLoading = false;
          this.isEmailSuccess = true;
          this.isEmailError = false;
          this.changeDetectorRef.detectChanges();
        }
      },
      (error) => {
        this.isloading = false;
        this.isEmailLoading = false;
        this.isEmailSuccess = false;
        this.isEmailError = true;
        this.changeDetectorRef.detectChanges();
      }
    );
  }

  sendPhoneRecieptApi(type, id) {
    this.isPhoneLoading = true;
    this.isPhoneSuccess = false;
    this.isPhoneError = false;
    if (this.notifyDonarPhoneNumber.phone == "Select Phone") {
      return false;
    }
    const objTextReceipt = {
      type: type,
      id: id,
      phoneNumber: this.notifyDonarPhoneNumber.phone.replace(/\s/g, ""),
      eventGuId: this.localStorageDataService.getLoginUserEventGuId(),
      isOnlyPledgePayment: this.isOnlyPledgePayment,
    };
    this.messengerService.SendSMSReceipt(objTextReceipt).subscribe(
      (res) => {
        if (res) {
          this.isPhoneLoading = false;
          this.isPhoneSuccess = true;
          this.isPhoneError = false;
          this.changeDetectorRef.detectChanges();
        }
      },
      (error) => {
        this.isloading = false;
        this.isPhoneLoading = false;
        this.isPhoneSuccess = false;
        this.isPhoneError = true;
        this.changeDetectorRef.detectChanges();
      }
    );
  }

  getDonor(ev) {
    //code for adding email & phone numbers
    const item = ev; // Assuming res is now a single object
    const emails = item.emails ? item.emails.split(",") : [];
    const emailLabels = item.emailLabels ? item.emailLabels.split(",") : [];
    const emailResult = this.margeKeyValue(emails, emailLabels, "email");

    const phoneNumber = item.additionalPhoneNumbers
      ? item.additionalPhoneNumbers.split(",")
      : [];
    const phoneLabels = item.additionalPhoneLabels
      ? item.additionalPhoneLabels.split(",")
      : [];
    const phoneResult = this.margeKeyValue(phoneNumber, phoneLabels, "phone");

    const donarDetails = { email: emailResult, phone: phoneResult };

    this.notifyDonarEmailArray =
      donarDetails && donarDetails.email ? donarDetails.email : [];
    this.notifyDonarEmail =
      this.notifyDonarEmailArray.length > 0
        ? this.notifyDonarEmailArray[0]
        : "";

    if (!this.isNotifyDonarEmailShow) {
      this.notifyDonarEmail = {
        email: "Select Email",
        label: "",
      };
    }

    this.EmailCheckbox =
      this.notifyDonarEmail && this.notifyDonarEmail.email != "Select Email";
    this.tempemailCheckbox = this.EmailCheckbox;
    this.tempnotifyDonarEmail = this.notifyDonarEmail;
    this.notifyDonarPhoneArray =
      donarDetails && donarDetails.phone ? donarDetails.phone : [];
  }

  margeKeyValue(keys = [], values = [], item = "") {
    const resultArray = [];
    for (let index = 0; index < keys.length; index++) {
      let obj =
        item == "email"
          ? { email: keys[index], label: values[index] }
          : { phone: keys[index], label: values[index] };
      resultArray.push(obj);
    }
    return resultArray;
  }
}
