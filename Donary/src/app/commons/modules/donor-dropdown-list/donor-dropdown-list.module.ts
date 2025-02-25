import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule } from "@angular/forms";

import { DonorDropdownListComponent } from './donor-dropdown-list/donor-dropdown-list.component';
import { DonorListTemplateComponent } from './donor-list-template/donor-list-template.component';
import { AngularMultiSelectModule } from '../angular-multi-select-module/angular-multi-select.module';

@NgModule({
  declarations: [DonorDropdownListComponent, DonorListTemplateComponent],
  imports: [
    CommonModule,
    FormsModule,
    AngularMultiSelectModule
  ],
  exports:[
    DonorDropdownListComponent,
    DonorListTemplateComponent
  ]
})
export class DonorDropdownListModule { }
