import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  NgZone,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from "@angular/core";

import { NgbModalOptions, NgbPopover } from "@ng-bootstrap/ng-bootstrap";
import * as FileSaver from "file-saver";
import * as _ from "lodash";
import * as moment from "moment";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { CollectorService } from "src/app/services/collector.service";
import { DeviceService } from "src/app/services/device.service";
import { LocationService } from "src/app/services/location.sevice";
import { ReasonService } from "src/app/services/reason.service";
import * as XLSX from "xlsx";
import { CollectorCardPopupComponent } from "../../cards/collector-card-popup/collector-card-popup.component";
import { DeviceCardPopupComponent } from "../../cards/device-card-popup/device-card-popup.component";
import { LocationCardPopupComponent } from "../../cards/location-card-popup/location-card-popup.component";
import { ReasonCardPopupComponent } from "../../cards/reason-card-popup/reason-card-popup.component";
import { SourceFilterComponent } from "../source-filter/source-filter.component";
import { SourceService } from "./../../../services/source.service";
import { DaterangepickerDirective } from "ngx-daterangepicker-material";
import { TotalPanelService } from "src/app/services/totalpanel.service";
import { CampaignService } from "src/app/services/campaign.service";
import { CampaignCardPopupComponent } from "../../cards/campaign-card-popup/campaign-card-popup.component";
import { BulkSourcePopupComponent } from "../bulk-source-popup/bulk-source-popup.component";
import { UIPageSettingService } from "src/app/services/uipagesetting.service";
import Swal from "sweetalert2";

import { HebrewEngishCalendarService } from "src/app/services/hebrew-engish-calendar.service";
import { PageSyncService } from "src/app/commons/pagesync.service";
import { Subscription } from "rxjs";
import { DataTable } from "src/app/commons/modules/data-table/DataTable";
import { DonaryDateFormatPipe } from "src/app/commons/donary-date-format.pipe";
import { XLSXService } from "src/app/services/xlsx.service";
import { AnalyticsService } from "src/app/services/analytics.service";

interface PanelRes {
  openPledges: number;
  payments: number;
  raised: number;
  scheduled: number;
  accountId: number;
  reasonId: number;
  campaignId: number;
  collectorId: number;
  deviceId: number;
  locationId: number;
}

declare var $: any;
@Component({
  selector: "app-source-list",
  templateUrl: "./source-list.component.html",
  styleUrls: ["./source-list.component.scss"],
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SourceListComponent implements OnInit {
  @ViewChild("sv", { static: true }) svTable: DataTable;
  @ViewChildren("checkboxes") checkboxes: QueryList<ElementRef>;
  @ViewChild(NgbPopover, { static: false }) popContent: NgbPopover;
  pickerDirective: DaterangepickerDirective;
  selectedDateRange: any;
  uiPageSettingId = null;
  uiPageSetting: any;

  objAdvancedSearch: any = {
    orderDevicesStatusID: [],
  };

  isloading: boolean;
  popTitle: any;
  gridData: Array<any>;
  gridShowPanelData: Array<any>;
  gridFilterData: Array<any>;
  gridSearchFilterData: Array<any>;
  gridOrgData: Array<any>;
  gridOrgTotalPanelData: Array<any>;
  modalOptions: NgbModalOptions;
  totalRecord: number = 0;
  PageName = "SourceList";
  isOneDate: any = false;
  filterRecord: number = 0;
  isFiltered: boolean = false;
  isClicked: Boolean = false;
  isOpen: boolean = false;
  isChipTypeSelected: boolean = false;
  gridSelectedData: Array<any>;
  deviceStatusList: Array<any> = [];
  isFilterOpen: boolean = false;
  tempSearch: Array<any>;
  isSumCardOpen: boolean = false;
  isSelected: boolean = false;
  recordSelectedArray = [];
  isAllChecked: boolean = false;
  showTotalPanelPermission: boolean = this.localStorageDataService
    .getPermissionLst()
    .filter((x) => x.permissionName == "Show Total Panel Sources")
    .map((x) => x.isActive)[0];
  colFields = [
    {
      id: 1,
      //title: '',
      isTotalPanel: true,
      items: [
        {
          colName: "EVENT",
          isVisible: false, ///change true
          colId: "sourceEventId",
          sortName: "eventName",
        },
        {
          colName: "PRODUCT",
          isVisible: true,
          colId: "sourceProductId",
          sortName: "productName",
        },
        {
          colName: "DEVICE",
          isVisible: true,
          colId: "sourceDeviceId",
          sortName: "deviceName",
        },
        {
          colName: "ACTIVATIONCODE",
          isVisible: false,
          colId: "sourceActivationId",
          sortName: "activationCode",
        },
        {
          colName: "MACADDRESS",
          isVisible: false,
          colId: "sourceMacAddressId",
          sortName: "macAddress",
        },
        {
          colName: "PLAN",
          isVisible: false,
          colId: "sourcePlanId",
          sortName: "plan",
        },
        {
          colName: "STATUS",
          isVisible: true,
          colId: "sourceStatusId",
          sortName: "status",
        },
        {
          colName: "NOTES",
          isVisible: false,
          colId: "sourceNotesId",
          sortName: "notes",
        },
        {
          colName: "DEVICE#",
          isVisible: false,
          colId: "sourceDeviceNoId",
          sortName: "deviceNum",
        },
        {
          colName: "SIM#",
          isVisible: false,
          colId: "sourceSimId",
          sortName: "simNum",
        },
        {
          colName: "COLLECTOR",
          isVisible: true,
          colId: "sourceCollectorId",
          sortName: "collectorName",
        },
        {
          colName: "CAMPAIGN",
          isVisible: true,
          colId: "sourceCampaignId",
          sortName: "campaignName",
        },
        {
          colName: "REASON",
          isVisible: false,
          colId: "sourceReasonId",
          sortName: "reasonName",
        },
        {
          colName: "LOCATION",
          isVisible: false,
          colId: "sourceLocationId",
          sortName: "locationName",
        },

        {
          colName: "ACTIVATED",
          isVisible: false,
          colId: "activatedId",
          sortName: "activatedOn",
        },
        {
          colName: "DEACTIVATED",
          isVisible: false,
          colId: "deactivatedId",
          sortName: "deactivatedOn",
        },

        {
          colName: "ORGANIZATION",
          isVisible: false,
          colId: "organizationId",
          sortName: "organizationName",
        },
        {
          colName: "VERSION",
          isVisible: false,
          colId: "versionId",
          sortName: "versionNum",
        },
        {
          colName: "LASTSYNCED",
          isVisible: false,
          colId: "lastsynced",
          sortName: "lastSynced",
        },
        {
          colName: "Display Name",
          isVisible: true,
          colId: "deviceOptionName",
          sortName: "deviceOptionName",
        },
      ],
    },
    {
      id: 2,
      title: "TOTALPANEL",
      class: "total_pnl_lbl",
      isTotalPanel: false,
      items: [
        {
          colName: "PAYMENTS",
          isVisible: true,
          colId: "DonorpaymentsId",
          sortName: "payments",
        },
        {
          colName: "COUNTOFPAYMENTS",
          isVisible: false,
          colId: "DonorpaymentscountId",
          sortName: "paymentsCount",
        },
        {
          colName: "OPENPLEDGES",
          isVisible: true,
          colId: "DonoropenPledgesId",
          sortName: "openPledges",
        },
        {
          colName: "COUNTOFPLEDGES",
          isVisible: false,
          colId: "DonorpledgescountId",
          sortName: "pledgesCount",
        },
        {
          colName: "SCHEDULED",
          isVisible: true,
          colId: "DonorscheduledId",
          sortName: "scheduled",
        },
        {
          colName: "COUNTOFSCHEDULES",
          isVisible: false,
          colId: "DonorschedulescountId",
          sortName: "schedulesCount",
        },
        {
          colName: "TOTAL",
          isVisible: true,
          colId: "DonorraisedId",
          sortName: "raised",
        },
      ],
    },
  ];

  isSourceOrganizationColVisible: boolean = false;
  isSourceEventColVisible: boolean = false; ///changes true
  isSourceProductColVisible: boolean = true;
  isSourceDeviceColVisible: boolean = true;
  isSourceStatusColVisible: boolean = true;
  isSourceCampaignColVisible: boolean = true;
  isSourceCollectorColVisible: boolean = true;

  isSourceActivationCodeColVisible: boolean = false;
  isSourceMacAddressColVisible: boolean = false;
  isSourcePlanColVisible: boolean = false;
  isSourceNotesColVisible: boolean = false;
  isSourceDeviceNumColVisible: boolean = false;
  isSourceSimNumColVisible: boolean = false;
  isSourceReasonColVisible: boolean = false;
  isSourceLocationColVisible: boolean = false;

  isSourceActivatedColVisible: boolean = false;
  isSourceDeactivatedColVisible: boolean = false;
  isSourceLastSyncedColumnVisible: boolean = false;
  isSourceDeviceOptionNameVisible: boolean = true;
  isSourceVersionColVisible: boolean = false;

  filtercount: number = 0;
  selectedItem: any;

  // TotalPanelcheck
  isSourceOpenPledgesColVisible: boolean = false;
  isSourcePaymentsColVisible: boolean = false;
  isSourceRaisedColVisible: boolean = false;
  isSourceScheduledColVisible: boolean = false;
  isSourcePledgesCountColVisible: boolean = false;
  isSourcePaymentsCountColVisible: boolean = false;
  isSourceScheduledCountColVisible: boolean = false;

  // Extend Total Panel Option
  cardFilter = [];
  sortFilter = [];
  cardType: any = [{ id: 1, itemName: "Campaign" }];
  sortType: any = [{ id: 1, itemName: "A-Z" }];
  isTotalPanelVisible: boolean = false;
  isTotalPanelShowAll: boolean = true;
  isinitialize = 0;
  gridTotalPanelData: Array<any>;
  paymentTypeChipData: Array<any> = [];
  gridSumByData: Array<any>;
  panelTitle: string = "SHOWTOTALPANEL";
  listSyncSubscription!: Subscription;

  slideConfig = {
    infinite: false,
    arrows: true,
    vertical: true,
    speed: 1000,
  };

  EngHebCalPlaceholder: string = "All Time";
  class_id: string;
  class_hid: string;
  private calendarSubscription: Subscription;
  isDisableExcel: boolean;
  isdownloadExcelGuid: boolean = false;
  colfieldsValue: any;
  isDateApply: boolean = false;

  resctictEditOnDevices: string[] = ["donary pay", "shul kiosk", "scheduler"];
  isSelectPopupShow: boolean = false;
  isBulkCheckbox: boolean = false;
  displayThisPageArray: any[] = [];
  displayThisPageCount: number = 0;
  private analytics = inject(AnalyticsService);

  constructor(
    private ngZone: NgZone,
    private datePipe: DonaryDateFormatPipe,
    private sourceService: SourceService,
    private collectorService: CollectorService,
    private deviceService: DeviceService,
    private reasonService: ReasonService,
    private campaignService: CampaignService,
    private locationService: LocationService,
    private totalPanelService: TotalPanelService,
    private localStorageDataService: LocalstoragedataService,
    public commonMethodService: CommonMethodService,
    private uiPageSettingService: UIPageSettingService,
    public hebrewEngishCalendarService: HebrewEngishCalendarService,
    private pageSyncService: PageSyncService,
    private readonly changeDetectorRef: ChangeDetectorRef,
    private xlsxService: XLSXService
  ) {}

  ngOnInit() {
    this.analytics.visitedSources();
    this.colfieldsValue = this.pageSyncService.sourceFieldsCol;
    this.colfieldsValue.forEach((obj: { key: boolean }) => {
      let key = Object.keys(obj)[0];
      let value: boolean = Object.values(obj)[0];
      let data = this.colFields[0].items.find((data) => data.colName === key);
      data.isVisible = value;
    });
    if (this.pageSyncService.sumbySource) {
      this.cardType = this.pageSyncService.sumbySource;
    }
    this.getFeatureSettingValues();
    this.commonMethodService.getUserLst().subscribe((res: any) => {
      if (res.items == undefined) {
        this.localStorageDataService.setPermissionLst(
          res.lstUserPermissionModel
        );
        this.showTotalPanelPermission = this.localStorageDataService
          .getPermissionLst()
          .filter((x) => x.permissionName == "Show Total Panel Sources")
          .map((x) => x.isActive)[0];
      }
    });
    this.pageSyncService.calculateTimeDifference("list");
    this.listSyncSubscription = this.commonMethodService
      .getListSync()
      .subscribe((res: any) => {
        if (res) {
          this.searchSourceData();
        }
      });
    this.initMultiSelect();
    //this.objAdvancedSearch.orderDevicesStatusID= [{id:2,itemName:"Activated"},{id:13,itemName:"Auto-Active"}];
    this.sortFilter = [
      { id: 1, itemName: "A-Z" },
      { id: 2, itemName: "Z-A" },
      { id: 3, itemName: "High to Low" },
      { id: 4, itemName: "Low to High" },
    ];
    //this.searchSourceData();
    if (this.commonMethodService.locationTypeList.length == 0) {
      this.commonMethodService.getLocationTypeList();
    }
    if (this.commonMethodService.localReasonList.length == 0) {
      this.commonMethodService.getReasonList();
    }
    if (this.commonMethodService.localCampaignList.length == 0) {
      this.commonMethodService.getCampaignList();
    }
    if (this.commonMethodService.localCollectorList.length == 0) {
      this.commonMethodService.getCollectorList();
    }
    if (this.commonMethodService.localLocationList.length == 0) {
      this.commonMethodService.getLocationList();
    }
    if (this.commonMethodService.localDeviceTypeList.length == 0) {
      this.commonMethodService.getSourceList();
    }

    if (
      !this.pageSyncService.listFlag ||
      (!this.pageSyncService.isSourceListClicked &&
        this.pageSyncService.sourceList == undefined)
    ) {
      let objLayout = {
        uiPageSettingId: this.uiPageSettingId,
        userId: this.localStorageDataService.getLoginUserId(),
        moduleName: "lists",
        screenName: "sources",
      };
      this.uiPageSettingService.Get(objLayout).subscribe((res: any) => {
        if (res) {
          this.uiPageSettingId = res.uiPageSettingId;
          this.uiPageSetting = JSON.parse(res.setting);
          if (this.uiPageSetting.isSourceEventColVisible != undefined) {
            this.setUIPageSettings(this.uiPageSetting);
            if (this.isTotalPanelVisible) {
              this.cardType = this.uiPageSetting.sourceSumBy;
            }

            this.colFields.forEach((element) => {
              if (element.id == 1) {
                element.items.forEach((item) => {
                  let colVisible = this.checkVisibility(item.colName);
                  if (item.isVisible != colVisible) {
                    let columnVisibility = { [item.colName]: colVisible };
                    this.colfieldsValue.push(columnVisibility);
                  }
                  item.isVisible = this.checkVisibility(item.colName);
                });
              }
            });

            if (this.isTotalPanelVisible) {
              this.panelTitle = "Hide Total Panel";
              this.searchSourceData();
              this.getTotalPanel();
            } else {
              this.panelTitle = "Show Total Panel";
              this.searchSourceData();
            }
          } else {
            this.searchSourceData();
          }
        } else {
          if (
            !this.pageSyncService.listFlag ||
            this.pageSyncService.sourceList == undefined
          ) {
            this.searchSourceData();
          } else {
            this.gridData = this.pageSyncService.sourceList;
            this.resListModification(this.gridData);
            this.isloading = false;
            this.changeDetectorRef.markForCheck();
          }
        }
      });
    } else {
      if (this.pageSyncService.uiPageSettings["sourceList"]) {
        this.uiPageSetting =
          this.pageSyncService?.uiPageSettings?.["sourceList"];
        this.setUIPageSettings(this.uiPageSetting);
      }

      this.gridData = this.pageSyncService.sourceList;
      this.gridOrgData = this.pageSyncService.sourceList;
      this.resListModification(this.gridData);
      if (this.pageSyncService.sourcelistTotalPanel !== undefined) {
        this.TogglePanel(this.pageSyncService.sourcelistTotalPanel);
      }
      this.isloading = false;
      this.changeDetectorRef.markForCheck();
    }
    if (this.pageSyncService.sourceFilterData) {
      this.advancedFilterData(this.pageSyncService.sourceFilterData);
    }
    if (this.pageSyncService.SourceCalDate) {
      if (
        this.pageSyncService.SourceCalDate.startDate == null &&
        this.pageSyncService.SourceCalDate.endDate == null
      ) {
        this.selectedDateRange.startDate = null;
        this.selectedDateRange.endDate = null;
        this.EngHebCalPlaceholder = "All Time";
      }
      this.selectedDateRange = {
        startDate: moment(this.pageSyncService.SourceCalDate.startDate),
        endDate: moment(this.pageSyncService.SourceCalDate.endDate),
      };
      this.EngHebCalPlaceholder = this.pageSyncService.SourceEngCalPlaceholder;
    }
  }

  setUIPageSettings(uiPageSetting) {
    this.isSourceEventColVisible = uiPageSetting.isSourceEventColVisible;
    this.isSourceProductColVisible = uiPageSetting.isSourceProductColVisible;
    this.isSourceDeviceColVisible = uiPageSetting.isSourceDeviceColVisible;
    this.isSourceActivationCodeColVisible =
      uiPageSetting.isSourceActivationCodeColVisible;
    this.isSourceMacAddressColVisible =
      uiPageSetting.isSourceMacAddressColVisible;
    this.isSourcePlanColVisible = uiPageSetting.isSourcePlanColVisible;
    this.isSourceStatusColVisible = uiPageSetting.isSourceStatusColVisible;
    this.isSourceNotesColVisible = uiPageSetting.isSourceNotesColVisible;
    this.isSourceDeviceNumColVisible =
      uiPageSetting.isSourceDeviceNumColVisible;
    this.isSourceSimNumColVisible = uiPageSetting.isSourceSimNumColVisible;
    this.isSourceCollectorColVisible =
      uiPageSetting.isSourceCollectorColVisible;
    this.isSourceCampaignColVisible = uiPageSetting.isSourceCampaignColVisible;
    this.isSourceReasonColVisible = uiPageSetting.isSourceReasonColVisible;
    this.isSourceLocationColVisible = uiPageSetting.isSourceLocationColVisible;
    this.isSourceActivatedColVisible =
      uiPageSetting.isSourceActivatedColVisible;
    this.isSourceDeactivatedColVisible =
      uiPageSetting.isSourceDeactivatedColVisible;
    this.isSourceLastSyncedColumnVisible =
      uiPageSetting.isSourceLastSyncedColumnVisible;
    this.isSourceOrganizationColVisible =
      uiPageSetting.isSourceOrganizationColVisible;
    this.isSourceVersionColVisible = uiPageSetting.isSourceVersionColVisible;
    this.isSourcePaymentsColVisible = uiPageSetting.isSourcePaymentsColVisible;
    this.isSourceOpenPledgesColVisible =
      uiPageSetting.isSourceOpenPledgesColVisible;
    this.isSourceScheduledColVisible =
      uiPageSetting.isSourceScheduledColVisible;
    this.isSourceRaisedColVisible = uiPageSetting.isSourceRaisedColVisible;
    this.isSourcePaymentsCountColVisible =
      uiPageSetting.isSourcePaymentsCountColVisible;
    this.isSourcePledgesCountColVisible =
      uiPageSetting.isSourcePledgesCountColVisible;
    this.isSourceScheduledCountColVisible =
      uiPageSetting.isSourceScheduledCountColVisible;
    this.isTotalPanelVisible = uiPageSetting.sourceIsTotalPanelVisible;
    this.pageSyncService.sourcelistTotalPanel =
      !uiPageSetting.sourceIsTotalPanelVisible;
    this.objAdvancedSearch = uiPageSetting.sourceSearchitem;
    this.isSourceDeviceOptionNameVisible =
      uiPageSetting.isSourceDeviceOptionNameVisible;

    if (uiPageSetting?.sourceCalendarPlaceHolderId)
      this.hebrewEngishCalendarService.id =
        uiPageSetting?.sourceCalendarPlaceHolderId;

    if (
      uiPageSetting.sourceStartDate == null &&
      uiPageSetting.sourceEndDate == null
    )
      this.selectedDateRange = undefined;
    else
      this.selectedDateRange = {
        startDate: moment(uiPageSetting.sourceStartDate),
        endDate: moment(uiPageSetting.sourceEndDate),
      };

    this.pageSyncService.sourcelistTotalPanel =
      !uiPageSetting.sourceIsTotalPanelVisible;
    this.pageSyncService.uiPageSettings["sourceList"] = uiPageSetting;
  }

  detectChanges() {
    if (!this.changeDetectorRef["destroyed"]) {
      this.changeDetectorRef.markForCheck();
    }
  }

  ngOnDestroy() {
    this.listSyncSubscription.unsubscribe();
  }

  initMultiSelect() {
    const sumByCampaign = _(this.gridTotalPanelData)
      .filter((s) => s.campaignId != null && s.deviceId != null)
      .groupBy("campaignId")
      .map((objs, key) => ({
        ...objs,
      }))
      .value();

    const sumByReason = _(this.gridTotalPanelData)
      .filter((s) => s.reasonId != null && s.deviceId != null)
      .groupBy("reasonId")
      .map((objs, key) => ({
        ...objs,
      }))
      .value();

    const sumByLocation = _(this.gridTotalPanelData)
      .filter((s) => s.locationId != null && s.deviceId != null)
      .groupBy("locationId")
      .map((objs, key) => ({
        ...objs,
      }))
      .value();

    const sumByCollector = _(this.gridTotalPanelData)
      .filter((s) => s.collectorId != null && s.deviceId != null)
      .groupBy("collectorId")
      .map((objs, key) => ({
        ...objs,
      }))
      .value();

    const sumByDevice = _(this.gridTotalPanelData)
      .filter((s) => s.deviceId != null)
      .groupBy("deviceId")
      .map((objs, key) => ({
        ...objs,
      }))
      .value();

    const sumByDonor = _(this.gridTotalPanelData)
      .filter((s) => s.accountId != null && s.deviceId != null)
      .groupBy("accountId")
      .map((objs, key) => ({
        ...objs,
      }))
      .value();

    this.cardFilter = [
      { id: 1, itemName: "Campaign", counts: sumByCampaign.length },
      { id: 2, itemName: "Reason", counts: sumByReason.length },
      { id: 3, itemName: "Location", counts: sumByLocation.length },
      { id: 5, itemName: "Collector", counts: sumByCollector.length },
      { id: 7, itemName: "Device", counts: sumByDevice.length },
      { id: 6, itemName: "Donor", counts: sumByDonor.length },
    ];
  }

  CalendarFocus() {
    this.pickerDirective.open();
  }

  transformDate(date) {
    return this.datePipe.transform(date, "long");
  }

  getGroupValue(): Array<any> {
    return _(this.gridTotalPanelData)
      .groupBy("deviceId")
      .map((props, id: string) => ({
        ..._.head(props),
        deviceId: id,
        payments: _.map(props, (o) => {
          return o.payments;
        }).reduce((prev, next) => prev + next, 0),
        openPledges: _.map(props, (o) => {
          return o.openPledges;
        }).reduce((prev, next) => prev + next, 0),
        scheduled: _.map(props, (o) => {
          return o.scheduled;
        }).reduce((prev, next) => prev + next, 0),
        raised: _.map(props, (o) => {
          return o.raised;
        }).reduce((prev, next) => prev + next, 0),
        campaignIds: _.map(props, (o) => {
          return o.campaignId;
        }),
        reasonIds: _.map(props, (o) => {
          return o.reasonId;
        }),
        locationIds: _.map(props, (o) => {
          return o.locationId;
        }),
        collectorIds: _.map(props, (o) => {
          return o.collectorId;
        }),
        accountIds: _.map(props, (o) => {
          return o.accountId;
        }),
        parentCampaignIds: _.map(props, (o) => {
          return o.parentCampaignId;
        }),
        deviceIds: _.map(props, (o) => {
          return o.deviceId;
        }),
      }))
      .value();
  }

  showAllTotalData() {
    const groupedRes = this.getGroupValue();

    const merged = _.merge(
      _.keyBy(this.gridData, "deviceId"),
      _.keyBy(groupedRes, "deviceId")
    );
    const mergedValue = _.values(merged);
    let inCommon = _.intersectionWith(mergedValue, this.gridData, (o, t) => {
      return o.deviceId == t.deviceId;
    });
    const values = _.values(inCommon);
    this.totalRecord = values.length;
    this.gridFilterData = values;
    this.gridSumByData = this.gridFilterData;
    this.cardTypeChange(this.cardType);
  }
  groupRes: any;
  showOnlyTotalData() {
    // new changed on 26-09
    const dd = _.intersectionWith(
      this.gridData,
      this.gridTotalPanelData,
      (o, t) => {
        return o.deviceId == t.deviceId;
      }
    );

    const groupedRes = this.getGroupValue();
    this.groupRes = this.GetGroupList(
      this.groupBy(this.gridTotalPanelData, (s) => s.deviceId)
    );
    const values = _.map(dd, (o) => {
      let found = _.find(groupedRes, (t) => {
        return o.deviceId == t.deviceId;
      });
      if (found) {
        return {
          ...o,
          ...found,
        };
      }
      return {
        ...o,
      };
    });

    this.gridFilterData = values;
    this.totalRecord = values.length;
    this.gridSumByData = this.gridFilterData;
    this.cardTypeChange(this.cardType);
  }

  groupBy(list, keyGetter) {
    const map = new Map();
    list?.forEach((item) => {
      const key = keyGetter(item);
      const collection = map.get(key);
      if (!collection) {
        map.set(key, [item]);
      } else {
        collection.push(item);
      }
    });

    return map;
  }

  GetGroupList(groupByList) {
    var myArray = [];
    groupByList.forEach((element) => {
      myArray.push.apply(myArray, element);
    });

    return myArray;
  }

  OnCheckboxChange(event) {
    if (event.target.checked) {
      this.isTotalPanelShowAll = true;
      this.showOnlyTotalData();
    } else {
      this.showAllTotalData();
      this.isTotalPanelShowAll = false;
    }

    this.initMultiSelect();
  }

  getTotalPanel() {
    this.isloading = true;
    var objTotalPanel = {
      eventGuId: this.localStorageDataService.getLoginUserEventGuId(),
      fromDate:
        this.selectedDateRange != undefined
          ? this.selectedDateRange.startDate != null
            ? moment(this.selectedDateRange.startDate).format("YYYY-MM-DD")
            : null
          : null,
      toDate:
        this.selectedDateRange != undefined
          ? this.selectedDateRange.endDate != null
            ? moment(this.selectedDateRange.endDate).format("YYYY-MM-DD")
            : null
          : null,
    };
    if (this.pageSyncService.SoucetotalPanel && !this.isDateApply) {
      this.Panel(this.pageSyncService.SoucetotalPanel);
    } else {
      this.isDateApply = false;
      this.totalPanelService.getTotals(objTotalPanel).subscribe(
        (res: Array<PanelRes>) => {
          this.pageSyncService.SoucetotalPanel = res;
          this.Panel(res);
        },
        (error) => {
          this.isloading = false;
          console.log(error);
        }
      );
    }
  }

  Panel(res: any) {
    if (res.length > 0) {
      this.gridTotalPanelData = res;
      this.gridOrgTotalPanelData = res;
      if (this.isTotalPanelShowAll) {
        this.totalPanelfilterLocalData();
        this.showOnlyTotalData();
        this.tempSearch = this.gridFilterData;
      } else {
        this.showAllTotalData();
      }

      this.isSourceOpenPledgesColVisible = true;
      this.isSourcePaymentsColVisible = true;
      this.isSourceRaisedColVisible = true;
      this.isSourceScheduledColVisible = true;

      if (this.gridFilterData.length > 0) {
        this.initMultiSelect();
      } else {
        this.paymentTypeChipData = [];
        this.initMultiSelect();
      }
      //this.initMultiSelect();
    } else {
      this.paymentTypeChipData = [];
      this.totalRecord = 0;
      //this.gridData = null;
      this.gridFilterData = [];
      this.gridSumByData = this.gridFilterData;
      this.initMultiSelect();
    }
    this.isinitialize = 1;
    this.isloading = false;
    this.isFiltered = false;
    this.changeDetectorRef.markForCheck();
  }
  totalPanelfilterLocalData() {
    if (Array.isArray(this.gridOrgTotalPanelData)) {
      this.gridFilterData = this.gridOrgTotalPanelData?.filter((o) => {
        if (!this.isFilterOpen) {
          this.objAdvancedSearch = null;
        }
      });
    }
  }

  datesUpdated(event) {
    if (this.isinitialize == 1) {
      if (!event.startDate) {
        this.selectedDateRange = undefined;
        this.isinitialize = 0;
      } else {
        this.selectedDateRange = event;
      }
      //this.selectedDateRange = event;
      this.getTotalPanel();
    }
  }

  GetPaymentChipType(objPaymentTypeChip) {
    if (objPaymentTypeChip) {
      var cardTypeValue =
        this.cardType.length > 0
          ? this.cardType.map((s) => s.itemName).toString()
          : null;
      this.gridFilterData = this.gridSumByData;
      this.objAdvancedSearch = {
        status: "",
        donorId: [],
        campaignId: [],
        locationId: [],
        collectorId: [],
        sourceId: [],
        reasonId: [],
        linkedCampaignName: "",
      };
      switch (cardTypeValue) {
        case "Campaign":
          if (objPaymentTypeChip.key == "-2") {
            // For All
            this.gridFilterData = this.gridFilterData
              .map((obj, key) => ({
                count: obj.campaignIds.filter((x) => x != null).length,
                obj: obj,
              }))
              .filter((x) => x.count > 0)
              .map((x) => x.obj);
            this.gridFilterData.forEach((item) => {
              (item.payments = this.groupRes
                .filter((s) => s.deviceId == item.deviceId)
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next)),
                (item.openPledges = this.groupRes
                  .filter((s) => s.deviceId == item.deviceId)
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next)),
                (item.raised = this.groupRes
                  .filter((s) => s.deviceId == item.deviceId)
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next)),
                (item.scheduled = this.groupRes
                  .filter((s) => s.deviceId == item.deviceId)
                  .map((s) => s.scheduled)
                  .reduce((prev, next) => prev + next));
            });
            this.totalRecord = this.gridFilterData.length;
            this.objAdvancedSearch.campaignId = [];
            this.isFiltered = false;
            this.isChipTypeSelected = false;
          } else if (objPaymentTypeChip.key == "-1") {
            // For All
            this.gridFilterData = this.gridFilterData;
            this.gridFilterData.forEach((item) => {
              (item.payments = this.groupRes
                .filter((s) => s.deviceId == item.deviceId)
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next)),
                (item.openPledges = this.groupRes
                  .filter((s) => s.deviceId == item.deviceId)
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next)),
                (item.raised = this.groupRes
                  .filter((s) => s.deviceId == item.deviceId)
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next)),
                (item.scheduled = this.groupRes
                  .filter((s) => s.deviceId == item.deviceId)
                  .map((s) => s.scheduled)
                  .reduce((prev, next) => prev + next));
            });
            this.totalRecord = this.gridFilterData.length;
            this.objAdvancedSearch.campaignId = [];
            this.isFiltered = false;
            this.isChipTypeSelected = false;
          } else {
            var campaignDeviceIds = this.GetCampaignDevice(
              objPaymentTypeChip.key
            );
            this.gridFilterData = this.gridFilterData.filter(
              (s) =>
                (s.campaignIds.indexOf(Number(objPaymentTypeChip.key)) >= 0 &&
                  campaignDeviceIds.indexOf(Number(s.deviceId)) >= 0) ||
                s.parentCampaignIds.indexOf(Number(objPaymentTypeChip.key)) >= 0
            );
            this.gridFilterData.forEach((item) => {
              (item.payments = this.groupRes
                .filter(
                  (s) =>
                    (s.campaignId == Number(objPaymentTypeChip.key) ||
                      s.parentCampaignId == Number(objPaymentTypeChip.key)) &&
                    s.deviceId == item.deviceId
                )
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next)),
                (item.openPledges = this.groupRes
                  .filter(
                    (s) =>
                      (s.campaignId == Number(objPaymentTypeChip.key) ||
                        s.parentCampaignId == Number(objPaymentTypeChip.key)) &&
                      s.deviceId == item.deviceId
                  )
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next)),
                (item.raised = this.groupRes
                  .filter(
                    (s) =>
                      (s.campaignId == Number(objPaymentTypeChip.key) ||
                        s.parentCampaignId == Number(objPaymentTypeChip.key)) &&
                      s.deviceId == item.deviceId
                  )
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next)),
                (item.scheduled = this.groupRes
                  .filter(
                    (s) =>
                      (s.campaignId == Number(objPaymentTypeChip.key) ||
                        s.parentCampaignId == Number(objPaymentTypeChip.key)) &&
                      s.deviceId == item.deviceId
                  )
                  .map((s) => s.scheduled)
                  .reduce((prev, next) => prev + next));
            });
            this.objAdvancedSearch.campaignId.push({
              id: objPaymentTypeChip.key,
              itemName: objPaymentTypeChip.name,
            });
            this.filterRecord = this.gridFilterData.length;
            this.isFiltered = true;
            this.isChipTypeSelected = true;
            this.gridSelectedData = this.gridFilterData;
          }
          break;
        case "Reason":
          if (objPaymentTypeChip.key == "-2") {
            // For All
            this.gridFilterData = this.gridFilterData
              .map((obj, key) => ({
                count: obj.reasonIds.filter((x) => x != null).length,
                obj: obj,
              }))
              .filter((x) => x.count > 0)
              .map((x) => x.obj);
            this.gridFilterData.forEach((item) => {
              (item.payments = this.groupRes
                .filter((s) => s.deviceId == item.deviceId)
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next)),
                (item.openPledges = this.groupRes
                  .filter((s) => s.deviceId == item.deviceId)
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next)),
                (item.raised = this.groupRes
                  .filter((s) => s.deviceId == item.deviceId)
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next)),
                (item.scheduled = this.groupRes
                  .filter((s) => s.deviceId == item.deviceId)
                  .map((s) => s.scheduled)
                  .reduce((prev, next) => prev + next));
            });
            this.totalRecord = this.gridFilterData.length;
            this.objAdvancedSearch.reasonId = [];
            this.isFiltered = false;
            this.isChipTypeSelected = false;
          } else if (objPaymentTypeChip.key == "-1") {
            // For All
            this.gridFilterData = this.gridFilterData;
            this.gridFilterData.forEach((item) => {
              (item.payments = this.groupRes
                .filter((s) => s.deviceId == item.deviceId)
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next)),
                (item.openPledges = this.groupRes
                  .filter((s) => s.deviceId == item.deviceId)
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next)),
                (item.raised = this.groupRes
                  .filter((s) => s.deviceId == item.deviceId)
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next)),
                (item.scheduled = this.groupRes
                  .filter((s) => s.deviceId == item.deviceId)
                  .map((s) => s.scheduled)
                  .reduce((prev, next) => prev + next));
            });
            this.totalRecord = this.gridFilterData.length;
            this.objAdvancedSearch.reasonId = [];
            this.isFiltered = false;
            this.isChipTypeSelected = false;
          } else {
            var reasonDeviceIds = this.GetReasonDevice(objPaymentTypeChip.key);
            this.gridFilterData = this.gridFilterData.filter(
              (s) =>
                s.reasonIds.indexOf(Number(objPaymentTypeChip.key)) >= 0 &&
                reasonDeviceIds.indexOf(Number(s.deviceId)) >= 0
            );
            this.gridFilterData.forEach((item) => {
              (item.payments = this.groupRes
                .filter(
                  (s) =>
                    s.reasonId == Number(objPaymentTypeChip.key) &&
                    s.deviceId == item.deviceId
                )
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next)),
                (item.openPledges = this.groupRes
                  .filter(
                    (s) =>
                      s.reasonId == Number(objPaymentTypeChip.key) &&
                      s.deviceId == item.deviceId
                  )
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next)),
                (item.raised = this.groupRes
                  .filter(
                    (s) =>
                      s.reasonId == Number(objPaymentTypeChip.key) &&
                      s.deviceId == item.deviceId
                  )
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next)),
                (item.scheduled = this.groupRes
                  .filter(
                    (s) =>
                      s.reasonId == Number(objPaymentTypeChip.key) &&
                      s.deviceId == item.deviceId
                  )
                  .map((s) => s.scheduled)
                  .reduce((prev, next) => prev + next));
            });
            this.objAdvancedSearch.reasonId.push({
              id: objPaymentTypeChip.key,
              itemName: objPaymentTypeChip.name,
            });
            this.filterRecord = this.gridFilterData.length;
            this.isFiltered = true;
            this.isChipTypeSelected = true;
            this.gridSelectedData = this.gridFilterData;
          }
          break;
        case "Location":
          if (objPaymentTypeChip.key == "-2") {
            // For All
            this.gridFilterData = this.gridFilterData
              .map((obj, key) => ({
                count: obj.locationIds.filter((x) => x != null).length,
                obj: obj,
              }))
              .filter((x) => x.count > 0)
              .map((x) => x.obj);
            this.gridFilterData.forEach((item) => {
              (item.payments = this.groupRes
                .filter((s) => s.deviceId == item.deviceId)
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next)),
                (item.openPledges = this.groupRes
                  .filter((s) => s.deviceId == item.deviceId)
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next)),
                (item.raised = this.groupRes
                  .filter((s) => s.deviceId == item.deviceId)
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next)),
                (item.scheduled = this.groupRes
                  .filter((s) => s.deviceId == item.deviceId)
                  .map((s) => s.scheduled)
                  .reduce((prev, next) => prev + next));
            });
            this.totalRecord = this.gridFilterData.length;
            this.objAdvancedSearch.locationId = [];
            this.isFiltered = false;
            this.isChipTypeSelected = false;
          } else if (objPaymentTypeChip.key == "-1") {
            // For All
            this.gridFilterData = this.gridFilterData;
            this.gridFilterData.forEach((item) => {
              (item.payments = this.groupRes
                .filter((s) => s.deviceId == item.deviceId)
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next)),
                (item.openPledges = this.groupRes
                  .filter((s) => s.deviceId == item.deviceId)
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next)),
                (item.raised = this.groupRes
                  .filter((s) => s.deviceId == item.deviceId)
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next)),
                (item.scheduled = this.groupRes
                  .filter((s) => s.deviceId == item.deviceId)
                  .map((s) => s.scheduled)
                  .reduce((prev, next) => prev + next));
            });
            this.totalRecord = this.gridFilterData.length;
            this.objAdvancedSearch.locationId = [];
            this.isFiltered = false;
            this.isChipTypeSelected = false;
          } else {
            var LocationDeviceIds = this.GetLocationDevice(
              objPaymentTypeChip.key
            );
            this.gridFilterData = this.gridFilterData.filter(
              (s) =>
                s.locationIds.indexOf(Number(objPaymentTypeChip.key)) >= 0 &&
                LocationDeviceIds.indexOf(Number(s.deviceId)) >= 0
            );
            this.gridFilterData.forEach((item) => {
              (item.payments = this.groupRes
                .filter(
                  (s) =>
                    s.locationId == Number(objPaymentTypeChip.key) &&
                    s.deviceId == item.deviceId
                )
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next)),
                (item.openPledges = this.groupRes
                  .filter(
                    (s) =>
                      s.locationId == Number(objPaymentTypeChip.key) &&
                      s.deviceId == item.deviceId
                  )
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next)),
                (item.raised = this.groupRes
                  .filter(
                    (s) =>
                      s.locationId == Number(objPaymentTypeChip.key) &&
                      s.deviceId == item.deviceId
                  )
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next)),
                (item.scheduled = this.groupRes
                  .filter(
                    (s) =>
                      s.locationId == Number(objPaymentTypeChip.key) &&
                      s.deviceId == item.deviceId
                  )
                  .map((s) => s.scheduled)
                  .reduce((prev, next) => prev + next));
            });
            this.objAdvancedSearch.locationId.push({
              id: objPaymentTypeChip.key,
              itemName: objPaymentTypeChip.name,
            });
            this.filterRecord = this.gridFilterData.length;
            this.isFiltered = true;
            this.isChipTypeSelected = true;
            this.gridSelectedData = this.gridFilterData;
          }
          break;
        case "Collector":
          if (objPaymentTypeChip.key == "-2") {
            // For All
            this.gridFilterData = this.gridFilterData
              .map((obj, key) => ({
                count: obj.collectorIds.filter((x) => x != null).length,
                obj: obj,
              }))
              .filter((x) => x.count > 0)
              .map((x) => x.obj);
            this.gridFilterData.forEach((item) => {
              (item.payments = this.groupRes
                .filter((s) => s.deviceId == item.deviceId)
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next)),
                (item.openPledges = this.groupRes
                  .filter((s) => s.deviceId == item.deviceId)
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next)),
                (item.raised = this.groupRes
                  .filter((s) => s.deviceId == item.deviceId)
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next)),
                (item.scheduled = this.groupRes
                  .filter((s) => s.deviceId == item.deviceId)
                  .map((s) => s.scheduled)
                  .reduce((prev, next) => prev + next));
            });
            this.totalRecord = this.gridFilterData.length;
            this.objAdvancedSearch.collectorId = [];
            this.isFiltered = false;
            this.isChipTypeSelected = false;
          } else if (objPaymentTypeChip.key == "-1") {
            // For All
            this.gridFilterData = this.gridFilterData;
            this.gridFilterData.forEach((item) => {
              (item.payments = this.groupRes
                .filter((s) => s.deviceId == item.deviceId)
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next)),
                (item.openPledges = this.groupRes
                  .filter((s) => s.deviceId == item.deviceId)
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next)),
                (item.raised = this.groupRes
                  .filter((s) => s.deviceId == item.deviceId)
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next)),
                (item.scheduled = this.groupRes
                  .filter((s) => s.deviceId == item.deviceId)
                  .map((s) => s.scheduled)
                  .reduce((prev, next) => prev + next));
            });
            this.totalRecord = this.gridFilterData.length;
            this.objAdvancedSearch.collectorId = [];
            this.isFiltered = false;
            this.isChipTypeSelected = false;
          } else {
            var collectorDeviceIds = this.GetCollectorDevice(
              objPaymentTypeChip.key
            );
            this.gridFilterData = this.gridFilterData.filter(
              (s) =>
                s.collectorIds.indexOf(Number(objPaymentTypeChip.key)) >= 0 &&
                collectorDeviceIds.indexOf(Number(s.deviceId)) >= 0
            );
            this.gridFilterData.forEach((item) => {
              (item.payments = this.groupRes
                .filter(
                  (s) =>
                    s.collectorId == Number(objPaymentTypeChip.key) &&
                    s.deviceId == item.deviceId
                )
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next)),
                (item.openPledges = this.groupRes
                  .filter(
                    (s) =>
                      s.collectorId == Number(objPaymentTypeChip.key) &&
                      s.deviceId == item.deviceId
                  )
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next)),
                (item.raised = this.groupRes
                  .filter(
                    (s) =>
                      s.collectorId == Number(objPaymentTypeChip.key) &&
                      s.deviceId == item.deviceId
                  )
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next)),
                (item.scheduled = this.groupRes
                  .filter(
                    (s) =>
                      s.collectorId == Number(objPaymentTypeChip.key) &&
                      s.deviceId == item.deviceId
                  )
                  .map((s) => s.scheduled)
                  .reduce((prev, next) => prev + next));
            });
            this.objAdvancedSearch.collectorId.push({
              id: objPaymentTypeChip.key,
              itemName: objPaymentTypeChip.name,
            });
            this.filterRecord = this.gridFilterData.length;
            this.isFiltered = true;
            this.isChipTypeSelected = true;
            this.gridSelectedData = this.gridFilterData;
          }
          break;
        case "Device":
          if (objPaymentTypeChip.key == "-2") {
            // For All
            this.gridFilterData = this.gridFilterData
              .map((obj, key) => ({
                count: obj.deviceIds.filter((x) => x != null).length,
                obj: obj,
              }))
              .filter((x) => x.count > 0)
              .map((x) => x.obj);
            this.gridFilterData.forEach((item) => {
              (item.payments = this.groupRes
                .filter((s) => s.deviceId == item.deviceId)
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next)),
                (item.openPledges = this.groupRes
                  .filter((s) => s.deviceId == item.deviceId)
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next)),
                (item.raised = this.groupRes
                  .filter((s) => s.deviceId == item.deviceId)
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next)),
                (item.scheduled = this.groupRes
                  .filter((s) => s.deviceId == item.deviceId)
                  .map((s) => s.scheduled)
                  .reduce((prev, next) => prev + next));
            });
            this.totalRecord = this.gridFilterData.length;
            this.objAdvancedSearch.sourceId = [];
            this.isFiltered = false;
            this.isChipTypeSelected = false;
          } else if (objPaymentTypeChip.key == "-1") {
            // For All
            this.gridFilterData = this.gridFilterData;
            this.gridFilterData.forEach((item) => {
              (item.payments = this.groupRes
                .filter((s) => s.deviceId == item.deviceId)
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next)),
                (item.openPledges = this.groupRes
                  .filter((s) => s.deviceId == item.deviceId)
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next)),
                (item.raised = this.groupRes
                  .filter((s) => s.deviceId == item.deviceId)
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next)),
                (item.scheduled = this.groupRes
                  .filter((s) => s.deviceId == item.deviceId)
                  .map((s) => s.scheduled)
                  .reduce((prev, next) => prev + next));
            });
            this.totalRecord = this.gridFilterData.length;
            this.objAdvancedSearch.sourceId = [];
            this.isFiltered = false;
            this.isChipTypeSelected = false;
          } else {
            var deviceIDs = this.GetDevice(objPaymentTypeChip.key);
            this.gridFilterData = this.gridFilterData.filter(
              (s) =>
                s.deviceIds.indexOf(Number(objPaymentTypeChip.key)) >= 0 &&
                deviceIDs.indexOf(Number(s.deviceId)) >= 0
            );
            this.gridFilterData.forEach((item) => {
              (item.payments = this.groupRes
                .filter(
                  (s) =>
                    s.deviceId == Number(objPaymentTypeChip.key) &&
                    s.deviceId == item.deviceId
                )
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next)),
                (item.openPledges = this.groupRes
                  .filter(
                    (s) =>
                      s.deviceId == Number(objPaymentTypeChip.key) &&
                      s.deviceId == item.deviceId
                  )
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next)),
                (item.raised = this.groupRes
                  .filter(
                    (s) =>
                      s.deviceId == Number(objPaymentTypeChip.key) &&
                      s.deviceId == item.deviceId
                  )
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next)),
                (item.scheduled = this.groupRes
                  .filter(
                    (s) =>
                      s.deviceId == Number(objPaymentTypeChip.key) &&
                      s.deviceId == item.deviceId
                  )
                  .map((s) => s.scheduled)
                  .reduce((prev, next) => prev + next));
            });
            this.objAdvancedSearch.sourceId.push({
              id: objPaymentTypeChip.key,
              itemName: objPaymentTypeChip.name,
            });
            this.filterRecord = this.gridFilterData.length;
            this.isFiltered = true;
            this.isChipTypeSelected = true;
            this.gridSelectedData = this.gridFilterData;
          }
          break;
        case "Donor":
          if (objPaymentTypeChip.key == "-2") {
            // For All
            this.gridFilterData = this.gridFilterData
              .map((obj, key) => ({
                count: obj.accountIds.filter((x) => x != null).length,
                obj: obj,
              }))
              .filter((x) => x.count > 0)
              .map((x) => x.obj);
            this.gridFilterData.forEach((item) => {
              (item.payments = this.groupRes
                .filter((s) => s.deviceId == item.deviceId)
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next)),
                (item.openPledges = this.groupRes
                  .filter((s) => s.deviceId == item.deviceId)
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next)),
                (item.raised = this.groupRes
                  .filter((s) => s.deviceId == item.deviceId)
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next)),
                (item.scheduled = this.groupRes
                  .filter((s) => s.deviceId == item.deviceId)
                  .map((s) => s.scheduled)
                  .reduce((prev, next) => prev + next));
            });
            this.totalRecord = this.gridFilterData.length;
            this.objAdvancedSearch.donorId = [];
            this.isFiltered = false;
            this.isChipTypeSelected = false;
          } else if (objPaymentTypeChip.key == "-1") {
            // For All
            this.gridFilterData = this.gridFilterData;
            this.gridFilterData.forEach((item) => {
              (item.payments = this.groupRes
                .filter((s) => s.deviceId == item.deviceId)
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next)),
                (item.openPledges = this.groupRes
                  .filter((s) => s.deviceId == item.deviceId)
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next)),
                (item.raised = this.groupRes
                  .filter((s) => s.deviceId == item.deviceId)
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next)),
                (item.scheduled = this.groupRes
                  .filter((s) => s.deviceId == item.deviceId)
                  .map((s) => s.scheduled)
                  .reduce((prev, next) => prev + next));
            });
            this.totalRecord = this.gridFilterData.length;
            this.objAdvancedSearch.donorId = [];
            this.isFiltered = false;
            this.isChipTypeSelected = false;
          } else {
            var accountDeviceIds = this.GetDonorDevice(objPaymentTypeChip.key);
            this.gridFilterData = this.gridFilterData.filter(
              (s) =>
                s.accountIds.indexOf(Number(objPaymentTypeChip.key)) >= 0 &&
                accountDeviceIds.indexOf(Number(s.deviceId)) >= 0
            );
            this.gridFilterData.forEach((item) => {
              (item.payments = this.groupRes
                .filter(
                  (s) =>
                    s.accountId == Number(objPaymentTypeChip.key) &&
                    s.deviceId == item.deviceId
                )
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next)),
                (item.openPledges = this.groupRes
                  .filter(
                    (s) =>
                      s.accountId == Number(objPaymentTypeChip.key) &&
                      s.deviceId == item.deviceId
                  )
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next)),
                (item.raised = this.groupRes
                  .filter(
                    (s) =>
                      s.accountId == Number(objPaymentTypeChip.key) &&
                      s.deviceId == item.deviceId
                  )
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next)),
                (item.scheduled = this.groupRes
                  .filter(
                    (s) =>
                      s.accountId == Number(objPaymentTypeChip.key) &&
                      s.deviceId == item.deviceId
                  )
                  .map((s) => s.scheduled)
                  .reduce((prev, next) => prev + next));
            });
            this.objAdvancedSearch.donorId.push({
              id: objPaymentTypeChip.key,
              itemName: objPaymentTypeChip.name,
            });
            this.filterRecord = this.gridFilterData.length;
            this.isFiltered = true;
            this.isChipTypeSelected = true;
            this.gridSelectedData = this.gridFilterData;
          }
          break;
      }
    }
  }
  GetCampaignDevice(campaignId) {
    var campaignDeviceIds = this.groupRes
      .filter((s) => s.campaignId == campaignId)
      .map((s) => s.deviceId);
    campaignDeviceIds = campaignDeviceIds.filter(
      (n, i) => campaignDeviceIds.indexOf(n) === i
    );
    return campaignDeviceIds.filter((x) => x != null);
  }
  GetDevice(deviceId) {
    var deviceIds = this.groupRes
      .filter((s) => s.deviceId == deviceId)
      .map((s) => s.deviceId);
    deviceIds = deviceIds.filter((n, i) => deviceIds.indexOf(n) === i);
    return deviceIds.filter((x) => x != null);
  }
  GetCollectorDevice(collectorId) {
    var collectorDeviceIds = this.groupRes
      .filter((s) => s.collectorId == collectorId)
      .map((s) => s.deviceId);
    collectorDeviceIds = collectorDeviceIds.filter(
      (n, i) => collectorDeviceIds.indexOf(n) === i
    );
    return collectorDeviceIds.filter((x) => x != null);
  }
  GetLocationDevice(locationId) {
    var locationDeviceIds = this.groupRes
      .filter((s) => s.locationId == locationId)
      .map((s) => s.deviceId);
    locationDeviceIds = locationDeviceIds.filter(
      (n, i) => locationDeviceIds.indexOf(n) === i
    );
    return locationDeviceIds.filter((x) => x != null);
  }
  GetDonorDevice(accountId) {
    var donorDeviceIds = this.groupRes
      .filter((s) => s.accountId == accountId)
      .map((s) => s.deviceId);
    donorDeviceIds = donorDeviceIds.filter(
      (n, i) => donorDeviceIds.indexOf(n) === i
    );
    return donorDeviceIds.filter((x) => x != null);
  }
  GetReasonDevice(reasonId) {
    var reasonDeviceIds = this.groupRes
      .filter((s) => s.reasonId == reasonId)
      .map((s) => s.deviceId);
    reasonDeviceIds = reasonDeviceIds.filter(
      (n, i) => reasonDeviceIds.indexOf(n) === i
    );
    return reasonDeviceIds.filter((x) => x != null);
  }
  cardTypeChange(cardType) {
    this.cardType = cardType;
    this.pageSyncService.sumbySource = cardType;
    this.gridFilterData = this.gridSumByData;
    this.isFiltered = false;
    if (cardType[0].itemName == "Campaign") {
      this.paymentTypeChipData = _(this.gridTotalPanelData)
        .filter((s) => s.campaignId != null && s.deviceId != null)
        .groupBy("campaignId")
        .map((objs, key) => ({
          name: objs[0].campaign,
          key: key,
          count: this.GetCampaignDevice(objs[0].campaignId).length,
          total:
            this.groupRes
              .filter(
                (x) =>
                  (x.campaignId == objs[0].campaignId && x.deviceId != null) ||
                  x.parentCampaignId == objs[0].campaignId
              )
              .map((item) => item.raised).length == 0
              ? 0
              : this.groupRes
                  .filter(
                    (x) =>
                      (x.campaignId == objs[0].campaignId &&
                        x.deviceId != null) ||
                      x.parentCampaignId == objs[0].campaignId
                  )
                  .map((item) => item.raised)
                  .reduce((prev, next) => prev + next),
          payment: _.sumBy(objs, "payments"),
          openpledge: _.sumBy(objs, "openPledges"),
          scheduled: _.sumBy(objs, "scheduled"),
        }))
        .value();
      this.paymentTypeChipData = this.paymentTypeChipData.filter(
        (x) => x.count > 0 && x.total > 0
      );
      if (this.paymentTypeChipData.length != 0) {
        var allTotal =
          this.groupRes
            .filter((s) => s.campaignId != null && s.deviceId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.campaignId != null && s.deviceId != null)
                .map((item) => item.raised)
                .reduce((prev, next) => prev + next);
        var allCampaignTotal =
          this.groupRes
            .filter((s) => s.deviceId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.deviceId != null)
                .map((item) => item.raised)
                .reduce((prev, next) => prev + next);
        var payment =
          this.groupRes
            .filter((s) => s.campaignId != null)
            .map((item) => item.payments).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.campaignId != null)
                .map((item) => item.payments)
                .reduce((prev, next) => prev + next);
        var openpledge =
          this.groupRes
            .filter((s) => s.campaignId != null)
            .map((item) => item.openPledges).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.campaignId != null)
                .map((item) => item.openPledges)
                .reduce((prev, next) => prev + next);
        var scheduled =
          this.groupRes
            .filter((s) => s.campaignId != null)
            .map((item) => item.scheduled).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.campaignId != null)
                .map((item) => item.scheduled)
                .reduce((prev, next) => prev + next);
        var allLength = this.gridFilterData.length;
        var allCampaignLength = this.gridFilterData
          .map((obj, key) => ({
            count: obj.campaignIds.filter((x) => x != null).length,
          }))
          .filter((x) => x.count > 0).length;
        this.gridSearchFilterData = this.gridFilterData;
        this.totalRecord = allLength;
        var totalArray = {
          name: "Total Of Campaigns",
          key: -2,
          total: allTotal,
          count: allCampaignLength,
          payment: payment,
          openpledge: openpledge,
          scheduled: scheduled,
        };
        var allArray = {
          name: "ALL",
          key: -1,
          total: allCampaignTotal,
          count: allLength,
        };
        this.paymentTypeChipData.unshift(allArray);
        this.paymentTypeChipData.splice(1, 0, totalArray);
        this.selectedItem = allArray;
      } else {
        var allDeviceTotal =
          this.groupRes
            .filter((s) => s.deviceId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.deviceId != null)
                .map((item) => item.raised)
                .reduce((prev, next) => prev + next);
        var allTotalLength = this.gridFilterData.length;
        var allArray = {
          name: "ALL",
          key: -1,
          total: allDeviceTotal,
          count: allTotalLength,
        };
        this.paymentTypeChipData.unshift(allArray);
        this.selectedItem = allArray;
      }
    }
    if (cardType[0].itemName == "Reason") {
      this.paymentTypeChipData = _(this.gridTotalPanelData)
        .filter((s) => s.reasonId != null && s.deviceId != null)
        .groupBy("reasonId")
        .map((objs, key) => ({
          name: objs[0].reason,
          key: key,
          count: this.GetReasonDevice(objs[0].reasonId).length,
          total:
            this.groupRes
              .filter(
                (x) => x.reasonId == objs[0].reasonId && x.deviceId != null
              )
              .map((item) => item.raised).length == 0
              ? 0
              : this.groupRes
                  .filter(
                    (x) => x.reasonId == objs[0].reasonId && x.deviceId != null
                  )
                  .map((item) => item.raised)
                  .reduce((prev, next) => prev + next),
          payment: _.sumBy(objs, "payments"),
          openpledge: _.sumBy(objs, "openPledges"),
          scheduled: _.sumBy(objs, "scheduled"),
        }))
        .value();
      this.paymentTypeChipData = this.paymentTypeChipData.filter(
        (x) => x.count > 0 && x.total > 0
      );
      if (this.paymentTypeChipData.length != 0) {
        var allTotal =
          this.groupRes
            .filter((s) => s.reasonId != null && s.deviceId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.reasonId != null && s.deviceId != null)
                .map((item) => item.raised)
                .reduce((prev, next) => prev + next);
        var allReasonTotal =
          this.groupRes
            .filter((s) => s.deviceId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.deviceId != null)
                .map((item) => item.raised)
                .reduce((prev, next) => prev + next);
        var payment =
          this.groupRes
            .filter((s) => s.reasonId != null)
            .map((item) => item.payments).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.reasonId != null)
                .map((item) => item.payments)
                .reduce((prev, next) => prev + next);
        var openpledge =
          this.groupRes
            .filter((s) => s.reasonId != null)
            .map((item) => item.openPledges).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.reasonId != null)
                .map((item) => item.openPledges)
                .reduce((prev, next) => prev + next);
        var scheduled =
          this.groupRes
            .filter((s) => s.reasonId != null)
            .map((item) => item.scheduled).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.reasonId != null)
                .map((item) => item.scheduled)
                .reduce((prev, next) => prev + next);
        var allLength = this.gridFilterData.length;
        var allCampaignLength = this.gridFilterData
          .map((obj, key) => ({
            count: obj.reasonIds.filter((x) => x != null).length,
          }))
          .filter((x) => x.count > 0).length;
        this.gridSearchFilterData = this.gridFilterData;
        this.totalRecord = allLength;
        var totalArray = {
          name: "Total Of Reasons",
          key: -2,
          total: allTotal,
          count: allCampaignLength,
          payment: payment,
          openpledge: openpledge,
          scheduled: scheduled,
        };
        var allArray = {
          name: "ALL",
          key: -1,
          total: allReasonTotal,
          count: allLength,
        };
        this.paymentTypeChipData.unshift(allArray);
        this.paymentTypeChipData.splice(1, 0, totalArray);
        this.selectedItem = allArray;
      } else {
        var allDeviceTotal =
          this.groupRes
            .filter((s) => s.deviceId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.deviceId != null)
                .map((item) => item.raised)
                .reduce((prev, next) => prev + next);
        var allTotalLength = this.gridFilterData.length;
        var allArray = {
          name: "ALL",
          key: -1,
          total: allDeviceTotal,
          count: allTotalLength,
        };
        this.paymentTypeChipData.unshift(allArray);
        this.selectedItem = allArray;
      }
    }
    if (cardType[0].itemName == "Collector") {
      this.paymentTypeChipData = _(this.gridTotalPanelData)
        .filter((s) => s.collectorId != null && s.deviceId != null)
        .groupBy("collectorId")
        .map((objs, key) => ({
          name: objs[0].collector,
          key: key,
          count: this.GetCollectorDevice(objs[0].collectorId).length,
          total:
            this.groupRes
              .filter(
                (x) =>
                  x.collectorId == objs[0].collectorId && x.collectorId != null
              )
              .map((item) => item.raised).length == 0
              ? 0
              : this.groupRes
                  .filter(
                    (x) =>
                      x.collectorId == objs[0].collectorId &&
                      x.collectorId != null
                  )
                  .map((item) => item.raised)
                  .reduce((prev, next) => prev + next),
          payment: _.sumBy(objs, "payments"),
          openpledge: _.sumBy(objs, "openPledges"),
          scheduled: _.sumBy(objs, "scheduled"),
        }))
        .value();
      this.paymentTypeChipData = this.paymentTypeChipData.filter(
        (x) => x.count > 0 && x.total > 0
      );
      if (this.paymentTypeChipData.length != 0) {
        var allTotal =
          this.groupRes
            .filter((s) => s.collectorId != null && s.deviceId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.collectorId != null && s.deviceId != null)
                .map((item) => item.raised)
                .reduce((prev, next) => prev + next);
        var allCollectorTotal =
          this.groupRes
            .filter((s) => s.deviceId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.deviceId != null)
                .map((item) => item.raised)
                .reduce((prev, next) => prev + next);
        var payment =
          this.groupRes
            .filter((s) => s.collectorId != null)
            .map((item) => item.payments).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.collectorId != null)
                .map((item) => item.payments)
                .reduce((prev, next) => prev + next);
        var openpledge =
          this.groupRes
            .filter((s) => s.collectorId != null)
            .map((item) => item.openPledges).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.collectorId != null)
                .map((item) => item.openPledges)
                .reduce((prev, next) => prev + next);
        var scheduled =
          this.groupRes
            .filter((s) => s.collectorId != null)
            .map((item) => item.scheduled).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.collectorId != null)
                .map((item) => item.scheduled)
                .reduce((prev, next) => prev + next);
        var allLength = this.gridFilterData.length;
        var allCollectorLength = this.gridFilterData
          .map((obj, key) => ({
            count: obj.collectorIds.filter((x) => x != null).length,
          }))
          .filter((x) => x.count > 0).length;
        //this.gridSumByData=this.gridFilterData;
        this.gridSearchFilterData = this.gridFilterData;
        this.totalRecord = allLength;
        var totalArray = {
          name: "Total Of Collectors",
          key: -2,
          total: allTotal,
          count: allCollectorLength,
          payment: payment,
          openpledge: openpledge,
          scheduled: scheduled,
        };
        var allArray = {
          name: "ALL",
          key: -2,
          total: allCollectorTotal,
          count: allLength,
        };
        this.paymentTypeChipData.unshift(allArray);
        this.paymentTypeChipData.splice(1, 0, totalArray);
        this.selectedItem = allArray;
      } else {
        var allDeviceTotal =
          this.groupRes
            .filter((s) => s.deviceId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.deviceId != null)
                .map((item) => item.raised)
                .reduce((prev, next) => prev + next);
        var allTotalLength = this.gridFilterData.length;
        var allArray = {
          name: "ALL",
          key: -1,
          total: allDeviceTotal,
          count: allTotalLength,
        };
        this.paymentTypeChipData.unshift(allArray);
        this.selectedItem = allArray;
      }
    }
    if (cardType[0].itemName == "Donor") {
      this.paymentTypeChipData = _(this.gridTotalPanelData)
        .filter((s) => s.accountId != null && s.deviceId != null)
        .groupBy("accountId")
        .map((objs, key) => ({
          name: objs[0].donor,
          key: key,
          count: this.GetDonorDevice(objs[0].accountId).length,
          total:
            this.groupRes
              .filter(
                (x) => x.accountId == objs[0].accountId && x.deviceId != null
              )
              .map((item) => item.raised).length == 0
              ? 0
              : this.groupRes
                  .filter(
                    (x) =>
                      x.accountId == objs[0].accountId && x.deviceId != null
                  )
                  .map((item) => item.raised)
                  .reduce((prev, next) => prev + next),
          payment: _.sumBy(objs, "payments"),
          openpledge: _.sumBy(objs, "openPledges"),
          scheduled: _.sumBy(objs, "scheduled"),
        }))
        .value();
      this.paymentTypeChipData = this.paymentTypeChipData.filter(
        (x) => x.count > 0 && x.total > 0
      );
      if (this.paymentTypeChipData.length != 0) {
        var allTotal =
          this.groupRes
            .filter((s) => s.accountId != null && s.deviceId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.accountId != null && s.deviceId != null)
                .map((item) => item.raised)
                .reduce((prev, next) => prev + next);
        var allReasonTotal =
          this.groupRes
            .filter((s) => s.deviceId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.deviceId != null)
                .map((item) => item.raised)
                .reduce((prev, next) => prev + next);
        var payment =
          this.groupRes
            .filter((s) => s.accountId != null)
            .map((item) => item.payments).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.accountId != null)
                .map((item) => item.payments)
                .reduce((prev, next) => prev + next);
        var openpledge =
          this.groupRes
            .filter((s) => s.accountId != null)
            .map((item) => item.openPledges).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.accountId != null)
                .map((item) => item.openPledges)
                .reduce((prev, next) => prev + next);
        var scheduled =
          this.groupRes
            .filter((s) => s.accountId != null)
            .map((item) => item.scheduled).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.accountId != null)
                .map((item) => item.scheduled)
                .reduce((prev, next) => prev + next);
        var allLength = this.gridFilterData.length;
        var allCampaignLength = this.gridFilterData
          .map((obj, key) => ({
            count: obj.accountIds.filter((x) => x != null).length,
          }))
          .filter((x) => x.count > 0).length;
        this.gridSearchFilterData = this.gridFilterData;
        this.totalRecord = allLength;
        var totalArray = {
          name: "Total Of Donors",
          key: -2,
          total: allTotal,
          count: allCampaignLength,
          payment: payment,
          openpledge: openpledge,
          scheduled: scheduled,
        };
        var allArray = {
          name: "ALL",
          key: -1,
          total: allReasonTotal,
          count: allLength,
        };
        this.paymentTypeChipData.unshift(allArray);
        this.paymentTypeChipData.splice(1, 0, totalArray);
        this.selectedItem = allArray;
      } else {
        var allDeviceTotal =
          this.groupRes
            .filter((s) => s.deviceId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.deviceId != null)
                .map((item) => item.raised)
                .reduce((prev, next) => prev + next);
        var allTotalLength = this.gridFilterData.length;
        var allArray = {
          name: "ALL",
          key: -1,
          total: allDeviceTotal,
          count: allTotalLength,
        };
        this.paymentTypeChipData.unshift(allArray);
        this.selectedItem = allArray;
      }
    }
    if (cardType[0].itemName == "Location") {
      this.paymentTypeChipData = _(this.gridTotalPanelData)
        .filter((s) => s.locationId != null && s.deviceId != null)
        .groupBy("locationId")
        .map((objs, key) => ({
          name: objs[0].location,
          key: key,
          count: this.GetLocationDevice(objs[0].locationId).length,
          total:
            this.groupRes
              .filter(
                (x) => x.locationId == objs[0].locationId && x.deviceId != null
              )
              .map((item) => item.raised).length == 0
              ? 0
              : this.groupRes
                  .filter(
                    (x) =>
                      x.locationId == objs[0].locationId && x.deviceId != null
                  )
                  .map((item) => item.raised)
                  .reduce((prev, next) => prev + next),
          payment: _.sumBy(objs, "payments"),
          openpledge: _.sumBy(objs, "openPledges"),
          scheduled: _.sumBy(objs, "scheduled"),
        }))
        .value();
      this.paymentTypeChipData = this.paymentTypeChipData.filter(
        (x) => x.count > 0 && x.total > 0
      );
      if (this.paymentTypeChipData.length != 0) {
        var allTotal =
          this.groupRes
            .filter((s) => s.locationId != null && s.deviceId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.locationId != null && s.deviceId != null)
                .map((item) => item.raised)
                .reduce((prev, next) => prev + next);
        var allReasonTotal =
          this.groupRes
            .filter((s) => s.deviceId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.deviceId != null)
                .map((item) => item.raised)
                .reduce((prev, next) => prev + next);
        var payment =
          this.groupRes
            .filter((s) => s.locationId != null)
            .map((item) => item.payments).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.locationId != null)
                .map((item) => item.payments)
                .reduce((prev, next) => prev + next);
        var openpledge =
          this.groupRes
            .filter((s) => s.locationId != null)
            .map((item) => item.openPledges).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.locationId != null)
                .map((item) => item.openPledges)
                .reduce((prev, next) => prev + next);
        var scheduled =
          this.groupRes
            .filter((s) => s.locationId != null)
            .map((item) => item.scheduled).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.locationId != null)
                .map((item) => item.scheduled)
                .reduce((prev, next) => prev + next);
        var allLength = this.gridFilterData.length;
        var allCampaignLength = this.gridFilterData
          .map((obj, key) => ({
            count: obj.locationIds.filter((x) => x != null).length,
          }))
          .filter((x) => x.count > 0).length;
        this.gridSearchFilterData = this.gridFilterData;
        this.totalRecord = allLength;
        var totalArray = {
          name: "Total Of Locations",
          key: -2,
          total: allTotal,
          count: allCampaignLength,
          payment: payment,
          openpledge: openpledge,
          scheduled: scheduled,
        };
        var allArray = {
          name: "ALL",
          key: -1,
          total: allReasonTotal,
          count: allLength,
        };
        this.paymentTypeChipData.unshift(allArray);
        this.paymentTypeChipData.splice(1, 0, totalArray);
        this.selectedItem = allArray;
      } else {
        var allDeviceTotal =
          this.groupRes
            .filter((s) => s.deviceId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.deviceId != null)
                .map((item) => item.raised)
                .reduce((prev, next) => prev + next);
        var allTotalLength = this.gridFilterData.length;
        var allArray = {
          name: "ALL",
          key: -1,
          total: allDeviceTotal,
          count: allTotalLength,
        };
        this.paymentTypeChipData.unshift(allArray);
        this.selectedItem = allArray;
      }
    }
    if (cardType[0].itemName == "Device") {
      this.paymentTypeChipData = _(this.gridTotalPanelData)
        .filter((s) => s.deviceId != null)
        .groupBy("deviceId")
        .map((objs, key) => ({
          name: objs[0].device,
          key: key,
          count: this.GetDevice(objs[0].deviceId).length,
          total:
            this.groupRes
              .filter(
                (x) => x.deviceId == objs[0].deviceId && x.deviceId != null
              )
              .map((item) => item.raised).length == 0
              ? 0
              : this.groupRes
                  .filter(
                    (x) => x.deviceId == objs[0].deviceId && x.deviceId != null
                  )
                  .map((item) => item.raised)
                  .reduce((prev, next) => prev + next),
          payment: _.sumBy(objs, "payments"),
          openpledge: _.sumBy(objs, "openPledges"),
          scheduled: _.sumBy(objs, "scheduled"),
        }))
        .value();
      this.paymentTypeChipData = this.paymentTypeChipData.filter(
        (x) => x.count > 0 && x.total > 0
      );
      if (this.paymentTypeChipData.length != 0) {
        var allTotal =
          this.groupRes
            .filter((s) => s.deviceId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.deviceId != null && s.deviceId != null)
                .map((item) => item.raised)
                .reduce((prev, next) => prev + next);
        var allCollectorTotal =
          this.groupRes
            .filter((s) => s.deviceId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.deviceId != null)
                .map((item) => item.raised)
                .reduce((prev, next) => prev + next);
        var payment =
          this.groupRes
            .filter((s) => s.deviceId != null)
            .map((item) => item.payments).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.deviceId != null)
                .map((item) => item.payments)
                .reduce((prev, next) => prev + next);
        var openpledge =
          this.groupRes
            .filter((s) => s.deviceId != null)
            .map((item) => item.openPledges).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.deviceId != null)
                .map((item) => item.openPledges)
                .reduce((prev, next) => prev + next);
        var scheduled =
          this.groupRes
            .filter((s) => s.deviceId != null)
            .map((item) => item.scheduled).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.deviceId != null)
                .map((item) => item.scheduled)
                .reduce((prev, next) => prev + next);
        var allLength = this.gridFilterData.length;
        this.gridFilterData = this.gridFilterData.filter(
          (s) => s.deviceId != null
        );
        var allCollectorLength = this.gridFilterData
          .map((obj, key) => ({
            count: obj.deviceIds.filter((x) => x != null).length,
          }))
          .filter((x) => x.count > 0).length;
        //this.gridSumByData=this.gridFilterData;
        this.gridSearchFilterData = this.gridFilterData;
        this.totalRecord = allLength;
        var totalArray = {
          name: "Total Of Devices",
          key: -2,
          total: allTotal,
          count: allCollectorLength,
          payment: payment,
          openpledge: openpledge,
          scheduled: scheduled,
        };
        var allArray = {
          name: "ALL",
          key: -2,
          total: allCollectorTotal,
          count: allLength,
        };
        this.paymentTypeChipData.unshift(allArray);
        this.paymentTypeChipData.splice(1, 0, totalArray);
        this.selectedItem = allArray;
      } else {
        var allDeviceTotal =
          this.groupRes
            .filter((s) => s.deviceId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.deviceId != null)
                .map((item) => item.raised)
                .reduce((prev, next) => prev + next);
        var allTotalLength = this.gridFilterData.length;
        var allArray = {
          name: "ALL",
          key: -1,
          total: allDeviceTotal,
          count: allTotalLength,
        };
        this.paymentTypeChipData.unshift(allArray);
        this.selectedItem = allArray;
      }
    }
    this.changeSortType(this.sortType);
  }

  OpenSumCard(item) {
    if (this.isSumCardOpen) {
      this.isSumCardOpen = false;
    } else {
      this.selectedItem = false;
      this.isSumCardOpen = true;
    }
  }

  changeSortType(sortType) {
    this.sortType = sortType;
    var sortId = sortType.map((s) => s.id).toString();
    var allTypeCard = this.paymentTypeChipData.filter((x) => x.name == "ALL");
    var totalTypeCard = this.paymentTypeChipData.filter((x) =>
      x.name.includes("Total")
    );
    this.paymentTypeChipData = this.paymentTypeChipData.filter(
      (x) => x.name != "ALL" && !x.name.includes("Total")
    );
    if (sortId == 1) {
      this.paymentTypeChipData = this.paymentTypeChipData.sort((a, b) =>
        a.name > b.name ? 1 : b.name > a.name ? -1 : 0
      );
      this.paymentTypeChipData.unshift(totalTypeCard[0]);
      this.paymentTypeChipData.unshift(allTypeCard[0]);
    } else if (sortId == 2) {
      this.paymentTypeChipData = this.paymentTypeChipData
        .sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0))
        .reverse();
      this.paymentTypeChipData.unshift(totalTypeCard[0]);
      this.paymentTypeChipData.unshift(allTypeCard[0]);
    } else if (sortId == 3) {
      this.paymentTypeChipData = this.paymentTypeChipData
        .sort((a, b) => (a.total > b.total ? 1 : b.total > a.total ? -1 : 0))
        .reverse();
      this.paymentTypeChipData.unshift(totalTypeCard[0]);
      this.paymentTypeChipData.unshift(allTypeCard[0]);
    } else if (sortId == 4) {
      this.paymentTypeChipData = this.paymentTypeChipData.sort((a, b) =>
        a.total > b.total ? 1 : b.total > a.total ? -1 : 0
      );
      this.paymentTypeChipData.unshift(totalTypeCard[0]);
      this.paymentTypeChipData.unshift(allTypeCard[0]);
    }
  }

  TogglePanel(isVisible) {
    this.pageSyncService.sourcelistTotalPanel = isVisible;
    if (!isVisible) {
      this.openTotalPanel();
    } else {
      this.closeTotalPanel();
    }
  }

  openTotalPanel() {
    this.isTotalPanelVisible = true;
    this.panelTitle = "HIDETOTALPANEL";

    this.colFields = this.colFields.map((o) => {
      if (o.title === "TOTALPANEL") {
        const itemChil = o.items.map((io) => {
          if (io.colName === "Payments") {
            return {
              ...io,
              isVisible: true,
            };
          }

          if (io.colName === "Open Pledges") {
            return {
              ...io,
              isVisible: true,
            };
          }

          if (io.colName === "Scheduled") {
            return {
              ...io,
              isVisible: true,
            };
          }

          if (io.colName === "Total") {
            return {
              ...io,
              isVisible: true,
            };
          }
          return io;
        });

        return {
          ...o,
          isTotalPanel: true,
          items: itemChil,
        };
      }

      return o;
    });

    this.getTotalPanel();
  }

  closeTotalPanel() {
    this.isTotalPanelVisible = false;
    this.panelTitle = "SHOWTOTALPANEL";

    this.isSourceOpenPledgesColVisible = false;
    this.isSourcePaymentsColVisible = false;
    this.isSourceRaisedColVisible = false;
    this.isSourceScheduledColVisible = false;

    this.isSourcePledgesCountColVisible = false;
    this.isSourcePaymentsCountColVisible = false;
    this.isSourceScheduledCountColVisible = false;
    this.isChipTypeSelected = false;

    this.isinitialize = 0;
    this.isTotalPanelShowAll = true;

    this.colFields = this.colFields.map((o) => {
      if (o.title === "TOTALPANEL") {
        const itemChil = o.items.map((io) => {
          return {
            ...io,
            isVisible: false,
          };
        });

        return {
          ...o,
          items: itemChil,
          isTotalPanel: false,
        };
      }
      return o;
    });
    // this.searchSourceData();
    this.gridData = this.gridShowPanelData;
    this.gridFilterData = this.gridData;
    this.totalRecord = this.gridData.length;
    if (this.objAdvancedSearch != null) {
      this.filterLocalData();
    }

    if (this.selectedDateRange && this.selectedDateRange.startDate === null) {
      this.selectedDateRange = undefined;
    }
  }

  getTableTdClassName(objHeader) {
    if (
      objHeader.colName === "Payments" ||
      objHeader.colName === "Open Pledges" ||
      objHeader.colName === "Scheduled" ||
      objHeader.colName === "Total" ||
      objHeader.colName === "Count of Payments" ||
      objHeader.colName === "Count of Pledges" ||
      objHeader.colName === "Count of Schedules"
    ) {
      return "total_panel_tbl_th";
    }
  }

  dropGroupItem(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
  }

  getConnectedList(): any[] {
    return this.colFields.map((x) => `${x.id}`);
  }

  drop(event: CdkDragDrop<string[]>) {
    //var $table = $('table.redesign_table');
    moveItemInArray(
      this.gridFilterData,
      event.previousIndex,
      event.currentIndex
    );
    //$table.floatThead('reflow');
  }
  checkColVisibility(colName) {
    let col = this.colfieldsValue.find(
      (data) => Object.keys(data)[0] == colName
    );
    return col ? col[colName] : false;
  }
  checkVisibility(colName) {
    let col = this.colfieldsValue.find(
      (data) => Object.keys(data)[0] == colName
    );
    if (col) {
      return col[colName];
    } else {
      return this.checkGridColVisibility(colName);
    }
  }
  checkGridColVisibility(colName) {
    colName = colName.toLowerCase().replace(/\s/g, "");
    switch (colName) {
      case "event":
        return this.isSourceEventColVisible;
      case "product":
        return this.isSourceProductColVisible;
      case "device":
        return this.isSourceDeviceColVisible;
      case "activationcode":
        return this.isSourceActivationCodeColVisible;
      case "macaddress":
        return this.isSourceMacAddressColVisible;
      case "plan":
        return this.isSourcePlanColVisible;
      case "status":
        return this.isSourceStatusColVisible;
      case "notes":
        return this.isSourceNotesColVisible;
      case "device#":
        return this.isSourceDeviceNumColVisible;
      case "sim#":
        return this.isSourceSimNumColVisible;
      case "collector":
        return this.isSourceCollectorColVisible;
      case "campaign":
        return this.isSourceCampaignColVisible;
      case "reason":
        return this.isSourceReasonColVisible;
      case "location":
        return this.isSourceLocationColVisible;
      case "activated":
        return this.isSourceActivatedColVisible;
      case "deactivated":
        return this.isSourceDeactivatedColVisible;
      case "lastsynced":
        return this.isSourceLastSyncedColumnVisible;
      case "organization":
        return this.isSourceOrganizationColVisible;
      case "version":
        return this.isSourceVersionColVisible;
      case "payments":
        return this.isSourcePaymentsColVisible;
      case "openpledges":
        return this.isSourceOpenPledgesColVisible;
      case "scheduled":
        return this.isSourceScheduledColVisible;
      case "total":
        return this.isSourceRaisedColVisible;
      case "countofpayments":
        return this.isSourcePaymentsCountColVisible;
      case "countofpledges":
        return this.isSourcePledgesCountColVisible;
      case "countofschedules":
        return this.isSourceScheduledCountColVisible;
      case "displayname":
        return this.isSourceDeviceOptionNameVisible;
    }
  }

  SaveLayout() {
    let setting = {
      isSourceEventColVisible: this.isSourceEventColVisible,
      isSourceProductColVisible: this.isSourceProductColVisible,
      isSourceDeviceColVisible: this.isSourceDeviceColVisible,
      isSourceActivationCodeColVisible: this.isSourceActivationCodeColVisible,
      isSourceMacAddressColVisible: this.isSourceMacAddressColVisible,
      isSourcePlanColVisible: this.isSourcePlanColVisible,
      isSourceStatusColVisible: this.isSourceStatusColVisible,
      isSourceNotesColVisible: this.isSourceNotesColVisible,
      isSourceDeviceNumColVisible: this.isSourceDeviceNumColVisible,
      isSourceSimNumColVisible: this.isSourceSimNumColVisible,
      isSourceCollectorColVisible: this.isSourceCollectorColVisible,
      isSourceCampaignColVisible: this.isSourceCampaignColVisible,
      isSourceReasonColVisible: this.isSourceReasonColVisible,
      isSourceLocationColVisible: this.isSourceLocationColVisible,
      isSourceActivatedColVisible: this.isSourceActivatedColVisible,
      isSourceDeactivatedColVisible: this.isSourceDeactivatedColVisible,
      isSourceLastSyncedColumnVisible: this.isSourceLastSyncedColumnVisible,
      isSourceOrganizationColVisible: this.isSourceOrganizationColVisible,
      isSourceVersionColVisible: this.isSourceVersionColVisible,
      isSourcePaymentsColVisible: this.isSourcePaymentsColVisible,
      isSourceOpenPledgesColVisible: this.isSourceOpenPledgesColVisible,
      isSourceScheduledColVisible: this.isSourceScheduledColVisible,
      isSourceRaisedColVisible: this.isSourceRaisedColVisible,
      isSourcePaymentsCountColVisible: this.isSourcePaymentsCountColVisible,
      isSourcePledgesCountColVisible: this.isSourcePledgesCountColVisible,
      isSourceScheduledCountColVisible: this.isSourceScheduledCountColVisible,
      sourceStartDate:
        this.selectedDateRange != undefined
          ? this.selectedDateRange.startDate
          : null,
      sourceEndDate:
        this.selectedDateRange != undefined
          ? this.selectedDateRange.endDate
          : null,
      sourceSumBy: this.cardType,
      sourceSearchitem: this.objAdvancedSearch,
      sourceIsTotalPanelVisible: this.isTotalPanelVisible,
      isSourceDeviceOptionNameVisible: this.isSourceDeviceOptionNameVisible,
      sourceCalendarPlaceHolderId: this.hebrewEngishCalendarService.id,
      EngHebCalPlaceholder: this.EngHebCalPlaceholder,
    };
    let objLayout = {
      uiPageSettingId: this.uiPageSettingId,
      userId: this.localStorageDataService.getLoginUserId(),
      moduleName: "lists",
      screenName: "sources",
      setting: JSON.stringify(setting),
    };
    this.uiPageSettingService.Save(objLayout).subscribe((res: any) => {
      if (res) {
        this.uiPageSetting = res.uiPageSetting;
        Swal.fire({
          title: "Layout Saved Successfully",
          icon: "success",
          confirmButtonText: this.commonMethodService.getTranslate(
            "WARNING_SWAL.BUTTON.CONFIRM.OK"
          ),
          customClass: {
            confirmButton: "btn_ok",
          },
        });
      }
    });
  }

  onArrowClick() {
    this.isClicked = true;
  }

  onTotalBtnClick() {
    this.isOpen = true;
  }

  onPauseClick() {
    this.isClicked = false;
    this.isOpen = false;
  }

  ClosePanel(event) {
    if (event) {
      this.isClicked = false;
      this.isOpen = false;
    }
  }

  openCollectorCardPopup(collectorId) {
    if (!collectorId) {
      return;
    }

    this.isloading = false;
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup collector_card",
    };
    const modalRef = this.commonMethodService.openPopup(
      CollectorCardPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.CollectorId = collectorId;
    var objCollectorCard = {
      eventGuId: this.localStorageDataService.getLoginUserEventGuId(),
      collectorId: collectorId,

      fromDate:
        this.selectedDateRange != undefined
          ? this.selectedDateRange.startDate != null
            ? moment(this.selectedDateRange.startDate).format("YYYY-MM-DD")
            : null
          : null,
      toDate:
        this.selectedDateRange != undefined
          ? this.selectedDateRange.endDate != null
            ? moment(this.selectedDateRange.endDate).format("YYYY-MM-DD")
            : null
          : null,
    };
    this.collectorService
      .getCollectorCard(objCollectorCard)
      .subscribe((res: any) => {
        // hide loader
        this.isloading = false;
        if (res) {
          if (
            this.selectedDateRange != undefined &&
            this.selectedDateRange.startDate != null
          ) {
            modalRef.componentInstance.selectedDateRange =
              this.selectedDateRange;
          }

          modalRef.componentInstance.CollectorCardData = res;
        }
      });
  }

  openCampaignCardPopup(campaignId) {
    if (!campaignId) {
      return;
    }

    this.isloading = false;
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup campaign_card",
    };
    const modalRef = this.commonMethodService.openPopup(
      CampaignCardPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.CampaignID = campaignId;
    var objCollectorCard = {
      eventGuId: this.localStorageDataService.getLoginUserEventGuId(),
      CampaignId: campaignId,
      fromDate:
        this.selectedDateRange != undefined
          ? this.selectedDateRange.startDate != null
            ? moment(this.selectedDateRange.startDate).format("YYYY-MM-DD")
            : null
          : null,
      toDate:
        this.selectedDateRange != undefined
          ? this.selectedDateRange.endDate != null
            ? moment(this.selectedDateRange.endDate).format("YYYY-MM-DD")
            : null
          : null,
    };
    this.campaignService
      .getCampaignCard(objCollectorCard)
      .subscribe((res: any) => {
        // hide loader
        this.isloading = false;
        if (res) {
          /*if (this.selectedDateRange != undefined && this.selectedDateRange.startDate!=null)  {
            modalRef.componentInstance.selectedDateRange = this.selectedDateRange;
          }*/
          modalRef.componentInstance.CampaignId = campaignId;
          modalRef.componentInstance.CampaignCardData = res;
        }
      });
  }

  openReasonCardPopup(reasonId) {
    this.isloading = false;
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup reason_card",
    };
    const modalRef = this.commonMethodService.openPopup(
      ReasonCardPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.ReasonId = reasonId;
    var objReasonCard = {
      eventGuId: this.localStorageDataService.getLoginUserEventGuId(),
      reasonId: reasonId,
      fromDate:
        this.selectedDateRange != undefined
          ? this.selectedDateRange.startDate != null
            ? moment(this.selectedDateRange.startDate).format("YYYY-MM-DD")
            : null
          : null,
      toDate:
        this.selectedDateRange != undefined
          ? this.selectedDateRange.endDate != null
            ? moment(this.selectedDateRange.endDate).format("YYYY-MM-DD")
            : null
          : null,
    };

    this.reasonService.getReasonCard(objReasonCard).subscribe((res: any) => {
      // hide loader
      this.isloading = false;
      if (res) {
        if (
          this.selectedDateRange != undefined &&
          this.selectedDateRange.startDate != null
        ) {
          modalRef.componentInstance.selectedDateRange = this.selectedDateRange;
        }
        modalRef.componentInstance.ReasonCardData = res;
      }
    });
  }

  openLocationCardPopup(locationId) {
    this.isloading = false;
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup location_card",
    };
    const modalRef = this.commonMethodService.openPopup(
      LocationCardPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.LocationId = locationId;
    var objCollectorCard = {
      eventGuId: this.localStorageDataService.getLoginUserEventGuId(),
      locationId: locationId,
      fromDate:
        this.selectedDateRange != undefined
          ? this.selectedDateRange.startDate != null
            ? moment(this.selectedDateRange.startDate).format("YYYY-MM-DD")
            : null
          : null,
      toDate:
        this.selectedDateRange != undefined
          ? this.selectedDateRange.endDate != null
            ? moment(this.selectedDateRange.endDate).format("YYYY-MM-DD")
            : null
          : null,
    };
    this.locationService
      .getLocationCard(objCollectorCard)
      .subscribe((res: any) => {
        this.isloading = false;
        if (res) {
          if (
            this.selectedDateRange != undefined &&
            this.selectedDateRange.startDate != null
          ) {
            modalRef.componentInstance.selectedDateRange =
              this.selectedDateRange;
          }
          modalRef.componentInstance.LocationCardData = res;
        }
      });
  }
  tempOrderDevicesStatusID: number = null;
  searchSourceData() {
    this.isloading = true;
    this.detectChanges();
    let objSearch = this.objAdvancedSearch;

    if (this.objAdvancedSearch) {
      this.filtercount = 0;
      for (let key of Object.keys(this.objAdvancedSearch)) {
        let filtervalue = this.objAdvancedSearch[key];
        if (
          filtervalue == undefined ||
          filtervalue.length == 0 ||
          filtervalue == true ||
          filtervalue == false
        ) {
        } else {
          this.filtercount += 1;
        }
      }
    }
    var objsearchSource = {
      eventGuId: this.localStorageDataService.getLoginUserEventGuId(),
      loginUserId: this.localStorageDataService.getLoginUserId(),
      deviceTypeId:
        this.objAdvancedSearch &&
        this.objAdvancedSearch.deviceTypeId &&
        this.objAdvancedSearch.deviceTypeId.length > 0
          ? parseInt(this.objAdvancedSearch.deviceTypeId.map((s) => s.id))
          : null,
      orderDevicesStatusID: null,
      deviceReportQueryInputs: {
        eventName: this.objAdvancedSearch && this.objAdvancedSearch.eventName,
        product: this.objAdvancedSearch && this.objAdvancedSearch.product,
        device: this.objAdvancedSearch && this.objAdvancedSearch.device,
        activationCode:
          this.objAdvancedSearch && this.objAdvancedSearch.activationCode,
        macAddress: this.objAdvancedSearch && this.objAdvancedSearch.macAddress,
        plan: this.objAdvancedSearch && this.objAdvancedSearch.plan,
        status: this.objAdvancedSearch && this.objAdvancedSearch.status,
        notes: this.objAdvancedSearch && this.objAdvancedSearch.notes,
        deviceNum: this.objAdvancedSearch && this.objAdvancedSearch.deviceNum,
        simNum: this.objAdvancedSearch && this.objAdvancedSearch.simNum,
        collector: this.objAdvancedSearch && this.objAdvancedSearch.collector,
        campaign: this.objAdvancedSearch && this.objAdvancedSearch.campaign,
        reason: this.objAdvancedSearch && this.objAdvancedSearch.reason,
        location: this.objAdvancedSearch && this.objAdvancedSearch.location,
      },
      listFilters: {
        donors:
          this.objAdvancedSearch &&
          this.objAdvancedSearch.donorId &&
          this.objAdvancedSearch.donorId.length > 0
            ? this.objAdvancedSearch.donorId.map((s) => s.id)
            : null,
        campaigns:
          this.objAdvancedSearch &&
          this.objAdvancedSearch.campaignId &&
          this.objAdvancedSearch.campaignId.length > 0
            ? this.objAdvancedSearch.campaignId.map((s) => s.id)
            : null,
        reasons:
          this.objAdvancedSearch &&
          this.objAdvancedSearch.reasonId &&
          this.objAdvancedSearch.reasonId.length > 0
            ? this.objAdvancedSearch.reasonId.map((s) => s.id)
            : null,
        collectors:
          this.objAdvancedSearch &&
          this.objAdvancedSearch.collectorId &&
          this.objAdvancedSearch.collectorId.length > 0
            ? this.objAdvancedSearch.collectorId.map((s) => s.id)
            : null,
        locations:
          this.objAdvancedSearch &&
          this.objAdvancedSearch.locationId &&
          this.objAdvancedSearch.locationId.length > 0
            ? this.objAdvancedSearch.locationId.map((s) => s.id)
            : null,
      },
    };

    this.sourceService.getSourceList(objsearchSource).subscribe(
      (res: any) => {
        // hide loader
        this.isFiltered = false;
        if (res) {
          this.objAdvancedSearch = objSearch;
          for (var i = 0; i < res.length; i++) {
            res[i].openPledges = 0;
            res[i].payments = 0;
            res[i].raised = 0;
            res[i].scheduled = 0;

            if (res[i].status) {
              //remove duplicate valu from linkedCampaignList
              if (
                this.deviceStatusList.find(
                  (obj) => obj.itemName === res[i].status
                ) === undefined
              ) {
                this.deviceStatusList.push({
                  id: i,
                  itemName: res[i].status,
                });
              }
            }
          }
          this.gridOrgData = res;
          this.pageSyncService.sourceList = this.gridOrgData;
          this.pageSyncService.isSourceListClicked = true;
          this.pageSyncService.lastSyncListTime = new Date();
          this.pageSyncService.calculateTimeDifference("list");
          this.resListModification(res);
        } else {
          this.totalRecord = 0;
          this.gridData = null;
          this.gridFilterData = this.gridData;
          this.pageSyncService.sourceList = [];
        }
        if (this.gridFilterData == null || this.gridFilterData.length == 0) {
          this.isDisableExcel = true;
        } else {
          this.isDisableExcel = false;
        }
        this.isloading = false;
        this.commonMethodService.sendDataLoaded("sources");
        this.detectChanges();
      },
      (error) => {
        this.isloading = false;
        console.log(error);
        // this.notificationService.showError(error.error, "Error while fetching data !!");
      }
    );
  }

  resListModification(res) {
    if (this.gridTotalPanelData && this.isTotalPanelVisible) {
      this.gridTotalPanelData = this.FilterTotalPanelData(
        this.objAdvancedSearch
      );
      if (this.isTotalPanelShowAll) {
        this.showOnlyTotalData();
        this.initMultiSelect();
        return;
      }
      this.showAllTotalData();
      this.initMultiSelect();
      return;
    }
    this.totalRecord = res.length;
    this.gridData = res;
    this.gridFilterData = this.gridData;
    this.gridShowPanelData = res;

    if (res.filter((o) => o.status === "Activated")) {
      if (
        this.objAdvancedSearch &&
        this.objAdvancedSearch.orderDevicesStatusID &&
        !this.objAdvancedSearch.orderDevicesStatusID.find((o) => o.id === 2)
      ) {
        this.objAdvancedSearch.orderDevicesStatusID.push({
          id: 2,
          itemName: "Activated",
        });
      }
    }

    if (res.filter((o) => o.status === "Auto-Active")) {
      if (
        this.objAdvancedSearch &&
        this.objAdvancedSearch.orderDevicesStatusID &&
        !this.objAdvancedSearch.orderDevicesStatusID.find((o) => o.id === 13)
      ) {
        this.objAdvancedSearch.orderDevicesStatusID.push({
          id: 13,
          itemName: "Auto-Active",
        });
      }
    }
    this.filterLocalData();
    this.gridData = this.gridFilterData;
  }

  setGridColVisibility($event, colName, isVisible) {
    var fieldsData = this.pageSyncService.sourceFieldsCol;
    var obj = fieldsData.find((data) => Object.keys(data)[0] === colName);
    obj
      ? (obj[colName] = isVisible)
      : fieldsData.push({ [colName]: isVisible });
    colName = colName.toLowerCase().replace(/\s/g, "");
    var $table = $("table.redesign_table");
    switch (colName) {
      case "organization":
        this.isSourceOrganizationColVisible = isVisible;
        this.uiPageSetting.isSourceOrganizationColVisible = isVisible;
        break;
      case "event":
        this.isSourceEventColVisible = isVisible;
        this.uiPageSetting.isSourceEventColVisible = isVisible;
        break;
      case "product":
        this.isSourceProductColVisible = isVisible;
        this.uiPageSetting.isSourceProductColVisible = isVisible;
        break;
      case "device":
        this.isSourceDeviceColVisible = isVisible;
        this.uiPageSetting.isSourceDeviceColVisible = isVisible;
        break;
      case "activationcode":
        this.isSourceActivationCodeColVisible = isVisible;
        this.uiPageSetting.isSourceActivationCodeColVisible = isVisible;
        break;
      case "macaddress":
        this.isSourceMacAddressColVisible = isVisible;
        this.uiPageSetting.isSourceMacAddressColVisible = isVisible;
        break;
      case "plan":
        this.isSourcePlanColVisible = isVisible;
        this.uiPageSetting.isSourcePlanColVisible = isVisible;
        break;
      case "status":
        this.isSourceStatusColVisible = isVisible;
        this.uiPageSetting.isSourceStatusColVisible = isVisible;
        break;
      case "notes":
        this.isSourceNotesColVisible = isVisible;
        this.uiPageSetting.isSourceNotesColVisible = isVisible;
        break;
      case "device#":
        this.isSourceDeviceNumColVisible = isVisible;
        this.uiPageSetting.isSourceDeviceNumColVisible = isVisible;
        break;
      case "sim#":
        this.isSourceSimNumColVisible = isVisible;
        this.uiPageSetting.isSourceSimNumColVisible = isVisible;
        break;
      case "collector":
        this.isSourceCollectorColVisible = isVisible;
        this.uiPageSetting.isSourceCollectorColVisible = isVisible;
        break;
      case "campaign":
        this.isSourceCampaignColVisible = isVisible;
        this.uiPageSetting.isSourceCampaignColVisible = isVisible;
        break;
      case "reason":
        this.isSourceReasonColVisible = isVisible;
        this.uiPageSetting.isSourceReasonColVisible = isVisible;
        break;
      case "location":
        this.isSourceLocationColVisible = isVisible;
        this.uiPageSetting.isSourceLocationColVisible = isVisible;
        break;
      case "activated":
        this.isSourceActivatedColVisible = isVisible;
        this.uiPageSetting.isSourceActivatedColVisible = isVisible;
        break;
      case "deactivated":
        this.isSourceDeactivatedColVisible = isVisible;
        this.uiPageSetting.isSourceDeactivatedColVisible = isVisible;
        break;
      case "lastsynced":
        this.isSourceLastSyncedColumnVisible = isVisible;
        this.uiPageSetting.isSourceLastSyncedColumnVisible = isVisible;
        break;
      case "displayname":
        this.isSourceDeviceOptionNameVisible = isVisible;
        this.uiPageSetting.isSourceDeviceOptionNameVisible = isVisible;
        break;
      case "version":
        this.isSourceVersionColVisible = isVisible;
        this.uiPageSetting.isSourceVersionColVisible = isVisible;
        break;

      // Total Panel
      case "payments":
        this.isSourcePaymentsColVisible = isVisible;
        this.uiPageSetting.isSourcePaymentsColVisible = isVisible;
        break;
      case "openpledges":
        this.isSourceOpenPledgesColVisible = isVisible;
        this.uiPageSetting.isSourceOpenPledgesColVisible = isVisible;
        break;
      case "scheduled":
        this.isSourceScheduledColVisible = isVisible;
        this.uiPageSetting.isSourceScheduledColVisible = isVisible;
        break;
      case "total":
        this.isSourceRaisedColVisible = isVisible;
        this.uiPageSetting.isSourceRaisedColVisible = isVisible;
        break;
      case "countofpayments":
        this.isSourcePaymentsCountColVisible = isVisible;
        this.uiPageSetting.isSourcePaymentsCountColVisible = isVisible;
        break;
      case "countofpledges":
        this.isSourcePledgesCountColVisible = isVisible;
        this.uiPageSetting.isSourcePledgesCountColVisible = isVisible;
        break;
      case "countofschedules":
        this.isSourceScheduledCountColVisible = isVisible;
        this.uiPageSetting.isSourceScheduledCountColVisible = isVisible;
        break;
    }

    $event.stopPropagation();
  }

  openSearchFilterPopup() {
    this.isloading = false;
    this.modalOptions = {
      centered: true,
      size: "lg",
      //backdrop : 'static',
      keyboard: true,
      windowClass: "device_filter",
    };
    const modalRef = this.commonMethodService.openPopup(
      SourceFilterComponent,
      this.modalOptions
    );
    //this.objAdvancedSearch.deviceStatusList = this.deviceStatusList;
    modalRef.componentInstance.AdvancedFilterData = this.objAdvancedSearch;
    modalRef.componentInstance.isTotalPanelOpen = this.isTotalPanelVisible;
    modalRef.componentInstance.emtOutputSourceFilterData.subscribe(
      (objResponse) => {
        this.advancedFilterData(objResponse);
      }
    );
  }
  advancedFilterData(objResponse) {
    if (objResponse.orderDevicesStatusID.length) {
      this.tempOrderDevicesStatusID = objResponse.orderDevicesStatusID[0].id;
    } else {
      this.tempOrderDevicesStatusID = null;
    }
    this.objAdvancedSearch = objResponse;

    if (this.isTotalPanelVisible) {
      this.gridTotalPanelData = this.FilterTotalPanelData(
        this.objAdvancedSearch
      );
      this.showOnlyTotalData();
      // this.searchSourceData();
    } else {
      this.gridData = this.gridOrgData;
      this.filterLocalData();
    }
    this.changeDetectorRef.markForCheck();
  }
  search(keyword) {
    if (keyword == "") {
      this.filterLocalData();
    }
    if (this.isTotalPanelVisible) {
      if (this.isChipTypeSelected) {
        var record = this.gridSelectedData;
        this.gridData = this.gridSelectedData;
        this.totalRecord = this.gridSelectedData.length;
      } else {
        var record = this.gridSearchFilterData;
        this.totalRecord = this.gridSearchFilterData.length;
      }
    } else {
      var record = this.gridData;
      this.totalRecord = this.gridData.length;
    }
    var filterdRecord;
    this.isFiltered = false;
    keyword = keyword.toLowerCase().replace(/[().-]/g, "");
    if (keyword != "") {
      var searchArray = keyword.split(" ");
      for (var searchValue of searchArray) {
        filterdRecord = record.filter(
          (obj) =>
            (obj.eventName &&
              obj.eventName.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.productName &&
              obj.productName.toLowerCase().toString().indexOf(searchValue) >
                -1) ||
            (obj.deviceName &&
              obj.deviceName.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.activationCode &&
              obj.activationCode.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.macAddress &&
              obj.macAddress.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.plan &&
              obj.plan.toString().toLowerCase().indexOf(searchValue) > -1) ||
            (obj.status &&
              obj.status.toString().toLowerCase().indexOf(searchValue) > -1) ||
            (obj.notes &&
              obj.notes.toString().toLowerCase().indexOf(searchValue) > -1) ||
            (obj.deviceNum &&
              obj.deviceNum.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.simNum &&
              obj.simNum.toString().toLowerCase().indexOf(searchValue) > -1) ||
            (obj.collectorName &&
              obj.collectorName.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.campaignName &&
              obj.campaignName.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.reasonName &&
              obj.reasonName.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.locationName &&
              obj.locationName.toString().toLowerCase().indexOf(searchValue) >
                -1)
        );
        this.gridFilterData = filterdRecord;
        this.filterRecord = filterdRecord.length;
        this.isFiltered = true;
        record = this.gridFilterData;
      }
    } else {
      if (this.isChipTypeSelected) {
        this.gridFilterData = this.gridSelectedData;
        this.totalRecord = this.gridSelectedData.length;
      } else if (this.isTotalPanelVisible) {
        this.gridFilterData = this.tempSearch;
        this.totalRecord = this.tempSearch.length;
      } else {
        this.filterLocalData();
        //this.gridFilterData = this.gridData;
        this.totalRecord = this.gridFilterData.length;
      }
    }
  }

  public downloadExcel() {
    let results = this.gridFilterData.length && this.gridFilterData;
    this.isdownloadExcelGuid =
      this.commonMethodService.idDownloadExcelEventGuid();
    let data = [];
    if (results) {
      Object.values(results).forEach((item: any) => {
        let EventName = item && item.eventName;
        let ProductName = item && item.productName;
        let DeviceName = item && item.deviceName;
        let ActivationCode = item && item.activationCode;
        let MacAddress = item && item.macAddress;
        let Plan = item && item.plan;
        let Status = item && item.status;
        let Notes = item && item.notes;
        let DeviceNum = item && item.deviceNum;
        let SimNum = item && item.simNum;
        let Collector = item && item.collectorName;
        let CampaignName = item && item.campaignName;
        let Reason = item && item.reasonName;
        let Location = item && item.locationName;
        let activatedOn = item && item.activatedOn;
        let deactivatedOn = item && item.deactivatedOn;
        let organization = item && item.organizationName;
        let lastSynced = item && item.lastSynced;
        let versionNum = item && item.versionNum;
        let deviceOptionName = item && item.deviceOptionName;

        let row = {};
        if (this.isSourceEventColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("EVENT")
            : "Event";
          row[ColName] = EventName;
        }
        if (this.isSourceProductColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("PRODUCT")
            : "Product";
          row[ColName] = ProductName;
        }
        if (this.isSourceDeviceColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("DEVICE")
            : "Device";
          row[ColName] = DeviceName;
        }
        if (this.isSourceActivationCodeColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("ACTIVATIONCODE")
            : "Activation Code";
          row[ColName] = ActivationCode;
        }
        if (this.isSourceMacAddressColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("MACADDRESS")
            : "Mac Address";
          row[ColName] = MacAddress;
        }
        if (this.isSourcePlanColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("PLAN")
            : "Plan";
          row[ColName] = Plan;
        }
        if (this.isSourceStatusColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("STATUS")
            : "Status";
          row[ColName] = Status;
        }
        if (this.isSourceStatusColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("NOTES")
            : "Notes";
          row[ColName] = Notes;
        }
        if (this.isSourceStatusColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("DEVICE#")
            : "Device #";
          row[ColName] = DeviceNum;
        }
        if (this.isSourceStatusColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("SIM#")
            : "Sim #";
          row[ColName] = SimNum;
        }
        if (this.isSourceStatusColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("COLLECTOR")
            : "Collector";
          row[ColName] = Collector;
        }
        if (this.isSourceStatusColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("CAMPAIGN")
            : "Campaign";
          row[ColName] = CampaignName;
        }
        if (this.isSourceStatusColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("REASON")
            : "Reason";
          row[ColName] = Reason;
        }

        if (this.isSourceStatusColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("LOCATION")
            : "Location";
          row[ColName] = Location;
        }

        if (this.isSourceActivatedColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("ACTIVATED")
            : "Activated";
          row[ColName] = activatedOn ? this.transformDate(activatedOn) : null;
        }

        if (this.isSourceDeactivatedColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("DEACTIVATED")
            : "Deactivated";
          row[ColName] = deactivatedOn
            ? this.transformDate(deactivatedOn)
            : null;
        }

        if (this.isSourceOrganizationColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("ORGANIZATION")
            : "Organization";
          row[ColName] = organization;
        }

        if (this.isSourceVersionColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("VERSION")
            : "Version";
          row[ColName] = versionNum;
        }

        // Total Panel
        if (this.isTotalPanelVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("PAYMENTS")
            : "Payments";
          row[ColName] = Number(item.payments);
        }
        if (this.isSourcePaymentsCountColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("COUNTOFPAYMENTS")
            : "Count Of Payments";
          row[ColName] = item.paymentsCount;
        }

        if (this.isSourceOpenPledgesColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("OPENPLEDGES")
            : "Open Pledges";
          row[ColName] = Number(item.openPledges);
        }
        if (this.isSourcePledgesCountColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("COUNTOFPLEDGES")
            : "Count Of Pledges";
          row[ColName] = item.pledgesCount;
        }
        if (this.isSourceScheduledColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("SCHEDULED")
            : "Scheduled";
          row[ColName] = Number(item.scheduled);
        }
        if (this.isSourceScheduledCountColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("COUNTOFSCHEDULES")
            : "Count Of Schedules";
          row[ColName] = item.schedulesCount;
        }
        if (this.isSourceRaisedColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("TOTAL")
            : "Total";
          row[ColName] = Number(item.raised);
        }
        if (this.isSourceLastSyncedColumnVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("LASTSYNCED")
            : "LastSynced";
          row[ColName] = lastSynced ? this.transformDate(lastSynced) : null;
        }
        if (this.isSourceDeviceOptionNameVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("DISPLAYNAME")
            : "Display Name";
          row[ColName] = item.deviceOptionName;
        }
        data.push(row);
      });
    } else {
      return;
    }

    const filename = this.xlsxService.getFilename("Sources List");

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data, {
      cellStyles: true,
    });
    if (this.isTotalPanelVisible) {
      var range = XLSX.utils.decode_range(worksheet["!ref"]);
      // Find Payment, Pledge, Schedule, And Total
      let paymentColumn = null;
      let pledgeColumn = null;
      let scheduleColumn = null;
      let totalColumn = null;
      for (var R = range.s.r; R < 1; ++R) {
        for (var C = range.s.c; C <= range.e.c; ++C) {
          var cell_address = { c: C, r: R };

          var cell_ref = XLSX.utils.encode_cell(cell_address);
          if (!worksheet[cell_ref]) continue;
          if (worksheet[cell_ref].v == "Payments") {
            paymentColumn = C;
          }

          if (worksheet[cell_ref].v == "Open Pledges") {
            pledgeColumn = C;
          }

          if (worksheet[cell_ref].v == "Scheduled") {
            scheduleColumn = C;
          }

          if (worksheet[cell_ref].v == "Total") {
            totalColumn = C;
          }
        }
      }

      let fmt = "$#,##0.00";
      for (var R = range.s.r; R <= range.e.r; ++R) {
        if (R == 0) continue;
        if (!!paymentColumn) {
          let payment_cell_address = { c: paymentColumn, r: R };
          let payment_cell_ref = XLSX.utils.encode_cell(payment_cell_address);
          if (worksheet[payment_cell_ref]) {
            worksheet[payment_cell_ref].t = "n";
            worksheet[payment_cell_ref].z = fmt;
          }
        }

        if (!!pledgeColumn) {
          let pledge_cell_address = { c: pledgeColumn, r: R };
          let pledge_cell_ref = XLSX.utils.encode_cell(pledge_cell_address);
          if (worksheet[pledge_cell_ref]) {
            worksheet[pledge_cell_ref].t = "n";
            worksheet[pledge_cell_ref].z = fmt;
          }
        }

        if (!!scheduleColumn) {
          let schedule_cell_address = { c: scheduleColumn, r: R };
          let schedule_cell_ref = XLSX.utils.encode_cell(schedule_cell_address);
          if (worksheet[schedule_cell_ref]) {
            worksheet[schedule_cell_ref].t = "n";
            worksheet[schedule_cell_ref].z = fmt;
          }
        }

        if (!!totalColumn) {
          let total_cell_address = { c: totalColumn, r: R };
          let total_cell_ref = XLSX.utils.encode_cell(total_cell_address);
          if (worksheet[total_cell_ref]) {
            worksheet[total_cell_ref].t = "n";
            worksheet[total_cell_ref].z = fmt;
          }
        }
      }
    }

    const workbook: XLSX.WorkBook = {
      Sheets: { data: worksheet },
      SheetNames: ["data"],
    };

    const excelBuffer: any = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
      cellStyles: true,
    });

    const excelData: Blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });
    FileSaver.saveAs(excelData, filename);
  }

  openDeviceCardPopup(deviceId, item) {
    this.isloading = false;
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup device_card",
    };
    const modalRef = this.commonMethodService.openPopup(
      DeviceCardPopupComponent,
      this.modalOptions
    );
    let obj = {
      deviceOptionPIN: item.deviceOptionPIN,
      optionID: item.optionId,
      deviceId: item.deviceId,
      deviceName: item.deviceName,
      campaignId: item.campaignId,
      campaignName: item.campaignName,
      reasonId: item.reasonId,
      reasonName: item.reasonName,
      locationId: item.locationId,
      locationName: item.locationName,
      collectorId: item.collectorId,
      collectorName: item.collectorName,
      transDate: item.transDate,
    };
    modalRef.componentInstance.sourceobj = obj;
    var objDeviceCard = {
      eventGuId: this.localStorageDataService.getLoginUserEventGuId(),
      deviceId: deviceId,
      fromDate:
        this.selectedDateRange != undefined
          ? this.selectedDateRange.startDate != null
            ? moment(this.selectedDateRange.startDate).format("YYYY-MM-DD")
            : null
          : null,
      toDate:
        this.selectedDateRange != undefined
          ? this.selectedDateRange.endDate != null
            ? moment(this.selectedDateRange.endDate).format("YYYY-MM-DD")
            : null
          : null,
      listFilters: {
        donors:
          this.objAdvancedSearch && this.objAdvancedSearch.donorId
            ? this.objAdvancedSearch.donorId.map((x) => x.id)
            : null,
        campaigns:
          this.objAdvancedSearch && this.objAdvancedSearch.campaignId
            ? this.objAdvancedSearch.campaignId.map((s) => s.id)
            : null,
        locations:
          this.objAdvancedSearch && this.objAdvancedSearch.locationId
            ? this.objAdvancedSearch.locationId.map((s) => s.id)
            : null,
        collectors:
          this.objAdvancedSearch && this.objAdvancedSearch.collectorId
            ? this.objAdvancedSearch.collectorId.map((s) => s.id)
            : null,
        reasons:
          this.objAdvancedSearch && this.objAdvancedSearch.reasonId
            ? this.objAdvancedSearch.reasonId.map((s) => s.id)
            : null,
      },
    };
    this.deviceService.getDeviceCard(objDeviceCard).subscribe((res: any) => {
      this.isloading = false;
      if (res) {
        if (
          this.selectedDateRange != undefined &&
          this.selectedDateRange.startDate != null
        ) {
          modalRef.componentInstance.selectedDateRange = this.selectedDateRange;
        }
        modalRef.componentInstance.DeviceCardData = res;
        modalRef.componentInstance.objAdvanceSearch = this.objAdvancedSearch;
      }
    });

    modalRef.componentInstance.emtDeviceCardData.subscribe((objResponse) => {
      this.ngOnInit();
    });
    modalRef.componentInstance.recallSourceListValues.subscribe((val) => {
      this.isAllChecked = false;
      this.recordSelectedArray = [];
      this.searchSourceData();
    });
  }

  emtOutputPageChange(data) {
    this.svTable.setPage(data.activePage, data.rowsOnPage);
  }

  FilterTotalPanelData(objAdSearch) {
    var filteredTotalPanel = this.gridOrgTotalPanelData;
    if (objAdSearch) {
      if (this.objAdvancedSearch.donorId.length > 0) {
        filteredTotalPanel = filteredTotalPanel.filter((f) =>
          this.objAdvancedSearch.donorId.map((x) => x.id).includes(f.accountId)
        );
      }
      if (this.objAdvancedSearch.campaignId.length > 0) {
        filteredTotalPanel = filteredTotalPanel.filter((f) =>
          this.objAdvancedSearch.campaignId
            .map((x) => x.id)
            .includes(f.campaignId)
        );
      }
      if (this.objAdvancedSearch.locationId.length > 0) {
        filteredTotalPanel = filteredTotalPanel.filter((f) =>
          this.objAdvancedSearch.locationId
            .map((x) => x.id)
            .includes(f.locationId)
        );
      }
      if (this.objAdvancedSearch.collectorId.length > 0) {
        filteredTotalPanel = filteredTotalPanel.filter((f) =>
          this.objAdvancedSearch.collectorId
            .map((x) => x.id)
            .includes(f.collectorId)
        );
      }
      if (this.objAdvancedSearch.reasonId.length > 0) {
        filteredTotalPanel = filteredTotalPanel.filter((f) =>
          this.objAdvancedSearch.reasonId.map((x) => x.id).includes(f.reasonId)
        );
      }
    }
    return filteredTotalPanel;
  }

  isContain(val: string, search: string) {
    if (!search) {
      return true;
    }
    return (
      val &&
      val.toString().toLowerCase().indexOf(search.toString().toLowerCase()) > -1
    );
  }

  filterLocalData() {
    this.gridFilterData = this.gridData.filter((o) => {
      if (!this.objAdvancedSearch) {
        return true;
      }

      return this.inAllFields(o);
    });
    this.gridData = this.gridFilterData;
    this.totalRecord = this.gridFilterData.length;
    this.gridShowPanelData = this.gridFilterData;
  }

  inAllFields(o) {
    return (
      this.isContain(o.activationCode, this.objAdvancedSearch.activationCode) &&
      this.isContain(o.campaignName, this.objAdvancedSearch.campaign) &&
      this.isContain(o.collectorName, this.objAdvancedSearch.collector) &&
      this.isContain(o.deviceName, this.objAdvancedSearch.device) &&
      this.isContain(o.deviceNum, this.objAdvancedSearch.deviceNum) &&
      this.isContain(o.eventName, this.objAdvancedSearch.eventName) &&
      this.isContain(o.locationName, this.objAdvancedSearch.location) &&
      this.isContain(o.macAddress, this.objAdvancedSearch.macAddress) &&
      this.isContain(o.notes, this.objAdvancedSearch.notes) &&
      this.isContain(o.plan, this.objAdvancedSearch.plan) &&
      this.isContain(o.reasonName, this.objAdvancedSearch.reason) &&
      this.isContain(o.simNum, this.objAdvancedSearch.simNum) &&
      this.filterTypeIds(o) &&
      this.filterDeviceStatusID(o)
    );
  }

  filterTypeIds(o) {
    if (
      !this.objAdvancedSearch.deviceTypeId ||
      this.objAdvancedSearch.deviceTypeId.length === 0
    ) {
      return true;
    }

    if (!o.productName) {
      return false;
    }
    const result = this.objAdvancedSearch.deviceTypeId.find(
      (t) => t.itemName == o.productName
    );
    if (result) {
      return true;
    }
  }

  filterDeviceStatusID(o) {
    if (
      !this.objAdvancedSearch.orderDevicesStatusID ||
      this.objAdvancedSearch.orderDevicesStatusID.length === 0
    ) {
      return true;
    }

    if (!o.status) {
      return false;
    }
    const result = this.objAdvancedSearch.orderDevicesStatusID.find(
      (t) =>
        t.itemName.toLowerCase().replace(" ", "") ===
        o.status.toLowerCase().replace(" ", "")
    );
    if (result) {
      return true;
    }

    return false;
  }
  openActionSourcePopup() {
    this.isloading = false;
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass:
        "drag_popup collector_card source_campaign edit-source-card-pin",
    };
    const modalRef = this.commonMethodService.openPopup(
      BulkSourcePopupComponent,
      this.modalOptions
    );
    const sourceData = this.gridFilterData.filter((x) => {
      if (this.recordSelectedArray.includes(x.deviceId)) {
        return x;
      }
    });
    modalRef.componentInstance.SourceData = sourceData;
    modalRef.componentInstance.recallSourceList.subscribe((val) => {
      if (val) this.isAllChecked = false;
      this.recordSelectedArray = [];

      this.searchSourceData();
    });
  }
  checkselectRecord(accountId): Boolean {
    if (
      !this.displayThisPageArray.includes(accountId) &&
      this.isSelectPopupShow
    ) {
      this.displayThisPageArray.push(accountId);
    }
    return this.recordSelectedArray.includes(accountId);
  }
  selectRecord(event, type, deviceId) {
    if (type == "selectAll") {
      if (event.target.checked) {
        this.isBulkCheckbox = true;
        this.isAllChecked = true;
        this.isSelected = true;
        this.recordSelectedArray = [];
        this.gridFilterData.forEach((element) => {
          let restrictedProduct = this.resctictEditOnDevices.includes(
            element.productName && element.productName.toLowerCase()
          );
          if (
            !restrictedProduct &&
            element.status != "De-Activated" &&
            element.deviceId
          )
            this.recordSelectedArray.push(element.deviceId);
        });
        let count = $("#sourcesList tr").length;
        this.displayThisPageCount =
          this.gridFilterData && this.gridFilterData.length > 0 ? count - 1 : 0;
      } else {
        this.isAllChecked = false;

        this.isSelected = false;
        this.checkboxes.forEach((element) => {
          element.nativeElement.checked = false;
        });
        this.recordSelectedArray = [];
        this.isSelected = false;
      }
    } else {
      if (event.target.checked) {
        if (!this.recordSelectedArray.includes(deviceId)) {
          this.recordSelectedArray.push(deviceId);
        }
        if (this.recordSelectedArray.length > 1) {
          this.isSelected = true;
        }
      } else {
        if (this.recordSelectedArray.includes(deviceId)) {
          this.recordSelectedArray.forEach((element, index) => {
            if (element == deviceId) this.recordSelectedArray.splice(index, 1);
          });
          if (this.recordSelectedArray.length <= 1) {
            this.isSelected = false;
          }
          $("#select_all").prop("checked", false);
        }
      }
    }
  }

  openHebrewCalendarPopup() {
    this.commonMethodService.featureName = null;
    this.commonMethodService.openCalendarPopup(
      this.class_id,
      this.class_hid,
      this.selectedDateRange,
      false,
      "sourceDynamicsCalender"
    );
    this.calendarSubscription = this.commonMethodService
      .getCalendarArray()
      .subscribe((items) => {
        if (
          items &&
          items.pageName == "SourceList" &&
          this.commonMethodService.isCalendarClicked == true
        ) {
          this.commonMethodService.isCalendarClicked = false;
          this.calendarSubscription.unsubscribe();
          if (this.popContent) {
            this.popContent.close();
          }
          this.selectedDateRange = items.obj;
          this.pageSyncService.SourceCalDate = items.obj;
          this.EngHebCalPlaceholder =
            this.hebrewEngishCalendarService.EngHebCalPlaceholder;
          this.pageSyncService.SourceEngCalPlaceholder =
            this.EngHebCalPlaceholder;
          if (
            this.pageSyncService.uiPageSettings["sourceList"] != undefined &&
            this.pageSyncService.uiPageSettings["sourceList"]
              .sourceCalendarPlaceHolderId != undefined
          ) {
            this.pageSyncService.uiPageSettings[
              "sourceList"
            ].sourceCalendarPlaceHolderId = this.hebrewEngishCalendarService.id;
          }
          this.isDateApply = true;
          this.getTotalPanel();
        }
      });
  }

  getFeatureSettingValues() {
    this.commonMethodService.featureName = "Open_a_source_card";
    this.commonMethodService.getFeatureSettingValues();
  }
  onClickedOutsidePopover(p1: any) {
    if (!(event.target as HTMLElement).closest(".popover")) {
      p1.close();
    } else {
    }
  }

  selectPopupClose() {
    this.isSelectPopupShow = false;
  }

  selectThisPage(event) {
    this.isBulkCheckbox = true;
    if (!event.target.checked) {
      this.checkboxes.forEach((element) => {
        element.nativeElement.checked = false;
      });
    }
    this.isSelected = true;
    this.recordSelectedArray = this.displayThisPageArray;
  }

  selectPopupOpen(event) {
    if (event.target.checked) {
      this.displayThisPageArray = [];
      this.isSelectPopupShow = true;
      event.target.checked = false;
      this.isBulkCheckbox = false;
      let count = $("#sourcesList tr").length;
      this.displayThisPageCount =
        this.gridFilterData && this.gridFilterData.length > 0 ? count - 1 : 0;
      return;
    }
    this.isSelected = false;
    this.isSelectPopupShow = false;
    this.recordSelectedArray = [];
  }
}
