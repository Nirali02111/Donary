import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { Subject } from "rxjs";
import {
  AdvancedFieldObj,
  AdvancedFieldService,
} from "src/app/services/advancedfield.service";
import { CommonMethodService } from "../../../commons/common-methods.service";
import { LocalstoragedataService } from "../../../commons/local-storage-data.service";
declare var $: any;
import * as _ from "lodash";
import { DaterangepickerDirective } from "ngx-daterangepicker-material";
import * as moment from "moment";
import { DonorService } from "src/app/services/donor.service";
import { PledgePaymentService } from "src/app/services/pledge-payment.service";
import { CommonAPIMethodService } from "src/app/services/common-api-method.service";
import { PageSyncService } from "src/app/commons/pagesync.service";
import { isNumber } from "highcharts";
import { AngularMultiSelect } from "src/app/commons/modules/angular-multi-select-module/multiselect.component";

interface dynaObj {
  id: any;
  itemName: string;
  filtervalue: any;
  options: Array<{ id: number; itemName: string }>;
  isDisplayed: boolean;
  type: string;
}

@Component({
  selector: "app-transaction-advanced-filter-popup",
  templateUrl: "./transaction-advanced-filter-popup.component.html",
  styleUrls: ["./transaction-advanced-filter-popup.component.scss"],
  standalone: false,
})
export class TransactionAdvancedFilterPopupComponent
  implements OnInit, OnDestroy
{
  @Output() emtOutputAdvancedFilterData: EventEmitter<any> = new EventEmitter();
  @ViewChild(DaterangepickerDirective, { static: false })
  pickerDirective: DaterangepickerDirective;

  @Input() set isPaymentTab(res: boolean) {
    if (res) {
      this.isPaymentStatusFilterVisible = true;
      this.isBatch = true;
      this.isCreatedDateFilter = true;
      this.isScheduleStatusFilterVisible = false;
      this.commonMethodService.paymentDeviceList =
        this.commonMethodService.orgpaymentDeviceList;
    } else {
      this.isPaymentStatusFilterVisible = false;
      this.isBatch = false;
    }
  }
  @Input() isSearchTitle = "";
  @Input() set dateRange(daterange: any) {
    if (daterange.startDate != null) {
      this.minDate = moment(daterange.startDate);
      this.maxDate = moment(daterange.endDate);
      this.createdDateRange = daterange;
    }
  }

  @Input() FeatureName: string;

  @Input() set isPledgeTab(res: boolean) {
    if (res) {
      this.isPaymentTypeFilterVisible = false;
      this.isPledgeStatusFilterVisible = true;
      this.isScheduleStatusFilterVisible = false;
      this.commonMethodService.selectedPledgeStatus =
        this.commonMethodService.selectedPledgeStatus &&
        this.commonMethodService.selectedPledgeStatus.length > 0
          ? this.commonMethodService.selectedPledgeStatus
          : [
              { id: 1, itemName: "Open" },
              { id: 2, itemName: "Partially Paid" },
            ];
      this.commonMethodService.paymentDeviceList =
        this.commonMethodService.orgpaymentDeviceList;
    } else {
      this.isPaymentTypeFilterVisible = true;
    }
  }

  @Input() set AdvancedFilterData(selectedAdvancedSearchFilter: any) {
    if (!selectedAdvancedSearchFilter) {
      this.commonMethodService.resetCommonDropDownList();
    }
    this.setAdvancedFilterData(selectedAdvancedSearchFilter, false);
  }
  protected ngUnsubscribe: Subject<void> = new Subject<void>();
  isDeviceFilterVisible: boolean;
  isDeviceStatusFilterVisible: boolean;
  isApprovalFilterVisible: boolean;
  isScheduleRepeatTypeFilterVisible: boolean;
  isScheduleFailedCountFilterVisible: boolean;
  isFullNameFilterVisible: boolean;
  isCreatedDateFilter: boolean = false;
  isCurrencyFilterVisible: boolean;
  minDate: any;
  maxDate: any;

  /*
  isCityFilterVisible: boolean;
  isStateFilterVisible: boolean;
  isZipFilterVisible: boolean;
  **/

  isCityStateZipVisible: boolean;
  isStreetFilterVisible: boolean;

  isDefaultLocationFilterVisible: boolean;
  isGroupFilterVisible: boolean;
  isClassFilterVisible: boolean;
  isNoteFilterVisible: boolean;
  isPhoneFilterVisible: boolean;
  isEmailFilterVisible: boolean;
  isSourcDeviceFilterVisible: boolean;
  isBatchFilterVisible: boolean;
  isPaymentStatusFilterVisible: boolean;
  isPledgeStatusFilterVisible: boolean;
  isPaymentTypeFilterVisible: boolean = true;
  isScheduleStatusFilterVisible: boolean = true;
  greaterThanValidate: boolean = false;
  greaterThanBalanceValidate: boolean = false;
  isListPage: boolean = false;
  fullName: string;
  batchNum: string;
  city: string;
  state: string;
  zip: string;
  street: string;
  //defaultLocation: string;
  group: string;
  class: string;
  note: string;
  phone: string;
  email: string;
  defaultLocations = [];
  selectedItemsRoot = [];
  isBatch: boolean = false;
  isBatchClicked = false;
  createdDateRange: any = null;
  isReasonNoOptionSelected: boolean = false;
  isShowOnlyFailed: boolean = false;
  isCampaignNoOptionSelected: boolean = false;
  isLocationNoOptionSelected: boolean = false;
  isCollectorNoOptionSelected: boolean = false;

  //dropdown Field
  campaignList = [];
  reasonList = [];
  locationList = [];
  collectorList = [];
  isCampaignDisable = false;

  citysSelected = [];
  citysList = [];
  zipsList = [];
  zipsSelected = [];
  isCityDpwDisable: boolean = false;
  isZipDpwDisable: boolean = false;

  // Advanced Field
  selectAdvanceField: any = [];
  haveSelectedAdvanceField: Array<any> = [];
  getAdvanceFieldList: Array<dynaObj> = [];
  AdvancedFieldResponse: Array<AdvancedFieldObj> = [];
  isAdvancedFieldVisible: boolean = false;
  isCreatedDate: boolean = false;
  isinitialize: number = 0;
  showBox: boolean = true;
  nonEditable: boolean = false;
  removeDonor: boolean = true;
  selectedDonorId: number;
  donor: string;
  isloading: boolean = true;
  @ViewChild("campDropdown") campDropdown: AngularMultiSelect;
  @ViewChild("LocationTransDropDown") LocationTransDropDown: AngularMultiSelect;
  @ViewChild("CollectorTransDropDown")
  CollectorTransDropDown: AngularMultiSelect;
  @ViewChild("ReasonTransDropDown") ReasonTransDropDown: AngularMultiSelect;

  ngAfterViewInit() {
    this.checkNoOption();
  }

  constructor(
    public activeModal: NgbActiveModal,
    public commonMethodService: CommonMethodService,
    public localstoragedataService: LocalstoragedataService,
    private advanceFieldService: AdvancedFieldService,
    private donorService: DonorService,
    public donorPledgePaymentService: PledgePaymentService,
    private commonAPIMethodService: CommonAPIMethodService,
    public pageSyncService: PageSyncService
  ) {}
  @Input() set isScheduleTab(res: boolean) {
    if (res) {
      this.isScheduleStatusFilterVisible = true;
      this.commonMethodService.selectedScheduleStatus =
        this.commonMethodService.selectedScheduleStatus &&
        this.commonMethodService.selectedScheduleStatus.length > 0
          ? this.commonMethodService.selectedScheduleStatus
          : [{ id: 1, itemName: "Scheduled" }];
      this.commonMethodService.paymentDeviceList =
        this.commonMethodService.orgpaymentDeviceList;
    } else {
      this.isScheduleStatusFilterVisible = false;
    }
  }

  @Input() set isList(res: boolean) {
    this.isListPage = res;
  }

  ngOnInit() {
    this.getFeatureSettingValues();
    $(document).ready(function () {
      let modalContent: any = $(".modal");
      modalContent.draggable({
        handle: ".modal-body",
      });
    });
    //this.commonMethodService.angular2-multiselect();
    this.bindData();
    this.getCityStateZipList();
    var eventGuid = this.localstoragedataService.getLoginUserEventGuId();
    this.advanceFieldService.getAll(eventGuid).subscribe(
      (res: any) => {
        if (res) {
          this.AdvancedFieldResponse = res;
          this.getAdvanceFieldList = this.AdvancedFieldResponse.map((o) => {
            if (o.type == "dropdown") {
              let optionArray = [];
              if (o.options) {
                optionArray = o.options.split(",");
              }
              return {
                id: o.advancedFieldId,
                itemName: o.fieldName,
                displayText: _.trim(o.fieldName, " :"),
                filtervalue: "",
                options: optionArray.map((v, i) => ({ id: i, itemName: v })),
                isDisplayed: false,
                type: o.type,
              };
            }

            return {
              id: o.advancedFieldId,
              itemName: o.fieldName,
              displayText: _.trim(o.fieldName, " :"),
              filtervalue: "",
              options: null,
              isDisplayed: false,
              type: o.type,
            };
          });
        }

        if (this.haveSelectedAdvanceField.length !== 0) {
          this.getAdvanceFieldList = this.getAdvanceFieldList.map((af) => {
            const selected = this.haveSelectedAdvanceField.find(
              (a) => a.id === af.id
            );
            if (!selected) {
              return {
                ...af,
              };
            }

            if (af.type !== "dropdown") {
              return {
                ...af,
                isDisplayed: true,
                filtervalue: selected.value || "",
              };
            }

            if (!selected.value) {
              return {
                ...af,
                isDisplayed: true,
                filtervalue: "",
              };
            }

            const options = selected.value.split(",");
            return {
              ...af,
              isDisplayed: true,
              filtervalue: af.options.filter((a) =>
                options.includes(a.itemName)
              ),
            };
          });

          this.selectAdvanceField = this.getAdvanceFieldList.filter(
            (o) => o.isDisplayed
          );
        }
      },
      (err) => {}
    );
    this.campaignList = this.commonMethodService.CampaignList;
    this.campaignList = this.campaignList.map((item) => {
      item.checked = false;
      return item;
    });
    if (!this.campaignList.some((e) => e.itemName === "No Campaign")) {
      this.campaignList.unshift({
        id: null,
        itemName: "No Campaign",
        num: "",
        checked: false,
      });
    }
    this.getReasonListV2();
    this.geCollectortListV2();

    this.locationList = this.commonMethodService.paymentLocationList;
    if (!this.locationList.some((e) => e.itemName === "No Location")) {
      this.locationList.unshift({
        id: null,
        itemName: "No Location",
        checked: false,
      });
    }
  }

  setAdvancedFilterData(selectedAdvancedSearchFilter, value) {
    if (selectedAdvancedSearchFilter) {
      this.commonMethodService.selectedDonors =
        selectedAdvancedSearchFilter.donors;
      this.commonMethodService.selectedPaymentTypes =
        selectedAdvancedSearchFilter.paymentTypes;
      this.commonMethodService.minValue =
        selectedAdvancedSearchFilter.minAmount;
      this.commonMethodService.maxValue =
        selectedAdvancedSearchFilter.maxAmount;
      this.commonMethodService.selectedPaymentReasons =
        selectedAdvancedSearchFilter.paymentReason;
      this.commonMethodService.selectedPaymentCollectors =
        selectedAdvancedSearchFilter.collectors;
      this.commonMethodService.selectedPaymentLocations =
        selectedAdvancedSearchFilter.locations;
      this.commonMethodService.selectedFromCampaignList =
        selectedAdvancedSearchFilter.campaigns;
      this.commonMethodService.selectedPaymentDevices =
        selectedAdvancedSearchFilter.paymentDevices;
      this.commonMethodService.selectedPaymentDeviceTypes =
        selectedAdvancedSearchFilter.deviceTypes;
      this.commonMethodService.selectedOrderDeviceStatus =
        selectedAdvancedSearchFilter.orderDeviceStatus;
      this.commonMethodService.selectedCityStateZipList =
        selectedAdvancedSearchFilter.cityStateZip;

      this.commonMethodService.selectedPaymentApprovals =
        selectedAdvancedSearchFilter.approvals;
      this.commonMethodService.selectedCurrencyList =
        selectedAdvancedSearchFilter.currencies;

      this.commonMethodService.selectedScheduleRepeatTypes =
        selectedAdvancedSearchFilter.scheduleRepeatType;
      this.commonMethodService.selectedPaymentStatus =
        selectedAdvancedSearchFilter.paymentStatus;
      this.commonMethodService.selectedPledgeStatus =
        selectedAdvancedSearchFilter.pledgeStatus;
      this.commonMethodService.selectedScheduleStatus =
        selectedAdvancedSearchFilter.scheduleStatus;
      this.fullName = selectedAdvancedSearchFilter.fullName;
      this.batchNum = selectedAdvancedSearchFilter.batchNum;

      this.city = selectedAdvancedSearchFilter.city;
      this.state = selectedAdvancedSearchFilter.state;
      this.zip = selectedAdvancedSearchFilter.zip;
      this.commonMethodService.selectedCityTypes =
        selectedAdvancedSearchFilter.cities;
      this.commonMethodService.selectedZipTypes =
        selectedAdvancedSearchFilter.zips;
      this.street = selectedAdvancedSearchFilter.street;
      this.defaultLocations = selectedAdvancedSearchFilter.defaultLocation;
      this.group = selectedAdvancedSearchFilter.group;
      this.class = selectedAdvancedSearchFilter.class;
      this.note = selectedAdvancedSearchFilter.note;
      this.phone = selectedAdvancedSearchFilter.phone;
      this.email = selectedAdvancedSearchFilter.email;
      this.createdDateRange = selectedAdvancedSearchFilter.createdDate;

      if (
        selectedAdvancedSearchFilter.AdvancedFields &&
        selectedAdvancedSearchFilter.AdvancedFields.length > 0
      ) {
        this.haveSelectedAdvanceField =
          selectedAdvancedSearchFilter.AdvancedFields;
        this.isAdvancedFieldVisible = true;
      }

      if (
        selectedAdvancedSearchFilter.paymentDevices &&
        selectedAdvancedSearchFilter.paymentDevices.length > 0
      ) {
        this.isSourcDeviceFilterVisible = true;
      }

      if (
        selectedAdvancedSearchFilter.orderDeviceStatus &&
        selectedAdvancedSearchFilter.orderDeviceStatus.length > 0
      ) {
        this.isDeviceStatusFilterVisible = true;
      }

      if (
        selectedAdvancedSearchFilter.approvals &&
        selectedAdvancedSearchFilter.approvals.length > 0
      ) {
        this.isApprovalFilterVisible = true;
      }
      if (
        (selectedAdvancedSearchFilter.scheduleRepeatType &&
          selectedAdvancedSearchFilter.scheduleRepeatType.length > 0) ||
        selectedAdvancedSearchFilter.isScheduleRepeatTypeFilterVisible
      ) {
        this.isScheduleRepeatTypeFilterVisible = true;
        if (
          (selectedAdvancedSearchFilter.scheduleFailedCount &&
            selectedAdvancedSearchFilter.scheduleFailedCount.length > 0) ||
          selectedAdvancedSearchFilter.isScheduleFailedCountFilterVisible
        ) {
          this.isScheduleFailedCountFilterVisible = true;
        }
      }
      if (selectedAdvancedSearchFilter.createdDate) {
        this.isCreatedDate = true;
      }
      if (selectedAdvancedSearchFilter.fullName) {
        this.isFullNameFilterVisible = true;
      }
      if (selectedAdvancedSearchFilter.batchNum) {
        this.isBatchFilterVisible = true;
        this.isBatchClicked = false;
      }

      if (selectedAdvancedSearchFilter.isBatchClicked) {
        this.isBatchFilterVisible = true;
        this.isBatchClicked = true;
      }

      /*if (selectedAdvancedSearchFilter.city) {
        this.isCityFilterVisible = true;
      }
      if (selectedAdvancedSearchFilter.state) {
        this.isStateFilterVisible = true;
      }
      if (selectedAdvancedSearchFilter.zip) {
        this.isZipFilterVisible = true;
      }*/

      if (
        selectedAdvancedSearchFilter.cityStateZip &&
        selectedAdvancedSearchFilter.cityStateZip.length > 0
      ) {
        this.isCityStateZipVisible = true;
      }
      if (selectedAdvancedSearchFilter.street) {
        this.isStreetFilterVisible = true;
      }
      if (
        selectedAdvancedSearchFilter.defaultLocation &&
        selectedAdvancedSearchFilter.defaultLocation.length > 0
      ) {
        this.isDefaultLocationFilterVisible = true;
      }
      if (selectedAdvancedSearchFilter.group) {
        this.isGroupFilterVisible = true;
      }
      if (selectedAdvancedSearchFilter.class) {
        this.isClassFilterVisible = true;
      }
      if (selectedAdvancedSearchFilter.note) {
        this.isNoteFilterVisible = true;
      }
      if (selectedAdvancedSearchFilter.phone) {
        this.isPhoneFilterVisible = true;
      }
      if (selectedAdvancedSearchFilter.email) {
        this.isEmailFilterVisible = true;
      }
      if (
        selectedAdvancedSearchFilter.currencies &&
        selectedAdvancedSearchFilter.currencies.length > 0
      ) {
        this.isCurrencyFilterVisible = true;
      }
    }
    if (value) {
      this.searchTransactions(true);
    }
  }
  onCampaignSelect(items) {
    let { selectedItems } = items;
    var item = selectedItems;
    var isNoCampaignSelected = selectedItems.some((item) => item.id === -1);
    if (isNoCampaignSelected) {
      items.clearSelection();
      var nocampaign = selectedItems.find((item) => item.id === -1);
      items.addSelected(nocampaign);
      items.defaultSettings.limitSelection = 1;
    } else {
      if (selectedItems[0].id) {
        items.defaultSettings.limitSelection = undefined;
      }
    }
    if (selectedItems.id == null && selectedItems.checked == false) {
      this.campaignList = this.campaignList.map((item) => {
        item.checked = true;
        return item;
      });
      this.isCampaignNoOptionSelected = true;
    } else {
      if (selectedItems.id == null && item.checked == false) {
        this.isCampaignNoOptionSelected = false;
      }
    }
  }

  getListData(type: string) {
    switch (type) {
      case "Campaign":
        if (
          !this.commonMethodService.localCampaignList.find(
            (item) => item.itemName == "~No Campaign~"
          )
        )
          if (this.isSearchTitle == "Payment") {
            this.commonMethodService.localCampaignList.unshift({
              id: -1,
              itemName: "~No Campaign~",
            });
          }
        return [...this.commonMethodService.localCampaignList];
      case "Reason":
        if (
          !this.commonMethodService.localReasonList.find(
            (item) => item.itemName == "~No Reason~"
          )
        )
          return [...this.commonMethodService.paymentReasonList];

        if (this.isSearchTitle == "Payment") {
          this.commonMethodService.localReasonList.unshift({
            id: -1,
            itemName: "~No Reason~",
          });
        }
        return [...this.commonMethodService.localReasonList];
      case "Collector":
        if (
          !this.commonMethodService.localCollectorList.find(
            (item) => item.itemName == "~No Collector~"
          )
        )
          if (this.isSearchTitle == "Payment") {
            this.commonMethodService.localCollectorList.unshift({
              id: -1,
              itemName: "~No Collector~",
            });
          }
        return [...this.commonMethodService.localCollectorList];
      case "Location":
        if (
          !this.commonMethodService.localLocationList.find(
            (item) => item.itemName == "~No Location~"
          )
        )
          if (this.isSearchTitle == "Payment") {
            this.commonMethodService.localLocationList.unshift({
              id: -1,
              itemName: "~No Location~",
            });
          }
        return [...this.commonMethodService.localLocationList];
      default:
        break;
    }
  }

  onCampaignDeselect(item) {
    item.defaultSettings.limitSelection = undefined;
    this.campaignList = this.campaignList.map((item) => {
      item.checked = false;
      return item;
    });
  }

  onLocationDeSelect(item) {
    item.defaultSettings.limitSelection = undefined;
  }

  onDeSelect(item) {
    item.defaultSettings.limitSelection = undefined;
  }

  onCollectorSelect(items) {
    let { selectedItems } = items;
    var item = selectedItems;
    var isNoCollectorSelected = selectedItems.some((item) => item.id === -1);
    if (isNoCollectorSelected) {
      items.clearSelection();
      var nocollector = selectedItems.find((item) => item.id === -1);
      items.addSelected(nocollector);
      items.defaultSettings.limitSelection = 1;
    } else {
      if (selectedItems[0].id) {
        items.defaultSettings.limitSelection = undefined;
      }
    }
    if (item.id == null && item.checked == false) {
      this.collectorList = this.collectorList.map((item) => {
        item.checked = true;
        return item;
      });
      this.isCollectorNoOptionSelected = true;
    } else {
      if (item.id == null && item.checked == false) {
        this.isCollectorNoOptionSelected = false;
      }
    }
  }

  onReasonSelect(items) {
    let { selectedItems } = items;
    var item = selectedItems;
    var isReasonSelected = selectedItems.some((item) => item.id === -1);
    if (isReasonSelected) {
      items.clearSelection();
      var noreason = selectedItems.find((item) => item.id === -1);
      items.addSelected(noreason);
      items.defaultSettings.limitSelection = 1;
    } else {
      if (selectedItems[0].id) {
        items.defaultSettings.limitSelection = undefined;
      }
    }
    if (item.id == null && item.checked == false) {
      this.reasonList = this.reasonList.map((item) => {
        item.checked = true;
        return item;
      });
      this.isReasonNoOptionSelected = true;
    } else {
      if (item.id == null && item.checked == false) {
        this.isReasonNoOptionSelected = false;
      }
    }
  }
  onFailedCountSelect(item) {
    if (item.itemName.length !== 0 && item.id) {
      this.isShowOnlyFailed = true;
    }
  }
  onLocationSelect(items) {
    let { selectedItems } = items;
    var item = selectedItems;
    var isNoLocationSelected = selectedItems.some((item) => item.id === -1);
    if (isNoLocationSelected) {
      items.clearSelection();
      var nolocation = selectedItems.find((item) => item.id === -1);
      items.addSelected(nolocation);
      items.defaultSettings.limitSelection = 1;
    } else {
      if (selectedItems[0].id) {
        items.defaultSettings.limitSelection = undefined;
      }
    }
    if (item.id == null && item.checked == false) {
      this.locationList = this.locationList.map((item) => {
        item.checked = true;
        return item;
      });
      this.isLocationNoOptionSelected = true;
    } else {
      if (item.id == null && item.checked == false) {
        this.isLocationNoOptionSelected = false;
      }
    }
  }

  // if route change then unsubscribe all http request of current page using unsubscribe method
  ngOnDestroy() {
    // This aborts all HTTP requests.
    this.ngUnsubscribe.next();
    // This completes the subject properlly.
    this.ngUnsubscribe.complete();
  }

  bindData() {
    if (this.isPaymentStatusFilterVisible) {
      this.commonMethodService.bindCommonFieldDropDownsCache(
        this.ngUnsubscribe,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        false,
        true,
        false,
        false,
        true,
        true
      );
    } else if (this.isPledgeStatusFilterVisible) {
      this.commonMethodService.bindCommonFieldDropDownsCache(
        this.ngUnsubscribe,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        false,
        true,
        true,
        false,
        true,
        true
      );
    } else if (this.isScheduleStatusFilterVisible) {
      this.commonMethodService.bindCommonFieldDropDownsCache(
        this.ngUnsubscribe,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        false,
        true,
        true,
        true
      );
    }
  }

  // city and zip functionality code started
  getCityStateZipList() {
    var eventGuid = this.localstoragedataService.getLoginUserEventGuId();
    this.donorService.getDonorCityStateZip(eventGuid).subscribe((res: any) => {
      this.bindCityZipListDropDown(res);
    });
  }
  bindCityZipListDropDown(cityStateZipRes) {
    if (cityStateZipRes) {
      let citys = [];
      let zips = [];
      if (cityStateZipRes && cityStateZipRes.length > 0) {
        cityStateZipRes.forEach((element, i) => {
          let objCity = {
            id: i,
            itemName: `${element.city || ""} ${element.state || ""}`,
            city: element.city,
            state: element.state,
          };
          let objZip = {
            id: i,
            itemName: `${element.zip || ""}`,
            city: element.city,
            state: element.state,
          };
          if (objCity.itemName) {
            citys.push(objCity);
          }
          if (objZip.itemName) {
            zips.push(objZip);
          }
        });
      }
      this.citysList = citys.reduce((uniqueCitys, o) => {
        if (!uniqueCitys.some((obj) => obj.itemName === o.itemName)) {
          uniqueCitys.push(o);
        }
        return uniqueCitys;
      }, []);

      this.zipsList = zips.reduce((uniqueZips, o) => {
        if (!uniqueZips.some((obj) => obj.itemName === o.itemName)) {
          uniqueZips.push(o);
        }
        return uniqueZips;
      }, []);
    }
  }

  onDeleteCitys() {
    this.commonMethodService.selectedCityTypes = [];
    this.isZipDpwDisable = false;
  }

  onCitysSelect() {
    if (
      this.citysList &&
      this.commonMethodService.selectedCityTypes.length > 0
    ) {
      this.isCityDpwDisable = false;
      this.isZipDpwDisable = true;
    }
  }

  enableCityDpw() {
    if (
      this.citysList &&
      this.commonMethodService.selectedCityTypes.length == 0
    ) {
      this.isCityDpwDisable = false;
      this.isZipDpwDisable = false;
    }
  }

  onDeleteZips() {
    this.commonMethodService.selectedZipTypes = [];
    this.isCityDpwDisable = false;
  }
  onZipsSelect() {
    if (this.zipsList && this.commonMethodService.selectedZipTypes.length > 0) {
      this.isCityDpwDisable = true;
      this.isZipDpwDisable = false;
    }
  }

  enableZipDpw() {
    if (
      this.zipsSelected &&
      this.commonMethodService.selectedZipTypes.length == 0
    ) {
      this.isCityDpwDisable = false;
      this.isZipDpwDisable = false;
    }
  }

  enableDisableDropdown() {
    if (this.commonMethodService.selectedCityTypes != undefined) {
      if (this.commonMethodService.selectedCityTypes.length > 0) {
        this.isCityDpwDisable = false;
        this.isZipDpwDisable = true;
      }
    }
    if (this.commonMethodService.selectedZipTypes != undefined) {
      if (this.commonMethodService.selectedZipTypes.length > 0) {
        this.isCityDpwDisable = true;
        this.isZipDpwDisable = false;
      }
    }
  }
  // city and zip functionality code ended

  displayFilter(filterName: string) {
    switch (filterName) {
      case "sourceStatus":
        this.isDeviceStatusFilterVisible = true;
        break;
      case "device":
        this.isDeviceFilterVisible = true;
        break;
      case "approval":
        this.isApprovalFilterVisible = true;
        break;
      case "scheduleRepeatType":
        this.isScheduleRepeatTypeFilterVisible = true;
        break;
      case "scheduleFailedCount":
        this.isScheduleFailedCountFilterVisible = true;
        break;
      case "fullName":
        this.isFullNameFilterVisible = true;
        break;

      /*
      case 'city':
        this.isCityFilterVisible = true;
        break;
      case 'state':
        this.isStateFilterVisible = true;
        break;
      case 'zip':
        this.isZipFilterVisible = true;
        break;
      */
      case "cityStateZip":
        this.isCityStateZipVisible = true;
        this.enableDisableDropdown();
        break;
      case "street":
        this.isStreetFilterVisible = true;
        break;
      case "defaultLocation":
        this.isDefaultLocationFilterVisible = true;
        break;
      case "group":
        this.isGroupFilterVisible = true;
        break;
      case "class":
        this.isClassFilterVisible = true;
        break;
      case "note":
        this.isNoteFilterVisible = true;
        break;
      case "phone":
        this.isPhoneFilterVisible = true;
        break;
      case "email":
        this.isEmailFilterVisible = true;
        break;
      case "sourceDevice":
        this.isSourcDeviceFilterVisible = true;
        break;
      case "batchNum":
        this.isBatchFilterVisible = true;
        break;
      case "advancedField":
        this.isAdvancedFieldVisible = true;
        break;
      case "createdDate":
        this.isCreatedDate = true;
        break;
      case "currency":
        this.isCurrencyFilterVisible = true;
        break;
    }

    this.isPaymntDrpDwn = false;
    this.isSchdlDrpDwn = false;
    this.isDnrDrpDwn = false;
    this.isMDrpDwn = false;
  }

  searchTransactions(value: boolean) {
    if (
      this.commonMethodService.minValue != null &&
      this.commonMethodService.maxValue != null &&
      this.commonMethodService.minValue > this.commonMethodService.maxValue
    ) {
      this.greaterThanValidate = true;
      return;
    }

    if (
      this.isPledgeStatusFilterVisible &&
      this.commonMethodService.minBalanceValue != null &&
      this.commonMethodService.maxBalanceValue != null &&
      this.commonMethodService.minBalanceValue >
        this.commonMethodService.maxBalanceValue
    ) {
      this.greaterThanBalanceValidate = true;
      return;
    }

    this.searchTransactionData(value);
  }

  searchTransactionData(closeValue: boolean) {
    let objAdvancedSearch = {
      AdvancedFields: this.getAdvanceFieldList
        .map((af) => {
          if (af.isDisplayed) {
            if (af.type === "dropdown") {
              if (af.filtervalue) {
                return {
                  id: af.id,
                  name: af.itemName,
                  value: af.filtervalue.map((x) => x.itemName).toString(),
                };
              }
              // return { id: af.id ,"name":af.itemName,"value": af.filtervalue || ''}
            }
            return {
              id: af.id,
              name: af.itemName,
              value: af.filtervalue || "",
            };
          }
          return null;
        })
        .filter((a) => a !== null),

      donors: this.commonMethodService.selectedDonors,
      paymentTypes: this.commonMethodService.selectedPaymentTypes,
      minAmount: this.commonMethodService.minValue,
      maxAmount: this.commonMethodService.maxValue,
      paymentReason: this.commonMethodService.selectedPaymentReasons,
      collectors: this.commonMethodService.selectedPaymentCollectors,
      locations: this.commonMethodService.selectedPaymentLocations,

      campaigns: this.commonMethodService.selectedFromCampaignList,
      paymentDevices: this.commonMethodService.selectedPaymentDevices,
      deviceTypes: this.commonMethodService.selectedPaymentDeviceTypes,
      orderDeviceStatus: this.commonMethodService.selectedOrderDeviceStatus,
      approvals: this.commonMethodService.selectedPaymentApprovals,
      scheduleRepeatType: this.commonMethodService.selectedScheduleRepeatTypes,

      paymentStatus: this.commonMethodService.selectedPaymentStatus,
      pledgeStatus: this.commonMethodService.selectedPledgeStatus,
      scheduleStatus: this.commonMethodService.selectedScheduleStatus,
      fullName: this.fullName,
      batchNum: this.batchNum,
      city: this.city,
      state: this.state,
      zip: this.zip,
      //cityStateZip: this.commonMethodService.selectedCityStateZipList,
      cityStateZip: this.commonMethodService.selectedZipTypes,
      cities: this.commonMethodService.selectedCityTypes,
      zips: this.commonMethodService.selectedZipTypes,
      street: this.street,
      defaultLocation: this.defaultLocations,
      group: this.group,
      class: this.class,
      note: this.note,
      phone: this.phone,
      email: this.email,
      minBalanceAmount: this.commonMethodService.minBalanceValue,
      maxBalanceAmount: this.commonMethodService.maxBalanceValue,
      isScheduleRepeatTypeFilterVisible: this.isScheduleRepeatTypeFilterVisible,
      isScheduleFailedCountFilterVisible:
        this.isScheduleFailedCountFilterVisible,
      isBatchClicked: this.isBatchClicked,
      createdDate: this.createdDateRange,
      currencies: this.commonMethodService.selectedCurrencyList,
      isReasonNoOptionSelected: this.isReasonNoOptionSelected,
      isShowOnlyFailed: this.isShowOnlyFailed,
      isCampaignNoOptionSelected: this.isCampaignNoOptionSelected,
      isLocationNoOptionSelected: this.isLocationNoOptionSelected,
      isCollectorNoOptionSelected: this.isCollectorNoOptionSelected,
    };
    this.emtOutputAdvancedFilterData.emit(objAdvancedSearch);
    if (this.isSearchTitle == "Payment") {
      const objAdvancedArray = [objAdvancedSearch];
      this.pageSyncService.paymentFilterData = objAdvancedArray[0];
    }
    if (this.isSearchTitle == "Pledge") {
      const objAdvancedArray = [objAdvancedSearch];
      this.pageSyncService.pledgeFilterData = objAdvancedArray[0];
    }
    if (this.isSearchTitle == "SchedulePayment") {
      const objAdvancedArray = [objAdvancedSearch];
      this.pageSyncService.schedulepaymentFilterData = objAdvancedArray[0];
    }
    if (closeValue == false) {
      this.activeModal.dismiss();
    }
  }

  closePopup() {
    this.activeModal.dismiss();
    this.commonMethodService.resetCommonDropDownList();
    this.clearOptionalFilter();
  }

  datesUpdated(event) {
    if (this.isinitialize == 3) {
      this.createdDateRange = event;
      if (event.startDate == null && event.endDate == null) {
        this.createdDateRange = undefined;
      }
    }
    this.isinitialize += 1;
  }
  CalendarFocus() {
    this.pickerDirective.open();
  }

  clearFilter() {
    this.commonMethodService.resetCommonDropDownList();
    this.clearOptionalFilter();
  }

  clearOptionalFilter() {
    this.commonMethodService.minValue = null;
    this.commonMethodService.maxValue = null;
    this.commonMethodService.minBalanceValue = null;
    this.commonMethodService.maxBalanceValue = null;
    this.fullName = null;
    this.batchNum = null;
    this.city = null;
    this.state = null;
    this.zip = null;
    this.street = null;
    this.defaultLocations = [];
    this.group = null;
    this.class = null;
    this.note = null;
    this.phone = null;
    this.email = null;
  }

  onItemSelect(data) {
    this.getAdvanceFieldList = this.getAdvanceFieldList.map((element) => {
      if (element.id == data.id) {
        return {
          ...element,
          isDisplayed: true,
        };
      }
      return {
        ...element,
      };
    });
  }

  onItemDeselect(data) {
    this.getAdvanceFieldList = this.getAdvanceFieldList.map((element) => {
      if (element.id == data.id) {
        return {
          ...element,
          isDisplayed: false,
        };
      }
      return {
        ...element,
      };
    });
  }

  onDeselectAll() {
    for (var item of this.getAdvanceFieldList) {
      item.filtervalue = "";
      item.isDisplayed = false;
    }
  }

  onSelectAll() {
    for (var item of this.getAdvanceFieldList) {
      item.filtervalue = "";
      item.isDisplayed = true;
    }
  }

  toggleBatch() {
    this.isBatchClicked = this.isBatchClicked ? false : true;
    if (this.isBatchClicked) {
      this.batchNum = null;
    }
  }
  //
  contains_heb(str) {
    return /[\u0590-\u05FF]/.test(str);
  }

  //

  onClickedOutside() {
    this.showBox = false;
  }

  SelectDonor(accountId) {
    this.showBox = false;
    this.nonEditable = true;
    this.selectedDonorId = accountId;
    this.removeDonor = true;
    this.commonMethodService.donorList =
      this.commonMethodService.donorList.filter((s) => s.id == accountId);
    this.donor =
      this.commonMethodService.donorList[0].fullNameJewish != null
        ? this.commonMethodService.donorList[0].fullNameJewish
        : this.commonMethodService.donorList[0].displayText;
    var eventGuid = this.localstoragedataService.getLoginUserEventGuId();
    this.isloading = true;

    this.donorPledgePaymentService
      .donorPledgePaymentList(accountId, eventGuid)
      .subscribe((res: any) => {
        if (res) {
          if (res.unpaidPledges) {
            res.unpaidPledges.forEach((element) => {
              element.pledgePaidAmount = 0;
            });
            this.isloading = false;
          } else {
            this.isloading = false;
          }
        }
      });
  }

  SearchDonor(event) {
    this.showBox = true;
    if (event == "") {
      this.commonMethodService.donorList = [];
    }
    if (event.target.value.length > 2) {
      this.search(event.target.value);
    }
  }

  search(keyword) {
    var record = this.commonMethodService.localDonorList;
    keyword = keyword.toLowerCase();
    var filterdRecord;
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
            (obj.emailLabels &&
              obj.emailLabels.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.emails &&
              obj.emails.toString().toLowerCase().indexOf(searchValue) > -1)
        );
        if (filterdRecord.length > 0) {
          for (var i = 0; i < filterdRecord.length; i++) {
            filterdRecord[i].id = filterdRecord[i].accountId;
            filterdRecord[i].displayText = filterdRecord[i].fullName;
          }
        }
        this.commonMethodService.donorList = filterdRecord;
        record = this.commonMethodService.donorList;
      }
    } else {
      this.commonMethodService.donorList = [];
    }
  }
  checkNoOption() {
    var isNoCampaignoption =
      this.commonMethodService.selectedFromCampaignList.some(
        (item) => item.id === -1
      );
    var isNoLocationoption =
      this.commonMethodService.selectedPaymentLocations.some(
        (item) => item.id === -1
      );
    var isNoCollectoroption =
      this.commonMethodService.selectedPaymentCollectors.some(
        (item) => item.id === -1
      );
    var isNoReasonoption = this.commonMethodService.selectedPaymentReasons.some(
      (item) => item.id === -1
    );
    if (isNoCampaignoption) {
      if (this.campDropdown) {
        this.campDropdown.defaultSettings.limitSelection = 1;
      }
    }
    if (isNoLocationoption) {
      if (this.LocationTransDropDown) {
        this.LocationTransDropDown.defaultSettings.limitSelection = 1;
      }
    }
    if (isNoCollectoroption) {
      if (this.CollectorTransDropDown) {
        this.CollectorTransDropDown.defaultSettings.limitSelection = 1;
      }
    }
    if (isNoReasonoption) {
      if (this.ReasonTransDropDown) {
        this.ReasonTransDropDown.defaultSettings.limitSelection = 1;
      }
    }
  }
  RemoveDonor() {
    this.nonEditable = false;
    this.donor = null;
    this.selectedDonorId = -1; //null;//added new
    this.removeDonor = false;
  }
  isPaymntDrpDwn: boolean = false;
  isSchdlDrpDwn: boolean = false;
  isDnrDrpDwn: boolean = false;
  isMDrpDwn: boolean = false;
  isDrpDwn(event) {
    if (event === "payment") {
      this.isPaymntDrpDwn = true;
      this.isSchdlDrpDwn = false;
      this.isDnrDrpDwn = false;
    } else if (event === "donor") {
      this.isPaymntDrpDwn = false;
      this.isSchdlDrpDwn = false;
      this.isDnrDrpDwn = true;
    } else if (event === "schedule") {
      this.isPaymntDrpDwn = false;
      this.isSchdlDrpDwn = true;
      this.isDnrDrpDwn = false;
    }
  }
  onDrpOutside() {
    this.isMDrpDwn = false;
  }
  onClickedDrpOutside() {
    this.isPaymntDrpDwn = false;
    this.isSchdlDrpDwn = false;
    this.isDnrDrpDwn = false;
  }
  getReasonListV2() {
    const eventGuid = this.localstoragedataService.getLoginUserEventGuId();
    this.commonAPIMethodService
      .getPaymentReasonsV2(eventGuid)
      .subscribe((res: any) => {
        this.reasonList = this.bindPaymentReasonListDropDown(res);
        this.reasonList = this.sortByStatus(this.reasonList, "Active");
        if (!this.reasonList.some((e) => e.itemName === "No Reason")) {
          this.reasonList.unshift({
            id: null,
            itemName: "No Reason",
            checked: false,
          });
        }
      });
  }
  bindPaymentReasonListDropDown(resReason) {
    if (!resReason || (resReason && resReason.length === 0)) {
      return [];
    }
    return resReason.map((element) => {
      return {
        id: element.reasonId,
        itemName:
          element.reasonJewishName != ""
            ? element.reasonJewishName
            : element.paymentReason,
        reasonJewishName: element.reasonJewishName,
        num: element.number != null ? `"#"${element.number}` : "",
        status: element.status,
      };
    });
  }
  sortByStatus(array = [], status = "") {
    return array.sort((a, b) => {
      if (a.status === status && b.status !== status) {
        return -1;
      }
      if (a.status !== status && b.status === status) {
        return 1;
      }
      return 0;
    });
  }
  geCollectortListV2() {
    var eventGuid = this.localstoragedataService.getLoginUserEventGuId();
    this.commonAPIMethodService
      .getPaymentCollectorsV2(eventGuid)
      .subscribe((res: any) => {
        if (res && res.length > 0) {
          const collectorList = res.map((element) => {
            return {
              id: element.collectorId,
              itemName:
                element.collectorJewishName != null
                  ? element.collectorJewishName
                  : element.collectorName,
              status: element.status,
            };
          });

          this.collectorList = this.sortByStatus(collectorList, "Active");
        }
        if (!this.collectorList.some((e) => e.itemName === "No Collector")) {
          this.collectorList.unshift({
            id: null,
            itemName: "No Collector",
            checked: false,
          });
        }
      });
  }
  getFeatureSettingValues() {
    this.commonMethodService.featureName = this.FeatureName;
    this.commonMethodService.getFeatureSettingValues();
  }
  onUpgrade() {
    // this.activeModal.dismiss();
    this.commonMethodService.commenSendUpgradeEmail(
      this.commonMethodService.featureDisplayName
    );
  }

  selectAll(type: string, e, item) {
    this.commonMethodService.onSelectAll(type, e);
    let { selectedItems } = item;
    let noValue = selectedItems.find((item) => item.id == -1);
    if (noValue) {
      item.removeSelected(noValue);
    }
    if ($(`[for=${item.id}]`)[0].innerText == "UnSelect All")
      item.clearSelection();

    let obj = $(`[for=${item.id}] span`);
    for (let key in obj) {
      if (isNumber(+key)) obj[key]["hidden"] = !obj[key]["hidden"];
    }
  }
}
