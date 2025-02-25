import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxDaterangepickerMd } from "ngx-daterangepicker-material";
import { FormsModule } from "@angular/forms";
import { AddNewDropdownComponent } from './add-new-dropdown.component';


import { KeyboardShortcutsModule } from 'ng-keyboard-shortcuts';
import { TranslateModule } from '@ngx-translate/core';
import { AngularMultiSelectModule } from '../angular-multi-select-module/angular-multi-select.module';

import { DoanryDirective } from "src/app/commons/modules/doanry-directive.module/doanry-directive.module.module";
import { MakeTransactionModule } from 'src/app/pages/make-transaction/make-transaction.module';

@NgModule({
  declarations: [
    AddNewDropdownComponent,    
  ],
  imports: [
    CommonModule,
    FormsModule,
    NgxDaterangepickerMd.forRoot(),
    KeyboardShortcutsModule.forRoot(),
    AngularMultiSelectModule,
    TranslateModule,
    DoanryDirective
  ],
  exports:[
    AddNewDropdownComponent,
    TranslateModule,
    DoanryDirective,
    MakeTransactionModule
  ],

})
export class AddNewDropdownModule { }