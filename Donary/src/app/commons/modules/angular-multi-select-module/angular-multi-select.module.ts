import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VirtualScrollerModule } from './virtual-scroll/virtual-scroll';
import { AngularMultiSelect } from './multiselect.component';
import { ClickOutsideDirective, ScrollDirective, setPosition, styleDirective } from './clickOutside';
import { ListFilterPipe } from './list-filter';
import { Badge, CIcon, Item, Search, TemplateRenderer } from './menu-item';
import { DataService } from './multiselect.service';

@NgModule({
  imports: [CommonModule, FormsModule, VirtualScrollerModule],
  declarations: [AngularMultiSelect, ClickOutsideDirective, ScrollDirective, styleDirective, ListFilterPipe, Item, TemplateRenderer, Badge, Search, setPosition, CIcon],
  exports: [AngularMultiSelect, ClickOutsideDirective, ScrollDirective, styleDirective, ListFilterPipe, Item, TemplateRenderer, Badge, Search, setPosition, CIcon],
  providers: [DataService, ListFilterPipe]
})
export class AngularMultiSelectModule { }
