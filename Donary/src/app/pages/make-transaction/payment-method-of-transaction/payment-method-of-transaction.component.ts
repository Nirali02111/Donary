import { JsonPipe, NgTemplateOutlet } from "@angular/common";
import {
  AfterContentInit,
  ChangeDetectorRef,
  Component,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import {
  ControlContainer,
  FormGroup,
  ReactiveFormsModule,
} from "@angular/forms";
import { NgbNavChangeEvent, NgbNavModule } from "@ng-bootstrap/ng-bootstrap";
import { TranslateModule } from "@ngx-translate/core";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import {
  DonorService,
  WalletObjResponse,
} from "src/app/services/donor.service";
import { CreditCardTypeMethodComponent } from "./credit-card-type-method/credit-card-type-method.component";
import { ACHTypeMethodComponent } from "./achtype-method/achtype-method.component";
import { WalletTypeMethodComponent } from "./wallet-type-method/wallet-type-method.component";
import { CheckTypeMethodComponent } from "./check-type-method/check-type-method.component";
import { OtherTypeMethodComponent } from "./other-type-method/other-type-method.component";
import { CommonMethodService } from "src/app/commons/common-methods.service";

@Component({
  selector: "app-payment-method-of-transaction",
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgTemplateOutlet,
    NgbNavModule,
    TranslateModule,
    CreditCardTypeMethodComponent,
    ACHTypeMethodComponent,
    WalletTypeMethodComponent,
    CheckTypeMethodComponent,
    OtherTypeMethodComponent,
  ],
  templateUrl: "./payment-method-of-transaction.component.html",
  styleUrl: "./payment-method-of-transaction.component.scss",
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () => inject(ControlContainer, { skipSelf: true }),
    },
  ],
})
export class PaymentMethodOfTransactionComponent
  implements OnInit, AfterContentInit, OnDestroy
{
  active = 1;

  walletList: Array<WalletObjResponse> = [];

  private cdr = inject(ChangeDetectorRef);
  parentControl = inject(ControlContainer);
  localStorageDataService = inject(LocalstoragedataService);
  private donorService = inject(DonorService);
  commonMethodService = inject(CommonMethodService);

  get isACHEnable() {
    return this.commonMethodService.isACH &&
      this.commonMethodService.isACH.toLowerCase() === "true"
      ? true
      : false;
  }

  get AccountId() {
    return this.formGroup.get("accountId");
  }

  get formGroup() {
    return this.parentControl.control as FormGroup;
  }

  get PaymentMethodId() {
    return this.formGroup.get("paymentMethod").get("paymentMethodId");
  }

  @ViewChild("creditCardTypeCmp")
  creditCardTypeCmp!: CreditCardTypeMethodComponent;
  @ViewChild("charityCreditCardTypeCmp")
  charityCreditCardTypeCmp!: CreditCardTypeMethodComponent;

  ngOnInit(): void {
    this.AccountId.valueChanges.subscribe((value) => {
      if (!value) {
        this.walletList = [];
        this.formGroup
          .get("paymentMethod")
          .get("walletType")
          .get("walletId")
          .patchValue(null);
        this.formGroup
          .get("paymentMethod")
          .get("walletType")
          .get("walletId")
          .updateValueAndValidity();
        this.formGroup
          .get("paymentMethod")
          .get("walletType")
          .updateValueAndValidity();
        return;
      }
      this.formGroup
        .get("paymentMethod")
        .get("walletType")
        .get("walletId")
        .patchValue(null);
      this.formGroup
        .get("paymentMethod")
        .get("walletType")
        .get("walletId")
        .updateValueAndValidity();
      this.formGroup
        .get("paymentMethod")
        .get("walletType")
        .updateValueAndValidity();
      this.getWalletList();
    });
  }

  ngAfterContentInit(): void {}

  ngOnDestroy(): void {}

  onMethodChange(id: number) {
    this.cdr.detectChanges();
  }

  updatePaymentMethodId(data: NgbNavChangeEvent) {
    if (data.nextId === 1) {
      this.PaymentMethodId.patchValue(4);
    }

    if (data.nextId === 2) {
      this.PaymentMethodId.patchValue(9);
    }

    if (data.nextId === 3) {
      this.PaymentMethodId.patchValue(-2);
    }

    if (data.nextId === 4) {
      this.PaymentMethodId.patchValue(1);
    }

    if (data.nextId === 5) {
      this.PaymentMethodId.patchValue(2);
    }

    if (data.nextId === 6) {
      this.PaymentMethodId.patchValue(null);
    }

    if (data.nextId === 7) {
      this.PaymentMethodId.patchValue(5);
    }

    this.PaymentMethodId.updateValueAndValidity();
    this.formGroup.get("paymentMethod").updateValueAndValidity();
    this.formGroup.updateValueAndValidity();
  }

  private getWalletList() {
    const eventGuId = this.localStorageDataService.getLoginUserEventGuId();
    this.donorService
      .getWalletByAccountId(eventGuId, this.AccountId.value)
      .subscribe((res: Array<WalletObjResponse>) => {
        if (!res) {
          this.walletList = [];
          return;
        }
        this.walletList = res;
      });
  }

  getFinalValue() {
    if (this.active === 1 || this.active === 3) {
      const values =
        this.active === 1
          ? this.formGroup.get("paymentMethod").get("creditCardType").value
          : this.formGroup.get("paymentMethod").get("charityCreditCardType")
              .value;

      return {
        cCNum: values.card,
        expiry: values.exp,
        cVV: values.cvv,
        isSaveToWallet: values.isSaveToWallet,
        note: values.note,
      };
    }

    if (this.active === 2) {
      const values = this.formGroup.get("paymentMethod").get("achType").value;

      return {
        bankAccountVerify: {
          routingNum: values.routingNumber,
          accountNum: values.accountNumber,
          accountType: values.accountType,
          checkType: values.bankType,
          nameOnAccount: values.nameOnAccount,
          note: values.note,
        },
      };
    }

    if (this.active === 4) {
      const values = this.formGroup.get("paymentMethod").get("noteType").value;

      return {
        note: values.note,
      };
    }

    if (this.active === 5) {
      const values = this.formGroup.get("paymentMethod").get("checkType").value;

      return {
        refNum: values.refNumber,
        note: values.note,
      };
    }

    if (this.active === 6) {
      const values = this.formGroup
        .get("paymentMethod")
        .get("walletType").value;
      return {
        walletId: values.walletId,
        note: values.note,
      };
    }

    return {};
  }

  getFinalPaymentId() {
    if (this.active === 1) {
      if (this.creditCardTypeCmp.isOJCCard()) {
        return 3;
      }

      if (this.creditCardTypeCmp.isMatbiaCard()) {
        return 6;
      }

      if (this.creditCardTypeCmp.isPledgerCard()) {
        return 7;
      }

      if (this.creditCardTypeCmp.isDonorFundCard()) {
        return 8;
      }

      return this.PaymentMethodId.value;
    }

    if (this.active === 3) {
      if (this.charityCreditCardTypeCmp.isOJCCard()) {
        return 3;
      }

      if (this.charityCreditCardTypeCmp.isMatbiaCard()) {
        return 6;
      }

      if (this.charityCreditCardTypeCmp.isPledgerCard()) {
        return 7;
      }

      if (this.charityCreditCardTypeCmp.isDonorFundCard()) {
        return 8;
      }

      return;
    }

    return this.PaymentMethodId.value;
  }
}
