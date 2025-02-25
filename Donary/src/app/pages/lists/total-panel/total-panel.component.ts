import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
  AfterViewInit,
} from "@angular/core";
import * as moment from "moment";

import { DaterangepickerDirective } from "ngx-daterangepicker-material";
import { CommonMethodService } from "./../../../commons/common-methods.service";
import { LocalstoragedataService } from "./../../../commons/local-storage-data.service";
import { TotalPanelService } from "src/app/services/totalpanel.service";
import * as _ from "lodash";

import { XLSXService } from "src/app/services/xlsx.service";
import { DataTable } from "src/app/commons/modules/data-table/DataTable";
declare var $: any;

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

@Component({
  selector: "app-total-panel",
  templateUrl: "./total-panel.component.html",
  standalone: false,
  styleUrls: ["./total-panel.component.scss"],
})
export class TotalPanelComponent implements OnInit, AfterViewInit {
  @ViewChild(DaterangepickerDirective, { static: false })
  pickerDirective: DaterangepickerDirective;
  objAdvancedSearch: any;
  isloading: boolean;
  selectedDateRange: any;
  @Output() emtOutputClose: EventEmitter<any> = new EventEmitter();
  @Output() emtOutputPageChange: EventEmitter<any> = new EventEmitter();

  @ViewChild("sv", { static: true }) svTable: DataTable;
  showAll: Boolean = false;

  gridData: Array<any>;
  gridFilterData: Array<any>;
  paymentTypeChipData: Array<any>;
  cardFilter = [];
  cardType: any = [{ id: 1, itemName: "Campaign" }];
  isFiltered: boolean = false;
  filterRecord: number = 0;
  totalRecord: number = 0;
  isinitialize: number = 0;

  isPaymentsColVisible: boolean = true;
  isOpenPledgeColVisible: boolean = true;
  isScheduledColVisible: boolean = true;
  isTotalColVisible: boolean = true;
  groupBy: string;

  initActivepage: number;
  initRowsonpage: number;

  listRecords: Array<any> = [];

  parentHeaderList: Array<any> = [];

  headerList: any = [
    {
      colName: "Payments",
      visibleCondition: this.isPaymentsColVisible,
      sortName: "payments",
    },
    {
      colName: "Open Pledges",
      visibleCondition: this.isOpenPledgeColVisible,
      sortName: "openPledges",
    },
    {
      colName: "Scheduled",
      visibleCondition: this.isScheduledColVisible,
      sortName: "scheduled",
    },
    {
      colName: "Total",
      visibleCondition: this.isTotalColVisible,
      sortName: "raised",
    },
  ];

  colFields: any = [
    {
      colName: "Payments",
      isVisible: this.isPaymentsColVisible,
      colId: "totalpnl_payments",
    },
    {
      colName: "Open Pledges",
      isVisible: this.isOpenPledgeColVisible,
      colId: "totalpnl_pledges",
    },
    {
      colName: "Scheduled",
      isVisible: this.isScheduledColVisible,
      colId: "totalpnl_schedules",
    },
    {
      colName: "Total",
      isVisible: this.isTotalColVisible,
      colId: "totalpnl_raised",
    },
  ];
  @Input() set GroupBy(data: any) {
    if (data) {
      this.groupBy = data;
    }
  }

  @Input() set ListRecords(data: Array<any>) {
    if (data) {
      this.listRecords = data;
    }
  }

  @Input() set HeaderList(data: Array<any>) {
    if (data) {
      this.parentHeaderList = data;
    }
  }

  @Input() set ActivePage(page: number) {
    this.initActivepage = page;
  }

  @Input() set RowsOnPage(rowsOnPage: number) {
    this.initRowsonpage = rowsOnPage;
  }

  constructor(
    public commonMethodService: CommonMethodService,
    private totalPanelService: TotalPanelService,
    private localstoragedataService: LocalstoragedataService,
    private xlsxService: XLSXService
  ) {}

  ngOnInit() {
    this.cardFilter = [
      { id: 1, itemName: "Campaign" },
      { id: 2, itemName: "Reason" },
      { id: 3, itemName: "Location" },
      { id: 5, itemName: "Collector" },
      { id: 7, itemName: "Device" },
      { id: 6, itemName: "Donor" },
    ];
    $(document).ready(function () {
      var resizeOpts = {
        handles: "w",
        minWidth: 700,
      };
      $("#resizable").resizable(resizeOpts);
    });

    this.getTotalPanel();
  }

  ngAfterViewInit() {
    this.svTable.setPage(this.initActivepage, this.initRowsonpage);

    this.svTable.onPageChange.subscribe((data) => {
      this.emtOutputPageChange.emit(data);
    });
  }

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
      //"groupBy":this.groupBy
    };
    this.totalPanelService.getTotals(objTotalPanel).subscribe(
      (res: Array<PanelRes>) => {
        // hide loader
        this.isloading = false;
        this.isFiltered = false;
        if (res) {
          if (this.groupBy === "AccountId") {
            const mapedFromList = this.listRecords.map((o) => {
              const t = res.find((r) => {
                return r.accountId === o.accountId;
              });
              if (t) {
                return {
                  ...o,
                  ...t,
                };
              } else {
                return {
                  ...o,
                  openPledges: 0,
                  payments: 0,
                  raised: 0,
                  scheduled: 0,
                  accountId: o.accountId,
                  reasonId: o.reasonId,
                  campaignId: o.campaignId,
                  collectorId: o.collectorId,
                  deviceId: o.deviceId,
                  locationId: o.locationId,
                };
              }
            });

            this.totalRecord = mapedFromList.length;
            this.gridData = mapedFromList;
            this.gridFilterData = this.gridData;
          }

          if (this.groupBy === "ReasonID") {
            const mapedFromList = this.listRecords.map((o) => {
              const t = res.find((r) => {
                return r.reasonId === o.reasonId;
              });
              if (t) {
                return {
                  ...o,
                  ...t,
                };
              } else {
                return {
                  ...o,
                  openPledges: 0,
                  payments: 0,
                  raised: 0,
                  scheduled: 0,
                  accountId: o.accountId,
                  reasonId: o.reasonId,
                  campaignId: o.campaignId,
                  collectorId: o.collectorId,
                  deviceId: o.deviceId,
                  locationId: o.locationId,
                };
              }
            });

            this.totalRecord = mapedFromList.length;
            this.gridData = mapedFromList;
            this.gridFilterData = this.gridData;
            this.paymentTypeChipData = this.gridData;
          }
          if (this.groupBy === "campaignId") {
            const mapedFromList = this.listRecords.map((o) => {
              const t = res.find((r) => {
                return r.campaignId === o.campaignId;
              });
              if (t) {
                return {
                  ...t,
                };
              } else {
                return {
                  openPledges: 0,
                  payments: 0,
                  raised: 0,
                  scheduled: 0,
                  accountId: o.accountId,
                  reasonId: o.reasonId,
                  campaignId: o.campaignId,
                  collectorId: o.collectorId,
                  deviceId: o.deviceId,
                  locationId: o.locationId,
                };
              }
            });

            this.totalRecord = mapedFromList.length;
            this.gridData = mapedFromList;
            this.gridFilterData = this.gridData;
          }
          if (this.groupBy === "locationID") {
            const mapedFromList = this.listRecords.map((o) => {
              const t = res.find((r) => {
                return r.locationId === o.locationID;
              });
              if (t) {
                return {
                  ...o,
                  ...t,
                };
              } else {
                return {
                  ...o,
                  openPledges: 0,
                  payments: 0,
                  raised: 0,
                  scheduled: 0,
                  accountId: o.accountId,
                  reasonId: o.reasonId,
                  campaignId: o.campaignId,
                  collectorId: o.collectorId,
                  deviceId: o.deviceId,
                  locationId: o.locationId,
                };
              }
            });

            this.totalRecord = mapedFromList.length;
            this.gridData = mapedFromList;
            this.gridFilterData = this.gridData;
          }
          if (this.groupBy === "collectorId") {
            const mapedFromList = this.listRecords.map((o) => {
              const t = res.find((r) => {
                return r.collectorId === o.collectorId;
              });
              if (t) {
                return {
                  ...o,
                  ...t,
                };
              } else {
                return {
                  ...o,
                  openPledges: 0,
                  payments: 0,
                  raised: 0,
                  scheduled: 0,
                  accountId: o.accountId,
                  reasonId: o.reasonId,
                  campaignId: o.campaignId,
                  collectorId: o.collectorId,
                  deviceId: o.deviceId,
                  locationId: o.locationId,
                };
              }
            });

            this.totalRecord = mapedFromList.length;
            this.gridData = mapedFromList;
            this.gridFilterData = this.gridData;
          }
          if (this.groupBy === "deviceId") {
            const mapedFromList = this.listRecords.map((o) => {
              const t = res.find((r) => {
                return r.deviceId === o.deviceId;
              });
              if (t) {
                return {
                  ...o,
                  ...t,
                };
              } else {
                return {
                  ...o,
                  openPledges: 0,
                  payments: 0,
                  raised: 0,
                  scheduled: 0,
                  accountId: o.accountId,
                  reasonId: o.reasonId,
                  campaignId: o.campaignId,
                  collectorId: o.collectorId,
                  deviceId: o.deviceId,
                  locationId: o.locationId,
                };
              }
            });

            this.totalRecord = mapedFromList.length;
            this.gridData = mapedFromList;
            this.gridFilterData = this.gridData;
          }
        } else {
          this.totalRecord = 0;
          this.gridData = null;
          this.gridFilterData = this.gridData;
        }
        this.paymentTypeChipData = _(this.gridData)
          .groupBy("campaignId")
          .map((objs, key) => ({
            name: objs[0].campaign,
            total: _.sumBy(objs, "raised"),
          }))
          .value();

        $(document).ready(function () {
          var $table = $("table.redesign_table");
          $table.floatThead({
            position: "absolute",
          });
        });
      },
      (error) => {
        this.isloading = false;
        console.log(error);
        // this.notificationService.showError(error.error, "Error while fetching data !!");
      }
    );
  }

  datesUpdated(event) {
    if (this.isinitialize == 1) {
      if (event.startDate == null && event.endDate == null) {
        this.selectedDateRange = undefined;
      } else {
        this.getTotalPanel();
      }
    }
    this.isinitialize = 1;
  }

  drop(event: CdkDragDrop<string[]>) {
    var $table = $("table.redesign_table");
    moveItemInArray(this.colFields, event.previousIndex, event.currentIndex);
    moveItemInArray(this.headerList, event.previousIndex, event.currentIndex);
    moveItemInArray(
      this.gridFilterData,
      event.previousIndex,
      event.currentIndex
    );
    $table.floatThead("reflow");
  }

  dropColumn(event: CdkDragDrop<string[]>) {
    var $table = $("table.redesign_table");
    moveItemInArray(this.headerList, event.previousIndex, event.currentIndex);
    moveItemInArray(this.colFields, event.previousIndex, event.currentIndex);
    moveItemInArray(
      this.gridFilterData,
      event.previousIndex,
      event.currentIndex
    );
    $table.floatThead("reflow");
  }

  setGridColVisibility($event, colName, isVisible) {
    colName = colName.toLowerCase().replace(/\s/g, "");
    var $table = $("table.redesign_table");
    switch (colName) {
      case "payments":
        this.isPaymentsColVisible = isVisible;
        $table.floatThead("reflow");
        break;
      case "openpledges":
        this.isOpenPledgeColVisible = isVisible;
        $table.floatThead("reflow");
        break;
      case "scheduled":
        this.isScheduledColVisible = isVisible;
        $table.floatThead("reflow");
        break;
      case "total":
        this.isTotalColVisible = isVisible;
        $table.floatThead("reflow");
        break;
    }

    $event.stopPropagation();
  }

  checkGridColVisibility(colName) {
    colName = colName.toLowerCase().replace(/\s/g, "");
    switch (colName) {
      case "payments":
        return this.isPaymentsColVisible;
      case "openpledges":
        return this.isOpenPledgeColVisible;
      case "scheduled":
        return this.isScheduledColVisible;
      case "total":
        return this.isTotalColVisible;
    }
  }

  CalendarFocus() {
    this.pickerDirective.open();
  }

  GetPledgeTransByPaymentChipType(objPaymentTypeChip) {
    if (objPaymentTypeChip) {
      var cardTypeValue =
        this.cardType.length > 0
          ? this.cardType.map((s) => s.itemName).toString()
          : null;
      switch (cardTypeValue) {
        case "Campaign": //Pledge
          if (objPaymentTypeChip.paymentTypeId == "-2") {
            // For All
            this.gridFilterData = this.gridData;
            this.filterRecord = this.gridFilterData.length;
            this.isFiltered = false;
          } else {
            this.gridFilterData = this.gridData.filter(
              (s) => s.campaignID == objPaymentTypeChip.paymentTypeId
            );
            this.filterRecord = this.gridFilterData.length;
            this.isFiltered = true;
          }
          break;
      }
    }
  }

  GetPaymentChipType(value) {}

  cardTypeChange(cardType) {
    if (cardType[0].itemName == "Campaign") {
      this.paymentTypeChipData = _(this.gridData)
        .groupBy("campaignId")
        .map((objs, key) => ({
          name: objs[0].campaign,
          key: key,
          total: _.sumBy(objs, "raised"),
        }))
        .value();
    }
    if (cardType[0].itemName == "Reason") {
      this.paymentTypeChipData = _(this.gridData)
        .groupBy("reasonId")
        .map((objs, key) => ({
          name: objs[0].reasonName,
          total: _.sumBy(objs, "raised"),
        }))
        .value();
    }
    if (cardType[0].itemName == "Collector") {
      this.paymentTypeChipData = _(this.gridData)
        .groupBy("collectorId")
        .map((objs, key) => ({
          name: objs[0].fullName,
          total: _.sumBy(objs, "raised"),
        }))
        .value();
    }
    if (cardType[0].itemName == "Donor") {
      this.paymentTypeChipData = _(this.gridData)
        .groupBy("accountId")
        .map((objs, key) => ({
          name: objs[0].fullName,
          total: _.sumBy(objs, "raised"),
        }))
        .value();
    }
    if (cardType[0].itemName == "Location") {
      this.paymentTypeChipData = _(this.gridData)
        .groupBy("locationId")
        .map((objs, key) => ({
          name: objs[0].locationName,
          total: _.sumBy(objs, "raised"),
        }))
        .value();
    }
    if (cardType[0].itemName == "Device") {
      this.paymentTypeChipData = _(this.gridData)
        .groupBy("deviceId")
        .map((objs, key) => ({
          name: objs[0].deviceName,
          total: _.sumBy(objs, "raised"),
        }))
        .value();
    }
  }

  OnCheckboxChange(event) {
    if (event.target.checked) {
      this.showAll = true;
    } else {
      this.showAll = false;
    }
  }

  closePanel() {
    this.emtOutputClose.emit(true);
  }

  public downloadExcel() {
    if (this.groupBy === "AccountId") {
      this.downloadDonorExcel();
      return;
    }

    if (this.groupBy === "ReasonID") {
      this.downloadResonExcel();
      return;
    }
    if (this.groupBy === "collectorId") {
      this.downloadCollectorExcel();
      return;
    }
    if (this.groupBy === "deviceId") {
      this.downloadDeviceExcel();
      return;
    }
    if (this.groupBy === "locationID") {
      this.downloadLocationExcel();
      return;
    }
  }

  public downloadDonorExcel() {
    let results = this.gridFilterData.length && this.gridFilterData;
    let data = [];
    if (results) {
      Object.values(results).forEach((item: any) => {
        let row = {};
        let AccountNo = item && item.accountNum;
        let FullName = item && item.fullName;
        let Father = item && item.father;
        let FatherInLaw = item && item.fatherInLaw;

        this.parentHeaderList.map((o) => {
          if (o.visibleCondition) {
            if (o.colName === "Account #") {
              row["Account #"] = AccountNo;
            }
            if (o.colName === "Full Name") {
              row["Full Name"] = FullName;
            }
            if (o.colName === "Family") {
              row["Family"] = "בן :" + Father + "חתן:" + FatherInLaw;
            }
            if (o.colName === "Phone") {
              row["Phone"] = item.phonenumbers;
            }
            if (o.colName === "Address") {
              row["Address"] = item.address;
            }
            if (o.colName === "Email") {
              row["Email"] = item.emails;
            }
            if (o.colName === "Group") {
              row["Group"] = item.group;
            }
            if (o.colName === "Class") {
              row["Class"] = item.class;
            }
            if (o.colName === "City State Zip") {
              row["City State Zip"] = item.cityStateZip;
            }
            if (o.colName === "Father") {
              row["Father"] = Father;
            }
            if (o.colName === "Father In Law") {
              row["Father In Law"] = FatherInLaw;
            }
          }
        });

        if (this.isPaymentsColVisible) {
          row["Payments"] = this.commonMethodService.formatAmount(
            item.payments
          );
        }
        if (this.isOpenPledgeColVisible) {
          row["Open Pledges"] = this.commonMethodService.formatAmount(
            item.openPledges
          );
        }
        if (this.isScheduledColVisible) {
          row["Scheduled"] = this.commonMethodService.formatAmount(
            item.scheduled
          );
        }
        if (this.isTotalColVisible) {
          row["Total"] = this.commonMethodService.formatAmount(item.raised);
        }

        data.push(row);
      });
    } else {
      return;
    }

    this.xlsxService.generate("Donor Total Panel", data);
  }

  public downloadCollectorExcel() {
    let results = this.gridFilterData.length && this.gridFilterData;
    let data = [];
    if (results) {
      Object.values(results).forEach((item: any) => {
        let AccountNo = item && item.accountNum;
        let FullName = item && item.fullName;
        let FullNameJewish = item && item.fullNameJewish;
        let Group = item && item.group;
        let Class = item && item.class;
        let row = {};

        this.parentHeaderList.map((o) => {
          if (o.visibleCondition) {
            if (o.colName === "Account #") {
              row["Account #"] = AccountNo;
            }
            if (o.colName === "Full Name") {
              row["Full Name"] = FullName;
            }
            if (o.colName === "Full Name Jewish") {
              row["Full Name Jewish"] = FullNameJewish;
            }
            if (o.colName === "Address") {
              row["Address"] = item.address + "," + item.cityStateZip;
            }
            if (o.colName === "Group") {
              row["Group"] = Group;
            }
            if (o.colName === "Class") {
              row["Class"] = Class;
            }
            if (o.colName === "Phone") {
              row["Phone"] = item.phoneLabels + " - " + item.phonenumbers;
            }
            if (o.colName === "Email") {
              row["Email"] =
                item.emailLabels != null
                  ? item.emailLabels + " - " + item.emails
                  : "";
            }
          }
        });

        if (this.isPaymentsColVisible) {
          row["Payments"] = this.commonMethodService.formatAmount(
            item.payments
          );
        }
        if (this.isOpenPledgeColVisible) {
          row["Open Pledges"] = this.commonMethodService.formatAmount(
            item.openPledges
          );
        }
        if (this.isScheduledColVisible) {
          row["Scheduled"] = this.commonMethodService.formatAmount(
            item.scheduled
          );
        }
        if (this.isTotalColVisible) {
          row["Total"] = this.commonMethodService.formatAmount(item.raised);
        }

        data.push(row);
      });
    } else {
      return;
    }

    this.xlsxService.generate("Collector Total Panel", data);
  }

  public downloadDeviceExcel() {
    let results = this.gridFilterData.length && this.gridFilterData;
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
        let row = {};

        this.parentHeaderList.map((o) => {
          if (o.visibleCondition) {
            if (o.colName === "Event") {
              row["Event"] = EventName;
            }
            if (o.colName === "Product") {
              row["Product"] = ProductName;
            }
            if (o.colName === "Device") {
              row["Device"] = DeviceName;
            }
            if (o.colName === "Activation Code") {
              row["Activation Code"] = ActivationCode;
            }
            if (o.colName === "Mac Address") {
              row["Mac Address"] = MacAddress;
            }
            if (o.colName === "Plan") {
              row["Plan"] = Plan;
            }
            if (o.colName === "Status") {
              row["Status"] = Status;
            }
            if (o.colName === "Notes") {
              row["Notes"] = Notes;
            }
            if (o.colName === "Device #") {
              row["Device #"] = DeviceNum;
            }
            if (o.colName === "Sim #") {
              row["Sim #"] = SimNum;
            }
            if (o.colName === "Collector") {
              row["Collector"] = Collector;
            }
            if (o.colName === "Campaign") {
              row["Campaign"] = CampaignName;
            }
            if (o.colName === "Reason") {
              row["Reason"] = Reason;
            }

            if (o.colName === "Location") {
              row["Location"] = Location;
            }
          }
        });

        if (this.isPaymentsColVisible) {
          row["Payments"] = this.commonMethodService.formatAmount(
            item.payments
          );
        }
        if (this.isOpenPledgeColVisible) {
          row["Open Pledges"] = this.commonMethodService.formatAmount(
            item.openPledges
          );
        }
        if (this.isScheduledColVisible) {
          row["Scheduled"] = this.commonMethodService.formatAmount(
            item.scheduled
          );
        }
        if (this.isTotalColVisible) {
          row["Total"] = this.commonMethodService.formatAmount(item.raised);
        }

        data.push(row);
      });
    } else {
      return;
    }

    this.xlsxService.generate("Device Total Panel", data);
  }

  public downloadResonExcel() {
    let results = this.gridFilterData.length && this.gridFilterData;
    let data = [];
    if (results) {
      Object.values(results).forEach((item: any) => {
        let row = {};
        let reasonId = item && item.reasonId;
        let sortNumber = item && item.sortNumber;
        let reasonName = item && item.reasonName;
        let reasonNameJewish = item && item.reasonNameJewish;
        let goal = item && item.goal;
        let raised = item && item.raised;
        let percentage = item && item.percentage;
        let email = item && item.email;
        let phone2 = item && item.phone2;
        let phone1 = item && item.phone1;

        this.parentHeaderList.map((o) => {
          if (o.visibleCondition) {
            if (o.colName === "Reason #") {
              row["Reason #"] = reasonId;
            }
            if (o.colName === "Sort Number") {
              row["Sort Number"] = sortNumber;
            }
            if (o.colName === "Raised") {
              row["Raised"] = this.commonMethodService.formatAmount(
                item.raised
              );
            }
            if (o.colName === "Reason Name") {
              row["Reason Name"] = reasonName;
            }
            if (o.colName === "Reason Name") {
              row["Reason Name Jewish"] = reasonNameJewish;
            }
            if (o.colName === "Goal") {
              row["Goal"] = goal;
            }
            if (o.colName === "Percentage") {
              row["Percentage"] = percentage;
            }
            if (o.colName === "Email") {
              row["Email"] = email;
            }
            if (o.colName === "Phone 1") {
              row["Phone 1"] = phone1;
            }
            if (o.colName === "Phone 2") {
              row["Phone 2"] = phone2;
            }
          }
        });

        if (this.isPaymentsColVisible) {
          row["Payments"] = this.commonMethodService.formatAmount(
            item.payments
          );
        }
        if (this.isOpenPledgeColVisible) {
          row["Open Pledges"] = this.commonMethodService.formatAmount(
            item.openPledges
          );
        }
        if (this.isScheduledColVisible) {
          row["Scheduled"] = this.commonMethodService.formatAmount(
            item.scheduled
          );
        }
        if (this.isTotalColVisible) {
          row["Total"] = this.commonMethodService.formatAmount(item.raised);
        }

        data.push(row);
      });
    } else {
      return;
    }

    this.xlsxService.generate("Reason Total Panel", data);
  }

  public downloadLocationExcel() {
    let results = this.gridFilterData.length && this.gridFilterData;
    let data = [];
    if (results) {
      Object.values(results).forEach((item: any) => {
        let row = {};
        let location = item && item.locationName;
        let locationJewish = item && item.locationNameJewish;
        let nusach = item && item.nusach;
        let phone = item && item.phone;
        let locationType = item && item.locationType;
        let address = item && item.address;
        let rabbi = item && item.rabbi;
        let locationNameShort = item && item.locationNameShort;

        this.parentHeaderList.map((o) => {
          if (o.visibleCondition) {
            if (o.colName === "Location") {
              row["Location"] = location;
            }
            if (o.colName === "Location") {
              row["Location Jewish"] = locationJewish;
            }
            if (o.colName === "Nusach") {
              row["Nusach"] = nusach;
            }
            if (o.colName === "Address") {
              row["Address"] =
                item.address +
                "," +
                item.city +
                "," +
                item.state +
                "," +
                item.country +
                "," +
                item.zip;
            }
            if (o.colName === "Rabbi") {
              row["Rabbi"] = rabbi;
            }
            if (o.colName === "Phone") {
              row["Phone"] = phone;
            }
            if (o.colName === "Short Name") {
              row["Short Name"] = locationNameShort;
            }
            if (o.colName === "Type") {
              row["Type"] = locationType;
            }
          }
        });

        if (this.isPaymentsColVisible) {
          row["Payments"] = this.commonMethodService.formatAmount(
            item.payments
          );
        }
        if (this.isOpenPledgeColVisible) {
          row["Open Pledges"] = this.commonMethodService.formatAmount(
            item.openPledges
          );
        }
        if (this.isScheduledColVisible) {
          row["Scheduled"] = this.commonMethodService.formatAmount(
            item.scheduled
          );
        }
        if (this.isTotalColVisible) {
          row["Total"] = this.commonMethodService.formatAmount(item.raised);
        }

        data.push(row);
      });
    } else {
      return;
    }

    this.xlsxService.generate("Location Total Panel", data);
  }
}
