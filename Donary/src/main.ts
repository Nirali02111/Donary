/// <reference types="@angular/localize" />

// import 'hammerjs';
import { enableProdMode, importProvidersFrom } from '@angular/core';

import { environment } from './environments/environment';
import { AppComponent } from './app/app.component';
import { DoanryDirective } from 'src/app/commons/modules/doanry-directive.module/doanry-directive.module.module';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NgSelectModule } from '@ng-select/ng-select';
import { AngularMultiSelectModule } from './app/commons/modules/angular-multi-select-module/angular-multi-select.module';
import { DonaryDatePickerModule } from './app/commons/modules/donary-date-picker/donary-date-picker.module';
import { ToastrModule } from 'ngx-toastr';
import { provideAnimations } from '@angular/platform-browser/animations';
import { ProductHeaderModule } from './app/pages/product-plans/product-header/product-header.module';
import { MobileDeviceModule } from './app/pages/product-plans/mobile-device/mobile-device.module';
import { DrmModule } from './app/pages/product-plans/drm/drm.module';

import { PledgePaymentModule } from './app/pages/pledge-payment/pledge-payment.module';


import { ThemeModule } from './app/@theme/theme.module';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app/app-routing.module';

import { TranslateModule, TranslateLoader, TranslatePipe } from '@ngx-translate/core';
import { BrowserModule, provideProtractorTestingSupport, bootstrapApplication } from '@angular/platform-browser';
import { NgbPaginationModule, NgbModule, NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { NeedAuthGuardGuard } from './app/commons/need-auth-guard.guard';
import { WINDOW_PROVIDERS } from './app/commons/windows-provider.service';
import { ApiInterceptor } from './app/commons/api-interceptor';
import { HTTP_INTERCEPTORS, withInterceptorsFromDi, provideHttpClient, HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { RECAPTCHA_LOADER_OPTIONS, RECAPTCHA_V3_SITE_KEY } from 'ng-recaptcha';
import { DonaryDateFormatPipe } from './app/commons/donary-date-format.pipe';

if (environment.production) {
  enableProdMode();
}


export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http, "./assets/i18n/",".json");
  }

bootstrapApplication(AppComponent, {
    providers: [
        importProvidersFrom(NgbPaginationModule, BrowserModule, TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            }
        }), AppRoutingModule, FormsModule, ThemeModule, NgbModule, NgbAccordionModule,   PledgePaymentModule, DrmModule, MobileDeviceModule, ProductHeaderModule, ToastrModule.forRoot({
            timeOut: 10000,
            positionClass: 'toast-bottom-right',
            closeButton: true,
        }), DonaryDatePickerModule, AngularMultiSelectModule, NgSelectModule, NgMultiSelectDropDownModule, CommonModule, DoanryDirective),
        {
            provide: HTTP_INTERCEPTORS,
            useClass: ApiInterceptor,
            multi: true,
        },
        WINDOW_PROVIDERS,
        NeedAuthGuardGuard,
        DonaryDateFormatPipe,
        {
            provide: RECAPTCHA_V3_SITE_KEY,
            useValue: environment.RECAPTCHA_V3_SITE_KEY,
          },
          {
            provide: RECAPTCHA_LOADER_OPTIONS,
            useValue: {
              onBeforeLoad(_url: any) {
                return {
                  url: new URL('https://www.google.com/recaptcha/enterprise.js'),
                };
              },
              onLoaded(recaptcha: any) {
                return recaptcha.enterprise;
              },
            },
          },

        TranslatePipe,
        provideHttpClient(withInterceptorsFromDi()),
        provideAnimations(),
        provideProtractorTestingSupport()
    ]
})
  .catch(err => console.error(err));