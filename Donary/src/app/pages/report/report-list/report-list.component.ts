import {
  DragDrop,
  DragRef,
  DropListRef,
  moveItemInArray,
} from "@angular/cdk/drag-drop";
import {
  ChangeDetectorRef,
  Component,
  ComponentFactoryResolver,
  ElementRef,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
  ViewContainerRef,
} from "@angular/core";
import { NgbModalOptions } from "@ng-bootstrap/ng-bootstrap";
import { Subject, Subscription } from "rxjs";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { CardService } from "src/app/services/card.service";
import { CollectorService } from "src/app/services/collector.service";
import { DonorService } from "src/app/services/donor.service";
import { LocationService } from "src/app/services/location.sevice";
import { ReasonService } from "src/app/services/reason.service";
import Swal from "sweetalert2";
import * as FileSaver from "file-saver";
import * as moment from "moment";
import * as XLSX from "xlsx";
import { DonorCardPopupComponent } from "../../cards/donor-card-popup/donor-card-popup.component";
import { NewQueryPopupComponent } from "../new-query-popup/new-query-popup.component";
import { ReportDynamicListComponent } from "../report-dynamic-list/report-dynamic-list.component";
import { ReportFilterPopupComponent } from "./../report-filter-popup/report-filter-popup.component";
import {
  ReportQueryService,
  SaveQueryParams,
} from "src/app/services/reportquery.service";
import { SourceService } from "src/app/services/source.service";
import { AdvancedFieldService } from "src/app/services/advancedfield.service";

import { BulkCustomReportComponent } from "../../donor/bulk-custom-report/bulk-custom-report.component";
import { PrintableReportService } from "src/app/services/printable-report.service";
import { TagService } from "src/app/services/tag.service";
import { CommonAPIMethodService } from "src/app/services/common-api-method.service";
import { environment } from "./../../../../environments/environment";
import { XLSXService } from "src/app/services/xlsx.service";
declare var $: any;
@Component({
  selector: "app-report-list",
  templateUrl: "./report-list.component.html",
  standalone: false,
  styleUrls: ["./report-list.component.scss"],
})
export class ReportListComponent implements OnInit {
  @ViewChild("container", { static: false, read: ViewContainerRef }) container;
  @ViewChild("dvParent", { static: true }) dvParent: HTMLElement;
  @ViewChildren("checkboxes") checkboxes: QueryList<ElementRef>;
  protected ngUnsubscribe: Subject<void> = new Subject<void>();
  oneline: boolean = true;
  isfather: boolean = false;
  jewishName: boolean = false;
  objAdvancedSearch: any;
  componentCount: number = 1; //1;
  sortType: string = "asc";
  isProdEnv: boolean;
  objReportFilter: any;

  donorlist: any;
  tableId: string;
  mainArray: any = [];
  pageSize: number = 25;
  isPageSizeChanged = false;

  columnName: string;
  isloading: boolean;
  isSelected = false;
  recordSelectedArray = [];
  isdatasetLoading: boolean = false;
  gridData: Array<any>;
  gridFilterData: Array<any>;
  gridCount: Array<any>;
  searchgridCount: Array<any>;
  modalOptions: NgbModalOptions;
  tempArray: any = [];
  pageNumber: any;
  isGenerate: boolean = true;
  hasDonor: boolean = false;
  localDragRef: DragRef[] = new Array<DragRef>();
  droplistREf: DropListRef<any>;
  columnList: any = [];
  totalRecord: number = 0;
  filterRecord: number = 0;
  isFiltered: boolean = false;
  newQueryAdded: boolean = false;

  //New Query
  queryName: string;
  baseColumn: string;
  displayFields: any = [];
  fieldArray = [];

  dataSetArrays = [];
  tagArray = [];
  savedQuearyList = [];
  advanceFieldList = [];
  reportQueryId: number; ///add new for update
  dfields = [];
  tempval: number = 0;
  isloadingSavedQuery: boolean;
  isSelectedSavedQuery: boolean = false;
  //temda:number=0;
  isRunLoader: boolean = false;
  sub;
  subGetdonar;
  subAll;
  subPaymentTrans;
  advancedFieldIndex: number;
  getColumnArraySubscription: Subscription;
  noSavedQQuery: any;

  constructor(
    private donorService: DonorService,
    private cardService: CardService,
    private localstoragedataService: LocalstoragedataService,
    public commonMethodService: CommonMethodService,
    private collectorService: CollectorService,
    private reasonService: ReasonService,
    private locationService: LocationService,
    private sourceService: SourceService,
    private reportQueryService: ReportQueryService,
    private resolver: ComponentFactoryResolver,
    private dragDrop: DragDrop,
    private chRef: ChangeDetectorRef,
    private advancedFieldService: AdvancedFieldService,
    private printableReport: PrintableReportService,
    private tagService: TagService,
    private advanceFieldService: AdvancedFieldService,
    private commonAPIMethodService: CommonAPIMethodService,
    private xlsxService: XLSXService
  ) {}

  ngOnInit() {
    this.isProdEnv = environment.baseUrl.includes("https://webapi.donary.com/");
    this.commonMethodService.multiSelectFieldList.push(
      { id: 1, itemName: "Acct #", category: "Basic" },
      { id: 2, itemName: "Full Name Jewish", category: "Basic" },
      { id: 3, itemName: "Full Name", category: "Basic" },
      { id: 4, itemName: "Family", category: "Basic" },
      { id: 5, itemName: "Phone", category: "Basic" },
      { id: 6, itemName: "Address", category: "Basic" },
      { id: 7, itemName: "Email", category: "Basic" },
      { id: 8, itemName: "City State Zip", category: "Basic" },
      { id: 9, itemName: "Note", category: "Basic" },
      { id: 10, itemName: "Father", category: "Basic" },
      { id: 11, itemName: "Father in law", category: "Basic" },
      { id: 12, itemName: "Location", category: "Basic" },
      { id: 13, itemName: "Status", category: "Basic" }
    );
    this.commonMethodService.multiselectDonorFieldList.push(
      { id: "accountNo", itemName: "Acct #", category: "Basic" },
      { id: "address", itemName: "Address", category: "Basic" }, //added address for filter
      { id: "fullName", itemName: "Full Name", category: "Basic" },
      { id: "fullNameJewish", itemName: "Full Name Jewish", category: "Basic" },
      { id: "family", itemName: "Family", category: "Basic" },
      { id: "phone", itemName: "Phone", category: "Basic" },
      { id: "email", itemName: "Email", category: "Basic" },
      { id: "note", itemName: "Note", category: "Basic" },
      { id: "father", itemName: "Father", category: "Basic" },
      { id: "fatherinlaw", itemName: "Father in law", category: "Basic" },
      { id: "location", itemName: "location", category: "Basic" }
    );
    this.getAllLabels();
    this.getAdvanceList();
    localStorage.removeItem("PledgeCount");
    localStorage.removeItem("PaymentCount");
    localStorage.removeItem("CompareCount");
    localStorage.removeItem("CampaignCount");
    localStorage.removeItem("SchedulePaymentCount");
    localStorage.removeItem("TotalCount");
    localStorage.removeItem("SchedulePledgeCount");
    $("#main_table").hide();
    //this.OpenDonorFilterPopup(true);
    //this.SortDynamicArray();
    this.getAFVColumns();
    this.commonMethodService.getColumnName().subscribe((columnNameList) => {
      if (columnNameList.length > 0) {
        var colNo = columnNameList.substr(columnNameList.length - 1);
        Object.values(this.mainArray).forEach((item: any) => {
          var Key = Object.keys(item);
          Key.forEach((element) => {
            if (element.includes("Column" + colNo)) {
              this.mainArray.forEach((object) => {
                delete object[element];
              });
            }
          });
        });
        this.componentCount = this.componentCount - 1;
        var split = "Column";

        var columnId = columnNameList.substring(
          columnNameList.indexOf(split) + split.length
        );
        for (var i = 0; i < this.columnList.length; i++) {
          if (this.columnList[i].id == columnId) {
            this.columnList.splice(i, 1);
            break;
          }
        }
      }
    });
    this.commonMethodService.getReportQuery().subscribe((res) => {
      if (res != "") {
        this.dataSetArrays = this.dataSetArrays.filter(
          (x) => x.reportQueryId != res
        );
      }
    });
    this.commonMethodService.getColumnId().subscribe((res) => {
      if (res && Object.keys(res.sortType).length != 0) {
        this.isloading = true;
        if (res.sortType == "asc") {
          this.tempArray = this.mainArray.sort(
            this.dynamicSort(res.ColumnName)
          );
        } else {
          this.tempArray = this.mainArray.sort(
            this.dynamicSort(res.ColumnName)
          );
          this.tempArray = this.tempArray
            .sort(this.dynamicSort(res.ColumnName))
            .reverse();
        }
        this.SortMainArray();
      }
    });

    this.commonMethodService
      .getColumnNameArray()
      .subscribe((columnNameList) => {
        if (columnNameList.length > 0) {
          this.columnList.push.apply(this.columnList, columnNameList);
          this.columnList = this.columnList.reverse();
          this.columnList = this.columnList.filter(
            (v, i, a) => a.findIndex((t) => t.id === v.id) === i
          );
        }
      });

    this.commonMethodService.getIsDataSetLoading().subscribe((val) => {
      this.isdatasetLoading = val;
    });

    this.getSavedQueary();
  }

  getAFVColumns() {
    const eventGuId = this.localstoragedataService.getLoginUserEventGuId();
    this.subAll = this.advancedFieldService
      .getAll(eventGuId)
      .subscribe((res) => {
        if (res) {
          for (let index = 0; index < res.length; index++) {
            const element = res[index];
            if (element.fieldName) {
              let trimValue = this.advancedFieldService.formatFieldName(
                element.fieldName
              );
              this.advanceFieldList.push({
                colName: trimValue,
                isVisible: false,
                colId: element.advancedFieldId,
                sortName: trimValue,
              });
            }
          }
        }
      });
  }

  getAdvanceList() {
    var eventGuId = this.localstoragedataService.getLoginUserEventGuId();
    this.advanceFieldService.getAll(eventGuId).subscribe((res: any) => {
      if (res) {
        var index = 14;
        for (var item of res) {
          this.commonMethodService.multiSelectFieldList.push({
            id: index,
            itemName: item.fieldName.replace(":", ""),
            category: "Advanced_Fields",
          });
          index++;
          this.commonMethodService.multiselectDonorFieldList.push({
            id: item.fieldName,
            itemName: item.fieldName.replace(":", ""),
            category: "Advanced_Fields",
          });
        }
        this.advancedFieldIndex = index;
        this.getTagList();
      }
    });
  }

  getTagList() {
    var eventGuId = this.localstoragedataService.getLoginUserEventGuId();
    this.tagService.getAllTag(eventGuId).subscribe((res) => {
      if (res) {
        var index = this.advancedFieldIndex;
        let category = "Tags";
        for (var item of res) {
          this.commonMethodService.multiSelectFieldList.push({
            id: index,
            itemName: item.tagName.replace(":", ""),
            category: "Tags",
          });
          index++;
          this.commonMethodService.multiselectDonorFieldList.push({
            id: item.tagName,
            itemName: item.tagName.replace(":", ""),
            category: "Tags",
          });
        }
      }
    });
  }

  ngAfterViewInit() {
    this.droplistREf = this.dragDrop.createDropList(this.dvParent);
    this.droplistREf.dropped.subscribe((a) => {
      moveItemInArray([...this.localDragRef], a.previousIndex, a.currentIndex);
    });
  }

  testcont = 0;
  testDataCreateCount = 0;
  Sort(type) {
    this.sortType = type;
    this.isloading = true;
    if (type == "asc") {
      this.tempArray = this.mainArray.sort(this.dynamicSort("fullName"));
    } else {
      this.tempArray = this.mainArray
        .sort(this.dynamicSort("fullName"))
        .reverse();
    }
    this.SortMainArray();

    //this.isloading = false;///for issue
  }

  SwitchLines() {
    this.oneline = this.oneline == true ? false : true;
    this.commonMethodService.sendLineHeight(this.oneline);
  }
  testcount = 0;
  SortMainArray() {
    this.isloading = true;
    var accountIdArray = [];
    this.tempArray.forEach(function (obj) {
      accountIdArray.push(obj.accountId);
    });

    this.commonMethodService
      .getPageNumberObservable()
      //.pipe(distinctUntilChanged((prev, curr) => prev != curr))
      .subscribe((pageNumber) => {
        if (this.setForLoaderDataset) {
          this.isloading = false;
        } else {
          this.isloading = true;
        }
        if (pageNumber) {
          this.pageNumber = pageNumber;
          if (this.isDeleteDonoryQuery) {
            this.isloading = false;
            this.isDeleteDonoryQuery = false;
          } else if (this.newQueryAdded && this.isNewAfterDelete == true) {
            if (this.setForLoaderDataset) {
            } else {
              this.isloading = false;
              $("#div_report_search").show();
              $("#main_table").show();
              //this.isNewAfterDelete =false;
            }
          } else if (
            this.isNewQueryLoder == true &&
            this.isSelectedSavedQuery == false
          ) {
            this.isNewQueryLoder = false;
            this.isloading = false;
            $("#main_table").show();
            $("#div_report_search").show();
          } else if (
            this.dataSetArrays.length &&
            this.isSelectedSavedQuery == false &&
            this.fisrtTimeDelete == false
          ) {
            ////////create dataset
            this.isloading = false;
            $("#main_table").show();
            $("#div_report_search").show();
          } else if (this.updateWithoughtDeleteQuery == true) {
            this.isloading = false;
            $("#main_table").show();
            $("#div_report_search").show();
            //this.updateWithoughtDeleteQuery=false;
          } else if (this.isPageSizeChanged) {
            this.isloading = false;
            $("#main_table").show();
            $("#div_report_search").show();
            this.commonMethodService.sendPageNumber(pageNumber);
          } else {
            this.isloading = false; //for issue
            $("#div_report_search").show();
            $("#main_table").show();
          }
        }
      });

    let sortedarray = this.mapOrder(
      this.gridCount,
      accountIdArray,
      "accountId"
    );
    this.gridFilterData = sortedarray.slice(
      this.pageNumber.startIndex,
      this.pageNumber.endIndex + 1
    );
    this.commonMethodService.sendAccountIdArray(accountIdArray);
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

  dynamicSort(property) {
    var sortOrder = 1;
    if (property && property[0] === "-") {
      sortOrder = -1;
      property = property.substr(1);
    }
    return function (a, b) {
      var result =
        a[property] < b[property] ? -1 : a[property] > b[property] ? 1 : 0;
      return result * sortOrder;
    };
  }

  RemoveDonor() {
    var tempArray = this.mainArray;
    tempArray = tempArray.forEach(function (v) {
      delete v["accountId"], delete v["fullName"];
    });
    var result = Object.values(tempArray).every((o) => o !== 0);
  }

  onChangePage(pageOfItems) {
    this.gridFilterData = pageOfItems;
  }

  PageSizeChange(val) {
    this.pageSize = Number(val);
    this.isPageSizeChanged = true;
    $(".show_entryval").removeClass("active");
    $("#" + val).addClass("active");
    this.donorlist;
  }
  isNewQueryLoder = false;
  isNewAfterDelete = false;
  OpenNewQueryPopup() {
    this.isloading = false;
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup create_query",
    };
    const modalRef = this.commonMethodService.openPopup(
      NewQueryPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.editDonarReport = false;
    modalRef.componentInstance.emtOutputQueryData.subscribe((objResponse) => {
      if (objResponse) {
        this.tagArray = objResponse.objAdvancedSearch.newtags;
        this.isNewQueryLoder = true;
        this.isNewAfterDelete = true;
        this.isloading = true; ///for issue
        $("#div_report_search").hide();
        this.isloadingSavedQuery = false;
        this.newQueryAdded = true;
        this.queryName = objResponse.queryName;
        (this.baseColumn =
          objResponse.baseColumn.length > 0
            ? objResponse.baseColumn.map((s) => s.itemName).toString()
            : null),
          (this.displayFields = objResponse.displayField);
        this.dfields = objResponse.displayField;
        this.objAdvancedSearch = objResponse.objAdvancedSearch;
        this.pageSize = 25;
        $(".show_entryval").removeClass("active");
        $("#25").addClass("active");

        if (this.baseColumn == "Donor") {
          this.searchDonorData();
        }
      }
    });
  }

  updateWithoughtDeleteQuery = false;
  OpenEditQueryPopup() {
    this.isloading = false;
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup create_query",
    };
    const modalRef = this.commonMethodService.openPopup(
      NewQueryPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.editDonarReport = true;
    modalRef.componentInstance.populateDonarReport = {
      queryName: this.queryName,
      baseColumn: this.baseColumn,
      displayFiel: this.dfields,
      objAdvancedSearch: this.objAdvancedSearch,
    };
    modalRef.componentInstance.emtOutputQueryData.subscribe((objResponse) => {
      if (objResponse) {
        this.tagArray = objResponse.objAdvancedSearch.newtags;
        this.updateWithoughtDeleteQuery = true;
        this.isloading = true; ///for issue
        $("#div_report_search").hide();
        this.isloadingSavedQuery = false;
        this.newQueryAdded = true;
        this.queryName = objResponse.queryName;
        (this.baseColumn =
          objResponse.baseColumn.length > 0
            ? objResponse.baseColumn.map((s) => s.itemName).toString()
            : null),
          (this.displayFields = objResponse.displayField);
        this.dfields = objResponse.displayField;
        this.objAdvancedSearch = objResponse.objAdvancedSearch;
        this.pageSize = 25;
        $(".show_entryval").removeClass("active");
        $("#25").addClass("active");
        if (this.baseColumn == "Donor") {
          this.searchDonorData();
        }
      }
    });
  }
  isDeleteDonoryQuery = false;
  countDeleteDonoryQuery = 0;
  fisrtTimeDelete = false;
  btnDeleteDonoryQuery = 0;
  DeleteDonorQuery() {
    this.columnList = [];
    this.mainArray = [];
    this.dataSetArrays = [];
    this.displayFields = [];
    this.dfields = [];
    this.oneline = true;
    this.commonMethodService.sendColumnNameArray([]);
    this.dataSetArrays = [];
    this.btnDeleteDonoryQuery += 1;
    this.mainArray = [];
    this.fisrtTimeDelete = true;
    this.countDeleteDonoryQuery = 0;
    this.donorlist = null;
    this.isDeleteDonoryQuery = true;
    this.totalRecord = 0;
    this.gridData = [];
    this.gridFilterData = this.gridData;
    this.gridCount = this.gridData;
    this.searchgridCount = this.gridData;
    this.hasDonor = false;
    this.isloading = false;
    this.queryName = null;
    this.newQueryAdded = false;
    this.componentCount = 1;

    for (let index = 0; index < 100; index++) {
      var ff = document.getElementById("table" + index);
      if (ff != null) {
        ff.remove();
      }
      var tempid = index.toString();
      var myobj = document.getElementById(tempid);
      if (myobj != null) {
        myobj.remove();
        var myobj1 = document.getElementById(tempid);
        if (myobj1 != null) {
          myobj1.remove();
        }
        var myobj2 = document.getElementById(tempid);
        if (myobj2 != null) {
          myobj2.remove();
        }
        var myobj3 = document.getElementById(tempid);
        if (myobj3 != null) {
          myobj3.remove();
        }
      }
    }
    this.container.clear();
    $("#main_table").hide();
    this.countAA = 1;
    this.ngOnInit();
  }
  DeleteDonorQueryNew() {
    this.ngOnInit();
  }
  ngOnDestroy() {
    // This aborts all HTTP requests.
    this.ngUnsubscribe.next();
    // This completes the subject properlly.
    this.ngUnsubscribe.complete();
  }

  openDonorCardPopup(accountID) {
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
    modalRef.componentInstance.AccountId = accountID;
    var objDonorCard = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      accountId: accountID,
    };

    this.cardService.getDonorCard(objDonorCard).subscribe((res: any) => {
      this.isloading = false;
      modalRef.componentInstance.DonorCardData = res;
    });
  }
  setForLoaderDataset = false;
  countForLoaderDataset = 0;

  callAftergetColumnArray(res) {
    if (res && Object.keys(res.columnName).length != 0) {
      let columnName = res.columnName;
      var column = this.columnList;
      var accountIds = res.columnArray.map((x) => x.accountId);
      var colaccountIds = this.mainArray.map((x) => x.accountId);
      res.columnArray = res.columnArray.filter(
        (item) => colaccountIds.indexOf(item.accountId) != -1
      );
      if (
        res &&
        res.columnArray[0] &&
        column[0].default &&
        column[0].default.indexOf("Total") > -1 &&
        !this.mainArray.some((obj) =>
          Object.keys(obj).includes("Column" + column[0].id)
        )
      ) {
        var payment =
          res.columnArray.length != 0 ? res.columnArray[0].payment : undefined;
        var pledge =
          res.columnArray.length != 0 ? res.columnArray[0].pledge : undefined;
        var schedule =
          res.columnArray.length != 0 ? res.columnArray[0].schedule : undefined;
        var amount =
          res.columnArray.length != 0 ? res.columnArray[0].amount : 0;
        var colNo = columnName.substr(columnName.length - 1);
        this.mainArray.forEach(function (element, i) {
          const obj = res.columnArray.find(
            (o) => o.accountId == element.accountId
          );
          if (payment != undefined) {
            element["Payments #" + colNo] =
              obj && obj.payment ? obj.payment : 0;
          }
          if (pledge != undefined) {
            element["Open Pledges #" + colNo] =
              obj && obj.pledge ? obj.pledge : 0;
          }
          if (schedule != undefined) {
            element["Pending Schedules #" + colNo] =
              obj && obj.schedule ? obj.schedule : 0;
          }
          if (amount != undefined) {
            element["Total Amount #" + colNo] =
              obj && obj.amount ? obj.amount : 0;
          }
        });
      } else if (
        column[0].default &&
        column[0].default.indexOf("Pledge") > -1 &&
        !this.mainArray.some((obj) =>
          Object.keys(obj).includes("Column" + column[0].id)
        )
      ) {
        let paid = res.columnArray[0].paid;
        let balance = res.columnArray[0].balance;
        let amount = res.columnArray[0].amount;
        let cmpamount = res.columnArray[0].amount;
        let colNo = columnName.substr(columnName.length - 1);
        this.mainArray.forEach(function (element, i) {
          const obj = res.columnArray.find(
            (o) => o.accountId == element.accountId
          );
          element[columnName] = obj && obj.amount ? obj.amount : 0;
        });
      } else {
        this.mainArray.forEach(function (element, i) {
          const obj = res.columnArray.find(
            (o) => o.accountId == element.accountId
          );
          element[columnName] = obj && obj.amount ? obj.amount : 0;
        });
      }
      this.search(null, true);

      this.isloading = false;
    }
  }

  OpenSearchFilter() {
    //this.isloading = false;
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
    obj.isButtonGenerate = false;
    obj.editParameterData = null;
    modalRef.componentInstance.SettingFilterData = obj;
    modalRef.componentInstance.baseColumn = this.baseColumn;
    modalRef.componentInstance.ColumnList = this.columnList;
    modalRef.componentInstance.emtOutputSearchFilterData.subscribe(
      (objResponse) => {
        this.commonMethodService.setIsDataSetLoading(true);
        this.isSelectedSavedQuery = false; //changes

        if (this.setForLoaderDataset) {
          this.isloading = false;
        } else {
          this.isloading = true; //for issue fixed
        }

        const reportDynamicListFactory = this.resolver.resolveComponentFactory(
          ReportDynamicListComponent
        );
        const reportRef = this.container.createComponent(
          reportDynamicListFactory
        );
        var obj: any = {};

        obj.sortType = this.sortType;
        obj.mainArray = this.mainArray;
        obj.selectedBaseCol = this.baseColumn;
        this.tableId = this.componentCount.toString();
        this.componentCount = this.componentCount + 1;
        objResponse.columnNo = this.tableId;
        obj.list = objResponse;
        reportRef.instance.DonorList = this.donorlist;
        reportRef.instance.ReportData = obj;
        reportRef.instance.TableId = this.tableId;

        this.commonMethodService.getColumnArray().subscribe((res) => {
          this.callAftergetColumnArray(res);
          return;
        });
        this.localDragRef.push(reportRef.instance.dragEnable(this.dragDrop));
        this.droplistREf.withItems([...this.localDragRef]);
        reportRef.changeDetectorRef.detectChanges();
        if (this.setForLoaderDataset) {
        } else {
          this.isloading = false;
        }
      }
    );
  }

  selectRecord(event, type, accountId) {
    if (type == "selectAll") {
      if (event.target.checked) {
        this.isSelected = true;
        var searVal = $("#id_advanceSearch").val();
        if (!searVal) {
          this.gridFilterData = this.gridData;
        }
        this.gridFilterData.forEach((element) => {
          this.recordSelectedArray.push(element.accountId);
        });
      } else {
        this.isSelected = false;
        this.checkboxes.forEach((element) => {
          element.nativeElement.checked = false;
        });
        this.recordSelectedArray = [];
        this.isSelected = false;
      }
    } else {
      if (event.target.checked) {
        if (!this.recordSelectedArray.includes(accountId)) {
          this.recordSelectedArray.push(accountId);
        }
        if (this.recordSelectedArray.length >= 1) {
          this.isSelected = true;
        }
      } else {
        if (this.recordSelectedArray.includes(accountId)) {
          this.recordSelectedArray.forEach((element, index) => {
            if (element == accountId) this.recordSelectedArray.splice(index, 1);
          });
          if (this.recordSelectedArray.length == 0) {
            this.isSelected = false;
          }
        }
      }
    }
  }

  checkselectRecord(accountId): Boolean {
    return this.recordSelectedArray.includes(accountId);
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
    var bulkDonorDetails = [];
    this.recordSelectedArray.forEach((element) => {
      var filteredrecord = this.gridData.filter((x) => x.accountId == element); //this.gridData.filter(x => x.accountId == element);
      bulkDonorDetails.push(filteredrecord);
    });
    modalRef.componentInstance.BulkDonorList = bulkDonorDetails;
    modalRef.componentInstance.SelectedIds = this.recordSelectedArray;
    let listName = "Reports";
    let orgId = this.localstoragedataService.getLoginUserOrganisationId();
    this.printableReport
      .getAllPrintableReport(listName, orgId)
      .subscribe((res: any) => {
        if (res) {
          modalRef.componentInstance.reportObj = res[0];
        }
      });
  }

  search(keyword, isZero = false) {
    this.gridCount = this.searchgridCount;
    var tempArray = this.mainArray;
    var resultArray: any = [];
    var newArray: any = [];
    if (!isZero) {
      keyword = keyword.toLowerCase();
    }
    this.isFiltered = false;
    this.totalRecord = this.mainArray.length;
    if (keyword != "" || keyword == null) {
      if (!isZero) {
        var searchArray = keyword.split(" ");
      }
      var filteredRecord;
      if (isZero) {
        filteredRecord = this.filterZeroAmt(tempArray);
        tempArray = filteredRecord;
      } else {
        for (var searchValue of searchArray) {
          filteredRecord = this.filterByValue(tempArray, searchValue);
          tempArray = filteredRecord;
        }
      }
      for (const item of tempArray) {
        var newArray = this.gridCount.find(
          (e) => e.accountId === item.accountId
        );
        resultArray.push(newArray);
      }
      this.gridCount = resultArray;
      this.backArray = this.gridCount; //added new
      if (isZero) {
        this.totalRecord = this.gridCount.length;
        this.isFiltered = false;
      } else {
        this.filterRecord = this.gridCount.length;
        this.isFiltered = true;
      }

      this.gridFilterData = resultArray.slice(
        this.pageNumber.startIndex,
        this.pageNumber.endIndex + 1
      );
      var accountIdArray = [];
      tempArray.forEach(function (obj) {
        accountIdArray.push(obj.accountId);
      });
      this.commonMethodService.sendSearchAccountIdArray(accountIdArray);
    }
  }
  filterByValue(array, value) {
    return array.filter((o) => {
      return Object.keys(o).some((k) => {
        if (k != "accountId") {
          if (typeof o[k] === "string") {
            return o[k].toLowerCase().includes(value.toLowerCase());
          } else {
            return o[k] === Number(value);
          }
        }
      });
    });
  }

  filterZeroAmt(array) {
    return array.filter((o) => {
      const keys = Object.keys(o);
      const amountkeys = keys.filter((t) => t.includes("Column"));
      const d = amountkeys.filter((k) => o[k] != 0);

      const otherkeys = keys.filter(
        (t) =>
          t.includes("Payments") ||
          t.includes("Pledges") ||
          t.includes("Schedules") ||
          t.includes("Total")
      );
      const od = otherkeys.filter((k) => o[k] != 0);

      return d.length != 0 || od.length !== 0;
    });
  }

  searchDonorData() {
    var objAdvancedSearchData: any = {};
    if (this.objAdvancedSearch) {
      objAdvancedSearchData = {
        // Get only Id values for multi select dropdown
        accountNo: this.objAdvancedSearch.accountNo,
        fullNameJewish: this.objAdvancedSearch.fullNameJewish,
        fullName: this.objAdvancedSearch.fullName,
        city: this.objAdvancedSearch.city,
        state: this.objAdvancedSearch.state,
        zip: this.objAdvancedSearch.zip,
        defaultLocation:
          this.objAdvancedSearch.defaultLocation &&
          this.objAdvancedSearch.defaultLocation.length > 0
            ? this.objAdvancedSearch.defaultLocation.map((s) => s.id)
            : null,
        group: this.objAdvancedSearch.group,
        class: this.objAdvancedSearch.class,
        note: this.objAdvancedSearch.note,
        phone: this.objAdvancedSearch.phone,
        email: this.objAdvancedSearch.email,
        father: this.objAdvancedSearch.father,
        fatherInLaw: this.objAdvancedSearch.fatherInLaw,
        status: this.objAdvancedSearch.status,
        locationIds: this.objAdvancedSearch.LocationIds,
        listFilters: {
          advancedFields:
            this.objAdvancedSearch && this.objAdvancedSearch.advancedFields,
          tags:
            this.objAdvancedSearch &&
            this.objAdvancedSearch.tags &&
            this.objAdvancedSearch.tags.map((x) => x.name),
        },
      };
    }
    var objsearchDonor = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      accountNo: this.objAdvancedSearch && this.objAdvancedSearch.accountNo,
      fullNameJewish:
        this.objAdvancedSearch && this.objAdvancedSearch.fullNameJewish,
      fullName: this.objAdvancedSearch && this.objAdvancedSearch.fullName,
      city: this.objAdvancedSearch && this.objAdvancedSearch.city,
      state: this.objAdvancedSearch && this.objAdvancedSearch.state,
      zip: this.objAdvancedSearch && this.objAdvancedSearch.zip,
      cities:
        this.objAdvancedSearch &&
        this.objAdvancedSearch.cities &&
        this.objAdvancedSearch.cities.map((x) => x.city),
      states:
        this.objAdvancedSearch &&
        this.objAdvancedSearch.cities &&
        this.objAdvancedSearch.cities.map((x) => x.state),
      zips:
        this.objAdvancedSearch &&
        this.objAdvancedSearch.zips &&
        this.objAdvancedSearch.zips.map((x) => x.itemName),
      defaultLocation:
        this.objAdvancedSearch.defaultLocation &&
        this.objAdvancedSearch.defaultLocation.length > 0
          ? this.objAdvancedSearch.defaultLocation.map((s) => s.id)
          : null,
      group: this.objAdvancedSearch && this.objAdvancedSearch.group,
      class: this.objAdvancedSearch && this.objAdvancedSearch.class,
      note: this.objAdvancedSearch && this.objAdvancedSearch.note,
      phone: this.objAdvancedSearch && this.objAdvancedSearch.phone,
      email: this.objAdvancedSearch && this.objAdvancedSearch.email,
      father: this.objAdvancedSearch && this.objAdvancedSearch.father,
      fatherInLaw: this.objAdvancedSearch && this.objAdvancedSearch.fatherInLaw,
      status: this.objAdvancedSearch && this.objAdvancedSearch.status,
      locationIds: this.objAdvancedSearch && this.objAdvancedSearch.locationIds,
      listFilters: {
        advancedFields:
          this.objAdvancedSearch && this.objAdvancedSearch.advancedFields,
        tags:
          this.objAdvancedSearch &&
          this.objAdvancedSearch.tags &&
          this.objAdvancedSearch.tags.map((x) => x.name),
      },
    };

    this.subGetdonar = this.donorService.getDonorList(objsearchDonor).subscribe(
      (res: any) => {
        // hide loader
        //.isloading = false;
        this.isFiltered = false;
        if (res) {
          this.totalRecord = res.length;
          this.donorlist = res;
          if (this.mainArray.length > 0) {
            this.mainArray = [];
          }
          for (var i = 0; i < res.length; i++) {
            var mainAdvanceFieldAry = [];
            if (
              res[i].advancedFieldNames &&
              res[i].advancedFieldNames.indexOf(",") > -1
            ) {
              res[i].advancedFieldNames = res[i].advancedFieldNames.split(",");
              res[i].advancedFieldNames = res[i].advancedFieldNames.filter(
                (e) => e
              );
            } else {
              res[i].advancedFieldNames = [res[i].advancedFieldNames];
            }
            if (
              res[i].advancedFieldValues &&
              res[i].advancedFieldValues.indexOf(",") > -1
            ) {
              res[i].advancedFieldValues =
                res[i].advancedFieldValues.split(",");
              res[i].advancedFieldValues = res[i].advancedFieldValues.filter(
                (e) => e
              );
            } else {
              res[i].advancedFieldValues = [res[i].advancedFieldValues];
            }
            if (res[i].advancedFieldNames) {
              for (var k = 0; k < res[i].advancedFieldNames.length; k++) {
                if (res[i].advancedFieldNames[k]) {
                  mainAdvanceFieldAry.push({
                    key: res[i].advancedFieldNames[k].trim().replace(":", ""),
                    value: res[i].advancedFieldValues[k],
                  });
                }
              }
            }
            var fr = "";
            var frl = "";
            res[i].father == null ? "" : (fr = res[i].father);
            res[i].fatherInLaw == null ? "" : (frl = res[i].fatherInLaw);
            this.mainArray.push({
              accountId: res[i].accountId,
              ...(this.displayFields.findIndex((x) => x.itemName == "Acct #") !=
                -1 && { accountNum: res[i].accountNum }),
              ...(this.displayFields.findIndex(
                (x) => x.itemName == "Full Name Jewish"
              ) != -1 && { fullNameJewish: res[i].fullNameJewish }),
              ...(this.displayFields.findIndex(
                (x) => x.itemName == "Address"
              ) != -1 && { address: res[i].address }),
              ...(this.displayFields.findIndex((x) => x.itemName == "Phone") !=
                -1 && { phonenumbers: res[i].phonenumbers }),
              ...(this.displayFields.findIndex((x) => x.itemName == "Family") !=
                -1 && {
                family:
                  fr != "" || frl != "" ? ` בן : ${fr}   חתן : ${frl}` : "",
              }),
              ...(this.displayFields.findIndex(
                (x) => x.itemName == "Full Name"
              ) != -1 && { fullName: res[i].fullName }),
              ...(this.displayFields.findIndex((x) => x.itemName == "Email") !=
                -1 && { email: res[i].emails }),
              ...(this.displayFields.findIndex((x) => x.itemName == "Group") !=
                -1 && { group: res[i].group }),
              ...(this.displayFields.findIndex((x) => x.itemName == "Class") !=
                -1 && { class: res[i].class }),
              ...(this.displayFields.findIndex(
                (x) => x.itemName == "City State Zip"
              ) != -1 && { cityStateZip: res[i].cityStateZip }),
              ...(this.displayFields.findIndex((x) => x.itemName == "Note") !=
                -1 && { note: res[i].note }),
              ...(this.displayFields.findIndex((x) => x.itemName == "Father") !=
                -1 && { father: res[i].father }),
              ...(this.displayFields.findIndex(
                (x) => x.itemName == "Father in law"
              ) != -1 && { fatherinlaw: res[i].fatherInLaw }),
              ...(this.displayFields.findIndex(
                (x) => x.itemName == "Location"
              ) != -1 && { location: res[i].locationNames }),
              ...(this.displayFields.findIndex((x) => x.itemName == "Status") !=
                -1 && { status: res[i].donorStatus }),
              ...this.GetLabelField(
                this.displayFields.filter((x) => x.itemName.includes(">")),
                res[i]
              ),
              ...this.GetDynamicAdvanceField(
                this.displayFields,
                mainAdvanceFieldAry
              ),
              ...this.GetTagField(
                this.displayFields.filter((x) => x.category.includes("Tags")),
                res[i]
              ),
            });

            res[i].fieldArray = [];
            this.displayFields.forEach((element) => {
              if (element.itemName == "Acct #") {
                res[i].accountNum =
                  res[i].accountNum != null ? res[i].accountNum : "";
                res[i].fieldArray.push(res[i].accountNum + ",");
              }
              if (element.itemName == "Full Name Jewish") {
                res[i].fullNameJewish =
                  res[i].fullNameJewish != null ? res[i].fullNameJewish : "";
                res[i].fieldArray.push(res[i].fullNameJewish + ",");
              }
              if (element.itemName == "Address") {
                res[i].fieldArray.push(
                  res[i].address + "," + res[i].cityStateZip
                );
              }
              if (element.itemName == "Phone") {
                res[i].phonenumbers =
                  res[i].phonenumbers != null ? res[i].phonenumbers : "";
                res[i].fieldArray.push(res[i].phonenumbers + ",");
              }
              if (element.itemName.includes(">")) {
                let resultVal = "";
                let itemName = element.itemName
                  ? element.itemName.split(">")
                  : "";
                let labelType = itemName ? itemName[0].toString().trim() : "";
                let labelName = element.labelName
                  ? element.labelName.toString().trim()
                  : "";
                labelName = labelName.toLowerCase();
                if (labelType.toLowerCase() == "phone") {
                  let additionalPhoneLabels = res[i].additionalPhoneLabels
                    ? res[i].additionalPhoneLabels.split(",")
                    : "";
                  let additionalPhoneNumbers = res[i].additionalPhoneNumbers
                    ? res[i].additionalPhoneNumbers.split(",")
                    : "";
                  if (additionalPhoneLabels && additionalPhoneNumbers) {
                    additionalPhoneLabels = additionalPhoneLabels.map((s) =>
                      s.trim()
                    );
                    additionalPhoneNumbers = additionalPhoneNumbers.map((s) =>
                      s.trim()
                    );
                    additionalPhoneLabels = additionalPhoneLabels.map((s) =>
                      s.toLowerCase()
                    );
                    let index = additionalPhoneLabels.indexOf(labelName);
                    if (typeof additionalPhoneNumbers[index] == undefined) {
                      resultVal = "";
                    } else {
                      resultVal = additionalPhoneNumbers[index]
                        ? additionalPhoneNumbers[index]
                        : "";
                    }
                  }
                }
                if (labelType.toLowerCase() == "email") {
                  let emailLabels = res[i].emailLabels
                    ? res[i].emailLabels.split(",")
                    : "";
                  let emails = res[i].emails ? res[i].emails.split(",") : "";
                  if (emailLabels && emails) {
                    emailLabels = emailLabels.map((s) => s.trim());
                    emails = emails.map((s) => s.trim());
                    emailLabels = emailLabels.map((s) => s.toLowerCase());
                    let index = emailLabels.indexOf(labelName);
                    if (typeof emails[index] == undefined) {
                      resultVal = "";
                    } else {
                      resultVal = emails[index] ? emails[index] : "";
                    }
                  }
                }
                if (labelType.toLowerCase() == "address") {
                  let accountAddressLabels = res[i].accountAddressLabels
                    ? res[i].accountAddressLabels.split(";")
                    : "";
                  let accountAddresses = res[i].accountAddresses
                    ? res[i].accountAddresses.split(";")
                    : "";
                  if (accountAddressLabels && accountAddresses) {
                    accountAddressLabels = accountAddressLabels.map((s) =>
                      s.trim()
                    );
                    accountAddresses = accountAddresses.map((s) =>
                      s.replaceAll(",", "")
                    );
                    accountAddressLabels = accountAddressLabels.map((s) =>
                      s.toLowerCase()
                    );
                    let index = accountAddressLabels.indexOf(labelName);
                    if (typeof accountAddresses[index] == undefined) {
                      resultVal = "";
                    } else {
                      resultVal = accountAddresses[index]
                        ? accountAddresses[index]
                        : "";
                    }
                  }
                }
                res[i].fieldArray.push(resultVal + ",");
              }
              if (element.itemName == "Family") {
                this.oneline = false;
                res[i].fatherInLaw =
                  res[i].fatherInLaw != null ? res[i].fatherInLaw : "";
                res[i].father = res[i].father != null ? res[i].father : "";
                res[i].fieldArray.push(
                  res[i].father + ":" + res[i].fatherInLaw
                );
              }
              if (element.itemName == "Full Name") {
                res[i].fieldArray.push(
                  res[i].fullName + "," + res[i].fullNameJewish
                );
              }
              if (element.itemName == "Email") {
                res[i].emails = res[i].emails != null ? res[i].emails : "";
                res[i].fieldArray.push(res[i].emails + ",");
              }
              if (element.itemName == "Group") {
                res[i].fieldArray.push(res[i].group + ",");
              }
              if (element.itemName == "Class") {
                res[i].fieldArray.push(res[i].class + ",");
              }
              if (element.itemName == "City State Zip") {
                res[i].fieldArray.push(res[i].cityStateZip + ",");
              }
              if (element.itemName == "Note") {
                res[i].fieldArray.push(res[i].note + ",");
              }
              if (element.itemName == "Father") {
                res[i].fatherInLaw =
                  res[i].fatherInLaw != null ? res[i].fatherInLaw : "";
                res[i].father = res[i].father != null ? res[i].father : "";
                res[i].fieldArray.push(
                  res[i].father + "," + res[i].fatherInLaw
                );
              }
              if (element.itemName == "Father in law") {
                res[i].fieldArray.push(res[i].fatherInLaw);
              }
              if (element.itemName == "Location") {
                res[i].fieldArray.push(res[i].locationNames);
              }
              if (element.itemName == "Status") {
                res[i].fieldArray.push(res[i].donorStatus);
              }
              if (
                this.advanceFieldList.find((x) => x.colName == element.itemName)
              ) {
                if (
                  mainAdvanceFieldAry.find((x) => x.key == element.itemName)
                ) {
                  var result = mainAdvanceFieldAry.find(
                    (x) => x.key == element.itemName
                  );
                  res[i].fieldArray.push(result.value);
                } else {
                  res[i].fieldArray.push("");
                }
              }
              // res[i].fieldArray.push(this.addToFieldArray(this.displayFields,mainAdvanceFieldAry))
            });
          }

          this.commonMethodService.sendDonorListArray(this.donorlist);
          this.gridData = res;
          this.gridFilterData = this.gridData;
          this.gridCount = this.gridData;
          this.searchgridCount = this.gridData;
          this.hasDonor = true;
          this.commonMethodService.sendLineHeight(this.oneline); //added new
          this.commonMethodService.sendColumCls(this.displayFields.length); //added new
          if (this.displayFields.length > 7) {
            this.commonMethodService.sendTreeLineHeight(true); //added new
          } else {
            this.commonMethodService.sendTreeLineHeight(false); //added new
          }
          this.Sort(this.sortType);
          //this.dfields=[];
          ///this.isloading = false;
        } else {
          this.totalRecord = 0;
          this.gridData = [];
          this.gridFilterData = this.gridData;
          this.gridCount = this.gridData;
          this.searchgridCount = this.gridData;
          this.hasDonor = false;
          Swal.fire({
            title: "No records found",
            text: "Please create a new query",
            icon: "error",
            confirmButtonText: this.commonMethodService.getTranslate(
              "WARNING_SWAL.BUTTON.CONFIRM.OK"
            ),
            customClass: {
              confirmButton: "btn_ok",
            },
          });
          this.isloading = false;
        }
      },
      (error) => {
        this.isloading = false;
        console.log(error);
      }
    );
  }
  GetLabelField(displayFieldAry, res) {
    let obj = {};
    displayFieldAry.forEach((element) => {
      if (element.itemName.includes(">")) {
        let resultVal = "";
        let itemName = element.itemName ? element.itemName.split(">") : "";
        let labelType = itemName ? itemName[0].toString().trim() : "";
        let labelName = element.labelName
          ? element.labelName.toString().trim()
          : "";
        labelName = labelName.toLowerCase();
        if (labelType.toLowerCase() == "phone") {
          let additionalPhoneLabels = res.additionalPhoneLabels
            ? res.additionalPhoneLabels.split(",")
            : "";
          let additionalPhoneNumbers = res.additionalPhoneNumbers
            ? res.additionalPhoneNumbers.split(",")
            : "";
          if (additionalPhoneLabels && additionalPhoneNumbers) {
            additionalPhoneLabels = additionalPhoneLabels.map((s) => s.trim());
            additionalPhoneNumbers = additionalPhoneNumbers.map((s) =>
              s.trim()
            );
            additionalPhoneLabels = additionalPhoneLabels.map((s) =>
              s.toLowerCase()
            );
            let index = additionalPhoneLabels.indexOf(labelName);
            if (typeof additionalPhoneNumbers[index] == undefined) {
              resultVal = "";
            } else {
              resultVal = additionalPhoneNumbers[index]
                ? additionalPhoneNumbers[index]
                : "";
            }
          }
        }
        if (labelType.toLowerCase() == "email") {
          let emailLabels = res.emailLabels ? res.emailLabels.split(",") : "";
          let emails = res.emails ? res.emails.split(",") : "";
          if (emailLabels && emails) {
            emailLabels = emailLabels.map((s) => s.trim());
            emails = emails.map((s) => s.trim());
            emailLabels = emailLabels.map((s) => s.toLowerCase());
            let index = emailLabels.indexOf(labelName);
            if (typeof emails[index] == undefined) {
              resultVal = "";
            } else {
              resultVal = emails[index] ? emails[index] : "";
            }
          }
        }
        if (labelType.toLowerCase() == "address") {
          let accountAddressLabels = res.accountAddressLabels
            ? res.accountAddressLabels.split(";")
            : "";
          let accountAddresses = res.accountAddresses
            ? res.accountAddresses.split(";")
            : "";
          if (accountAddressLabels && accountAddresses) {
            accountAddressLabels = accountAddressLabels.map((s) => s.trim());
            accountAddresses = accountAddresses.map((s) =>
              s.replaceAll(",", "")
            );
            accountAddressLabels = accountAddressLabels.map((s) =>
              s.toLowerCase()
            );
            let index = accountAddressLabels.indexOf(labelName);
            if (typeof accountAddresses[index] == undefined) {
              resultVal = "";
            } else {
              resultVal = accountAddresses[index]
                ? accountAddresses[index]
                : "";
            }
          }
        }
        obj[element.itemName] = resultVal;
        return obj;
      }
    });
    return obj;
  }
  GetDynamicAdvanceField(displayFieldAry, AdvanceAry) {
    let obj = {};
    for (let index = 0; index < this.advanceFieldList.length; index++) {
      const element = this.advanceFieldList[index];
      const dd = displayFieldAry.find(
        (x) => x.itemName.trim() == element.colName
      );
      if (dd) {
        const hh = AdvanceAry.find((x) => x.key.trim() == element.colName);
        if (hh) {
          obj[hh.key] = hh.value;
        } else {
          obj[element.colName] = "";
        }
      }
    }
    return obj;
  }

  GetTagField(displayFieldAry, res) {
    let obj = {};
    displayFieldAry.forEach((element) => {
      obj[element.itemName] =
        res.tagNames && res.tagNames.includes(element.itemName) ? "YES" : "NO";
      return obj;
    });
    return obj;
  }

  searchReasonData() {
    $("#main_table").show();
    this.isloading = true;
    var objReason = {
      eventGuid: this.localstoragedataService.getLoginUserEventGuId(),
      reasonName: this.objAdvancedSearch && this.objAdvancedSearch.reasonName,
      reasonNum: this.objAdvancedSearch && this.objAdvancedSearch.reasonNum,
      minGoal: this.objAdvancedSearch && this.objAdvancedSearch.minGoal,
      maxGoal: this.objAdvancedSearch && this.objAdvancedSearch.maxGoal,
      minPercentage:
        this.objAdvancedSearch && this.objAdvancedSearch.minPercentage,
      maxPercentage:
        this.objAdvancedSearch && this.objAdvancedSearch.maxPercentage,
      email: this.objAdvancedSearch && this.objAdvancedSearch.email,
      homePhone: this.objAdvancedSearch && this.objAdvancedSearch.homePhone,
      cell: this.objAdvancedSearch && this.objAdvancedSearch.cell,
    };
    this.reasonService.getReasonList(objReason).subscribe(
      (res: any) => {
        // hide loader
        this.isFiltered = false;
        if (res) {
          this.totalRecord = res.length;
          this.donorlist = res;
          if (this.mainArray.length > 0) {
            this.mainArray = [];
          }
          for (var i = 0; i < res.length; i++) {
            this.mainArray.push({
              accountId: res[i].reasonId,
              ...(this.displayFields.findIndex(
                (x) => x.itemName == "Reason Name"
              ) != -1 && { reasonName: res[i].reasonName }),
              ...(this.displayFields.findIndex(
                (x) => x.itemName == "Reason #"
              ) != -1 && { urlTag: res[i].urlTag }),
              ...(this.displayFields.findIndex((x) => x.itemName == "Goal") !=
                -1 && { goal: res[i].goal }),
              ...(this.displayFields.findIndex(
                (x) => x.itemName == "Percentage"
              ) != -1 && { percentage: res[i].percentage }),
              ...(this.displayFields.findIndex(
                (x) => x.itemName == "Full Name"
              ) != -1 && { fullName: res[i].fullName }),
              ...(this.displayFields.findIndex((x) => x.itemName == "Email") !=
                -1 && { email: res[i].email }),
              ...(this.displayFields.findIndex(
                (x) => x.itemName == "Home Phone"
              ) != -1 && { phone1: res[i].phone1 }),
              ...(this.displayFields.findIndex((x) => x.itemName == "Cell") !=
                -1 && { phone2: res[i].phone2 }),
            });
            res[i].fieldArray = [];
            res[i].accountId = res[i].reasonId;
            this.displayFields.forEach((element) => {
              if (element.itemName == "Reason Name") {
                res[i].fieldArray.push(res[i].reasonName + ",");
              }
              if (element.itemName == "Reason #") {
                res[i].fieldArray.push(res[i].urlTag + ",");
              }
              if (element.itemName == "Goal") {
                res[i].fieldArray.push(res[i].goal + ",");
              }
              if (element.itemName == "Percentage") {
                res[i].fieldArray.push(res[i].percentage + ",");
              }
              if (element.itemName == "Email") {
                res[i].fieldArray.push(res[i].email + ",");
              }
              if (element.itemName == "Home Phone") {
                res[i].fieldArray.push(res[i].phone1 + ",");
              }
              if (element.itemName == "Cell") {
                res[i].fieldArray.push(res[i].phone2 + ",");
              }
            });
          }
          if (!this.isGenerate) {
            this.commonMethodService.sendDonorListArray(this.donorlist);
          }
          for (var i = 0; i < res.length; i++) {
            res[i].phone1 = this.formatPhoneNumber(res[i].phone1);
            res[i].phone2 = this.formatPhoneNumber(res[i].phone2);
          }
          this.totalRecord = res.length;
          this.gridData = res;
          this.gridFilterData = this.gridData;
          this.gridCount = this.gridData;
          this.searchgridCount = this.gridData;
          this.hasDonor = true;
          this.Sort(this.sortType);
        } else {
          this.totalRecord = 0;
          this.gridData = [];
          this.gridFilterData = this.gridData;
          this.gridCount = this.gridData;
          this.searchgridCount = this.gridData;
          this.hasDonor = false;
          Swal.fire({
            title: "No records found",
            text: "Please create a new query",
            icon: "error",
            confirmButtonText: this.commonMethodService.getTranslate(
              "WARNING_SWAL.BUTTON.CONFIRM.OK"
            ),
            customClass: {
              confirmButton: "btn_ok",
            },
          });
          this.isloading = false;
        }
      },
      (error) => {
        this.isloading = false;
        console.log(error);
      }
    );
  }

  searchLocationData() {
    $("#main_table").show();
    this.isloading = true;
    var objLocation = {
      eventGuid: this.localstoragedataService.getLoginUserEventGuId(),
      isAll: false,
      locationName: this.objAdvancedSearch.locationName,
      nusach: this.objAdvancedSearch.nusach,
      rabbi: this.objAdvancedSearch.rabbi,
      phone: this.objAdvancedSearch.phone,
      shortName: this.objAdvancedSearch.shortName,
      typeId: this.objAdvancedSearch.typeId,
    };
    this.locationService.getLocationList(objLocation).subscribe(
      (res: any) => {
        // hide loader
        this.isFiltered = false;
        if (res) {
          this.totalRecord = res.length;
          this.donorlist = res;
          if (this.mainArray.length > 0) {
            this.mainArray = [];
          }
          for (var i = 0; i < res.length; i++) {
            this.mainArray.push({
              accountId: res[i].locationID,
              ...(this.displayFields.findIndex(
                (x) => x.itemName == "Location"
              ) != -1 && { locationName: res[i].locationName }),
              ...(this.displayFields.findIndex((x) => x.itemName == "Nusach") !=
                -1 && { nusach: res[i].nusach }),
              ...(this.displayFields.findIndex(
                (x) => x.itemName == "Address"
              ) != -1 && { address: res[i].address }),
              ...(this.displayFields.findIndex((x) => x.itemName == "Rabbi") !=
                -1 && { rabbi: res[i].rabbi }),
              ...(this.displayFields.findIndex((x) => x.itemName == "Phone") !=
                -1 && { phone: res[i].phone }),
              ...(this.displayFields.findIndex(
                (x) => x.itemName == "Short Name"
              ) != -1 && { locationNameShort: res[i].locationNameShort }),
              ...(this.displayFields.findIndex((x) => x.itemName == "Type") !=
                -1 && { locationType: res[i].locationType }),
            });

            res[i].fieldArray = [];
            res[i].accountId = res[i].locationID;
            this.displayFields.forEach((element) => {
              if (element.itemName == "Location") {
                res[i].fieldArray.push(res[i].locationName);
              }
              if (element.itemName == "Nusach") {
                res[i].fieldArray.push(res[i].nusach);
              }
              if (element.itemName == "Address") {
                res[i].fieldArray.push(res[i].address);
              }
              if (element.itemName == "Rabbi") {
                res[i].fieldArray.push(res[i].rabbi);
              }
              if (element.itemName == "Phone") {
                res[i].fieldArray.push(res[i].phone);
              }
              if (element.itemName == "Short Name") {
                res[i].fieldArray.push(res[i].locationNameShort);
              }
              if (element.itemName == "Type") {
                res[i].fieldArray.push(res[i].locationType);
              }
            });
          }
          if (!this.isGenerate) {
            this.commonMethodService.sendDonorListArray(this.donorlist);
          }

          for (var i = 0; i < res.length; i++) {
            res[i].phone = this.formatPhoneNumber(res[i].phone);
          }
          this.totalRecord = res.length;
          this.gridData = res;
          this.gridFilterData = this.gridData;
          this.gridCount = this.gridData;
          this.searchgridCount = this.gridData;
          this.hasDonor = true;
          this.Sort(this.sortType);
          this.isloading = false;
        } else {
          this.totalRecord = 0;
          this.gridData = [];
          this.gridFilterData = this.gridData;
          this.gridCount = this.gridData;
          this.searchgridCount = this.gridData;
          this.hasDonor = false;
          Swal.fire({
            title: "No records found",
            text: "Please create a new query",
            icon: "error",
            confirmButtonText: this.commonMethodService.getTranslate(
              "WARNING_SWAL.BUTTON.CONFIRM.OK"
            ),
            customClass: {
              confirmButton: "btn_ok",
            },
          });
          this.isloading = false;
        }

        this.isloading = false;
      },
      (error) => {
        this.isloading = false;
        console.log(error);
      }
    );
  }

  searchCollectorData() {
    $("#main_table").show();
    var objsearchCollector = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),

      accountNo: this.objAdvancedSearch && this.objAdvancedSearch.accountNo,
      fullNameJewish:
        this.objAdvancedSearch && this.objAdvancedSearch.fullNameJewish,
      fullName: this.objAdvancedSearch && this.objAdvancedSearch.fullName,
      city: this.objAdvancedSearch && this.objAdvancedSearch.city,
      state: this.objAdvancedSearch && this.objAdvancedSearch.state,
      zip: this.objAdvancedSearch && this.objAdvancedSearch.zip,
      defaultLocations:
        this.objAdvancedSearch.defaultLocation &&
        this.objAdvancedSearch.defaultLocation.length > 0
          ? parseInt(this.objAdvancedSearch.defaultLocation.map((s) => s.id))
          : null,
      group: this.objAdvancedSearch && this.objAdvancedSearch.group,
      class: this.objAdvancedSearch && this.objAdvancedSearch.class,
      address: this.objAdvancedSearch && this.objAdvancedSearch.address,
      phone: this.objAdvancedSearch && this.objAdvancedSearch.phone,
      email: this.objAdvancedSearch && this.objAdvancedSearch.email,
      father: this.objAdvancedSearch && this.objAdvancedSearch.father,
      fatherInLaw: this.objAdvancedSearch && this.objAdvancedSearch.fatherInLaw,
      status: this.objAdvancedSearch && this.objAdvancedSearch.status,
    };
    this.collectorService.getCollectorList(objsearchCollector).subscribe(
      (res: any) => {
        // hide loader

        this.isFiltered = false;
        if (res) {
          this.totalRecord = res.length;
          this.donorlist = res;
          if (this.mainArray.length > 0) {
            this.mainArray = [];
          }
          for (var i = 0; i < res.length; i++) {
            this.mainArray.push({
              accountId: res[i].collectorId,
              ...(this.displayFields.findIndex((x) => x.itemName == "Acct #") !=
                -1 && { accountNum: res[i].accountNum }),
              ...(this.displayFields.findIndex(
                (x) => x.itemName == "Address"
              ) != -1 && { address: res[i].address }),
              ...(this.displayFields.findIndex(
                (x) => x.itemName == "Phone/Email"
              ) != -1 && { email: res[i].emails }),
              ...(this.displayFields.findIndex(
                (x) => x.itemName == "Phone/Email"
              ) != -1 && { phonenumbers: res[i].phonenumbers }),
              ...(this.displayFields.findIndex(
                (x) => x.itemName == "Full Name"
              ) != -1 && { fullName: res[i].fullName }),
              ...(this.displayFields.findIndex((x) => x.itemName == "Group") !=
                -1 && { group: res[i].group }),
              ...(this.displayFields.findIndex((x) => x.itemName == "Class") !=
                -1 && { class: res[i].class }),
              ...(this.displayFields.findIndex((x) => x.itemName == "Status") !=
                -1 && { status: res[i].status }),
            });
            res[i].fieldArray = [];
            res[i].accountId = res[i].collectorId;
            this.displayFields.forEach((element) => {
              if (element.itemName == "Acct #") {
                res[i].fieldArray.push(res[i].accountNum);
              }
              if (element.itemName == "Full Name") {
                res[i].fieldArray.push(res[i].fullName);
              }
              if (element.itemName == "Address") {
                res[i].fieldArray.push(res[i].address);
              }
              if (element.itemName == "Group") {
                res[i].fieldArray.push(res[i].group);
              }
              if (element.itemName == "Class") {
                res[i].fieldArray.push(res[i].class);
              }
              if (element.itemName == "Phone/Email") {
                res[i].fieldArray.push(res[i].emails);
              }
              if (element.itemName == "Status") {
                res[i].fieldArray.push(res[i].status);
              }
            });
          }
          if (!this.isGenerate) {
            this.commonMethodService.sendDonorListArray(this.donorlist);
          }

          this.totalRecord = res.length;
          this.gridData = res;
          this.gridFilterData = this.gridData;
          this.gridCount = this.gridData;
          this.searchgridCount = this.gridData;
          this.hasDonor = true;
          this.Sort(this.sortType);
          this.isloading = false;
        } else {
          this.totalRecord = 0;
          this.gridData = [];
          this.gridFilterData = this.gridData;
          this.gridCount = this.gridData;
          this.searchgridCount = this.gridData;
          this.hasDonor = false;
          Swal.fire({
            title: "No records found",
            text: "Please create a new query",
            icon: "error",
            confirmButtonText: this.commonMethodService.getTranslate(
              "WARNING_SWAL.BUTTON.CONFIRM.OK"
            ),
            customClass: {
              confirmButton: "btn_ok",
            },
          });
          this.isloading = false;
        }
        this.isloading = false;
      },
      (error) => {
        this.isloading = false;
        console.log(error);
        // this.notificationService.showError(error.error, "Error while fetching data !!");
      }
    );
  }

  searchCampaignData() {
    $("#main_table").show();
    this.isloading = true;
    var objLocation = {
      eventGuid: this.localstoragedataService.getLoginUserEventGuId(),
      campaignName: this.objAdvancedSearch.campaignName,
      friendlyName: this.objAdvancedSearch.friendlyName,
    };
    this.reportQueryService.getCampaignList(objLocation).subscribe(
      (res: any) => {
        // hide loader
        this.isFiltered = false;
        if (res) {
          this.totalRecord = res.length;
          this.donorlist = res;
          if (this.mainArray.length > 0) {
            this.mainArray = [];
          }
          for (var i = 0; i < res.length; i++) {
            this.mainArray.push({
              accountId: res[i].campaignId,
              ...(this.displayFields.findIndex(
                (x) => x.itemName == "Campaign Name"
              ) != -1 && { campaignName: res[i].campaignName }),
              ...(this.displayFields.findIndex(
                (x) => x.itemName == "Friendly Name"
              ) != -1 && { friendlyName: res[i].friendlyName }),
            });

            res[i].fieldArray = [];
            res[i].accountId = res[i].campaignId;
            this.displayFields.forEach((element) => {
              if (element.itemName == "Campaign Name") {
                res[i].fieldArray.push(res[i].campaignName);
              }
              if (element.itemName == "Friendly Name") {
                res[i].fieldArray.push(res[i].friendlyName);
              }
            });
          }
          if (!this.isGenerate) {
            this.commonMethodService.sendDonorListArray(this.donorlist);
          }

          for (var i = 0; i < res.length; i++) {
            res[i].phone = this.formatPhoneNumber(res[i].phone);
          }
          this.totalRecord = res.length;
          this.gridData = res;
          this.gridFilterData = this.gridData;
          this.gridCount = this.gridData;
          this.searchgridCount = this.gridData;
          this.hasDonor = true;
          this.Sort(this.sortType);
          this.isloading = false;
        } else {
          this.totalRecord = 0;
          this.gridData = [];
          this.gridFilterData = this.gridData;
          this.gridCount = this.gridData;
          this.searchgridCount = this.gridData;
          this.hasDonor = false;
          Swal.fire({
            title: "No records found",
            text: "Please create a new query",
            icon: "error",
            confirmButtonText: this.commonMethodService.getTranslate(
              "WARNING_SWAL.BUTTON.CONFIRM.OK"
            ),
            customClass: {
              confirmButton: "btn_ok",
            },
          });
          this.isloading = false;
        }

        this.isloading = false;
      },
      (error) => {
        this.isloading = false;
        console.log(error);
        // this.notificationService.showError(error.error, "Error while fetching data !!");
      }
    );
  }

  searchSourceData() {
    $("#main_table").show();
    this.isloading = true;
    var objSource = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      loginUserId: this.localstoragedataService.getLoginUserId(),
      isOrganizationAllDevices: true,
      deviceReportQueryInputs: {
        eventName: this.objAdvancedSearch.eventName,
        product: this.objAdvancedSearch.product,
        device: this.objAdvancedSearch.device,
        activationCode: this.objAdvancedSearch.activationCode,
        macAddress: this.objAdvancedSearch.macAddress,
        plan: this.objAdvancedSearch.plan,
        status: this.objAdvancedSearch.status,
        notes: this.objAdvancedSearch.notes,
        deviceNum: this.objAdvancedSearch.deviceNum,
        simNum: this.objAdvancedSearch.simNum,
        collector: this.objAdvancedSearch.collector,
        campaign: this.objAdvancedSearch.campaign,
        reason: this.objAdvancedSearch.reason,
        location: this.objAdvancedSearch.location,
      },
    };
    this.sourceService.getSourceList(objSource).subscribe(
      (res: any) => {
        // hide loader
        this.isFiltered = false;
        if (res) {
          res = res.filter((x) => x.deviceId != null);
          this.totalRecord = res.length;
          this.donorlist = res;
          if (this.mainArray.length > 0) {
            this.mainArray = [];
          }
          for (var i = 0; i < res.length; i++) {
            this.mainArray.push({
              accountId: res[i].deviceId,
              ...(this.displayFields.findIndex((x) => x.itemName == "Event") !=
                -1 && { eventName: res[i].eventName }),
              ...(this.displayFields.findIndex(
                (x) => x.itemName == "Product"
              ) != -1 && { productName: res[i].productName }),
              ...(this.displayFields.findIndex((x) => x.itemName == "Device") !=
                -1 && { deviceName: res[i].deviceName }),
              ...(this.displayFields.findIndex(
                (x) => x.itemName == "Activation Code"
              ) != -1 && { activationCode: res[i].activationCode }),
              ...(this.displayFields.findIndex(
                (x) => x.itemName == "Mac Address"
              ) != -1 && { macAddress: res[i].macAddress }),
              ...(this.displayFields.findIndex((x) => x.itemName == "Plan") !=
                -1 && { plan: res[i].plan }),
              ...(this.displayFields.findIndex((x) => x.itemName == "Status") !=
                -1 && { status: res[i].status }),
              ...(this.displayFields.findIndex((x) => x.itemName == "Notes") !=
                -1 && { notes: res[i].notes }),
              ...(this.displayFields.findIndex(
                (x) => x.itemName == "Device #"
              ) != -1 && { deviceId: res[i].deviceId }),
              ...(this.displayFields.findIndex((x) => x.itemName == "Sim #") !=
                -1 && { simNum: res[i].simNum }),
              ...(this.displayFields.findIndex(
                (x) => x.itemName == "Collector"
              ) != -1 && { collectorName: res[i].collectorName }),
              ...(this.displayFields.findIndex(
                (x) => x.itemName == "Campaign"
              ) != -1 && { campaignName: res[i].campaignName }),
              ...(this.displayFields.findIndex((x) => x.itemName == "Reason") !=
                -1 && { reasonName: res[i].reasonName }),
              ...(this.displayFields.findIndex(
                (x) => x.itemName == "Location"
              ) != -1 && { locationName: res[i].locationName }),
            });
            res[i].status = res[i].donorStatus;
            res[i].locationName = res[i].locationNames;
            res[i].fieldArray = [];
            res[i].accountId = res[i].deviceId;
            this.displayFields.forEach((element) => {
              if (element.itemName == "Event") {
                res[i].fieldArray.push(res[i].eventName);
              }
              if (element.itemName == "Product") {
                res[i].fieldArray.push(res[i].productName);
              }
              if (element.itemName == "Device") {
                res[i].fieldArray.push(res[i].deviceName);
              }
              if (element.itemName == "Activation Code") {
                res[i].fieldArray.push(res[i].activationCode);
              }
              if (element.itemName == "Mac Address") {
                res[i].fieldArray.push(res[i].macAddress);
              }
              if (element.itemName == "Plan") {
                res[i].fieldArray.push(res[i].plan);
              }
              if (element.itemName == "Status") {
                res[i].fieldArray.push(res[i].status);
              }
              if (element.itemName == "Notes") {
                res[i].fieldArray.push(res[i].notes);
              }
              if (element.itemName == "Device #") {
                res[i].fieldArray.push(res[i].deviceId);
              }
              if (element.itemName == "Sim #") {
                res[i].fieldArray.push(res[i].simNum);
              }
              if (element.itemName == "Collector") {
                res[i].fieldArray.push(res[i].collectorName);
              }
              if (element.itemName == "Campaign") {
                res[i].fieldArray.push(res[i].campaignName);
              }
              if (element.itemName == "Reason") {
                res[i].fieldArray.push(res[i].reasonName);
              }
              if (element.itemName == "Location") {
                res[i].fieldArray.push(res[i].locationName);
              }
            });
          }
          if (!this.isGenerate) {
            this.commonMethodService.sendDonorListArray(this.donorlist);
          }

          for (var i = 0; i < res.length; i++) {
            res[i].phone = this.formatPhoneNumber(res[i].phone);
          }
          this.totalRecord = res.length;
          this.gridData = res;
          this.gridFilterData = this.gridData;
          this.gridCount = this.gridData;
          this.searchgridCount = this.gridData;
          this.hasDonor = true;
          this.Sort(this.sortType);
          this.isloading = false;
        } else {
          this.totalRecord = 0;
          this.gridData = [];
          this.gridFilterData = this.gridData;
          this.gridCount = this.gridData;
          this.searchgridCount = this.gridData;
          this.hasDonor = false;
          Swal.fire({
            title: "No records found",
            text: "Please create a new query",
            icon: "error",
            confirmButtonText: this.commonMethodService.getTranslate(
              "WARNING_SWAL.BUTTON.CONFIRM.OK"
            ),
            customClass: {
              confirmButton: "btn_ok",
            },
          });
          this.isloading = false;
        }

        this.isloading = false;
      },
      (error) => {
        this.isloading = false;
        console.log(error);
      }
    );
  }

  formatPhoneNumber(phoneNumberString) {
    var cleaned = ("" + phoneNumberString).replace(/\D/g, "");
    var match = cleaned.match(/^(\d{3})(\d{3})(\d{1,5})$/);
    if (match) {
      return "(" + match[1] + ") " + match[2] + "-" + match[3];
    }
    return "";
  }
  checkIsColumnIsNotTotalOrPledge(item, keyName, id) {
    return (
      item &&
      item.hasOwnProperty(keyName) &&
      this.columnList.find((x) => x.id == id) != undefined
    );
  }

  DownloadExcel() {
    this.isloading = true;
    let results = this.mainArray.length && this.mainArray;
    let data = [];
    if (results) {
      Object.values(results).forEach((item: any) => {
        let row = {};
        if (this.baseColumn == "Donor") {
          var test = Object.keys(item);
          test.forEach((element) => {
            if (this.displayFields.findIndex((x) => x.itemName == element)) {
              if (
                element != "accountId" &&
                element != "Column1" &&
                element != "Column2" &&
                element != "Column3" &&
                element != "Column4" &&
                element != "Column5" &&
                element != "Column6" &&
                element != "Column7" &&
                element != "Column8" &&
                element != "Column9" &&
                element != "Column10" &&
                element != "Column11" &&
                element != "Column12" &&
                element != "Column13" &&
                element != "Column14" &&
                element != "Column15" &&
                element != "Column16" &&
                element != "Column17" &&
                element != "Column18" &&
                element != "Column19" &&
                element != "Column20" &&
                element != element + "Total" &&
                element != "Payments" &&
                element != "Pledges" &&
                element != "Schedules"
              )
                row[element] = Object(item)[element];
            }
          });
        }
        if (this.columnList.length > 0) {
          for (let i = 1; i <= 20; i++) {
            const columnName = `Column${i}`;

            if (this.checkIsColumnIsNotTotalOrPledge(item, columnName, i)) {
              row[this.columnList.find((x) => x.id == i).name] =
                item.toString() && item[columnName].toString();
            }
          }
        }
        if (
          (item.Column1 > 0 && item.Column1 != undefined) ||
          (item.Column2 > 0 && item.Column2 != undefined) ||
          (item.Column3 > 0 && item.Column3 != undefined) ||
          (item.Column4 > 0 && item.Column4 != undefined) ||
          (item.Column5 > 0 && item.Column5 != undefined) ||
          (item.Column6 > 0 && item.Column6 != undefined) ||
          (item.Column7 > 0 && item.Column7 != undefined) ||
          (item.Column8 > 0 && item.Column8 != undefined) ||
          (item.Column9 > 0 && item.Column9 != undefined) ||
          (item.Column10 > 0 && item.Column10 != undefined) ||
          (item.Column11 > 0 && item.Column11 != undefined) ||
          (item.Column12 > 0 && item.Column12 != undefined) ||
          (item.Column13 > 0 && item.Column13 != undefined) ||
          (item.Column14 > 0 && item.Column14 != undefined) ||
          (item.Column15 > 0 && item.Column15 != undefined) ||
          (item.Column16 > 0 && item.Column16 != undefined) ||
          (item.Column17 > 0 && item.Column17 != undefined) ||
          (item.Column18 > 0 && item.Column18 != undefined) ||
          (item.Column19 > 0 && item.Column19 != undefined) ||
          (item.Column20 > 0 && item.Column20 != undefined)
        ) {
          data.push(row);
        } else {
          if (
            this.displayFields.length > 0 &&
            item.Column1 === undefined &&
            item.Column2 === undefined &&
            item.Column3 === undefined &&
            item.Column4 === undefined &&
            item.Column2 === undefined &&
            item.Column5 === undefined &&
            item.Column6 === undefined &&
            item.Column7 === undefined &&
            item.Column8 === undefined &&
            item.Column9 === undefined &&
            item.Column10 === undefined &&
            item.Column11 === undefined &&
            item.Column12 === undefined &&
            item.Column13 === undefined &&
            item.Column14 === undefined &&
            item.Column15 === undefined &&
            item.Column16 === undefined &&
            item.Column17 === undefined &&
            item.Column18 === undefined &&
            item.Column19 === undefined &&
            item.Column20 === undefined
          ) {
            data.push(row);
          }
        }
      });
    } else {
      return;
    }

    var testArray = [];
    var testArrayFanal = [];
    var checkArrayHeader = false;
    var tAarray = [];
    data.forEach((obj) => {
      Object.keys(obj).forEach((key) => {
        if (testArray.indexOf(key) > -1) {
        } else {
          testArray.push(key);
          testArrayFanal.push(key);
        }
      });
    });
    let invalPay1 = testArray.indexOf("Payment #1");
    if (invalPay1 > -1) {
      let invalPledge1 = testArray.indexOf("Pledge #1");
      if (invalPledge1 > -1) {
        testArray.splice(invalPay1, 1);
        testArray.splice(testArray.length - 5, 0, "Payment #1");
      } else {
        testArray.splice(invalPay1, 1);
        testArray.splice(testArray.length - 4, 0, "Payment #1");
      }
    } else {
    }
    let invalPledge1 = testArray.indexOf("Pledge #1");
    if (invalPledge1 > -1) {
      testArray.splice(invalPledge1, 1);
      testArray.splice(testArray.length - 4, 0, "Pledge #1");
    }
    let invalTpay = testArray.indexOf("Total #Payment");
    if (invalTpay > -1) {
      testArray.splice(invalTpay, 1);
      testArray.splice(testArray.length - 3, 0, "Total #Payment");
      checkArrayHeader = true;
    }
    let invalTpled = testArray.indexOf("Total #Pledges");
    if (invalTpled > -1) {
      testArray.splice(invalTpled, 1);
      testArray.splice(testArray.length - 2, 0, "Total #Pledges");
      checkArrayHeader = true;
    }
    let invalTschedule = testArray.indexOf("Total #Schedules");
    if (invalTschedule > -1) {
      testArray.splice(invalTschedule, 1);
      testArray.splice(testArray.length - 1, 0, "Total #Schedules");
      checkArrayHeader = true;
    }
    let invalTotal = testArray.indexOf("Total #1");
    if (invalTotal > -1) {
      testArray.splice(invalTotal, 1);
      testArray.splice(testArray.length - 0, 0, "Total #1");
      checkArrayHeader = true;
    }
    //

    const filename = this.xlsxService.getFilename(
      this.queryName != undefined ? this.queryName : "Report"
    );
    if (checkArrayHeader == true) {
      tAarray = testArray;
    } else {
    }
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data, {
      cellStyles: true,
    });

    var range = XLSX.utils.decode_range(worksheet["!ref"]);

    // currency column Array
    let currencyColumn = [];
    for (var R = range.s.r; R < 1; ++R) {
      for (var C = range.s.c; C <= range.e.c; ++C) {
        var cell_address = { c: C, r: R };
        var cell_ref = XLSX.utils.encode_cell(cell_address);

        if (!worksheet[cell_ref]) continue;
        if (
          worksheet[cell_ref].v &&
          worksheet[cell_ref].v.includes("Payment")
        ) {
          currencyColumn.push(C);
          continue;
        }

        if (worksheet[cell_ref].v && worksheet[cell_ref].v.includes("Pledge")) {
          currencyColumn.push(C);
          continue;
        }

        if (
          worksheet[cell_ref].v &&
          worksheet[cell_ref].v.includes("Schedules")
        ) {
          currencyColumn.push(C);
          continue;
        }

        if (worksheet[cell_ref].v && worksheet[cell_ref].v.includes("Total")) {
          currencyColumn.push(C);
          continue;
        }

        for (let i = 0; i < this.columnList.length; i++) {
          if (
            worksheet[cell_ref].v &&
            worksheet[cell_ref].v.includes(this.columnList[i].name)
          ) {
            currencyColumn.push(C);
            continue;
          }
        }
      }
    }
    let fmt = "$#,##0.00";
    let defaultCurrency = this.localstoragedataService.getLoginUserCurrency();
    if (
      defaultCurrency == null ||
      defaultCurrency == "USD" ||
      defaultCurrency == "CAD"
    ) {
      fmt = "$#,##0.00";
    } else if (defaultCurrency == "GBP") {
      fmt = '"£"#,##0.00_);\\("£"#,##0.00\\)';
    } else if (defaultCurrency == "EUR") {
      fmt = '"€"#,##0.00_);\\("€"#,##0.00\\)';
    } else if (defaultCurrency == "ILS") {
      fmt = '"₪"#,##0.00_);\\("₪"#,##0.00\\)';
    }

    for (var R = range.s.r; R <= range.e.r; ++R) {
      if (R === 0) continue;
      for (let index = 0; index < currencyColumn.length; index++) {
        let C = currencyColumn[index];
        let cell_address = { c: C, r: R };
        let cell_ref = XLSX.utils.encode_cell(cell_address);
        if (worksheet[cell_ref]) {
          worksheet[cell_ref].t = "n";
          worksheet[cell_ref].z = fmt;
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
    this.isloading = false;
  }

  getSavedQueary() {
    const eventId = this.localstoragedataService.getLoginUserEventGuId();
    //  this.isloading = true;
    this.reportQueryService.getAllQuery(eventId).subscribe(
      (res: any) => {
        this.isloading = false;
        if (res) {
          this.savedQuearyList = res;
        }
      },
      (err) => {
        this.isloading = false;
      }
    );
  }

  onSaveQueryClick() {
    this.dataSetArrays = [];
    this.commonMethodService.getDataSetArray().subscribe((items) => {
      this.dataSetArrays.push(items);

      if (items.transactionType && items.reportQueryId !== undefined) {
        this.dataSetArrays = this.dataSetArrays.filter(
          (x) => x.reportQueryId !== items.reportQueryId
        );
        this.dataSetArrays.push(items);
      }
    });

    // update column name
    for (let i = 0; i < this.dataSetArrays.length; i++) {
      const da = this.dataSetArrays[i];
      var id = i + 1;
      this.dataSetArrays[i]["startDate"] = moment(
        this.dataSetArrays[i].startDate
      ).format("YYYY-MM-DD");
      this.dataSetArrays[i]["endDate"] = moment(
        this.dataSetArrays[i].endDate
      ).format("YYYY-MM-DD");

      for (let index = 0; index < this.columnList.length; index++) {
        const element = this.columnList[index];
        if (element.id == id) {
          da.columnName = element.name;
        }
      }
    }

    const reportQueryDatasets = this.dataSetArrays.map((s) => {
      return {
        DataSetObject: JSON.stringify(s),
      };
    });

    this.isloading = true; //for issue
    const displayFields = this.displayFields;

    const queryName = this.queryName || "";

    const forms: SaveQueryParams = {
      EventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      LoginUserId: this.localstoragedataService.getLoginUserId(),
      ReportQueryId: this.reportQueryId, ///added new
      BaseColumn: this.baseColumn,
      Description: "",
      QueryName: queryName,
      DisplayFields: JSON.stringify(displayFields),
      AdditionalFields: "",
      AdvancedSearch: JSON.stringify(this.objAdvancedSearch), /////added new field
      ReportQueryDatasets: reportQueryDatasets,
    };

    this.reportQueryService.saveQuery(forms).subscribe(
      (res: any) => {
        this.isloading = false;
        if (res) {
          this.reportQueryId = res.reportQueryId;
          this.getSavedQueary();
        }
      },
      (error) => {
        this.isloading = false;
        Swal.fire({
          title: this.commonMethodService.getTranslate(
            "WARNING_SWAL.SOMETHING_WENT_WRONG"
          ),
          text: error.error,
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
  }

  onSelectSavedQuery(id: number) {
    const obj = this.savedQuearyList.find((o) => o.reportQueryId === id);
    if (!obj) {
      return;
    }

    this.isloading = true;
    this.newQueryAdded = false;
    this.isNewAfterDelete = false;
    this.queryName = obj.queryName;
    (this.baseColumn = obj.baseColumn),
      (this.displayFields = JSON.parse(obj.displayFields));
    this.objAdvancedSearch = {
      accountNo: undefined,
      class: undefined,
      email: undefined,
      father: undefined,
      fatherInLaw: undefined,
      fullName: undefined,
      fullNameJewish: undefined,
      group: undefined,
      note: undefined,
      phone: undefined,
    };

    this.pageSize = 25;
    $(".show_entryval").removeClass("active");
    $("#25").addClass("active");
    if (this.baseColumn.toLowerCase() == "Donor".toLowerCase()) {
      this.searchDonorData();
    }
  }
  countonSelectSavedQueryNew = 0;
  onSelectSavedQueryNew(id: number) {
    this.isRunLoader = true;
    this.countonSelectSavedQueryNew += 1;
    this.isSelectedSavedQuery = true;
    this.gridCount = [];
    this.searchgridCount = [];
    this.tempArray = [];
    this.pageNumber = [];
    this.localDragRef = [];
    this.dataSetArrays = [];
    this.tempval = 0;
    this.isNewAfterDelete = false;
    this.isloadingSavedQuery = true;
    this.countAA = 1;
    $("#div_report_search").hide();
    localStorage.removeItem("PledgeCount");
    localStorage.removeItem("PaymentCount");
    localStorage.removeItem("CompareCount");
    localStorage.removeItem("CampaignCount");
    localStorage.removeItem("SchedulePaymentCount");
    localStorage.removeItem("TotalCount");
    localStorage.removeItem("SchedulePledgeCount");
    this.donorlist = null;
    this.dataSetArrays = [];
    this.mainArray = [];
    this.componentCount = 0;
    $("#main_table").hide();
    this.container.clear();
    //this.DeleteDonorQuery();
    const eventId = this.localstoragedataService.getLoginUserEventGuId();
    this.isloading = true;
    this.sub = this.reportQueryService
      .getQuery(eventId, id.toString())
      .subscribe(
        (res: any) => {
          if (res) {
            this.newQueryAdded = true;
            this.queryName = res.queryName;
            (this.baseColumn = res.baseColumn),
              (this.displayFields = JSON.parse(res.displayFields));
            this.reportQueryId = res.reportQueryId; //add new
            this.dfields = JSON.parse(res.displayFields);
            if (
              res.reportQueryDatasets &&
              res.reportQueryDatasets.length !== 0
            ) {
              this.dataSetArrays = res.reportQueryDatasets.map((obj) => {
                return JSON.parse(obj.dataSetObject);
                //this.isloading = false;
              });
              this.dataSetArrays = this.dataSetArrays.map((item, index) => {
                item.reportQueryId =
                  res.reportQueryDatasets[index].reportQueryDataSetId;
                return item;
              });
            } else {
              //this.isloading = false;
            }
            if (res.advancedSearch == null) {
              this.objAdvancedSearch = {
                accountNo: undefined,
                class: undefined,
                email: undefined,
                father: undefined,
                fatherInLaw: undefined,
                fullName: undefined,
                fullNameJewish: undefined,
                group: undefined,
                note: undefined,
                phone: undefined,
              };
            } else {
              this.objAdvancedSearch = JSON.parse(res.advancedSearch); //need to changes
            }

            this.refreshData();
          }
        },
        (err) => {
          this.isloading = false;
        }
      );
  }
  countAA = 1;
  dsalength = 0;
  refreshData() {
    this.dsalength = this.dataSetArrays.length;
    this.isloading = true;
    this.pageSize = 25;
    $(".show_entryval").removeClass("active");
    $("#25").addClass("active");
    if (this.baseColumn.toLowerCase() == "Donor".toLowerCase()) {
      this.searchDonorData();
      this.commonMethodService.getDonorListArray().subscribe(() => {
        if (this.donorlist) {
          if (this.dsalength <= this.dataSetArrays.length) {
            if (this.dsalength > 0) {
              this.dsalength -= 1;

              this.dataSetArrays.map((ds) => {
                if (this.countAA <= this.dataSetArrays.length) {
                  this.countAA += 1;
                  this.runDataSet(ds);
                }
              });
            }
          }
        }
      });
    }
  }

  runDataSet(objResponse) {
    this.commonMethodService.setIsDataSetLoading(true);
    const reportDynamicListFactory = this.resolver.resolveComponentFactory(
      ReportDynamicListComponent
    );
    const reportRef = this.container.createComponent(reportDynamicListFactory);
    var obj: any = {};

    obj.sortType = this.sortType;
    obj.mainArray = this.mainArray;
    obj.selectedBaseCol = this.baseColumn;
    this.componentCount = this.componentCount + 1;
    obj.list = objResponse;
    reportRef.instance.DonorList = this.donorlist;
    reportRef.instance.TableId = this.componentCount.toString();
    reportRef.instance.ReportData = obj;
    this.tableId = this.componentCount.toString();

    this.commonMethodService.getColumnArray().subscribe((res) => {
      this.callAftergetColumnArray(res);
    });

    this.localDragRef.push(reportRef.instance.dragEnable(this.dragDrop));
    this.droplistREf.withItems([...this.localDragRef]);
    reportRef.changeDetectorRef.detectChanges();
  }

  deleteSavedQuery(reportQueryId: number) {
    Swal.fire({
      title: this.commonMethodService.getTranslate("WARNING_SWAL.TITLE"),
      html: "<p class='querydes'>You will not be able to recover this</p> <h4 class='querytitle'> Saved query!</h4>",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: this.commonMethodService.getTranslate(
        "WARNING_SWAL.BUTTON.CANCEL.NO_KEEP_IT"
      ),
    }).then((result) => {
      if (result.value) {
        var updatedBy = this.localstoragedataService.getLoginUserId();
        this.reportQueryService
          .deleteQuery(reportQueryId.toString(), updatedBy.toString())
          .subscribe(
            (res: any) => {
              Swal.fire({
                title: "Deleted!",
                text: "Your Saved query has been deleted.",
                icon: "success",
                confirmButtonText: this.commonMethodService.getTranslate(
                  "WARNING_SWAL.BUTTON.CONFIRM.OK"
                ),
                customClass: {
                  confirmButton: "btn_ok",
                },
              });
              this.getSavedQueary();
            },
            (err) => {
              this.isloading = false;
              console.log(err);
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
      }
    });
  }
  stopRun() {
    this.isloading = false;
    this.DeleteDonorQuery();
    this.isloading = false;
    this.isRunLoader = false;
    if (this.sub) {
      this.sub.unsubscribe();
    }
    if (this.subGetdonar) {
      this.subGetdonar.unsubscribe();
    }
    if (this.subAll) {
      this.subAll.unsubscribe();
    }
  }

  // new logic
  backArray: any = [];
  searchNew(keyword, event, isZero = false) {
    var tempArray: any = []; //this.mainArray;//old logic

    const charCode = event.which ? event.which : event.keyCode;
    if (charCode == 8) {
      if (this.backArray && this.backArray.length > 0) {
        this.gridCount = this.backArray;
      } else {
        this.gridCount = this.searchgridCount;
      }
      tempArray = this.gridCount;
    } else {
      tempArray = this.gridCount;
    }

    var resultArray: any = [];
    var newArray: any = [];
    if (!isZero) {
      keyword = keyword.toLowerCase();
    }
    this.isFiltered = false;
    if (keyword != "" || keyword == null) {
      if (!isZero) {
        var searchArray = keyword.split(" ");
      }
      var filteredRecord;
      if (isZero) {
        filteredRecord = this.filterZeroAmt(tempArray);
        tempArray = filteredRecord;
      } else {
        for (var searchValue of searchArray) {
          filteredRecord = this.filterByValue(tempArray, searchValue);
          tempArray = filteredRecord;
        }
      }
      for (const item of tempArray) {
        var newArray = this.gridCount.find(
          (e) => e.accountId === item.accountId
        );
        resultArray.push(newArray);
      }
      this.gridCount = resultArray;
      if (isZero) {
        this.totalRecord = this.gridCount.length;
        this.isFiltered = false;
      } else {
        this.filterRecord = this.gridCount.length;
        this.isFiltered = true;
      }

      this.totalRecord = this.gridCount.length; //new logic
      this.gridFilterData = resultArray.slice(
        this.pageNumber.startIndex,
        this.pageNumber.endIndex + 1
      );
      var accountIdArray = [];
      tempArray.forEach(function (obj) {
        accountIdArray.push(obj.accountId);
      });
      this.commonMethodService.sendSearchAccountIdArray(accountIdArray);
    } else {
      this.totalRecord = this.gridCount.length; //new logic

      this.gridFilterData = this.gridCount.slice(
        this.pageNumber.startIndex,
        this.pageNumber.endIndex + 1
      );
      var accountIdArray = [];
      tempArray.forEach(function (obj) {
        accountIdArray.push(obj.accountId);
      });
      this.commonMethodService.sendSearchAccountIdArray(accountIdArray);
    }
  }
  getAddressDwp(item) {
    let getValues = [];
    for (
      let index = 0;
      index < this.objAdvancedSearch.address.length;
      index++
    ) {
      const element =
        item == "city"
          ? this.objAdvancedSearch.address[index].city
          : item == "state"
          ? this.objAdvancedSearch.address[index].state
          : item == "zip"
          ? this.objAdvancedSearch.address[index].zip
          : null;
      getValues.push(element);
    }
    return getValues;
  }

  //
  getAllLabels() {
    const eventGuId = this.localstoragedataService.getLoginUserEventGuId();
    this.commonAPIMethodService
      .getLabelText(eventGuId)
      .subscribe((res: any) => {
        res = res.filter((x) => x.labelType != null);
        res = res.filter((x) => x.labelType != "");
        let sortArray = res
          .sort((a, b) =>
            a.labelType > b.labelType ? 1 : b.labelType > a.labelType ? -1 : 0
          )
          .reverse();

        const result = sortArray.map((x) => {
          if (x.labelType && x.labelName) {
            let colName = x.labelType + " > " + x.labelName;
            let headerName = colName;
            if (colName.length > 18) {
              let colString = colName.substring(0, 14);
              colName = colString + "...";
            }
            let colId = x.labelName + x.labelID;

            let obj = {
              id: x.labelID,
              itemName: colName,
              category: "Basic",
              labelName: x.labelName,
              headerName: headerName,
            };
            const found = this.commonMethodService.multiSelectFieldList.some(
              (el) => el.itemName.toLowerCase() == colName.toLowerCase()
            );
            if (!found) {
              this.commonMethodService.multiSelectFieldList.push(obj);
            }
          }
        });
      });
  }
  fieldHeaderFullName(item) {
    if (item.itemName.includes(">")) {
      return item.headerName;
    }
    return item.itemName;
  }
}
