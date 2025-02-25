import { CurrencyPipe, NgClass, NgFor, NgIf } from "@angular/common";
import {
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
  inject,
} from "@angular/core";
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { NgSelectModule } from "@ng-select/ng-select";
import { TranslateModule } from "@ngx-translate/core";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { DoanryDirective } from "src/app/commons/modules/doanry-directive.module/doanry-directive.module.module";
import { PledgePaymentService } from "src/app/services/pledge-payment.service";
import { PaypledgeFilterPopupComponent } from "../paypledge-filter-popup/paypledge-filter-popup.component";
import { CalendarModule } from "../../transaction/pledge-transaction/hebrewCalendar/calendar/calendar.module";
import { NgbActiveModal, NgbPopover } from "@ng-bootstrap/ng-bootstrap";
import { HebrewEngishCalendarService } from "src/app/services/hebrew-engish-calendar.service";
import moment from "moment";
import { ClickOutsideDirective } from "src/app/commons/modules/angular-multi-select-module/clickOutside";
import {
  TransactionControlProviderService,
  AfterOfTransactionItem,
} from "../transaction-control-provider.service";
import { DetailsOfTransactionComponent } from "../details-of-transaction/details-of-transaction.component";
import { ScheduleOfTransactionComponent } from "../schedule-of-transaction/schedule-of-transaction.component";
import { PaymentMethodOfTransactionComponent } from "../payment-method-of-transaction/payment-method-of-transaction.component";
import { PaymentService } from "src/app/services/payment.service";
import { AfterOffTransactionComponent } from "../after-off-transaction/after-off-transaction.component";

import { Guid } from "guid-typescript";
import { environment } from "src/environments/environment";
import { AmountOfTransactionComponent } from "../amount-of-transaction/amount-of-transaction.component";
import { DonorDropdownOfTransactionComponent, DonorOfDropdownInTransactionObj } from "../donor-dropdown-of-transaction/donor-dropdown-of-transaction.component";
import Swal from "sweetalert2";
import { DonaryDateFormatPipe } from "../../../commons/donary-date-format.pipe";
import { AnalyticsService } from "src/app/services/analytics.service";
declare const $: any;
export interface donorPledgePayment {
  ticketImage: string | null;
  unpaidPledges: unpaidPledges[];
  upcomingPledges: any[] | null;
}

export interface unpaidPledges {
  pledgeId: number;
  accountId: number;
  campaignName: string;
  pledgeTotalAmount: number;
  pledgePaidAmount: number;
  pledgeRemainingAmount: number;
  pledgeDefaultDisplayAmount: number;
  refNum: any;
  description: any;
  externalNote: any;
  fullName: string;
  pledgeNum: string;
  reasonName: string;
  locationName: string;
  pledgeDate: string;
  createdDate: string;
  promiseDate: any;
  isRecurring: boolean;
  scheduleRepeatType: any;
  colectorName: any;
  paymentReasonId: any;
  campaignId: number;
  locationId: any;
  collectorId: any;
  pledgeJewishDate: string;
}

@Component({
  selector: "app-pay-off-pledge-transaction-popup",
  standalone: true,
  imports: [
    TranslateModule,
    ReactiveFormsModule,
    FormsModule,
    DoanryDirective,
    NgClass,
    NgIf,
    NgSelectModule,
    NgFor,
    CalendarModule,
    NgbPopover,
    CurrencyPipe,
    DetailsOfTransactionComponent,
    ScheduleOfTransactionComponent,
    PaymentMethodOfTransactionComponent,
    AmountOfTransactionComponent,
    DonorDropdownOfTransactionComponent,
    DonaryDateFormatPipe
],
  providers: [ClickOutsideDirective, TransactionControlProviderService],
  templateUrl: "./pay-off-pledge-transaction-popup.component.html",
  styleUrl: "./pay-off-pledge-transaction-popup.component.scss",
})
export class PayOffPledgeTransactionPopupComponent implements OnInit {
  calendarSubscription: any;
  class_id: string;
  payoffPledgesForm: FormGroup = new FormGroup({});
  isGlobalList: any;
  changeDetectorRef: any;

  pledgesList: unpaidPledges[] = [];
  modalOptions: {
    centered: boolean;
    size: string;
    backdrop: string;
    keyboard: boolean;
    windowClass: string;
  };
  filtercount: number = 0;
  objSelectedFilter = {
    reasonId: null,
    locationId: null,
    collectorId: null,
    campaignId: null,
  };
  accountId: any;
  initalPledgeList: unpaidPledges[];
  PageName: string = "PayOffPledge";
  selectedDateRange: any = { startDate: moment(new Date()) };
  isOneDate: any;
  popTitle: any;
  EngHebCalPlaceholder: string = moment(new Date()).format("MM/DD/YYYY");
  class_hid: string = "";
  @ViewChild(NgbPopover, { static: false }) popContent: NgbPopover;
  @ViewChild(PaymentMethodOfTransactionComponent)
  paymentMethodOfTransactionCmp!: PaymentMethodOfTransactionComponent;

  @ViewChild(DetailsOfTransactionComponent)
  detailsOfTransactionCmp!: DetailsOfTransactionComponent;

  openPledges: any;
  availableToApply: number = 0;
  checkedPledgeList: any[] = [];
  initialPledgesFormArray: any[];
  controlsProvider = inject(TransactionControlProviderService);

  formGroup = this.controlsProvider.formGroup as FormGroup;
  showPaymentCard: boolean = false;
  isAutoApply: boolean = true;
  symbol: string;
  currencies: any[] = [];
  currency: string = "";
  donorName: string = "";
  onPaymentPage: boolean = false;
  checkAll: boolean = false;
  checkNumber: string = "";
  refNumber: string = "";
  isDevEnv: boolean = false;
  get _amount() {
    return this.formGroup.get("amount");
  }

  get donor() {
    return this.formGroup.get("accountId");
  }

  get _pledgesArr() {
    return this.formGroup.get("pledges") as FormArray;
  }
  private analytics = inject(AnalyticsService);

  constructor(
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    private activeModal: NgbActiveModal,
    public commonMethodService: CommonMethodService,
    private localstoragedataService: LocalstoragedataService,
    private pledgePaymentService: PledgePaymentService,
    private hebrewEngishCalendarService: HebrewEngishCalendarService,
    private paymentService: PaymentService,
    private datePipe: DonaryDateFormatPipe
  ) {}

  ngOnInit(): void {
    this.formGroup.addControl("pledges", this.fb.array([]));
    this.isDevEnv = environment.baseUrl.includes(
      "https://dev-api.donary.com/"
    );

    this.donor.valueChanges.subscribe((value) => {
      if (!value) {
        this.checkAll = false;
        this.pledgesList = [];
        this.initalPledgeList = [...this.pledgesList];
        this.filterPledgeList(this.objSelectedFilter);
        return;
      }

      this.getPledges();
    });
    this.EngHebCalPlaceholder = this.datePipe.transform(this.EngHebCalPlaceholder,'short');
  }

  onClose() {
    this.activeModal.close();
  }

  getPledges() {
    this.pledgesList = [];
    this.checkAll = false;

    let eventGuid = this.localstoragedataService.getLoginUserEventGuId();

    this.pledgePaymentService
      .donorPledgePaymentList(this.donor.value, eventGuid)
      .subscribe((data: donorPledgePayment) => {
        if (data?.unpaidPledges?.length > 0) {
          this.pledgesList = data?.unpaidPledges;
          this.openPledges = this.pledgesList.reduce((acc, item) => {
            acc += item.pledgeTotalAmount;
            return acc;
          }, 0);
        }
        this.initalPledgeList = [...this.pledgesList];
        this.filterPledgeList(this.objSelectedFilter);
      });
  }

  createPledgeForm(pledges: unpaidPledges) {
    let {
      campaignName,
      pledgeJewishDate,
      pledgeDate,
      pledgeRemainingAmount,
      pledgeTotalAmount,
      pledgeId,
    } = pledges;

    let pledgeForm = this.fb.group({
      check: [false],
      campaignName: [campaignName],
      pledgeJewishDate: [pledgeJewishDate],
      pledgeDate: [pledgeDate],
      RemainingAmount: [pledgeRemainingAmount],
      pledgeTotalAmount: [pledgeTotalAmount],
      PaidAmount: [null, Validators.max(pledgeRemainingAmount)],
      PledgeID: [pledgeId],
    });

    this._pledgesArr.push(pledgeForm);
  }

  OpenPayPledgeFilter() {
    this.modalOptions = {
      centered: true,
      size: "md",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup paypledge_filter",
    };
    const modalRef = this.commonMethodService.openPopup(
      PaypledgeFilterPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.objFilterValues = this.objSelectedFilter;
    modalRef.componentInstance.emtFilterValues.subscribe((res) => {
      if (res) {
        this.objSelectedFilter = res;
        this.filtercount = 0;
        this.pledgesList = [...this.initalPledgeList];
        this.filterPledgeList(res);
      }
    });
  }

  filterPledgeList(res) {
    if (res.reasonId != null) {
      this.filtercount += 1;
      this.pledgesList = this.pledgesList.filter(
        (x) => x.paymentReasonId == res.reasonId
      );
    }
    if (res.collectorId != null) {
      this.filtercount += 1;
      this.pledgesList = this.pledgesList.filter(
        (x) => x.collectorId == res.collectorId
      );
    }
    if (res.campaignId != null) {
      this.filtercount += 1;
      this.pledgesList = this.pledgesList.filter(
        (x) => x.campaignId == res.campaignId
      );
    }
    if (res.locationId != null) {
      this.filtercount += 1;
      this.pledgesList = this.pledgesList.filter(
        (x) => x.locationId == res.locationId
      );
    }

    this._pledgesArr.clear();
    setTimeout(() => {
      this.pledgesList.forEach((pledge) => this.createPledgeForm(pledge));
      this.initialPledgesFormArray = [...this._pledgesArr.value];
      this.checkedPledgeList = [];
    }, 0);
  }

  openHebrewCalendarPopup() {
    this.commonMethodService.featureName = null;
    this.commonMethodService.openCalendarPopup(
      this.class_id,
      this.class_hid,
      this.selectedDateRange,
      false
    );
    this.calendarSubscription = this.commonMethodService
      .getCalendarArray()
      .subscribe((items) => {
        if (
          items &&
          items.pageName == "PayOffPledge" &&
          this.commonMethodService.isCalendarClicked == true
        ) {
          this.commonMethodService.isCalendarClicked = false;
          this.calendarSubscription.unsubscribe();
          if (this.popContent) {
            this.popContent.close();
          }
          this.selectedDateRange = items.obj;
          this.EngHebCalPlaceholder =
            this.hebrewEngishCalendarService.EngHebCalPlaceholder;
          this.datesUpdated(this.selectedDateRange);
        }
      });
  }

  datesUpdated(event) {
    if (event.startDate != null && event.endDate != null) {
      this.selectedDateRange = event;
      this.selectedDateRange.startDate = moment(event.startDate).toDate();
      this.selectedDateRange.endDate = moment(event.endDate).toDate();
      if (this.pledgesList?.length > 0) {
        this.pledgesList = [...this.initalPledgeList];
        this.pledgesList = this.pledgesList.filter((item: any) => {
          return (
            new Date(item.pledgeDate).getTime() >=
              new Date(this.selectedDateRange.startDate).getTime() &&
            new Date(item.pledgeDate).getTime() <=
              new Date(this.selectedDateRange.endDate).getTime()
          );
        });
        this.filterPledgeList(this.objSelectedFilter);
      }
    } else {
      if (this.initalPledgeList) this.pledgesList = [...this.initalPledgeList];
      this.selectedDateRange = undefined;
    }
  }

  getPledgeCheck(i) {
    return this._pledgesArr.at(i).get("check");
  }

  getPledgePaidAmount(i) {
    return this._pledgesArr.at(i).get("PaidAmount");
  }

  getRemainingAmount(i) {
    return this._pledgesArr.at(i).get("RemainingAmount");
  }

  updateBalance(i: number, onCheck: boolean): void {
    const amountControl = this.getPledgePaidAmount(i);
    const RemainingAmount = this.getRemainingAmount(i);
    const checkboxField = this.getPledgeCheck(i);

    this.updateAmount(i, amountControl, RemainingAmount, onCheck);

    let total = this.checkedPledgeList.reduce(
      (acc, item) => (acc += +item.value.PaidAmount),
      0
    );

    if (this._amount.value) {
      if (total >= +this._amount.value) {
        let extraAmount = total - +this._amount.value;
        amountControl.setValue(amountControl.value - extraAmount);
        this.toggleCheckBox(false);
        this.availableToApply = this._amount.value - total - extraAmount;
      } else {
        this.toggleCheckBox(true);
        this.availableToApply = this._amount.value - total;
      }
    }

    if (checkboxField.value)
      $(`#pledge-checkbox-${i}`).addClass("pledge-selected");
    else $(`#pledge-checkbox-${i}`).removeClass("pledge-selected");
    this.isAutoApply = this._pledgesArr.value.find((i) => i.check)
      ? false
      : true;

    if (!this._pledgesArr.value.find((i) => !i.check)) this.checkAll = true;
    else this.checkAll = false;

    RemainingAmount.setValue(RemainingAmount.value - amountControl.value);
  }

  updateAmount(i, amount, remaining, oncheck) {
    const rowToUpdate = this._pledgesArr.at(i);
    const checkControl = this.getPledgeCheck(i);
    if (amount.value > this.pledgesList[i].pledgeRemainingAmount && !oncheck) {
      rowToUpdate.setValue(this.initialPledgesFormArray[i]);
      return;
    }

    if (oncheck) {
      if (checkControl.value) amount.setValue(remaining.value);
      else {
        remaining.setValue(this.pledgesList[i].pledgeRemainingAmount);
        amount.setValue(0);
      }
    } else {
      remaining.setValue(this.pledgesList[i].pledgeRemainingAmount);
      checkControl.setValue(amount.value > 0);
    }

    if (checkControl.value) {
      if (!this.checkedPledgeList.includes(rowToUpdate))
        this.checkedPledgeList.push(rowToUpdate);
    } else {
      const index = this.checkedPledgeList.indexOf(rowToUpdate);
      if (index > -1) this.checkedPledgeList.splice(index, 1);
    }
  }

  toggleCheckBox(enable: boolean) {
    for (let i = 0; i < this._pledgesArr.length; i++) {
      let checkboxField = this.getPledgeCheck(i);
      let amountField = this.getPledgePaidAmount(i);
      if (!checkboxField.value) {
        $(`#pledge-checkbox-${i}`).removeClass("pledge-selected");
        enable ? checkboxField.enable() : checkboxField.disable();
        enable ? amountField.enable() : amountField.disable();
      }
    }
  }

  resetPledges() {
    this._pledgesArr.setValue(this.initialPledgesFormArray);
    this.isAutoApply = true;
    this.availableToApply = this._amount.value;
    this.checkAll = false;
  }

  goToPaymentCard() {
    if (this._amount.invalid || this.donor.invalid) return;
    this.showPaymentCard = true;
    this.onPaymentPage = true;
    this.cdr.detectChanges();
  }

  private generateTransactionObj() {
    const paymentFields = this.paymentMethodOfTransactionCmp.getFinalValue();
    const paymentMethodId =
      this.paymentMethodOfTransactionCmp.getFinalPaymentId();
    const formValues = this.formGroup.value;

    const pledgesToPass = (formValues.pledges as any[])
      .filter((pledge) => pledge.check)
      .map((pledge) => ({
        PaidAmount: pledge.PaidAmount,
        PledgeID: pledge.PledgeID,
        RemainingAmount: pledge.RemainingAmount,
      }));

    const objPayTransaction: any = {
      loginUserGuId: this.localstoragedataService.getLoginUserGuid(),
      createdBy: this.localstoragedataService.getLoginUserId(),
      uniqueTransactionId: Guid.create().toString(),
      Pledges: pledgesToPass,
      accountId: formValues.accountId,
      amount: formValues.amount,

      paymentReasonId: formValues.details.paymentReasonId,
      campaignId: formValues.details.campaignId,
      locationId: formValues.details.locationId,
      paymentDate: formValues.details.paymentDate,
      collectorId: formValues.details.collectorId,

      currency: null,
      stopAutoReciept: true,
      cardHolderName: this.donorName,
      zip: "",

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
      return;
    }

    const formValues = this.formGroup.value;

    if (formValues.paymentMethod.paymentMethodId === 9) {
      this.doAchTransaction();
      return;
    }

    const transactionObj = this.generateTransactionObj();
    this.paymentService.PayTransaction(transactionObj).subscribe(
      (res) => {
        if (!res || !res.paymentStatus) {
          return;
        }
        this.analytics.createdPayment();


        this.onClose();
        const modalRef = this.getAfterOfTransactionModal();

        if (!res.isDBTransSucceed || res.paymentStatus !== "Success") {
          modalRef.componentInstance.isError = true;

          const firstObj = res.responseMessage[0];

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
      },
      (error) => {
        this.activeModal.dismiss();
        Swal.fire({
          title: this.commonMethodService.getTranslate('WARNING_SWAL.SOMETHING_WENT_WRONG'),
          text: error.error,
          icon: "error",
          confirmButtonText: this.commonMethodService.getTranslate('WARNING_SWAL.BUTTON.CONFIRM.OK'),
          customClass: {
            confirmButton: "btn_ok",
          },
        });
      }
    );
  }

  private doAchTransaction() {
    const formValues = this.formGroup.value;
    const transactionObj = this.generateTransactionObj();

    this.paymentService
      .AchTransaction({
        ...transactionObj,
        paymentMethodId: 9,
      })
      .subscribe(
        (res) => {
          if (res && res.paymentStatus) {
            const modalRef = this.getAfterOfTransactionModal();

            this.onClose();

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
            title: this.commonMethodService.getTranslate('WARNING_SWAL.SOMETHING_WENT_WRONG'),
            text: error.error,
            icon: "error",
            confirmButtonText: this.commonMethodService.getTranslate('WARNING_SWAL.BUTTON.CONFIRM.OK').commonMethodService.getTranslate('WARNING_SWAL.BUTTON.CONFIRM.OK'),
            customClass: {
              confirmButton: "btn_ok",
            },
          });
        }
      );
  }

  autoApplyPledges(isChecked) {
    if (isChecked)
      (this._pledgesArr.value as []).every((pledge: any, i: number) => {
        if (this.getPledgeCheck(i).disabled) return false;
        pledge.check = true;
        this._pledgesArr.at(i).patchValue(pledge);
        this.updateBalance(i, true);
        return true;
      });
    else {
      this.resetPledges();
    }
  }

  getAfterOfTransactionModal() {
    let modalRef = this.commonMethodService.openPopup(
      AfterOffTransactionComponent,
      {
        centered: true,
        size: "xl",
        keyboard: true,
        backdropClass: "backdrop-show",
        windowClass: "modal-main modal-success",
      }
    );

    modalRef.componentInstance.type = "Pay-of-pledge";

    return modalRef;
  }

  goToDonor() {
    this.showPaymentCard = false;
    this.onPaymentPage = false;
  }

  onChangeDonor(item: DonorOfDropdownInTransactionObj | null) {

    if (item) {
      this.donorName = item.fullName;
      return
    }
    this.donorName = ''
  }
}
