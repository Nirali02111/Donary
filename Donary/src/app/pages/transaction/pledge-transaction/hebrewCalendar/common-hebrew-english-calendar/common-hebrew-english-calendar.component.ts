import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { HebrewEngishCalendarService } from "src/app/services/hebrew-engish-calendar.service";
import * as moment from "moment";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";

declare var $: any;
@Component({
  selector: "app-common-hebrew-english-calendar",
  templateUrl: "./common-hebrew-english-calendar.component.html",
  styleUrls: ["./common-hebrew-english-calendar.component.scss"],
  standalone: false,
})
export class CommonHebrewEnglishCalendarComponent implements OnInit {
  isClearClick = false;
  @Output() emtOutput: EventEmitter<any> = new EventEmitter();

  isEngCal = true;
  selectedDateRange: any = {
    startDate: moment(new Date()).subtract(6, "days"),
    endDate: moment(new Date()),
  };
  class_id: string;
  class_hid: string;

  isSendUpgradeEmail: boolean;
  isdisabled: boolean = false;
  @Input() set data(item: any) {
    if (item) {
      if (item) {
        this.selectedDateRange = item;
      }
    }
  }
  @Input() isOneDate: boolean;
  @Input() isSchedule: boolean = false;
  @Input() pageName: any;

  constructor(
    public hebrewEngishCalendarService: HebrewEngishCalendarService,
    public commonMethodService: CommonMethodService,
    private localStorageDataService: LocalstoragedataService
  ) {}

  ngOnInit() {
    this.getFeatureSettingValues();
    this.isSendUpgradeEmail = this.commonMethodService.isSendUpgradeSettings;
    this.hebrewEngishCalendarService.isClicked = true;
  }

  changeLang() {
    this.isEngCal = this.isEngCal ? false : true;
  }
  dateConvert(date) {
    if (date) {
      return date.day + "/" + date.month + "/" + date.year;
    }
  }

  onApply() {
    let sdate, edate, ef, el;
    if (!this.isEngCal) {
      let hebrewFDate = $("#heb_startDate").val();
      let hebrewTDate = $("#heb_endDate").val();
      if (hebrewFDate != "") {
        if (!this.hebrewEngishCalendarService.isPresetClicked) {
          //code started for fromDate
          let gregFDate =
            this.hebrewEngishCalendarService.hebrewFromDate.greg();
          sdate = gregFDate;
        } else {
          sdate = this.hebrewEngishCalendarService.hebrewFromDate;
        }
      } else {
        sdate = undefined;
      }
      if (hebrewFDate != "") {
        if (!this.hebrewEngishCalendarService.isPresetClicked) {
          //code started for fromDate
          if (!this.isOneDate) {
            let gregTDate =
              this.hebrewEngishCalendarService.hebrewToDate.greg();
            edate = gregTDate;
          }
        } else {
          edate = this.hebrewEngishCalendarService.hebrewToDate;
        }
      } else {
        edate = undefined;
      }
      this.hebrewEngishCalendarService.getPlaceHolder(
        this.hebrewEngishCalendarService.presetClickId
      );
      if (this.isOneDate) {
        this.hebrewEngishCalendarService.EngHebCalPlaceholder = hebrewFDate;
      }
      this.commonMethodService.isScheduleHebrewCalendar = false;
    } else {
      const eventCurrency = this.localStorageDataService.getUserEventCurrency();
      const isUSA = eventCurrency === "USD";

      let fdate = $("#eng_startDate").val();
      let fspt = fdate.split("/");

      if (isUSA) {
        ef = new Date(fspt[0] + "/" + fspt[1] + "/" + fspt[2]);
      } else {
        ef = new Date(fspt[1] + "/" + fspt[0] + "/" + fspt[2]);
      }

      if (!this.isOneDate) {
        let ldate = $("#eng_endDate").val();
        let lspt = ldate.split("/");
        if (isUSA) {
          el = new Date(lspt[0] + "/" + lspt[1] + "/" + lspt[2]);
        } else {
          el = new Date(lspt[1] + "/" + lspt[0] + "/" + lspt[2]);
        }
      }
      this.hebrewEngishCalendarService.getPlaceHolder(
        this.hebrewEngishCalendarService.presetClickId
      );
      if (this.isOneDate) {
        this.hebrewEngishCalendarService.EngHebCalPlaceholder = fdate;
      }
    }
    let obj: any = {
      obj: {
        startDate: !this.isEngCal ? sdate : ef,
        endDate: !this.isEngCal ? edate : el,
      },
      pageName: this.pageName,
    };

    this.hebrewEngishCalendarService.isEngCal = this.isEngCal;
    this.commonMethodService.isScheduleCalendar = false;
    this.commonMethodService.isCalendarClicked = true;
    const startDate = obj.obj.startDate;
    const endDate = obj.obj.endDate;
    if (this.isOneDate) {
      if (isNaN(startDate.getTime())) {
        this.onClear();
        return;
      }
    } else {
      if (!this.isEngCal && sdate == undefined) {
        this.onClear();
        return;
      }
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        this.onClear();
        return;
      }
    }

    this.commonMethodService.sendCalendarArray(obj);
    this.emtOutput.emit(obj);
  }
  switchCalendar(event) {
    this.isEngCal = this.isEngCal ? false : true;
    if (!this.isEngCal)
      this.commonMethodService.isScheduleHebrewCalendar = true;
    else this.commonMethodService.isScheduleCalendar = true;
  }

  onValueChange(value: any) {
    if (value) {
      this.isdisabled = true;
    } else {
      this.isdisabled = false;
    }
  }

  onClear() {
    this.hebrewEngishCalendarService.getPlaceHolder("id_Clear");
    let obj: any = {
      obj: {
        startDate: null,
        endDate: null,
      },
      pageName: this.pageName,
    };
    this.commonMethodService.isCalendarClicked = true;
    this.commonMethodService.sendCalendarArray(obj);
    this.emtOutput.emit(obj);
  }

  onUpgrade() {
    this.commonMethodService.commenSendUpgradeEmail(
      this.commonMethodService.featureDisplayName
    );
  }

  getFeatureSettingValues() {
    this.commonMethodService.getFeatureSettingValues();
  }
}
