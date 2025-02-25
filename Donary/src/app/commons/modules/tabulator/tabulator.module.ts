import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TabulatorTableComponent } from './tabulator-table/tabulator-table.component';
import { TabulatorServiceService } from './tabulator-service.service';
import { CellHostDirective } from './cell-host.directive';
import { CustomHeaderFormatterComponent } from './formatters/custom-header-formatter/custom-header-formatter.component';
import { CustomCellFormatterComponent } from './formatters/custom-cell-formatter/custom-cell-formatter.component';
import { RowFormatterDirective } from './directive/row-formatter.directive';
import { DonaryDateFormatPipe } from '../../donary-date-format.pipe';




@NgModule({
    declarations: [
        TabulatorTableComponent,
        CellHostDirective,
        CustomHeaderFormatterComponent,
        CustomCellFormatterComponent,
        RowFormatterDirective
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        TranslateModule,
        DonaryDateFormatPipe
    ],
    providers: [TabulatorServiceService],
    exports: [TabulatorTableComponent, CustomHeaderFormatterComponent, CustomCellFormatterComponent, CellHostDirective, RowFormatterDirective]
})
export class TabulatorModule { }
