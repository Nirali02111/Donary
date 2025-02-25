import {
  AfterContentInit,
  ChangeDetectorRef,
  Component,
  inject,
  OnDestroy,
  OnInit,
} from "@angular/core";
import {
  ControlContainer,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { TranslateModule } from "@ngx-translate/core";
import { DonaryInputModule } from "src/app/commons/modules/donary-input/donary-input.module";

@Component({
  selector: "app-achtype-method",
  standalone: true,
  imports: [ReactiveFormsModule, TranslateModule, DonaryInputModule],
  templateUrl: "./achtype-method.component.html",
  styleUrl: "./achtype-method.component.scss",
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () => inject(ControlContainer, { skipSelf: true }),
    },
  ],
})
export class ACHTypeMethodComponent
  implements OnInit, OnDestroy, AfterContentInit
{
  parentControl = inject(ControlContainer);

  get parentFormGroup() {
    return this.parentControl.control as FormGroup;
  }

  get formGroup() {
    return this.parentFormGroup.get("achType");
  }

  get NameOnAccount() {
    return this.formGroup.get("nameOnAccount")
  }

  get RoutingNumber() {
    return this.formGroup.get("routingNumber")
  }

  get AccountNumber() {
    return this.formGroup.get("accountNumber")
  }

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    // this.cdr.detectChanges()
  }

  ngAfterContentInit(): void {
    // this.cdr.detectChanges()
    
    this.clearOldValidators();
    this.formGroup
      .get("bankType")
      .setValidators(Validators.compose([Validators.required]));
    this.formGroup
      .get("accountType")
      .setValidators(Validators.compose([Validators.required]));
    this.NameOnAccount
      .setValidators(Validators.compose([Validators.required]));
    this.RoutingNumber
      .setValidators(Validators.compose([Validators.required]));
    this.AccountNumber
      .setValidators(Validators.compose([Validators.required]));

    this.formGroup.updateValueAndValidity();
  }

  ngOnDestroy(): void {
    this.clearOldValidators()

    this.formGroup.get("bankType").updateValueAndValidity();
    this.formGroup.get("accountType").updateValueAndValidity()
    this.NameOnAccount.updateValueAndValidity();
    this.RoutingNumber.updateValueAndValidity();
    this.AccountNumber.updateValueAndValidity();
    this.formGroup.updateValueAndValidity();
  }

  private clearOldValidators() {
    this.formGroup.get("bankType").clearValidators();
    this.formGroup.get("accountType").clearValidators();
    this.NameOnAccount.clearValidators();
    this.RoutingNumber.clearValidators();
    this.AccountNumber.clearValidators();
  }
}
