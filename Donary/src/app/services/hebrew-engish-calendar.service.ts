import { Injectable } from "@angular/core";
import { DonaryDateFormatPipe } from "../commons/donary-date-format.pipe";

@Injectable({
  providedIn: "root",
})
export class HebrewEngishCalendarService {
  fromDate: any;
  toDate: any | null = null;
  hebrewFromDate: any;
  hebrewToDate: any | null = null;
  isEngCal = true;
  isPresetClicked = false;
  EngHebCalPlaceholder: string = "Last 7 Days";
  presetClickId: string;
  id: string = "id_Last7days";
  hid: string = "id_Last7days_h";
  hebFromDateTodate: any;
  engFromDateTodate: any;
  isClicked: boolean = false;
  constructor(private datePipe: DonaryDateFormatPipe) {}

  getPlaceHolder(id) {
    switch (id) {
      case "id_today":
      case "id_today_h":
        this.EngHebCalPlaceholder = "Today";
        break;
      case "id_thisweek":
      case "id_thisweek_h":
        this.EngHebCalPlaceholder = "This Week";
        break;
      case "id_Last7days":
      case "id_Last7days_h":
        this.EngHebCalPlaceholder = "Last 7 Days";
        break;
      case "id_ThisMonth":
      case "id_ThisMonth_h":
        this.EngHebCalPlaceholder = "This Month";
        break;
      case "id_LastMonth":
      case "id_LastMonth_h":
        this.EngHebCalPlaceholder = "Last Month";
        break;
      case "id_NextMonth":
      case "id_NextMonth_h":
        this.EngHebCalPlaceholder = "Next Month";
        break;
      case "id_ThisYear":
      case "id_ThisYear_h":
        this.EngHebCalPlaceholder = "This Year";
        break;
      case "id_LastYear":
      case "id_LastYear_h":
        this.EngHebCalPlaceholder = "Last Year";
        break;
      case "id_NextYear":
      case "id_NextYear_h":
        this.EngHebCalPlaceholder = "Next Year";
        break;
      case "id_CustomRange":
        //this.EngHebCalPlaceholder = this.addZeroBeforeSingleDigit(this.fromDate.month)+"/"+ this.addZeroBeforeSingleDigit(this.fromDate.day) +"/"+ this.fromDate.year +"-"+ this.addZeroBeforeSingleDigit(this.toDate.month)+"/"+ this.addZeroBeforeSingleDigit(this.toDate.day) +"/"+ this.toDate.year;
        this.EngHebCalPlaceholder = this.fromDate + "-" + this.toDate;
        break;
      case "id_CustomRange_h":
        //this.EngHebCalPlaceholder = this.addZeroBeforeSingleDigit(this.hebrewFromDate.month)+"/"+ this.addZeroBeforeSingleDigit(this.hebrewFromDate.day) +"/"+ this.hebrewFromDate.year +"-"+ this.addZeroBeforeSingleDigit(this.hebrewToDate.month)+"/"+ this.addZeroBeforeSingleDigit(this.hebrewToDate.day) +"/"+ this.hebrewToDate.year;
        this.EngHebCalPlaceholder =
          this.hebrewFromDate + " - " + this.hebrewToDate;
        break;
      case "id_CustomRange_OneDate":
        this.EngHebCalPlaceholder = this.fromDate;
        break;
      case "id_CustomRangeHibrew_OneDate":
        this.EngHebCalPlaceholder = this.hebrewFromDate;
        break;
      case "id_Clear":
        this.EngHebCalPlaceholder = "All Time";
        break;
      default:
        this.EngHebCalPlaceholder = "Today";
        break;
    }
  }
  addZeroBeforeSingleDigit(item) {
    if (item <= 9) {
      return (item = "0" + item);
    }
    return item;
  }
}
