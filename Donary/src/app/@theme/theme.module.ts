import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DoanryDirective } from "src/app/commons/modules/doanry-directive.module/doanry-directive.module.module";
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
 
@NgModule({ declarations: [],
    exports: [TranslateModule], imports: [CommonModule,
        FormsModule,
        TranslateModule,
        DoanryDirective,
        NgbModule], providers: [provideHttpClient(withInterceptorsFromDi())] })
export class ThemeModule { }