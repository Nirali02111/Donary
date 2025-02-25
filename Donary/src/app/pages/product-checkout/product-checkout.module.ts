import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask, } from 'ngx-mask';
import { NgSelectModule } from '@ng-select/ng-select';
import { ProductCheckoutComponent } from './product-checkout/product-checkout.component';
import { ProductCheckoutRoutingModule } from './product-checkout-routing.module';
import { ProductHeaderModule } from '../product-plans/product-header/product-header.module';
import { ThankYouComponent } from './thank-you/thank-you.component';
import { CheckoutLayoutComponent } from './checkout-layout/checkout-layout.component';
import { DoanryDirective } from 'src/app/commons/modules/doanry-directive.module/doanry-directive.module.module';
import { TranslateModule } from '@ngx-translate/core';
import { DataTableModule } from 'src/app/commons/modules/data-table/data-table.module';

@NgModule({ declarations: [ProductCheckoutComponent, ThankYouComponent, CheckoutLayoutComponent],
    exports: [TranslateModule], imports: [CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ProductCheckoutRoutingModule,
        DataTableModule,
        ProductHeaderModule,
        NgSelectModule,
        NgxMaskDirective, NgxMaskPipe,
        DoanryDirective,
        TranslateModule], providers: [provideNgxMask(), provideHttpClient(withInterceptorsFromDi())] })
export class ProductCheckoutModule { }