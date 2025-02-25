import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from "@angular/common/http";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AuthenticationRoutingModule } from "./authentication-routing.module";
import { LoginComponent } from "./login/login/login.component";
import { ResetPasswordComponent } from "./reset-password/reset-password.component";
import { DocumentRef, WindowRef } from "src/app/models/Platform";
import {
  RECAPTCHA_LOADER_OPTIONS,
  RECAPTCHA_V3_SITE_KEY,
  RecaptchaV3Module,
  ReCaptchaV3Service,
} from "ng-recaptcha";
import { environment } from "src/environments/environment";
import { TranslateModule } from "@ngx-translate/core";
import { SetPasswordComponent } from "./set-password/set-password.component";

@NgModule({
  declarations: [
    LoginComponent,
    ResetPasswordComponent,
    SetPasswordComponent,
    SetPasswordComponent,
  ],
  exports: [TranslateModule],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AuthenticationRoutingModule,
    TranslateModule,
    RecaptchaV3Module,
  ],
  providers: [
    ReCaptchaV3Service,
    WindowRef,
    DocumentRef,
    {
      provide: RECAPTCHA_V3_SITE_KEY,
      useValue: environment.RECAPTCHA_V3_SITE_KEY,
    },
    {
      provide: RECAPTCHA_LOADER_OPTIONS,
      useValue: {
        onBeforeLoad(_url: any) {
          return {
            url: new URL("https://www.google.com/recaptcha/enterprise.js"),
          };
        },
        onLoaded(recaptcha: any) {
          return recaptcha.enterprise;
        },
      },
    },
    provideHttpClient(withInterceptorsFromDi()),
  ],
})
export class AuthenticationModule {}
