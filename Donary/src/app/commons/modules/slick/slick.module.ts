import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SlickComponent, SlickDirective } from "./slick/slick.component";

@NgModule({
  declarations: [SlickComponent, SlickDirective],
  imports: [CommonModule],
  exports: [SlickComponent, SlickDirective],
})
export class SlickModule {}
