import {
  AfterContentInit,
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

@Component({
  selector: "app-other-type-method",
  standalone: true,
  imports: [ReactiveFormsModule, TranslateModule],
  templateUrl: "./other-type-method.component.html",
  styleUrl: "./other-type-method.component.scss",
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () => inject(ControlContainer, { skipSelf: true }),
    },
  ],
})
export class OtherTypeMethodComponent
  implements OnInit, OnDestroy, AfterContentInit
{
  parentControl = inject(ControlContainer);

  get parentFormGroup() {
    return this.parentControl.control as FormGroup;
  }

  get formGroup() {
    return this.parentFormGroup.get("otherType");
  }

  get RefNumber() {
    return this.formGroup.get("refNumber")
  }

  ngOnInit(): void {}

  ngAfterContentInit(): void {
    this.RefNumber.clearValidators();
    this.RefNumber
      .setValidators(Validators.compose([Validators.required]));
  }

  ngOnDestroy(): void {
    this.RefNumber.clearValidators();
    this.RefNumber.updateValueAndValidity()
    this.formGroup.updateValueAndValidity()
  }
}
