import { CommonModule } from "@angular/common";
import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";


import { NgxSliderModule } from "@angular-slider/ngx-slider";
import { NgxDaterangepickerMd } from "ngx-daterangepicker-material";
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from "ngx-mask";
import { NgxPrintModule } from "ngx-print";
import { CampaignRoutingModule } from "./campaign-routing.module";


import { NgxMaterialTimepickerModule } from "ngx-material-timepicker";

import { TranslateModule } from '@ngx-translate/core';
import { DataTableModule } from "src/app/commons/modules/data-table/data-table.module";
import { AngularMultiSelectModule } from "src/app/commons/modules/angular-multi-select-module/angular-multi-select.module";
import { DonaryDateFormatPipe } from "src/app/commons/donary-date-format.pipe";



@NgModule({ declarations: [],
    exports: [TranslateModule], imports: [CommonModule,
        FormsModule,
        CampaignRoutingModule,
        NgxSliderModule,
        NgxPrintModule,
        AngularMultiSelectModule,
        NgxDaterangepickerMd.forRoot(),
        NgxMaskDirective, NgxMaskPipe,
        DataTableModule,
        ReactiveFormsModule,
        NgxMaterialTimepickerModule,
        TranslateModule,
        DonaryDateFormatPipe], providers: [provideNgxMask(), provideHttpClient(withInterceptorsFromDi())] })
export class CampaignModule {}
