import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminMainComponent } from './admin-main/admin-main.component';
import { AddNewDropdownModule } from 'src/app/commons/modules/add-new-dropdown/add-new-dropdown.module';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';

import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';

import { SharedFormGroupModule } from 'src/app/commons/modules/shared-form-group/shared-form-group.module';
import { UserListComponent } from '../users/user-list/user-list.component';
import { TranslateModule } from '@ngx-translate/core';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { PresetAmountComponent } from './preset-amount/preset-amount.component';
import { ApiKeysComponent } from './api-keys/api-keys.component';
import { DoanryDirective } from "src/app/commons/modules/doanry-directive.module/doanry-directive.module.module";
import { MinyanimComponent } from './minyanim/minyanim.component';
import { BrandingComponent } from './branding/branding.component';

import { SeatsAdminComponent } from './seats-admin/seats-admin.component';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { DataTableModule } from 'src/app/commons/modules/data-table/data-table.module';
import { AngularMultiSelectModule } from 'src/app/commons/modules/angular-multi-select-module/angular-multi-select.module';
import { AdvancedFieldsComponent } from './advanced-fields/advanced-fields.component';

@NgModule({ declarations: [AdminMainComponent, UserListComponent, PresetAmountComponent, ApiKeysComponent, MinyanimComponent, BrandingComponent, SeatsAdminComponent, AdvancedFieldsComponent],
    exports: [TranslateModule], imports: [CommonModule,
        AdminRoutingModule,
        AddNewDropdownModule,
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        FormsModule,
        DragDropModule,
        ReactiveFormsModule,
        DataTableModule,
        TranslateModule,
        NgxMaskDirective, NgxMaskPipe,
        NgbModule,
        NgSelectModule,
        SharedFormGroupModule,
        DoanryDirective,
        AngularMultiSelectModule,
        NgxMaterialTimepickerModule], providers: [provideNgxMask(), provideHttpClient(withInterceptorsFromDi())] })
export class AdminModule { }
