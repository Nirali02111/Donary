import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinanceMainComponent } from './finance-main/finance-main.component';
import { FinanceRoutingModule } from './finance-routing.module';
import { AddNewDropdownModule } from 'src/app/commons/modules/add-new-dropdown/add-new-dropdown.module';
import { BatchesListMainComponent } from '../transaction/batches/batches-list-main/batches-list-main.component';
import { CreateNewBatchComponent } from '../transaction/batches/create-new-batch/create-new-batch.component';

import { FormsModule } from '@angular/forms';

import { NgxPrintModule } from 'ngx-print';
import { ResizableModule } from 'src/app/commons/modules/resizable/resizable.module';
import { TranslateModule } from '@ngx-translate/core';
import { DataTableModule } from 'src/app/commons/modules/data-table/data-table.module';
import { AngularMultiSelectModule } from 'src/app/commons/modules/angular-multi-select-module/angular-multi-select.module';
import { CalendarModule } from '../transaction/pledge-transaction/hebrewCalendar/calendar/calendar.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DonaryDateFormatPipe } from 'src/app/commons/donary-date-format.pipe';

@NgModule({
  declarations: [FinanceMainComponent, BatchesListMainComponent, CreateNewBatchComponent],
  imports: [
    CommonModule,
    FinanceRoutingModule,
    AddNewDropdownModule,
    AngularMultiSelectModule,
    FormsModule,
    DataTableModule,
    NgxPrintModule,
    ResizableModule,
    TranslateModule,
    CalendarModule,
    NgbModule,
    DonaryDateFormatPipe
  ]
})
export class FinanceModule { }
