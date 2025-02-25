import {
  AfterContentInit,
  Component,
  inject,
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

@Component({
  selector: "app-check-type-method",
  standalone: true,
  imports: [ReactiveFormsModule, TranslateModule, DonaryInputModule],
  templateUrl: "./check-type-method.component.html",
  styleUrl: "./check-type-method.component.scss",
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () => inject(ControlContainer, { skipSelf: true }),
    },
  ],
})
export class CheckTypeMethodComponent
  implements OnInit, OnDestroy, AfterContentInit
{
  parentControl = inject(ControlContainer);

  get parentFormGroup() {
    return this.parentControl.control as FormGroup;
  }

  get formGroup() {
    return this.parentFormGroup.get("checkType");
  }

  get RefNumber() {
    return this.formGroup.get('refNumber')
  }

  ngOnInit(): void {}

  ngAfterContentInit(): void {
    this.RefNumber.clearValidators();
    this.RefNumber
      .setValidators(Validators.compose([Validators.required]));
      this.formGroup.updateValueAndValidity();
  }

  ngOnDestroy(): void {
    this.RefNumber.clearValidators();
    this.RefNumber.updateValueAndValidity();
    this.formGroup.updateValueAndValidity();
  }
}
