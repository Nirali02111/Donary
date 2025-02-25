import { DragDropModule } from "@angular/cdk/drag-drop";
import { CommonModule, CurrencyPipe } from "@angular/common";
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from "@angular/common/http";
import { ChangeDetectorRef, NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CKEditorModule } from "@ckeditor/ckeditor5-angular";

import { NgxSliderModule } from "@angular-slider/ngx-slider";
import { NgxDaterangepickerMd } from "ngx-daterangepicker-material";
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from "ngx-mask";
import { NgxPrintModule } from "ngx-print";
import { AddNewDropdownModule } from "src/app/commons/modules/add-new-dropdown/add-new-dropdown.module";
import { DonaryDatePickerModule } from "src/app/commons/modules/donary-date-picker/donary-date-picker.module";
import { NotificationListComponent } from "./notification-list/notification-list.component";
import { NotificationMainComponent } from "./notification-main/notification-main.component";
import { NotificationRoutingModule } from "./notification-routing.module";
import { ReminderPopupComponent } from "./reminder-popup/reminder-popup.component";
import { DonorDropdownListModule } from "src/app/commons/modules/donor-dropdown-list/donor-dropdown-list.module";
import { NgSelectModule } from "@ng-select/ng-select";
import { DonorTransactionCardPopupComponent } from "../cards/donor-transaction-card-popup/donor-transaction-card-popup.component";
import { NotificationFilterComponent } from "./notification-filter/notification-filter.component";
import { TranslateModule } from "@ngx-translate/core";
import { NotificationSidebarPopupComponent } from "./notification-sidebar-popup/notification-sidebar-popup.component";

import { DoanryDirective } from "src/app/commons/modules/doanry-directive.module/doanry-directive.module.module";
import { NotificationAlertsComponent } from "./notification-alerts/notification-alerts.component";
import { CardsModule } from "../cards/cards.module";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { CalendarModule } from "src/app/pages/transaction/pledge-transaction/hebrewCalendar/calendar/calendar.module";
import { ClickOutsideModule } from "ng-click-outside";

import { Directive, Input, HostListener } from "@angular/core";
import { DataTableModule } from "src/app/commons/modules/data-table/data-table.module";
import { AngularMultiSelectModule } from "src/app/commons/modules/angular-multi-select-module/angular-multi-select.module";
import { NotificationSettingComponent } from "./notification-setting/notification-setting.component";
import { NotificationSettingPopupComponent } from "./notification-setting-popup/notification-setting-popup.component";
import { EditSkeletonLoaderComponent } from "src/app/commons/modules/skeleton-loader/edit-skeleton-loader/edit-skeleton-loader.component";
import { SkeletonLoaderComponentComponent } from "src/app/commons/modules/skeleton-loader/skeleton-loader-component/skeleton-loader-component.component";
import { SkeletonLoaderModule } from "src/app/commons/modules/skeleton-loader/skeleton-loader.module";
import { DonaryDateFormatPipe } from "src/app/commons/donary-date-format.pipe";

@Directive({
  selector: "[closePopoverOnClickOutside]",
  standalone: false,
})
export class ClosePopoverOnClickOutsideDirective {
  active = false;

  constructor(private cd: ChangeDetectorRef) {}

  @Input("closePopoverOnClickOutside") popover: { close; isOpen };

  @HostListener("document:click", ["$event.target"])
  docClicked(target): Boolean {
    if (!this.popover.isOpen()) {
      this.active = false;
      this.cd.detectChanges();
      return;
    }
    // Click that opens popover triggers this. Ignore first click.
    if (!this.active) {
      this.active = true;
      this.cd.detectChanges();
      return;
    }

    let cancelClose = false;
    let popoverWindows = document.getElementsByTagName("ngb-popover-window");

    for (let i = 0; i < popoverWindows.length; i++) {
      cancelClose = cancelClose || popoverWindows[i].contains(target);
    }
    if (!cancelClose) {
      this.popover.close();
    }

    // Deactivate if something else closed popover
    this.active = this.popover.isOpen();
    this.cd.detectChanges();
  }
}

@NgModule({
  declarations: [
    NotificationMainComponent,
    NotificationListComponent,
    DonorTransactionCardPopupComponent,
    NotificationFilterComponent,
    NotificationSidebarPopupComponent,
    NotificationAlertsComponent,
    ClosePopoverOnClickOutsideDirective,
    NotificationSettingComponent,
    NotificationSettingPopupComponent,
  ],
  exports: [TranslateModule, ClosePopoverOnClickOutsideDirective],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxSliderModule,
    NgxPrintModule,
    DragDropModule,
    NotificationRoutingModule,
    AddNewDropdownModule,
    AngularMultiSelectModule,
    CKEditorModule,
    TranslateModule,
    NgxDaterangepickerMd.forRoot(),
    //NgMultiSelectDropDownModule.forRoot(),
    NgxMaskDirective,
    NgxMaskPipe,
    DataTableModule,
    DonaryDatePickerModule,
    DonorDropdownListModule,
    NgSelectModule,
    DoanryDirective,
    CardsModule,
    NgbModule,
    CalendarModule,
    ClickOutsideModule,
    EditSkeletonLoaderComponent,
    SkeletonLoaderModule,
    DonaryDateFormatPipe,
  ],
  providers: [
    provideNgxMask(),
    CurrencyPipe,
    provideHttpClient(withInterceptorsFromDi()),
  ],
})
export class NotificationModule {}
