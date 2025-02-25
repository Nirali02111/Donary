import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AddTransactionPopupComponent } from "./add-transaction-popup/add-transaction-popup.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgxDaterangepickerMd } from "ngx-daterangepicker-material";

import { DonorDropdownListModule } from "src/app/commons/modules/donor-dropdown-list/donor-dropdown-list.module";
import { DonaryDatePickerModule } from "src/app/commons/modules/donary-date-picker/donary-date-picker.module";

import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from "ngx-mask";
import { MaketransactionSchedulePopupComponent } from "./maketransaction-schedule-popup/maketransaction-schedule-popup.component";
import { PayPledgePopupComponent } from "./pay-pledge-popup/pay-pledge-popup.component";
import { PaypledgeFilterPopupComponent } from "./paypledge-filter-popup/paypledge-filter-popup.component";
import { TranslateModule } from "@ngx-translate/core";
import { DoanryDirective } from "src/app/commons/modules/doanry-directive.module/doanry-directive.module.module";
import { NgSelectModule } from "@ng-select/ng-select";
import { EmailAddressPopupComponent } from './email-address-popup/email-address-popup.component';
import { PhoneNumberPopupComponent } from './phone-number-popup/phone-number-popup.component';

import { CalendarModule } from "src/app/pages/transaction/pledge-transaction/hebrewCalendar/calendar/calendar.module";
import { DataTableModule } from "src/app/commons/modules/data-table/data-table.module";
import { AngularMultiSelectModule } from "src/app/commons/modules/angular-multi-select-module/angular-multi-select.module";
import { LegalReceiptPopupComponent } from './legal-receipt-popup/legal-receipt-popup.component';
import { LegalReceiptCountryPopupComponent } from "./legal-receipt-country-popup/legal-receipt-country-popup.component";

import { SelectTransactionPopupComponent } from "./select-transaction-popup/select-transaction-popup.component";
import { CreatePledgeTransactionPopupComponent } from "./create-pledge-transaction-popup/create-pledge-transaction-popup.component";

import { DonaryDateFormatPipe } from "src/app/commons/donary-date-format.pipe";


@NgModule({
    declarations: [
        AddTransactionPopupComponent,
        LegalReceiptPopupComponent,
        MaketransactionSchedulePopupComponent,
        PayPledgePopupComponent,
        PaypledgeFilterPopupComponent,
        EmailAddressPopupComponent,
        PhoneNumberPopupComponent,
        LegalReceiptCountryPopupComponent,
        SelectTransactionPopupComponent,
        
    ],
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
        DoanryDirective,
        NgSelectModule,
        CalendarModule,
        DonaryDateFormatPipe
    ],
    exports: [
      AddTransactionPopupComponent,
      LegalReceiptPopupComponent,
      MaketransactionSchedulePopupComponent,
      PayPledgePopupComponent,
      EmailAddressPopupComponent,
      PhoneNumberPopupComponent,
      TranslateModule,
      LegalReceiptCountryPopupComponent,
    ],
    providers:[ provideNgxMask()]
})
export class MakeTransactionModule {}
