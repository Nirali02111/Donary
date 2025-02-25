import { ChangeDetectorRef, Injectable } from "@angular/core";
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidatorFn,
  Validators,
} from "@angular/forms";

const greaterThan = (
  toCompare: number | string,
  orEquals: boolean = false,
  labelMessage: string = "",
  inSpan: boolean = false,
  optional: boolean = false
): ValidatorFn => {
  return (control: AbstractControl) => {
    if (control.pristine) {
      return null;
    }

    if (optional && !control.value) {
      return null;
    }

    const condition: boolean = orEquals
      ? control.value >= toCompare
      : control.value > toCompare;
    return condition
      ? null
      : { greaterThan: { toCompare, labelMessage, inSpan } };
  };
};

export interface AfterOfTransactionItem {
  accountId: string | number;
  accountNum: string | null;
  amount: string | number | null;
  donorFullName: string | null;
  donorJewishName: string | null;
  pledgeId?: number | null;
  paymentId?: number | null;
  status: string | null;
  paymentModeMessage: string | null;
  emails: string | null,
  phoneNums: string | null;
  receiptNum?: string | null;
  pledgeNum?: string | null
}

@Injectable()
export class TransactionControlProviderService {
  formGroup = new FormGroup({
    amount: new FormControl<string | null>(
      null,
      Validators.compose([
        Validators.required,
        greaterThan(0.25, true, "Starting amount is $0.25", true),
      ])
    ),
    currency: new FormControl<string | null>(null),
    accountId: new FormControl<string | null>(
      null,
      Validators.compose([Validators.required])
    ),
    recurring: new FormGroup({
      isRecurring: new FormControl<boolean>(false, Validators.compose([])),
      amount: new FormControl<string | null>(null, Validators.compose([])),
      count: new FormControl<string | null>(null, Validators.compose([])),
      frequency: new FormControl<string | null>(null, Validators.compose([])),
      transactionDate: new FormControl<string | null>(
        null,
        Validators.compose([])
      ),
    }),
    details: new FormGroup({
      campaignId: new FormControl<string | null>(null, Validators.compose([])),
      paymentReasonId: new FormControl<string | null>(
        null,
        Validators.compose([])
      ),
      locationId: new FormControl<string | null>(null, Validators.compose([])),
      collectorId: new FormControl<string | null>(null, Validators.compose([])),
      paymentDate: new FormControl<string | null>(null, Validators.compose([])),
    }),

    paymentMethod: new FormGroup({
      paymentMethodId: new FormControl<number | null>(null),
      creditCardType: new FormGroup({
        card: new FormControl<string | null>(null, Validators.compose([])),
        exp: new FormControl<string | null>(null, Validators.compose([])),
        cvv: new FormControl<string | null>(null, Validators.compose([])),
        isSaveToWallet: new FormControl<boolean>(false, Validators.compose([])),
        note: new FormControl<string | null>(null),
      }),

      achType: new FormGroup({
        bankType: new FormControl<string | null>(null, Validators.compose([])),
        accountType: new FormControl<string | null>(
          null,
          Validators.compose([])
        ),
        nameOnAccount: new FormControl<string | null>(
          null,
          Validators.compose([])
        ),
        routingNumber: new FormControl<string | null>(
          null,
          Validators.compose([])
        ),
        accountNumber: new FormControl<string | null>(
          null,
          Validators.compose([])
        ),
        note: new FormControl<string | null>(null),
      }),

      charityCreditCardType: new FormGroup({
        card: new FormControl<string | null>(null, Validators.compose([])),
        exp: new FormControl<string | null>(null, Validators.compose([])),
        cvv: new FormControl<string | null>(null, Validators.compose([])),
        isSaveToWallet: new FormControl<boolean>(false, Validators.compose([])),
        note: new FormControl<string | null>(null),
      }),

      noteType: new FormGroup({
        note: new FormControl<string | null>(null),
      }),

      checkType: new FormGroup({
        refNumber: new FormControl<string | null>(null, Validators.compose([])),
        note: new FormControl<string | null>(null),
      }),

      walletType: new FormGroup({
        walletId: new FormControl<string | null>(null, Validators.compose([])),
        note: new FormControl<string | null>(null),
      }),

      otherType: new FormGroup({
        refNumber: new FormControl<string | null>(null, Validators.compose([])),
        note: new FormControl<string | null>(null),
      }),
    }),
  });

  constructor(private readonly changeDetectorRef: ChangeDetectorRef) {}

  initializeRecurringValidation() {
    this.formGroup
      .get("recurring")
      .get("isRecurring")
      .valueChanges.subscribe((val: boolean) => {
        if (val) {
          this.enableRecurringOptions();

          this.formGroup.get("recurring").updateValueAndValidity();
          this.formGroup.updateValueAndValidity();
          this.changeDetectorRef.detectChanges();
          return;
        }

        this.disableRecurringOptions();
        this.formGroup.get("recurring").updateValueAndValidity();
        this.formGroup.updateValueAndValidity();
        this.changeDetectorRef.detectChanges();
      });
  }

  private disableRecurringOptions() {
    this.formGroup.get("recurring").get("amount")?.clearValidators();
    this.formGroup.get("recurring").get("count")?.clearValidators();
    this.formGroup.get("recurring").get("frequency")?.clearValidators();
  }

  private enableRecurringOptions() {
    this.formGroup.get("recurring").get("amount")?.clearValidators();
    this.formGroup.get("recurring").get("count")?.clearValidators();
    this.formGroup.get("recurring").get("frequency")?.clearValidators();

    this.formGroup
      .get("recurring")
      .get("amount")
      ?.setValidators(Validators.compose([Validators.required]));
    this.formGroup
      .get("recurring")
      .get("count")
      ?.setValidators(Validators.compose([Validators.required]));
    this.formGroup
      .get("recurring")
      .get("frequency")
      ?.setValidators(Validators.compose([Validators.required]));
  }
}
