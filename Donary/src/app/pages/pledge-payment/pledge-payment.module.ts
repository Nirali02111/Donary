import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from "@angular/common/http";
import { FormsModule } from "@angular/forms";
import { PledgePaymentRoutingModule } from "./pledge-payment-routing.module";
import { UnpaidPledgeListComponent } from "./unpaid-pledge-list/unpaid-pledge-list.component";
import { PledgePaymentVerifyComponent } from "./pledge-payment-verify/pledge-payment-verify.component";
import { PledgePaymentPayPopupComponent } from "./pledge-payment-pay-popup/pledge-payment-pay-popup.component";
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from "ngx-mask";

import { NgxDaterangepickerMd } from "ngx-daterangepicker-material";

import { TranslateModule } from "@ngx-translate/core";
import { DataTableModule } from "src/app/commons/modules/data-table/data-table.module";
import { AngularMultiSelectModule } from "src/app/commons/modules/angular-multi-select-module/angular-multi-select.module";

@NgModule({
  declarations: [
    UnpaidPledgeListComponent,
    PledgePaymentVerifyComponent,
    PledgePaymentPayPopupComponent,
  ],
  exports: [TranslateModule],
  imports: [
    CommonModule,
    FormsModule,
    PledgePaymentRoutingModule,
    DataTableModule,
    AngularMultiSelectModule,
    NgxDaterangepickerMd.forRoot(),
    NgxMaskDirective,
    NgxMaskPipe,
    TranslateModule,
  ],
  providers: [provideNgxMask(), provideHttpClient(withInterceptorsFromDi())],
})
export class PledgePaymentModule {}
