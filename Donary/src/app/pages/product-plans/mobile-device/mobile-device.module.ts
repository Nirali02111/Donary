import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxDaterangepickerMd } from "ngx-daterangepicker-material";
import { FormsModule } from "@angular/forms";
import { RouterModule } from '@angular/router';
import { MobileDeviceRoutingModule } from './mobile-device-routing.module';
import { MobiledeviceComponent } from './mobiledevice.component';
import { ProductHeaderModule } from '../product-header/product-header.module';

import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    MobiledeviceComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ProductHeaderModule,
    MobileDeviceRoutingModule,
    NgxDaterangepickerMd.forRoot(),
    TranslateModule
  ],
  exports:[
    MobiledeviceComponent,
    TranslateModule
  ]
})
export class MobileDeviceModule { }