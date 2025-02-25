import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputErrorComponent } from './input-error/input-error.component';



@NgModule({
  declarations: [InputErrorComponent],
  imports: [
    CommonModule
  ],
  exports:[InputErrorComponent]
})
export class DonaryInputModule { }
