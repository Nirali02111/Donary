import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReleaseUpdatesRoutingModule } from './release-updates-routing.module';
import { UpdatesViewComponent } from './updates-view/updates-view.component';
import { ProductHeaderModule } from '../product-plans/product-header/product-header.module';

import { TranslateModule } from "@ngx-translate/core";
 
@NgModule({
  declarations: [UpdatesViewComponent],
  imports: [
    CommonModule,
    ReleaseUpdatesRoutingModule,
    ProductHeaderModule,
    TranslateModule
  ]
})
export class ReleaseUpdatesModule { }
