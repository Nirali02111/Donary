import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgxDaterangepickerMd } from "ngx-daterangepicker-material";


import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from "ngx-mask";
import { NgxMaterialTimepickerModule } from "ngx-material-timepicker";
import { DonaryDatePickerModule } from "src/app/commons/modules/donary-date-picker/donary-date-picker.module";
import { DonorDropdownListModule } from "src/app/commons/modules/donor-dropdown-list/donor-dropdown-list.module";
import { NewQueryPopupComponent } from "./new-query-popup/new-query-popup.component";
import { ReportDynamicListComponent } from "./report-dynamic-list/report-dynamic-list.component";
import { ReportFilterPopupComponent } from "./report-filter-popup/report-filter-popup.component";
import { TranslateModule } from "@ngx-translate/core";
import { CardsModule } from "../cards/cards.module";
import { CalendarModule } from "src/app/pages/transaction/pledge-transaction/hebrewCalendar/calendar/calendar.module";
import { DataTableModule } from "src/app/commons/modules/data-table/data-table.module";
import { AngularMultiSelectModule } from "src/app/commons/modules/angular-multi-select-module/angular-multi-select.module";

@NgModule({
    declarations: [NewQueryPopupComponent, ReportDynamicListComponent, ReportFilterPopupComponent],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        NgxDaterangepickerMd.forRoot(),
        AngularMultiSelectModule,
        DonorDropdownListModule,
        DonaryDatePickerModule,
        TranslateModule,
        DataTableModule,
        NgbModule,
        NgxMaskDirective, NgxMaskPipe,
        NgxMaterialTimepickerModule,
        CardsModule,
        CalendarModule
    ],
    exports: [NewQueryPopupComponent, ReportDynamicListComponent, ReportFilterPopupComponent, TranslateModule],
    providers: [provideNgxMask()]
})
export class ReportsSharedModule {}
