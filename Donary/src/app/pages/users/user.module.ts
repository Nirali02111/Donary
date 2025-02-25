import { CommonModule } from "@angular/common";
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from "@angular/common/http";
import { NgModule } from "@angular/core";

import { DataTableModule } from "src/app/commons/modules/data-table/data-table.module";
import { AngularMultiSelectModule } from "src/app/commons/modules/angular-multi-select-module/angular-multi-select.module";
import { FormsModule } from "@angular/forms";
import { NgxSliderModule } from "@angular-slider/ngx-slider";
import { NgxPrintModule } from "ngx-print";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { NgxDaterangepickerMd } from "ngx-daterangepicker-material";
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from "ngx-mask";
import { TranslateModule } from "@ngx-translate/core";

@NgModule({
  declarations: [],
  exports: [TranslateModule],
  imports: [
    CommonModule,
    FormsModule,
    NgxSliderModule,
    NgxPrintModule,
    DragDropModule,
    AngularMultiSelectModule,
    NgxDaterangepickerMd.forRoot(),
    NgxMaskDirective,
    NgxMaskPipe,
    DataTableModule,
    TranslateModule,
  ],
  providers: [provideNgxMask(), provideHttpClient(withInterceptorsFromDi())],
})
export class UserModule {}
