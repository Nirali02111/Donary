import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrganizationDetailsFormGroupComponent } from './organization-details-form-group/organization-details-form-group.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormAutoFocus } from './organization-details-form-group/form.autofocus';
import { ImageCropperModule } from 'ngx-image-cropper';
import { TranslateModule } from '@ngx-translate/core';
import { DoanryDirective } from '../doanry-directive.module/doanry-directive.module.module';

@NgModule({
  declarations: [OrganizationDetailsFormGroupComponent, FormAutoFocus],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    
    NgbModule,
    NgxMaskDirective, NgxMaskPipe,
    NgSelectModule,
    ImageCropperModule,
    TranslateModule,
    DoanryDirective
  ],
  exports: [
    OrganizationDetailsFormGroupComponent
  ],
  providers:[provideNgxMask()]
})
export class SharedFormGroupModule { }
