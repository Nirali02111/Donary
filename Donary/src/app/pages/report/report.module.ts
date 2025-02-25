import { DragDropModule } from "@angular/cdk/drag-drop";
import { CommonModule } from "@angular/common";
import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";


import { NgxSliderModule } from "@angular-slider/ngx-slider";
import { NgxDaterangepickerMd } from "ngx-daterangepicker-material";
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from "ngx-mask";
import { NgxPrintModule } from "ngx-print";
import { CustomPaginationComponent } from "./custom-pagination/custom-pagination.component";
import { DoanryDirective } from "src/app/commons/modules/doanry-directive.module/doanry-directive.module.module"; 
import { ReportCombineddataListComponent } from "./report-combineddata-list/report-combineddata-list.component";
import { ReportComparePopupComponent } from "./report-compare-popup/report-compare-popup.component";
import { ReportDonorfilterPopupComponent } from "./report-donorfilter-popup/report-donorfilter-popup.component";
import { ReportListComponent } from "./report-list/report-list.component";
import { ReportMainComponent } from "./report-main/report-main.component";
import { ReportRoutingModule } from "./report-routing.module";
import { ReportCombineddataCardpopupComponent } from "./report-combineddata-cardpopup/report-combineddata-cardpopup.component";
import { AddNewDropdownModule } from "src/app/commons/modules/add-new-dropdown/add-new-dropdown.module";
import { DonaryDatePickerModule } from "src/app/commons/modules/donary-date-picker/donary-date-picker.module";
import { ReportsSharedModule } from "./reports-shared.module";
import { TranslateModule } from "@ngx-translate/core";
import { CardsModule } from "../cards/cards.module";
import { CalendarModule } from "src/app/pages/transaction/pledge-transaction/hebrewCalendar/calendar/calendar.module";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { DataTableModule } from "src/app/commons/modules/data-table/data-table.module";
import { AngularMultiSelectModule } from "src/app/commons/modules/angular-multi-select-module/angular-multi-select.module";
import { StandardReportComponent } from "./standard-report/standard-report.component";



@NgModule({ declarations: [
        ReportMainComponent,
        ReportListComponent,
        ReportCombineddataListComponent,
        ReportComparePopupComponent,
        ReportDonorfilterPopupComponent,
        CustomPaginationComponent,
        ReportComparePopupComponent,
        ReportCombineddataCardpopupComponent,
    ],
    exports: [DonaryDatePickerModule, TranslateModule], imports: [CommonModule,
        FormsModule,
        NgxSliderModule,
        NgxPrintModule,
        DragDropModule,
        ReportRoutingModule,
        AddNewDropdownModule,
        TranslateModule,
        AngularMultiSelectModule,
        NgxDaterangepickerMd.forRoot(),
        //NgMultiSelectDropDownModule.forRoot(),
        NgxMaskDirective, NgxMaskPipe,
        DataTableModule,
        DonaryDatePickerModule,
        ReportsSharedModule,
        DoanryDirective,
        CardsModule,
        CalendarModule,
        NgbModule,
        StandardReportComponent], providers: [provideNgxMask(), provideHttpClient(withInterceptorsFromDi())] })
export class ReportModule {}
