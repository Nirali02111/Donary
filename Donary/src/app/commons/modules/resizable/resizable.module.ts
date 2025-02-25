import { NgModule } from '@angular/core';


import { TemplateComponent } from './template/template.component';
import { ResizableDirective } from './resizable.directive';

@NgModule({
  declarations: [TemplateComponent, ResizableDirective],
  exports: [TemplateComponent],
})
export class ResizableModule { }
