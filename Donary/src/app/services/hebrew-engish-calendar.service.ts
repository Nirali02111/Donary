import { Injectable } from '@angular/core';
import { DonaryDateFormatPipe } from '../commons/donary-date-format.pipe';

@Injectable({
  providedIn: 'root'
})
export class HebrewEngishCalendarService {
  fromDate: any;
	toDate: any | null = null;
  hebrewFromDate: any;
	hebrewToDate: any | null = null;
  isEngCal =true;
  isPresetClicked = false;
  EngHebCalPlaceholder :string = "Last 7 Days";
  presetClickId:string;
  id:string = 'id_Last7days';
  hid:string = 'id_Last7days_h'
  hebFromDateTodate :any ;
  engFromDateTodate :any ;
  isClicked: boolean =false;
  constructor(private datePipe: DonaryDateFormatPipe) { }

  getPlaceHolder(id) { 
    switch (id) {
      case "id_today" : case "id_today_h":
        this.EngHebCalPlaceholder = "Today";
        break;
      case "id_thisweek" : case "id_thisweek_h":
        this.EngHebCalPlaceholder = "This Week";
        break;
      case "id_Last7days" : case "id_Last7days_h":
        this.EngHebCalPlaceholder = "Last 7 Days";
        break;
      case "id_ThisMonth" :  case "id_ThisMonth_h":
        this.EngHebCalPlaceholder = "This Month";
        break;
      case "id_LastMonth" :  case "id_LastMonth_h":
        this.EngHebCalPlaceholder = "Last Month";
        break;
      case "id_NextMonth" :  case "id_NextMonth_h":
        this.EngHebCalPlaceholder = "Next Month";
        break;
      case "id_ThisYear" : case "id_ThisYear_h":
        this.EngHebCalPlaceholder = "This Year";
        break;
      case "id_LastYear" :  case "id_LastYear_h":
        this.EngHebCalPlaceholder = "Last Year";
        break;
      case "id_NextYear" : case "id_NextYear_h":
        this.EngHebCalPlaceholder = "Next Year";
        break;
      case "id_CustomRange":
        //this.EngHebCalPlaceholder = this.addZeroBeforeSingleDigit(this.fromDate.month)+"/"+ this.addZeroBeforeSingleDigit(this.fromDate.day) +"/"+ this.fromDate.year +"-"+ this.addZeroBeforeSingleDigit(this.toDate.month)+"/"+ this.addZeroBeforeSingleDigit(this.toDate.day) +"/"+ this.toDate.year;
       this.EngHebCalPlaceholder = this.fromDate +"-"+ this.toDate;
        break;
      case "id_CustomRange_h":
        //this.EngHebCalPlaceholder = this.addZeroBeforeSingleDigit(this.hebrewFromDate.month)+"/"+ this.addZeroBeforeSingleDigit(this.hebrewFromDate.day) +"/"+ this.hebrewFromDate.year +"-"+ this.addZeroBeforeSingleDigit(this.hebrewToDate.month)+"/"+ this.addZeroBeforeSingleDigit(this.hebrewToDate.day) +"/"+ this.hebrewToDate.year;
        this.EngHebCalPlaceholder = this.hebrewFromDate+" - "+this.hebrewToDate;
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
  addZeroBeforeSingleDigit(item){
		if(item <=9){
			return item="0"+item;
		}
		return item;
	  }

    // onDateChange(sDate , eDate) {
    //   const today = new Date();
    //   const startDate = new Date(sDate);
    //   const endDate = new Date(eDate);

    //   console.log("in onDateChange sDate is:-",sDate);
    //   console.log("in onDateChange endDate is:-",endDate);
      
    //   const ftoday = this.datePipe.transform(today, 'dd/MM/yyyy');
    //   const fstartDate = this.datePipe.transform(startDate, 'dd/MM/yyyy');
    //   const fendDate = this.datePipe.transform(endDate, 'dd/MM/yyyy');

    //   if (
    //     fstartDate <= ftoday &&
    //     fendDate >= ftoday &&
    //     startDate.getDate() === today.getDate() &&
    //     startDate.getMonth() === today.getMonth() &&
    //     startDate.getFullYear() === today.getFullYear()

    //   ) {
    //     this.id = "id_today"
    //     this.hid = "id_today_h"
    //     this.EngHebCalPlaceholder = 'Today';
    //   } else if (
    //     startDate <= today &&
    //     endDate >= today &&
    //     startDate <= today &&
    //     endDate <= new Date(today.getFullYear(), today.getMonth(), today.getDate() + 6)
    //   ) {
    //     this.id = "id_thisweek"
    //     this.hid = "id_thisweek_h"
    //     this.EngHebCalPlaceholder = 'This Week';
    //   } else if (
    //     fstartDate <= ftoday &&
    //     fendDate >= ftoday &&
    //     startDate >= new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6) &&
    //     fendDate <= ftoday
    //   ) {
    //     this.id = "id_Last7days"
    //     this.hid = "id_Last7days_h"
    //     this.EngHebCalPlaceholder = 'Last 7 Days';
    //   } else if (
    //     startDate.getMonth() === today.getMonth() &&
    //     startDate.getFullYear() === today.getFullYear()
    //   ) {
    //     this.id = "id_ThisMonth"
    //     this.hid = "id_ThisMonth_h"
    //     this.EngHebCalPlaceholder = 'This Month';
    //   } else if (
    //     startDate.getMonth() === today.getMonth() - 1 &&
    //     startDate.getFullYear() === today.getFullYear() && startDate.getMonth() != today.getMonth() && endDate.getMonth() !== today.getMonth() + 1
    //   ) {
    //     this.id = "id_LastMonth"
    //     this.hid = "id_LastMonth_h"
    //     this.EngHebCalPlaceholder = 'Last Month';
    //   } else if (
    //     startDate.getMonth() === today.getMonth() + 1 &&
    //     startDate.getFullYear() === today.getFullYear()
    //   ) {
    //     this.id = "id_NextMonth"
    //     this.hid = "id_NextMonth_h"
    //     this.EngHebCalPlaceholder = 'Next Month';
    //   } else if (startDate.getFullYear() === today.getFullYear()) {
    //     const thisYearStart = new Date(today.getFullYear(), 0, 1);
    //     const formattedStartDate = this.datePipe.transform(thisYearStart, 'dd/MM/yyyy');
        
    //     const thisYearEnd = new Date(today.getFullYear(), 11, 31);
    //     const formattedEndDate = this.datePipe.transform(thisYearEnd, 'dd/MM/yyyy');
        
    //     if (fstartDate == formattedStartDate && fendDate == formattedEndDate) {
    //       this.id = "id_ThisYear"
    //     this.hid = "id_ThisYear_h"
    //       this.EngHebCalPlaceholder = 'This Year';
    //     } else {
    //       this.id = "id_CustomRange"
    //     this.hid = "id_CustomRange_h"
    //       this.EngHebCalPlaceholder = fstartDate+" - "+fendDate;
    //     }
    //   } else if (startDate.getFullYear() === today.getFullYear() - 1) {
    //     this.id = "id_LastYear"
    //     this.hid = "id_LastYear_h"
    //     this.EngHebCalPlaceholder = 'Last Year';
    //   } else if (startDate.getFullYear() === today.getFullYear() + 1) {
    //     this.id = "id_NextYear"
    //     this.hid = "id_NextYear_h"
    //     this.EngHebCalPlaceholder = 'Next Year';
    //   } else {
    //     this.id = "id_CustomRange"
    //     this.hid = "id_CustomRange_h"
    //     this.EngHebCalPlaceholder = startDate+" - "+startDate;;
    //   }
    // }
  
     
}
