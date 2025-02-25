import { ChangeDetectorRef, Component, OnInit, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { NgbModal, NgbModalOptions } from "@ng-bootstrap/ng-bootstrap";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { BatchCardPopupComponent } from "src/app/pages/cards/batch-card-popup/batch-card-popup.component";
import { CommonHebrewEnglishCalendarComponent } from "../../pledge-transaction/hebrewCalendar/common-hebrew-english-calendar/common-hebrew-english-calendar.component";
import * as moment from "moment";
import { HebrewEngishCalendarService } from "src/app/services/hebrew-engish-calendar.service";

import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { UIPageSettingService } from "src/app/services/uipagesetting.service";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import { DaterangepickerDirective } from "ngx-daterangepicker-material";
import { BatchService } from "src/app/services/batch.service";
import { NotificationService } from "src/app/commons/notification.service";
import * as FileSaver from "file-saver";
import { SaveBatchPopupComponent } from "src/app/pages/cards/batch-card-popup/save-batch-popup/save-batch-popup.component";
import { TagObj, TagService } from "src/app/services/tag.service";
import { Subscription } from "rxjs";
import { DonaryDateFormatPipe } from "src/app/commons/donary-date-format.pipe";
import { XLSXService } from "src/app/services/xlsx.service";
import { environment } from "src/environments/environment";
declare var $: any;
@Component({
  selector: "app-batches-list-main",
  templateUrl: "./batches-list-main.component.html",
  styleUrls: ["./batches-list-main.component.scss"],
  standalone: false,
})
export class BatchesListMainComponent implements OnInit {
  @ViewChild(DaterangepickerDirective, { static: false })
  pickerDirective: DaterangepickerDirective;
  modalOptions: NgbModalOptions;
  isNewBatch: boolean = false;
  /*Open Calender*/
  selectedDateRange: any = {
    startDate: moment(new Date()).subtract(6, "days"),
    endDate: moment(new Date()),
  };
  EngHebCalPlaceholder: string = "Last 7 Days";
  presetOption: string;
  class_id: string;
  class_hid: string;
  objAdvancedSearch: any;
  support_url: string = "/" + "new-batch";
  isinitialize: number = 0;
  isloading: boolean = false;
  gridData = [];
  totalRecord: number = 0;
  filterRecord: number = 0;
  isFiltered: boolean = false;
  statusDropdown: boolean = false;
  batchedStatus: string = "Batched";
  colFields: any = [
    { colName: "GATEWAY", isVisible: true, colId: "BGateway", disabled: false },
    {
      colName: "GATEWAY BATCH#",
      isVisible: true,
      colId: "BGatewaybatchnum",
      disabled: false,
    },
    { colName: "STATUS", isVisible: true, colId: "BStatus", disabled: false },
    {
      colName: "GATEWAYBATCHDATE",
      isVisible: true,
      colId: "BGatewaybatchdate",
      disabled: false,
    },
    {
      colName: "BATCHCREATEDDATE",
      isVisible: true,
      colId: "BBatchcreateddate",
      disabled: false,
    },
    {
      colName: "DONARYBATCH#",
      isVisible: true,
      colId: "BDonarybatch#",
      disabled: false,
    },
    { colName: "NOTE", isVisible: true, colId: "BNote", disabled: false },
    { colName: "BANKTAG", isVisible: true, colId: "BBanktag", disabled: false },
    {
      colName: "TRANSACTIONS",
      isVisible: true,
      colId: "BTransactions",
      disabled: false,
    },
    { colName: "AMOUNT", isVisible: true, colId: "BAmount", disabled: false },
  ];

  isBatchGatewayVisible: boolean = true;
  isBatchGatewayNumberVisible: boolean = true;
  isBatchStatusVisible: boolean = true;
  isBatchGatewayDateVisible: boolean = true;
  isBatchCreatedDateVisible: boolean = true;
  isBatchDonaryNumberVisible: boolean = true;
  isBatchNoteVisible: boolean = true;
  isBatchBankTagVisible: boolean = true;
  isBatchTransactionsVisible: boolean = true;
  isBatchAmountVisible: boolean = true;
  statusFilter = [];
  gridFilterData = [];
  isBetaEnv: boolean;
  isProdEnv: boolean;
  PageName: any = "BatchList";
  private calendarSubscription: Subscription;
  isOneDate: any = false;
  popTitle: any;

  headerList: any = [
    {
      colName: "GATEWAY",
      visibleCondition: this.isBatchGatewayVisible,
      sortName: "gateway",
      disabled: false,
    },
    {
      colName: "GATEWAY BATCH#",
      visibleCondition: this.isBatchGatewayNumberVisible,
      sortName: "gatewayBatch#",
      disabled: false,
    },
    {
      colName: "STATUS",
      visibleCondition: this.isBatchStatusVisible,
      sortName: "status",
      disabled: false,
    },
    {
      colName: "GATEWAY BATCH DATE",
      visibleCondition: this.isBatchGatewayDateVisible,
      sortName: "gatewayDateRange",
      disabled: false,
    },
    {
      colName: "BATCH CREATEDDATE",
      visibleCondition: this.isBatchCreatedDateVisible,
      sortName: "dateCreated",
      disabled: false,
    },
    {
      colName: "DONARY BATCH#",
      visibleCondition: this.isBatchDonaryNumberVisible,
      sortName: "gatewayBatchNum",
      disabled: false,
    },
    {
      colName: "NOTE",
      visibleCondition: this.isBatchNoteVisible,
      sortName: "note",
      disabled: false,
    },
    {
      colName: "BANKTAG",
      visibleCondition: this.isBatchBankTagVisible,
      sortName: "bankColor",
      disabled: false,
    }, //aded
    {
      colName: "TRANSACTIONS",
      visibleCondition: this.isBatchTransactionsVisible,
      sortName: "transactionCount",
      disabled: false,
    },
    {
      colName: "AMOUNT",
      visibleCondition: this.isBatchAmountVisible,
      sortName: "totalAmount",
      disabled: false,
    },
  ];

  uiPageSettingId = null;
  uiPageSetting: any;
  statusType = [{ id: 2, itemName: "UnBatched" }];
  batchId: any;
  modal: any;
  newDonorTagList: Array<TagObj> = [];
  status: any;
  featureName: string = "Finance_save_batch";
  constructor(
    private router: Router,
    public commonMethodService: CommonMethodService,
    private readonly changeDetectorRef: ChangeDetectorRef,
    public hebrewEngishCalendarService: HebrewEngishCalendarService,
    private modalService: NgbModal,
    private datePipe: DonaryDateFormatPipe,
    private localstoragedataService: LocalstoragedataService,
    private uiPageSettingService: UIPageSettingService,
    private batchService: BatchService,
    private notificationService: NotificationService,
    public tagService: TagService,
    private xlsxService: XLSXService
  ) {}
  ngOnInit() {
    this.commonMethodService.getFeatureSetting(this.featureName);
    this.isProdEnv = environment.baseUrl.includes("https://webapi.donary.com/");
    this.isBetaEnv = environment.baseUrl.includes("beta");
    this.commonMethodService.getBatch().subscribe((res: any) => {
      if (res) {
        this.searchBatchTransactionsData();
        //this.commonMethodService.PaymentTransObservable.next(false);
      }
    });
    let objLayout = {
      uiPageSettingId: this.uiPageSettingId,
      userId: this.localstoragedataService.getLoginUserId(),
      moduleName: "finance",
      screenName: "batches",
    };
    this.isloading = true;
    this.uiPageSettingService.Get(objLayout).subscribe((res: any) => {
      if (res) {
        this.uiPageSettingId = res.uiPageSettingId;
        this.uiPageSetting = JSON.parse(res.setting);
        if (this.uiPageSetting.isBatchGatewayNumberVisible != undefined) {
          this.isBatchAmountVisible = this.uiPageSetting.isBatchAmountVisible;
          this.isBatchBankTagVisible = this.uiPageSetting.isBatchBankTagVisible;
          this.isBatchCreatedDateVisible =
            this.uiPageSetting.isBatchCreatedDateVisible;
          this.isBatchDonaryNumberVisible =
            this.uiPageSetting.isBatchDonaryNumberVisible;
          this.isBatchGatewayDateVisible =
            this.uiPageSetting.isBatchGatewayDateVisible;
          this.isBatchGatewayNumberVisible =
            this.uiPageSetting.isBatchGatewayNumberVisible;
          this.isBatchGatewayVisible = this.uiPageSetting.isBatchGatewayVisible;
          this.isBatchNoteVisible = this.uiPageSetting.isBatchNoteVisible;
          this.isBatchStatusVisible = this.uiPageSetting.isBatchStatusVisible;
          this.isBatchTransactionsVisible =
            this.uiPageSetting.isBatchTransactionsVisible;

          this.statusType = this.uiPageSetting.showStatus;
          this.colFields.forEach((element) => {
            element.isVisible = this.checkGridColVisibility(element.colName);
          });
          if (
            this.uiPageSetting.startDate == null &&
            this.uiPageSetting.endDate == null
          ) {
            this.selectedDateRange.startDate = null;
            this.selectedDateRange.endDate = null;
            this.EngHebCalPlaceholder = "Last 7 Days";
          } else {
            this.getSelectedDateRange(
              this.uiPageSetting.startDate,
              this.uiPageSetting.endDate
            );
          }
        }
        this.searchBatchTransactionsData();
        this.getTagList();
      } else {
        this.searchBatchTransactionsData();
      }
    });
    this.initMultiSelect();
  }

  initMultiSelect() {
    this.statusFilter = [
      { id: 1, itemName: "All" },
      { id: 2, itemName: "UnBatched" },
      { id: 3, itemName: "Batched" },
      { id: 4, itemName: "Deposited" },
      { id: 5, itemName: "Archived" },
    ];
  }
  getTagList() {
    const eventGuId = this.localstoragedataService.getLoginUserEventGuId();
    this.tagService.getAllTag(eventGuId).subscribe(
      (res) => {
        if (res) {
          this.newDonorTagList = res;
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }
  statusClass(status: any) {
    var statusClass;
    if (status == "Batched") {
      statusClass = "badge-batched";
    } else if (status === "UnBatched") {
      statusClass = "badge-unbatched";
    } else if (status === "Archived") {
      statusClass = "badge-archived";
    } else if (status === "Deposited") {
      statusClass = "badge-deposited";
    }
    return statusClass;
  }

  onDateChange(sDate, eDate, preset) {
    const today = new Date();
    const startDate = new Date(sDate);
    const endDate = new Date(eDate);

    const ftoday = this.datePipe.transform(today, "dd/MM/yyyy");
    const fstartDate = this.datePipe.transform(startDate, "dd/MM/yyyy");
    const fendDate = this.datePipe.transform(endDate, "dd/MM/yyyy");
    if (preset == "PresetOption") {
      if (
        fstartDate <= ftoday &&
        fendDate >= ftoday &&
        startDate.getDate() === today.getDate() &&
        startDate.getMonth() === today.getMonth() &&
        startDate.getFullYear() === today.getFullYear()
      ) {
        this.class_id = "id_today";
        this.class_hid = "id_today_h";
        this.EngHebCalPlaceholder = "Today";
        this.presetOption = "Today";
      } else if (
        startDate <= today &&
        endDate >= today &&
        startDate <= today &&
        endDate <=
          new Date(today.getFullYear(), today.getMonth(), today.getDate() + 6)
      ) {
        this.class_id = "id_thisweek";
        this.class_hid = "id_thisweek_h";
        this.EngHebCalPlaceholder = "This Week";
        this.presetOption = "This Week";
      } else if (
        fstartDate <= ftoday &&
        fendDate >= ftoday &&
        startDate >=
          new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate() - 6
          ) &&
        fendDate <= ftoday
      ) {
        this.class_id = "id_Last7days";
        this.class_hid = "id_Last7days_h";
        this.EngHebCalPlaceholder = "Last 7 Days";
        this.presetOption = "Last 7 Days";
      } else if (
        startDate.getMonth() === today.getMonth() &&
        startDate.getFullYear() === today.getFullYear()
      ) {
        this.class_id = "id_ThisMonth";
        this.class_hid = "id_ThisMonth_h";
        this.EngHebCalPlaceholder = "This Month";
        this.presetOption = "This Month";
      } else if (
        startDate.getMonth() === today.getMonth() - 1 &&
        startDate.getFullYear() === today.getFullYear() &&
        startDate.getMonth() != today.getMonth() &&
        endDate.getMonth() !== today.getMonth() + 1
      ) {
        this.class_id = "id_LastMonth";
        this.class_hid = "id_LastMonth_h";
        this.EngHebCalPlaceholder = "Last Month";
        this.presetOption = "Last Month";
      } else if (
        startDate.getMonth() === today.getMonth() + 1 &&
        startDate.getFullYear() === today.getFullYear()
      ) {
        this.class_id = "id_NextMonth";
        this.class_hid = "id_NextMonth_h";
        this.EngHebCalPlaceholder = "Next Month";
        this.presetOption = "Next Month";
      } else if (startDate.getFullYear() === today.getFullYear()) {
        const thisYearStart = new Date(today.getFullYear(), 0, 1);
        const formattedStartDate = this.datePipe.transform(
          thisYearStart,
          "dd/MM/yyyy"
        );

        const thisYearEnd = new Date(today.getFullYear(), 11, 31);
        const formattedEndDate = this.datePipe.transform(
          thisYearEnd,
          "dd/MM/yyyy"
        );

        if (fstartDate == formattedStartDate && fendDate == formattedEndDate) {
          this.EngHebCalPlaceholder = "This Year";
          this.presetOption = "This Year";
          this.class_id = "id_ThisYear";
          this.class_hid = "id_ThisYear_h";
        } else {
          this.class_id = "id_CustomRange";
          this.class_hid = "id_CustomRange_h";
          this.EngHebCalPlaceholder = fstartDate + " - " + fendDate;
        }
      } else if (startDate.getFullYear() === today.getFullYear() - 1) {
        this.class_id = "id_LastYear";
        this.class_hid = "id_LastYear_h";
        this.EngHebCalPlaceholder = "Last Year";
        this.presetOption = "Last Year";
      } else if (startDate.getFullYear() === today.getFullYear() + 1) {
        this.class_id = "id_NextYear";
        this.class_hid = "id_NextYear_h";
        this.EngHebCalPlaceholder = "Next Year";
        this.presetOption = "Next Year";
      }
    }
    if (preset == "CustomRange") {
      this.class_id = "id_CustomRange";
      this.class_hid = "id_CustomRange_h";
      this.EngHebCalPlaceholder = sDate + " - " + eDate;
    }
  }

  getSelectedDateRange(sDate, eDate) {
    const today = new Date();
    if (sDate != null && eDate == null) {
      const dates = this.commonMethodService.getStartAndEndDate(sDate);
      this.selectedDateRange.startDate = dates.startDate;
      this.selectedDateRange.endDate = dates.endDate;
      this.onDateChange(
        this.selectedDateRange.startDate,
        this.selectedDateRange.endDate,
        "PresetOption"
      );
    } else if (sDate != null && eDate != null) {
      this.selectedDateRange.startDate = moment(sDate);
      this.selectedDateRange.endDate = moment(eDate);
      this.onDateChange(sDate, eDate, "CustomRange");
    }
  }

  SaveLayout() {
    let setting = {
      isBatchGatewayVisible: this.isBatchGatewayVisible,
      isBatchGatewayNumberVisible: this.isBatchGatewayNumberVisible,
      isBatchStatusVisible: this.isBatchStatusVisible,
      isBatchGatewayDateVisible: this.isBatchGatewayDateVisible,
      isBatchCreatedDateVisible: this.isBatchCreatedDateVisible,
      isBatchDonaryNumberVisible: this.isBatchDonaryNumberVisible,
      isBatchNoteVisible: this.isBatchNoteVisible,
      isBatchBankTagVisible: this.isBatchBankTagVisible,
      isBatchTransactionsVisible: this.isBatchTransactionsVisible,
      isBatchAmountVisible: this.isBatchAmountVisible,
      startDate: this.selectedDateRange.startDate,
      endDate: this.selectedDateRange.endDate,
      showStatus: this.statusType,
    };
    let objLayout = {
      uiPageSettingId: this.uiPageSettingId,
      userId: this.localstoragedataService.getLoginUserId(),
      moduleName: "finance",
      screenName: "batches",
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
  openBatchCardPopup(value) {
    if (value.status == "UnBatched") {
      this.modalOptions = {
        centered: true,
        size: "lg",
        keyboard: true,
        windowClass: "drag_popup modal-create-batch",
        backdropClass: "backdrop_show",
      };
      const modalRef = this.commonMethodService.openPopup(
        SaveBatchPopupComponent,
        this.modalOptions
      );
      this.batchService
        .getBatchTransactions(
          value.gatewayBatchNum,
          this.localstoragedataService.getLoginUserEventGuId()
        )
        .subscribe((res: any) => {
          // hide loader

          this.isloading = false;
          if (res) {
            var objData = {
              batchId: value.batchID,
              gatewayBatchNum: value.gatewayBatchNum,
              batchStatus: value.status,
              batchNote: value.note,
              batchTransaction: value.transactionID,
              donaryBatchNum: value.donaryBatchNum,
              gatewayName: value.gatewayName,
            };
            modalRef.componentInstance.TagList = this.newDonorTagList;
            modalRef.componentInstance.BatchCardData = res;
            modalRef.componentInstance.BatchData = objData;
          } else {
            this.isloading;
            modalRef.close();
            Swal.fire({
              title: "No data found",
              text: "",
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
    } else if (
      value.status == "Batched" ||
      value.status == "Archived" ||
      value.status == "Deposited"
    ) {
      if (value.status == "Archived") {
        var isArchived = true;
      }
      this.modalOptions = {
        centered: true,
        size: "lg",
        keyboard: true,
        windowClass: "drag_popup batch_card modal_responsive batch_card_index",
        backdropClass: "backdrop_show",
      };
      const modalRef = this.commonMethodService.openPopup(
        BatchCardPopupComponent,
        this.modalOptions
      );
      if (value.status == "Deposited") {
      }
      var formData = {
        eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
        batchId: value.batchID,
        gatewayBatchNum: null,
      };
      this.batchService.getBatchCard(formData).subscribe((res: any) => {
        event.preventDefault();

        var objData = {
          donaryBatchNum: value.donaryBatchNum,
          isArchived: isArchived,
          gatewayBatchNum: value.gatewayBatchNum,
        };
        this.batchId = res.batchId;
        modalRef.componentInstance.TagList = this.newDonorTagList;
        modalRef.componentInstance.BatchCardData = res;
        modalRef.componentInstance.BatchData = objData;
      });
    }
  }

  isArchived(event, content) {
    var archiveformData = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      updatedBy: this.localstoragedataService.getLoginUserId(),
      macAddress: this.localstoragedataService.getLoginUserGuid(),
      donaryBatchID: this.batchId,
    };
    this.modal.close();
    this.batchService.getArchiveBatch(archiveformData).subscribe((res: any) => {
      if (res) {
        event.preventDefault();
        this.commonMethodService.openPopup(content, {
          centered: true,
          backdrop: "static",
          keyboard: false,
          windowClass: "modal-archive-batch",
          size: "sm",
          scrollable: true,
          backdropClass: "backdrop_show",
        });
      }
      this.searchBatchTransactionsData();
    });
  }

  onClick(event, content, status, batchId) {
    event.preventDefault();
    if (status == "Archived") {
      this.batchId = batchId;
      this.modal = this.commonMethodService.openPopup(content, {
        centered: true,
        backdrop: "static",
        keyboard: false,
        windowClass: "modal-archive-batch",
        size: "sm",
        scrollable: true,
        backdropClass: "backdrop_show",
      });
    }
  }
  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.colFields, event.previousIndex, event.currentIndex);
    moveItemInArray(this.headerList, event.previousIndex, event.currentIndex);
    moveItemInArray(
      this.gridFilterData,
      event.previousIndex,
      event.currentIndex
    );
  }

  setGridColVisibility($event, colName, isVisible) {
    colName = colName.toLowerCase().replace(/\s/g, "");
    switch (colName) {
      case "gateway":
        this.isBatchGatewayVisible = isVisible;
        break;
      case "gatewaybatch#":
        this.isBatchGatewayNumberVisible = isVisible;
        break;
      case "status":
        this.isBatchStatusVisible = isVisible;
        break;
      case "gatewaybatchdate": //added
        this.isBatchGatewayDateVisible = isVisible;
        break;
      case "batchcreateddate":
        this.isBatchCreatedDateVisible = isVisible;
        break;
      case "donarybatch#":
        this.isBatchDonaryNumberVisible = isVisible;
        break;
      case "note":
        this.isBatchNoteVisible = isVisible;
        break;
      case "banktag":
        this.isBatchBankTagVisible = isVisible;
        break;
      case "transactions":
        this.isBatchTransactionsVisible = isVisible;
        break;
      case "amount":
        this.isBatchAmountVisible = isVisible;
        break;
    }

    $event.stopPropagation();
  }

  checkGridColVisibility(colName) {
    colName = colName.toLowerCase().replace(/\s/g, "");
    switch (colName) {
      case "gateway":
        return this.isBatchGatewayVisible;
      case "gatewaybatch#":
        return this.isBatchGatewayNumberVisible;
      case "gatewaybatchdate":
        return this.isBatchGatewayDateVisible;
      case "status":
        return this.isBatchStatusVisible;
      case "batchcreateddate":
        return this.isBatchCreatedDateVisible;
      case "donarybatch#":
        return this.isBatchDonaryNumberVisible;
      case "note":
        return this.isBatchNoteVisible;
      case "banktag":
        return this.isBatchBankTagVisible;
      case "transactions":
        return this.isBatchTransactionsVisible;
      case "amount": //added
        return this.isBatchAmountVisible;
    }
  }

  datesUpdated(event) {
    if (this.isinitialize == 2) {
      this.selectedDateRange = event;
      this.searchBatchTransactionsData();
      if (event.startDate == null && event.endDate == null) {
        this.selectedDateRange = undefined;
        this.isinitialize = 1;
      }
    } else {
      this.isinitialize += 1;
    }
  }
  CalendarFocus() {
    this.pickerDirective.open();
  }

  statusTypeChange(statusType) {
    this.statusType = statusType;
    if (statusType) {
      if (statusType[0].itemName == "All") {
        this.gridFilterData = this.arrangeBatchData(this.gridData);
      }
      if (statusType[0].itemName == "UnBatched") {
        this.gridFilterData = this.gridData.filter(
          (x) => x.status == "UnBatched"
        );
      }
      if (statusType[0].itemName == "Batched") {
        this.gridFilterData = this.gridData.filter(
          (x) => x.status == "Batched"
        );
      }
      if (statusType[0].itemName == "Deposited") {
        this.gridFilterData = this.gridData.filter(
          (x) => x.status == "Deposited"
        );
      }

      if (statusType[0].itemName == "Archived") {
        this.gridFilterData = this.gridData.filter(
          (x) => x.status == "Archived"
        );
      }
    }
    this.totalRecord = this.gridFilterData.length;
  }

  openSaveBatch(gatewayBatchNum: string) {
    this.modalOptions = {
      centered: true,
      size: "lg",
      keyboard: true,
      windowClass: "drag_popup modal-create-batch",
    };
    const modalRef = this.commonMethodService.openPopup(
      SaveBatchPopupComponent,
      this.modalOptions
    );

    let eventGuId = this.localstoragedataService.getLoginUserEventGuId();

    this.batchService
      .getBatchTransactions(gatewayBatchNum, eventGuId)
      .subscribe((res: any) => {
        // hide loader
        this.isloading = false;
        if (res) {
          modalRef.componentInstance.BatchTransactionList = res;
        }
      });
  }

  newBatch(event) {
    this.isNewBatch = true;
  }

  backToList(event) {
    this.isNewBatch = false;
  }

  searchBatchTransactionsData() {
    this.isloading = true;
    this.changeDetectorRef.detectChanges();
    var payload: any = {
      eventGuid: this.localstoragedataService.getLoginUserEventGuId(),
      fromDate:
        this.selectedDateRange && this.selectedDateRange.startDate != null
          ? moment(this.selectedDateRange.startDate).format("YYYY-MM-DD")
          : null,
      toDate:
        this.selectedDateRange && this.selectedDateRange.endDate != null
          ? moment(this.selectedDateRange.endDate).format("YYYY-MM-DD")
          : null,
    };
    this.batchService.getBatchList(payload).subscribe(
      (res: any) => {
        if (res) {
          if (this.statusType) {
            var statusName = this.statusType[0].itemName;
            if (statusName == "All") {
              this.gridFilterData = this.arrangeBatchData(res);
            } else {
              this.gridFilterData = res.filter(
                (entry) => entry.status === statusName
              );
            }
          } else {
            this.gridFilterData = res;
          }
          this.gridData = res;
          this.totalRecord = this.gridFilterData.length;
        } else {
          this.totalRecord = 0;
          this.gridData = null;
          this.gridFilterData = this.gridData;
        }
        this.isloading = false;
      },
      (error) => {
        this.totalRecord = 0;
        this.isloading = false;
        this.notificationService.showError(
          error.error,
          "Error while fetching data !!"
        );
      }
    );
  }

  search(keyword) {
    this.isloading = true;
    var record = this.gridData;
    var filterdRecord;
    this.totalRecord = this.gridData.length;
    this.isFiltered = false;
    keyword = keyword.toLowerCase().replace(/[()-]/g, "");
    if (keyword != "") {
      var searchArray = keyword.split(" ");
      for (var searchValue of searchArray) {
        filterdRecord = record.filter(
          (obj) =>
            (obj.gatewayName &&
              obj.gatewayName.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.donaryBatchNum &&
              obj.donaryBatchNum.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.status &&
              obj.status.toString().toLowerCase().indexOf(searchValue) > -1) ||
            (obj.gatewayDateRange &&
              obj.gatewayDateRange
                .toString()
                .toLowerCase()
                .indexOf(searchValue) > -1) ||
            (obj.dateCreated &&
              obj.dateCreated.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.gatewayBatchNum &&
              obj.gatewayBatchNum
                .toString()
                .toLowerCase()
                .indexOf(searchValue) > -1) ||
            (obj.note &&
              obj.note.toString().toLowerCase().indexOf(searchValue) > -1) ||
            (obj.bankColor &&
              obj.bankColor.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.transactionCount &&
              obj.transactionCount
                .toString()
                .toLowerCase()
                .indexOf(searchValue) > -1) ||
            (obj.totalAmount &&
              obj.totalAmount.toString().toLowerCase().indexOf(searchValue) >
                -1)
        );
        this.gridFilterData = filterdRecord;
        record = this.gridFilterData;
        this.filterRecord = filterdRecord.length;
        this.isFiltered = true;
      }
    } else {
      this.gridFilterData = this.gridData;
    }
    this.isloading = false;
  }

  /**
   * calendar popup open/close functionality
   */
  openCalendarPopup(p1: any) {
    this.commonMethodService.openCalendarPopup(
      this.class_id,
      this.class_hid,
      this.selectedDateRange,
      false,
      "batchCalender"
    );
    this.calendarSubscription = this.commonMethodService
      .getCalendarArray()
      .subscribe((items) => {
        if (
          items &&
          items.pageName == "BatchList" &&
          this.commonMethodService.isCalendarClicked == true
        ) {
          this.commonMethodService.isCalendarClicked = false;
          this.calendarSubscription.unsubscribe();
          p1.close();
          this.selectedDateRange = items.obj;
          this.EngHebCalPlaceholder =
            this.hebrewEngishCalendarService.EngHebCalPlaceholder;
          this.DateFilter(this.selectedDateRange);
          this.searchBatchTransactionsData();
        }
      });
  }

  /**
   * close the popup if clicked outside
   */
  onClickedOutsidePopover(p1: any) {
    if (!(event.target as HTMLElement).closest(".popover")) {
      p1.close();
    } else {
    }
  }

  DateFilter(selectedDateRange) {
    const startDate = moment(selectedDateRange.startDate).format("YYYY-MM-DD");
    const endDate = moment(selectedDateRange.endDate).format("YYYY-MM-DD");
    var record = this.gridData;
  }
  public downloadExcel() {
    this.isloading = true;
    let results = this.gridFilterData.length && this.gridFilterData;
    let data = [];
    if (results) {
      Object.values(results).forEach((item: any) => {
        let gateway = item && item.gatewayName;
        let donaryBatchNum = item && item.donaryBatchNum;
        let Status = item && item.status;
        let GatewayDateRange = item && item.gatewayDateRange;
        let DateCreated = item && item.dateCreated;
        let GatewayBatchNum = item && item.gatewayBatchNum;
        let Note = item && item.note;
        let BankColor = item && item.bankColor;
        let TransactionCount = item && item.transactionCount;
        let TotalAmount = item && item.totalAmount;
        let bankName = item && item.bankName;

        let row = {};
        if (this.isBatchGatewayVisible) {
          row["Gateway"] = gateway;
        }
        if (this.isBatchGatewayNumberVisible) {
          row["Gateway Batch #"] = GatewayBatchNum;
        }
        if (this.isBatchStatusVisible) {
          row["Status"] = Status;
        }
        if (this.isBatchGatewayDateVisible) {
          row["Gateway Batch Date"] = GatewayDateRange;
        }
        if (this.isBatchCreatedDateVisible) {
          row["Batch Created Date"] = DateCreated;
        }
        if (this.isBatchDonaryNumberVisible) {
          row["Donary Batch #"] = donaryBatchNum;
        }
        if (this.isBatchNoteVisible) {
          row["Note"] = Note;
        }
        if (this.isBatchBankTagVisible) {
          row["Bank Tag"] = bankName;
        }
        if (this.isBatchTransactionsVisible) {
          row["Transactions"] = TransactionCount;
        }
        if (this.isBatchAmountVisible) {
          row["Amount"] = TotalAmount;
        }
        data.push(row);
      });
    } else {
      return;
    }

    const filename = this.xlsxService.getFilename("Batch List");
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data, {
      cellStyles: true,
    });
    var range = XLSX.utils.decode_range(worksheet["!ref"]);

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

  arrangeBatchData(batchData: any[]): any[] {
    if (!batchData || !batchData.length) {
      return []; // Handle empty or undefined batchData gracefully
    }
    const groupedData = batchData.reduce((acc, curr) => {
      if (!acc[curr.status]) {
        acc[curr.status] = [];
      }
      acc[curr.status].push(curr);
      return acc;
    }, {});

    // Sorting by custom order
    const customOrder = ["UnBatched", "Batched", "Deposited", "Archived"];
    const sortedKeys = Object.keys(groupedData).sort((a, b) => {
      const aIndex = customOrder.indexOf(a);
      const bIndex = customOrder.indexOf(b);
      return aIndex - bIndex;
    });

    // Constructing the final sorted array
    return sortedKeys.reduce((acc, key) => {
      return acc.concat(groupedData[key]);
    }, []);
  }
  openStatusDropdown() {
    this.statusDropdown = !this.statusDropdown;
  }

  SaveBatch(gatewayBatchNum, transactionCount, totalAmount) {
    let objSavebatch = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      macAddress: this.localstoragedataService.getLoginUserGuid(),
      updatedBy: this.localstoragedataService.getLoginUserId(),
      batchStatus: "Batched",
      gatewayBatchNum: gatewayBatchNum,
      paymentCount: transactionCount,
      currencyAmount: totalAmount,
    };
    this.batchService.saveBatch(objSavebatch).subscribe(
      (res: any) => {
        if (res) {
          this.notificationService.showSuccess(
            `Batch ${gatewayBatchNum} batched`,
            null
          );
          if (res.status && res.status == "Batched") {
            this.gridFilterData.map((data) => {
              if (data.gatewayBatchNum == gatewayBatchNum) {
                data.status = res.status;
                data.dateCreated = res.dateCreated;
                data.donaryBatchNum = res.donaryBatchNum;
                data.batchID = res.batchId;
              }
            });
          }
        }
      },
      (error) => {
        console.error("Error occurred:", error);
        this.notificationService.showError(error.error, "Error !");
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.error,
        });
      }
    );
  }

  openDepositBatch(content, batchID) {
    this.isloading = true;
    var objSavebatch = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      macAddress: this.localstoragedataService.getLoginUserGuid(),
      updatedBy: this.localstoragedataService.getLoginUserId(),
      donaryBatchID: batchID,
      batchStatus: "Deposited",
      gatewayTransactionIDs: null,
    };
    this.batchService.saveBatch(objSavebatch).subscribe(
      (res: any) => {
        this.isloading = false;
        this.notificationService.showSuccess(
          `Batch ${batchID} deposited`,
          null
        );
        if (res.status && res.status == "Deposited") {
          this.gridFilterData.map((data) => {
            if (data.batchID == batchID) {
              data.status = res.status;
            }
          });
        }
      },
      (err) => {
        this.isloading = false;
        this.notificationService.showError(err.error, "Error !");
      }
    );
  }
}
