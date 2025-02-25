import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BootstrapPaginator } from './BootstrapPaginator';
import { DataTable } from './DataTable';
import { DefaultSorter } from './DefaultSorter';
import { Paginator } from './Paginator';



@NgModule({
  declarations: [BootstrapPaginator,
    DataTable,
    DefaultSorter,
    Paginator],
  imports: [
    CommonModule
  ],
  exports: [BootstrapPaginator,
    DataTable,
    DefaultSorter,
    Paginator]
})
export class DataTableModule { }
