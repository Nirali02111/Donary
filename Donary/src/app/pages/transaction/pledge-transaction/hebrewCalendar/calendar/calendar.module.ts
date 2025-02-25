import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommonHebrewEnglishCalendarComponent } from 'src/app/pages/transaction/pledge-transaction/hebrewCalendar/common-hebrew-english-calendar/common-hebrew-english-calendar.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HebrewCalendarComponent } from 'src/app/pages/transaction/pledge-transaction/hebrewCalendar/hebrew-calendar/hebrew-calendar.component';
import { EnglishCalendarComponent } from 'src/app/pages/transaction/pledge-transaction/hebrewCalendar/english-calendar/english-calendar.component';
import { NgxDaterangepickerMd } from "ngx-daterangepicker-material";
import { DonaryDatePickerModule } from '../../../../../commons/modules/donary-date-picker/donary-date-picker.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DonaryDateFormatPipe } from 'src/app/commons/donary-date-format.pipe';


@NgModule({
    declarations: [CommonHebrewEnglishCalendarComponent,
        HebrewCalendarComponent,
        EnglishCalendarComponent],
    imports: [
        CommonModule,
        FormsModule,
        NgxDaterangepickerMd.forRoot(),
        DonaryDatePickerModule,
        NgbModule,
        ReactiveFormsModule,
        DonaryDateFormatPipe
    ],
    exports: [CommonHebrewEnglishCalendarComponent]
})
export class CalendarModule { }
