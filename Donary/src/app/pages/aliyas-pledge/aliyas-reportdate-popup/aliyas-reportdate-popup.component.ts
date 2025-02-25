import { Component, OnInit, Input, ViewChild } from "@angular/core";
import {
  NgbCalendar,
  NgbCalendarHebrew,
  NgbDate,
  NgbDatepicker,
  NgbDatepickerI18n,
  NgbDatepickerI18nHebrew,
  NgbDateStruct,
} from "@ng-bootstrap/ng-bootstrap";
import { HebrewEngishCalendarService } from "src/app/services/hebrew-engish-calendar.service";
import { HDate } from "@hebcal/core";
import * as moment from "moment";
import { EventEmitter, Output } from "@angular/core";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { DonorService } from "src/app/services/donor.service";
import { HttpClient } from "@angular/common/http";
import Swal from "sweetalert2";
import { PdfviewerPopupComponent } from "../../cards/payment-card-popup/pdfviewer-popup/pdfviewer-popup.component";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { NgbModalOptions } from "@ng-bootstrap/ng-bootstrap";

declare var $: any;
@Component({
  selector: "app-aliyas-reportdate-popup",
  templateUrl: "./aliyas-reportdate-popup.component.html",
  standalone: false,
  styleUrls: ["./aliyas-reportdate-popup.component.scss"],
  providers: [
    { provide: NgbCalendar, useClass: NgbCalendarHebrew },
    { provide: NgbDatepickerI18n, useClass: NgbDatepickerI18nHebrew },
  ],
})
export class AliyasReportdatePopupComponent implements OnInit {
  @Output() emtOutput: EventEmitter<any> = new EventEmitter();
  picker: any;

  singleDateClicked = false;
  doubleDateClicked = false;

  isLoading = false;
  @Input("selectedDateRange") calenderData?: any;

  @ViewChild("dp", { static: true }) datepicker: NgbDatepicker;
  model: NgbDateStruct;
  hoveredDate: NgbDate | null = null;

  englishDateFrom: any;
  hebrewDateFrom: any;
  englishDateTo: any;
  hebrewDateTo: any;
  fromDate: any;
  toDate: any | null = null;
  startDate: any;
  modalOptions: NgbModalOptions;
  endDate: any;
  selectedDateRange: any = { startDate: [], endDate: [] };

  isloading = false;
  constructor(
    private calendar: NgbCalendar,
    public i18n: NgbDatepickerI18n,
    public hebrewEngishCalendarService: HebrewEngishCalendarService,
    public commonMethodService: CommonMethodService,
    private localstoragedataService: LocalstoragedataService,
    public donorService: DonorService,
    private http: HttpClient
  ) {
    this.dayTemplateData = this.dayTemplateData.bind(this);
  }
  ngOnInit() {
    this.picker = document.getElementById("datepicker");

    this.selectedDateRange = this.model;
    this.fromDate = this.calendar.getToday();
    this.toDate = this.calendar.getToday();
    setTimeout(() => {
      this.isLoading = false;
    }, 200);
    setTimeout(() => {
      $(".hebrew").addClass("calender-hebrew"), 2000;
    }, 100);
  }
  dayTemplateData(date: NgbDate) {
    return {
      gregorian: (this.calendar as NgbCalendarHebrew).toGregorian(date),
    };
  }

  onDateSelection(date: NgbDate) {
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
    } else if (
      this.fromDate &&
      !this.toDate &&
      date &&
      date.after(this.fromDate)
    ) {
      this.toDate = date;
    } else {
      this.toDate = null;
      this.fromDate = date;
    }

    if (
      this.fromDate &&
      !this.toDate &&
      this.hoveredDate &&
      date.equals(this.fromDate)
    ) {
      if (this.singleDateClicked) {
        this.toDate = this.fromDate;
        this.singleDateClicked = false;
        this.doubleDateClicked = true;
      } else {
        this.singleDateClicked = true;
      }
    }
  }

  isHovered(date: NgbDate) {
    return (
      this.fromDate &&
      !this.toDate &&
      this.hoveredDate &&
      date.after(this.fromDate) &&
      date.before(this.hoveredDate)
    );
  }

  isInside(date: NgbDate) {
    return this.toDate && date.after(this.fromDate) && date.before(this.toDate);
  }

  isRange(date: NgbDate) {
    return (
      date.equals(this.fromDate) ||
      (this.toDate && date.equals(this.toDate)) ||
      this.isInside(date) ||
      this.isHovered(date)
    );
  }

  onActiveCls(event) {
    let id = event.target.id;
    $(".btn-menus").removeClass("active");
    $("#" + id).addClass("active");
  }

  onNavigateToMonth(number: number) {
    let { state } = this.datepicker;
    this.datepicker.navigateTo(
      this.calendar.getNext(state.firstDate, "m", number)
    );
  }

  displayFromHebDate(date) {
    if (date) {
      if (!this.hebrewEngishCalendarService.isPresetClicked) {
        let month = this.i18n.getMonthFullName(date.month, date.year);
        this.hebrewEngishCalendarService.hebrewFromDate =
          date.day + "/" + month + "/" + date.year;
        const hd = new HDate(date.day, month, date.year);
        return hd.renderGematriya(true);
      }
      if (this.hebrewEngishCalendarService.isPresetClicked) {
        this.hebrewEngishCalendarService.hebrewFromDate = this.englishDateFrom;
        return this.hebrewDateFrom;
      }
    }
  }

  displayToHebDate(date) {
    if (date) {
      if (!this.hebrewEngishCalendarService.isPresetClicked) {
        let month = this.i18n.getMonthFullName(date.month, date.year);
        this.hebrewEngishCalendarService.hebrewToDate =
          date.day + "/" + month + "/" + date.year;
        const hd = new HDate(date.day, month, date.year);
        return hd.renderGematriya(true);
      }
      if (this.hebrewEngishCalendarService.isPresetClicked) {
        this.hebrewEngishCalendarService.hebrewToDate = this.englishDateTo;
        return this.hebrewDateTo;
      }
    }
  }

  onClear() {
    this.hebrewEngishCalendarService.getPlaceHolder("id_Clear");
    this.commonMethodService.isReportdropdownOpen = true;
    let obj = {
      startDate: null,
      endDate: null,
    };
    this.emtOutput.emit(obj);
    this.commonMethodService.ReportClicked = true;
    this.commonMethodService.sendReport(true);
    //this.activeModal.dismiss();
  }

  getDateReport() {
    this.commonMethodService.ReportClicked = true;
    this.commonMethodService.isReportdropdownOpen = true;
    this.commonMethodService.sendReport(true);
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup print_receipt",
    };
    let month = this.i18n.getMonthFullName(
      this.fromDate.month,
      this.fromDate.year
    );
    let sdate, edate;
    let startDate = this.fromDate;
    sdate = new HDate(startDate.day, month, startDate.year);
    sdate = sdate.greg();
    let etartDate = this.toDate;
    edate = new HDate(etartDate.day, month, etartDate.year);
    edate = edate.greg();
    var objgetDateReport: any = {};
    objgetDateReport = {
      eventGuid: this.localstoragedataService.getLoginUserEventGuId(),
      fromDate:
        sdate != undefined
          ? sdate != null
            ? moment(sdate).format("YYYY-MM-DD")
            : null
          : null,
      toDate:
        edate != undefined
          ? edate != null
            ? moment(edate).format("YYYY-MM-DD")
            : null
          : null,
    };
    this.donorService.getReportByDate(objgetDateReport).subscribe(
      (res: any) => {
        this.isloading = true;
        const modalRef = this.commonMethodService.openPopup(
          PdfviewerPopupComponent,
          this.modalOptions
        );
        modalRef.componentInstance.Title = "Document print";
        if (res) {
          modalRef.componentInstance.filePath = res;
        }
      },
      (error) => {
        this.isloading = false;
        console.log(error);
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
}
