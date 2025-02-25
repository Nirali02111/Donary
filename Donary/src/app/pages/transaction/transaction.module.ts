import { DragDropModule } from "@angular/cdk/drag-drop";
import { CommonModule } from "@angular/common";
import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ClickOutsideModule } from "ng-click-outside";
import { NgxSliderModule } from "@angular-slider/ngx-slider";
import { NgxDaterangepickerMd } from "ngx-daterangepicker-material";
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from "ngx-mask";
import { NgxPrintModule } from "ngx-print";
import { CampaignTransGridFilterPopupComponent } from "./campaign-transaction/campaign-trans-grid-filter-popup/campaign-trans-grid-filter-popup.component";
import { CampaignTransactionComponent } from "./campaign-transaction/campaign-transaction.component";
import { ImportPaymentComponent } from "./payment-transaction/import-payment/import-payment.component";
import { PaymentTransGridFilterPopupComponent } from "./payment-transaction/payment-trans-grid-filter-popup/payment-trans-grid-filter-popup/payment-trans-grid-filter-popup.component";
import { PaymentTransactionComponent } from "./payment-transaction/payment-transaction.component";
import { AddUpdatePledgeComponent } from "./pledge-transaction/add-update-pledge/add-update-pledge.component";
import { ImportPledgeComponent } from "./pledge-transaction/import-pledge/import-pledge.component";
import { PledgeTransGridFilterPopupComponent } from "./pledge-transaction/pledge-trans-grid-filter-popup/pledge-trans-grid-filter-popup.component";
import { PledgeTransactionComponent } from "./pledge-transaction/pledge-transaction.component";
import { ReminderTransactionComponent } from "./reminder-transaction/reminder-transaction.component";
import { ImportScheduleComponent } from "./schedule-transaction/import-schedule/import-schedule.component";
import { SchedulePaymentTransactionComponent } from "./schedule-transaction/schedule-payment-transaction.component";
import { SchedulePledgeTransactionComponent } from "./schedule-transaction/schedule-pledge-transaction/schedule-pledge-transaction.component";
import { ScheduleTransGridFilterPopupComponent } from "./schedule-transaction/schedule-trans-grid-filter-popup/schedule-trans-grid-filter-popup.component";
import { SupportPopupComponent } from "./support-popup/support-popup.component";
import { TransactionMainComponent } from "./transaction-main/transaction-main.component";
import { TransactionRoutingModule } from "./transaction-routing.module";
import { DonaryDatePickerModule } from "./../../commons/modules/donary-date-picker/donary-date-picker.module";
import { AddNewDropdownModule } from "src/app/commons/modules/add-new-dropdown/add-new-dropdown.module";
import { DonorDropdownListModule } from "src/app/commons/modules/donor-dropdown-list/donor-dropdown-list.module";
import { SpecialCharacterDirective } from "./../../commons/special-character.directive";
import { NgbModule, NgbPaginationModule, NgbNavModule } from "@ng-bootstrap/ng-bootstrap";
import { ResizableModule } from "./../../commons/modules/resizable/resizable.module";
import { SlickModule } from "./../../commons/modules/slick/slick.module";
import { ReactiveFormsModule } from "@angular/forms";
import { BulkStatementPopupComponent } from "./bulk-statement-popup/bulk-statement-popup.component";
import { CardsModule } from "../cards/cards.module";
import { TranslateModule } from "@ngx-translate/core";
import { DoanryDirective } from "src/app/commons/modules/doanry-directive.module/doanry-directive.module.module";
import { CalendarModule } from "./pledge-transaction/hebrewCalendar/calendar/calendar.module";
import { TabulatorModule } from "src/app/commons/modules/tabulator/tabulator.module";
import { AliyosGroupListMainComponent } from './aliyos/aliyos-group-list-main/aliyos-group-list-main.component';
import { SkeletonLoaderModule } from "src/app/commons/modules/skeleton-loader/skeleton-loader.module";
import { DataTableModule } from "src/app/commons/modules/data-table/data-table.module";
import { AngularMultiSelectModule } from "src/app/commons/modules/angular-multi-select-module/angular-multi-select.module";
import { DonaryDateFormatPipe } from "src/app/commons/donary-date-format.pipe";

@NgModule({ declarations: [
        TransactionMainComponent,
        PledgeTransactionComponent,
        PledgeTransGridFilterPopupComponent,
        ImportPledgeComponent,
        AddUpdatePledgeComponent,
        SupportPopupComponent,
        PaymentTransactionComponent,
        CampaignTransactionComponent,
        PaymentTransGridFilterPopupComponent,
        ImportPaymentComponent,
        SchedulePaymentTransactionComponent,
        ImportScheduleComponent,
        ScheduleTransGridFilterPopupComponent,
        CampaignTransactionComponent,
        CampaignTransGridFilterPopupComponent,
        ReminderTransactionComponent,
        SchedulePledgeTransactionComponent,
        SpecialCharacterDirective,
        BulkStatementPopupComponent,
        AliyosGroupListMainComponent,
        BulkStatementPopupComponent
    ],
    exports: [TranslateModule], imports: [NgbPaginationModule,
        CommonModule,
        FormsModule,
        DragDropModule,
        TransactionRoutingModule,
        NgxSliderModule,
        NgxPrintModule,
        NgbModule,
        NgbNavModule,
        CardsModule,
        TranslateModule,
        AngularMultiSelectModule,
        AddNewDropdownModule,
        NgxDaterangepickerMd.forRoot(),
        //NgMultiSelectDropDownModule.forRoot(),
        NgxMaskDirective, NgxMaskPipe,
        ResizableModule,
        DataTableModule,
        ClickOutsideModule,
        DonaryDatePickerModule,
        DonorDropdownListModule,
        SlickModule,
        FormsModule,
        ReactiveFormsModule,
        DoanryDirective,
        TabulatorModule,
        SkeletonLoaderModule,
        CalendarModule,
        DonaryDateFormatPipe], providers: [provideNgxMask(), provideHttpClient(withInterceptorsFromDi())] })
export class TransactionModule {}
