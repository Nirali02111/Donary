import {
  Component,
  OnInit,
  ViewChild,
  Output,
  EventEmitter,
  Input,
  SimpleChanges,
} from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import * as moment from "moment";
import { DaterangepickerDirective } from "ngx-daterangepicker-material";
import { CommonMethodService } from "src/app/commons/common-methods.service";

import { DateRange } from "./model";

@Component({
  selector: "app-donary-date-picker",
  templateUrl: "./donary-date-picker.component.html",
  standalone: false,
  styleUrls: ["./donary-date-picker.component.scss"],
})
export class DonaryDatePickerComponent implements OnInit {
  @ViewChild(DaterangepickerDirective, { static: false })
  pickerDirective: DaterangepickerDirective;
  @Output() emtDatesUpdated: EventEmitter<DateRange> = new EventEmitter();

  selectedDateRange: DateRange;

  @Input("isFullView") isFullView: boolean = true;

  disabledField: boolean = false;
  @Input("IsDisabled") IsDisabled: boolean = false;

  @Input() set SelectedDateRange(value: DateRange) {
    if (value && value.startDate !== null) {
      this.selectedDateRange = value;
    }
  }

  isInitialize: boolean = false;

  // Date-range picker related properties
  open: string = "left";
  drop: string = "down";
  showClearButton: boolean = true;
  alwaysShowCalendars: boolean = true;
  showRangeLabelOnInput: boolean = true;
  placeholder: string = "All time";
  showCustomRangeLabel: boolean = true;

  ranges: any = {
    Today: [moment(new Date()), moment(new Date())],
    Yesterday: [
      moment(new Date()).subtract(1, "days"),
      moment(new Date()).subtract(1, "days"),
    ],

    "This Week": [
      moment(new Date()).startOf("week"),
      moment(new Date()).endOf("week"),
    ],
    "Last Week": [
      moment(new Date()).subtract(1, "week").startOf("week"),
      moment(new Date()).subtract(1, "week").endOf("week"),
    ],
    "Last 7 Days": [moment(new Date()).subtract(6, "days"), moment(new Date())],
    "Last 30 Days": [
      moment(new Date()).subtract(30, "days"),
      moment(new Date()),
    ],
    "This Month": [
      moment(new Date()).startOf("month"),
      moment(new Date()).endOf("month"),
    ],
    "Last Month": [
      moment(new Date()).subtract(1, "month").startOf("month"),
      moment(new Date()).subtract(1, "month").endOf("month"),
    ],
    "This Year": [
      moment(new Date()).startOf("year"),
      moment(new Date()).endOf("year"),
    ],
    "Last Year": [
      moment(new Date()).subtract(1, "year").startOf("year"),
      moment(new Date()).subtract(1, "year").endOf("year"),
    ],
  };

  hebranges: any = {
    היום: [new Date(), new Date()],
    אתמול: [
      moment(new Date()).subtract(1, "days"),
      moment(new Date()).subtract(1, "days"),
    ],

    השבוע: [
      moment(new Date()).startOf("week"),
      moment(new Date()).endOf("week"),
    ],
    "שבוע שעבר": [
      moment(new Date()).subtract(1, "week").startOf("week"),
      moment(new Date()).subtract(1, "week").endOf("week"),
    ],

    "הימים האחרונים 7 ": [
      moment(new Date()).subtract(6, "days"),
      moment(new Date()),
    ],
    "30 הימים האחרונים": [
      moment(new Date()).subtract(29, "days"),
      moment(new Date()),
    ],
    החודש: [
      moment(new Date()).startOf("month"),
      moment(new Date()).endOf("month"),
    ],
    "חודש שעבר": [
      moment(new Date()).subtract(1, "month").startOf("month"),
      moment(new Date()).subtract(1, "month").endOf("month"),
    ],
    השנה: [
      moment(new Date()).startOf("year"),
      moment(new Date()).endOf("year"),
    ],
    "שנה שעברה": [
      moment(new Date()).subtract(1, "year").startOf("year"),
      moment(new Date()).subtract(1, "year").endOf("year"),
    ],
  };

  halfRanges: any = {
    Today: [moment(new Date()), moment(new Date())],
    Yesterday: [
      moment(new Date()).subtract(1, "days"),
      moment(new Date()).subtract(1, "days"),
    ],

    "This Week": [
      moment(new Date()).startOf("week"),
      moment(new Date()).endOf("week"),
    ],
    "Last Week": [
      moment(new Date()).subtract(1, "week").startOf("week"),
      moment(new Date()).subtract(1, "week").endOf("week"),
    ],
    "This Month": [
      moment(new Date()).startOf("month"),
      moment(new Date()).endOf("month"),
    ],
    "Last Month": [
      moment(new Date()).subtract(1, "month").startOf("month"),
      moment(new Date()).subtract(1, "month").endOf("month"),
    ],
    "This Year": [
      moment(new Date()).startOf("year"),
      moment(new Date()).endOf("year"),
    ],
    "Last Year": [
      moment(new Date()).subtract(1, "year").startOf("year"),
      moment(new Date()).subtract(1, "year").endOf("year"),
    ],
  };

  halfHebRanges: any = {
    היום: [moment(new Date()), moment(new Date())],
    אתמול: [
      moment(new Date()).subtract(1, "days"),
      moment(new Date()).subtract(1, "days"),
    ],

    השבוע: [
      moment(new Date()).startOf("week"),
      moment(new Date()).endOf("week"),
    ],
    "שבוע שעבר": [
      moment(new Date()).subtract(1, "week").startOf("week"),
      moment(new Date()).subtract(1, "week").endOf("week"),
    ],
    החודש: [
      moment(new Date()).startOf("month"),
      moment(new Date()).endOf("month"),
    ],
    "חודש שעבר": [
      moment(new Date()).subtract(1, "month").startOf("month"),
      moment(new Date()).subtract(1, "month").endOf("month"),
    ],
    השנה: [
      moment(new Date()).startOf("year"),
      moment(new Date()).endOf("year"),
    ],
    "שנה שעברה": [
      moment(new Date()).subtract(1, "year").startOf("year"),
      moment(new Date()).subtract(1, "year").endOf("year"),
    ],
  };

  locale: any = {
    customRangeLabel: "Custom range",
    applyLabel: "Apply",
    clearLabel: "Clear",
  };
  heblocale: any = {
    customRangeLabel: "מתואם אישית",
    applyLabel: "החל",
    clearLabel: "נקה",
  };

  constructor(
    public translate: TranslateService,
    private commonMethodService: CommonMethodService
  ) {
    this.translate.setDefaultLang("en");
  }

  ngOnInit() {
    if (this.commonMethodService.isHebrew == true) {
      this.ranges = this.hebranges;
      this.halfRanges = this.halfHebRanges;
      this.locale = this.heblocale;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.IsDisabled) {
      this.disabledField = changes.IsDisabled.currentValue;
    }
  }

  getCmpContainerCls() {
    return this.isFullView ? "" : "half_view";
  }

  checkIsDisable() {
    return this.disabledField ? "" : null;
  }

  datesUpdated(event: DateRange) {
    if (this.isInitialize) {
      this.emtDatesUpdated.emit(event);
      return;
    }

    if (
      event.startDate === null &&
      event.endDate === null &&
      this.isInitialize === false
    ) {
      this.isInitialize = true;
      return;
    }
  }

  CalendarFocus() {
    if (this.disabledField) {
      return;
    }

    this.pickerDirective.open();
  }
}
