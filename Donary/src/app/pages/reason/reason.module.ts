import { CommonModule } from "@angular/common";
import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { NgxSliderModule } from "@angular-slider/ngx-slider";
import { NgxDaterangepickerMd } from "ngx-daterangepicker-material";
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from "ngx-mask";
import { NgxPrintModule } from "ngx-print";
import { ReasonRoutingModule } from "./reason-routing.module";

import { DonorDropdownListModule } from "src/app/commons/modules/donor-dropdown-list/donor-dropdown-list.module";

import { DoanryDirective } from "src/app/commons/modules/doanry-directive.module/doanry-directive.module.module";

import { TranslateModule } from "@ngx-translate/core";
import { DataTableModule } from "src/app/commons/modules/data-table/data-table.module";
import { AngularMultiSelectModule } from "src/app/commons/modules/angular-multi-select-module/angular-multi-select.module";

@NgModule({ declarations: [],
    exports: [TranslateModule], imports: [CommonModule,
        FormsModule,
        ReasonRoutingModule,
        NgxSliderModule,
        NgxPrintModule,
        AngularMultiSelectModule,
        NgxDaterangepickerMd.forRoot(),
        NgxMaskDirective,
        NgxMaskPipe,
        DataTableModule,
        DonorDropdownListModule,
        ReactiveFormsModule,
        TranslateModule,
        DoanryDirective], providers: [provideNgxMask(), provideHttpClient(withInterceptorsFromDi())] })
export class ReasonModule {}
