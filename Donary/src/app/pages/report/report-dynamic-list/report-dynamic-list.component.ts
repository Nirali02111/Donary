import { DragDrop } from "@angular/cdk/drag-drop";

import {
  Component,
  ElementRef,
  HostBinding,
  Input,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";

import { NgbModalOptions } from "@ng-bootstrap/ng-bootstrap";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { NotificationService } from "src/app/commons/notification.service";
import { CampaignTransactionService } from "src/app/services/campaign-transaction.service";
import { CardService } from "src/app/services/card.service";
import { PaymentTransactionService } from "src/app/services/payment-transaction.service";
import { PledgeTransactionService } from "src/app/services/pledge-transaction.service";
import { ScheduleService } from "src/app/services/schedule.service";
import { TotalPanelService } from "src/app/services/totalpanel.service";
import Swal from "sweetalert2";
import { DonorCardPopupComponent } from "../../cards/donor-card-popup/donor-card-popup.component";
import { PaymentCardPopupComponent } from "../../cards/payment-card-popup/payment-card-popup.component";
import { PaymentlistCardPopupComponent } from "../../cards/paymentlist-card-popup/paymentlist-card-popup.component";
import { PledgelistCardPopupComponent } from "./../../cards/pledgelist-card-popup/pledgelist-card-popup.component";
import { ReportFilterPopupComponent } from "./../report-filter-popup/report-filter-popup.component";
import { ReportListComponent } from "./../report-list/report-list.component";
import { ReportQueryService } from "src/app/services/reportquery.service";
import * as _ from "lodash";
import * as moment from "moment";
import { DonaryDateFormatPipe } from "src/app/commons/donary-date-format.pipe";

@Component({
  selector: "[app-report-dynamic-list]",
  templateUrl: "./report-dynamic-list.component.html",
  styleUrls: ["./report-dynamic-list.component.scss"],
  standalone: false,
  host: { "[id]": "id" },
  encapsulation: ViewEncapsulation.None,
})
export class ReportDynamicListComponent implements OnInit {
  @ViewChild("dvDragElement", { static: true }) div: HTMLElement;
  @HostBinding("class.dynamiccol") commonField: boolean = false;
  @HostBinding("class.deletedcol") deletedField: boolean = false;
  @HostBinding("class.amtfield") amtField: boolean = false;
  @HostBinding("class.paidfield") paidField: boolean = false;
  @HostBinding("class.balancefield") balancefield: boolean = false;
  @HostBinding("class.pledgetbl") pledgetbl: boolean = false;

  @HostBinding("class.totaltbl") totaltbl: boolean = false;
  @HostBinding("class.payamtfield") payamtField: boolean = false;
  @HostBinding("class.pledgefield") pledgeField: boolean = false;
  @HostBinding("class.schedulefield") scheduleField: boolean = false;
  @HostBinding("class.totalamtfield") totalamtField: boolean = false;

  id: string;
  isloading: boolean;
  modalOptions: NgbModalOptions;
  gridData: Array<any>;
  transactionType: number;
  amountTypeStr: string;
  paymentStatusStr: string;
  scheduleStatusStr: string;
  gridFilterData: Array<any>;
  gridSearchFilterData: Array<any>;
  gridFilterDataAll: Array<any> = [];
  columnName: string;
  amountType: any = [];
  defaultColumnName: string;
  defaultCount: number = 1;
  paymentCount: number;
  pledgeCount: number;
  tableId: number;
  isGridVisible: boolean = false;
  objReportFilter: any;
  reportQueryId: number;
  donorlist: any;
  transactionTypeStr: string;
  isTransactionTypeStr: boolean = false;
  sortType: string = "asc";
  oneline: boolean = true;

  compareMainArray: any = [];

  compareValue: any;

  paymentTypeStr: string;
  isPaymentTypeStr: boolean = false;
  amountRange: string;
  isAmountRange: boolean = false;
  dateRangeStr: string;
  isDateRangeStr: boolean = false;
  reasonStr: string;
  isReasonStr: boolean = false;
  collectorStr: string;
  isCollectorStr: boolean = false;
  locationStr: string;
  isLocationStr: boolean = false;
  campaignStr: string;
  isCampaignStr: boolean = false;
  pageNumber: any;
  mainArray: any = [];

  transactionresult: any = [];
  transactionresult1: any = [];
  isEdit: boolean = false;
  isPaidAmountType: boolean = false;
  isBalanceAmountType: boolean = false;
  isTotalAmountType: boolean = false;
  ColumnNameList: any = [];
  isCompare: boolean = false;
  totalAmount: number = 0;
  compareColumn1: string;
  compareColumn2: string;
  selectedBaseCol: string;
  scheduleTypeId: number = 0;
  recordCount: number = 25;
  transactionTypeName: string = "";

  //TotalPanel
  isTotalPaymentType: boolean = false;
  isOpenPledgesType: boolean = false;
  isPendingScheduleType: boolean = false;
  isTotalAmtType: boolean = true;
  gridTotalPanelData: any = [];
  Treeline: boolean = false;
  setClmCls: string = "";
  constructor(
    private reportListMethod: ReportListComponent,
    public commonMethodService: CommonMethodService,
    private cardService: CardService,
    private campaignTransactionService: CampaignTransactionService,
    private localstoragedataService: LocalstoragedataService,
    private paymentTransactionService: PaymentTransactionService,
    private scheduleTransactionService: ScheduleService,
    private pledgeTransactionService: PledgeTransactionService,
    private notificationService: NotificationService,
    private totalPanelService: TotalPanelService,
    private datePipe: DonaryDateFormatPipe,
    private elementRef: ElementRef,
    private dragDrop: DragDrop,
    public reportQueryService: ReportQueryService
  ) {
    this.dragEnable(dragDrop);
  }

  @Input() set DonorList(data: any) {
    if (data) {
      this.donorlist = data;
    }
  }
  @Input() set TableId(data: any) {
    if (data) {
      this.tableId = data;
      this.id = "table" + this.tableId;
    }
  }
  @Input() set ReportData(data: any) {
    if (data.list) {
      this.objReportFilter = data.list;
      this.transactionType = this.objReportFilter.transactionType;
      if (this.objReportFilter.compareColumn1 != "-1") {
        this.compareColumn1 = "Column" + this.objReportFilter.compareColumn1;
        this.compareColumn2 = "Column" + this.objReportFilter.compareColumn2;
        this.compareMainArray = data.mainArray;
      }
      this.sortType = data.sortType;
      this.selectedBaseCol = data.selectedBaseCol;
      this.commonMethodService
        .getPageNumberObservable()
        .subscribe((pageNumber) => {
          this.pageNumber = pageNumber;
          this.recordCount = pageNumber.pageSize;
          if (pageNumber && this.gridFilterDataAll) {
            this.gridFilterData = this.gridFilterDataAll.slice(
              pageNumber.startIndex,
              pageNumber.endIndex + 1
            );
          } else {
            // clear messages when empty message received
          }
        });

      this.AddSearchDynamicComponent();
    }
  }
  @Input() set deletegridFilterData(data: any) {
    this.gridFilterData = data;
  }

  ngOnInit() {
    this.commonField = true;
    this.commonMethodService.getLineHeight().subscribe((res) => {
      if (res != null) {
        this.oneline = res;
      }
    });
    this.commonMethodService.getTreeLineHeight().subscribe((res) => {
      if (res != null) {
        this.Treeline = res;
      }
    });
    this.commonMethodService.getColumCls().subscribe((res) => {
      if (res != null) {
        this.setClmCls = res;
      }
    });
    this.commonMethodService.getAccountIdArray().subscribe((items) => {
      if (items.length > 0) {
        let sortedarray = this.mapOrder(
          this.gridFilterDataAll,
          items,
          "accountId"
        );
        this.gridFilterData = sortedarray.slice(
          this.pageNumber.startIndex,
          this.pageNumber.endIndex + 1
        );
      }
    });

    this.commonMethodService.getSearchAccountIdArray().subscribe((res) => {
      if (res.length > 0 && this.gridSearchFilterData) {
        this.gridFilterDataAll = this.gridSearchFilterData;
        var filterArray;
        var resultArray: any = [];
        for (const item of res) {
          filterArray = this.gridFilterDataAll.find(
            (e) => e.accountId === item
          );
          resultArray.push(filterArray);
        }
        this.gridFilterDataAll = resultArray;
        this.gridFilterData = resultArray.slice(
          this.pageNumber.startIndex,
          this.pageNumber.endIndex + 1
        );
      }
    });
  }

  AddReportData(ids) {
    let resultArray = [];
    if (this.transactionType == 1) {
      if (this.selectedBaseCol == "Donor") {
        for (const item of ids) {
          var donorDetails = this.transactionresult.paymentTransGridModel.find(
            (x) => x.accountId == item
          );
          resultArray.push({
            transactionList:
              this.transactionresult.paymentTransGridModel.filter(
                (x) => x.accountId == item
              ),
            accountId: item,
            amount: this.transactionresult.paymentTransGridModel
              .filter((x) => x.accountId == item)
              .reduce((sum: number, b) => sum + b.amount, 0),
          });
        }
      }
    } else if (this.transactionType == 2) {
      if (this.selectedBaseCol == "Donor") {
        for (const item of ids) {
          var donorDetails = this.transactionresult.pledgeTransGridModel.find(
            (x) => x.accountID == item
          );
          resultArray.push({
            transactionList: this.transactionresult.pledgeTransGridModel.filter(
              (x) => x.accountID == item
            ),
            accountId: item,
            amount: this.transactionresult.pledgeTransGridModel
              .filter((x) => x.accountID == item)
              .reduce((sum: number, b) => sum + b.pledgeAmount, 0),
          });
        }
      }
    } else if (this.transactionType == 3) {
      if (this.selectedBaseCol == "Donor") {
        for (const item of ids) {
          var donorDetails = this.transactionresult.find(
            (x) => x.accountId == item
          );
          resultArray.push({
            transactionList: this.transactionresult.filter(
              (x) => x.accountId == item
            ),
            accountId: item,
            amount: this.transactionresult
              .filter((x) => x.accountId == item)
              .reduce((sum: number, b) => sum + b.paidAmount, 0),
          });
        }
      }
    }
    this.gridFilterData = resultArray;
    this.gridFilterDataAll = resultArray;
    for (var i = 0; i < resultArray.length; i++) {
      this.mainArray.push({
        amount: resultArray[i].amount,
      });
    }
    var objData: any = {};
    objData.columnName = "Column" + this.tableId;
    objData.columnArray = this.mainArray;
    this.commonMethodService.sendColumnArray(objData);
  }

  dragEnable(dragDrop) {
    return this.dragDrop.createDrag(this.elementRef);
  }
  mapOrder(array, order, key) {
    array.sort(function (a, b) {
      var A = a[key],
        B = b[key];

      if (order.indexOf(A) > order.indexOf(B)) {
        return 1;
      } else {
        return -1;
      }
    });

    return array;
  }
  DefaultCount(value) {
    return value + 1;
  }

  CheckInteger(amt) {
    var test = Math.sign(amt);
    return test;
  }

  Sort(type) {
    this.sortType = type;
    var dataObj: any = {};
    dataObj.sortType = this.sortType;
    dataObj.ColumnName = "Column" + this.tableId;
    this.commonMethodService.sendColumnId(dataObj);
  }

  EditSettingParameter(isButtonGenerate) {
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup data_set data-set-modal",
    };
    const modalRef = this.commonMethodService.openPopup(
      ReportFilterPopupComponent,
      this.modalOptions
    );
    var obj: any = {};
    obj.isButtonGenerate = isButtonGenerate;
    obj.editParameterData = this.objReportFilter;
    modalRef.componentInstance.SettingFilterData = obj;
    modalRef.componentInstance.baseColumn =
      this.objReportFilter.selectedBaseCol;
    modalRef.componentInstance.emtOutputSearchFilterData.subscribe(
      (objResponse) => {
        this.objReportFilter = objResponse;
        this.isEdit = true;
        this.commonMethodService.setIsDataSetLoading(true);
        this.commonMethodService.setDataSetArray(this.objReportFilter);

        this.AddSearchDynamicComponent();
      }
    );
  }

  AddSearchDynamicComponent() {
    this.isloading = false;
    var donarIds = [];
    var donorlength = this.donorlist.length;
    if (donorlength <= 20) {
      for (const iterator of this.donorlist) {
        if (donarIds.findIndex((x) => x == iterator.accountId) == -1) {
          donarIds.push(iterator.accountId);
        }
      }
    }

    var objAdvancedSearchData: any = {};
    if (this.objReportFilter) {
      if (this.objReportFilter.transactionType == 4) {
        this.scheduleTypeId = 1;
        this.objReportFilter.paymentStatus.length = 0;
      }
      if (this.objReportFilter.transactionType == 5) {
        this.scheduleTypeId = 2;
        this.objReportFilter.paymentStatus.length = 0;
      }
      // Get only Id values for multi select dropdown
      objAdvancedSearchData = {
        paymentTypes:
          this.objReportFilter.paymentTypes &&
          this.objReportFilter.paymentTypes.length > 0
            ? this.objReportFilter.paymentTypes.map((s) => s.id)
            : null,
        minAmount: this.objReportFilter.minAmount,
        maxAmount: this.objReportFilter.maxAmount,
        donors: donarIds,

        minBalanceAmount: this.objReportFilter.minBalanceAmount,
        maxBalanceAmount: this.objReportFilter.maxBalanceAmount,

        paymentReason:
          this.objReportFilter.paymentReason &&
          this.objReportFilter.paymentReason.length > 0
            ? this.objReportFilter.paymentReason.map((s) => s.id)
            : null,
        collectors:
          this.objReportFilter.collectors &&
          this.objReportFilter.collectors.length > 0
            ? this.objReportFilter.collectors.map((s) => s.id)
            : null,
        locations:
          this.objReportFilter.locations &&
          this.objReportFilter.locations.length > 0
            ? this.objReportFilter.locations.map((s) => s.id)
            : null,
        campaignIds:
          this.objReportFilter.campaigns &&
          this.objReportFilter.campaigns.length > 0
            ? this.objReportFilter.campaigns.map((s) => s.id)
            : null,
        paymentStatusIds:
          this.objReportFilter.paymentStatus &&
          this.objReportFilter.paymentStatus.length > 0
            ? this.objReportFilter.paymentStatus.map((s) => s.id)
            : null,
        scheduleStatusIds:
          this.objReportFilter.scheduleStatus &&
          this.objReportFilter.scheduleStatus.length > 0
            ? this.objReportFilter.scheduleStatus.map((s) => s.id)
            : null,
      };
    }
    var objsearchPaymentTrans = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      objAdvancedSearchFilter: objAdvancedSearchData,
      fromDate:
        this.objReportFilter.startDate &&
        this.objReportFilter.startDate != undefined
          ? moment(this.objReportFilter.startDate).format("YYYY-MM-DD")
          : "",
      toDate:
        this.objReportFilter.endDate &&
        this.objReportFilter.endDate != undefined
          ? moment(this.objReportFilter.endDate).format("YYYY-MM-DD")
          : "",
      scheduleTypeId: this.scheduleTypeId,
    };

    var objsearchPaymentTotal = {
      minAmount: this.objReportFilter.minAmount,
      maxAmount: this.objReportFilter.maxAmount,
      reasonIds:
        this.objReportFilter.paymentReason &&
        this.objReportFilter.paymentReason.length > 0
          ? this.objReportFilter.paymentReason.map((s) => s.id)
          : null,
      collectorIds:
        this.objReportFilter.collectors &&
        this.objReportFilter.collectors.length > 0
          ? this.objReportFilter.collectors.map((s) => s.id)
          : null,
      locationIds:
        this.objReportFilter.locations &&
        this.objReportFilter.locations.length > 0
          ? this.objReportFilter.locations.map((s) => s.id)
          : null,
      campaignIds:
        this.objReportFilter.campaigns &&
        this.objReportFilter.campaigns.length > 0
          ? this.objReportFilter.campaigns.map((s) => s.id)
          : null,
      paymentTypeIds:
        this.objReportFilter.paymentTypes &&
        this.objReportFilter.paymentTypes.length > 0
          ? this.objReportFilter.paymentTypes.map((s) => s.id)
          : null,
      fromDate:
        this.objReportFilter.startDate &&
        this.objReportFilter.startDate != undefined
          ? moment(this.objReportFilter.startDate).format("YYYY-MM-DD")
          : "",
      toDate:
        this.objReportFilter.endDate &&
        this.objReportFilter.endDate != undefined
          ? moment(this.objReportFilter.endDate).format("YYYY-MM-DD")
          : "",
    };

    if (this.objReportFilter.transactionType == 4) {
      this.transactionTypeName = "payment";
    } else if (this.objReportFilter.transactionType == 5) {
      this.transactionTypeName = "pledge";
    }
    var objScheduleTotal = {
      scheduleType: this.transactionTypeName,
      minAmount: this.objReportFilter.minAmount,
      maxAmount: this.objReportFilter.maxAmount,
      reasonIds:
        this.objReportFilter.paymentReason &&
        this.objReportFilter.paymentReason.length > 0
          ? this.objReportFilter.paymentReason.map((s) => s.id)
          : null,
      collectorIds:
        this.objReportFilter.collectors &&
        this.objReportFilter.collectors.length > 0
          ? this.objReportFilter.collectors.map((s) => s.id)
          : null,
      locationIds:
        this.objReportFilter.locations &&
        this.objReportFilter.locations.length > 0
          ? this.objReportFilter.locations.map((s) => s.id)
          : null,
      campaignIds:
        this.objReportFilter.campaigns &&
        this.objReportFilter.campaigns.length > 0
          ? this.objReportFilter.campaigns.map((s) => s.id)
          : null,
      paymentTypeIds:
        this.objReportFilter.paymentTypes &&
        this.objReportFilter.paymentTypes.length > 0
          ? this.objReportFilter.paymentTypes.map((s) => s.id)
          : null,
      scheduleStatusIds: this.commonMethodService.selectedScheduleStatus.map(
        (s) => s.id
      ),
      fromCreatedDate:
        this.objReportFilter.startDate &&
        this.objReportFilter.startDate != undefined
          ? moment(this.objReportFilter.startDate).format("YYYY-MM-DD")
          : "",
      toCreatedDate:
        this.objReportFilter.endDate &&
        this.objReportFilter.endDate != undefined
          ? moment(this.objReportFilter.endDate).format("YYYY-MM-DD")
          : "",
    };

    this.mainArray = [];
    if (this.isEdit && this.objReportFilter.columnName != undefined) {
      if (this.objReportFilter.columnName != "") {
        this.columnName = this.objReportFilter.columnName;
      } else {
        this.objReportFilter.columnName = this.columnName;
      }

      var ispaymentcol = this.ColumnNameList.indexOf(
        (x) => x.id == this.tableId
      );
      if (ispaymentcol == -1) {
        this.ColumnNameList = this.ColumnNameList.filter(
          (x) => x.id != this.tableId
        );
        this.ColumnNameList.push({
          id: this.tableId,
          name: this.columnName,
        });
      } else {
        this.ColumnNameList.push({
          id: this.tableId,
          name: this.columnName,
        });
      }
      this.commonMethodService.sendColumnNameArray(this.ColumnNameList);
    }

    if (this.objReportFilter.transactionType == 1) {
      this.paymentTransactionService
        .getPaymentTotal(objsearchPaymentTotal)
        .subscribe(
          (res: any) => {
            if (res) {
              this.transactionresult = res;
              var donarIds = [];

              for (const iterator of this.donorlist) {
                if (donarIds.findIndex((x) => x == iterator.accountId) == -1) {
                  donarIds.push(iterator.accountId);
                }
              }

              let resultArray = [];
              if (this.objReportFilter.selectedBaseCol == "Donor") {
                for (const item of donarIds) {
                  var donorDetails = res.find((x) => x.accountId == item);

                  resultArray.push({
                    transactionList: res.filter((x) => x.accountId == item),
                    accountId: item,
                    amount: res
                      .filter((x) => x.accountId == item)
                      .reduce((sum: number, b) => sum + b.total, 0),
                  });
                }
              }

              if (this.objReportFilter.columnName == undefined) {
                this.defaultColumnName = "Payment #";
                var paymentCount = localStorage.getItem("PaymentCount");
                var count = this.DefaultCount(Number(paymentCount));
                localStorage.setItem("PaymentCount", count.toString());
                this.columnName = this.defaultColumnName + count;
              } else {
                this.columnName = this.objReportFilter.columnName;
              }
              var ispaymentcol = this.ColumnNameList.indexOf(
                (x) => x.id == this.tableId
              );
              if (ispaymentcol == -1) {
                this.ColumnNameList = this.ColumnNameList.filter(
                  (x) => x.id != this.tableId
                );
                this.ColumnNameList.push({
                  id: this.tableId,
                  name: this.columnName,
                });
              } else {
                this.ColumnNameList.push({
                  id: this.tableId,
                  name: this.columnName,
                });
              }
              this.commonMethodService.sendColumnNameArray(this.ColumnNameList);
              // resultArray=resultArray.filter(x=>x.amount!=undefined && x.amount>0);
              this.gridFilterData = resultArray;
              this.gridFilterDataAll = resultArray;
              this.gridSearchFilterData = resultArray;
              this.totalAmount = 0;
              for (var i = 0; i < resultArray.length; i++) {
                if (resultArray[i].amount != 0) {
                  this.mainArray.push({
                    amount: resultArray[i].amount,
                    accountId: resultArray[i].accountId,
                  });
                }
                this.totalAmount += resultArray[i].amount;
              }

              var objData: any = {};
              objData.columnName = "Column" + this.tableId;
              objData.columnArray = this.mainArray;
              this.commonMethodService.sendColumnArray(objData);
              this.transactionType = this.objReportFilter.transactionType;
              this.gridFilterData = this.gridFilterDataAll.slice(
                this.pageNumber.startIndex,
                this.pageNumber.endIndex + 1
              );
            } else {
              var donarIds = [];
              for (const iterator of this.donorlist) {
                if (donarIds.findIndex((x) => x == iterator.accountId) == -1) {
                  donarIds.push(iterator.accountId);
                }
              }
              let resultArray = [];
              for (const item of donarIds) {
                resultArray.push({
                  transactionList: [],
                  accountId: item,
                  amount: 0,
                });
              }
              if (this.objReportFilter.columnName == undefined) {
                this.defaultColumnName = "Payment #";
                var paymentCount = localStorage.getItem("PaymentCount");
                var count = this.DefaultCount(Number(paymentCount));
                localStorage.setItem("PaymentCount", count.toString());
                this.columnName = this.defaultColumnName + count;
              } else {
                this.columnName = this.objReportFilter.columnName;
              }
              this.ColumnNameList.push({
                id: this.tableId,
                name: this.columnName,
              });

              this.gridFilterData = resultArray;
              this.gridFilterDataAll = resultArray;
              this.gridSearchFilterData = resultArray;
              this.totalAmount = 0;
              for (var i = 0; i < resultArray.length; i++) {
                if (resultArray[i].amount != 0) {
                  this.mainArray.push({
                    amount: resultArray[i].amount,
                    accountId: resultArray[i].accountId,
                  });
                }
              }
              var objData: any = {};
              objData.columnName = "Column" + this.tableId;
              objData.columnArray = this.mainArray;
              this.commonMethodService.sendColumnArray(objData);
              this.transactionType = this.objReportFilter.transactionType;
              this.gridFilterData = this.gridFilterDataAll.slice(
                this.pageNumber.startIndex,
                this.pageNumber.endIndex + 1
              );
            }
            this.commonMethodService.setIsDataSetLoading(false);
          },
          (error) => {
            this.isloading = false;
            this.commonMethodService.setIsDataSetLoading(false);
            console.log(error);
            this.notificationService.showError(
              error.error,
              "Error while fetching data !!"
            );
          }
        );
    } else if (this.objReportFilter.transactionType == 2) {
      this.pledgeTransactionService
        .getPledgeTransactions(objsearchPaymentTrans)
        .subscribe(
          (res: any) => {
            (this.amountType =
              this.objReportFilter.amountType.length > 0
                ? this.objReportFilter.amountType.map((s) => s.id)
                : null),
              // hide loader
              (this.isloading = false);
            if (res) {
              this.pledgetbl = true;
              this.isBalanceAmountType = false;
              this.isPaidAmountType = false;
              this.isTotalAmountType = false;
              this.isTotalPaymentType = false;
              this.isOpenPledgesType = false;
              this.isPendingScheduleType = false;
              this.isTotalAmtType = true;

              this.amtField = false;
              this.paidField = false;
              this.balancefield = false;

              this.payamtField = false;
              this.pledgeField = false;
              this.scheduleField = false;
              this.totalamtField = false;

              // min & max balance filter
              if (
                objAdvancedSearchData &&
                (objAdvancedSearchData.minBalanceAmount ||
                  objAdvancedSearchData.maxBalanceAmount)
              ) {
                if (
                  objAdvancedSearchData.minBalanceAmount &&
                  objAdvancedSearchData.maxBalanceAmount
                ) {
                  res.pledgeTransGridModel = res.pledgeTransGridModel.filter(
                    (x) =>
                      x.balance >= objAdvancedSearchData.minBalanceAmount &&
                      x.balance <= objAdvancedSearchData.maxBalanceAmount
                  );
                } else if (
                  !objAdvancedSearchData.minBalanceAmount &&
                  objAdvancedSearchData.maxBalanceAmount
                ) {
                  res.pledgeTransGridModel = res.pledgeTransGridModel.filter(
                    (x) => x.balance <= objAdvancedSearchData.maxBalanceAmount
                  );
                } else if (
                  objAdvancedSearchData.minBalanceAmount &&
                  !objAdvancedSearchData.maxBalanceAmount
                ) {
                  res.pledgeTransGridModel = res.pledgeTransGridModel.filter(
                    (x) => x.balance >= objAdvancedSearchData.minBalanceAmount
                  );
                }
              }
              this.transactionresult = res;
              var donarIds = [];
              for (const iterator of this.donorlist) {
                if (donarIds.findIndex((x) => x == iterator.accountId) == -1) {
                  donarIds.push(iterator.accountId);
                }
              }
              let resultArray = [];
              if (this.objReportFilter.selectedBaseCol == "Donor") {
                for (const item of donarIds) {
                  if (this.amountType && this.amountType.includes(2)) {
                    this.isBalanceAmountType = true;
                    this.balancefield = true;
                    var balance = res.pledgeTransGridModel
                      .filter((x) => x.accountID == item)
                      .reduce((sum: number, b) => sum + b.balance, 0);
                    if (!this.amountType.includes(-1)) {
                      var amount = balance;
                    }
                  }
                  if (this.amountType && this.amountType.includes(1)) {
                    this.isPaidAmountType = true;
                    this.paidField = true;
                    var paid = res.pledgeTransGridModel
                      .filter((x) => x.accountID == item)
                      .reduce((sum: number, b) => sum + b.pledgePaidAmount, 0);
                    if (
                      !this.amountType.includes(-1) &&
                      !this.amountType.includes(2)
                    ) {
                      var amount = paid;
                    }
                  }
                  if (this.amountType == null || this.amountType.includes(-1)) {
                    this.isTotalAmountType = true;

                    this.amtField = true;
                    var totalbalance = res.pledgeTransGridModel
                      .filter((x) => x.accountID == item)
                      .reduce((sum: number, b) => sum + b.balance, 0);
                    var totalpaid = res.pledgeTransGridModel
                      .filter((x) => x.accountID == item)
                      .reduce((sum: number, b) => sum + b.pledgePaidAmount, 0);
                    var amount = totalbalance + totalpaid;
                  }

                  var donorDetails = res.pledgeTransGridModel.find(
                    (x) => x.accountID == item
                  );
                  resultArray.push({
                    transactionList: res.pledgeTransGridModel.filter(
                      (x) => x.accountID == item
                    ),
                    accountId: item,
                    amount: amount,
                    paid: paid,
                    balance: balance,
                  });
                }
              }
              if (this.objReportFilter.selectedBaseCol == "Reason") {
                for (const item of donarIds) {
                  if (this.amountType && this.amountType.includes(2)) {
                    this.isBalanceAmountType = true;
                    this.balancefield = true;
                    var balance = res.pledgeTransGridModel
                      .filter((x) => x.reasonID == item)
                      .reduce((sum: number, b) => sum + b.balance, 0);
                    if (!this.amountType.includes(-1)) {
                      var amount = balance;
                    }
                  }
                  if (this.amountType && this.amountType.includes(1)) {
                    this.isPaidAmountType = true;
                    this.paidField = true;
                    var paid = res.pledgeTransGridModel
                      .filter((x) => x.reasonID == item)
                      .reduce((sum: number, b) => sum + b.pledgePaidAmount, 0);
                    if (
                      !this.amountType.includes(-1) &&
                      !this.amountType.includes(2)
                    ) {
                      var amount = paid;
                    }
                  }
                  if (this.amountType == null || this.amountType.includes(-1)) {
                    this.isTotalAmountType = true;
                    this.amtField = true;
                    var totalbalance = res.pledgeTransGridModel
                      .filter((x) => x.reasonID == item)
                      .reduce((sum: number, b) => sum + b.balance, 0);
                    var totalpaid = res.pledgeTransGridModel
                      .filter((x) => x.reasonID == item)
                      .reduce((sum: number, b) => sum + b.pledgePaidAmount, 0);
                    var amount = totalbalance + totalpaid;
                  }
                  var donorDetails = res.pledgeTransGridModel.find(
                    (x) => x.reasonID == item
                  );
                  resultArray.push({
                    transactionList: res.pledgeTransGridModel.filter(
                      (x) => x.reasonID == item
                    ),
                    accountId: item,
                    amount: amount,
                    paid: paid,
                    balance: balance,
                  });
                }
              }
              if (this.objReportFilter.selectedBaseCol == "Campaign") {
                for (const item of donarIds) {
                  if (this.amountType && this.amountType.includes(2)) {
                    this.isBalanceAmountType = true;
                    this.balancefield = true;
                    var balance = res.pledgeTransGridModel
                      .filter((x) => x.campaignID == item)
                      .reduce((sum: number, b) => sum + b.balance, 0);
                    if (!this.amountType.includes(-1)) {
                      var amount = balance;
                    }
                  }
                  if (this.amountType && this.amountType.includes(1)) {
                    this.isPaidAmountType = true;
                    this.paidField = true;
                    var paid = res.pledgeTransGridModel
                      .filter((x) => x.campaignID == item)
                      .reduce((sum: number, b) => sum + b.pledgePaidAmount, 0);
                    if (
                      !this.amountType.includes(-1) &&
                      !this.amountType.includes(2)
                    ) {
                      var amount = paid;
                    }
                  }
                  if (this.amountType == null || this.amountType.includes(-1)) {
                    this.isTotalAmountType = true;
                    this.amtField = true;
                    var totalbalance = res.pledgeTransGridModel
                      .filter((x) => x.campaignID == item)
                      .reduce((sum: number, b) => sum + b.balance, 0);
                    var totalpaid = res.pledgeTransGridModel
                      .filter((x) => x.campaignID == item)
                      .reduce((sum: number, b) => sum + b.pledgePaidAmount, 0);
                    var amount = totalbalance + totalpaid;
                  }
                  var donorDetails = res.pledgeTransGridModel.find(
                    (x) => x.campaignID == item
                  );
                  resultArray.push({
                    transactionList: res.pledgeTransGridModel.filter(
                      (x) => x.campaignID == item
                    ),
                    accountId: item,
                    amount: amount,
                    paid: paid,
                    balance: balance,
                  });
                }
              }
              if (this.objReportFilter.selectedBaseCol == "Location") {
                for (const item of donarIds) {
                  if (this.amountType && this.amountType.includes(2)) {
                    this.isBalanceAmountType = true;
                    this.balancefield = true;
                    var balance = res.pledgeTransGridModel
                      .filter((x) => x.locationID == item)
                      .reduce((sum: number, b) => sum + b.balance, 0);
                    if (!this.amountType.includes(-1)) {
                      var amount = balance;
                    }
                  }
                  if (this.amountType && this.amountType.includes(1)) {
                    this.isPaidAmountType = true;
                    this.paidField = true;
                    var paid = res.pledgeTransGridModel
                      .filter((x) => x.locationID == item)
                      .reduce((sum: number, b) => sum + b.pledgePaidAmount, 0);
                    if (
                      !this.amountType.includes(-1) &&
                      !this.amountType.includes(2)
                    ) {
                      var amount = paid;
                    }
                  }
                  if (this.amountType == null || this.amountType.includes(-1)) {
                    this.isTotalAmountType = true;
                    this.amtField = true;
                    var totalbalance = res.pledgeTransGridModel
                      .filter((x) => x.locationID == item)
                      .reduce((sum: number, b) => sum + b.balance, 0);
                    var totalpaid = res.pledgeTransGridModel
                      .filter((x) => x.locationID == item)
                      .reduce((sum: number, b) => sum + b.pledgePaidAmount, 0);
                    var amount = totalbalance + totalpaid;
                  }
                  var donorDetails = res.pledgeTransGridModel.find(
                    (x) => x.locationID == item
                  );
                  resultArray.push({
                    transactionList: res.pledgeTransGridModel.filter(
                      (x) => x.locationID == item
                    ),
                    accountId: item,
                    amount: amount,
                    paid: paid,
                    balance: balance,
                  });
                }
              }
              if (this.objReportFilter.selectedBaseCol == "Collector") {
                for (const item of donarIds) {
                  if (this.amountType && this.amountType.includes(2)) {
                    this.isBalanceAmountType = true;
                    this.balancefield = true;
                    var balance = res.pledgeTransGridModel
                      .filter((x) => x.collectorID == item)
                      .reduce((sum: number, b) => sum + b.balance, 0);
                    if (!this.amountType.includes(-1)) {
                      var amount = balance;
                    }
                  }
                  if (this.amountType && this.amountType.includes(1)) {
                    this.isPaidAmountType = true;
                    this.paidField = true;
                    var paid = res.pledgeTransGridModel
                      .filter((x) => x.collectorID == item)
                      .reduce((sum: number, b) => sum + b.pledgePaidAmount, 0);
                    if (
                      !this.amountType.includes(-1) &&
                      !this.amountType.includes(2)
                    ) {
                      var amount = paid;
                    }
                  }
                  if (this.amountType == null || this.amountType.includes(-1)) {
                    this.isTotalAmountType = true;
                    this.amtField = true;
                    var totalbalance = res.pledgeTransGridModel
                      .filter((x) => x.collectorID == item)
                      .reduce((sum: number, b) => sum + b.balance, 0);
                    var totalpaid = res.pledgeTransGridModel
                      .filter((x) => x.collectorID == item)
                      .reduce((sum: number, b) => sum + b.pledgePaidAmount, 0);
                    var amount = totalbalance + totalpaid;
                  }
                  var donorDetails = res.pledgeTransGridModel.find(
                    (x) => x.collectorID == item
                  );
                  resultArray.push({
                    transactionList: res.pledgeTransGridModel.filter(
                      (x) => x.collectorID == item
                    ),
                    accountId: item,
                    amount: amount,
                    paid: paid,
                    balance: balance,
                  });
                }
              }
              if (this.objReportFilter.selectedBaseCol == "Source") {
                for (const item of donarIds) {
                  if (this.amountType && this.amountType.includes(2)) {
                    this.isBalanceAmountType = true;
                    this.balancefield = true;
                    var balance = res.pledgeTransGridModel
                      .filter((x) => x.deviceId == item)
                      .reduce((sum: number, b) => sum + b.balance, 0);
                    if (!this.amountType.includes(-1)) {
                      var amount = balance;
                    }
                  }
                  if (this.amountType && this.amountType.includes(1)) {
                    this.isPaidAmountType = true;
                    this.paidField = true;
                    var paid = res.pledgeTransGridModel
                      .filter((x) => x.deviceId == item)
                      .reduce((sum: number, b) => sum + b.pledgePaidAmount, 0);
                    if (
                      !this.amountType.includes(-1) &&
                      !this.amountType.includes(2)
                    ) {
                      var amount = paid;
                    }
                  }
                  if (this.amountType == null || this.amountType.includes(-1)) {
                    this.isTotalAmountType = true;
                    this.amtField = true;
                    var totalbalance = res.pledgeTransGridModel
                      .filter((x) => x.deviceId == item)
                      .reduce((sum: number, b) => sum + b.balance, 0);
                    var totalpaid = res.pledgeTransGridModel
                      .filter((x) => x.deviceId == item)
                      .reduce((sum: number, b) => sum + b.pledgePaidAmount, 0);
                    var amount = totalbalance + totalpaid;
                  }
                  var donorDetails = res.pledgeTransGridModel.find(
                    (x) => x.deviceId == item
                  );
                  resultArray.push({
                    transactionList: res.pledgeTransGridModel.filter(
                      (x) => x.deviceId == item
                    ),
                    accountId: item,
                    amount: amount,
                    paid: paid,
                    balance: balance,
                  });
                }
              }
              if (this.objReportFilter.columnName == undefined) {
                this.defaultColumnName = "Pledge #";
                var paymentCount = localStorage.getItem("PledgeCount");
                var count = this.DefaultCount(Number(paymentCount));
                localStorage.setItem("PledgeCount", count.toString());
                this.columnName = this.defaultColumnName + count;
              } else {
                this.columnName = this.objReportFilter.columnName;
              }
              var ispledgecol = this.ColumnNameList.indexOf(
                (x) => x.id == this.tableId
              );
              if (ispledgecol == -1) {
                this.ColumnNameList = this.ColumnNameList.filter(
                  (x) => x.id != this.tableId
                );
                this.ColumnNameList.push({
                  id: this.tableId,
                  name: this.columnName,
                  default: "Pledge",
                });
              } else {
                this.ColumnNameList.push({
                  id: this.tableId,
                  name: this.columnName,
                  default: "Pledge",
                });
              }
              this.commonMethodService.sendColumnNameArray(this.ColumnNameList);

              this.gridFilterData = resultArray;
              this.gridFilterDataAll = resultArray;
              this.gridSearchFilterData = resultArray;
              this.totalAmount = 0;
              for (var i = 0; i < resultArray.length; i++) {
                if (resultArray[i].amount != 0) {
                  this.mainArray.push({
                    balance: resultArray[i].balance,
                    paid: resultArray[i].paid,
                    amount: resultArray[i].amount,
                    accountId: resultArray[i].accountId,
                  });
                }
                this.totalAmount += resultArray[i].amount;
              }
              var objData: any = {};
              objData.columnName = "Column" + this.tableId;
              objData.columnArray = this.mainArray;
              this.commonMethodService.sendColumnArray(objData);
              this.transactionType = this.objReportFilter.transactionType;
              this.gridFilterData = this.gridFilterDataAll.slice(
                this.pageNumber.startIndex,
                this.pageNumber.endIndex + 1
              );
            } else {
              if (this.amountType && this.amountType.includes(2)) {
                this.isBalanceAmountType = true;
                this.balancefield = true;
              }
              if (this.amountType && this.amountType.includes(1)) {
                this.isPaidAmountType = true;
                this.paidField = true;
              }
              if (this.amountType == null || this.amountType.includes(-1)) {
                this.isTotalAmountType = true;
                this.amtField = true;
              }
              var donarIds = [];
              for (const iterator of this.donorlist) {
                if (donarIds.findIndex((x) => x == iterator.accountId) == -1) {
                  donarIds.push(iterator.accountId);
                }
              }
              let resultArray = [];
              for (const item of donarIds) {
                resultArray.push({
                  transactionList: [],
                  accountId: item,
                  amount: 0,
                  paid: 0,
                  balance: 0,
                });
              }
              if (this.objReportFilter.columnName == undefined) {
                this.defaultColumnName = "Pledge #";
                var paymentCount = localStorage.getItem("PledgeCount");
                var count = this.DefaultCount(Number(paymentCount));
                localStorage.setItem("PledgeCount", count.toString());
                this.columnName = this.defaultColumnName + count;
              } else {
                this.columnName = this.objReportFilter.columnName;
              }
              var ispledgecol = this.ColumnNameList.indexOf(
                (x) => x.id == this.tableId
              );
              if (ispledgecol == -1) {
                this.ColumnNameList = this.ColumnNameList.filter(
                  (x) => x.id != this.tableId
                );
                this.ColumnNameList.push({
                  id: this.tableId,
                  name: this.columnName,
                  default: "Pledge",
                });
              } else {
                this.ColumnNameList.push({
                  id: this.tableId,
                  name: this.columnName,
                  default: "Pledge",
                });
              }
              this.commonMethodService.sendColumnNameArray(this.ColumnNameList);
              this.gridFilterData = resultArray;
              this.gridFilterDataAll = resultArray;
              this.gridSearchFilterData = resultArray;
              this.totalAmount = 0;
              for (var i = 0; i < resultArray.length; i++) {
                if (resultArray[i].amount != 0) {
                  this.mainArray.push({
                    amount: resultArray[i].amount,
                    accountId: resultArray[i].accountId,
                  });
                }
                this.totalAmount += resultArray[i].amount;
              }
            }
            var objData: any = {};
            objData.columnName = "Column" + this.tableId;
            objData.columnArray = this.mainArray;
            this.commonMethodService.sendColumnArray(objData);
            this.transactionType = this.objReportFilter.transactionType;

            this.gridFilterData = this.gridFilterDataAll.slice(
              this.pageNumber.startIndex,
              this.pageNumber.endIndex + 1
            );
            this.commonMethodService.setIsDataSetLoading(false);
          },
          (error) => {
            this.isloading = false;
            this.commonMethodService.setIsDataSetLoading(false);
            console.log(error);
            this.notificationService.showError(
              error.error,
              "Error while fetching data !!"
            );
          }
        );
    } else if (this.objReportFilter.transactionType == 0) {
      setTimeout(() => {
        this.isCompare = true;
        this.isloading = false;
        if (this.objReportFilter.columnName == undefined) {
          this.defaultColumnName = "Compare #";
          var compareCount = localStorage.getItem("CompareCount");
          var count = this.DefaultCount(Number(compareCount));
          localStorage.setItem("CompareCount", count.toString());
          this.columnName = this.defaultColumnName + count;
        } else {
          this.columnName = this.objReportFilter.columnName;
        }
        var donarIds = [];
        for (const iterator of this.donorlist) {
          if (donarIds.findIndex((x) => x == iterator.accountId) == -1) {
            donarIds.push(iterator.accountId);
          }
        }
        let resultArray = [];
        for (const item of donarIds) {
          resultArray.push({
            accountId: item,
            amount:
              this.compareMainArray
                .filter((x) => x.accountId == item)
                .reduce((x) => x.accountId)[this.compareColumn1] -
              this.compareMainArray
                .filter((x) => x.accountId == item)
                .reduce((x) => x.accountId)[this.compareColumn2],
          });
        }
        this.gridFilterData = resultArray;
        this.gridFilterDataAll = resultArray;
        this.gridSearchFilterData = resultArray;
        this.totalAmount = 0;
        for (var i = 0; i < resultArray.length; i++) {
          if (resultArray[i].amount != 0) {
            this.mainArray.push({
              amount: resultArray[i].amount,
              accountId: resultArray[i].accountId,
            });
          }
          this.totalAmount += resultArray[i].amount;
        }
        var objData: any = {};
        objData.columnName = "Column" + this.tableId;
        objData.columnArray = this.mainArray;
        this.commonMethodService.sendColumnArray(objData);
        this.transactionType = this.objReportFilter.transactionType;
        this.gridFilterData = this.gridFilterDataAll.slice(
          this.pageNumber.startIndex,
          this.pageNumber.endIndex + 1
        );
        let iscomparecol = this.ColumnNameList.indexOf(
          (x) => x.id == this.tableId
        );
        if (iscomparecol == -1) {
          this.ColumnNameList = this.ColumnNameList.filter(
            (x) => x.id != this.tableId
          );
          this.ColumnNameList.push({
            id: this.tableId,
            name: "Compare_" + this.columnName,
          });
        } else {
          this.ColumnNameList.push({
            id: this.tableId,
            name: "Compare_" + this.columnName,
          });
        }
        this.commonMethodService.sendColumnNameArray(this.ColumnNameList);
        this.commonMethodService.setIsDataSetLoading(false);
      }, 10000);
    } else if (this.objReportFilter.transactionType == 6) {
      var objTotal = {
        eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
        fromDate: this.objReportFilter.startDate
          ? moment(this.objReportFilter.startDate).format("YYYY-MM-DD")
          : null,
        toDate: this.objReportFilter.endDate
          ? moment(this.objReportFilter.endDate).format("YYYY-MM-DD")
          : null,
        reasonId:
          this.objReportFilter.paymentReason &&
          this.objReportFilter.paymentReason.length > 0
            ? this.objReportFilter.paymentReason.map((s) => s.id)
            : null,
        collectorId:
          this.objReportFilter.collectors &&
          this.objReportFilter.collectors.length > 0
            ? this.objReportFilter.collectors.map((s) => s.id)
            : null,
        locationId:
          this.objReportFilter.locations &&
          this.objReportFilter.locations.length > 0
            ? this.objReportFilter.locations.map((s) => s.id)
            : null,
        campaignId:
          this.objReportFilter.campaigns &&
          this.objReportFilter.campaigns.length > 0
            ? this.objReportFilter.campaigns.map((s) => s.id)
            : null,
      };

      this.totalPanelService.getTotals(objTotal).subscribe(
        (res: any) => {
          // hide loader
          this.amountType = [];
          (this.amountType =
            this.objReportFilter.totalDropdown.length > 0
              ? this.objReportFilter.totalDropdown.map((s) => s.id)
              : null),
            (this.isloading = false);
          if (res) {
            this.totaltbl = true;
            this.isTotalPaymentType = false;
            this.isOpenPledgesType = false;
            this.isPendingScheduleType = false;
            this.isTotalAmtType = true;
            this.isBalanceAmountType = false;
            this.isPaidAmountType = false;
            this.isTotalAmountType = false;

            this.amtField = false;
            this.paidField = false;
            this.balancefield = false;

            this.payamtField = false;
            this.pledgeField = false;
            this.scheduleField = false;
            this.totalamtField = false;

            //this.gridTotalPanelData=res;
            this.transactionresult = res;
            var donarIds = [];
            for (const iterator of this.donorlist) {
              if (donarIds.findIndex((x) => x == iterator.accountId) == -1) {
                donarIds.push(iterator.accountId);
              }
            }
            let resultArray = [];
            if (this.objReportFilter.selectedBaseCol == "Donor") {
              for (const item of donarIds) {
                if (this.amountType && this.amountType.includes(1)) {
                  this.isTotalPaymentType = true;
                  this.payamtField = true;
                  var payment = res
                    .filter((x) => x.accountId == item)
                    .reduce((sum: number, b) => sum + b.payments, 0);
                }
                if (this.amountType && this.amountType.includes(2)) {
                  this.isOpenPledgesType = true;
                  this.pledgeField = true;
                  var pledge = res
                    .filter((x) => x.accountId == item)
                    .reduce((sum: number, b) => sum + b.openPledges, 0);
                }
                if (this.amountType && this.amountType.includes(3)) {
                  this.isPendingScheduleType = true;
                  this.scheduleField = true;
                  var schedule = res
                    .filter((x) => x.accountId == item)
                    .reduce((sum: number, b) => sum + b.scheduled, 0);
                }
                if (this.amountType || this.amountType.includes(4)) {
                  this.isTotalAmtType = true;
                  this.totalamtField = true;
                  var totalamt = res
                    .filter((x) => x.accountId == item)
                    .reduce((sum: number, b) => sum + b.raised, 0);
                  var amount = totalamt;
                }
                var donorDetails = res.find((x) => x.accountId == item);
                resultArray.push({
                  transactionList: res.filter((x) => x.accountId == item),
                  accountId: item,
                  amount: amount,
                  payment: payment,
                  pledge: pledge,
                  schedule: schedule,
                });
              }
            }
            //total minAmount and maxAmout filter logic
            if (resultArray) {
              resultArray = resultArray.filter((x) => {
                if (
                  this.objReportFilter.minAmount &&
                  this.objReportFilter.maxAmount
                ) {
                  return (
                    parseFloat(x.amount) >=
                      parseFloat(this.objReportFilter.minAmount) &&
                    parseFloat(x.amount) <=
                      parseFloat(this.objReportFilter.maxAmount)
                  );
                }
                if (
                  this.objReportFilter.minAmount &&
                  !this.objReportFilter.maxAmount
                ) {
                  return (
                    parseFloat(x.amount) >=
                    parseFloat(this.objReportFilter.minAmount)
                  );
                }
                if (
                  this.objReportFilter.maxAmount &&
                  !this.objReportFilter.minAmount
                ) {
                  return (
                    parseFloat(x.amount) <=
                    parseFloat(this.objReportFilter.maxAmount)
                  );
                }
                return true;
              });
            }
            if (this.objReportFilter.columnName == undefined) {
              this.defaultColumnName = "Total #";
              var totalCount = localStorage.getItem("TotalCount");
              var count = this.DefaultCount(Number(totalCount));
              localStorage.setItem("TotalCount", count.toString());
              this.columnName = this.defaultColumnName + count;
            } else {
              this.columnName = this.objReportFilter.columnName;
            }
            var istotalcol = this.ColumnNameList.indexOf(
              (x) => x.id == this.tableId
            );
            if (istotalcol == -1) {
              this.ColumnNameList = this.ColumnNameList.filter(
                (x) => x.id != this.tableId
              );
              this.ColumnNameList.push({
                id: this.tableId,
                name: this.columnName,
                default: "Total",
              });
            } else {
              this.ColumnNameList.push({
                id: this.tableId,
                name: this.columnName,
                default: "Total",
              });
            }
            this.commonMethodService.sendColumnNameArray(this.ColumnNameList);

            this.gridFilterData = resultArray;
            this.gridFilterDataAll = resultArray;
            this.gridSearchFilterData = resultArray;
            this.totalAmount = 0;
            for (var i = 0; i < resultArray.length; i++) {
              if (resultArray[i].amount != 0) {
                this.mainArray.push({
                  amount: resultArray[i].amount,
                  accountId: resultArray[i].accountId,
                  payment:
                    this.isTotalPaymentType == true
                      ? resultArray[i].payment
                      : undefined,
                  pledge:
                    this.isOpenPledgesType == true
                      ? resultArray[i].pledge
                      : undefined,
                  schedule:
                    this.isPendingScheduleType == true
                      ? resultArray[i].schedule
                      : undefined,
                });
              }
              this.totalAmount += resultArray[i].amount;
            }
            var objData: any = {};
            objData.columnName = "Column" + this.tableId;
            objData.columnArray = this.mainArray;
            this.commonMethodService.sendColumnArray(objData);

            this.transactionType = this.objReportFilter.transactionType;
            // this.gridFilterData = this.gridFilterDataAll.slice(this.pageNumber.startIndex, this.pageNumber.endIndex + 1);
            //this.showOnlyTotalData(this.gridTotalPanelData);
          } else {
            if (this.amountType && this.amountType.includes(1)) {
              this.isTotalPaymentType = true;
              this.payamtField = true;
            }
            if (this.amountType && this.amountType.includes(2)) {
              this.isOpenPledgesType = true;
              this.pledgeField = true;
            }
            if (this.amountType && this.amountType.includes(3)) {
              this.isPendingScheduleType = true;
              this.scheduleField = true;
            }
            if (this.amountType && this.amountType.includes(4)) {
              this.isTotalAmtType = true;
              this.totalamtField = true;
            }
            var donarIds = [];
            for (const iterator of this.donorlist) {
              if (donarIds.findIndex((x) => x == iterator.accountId) == -1) {
                donarIds.push(iterator.accountId);
              }
            }
            let resultArray = [];
            for (const item of donarIds) {
              resultArray.push({
                transactionList: [],
                accountId: item,
                amount: 0,
                pledge: 0,
                schedule: 0,
                payment: 0,
              });
            }
            if (this.objReportFilter.columnName == undefined) {
              this.defaultColumnName = "Total #";
              var totalCount = localStorage.getItem("TotalCount");
              var count = this.DefaultCount(Number(totalCount));
              localStorage.setItem("TotalCount", count.toString());
              this.columnName = this.defaultColumnName + count;
            } else {
              this.columnName = this.objReportFilter.columnName;
            }

            var istotalcol = this.ColumnNameList.indexOf(
              (x) => x.id == this.tableId
            );
            if (istotalcol == -1) {
              this.ColumnNameList = this.ColumnNameList.filter(
                (x) => x.id != this.tableId
              );
              this.ColumnNameList.push({
                id: this.tableId,
                name: this.columnName,
                default: "Total",
              });
            } else {
              this.ColumnNameList.push({
                id: this.tableId,
                name: this.columnName,
                default: "Total",
              });
            }

            this.commonMethodService.sendColumnNameArray(this.ColumnNameList);

            this.gridFilterData = resultArray;
            this.gridFilterDataAll = resultArray;
            this.gridSearchFilterData = resultArray;
            this.totalAmount = 0;
            for (var i = 0; i < resultArray.length; i++) {
              if (resultArray[i].amount != 0) {
                this.mainArray.push({
                  amount: resultArray[i].amount,
                  accountId: resultArray[i].accountId,
                  payment: resultArray[i].payment,
                  pledge: resultArray[i].pledge,
                  schedule: resultArray[i].schedule,
                });
              }
            }
            var objData: any = {};
            objData.columnName = "Column" + this.tableId;
            objData.columnArray = this.mainArray;
            this.commonMethodService.sendColumnArray(objData);
            this.transactionType = this.objReportFilter.transactionType;
            this.gridFilterData = this.gridFilterDataAll.slice(
              this.pageNumber.startIndex,
              this.pageNumber.endIndex + 1
            );
          }

          this.commonMethodService.setIsDataSetLoading(false);
        },
        (error) => {
          this.isloading = false;
          this.commonMethodService.setIsDataSetLoading(false);
          console.log(error);
          this.notificationService.showError(
            error.error,
            "Error while fetching data !!"
          );
        }
      );
    }
    if (
      this.objReportFilter.transactionType == 4 ||
      this.objReportFilter.transactionType == 5
    ) {
      this.reportQueryService.getScheduleTotal(objScheduleTotal).subscribe(
        (res: any) => {
          if (res) {
            this.transactionresult = res;
            var donarIds = [];

            for (const iterator of this.donorlist) {
              if (donarIds.findIndex((x) => x == iterator.accountId) == -1) {
                donarIds.push(iterator.accountId);
              }
            }

            let resultArray = [];
            if (this.objReportFilter.selectedBaseCol == "Donor") {
              for (const item of donarIds) {
                var donorDetails = res.find((x) => x.accountId == item);

                resultArray.push({
                  transactionList: res.filter((x) => x.accountId == item),
                  accountId: item,
                  amount: res
                    .filter((x) => x.accountId == item)
                    .reduce((sum: number, b) => sum + b.fullTotal, 0),
                });
              }
            }

            if (this.objReportFilter.columnName == undefined) {
              if (this.objReportFilter.transactionType == 4) {
                this.defaultColumnName = "Schedule Payments #";
                var paymentCount = localStorage.getItem("SchedulePaymentCount");
                var count = this.DefaultCount(Number(paymentCount));
                localStorage.setItem("SchedulePaymentCount", count.toString());
                this.columnName = this.defaultColumnName + count;
              }
              if (this.objReportFilter.transactionType == 5) {
                this.defaultColumnName = "Schedule Pledges #";
                var paymentCount = localStorage.getItem("SchedulePledgeCount");
                var count = this.DefaultCount(Number(paymentCount));
                localStorage.setItem("SchedulePledgeCount", count.toString());
                this.columnName = this.defaultColumnName + count;
              }
            } else {
              this.columnName = this.objReportFilter.columnName;
            }
            var isschedulePledgecol = this.ColumnNameList.indexOf(
              (x) => x.id == this.tableId
            );
            if (isschedulePledgecol == -1) {
              this.ColumnNameList = this.ColumnNameList.filter(
                (x) => x.id != this.tableId
              );
              this.ColumnNameList.push({
                id: this.tableId,
                name: this.columnName,
              });
            } else {
              this.ColumnNameList.push({
                id: this.tableId,
                name: this.columnName,
              });
            }
            this.commonMethodService.sendColumnNameArray(this.ColumnNameList);

            this.gridFilterData = resultArray;
            this.gridFilterDataAll = resultArray;
            this.gridSearchFilterData = resultArray;
            this.totalAmount = 0;
            for (var i = 0; i < resultArray.length; i++) {
              if (resultArray[i].amount != 0) {
                this.mainArray.push({
                  amount: resultArray[i].amount,
                  accountId: resultArray[i].accountId,
                });
              }
              this.totalAmount += resultArray[i].amount;
            }

            var objData: any = {};
            objData.columnName = "Column" + this.tableId;
            objData.columnArray = this.mainArray;
            this.commonMethodService.sendColumnArray(objData);
            this.transactionType = this.objReportFilter.transactionType;
            this.gridFilterData = this.gridFilterDataAll.slice(
              this.pageNumber.startIndex,
              this.pageNumber.endIndex + 1
            );
          } else {
            var donarIds = [];
            for (const iterator of this.donorlist) {
              if (donarIds.findIndex((x) => x == iterator.accountId) == -1) {
                donarIds.push(iterator.accountId);
              }
            }
            let resultArray = [];
            for (const item of donarIds) {
              resultArray.push({
                transactionList: [],
                accountId: item,
                amount: 0,
              });
            }
            if (this.objReportFilter.columnName == undefined) {
              if (this.objReportFilter.transactionType == 4) {
                this.defaultColumnName = "Schedule Payments #";
                var paymentCount = localStorage.getItem("SchedulePaymentCount");
                var count = this.DefaultCount(Number(paymentCount));
                localStorage.setItem("SchedulePaymentCount", count.toString());
                this.columnName = this.defaultColumnName + count;
              }
              if (this.objReportFilter.transactionType == 5) {
                this.defaultColumnName = "Schedule Pledges #";
                var paymentCount = localStorage.getItem("SchedulePledgeCount");
                var count = this.DefaultCount(Number(paymentCount));
                localStorage.setItem("SchedulePledgeCount", count.toString());
                this.columnName = this.defaultColumnName + count;
              }
            } else {
              this.columnName = this.objReportFilter.columnName;
            }
            this.ColumnNameList.push({
              id: this.tableId,
              name: this.columnName,
            });

            this.gridFilterData = resultArray;
            this.gridFilterDataAll = resultArray;
            this.gridSearchFilterData = resultArray;
            this.totalAmount = 0;
            for (var i = 0; i < resultArray.length; i++) {
              if (resultArray[i].amount != 0) {
                this.mainArray.push({
                  amount: resultArray[i].amount,
                  accountId: resultArray[i].accountId,
                });
              }
            }
            var objData: any = {};
            objData.columnName = "Column" + this.tableId;
            objData.columnArray = this.mainArray;
            this.commonMethodService.sendColumnArray(objData);
            this.transactionType = this.objReportFilter.transactionType;
            this.gridFilterData = this.gridFilterDataAll.slice(
              this.pageNumber.startIndex,
              this.pageNumber.endIndex + 1
            );
          }
          this.commonMethodService.setIsDataSetLoading(false);
        },
        (error) => {
          this.isloading = false;
          this.commonMethodService.setIsDataSetLoading(false);
          console.log(error);
          this.notificationService.showError(
            error.error,
            "Error while fetching data !!"
          );
        }
      );
    }
    if (this.objReportFilter.transactionType == 1) {
      this.transactionTypeStr = "Payment";
    }
    if (this.objReportFilter.transactionType == 2) {
      this.transactionTypeStr = "Pledge";
    }
    if (this.objReportFilter.transactionType == 3) {
      this.transactionTypeStr = "Campaign";
    }
    if (this.objReportFilter.transactionType == 4) {
      this.transactionTypeStr = "Schedule Payments";
    }
    if (this.objReportFilter.transactionType == 5) {
      this.transactionTypeStr = "Schedule Pledges";
    }
    if (this.objReportFilter.transactionType == 6) {
      this.transactionTypeStr = "Total";
    }
    this.reportQueryId = this.objReportFilter.reportQueryId;
    this.amountTypeStr =
      this.objReportFilter.amountType == -1
        ? "All"
        : this.objReportFilter.amountType == 1
        ? "Paid"
        : "Balance";
    this.paymentTypeStr =
      this.objReportFilter.paymentTypes &&
      this.objReportFilter.paymentTypes.length > 0
        ? this.objReportFilter.paymentTypes.map((s) => s.itemName)
        : null;
    this.isPaymentTypeStr = this.paymentTypeStr != null ? true : false;

    (this.amountRange =
      this.objReportFilter.minAmount + " - " + this.objReportFilter.maxAmount),
      (this.dateRangeStr =
        this.datePipe.transform(this.objReportFilter.startDate) +
        " - " +
        this.datePipe.transform(this.objReportFilter.endDate)),
      (this.isDateRangeStr =
        this.objReportFilter.startDate != null ? true : false);
    (this.reasonStr =
      this.objReportFilter.paymentReason &&
      this.objReportFilter.paymentReason.length > 0
        ? this.objReportFilter.paymentReason.map((s) => s.itemName)
        : null),
      (this.isReasonStr = this.reasonStr != null ? true : false);
    (this.collectorStr =
      this.objReportFilter.collectors &&
      this.objReportFilter.collectors.length > 0
        ? this.objReportFilter.collectors.map((s) => s.itemName)
        : null),
      (this.isCollectorStr = this.collectorStr != null ? true : false);
    (this.locationStr =
      this.objReportFilter.locations &&
      this.objReportFilter.locations.length > 0
        ? this.objReportFilter.locations.map((s) => s.itemName)
        : null),
      (this.isLocationStr = this.locationStr != null ? true : false);
    (this.campaignStr =
      this.objReportFilter.campaigns &&
      this.objReportFilter.campaigns.length > 0
        ? this.objReportFilter.campaigns.map((s) => s.itemName)
        : null),
      (this.isCampaignStr = this.campaignStr != null ? true : false),
      (this.paymentStatusStr =
        this.objReportFilter.paymentStatus &&
        this.objReportFilter.paymentStatus.length > 0
          ? this.objReportFilter.paymentStatus.map((s) => s.itemName)
          : null);
    this.scheduleStatusStr =
      this.objReportFilter.scheduleStatus &&
      this.objReportFilter.scheduleStatus.length > 0
        ? this.objReportFilter.scheduleStatus.map((s) => s.itemName)
        : null;
  }

  getGroupValue(): Array<any> {
    return _(this.gridTotalPanelData)
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

  showOnlyTotalData(data) {
    const groupedRes = this.getGroupValue();

    const merged = _.merge(
      _.keyBy(data, "accountId"),
      _.keyBy(groupedRes, "accountId")
    );
    const mergedValue = _.values(merged);
    let inCommon = _.intersectionWith(mergedValue, groupedRes, (o, t) => {
      return o.accountId == t.accountId;
    });
    const values = _.values(inCommon);

    this.gridFilterData = values;
  }

  OpenSearchFilter() {
    this.reportListMethod.OpenSearchFilter();
  }
  openDonorCardPopup(accountId) {
    this.isloading = false;
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup donor_card",
    };
    const modalRef = this.commonMethodService.openPopup(
      DonorCardPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.AccountId = accountId;
    var objDonorCard = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      accountId: accountId,
    };

    this.cardService.getDonorCard(objDonorCard).subscribe((res: any) => {
      // hide loader
      this.isloading = false;
      modalRef.componentInstance.DonorCardData = res;
    });
  }

  openPaymentCardPopup(paymentId) {
    this.isloading = false;
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup payment_card",
    };
    const modalRef = this.commonMethodService.openPopup(
      PaymentCardPopupComponent,
      this.modalOptions
    );
    var objDonorCard = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      paymentId: paymentId,
    };

    this.cardService.getPaymentCard(objDonorCard).subscribe((res: any) => {
      // hide loader
      this.isloading = false;
      modalRef.componentInstance.PaymentCardData = res;
    });
  }

  openPaymentListCardPopup(accountId) {
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup payment_list",
    };
    const modalRef = this.commonMethodService.openPopup(
      PaymentlistCardPopupComponent,
      this.modalOptions
    );
    var objPaymentListCard = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      accountId: accountId,
      DateFrom: null,
      DateTo: null,
      paymentTypes:
        this.objReportFilter.paymentTypes.length > 0
          ? this.objReportFilter.paymentTypes.map((s) => s.id)
          : null,
      collectors:
        this.objReportFilter.collectors.length > 0
          ? this.objReportFilter.collectors.map((s) => s.id)
          : null,
      locations:
        this.objReportFilter.locations.length > 0
          ? this.objReportFilter.locations.map((s) => s.id)
          : null,
      campaignIds:
        this.objReportFilter.campaigns.length > 0
          ? this.objReportFilter.campaigns.map((s) => s.id)
          : null,
    };

    this.cardService
      .getPaymentCardList(objPaymentListCard)
      .subscribe((res: any) => {
        modalRef.componentInstance.PaymentCardListData = res;
      });
  }

  openPledgeListCardPopup(accountId) {
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup pledge_list",
    };
    const modalRef = this.commonMethodService.openPopup(
      PledgelistCardPopupComponent,
      this.modalOptions
    );
    var objPledgeListCard = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      accountId: accountId,
      fromDate: null,
      toDate: null,
      paymentTypes:
        this.objReportFilter.paymentTypes.length > 0
          ? this.objReportFilter.paymentTypes.map((s) => s.id)
          : null,
      collectors:
        this.objReportFilter.collectors.length > 0
          ? this.objReportFilter.collectors.map((s) => s.id)
          : null,
      locations:
        this.objReportFilter.locations.length > 0
          ? this.objReportFilter.locations.map((s) => s.id)
          : null,
      campaignIds:
        this.objReportFilter.campaigns.length > 0
          ? this.objReportFilter.campaigns.map((s) => s.id)
          : null,
    };

    this.cardService
      .getPledgeCardList(objPledgeListCard)
      .subscribe((res: any) => {
        modalRef.componentInstance.PledgeCardListData = res;
      });
  }

  rowExpand() {
    if (this.isGridVisible) {
      this.isGridVisible = false;
    } else {
      this.isGridVisible = true;
    }
  }

  dynamicSort(property) {
    var sortOrder = 1;
    if (property[0] === "-") {
      sortOrder = -1;
      property = property.substr(1);
    }
    return function (a, b) {
      var result =
        a[property] < b[property] ? -1 : a[property] > b[property] ? 1 : 0;
      return result * sortOrder;
    };
  }

  DeleteComponent(tableId, reportQueryId) {
    Swal.fire({
      title: this.commonMethodService.getTranslate("WARNING_SWAL.TITLE"),
      text: "You will not be able to recover this column!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: this.commonMethodService.getTranslate(
        "WARNING_SWAL.BUTTON.CANCEL.NO_KEEP_IT"
      ),
    }).then((result) => {
      if (result.value) {
        var myobj = document.getElementById(tableId);
        myobj.remove();
        this.deletedField = true;
        this.paidField = false;
        this.balancefield = false;
        var columnName = "Column" + tableId;
        this.commonMethodService.sendColumnName(columnName);
        this.commonMethodService.sendReportQuery(reportQueryId);
      } else {
      }
    });
  }
}
