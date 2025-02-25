import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  inject,
  OnDestroy,
  OnInit,
} from "@angular/core";
import {
  ControlContainer,
  FormGroup,
  ReactiveFormsModule,
} from "@angular/forms";
import { NgSelectModule } from "@ng-select/ng-select";
import { TranslateModule } from "@ngx-translate/core";
import moment from "moment";
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from "ngx-mask";
import { NgbPopoverModule } from "@ng-bootstrap/ng-bootstrap";

import { CommonMethodService } from "src/app/commons/common-methods.service";
import { HebrewEngishCalendarService } from "src/app/services/hebrew-engish-calendar.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { UIPageSettingService } from "src/app/services/uipagesetting.service";
import { TransactionControlProviderService } from "../transaction-control-provider.service";
import { CalendarModule } from "../../transaction/pledge-transaction/hebrewCalendar/calendar/calendar.module";
import { merge, Subscription } from "rxjs";
import { debounceTime, distinctUntilChanged } from "rxjs/operators";
import { DonaryDateFormatPipe } from "src/app/commons/donary-date-format.pipe";

@Component({
  selector: "app-schedule-of-transaction",
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgSelectModule,
    TranslateModule,
    CalendarModule,
    NgbPopoverModule,
    NgxMaskDirective,
    NgxMaskPipe,
    DonaryDateFormatPipe,
  ],
  templateUrl: "./schedule-of-transaction.component.html",
  styleUrl: "./schedule-of-transaction.component.scss",
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () => inject(ControlContainer, { skipSelf: true }),
    },
  ],

  providers: [provideNgxMask(), TransactionControlProviderService],
})
export class ScheduleOfTransactionComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  calendarSubscription: any;
  savedDefault = false;

  subscription!: Subscription;
  subscription2!: Subscription;
  selectedStartDate: any = { startDate: moment(new Date()) };

  private isDefaultPlaceHolder = true;
  protected EngHebCalPlaceholder : moment.Moment | string = moment(new Date());
  
  get PlaceHolderForDate() {
    if (this.isDefaultPlaceHolder) {
      return this.datePipe.transform( (this.EngHebCalPlaceholder as moment.Moment).toISOString() )  
    }
    return this.EngHebCalPlaceholder
  }

  parentControl = inject(ControlContainer);

  controlsProvider = inject(TransactionControlProviderService, {
    skipSelf: true,
  });

  get formGroup() {
    return this.parentControl.control as FormGroup;
  }

  get Amount() {
    return this.formGroup.get("amount");
  }

  get Recurring() {
    return this.formGroup.get("recurring");
  }

  get isRecurring() {
    return this.Recurring.get("isRecurring");
  }

  get RecurringCount() {
    return this.Recurring.get("count");
  }

  get RecurringFrequency() {
    return this.Recurring.get("frequency");
  }

  get RecurringAmount() {
    return this.Recurring.get("amount");
  }

  constructor(
    private readonly changeDetectorRef: ChangeDetectorRef,
    public commonMethodService: CommonMethodService,
    public hebrewEnglishCalendarService: HebrewEngishCalendarService,
    private localStorageDataService: LocalstoragedataService,
    private uiPageSettingApi: UIPageSettingService,
    private datePipe: DonaryDateFormatPipe,
  ) {}

  displayTotal() {
    const amount = this.RecurringAmount?.value
      ? Number(this.RecurringAmount?.value)
      : 0;
    const count = this.RecurringCount?.value
      ? Number(this.RecurringCount?.value)
      : 0;
    return (amount * count).toFixed(2);
  }

  private calculate() {
    const amount = this.Amount?.value ? Number(this.Amount?.value) : 0;
    const count = this.RecurringCount?.value
      ? Number(this.RecurringCount?.value)
      : 0;

    if (count === 0) {
      return 0;
    }
    return (amount / count).toFixed(2);
  }

  ngOnInit(): void {
    if (this.commonMethodService.localscheduleRepatTypeList.length == 0) {
      this.commonMethodService.getScheduleRepeatTypeList();
    }
    this.EngHebCalPlaceholder = this.datePipe.transform((this.EngHebCalPlaceholder as moment.Moment).toISOString(),'short');
  }

  ngAfterViewInit(): void {
    this.getOptionUISetting();

    this.scheduleAmountCalculation();
    this.totalAmountCalculation();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    // this.subscription2.unsubscribe();
  }

  private scheduleAmountCalculation() {
    if (this.Amount?.valueChanges && this.RecurringCount?.valueChanges) {
      this.subscription = merge(
        this.Amount?.valueChanges.pipe(
          debounceTime(500),
          distinctUntilChanged()
        ),
        this.RecurringCount.valueChanges.pipe(
          debounceTime(500),
          distinctUntilChanged()
        )
      ).subscribe(() => {
        const schAmount = this.calculate();

        this.RecurringAmount?.setValue(schAmount, { emitEvent: false });
      });
    }
  }

  private totalAmountCalculation() {
    this.RecurringAmount?.valueChanges
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe(() => {
        const amount = this.displayTotal();
        this.Amount?.setValue(amount, { emitEvent: false, onlySelf: true });
      });
  }

  private getOptionUISetting() {
    let objLayout = {
      uiPageSettingId: null,
      userId: this.localStorageDataService.getLoginUserId(),
      moduleName: "new transactions",
      screenName: "schedule payment",
    };
    this.uiPageSettingApi.Get(objLayout).subscribe((res: any) => {
      if (!res) {
        return;
      }

      try {
        const settingJson = JSON.parse(res.setting);

        if (settingJson.frequency && settingJson.frequency.length !== 0) {
          const firstId = settingJson.frequency[0].id || null;
          this.Recurring.patchValue({
            frequency: firstId,
          });
        }

        if (settingJson.count) {
          this.Recurring.patchValue({
            count: +settingJson.count,
          });
        }

        this.savedDefault = true;

        this.Recurring.updateValueAndValidity();
        this.formGroup.updateValueAndValidity();
        this.changeDetectorRef.detectChanges();
      } catch (error) {}
    });
  }

  onSaveUISetting() {
    const frequency =
      this.commonMethodService.localscheduleRepatTypeList.filter((o) => {
        return o.id == this.RecurringFrequency.value;
      });

    let objLayout = {
      uiPageSettingId: null,
      userId: this.localStorageDataService.getLoginUserId(),
      moduleName: "new transactions",
      screenName: "schedule payment",
      setting: JSON.stringify({
        frequency: frequency,
        count: this.RecurringCount.value,
      }),
    };
    this.uiPageSettingApi.Save(objLayout).subscribe((res: any) => {
      if (!res) {
        return;
      }
      this.savedDefault = true;
    });
  }

  openHebrewCalendarPopup(p1: any) {
    this.commonMethodService.featureName = null;
    this.commonMethodService.isScheduleCalendar = true;
    this.commonMethodService.isScheduleHebrewCalendar = true;

    this.commonMethodService.openCalendarPopup(
      undefined,
      undefined,
      this.selectedStartDate,
      true,
      "scheduleOfTransactionCalender",
      "",
      true
    );
    this.calendarSubscription = this.commonMethodService
      .getCalendarOutput("schedule-of-transaction")
      .subscribe((items) => {
        let selectedDate = items.obj;
        if (selectedDate.startDate != null) {
          this.selectedStartDate = moment(selectedDate.startDate);
        }
        this.commonMethodService.isCalendarClicked = false;
        this.calendarSubscription.unsubscribe();
        p1.close();

        this.isDefaultPlaceHolder = false;
        this.EngHebCalPlaceholder =
          this.hebrewEnglishCalendarService.EngHebCalPlaceholder;

        this.formGroup.patchValue({});
      });
  }

  onClickedOutsidePopover(p1: any) {
    if (!(event.target as HTMLElement).closest(".popover")) {
      p1.close();
    } else {
    }
  }

  public toFixed = (value: string | number | undefined | null): number => {
    console.log(value);
    const formattedValue = String(value).split(" ").join("");
    if (String(value).includes(".") && String(value).split(".").length === 2) {
      const decimal = String(value).split(".")[1]?.length;
      if (decimal && decimal > 2) {
        return Number(parseFloat(formattedValue).toFixed(2));
      }
    }
    return Number(formattedValue);
  };
}
