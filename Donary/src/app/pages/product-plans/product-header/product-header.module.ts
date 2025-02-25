import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxDaterangepickerMd } from "ngx-daterangepicker-material";
import { FormsModule } from "@angular/forms";
import { ProductHeaderComponent } from './product-header.component';
import { RouterModule } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    ProductHeaderComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    NgxDaterangepickerMd.forRoot(),
    TranslateModule
  ],
  exports:[
    ProductHeaderComponent,
    TranslateModule
  ]
})
export class ProductHeaderModule { }