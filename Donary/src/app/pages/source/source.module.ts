import { CommonModule } from '@angular/common';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';


import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask} from 'ngx-mask';
import { NgxPrintModule } from 'ngx-print';

import { TranslateModule } from "@ngx-translate/core";
import { SourceRoutingModule } from './source-routing.module';
import { DoanryDirective } from "src/app/commons/modules/doanry-directive.module/doanry-directive.module.module";
import { DataTableModule } from 'src/app/commons/modules/data-table/data-table.module';
import { AngularMultiSelectModule } from 'src/app/commons/modules/angular-multi-select-module/angular-multi-select.module';



@NgModule({ declarations: [],
    exports: [TranslateModule], imports: [CommonModule,
        FormsModule,
        SourceRoutingModule,
        NgxSliderModule,
        NgxPrintModule,
        AngularMultiSelectModule,
        NgxDaterangepickerMd.forRoot(),
        NgxMaskDirective, NgxMaskPipe,
        DataTableModule,
        TranslateModule,
        DoanryDirective], providers: [provideNgxMask(), provideHttpClient(withInterceptorsFromDi())] })
export class SourceModule { }