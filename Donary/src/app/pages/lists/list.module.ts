import { DragDropModule } from "@angular/cdk/drag-drop";
import { CommonModule } from "@angular/common";
import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { NgxSliderModule } from "@angular-slider/ngx-slider";
import { NgxDaterangepickerMd } from "ngx-daterangepicker-material";
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from "ngx-mask";
import { NgxPrintModule } from "ngx-print";
import { AddNewDropdownModule } from "src/app/commons/modules/add-new-dropdown/add-new-dropdown.module";
import { SourceListComponent } from "../source/source-list/source-list.component";
import { CampaignListComponent } from "./../campaign/campaign-list/campaign-list.component";
import { CollectorListComponent } from "./../collector/collector-list/collector-list.component";
import { DonorListComponent } from "./../donor/donor-list/donor-list.component";
import { LocationListComponent } from "./../location/location-list/location-list.component";
import { ReasonListComponent } from "./../reason/reason-list/reason-list.component";
import { ListMainComponent } from "./list-main/list-main.component";
import { ListRoutingModule } from "./list-routing.module";
import { TotalPanelComponent } from "./total-panel/total-panel.component";
import { SeatsComponent } from "../seats/seats.component";

import { ResizableModule } from "./../../commons/modules/resizable/resizable.module";
import { SlickModule } from "./../../commons/modules/slick/slick.module";
import { CardsModule } from "../cards/cards.module";
import { ReportsSharedModule } from "../report/reports-shared.module";
import { BulkCampaignReportComponent } from "../campaign/bulk-campaign-report/bulk-campaign-report.component";
import { TranslateModule } from "@ngx-translate/core";
import { SeatFilterPopupComponent } from "../seats/seat-filter-popup/seat-filter-popup.component";
import { DoanryDirective } from "src/app/commons/modules/doanry-directive.module/doanry-directive.module.module";
import { TabulatorModule } from "src/app/commons/modules/tabulator/tabulator.module";
import { ImageCropperModule } from "ngx-image-cropper";
import { NgbModule, NgbNavModule } from "@ng-bootstrap/ng-bootstrap";
import { CalendarModule } from "src/app/pages/transaction/pledge-transaction/hebrewCalendar/calendar/calendar.module";
import { DataTableModule } from "src/app/commons/modules/data-table/data-table.module";
import { AngularMultiSelectModule } from "src/app/commons/modules/angular-multi-select-module/angular-multi-select.module";
import { DonaryDateFormatPipe } from "src/app/commons/donary-date-format.pipe";

@NgModule({ declarations: [
        ListMainComponent,
        DonorListComponent,
        ReasonListComponent,
        CampaignListComponent,
        CollectorListComponent,
        SourceListComponent,
        LocationListComponent,
        TotalPanelComponent,
        SeatsComponent,
        BulkCampaignReportComponent,
        SeatFilterPopupComponent,
    ],
    exports: [TranslateModule], imports: [CommonModule,
        FormsModule,
        NgbNavModule,
        NgbModule,
        ReactiveFormsModule,
        ListRoutingModule,
        NgxSliderModule,
        NgxPrintModule,
        TranslateModule,
        DragDropModule,
        AngularMultiSelectModule,
        AddNewDropdownModule,
        NgxDaterangepickerMd.forRoot(),
        NgxMaskDirective,
        NgxMaskPipe,
        ResizableModule,
        DataTableModule,
        SlickModule,
        CardsModule,
        ReportsSharedModule,
        DoanryDirective,
        ImageCropperModule,
        TabulatorModule,
        CalendarModule,
        DonaryDateFormatPipe], providers: [provideNgxMask(), provideHttpClient(withInterceptorsFromDi())] })
export class ListModule {}
