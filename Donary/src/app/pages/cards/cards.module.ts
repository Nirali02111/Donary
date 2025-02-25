import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgxDaterangepickerMd } from "ngx-daterangepicker-material";


import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from "ngx-mask";
import { NgxMaterialTimepickerModule } from "ngx-material-timepicker";

import { DonaryDatePickerModule } from "src/app/commons/modules/donary-date-picker/donary-date-picker.module";
import { DonorDropdownListModule } from "src/app/commons/modules/donor-dropdown-list/donor-dropdown-list.module";
import { MakeTransactionModule } from "../make-transaction/make-transaction.module";


import { DonorCardPopupComponent } from "./donor-card-popup/donor-card-popup.component";
import { CollectorCardPopupComponent } from "./collector-card-popup/collector-card-popup.component";
import { DeviceCardPopupComponent } from "./device-card-popup/device-card-popup.component";
import { EditPaymentPopupComponent } from "./payment-card-popup/edit-payment-popup/edit-payment-popup.component";
import { PaymentChangeLogComponent } from "./payment-card-popup/payment-change-log/payment-change-log.component";
import { EditPledgePopupComponent } from "./pledge-card-popup/edit-pledge-popup/edit-pledge-popup.component";
import { PledgeCardPopupComponent } from "./pledge-card-popup/pledge-card-popup.component";
import { DismissPaymentPopupComponent } from "./schedule-card-popup/dismiss-payment-popup/dismiss-payment-popup.component";
import { EditAmountdataPopupComponent } from "./schedule-card-popup/edit-amountdata-popup/edit-amountdata-popup.component";
import { EditScheduleCardComponent } from "./schedule-card-popup/edit-schedule-card/edit-schedule-card.component";
import { SchedulePaymentCardPopupComponent } from "./schedule-card-popup/schedule-paymentcard-popup.component";
import { SchedulePledgecardPopupComponent } from "./schedule-card-popup/schedule-pledgecard-popup/schedule-pledgecard-popup.component";
import { WalletlistPopupComponent } from "./schedule-card-popup/walletlist-popup/walletlist-popup.component";
import { SchedulelistCardPopupComponent } from "./schedulelist-card-popup/schedulelist-card-popup.component";
import { OptionTabPopupComponent } from "../make-transaction/option-tab-popup/option-tab-popup.component";
import { LocationCardPopupComponent } from "././location-card-popup/location-card-popup.component";
import { PaymentCardPopupComponent } from "././payment-card-popup/payment-card-popup.component";
import { PdfviewerPopupComponent } from "././payment-card-popup/pdfviewer-popup/pdfviewer-popup.component";
import { CheckDetailsPopupComponent } from "././payment-card-popup/check-details-popup/check-details-popup.component";
import { PaymentlistCardPopupComponent } from "././paymentlist-card-popup/paymentlist-card-popup.component";
import { PledgelistCardPopupComponent } from "././pledgelist-card-popup/pledgelist-card-popup.component";
import { ReasonCardPopupComponent } from "././reason-card-popup/reason-card-popup.component";
import { CampaignCardPopupComponent } from "./campaign-card-popup/campaign-card-popup.component";
import { NextScheduleDatePopupComponent } from "././schedule-card-popup/next-schedule-date-popup/next-schedule-date-popup.component";
import { NextScheduleEditPopupComponent } from "././schedule-card-popup/next-schedule-edit-popup/next-schedule-edit-popup.component";
import { MapViewCardPopupComponent } from "././map-view-card-popup/map-view-card-popup.component";
import { SeatsCardPopupComponent } from "./seats-card-popup/seats-card-popup.component";
import { EditSourceCardPopupComponent } from "./edit-source-card-popup/edit-source-card-popup.component";


import { DonorSaveComponent } from "../donor/donor-save/donor-save.component";
import { BulkCustomReportComponent } from "../donor/bulk-custom-report/bulk-custom-report.component";

import { SaveReasonPopupComponent } from "../reason/save-reason-popup/save-reason-popup.component";
import { ReasonFilterPopupComponent } from "../reason/reason-filter-popup/reason-filter-popup.component";
import { BulkReasonReportComponent } from "../reason/bulk-reason-report/bulk-reason-report.component";

import { SaveCampaignPopupComponent } from "../campaign/save-campaign-popup/save-campaign-popup.component";

import { SaveCollectorPopupComponent } from "../collector/save-collector-popup/save-collector-popup.component";
import { CollectorFilterPopupComponent } from "../collector/collector-filter-popup/collector-filter-popup.component";
import { BuikCollectorReportComponent } from "../collector/buik-collector-report/buik-collector-report.component";

import { SaveLocationPopupComponent } from "../location/save-location-popup/save-location-popup.component";
import { BulkCustomReportComponent as BulkLocationCustomReportComponent } from "../location/bulk-custom-report/bulk-custom-report.component";
import { DonorFilterPopupComponent } from "../donor/donor-filter-popup/donor-filter-popup.component";
import { CampaignFilterPopupComponent } from "../campaign/campaign-filter-popup/campaign-filter-popup.component";
import { LocationFilterPopupComponent } from "../location/location-filter-popup/location-filter-popup.component";
import { SourceFilterComponent } from "../source/source-filter/source-filter.component";
import { TransactionAdvancedFilterPopupComponent } from "../transaction/transaction-advanced-filter-popup/transaction-advanced-filter-popup.component";
import { EditUserPopupComponent } from "../users/edit-user-popup/edit-user-popup.component";
import { PrintReceiptPopupComponent } from "../transaction/receipt-actions/print-receipt-popup/print-receipt-popup.component";
import { SendReceiptPopupComponent } from "../transaction/send-receipt-popup/send-receipt-popup.component";
import { SendReceiptPopupComponent as DonarSendReceiptPopupComponen } from "../donor/send-receipt-popup/send-receipt-popup.component";
import { SendTextreceiptPopupComponent } from "../transaction/receipt-actions/send-textreceipt-popup/send-textreceipt-popup.component";
import { SendEmailreceiptPopupComponent } from "../transaction/receipt-actions/send-emailreceipt-popup/send-emailreceipt-popup.component";
import { SendMailreceiptPopupComponent } from "../transaction/receipt-actions/send-mailreceipt-popup/send-mailreceipt-popup.component";
import { BulkEmailReceiptComponent } from "../transaction/receipt-actions/bulk-email-receipt/bulk-email-receipt.component";
import { BulkSMSReceiptComponent } from "../transaction/receipt-actions/bulk-smsreceipt/bulk-smsreceipt.component";
import { BulkMailReceiptComponent } from "../transaction/receipt-actions/bulk-mail-receipt/bulk-mail-receipt.component";
import { SelectPhoneBoxViewComponent } from "../transaction/receipt-actions/bulk-smsreceipt/select-phone-box-view/select-phone-box-view.component";
import { EmailMissingPopupComponent } from "../transaction/email-missing-popup/email-missing-popup.component";
import { AdvancereceiptActionPopupComponent } from "../transaction/advancereceipt-action-popup/advancereceipt-action-popup.component";
import { CustomeReportComponent } from "../transaction/custome-report/custome-report.component";
import { AliyasPledgeComponent } from "../aliyas-pledge/aliyas-pledge.component";
import { BulkStatementPopupComponent as DonorBulkStatementPopupComponent } from "../donor/bulk-statement-popup/bulk-statement-popup.component";
import { EditTransactionInfoComponent } from '../transaction/edit-transaction-info/edit-transaction-info.component';
import { SavecardPopupComponent } from "./donor-card-popup/savecard-popup/savecard-popup.component";
import { ExportStatementPopupComponent } from "./donor-card-popup/export-statement-popup/export-statement-popup.component";
import { DoanryDirective } from "src/app/commons/modules/doanry-directive.module/doanry-directive.module.module";
import { AdvanceDropdownPopupComponent } from "../donor/advance-dropdown-popup/advance-dropdown-popup.component";
import { TagColorListModule } from "src/app/commons/modules/tag-color-list/tag-color-list.module";
import { DonorAddtagPopupComponent } from "../donor/donor-addtag-popup/donor-addtag-popup.component";
import { DonorMergeComponent } from "../donor/donor-merge/donor-merge.component";
import { SaveSeatPopupComponent } from './save-seat-popup/save-seat-popup.component';
import { BulkAdvanceStatementComponent } from '../donor/bulk-advance-statement/bulk-advance-statement.component';
import { TranslateModule } from "@ngx-translate/core";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { PrintSingleReceiptPopupComponent } from "../transaction/receipt-actions/print-singlereceipt-popup/print-singlereceipt-popup.component";
import { NgSelectModule } from "@ng-select/ng-select";
import { ImageCropperModule } from "ngx-image-cropper";
import { DonorAddlocationPopupComponent } from "../donor/donor-addlocation-popup/donor-addlocation-popup.component";
import { BulkSourcePopupComponent } from "../source/bulk-source-popup/bulk-source-popup.component";
import { AddApikeyPopupComponent } from "../admin/api-keys/add-apikey-popup/add-apikey-popup.component";
import { BulkEditreasonPopupComponent } from './bulk-editreason-popup/bulk-editreason-popup.component';
import { SaveChargetranPopupComponent } from "../campaign/save-chargetran-popup/save-chargetran-popup.component";
import { CalenderModalComponent } from "../transaction/payment-transaction/calender-modal/calender-modal.component";

import { DonorAddfamilyPopupComponent } from "../donor/donor-addfamily-popup/donor-addfamily-popup.component";
import { AddShtibelPopupComponent } from "../admin/minyanim/add-shtibel-popup/add-shtibel-popup.component";
import { AddSeatsPopupComponent } from "../admin/seats-admin/add-seats-popup/add-seats-popup.component";
import { AliyasReportdatePopupComponent } from "../aliyas-pledge/aliyas-reportdate-popup/aliyas-reportdate-popup.component";
import { SeasonCardPopupComponent } from "../admin/seats-admin/season-card-popup/season-card-popup.component";
import { BatchCardPopupComponent } from './batch-card-popup/batch-card-popup.component';
import { BulkSelectPopupComponent } from "../transaction/bulk-select-popup/bulk-select-popup.component";
import { PrintSeatStickersCardPopupComponent } from './print-seat-stickers-card-popup/print-seat-stickers-card-popup.component';
import { DonaryInputModule } from "src/app/commons/modules/donary-input/donary-input.module";
import { CreateAliyosGroupPopupComponent } from './create-aliyos-group-popup/create-aliyos-group-popup.component';
import { CreateAliyosComponent } from './create-aliyos/create-aliyos.component';
import { UpgradeSuccessPopupComponent } from './upgrade-success-popup/upgrade-success-popup.component';
import { SaveBatchPopupComponent } from './batch-card-popup/save-batch-popup/save-batch-popup.component';
import { ImportTokenComponent } from "../donor/import-token/import-token.component";
import { CalendarModule } from "src/app/pages/transaction/pledge-transaction/hebrewCalendar/calendar/calendar.module";
import { ClickOutsideModule } from "ng-click-outside";
import { DataTableModule } from "src/app/commons/modules/data-table/data-table.module";
import { AngularMultiSelectModule } from "src/app/commons/modules/angular-multi-select-module/angular-multi-select.module";
import { SkeletonLoaderModule } from "src/app/commons/modules/skeleton-loader/skeleton-loader.module";
import { ColorWarningComponent } from './color-warning/color-warning.component';
import { SkeletonInfoLoaderComponent } from "src/app/commons/modules/skeleton-loader/skeleton-info-loader/skeleton-info-loader.component";
import { CircleSkeletonLoaderComponent } from "src/app/commons/modules/skeleton-loader/circle-skeleton-loader/circle-skeleton-loader.component";
import { EditSkeletonLoaderComponent } from "src/app/commons/modules/skeleton-loader/edit-skeleton-loader/edit-skeleton-loader.component";
import { ScehduleEditSkeletonLoaderComponent } from "src/app/commons/modules/skeleton-loader/scehdule-edit-skeleton-loader/scehdule-edit-skeleton-loader.component";
import { DonaryDateFormatPipe } from "src/app/commons/donary-date-format.pipe";
import { ReminderPopupComponent } from "../notifications/reminder-popup/reminder-popup.component";

@NgModule({
    declarations: [
        DonorCardPopupComponent,
        DonorSaveComponent,
        AddApikeyPopupComponent,
        CollectorCardPopupComponent,
        DeviceCardPopupComponent,
        EditPaymentPopupComponent,
        PaymentChangeLogComponent,
        EditPledgePopupComponent,
        PledgeCardPopupComponent,
        DismissPaymentPopupComponent,
        EditAmountdataPopupComponent,
        EditScheduleCardComponent,
        SchedulePaymentCardPopupComponent,
        SchedulePledgecardPopupComponent,
        WalletlistPopupComponent,
        SchedulelistCardPopupComponent,
        OptionTabPopupComponent,
        LocationCardPopupComponent,
        PaymentCardPopupComponent,
        PdfviewerPopupComponent,
        CheckDetailsPopupComponent,
        PaymentlistCardPopupComponent,
        PledgelistCardPopupComponent,
        ReasonCardPopupComponent,
        CampaignCardPopupComponent,
        NextScheduleDatePopupComponent,
        NextScheduleEditPopupComponent,
        MapViewCardPopupComponent,
        SeatsCardPopupComponent,
        SaveReasonPopupComponent,
        SaveCampaignPopupComponent,
        SaveLocationPopupComponent,
        SaveCollectorPopupComponent,
        PrintReceiptPopupComponent,
        PrintSingleReceiptPopupComponent,
        SendReceiptPopupComponent,
        DonarSendReceiptPopupComponen,
        SendTextreceiptPopupComponent,
        SendEmailreceiptPopupComponent,
        SendMailreceiptPopupComponent,
        BulkEmailReceiptComponent,
        BulkSMSReceiptComponent,
        BulkMailReceiptComponent,
        SelectPhoneBoxViewComponent,
        EmailMissingPopupComponent,
        AdvancereceiptActionPopupComponent,
        EditSourceCardPopupComponent,
        EditUserPopupComponent,
        AliyasPledgeComponent,
        AliyasReportdatePopupComponent,
        DonorFilterPopupComponent,
        CollectorFilterPopupComponent,
        ReasonFilterPopupComponent,
        BulkReasonReportComponent,
        BulkCustomReportComponent,
        BuikCollectorReportComponent,
        BulkLocationCustomReportComponent,
        CustomeReportComponent,
        CampaignFilterPopupComponent,
        LocationFilterPopupComponent,
        SourceFilterComponent,
        TransactionAdvancedFilterPopupComponent,
        DonorBulkStatementPopupComponent,
        EditTransactionInfoComponent,
        SavecardPopupComponent,
        ExportStatementPopupComponent,
        AdvanceDropdownPopupComponent,
        DonorAddtagPopupComponent,
        DonorAddfamilyPopupComponent,
        DonorMergeComponent,
        SaveSeatPopupComponent,
        BulkAdvanceStatementComponent,
        DonorAddlocationPopupComponent,
        BulkSourcePopupComponent,
        BulkEditreasonPopupComponent,
        SaveChargetranPopupComponent,
        CalenderModalComponent,
        // CommonHebrewEnglishCalendarComponent,
        // HebrewCalendarComponent,
        // EnglishCalendarComponent,
        AddShtibelPopupComponent,
        AddSeatsPopupComponent,
        SeasonCardPopupComponent,
        BatchCardPopupComponent,
        BulkSelectPopupComponent,
        PrintSeatStickersCardPopupComponent,
        CreateAliyosGroupPopupComponent,
        CreateAliyosComponent,
        UpgradeSuccessPopupComponent,
        SaveBatchPopupComponent,
        ImportTokenComponent,
        ColorWarningComponent,
        ReminderPopupComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        NgxDaterangepickerMd.forRoot(),
        AngularMultiSelectModule,
        DonorDropdownListModule,
        DonaryDatePickerModule,
        DataTableModule,
        NgbModule,
        NgxMaskDirective, NgxMaskPipe,
        TranslateModule,
        DoanryDirective,
        MakeTransactionModule,
        NgxMaterialTimepickerModule,
        TagColorListModule,
        DragDropModule,
        NgSelectModule,
        ImageCropperModule,
        DonaryInputModule,
        CalendarModule,
        ClickOutsideModule,
        SkeletonLoaderModule,
        SkeletonInfoLoaderComponent,
        CircleSkeletonLoaderComponent,
        EditSkeletonLoaderComponent,
        ScehduleEditSkeletonLoaderComponent,
        DonaryDateFormatPipe
    ],
    exports: [
        TranslateModule,
        DonorCardPopupComponent,
        SaveReasonPopupComponent,
        DonorFilterPopupComponent,
        CollectorCardPopupComponent,
        DeviceCardPopupComponent,
        EditPaymentPopupComponent,
        PaymentChangeLogComponent,
        EditPledgePopupComponent,
        PledgeCardPopupComponent,
        DismissPaymentPopupComponent,
        EditAmountdataPopupComponent,
        EditScheduleCardComponent,
        SchedulePaymentCardPopupComponent,
        SchedulePledgecardPopupComponent,
        WalletlistPopupComponent,
        SchedulelistCardPopupComponent,
        OptionTabPopupComponent,
        LocationCardPopupComponent,
        PaymentCardPopupComponent,
        PdfviewerPopupComponent,
        CheckDetailsPopupComponent,
        PaymentlistCardPopupComponent,
        PledgelistCardPopupComponent,
        ReasonCardPopupComponent,
        CampaignCardPopupComponent,
        NextScheduleDatePopupComponent,
        NextScheduleEditPopupComponent,
        MapViewCardPopupComponent,
        SeatsCardPopupComponent,
        SaveCampaignPopupComponent,
        SaveLocationPopupComponent,
        SaveCollectorPopupComponent,
        EditSourceCardPopupComponent,
        EditUserPopupComponent,
        AliyasPledgeComponent,
        AliyasReportdatePopupComponent,
        PrintReceiptPopupComponent,
        PrintSingleReceiptPopupComponent,
        SendReceiptPopupComponent,
        DonarSendReceiptPopupComponen,
        SendTextreceiptPopupComponent,
        SendEmailreceiptPopupComponent,
        SendMailreceiptPopupComponent,
        BulkEmailReceiptComponent,
        BulkSMSReceiptComponent,
        BulkMailReceiptComponent,
        SelectPhoneBoxViewComponent,
        EmailMissingPopupComponent,
        AdvancereceiptActionPopupComponent,
        CustomeReportComponent,
        CollectorFilterPopupComponent,
        ReasonFilterPopupComponent,
        BulkReasonReportComponent,
        BulkCustomReportComponent,
        BuikCollectorReportComponent,
        BulkLocationCustomReportComponent,
        CampaignFilterPopupComponent,
        LocationFilterPopupComponent,
        SourceFilterComponent,
        TransactionAdvancedFilterPopupComponent,
        DonorBulkStatementPopupComponent,
        EditTransactionInfoComponent,
        AdvanceDropdownPopupComponent,
        SavecardPopupComponent,
        ExportStatementPopupComponent,
        DonorAddtagPopupComponent,
        DonorAddfamilyPopupComponent,
        DonorMergeComponent,
        SaveSeatPopupComponent,
        BulkAdvanceStatementComponent,
        DonorAddlocationPopupComponent,
        BulkEditreasonPopupComponent,
        SaveChargetranPopupComponent,
        CalenderModalComponent,
        // CommonHebrewEnglishCalendarComponent,
        BulkSelectPopupComponent,
        PrintSeatStickersCardPopupComponent,
        CreateAliyosGroupPopupComponent,
        CreateAliyosComponent,
        UpgradeSuccessPopupComponent,
        SaveBatchPopupComponent,
        ImportTokenComponent,
        ColorWarningComponent,
        ReminderPopupComponent
    ],


    providers:[provideNgxMask()]
})
export class CardsModule {}
