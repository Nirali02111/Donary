import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProductPlansRoutingModule } from './product-plans-routing.module'
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask, } from 'ngx-mask';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ProductPlansComponent } from './product-plans.component';
import { ProductHeaderModule } from './product-header/product-header.module';
import { LayoutComponent } from './layout/layout.component';
import { ProductDetailsComponent } from './product-details/product-details.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { SignUpComponent } from "./sign-up/sign-up.component";
import { RegisterAccountComponent } from './register-account/register-account.component';
import { ViewCartComponent } from './view-cart/view-cart.component';
import { DoanryDirective } from 'src/app/commons/modules/doanry-directive.module/doanry-directive.module.module';
import { SharedFormGroupModule } from 'src/app/commons/modules/shared-form-group/shared-form-group.module';
import { TranslateModule } from '@ngx-translate/core';
import { DataTableModule } from 'src/app/commons/modules/data-table/data-table.module';

@NgModule({ declarations: [ProductPlansComponent, LayoutComponent, ProductDetailsComponent, SignUpComponent, RegisterAccountComponent, ViewCartComponent],
    exports: [TranslateModule], imports: [CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ProductPlansRoutingModule,
        DataTableModule,
        ProductHeaderModule,
        NgxMaskDirective, NgxMaskPipe,
        NgbModule,
        NgSelectModule,
        DoanryDirective,
        SharedFormGroupModule,
        TranslateModule], providers: [provideNgxMask(), provideHttpClient(withInterceptorsFromDi())] })
export class ProductPlansModule { }