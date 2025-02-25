import { NgClass, NgFor, NgIf, NgTemplateOutlet } from "@angular/common";
import { Component, Input, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  UntypedFormArray,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { NgbActiveModal, NgbPopover } from "@ng-bootstrap/ng-bootstrap";
import { TranslateModule } from "@ngx-translate/core";
import { CalendarModule } from "../../transaction/pledge-transaction/hebrewCalendar/calendar/calendar.module";
import moment from "moment";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { HebrewEngishCalendarService } from "src/app/services/hebrew-engish-calendar.service";
import { NgSelectModule } from "@ng-select/ng-select";
import { ClickOutsideModule } from "ng-click-outside";
import { AngularMultiSelectModule } from "src/app/commons/modules/angular-multi-select-module/angular-multi-select.module";
import { AngularMultiSelect } from "src/app/commons/modules/angular-multi-select-module/multiselect.component";
import { isNumber } from "highcharts";
import { CampaignService } from "src/app/services/campaign.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { DropdownSettings } from "src/app/commons/modules/angular-multi-select-module/multiselect.interface";
declare var $: any;
@Component({
  selector: "app-standardar-report-filter-popup",
  standalone: true,
  imports: [
    TranslateModule,
    FormsModule,
    NgFor,
    NgIf,
    CalendarModule,
    NgbPopover,
    ReactiveFormsModule,
    NgSelectModule,
    ClickOutsideModule,
    NgTemplateOutlet,
    NgClass,
    AngularMultiSelectModule,
  ],
  templateUrl: "./standardar-report-filter-popup.component.html",
  styleUrl: "./standardar-report-filter-popup.component.scss",
})
export class StandardarReportFilterPopupComponent implements OnInit {
  @Input() reportId;
  @Input() formData;
  @Input() params;
  @Input() filterReportParamsLength;
  filterParamList: any[];
  pageName = "standardarReportFilterPopup";
  selectedDateRangeFrom: any = {
    startDate: moment(new Date()),
    endDate: moment(new Date()),
  };
  selectedDateRangeTo: any = {
    startDate: moment(new Date()),
    endDate: moment(new Date()),
  };
  FromEngHebCalPlaceholder: string = moment(new Date()).format("MM/DD/YYYY");
  ToEngHebCalPlaceholder: string = moment(new Date()).format("MM/DD/YYYY");
  isOneDate: boolean = true;
  FromcalendarSubscription: any;
  TocalendarSubscription: any;
  tempFd: any = {};
  tempTd: any = {};
  popTitle: any;
  class_id: any;
  class_hid: any;
  isRunLoader: boolean;
  isloading: boolean;
  sub: any;
  filterFormgroup!: UntypedFormGroup;
  dateValue: FormControl;
  campaigns: any[] = [];
  selectedCampaigns: any[] = [];
  flattenCampaigns: any[] = [];
  campaignsObj: {} = {};
  initialCampaigns: any;
  isSingleSelection: any;

  get DrpSettings(): DropdownSettings {
    return {
      ...this.commonMethodService.setDropDownSettings(
        "",
        2,
        false,
        false,
        false,
        true,
        "bottom",
        false,
        false,
        ""
      ),
      liClasses: "demo",
    };
  }
  constructor(
    private activeModal: NgbActiveModal,
    public commonMethodService: CommonMethodService,
    private hebrewEngishCalendarService: HebrewEngishCalendarService,
    private fb: FormBuilder,
    private campaignService: CampaignService,
    private localStorageDataService: LocalstoragedataService
  ) {}
  ngOnInit(): void {
    this.initReportForm();
    this.setFilterData();
    if (this.filterReportParamsLength == 0) {
      const values = this.filterFormgroup.value;
      this.activeModal.close(values);
    }
  }

  addVisbilityToCampaigns(campaigns: any[], level) {
    campaigns.forEach((campaign) => {
      if (campaign?.children?.length > 0)
        this.addVisbilityToCampaigns(campaign.children, level + 1);
      campaign.level = level;
      if (level > 0) campaign.visibility = false;
      else campaign.visibility = true;
    });
  }

  initReportForm() {
    this.filterFormgroup = this.fb.group({
      reportParam: this.fb.array([]),
      reportId: [this.reportId],
    });
  }

  get ReportParams() {
    return this.filterFormgroup.get("reportParam") as UntypedFormArray;
  }

  mapCampaigns(campaigns: any[]): any[] {
    return campaigns.map((campaign) => {
      const mappedCampaign = {
        id: campaign.campaignId,
        itemName: campaign.campaign,
        children: campaign.children ? this.mapCampaigns(campaign.children) : [],
        level: campaign.level,
      };
      this.flattenCampaigns.push(mappedCampaign);
      return mappedCampaign;
    });
  }

  setFilterData() {
    if (this.params) {
      this.params
        .filter(
          (param) =>
            param.uiControl.toLowerCase() == "multiselectdropdown" ||
            param.uiControl.toLowerCase() == "singleselectdropdown"
        )
        .map((data) => data.uiDataType)
        .forEach((type) => {
          switch (type) {
            case "Campaign":
              let formdata = {
                EventGuId: this.localStorageDataService.getLoginUserEventGuId(),
                FromDate: "",
                ToDate: "",
              };
              this.campaignService
                .getCampaignList(formdata)
                .subscribe((res) => {
                  this.campaigns = res?.campaignMasters;
                  this.addVisbilityToCampaigns(this.campaigns, 0);
                  this.campaigns = this.mapCampaigns(this.campaigns);
                  this.initialCampaigns = JSON.parse(
                    JSON.stringify(this.campaigns)
                  );
                });
              break;
            case "Reason":
              if (this.commonMethodService.localReasonList.length <= 0)
                this.commonMethodService.getReasonList();
              break;
            case "Collector":
              if (this.commonMethodService.localCollectorList.length <= 0)
                this.commonMethodService.getCollectorList();
              break;
            case "Location":
              if (this.commonMethodService.localLocationList.length <= 0)
                this.commonMethodService.getLocationList();
              break;
            case "Source":
              if (this.commonMethodService.localDeviceTypeList.length <= 0)
                this.commonMethodService.getSourceList();
              break;
            default:
              break;
          }
        });

      this.filterParamList = this.params;
      if (this.params.length !== 0) {
        this.ReportParams.clear();
        this.filterFormgroup.updateValueAndValidity();

        this.params.map((o) => {
          this.ReportParams.push(
            this.fb.group({
              name: this.fb.control(
                o.paramName,
                Validators.compose([Validators.required])
              ),
              parameterDisplayName: this.fb.control(o.parameterDisplayName),
              gridReportQueryParamId: this.fb.control(
                o.gridReportQueryParamId,
                Validators.compose([Validators.required])
              ),
              uiControl: this.fb.control(
                o.uiControl,
                Validators.compose([Validators.required])
              ),
              uiDataType: this.fb.control(
                o.uiDataType,
                Validators.compose([Validators.required])
              ),
              inputValue: this.fb.control(
                o.defaultValue ? o.defaultValue : null,
                o.isRequired && o.paramName != "EventId"
                  ? Validators.compose([Validators.required])
                  : Validators.compose([])
              ),
              uiOptions: this.fb.control(o.uiOptions ? o.uiOptions : null),
            })
          );
        });

        this.formData.reportParam = (this.formData?.reportParam as any[])?.map(
          ({ defaultValue, ...rest }) => ({ ...rest })
        );
        if (this.formData) this.filterFormgroup.patchValue(this.formData);

        this.filterFormgroup.updateValueAndValidity();
      }
    }
  }

  filterReports() {
    this.filterFormgroup.markAllAsTouched();
    if (this.filterFormgroup.invalid) return;
    const values = this.filterFormgroup.value;
    this.activeModal.close(values);
  }

  openFromHebrewCalendarPopup(p: any) {
    this.commonMethodService.featureName = null;
    this.commonMethodService.openCalendarPopup(
      this.class_id,
      this.class_hid,
      this.selectedDateRangeFrom,
      true
    );
    this.FromcalendarSubscription = this.commonMethodService
      .getCalendarArray()
      .subscribe((items) => {
        if (
          items &&
          items.pageName == this.pageName &&
          this.commonMethodService.isCalendarClicked == true
        ) {
          if (items.obj) {
            this.commonMethodService.isCalendarClicked = false;
            this.FromcalendarSubscription.unsubscribe();
            p.close();
            this.selectedDateRangeFrom = items.obj;
            this.tempFd["startDate"] = this.selectedDateRangeFrom.startDate;
            this.FromEngHebCalPlaceholder =
              this.hebrewEngishCalendarService.EngHebCalPlaceholder;
            let startDate = this.selectedDateRangeFrom.startDate;

            let formattedDate = startDate
              ? moment(startDate).format("MM/DD/yyyy")
              : "";
            this.dateValue.setValue(formattedDate);
          }
        }
      });
  }

  openToHebrewCalendarPopup(p: any) {
    this.commonMethodService.featureName = null;
    this.commonMethodService.openCalendarPopup(
      this.class_id,
      this.class_hid,
      this.selectedDateRangeTo,
      true
    );
    this.TocalendarSubscription = this.commonMethodService
      .getCalendarArray()
      .subscribe((items) => {
        if (
          items &&
          items.pageName == this.pageName &&
          this.commonMethodService.isCalendarClicked == true
        ) {
          if (items.obj) {
            this.commonMethodService.isCalendarClicked = false;
            this.TocalendarSubscription.unsubscribe();
            p.close();
            this.selectedDateRangeTo = items.obj;
            this.tempTd.startDate = this.selectedDateRangeTo.startDate;
            this.ToEngHebCalPlaceholder =
              this.hebrewEngishCalendarService.EngHebCalPlaceholder;
            let startDate = this.selectedDateRangeTo.startDate;
            let formattedDate = startDate
              ? moment(startDate).format("MM/DD/yyyy")
              : "";
            this.dateValue.setValue(formattedDate);
          }
        }
      });
  }

  onClickedOutsidePopover(p1: any) {
    if (!(event.target as HTMLElement).closest(".popover")) p1.close();
  }

  closePopup() {
    this.activeModal.close();
  }

  bindDateValue(control: FormControl) {
    this.dateValue = control;
  }

  contains_heb(str) {
    return /[\u0590-\u05FF]/.test(str);
  }

  getListData(type: string, displayName: string) {
    switch (type) {
      case "Campaign":
        if (!this.campaigns.find((item) => item.id == -1))
          this.campaigns.unshift({
            id: -1,
            itemName: "~No Campaign~",
          });
        if (this.campaignsObj[displayName])
          this.campaigns = this.campaignsObj[displayName];
        else this.campaigns = this.initialCampaigns;
        return [...this.campaigns];
      case "Reason":
        if (
          !this.commonMethodService.localReasonList.find(
            (item) => item.itemName == "~No Reason~"
          )
        )
          this.commonMethodService.localReasonList.unshift({
            id: -1,
            itemName: "~No Reason~",
          });
        return [...this.commonMethodService.localReasonList];
      case "Collector":
        if (
          !this.commonMethodService.localCollectorList.find(
            (item) => item.itemName == "~No Collector~"
          )
        )
          this.commonMethodService.localCollectorList.unshift({
            id: -1,
            itemName: "~No Collector~",
          });
        return [...this.commonMethodService.localCollectorList];
      case "Location":
        if (
          !this.commonMethodService.localLocationList.find(
            (item) => item.itemName == "~No Location~"
          )
        )
          this.commonMethodService.localLocationList.unshift({
            id: -1,
            itemName: "~No Location~",
          });
        return [...this.commonMethodService.localLocationList];
      case "Source":
        if (
          !this.commonMethodService.localDeviceTypeList.find(
            (item) => item.itemName == "~No Source~"
          )
        )
          this.commonMethodService.localDeviceTypeList.unshift({
            id: -1,
            itemName: "~No Source~",
          });
        return [...this.commonMethodService.localDeviceTypeList];
      default:
        break;
    }
  }

  handleSelection(items: AngularMultiSelect) {
    let { selectedItems, defaultSettings } = items;
    let noValue = selectedItems.find((item) => item.id == -1);
    if (noValue) {
      defaultSettings.limitSelection = 1;
      items.clearSelection();
      items.addSelected(noValue);
    } else defaultSettings.limitSelection = undefined;

    if ($(`[for=${items.id}] span`).length > 0) {
      if (selectedItems.length <= items.data.length - 1) {
        $(`[for=${items.id}] span`)["0"]["hidden"] = false;
        $(`[for=${items.id}] span`)["1"]["hidden"] = true;
        $(`#${items.id}`)[0].checked = false;
      } else {
        $(`[for=${items.id}] span`)["0"]["hidden"] = true;
        $(`[for=${items.id}] span`)["1"]["hidden"] = false;
        $(`#${items.id}`)[0].checked = true;
      }
    }
  }

  selectAll(items: AngularMultiSelect) {
    let { selectedItems } = items;
    if (this.campaigns?.length > 0) {
      this.flattenCampaigns.forEach((campaign) => {
        let isCampaignSelected = items.isSelected(campaign);
        if (!isCampaignSelected) items.addSelected(campaign);
      });
    }
    let noValue = selectedItems.find((item) => item.id == -1);
    items.removeSelected(noValue);
    if ($(`[for=${items.id}]`)[0].innerText == "UnSelect All")
      items.clearSelection();

    let obj = $(`[for=${items.id}] span`);
    for (let key in obj) {
      if (isNumber(+key)) obj[key]["hidden"] = !obj[key]["hidden"];
    }
  }

  deselectAll(item, reports: AngularMultiSelect) {
    this.commonMethodService.onDeSelectAll(item.get("uiDataType").value);
    let id = reports.id;

    if (!reports.isActive)
      (
        reports._elementRef.nativeElement as HTMLElement
      ).parentElement.classList.remove("fill");

    if ($(`#${id}`)[0]?.checked) {
      $(`#${id}`).prop("checked", false);

      let obj = $(`[for=${id}] span`);
      for (let key in obj) {
        if (isNumber(+key)) obj[key]["hidden"] = !obj[key]["hidden"];
      }
    }
  }

  toggleLabelClass(e: AngularMultiSelect, open: boolean) {
    let element = (e._elementRef.nativeElement as HTMLElement).parentElement;
    if (open) element.classList.add("fill");
    else if (e.selectedItems.length <= 0) element.classList.remove("fill");
  }

  checkError(i) {
    if (
      this.ReportParams.controls[i].get("inputValue").touched &&
      this.ReportParams.controls[i].get("inputValue").hasError("required")
    )
      return true;
    return false;
  }

  selectChildCampaigns(campaign, item, singleSelect = false) {
    let { selectedItems } = item;
    if (singleSelect) return;
    this.handleSelection(item);

    if (campaign.children?.length > 0) {
      campaign.children.forEach((child) => {
        let index = selectedItems.findIndex(
          (selected) => selected.id === child.id
        );
        if (index === -1) selectedItems.push(child);
        if (child.children?.length > 0) this.selectChildCampaigns(child, item);
      });
    }
  }

  deselectChildCampaigns(campaign, item) {
    let { selectedItems } = item;
    this.handleSelection(item);

    if (campaign.children?.length > 0) {
      campaign.children.forEach((child) => {
        let index = selectedItems.findIndex(
          (selected) => selected.id === child.id
        );
        if (index !== -1) selectedItems.splice(index, 1);
        if (child.children?.length > 0)
          this.deselectChildCampaigns(child, item);
      });
    }
  }

  expandChildCampaigns(campaign, expandAll) {
    if (campaign?.children?.length > 0) {
      let parentIndex = this.campaigns.findIndex(
        (camp) => camp.id === campaign.id
      );
      let firstChildIndex = this.campaigns.findIndex(
        (camp) => camp.id === campaign.children[0].id
      );
      if (firstChildIndex !== -1) return;

      campaign.children.forEach((child) => {
        child.level = campaign.level + 1;
        child.visibility = true;
      });

      if (parentIndex !== -1)
        this.campaigns.splice(parentIndex + 1, 0, ...campaign.children);

      if (expandAll)
        campaign.children.forEach((child) =>
          this.expandChildCampaigns(child, expandAll)
        );
    }
  }

  collapseChildCampaigns(campaign) {
    if (campaign.children) {
      campaign.children.forEach((child) => {
        child.visibility = false;
        if (child?.children?.length > 0) this.collapseChildCampaigns(child);
        let index = this.campaigns.findIndex((camp) => camp.id === child.id);
        if (index !== -1) this.campaigns.splice(index, 1);
      });
    }
  }

  /** preserves campaigns array for current dropdown for later use */
  preserveCampaigns(displayName) {
    this.campaignsObj["show" + displayName] = false;
    this.campaignsObj[displayName] = JSON.parse(JSON.stringify(this.campaigns));
    this.campaigns.forEach((campaign) => this.collapseChildCampaigns(campaign));
  }

  /** allow to fetch data in opened campaign multiselect dropdown in */
  allowData(displayName: string) {
    this.campaignsObj["show" + displayName] = true;
  }

  getDropdownSetting(): DropdownSettings {
    return { ...this.DrpSettings, singleSelection: true };
  }
}
