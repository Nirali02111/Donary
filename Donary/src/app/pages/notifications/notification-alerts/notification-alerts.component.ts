import { Component, inject, OnInit, ViewChild } from "@angular/core";
import { NgbModalOptions, NgbPopover } from "@ng-bootstrap/ng-bootstrap";
import * as moment from "moment";
import { DaterangepickerDirective } from "ngx-daterangepicker-material";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { NotificationService } from "src/app/services/notification.service";
import { SchedulePaymentCardPopupComponent } from "../../cards/schedule-card-popup/schedule-paymentcard-popup.component";
import { CardService } from "src/app/services/card.service";
import Swal from "sweetalert2";
import { DonorCardPopupComponent } from "../../cards/donor-card-popup/donor-card-popup.component";
import { CampaignCardPopupComponent } from "../../cards/campaign-card-popup/campaign-card-popup.component";
import { CampaignService } from "src/app/services/campaign.service";
import * as XLSX from "xlsx";
import * as FileSaver from "file-saver";

import { ReminderPopupComponent } from "../reminder-popup/reminder-popup.component";
import { environment } from "./../../../../environments/environment";
import { NotificationSidebarPopupComponent } from "../notification-sidebar-popup/notification-sidebar-popup.component";
import { AddTransactionPopupComponent } from "../../make-transaction/add-transaction-popup/add-transaction-popup.component";
import { NotificationService as notification } from "src/app/commons/notification.service";

import { HebrewEngishCalendarService } from "src/app/services/hebrew-engish-calendar.service";
import { Subscription } from "rxjs";
import { DataTable } from "src/app/commons/modules/data-table/DataTable";
import { PaymentCardPopupComponent } from "../../cards/payment-card-popup/payment-card-popup.component";
import { XLSXService } from "src/app/services/xlsx.service";
import { AnalyticsService } from "src/app/services/analytics.service";
declare var $: any;

@Component({
  selector: "app-notification-alerts",
  templateUrl: "./notification-alerts.component.html",
  styleUrls: ["./notification-alerts.component.scss"],
  standalone: false,
})
export class NotificationAlertsComponent implements OnInit {
  @ViewChild(NgbPopover, { static: false }) popContent: NgbPopover;
  @ViewChild(DaterangepickerDirective, { static: false })
  pickerDirective: DaterangepickerDirective;
  //selectedDateRange: any ;
  selectedDateRange: any = {
    startDate: null,
    endDate: null,
  };
  gridFilterData: any = [];
  gridData: any = [];
  popTitle: any;
  totalRecord: number = 0;
  isloading: boolean = false;
  modalOptions: NgbModalOptions;
  recordSelectedArray = [];
  window_class = "drag_popup donor_card father_card";
  isFiltered: boolean = false;
  filterRecord: number = 0;
  isDevEnv: boolean;
  filtercount: number = 1;
  @ViewChild("sv", { static: true }) svTable: DataTable;

  EngHebCalPlaceholder: string = "All Time";
  presetOption: string;
  PageName: any = "NotificationAlert";
  class_id: string;
  class_hid: string;
  private calendarSubscription: Subscription;
  private analytics = inject(AnalyticsService);

  constructor(
    public commonMethodService: CommonMethodService,
    public notificationService: NotificationService,
    private cardService: CardService,
    private campaignService: CampaignService,
    public localstorageService: LocalstoragedataService,
    public notification: notification,
    public hebrewEngishCalendarService: HebrewEngishCalendarService,
    private xlsxService: XLSXService
  ) {}

  ngOnInit() {
    this.analytics.visitedAlerts();
    this.isDevEnv = environment.baseUrl.includes("https://dev-api.donary.com/");
    this.GetAlertData();
  }

  GetAlertData() {
    this.gridFilterData = [];
    this.gridData = [];
    this.totalRecord = this.gridFilterData.length;
    let objNotification = {
      eventGuId: this.localstorageService.getLoginUserEventGuId(),
      fromDate:
        this.selectedDateRange && this.selectedDateRange.startDate != undefined
          ? moment(this.selectedDateRange.startDate).format("YYYY-MM-DD")
          : "",
      toDate:
        this.selectedDateRange && this.selectedDateRange.endDate != undefined
          ? moment(this.selectedDateRange.endDate).format("YYYY-MM-DD")
          : "",
    };
    this.isloading = true;
    this.notificationService.getAlert(objNotification).subscribe((res) => {
      if (res) {
        res = res.filter((item) => item.statusID != 2);
        this.gridData = res;
        this.isloading = false;
        this.gridFilterData = res;
        this.totalRecord = this.gridFilterData.length;
        this.notificationService.alert$.next(this.totalRecord);
      }
    });
  }

  openAddTransactionPopup(donorData) {
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
    modalRef.componentInstance.alertDonorDetails = donorData;
  }

  isRangeSelected = false;
  isinitializeSecond: number = 0;
  datesUpcomingUpdated(event) {
    if (this.isinitializeSecond == 1) {
      this.isloading = true;
      this.selectedDateRange = event;
      this.GetAlertData();
      this.isRangeSelected == true
        ? $("#calendar").removeClass("custom_range")
        : $("#calendar").addClass("custom_range");
      this.isRangeSelected = false;
      if (this.selectedDateRange.startDate && this.selectedDateRange.endDate) {
        this.GetAlertData();
      }
    } else {
      this.GetAlertData();
    }
  }
  emtOutputPageChange(data) {
    this.svTable.setPage(data.activePage, data.rowsOnPage);
  }

  upcomingRangeClicked(event) {
    this.isRangeSelected = true;
  }
  totalSelectedShow(): number {
    return this.recordSelectedArray.length;
  }

  openNotificationSidebarPopup(notificationId, alertId) {
    if (notificationId != null && notificationId != 0) {
      this.modalOptions = {
        centered: true,
        size: "lg",
        backdrop: "static",
        keyboard: true,
        windowClass: "drag_popup donor_card donor_card_payment",
      };
      const modalRef = this.commonMethodService.openPopup(
        NotificationSidebarPopupComponent,
        this.modalOptions
      );
      let eventGuId = this.localstorageService.getLoginUserEventGuId();

      this.notificationService
        .getNotificationById(notificationId, eventGuId)
        .subscribe((res: any) => {
          this.isloading = false;
          res.linkedToAlertID = alertId;
          modalRef.componentInstance.Data = res;
        });
    }
  }

  OpenCampaignCard(campaignId) {
    this.isloading = false;
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup campaign_reason",
    };
    const modalRef = this.commonMethodService.openPopup(
      CampaignCardPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.CampaignID = campaignId;
    const obj = {
      eventGuId: this.localstorageService.getLoginUserEventGuId(),
      campaignId: campaignId,
    };
    this.campaignService.getCampaignCard(obj).subscribe(
      (res: any) => {
        this.isloading = false;
        modalRef.componentInstance.CampaignCardData = res;
        modalRef.componentInstance.CampaignId = campaignId;
      },
      (err) => {
        this.isloading = false;
      }
    );
  }
  openPaymentCardPopup(paymentId, globalId, legalReceiptNum = undefined) {
    if (paymentId != null && paymentId != 0) {
      this.isloading = false;
      this.modalOptions = {
        centered: true,
        size: "lg",
        backdrop: false,
        keyboard: true,
        windowClass: "drag_popup payment_card modal_responsive",
      };
      const modalRef = this.commonMethodService.openPopup(
        PaymentCardPopupComponent,
        this.modalOptions
      );
      var objDonorCard = {
        eventGuId: this.localstorageService.getLoginUserEventGuId(),
        paymentId: paymentId,
      };
      this.cardService.getPaymentCard(objDonorCard).subscribe((res: any) => {
        this.isloading = false;
        res.globalId = globalId;
        modalRef.componentInstance.PaymentCardData = res;
        modalRef.componentInstance.legalReceiptNum = legalReceiptNum;
        modalRef.componentInstance.gridFilterData = this.gridFilterData;
      });
    }
  }
  OpenScheduleCard(scheduleId) {
    if (scheduleId != null && scheduleId != 0) {
      this.isloading = false;
      this.modalOptions = {
        centered: true,
        size: "lg",
        backdrop: "static",
        keyboard: true,
        windowClass: "drag_popup schedule_paymentcard payment-schedule-modal",
      };
      const modalRef = this.commonMethodService.openPopup(
        SchedulePaymentCardPopupComponent,
        this.modalOptions
      );
      var objScheduleCard = {
        eventGuId: this.localstorageService.getLoginUserEventGuId(),
        scheduleId: scheduleId,
      };
      this.cardService.getScheduleCard(objScheduleCard).subscribe(
        (res: any) => {
          modalRef.componentInstance.SchedulePaymentCardData = res;
        },
        (err) => {
          modalRef.close();
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
  }
  OpenDonorCard(donorId) {
    this.isloading = true;
    if (donorId) {
      this.window_class =
        "drag_popup donor_card father_card" +
        "_" +
        this.commonMethodService.initialDonorCard;
      this.modalOptions = {
        centered: true,
        size: "lg",
        backdrop: "static",
        keyboard: true,
        windowClass: this.window_class,
      };
      this.commonMethodService.initialDonorCard += 1;

      var objDonorCard = {
        eventGuId: this.localstorageService.getLoginUserEventGuId(),
        accountId: donorId,
      };
      this.cardService.getDonorCard(objDonorCard).subscribe((res: any) => {
        if (res) {
          const modalRef = this.commonMethodService.openPopup(
            DonorCardPopupComponent,
            this.modalOptions
          );
          this.isloading = false;
          modalRef.componentInstance.DonorCardData = res;
        } else {
          Swal.fire({
            title: "No data found",
            text: "",
            icon: "error",
            confirmButtonText: this.commonMethodService
              .getTranslate("WARNING_SWAL.BUTTON.CONFIRM.OK")
              .commonMethodService.getTranslate(
                "WARNING_SWAL.BUTTON.CONFIRM.OK"
              ),
            customClass: {
              confirmButton: "btn_ok",
            },
          });
        }
      });
    }
  }

  search(keyword) {
    var record = this.gridData;
    keyword = keyword.toLowerCase();
    var filterdRecord;
    if (keyword != "") {
      var searchArray = keyword.split(" ");
      for (var searchValue of searchArray) {
        filterdRecord = record.filter(
          (obj) =>
            (obj.subject &&
              obj.subject.toString().toLowerCase().indexOf(searchValue) > -1) ||
            (obj.recordType &&
              obj.recordType.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.recordNum &&
              obj.recordNum.toLowerCase().toString().indexOf(searchValue) >
                -1) ||
            (obj.recordAmount &&
              obj.recordAmount.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.donorName &&
              obj.donorName.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.campaignName &&
              obj.campaignName.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.source &&
              obj.source.toString().toLowerCase().indexOf(searchValue) > -1)
        );

        this.gridFilterData = filterdRecord;
        this.filterRecord = filterdRecord.length;
        this.isFiltered = true;
      }
    } else {
      this.gridFilterData = this.gridData;
      this.isFiltered = false;
    }
    this.isloading = false;
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

  downloadExcel() {
    this.isloading = true;
    let results = this.gridFilterData.length && this.gridFilterData;
    let data = [];
    if (results) {
      Object.values(results).forEach((item: any) => {
        let row = {};
        row["Subject"] = item && item.subject;
        row["Date & Time"] = item && item.scheduleDate;
        row["Message"] =
          item &&
          item.recordType + "#" + item.recordNum + " of " + item &&
          this.commonMethodService.formatAmount(item.amount) +
            " from " +
            item.donorName +
            " was completed";
        row["Campaign"] = item && item.campaignName;
        row["Source"] = item && item.source;
        data.push(row);
      });
    } else {
      return;
    }

    const filename = this.xlsxService.getFilename("Notification Alert List");
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data, {
      cellStyles: true,
    });
    var range = XLSX.utils.decode_range(worksheet["!ref"]);
    for (var C = range.s.r; C <= range.e.r; ++C) {
      var address = XLSX.utils.encode_col(C) + "1"; // <-- first row, column number C
      if (!worksheet[address]) continue;
      worksheet[address].s = { bold: true };
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
  AddReminderPopup(
    alertId = "",
    accountID = "",
    recordID = "",
    recordType = ""
  ) {
    this.isloading = false;
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup reminder_card modal_responsive",
    };
    const modalRef = this.commonMethodService.openPopup(
      ReminderPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.alertDetails = {
      alertId: alertId,
      accountID: accountID,
      recordID: recordID,
      recordType: recordType,
    };
    modalRef.componentInstance.emtOutputUpdateCard.subscribe((res) => {
      this.GetAlertData();
    });
  }
  removeAlert(item) {
    this.isloading = true;
    let eventGuId = this.localstorageService.getLoginUserEventGuId();
    let obj = {
      eventGuId: eventGuId,
      statusId: 2,
      notificationId: item.alertId,
      typeId: item.typeID,
      loginUserId: this.localstorageService.getLoginUserId(),
    };
    this.notificationService.saveNotification(obj).subscribe(
      (res) => {
        if (res) {
          this.analytics.editedAlertStatus();
          this.isloading = false;
          this.GetAlertData();
          this.notification.showSuccess("Notification removed", "Success !!");
        }
      },
      (error) => {
        this.isloading = false;
        this.notification.showError(error.error, "Error !");
      }
    );
  }

  openHebrewCalendarPopup() {
    this.commonMethodService.featureName = null;
    this.commonMethodService.openCalendarPopup(
      this.class_id,
      this.class_hid,
      this.selectedDateRange,
      false
    );
    this.calendarSubscription = this.commonMethodService
      .getCalendarArray()
      .subscribe((items) => {
        if (
          items &&
          items.pageName == "NotificationAlert" &&
          this.commonMethodService.isCalendarClicked == true
        ) {
          this.commonMethodService.isCalendarClicked = false;
          this.calendarSubscription.unsubscribe();
          if (this.popContent) {
            this.popContent.close();
          }
          this.selectedDateRange = items.obj;
          this.EngHebCalPlaceholder =
            this.hebrewEngishCalendarService.EngHebCalPlaceholder;
          this.presetOption = this.EngHebCalPlaceholder;
          this.class_id = this.hebrewEngishCalendarService.id;
          this.class_hid = this.hebrewEngishCalendarService.hid;
          this.GetAlertData();
        }
      });
  }

  onClickedOutsidePopover(p1: any) {
    if (!(event.target as HTMLElement).closest(".popover")) {
      p1.close();
    } else {
    }
  }

  CalendarFocus() {
    this.pickerDirective.open();
  }
}
