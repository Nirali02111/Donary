import { DragDropModule } from "@angular/cdk/drag-drop";
import { CommonModule } from "@angular/common";
import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";


import { NgxSliderModule } from "@angular-slider/ngx-slider";
import { NgxDaterangepickerMd } from "ngx-daterangepicker-material";
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from "ngx-mask";
import { NgxPrintModule } from "ngx-print";
import { DonorLocationPopupComponent } from "./../cards/donor-card-popup/donor-location-popup/donor-location-popup.component";
import { DonorWalletPopupComponent } from "./../cards/donor-card-popup/donor-wallet-popup/donor-wallet-popup.component";
import { DonorEmailComponent } from "./donor-email/donor-email.component";
import { DonorSaveEmailComponent } from "./donor-email/donor-save-email/donor-save-email.component";

import { DonorPhoneComponent } from "./donor-phone/donor-phone.component";
import { DonorSavePhoneComponent } from "./donor-phone/donor-save-phone/donor-save-phone.component";
import { DonorRoutingModule } from "./donor-routing.module";
import { DonaryDatePickerModule } from "./../../commons/modules/donary-date-picker/donary-date-picker.module";
import { DonorDropdownListModule } from "src/app/commons/modules/donor-dropdown-list/donor-dropdown-list.module";
import { TagColorListModule } from "src/app/commons/modules/tag-color-list/tag-color-list.module";

import { NgMultiSelectDropDownModule } from "ng-multiselect-dropdown";
import { NgSelectModule } from "@ng-select/ng-select";
import { DoanryDirective } from "src/app/commons/modules/doanry-directive.module/doanry-directive.module.module";
import { CardsModule } from "../cards/cards.module";
import { TranslateModule } from "@ngx-translate/core";

import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { DataTableModule } from "src/app/commons/modules/data-table/data-table.module";
import { AngularMultiSelectModule } from "src/app/commons/modules/angular-multi-select-module/angular-multi-select.module";


@NgModule({ declarations: [
        DonorLocationPopupComponent,
        DonorWalletPopupComponent,
        DonorEmailComponent,
        DonorPhoneComponent,
        DonorEmailComponent,
        DonorPhoneComponent,
        DonorSaveEmailComponent,
        DonorSavePhoneComponent
        //SendReceiptPopupComponent,
    ],
    exports: [TranslateModule], imports: [CommonModule,
        FormsModule,
        NgxSliderModule,
        NgxPrintModule,
        DragDropModule,
        TranslateModule,
        DonorRoutingModule,
        AngularMultiSelectModule,
        NgxDaterangepickerMd.forRoot(),
        //NgMultiSelectDropDownModule.forRoot(),
        NgxMaskDirective, NgxMaskPipe,
        DataTableModule,
        DonaryDatePickerModule,
        DonorDropdownListModule,
        TagColorListModule,
        NgSelectModule,
        ReactiveFormsModule,
        DonaryDatePickerModule,
        NgMultiSelectDropDownModule,
        DoanryDirective,
        CardsModule,
        NgbDropdownModule], providers: [provideNgxMask(), provideHttpClient(withInterceptorsFromDi())] })
export class DonorModule {}
