import { Component, inject, ViewChild } from "@angular/core";

import { ReactiveFormsModule } from "@angular/forms";
import { NgSelectModule } from "@ng-select/ng-select";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { JsonPipe } from "@angular/common";
import Swal from "sweetalert2";

import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { DonaryInputModule } from "src/app/commons/modules/donary-input/donary-input.module";
import { PledgeService } from "src/app/services/pledge.service";
import {
  AfterOfTransactionItem,
  TransactionControlProviderService,
} from "../transaction-control-provider.service";
import { AmountOfTransactionComponent } from "../amount-of-transaction/amount-of-transaction.component";
import { AfterOffTransactionComponent } from "../after-off-transaction/after-off-transaction.component";
import { ScheduleOfTransactionComponent } from "../schedule-of-transaction/schedule-of-transaction.component";
import { DonorDropdownOfTransactionComponent } from "../donor-dropdown-of-transaction/donor-dropdown-of-transaction.component";
import { DetailsOfTransactionComponent } from "../details-of-transaction/details-of-transaction.component";
import { AnalyticsService } from "src/app/services/analytics.service";
import { TranslateModule } from "@ngx-translate/core";

@Component({
  selector: "app-create-pledge-transaction-popup",
  standalone: true,
  imports: [
    NgSelectModule,
    TranslateModule,
    ReactiveFormsModule,
    DonaryInputModule,
    DetailsOfTransactionComponent,
    ScheduleOfTransactionComponent,
    DonorDropdownOfTransactionComponent,
    AmountOfTransactionComponent,
  ],
  templateUrl: "./create-pledge-transaction-popup.component.html",
  styleUrl: "./create-pledge-transaction-popup.component.scss",
  providers: [TransactionControlProviderService],
})
export class CreatePledgeTransactionPopupComponent {
  isLoading = false;

  controlsProvider = inject(TransactionControlProviderService);
  commonMethodService = inject(CommonMethodService);

  formGroup = this.controlsProvider.formGroup;

  get Amount() {
    return this.formGroup.get("amount");
  }

  @ViewChild(DetailsOfTransactionComponent)
  detailsOfTransaction!: DetailsOfTransactionComponent;
  @ViewChild(ScheduleOfTransactionComponent)
  scheduleOfTransaction!: ScheduleOfTransactionComponent;
  private analytics = inject(AnalyticsService);

  constructor(
    public activeModal: NgbActiveModal,
    private localStorageDataService: LocalstoragedataService,

    private pledgeService: PledgeService
  ) {}

  ngOnInit(): void {
    this.controlsProvider.initializeRecurringValidation();
  }

  closePopup() {
    this.activeModal.dismiss();
  }

  processTransaction() {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return false;
    }

    const formValues = this.formGroup.value;

    const objPledgeTransaction: any = {
      macAddress: this.localStorageDataService.getLoginUserGuid(),
      accountId: formValues.accountId,
      accountIds: [],
      amount: parseFloat(formValues.amount),
      refNum: null,
      note: null,
      externalNote: null,
      createdBy: this.localStorageDataService.getLoginUserId(),
      pledgeDate: this.detailsOfTransaction.selectedStartDate.startDate
        ? this.detailsOfTransaction.selectedStartDate.startDate.format(
            "YYYY-MM-DD"
          )
        : null,

      campaignId: formValues.details.campaignId,
      locationId: formValues.details.locationId,
      collectorId: formValues.details.collectorId,
      paymentReasonId: formValues.details.paymentReasonId,
      isSendPledgeEmail: false,
    };

    if (formValues.recurring.isRecurring) {
      objPledgeTransaction.recurringScheduleModel = {
        recurrenceAmount: parseFloat(formValues.recurring.amount),
        recurrenceCount: parseInt(formValues.recurring.count),
        scheduleDateTime: this.scheduleOfTransaction.selectedStartDate.startDate
          ? this.scheduleOfTransaction.selectedStartDate.startDate.format(
              "YYYY-MM-DD"
            )
          : null,
        recurrenceFrequency: formValues.recurring.frequency,
      };
    }

    this.isLoading = true;
    this.pledgeService.addPledge(objPledgeTransaction).subscribe(
      (res: any) => {
        this.isLoading = false;
        this.activeModal.dismiss();

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
        modalRef.componentInstance.type = "Pledge";

        if (!res) {
          modalRef.componentInstance.isError = true;
          const item: AfterOfTransactionItem = {
            accountId: res.accountId,
            donorJewishName: res.donorJewishName,
            donorFullName: res.donorName,
            pledgeNum: res.pledgeNum,
            pledgeId: res.pledgeId,
            emails: res.emails,
            phoneNums: res.phoneNums,
            accountNum: res.accountNum,
            amount: formValues.amount,
            paymentModeMessage: "Error",
            status: "Error",
          };

          modalRef.componentInstance.item = item;
          return;
        }

        this.analytics.createdPledge();
        modalRef.componentInstance.isError = false;
        const item: AfterOfTransactionItem = {
          accountId: res.accountId,
          donorJewishName: res.donorJewishName,
          donorFullName: res.donorName,
          pledgeNum: res.pledgeNum,
          pledgeId: res.pledgeId,
          emails: res.emails,
          phoneNums: res.phoneNums,
          accountNum: res.accountNum,
          amount: formValues.amount,
          paymentModeMessage: "visa",
          status: "Success",
        };

        modalRef.componentInstance.item = item;
      },
      (error) => {
        this.isLoading = false;
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
