import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import { Component, OnInit, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { NgbDropdown, NgbModalOptions } from "@ng-bootstrap/ng-bootstrap";
import * as moment from "moment";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";

import { CreateAliyosComponent } from "src/app/pages/cards/create-aliyos/create-aliyos.component";
import { PdfviewerPopupComponent } from "src/app/pages/cards/payment-card-popup/pdfviewer-popup/pdfviewer-popup.component";
import { DonorService } from "src/app/services/donor.service";
import { HebrewEngishCalendarService } from "src/app/services/hebrew-engish-calendar.service";
import { PledgeGroupService } from "src/app/services/pledge-group.service";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import * as FileSaver from "file-saver";
import { UIPageSettingService } from "src/app/services/uipagesetting.service";
import { Subscription } from "rxjs";
import { PageSyncService } from "src/app/commons/pagesync.service";
import { XLSXService } from "src/app/services/xlsx.service";
declare var $: any;
@Component({
  selector: "app-aliyos-group-list-main",
  templateUrl: "./aliyos-group-list-main.component.html",
  standalone: false,
  styleUrls: ["./aliyos-group-list-main.component.scss"],
})
export class AliyosGroupListMainComponent implements OnInit {
  modalOptions: NgbModalOptions;
  selectedDateRange: any = {
    startDate: null,
    endDate: null,
  };
  popTitle: any;
  gridFilterData = [];
  PageName: any = "AliyasGroupList";
  isOneDate: any = false;
  isLoading: boolean = false;
  isloading: boolean = false;
  isFiltered: boolean = false;
  filterRecord: number = 0;
  totalRecord: number;

  isSelected = false;
  recordSelectedArray = [];
  gridData: Array<any>;

  EngHebCalPlaceholder: string = "All Time";
  class_id: string;
  class_hid: string;

  isDateVisible: boolean = true;
  isTitleVisible: boolean = true;
  isDateCreatedVisible: boolean = true;

  isTotalOpen: boolean = true;
  isTotalPaid: boolean = true;
  isTotalAmount: boolean = true;

  statusFilter = [];

  colFields: any = [
    { colName: "DATE", isVisible: true, colI: "ADate", disabled: false },
    { colName: "TITLE", isVisible: true, colId: "ATitle", disabled: false },
    {
      colName: "DATETIMECREATED",
      isVisible: true,
      colId: "ACreatedDate",
      disabled: false,
    },
    {
      colName: "TOTALOPEN",
      isVisible: true,
      colId: "ATotalOpen",
      disabled: false,
    },
    {
      colName: "TOTALPAID",
      isVisible: true,
      colId: "ATotalPaid",
      disabled: false,
    },
    {
      colName: "TOTALAMOUNT",
      isVisible: true,
      colId: "ATotalAmount",
      disabled: false,
    },
  ];

  headerList: any = [
    {
      colName: "DATE",
      visibleCondition: this.isDateVisible,
      sortName: "groupDate",
      disabled: false,
    },
    {
      colName: "TITLE",
      visibleCondition: this.isTitleVisible,
      sortName: "groupTitle",
      disabled: false,
    },
    {
      colName: "DATETIMECREATED",
      visibleCondition: this.isDateCreatedVisible,
      sortName: "createdDate",
      disabled: false,
    },
    {
      colName: "TOTALOPEN",
      visibleCondition: this.isTotalOpen,
      sortName: "totalOpen",
      disabled: false,
    },
    {
      colName: "TOTALPAID",
      visibleCondition: this.isTotalPaid,
      sortName: "totalPaid",
      disabled: false,
    },
    {
      colName: "TOTALAMOUNT",
      visibleCondition: this.isTotalAmount,
      sortName: "totalAmount",
      disabled: false,
    },
  ];

  uiPageSettingId = null;
  uiPageSetting: any;
  private calendarSubscription: Subscription;
  private PickercalendarSubscription: Subscription;
  isOpen: boolean;
  @ViewChild("myDropdown", { static: false }) myDropdown: NgbDropdown;
  colfieldsValue: any;
  constructor(
    private router: Router,
    public commonMethodService: CommonMethodService,
    private plegeGroupListService: PledgeGroupService,
    private localstoragedataService: LocalstoragedataService,
    private donorService: DonorService,
    public hebrewEngishCalendarService: HebrewEngishCalendarService,
    private uiPageSettingService: UIPageSettingService,
    private pageSyncService: PageSyncService,
    private xlsxService: XLSXService
  ) {}

  ngOnInit() {
    this.colfieldsValue = this.pageSyncService.aliyosFieldsCol;
    this.colfieldsValue.forEach((obj: { key: boolean }) => {
      let key = Object.keys(obj)[0];
      let value: boolean = Object.values(obj)[0];
      let data = this.colFields.find((data) => data.colName === key);
      data.isVisible = value;
    });
    let objLayout = {
      uiPageSettingId: this.uiPageSettingId,
      userId: this.localstoragedataService.getLoginUserId(),
      moduleName: "transactions",
      screenName: "aliyos",
    };
    this.isloading = true;
    this.uiPageSettingService.Get(objLayout).subscribe((res: any) => {
      if (res) {
        this.uiPageSettingId = res.uiPageSettingId;
        this.uiPageSetting = JSON.parse(res.setting);
        this.setUIPageSettings(this.uiPageSetting);

        this.colFields.forEach((item) => {
          let colVisible = this.checkVisibility(item.colName);
          if (item.isVisible != colVisible) {
            let columnVisibility = { [item.colName]: colVisible };
            this.colfieldsValue.push(columnVisibility);
          }
          item.isVisible = this.checkVisibility(item.colName);
        });

        this.getAliaGroupList(false);
      } else {
        if (this.pageSyncService.uiPageSettings["aliyosList"]) {
          this.uiPageSetting =
            this.pageSyncService?.uiPageSettings?.["aliyosList"];
          this.setUIPageSettings(this.uiPageSetting);
        }
        this.getAliaGroupList(false);
      }
    });
    this.commonMethodService.isAliyosSaved.subscribe((res: any) => {
      if (res) {
        this.getAliaGroupList(false);
      }
    });
  }

  setUIPageSettings(uiPageSetting) {
    this.isDateVisible = uiPageSetting.isDateVisible;
    this.isTitleVisible = uiPageSetting.isTitleVisible;
    this.isDateCreatedVisible = uiPageSetting.isDateCreatedVisible;
    this.isTotalOpen = uiPageSetting.isTotalOpen;
    this.isTotalPaid = uiPageSetting.isTotalPaid;
    this.isTotalAmount = uiPageSetting.isTotalAmount;

    if (uiPageSetting?.aliyosCalendarPlaceHolderId)
      this.hebrewEngishCalendarService.id =
        uiPageSetting?.aliyosCalendarPlaceHolderId;

    if (uiPageSetting.startDate == null && uiPageSetting.endDate == null) {
      this.selectedDateRange.startDate = null;
      this.selectedDateRange.endDate = null;
      this.EngHebCalPlaceholder = "All Time";
    } else {
      this.getSelectedDateRange(uiPageSetting.startDate, uiPageSetting.endDate);
    }
    this.pageSyncService.uiPageSettings["aliyosList"] = uiPageSetting;
  }

  onClickedOutsidePopover(p1: any) {
    if (!(event.target as HTMLElement).closest(".popover")) {
      p1.close();
    } else {
    }
  }
  openEditAliyosGroupCardPopup(item) {
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass:
        "drag_popup aliyasPledge_modal aliyasPledge_modal_group_new modal-popup",
    };
    const modalRef = this.commonMethodService.openPopup(
      CreateAliyosComponent,
      this.modalOptions
    );
    modalRef.componentInstance.data = item;
    modalRef.componentInstance.emtOutputAliyos.subscribe((res: any) => {
      if (res) {
        this.getAliaGroupList(true);
      }
    });
  }

  getAliaGroupList(isWithTotal) {
    this.isLoading = true;
    this.isloading = true;
    const params = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      fromDate:
        this.selectedDateRange && this.selectedDateRange.startDate != null
          ? moment(this.selectedDateRange.startDate).format("YYYY-MM-DD")
          : null,
      toDate:
        this.selectedDateRange && this.selectedDateRange.endDate != null
          ? moment(this.selectedDateRange.endDate).format("YYYY-MM-DD")
          : null,
      withTotals: isWithTotal,
    };

    this.plegeGroupListService.getAliyaGroupList(params).subscribe(
      (res) => {
        this.isLoading = false;
        this.isloading = false;
        if (res) {
          this.gridFilterData = res;
          this.gridData = this.gridFilterData;
          this.totalRecord = this.gridFilterData.length;
          this.callTrueMethodAgain(isWithTotal);
        } else {
          this.gridFilterData = [];
          this.gridData = [];
          this.totalRecord = 0;
        }
      },
      (error) => {
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

  downloadAliaGroupReport(item) {
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup print_receipt",
    };
    const params = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      groupID: item.groupID,
    };
    const modalRef = this.commonMethodService.openPopup(
      PdfviewerPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.Title = "Document Preview";
    this.plegeGroupListService
      .getAliyaGroupReport(params)
      .subscribe((res: any) => {
        if (res) {
          modalRef.componentInstance.filePath = res;
        }
        (error) => {
          console.log(error);
        };
      });
  }

  closeDropdown() {
    let calendarRef = document.getElementById("popContent2");
    if (!calendarRef) {
      this.myDropdown.close();
    }
  }

  openHebrewPickerPopup(p2: any) {
    this.PickercalendarSubscription = this.commonMethodService
      .getReport()
      .subscribe((res: any) => {
        if (res && this.commonMethodService.ReportClicked == true) {
          this.commonMethodService.ReportClicked = false;
          if (this.commonMethodService.isReportdropdownOpen == true) {
            this.openDropdown();
            this.isOpen = true;
          }
          this.pageSyncService.uiPageSettings[
            "aliyosList"
          ].aliyosCalendarPlaceHolderId = this.hebrewEngishCalendarService.id;
          this.PickercalendarSubscription.unsubscribe();
          p2.close();
        }
      });
  }

  openDropdown() {
    this.isOpen = false;
    if (this.commonMethodService.isReportdropdownOpen == true) {
      this.myDropdown.close();
      this.commonMethodService.isReportdropdownOpen = false;
    }
  }

  getDonorReport() {
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup print_receipt",
    };
    let objgetDonorReport: any = {};
    objgetDonorReport = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
    };
    const modalRef = this.commonMethodService.openPopup(
      PdfviewerPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.Title = "Document print";
    this.donorService
      .getReportByDonor(objgetDonorReport)
      .subscribe((res: any) => {
        if (res) {
          modalRef.componentInstance.filePath = res;
        }
        (error) => {
          console.log(error);
        };
      });
  }

  search(keyword) {
    this.isSelected = false;
    let record = this.gridData;
    let filterdRecord;
    this.totalRecord = this.gridData.length;
    this.isFiltered = false;
    keyword = keyword.toLowerCase().replace(/[()-]/g, "");
    this.recordSelectedArray = [];

    if (keyword != "") {
      let searchArray = keyword.split(" ");
      for (var searchValue of searchArray) {
        filterdRecord = record.filter(
          (obj) =>
            (obj.groupID &&
              obj.groupID.toString().toLowerCase().indexOf(searchValue) > -1) ||
            (obj.groupTitle &&
              obj.groupTitle.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.totalAmount &&
              obj.totalAmount.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.totalOpen &&
              obj.totalOpen.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.totalPaid &&
              obj.totalPaid.toString().toLowerCase().indexOf(searchValue) > -1)
        );

        this.gridFilterData = filterdRecord;
        record = this.gridFilterData;
        this.filterRecord = filterdRecord.length;
        this.isFiltered = true;
      }
    } else {
      this.gridFilterData = this.gridData;
    }
  }

  openCalendarPopup(p1: any) {
    this.commonMethodService.openCalendarPopup(
      this.class_id,
      this.class_hid,
      this.selectedDateRange,
      false,
      "aliyosCalender"
    );
    this.calendarSubscription = this.commonMethodService
      .getCalendarArray()
      .subscribe((items) => {
        if (
          items &&
          items.pageName == "AliyasGroupList" &&
          this.commonMethodService.isCalendarClicked == true
        ) {
          this.commonMethodService.isCalendarClicked = false;
          this.calendarSubscription.unsubscribe();
          p1.close();
          this.selectedDateRange = items.obj;
          this.EngHebCalPlaceholder =
            this.hebrewEngishCalendarService.EngHebCalPlaceholder;
          this.getAliaGroupList(true);
        }
      });
  }

  callTrueMethodAgain(val) {
    if (!val) {
      this.getAliaGroupList(true);
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
  checkGridColVisibility(colName) {
    let tempColName = colName;
    colName = colName.toLowerCase().replace(/\s/g, "");
    switch (colName) {
      case "date":
        return this.isDateVisible;
      case "title":
        return this.isTitleVisible;
      case "datetimecreated":
        return this.isDateCreatedVisible;
      case "totalopen":
        return this.isTotalOpen;
      case "totalpaid":
        return this.isTotalPaid;
      case "totalamount":
        return this.isTotalAmount;
    }
  }

  setGridColVisibility($event, colName, isVisible) {
    var fieldsData = this.pageSyncService.aliyosFieldsCol;
    var obj = fieldsData.find((data) => Object.keys(data)[0] === colName);
    obj
      ? (obj[colName] = isVisible)
      : fieldsData.push({ [colName]: isVisible });
    colName = colName.toLowerCase().replace(/\s/g, "");
    switch (colName) {
      case "date":
        this.isDateVisible = isVisible;
        this.uiPageSetting.isDateVisible = isVisible;
        break;
      case "title":
        this.isTitleVisible = isVisible;
        this.uiPageSetting.isTitleVisible = isVisible;
        break;
      case "datetimecreated":
        this.isDateCreatedVisible = isVisible;
        this.uiPageSetting.isDateCreatedVisible = isVisible;
        break;
      case "totalopen":
        this.isTotalOpen = isVisible;
        this.uiPageSetting.isTotalOpen = isVisible;
        break;
      case "totalpaid":
        this.isTotalPaid = isVisible;
        this.uiPageSetting.isTotalPaid = isVisible;
        break;
      case "totalamount":
        this.isTotalAmount = isVisible;
        this.uiPageSetting.isTotalAmount = isVisible;
        break;
    }

    $event.stopPropagation();
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

  public downloadExcel() {
    this.isloading = true;
    let results = this.gridFilterData.length && this.gridFilterData;
    let data = [];
    if (results) {
      Object.values(results).forEach((item: any) => {
        let groupDate = item && item.groupDate;
        let groupTitle = item && item.groupTitle;
        let createdDate = item && item.createdDate;
        let totalOpen = item && item.totalOpen;
        let totalPaid = item && item.totalPaid;
        let totalAmount = item && item.totalAmount;

        let row = {};
        if (this.isDateVisible) {
          row["Group Date"] = groupDate;
        }
        if (this.isTitleVisible) {
          row["Title"] = groupTitle;
        }
        if (this.isDateCreatedVisible) {
          row["Date & Time Created"] = createdDate;
        }
        if (this.isTotalOpen) {
          row["Total Open"] = totalOpen;
        }
        if (this.isTotalPaid) {
          row["Total Paid"] = totalPaid;
        }
        if (this.isTotalAmount) {
          row["Total Amount"] = totalAmount;
        }
        data.push(row);
      });
    } else {
      return;
    }

    const filename = this.xlsxService.getFilename("Aliyos List");
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

  SaveLayout() {
    let setting = {
      isDateVisible: this.isDateVisible,
      isTitleVisible: this.isTitleVisible,
      isDateCreatedVisible: this.isDateCreatedVisible,
      isTotalOpen: this.isTotalOpen,
      isTotalPaid: this.isTotalPaid,
      isTotalAmount: this.isTotalAmount,
      startDate: this.selectedDateRange.startDate,
      endDate: this.selectedDateRange.endDate,
      aliyosCalendarPlaceHolderId: this.hebrewEngishCalendarService.id,
      EngHebCalPlaceholder: this.EngHebCalPlaceholder,
    };

    let objLayout = {
      uiPageSettingId: this.uiPageSettingId,
      userId: this.localstoragedataService.getLoginUserId(),
      moduleName: "transactions",
      screenName: "aliyos",
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

  getSelectedDateRange(sDate, eDate) {
    const today = new Date();
    if (sDate != null && eDate == null) {
      const dates = this.commonMethodService.getStartAndEndDate(sDate);
      this.selectedDateRange.startDate = dates.startDate;
      this.selectedDateRange.endDate = dates.endDate;
    } else if (sDate != null && eDate != null) {
      this.selectedDateRange.startDate = moment(sDate);
      this.selectedDateRange.endDate = moment(eDate);
    }
  }
}
