import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxDaterangepickerMd } from "ngx-daterangepicker-material";
import { FormsModule } from "@angular/forms";
import { DonaryDatePickerComponent } from './donary-date-picker/donary-date-picker.component';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    DonaryDatePickerComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    NgxDaterangepickerMd.forRoot(),
  ],
  exports:[
    DonaryDatePickerComponent,
    TranslateModule,
  ]
})
export class DonaryDatePickerModule { }