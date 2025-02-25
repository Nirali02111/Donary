import {
  CdkDragDrop,
  CdkDropList,
  moveItemInArray,
} from "@angular/cdk/drag-drop";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  inject,
  OnInit,
  Output,
  QueryList,
  ViewChild,
  ViewChildren,
} from "@angular/core";
import { NgbModalOptions, NgbPopover } from "@ng-bootstrap/ng-bootstrap";
import * as FileSaver from "file-saver";
import * as moment from "moment";

import * as _ from "lodash";
import { DaterangepickerDirective } from "ngx-daterangepicker-material";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { NotificationService } from "src/app/commons/notification.service";
import { CardService } from "src/app/services/card.service";
import * as XLSX from "xlsx";
import { DonorCardPopupComponent } from "../../cards/donor-card-popup/donor-card-popup.component";
import { AddTransactionPopupComponent } from "../../make-transaction/add-transaction-popup/add-transaction-popup.component";
import { DonorService } from "./../../../services/donor.service";
import { DonorEmailComponent } from "./../donor-email/donor-email.component";
import { DonorFilterPopupComponent } from "./../donor-filter-popup/donor-filter-popup.component";
import { DonorPhoneComponent } from "./../donor-phone/donor-phone.component";
import { DonorSaveComponent } from "./../donor-save/donor-save.component";
import { TotalPanelService } from "src/app/services/totalpanel.service";
import { AdvancedFieldService } from "src/app/services/advancedfield.service";

import { DonorMergeComponent } from "../donor-merge/donor-merge.component";

import { BulkCustomReportComponent } from "../bulk-custom-report/bulk-custom-report.component";
import { BulkStatementPopupComponent } from "../bulk-statement-popup/bulk-statement-popup.component";
import { TagService } from "src/app/services/tag.service";
import { DonorAddtagPopupComponent } from "../donor-addtag-popup/donor-addtag-popup.component";
import Swal from "sweetalert2";

import { TranslateService } from "@ngx-translate/core";
import { PrintableReportService } from "src/app/services/printable-report.service";
import { UIPageSettingService } from "src/app/services/uipagesetting.service";
import { CommonHebrewEnglishCalendarComponent } from "../../transaction/pledge-transaction/hebrewCalendar/common-hebrew-english-calendar/common-hebrew-english-calendar.component";
import { HebrewEngishCalendarService } from "src/app/services/hebrew-engish-calendar.service";
import { CommonAPIMethodService } from "src/app/services/common-api-method.service";
import { PageSyncService } from "src/app/commons/pagesync.service";

import { environment } from "./../../../../environments/environment";
import { ImportTokenComponent } from "../import-token/import-token.component";
import { Subscription } from "rxjs";
import { DataTable } from "src/app/commons/modules/data-table/DataTable";
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
  selector: "app-donor-list",
  templateUrl: "./donor-list.component.html",
  standalone:false,
  styleUrls: ["./donor-list.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DonorListComponent implements OnInit {
  settingFnc = false;
  isLoading = false;
  @ViewChild(DaterangepickerDirective, { static: false })
  pickerDirective: DaterangepickerDirective;
  selectedDateRange: any;

  @ViewChild("sv", { static: true }) svTable: DataTable;
  @ViewChild(NgbPopover, { static: false }) popContent: NgbPopover;
  @ViewChild("myReportTable", { static: true }) table: DataTable;
  @ViewChildren("checkboxes") checkboxes: QueryList<ElementRef>;
  @Output() emtOutputDonarDataLoaded: EventEmitter<any> = new EventEmitter();

  objAdvancedSearch: any = {
    AdvancedFields: [],
  };
  objDonorSave: any;
  popTitle: any;
  isloading: boolean;
  gridData: Array<any>;
  gridFilterData: Array<any>;
  gridSearchFilterData: Array<any>;
  gridOrgData: Array<any>;
  gridSelectedData: Array<any>;
  isProdEnv: boolean;
  PageName: any = "DonorList";
  recordSelectedArray = [];
  gridSumByData: Array<any>;
  gridTotalPanelData: Array<any>;
  isOneDate: any = false;
  paymentTypeChipData: Array<any>;
  modalOptions: NgbModalOptions;
  totalRecord: number = 0;
  filterRecord: number = 0;
  isFiltered: boolean = false;
  filtercount: number = 1;
  isClicked: Boolean = false;
  isOpen: Boolean = false;
  isinitialize = 0;
  isSelected = false;
  isCustomReport = false;
  gridOrgTotalPanelData: Array<any>;
  orgTotalPanelData: Array<any>; //Total panel filter
  newDonorTagList: Array<any> = [];
  getAdvanceFieldList: any = [];
  isFilterOpen: boolean = false;
  isSumCardOpen: boolean = false;
  showSortArrow: boolean = false;
  paymentActionVisible: boolean = false;
  donorIds = [];

  // Extend Total Panel Option
  cardFilter = [];
  sortFilter = [];
  cardType: any = [{ id: 1, itemName: "Campaign" }];
  sortType: any = [{ id: 1, itemName: "A-Z" }];
  strSort: string = null;
  isTotalPanelVisible: Boolean = false;
  isTotalPanelShowAll: Boolean = true;
  isChipTypeSelected: Boolean = false;
  showTotalPanelPermission: boolean = this.localstoragedataService
    .getPermissionLst()
    .filter((x) => x.permissionName == "Show Total Panel Donors")
    .map((x) => x.isActive)[0];
  uiPageSettingId = null;
  uiPageSetting: any;
  isDonorAccountNoColVisible: boolean = true;
  isDonorFullNameColVisible: boolean = true;
  isDonorFullNameEnglishColVisible: boolean = false;
  isDonorFullNameJewishColVisible: boolean = false;
  isDonorAddressColVisible: boolean = true;
  isDonorPhoneLabelColVisible: boolean = true;
  isDonorFamilyColVisible: boolean = true;
  isDonorEmailColVisible: boolean = true;

  isDonorGroupColVisible: boolean = false;
  isDonorClassColVisible: boolean = false;
  isDonorCityStateZipColVisible: boolean = false;
  isDonorNoteColVisible: boolean = false;
  isDonorFatherColVisible: boolean = false;
  isDonorFatherInLawColVisible: boolean = false;
  isDonorTagColVisible: boolean = false;
  selectedItem: any;

  // TotalPanelcheck

  // TotalPanelcheck
  isDonorPaymentsColVisible: boolean = false;
  isDonorOpenPledgesColVisible: boolean = false;
  isDonorRaisedColVisible: boolean = false;
  isDonorScheduledColVisible: boolean = false;
  isDonorOpenPledgesCountColVisible: boolean = false;
  isDonorPaymentsCountColVisible: boolean = false;
  isDonorScheduledCountColVisible: boolean = false;
  panelTitle: string = "SHOWTOTALPANEL";
  isDonorTitleColVisible: boolean = false;
  isDonorFirstNameColVisible: boolean = false;
  isDonorLastNameColVisible: boolean = false;
  isDonorTitleJewishColVisible: boolean = false;
  isDonorFirstNameJewishColVisible: boolean = false;
  isDonorLastNameJewishColVisible: boolean = false;
  isDonorSuffixJewishColVisible: boolean = false;
  changeText = "";
  idList = [];
  isImportTokenSelected: boolean = false;
  fileName: string = "";
  colFields: any[] = [
    {
      id: 1,
      //title: '',
      isTotalPanel: true,
      items: [
        {
          colName: "ACCT#",
          isVisible: true,
          colId: "DonoraccountId",
          sortOrder: "",
          sortName: "accountNum",
        },
        {
          colName: "FULLNAME",
          isVisible: true,
          colId: "DonorfullnameId",
          sortOrder: "",
          sortName: "fullName",
        },
        {
          colName: "YIDDISHNAME",
          isVisible: false,
          colId: "DonorfullnamejewishId",
          sortOrder: "",
          sortName: "fullNameJewish",
        },
        {
          colName: "ENGLISHNAME",
          isVisible: false,
          colId: "DonorfullnameengId",
          sortOrder: "",
          sortName: "fullNameEng",
        },
        {
          colName: "FAMILY",
          isVisible: true,
          colId: "DonorfamilyId",
          sortOrder: "",
          sortName: "family",
        },
        {
          colName: "PHONE",
          isVisible: true,
          colId: "DonorphonelabelId",
          sortOrder: "",
          sortName: "phoneLabels",
        },
        {
          colName: "ADDRESS",
          isVisible: true,
          colId: "DonoraddressId",
          sortOrder: "",
          sortName: "address",
        },
        {
          colName: "EMAIL",
          isVisible: true,
          colId: "DonoremailId",
          sortOrder: "",
          sortName: "emailLabels",
        },
        {
          colName: "CITYSTATEZIP",
          isVisible: false,
          colId: "DonorcitystatezipId",
          sortOrder: "",
          sortName: "cityStateZip",
        },
        {
          colName: "NOTE",
          isVisible: false,
          colId: "DonornoteId",
          sortOrder: "",
          sortName: "note",
        },
        {
          colName: "FATHER",
          isVisible: false,
          colId: "DonorfatherId",
          sortOrder: "",
          sortName: "father",
        },
        {
          colName: "FATHERINLAW",
          isVisible: false,
          colId: "DonorfatherinlawId",
          sortOrder: "",
          sortName: "fatherInLaw",
        },
        {
          colName: "TAGS",
          isVisible: false,
          colId: "DonortagId",
          sortOrder: "",
          sortName: "tagNames",
        },
        // addd new
        {
          colName: "ENGLISHTITLE",
          isVisible: false,
          colId: "DonortitleId",
          sortOrder: "",
          sortName: "title",
        },
        {
          colName: "ENGLISHFIRSTNAME",
          isVisible: false,
          colId: "DonorfirstNameId",
          sortOrder: "",
          sortName: "firstName",
        },
        {
          colName: "ENGLISHLASTNAME",
          isVisible: false,
          colId: "DonorlastNameId",
          sortOrder: "",
          sortName: "lastName",
        },
        {
          colName: "YIDDISHFIRSTTITLE",
          isVisible: false,
          colId: "DonortitleJewishId",
          sortOrder: "",
          sortName: "titleJewish",
        },
        {
          colName: "YIDDISHFIRSTNAME",
          isVisible: false,
          colId: "DonorfirstNameJewishId",
          sortOrder: "",
          sortName: "firstNameJewish",
        },
        {
          colName: "YIDDISHLASTNAME",
          isVisible: false,
          colId: "DonorlastNameJewishId",
          sortOrder: "",
          sortName: "lastNameJewish",
        },
        {
          colName: "YIDDISHLASTTITLE",
          isVisible: false,
          colId: "DonorsuffixJewishId",
          sortOrder: "",
          sortName: "suffixJewish",
        },
      ],
    },

    {
      id: 2,
      title: "ADVANCEDFIELDS",
      class: "total_pnl_lbl",
      isTotalPanel: true,
      items: [],
    },
    {
      id: 4,
      title: "TOTALPANEL",
      class: "total_pnl_lbl",
      isTotalPanel: false,
      items: [
        {
          colName: "PAYMENTS",
          isVisible: true,
          colId: "DonorpaymentsId",
          sortOrder: "",
          sortName: "payments",
        },
        {
          colName: "COUNTOFPAYMENTS",
          isVisible: false,
          colId: "DonorpaymentscountId",
          sortOrder: "",
          sortName: "paymentsCount",
        },
        {
          colName: "OPENPLEDGES",
          isVisible: true,
          colId: "DonoropenPledgesId",
          sortOrder: "",
          sortName: "openPledges",
        },
        {
          colName: "COUNTOFPLEDGES",
          isVisible: false,
          colId: "DonorpledgescountId",
          sortOrder: "",
          sortName: "pledgesCount",
        },
        {
          colName: "SCHEDULED",
          isVisible: true,
          colId: "DonorscheduledId",
          sortOrder: "",
          sortName: "scheduled",
        },
        {
          colName: "COUNTOFSCHEDULES",
          isVisible: false,
          colId: "DonorschedulescountId",
          sortOrder: "",
          sortName: "schedulesCount",
        },
        {
          colName: "TOTAL",
          isVisible: true,
          colId: "DonorraisedId",
          sortOrder: "",
          sortName: "raised",
        },
      ],
    },
  ];

  slideConfig = {
    infinite: false,
    arrows: true,
    vertical: true,
    speed: 1000,
  };
  labelsListArray = [];
  @ViewChildren("tabIndex") tr: QueryList<ElementRef>;
  @ViewChildren(CdkDropList)
  private dropQueryVal: QueryList<CdkDropList>;
  public droplistVal: CdkDropList[] = [];

  EngHebCalPlaceholder: string = "All Time";
  class_id: string;
  class_hid: string;
  isCalendarData: boolean;
  CalendarData: any;
  private calendarSubscription: Subscription;
  englishJsontable: any;
  hebrewJsontable: any;
  isdownloadExcelGuid: boolean = false;
  colfieldsValue: any[];
  isDateApply: boolean = false;
  sortNameCol: any;
  isSelectPopupShow: boolean = false;
  displayThisPageCount: number = 0;
  isBulkCheckbox: boolean;
  displayThisPageArray: any[] = [];
  private analytics = inject(AnalyticsService);
  donorSelectedArray: any[] = [];

  constructor(
    private donorService: DonorService,
    private cardService: CardService,
    private localstoragedataService: LocalstoragedataService,
    private notificationService: NotificationService,
    public commonMethodService: CommonMethodService,
    private totalPanelService: TotalPanelService,
    public tagService: TagService,
    private advancedFieldService: AdvancedFieldService,
    public translate: TranslateService,
    private printableReport: PrintableReportService,
    private uiPageSettingService: UIPageSettingService,
    public hebrewEngishCalendarService: HebrewEngishCalendarService,
    private commonAPIMethodService: CommonAPIMethodService,
    public pageSyncService: PageSyncService,
    private readonly changeDetectorRef: ChangeDetectorRef,
    private xlsxService: XLSXService
  ) {
    translate.setDefaultLang("en");
  }
  private elementRef: ElementRef;
  type: string;

  ngOnInit() {
    this.analytics.visitedDonors();
    if (this.pageSyncService.advancedDonorFields) {
      this.colFields = this.pageSyncService.advancedDonorFields;
    }
    this.colfieldsValue = this.pageSyncService.donorFieldsCol;
    this.colfieldsValue.forEach((obj: { key: boolean }) => {
      let key = Object.keys(obj)[0];
      let value: boolean = Object.values(obj)[0];
      let data = this.colFields[0].items.find((data) => data.colName === key);
      data.isVisible = value;
    });
    if (this.pageSyncService.sumbyDonor) {
      this.cardType = this.pageSyncService.sumbyDonor;
    }
    this.CalendarData = this.commonMethodService.getCalendarArray();
    this.commonMethodService.getEngHebJsonData();
    this.isProdEnv = environment.baseUrl.includes("https://webapi.donary.com/");
    this.commonMethodService.isDonorListsPage = true;
    this.pageSyncService.calculateTimeDifference("list");
    if (this.pageSyncService.labelList.length == 0) {
      this.getAllLabels();
    } else {
      this.getAllLabels();
    }
    this.isloading = true;

    this.commonMethodService.getUserLst().subscribe((res: any) => {
      if (res.items == undefined) {
        this.localstoragedataService.setPermissionLst(
          res.lstUserPermissionModel
        );
        this.showTotalPanelPermission = this.localstoragedataService
          .getPermissionLst()
          .filter((x) => x.permissionName == "Show Total Panel Donors")
          .map((x) => x.isActive)[0];
      }
    });
    this.initMultiSelect();
    if (this.pageSyncService.tagList.length == 0) {
      this.getTagList();
    } else {
      this.newDonorTagList = this.pageSyncService.tagList;
    }
    this.sortFilter = [
      { id: 1, itemName: "A-Z" },
      { id: 2, itemName: "Z-A" },
      { id: 3, itemName: "High to Low" },
      { id: 4, itemName: "Low to High" },
    ];
    if (this.commonMethodService.initialDonorLoad == 0) {
      //this.searchDonorData();
      this.commonMethodService.lastSyncedTime = new Date();
      this.commonMethodService.initialDonorLoad = 1;
    } else {
      this.gridData = this.commonMethodService.localDonorList;
      // added new
      this.gridOrgData = this.gridData;
      this.objAdvancedSearch = { status: "0" };
      this.filterLocalData();
      //
      this.gridFilterData = this.gridData;
      this.totalRecord = this.gridFilterData.length;
      if (
        this.pageSyncService.advancedFieldList &&
        this.pageSyncService.advancedFieldList.length == 0
      ) {
        this.getAFVColumns(true);
      } else {
        this.advanceFieldModification(this.pageSyncService.advancedFieldList);
      }
    }
    this.commonMethodService.getDonorLst().subscribe((res: any) => {
      if (res) {
        $("#searchText").val("");

        this.searchDonorData();
        this.recordSelectedArray = [];
      }
    });
    // added new
    this.commonMethodService.getDonorSingle().subscribe((res: any) => {
      if (res && res.length > 0) {
        if (
          res[0].deleteCause &&
          res[0].deleteCause.toLowerCase() == "delete"
        ) {
          res = res[0];
          this.locallyUpdateDeleteDonor(res);
          this.filterLocalData();
          return;
        }

        res = res[0];

        if (res.accountPhones) {
          res.phoneLabels2 = "";
          for (let index = 0; index < res.accountPhones.length; index++) {
            const element = res.accountPhones[index];
            if (element.phoneNumber) {
              res.phoneLabels2 +=
                element.phoneLabel.trim().charAt(0) +
                ": " +
                this.formatPhoneNumber(element.phoneNumber) +
                "<br>";
            }
          }
        }
        if (res.accountEmails) {
          res.emailLabels2 = "";

          //added logic to only show Home email in the donar list
          const element = res.accountEmails[0];
          res.emailLabels2 +=
            element.emailLabel + ": " + element.emailAddress + "<br>";
        }
        if (res.tags) {
          res.tagNames = "";
          res.tagValues = "";
          for (let index = 0; index < res.tags.length; index++) {
            const element = res.tags[index];
            if (res.tagFormat)
              res.tagFormat = `${res.tagFormat}<span class="tag_${
                element.tagColor && element.tagColor.trim()
              }">${element.tagName.replace(":", " ")}</span>`;
            else
              res.tagFormat = `<span class="tag_${
                element.tagColor && element.tagColor.trim()
              }">${element.tagName.replace(":", " ")}</span>`;
          }
        }
        const foundIndex = this.gridFilterData.findIndex(
          (x) => x.accountId == res.accountId
        );
        if (foundIndex != -1) {
          // update logic
          for (let index = 0; index < this.gridData.length; index++) {
            const element = this.gridData[index];
            if (element.accountId == res.accountId) {
              this.gridData[index] = res;
              this.gridData[index].advancedFieldNameAndValue = [];
              if (res.advancedFields != null) {
                const newValues = res.advancedFields.map((x) => {
                  if (x.value) {
                    this.gridData[index].advancedFieldNameAndValue.push({
                      fieldname: x.advancedField.fieldName.replace(/:/g, ""),
                      fieldValue: x.value,
                    });
                  }
                });
              }
            }
          }
          for (let index = 0; index < this.gridFilterData.length; index++) {
            const element = this.gridFilterData[index];
            if (element.accountId == res.accountId) {
              this.gridFilterData[index] = res;
              this.gridFilterData[index].advancedFieldNameAndValue = [];
              if (res.advancedFields != null) {
                const newValues = res.advancedFields.map((x) => {
                  if (x.value) {
                    this.gridFilterData[index].advancedFieldNameAndValue.push({
                      fieldname: x.advancedField.fieldName.replace(/:/g, ""),
                      fieldValue: x.value,
                    });
                  }
                });
              }
            }
          }
          for (let index = 0; index < this.gridOrgData.length; index++) {
            const element = this.gridOrgData[index];
            if (element.accountId == res.accountId) {
              this.gridOrgData[index] = res;
              this.gridOrgData[index].advancedFieldNameAndValue = [];
              if (res.advancedFields != null) {
                const newValues = res.advancedFields.map((x) => {
                  if (x.value) {
                    this.gridOrgData[index].advancedFieldNameAndValue.push({
                      fieldname: x.advancedField.fieldName.replace(/:/g, ""),
                      fieldValue: x.value,
                    });
                  }
                });
              }
            }
          }
        }
        if (foundIndex == -1) {
          //added logic
          res.advancedFieldNameAndValue = [];
          if (res.advancedFields != null) {
            const newValues = res.advancedFields.map((x) => {
              if (x.value) {
                res.advancedFieldNameAndValue.push({
                  fieldname: x.advancedField.fieldName.replace(/:/g, ""),
                  fieldValue: x.value,
                });
              }
            });
          }
          this.gridData.push(res);
          this.gridOrgData.push(res);
          this.totalRecord = this.gridFilterData.length;
        }
        this.commonMethodService.localDonorList = this.gridData;
        // }
      }
    });
    if (
      !this.pageSyncService.listFlag ||
      (!this.pageSyncService.isDonorListClicked &&
        this.pageSyncService.donorList == undefined)
    ) {
      let objLayout = {
        uiPageSettingId: this.uiPageSettingId,
        userId: this.localstoragedataService.getLoginUserId(),
        moduleName: "lists",
        screenName: "donors",
      };
      this.uiPageSettingService.Get(objLayout).subscribe((res: any) => {
        if (res) {
          this.uiPageSettingId = res.uiPageSettingId;
          this.uiPageSetting = JSON.parse(res.setting);
          if (
            this.uiPageSetting != null &&
            this.uiPageSetting.isDonorAccountNoColVisible != undefined
          ) {
            this.setUIPageSettings(this.uiPageSetting);

            if (this.isTotalPanelVisible) {
              this.cardType = this.uiPageSetting.donorSumBy;
              this.objAdvancedSearch = this.uiPageSetting.donorSearchitem;
              if (
                this.uiPageSetting.donorStartDate == null &&
                this.uiPageSetting.donorEndDate == null
              ) {
                this.selectedDateRange = undefined;
              } else {
                this.selectedDateRange = {
                  startDate: moment(this.uiPageSetting.donorStartDate),
                  endDate: moment(this.uiPageSetting.donorEndDate),
                };
              }
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
              // this.getTotalPanel();

              this.searchDonorData();
            } else {
              this.panelTitle = "Show Total Panel";

              this.searchDonorData();
            }
          } else {
            this.searchDonorData();
          }
        } else {
          if (
            !this.pageSyncService.listFlag ||
            this.pageSyncService.donorList == undefined
          ) {
            this.searchDonorData();
          } else {
            this.gridData = this.pageSyncService.donorList;
            this.resListModification(this.gridData);
            this.isloading = false;
          }
        }
      });
    } else {
      if (this.pageSyncService.uiPageSettings["donorList"]) {
        this.uiPageSetting =
          this.pageSyncService?.uiPageSettings?.["donorList"];
        this.setUIPageSettings(this.uiPageSetting);
      }

      this.gridData = this.pageSyncService.donorList;
      //this.gridData = this.commonMethodService.localDonorList;
      if (this.pageSyncService.donorlistTotalPanel !== undefined) {
        this.TogglePanel(this.pageSyncService.donorlistTotalPanel);
      }

      this.resListModification(this.gridData);
      this.isloading = false;
    }
    //this.idList = this.colFields.map((el) => el.id);
    this.commonMethodService.updateTotalPanel$.subscribe((res) => {
      if (res && this.isTotalPanelVisible) {
        this.getTotalPanel();
      }
    });
    document
      .getElementById("importDonorButton")
      .addEventListener("click", function (event) {
        event.preventDefault();
        $("#import_opts").toggle();
      });

    document
      .getElementById("moreActions")
      .addEventListener("click", function (event) {
        event.stopPropagation();
      });
    if (this.pageSyncService.donorFilterData) {
      this.advancedFilterData(this.pageSyncService.donorFilterData, false);
    }
    if (this.pageSyncService.DonorCalDate) {
      if (
        this.pageSyncService.DonorCalDate.startDate == null &&
        this.pageSyncService.DonorCalDate.endDate == null
      ) {
        this.selectedDateRange.startDate = null;
        this.selectedDateRange.endDate = null;
        this.EngHebCalPlaceholder = "All Time";
      }
      this.selectedDateRange = {
        startDate: moment(this.pageSyncService.DonorCalDate.startDate),
        endDate: moment(this.pageSyncService.DonorCalDate.endDate),
      };
    }
    if (this.pageSyncService.DonorEngCalPlaceholder != "") {
      this.EngHebCalPlaceholder = this.pageSyncService.DonorEngCalPlaceholder;
    }
  }

  setUIPageSettings(uiPageSetting) {
    this.isDonorAccountNoColVisible = uiPageSetting.isDonorAccountNoColVisible;
    this.isDonorFullNameColVisible = uiPageSetting.isDonorFullNameColVisible;
    this.isDonorFullNameEnglishColVisible =
      uiPageSetting.isDonorFullNameEnglishColVisible;
    this.isDonorFullNameJewishColVisible =
      uiPageSetting.isDonorFullNameJewishColVisible;
    this.isDonorAddressColVisible = uiPageSetting.isDonorAddressColVisible;
    this.isDonorPhoneLabelColVisible =
      uiPageSetting.isDonorPhoneLabelColVisible;
    this.isDonorFamilyColVisible = uiPageSetting.isDonorFamilyColVisible;
    this.isDonorEmailColVisible = uiPageSetting.isDonorEmailColVisible;
    this.isDonorGroupColVisible = uiPageSetting.isDonorGroupColVisible;
    this.isDonorClassColVisible = uiPageSetting.isDonorClassColVisible;
    this.isDonorCityStateZipColVisible =
      uiPageSetting.isDonorCityStateZipColVisible;
    this.isDonorNoteColVisible = uiPageSetting.isDonorNoteColVisible;
    this.isDonorFatherColVisible = uiPageSetting.isDonorFatherColVisible;
    this.isDonorFatherInLawColVisible =
      uiPageSetting.isDonorFatherInLawColVisible;
    this.isDonorTagColVisible = uiPageSetting.isDonorTagColVisible;
    this.isDonorPaymentsColVisible = uiPageSetting.isDonorPaymentsColVisible;
    this.isDonorOpenPledgesColVisible =
      uiPageSetting.isDonorOpenPledgesColVisible;
    this.isDonorScheduledColVisible = uiPageSetting.isDonorScheduledColVisible;
    this.isDonorPaymentsCountColVisible =
      uiPageSetting.isDonorPaymentsCountColVisible;
    this.isDonorOpenPledgesCountColVisible =
      uiPageSetting.isDonorOpenPledgesCountColVisible;
    this.isDonorScheduledCountColVisible =
      uiPageSetting.isDonorScheduledCountColVisible;
    this.isDonorRaisedColVisible = uiPageSetting.isDonorRaisedColVisible;
    this.isDonorTitleColVisible = uiPageSetting.isDonorTitleColVisible;
    this.isDonorFirstNameColVisible = uiPageSetting.isDonorFirstNameColVisible;
    this.isDonorLastNameColVisible = uiPageSetting.isDonorLastNameColVisible;
    this.isDonorTitleJewishColVisible =
      uiPageSetting.isDonorTitleJewishColVisible;
    this.isDonorFirstNameJewishColVisible =
      uiPageSetting.isDonorFirstNameJewishColVisible;
    this.isDonorLastNameJewishColVisible =
      uiPageSetting.isDonorLastNameJewishColVisible;
    this.isDonorSuffixJewishColVisible =
      uiPageSetting.isDonorSuffixJewishColVisible;
    this.isTotalPanelVisible = uiPageSetting.donorIsTotalPanelVisible;
    this.pageSyncService.donorlistTotalPanel =
      !uiPageSetting.donorIsTotalPanelVisible;
    this.isTotalPanelShowAll =
      uiPageSetting.isTotalPanelShowAll != undefined
        ? uiPageSetting.isTotalPanelShowAll
        : true;
    this.EngHebCalPlaceholder =
      this.pageSyncService.DonorEngCalPlaceholder ||
      uiPageSetting.EngHebCalPlaceholder ||
      this.EngHebCalPlaceholder;
    this.pageSyncService.DonorEngCalPlaceholder = this.EngHebCalPlaceholder;
    if (this.uiPageSetting.colFields)
      this.colFields = this.uiPageSetting.colFields;

    if (uiPageSetting?.donorCalendarPlaceHolderId)
      this.hebrewEngishCalendarService.id =
        uiPageSetting?.donorCalendarPlaceHolderId;

    let sortNameCol = this.colFields[0].items.find((col) => col.sortOrder);
    if (!sortNameCol) {
      sortNameCol = this.colFields[1].items.find((col) => col.sortOrder);
      this.sortNameCol = sortNameCol;
    }
    if (sortNameCol?.sortOrder) {
      this.strSort = sortNameCol.sortOrder;
      if (sortNameCol.sortName == "fullName") this.showSortArrow = true;
    }

    this.pageSyncService.uiPageSettings["donorList"] = uiPageSetting;
    this.detectChanges();
  }

  detectChanges() {
    if (!this.changeDetectorRef["destroyed"]) {
      this.changeDetectorRef.detectChanges();
    }
  }

  initMultiSelect() {
    const sumByCampaign = _(this.gridTotalPanelData)
      .filter((s) => s.campaignId != null && s.accountId != null)
      .groupBy("campaignId")
      .map((objs, key) => ({
        ...objs,
      }))
      .value();

    const sumByReason = _(this.gridTotalPanelData)
      .filter((s) => s.reasonId != null && s.accountId != null)
      .groupBy("reasonId")
      .map((objs, key) => ({
        ...objs,
      }))
      .value();

    const sumByLocation = _(this.gridTotalPanelData)
      .filter((s) => s.locationId != null && s.accountId != null)
      .groupBy("locationId")
      .map((objs, key) => ({
        ...objs,
      }))
      .value();

    const sumByCollector = _(this.gridTotalPanelData)
      .filter((s) => s.collectorId != null && s.accountId != null)
      .groupBy("collectorId")
      .map((objs, key) => ({
        ...objs,
      }))
      .value();

    const sumByDevice = _(this.gridTotalPanelData)
      .filter((s) => s.deviceId != null && s.accountId != null)
      .groupBy("deviceId")
      .map((objs, key) => ({
        ...objs,
      }))
      .value();

    const sumByDonor = _(this.gridTotalPanelData)
      .filter((s) => s.accountId != null)
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

  Sort() {
    this.showSortArrow = true;
    this.colFields[0].items
      .filter((item) => item.sortOrder)
      .forEach((item) => (item.sortOrder = ""));
    this.gridFilterData = this.EnglishOnly();
  }

  EnglishOnly() {
    var grid = [];
    var unsortGrid = [];
    let fullNameCol = this.colFields[0].items.find(
      (col) => col.sortName == "fullName"
    );

    this.gridFilterData.forEach((c) => {
      if (c.fullName) {
        if (
          (c.fullName.substring(0, 1) >= "a" &&
            c.fullName.substring(0, 1) <= "z") ||
          (c.fullName.substring(0, 1) >= "A" &&
            c.fullName.substring(0, 1) <= "Z")
        ) {
          grid.push(c);
        } else {
          unsortGrid.push(c);
        }
      } else {
        unsortGrid.push(c);
      }
    });
    if (fullNameCol) fullNameCol.sortOrder = this.strSort;

    if (this.strSort == null || this.strSort == "asc") {
      this.strSort = "desc";
      grid = grid.sort((first, second) =>
        first.fullName < second.fullName
          ? -1
          : first.fullName > second.fullName
          ? 1
          : 0
      );
    } else {
      this.strSort = "asc";
      grid = grid.sort((first, second) =>
        first.fullName > second.fullName
          ? -1
          : first.fullName < second.fullName
          ? 1
          : 0
      );
    }
    grid = grid.concat(unsortGrid);
    return grid;
  }

  OpenSumCard(item) {
    if (this.isSumCardOpen) {
      this.isSumCardOpen = false;
    } else {
      this.selectedItem = false;
      this.isSumCardOpen = true;
    }
  }

  CalendarFocus() {
    this.pickerDirective.open();
  }

  getGroupValue(): Array<any> {
    return _(this.gridTotalPanelData)
      .groupBy("accountId")
      .map((props, id: string) => ({
        ..._.head(props),
        accountId: id,
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
        deviceIds: _.map(props, (o) => {
          return o.deviceId;
        }),
        parentCampaignIds: _.map(props, (o) => {
          return o.parentCampaignId;
        }),
      }))
      .value();
  }

  getAllGroupValue(): Array<any> {
    return _(this.gridOrgData)
      .groupBy("accountId")
      .map((props, id: string) => ({
        ..._.head(props),
        accountId: id,
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
        deviceIds: _.map(props, (o) => {
          return o.deviceId;
        }),
        parentCampaignIds: _.map(props, (o) => {
          return o.parentCampaignId;
        }),
      }))
      .value();
  }

  showAllTotalData(data = this.gridOrgData) {
    const groupedRes = this.getGroupValue();
    const newArray = data.map(
      ({ raised, payments, openPledges, scheduled, ...keepAttrs }) => keepAttrs
    );
    const merged = _.merge(
      _.keyBy(groupedRes, "accountId"),
      _.keyBy(newArray, "accountId")
    );
    const mergedValue = _.values(merged);
    mergedValue.forEach((element) => {
      if (element.raised === undefined) {
        element.raised = 0;
        element.payments = 0;
        element.scheduled = 0;
        element.openPledges = 0;
      }
    });
    let inCommon = _.intersectionWith(mergedValue, this.gridOrgData, (o, t) => {
      return o.accountId == t.accountId;
    });
    const values = _.values(inCommon);

    this.totalRecord = values.length;
    let sortArray = values.sort((n1, n2) => {
      if (n1.raised > n2.raised) {
        return 1;
      }

      if (n1.raised < n2.raised) {
        return -1;
      }

      return 0;
    });
    this.gridFilterData = sortArray.reverse();
    this.gridSumByData = this.gridFilterData;
    this.cardTypeChange(this.cardType);
    // var $table = $('table.redesign_table');
    // $table.floatThead('reflow');
  }

  groupRes: any;
  showOnlyTotalData(data = this.gridOrgData) {
    const dd = _.intersectionWith(data, this.gridTotalPanelData, (o, t) => {
      return o.accountId == t.accountId;
    });
    const groupedRes = this.getGroupValue();

    this.groupRes = this.GetGroupList(
      this.groupBy(this.gridTotalPanelData, (s) => s.accountId)
    );
    const values = _.map(dd, (o) => {
      let found = _.find(groupedRes, (t) => {
        return o.accountId == t.accountId;
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
    this.totalRecord = values.length;
    this.gridFilterData = values;
    this.gridSumByData = this.gridFilterData;
    this.cardTypeChange(this.cardType);
  }

  GetGroupList(groupByList) {
    var myArray = [];
    groupByList.forEach((element) => {
      myArray.push.apply(myArray, element);
    });

    return myArray;
  }

  groupBy(list, keyGetter) {
    const map = new Map();
    list.forEach((item) => {
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

  OnCheckboxChange(event) {
    if (event.target.checked) {
      this.isTotalPanelShowAll = true;
      this.showOnlyTotalData();
      this.initMultiSelect();
      return;
    }
    this.isloading = true;
    this.showAllTotalData();
    this.isTotalPanelShowAll = false;
    this.initMultiSelect();
    this.settingOpenClose();
  }

  tempSearch: Array<any>;
  getTotalPanel() {
    this.isloading = true;
    var objTotalPanel = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
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
    if (this.pageSyncService.DonortotalPanel && !this.isDateApply) {
      this.Panel(this.pageSyncService.DonortotalPanel);
    } else {
      this.isDateApply = false;
      this.totalPanelService.getTotals(objTotalPanel).subscribe(
        (res: Array<PanelRes>) => {
          this.pageSyncService.DonortotalPanel = res;
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
      this.gridTotalPanelData.forEach((element) => {
        element.raised = Number(element.raised.toFixed(2));
      });
      //for issue comments below code
      if (this.isTotalPanelShowAll) {
        this.totalPanelfilterLocalData();
        this.showOnlyTotalData();
        //this.filterLocalData();
        this.gridOrgTotalPanelData = this.gridFilterData;
        this.tempSearch = this.gridFilterData;
      } else {
        this.showAllTotalData();
      }
      if (this.sortNameCol) this.advancedSort(this.sortNameCol.sortName);
      this.isDonorOpenPledgesColVisible = true;
      this.isDonorPaymentsColVisible = true;
      this.isDonorRaisedColVisible = true;
      this.isDonorScheduledColVisible = true;

      if (this.gridFilterData) {
        this.initMultiSelect();
      } else {
        this.paymentTypeChipData = [];
        this.initMultiSelect();
      }
      this.orgTotalPanelData = this.gridTotalPanelData;
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
    this.detectChanges();
    this.isFiltered = false;
    this.initMultiSelect();
  }

  datesUpdated(event) {
    this.isSelected = false;
    this.isCustomReport = false;
    if (this.isinitialize == 1) {
      if (!event.startDate) {
        this.selectedDateRange = undefined;
        this.isinitialize = 0;
      } else {
        this.selectedDateRange = event;
      }
      //this.selectedDateRange=event;
      this.getTotalPanel();
    }
  }

  SortArray() {
    let sortArray = this.gridFilterData.sort((n1, n2) => {
      if (n1.raised > n2.raised) {
        return 1;
      }

      if (n1.raised < n2.raised) {
        return -1;
      }

      return 0;
    });
    this.gridFilterData = sortArray.reverse();
  }

  GetPaymentChipType(objPaymentTypeChip) {
    if (objPaymentTypeChip) {
      this.isSelected = false;
      this.isCustomReport = false;
      let sortArray = [];
      var cardTypeValue =
        this.cardType.length > 0
          ? this.cardType.map((s) => s.itemName).toString()
          : null;
      this.gridFilterData = this.gridSumByData;
      if (this.objAdvancedSearch == null) {
        this.objAdvancedSearch = {
          status: "",
          reasonId: [],
          campaignId: [],
          locationId: [],
          collectorId: [],
          sourceId: [],
          AdvancedFields: [],
        };
      }

      switch (cardTypeValue) {
        case "Campaign":
          if (objPaymentTypeChip.key == "-2") {
            // For All
            // this.gridFilterData = this.gridFilterData.map((obj,key)=>({'count':obj.campaignIds && obj.campaignIds.filter(x=>x!=null).length ,'obj':obj})).filter(x=>x.count>0).map(x=>x.obj);
            this.gridFilterData.forEach((item) => {
              (item.payments = this.groupRes
                .filter((s) => s.accountId == item.accountId)
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next, 0)),
                (item.openPledges = this.groupRes
                  .filter((s) => s.accountId == item.accountId)
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next, 0)),
                (item.raised = this.groupRes
                  .filter((s) => s.accountId == item.accountId)
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next, 0)),
                (item.scheduled = this.groupRes
                  .filter((s) => s.accountId == item.accountId)
                  .map((s) => s.scheduled)
                  .reduce((prev, next) => prev + next, 0));
            });
            this.totalRecord = this.gridFilterData.length;
            this.objAdvancedSearch.campaignId = [];
            this.isFiltered = false;
            this.isChipTypeSelected = false;
            this.SortArray();
          } else if (objPaymentTypeChip.key == "-1") {
            // For All
            this.gridFilterData = this.gridFilterData;
            this.gridFilterData.forEach((item) => {
              (item.payments = this.groupRes
                .filter((s) => s.accountId == item.accountId)
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next, 0)),
                (item.openPledges = this.groupRes
                  .filter((s) => s.accountId == item.accountId)
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next, 0)),
                (item.raised = this.groupRes
                  .filter((s) => s.accountId == item.accountId)
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next, 0)),
                (item.scheduled = this.groupRes
                  .filter((s) => s.accountId == item.accountId)
                  .map((s) => s.scheduled)
                  .reduce((prev, next) => prev + next, 0));
            });
            this.totalRecord = this.gridFilterData.length;
            this.isFiltered = false;
            this.isChipTypeSelected = false;
            this.SortArray();
          } else if (!this.isTotalPanelShowAll) {
            this.gridFilterData = this.gridFilterData;
            this.gridFilterData.forEach((item) => {
              (item.payments = this.groupRes
                .filter((s) => s.accountId == item.accountId)
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next, 0)),
                (item.openPledges = this.groupRes
                  .filter((s) => s.accountId == item.accountId)
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next, 0)),
                (item.raised = this.groupRes
                  .filter((s) => s.accountId == item.accountId)
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next, 0)),
                (item.scheduled = this.groupRes
                  .filter((s) => s.accountId == item.accountId)
                  .map((s) => s.scheduled)
                  .reduce((prev, next) => prev + next, 0));
            });
            let sumCardData = this.gridFilterData;
            var campaignDonorIds = this.GetCampaignDonor(
              objPaymentTypeChip.key
            );
            sumCardData = sumCardData.filter(
              (s) =>
                (s.campaignIds &&
                  s.campaignIds.indexOf(Number(objPaymentTypeChip.key)) >= 0 &&
                  campaignDonorIds &&
                  campaignDonorIds.indexOf(Number(s.accountId)) >= 0) ||
                (s.parentCampaignIds &&
                  s.parentCampaignIds.indexOf(Number(objPaymentTypeChip.key)) >=
                    0)
            );
            sumCardData.forEach((item) => {
              (item.payments = this.groupRes
                .filter(
                  (s) =>
                    (s.campaignId == Number(objPaymentTypeChip.key) ||
                      s.parentCampaignId == Number(objPaymentTypeChip.key)) &&
                    s.accountId == item.accountId
                )
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next, 0)),
                (item.openPledges = this.groupRes
                  .filter(
                    (s) =>
                      (s.campaignId == Number(objPaymentTypeChip.key) ||
                        s.parentCampaignId == Number(objPaymentTypeChip.key)) &&
                      s.accountId == item.accountId
                  )
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next, 0)),
                (item.raised = this.groupRes
                  .filter(
                    (s) =>
                      (s.campaignId == Number(objPaymentTypeChip.key) ||
                        s.parentCampaignId == Number(objPaymentTypeChip.key)) &&
                      s.accountId == item.accountId
                  )
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next, 0)),
                (item.scheduled = this.groupRes
                  .filter(
                    (s) =>
                      (s.campaignId == Number(objPaymentTypeChip.key) ||
                        s.parentCampaignId == Number(objPaymentTypeChip.key)) &&
                      s.accountId == item.accountId
                  )
                  .map((s) => s.scheduled)
                  .reduce((prev, next) => prev + next, 0));
            });
            this.gridFilterData.forEach((element, index) => {
              sumCardData.forEach((item, index) => {
                if (item.accountId == element.accountId) {
                  this.gridFilterData = this.gridFilterData.filter(
                    (x) => x.accountId != item.accountId
                  );
                }
              });
            });
            this.gridFilterData.forEach((item) => {
              (item.payments = 0),
                (item.openPledges = 0),
                (item.raised = 0),
                (item.scheduled = 0);
            });
            this.gridFilterData = [...sumCardData, ...this.gridFilterData];
            this.isFiltered = false;
            this.isChipTypeSelected = false;
          } else {
            var campaignDonorIds = this.GetCampaignDonor(
              objPaymentTypeChip.key
            );
            this.gridFilterData = this.gridFilterData.filter(
              (s) =>
                (s.campaignIds &&
                  s.campaignIds.indexOf(Number(objPaymentTypeChip.key)) >= 0 &&
                  campaignDonorIds &&
                  campaignDonorIds.indexOf(Number(s.accountId)) >= 0) ||
                (s.parentCampaignIds &&
                  s.parentCampaignIds.indexOf(Number(objPaymentTypeChip.key)) >=
                    0)
            );
            this.gridFilterData.forEach((item) => {
              (item.payments = this.groupRes
                .filter(
                  (s) =>
                    (s.campaignId == Number(objPaymentTypeChip.key) ||
                      s.parentCampaignId == Number(objPaymentTypeChip.key)) &&
                    s.accountId == item.accountId
                )
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next, 0)),
                (item.openPledges = this.groupRes
                  .filter(
                    (s) =>
                      (s.campaignId == Number(objPaymentTypeChip.key) ||
                        s.parentCampaignId == Number(objPaymentTypeChip.key)) &&
                      s.accountId == item.accountId
                  )
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next, 0)),
                (item.raised = this.groupRes
                  .filter(
                    (s) =>
                      (s.campaignId == Number(objPaymentTypeChip.key) ||
                        s.parentCampaignId == Number(objPaymentTypeChip.key)) &&
                      s.accountId == item.accountId
                  )
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next, 0)),
                (item.scheduled = this.groupRes
                  .filter(
                    (s) =>
                      (s.campaignId == Number(objPaymentTypeChip.key) ||
                        s.parentCampaignId == Number(objPaymentTypeChip.key)) &&
                      s.accountId == item.accountId
                  )
                  .map((s) => s.scheduled)
                  .reduce((prev, next) => prev + next, 0));
            });
            if (this.objAdvancedSearch) {
              this.objAdvancedSearch.campaignId = [];
              this.objAdvancedSearch.campaignId.push({
                id: objPaymentTypeChip.key,
                itemName: objPaymentTypeChip.name,
              });
            }
            this.filterRecord = this.gridFilterData.length;
            this.isFiltered = true;
            this.isChipTypeSelected = true;
            this.gridSelectedData = this.gridFilterData;
            this.SortArray();
          }
          break;
        case "Reason":
          if (objPaymentTypeChip.key == "-2") {
            // For All
            this.gridFilterData = this.gridFilterData
              .map((obj, key) => ({
                count:
                  obj.reasonIds &&
                  obj.reasonIds.filter((x) => x != null).length,
                obj: obj,
              }))
              .filter((x) => x.count > 0)
              .map((x) => x.obj);
            this.gridFilterData.forEach((item) => {
              (item.payments = this.groupRes
                .filter((s) => s.accountId == item.accountId)
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next, 0)),
                (item.openPledges = this.groupRes
                  .filter((s) => s.accountId == item.accountId)
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next, 0)),
                (item.raised = this.groupRes
                  .filter((s) => s.accountId == item.accountId)
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next, 0)),
                (item.scheduled = this.groupRes
                  .filter((s) => s.accountId == item.accountId)
                  .map((s) => s.scheduled)
                  .reduce((prev, next) => prev + next, 0));
            });
            this.totalRecord = this.gridFilterData.length;
            this.objAdvancedSearch.reasonId = [];
            this.isFiltered = false;
            this.isChipTypeSelected = false;
            this.SortArray();
          } else if (objPaymentTypeChip.key == "-1") {
            // For All
            this.gridFilterData = this.gridFilterData;
            this.gridFilterData.forEach((item) => {
              (item.payments = this.groupRes
                .filter((s) => s.accountId == item.accountId)
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next, 0)),
                (item.openPledges = this.groupRes
                  .filter((s) => s.accountId == item.accountId)
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next, 0)),
                (item.raised = this.groupRes
                  .filter((s) => s.accountId == item.accountId)
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next, 0)),
                (item.scheduled = this.groupRes
                  .filter((s) => s.accountId == item.accountId)
                  .map((s) => s.scheduled)
                  .reduce((prev, next) => prev + next, 0));
            });
            this.totalRecord = this.gridFilterData.length;
            this.objAdvancedSearch.reasonId = [];
            this.isFiltered = false;
            this.isChipTypeSelected = false;
            this.SortArray();
          } else if (!this.isTotalPanelShowAll) {
            this.gridFilterData = this.gridFilterData;
            this.gridFilterData.forEach((item) => {
              (item.payments = this.groupRes
                .filter((s) => s.accountId == item.accountId)
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next, 0)),
                (item.openPledges = this.groupRes
                  .filter((s) => s.accountId == item.accountId)
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next, 0)),
                (item.raised = this.groupRes
                  .filter((s) => s.accountId == item.accountId)
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next, 0)),
                (item.scheduled = this.groupRes
                  .filter((s) => s.accountId == item.accountId)
                  .map((s) => s.scheduled)
                  .reduce((prev, next) => prev + next, 0));
            });
            let sumCardData = this.gridFilterData;
            var reasonDonorIds = this.GetReasonDonor(objPaymentTypeChip.key);
            sumCardData = sumCardData.filter(
              (s) =>
                s.reasonIds &&
                s.reasonIds.indexOf(Number(objPaymentTypeChip.key)) >= 0 &&
                reasonDonorIds &&
                reasonDonorIds.indexOf(Number(s.accountId)) >= 0
            );
            sumCardData.forEach((item) => {
              (item.payments = this.groupRes
                .filter(
                  (s) =>
                    s.reasonId == Number(objPaymentTypeChip.key) &&
                    s.accountId == item.accountId
                )
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next, 0)),
                (item.openPledges = this.groupRes
                  .filter(
                    (s) =>
                      s.reasonId == Number(objPaymentTypeChip.key) &&
                      s.accountId == item.accountId
                  )
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next, 0)),
                (item.raised = this.groupRes
                  .filter(
                    (s) =>
                      s.reasonId == Number(objPaymentTypeChip.key) &&
                      s.accountId == item.accountId
                  )
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next, 0)),
                (item.scheduled = this.groupRes
                  .filter(
                    (s) =>
                      s.reasonId == Number(objPaymentTypeChip.key) &&
                      s.accountId == item.accountId
                  )
                  .map((s) => s.scheduled)
                  .reduce((prev, next) => prev + next, 0));
            });
            this.gridFilterData.forEach((element, index) => {
              sumCardData.forEach((item, index) => {
                if (item.accountId == element.accountId) {
                  this.gridFilterData = this.gridFilterData.filter(
                    (x) => x.accountId != item.accountId
                  );
                }
              });
            });
            this.gridFilterData.forEach((item) => {
              (item.payments = 0),
                (item.openPledges = 0),
                (item.raised = 0),
                (item.scheduled = 0);
            });
            this.gridFilterData = [...sumCardData, ...this.gridFilterData];
            this.isFiltered = false;
            this.isChipTypeSelected = false;
          } else {
            var reasonDonorIds = this.GetReasonDonor(objPaymentTypeChip.key);
            this.gridFilterData = this.gridFilterData.filter(
              (s) =>
                s.reasonIds &&
                s.reasonIds.indexOf(Number(objPaymentTypeChip.key)) >= 0 &&
                reasonDonorIds &&
                reasonDonorIds.indexOf(Number(s.accountId)) >= 0
            );
            this.gridFilterData.forEach((item) => {
              (item.payments = this.groupRes
                .filter(
                  (s) =>
                    s.reasonId == Number(objPaymentTypeChip.key) &&
                    s.accountId == item.accountId
                )
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next, 0)),
                (item.openPledges = this.groupRes
                  .filter(
                    (s) =>
                      s.reasonId == Number(objPaymentTypeChip.key) &&
                      s.accountId == item.accountId
                  )
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next, 0)),
                (item.raised = this.groupRes
                  .filter(
                    (s) =>
                      s.reasonId == Number(objPaymentTypeChip.key) &&
                      s.accountId == item.accountId
                  )
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next, 0)),
                (item.scheduled = this.groupRes
                  .filter(
                    (s) =>
                      s.reasonId == Number(objPaymentTypeChip.key) &&
                      s.accountId == item.accountId
                  )
                  .map((s) => s.scheduled)
                  .reduce((prev, next) => prev + next, 0));
            });
            if (this.objAdvancedSearch) {
              this.objAdvancedSearch.reasonId = [];
              this.objAdvancedSearch.reasonId.push({
                id: objPaymentTypeChip.key,
                itemName: objPaymentTypeChip.name,
              });
            }
            this.filterRecord = this.gridFilterData.length;
            this.isFiltered = true;
            this.isChipTypeSelected = true;
            this.gridSelectedData = this.gridFilterData;
            this.SortArray();
          }
          break;
        case "Location":
          if (objPaymentTypeChip.key == "-2") {
            // For All
            this.gridFilterData = this.gridFilterData
              .map((obj, key) => ({
                count:
                  obj.locationIds &&
                  obj.locationIds.filter((x) => x != null).length,
                obj: obj,
              }))
              .filter((x) => x.count > 0)
              .map((x) => x.obj);
            this.gridFilterData.forEach((item) => {
              (item.payments = this.groupRes
                .filter((s) => s.accountId == item.accountId)
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next, 0)),
                (item.openPledges = this.groupRes
                  .filter((s) => s.accountId == item.accountId)
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next, 0)),
                (item.raised = this.groupRes
                  .filter((s) => s.accountId == item.accountId)
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next, 0)),
                (item.scheduled = this.groupRes
                  .filter((s) => s.accountId == item.accountId)
                  .map((s) => s.scheduled)
                  .reduce((prev, next) => prev + next, 0));
            });
            this.totalRecord = this.gridFilterData.length;
            this.objAdvancedSearch.locationId = [];
            this.isFiltered = false;
            this.isChipTypeSelected = false;
            this.SortArray();
          } else if (objPaymentTypeChip.key == "-1") {
            // For All
            this.gridFilterData = this.gridFilterData;
            this.gridFilterData.forEach((item) => {
              (item.payments = this.groupRes
                .filter((s) => s.accountId == item.accountId)
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next, 0)),
                (item.openPledges = this.groupRes
                  .filter((s) => s.accountId == item.accountId)
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next, 0)),
                (item.raised = this.groupRes
                  .filter((s) => s.accountId == item.accountId)
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next, 0)),
                (item.scheduled = this.groupRes
                  .filter((s) => s.accountId == item.accountId)
                  .map((s) => s.scheduled)
                  .reduce((prev, next) => prev + next, 0));
            });
            this.totalRecord = this.gridFilterData.length;
            this.objAdvancedSearch.locationId = [];
            this.isFiltered = false;
            this.isChipTypeSelected = false;
            this.SortArray();
          } else if (!this.isTotalPanelShowAll) {
            this.gridFilterData = this.gridFilterData;
            this.gridFilterData.forEach((item) => {
              (item.payments = this.groupRes
                .filter((s) => s.accountId == item.accountId)
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next, 0)),
                (item.openPledges = this.groupRes
                  .filter((s) => s.accountId == item.accountId)
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next, 0)),
                (item.raised = this.groupRes
                  .filter((s) => s.accountId == item.accountId)
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next, 0)),
                (item.scheduled = this.groupRes
                  .filter((s) => s.accountId == item.accountId)
                  .map((s) => s.scheduled)
                  .reduce((prev, next) => prev + next, 0));
            });
            let sumCardData = this.gridFilterData;
            var locationDonorIds = this.GetLocationDonor(
              objPaymentTypeChip.key
            );
            sumCardData = sumCardData.filter(
              (s) =>
                s.locationIds &&
                s.locationIds.indexOf(Number(objPaymentTypeChip.key)) >= 0 &&
                locationDonorIds &&
                locationDonorIds.indexOf(Number(s.accountId)) >= 0
            );
            sumCardData.forEach((item) => {
              (item.payments = this.groupRes
                .filter(
                  (s) =>
                    s.locationId == Number(objPaymentTypeChip.key) &&
                    s.accountId == item.accountId
                )
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next, 0)),
                (item.openPledges = this.groupRes
                  .filter(
                    (s) =>
                      s.locationId == Number(objPaymentTypeChip.key) &&
                      s.accountId == item.accountId
                  )
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next, 0)),
                (item.raised = this.groupRes
                  .filter(
                    (s) =>
                      s.locationId == Number(objPaymentTypeChip.key) &&
                      s.accountId == item.accountId
                  )
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next, 0)),
                (item.scheduled = this.groupRes
                  .filter(
                    (s) =>
                      s.locationId == Number(objPaymentTypeChip.key) &&
                      s.accountId == item.accountId
                  )
                  .map((s) => s.scheduled)
                  .reduce((prev, next) => prev + next, 0));
            });
            this.gridFilterData.forEach((element, index) => {
              sumCardData.forEach((item, index) => {
                if (item.accountId == element.accountId) {
                  this.gridFilterData = this.gridFilterData.filter(
                    (x) => x.accountId != item.accountId
                  );
                }
              });
            });
            this.gridFilterData.forEach((item) => {
              (item.payments = 0),
                (item.openPledges = 0),
                (item.raised = 0),
                (item.scheduled = 0);
            });
            this.gridFilterData = [...sumCardData, ...this.gridFilterData];
            this.isFiltered = false;
            this.isChipTypeSelected = false;
          } else {
            var reasonDonorIds = this.GetLocationDonor(objPaymentTypeChip.key);
            this.gridFilterData = this.gridFilterData.filter(
              (s) =>
                s.locationIds &&
                s.locationIds.indexOf(Number(objPaymentTypeChip.key)) >= 0 &&
                reasonDonorIds &&
                reasonDonorIds.indexOf(Number(s.accountId)) >= 0
            );
            this.gridFilterData.forEach((item) => {
              (item.payments = this.groupRes
                .filter(
                  (s) =>
                    s.locationId == Number(objPaymentTypeChip.key) &&
                    s.accountId == item.accountId
                )
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next, 0)),
                (item.openPledges = this.groupRes
                  .filter(
                    (s) =>
                      s.locationId == Number(objPaymentTypeChip.key) &&
                      s.accountId == item.accountId
                  )
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next, 0)),
                (item.raised = this.groupRes
                  .filter(
                    (s) =>
                      s.locationId == Number(objPaymentTypeChip.key) &&
                      s.accountId == item.accountId
                  )
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next, 0)),
                (item.scheduled = this.groupRes
                  .filter(
                    (s) =>
                      s.locationId == Number(objPaymentTypeChip.key) &&
                      s.accountId == item.accountId
                  )
                  .map((s) => s.scheduled)
                  .reduce((prev, next) => prev + next, 0));
            });
            if (this.objAdvancedSearch) {
              this.objAdvancedSearch.locationId = [];
              this.objAdvancedSearch.locationId.push({
                id: objPaymentTypeChip.key,
                itemName: objPaymentTypeChip.name,
              });
            }
            this.filterRecord = this.gridFilterData.length;
            this.isFiltered = true;
            this.isChipTypeSelected = true;
            this.gridSelectedData = this.gridFilterData;
            this.SortArray();
          }
          break;
        case "Collector":
          if (objPaymentTypeChip.key == "-2") {
            // For All
            this.gridFilterData = this.gridFilterData
              .map((obj, key) => ({
                count:
                  obj.collectorIds &&
                  obj.collectorIds.filter((x) => x != null).length,
                obj: obj,
              }))
              .filter((x) => x.count > 0)
              .map((x) => x.obj);
            this.gridFilterData.forEach((item) => {
              (item.payments = this.groupRes
                .filter((s) => s.accountId == item.accountId)
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next, 0)),
                (item.openPledges = this.groupRes
                  .filter((s) => s.accountId == item.accountId)
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next, 0)),
                (item.raised = this.groupRes
                  .filter((s) => s.accountId == item.accountId)
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next, 0)),
                (item.scheduled = this.groupRes
                  .filter((s) => s.accountId == item.accountId)
                  .map((s) => s.scheduled)
                  .reduce((prev, next) => prev + next, 0));
            });
            this.totalRecord = this.gridFilterData.length;
            this.objAdvancedSearch.collectorId = [];
            this.isFiltered = false;
            this.isChipTypeSelected = false;
            this.SortArray();
          } else if (objPaymentTypeChip.key == "-1") {
            // For All
            this.gridFilterData = this.gridFilterData;
            this.gridFilterData.forEach((item) => {
              (item.payments = this.groupRes
                .filter((s) => s.accountId == item.accountId)
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next, 0)),
                (item.openPledges = this.groupRes
                  .filter((s) => s.accountId == item.accountId)
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next, 0)),
                (item.raised = this.groupRes
                  .filter((s) => s.accountId == item.accountId)
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next, 0)),
                (item.scheduled = this.groupRes
                  .filter((s) => s.accountId == item.accountId)
                  .map((s) => s.scheduled)
                  .reduce((prev, next) => prev + next, 0));
            });
            this.totalRecord = this.gridFilterData.length;
            this.objAdvancedSearch.collectorId = [];
            this.isFiltered = false;
            this.isChipTypeSelected = false;
            this.SortArray();
          } else if (!this.isTotalPanelShowAll) {
            this.gridFilterData = this.gridFilterData;
            this.gridFilterData.forEach((item) => {
              (item.payments = this.groupRes
                .filter((s) => s.accountId == item.accountId)
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next, 0)),
                (item.openPledges = this.groupRes
                  .filter((s) => s.accountId == item.accountId)
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next, 0)),
                (item.raised = this.groupRes
                  .filter((s) => s.accountId == item.accountId)
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next, 0)),
                (item.scheduled = this.groupRes
                  .filter((s) => s.accountId == item.accountId)
                  .map((s) => s.scheduled)
                  .reduce((prev, next) => prev + next, 0));
            });
            let sumCardData = this.gridFilterData;
            var collectorDonorIds = this.GetCollectorDonor(
              objPaymentTypeChip.key
            );
            sumCardData = sumCardData.filter(
              (s) =>
                s.collectorIds &&
                s.collectorIds.indexOf(Number(objPaymentTypeChip.key)) >= 0 &&
                collectorDonorIds &&
                collectorDonorIds.indexOf(Number(s.accountId)) >= 0
            );
            sumCardData.forEach((item) => {
              (item.payments = this.groupRes
                .filter(
                  (s) =>
                    s.collectorId == Number(objPaymentTypeChip.key) &&
                    s.accountId == item.accountId
                )
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next, 0)),
                (item.openPledges = this.groupRes
                  .filter(
                    (s) =>
                      s.collectorId == Number(objPaymentTypeChip.key) &&
                      s.accountId == item.accountId
                  )
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next, 0)),
                (item.raised = this.groupRes
                  .filter(
                    (s) =>
                      s.collectorId == Number(objPaymentTypeChip.key) &&
                      s.accountId == item.accountId
                  )
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next, 0)),
                (item.scheduled = this.groupRes
                  .filter(
                    (s) =>
                      s.collectorId == Number(objPaymentTypeChip.key) &&
                      s.accountId == item.accountId
                  )
                  .map((s) => s.scheduled)
                  .reduce((prev, next) => prev + next, 0));
            });
            this.gridFilterData.forEach((element, index) => {
              sumCardData.forEach((item, index) => {
                if (item.accountId == element.accountId) {
                  this.gridFilterData = this.gridFilterData.filter(
                    (x) => x.accountId != item.accountId
                  );
                }
              });
            });
            this.gridFilterData.forEach((item) => {
              (item.payments = 0),
                (item.openPledges = 0),
                (item.raised = 0),
                (item.scheduled = 0);
            });
            this.gridFilterData = [...sumCardData, ...this.gridFilterData];
            this.isFiltered = false;
            this.isChipTypeSelected = false;
          } else {
            var reasonDonorIds = this.GetCollectorDonor(objPaymentTypeChip.key);
            this.gridFilterData = this.gridFilterData.filter(
              (s) =>
                (s.collectorIds &&
                  s.collectorIds.indexOf(Number(objPaymentTypeChip.key))) >=
                  0 &&
                reasonDonorIds &&
                reasonDonorIds.indexOf(Number(s.accountId)) >= 0
            );
            this.gridFilterData.forEach((item) => {
              (item.payments = this.groupRes
                .filter(
                  (s) =>
                    s.collectorId == Number(objPaymentTypeChip.key) &&
                    s.accountId == item.accountId
                )
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next, 0)),
                (item.openPledges = this.groupRes
                  .filter(
                    (s) =>
                      s.collectorId == Number(objPaymentTypeChip.key) &&
                      s.accountId == item.accountId
                  )
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next, 0)),
                (item.raised = this.groupRes
                  .filter(
                    (s) =>
                      s.collectorId == Number(objPaymentTypeChip.key) &&
                      s.accountId == item.accountId
                  )
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next, 0)),
                (item.scheduled = this.groupRes
                  .filter(
                    (s) =>
                      s.collectorId == Number(objPaymentTypeChip.key) &&
                      s.accountId == item.accountId
                  )
                  .map((s) => s.scheduled)
                  .reduce((prev, next) => prev + next, 0));
            });
            if (this.objAdvancedSearch) {
              this.objAdvancedSearch.collectorId = [];
              this.objAdvancedSearch.collectorId.push({
                id: objPaymentTypeChip.key,
                itemName: objPaymentTypeChip.name,
              });
            }
            this.filterRecord = this.gridFilterData.length;
            this.isFiltered = true;
            this.isChipTypeSelected = true;
            this.gridSelectedData = this.gridFilterData;
            this.SortArray();
          }
          break;
        case "Device":
          if (objPaymentTypeChip.key == "-2") {
            // For All
            this.gridFilterData = this.gridFilterData
              .map((obj, key) => ({
                count:
                  obj.deviceIds &&
                  obj.deviceIds.filter((x) => x != null).length,
                obj: obj,
              }))
              .filter((x) => x.count > 0)
              .map((x) => x.obj);
            this.gridFilterData.forEach((item) => {
              (item.payments = this.groupRes
                .filter((s) => s.accountId == item.accountId)
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next, 0)),
                (item.openPledges = this.groupRes
                  .filter((s) => s.accountId == item.accountId)
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next, 0)),
                (item.raised = this.groupRes
                  .filter((s) => s.accountId == item.accountId)
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next, 0)),
                (item.scheduled = this.groupRes
                  .filter((s) => s.accountId == item.accountId)
                  .map((s) => s.scheduled)
                  .reduce((prev, next) => prev + next, 0));
            });
            this.totalRecord = this.gridFilterData.length;
            this.objAdvancedSearch.deviceId = [];
            this.isFiltered = false;
            this.isChipTypeSelected = false;
            this.SortArray();
          } else if (objPaymentTypeChip.key == "-1") {
            // For All
            this.gridFilterData = this.gridFilterData;
            this.gridFilterData.forEach((item) => {
              (item.payments = this.groupRes
                .filter((s) => s.accountId == item.accountId)
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next, 0)),
                (item.openPledges = this.groupRes
                  .filter((s) => s.accountId == item.accountId)
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next, 0)),
                (item.raised = this.groupRes
                  .filter((s) => s.accountId == item.accountId)
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next, 0)),
                (item.scheduled = this.groupRes
                  .filter((s) => s.accountId == item.accountId)
                  .map((s) => s.scheduled)
                  .reduce((prev, next) => prev + next, 0));
            });
            this.totalRecord = this.gridFilterData.length;
            this.objAdvancedSearch.deviceId = [];
            this.isFiltered = false;
            this.isChipTypeSelected = false;
            this.SortArray();
          } else if (!this.isTotalPanelShowAll) {
            this.gridFilterData = this.gridFilterData;
            this.gridFilterData.forEach((item) => {
              (item.payments = this.groupRes
                .filter((s) => s.accountId == item.accountId)
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next, 0)),
                (item.openPledges = this.groupRes
                  .filter((s) => s.accountId == item.accountId)
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next, 0)),
                (item.raised = this.groupRes
                  .filter((s) => s.accountId == item.accountId)
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next, 0)),
                (item.scheduled = this.groupRes
                  .filter((s) => s.accountId == item.accountId)
                  .map((s) => s.scheduled)
                  .reduce((prev, next) => prev + next, 0));
            });
            let sumCardData = this.gridFilterData;
            var deviceDonorIds = this.GetDeviceDonor(objPaymentTypeChip.key);
            sumCardData = sumCardData.filter(
              (s) =>
                s.deviceIds &&
                s.deviceIds.indexOf(Number(objPaymentTypeChip.key)) >= 0 &&
                deviceDonorIds &&
                deviceDonorIds.indexOf(Number(s.accountId)) >= 0
            );
            sumCardData.forEach((item) => {
              (item.payments = this.groupRes
                .filter(
                  (s) =>
                    s.deviceId == Number(objPaymentTypeChip.key) &&
                    s.accountId == item.accountId
                )
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next, 0)),
                (item.openPledges = this.groupRes
                  .filter(
                    (s) =>
                      s.deviceId == Number(objPaymentTypeChip.key) &&
                      s.accountId == item.accountId
                  )
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next, 0)),
                (item.raised = this.groupRes
                  .filter(
                    (s) =>
                      s.deviceId == Number(objPaymentTypeChip.key) &&
                      s.accountId == item.accountId
                  )
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next, 0)),
                (item.scheduled = this.groupRes
                  .filter(
                    (s) =>
                      s.deviceId == Number(objPaymentTypeChip.key) &&
                      s.accountId == item.accountId
                  )
                  .map((s) => s.scheduled)
                  .reduce((prev, next) => prev + next, 0));
            });
            this.gridFilterData.forEach((element, index) => {
              sumCardData.forEach((item, index) => {
                if (item.accountId == element.accountId) {
                  this.gridFilterData = this.gridFilterData.filter(
                    (x) => x.accountId != item.accountId
                  );
                }
              });
            });
            this.gridFilterData.forEach((item) => {
              (item.payments = 0),
                (item.openPledges = 0),
                (item.raised = 0),
                (item.scheduled = 0);
            });
            this.gridFilterData = [...sumCardData, ...this.gridFilterData];
            this.isFiltered = false;
            this.isChipTypeSelected = false;
          } else {
            var deviceDonorIds = this.GetDeviceDonor(objPaymentTypeChip.key);
            this.gridFilterData = this.gridFilterData.filter(
              (s) =>
                s.deviceIds &&
                s.deviceIds.indexOf(Number(objPaymentTypeChip.key)) >= 0 &&
                deviceDonorIds &&
                deviceDonorIds.indexOf(Number(s.accountId)) >= 0
            );
            this.gridFilterData.forEach((item) => {
              (item.payments = this.groupRes
                .filter(
                  (s) =>
                    s.deviceId == Number(objPaymentTypeChip.key) &&
                    s.accountId == item.accountId
                )
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next, 0)),
                (item.openPledges = this.groupRes
                  .filter(
                    (s) =>
                      s.deviceId == Number(objPaymentTypeChip.key) &&
                      s.accountId == item.accountId
                  )
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next, 0)),
                (item.raised = this.groupRes
                  .filter(
                    (s) =>
                      s.deviceId == Number(objPaymentTypeChip.key) &&
                      s.accountId == item.accountId
                  )
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next, 0)),
                (item.scheduled = this.groupRes
                  .filter(
                    (s) =>
                      s.deviceId == Number(objPaymentTypeChip.key) &&
                      s.accountId == item.accountId
                  )
                  .map((s) => s.scheduled)
                  .reduce((prev, next) => prev + next, 0));
            });
            if (this.objAdvancedSearch) {
              this.objAdvancedSearch.sourceId = [];
              this.objAdvancedSearch.sourceId.push({
                id: objPaymentTypeChip.key,
                itemName: objPaymentTypeChip.name,
              });
            }
            this.filterRecord = this.gridFilterData.length;
            this.isFiltered = true;
            this.isChipTypeSelected = true;
            this.gridSelectedData = this.gridFilterData;
            this.SortArray();
          }
          break;
        case "Donor":
          if (objPaymentTypeChip.key == "-2") {
            // For All
            this.gridFilterData = this.gridFilterData
              .map((obj, key) => ({
                count:
                  obj.accountIds &&
                  obj.accountIds.filter((x) => x != null).length,
                obj: obj,
              }))
              .filter((x) => x.count > 0)
              .map((x) => x.obj);
            this.gridFilterData.forEach((item) => {
              (item.payments = this.groupRes
                .filter((s) => s.accountId == item.accountId)
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next, 0)),
                (item.openPledges = this.groupRes
                  .filter((s) => s.accountId == item.accountId)
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next, 0)),
                (item.raised = this.groupRes
                  .filter((s) => s.accountId == item.accountId)
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next, 0)),
                (item.scheduled = this.groupRes
                  .filter((s) => s.accountId == item.accountId)
                  .map((s) => s.scheduled)
                  .reduce((prev, next) => prev + next, 0));
            });
            this.totalRecord = this.gridFilterData.length;
            this.objAdvancedSearch.accountId = [];
            this.isFiltered = false;
            this.isChipTypeSelected = false;
            this.SortArray();
          } else if (objPaymentTypeChip.key == "-1") {
            // For All
            this.gridFilterData = this.gridFilterData;
            this.gridFilterData.forEach((item) => {
              (item.payments = this.groupRes
                .filter((s) => s.accountId == item.accountId)
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next, 0)),
                (item.openPledges = this.groupRes
                  .filter((s) => s.accountId == item.accountId)
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next, 0)),
                (item.raised = this.groupRes
                  .filter((s) => s.accountId == item.accountId)
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next, 0)),
                (item.scheduled = this.groupRes
                  .filter((s) => s.accountId == item.accountId)
                  .map((s) => s.scheduled)
                  .reduce((prev, next) => prev + next, 0));
            });
            this.totalRecord = this.gridFilterData.length;
            this.objAdvancedSearch.reasonId = [];
            this.isFiltered = false;
            this.isChipTypeSelected = false;
            this.SortArray();
          } else if (!this.isTotalPanelShowAll) {
            this.gridFilterData = this.gridFilterData;
            this.gridFilterData.forEach((item) => {
              (item.payments = this.groupRes
                .filter((s) => s.accountId == item.accountId)
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next, 0)),
                (item.openPledges = this.groupRes
                  .filter((s) => s.accountId == item.accountId)
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next, 0)),
                (item.raised = this.groupRes
                  .filter((s) => s.accountId == item.accountId)
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next, 0)),
                (item.scheduled = this.groupRes
                  .filter((s) => s.accountId == item.accountId)
                  .map((s) => s.scheduled)
                  .reduce((prev, next) => prev + next, 0));
            });
            let sumCardData = this.gridFilterData;
            var donorIds = this.GetDonor(objPaymentTypeChip.key);
            sumCardData = sumCardData.filter(
              (s) =>
                s.accountIds &&
                s.accountIds.indexOf(Number(objPaymentTypeChip.key)) >= 0 &&
                donorIds &&
                donorIds.indexOf(Number(s.accountId)) >= 0
            );
            sumCardData.forEach((item) => {
              (item.payments = this.groupRes
                .filter(
                  (s) =>
                    s.accountId == Number(objPaymentTypeChip.key) &&
                    s.accountId == item.accountId
                )
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next, 0)),
                (item.openPledges = this.groupRes
                  .filter(
                    (s) =>
                      s.accountId == Number(objPaymentTypeChip.key) &&
                      s.accountId == item.accountId
                  )
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next, 0)),
                (item.raised = this.groupRes
                  .filter(
                    (s) =>
                      s.accountId == Number(objPaymentTypeChip.key) &&
                      s.accountId == item.accountId
                  )
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next, 0)),
                (item.scheduled = this.groupRes
                  .filter(
                    (s) =>
                      s.accountId == Number(objPaymentTypeChip.key) &&
                      s.accountId == item.accountId
                  )
                  .map((s) => s.scheduled)
                  .reduce((prev, next) => prev + next, 0));
            });
            this.gridFilterData.forEach((element, index) => {
              sumCardData.forEach((item, index) => {
                if (item.accountId == element.accountId) {
                  this.gridFilterData = this.gridFilterData.filter(
                    (x) => x.accountId != item.accountId
                  );
                }
              });
            });
            this.gridFilterData.forEach((item) => {
              (item.payments = 0),
                (item.openPledges = 0),
                (item.raised = 0),
                (item.scheduled = 0);
            });
            this.gridFilterData = [...sumCardData, ...this.gridFilterData];
            this.isFiltered = false;
            this.isChipTypeSelected = false;
          } else {
            var accountDonorIds = this.GetDonor(objPaymentTypeChip.key);
            this.gridFilterData = this.gridFilterData.filter(
              (s) =>
                s.accountIds &&
                s.accountIds.indexOf(Number(objPaymentTypeChip.key)) >= 0 &&
                accountDonorIds &&
                accountDonorIds.indexOf(Number(s.accountId)) >= 0
            );
            this.gridFilterData.forEach((item) => {
              (item.payments = this.groupRes
                .filter(
                  (s) =>
                    s.accountId == Number(objPaymentTypeChip.key) &&
                    s.accountId == item.accountId
                )
                .map((s) => s.payments)
                .reduce((prev, next) => prev + next, 0)),
                (item.openPledges = this.groupRes
                  .filter(
                    (s) =>
                      s.accountId == Number(objPaymentTypeChip.key) &&
                      s.accountId == item.accountId
                  )
                  .map((s) => s.openPledges)
                  .reduce((prev, next) => prev + next, 0)),
                (item.raised = this.groupRes
                  .filter(
                    (s) =>
                      s.accountId == Number(objPaymentTypeChip.key) &&
                      s.accountId == item.accountId
                  )
                  .map((s) => s.raised)
                  .reduce((prev, next) => prev + next, 0)),
                (item.scheduled = this.groupRes
                  .filter(
                    (s) =>
                      s.accountId == Number(objPaymentTypeChip.key) &&
                      s.accountId == item.accountId
                  )
                  .map((s) => s.scheduled)
                  .reduce((prev, next) => prev + next, 0));
            });
            if (this.objAdvancedSearch) {
              this.objAdvancedSearch.accountId = [];
              this.objAdvancedSearch.accountId.push({
                id: objPaymentTypeChip.key,
                itemName: objPaymentTypeChip.name,
              });
            }
            this.filterRecord = this.gridFilterData.length;
            this.isFiltered = true;
            this.isChipTypeSelected = true;
            this.gridSelectedData = this.gridFilterData;
            this.SortArray();
          }
          break;
      }
    }
  }

  getPaymentChipGroupValue(list): Array<any> {
    return _(list)
      .groupBy("accountId")
      .map((props, id: string) => ({
        ..._.head(props),
        accountId: id,
        payments: _.sumBy(props, "payments"),
        openPledges: _.sumBy(props, "openPledges"),
        scheduled: _.sumBy(props, "scheduled"),
        raised: _.sumBy(props, "raised"),
        //campaignIds: _.uniq(_.map(props, (p) => p.campaignId)),
      }))
      .value();
  }

  mergeDonor() {
    this.isloading = false;
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup merge_donor",
    };
    const modalRef = this.commonMethodService.openPopup(
      DonorMergeComponent,
      this.modalOptions
    );
    modalRef.componentInstance.emtMergeDonorModel.subscribe((res) => {
      this.RefreshDonorList();
    });
  }

  TestcardTypeChange(cardType) {
    this.cardType = cardType;
    this.isSelected = false;
    this.isCustomReport = false;
    // this.gridData=this.gridData;
    this.gridFilterData; //= this.gridSumByData;
    this.isFiltered = false;
    if (cardType[0].itemName == "Campaign") {
      this.paymentTypeChipData = _(this.gridFilterData)
        .filter((s) => s.campaignId != null && s.accountId != null)
        .groupBy("campaignId")
        .map((objs, key) => ({
          name: objs[0].campaign,
          key: key,
          count: this.GetCampaignDonor(objs[0].campaignId).length,
          total:
            this.groupRes
              .filter(
                (x) =>
                  (x.campaignId == objs[0].campaignId && x.accountId != null) ||
                  x.parentCampaignId == objs[0].campaignId
              )
              .map((item) => item.raised).length == 0
              ? 0
              : this.groupRes
                  .filter(
                    (x) =>
                      (x.campaignId == objs[0].campaignId &&
                        x.accountId != null) ||
                      x.parentCampaignId == objs[0].campaignId
                  )
                  .map((item) => item.raised)
                  .reduce((prev, next) => prev + next),
        }))
        .value();

      if (this.paymentTypeChipData.length != 0) {
        var allTotal =
          this.gridOrgTotalPanelData
            .filter((s) => s.accountId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.gridOrgTotalPanelData
                .filter((s) => s.accountId != null)
                .map((item) => item.raised)
                .reduce((prev, next) => prev + next);
        var payment =
          this.gridFilterData
            .filter((s) => s.campaignId != null)
            .map((item) => item.payments).length == 0
            ? 0
            : this.gridFilterData
                .filter((s) => s.campaignId != null)
                .map((item) => item.payments)
                .reduce((prev, next) => prev + next);
        var openpledge =
          this.gridFilterData
            .filter((s) => s.campaignId != null)
            .map((item) => item.openPledges).length == 0
            ? 0
            : this.gridFilterData
                .filter((s) => s.campaignId != null)
                .map((item) => item.openPledges)
                .reduce((prev, next) => prev + next);
        var scheduled =
          this.gridFilterData
            .filter((s) => s.campaignId != null)
            .map((item) => item.scheduled).length == 0
            ? 0
            : this.gridFilterData
                .filter((s) => s.campaignId != null)
                .map((item) => item.scheduled)
                .reduce((prev, next) => prev + next);

        var allLength = this.gridOrgTotalPanelData.length;
        var allArray = {
          name: "ALL",
          key: -2,
          total: allTotal,
          count: allLength,
        };
        this.paymentTypeChipData.unshift(allArray);
      }
    }
    if (cardType[0].itemName == "Reason") {
      this.paymentTypeChipData = _(this.gridFilterData)
        .filter((s) => s.reasonId != null && s.accountId != null)
        .groupBy("reasonId")
        .map((objs, key) => ({
          name: objs[0].reason,
          key: key,
          count: this.GetReasonDonor(objs[0].reasonId).length,
          total: _.sumBy(objs, "raised"),
        }))
        .value();
      if (this.paymentTypeChipData.length != 0) {
        var allTotal =
          this.gridOrgTotalPanelData
            .filter((s) => s.accountId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.gridOrgTotalPanelData
                .filter((s) => s.accountId != null)
                .map((item) => item.raised)
                .reduce((prev, next) => prev + next);
        var allLength = this.gridOrgTotalPanelData.length;
        var allArray = {
          name: "ALL",
          key: -2,
          total: allTotal,
          count: allLength,
        };
        this.paymentTypeChipData.unshift(allArray);
      }
    }
    if (cardType[0].itemName == "Collector") {
      this.paymentTypeChipData = _(this.gridFilterData)
        .filter((s) => s.collectorId != null && s.accountId != null)
        .groupBy("collectorId")
        .map((objs, key) => ({
          name: objs[0].collector,
          key: key,
          count: _.uniq(_.map(objs, (p) => p.accountId)).length,
          total: _.sumBy(objs, "raised"),
        }))
        .value();
      if (this.paymentTypeChipData.length != 0) {
        var allTotal =
          this.gridOrgTotalPanelData
            .filter((s) => s.accountId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.gridOrgTotalPanelData
                .filter((s) => s.accountId != null)
                .map((item) => item.raised)
                .reduce((prev, next) => prev + next);
        var allLength = this.gridOrgTotalPanelData.length;
        var allArray = {
          name: "ALL",
          key: -2,
          total: allTotal,
          count: allLength,
        };
        this.paymentTypeChipData.unshift(allArray);
      }
    }
    if (cardType[0].itemName == "Donor") {
      this.paymentTypeChipData = _(this.gridFilterData)
        .filter((s) => s.accountId != null)
        .groupBy("accountId")
        .map((objs, key) => ({
          name: objs[0].donor,
          key: key,
          count: _.uniq(_.map(objs, (p) => p.accountId)).length,
          total: _.sumBy(objs, "raised"),
        }))
        .value();
      if (this.paymentTypeChipData.length != 0) {
        var allTotal =
          this.gridOrgTotalPanelData
            .filter((s) => s.accountId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.gridOrgTotalPanelData
                .filter((s) => s.accountId != null)
                .map((item) => item.raised)
                .reduce((prev, next) => prev + next);
        var allLength = this.gridOrgTotalPanelData.length;
        var allArray = {
          name: "ALL",
          key: -2,
          total: allTotal,
          count: allLength,
        };
        this.paymentTypeChipData.unshift(allArray);
      }
    }
    if (cardType[0].itemName == "Location") {
      this.paymentTypeChipData = _(this.gridFilterData)
        .filter((s) => s.locationId != null && s.accountId != null)
        .groupBy("locationId")
        .map((objs, key) => ({
          name: objs[0].location,
          key: key,
          count: _.uniq(_.map(objs, (p) => p.accountId)).length,
          total: _.sumBy(objs, "raised"),
        }))
        .value();
      if (this.paymentTypeChipData.length != 0) {
        var allTotal =
          this.gridOrgTotalPanelData
            .filter((s) => s.accountId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.gridOrgTotalPanelData
                .filter((s) => s.accountId != null)
                .map((item) => item.raised)
                .reduce((prev, next) => prev + next);
        var allLength = this.gridOrgTotalPanelData.length;
        var allArray = {
          name: "ALL",
          key: -2,
          total: allTotal,
          count: allLength,
        };
        this.paymentTypeChipData.unshift(allArray);
      }
    }
    if (cardType[0].itemName == "Device") {
      this.paymentTypeChipData = _(this.gridFilterData)
        .filter((s) => s.deviceId != null && s.accountId != null)
        .groupBy("deviceId")
        .map((objs, key) => ({
          name: objs[0].device,
          key: key,
          count: _.uniq(_.map(objs, (p) => p.accountId)).length,
          total: _.sumBy(objs, "raised"),
        }))
        .value();
      if (this.paymentTypeChipData.length != 0) {
        var allTotal =
          this.gridOrgTotalPanelData
            .filter((s) => s.accountId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.gridOrgTotalPanelData
                .filter((s) => s.accountId != null)
                .map((item) => item.raised)
                .reduce((prev, next) => prev + next);
        var allLength = this.gridOrgTotalPanelData.length;
        var allArray = {
          name: "ALL",
          key: -2,
          total: allTotal,
          count: allLength,
        };
        this.paymentTypeChipData.unshift(allArray);
      }
    }
    this.changeSortType(this.sortType);
  }

  GetCampaignDonor(campaignId) {
    var campaignDonorIds = this.groupRes
      .filter(
        (s) => s.campaignId == campaignId || s.parentCampaignId == campaignId
      )
      .map((s) => s.accountId);
    campaignDonorIds = campaignDonorIds.filter(
      (n, i) => campaignDonorIds.indexOf(n) === i
    );
    return campaignDonorIds;
  }

  GetReasonDonor(reasonId) {
    var reasonDonorIds = this.groupRes
      .filter((s) => s.reasonId == reasonId)
      .map((s) => s.accountId);
    reasonDonorIds = reasonDonorIds.filter(
      (n, i) => reasonDonorIds.indexOf(n) === i
    );
    return reasonDonorIds;
  }
  GetLocationDonor(locationId) {
    var locationDonorIds = this.groupRes
      .filter((s) => s.locationId == locationId)
      .map((s) => s.accountId);
    locationDonorIds = locationDonorIds.filter(
      (n, i) => locationDonorIds.indexOf(n) === i
    );
    return locationDonorIds;
  }
  GetCollectorDonor(collectorId) {
    var collectorDonorIds = this.groupRes
      .filter((s) => s.collectorId == collectorId)
      .map((s) => s.accountId);
    collectorDonorIds = collectorDonorIds.filter(
      (n, i) => collectorDonorIds.indexOf(n) === i
    );
    return collectorDonorIds;
  }
  GetDonor(accountId) {
    var DonorIds = this.groupRes
      .filter((s) => s.accountId == accountId)
      .map((s) => s.accountId);
    DonorIds = DonorIds.filter((n, i) => DonorIds.indexOf(n) === i);
    return DonorIds;
  }
  GetDeviceDonor(deviceId) {
    var deviceDonorIds = this.groupRes
      .filter((s) => s.deviceId == deviceId)
      .map((s) => s.accountId);
    deviceDonorIds = deviceDonorIds.filter(
      (n, i) => deviceDonorIds.indexOf(n) === i
    );
    return deviceDonorIds;
  }

  cardTypeChange(cardType) {
    this.pageSyncService.sumbyDonor = cardType;
    this.cardType = cardType;
    this.isSelected = false;
    this.pageSyncService.sumbyDonor = cardType;
    this.isCustomReport = false;
    // this.gridData=this.gridData;
    this.gridFilterData = this.gridSumByData;
    this.isFiltered = false;
    if (cardType[0].itemName == "Campaign") {
      this.paymentTypeChipData = _(this.gridTotalPanelData)
        .filter((s) => s.campaignId != null && s.accountId != null)
        .groupBy("campaignId")
        .map((objs, key) => ({
          name: objs[0].campaign,
          key: key,
          count: this.GetCampaignDonor(objs[0].campaignId).length,
          total:
            this.groupRes
              .filter(
                (x) =>
                  (x.campaignId == objs[0].campaignId && x.accountId != null) ||
                  x.parentCampaignId == objs[0].campaignId
              )
              .map((item) => item.raised).length == 0
              ? 0
              : this.groupRes
                  .filter(
                    (x) =>
                      (x.campaignId == objs[0].campaignId &&
                        x.accountId != null) ||
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
            .filter((s) => s.campaignId != null && s.accountId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.campaignId != null && s.accountId != null)
                .map((item) => item.raised)
                .reduce((prev, next) => prev + next);
        var allDonorTotal =
          this.groupRes
            .filter((s) => s.accountId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.accountId != null)
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
        var allTotalLength = this.gridFilterData.length;
        this.gridSearchFilterData = this.gridFilterData;
        var allLength = this.gridFilterData
          .map((obj, key) => ({
            count:
              obj.campaignIds &&
              obj.campaignIds.filter((x) => x != null).length,
          }))
          .filter((x) => x.count > 0).length;
        this.totalRecord = allTotalLength;
        var totalArray = {
          name: "Total Of Campaigns",
          key: -2,
          total: allTotal,
          count: allLength,
          payment: payment,
          openpledge: openpledge,
          scheduled: scheduled,
        };
        var allArray = {
          name: "ALL",
          key: -1,
          total: allDonorTotal,
          count: allTotalLength,
        };
        this.paymentTypeChipData.unshift(allArray);
        this.paymentTypeChipData.splice(1, 0, totalArray);
        this.selectedItem = allArray;
      } else {
        var allDonorTotal =
          this.groupRes
            .filter((s) => s.accountId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.accountId != null)
                .map((item) => item.raised)
                .reduce((prev, next) => prev + next);
        var allTotalLength = this.gridFilterData.length;
        var allArray = {
          name: "ALL",
          key: -1,
          total: allDonorTotal,
          count: allTotalLength,
        };
        this.paymentTypeChipData.unshift(allArray);
        this.selectedItem = allArray;
      }
    }
    if (cardType[0].itemName == "Reason") {
      this.paymentTypeChipData = _(this.gridTotalPanelData)
        .filter((s) => s.reasonId != null && s.accountId != null)
        .groupBy("reasonId")
        .map((objs, key) => ({
          name: objs[0].reason,
          key: key,
          count: this.GetReasonDonor(objs[0].reasonId).length,
          total:
            this.groupRes
              .filter(
                (x) => x.reasonId == objs[0].reasonId && x.accountId != null
              )
              .map((item) => item.raised).length == 0
              ? 0
              : this.groupRes
                  .filter(
                    (x) => x.reasonId == objs[0].reasonId && x.accountId != null
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
            .filter((s) => s.reasonId != null && s.accountId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.reasonId != null && s.accountId != null)
                .map((item) => item.raised)
                .reduce((prev, next) => prev + next);
        var allDonorTotal =
          this.groupRes
            .filter((s) => s.accountId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.accountId != null)
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
        var allTotalLength = this.gridFilterData.length;
        this.gridSearchFilterData = this.gridFilterData;
        var allLength = this.gridFilterData
          .map((obj, key) => ({
            count:
              obj.reasonIds && obj.reasonIds.filter((x) => x != null).length,
          }))
          .filter((x) => x.count > 0).length;
        this.totalRecord = allTotalLength;
        var totalArray = {
          name: "Total Of Reasons",
          key: -2,
          total: allTotal,
          count: allLength,
          payment: payment,
          openpledge: openpledge,
          scheduled: scheduled,
        };
        var allArray = {
          name: "ALL",
          key: -1,
          total: allDonorTotal,
          count: allTotalLength,
        };
        this.paymentTypeChipData.unshift(allArray);
        this.paymentTypeChipData.splice(1, 0, totalArray);
        this.selectedItem = allArray;
      } else {
        var allDonorTotal =
          this.groupRes
            .filter((s) => s.accountId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.accountId != null)
                .map((item) => item.raised)
                .reduce((prev, next) => prev + next);
        var allTotalLength = this.gridFilterData.length;
        var allArray = {
          name: "ALL",
          key: -1,
          total: allDonorTotal,
          count: allTotalLength,
        };
        this.paymentTypeChipData.unshift(allArray);
        this.selectedItem = allArray;
      }
    }
    if (cardType[0].itemName == "Collector") {
      this.paymentTypeChipData = _(this.gridTotalPanelData)
        .filter((s) => s.collectorId != null && s.accountId != null)
        .groupBy("collectorId")
        .map((objs, key) => ({
          name: objs[0].collector,
          key: key,
          count: this.GetCollectorDonor(objs[0].collectorId).length,
          total:
            this.groupRes
              .filter(
                (x) =>
                  x.collectorId == objs[0].collectorId && x.accountId != null
              )
              .map((item) => item.raised).length == 0
              ? 0
              : this.groupRes
                  .filter(
                    (x) =>
                      x.collectorId == objs[0].collectorId &&
                      x.accountId != null
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
            .filter((s) => s.collectorId != null && s.accountId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.collectorId != null && s.accountId != null)
                .map((item) => item.raised)
                .reduce((prev, next) => prev + next);
        var allDonorTotal =
          this.groupRes
            .filter((s) => s.accountId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.accountId != null)
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
        var allTotalLength = this.gridFilterData.length;
        this.gridSearchFilterData = this.gridFilterData;
        var allLength = this.gridFilterData
          .map((obj, key) => ({
            count:
              obj.collectorIds &&
              obj.collectorIds.filter((x) => x != null).length,
          }))
          .filter((x) => x.count > 0).length;
        this.totalRecord = allTotalLength;
        var totalArray = {
          name: "Total Of Collectors",
          key: -2,
          total: allTotal,
          count: allLength,
          payment: payment,
          openpledge: openpledge,
          scheduled: scheduled,
        };
        var allArray = {
          name: "ALL",
          key: -1,
          total: allDonorTotal,
          count: allTotalLength,
        };
        this.paymentTypeChipData.unshift(allArray);
        this.paymentTypeChipData.splice(1, 0, totalArray);
        this.selectedItem = allArray;
      } else {
        var allDonorTotal =
          this.groupRes
            .filter((s) => s.accountId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.accountId != null)
                .map((item) => item.raised)
                .reduce((prev, next) => prev + next);
        var allTotalLength = this.gridFilterData.length;
        var allArray = {
          name: "ALL",
          key: -1,
          total: allDonorTotal,
          count: allTotalLength,
        };
        this.paymentTypeChipData.unshift(allArray);
        this.selectedItem = allArray;
      }
    }
    if (cardType[0].itemName == "Donor") {
      this.paymentTypeChipData = _(this.gridTotalPanelData)
        .filter((s) => s.accountId != null)
        .groupBy("accountId")
        .map((objs, key) => ({
          name: objs[0].donor,
          key: key,
          count: this.GetDonor(objs[0].accountId).length,
          total:
            this.groupRes
              .filter(
                (x) => x.accountId == objs[0].accountId && x.accountId != null
              )
              .map((item) => item.raised).length == 0
              ? 0
              : this.groupRes
                  .filter(
                    (x) =>
                      x.accountId == objs[0].accountId && x.accountId != null
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
            .filter((s) => s.accountId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.accountId != null)
                .map((item) => item.raised)
                .reduce((prev, next) => prev + next);
        var allDonorTotal =
          this.groupRes
            .filter((s) => s.accountId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.accountId != null)
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
        var allTotalLength = this.gridFilterData.length;
        this.gridSearchFilterData = this.gridFilterData;
        var allLength = this.gridFilterData
          .map((obj, key) => ({
            count:
              obj.accountIds && obj.accountIds.filter((x) => x != null).length,
          }))
          .filter((x) => x.count > 0).length;
        this.totalRecord = allTotalLength;
        var totalArray = {
          name: "Total Of Donors",
          key: -2,
          total: allTotal,
          count: allLength,
          payment: payment,
          openpledge: openpledge,
          scheduled: scheduled,
        };
        var allArray = {
          name: "ALL",
          key: -1,
          total: allDonorTotal,
          count: allTotalLength,
        };
        this.paymentTypeChipData.unshift(allArray);
        this.paymentTypeChipData.splice(1, 0, totalArray);
        this.selectedItem = allArray;
      } else {
        var allDonorTotal =
          this.groupRes
            .filter((s) => s.accountId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.accountId != null)
                .map((item) => item.raised)
                .reduce((prev, next) => prev + next);
        var allTotalLength = this.gridFilterData.length;
        var allArray = {
          name: "ALL",
          key: -1,
          total: allDonorTotal,
          count: allTotalLength,
        };
        this.paymentTypeChipData.unshift(allArray);
        this.selectedItem = allArray;
      }
    }
    if (cardType[0].itemName == "Location") {
      this.paymentTypeChipData = _(this.gridTotalPanelData)
        .filter((s) => s.locationId != null && s.accountId != null)
        .groupBy("locationId")
        .map((objs, key) => ({
          name: objs[0].location,
          key: key,
          count: this.GetLocationDonor(objs[0].locationId).length,
          total:
            this.groupRes
              .filter(
                (x) => x.locationId == objs[0].locationId && x.accountId != null
              )
              .map((item) => item.raised).length == 0
              ? 0
              : this.groupRes
                  .filter(
                    (x) =>
                      x.locationId == objs[0].locationId && x.accountId != null
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
            .filter((s) => s.locationId != null && s.accountId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.locationId != null && s.accountId != null)
                .map((item) => item.raised)
                .reduce((prev, next) => prev + next);
        var allDonorTotal =
          this.groupRes
            .filter((s) => s.accountId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.accountId != null)
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
        var allTotalLength = this.gridFilterData.length;
        this.gridSearchFilterData = this.gridFilterData;
        var allLength = this.gridFilterData
          .map((obj, key) => ({
            count:
              obj.locationIds &&
              obj.locationIds.filter((x) => x != null).length,
          }))
          .filter((x) => x.count > 0).length;
        this.totalRecord = allTotalLength;
        var totalArray = {
          name: "Total Of Locations",
          key: -2,
          total: allTotal,
          count: allLength,
          payment: payment,
          openpledge: openpledge,
          scheduled: scheduled,
        };
        var allArray = {
          name: "ALL",
          key: -1,
          total: allDonorTotal,
          count: allTotalLength,
        };
        this.paymentTypeChipData.unshift(allArray);
        this.paymentTypeChipData.splice(1, 0, totalArray);
        this.selectedItem = allArray;
      } else {
        var allDonorTotal =
          this.groupRes
            .filter((s) => s.accountId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.accountId != null)
                .map((item) => item.raised)
                .reduce((prev, next) => prev + next);
        var allTotalLength = this.gridFilterData.length;
        var allArray = {
          name: "ALL",
          key: -1,
          total: allDonorTotal,
          count: allTotalLength,
        };
        this.paymentTypeChipData.unshift(allArray);
        this.selectedItem = allArray;
      }
    }
    if (cardType[0].itemName == "Device") {
      this.paymentTypeChipData = _(this.gridTotalPanelData)
        .filter((s) => s.deviceId != null && s.accountId != null)
        .groupBy("deviceId")
        .map((objs, key) => ({
          name: objs[0].device,
          key: key,
          count: this.GetDeviceDonor(objs[0].deviceId).length,
          total:
            this.groupRes
              .filter(
                (x) => x.deviceId == objs[0].deviceId && x.accountId != null
              )
              .map((item) => item.raised).length == 0
              ? 0
              : this.groupRes
                  .filter(
                    (x) => x.deviceId == objs[0].deviceId && x.accountId != null
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
            .filter((s) => s.deviceId != null && s.accountId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.deviceId != null && s.accountId != null)
                .map((item) => item.raised)
                .reduce((prev, next) => prev + next);
        var allDonorTotal =
          this.groupRes
            .filter((s) => s.accountId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.accountId != null)
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
        var allTotalLength = this.gridFilterData.length;
        this.gridSearchFilterData = this.gridFilterData;
        var allLength = this.gridFilterData
          .map((obj, key) => ({
            count:
              obj.deviceIds && obj.deviceIds.filter((x) => x != null).length,
          }))
          .filter((x) => x.count > 0).length;
        this.totalRecord = allTotalLength;
        var totalArray = {
          name: "Total Of Devices",
          key: -2,
          total: allTotal,
          count: allLength,
          payment: payment,
          openpledge: openpledge,
          scheduled: scheduled,
        };
        var allArray = {
          name: "ALL",
          key: -1,
          total: allDonorTotal,
          count: allTotalLength,
        };
        this.paymentTypeChipData.unshift(allArray);
        this.paymentTypeChipData.splice(1, 0, totalArray);
        this.selectedItem = allArray;
      } else {
        var allDonorTotal =
          this.groupRes
            .filter((s) => s.accountId != null)
            .map((item) => item.raised).length == 0
            ? 0
            : this.groupRes
                .filter((s) => s.accountId != null)
                .map((item) => item.raised)
                .reduce((prev, next) => prev + next);
        var allTotalLength = this.gridFilterData.length;
        var allArray = {
          name: "ALL",
          key: -1,
          total: allDonorTotal,
          count: allTotalLength,
        };
        this.paymentTypeChipData.unshift(allArray);
        this.selectedItem = allArray;
      }
    }
    this.changeSortType(this.sortType);
    this.isloading = false;
  }

  changeSortType(sortType) {
    this.sortType = sortType;
    const sortId = sortType.map((s) => s.id).toString();
    const allTypeCard = this.paymentTypeChipData.filter((x) => x.name == "ALL");
    const totalTypeCard = this.paymentTypeChipData.filter(
      (x) => x.name && x.name.includes("Total")
    );
    this.paymentTypeChipData = this.paymentTypeChipData.filter(
      (x) => x.name != "ALL" && x.name && !x.name.includes("Total")
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
    this.pageSyncService.donorlistTotalPanel = isVisible;
    if (!isVisible) {
      this.openTotalPanel();
    } else {
      this.closeTotalPanel();
    }
    this.settingOpenClose();
  }
  openTotalPanel() {
    this.isTotalPanelVisible = true;
    this.panelTitle = "Hide Total Panel";

    this.colFields = this.colFields.map((o) => {
      if (o.title === "Total Panel") {
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
    this.panelTitle = "SHOWTOTALPANEL";
    this.isTotalPanelVisible = false;
    this.isChipTypeSelected = false;
    this.isDonorOpenPledgesColVisible = false;
    this.isDonorPaymentsColVisible = false;
    this.isDonorRaisedColVisible = false;
    this.isDonorScheduledColVisible = false;

    this.isDonorOpenPledgesCountColVisible = false;
    this.isDonorPaymentsCountColVisible = false;
    this.isDonorScheduledCountColVisible = false;
    this.gridTotalPanelData = null;
    if (this.objAdvancedSearch != null) {
      this.objAdvancedSearch.isTotalPanel = false;
    }

    this.isinitialize = 0;
    this.isTotalPanelShowAll = true;

    this.colFields = this.colFields.map((o) => {
      if (o.title === "Total Panel") {
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
    //for issue comments

    this.gridFilterData = this.gridData;
    this.totalRecord = this.gridData.length;
    this.isFiltered = false;
    if (this.objAdvancedSearch != null) {
      this.filterLocalData();
    }

    // this.searchDonorData();

    if (this.selectedDateRange && this.selectedDateRange.startDate === null) {
      this.selectedDateRange = undefined;
    }

    //var $table = $('table.redesign_table');
    // $table.floatThead('reflow');
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

  dropGroup(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.colFields, event.previousIndex, event.currentIndex);
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
    moveItemInArray(this.colFields, event.previousIndex, event.currentIndex);
    moveItemInArray(
      this.gridFilterData,
      event.previousIndex,
      event.currentIndex
    );
  }

  formatPhoneNumber(phoneNumberString) {
    return this.commonMethodService.formatPhoneNumber(phoneNumberString);
  }

  selectRecord(event, type, accountId) {
    if (type == "selectAll") {
      this.isBulkCheckbox = true;
      if (event.target.checked) {
        this.isSelected = true;
        this.recordSelectedArray = [];
        this.donorSelectedArray = [];
        this.isCustomReport = true;
        this.gridFilterData.forEach((element) => {
          this.recordSelectedArray.push(element.accountId);
          this.donorSelectedArray.push(element);
        });
        let count = $("#scrollDonorList tr").length;
        this.displayThisPageCount =
          this.gridFilterData && this.gridFilterData.length > 0 ? count - 1 : 0;
      } else {
        this.isSelected = false;
        this.isCustomReport = false;
        this.checkboxes.forEach((element) => {
          element.nativeElement.checked = false;
        });
        this.recordSelectedArray = [];
        this.donorSelectedArray = [];
        this.isSelected = false;
      }
    } else {
      if (event.target.checked) {
        if (!this.recordSelectedArray.includes(accountId)) {
          this.recordSelectedArray.push(accountId);
          let donor = this.gridFilterData.find(
            (donor) => donor.accountId == accountId
          );
          this.donorSelectedArray.push(donor);
        }
        if (this.recordSelectedArray.length > 1) {
          this.isSelected = true;
        }
        if (this.recordSelectedArray.length > 0) {
          this.isCustomReport = true;
        }
      } else {
        if (this.recordSelectedArray.includes(accountId)) {
          this.recordSelectedArray.forEach((element, index) => {
            if (element == accountId) this.recordSelectedArray.splice(index, 1);
          });
          if (this.recordSelectedArray.length <= 1) {
            this.isSelected = false;
          }
          if (this.recordSelectedArray.length == 0) {
            this.isCustomReport = false;
          }
          $("#select_all").prop("checked", false);
        }

        let accountIds: any[] = this.donorSelectedArray.map(
          (donor) => donor.accountId
        );
        if (accountIds.includes(accountId)) {
          accountIds.forEach((element, index) => {
            if (element == accountId) this.donorSelectedArray.splice(index, 1);
          });
        }
      }
    }
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

  setGridColVisibility($event, colName, isVisible) {
    var fieldsData = this.pageSyncService.donorFieldsCol;
    var obj = fieldsData.find((data) => Object.keys(data)[0] === colName);
    obj
      ? (obj[colName] = isVisible)
      : fieldsData.push({ [colName]: isVisible });
    colName = colName.toLowerCase().replace(/\s/g, "");

    switch (colName) {
      case "acct#":
        this.isDonorAccountNoColVisible = isVisible;
        this.uiPageSetting.isDonorAccountNoColVisible = isVisible;
        break;
      case "fullname":
        this.isDonorFullNameColVisible = isVisible;
        this.uiPageSetting.isDonorFullNameColVisible = isVisible;
        break;
      case "englishname":
        this.isDonorFullNameEnglishColVisible = isVisible;
        this.uiPageSetting.isDonorFullNameEnglishColVisible = isVisible;
        break;
      case "yiddishname":
        this.isDonorFullNameJewishColVisible = isVisible;
        this.uiPageSetting.isDonorFullNameJewishColVisible = isVisible;
        break;
      case "address":
        this.isDonorAddressColVisible = isVisible;
        this.uiPageSetting.isDonorAddressColVisible = isVisible;
        break;
      case "phone":
        this.isDonorPhoneLabelColVisible = isVisible;
        this.uiPageSetting.isDonorPhoneLabelColVisible = isVisible;
        break;
      case "family":
        this.isDonorFamilyColVisible = isVisible;
        this.uiPageSetting.isDonorFamilyColVisible = isVisible;
        break;
      case "email":
        this.isDonorEmailColVisible = isVisible;
        this.uiPageSetting.isDonorEmailColVisible = isVisible;
        break;
      case "group":
        this.isDonorGroupColVisible = isVisible;
        this.uiPageSetting.isDonorGroupColVisible = isVisible;
        break;
      case "class":
        this.isDonorClassColVisible = isVisible;
        this.uiPageSetting.isDonorClassColVisible = isVisible;
        break;
      case "citystatezip":
        this.isDonorCityStateZipColVisible = isVisible;
        this.uiPageSetting.isDonorCityStateZipColVisible = isVisible;
        break;
      case "note":
        this.isDonorNoteColVisible = isVisible;
        this.uiPageSetting.isDonorNoteColVisible = isVisible;
        break;
      case "father":
        this.isDonorFatherColVisible = isVisible;
        this.uiPageSetting.isDonorFatherColVisible = isVisible;
        break;
      case "fatherinlaw":
        this.isDonorFatherInLawColVisible = isVisible;
        this.uiPageSetting.isDonorFatherInLawColVisible = isVisible;
        break;
      case "tags":
        this.isDonorTagColVisible = isVisible;
        this.uiPageSetting.isDonorTagColVisible = isVisible;
        break;

      // Total Panel
      case "payments":
        this.isDonorPaymentsColVisible = isVisible;
        this.uiPageSetting.isDonorPaymentsColVisible = isVisible;
        break;
      case "openpledges":
        this.isDonorOpenPledgesColVisible = isVisible;
        this.uiPageSetting.isDonorOpenPledgesColVisible = isVisible;
        break;
      case "scheduled":
        this.isDonorScheduledColVisible = isVisible;
        this.uiPageSetting.isDonorScheduledColVisible = isVisible;
        break;
      case "countofpayments":
        this.isDonorPaymentsCountColVisible = isVisible;
        this.uiPageSetting.isDonorPaymentsCountColVisible = isVisible;
        break;
      case "countofpledges":
        this.isDonorOpenPledgesCountColVisible = isVisible;
        this.uiPageSetting.isDonorOpenPledgesCountColVisible = isVisible;
        break;
      case "countofschedules":
        this.isDonorScheduledCountColVisible = isVisible;
        this.uiPageSetting.isDonorScheduledCountColVisible = isVisible;
        break;
      case "total":
        this.isDonorRaisedColVisible = isVisible;
        this.uiPageSetting.isDonorRaisedColVisible = isVisible;
        break;
      case "englishtitle":
        this.isDonorTitleColVisible = isVisible;
        this.uiPageSetting.isDonorTitleColVisible = isVisible;
        break;
      case "englishfirstname":
        this.isDonorFirstNameColVisible = isVisible;
        this.uiPageSetting.isDonorFirstNameColVisible = isVisible;
        break;
      case "englishlastname":
        this.isDonorLastNameColVisible = isVisible;
        this.uiPageSetting.isDonorLastNameColVisible = isVisible;
        break;
      case "yiddishfirsttitle":
        this.isDonorTitleJewishColVisible = isVisible;
        this.uiPageSetting.isDonorTitleJewishColVisible = isVisible;
        break;
      case "yiddishfirstname":
        this.isDonorFirstNameJewishColVisible = isVisible;
        this.uiPageSetting.isDonorFirstNameJewishColVisible = isVisible;
        break;
      case "yiddishlastname":
        this.isDonorLastNameJewishColVisible = isVisible;
        this.uiPageSetting.isDonorLastNameJewishColVisible = isVisible;
        break;
      case "yiddishlasttitle":
        this.isDonorSuffixJewishColVisible = isVisible;
        this.uiPageSetting.isDonorSuffixJewishColVisible = isVisible;
        break;
    }

    $event.stopPropagation();
  }

  checkGridColVisibility(colName) {
    let tempColName = colName;
    colName = colName.toLowerCase().replace(/\s/g, "");
    switch (colName) {
      case "acct#":
        return this.isDonorAccountNoColVisible;
      case "fullname":
        return this.isDonorFullNameColVisible;
      case "englishname":
        return this.isDonorFullNameEnglishColVisible;
      case "yiddishname":
        return this.isDonorFullNameJewishColVisible;
      case "address":
        return this.isDonorAddressColVisible;
      case "phone":
        return this.isDonorPhoneLabelColVisible;
      case "family":
        return this.isDonorFamilyColVisible;
      case "email":
        return this.isDonorEmailColVisible;
      case "group":
        return this.isDonorGroupColVisible;
      case "class":
        return this.isDonorClassColVisible;
      case "citystatezip":
        return this.isDonorCityStateZipColVisible;
      case "note":
        return this.isDonorNoteColVisible;
      case "father":
        return this.isDonorFatherColVisible;
      case "fatherinlaw":
        return this.isDonorFatherInLawColVisible;
      case "tags":
        return this.isDonorTagColVisible;
      case "payments":
        return this.isDonorPaymentsColVisible;
      case "openpledges":
        return this.isDonorOpenPledgesColVisible;
      case "scheduled":
        return this.isDonorScheduledColVisible;
      case "countofpayments":
        return this.isDonorPaymentsCountColVisible;
      case "countofpledges":
        return this.isDonorOpenPledgesCountColVisible;
      case "countofschedules":
        return this.isDonorScheduledCountColVisible;
      case "total":
        return this.isDonorRaisedColVisible;
      case "englishtitle":
        return this.isDonorTitleColVisible;
      case "englishfirstname":
        return this.isDonorFirstNameColVisible;
      case "englishlastname":
        return this.isDonorLastNameColVisible;
      case "yiddishfirsttitle":
        return this.isDonorTitleJewishColVisible;
      case "yiddishfirstname":
        return this.isDonorFirstNameJewishColVisible;
      case "yiddishlastname":
        return this.isDonorLastNameJewishColVisible;
      case "yiddishlasttitle":
        return this.isDonorSuffixJewishColVisible;
      default:
        let result = this.colFields[0].items.filter(
          (x) => x.colName == tempColName
        );
        return result && result.length > 0 ? result[0].isVisible : false;
    }
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
  SaveLayout() {
    let setting = {
      isDonorAccountNoColVisible: this.isDonorAccountNoColVisible,
      isDonorFullNameColVisible: this.isDonorFullNameColVisible,
      isDonorFullNameEnglishColVisible: this.isDonorFullNameEnglishColVisible,
      isDonorFullNameJewishColVisible: this.isDonorFullNameJewishColVisible,
      isDonorAddressColVisible: this.isDonorAddressColVisible,
      isDonorPhoneLabelColVisible: this.isDonorPhoneLabelColVisible,
      isDonorFamilyColVisible: this.isDonorFamilyColVisible,
      isDonorEmailColVisible: this.isDonorEmailColVisible,
      isDonorGroupColVisible: this.isDonorGroupColVisible,
      isDonorClassColVisible: this.isDonorClassColVisible,
      isDonorCityStateZipColVisible: this.isDonorCityStateZipColVisible,
      isDonorNoteColVisible: this.isDonorNoteColVisible,
      isDonorFatherColVisible: this.isDonorFatherColVisible,
      isDonorFatherInLawColVisible: this.isDonorFatherInLawColVisible,
      isDonorTagColVisible: this.isDonorTagColVisible,
      isDonorPaymentsColVisible: this.isDonorPaymentsColVisible,
      isDonorOpenPledgesColVisible: this.isDonorOpenPledgesColVisible,
      isDonorScheduledColVisible: this.isDonorScheduledColVisible,
      isDonorPaymentsCountColVisible: this.isDonorPaymentsCountColVisible,
      isDonorOpenPledgesCountColVisible: this.isDonorOpenPledgesCountColVisible,
      isDonorScheduledCountColVisible: this.isDonorScheduledCountColVisible,
      isDonorRaisedColVisible: this.isDonorRaisedColVisible,
      isDonorTitleColVisible: this.isDonorTitleColVisible,
      isDonorFirstNameColVisible: this.isDonorFirstNameColVisible,
      isDonorLastNameColVisible: this.isDonorLastNameColVisible,
      isDonorTitleJewishColVisible: this.isDonorTitleJewishColVisible,
      isDonorFirstNameJewishColVisible: this.isDonorFirstNameJewishColVisible,
      isDonorLastNameJewishColVisible: this.isDonorLastNameJewishColVisible,
      isDonorSuffixJewishColVisible: this.isDonorSuffixJewishColVisible,
      donorStartDate:
        this.selectedDateRange != undefined
          ? this.selectedDateRange.startDate
          : null,
      donorEndDate:
        this.selectedDateRange != undefined
          ? this.selectedDateRange.endDate
          : null,
      donorSumBy: this.cardType,
      donorSearchitem: this.objAdvancedSearch,
      donorIsTotalPanelVisible: this.isTotalPanelVisible,
      isTotalPanelShowAll: this.isTotalPanelShowAll,
      colFields: this.colFields,
      EngHebCalPlaceholder: this.EngHebCalPlaceholder,
      donorCalendarPlaceHolderId: this.hebrewEngishCalendarService.id,
    };
    let objLayout = {
      uiPageSettingId: this.uiPageSettingId,
      userId: this.localstoragedataService.getLoginUserId(),
      moduleName: "lists",
      screenName: "donors",
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

  checkIsNormalFieldColId(value) {
    return typeof value === "string";
  }

  checkIsAdvanceFieldColId(value) {
    return typeof value === "number";
  }

  checkGridAdvancedColVisibilityIfMove(id) {
    const advGroup = this.colFields.find((o) => {
      return o.id === 1;
    });
    if (!advGroup || !advGroup.items) {
      return false;
    }
    const as = advGroup.items.find((v) => {
      return v.colId === id && v.isVisible;
    });
    if (as) {
      return true;
    }

    return false;
  }

  checkGridAdvancedColVisibility(id) {
    const advGroup = this.colFields.find((o) => {
      return o.id === 2;
    });
    if (!advGroup || !advGroup.items) {
      return false;
    }
    const as = advGroup.items.find((v) => {
      return v.colId === id && v.isVisible;
    });
    if (as) {
      return true;
    }

    return false;
  }

  setGridAdvancedColVisibility(id) {
    const targetObject = this.colFields.find((o) => o.id === 2);
    if (targetObject) {
      const targetItem = targetObject.items.find((v) => v.colId === id);
      if (targetItem) {
        targetItem.isVisible = targetItem.isVisible;
      }
    }
  }

  viewOfAdvanceFieldValue(name, item) {
    if (!item) {
      return null;
    }

    if (!item.advancedFieldNameAndValue) {
      return null;
    }

    const field = item.advancedFieldNameAndValue.find((a) => {
      return a.fieldname === name;
    });

    if (field && field.fieldValue) {
      return field.fieldValue;
    }
  }

  searchDonorData() {
    this.isloading = true;
    this.isSelected = false;
    this.recordSelectedArray = [];
    this.isCustomReport = false;
    let objSearch = this.objAdvancedSearch;
    let objAdvancedSearchData: any = {};
    if (this.objAdvancedSearch) {
      if (!this.objAdvancedSearch.isTotalPanel) {
        objAdvancedSearchData = {
          // Get only Id values for multi select dropdown
          accountNo: this.objAdvancedSearch.accountNo,
          fullNameJewish: this.objAdvancedSearch.fullNameJewish,
          fullName: this.objAdvancedSearch.fullName,
          city: this.objAdvancedSearch.city,
          state: this.objAdvancedSearch.state,
          zip: this.objAdvancedSearch.zip,
          defaultLocations:
            this.objAdvancedSearch.defaultLocation &&
            this.objAdvancedSearch.defaultLocation.length > 0
              ? parseInt(
                  this.objAdvancedSearch.defaultLocation.map((s) => s.id)
                )
              : null,
          group: this.objAdvancedSearch.group,
          class: this.objAdvancedSearch.class,
          note: this.objAdvancedSearch.note,
          phone: this.objAdvancedSearch.phone,
          email: this.objAdvancedSearch.email,
          father: this.objAdvancedSearch.father,
          fatherInLaw: this.objAdvancedSearch.fatherInLaw,
          //"status": this.objAdvancedSearch.status,
          tags:
            this.objAdvancedSearch.tags &&
            this.objAdvancedSearch.tags.map((a) => a.tagName),
        };
      } else {
        objAdvancedSearchData = {
          // Get only Id values for multi select dropdown
          collectorId: this.objAdvancedSearch.collectorId,
          locationId: this.objAdvancedSearch.locationId,
          campaignId: this.objAdvancedSearch.campaignId,
          reasonId: this.objAdvancedSearch.reasonId,
          tags:
            this.objAdvancedSearch.tags &&
            this.objAdvancedSearch.tags.map((a) => a.tagName),
        };
      }

      //this.filtercount = 0
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
    var objsearchDonor = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      accountNo: objAdvancedSearchData && objAdvancedSearchData.accountNo,
      fullNameJewish:
        objAdvancedSearchData && objAdvancedSearchData.fullNameJewish,
      fullName: objAdvancedSearchData && objAdvancedSearchData.fullName,
      city: objAdvancedSearchData && objAdvancedSearchData.city,
      state: objAdvancedSearchData && objAdvancedSearchData.state,
      zip: objAdvancedSearchData && objAdvancedSearchData.zip,
      defaultLocations:
        objAdvancedSearchData &&
        objAdvancedSearchData.defaultLocation &&
        objAdvancedSearchData.defaultLocation.length > 0
          ? parseInt(objAdvancedSearchData.defaultLocation.map((s) => s.id))
          : null,
      group: objAdvancedSearchData && objAdvancedSearchData.group,
      class: objAdvancedSearchData && objAdvancedSearchData.class,
      note: objAdvancedSearchData && objAdvancedSearchData.note,
      phone: objAdvancedSearchData && objAdvancedSearchData.phone,
      email: objAdvancedSearchData && objAdvancedSearchData.email,
      father: objAdvancedSearchData && objAdvancedSearchData.father,
      fatherInLaw: objAdvancedSearchData && objAdvancedSearchData.fatherInLaw,
      status: objAdvancedSearchData && objAdvancedSearchData.status,
      listFilters: {
        campaigns:
          objAdvancedSearchData &&
          objAdvancedSearchData.campaignId &&
          objAdvancedSearchData.campaignId.length > 0
            ? objAdvancedSearchData.campaignId.map((s) => s.id)
            : null,
        locations:
          objAdvancedSearchData &&
          objAdvancedSearchData.locationId &&
          objAdvancedSearchData.locationId.length > 0
            ? objAdvancedSearchData.locationId.map((s) => s.id)
            : null,
        reasons:
          objAdvancedSearchData &&
          objAdvancedSearchData.reasonId &&
          objAdvancedSearchData.reasonId.length > 0
            ? objAdvancedSearchData.reasonId.map((s) => s.id)
            : null,
        sources:
          objAdvancedSearchData &&
          objAdvancedSearchData.sourceId &&
          objAdvancedSearchData.sourceId.length > 0
            ? objAdvancedSearchData.sourceId.map((s) => s.id)
            : null,
        collectors:
          objAdvancedSearchData &&
          objAdvancedSearchData.collectorId &&
          objAdvancedSearchData.collectorId.length > 0
            ? objAdvancedSearchData.collectorId.map((s) => s.id)
            : null,
        advancedFields:
          objAdvancedSearchData &&
          objAdvancedSearchData.AdvancedFields &&
          objAdvancedSearchData.AdvancedFields.length > 0
            ? objAdvancedSearchData.AdvancedFields
            : null,
        tags:
          objAdvancedSearchData &&
          objAdvancedSearchData.tags &&
          objAdvancedSearchData.tags.length > 0
            ? objAdvancedSearchData.tags
            : [],
      },
    };
    this.donorService.getDonorList(objsearchDonor).subscribe(
      (res: any) => {
        // hide loader
        this.isFiltered = false;
        if (res) {
          //after donor api response we are calling getTotalPanel to avoid any issue
          if (this.isTotalPanelVisible) {
            this.getTotalPanel();
          }

          this.objAdvancedSearch = objSearch;
          // if (this.objAdvancedSearch && this.objAdvancedSearch.status) {

          // } else {
          // res = res.filter(x => x.donorStatus != "InActive");
          // this.commonMethodService.localDonorList = res;
          // }
          this.commonMethodService.localDonorList = res;
          this.totalRecord = res.length;
          //var advancedFieldList=[];
          for (var i = 0; i < res.length; i++) {
            if (res[i].phoneLabels && res[i].phoneLabels.indexOf(",") > -1) {
              var lblArray = res[i].phoneLabels.split(",").slice(0, 2);
              var phoneLblArray = [];

              for (var k = 0; k < lblArray.length; k++) {
                if (lblArray[k].trim() == "") {
                  lblArray[k] = "O";
                }
                if (
                  lblArray[k].trim().charAt(0).toLowerCase() == "c" ||
                  lblArray[k].trim().charAt(0).toLowerCase() == "h"
                ) {
                  lblArray[k] = lblArray[k];
                } else {
                  lblArray[k] = "O";
                }
                phoneLblArray.push(lblArray[k].trim().charAt(0));
              }
              let phoneNoArray =
                res[i].phonenumbers && res[i].phonenumbers.split(",");

              res[i].phoneLabels2 = "";
              for (let j = 0; j < phoneLblArray.length; j++) {
                if (phoneNoArray && phoneNoArray[j]) {
                  let brTag = res[i].phoneLabels2 ? "<br>" : "";
                  res[i].phoneLabels2 =
                    res[i].phoneLabels2 +
                    brTag +
                    phoneLblArray[j] +
                    ": " +
                    this.formatPhoneNumber(phoneNoArray[j]);
                }
              }
            } else {
              if (res[i].phoneLabels) {
                if (
                  res[i].phoneLabels.trim().charAt(0).toLowerCase() == "c" ||
                  res[i].phoneLabels.trim().charAt(0).toLowerCase() == "h"
                ) {
                  res[i].phoneLabels = res[i].phoneLabels;
                } else {
                  res[i].phoneLabels = "O";
                }
                res[i].phoneLabels2 =
                  res[i].phoneLabels.trim().charAt(0) +
                  ": " +
                  this.formatPhoneNumber(res[i].phonenumbers);
              }
            }
            if (res[i].emailLabels && res[i].emailLabels.indexOf(",") > -1) {
              var emailLblArray = res[i].emailLabels.split(",").slice(0, 2);
              var emailaddressArray = res[i].emails.split(",").slice(0, 2);

              for (var j = 0; j < emailLblArray.length; j++) {
                if (res[i].emailLabels2)
                  res[i].emailLabels2 =
                    res[i].emailLabels2 +
                    "<br>" +
                    emailLblArray[j] +
                    ": " +
                    emailaddressArray[j];
                else
                  res[i].emailLabels2 =
                    emailLblArray[j] + ": " + emailaddressArray[j];
              }

              for (var j = 0; j < emailaddressArray.length; j++) {
                if (res[i].emailLabels3)
                  res[i].emailLabels3 =
                    res[i].emailLabels3 + "<br>" + emailaddressArray[j];
                else res[i].emailLabels3 = emailaddressArray[j];
              }
            } else {
              res[i].emailLabels2 = res[i].emailLabels + ": " + res[i].emails;
            }
            //res.fullName=res.fullName +"<br>"+res.fullNameJewish;
            if (res[i].fullName == "") {
              res[i].fullName =
                res[i].title + " " + res[i].firstName + " " + res[i].lastName;
            }
            if (res[i].fullNameJewish == "") {
              res[i].fullNameJewish =
                res[i].titleJewish +
                " " +
                res[i].firstNameJewish +
                " " +
                res[i].lastNameJewish;
            }
            if (res[i].tagNames) {
              res[i].tagNames = res[i].tagNames.replaceAll(":", "");
              if (res[i].tagNames.indexOf(",") > -1) {
                var tagNameArray = res[i].tagNames.split(",");
                var tagValueArray = res[i].tagValues.split(",");
                for (var j = 0; j < tagNameArray.length; j++) {
                  if (res[i].tagFormat)
                    res[i].tagFormat =
                      res[i].tagFormat +
                      '<span class="tag_' +
                      tagValueArray[j].trim() +
                      '">' +
                      tagNameArray[j] +
                      "</span>";
                  else
                    res[i].tagFormat =
                      '<span class="tag_' +
                      tagValueArray[j].trim() +
                      '">' +
                      tagNameArray[j] +
                      "</span>";
                }
              } else {
                res[i].tagFormat =
                  '<span class="tag_' +
                  res[i].tagValues +
                  '">' +
                  res[i].tagNames +
                  "</span>";
              }
            }
            res[i].openPledges = 0;
            res[i].payments = 0;
            res[i].raised = 0;
            res[i].paymentsCount = 0;
            res[i].schedulesCount = 0;
            res[i].pledgesCount = 0;
            res[i].scheduled = 0;

            //  Advance Fields Columns
            if (res[i].advancedFieldNames && res[i].advancedFieldValues) {
              const nameAndValue = [];
              let arrAFN = res[i].advancedFieldNames.split(",");
              let arrAFV = res[i].advancedFieldValues.split(",");

              for (let index = 0; index < arrAFN.length; index++) {
                const fieldname = arrAFN[index];
                const fieldValue = arrAFV[index];
                nameAndValue.push({
                  fieldname:
                    this.advancedFieldService.formatFieldName(fieldname),
                  fieldValue: _.trim(fieldValue),
                });
              }

              res[i].advancedFieldNameAndValue = nameAndValue;
              //advancedFieldList.push({  nameAndValue })
            }
          }
          //var advField= res.filter(x => x.advancedFieldNameAndValue)[0];
          //this.objAdvancedSearch={advancedFields : advancedFieldList}
          this.gridData = res;
          this.gridFilterData = this.gridData;
          this.gridOrgData = res;
          this.isloading = false;
          this.detectChanges();
          this.pageSyncService.donorList = this.gridData;
          this.pageSyncService.isDonorListClicked = true;
          this.pageSyncService.lastSyncListTime = new Date();
          this.pageSyncService.calculateTimeDifference("list");
          this.resListModification(res);
          if (this.gridTotalPanelData) {
            this.gridTotalPanelData = this.FilterTotalPanelData(
              this.objAdvancedSearch
            );
            if (this.isTotalPanelShowAll) {
              this.showOnlyTotalData();
            } else {
              this.showAllTotalData();
            }
            this.initMultiSelect();
          } else {
            this.objAdvancedSearch = {
              ...this.objAdvancedSearch,
              status:
                this.objAdvancedSearch && this.objAdvancedSearch.status != null
                  ? this.objAdvancedSearch.status
                  : "0",
            };
          }
          this.initMultiSelect();
        } else {
          this.totalRecord = 0;
          this.gridData = null;
          this.commonMethodService.localDonorList = [];
          this.gridFilterData = this.gridData;
          this.commonMethodService.localDonorList = [];
        }
        this.isloading = false;
        this.changeDetectorRef.detectChanges();
        this.commonMethodService.sendDataLoaded("donor");
        setTimeout(() => {
          this.tableRowFocued();
        }, 10);
      },
      (error) => {
        this.isloading = false;
        console.log(error);
        // this.notificationService.showError(error.error, "Error while fetching data !!");
      }
    );
    if (
      this.pageSyncService &&
      this.pageSyncService.advancedFieldList &&
      this.pageSyncService.advancedFieldList.length == 0
    ) {
      this.getAFVColumns();
    } else {
      this.advanceFieldModification(this.pageSyncService.advancedFieldList);
    }
  }

  resListModification(res) {
    if (this.gridTotalPanelData) {
      this.gridTotalPanelData = this.FilterTotalPanelData(
        this.objAdvancedSearch
      );
      if (this.isTotalPanelShowAll) {
        this.showOnlyTotalData();
      } else {
        this.showAllTotalData();
      }
      this.initMultiSelect();
    } else {
      this.totalRecord = res.length;
      this.gridData = res;
      this.gridFilterData = this.gridData;

      if (
        this.objAdvancedSearch &&
        this.objAdvancedSearch.isTotalPanel !== undefined &&
        this.objAdvancedSearch.isTotalPanel !== null
      ) {
        this.objAdvancedSearch = this.objAdvancedSearch;
      } else {
        this.objAdvancedSearch = { status: "0" };
      }

      this.filterLocalData();

      this.gridData = this.gridFilterData;
      this.gridFilterData = this.EnglishOnly();
    }

    this.initMultiSelect();
  }

  AddNewTag() {
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup addtag",
    };
    const modalRef = this.commonMethodService.openPopup(
      DonorAddtagPopupComponent,
      this.modalOptions
    );

    modalRef.componentInstance.Type = "add";
    modalRef.componentInstance.emtOutputTagUpdate.subscribe((res) => {
      this.newDonorTagList.push({ ...res });
    });
  }

  OpenBulkStatementPopup() {
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup bulk_statement_card",
    };
    const modalRef = this.commonMethodService.openPopup(
      BulkStatementPopupComponent,
      this.modalOptions
    );
    var resultArray = [];
    for (const item of this.recordSelectedArray) {
      var donorDetails = this.gridOrgData.find((x) => x.accountId == item);
      resultArray.push(donorDetails);
    }

    modalRef.componentInstance.SelectedId = this.recordSelectedArray;
    modalRef.componentInstance.List = resultArray;
    modalRef.componentInstance.Info = { type: "Statement" };
    modalRef.componentInstance.Duration = this.selectedDateRange;
    modalRef.componentInstance.grid = this.gridOrgData;
    modalRef.componentInstance.donorIds = this.donorIds;
  }

  BulkTagAction(tagId, tagName) {
    var selectedArray = this.recordSelectedArray;
    Swal.fire({
      icon: "warning",
      input: "number",
      showClass: {
        popup: `
              swal2-modal-primary
            `,
      },
      html: `<div>
                 <h2>Edit ${this.recordSelectedArray.length} donors?</h2>
                 <p>You're editing multiple donors.</p>
                 <span>To continue, type the amount of donors you selected. </span>
             </div>`,
      showCloseButton: true,
      confirmButtonText: this.commonMethodService.getTranslate("CONFIRM"),
      confirmButtonColor: "#7b5bc4",
      customClass: { confirmButton: "modal-are-you-sure" },
      didOpen: () => {
        $(".swal2-actions").on("click", () =>
          $("#swal2-content + .swal2-input").focus()
        );
      },
      inputValidator: (value: any) => {
        if (value != this.recordSelectedArray.length) {
          return 'Count entered does not match selected count"!';
        }
      },
    }).then((result) => {
      if (result.value) {
        this.isloading = true;
        var objTag = {
          tagId: tagId,
          accountId: this.recordSelectedArray,
          isActive: true,
          UpdatedBy: this.localstoragedataService.getLoginUserId(),
        };
        this.tagService.saveBulkTag(objTag).subscribe(
          (res) => {
            if (res) {
              this.analytics.bulkAddTagsDonor();

              this.isloading = false;
              Swal.fire({
                title: "Updated Successfully",
                icon: "success",
                confirmButtonText: "Okay",
                customClass: {
                  confirmButton: "btn_ok",
                },
              }).then(() => {
                this.commonMethodService.sendDonorLst(true);
              });
            }
          },
          (error) => {
            Swal.fire(
              this.commonMethodService.getTranslate(
                "WARNING_SWAL.SOMETHING_WENT_WRONG"
              ),
              error.error,
              "error"
            );
          }
        );
      } else {
      }
    });
  }

  onBulkInActiveDonor() {
    Swal.fire({
      icon: "warning",
      input: "number",
      inputAttributes: {},
      showClass: {
        popup: `
              swal2-modal-primary
            `,
      },
      html: `<div>
                 <h2>Edit ${this.recordSelectedArray.length} donors?</h2>
                 <p>You're editing multiple donors.</p>
                 <span>To continue, type the amount of donors you selected. </span>
             </div>`,
      showCloseButton: true,
      confirmButtonText: this.commonMethodService.getTranslate("CONFIRM"),
      confirmButtonColor: "#7b5bc4",
      customClass: { confirmButton: "modal-are-you-sure" },
      didOpen: () => {
        $(".swal2-actions").on("click", () =>
          $("#swal2-content + .swal2-input").focus()
        );
      },
      inputValidator: (value: any) => {
        if (value != this.recordSelectedArray.length) {
          return 'Count entered does not match selected count"!';
        }
      },
    }).then((result) => {
      if (result.value) {
        this.isloading = true;
        let objBulkDonor = {
          eventGuid: this.localstoragedataService.getLoginUserEventGuId(),
          accountIds: this.recordSelectedArray,
          active: false,
        };
        this.donorService.BulkInactiveDonor(objBulkDonor).subscribe(
          (res) => {
            this.isloading = false;
            if (res) {
              Swal.fire({
                title: res,
                icon: "success",
                confirmButtonText: this.commonMethodService.getTranslate(
                  "WARNING_SWAL.BUTTON.CONFIRM.OK"
                ),
                customClass: {
                  confirmButton: "btn_ok",
                },
              });
              this.objAdvancedSearch = { status: "0" };
              this.searchDonorData();
            }
          },
          (err) => {
            this.isloading = false;
            // console.log(err);
            Swal.fire({
              title: this.commonMethodService.getTranslate(
                "WARNING_SWAL.SOMETHING_WENT_WRONG"
              ),
              text: err.error,
              icon: "error",
              confirmButtonText: this.commonMethodService.getTranslate(
                "WARNING_SWAL.BUTTON.CONFIRM.OK"
              ),
              customClass: {
                confirmButton: "btn_ok",
              },
            }).then(() => {
              setTimeout(() => {
                window.scrollTo(0, 0);
              }, 150);
            });
          }
        );
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: this.commonMethodService.getTranslate("CANCELLED"),
          icon: "error",
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

  getAFVColumns(isInit = false) {
    if (isInit) {
      this.isloading = true;
    }
    const eventGuId = this.localstoragedataService.getLoginUserEventGuId();
    this.advancedFieldService.getAll(eventGuId).subscribe(
      (res) => {
        if (isInit) {
          this.isloading = false;
        }
        this.pageSyncService.advancedFieldList = res;
        this.advanceFieldModification(res);
        // console.log(this.colFields)
      },
      (err) => {
        if (isInit) {
          this.isloading = false;
        }
      }
    );
  }

  advanceFieldModification(res) {
    if (res) {
      const itemArr = [];
      for (let index = 0; index < res.length; index++) {
        const element = res[index];
        if (element.fieldName) {
          let trimValue = this.advancedFieldService.formatFieldName(
            element.fieldName
          );
          itemArr.push({
            colName: trimValue,
            isVisible: false,
            colId: element.advancedFieldId,
            sortOrder: "",
            sortName: trimValue,
          });
        }
      }

      //get visible adv. columns
      var selectedColumns = [];
      var AdvFields = this.colFields.filter((obj) => {
        if (obj.title && obj.title.indexOf("ADVANCEDFIELDS") > -1) {
          for (let index = 0; index < obj.items.length; index++) {
            if (obj.items[index].isVisible) {
              selectedColumns.push(obj.items[index]);
            }
          }
        }
      });

      //bind selected column
      itemArr.map(function (x) {
        var result = selectedColumns.filter((a1) => a1.colName == x.colName);
        if (result.length > 0) {
          x.isVisible = result[0].isVisible;
        }
        return x;
      });

      this.colFields = this.colFields.map((o) => {
        if (o.id !== 2) {
          return o;
        }
        return {
          ...o,
          items: itemArr,
        };
      });
    }
  }

  FilterTotalPanelData(objAdSearch) {
    var filteredTotalPanel = this.gridOrgTotalPanelData;
    if (objAdSearch) {
      if (this.objAdvancedSearch.reasonId.length > 0) {
        filteredTotalPanel = filteredTotalPanel.filter((f) =>
          this.objAdvancedSearch.reasonId.map((x) => x.id).includes(f.reasonId)
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
      if (this.objAdvancedSearch.sourceId.length > 0) {
        filteredTotalPanel = filteredTotalPanel.filter((f) =>
          this.objAdvancedSearch.sourceId.map((x) => x.id).includes(f.deviceId)
        );
      }
    }
    return filteredTotalPanel;
  }

  getTagList() {
    const eventGuId = this.localstoragedataService.getLoginUserEventGuId();
    this.tagService.getAllTag(eventGuId).subscribe(
      (res) => {
        if (res) {
          this.newDonorTagList = res;
          this.pageSyncService.tagList = res;
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  search(keyword) {
    if (keyword == "") {
      this.filterLocalData();
    }
    if (this.isTotalPanelVisible) {
      //var record = this.gridFilterData;///issue added
      //this.totalRecord = this.gridFilterData.length;
      if (this.isChipTypeSelected) {
        var record = this.gridSelectedData;
        this.gridData = this.gridSelectedData;
        this.totalRecord = this.gridSelectedData.length;
      } else {
        //  var record = this.gridSumByData;
        //  this.totalRecord = this.gridSumByData.length;
        //  this.gridData = this.gridSumByData;

        var record = this.gridSearchFilterData; //this.gridFilterData;///issue added
        this.totalRecord = this.gridSearchFilterData.length; //this.gridFilterData.length;
      }
    } else {
      var record = this.gridData;
      this.totalRecord = this.gridData.length;
    }
    keyword = keyword.toLowerCase().replace(/[().-]/g, "");
    var filterdRecord;
    this.isFiltered = false;
    if (keyword != "") {
      var searchArray = keyword.split(" ");
      for (var searchValue of searchArray) {
        filterdRecord = record.filter(
          (obj) =>
            (obj.accountNum &&
              obj.accountNum.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.fullName &&
              obj.fullName.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.fullNameJewish &&
              obj.fullNameJewish.toLowerCase().toString().indexOf(searchValue) >
                -1) ||
            (obj.address &&
              obj.address.toString().toLowerCase().indexOf(searchValue) > -1) ||
            (obj.cityStateZip &&
              obj.cityStateZip.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.group &&
              obj.group.toString().toLowerCase().indexOf(searchValue) > -1) ||
            (obj.class &&
              obj.class.toString().toLowerCase().indexOf(searchValue) > -1) ||
            (obj.phoneLabels &&
              obj.phoneLabels.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.phonenumbers &&
              obj.phonenumbers.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.father &&
              obj.father.toString().toLowerCase().indexOf(searchValue) > -1) ||
            (obj.fatherinlaw &&
              obj.fatherinlaw.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.emailLabels &&
              obj.emailLabels.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.emailLabels2 &&
              obj.emailLabels2
                .toString()
                .toLowerCase()
                .replace(/[().-]/g, "")
                .indexOf(searchValue) > -1) ||
            (obj.emails &&
              obj.emails.toString().toLowerCase().indexOf(searchValue) > -1) ||
            (obj.note &&
              obj.note.toString().toLowerCase().indexOf(searchValue) > -1) ||
            (obj.additionalPhoneNumbers &&
              obj.additionalPhoneNumbers
                .toString()
                .toLowerCase()
                .indexOf(searchValue) > -1) ||
            (obj.advancedFieldValues &&
              obj.advancedFieldValues
                .toString()
                .toLowerCase()
                .indexOf(searchValue) > -1)
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
        this.strSort = "asc";
        this.gridFilterData = this.EnglishOnly();
      } else if (this.isTotalPanelVisible) {
        this.gridFilterData = this.tempSearch;
        this.totalRecord = this.tempSearch.length;
        this.strSort = "asc";
        this.gridFilterData = this.EnglishOnly();
      } else {
        this.filterLocalData();
        //this.gridFilterData = this.gridData;
        this.totalRecord = this.gridFilterData.length;
        this.strSort = "asc";
        this.gridFilterData = this.EnglishOnly();
      }
    }
  }

  onArrowClick() {
    this.isClicked = true;
  }

  onTotalBtnClick() {
    this.isOpen = true;
  }

  ClosePanel(event) {
    if (event) {
      this.isClicked = false;
      this.isOpen = false;
    }
  }

  openSearchFilterPopup() {
    this.isloading = false;
    this.modalOptions = {
      centered: true,
      size: "lg",
      //backdrop : 'static',
      keyboard: true,
      windowClass: "donor_filter modal_responsive",
    };
    const modalRef = this.commonMethodService.openPopup(
      DonorFilterPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.AdvancedFilterData = this.objAdvancedSearch;
    modalRef.componentInstance.isTotalPanelOpen = this.isTotalPanelVisible;
    modalRef.componentInstance.labelsListArray = this.labelsListArray;
    modalRef.componentInstance.emtOutputAdvancedFilterData.subscribe(
      (objResponse) => {
        this.advancedFilterData(objResponse, true);
      }
    );
  }

  advancedFilterData(objResponse, value) {
    this.objAdvancedSearch = objResponse;
    this.isFilterOpen = true;

    // filter count issue
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
      if (key == "status" && filtervalue == "0") {
        this.filtercount += 1;
      }
    }
    //
    //for issue comments code below
    if (this.isTotalPanelVisible) {
      //this.searchDonorData();
      if (this.filtercount > 0) {
        this.totalPanelfilterLocalData();
        this.gridTotalPanelData = this.gridFilterData;
      } else {
        this.gridFilterData = this.orgTotalPanelData;
        this.gridTotalPanelData = this.gridFilterData;
      }
      //  const resultData= this.gridFilterData;
      //  this.showOnlyTotalData(resultData);

      this.showOnlyTotalData();
      this.TestcardTypeChange(this.cardType);
      this.initMultiSelect();
    } else {
      if (this.gridOrgData != undefined && this.gridOrgData != null) {
        this.gridData = this.gridOrgData;
        this.filterLocalData();
        this.filterAdvancedFieldsData(); //new added

        this.totalRecord = this.gridFilterData.length; //new added
      }
    }
    this.changeDetectorRef.detectChanges();

    //this.filterLocalData();
  }
  openSaveDonorPopup() {
    this.isloading = false;
    this.modalOptions = {
      centered: false,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup donor_popup",
    };
    const modalRef = this.commonMethodService.openPopup(
      DonorSaveComponent,
      this.modalOptions
    );
    modalRef.componentInstance.Type = "add";
  }

  SaveDonorData() {
    this.isloading = true;
    var objSaveDonorData: any = {};
    if (this.objDonorSave) {
      objSaveDonorData = {
        eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
        loginUserId: this.localstoragedataService.getLoginUserId(),
        accountNum: this.objDonorSave.accountNum,
        accountId: this.objDonorSave.accountId,
        fullNameJewish: this.objDonorSave.fullNameJewish,
        fullName: this.objDonorSave.fullName,
        address: this.objDonorSave.address,
        cityStateZip: this.objDonorSave.cityStateZip,
        fatherId:
          this.objDonorSave.fatherId.length > 0
            ? parseInt(this.objDonorSave.fatherId.map((s) => s.id))
            : null,
        fatherInLawId:
          this.objDonorSave.fatherInLawId.length > 0
            ? parseInt(this.objDonorSave.fatherInLawId.map((s) => s.id))
            : null,
        phoneLabel: this.objDonorSave.phoneLabel,
        phoneNumber: this.objDonorSave.phoneNumber,
        group: this.objDonorSave.group,
        emailLabel: this.objDonorSave.emailLabel,
        emailAddress: this.objDonorSave.emailAddress,
        donorClass: this.objDonorSave.donorClass,
        longitude: this.objDonorSave.longitude,
        latitude: this.objDonorSave.latitude,
      };
    }

    this.donorService.SaveDonor(objSaveDonorData).subscribe(
      (res: any) => {
        // hide loader
        if (res) {
          if (res.accountId) {
            this.commonMethodService.sendDonorAccountId(res.accountId);
          }
          this.isloading = false;
          this.ngOnInit();
          this.commonMethodService.sendDonorLst(true);
        }
      },
      (error) => {
        this.isloading = false;
        console.log(error);
        this.notificationService.showError(
          error.error,
          "Error while fetching data !!"
        );
      }
    );
  }

  openDonorCardPopup(accountID) {
    // if (this.isTotalPanelVisible) {
    //   this.objAdvancedSearch = [];
    // }
    this.isloading = false;
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup donor_card modal_responsive",
    };
    const modalRef = this.commonMethodService.openPopup(
      DonorCardPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.AccountId = accountID;
    var objDonorCard = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      accountId: accountID,

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
        campaigns:
          this.objAdvancedSearch &&
          this.objAdvancedSearch.campaignId &&
          this.objAdvancedSearch.campaignId.length > 0
            ? this.objAdvancedSearch.campaignId.map((s) => s.id)
            : null,
        locations:
          this.objAdvancedSearch &&
          this.objAdvancedSearch.locationId &&
          this.objAdvancedSearch.locationId.length > 0
            ? this.objAdvancedSearch.locationId.map((s) => s.id)
            : null,
        reasons:
          this.objAdvancedSearch &&
          this.objAdvancedSearch.reasonId &&
          this.objAdvancedSearch.reasonId.length > 0
            ? this.objAdvancedSearch.reasonId.map((s) => s.id)
            : null,
        sources:
          this.objAdvancedSearch &&
          this.objAdvancedSearch.sourceId &&
          this.objAdvancedSearch.sourceId.length > 0
            ? this.objAdvancedSearch.sourceId.map((s) => s.id)
            : null,
        collectors:
          this.objAdvancedSearch &&
          this.objAdvancedSearch.collectorId &&
          this.objAdvancedSearch.collectorId.length > 0
            ? this.objAdvancedSearch.collectorId.map((s) => s.id)
            : null,
        AdvancedFields:
          this.objAdvancedSearch &&
          this.objAdvancedSearch.AdvancedFields &&
          this.objAdvancedSearch.AdvancedFields.length > 0
            ? this.objAdvancedSearch.AdvancedFields
            : null,
        tags:
          this.objAdvancedSearch &&
          this.objAdvancedSearch.tags &&
          this.objAdvancedSearch.tags.length > 0
            ? this.objAdvancedSearch.tags.map((a) => a.tagName)
            : [],
      },
    };
    this.cardService.getDonorCard(objDonorCard).subscribe((res: any) => {
      // hide loader
      this.isloading = false;
      if (
        this.selectedDateRange != undefined &&
        this.selectedDateRange.startDate != null
      ) {
        modalRef.componentInstance.selectDateRange = this.selectedDateRange;
      }
      modalRef.componentInstance.DonorCardData = res;
      modalRef.componentInstance.objAdvanceSearch = this.objAdvancedSearch;
    });

    modalRef.result
      .then(
        () => {},
        (reason) => {
          document.body.classList.remove("modal-open");
        }
      )
      .catch(() => {});
  }

  makeTransactionPopup(fullNameJewish, fullName, accountId) {
    this.isloading = false;
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup transaction_modal",
    };
    const modalRef = this.commonMethodService.openPopup(
      AddTransactionPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.donorDetails = {
      jewishname: fullNameJewish,
      fullname: fullName,
      accountId: accountId,
    };
  }

  AdvanceTransaction() {
    this.modalOptions = {
      centered: true,
      size: "sm",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup transaction_modal",
    };
    const modalRef = this.commonMethodService.openPopup(
      AddTransactionPopupComponent,
      this.modalOptions
    );
    var bulkDonorDetails = [];

    bulkDonorDetails = this.donorSelectedArray.map((donor) => [donor]);
    modalRef.componentInstance.BulkDonorList = bulkDonorDetails;
    modalRef.componentInstance.AccountIdList = this.recordSelectedArray;
    modalRef.componentInstance.IsFromBuilkDonarList = true;
  }

  editDonor(accountId) {
    this.isloading = false;
    this.modalOptions = {
      centered: false,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup donor_popup",
    };
    const modalRef = this.commonMethodService.openPopup(
      DonorSaveComponent,
      this.modalOptions
    );
    var eventGuId = this.localstoragedataService.getLoginUserEventGuId();
    this.donorService
      .getDonorById(eventGuId, accountId)
      .subscribe((res: any) => {
        this.isloading = false;
        this.changeDetectorRef.detectChanges();
        modalRef.componentInstance.Type = "edit";
        modalRef.componentInstance.EditDonorData = res;
      });
    modalRef.componentInstance.emtOutputEditDonor.subscribe((res: any) => {
      if (res && this.isTotalPanelVisible) {
        this.getTotalPanel();
      }
    });
  }

  getDonorEmailList(accountId) {
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup",
    };
    const modalRef = this.commonMethodService.openPopup(
      DonorEmailComponent,
      this.modalOptions
    );
    var eventGuId = this.localstoragedataService.getLoginUserEventGuId();

    this.donorService
      .getDonorEmailList(eventGuId, accountId)
      .subscribe((res: any) => {
        var obj: any = {};
        if (res != null) {
          obj.list = res;
        }
        obj.accountId = accountId;
        modalRef.componentInstance.DonorEmailListData = obj;
      });
  }

  getDonorPhoneList(accountId) {
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup",
    };
    const modalRef = this.commonMethodService.openPopup(
      DonorPhoneComponent,
      this.modalOptions
    );
    var eventGuId = this.localstoragedataService.getLoginUserEventGuId();

    this.donorService
      .getDonorPhoneList(eventGuId, accountId)
      .subscribe((res: any) => {
        var obj: any = {};
        if (res != null) {
          obj.list = res;
        }
        obj.accountId = accountId;
        modalRef.componentInstance.DonorPhoneListData = obj;
      });
  }

  public downloadExcel() {
    let results = this.gridFilterData;
    this.isdownloadExcelGuid =
      this.commonMethodService.idDownloadExcelEventGuid();
    let data = [];
    if (results) {
      Object.values(results).forEach((item: any) => {
        let AccountNo = item && item.accountNum;
        let FullName = "";
        if (item.fullName && item.fullNameJewish) {
          FullName = `${item.fullName} ${item.fullNameJewish}`;
        } else if (item.fullName) {
          FullName = `${item.fullName}`;
        } else if (item.fullNameJewish) {
          FullName = `${item.fullNameJewish}`;
        }
        let FullNameEnglish = item && item.fullName;
        let FullNameJewish = item && item.fullNameJewish;
        let Father = item && item.father;
        let FatherInLaw = item && item.fatherInLaw;

        let row = {};
        if (this.isDonorAccountNoColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("ACCT#")
            : "Acct #";
          row[ColName] = AccountNo;
        }
        if (this.isDonorFullNameColVisible) {
          if (FullName) {
            let ColName: any = this.isdownloadExcelGuid
              ? this.commonMethodService.getColName("FULLNAME")
              : "Full Name";
            row[ColName] = FullName;
          }
        }
        if (this.isDonorFullNameEnglishColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("ENGLISHNAME")
            : "English Name";
          row[ColName] = FullNameEnglish;
        }
        if (this.isDonorFullNameJewishColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("YIDDISHNAME")
            : "Yiddish Name";
          row[ColName] = FullNameJewish;
        }

        if (this.isDonorFamilyColVisible) {
          let familyString = "";

          if (Father && FatherInLaw) {
            familyString = `בן: ${Father} חתן: ${FatherInLaw}`;
          } else if (Father) {
            familyString = `בן: ${Father}`;
          } else if (FatherInLaw) {
            familyString = `חתן: ${FatherInLaw}`;
          }
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("FAMILY")
            : "Family";
          row[ColName] = familyString;
        }

        if (this.isDonorPhoneLabelColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("PHONE")
            : "Phone";
          row[ColName] = item.phonenumbers;
        }
        if (this.isDonorAddressColVisible) {
          if (item.defaultHouseNum && item.defaultHouseNum != "null") {
            row["House Num"] = item.defaultHouseNum;
          }
          if (item.defaultStreetName && item.defaultStreetName != "null") {
            row["Street Name"] = item.defaultStreetName;
          }
          if (item.defaultUnit) {
            let ColName: any = this.isdownloadExcelGuid
              ? this.commonMethodService.getColName("APT")
              : "Apt";
            row[ColName] = item.defaultUnit;
          }
        }
        if (
          this.isDonorCityStateZipColVisible ||
          this.isDonorAddressColVisible
        ) {
          let ColName1: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("CITY")
            : "City";
          row[ColName1] = item.defaultCity;
          let ColName2: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("STATE")
            : "State";
          row[ColName2] = item.defaultState;
          let ColName3: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("ZIP")
            : "Zip";
          row[ColName3] = item.defaultZip;
        }
        if (this.isDonorEmailColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("EMAIL")
            : "Email";
          row[ColName] = item.emails;
        }

        /*if (this.isDonorGroupColVisible) {
          row['Group'] = item.group;
        }
        if (this.isDonorClassColVisible) {
          row['Class'] = item.class;
        }*/

        if (this.isDonorFatherColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("FATHER")
            : "Father";
          row[ColName] = Father;
        }
        if (this.isDonorFatherInLawColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("FATHERINLAW")
            : "Father In Law";
          row[ColName] = FatherInLaw;
        }
        if (this.isDonorTagColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("TAGS")
            : "Tags";
          row[ColName] = item.tagNames;
        }
        //added new
        if (this.isDonorTitleColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("ENGLISHTITLE")
            : "English Title";
          row[ColName] = item.title;
        }
        if (this.isDonorFirstNameColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("ENGLISHFIRSTNAME")
            : "English First name";
          row[ColName] = item.firstName;
        }
        if (this.isDonorLastNameColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("ENGLISHLASTNAME")
            : "English Last name";
          row[ColName] = item.lastName;
        }
        if (this.isDonorTitleJewishColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("YIDDISHFIRSTTITLE")
            : "Yiddish First Title";
          row[ColName] = item.titleJewish;
        }
        if (this.isDonorFirstNameJewishColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("YIDDISHFIRSTNAME")
            : "Yiddish First name";
          row[ColName] = item.firstNameJewish;
        }
        if (this.isDonorLastNameJewishColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("YIDDISHLASTNAME")
            : "Yiddish Last name";
          row[ColName] = item.lastNameJewish;
        }
        if (this.isDonorSuffixJewishColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("YIDDISHLASTTITLE")
            : "Yiddish Last Title";
          row[ColName] = item.suffixJewish;
        }
        // Total Panel
        if (this.isDonorPaymentsColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("PAYMENTS")
            : "Payments";
          row[ColName] = item.payments;
        }
        if (this.isDonorPaymentsCountColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("COUNTOFPAYMENTS")
            : "Count Of Payments";
          row[ColName] = item.paymentsCount;
        }
        if (this.isDonorOpenPledgesColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("OPENPLEDGES")
            : "Open Pledges";
          row[ColName] = item.openPledges;
        }
        if (this.isDonorOpenPledgesCountColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("COUNTOFPLEDGES")
            : "Count Of Pledges";
          row[ColName] = item.pledgesCount;
        }
        if (this.isDonorScheduledColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("SCHEDULED")
            : "Scheduled";
          row[ColName] = item.scheduled;
        }
        if (this.isDonorScheduledCountColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("COUNTOFSCHEDULES")
            : "Count Of Schedules";
          row[ColName] = item.schedulesCount;
        }
        if (this.isDonorRaisedColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("TOTAL")
            : "Total";
          row[ColName] = item.raised;
        }

        if (this.isDonorNoteColVisible) {
          let ColName: any = this.isdownloadExcelGuid
            ? this.commonMethodService.getColName("NOTE")
            : "Note";
          row[ColName] = item.note;
        }
        // advance fields
        if (
          item.advancedFieldNameAndValue &&
          item.advancedFieldNameAndValue.length > 0
        ) {
          for (
            let index = 0;
            index < item.advancedFieldNameAndValue.length;
            index++
          ) {
            const element = item.advancedFieldNameAndValue[index];
            if (this.isCheckedFieldsLabel(element.fieldname, 1)) {
              if (element.fieldValue && element.fieldValue != "null") {
                row[element.fieldname] = element.fieldValue;
              }
            }
          }
        }
        if (item.additionalPhoneLabels && item.additionalPhoneNumbers) {
          const phonestring = item.additionalPhoneLabels;
          const substring = ",";
          const labelType = "Phone";
          if (phonestring.includes(substring)) {
            let res = phonestring.split(substring);
            row = this.zipLabel(
              res,
              item.additionalPhoneNumbers,
              row,
              labelType,
              substring
            );
          }
          if (
            !phonestring.includes(substring) &&
            this.getFieldsLabel(item.additionalPhoneLabels, 0, labelType)
          ) {
            row[this.getFieldsLabel(item.additionalPhoneLabels, 0, labelType)] =
              item.additionalPhoneNumbers;
          }
        }
        if (item.emailLabels && item.emails) {
          const emailString = item.emailLabels;
          const substring = ",";
          const labelType = "Email";
          if (emailString.includes(substring)) {
            let res = emailString.split(substring);
            row = this.zipLabel(res, item.emails, row, labelType, substring);
          }
          if (
            !emailString.includes(substring) &&
            this.getFieldsLabel(item.emailLabels, 0, labelType)
          ) {
            row[this.getFieldsLabel(item.emailLabels, 0, labelType)] =
              item.emails;
          }
        }
        if (item.accountAddressLabels && item.accountAddresses) {
          const addressString = item.accountAddressLabels;
          const substring = ";";
          const labelType = "Address";
          if (addressString.includes(substring)) {
            let res = addressString.split(substring);
            row = this.zipLabel(
              res,
              item.accountAddresses,
              row,
              labelType,
              substring
            );
          }
          if (
            !addressString.includes(substring) &&
            this.getFieldsLabel(item.accountAddressLabels, 0, labelType)
          ) {
            row[this.getFieldsLabel(item.accountAddressLabels, 0, labelType)] =
              item.accountAddresses;
          }
        }
        data.push(row);
      });
    } else {
      return;
    }

    let header: string[] = Object.keys(Object.assign({}, ...data));

    // Extract visible column fields
    let visibleColFields: string[] = this.colFields[0].items
      .filter((item) => item.isVisible)
      .map((column) => column.colName);

    let formattedColNames: string[] = header.map((col) =>
      col.replace(/\s+/g, "").toLowerCase()
    );

    let missingColNames: string[] = visibleColFields
      .map((col) => col.replace(/\s+/g, "").toLowerCase())
      .filter(
        (col) =>
          !formattedColNames.includes(col) &&
          col !== "address" &&
          col !== "citystatezip"
      );

    // Map back missing column names to their original format
    missingColNames = visibleColFields.filter((col) =>
      missingColNames.includes(col.replace(/\s+/g, "").toLowerCase())
    );

    // Update the header with missing column names
    header = [...header, ...missingColNames];

    if (header.includes("City") && this.isDonorAddressColVisible) {
      let House_Num = "House Num";
      header = this.deleteHeaderValue(header, House_Num);
      let Street_Name = "Street Name";
      header = this.deleteHeaderValue(header, Street_Name);
      let Apt = "Apt";
      header = this.deleteHeaderValue(header, Apt);

      let city_index = header.indexOf("City");
      header = this.insertHeaderValue(header, Apt, city_index);
      header = this.insertHeaderValue(header, Street_Name, city_index);
      header = this.insertHeaderValue(header, House_Num, city_index);
    }

    const filename = this.xlsxService.getFilename("Donor List");
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data, {
      header: header,
      cellStyles: true,
    });
    var range = XLSX.utils.decode_range(worksheet["!ref"]);

    // Find Amount, Paid, Balance, Pledge Date and Pledge Created column
    let paymentColumn = null;
    let openPledgesColumn = null;
    let scheduledColumn = null;
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
          openPledgesColumn = C;
        }
        if (worksheet[cell_ref].v == "Scheduled") {
          scheduledColumn = C;
        }
        if (worksheet[cell_ref].v == "Total") {
          totalColumn = C;
        }
      }
    }

    let fmt = '"$"#,##0.00_);\\("$"#,##0.00\\)';
    let _currencyFormat = "$#,##0.00";
    for (var R = range.s.r; R <= range.e.r; ++R) {
      if (R == 0) continue;
      if (!!paymentColumn) {
        let payment_cell_address = { c: paymentColumn, r: R };
        let payment_cell_ref = XLSX.utils.encode_cell(payment_cell_address);
        if (worksheet[payment_cell_ref]) {
          worksheet[payment_cell_ref].t = "n";
          worksheet[payment_cell_ref].z = _currencyFormat;
        }
      }
      if (!!openPledgesColumn) {
        let openPledges_cell_address = { c: openPledgesColumn, r: R };
        let openPledges_cell_ref = XLSX.utils.encode_cell(
          openPledges_cell_address
        );
        if (worksheet[openPledges_cell_ref]) {
          worksheet[openPledges_cell_ref].t = "n";
          worksheet[openPledges_cell_ref].z = _currencyFormat;
        }
      }
      if (!!scheduledColumn) {
        let scheduled_cell_address = { c: scheduledColumn, r: R };
        let scheduled_cell_ref = XLSX.utils.encode_cell(scheduled_cell_address);
        if (worksheet[scheduled_cell_ref]) {
          worksheet[scheduled_cell_ref].t = "n";
          worksheet[scheduled_cell_ref].z = _currencyFormat;
        }
      }
      if (!!totalColumn) {
        let total_cell_address = { c: totalColumn, r: R };
        let total_cell_ref = XLSX.utils.encode_cell(total_cell_address);
        if (worksheet[total_cell_ref]) {
          worksheet[total_cell_ref].t = "n";
          worksheet[total_cell_ref].z = _currencyFormat;
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

  //  Contains_hebrew(str) {
  //     var abc= (/[\u0590-\u05FF]/).test(str);
  // }

  RefreshDonorList() {
    if (this.isTotalPanelVisible) {
      //set condition
      this.getTotalPanel();
      this.searchDonorData();
    } else {
      this.searchDonorData();
    }
    this.commonMethodService.sendListSync(true);
  }

  emtOutputPageChange(data) {
    this.svTable.setPage(data.activePage, data.rowsOnPage);
  }

  onBulkCustomReport() {
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup bulk_custom_report_card",
    };
    const modalRef = this.commonMethodService.openPopup(
      BulkCustomReportComponent,
      this.modalOptions
    );
    let bulkDonorDetails = [];
    if (!this.isTotalPanelVisible) {
      this.recordSelectedArray.map((element) => {
        let filteredrecord = this.gridData.filter(
          (x) => x.accountId == element
        );
        bulkDonorDetails.push(filteredrecord);
      });
    }
    if (this.isTotalPanelVisible) {
      this.recordSelectedArray.map((element) => {
        let filteredrecord = this.gridFilterData.filter(
          (x) => x.accountId == element
        );
        bulkDonorDetails.push(filteredrecord);
      });
    }
    let listName = "Donors";
    let orgId = this.localstoragedataService.getLoginUserOrganisationId();
    this.printableReport
      .getAllPrintableReport(listName, orgId)
      .subscribe((res: any) => {
        modalRef.componentInstance.BulkDonorList = bulkDonorDetails;
        modalRef.componentInstance.isTotalPanelVisible =
          this.isTotalPanelVisible;
        modalRef.componentInstance.SelectedIds = this.recordSelectedArray;
        if (res) {
          modalRef.componentInstance.reportObj = res[0];
        }
      });
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

  totalPanelfilterLocalData() {
    this.gridFilterData = this.gridTotalPanelData.filter((o) => {
      if (!this.isFilterOpen) {
        this.objAdvancedSearch = null;
      }
      if (!this.objAdvancedSearch) {
        return true;
      }
      if (this.objAdvancedSearch) {
        if (
          this.objAdvancedSearch.AdvancedFields &&
          this.objAdvancedSearch.AdvancedFields.length == 0 &&
          this.objAdvancedSearch.campaignId &&
          this.objAdvancedSearch.campaignId.length == 0 &&
          this.objAdvancedSearch.collectorId &&
          this.objAdvancedSearch.collectorId.length == 0 &&
          this.objAdvancedSearch.locationId &&
          this.objAdvancedSearch.locationId.length == 0 &&
          this.objAdvancedSearch.reasonId &&
          this.objAdvancedSearch.reasonId.length == 0 &&
          this.objAdvancedSearch.sourceId &&
          this.objAdvancedSearch.sourceId.length == 0
        ) {
          return true;
        }

        //campaign
        const campaign =
          this.objAdvancedSearch.campaignId &&
          this.objAdvancedSearch.campaignId.find((t) => {
            if (this.isContain(o.campaignId, t.id)) {
              return true;
            }
            if (this.isContain(o.parentCampaignId, t.id)) {
              return true;
            }
            if (this.isContain(o.campaignIds, t.id)) {
              return true;
            }
          });
        if (campaign) {
          return true;
        }

        //location
        const location =
          this.objAdvancedSearch.locationId &&
          this.objAdvancedSearch.locationId.find((t) => {
            if (this.isContain(o.locationId, t.id)) {
              return true;
            }
            if (this.isContain(o.locationIds, t.id)) {
              return true;
            }
          });
        if (location) {
          return true;
        }
        //collector
        const collector =
          this.objAdvancedSearch.collectorId &&
          this.objAdvancedSearch.collectorId.find((t) => {
            if (this.isContain(o.collectorId, t.id)) {
              return true;
            }
            if (this.isContain(o.collectorIds, t.id)) {
              return true;
            }
          });
        if (collector) {
          return true;
        }
        //source
        const source =
          this.objAdvancedSearch.sourceId &&
          this.objAdvancedSearch.sourceId.find((t) => {
            if (this.isContain(o.deviceId, t.id)) {
              return true;
            }
            if (this.isContain(o.deviceIds, t.id)) {
              return true;
            }
          });
        if (source) {
          return true;
        }
        //reason
        const reason =
          this.objAdvancedSearch.reasonId &&
          this.objAdvancedSearch.reasonId.find((t) => {
            if (this.isContain(o.reasonId, t.id)) {
              return true;
            }
            if (this.isContain(o.reasonIds, t.id)) {
              return true;
            }
          });
        if (reason) {
          return true;
        }
      }
      return false;
    });

    this.totalRecord = this.gridFilterData.length;
  }
  filterLocalData() {
    this.gridFilterData = this.gridData.filter((o) => {
      if (!this.objAdvancedSearch) {
        return true;
      }
      if (
        this.objAdvancedSearch &&
        this.objAdvancedSearch.status &&
        this.objAdvancedSearch.status == "0"
      ) {
        return o.donorStatus == "Active" && this.inAllFields(o);
      }

      if (
        this.objAdvancedSearch &&
        this.objAdvancedSearch.status &&
        this.objAdvancedSearch.status == "-1"
      ) {
        return o.donorStatus == "InActive" && this.inAllFields(o);
      }

      if (
        this.objAdvancedSearch &&
        (!this.objAdvancedSearch.status || this.objAdvancedSearch.status == "")
      ) {
        return this.inAllFields(o);
      }
      if (
        this.objAdvancedSearch.AdvancedFields &&
        this.objAdvancedSearch.AdvancedFields.length > 0
      ) {
        this.filterAdvancedFieldsData();
      }
    });

    this.gridData = this.gridFilterData;
    this.totalRecord = this.gridFilterData.length;
  }
  filterLocalTotalPanelData() {
    this.gridFilterData = this.gridOrgTotalPanelData;

    if (
      this.objAdvancedSearch.AdvancedFields &&
      this.objAdvancedSearch.AdvancedFields.length > 0
    ) {
      this.filterAdvancedFieldsData();
    }

    this.totalRecord = this.gridFilterData.length;
  }

  inAllFields(o) {
    return (
      this.isContain(o.accountNum, this.objAdvancedSearch.accountNo) &&
      this.isContain(o.address, this.objAdvancedSearch.address) &&
      this.isContain(o.cityStateZip, this.objAdvancedSearch.city) &&
      this.isContain(o.class, this.objAdvancedSearch.class) &&
      this.isContain(o.emails, this.objAdvancedSearch.email) &&
      this.isContain(o.father, this.objAdvancedSearch.father) &&
      this.isContain(o.fatherinlaw, this.objAdvancedSearch.fatherinlaw) &&
      this.isContain(o.fullName, this.objAdvancedSearch.fullName) &&
      this.isContain(o.fullNameJewish, this.objAdvancedSearch.fullNameJewish) &&
      this.isContain(o.group, this.objAdvancedSearch.group) &&
      this.isContain(o.phonenumbers, this.objAdvancedSearch.phone) &&
      this.isContain(o.cityStateZip, this.objAdvancedSearch.state) &&
      this.isContain(o.cityStateZip, this.objAdvancedSearch.zip) &&
      this.filterTagFields(o) &&
      this.isCityContain(o.cityStateZip, this.objAdvancedSearch.cities) &&
      this.isStateContain(o.cityStateZip, this.objAdvancedSearch.cities) &&
      this.isZipContain(o.cityStateZip, this.objAdvancedSearch.zips) &&
      this.filterLabelFields(o)
    );
  }

  filterAdvancedFields(o) {
    if (
      !this.objAdvancedSearch.AdvancedFields ||
      this.objAdvancedSearch.AdvancedFields.length === 0
    ) {
      return true;
    }

    if (
      !o.advancedFieldNameAndValue ||
      o.advancedFieldNameAndValue.length === 0
    ) {
      return false;
    }

    var advFieldList = this.objAdvancedSearch.AdvancedFields.map((data) => {
      const replacedValue = data.name.replace(":", "");
      const name = replacedValue.trim();
      let obj = {
        fieldname: name,
        value: data.value,
      };
      return obj;
    });

    const result = this.objAdvancedSearch.AdvancedFields.find((t) => {
      const checkInDonor = o.advancedFieldNameAndValue.find((ot) => {
        const replacedValue = t.name.replace(":", "");
        let trimedValue = replacedValue.trim();
        trimedValue = replacedValue.replace(" ", "");
        if (
          this.isContain(ot.fieldname, trimedValue) &&
          this.isContain(ot.fieldValue, t.value)
        ) {
          return true;
        }
        return false;
      });
      if (checkInDonor) {
        return true;
      }
      return false;
    });

    if (result) {
      return true;
    }
    return false;
  }

  filterAdvancedFieldsData() {
    const rawAdvFieldList = this.objAdvancedSearch.AdvancedFields.map(
      (data) => {
        return {
          name: data.name.trim().toLowerCase().replace(" ", ""),
          value: data.value,
          values: data.value ? data.value.split(",") : [],
        };
      }
    );

    const advFieldList = rawAdvFieldList.filter((o) => o.value);
    if (advFieldList.length > 0) {
      this.gridFilterData = this.gridFilterData.filter((o) => {
        const result =
          advFieldList &&
          advFieldList.map((t) => {
            return this.searchInAEOfDonor(o, t);
          });

        if (result.filter((x) => x == false).length == 0) {
          return true;
        }
        return false;
      });
    }
  }

  filterTagFields(o) {
    if (
      !this.objAdvancedSearch.tags ||
      this.objAdvancedSearch.tags.length === 0
    ) {
      return true;
    }

    if (!o.tagNames) {
      return false;
    }
    const result = this.objAdvancedSearch.tags.find((t) => {
      return this.isContain(o.tagIds, t.tagId);
    });

    if (result) {
      return true;
    }

    return false;
  }

  searchInAEOfDonor(
    o,
    t: { name: string; value: string; values: Array<string> }
  ) {
    const found =
      o.advancedFieldNameAndValue &&
      o.advancedFieldNameAndValue.find((ot) => {
        let name = ot.fieldname.replace(":", "");
        name = name.replace(" ", "");
        name = name.trim().toLowerCase();

        if (name !== t.name) {
          return false;
        }

        if (t.values.length > 1) {
          const hasMultiple: Array<string> = ot.fieldValue
            ? ot.fieldValue.split(",")
            : [];
          if (hasMultiple.length === 0) {
            return false;
          }

          const checked = t.values.filter((vv) => {
            return hasMultiple.includes(vv);
          });

          if (checked.length !== 0) {
            return true;
          }

          return false;
        }

        return ot.fieldValue == t.value;
      });

    return found ? true : false;
  }
  file: File;
  reseteFile() {
    $("#doc_file").val("");
    $("#NotReadyToUpload").show();
    $("#readyToUpload").hide();
    this.changeText = "";
    this.file = null;
  }
  incomingfile(event) {
    this.file = event.target.files[0];
    this.readyToUploadChangeText();
  }
  readyToUploadChangeText() {
    if (this.file === undefined || this.file == null) {
      $("#NotReadyToUpload").show();
      $("#readyToUpload").hide();
      this.fileName = "";
    } else {
      $("#NotReadyToUpload").hide();
      $("#readyToUpload").show();
      this.changeText = "is-active";
      this.fileName = this.file.name;
    }
  }
  downloadExcelTemplate(event) {
    this.donorService.downloadDonarTemplate().subscribe(
      (res: any) => {
        const blob = new Blob([res], { type: "application/octet-stream" });
        const url = window.URL.createObjectURL(blob);
        let filename = "Donor_Template";
        var link = document.createElement("a");
        link.href = url;
        link.download = filename + ".xlsx";
        link.click();
      },
      (error) => {
        console.log(error);
        this.isloading = false;
      }
    );
    event.preventDefault();
  }
  uploadExcelTemplate() {
    if (this.file !== undefined) {
      if (this.file != null) {
        this.isloading = true;
        $("#import-data-donar").modal("hide");
        const fd = new FormData();
        fd.append("RequestId", "");
        fd.append("File", this.file);
        fd.append(
          "EventGuid",
          this.localstoragedataService.getLoginUserEventGuId()
        );
        fd.append("CreatedBy", this.localstoragedataService.getLoginUserId());
        let eventPlan = this.localstoragedataService.getLoginUserEventPlan();
        if (eventPlan == "Enterprise Integration ") {
          fd.append("IsCreateOnly", "true");
        }
        this.donorService.donarImport(fd).subscribe(
          (res) => {
            $("#doc_file").val("");
            this.file = null;
            this.reseteFile();
            this.isloading = false;
            $("#searchText").val("");
            Swal.fire({
              title: "",
              text: res + " see import updates in users email",
              icon: "success",
              confirmButtonText: this.commonMethodService.getTranslate(
                "WARNING_SWAL.BUTTON.CONFIRM.OK"
              ),
              customClass: {
                confirmButton: "btn_ok",
              },
            }).then((result) => {
              /* Read more about isConfirmed, isDenied below */
              if (result.isConfirmed) {
                if (this.isTotalPanelVisible) {
                  this.getTotalPanel();
                } else {
                  this.searchDonorData();
                }
              } else if (result.isDenied) {
              }
            });
          },
          (err) => {
            this.isloading = false;
            Swal.fire({
              title: this.commonMethodService.getTranslate(
                "WARNING_SWAL.SOMETHING_WENT_WRONG"
              ),
              text: err.error,
              icon: "error",
              confirmButtonText: this.commonMethodService.getTranslate(
                "WARNING_SWAL.BUTTON.CONFIRM.OK"
              ),
              customClass: {
                confirmButton: "btn_ok",
              },
            });
          }
        );
      } else {
        this.isloading = false;
        Swal.fire({
          title: this.commonMethodService.getTranslate(
            "WARNING_SWAL.SOMETHING_WENT_WRONG"
          ),
          text: "No file chosen",
          icon: "error",
          confirmButtonText: this.commonMethodService.getTranslate(
            "WARNING_SWAL.BUTTON.CONFIRM.OK"
          ),
          customClass: {
            confirmButton: "btn_ok",
          },
        });
      }
    } else {
      this.isloading = false;
      Swal.fire({
        title: this.commonMethodService.getTranslate(
          "WARNING_SWAL.SOMETHING_WENT_WRONG"
        ),
        text: "No file chosen",
        icon: "error",
        confirmButtonText: this.commonMethodService.getTranslate(
          "WARNING_SWAL.BUTTON.CONFIRM.OK"
        ),
        customClass: {
          confirmButton: "btn_ok",
        },
      });
    }
  }
  mainRecordSelectedArray = [];
  checkBoxArrayRecordSelected() {
    this.recordSelectedArray = [];
    if (
      this.mainRecordSelectedArray &&
      this.mainRecordSelectedArray.length > 0
    ) {
      for (let ind = 0; ind < this.gridFilterData.length; ind++) {
        const element = this.gridFilterData[ind];
        const index = this.mainRecordSelectedArray.indexOf(element.accountId);
        if (index > -1) {
          this.recordSelectedArray.push(element.accountId);
        }
      }
    }
    if (this.recordSelectedArray.length > 1) {
      this.isSelected = true;
    }
    if (this.recordSelectedArray.length > 0) {
      this.isCustomReport = true;
    }
    if (this.recordSelectedArray.length <= 1) {
      this.isSelected = false;
    }
    if (this.recordSelectedArray.length == 0) {
      this.isCustomReport = false;
    }
  }
  advancedSort(sortName) {
    this.gridFilterData = this.advanceFieldBySort(sortName);
  }

  advanceFieldBySort(sortName) {
    let data = this.gridFilterData;
    let grid = [];
    let unsortGrid = [];
    data.forEach((c) => {
      let fieldNames =
        c.advancedFieldNames && c.advancedFieldNames.replace(/:/g, "");
      let advFieldNames = fieldNames && fieldNames.split(",");
      let advancedFieldNames =
        advFieldNames &&
        advFieldNames.map((element) => {
          return element.trim();
        });
      let indexVal = advancedFieldNames && advancedFieldNames.indexOf(sortName);
      let advFieldValues =
        c.advancedFieldValues && c.advancedFieldValues.split(",")[indexVal];
      let advancedFieldValues = advFieldValues && advFieldValues.trim();
      if (c.advancedFieldValues && advancedFieldValues) {
        if (
          (advancedFieldValues.substring(0, 1) >= "a" &&
            advancedFieldValues.substring(0, 1) <= "z") ||
          (advancedFieldValues.substring(0, 1) >= "A" &&
            advancedFieldValues.substring(0, 1) <= "Z")
        ) {
          grid.push(c);
          return;
        }
        grid.push(c);
      } else {
        unsortGrid.push(c);
      }
    });
    if (this.strSort == null || this.strSort == "asc") {
      this.strSort = "desc";
      let sortOrder = -1;
      grid = grid.sort(function (a, b) {
        let result =
          a.advancedFieldValues > b.advancedFieldValues
            ? -1
            : a.advancedFieldValues < b.advancedFieldValues
            ? 1
            : 0;
        return result * sortOrder;
      });
    } else {
      this.strSort = "asc";
      grid = grid.sort(function (first, second) {
        return first.advancedFieldValues - second.advancedFieldValues;
      });
      grid = grid.reverse();
    }
    grid = grid.concat(unsortGrid);
    return grid;
  }
  isCityContain(val: string, search: any) {
    if (!search || search.length == 0) {
      return true;
    }
    return search.some(
      (item) =>
        val &&
        val
          .toString()
          .toLowerCase()
          .indexOf(item.city.toString().toLowerCase()) > -1
    );
  }
  isStateContain(val: string, search: any) {
    if (!search || search.length == 0) {
      return true;
    }
    return search.some(
      (item) =>
        val &&
        val
          .toString()
          .toLowerCase()
          .indexOf(item.state.toString().toLowerCase()) > -1
    );
  }
  isZipContain(val: string, search: any) {
    if (!search || search.length == 0) {
      return true;
    }
    return search.some(
      (item) =>
        val &&
        val
          .toString()
          .toLowerCase()
          .indexOf(item.zip.toString().toLowerCase()) > -1
    );
  }
  locallyUpdateDeleteDonor(res) {
    if (res) {
      const updatedGridFilter = this.gridData.map((x) => {
        if (x.accountId == res.accountId) {
          x.donorStatus = "InActive";
        }
        return x;
      });
    }
  }

  tableRowFocued() {
    $("#scrollDonorList tr[tabindex=0]").focus();
    //  this.tableScrollHeight = document.getElementById("scrollDonorList").clientHeight - 160;
    document.onkeydown = (e: any) => {
      e = e || window.event;
      if ([38, 40].indexOf(e.keyCode) > -1) {
        e.preventDefault();
      }
      if (e.keyCode === 38) {
        var idx = $("#scrollDonorList tr:focus").attr("tabindex");
        idx--;
        if (idx == 0) {
          document.getElementById("scrollDonorList").scrollTop = 0;
        }
        $("#scrollDonorList tr[tabindex=" + idx + "]").focus();
      } else if (e.keyCode === 40) {
        var idx = $("#scrollDonorList tr:focus").attr("tabindex");
        idx++;
        $("#scrollDonorList tr[tabindex=" + idx + "]").focus();
      } else if (e.keyCode === 37) {
        document.getElementById("scrollDonorList").scrollLeft -= 30;
      } else if (e.keyCode === 39) {
        document.getElementById("scrollDonorList").scrollLeft += 30;
      }
    };
  }
  openHebrewCalendarPopup() {
    this.modalOptions = {
      centered: true,
      size: "lg",
      keyboard: true,
      windowClass: "advance_search calender-modal",
    };
    let tPostion = $("#dynamicsCalender").offset();
    setTimeout(() => {
      $(".advance_search .modal-dialog").css("left", +tPostion.left);
      $(".advance_search .modal-dialog").css("top", +tPostion.top + 40);
    }, 1);
    const modalRef = this.commonMethodService.openPopup(
      CommonHebrewEnglishCalendarComponent,
      this.modalOptions
    );
    modalRef.componentInstance.data = {
      isEngCal: true,
      formPage: "donar-list",
    };
    modalRef.componentInstance.emtOutput.subscribe((res) => {
      this.pageSyncService.DonorCalDate = res;
      this.selectedDateRange = res;
      this.pageSyncService.DonorCalDate = res;
      this.isDateApply = true;
      this.getTotalPanel();
    });
  }

  // updated code for get all labels started
  getAllLabels() {
    let filteredLabels = this.commonMethodService.allLabelsArray.filter(
      (x) => x.labelType != null && x.labelType !== ""
    );
    let sortedArray = filteredLabels.sort((a, b) =>
      b.labelType.localeCompare(a.labelType)
    );

    sortedArray.forEach((x) => {
      if (x.labelType && x.labelName) {
        let colName = `${x.labelType} > ${x.labelName}`;
        let colId = `${x.labelName}${x.labelID}`;
        let obj = {
          colName: colName,
          isVisible: false,
          colId: colId,
          sortOrder: "",
          sortName: x.labelName,
        };

        let found = this.colFields[0].items.some(
          (el) => el.colName.toLowerCase() === colName.toLowerCase()
        );

        if (!found) {
          this.colFields[0].items.push(obj);
        }
      }
    });
  }
  // updated code for get all labels ended
  showLabelsInGrid(objHeader) {
    if (objHeader.colName.includes(">")) {
      let result = this.colFields[0].items.filter(
        (x) => x.colName == objHeader.colName
      );
      return result && result.length > 0 ? result[0].isVisible : false;
    }
    return false;
  }
  getDyanamicLabelValue(objHeader, item) {
    if (objHeader.colName.includes(">")) {
      let result = this.colFields[0].items.filter(
        (x) => x.colName == objHeader.colName
      );
      let colN = result && result.length > 0 ? result[0].colName : "";
      if (colN) {
        let colLabel = colN.split(">") ? colN.split(">")[0] : "";
        colLabel = colLabel.trim();
        let colSpt = objHeader.sortName;
        let colTrm = colSpt.toString().trim();
        colTrm = colTrm.toLowerCase();
        if (colLabel.toLowerCase() == "phone" && colSpt && colLabel) {
          let additionalPhoneLabels = item.additionalPhoneLabels
            ? item.additionalPhoneLabels.split(",")
            : "";
          let additionalPhoneNumbers = item.additionalPhoneNumbers
            ? item.additionalPhoneNumbers.split(",")
            : "";
          if (additionalPhoneLabels && additionalPhoneNumbers) {
            additionalPhoneLabels = additionalPhoneLabels.map((s) => s.trim());
            additionalPhoneNumbers = additionalPhoneNumbers.map((s) =>
              s.trim()
            );
            additionalPhoneLabels = additionalPhoneLabels.map((s) =>
              s.toLowerCase()
            );
            let index = additionalPhoneLabels.indexOf(colTrm);
            if (typeof additionalPhoneNumbers[index] == undefined) {
              return "";
            } else {
              return additionalPhoneNumbers[index];
            }
          }
        }
        if (colLabel.toLowerCase() == "address" && colSpt && colLabel) {
          let accountAddressLabels = item.accountAddressLabels
            ? item.accountAddressLabels.split(";")
            : "";
          let accountAddresses = item.accountAddresses
            ? item.accountAddresses.split(";")
            : "";
          if (accountAddressLabels && accountAddresses) {
            accountAddressLabels = accountAddressLabels.map((s) => s.trim());
            accountAddresses = accountAddresses.map((s) => s.trim());
            accountAddressLabels = accountAddressLabels.map((s) =>
              s.toLowerCase()
            );
            let index = accountAddressLabels.indexOf(colTrm);
            if (typeof accountAddresses[index] == undefined) {
              return "";
            } else {
              return accountAddresses[index];
            }
          }
        }
        if (colLabel.toLowerCase() == "email" && colSpt && colLabel) {
          let emailLabels = item.emailLabels ? item.emailLabels.split(",") : "";
          let emails = item.emails ? item.emails.split(",") : "";
          if (emailLabels && emails) {
            emailLabels = emailLabels.map((s) => s.trim());
            emails = emails.map((s) => s.trim());
            emailLabels = emailLabels.map((s) => s.toLowerCase());
            let index = emailLabels.indexOf(colTrm);
            if (typeof emails[index] == undefined) {
              return "";
            } else {
              return emails[index];
            }
          }
        }
      }
      return "";
    }
    return "";
  }
  fieldsShortName(colName) {
    if (colName.length > 20) {
      let colString = colName.substring(0, 16);
      colName = colString + "...";
      return colName;
    }
    return colName;
  }
  filterLabelFields(o) {
    if (
      !this.objAdvancedSearch.label ||
      this.objAdvancedSearch.label.length === 0
    ) {
      return true;
    }

    const found = this.objAdvancedSearch.label.some((el) => {
      if (o.additionalPhoneLabels && el.labelType == "Phone") {
        let additionalPhoneLabels = o.additionalPhoneLabels.split(",");
        additionalPhoneLabels = additionalPhoneLabels.map((s) => s.trim());
        if (
          additionalPhoneLabels.some(
            (item) => item.toLowerCase() == el.labelName.toLowerCase()
          )
        ) {
          return true;
        }
      }
      if (o.emailLabels && el.labelType == "Email") {
        let emailLabels = o.emailLabels.split(",");
        emailLabels = emailLabels.map((s) => s.trim());
        if (
          emailLabels.some(
            (item) => item.toLowerCase() == el.labelName.toLowerCase()
          )
        ) {
          return true;
        }
      }
      if (o.accountAddressLabels && el.labelType == "Address") {
        let address = o.accountAddressLabels.split(";");
        address = address.map((s) => s.trim());
        if (
          address.some(
            (item) => item.toLowerCase() == el.labelName.toLowerCase()
          )
        ) {
          return true;
        }
      }
      return false;
    });
    return found;
  }

  settingOpenClose() {
    this.settingFnc = !this.settingFnc;
  }
  ngOnDestroy() {
    this.commonMethodService.isDonorListsPage = false;
  }
  isCheckedFieldsLabel(element: string = "", index: number = 0) {
    let result = this.colFields[index].items.filter(
      (x) => x.sortName == element.trim()
    );
    return result && result.length > 0 ? result[0].isVisible : false;
  }
  getFieldsLabel(element: string, index: number = 0, colName: string) {
    let colNameObj = this.colFields[index].items.find(
      (item) =>
        item.sortName.trim() == element.trim() &&
        item.colName.includes(colName) &&
        item.isVisible
    );
    return colNameObj ? colNameObj.colName : "";
  }

  getSubSplit(substring = "", item = "", index = 0) {
    return item.includes(substring) ? item.split(substring)[index]?.trim() : "";
  }

  zipLabel(res, arr2, row = {}, labelType, substring) {
    res.map((element, index) => {
      if (this.getFieldsLabel(element, 0, labelType)) {
        row[this.getFieldsLabel(element, 0, labelType)] = this.getSubSplit(
          substring,
          arr2,
          index
        );
      }
    });
    return row;
  }
  deleteHeaderValue(header, val) {
    const index = header.indexOf(val);
    if (index > -1) {
      header.splice(index, 1);
    }
    return header;
  }
  insertHeaderValue(header, val, index) {
    if (index > -1) {
      header.splice(index, 0, val);
    }
    return header;
  }

  openCalendarPopup() {
    this.commonMethodService.featureName = null;
    this.commonMethodService.openCalendarPopup(
      this.class_id,
      this.class_hid,
      this.selectedDateRange,
      false,
      "listDynamicsCalender"
    );
    this.calendarSubscription = this.commonMethodService
      .getCalendarArray()
      .subscribe((items) => {
        if (
          items &&
          items.pageName == "DonorList" &&
          this.commonMethodService.isCalendarClicked == true
        ) {
          this.selectedDateRange = items.obj;
          this.pageSyncService.DonorCalDate = items.obj;
          this.EngHebCalPlaceholder =
            this.hebrewEngishCalendarService.EngHebCalPlaceholder;
          this.pageSyncService.DonorEngCalPlaceholder =
            this.EngHebCalPlaceholder;
          this.commonMethodService.isCalendarClicked = false;
          if (this.pageSyncService.uiPageSettings["donorList"] != undefined) {
            this.pageSyncService.uiPageSettings[
              "donorList"
            ].donorCalendarPlaceHolderId = this.hebrewEngishCalendarService.id;
          }
          this.calendarSubscription.unsubscribe();
          if (this.popContent) {
            this.popContent.close();
          }
          this.isDateApply = true;
          this.getTotalPanel();
        }
      });
  }

  onClickedOutsidePopover(p1: any) {
    if (!(event.target as HTMLElement).closest(".popover")) {
      p1.close();
    } else {
    }
  }
  onClickMoreActions() {
    const element = document.getElementById("actionButton") as HTMLInputElement;
    element.setAttribute("data-toggle", "dropdown");
  }
  importToken() {
    this.isloading = false;
    this.modalOptions = {
      centered: true,
      size: "md",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup import-doc",
    };
    const modalRef = this.commonMethodService.openPopup(
      ImportTokenComponent,
      this.modalOptions
    );
    modalRef.componentInstance.isloading.subscribe((res) => {
      this.isloading = true;
    });
    modalRef.componentInstance.emtMergeDonorModel.subscribe((res) => {
      this.isloading = false;
      this.RefreshDonorList();
    });
  }

  toggleDonorImports() {
    const element = $("#import-data-donar");
    element.hasClass("show")
      ? element.removeClass("show")
      : element.addClass("show");
  }

  updateSort(event, index) {
    if (event) {
      this.colFields.forEach((field) => {
        field.items.forEach((item) => {
          if (item.sortOrder) item.sortOrder = "";
        });
      });

      let sortCol = this.colFields[index].items.find(
        (item) => item.sortName == event.sortBy
      );
      if (sortCol) sortCol.sortOrder = event.sortOrder;
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

    this.donorSelectedArray = [];
    this.displayThisPageArray.forEach((accountId) => {
      let donor = this.gridFilterData.find(
        (donor) => donor.accountId == accountId
      );
      this.donorSelectedArray.push(donor);
    });

    this.recordSelectedArray = this.displayThisPageArray;
  }

  selectPopupOpen(event) {
    if (event.target.checked) {
      this.displayThisPageArray = [];
      this.isSelectPopupShow = true;
      event.target.checked = false;
      this.isBulkCheckbox = false;
      let count = $("#scrollDonorList tr").length;
      this.displayThisPageCount =
        this.gridFilterData && this.gridFilterData.length > 0 ? count - 1 : 0;
      return;
    }
    this.isSelected = false;
    this.isCustomReport = false;
    this.isSelectPopupShow = false;
    this.recordSelectedArray = [];
    this.donorSelectedArray = [];
  }
}
