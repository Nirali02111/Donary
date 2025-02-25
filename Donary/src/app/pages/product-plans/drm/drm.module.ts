import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxDaterangepickerMd } from "ngx-daterangepicker-material";
import { FormsModule } from "@angular/forms";
import { RouterModule } from '@angular/router';
import { DrmComponent } from './drm.component';
import { DrmRoutingModule } from './drm-routing.module';
import { ProductHeaderModule } from '../product-header/product-header.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    DrmComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    DrmRoutingModule,
    ProductHeaderModule,
    NgxDaterangepickerMd.forRoot(),
    TranslateModule
  ],
  exports:[
    DrmComponent,
    TranslateModule
  ]
})
export class DrmModule { }