import {
  AfterContentInit,
  ChangeDetectorRef,
  Component,
  computed,
  ElementRef,
  inject,
  Input,
  OnDestroy,
  OnInit,
  signal,
  viewChild,
} from "@angular/core";
import {
  AbstractControl,
  ControlContainer,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { TranslateModule } from "@ngx-translate/core";
import { NgxMaskDirective, provideNgxMask } from "ngx-mask";
import { CreditCardService } from "src/app/services/helpers/credit-card.service";

@Component({
  selector: "app-credit-card-type-method",
  standalone: true,
  imports: [ReactiveFormsModule, TranslateModule, NgxMaskDirective],
  templateUrl: "./credit-card-type-method.component.html",
  styleUrl: "./credit-card-type-method.component.scss",
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () => inject(ControlContainer, { skipSelf: true }),
    },
  ],

  providers: [provideNgxMask()],
})
export class CreditCardTypeMethodComponent
  implements OnInit, OnDestroy, AfterContentInit {
  // cardMask = "0000-0000-0000-0000||0000-000000-0000||0000-0000-0000-000";
  protected cardMask: string = "0000-0000-0000-0000";

  cvvMaskValue = "000||0000";

  private cardType = signal<string>("");

  isAllCard = computed(() => {
    return !this.cardType();
  });

  isVisaCard = computed(() => {
    return this.cardType() === "VISA";
  });

  isMasterCard = computed(() => {
    return this.cardType() === "MASTERCARD";
  });

  isAmericanExpress = computed(() => {
    return this.cardType() === "AMERICAN_EXPRESS";
  });

  isDiscoverCard = computed(() => {
    return this.cardType() === "DISCOVER_CARD";
  });

  isDinerCard = computed(() => {
    return this.cardType() === "DINER";
  });

  isMatbiaCard = computed(() => {
    return this.cardType() === "MATBIA_CARD";
  });

  isOJCCard = computed(() => {
    return this.cardType() === "OJC_CARD";
  });

  isDonorFundCard = computed(() => {
    return this.cardType() === "DONOR_FUND_CARD";
  });

  isPledgerCard = computed(() => {
    return this.cardType() === "PLEDGE_CARD";
  });

  isSwipeLoader = signal<boolean>(false);

  parentControl = inject(ControlContainer);

  creditCardService = inject(CreditCardService);

  @Input() onlyCharityCards = false;

  @Input({ required: true }) groupTypeKeyName = "creditCardType";
  @Input() isCharityCard = false;
  get parentFormGroup() {
    return this.parentControl.control as FormGroup;
  }

  get formGroup() {
    return this.parentFormGroup.get(this.groupTypeKeyName);
  }

  get Card() {
    return this.formGroup.get("card");
  }

  expInput = viewChild('expInput', { read: ElementRef<HTMLInputElement> });

  cvvInput = viewChild('cvvInput', { read: ElementRef<HTMLInputElement> });

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    // this.cdr.detectChanges()
  }

  ngAfterContentInit(): void {
    this.formGroup.get("card").clearValidators();
    this.formGroup.get("exp").clearValidators();
    this.formGroup.get("cvv").clearValidators();

    this.formGroup.get("card").setValidators(
      Validators.compose([
        Validators.required,
        (control: AbstractControl) => {
          if (control.pristine) {
            return null;
          }
          const condition = this.creditCardService.luhnCheck(
            control.value || ""
          );
          return condition ? null : { luhnError: true };
        },
      ])
    );
    this.formGroup.get("exp").setValidators(
      Validators.compose([
        Validators.required,
        (control: AbstractControl) => {
          if (control.pristine) {
            return null;
          }

          let expiryDate = control.value;

          if (!expiryDate || expiryDate.length <= 3) {
            return { expInvalid: true };
          }

          let currentMonth = new Date().getMonth() + 1;
          let currentYear = new Date().getFullYear().toString();
          let intCurYear = Number(currentYear.substring(2, 5));
          let month = expiryDate.substring(0, 2);
          let year = expiryDate.substring(2, 4);

          if (Number(month) > 12) {
            return { expInvalid: true };
          }

          if (Number(year) < intCurYear) {
            return { expInvalid: true };
          }

          if (Number(year) == intCurYear && Number(month) < currentMonth) {
            return { expInvalid: true };
          }

          return null;
        },
      ])
    );
    if (this.isCharityCard) {
      this.formGroup.get("cvv");
    } else {
      this.formGroup
        .get("cvv")
        .setValidators(Validators.compose([Validators.required]));
    }

    this.formGroup.get("card").valueChanges.subscribe((val) => {
      if (!val) {
        this.cardType.set("");
        return;
      }

      if (val && val.length < 2) {
        this.cardType.set("");
        return;
      }

      const type = this.creditCardService.identifyCard(val);
      // console.log(type);
      this.cardType.set(type.name);
      this.cardMask = type.mask;
      this.cvvMaskValue = type.CVV;
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this.formGroup.get("card").clearValidators();
    this.formGroup.get("exp").clearValidators();
    this.formGroup.get("cvv").clearValidators();

    this.formGroup.get("card").updateValueAndValidity();
    this.formGroup.get("exp").updateValueAndValidity();
    this.formGroup.get("cvv").updateValueAndValidity();
    this.formGroup.updateValueAndValidity()
  }

  oninput(event: Event) {
    // console.log(event);
    // event.target.value
    // this.creditCardService.parseMagneticStrip(val)
  }

  ccNumberFill() {
    if (this.expInput()) {
      this.expInput().nativeElement.focus()
    }
  }

  expNumberFill() {
    if (this.cvvInput()) {
      this.cvvInput().nativeElement.focus()
    }
  }
}
