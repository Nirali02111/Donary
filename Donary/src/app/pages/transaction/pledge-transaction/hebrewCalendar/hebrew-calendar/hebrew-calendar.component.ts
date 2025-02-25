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
import { UntypedFormControl } from "@angular/forms";
import { HebrewEngishCalendarService } from "src/app/services/hebrew-engish-calendar.service";
import { HDate } from "@hebcal/core";
import * as moment from "moment";

import { CommonMethodService } from "src/app/commons/common-methods.service";
import { CommonHebrewEnglishCalendarService } from "../common-hebrew-english-calendar.service";
declare var $: any;
interface DateObject {
  day: number;
  month: number;
  year: number;
}
@Component({
  selector: "app-hebrew-calendar",
  templateUrl: "./hebrew-calendar.component.html",
  styleUrls: ["./hebrew-calendar.component.scss"],
  standalone: false,
  providers: [
    { provide: NgbCalendar, useClass: NgbCalendarHebrew },
    { provide: NgbDatepickerI18n, useClass: NgbDatepickerI18nHebrew },
  ],
})
export class HebrewCalendarComponent implements OnInit {
  isLoading = false;
  @Input("selectedDateRange") calenderData?: any;
  @Input() selectedDateRange: any;
  @Input() class_hid: string;
  @Input() isOneDate: boolean = false;
  @Input() isSchedule: boolean = false;
  @Input() pageName: any;
  @ViewChild("dp", { static: true }) datepicker: NgbDatepicker;
  model: NgbDateStruct;
  hoveredDate: NgbDate | null = null;

  startDateObject: DateObject;
  endDateObject: DateObject;
  convertedFromDate: any;
  convertedToDate: any | null = null;
  id: string;
  singleDateClicked = false;
  doubleDateClicked = false;

  hebrewSDate: NgbDate;
  hebrewEDate: NgbDate;
  minDate = undefined;

  fromDateControl: UntypedFormControl;
  toDateControl: UntypedFormControl;

  englishDateFrom: any;
  hebrewDateFrom: any;
  englishDateTo: any;
  hebrewDateTo: any;
  fromDate: any;
  toDate: any | null = null;
  monthNum: number = 2;
  constructor(
    private calendar: NgbCalendar,
    public i18n: NgbDatepickerI18n,
    public hebrewEngishCalendarService: HebrewEngishCalendarService,
    public commonMethodService: CommonMethodService,
    private commonHebrewEnglishCalendarService: CommonHebrewEnglishCalendarService
  ) {
    this.dayTemplateData = this.dayTemplateData.bind(this);
  }
  ngOnInit() {
    if (this.commonMethodService.isScheduleHebrewCalendar && this.isSchedule) {
      const current = new Date();

      const hebrewStartDate = new HDate(current);
      const sHebrewYear = hebrewStartDate.getFullYear();
      const sHebrewMonth = hebrewStartDate.getTishreiMonth();
      const sHebrewDay = hebrewStartDate.getDate();

      this.minDate = {
        year: sHebrewYear,
        month: sHebrewMonth,
        day: sHebrewDay,
      };
    }

    if (this.isOneDate) {
      this.monthNum = 1;
    }
    //code for by default 7 days started
    let today = this.calendar.getToday();
    let last7days = this.calendar.getPrev(today, "d", 6);
    this.fromDate = last7days;
    this.toDate = today;

    this.id = this.hebrewEngishCalendarService.hid;
    this.hebrewEngishCalendarService.presetClickId = this.id;

    if (this.class_hid != null && this.class_hid != undefined) {
      this.id = this.class_hid;
    }

    $(".btn-menus").removeClass("active");
    $("#" + this.id).addClass("active");
    this.updatePreviousDateSelection();
    //code for by default 7 days started ended

    let tPostion = $("#datehebwrapper").offset();
    setTimeout(() => {
      this.isLoading = false;
    }, 200);

    setTimeout(() => {
      $(".calender-modal .modal-dialog").css(
        "left",
        +tPostion ? tPostion.left : null
      );
      $(".calender-modal .modal-dialog").css(
        "top",
        +tPostion ? tPostion.top + 40 : null
      );
      $(".hebrew").addClass("calender-hebrew"), 2000;
    }, 100);

    this.fromDateControl = new UntypedFormControl(
      this.displayFromHebDate(this.fromDate)
    );
    this.toDateControl = new UntypedFormControl(
      this.displayToHebDate(this.toDate)
    );

    this.fromDateControl.valueChanges.subscribe((value) => {
      this.convertedFromDate = value;
      this.hebrewEngishCalendarService.hebrewFromDate = this.convertedFromDate;
      this.onCustomRangeActiveCls();
    });

    this.toDateControl.valueChanges.subscribe((value) => {
      this.convertedToDate = value;
      this.hebrewEngishCalendarService.hebrewToDate = this.convertedToDate;
      this.onCustomRangeActiveCls();
    });
    this.commonHebrewEnglishCalendarService.setActiveButtonBasedOnDateRange(
      this.selectedDateRange,
      "h_cal"
    );
  }

  ngAfterViewInit() {
    this.id =
      this.commonHebrewEnglishCalendarService.setActiveButtonBasedOnDateRange(
        this.selectedDateRange,
        "h_cal"
      );

    $(".btn-menus").removeClass("active");
    $("#" + this.id).addClass("active");
  }

  dayTemplateData(date: NgbDate) {
    return {
      gregorian: (this.calendar as NgbCalendarHebrew).toGregorian(date),
    };
  }

  selectToday() {
    this.model = this.calendar.getToday();
  }
  onDateSelection(date: NgbDate) {
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
    } else if (this.fromDate && !this.toDate && date.after(this.fromDate)) {
      this.toDate = date;
    } else {
      if (!this.isOneDate) {
        this.toDate = null;
      }
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

    this.hebrewEngishCalendarService.isPresetClicked = false;
    this.onCustomRangeActiveCls();
    this.convertedFromDate = this.displayFromHebDate(this.fromDate);
    this.convertedToDate = this.isOneDate
      ? null
      : this.displayToHebDate(this.toDate);
    this.hebrewEngishCalendarService.hebFromDateTodate = this.fromDate;
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
  onThisWeek(event) {
    this.datepicker.navigateTo(this.calendar.getToday());
    this.hebrewEngishCalendarService.isPresetClicked = false;
    this.onActiveCls(event);

    //code to convert Gregorian date to Hebrew date started
    let fromWeek = moment().startOf("week").toDate();
    let endweek = moment().endOf("week").toDate();

    const hebrewStartDate = new HDate(fromWeek);
    const sHebrewYear = hebrewStartDate.getFullYear();
    const sHebrewMonth = hebrewStartDate.getTishreiMonth();
    const sHebrewDay = hebrewStartDate.getDate();

    const hebrewEndDate = new HDate(endweek);
    const eHebrewYear = hebrewEndDate.getFullYear();
    const eHebrewMonth = hebrewEndDate.getTishreiMonth();
    const eHebrewDay = hebrewEndDate.getDate();

    this.fromDate = new NgbDate(sHebrewYear, sHebrewMonth, sHebrewDay);
    this.toDate = new NgbDate(eHebrewYear, eHebrewMonth, eHebrewDay);
  }
  navigate(number: number) {
    let { state } = this.datepicker;
    this.datepicker.navigateTo(
      this.calendar.getNext(state.firstDate, "m", number)
    );
  }
  onToday(event) {
    this.hebrewEngishCalendarService.isPresetClicked = false;
    this.onActiveCls(event);
    this.fromDate = this.calendar.getToday();
    this.toDate = this.calendar.getToday();
  }
  dateConvert(date) {
    if (date) {
      return (
        date.day +
        "/" +
        this.i18n.getMonthFullName(date.month, date.year) +
        "/" +
        date.year
      );
    }
  }
  onThisMonth(event) {
    this.datepicker.navigateTo(this.calendar.getToday());
    this.hebrewEngishCalendarService.isPresetClicked = false;
    this.onActiveCls(event);
    let today = this.calendar.getToday();

    let lastDate = new Date(today.year, today.month, 0, 23, 59, 59);
    let ldate = lastDate.getDate();
    this.toDate = { year: today.year, month: today.month, day: ldate };
    this.fromDate = { year: today.year, month: today.month, day: 1 };
  }
  onLastMonth(event, number: number) {
    this.datepicker.navigateTo(this.calendar.getToday());
    this.hebrewEngishCalendarService.isPresetClicked = false;
    this.onActiveCls(event);
    let { state } = this.datepicker;
    let date = this.calendar.getNext(state.firstDate, "m", number);
    this.fromDate = date;
    let currentMonth = this.calendar.getNext(state.firstDate, "m", 0);
    const hd = new HDate(
      currentMonth.day,
      currentMonth.month,
      currentMonth.year
    );
    this.toDate = hd.prev();
    this.datepicker.navigateTo(
      this.calendar.getNext(state.firstDate, "m", number)
    );
  }
  onNextMonth(event, number: number) {
    this.onActiveCls(event);
    this.datepicker.navigateTo(this.calendar.getToday());
    this.hebrewEngishCalendarService.isPresetClicked = false;
    let { state } = this.datepicker;
    let date = this.calendar.getNext(state.firstDate, "m", number);
    this.toDate = this.datepicker.model.months[1].lastDate;
    this.fromDate = date;
  }
  onLastYear(event, number: number) {
    this.datepicker.navigateTo(this.calendar.getToday());
    this.hebrewEngishCalendarService.isPresetClicked = false;
    this.onActiveCls(event);
    let { state } = this.datepicker;
    let date = this.calendar.getNext(state.firstDate, "y", number);
    this.fromDate = date;
    this.toDate = this.calendar.getNext(state.lastDate, "y", 0);
  }
  onThisYear(event) {
    this.datepicker.navigateTo(this.calendar.getToday());
    this.hebrewEngishCalendarService.isPresetClicked = false;
    this.onActiveCls(event);
    let { state } = this.datepicker;
    let date = this.calendar.getNext(state.firstDate, "y", 0);
    this.fromDate = date;
    this.toDate = this.calendar.getNext(state.lastDate, "y", 1);
  }
  onLast7days(event) {
    this.datepicker.navigateTo(this.calendar.getToday());
    this.hebrewEngishCalendarService.isPresetClicked = false;
    this.onActiveCls(event);
    let today = this.calendar.getToday();
    let last7days = this.calendar.getPrev(today, "d", 6);
    this.fromDate = last7days;
    this.toDate = today;
  }
  changeLang() {
    this.hebrewEngishCalendarService.isEngCal = false;
  }
  onActiveCls(event) {
    this.id = event.target.id;
    $(".btn-menus").removeClass("active");
    $("#" + this.id).addClass("active");
    this.hebrewEngishCalendarService.presetClickId = this.id;
    this.hebrewEngishCalendarService.hid = this.id;
  }
  onNavigateToYear(number: number) {
    let { state } = this.datepicker;
    this.datepicker.navigateTo(
      this.calendar.getNext(state.firstDate, "y", number)
    );
  }
  onCustomRange(event) {
    this.onActiveCls(event);
  }
  onCustomRangeActiveCls() {
    $(".btn-menus").removeClass("active");
    $("#id_CustomRange").addClass("active");
    this.hebrewEngishCalendarService.presetClickId = "id_CustomRange_h";
    this.hebrewEngishCalendarService.hid = "id_CustomRange_h";
    this.hebrewEngishCalendarService.hebrewFromDate = this.fromDate;
    this.hebrewEngishCalendarService.hebrewToDate = this.toDate;
    if (this.isOneDate) {
      this.hebrewEngishCalendarService.presetClickId =
        "id_CustomRangeHibrew_OneDate";
      this.hebrewEngishCalendarService.id = "id_CustomRangeHibrew_OneDate";
    }
  }
  onNavigateToMonth(number: number) {
    let { state } = this.datepicker;
    this.datepicker.navigateTo(
      this.calendar.getNext(state.firstDate, "m", number)
    );
  }
  onNextYear(event, number: number) {
    this.datepicker.navigateTo(this.calendar.getToday());
    this.hebrewEngishCalendarService.isPresetClicked = false;
    this.onActiveCls(event);
    let { state } = this.datepicker;
    let date = this.calendar.getNext(state.firstDate, "y", 1);
    this.fromDate = date;
    this.toDate = this.calendar.getNext(state.lastDate, "y", 2);
  }
  displayFromHebDate(date) {
    if (date) {
      if (!this.hebrewEngishCalendarService.isPresetClicked) {
        let month = this.i18n.getMonthFullName(date.month, date.year);
        this.hebrewEngishCalendarService.hebrewFromDate =
          date.day + "/" + month + "/" + date.year;
        let monthName = month.replace("׳", "");
        let monthNumHeb = HDate.monthFromName(monthName);
        let hd = new HDate(date.day, monthNumHeb, date.year);
        this.hebrewEngishCalendarService.hebrewFromDate = hd;
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
        let monthName = month.replace("׳", "");
        let monthNumHeb = HDate.monthFromName(monthName);
        let hd = new HDate(date.day, monthNumHeb, date.year);
        this.hebrewEngishCalendarService.hebrewToDate = hd;
        return hd.renderGematriya(true);
      }
      if (this.hebrewEngishCalendarService.isPresetClicked) {
        this.hebrewEngishCalendarService.hebrewToDate = this.englishDateTo;
        return this.hebrewDateTo;
      }
    }
  }

  updatePreviousDateSelection() {
    if (this.isSchedule)
      this.selectedDateRange.startDate = this.selectedDateRange;
    if (
      this.selectedDateRange.startDate != null &&
      !this.selectedDateRange.endDate
    ) {
      const startDate = new Date(this.selectedDateRange.startDate);

      // Convert Gregorian startDate to Hebrew date
      const sday = startDate.getDate();
      const smonth = startDate.getMonth() + 1; // Months are zero-based in JavaScript
      const syear = startDate.getFullYear();

      const hebrewStartDate = new HDate(startDate);
      const sHebrewYear = hebrewStartDate.getFullYear();
      const sHebrewMonth = hebrewStartDate.getTishreiMonth();
      const sHebrewDay = hebrewStartDate.getDate();

      this.hebrewSDate = new NgbDate(sHebrewYear, sHebrewMonth, sHebrewDay);
      this.fromDate = this.hebrewSDate;
      this.toDate = this.fromDate;
    }

    if (this.selectedDateRange.endDate != null) {
      const endDate = new Date(this.selectedDateRange.endDate);

      // Convert Gregorian endDate to Hebrew date
      const eday = endDate.getDate();
      const emonth = endDate.getMonth() + 1; // Months are zero-based in JavaScript
      const eyear = endDate.getFullYear();

      const hebrewEndDate = new HDate(endDate);
      const eHebrewYear = hebrewEndDate.getFullYear();
      const eHebrewMonth = hebrewEndDate.getTishreiMonth();
      const eHebrewDay = hebrewEndDate.getDate();

      this.hebrewEDate = new NgbDate(eHebrewYear, eHebrewMonth, eHebrewDay);
      this.toDate = this.hebrewEDate;
    }

    /* else{
		//new logic
			if(this.hebrewEngishCalendarService.hebFromDateTodate){
				this.fromDate = this.hebrewEngishCalendarService.hebFromDateTodate;
				this.toDate = this.fromDate;
			}
		} */
    this.convertedFromDate = this.displayFromHebDate(this.fromDate);
    this.convertedToDate = this.displayToHebDate(this.toDate);
    this.datepicker.navigateTo(this.fromDate);
  }

  isOneDateRange(date: NgbDate) {
    return date.equals(this.fromDate);
  }

  isPastDate(date: NgbDate): boolean {
    if (this.commonMethodService.isScheduleHebrewCalendar && this.isSchedule) {
      const current = new Date();
      const hebrewStartDate = new HDate(current);
      let today = new NgbDate(
        hebrewStartDate.getFullYear(),
        hebrewStartDate.getTishreiMonth(),
        hebrewStartDate.getDate()
      );
      return date.before(today);
    }
  }

  ngOnDestroy() {
    this.commonMethodService.isScheduleHebrewCalendar = false;
  }
  onAllTime(event) {
    this.onActiveCls(event);
    this.fromDate = null;
    this.toDate = null;
  }
}
