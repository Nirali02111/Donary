import {
  AfterContentInit,
  Component,
  inject,
  Input,
  OnDestroy,
  OnInit,
} from "@angular/core";
import {
  ControlContainer,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { TranslateModule } from "@ngx-translate/core";
import { DonaryInputModule } from "src/app/commons/modules/donary-input/donary-input.module";
import { WalletObjResponse } from "src/app/services/donor.service";

@Component({
  selector: "app-wallet-type-method",
  standalone: true,
  imports: [ReactiveFormsModule, DonaryInputModule, TranslateModule],
  templateUrl: "./wallet-type-method.component.html",
  styleUrl: "./wallet-type-method.component.scss",
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () => inject(ControlContainer, { skipSelf: true }),
    },
  ],
})
export class WalletTypeMethodComponent
  implements OnInit, OnDestroy, AfterContentInit
{
  @Input({ required: true }) walletList: Array<WalletObjResponse> = [];

  parentControl = inject(ControlContainer);

  get parentFormGroup() {
    return this.parentControl.control as FormGroup;
  }

  get formGroup() {
    return this.parentFormGroup.get("walletType");
  }

  get WalletId() {
    return this.formGroup.get("walletId")
  }

  ngOnInit(): void {
    // this.cdr.detectChanges()
  }

  ngAfterContentInit(): void {
    this.WalletId.clearValidators();
    this.WalletId
      .setValidators(Validators.compose([Validators.required]));
  }

  ngOnDestroy(): void {
    this.WalletId.clearValidators();
    this.WalletId.updateValueAndValidity();
    this.formGroup.updateValueAndValidity()
  }
}
