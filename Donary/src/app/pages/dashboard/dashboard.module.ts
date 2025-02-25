import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { AddNewDropdownModule } from 'src/app/commons/modules/add-new-dropdown/add-new-dropdown.module';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { TranslateModule } from '@ngx-translate/core';

import { NgSelectModule } from '@ng-select/ng-select';
import { DoanryDirective } from "src/app/commons/modules/doanry-directive.module/doanry-directive.module.module";
import { SkeletonLoaderModule } from "src/app/commons/modules/skeleton-loader/skeleton-loader.module";
import { CalendarModule } from "../transaction/pledge-transaction/hebrewCalendar/calendar/calendar.module";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { ClickOutsideModule } from "ng-click-outside";
import { DonaryDateFormatPipe } from "src/app/commons/donary-date-format.pipe";
import { CardsModule } from "../cards/cards.module";
import { NotificationModule } from "../notifications/notification.module";
@NgModule({ declarations: [DashboardComponent],
    exports: [TranslateModule], imports: [CommonModule,
        FormsModule,
        AddNewDropdownModule,
        DashboardRoutingModule,
        TranslateModule,
        NgxDaterangepickerMd.forRoot(),
        NgMultiSelectDropDownModule.forRoot(),
        NgSelectModule,
        DoanryDirective,
        SkeletonLoaderModule,
        CalendarModule,
        NgbModule,
        ClickOutsideModule,
        DonaryDateFormatPipe,
        CardsModule,
        NotificationModule], providers: [provideHttpClient(withInterceptorsFromDi())] })
export class DashboardModule {}
