import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TagColorComponent } from "./tag-color/tag-color.component";

@NgModule({
  declarations: [TagColorComponent],
  imports: [CommonModule],
  exports: [TagColorComponent],
})
export class TagColorListModule {}
