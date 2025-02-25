import {
  inject,
  OnInit,
  OnDestroy,
  ViewChild,
  Component,
  ElementRef,
  AfterViewInit,
  ChangeDetectorRef,
} from "@angular/core";
import {
  FormGroup,
  Validators,
  FormsModule,
  ControlContainer,
  ReactiveFormsModule,
} from "@angular/forms";
import { NgTemplateOutlet } from "@angular/common";
import { Subject } from "rxjs";
import { debounceTime, distinctUntilChanged } from "rxjs/operators";
import { NgbPopoverModule } from "@ng-bootstrap/ng-bootstrap";
import { NgSelectConfig, NgSelectModule } from "@ng-select/ng-select";
import { TranslateModule } from "@ngx-translate/core";
import moment from "moment";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { UIPageSettingService } from "src/app/services/uipagesetting.service";
import { HebrewEngishCalendarService } from "src/app/services/hebrew-engish-calendar.service";
import { CalendarModule } from "../../transaction/pledge-transaction/hebrewCalendar/calendar/calendar.module";
import { DoanryDirective } from "src/app/commons/modules/doanry-directive.module/doanry-directive.module.module";
import { DonaryDateFormatPipe } from "src/app/commons/donary-date-format.pipe";

@Component({
  selector: "app-details-of-transaction",
  standalone: true,
  imports: [
    NgTemplateOutlet,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    TranslateModule,
    CalendarModule,
    NgbPopoverModule,
    DoanryDirective,
  ],
  templateUrl: "./details-of-transaction.component.html",
  styleUrl: "./details-of-transaction.component.scss",
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () => inject(ControlContainer, { skipSelf: true }),
    },
  ],
})
export class DetailsOfTransactionComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  protected isGlobal = true;
  protected calendarSubscription: any;
  protected savedDefault = false;
  selectedStartDate: any = { startDate: moment(new Date()) };

  private isDefaultPlaceHolder = true;
  protected EngHebCalPlaceholder: moment.Moment | string = moment(new Date());

  get PlaceHolderForDate() {
    if (this.isDefaultPlaceHolder) {
      return this.datePipe.transform(
        moment(this.EngHebCalPlaceholder).toISOString()
      );
    }
    return this.EngHebCalPlaceholder;
  }

  protected searchInLocationObservable = new Subject<string>();

  protected parentControl = inject(ControlContainer);

  protected get parentFormGroup() {
    return this.parentControl.control as FormGroup;
  }

  protected get formGroup() {
    return this.parentFormGroup.get("details");
  }

  @ViewChild("locationSearch", { static: false }) protected input: ElementRef;

  constructor(
    private readonly changeDetectorRef: ChangeDetectorRef,
    private ngSelectConfig: NgSelectConfig,
    public commonMethodService: CommonMethodService,
    public hebrewEnglishCalendarService: HebrewEngishCalendarService,
    private localStorageDataService: LocalstoragedataService,
    private uiPageSettingApi: UIPageSettingService,
    private datePipe: DonaryDateFormatPipe
  ) {
    this.ngSelectConfig.bindLabel = "itemName";
    this.ngSelectConfig.bindValue = "id";
  }

  ngOnInit(): void {
    this.EngHebCalPlaceholder = this.datePipe.transform(
      (this.EngHebCalPlaceholder as moment.Moment).toISOString(),
      "short"
    );
    const isCampaignRequired =
      this.localStorageDataService.getLoginUserisCampaignRequiredForTransaction();
    const isReasonRequired =
      this.localStorageDataService.getLoginUserisReasonRequiredForTransaction();

    if (isCampaignRequired) {
      this.formGroup.get("campaignId").clearValidators();
      this.formGroup
        .get("campaignId")
        ?.setValidators(Validators.compose([Validators.required]));
      this.formGroup.updateValueAndValidity();
      this.parentFormGroup.updateValueAndValidity();
    }

    if (isReasonRequired) {
      this.formGroup.get("paymentReasonId").clearValidators();
      this.formGroup
        .get("paymentReasonId")
        ?.setValidators(Validators.compose([Validators.required]));
      this.formGroup.updateValueAndValidity();
      this.parentFormGroup.updateValueAndValidity();
    }

    if (this.commonMethodService.localCampaignList.length === 0) {
      this.commonMethodService.getCampaignList();
    }

    if (this.commonMethodService.localCollectorList.length === 0) {
      this.commonMethodService.getCollectorList();
    }

    if (this.commonMethodService.localReasonList.length === 0) {
      this.commonMethodService.getReasonList();
    }

    if (this.commonMethodService.localLocationList.length === 0) {
      this.commonMethodService.getLocationList();
    }

    this.searchInLocationObservable
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((searchValue: string) => {
        this.commonMethodService.onDonorLocationSearchFieldChange(
          searchValue,
          this.isGlobal
        );
      });

    this.changeDetectorRef.detectChanges();
  }

  ngAfterViewInit(): void {
    this.getOptionUISetting();
  }

  ngOnDestroy(): void {}

  protected getOptionUISetting() {
    let objLayout = {
      uiPageSettingId: null,
      userId: this.localStorageDataService.getLoginUserId(),
      moduleName: "new transactions",
      screenName: "options",
    };
    this.uiPageSettingApi.Get(objLayout).subscribe((res: any) => {
      if (!res) {
        return;
      }

      try {
        //this.uiPageSettingId = res.uiPageSettingId;
        const settingJson = JSON.parse(res.setting);

        if (settingJson.campaignId) {
          this.formGroup.patchValue({
            campaignId: settingJson.campaignId,
          });
        }

        if (settingJson.paymentReasonId) {
          this.formGroup.patchValue({
            paymentReasonId: settingJson.paymentReasonId,
          });
        }

        if (settingJson.locationId) {
          this.formGroup.patchValue({
            locationId: settingJson.locationId,
          });
        }

        if (settingJson.collectorId) {
          this.formGroup.patchValue({
            collectorId: settingJson.collectorId,
          });
        }

        this.formGroup.updateValueAndValidity();

        this.parentFormGroup.updateValueAndValidity();

        this.changeDetectorRef.detectChanges();
      } catch (error) {}
    });
  }

  protected onSaveUISetting() {
    const { campaignId, paymentReasonId, locationId, collectorId } =
      this.formGroup.value;
    const setting = {
      campaignId: campaignId,
      paymentReasonId: paymentReasonId,
      locationId: locationId,
      collectorId: collectorId,
    };

    let objLayout = {
      uiPageSettingId: null,
      userId: this.localStorageDataService.getLoginUserId(),
      moduleName: "new transactions",
      screenName: "options",
      setting: JSON.stringify(setting),
    };
    this.uiPageSettingApi.Save(objLayout).subscribe((res: any) => {
      if (!res) {
        return;
      }
      this.savedDefault = true;
    });
  }

  protected openHebrewCalendarPopup(p1) {
    this.commonMethodService.featureName = null;

    this.commonMethodService.openCalendarPopup(
      undefined,
      undefined,
      this.selectedStartDate,
      true,
      "recordDateDynamicsCalender"
    );
    this.calendarSubscription = this.commonMethodService
      .getCalendarOutput("details-of-transaction")
      .subscribe((items) => {
        console.log(items);
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

  protected onClickedOutsidePopover(p1: any) {
    if (!(event.target as HTMLElement).closest(".popover")) {
      p1.close();
    }
  }

  protected contains_heb(str) {
    return /[\u0590-\u05FF]/.test(str);
  }
}
