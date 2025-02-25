import { Injectable } from "@angular/core";
import moment from "moment";

@Injectable({
  providedIn: "root",
})
export class CommonHebrewEnglishCalendarService {
  constructor() {}

  setActiveButtonBasedOnDateRange(selectedDateRange, cal_type) {
    let activeButtonId = "id_CustomRange";
    // Default to custom range
    if (
      this.isSameDay(selectedDateRange.startDate, selectedDateRange.endDate)
    ) {
      if (cal_type == "e_cal") {
        return (activeButtonId = "id_today");
      } else {
        return (activeButtonId = "id_today_h");
      }
    }
    if (
      this.isThisWeek(selectedDateRange.startDate, selectedDateRange.endDate)
    ) {
      if (cal_type == "e_cal") {
        return (activeButtonId = "id_thisweek");
      } else {
        return (activeButtonId = "id_thisweek_h");
      }
    }
    if (
      this.isLast7Days(selectedDateRange.startDate, selectedDateRange.endDate)
    ) {
      if (cal_type == "e_cal") {
        return (activeButtonId = "id_Last7days");
      } else {
        return (activeButtonId = "id_Last7days_h");
      }
    }
    if (
      this.isThisMonth(selectedDateRange.startDate, selectedDateRange.endDate)
    ) {
      if (cal_type == "e_cal") {
        return (activeButtonId = "id_ThisMonth");
      } else {
        return (activeButtonId = "id_ThisMonth_h");
      }
    }
    if (
      this.isLastMonth(selectedDateRange.startDate, selectedDateRange.endDate)
    ) {
      if (cal_type == "e_cal") {
        return (activeButtonId = "id_LastMonth");
      } else {
        return (activeButtonId = "id_LastMonth_h");
      }
    }
    if (
      this.isNextMonth(selectedDateRange.startDate, selectedDateRange.endDate)
    ) {
      if (cal_type == "e_cal") {
        return (activeButtonId = "id_NextMonth");
      } else {
        return (activeButtonId = "id_NextMonth_h");
      }
    }
    if (
      this.isThisYear(selectedDateRange.startDate, selectedDateRange.endDate)
    ) {
      if (cal_type == "e_cal") {
        return (activeButtonId = "id_ThisYear");
      } else {
        return (activeButtonId = "id_ThisYear_h");
      }
    }
    if (
      this.isLastYear(selectedDateRange.startDate, selectedDateRange.endDate)
    ) {
      if (cal_type == "e_cal") {
        return (activeButtonId = "id_LastYear");
      } else {
        return (activeButtonId = "id_LastYear_h");
      }
    }
    if (
      this.isNextYear(selectedDateRange.startDate, selectedDateRange.endDate)
    ) {
      if (cal_type == "e_cal") {
        return (activeButtonId = "id_NextYear");
      } else {
        return (activeButtonId = "id_NextYear_h");
      }
    }
    if (!selectedDateRange.startDate && !selectedDateRange.endDate) {
      if (cal_type == "e_cal") {
        return (activeButtonId = "id_AllTime");
      } else {
        return (activeButtonId = "id_AllTime_h");
      }
    }
    if (cal_type == "e_cal") {
      return (activeButtonId = "id_CustomRange");
    } else {
      return (activeButtonId = "id_CustomRange_h");
    }
  }

  isSameDay(startDate, endDate) {
    const today = moment();
    return (
      moment(startDate).isSame(today, "day") &&
      moment(endDate).isSame(today, "day")
    );
  }
  isThisWeek(fromDate, toDate) {
    const startOfWeek = moment().startOf("week");
    const endOfWeek = moment().endOf("week");
    return (
      moment(fromDate).isBetween(startOfWeek, endOfWeek, null, "[]") &&
      moment(toDate).isBetween(startOfWeek, endOfWeek, null, "[]")
    );
  }

  isLast7Days(fromDate, toDate) {
    const today = moment();
    const last7Days = moment().subtract(6, "days");
    return (
      moment(fromDate).isSameOrAfter(last7Days, "day") &&
      moment(toDate).isSameOrBefore(today, "day")
    );
  }

  isThisMonth(fromDate, toDate) {
    const fromMoment = moment(fromDate);
    const toMoment = moment(toDate);

    const startOfMonth = moment().startOf("month");
    const endOfMonth = moment().endOf("month");

    // Check if the fromDate and toDate are in the current month
    if (
      fromMoment.isSame(startOfMonth, "month") &&
      toMoment.isSame(endOfMonth, "month")
    ) {
      // Check if fromDate is the first day of the current month
      const isFirstDayOfMonth = fromMoment.isSame(startOfMonth, "day");
      // Check if toDate is the last day of the current month
      const isLastDayOfMonth = toMoment.isSame(endOfMonth, "day");
      if (isFirstDayOfMonth && isLastDayOfMonth) {
        return true;
      }
    }

    return false;
  }

  isLastMonth(fromDate, toDate) {
    const fromMoment = moment(fromDate);
    const toMoment = moment(toDate);

    const lastMonthStart = moment().subtract(1, "months").startOf("month");
    const lastMonthEnd = moment().subtract(1, "months").endOf("month");

    // Check if the fromDate and toDate are in the last month
    if (
      fromMoment.isSame(lastMonthStart, "month") &&
      toMoment.isSame(lastMonthEnd, "month")
    ) {
      // Check if fromDate is the first day of the last month
      const isFirstDayOfLastMonth = fromMoment.isSame(lastMonthStart, "day");
      // Check if toDate is the last day of the last month
      const isLastDayOfLastMonth = toMoment.isSame(lastMonthEnd, "day");
      if (isFirstDayOfLastMonth && isLastDayOfLastMonth) {
        return true;
      }
    }

    return false;
  }

  isNextMonth(fromDate, toDate) {
    const fromMoment = moment(fromDate);
    const toMoment = moment(toDate);

    const nextMonthStart = moment().add(1, "months").startOf("month");
    const nextMonthEnd = moment().add(1, "months").endOf("month");

    // Check if the fromDate and toDate are in the next month
    if (
      fromMoment.isSame(nextMonthStart, "month") &&
      toMoment.isSame(nextMonthEnd, "month")
    ) {
      // Check if fromDate is the first day of the next month
      const isFirstDayOfNextMonth = fromMoment.isSame(nextMonthStart, "day");
      // Check if toDate is the last day of the next month
      const isLastDayOfNextMonth = toMoment.isSame(nextMonthEnd, "day");
      if (isFirstDayOfNextMonth && isLastDayOfNextMonth) {
        return true;
      }
    }

    return false;
  }

  isThisYear(fromDate, toDate) {
    const fromMoment = moment(fromDate);
    const toMoment = moment(toDate);
    if (
      fromMoment.year() === toMoment.year() &&
      moment(fromDate).year() == moment().year()
    ) {
      // Check if fromDate is January 1st and toDate is December 31st
      if (
        fromMoment.month() === 0 &&
        fromMoment.date() === 1 &&
        toMoment.month() === 11 &&
        toMoment.date() === 31
      ) {
        return true;
      }
    }
    return false;
  }

  isLastYear(fromDate, toDate) {
    const fromMoment = moment(fromDate);
    const toMoment = moment(toDate);
    const previousYear = moment().subtract(1, "year").year();
    if (
      fromMoment.year() === previousYear &&
      toMoment.year() === previousYear
    ) {
      // Check if fromDate is January 1st and toDate is December 31st of the previous year
      if (
        fromMoment.month() === 0 &&
        fromMoment.date() === 1 &&
        toMoment.month() === 11 &&
        toMoment.date() === 31
      ) {
        return true;
      }
    }
    return false;
  }
  isNextYear(fromDate, toDate) {
    const fromMoment = moment(fromDate);
    const toMoment = moment(toDate);
    const nextYear = moment().add(1, "year").year(); // Get the next year
    if (fromMoment.year() === nextYear && toMoment.year() === nextYear) {
      // Check if fromDate is January 1st and toDate is December 31st of the next year
      if (
        fromMoment.month() === 0 &&
        fromMoment.date() === 1 &&
        toMoment.month() === 11 &&
        toMoment.date() === 31
      ) {
        return true;
      }
    }
    return false;
  }
}
