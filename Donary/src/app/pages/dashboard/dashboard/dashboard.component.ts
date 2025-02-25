import { Component, OnInit, ViewChild, QueryList, inject } from "@angular/core";
import { Router } from "@angular/router";
import * as moment from "moment";

import { CommonMethodService } from "src/app/commons/common-methods.service";
import { DashboardService } from "src/app/services/dashboard.service";
import { LocalstoragedataService } from "../../../commons/local-storage-data.service";

import {
  DaterangepickerDirective,
  LocaleConfig,
} from "ngx-daterangepicker-material";
import { TranslateService } from "@ngx-translate/core";
import { NotificationService } from "src/app/services/notification.service";
import * as Highcharts from "highcharts";

import { CommonAPIMethodService } from "src/app/services/common-api-method.service";

import { NgbModalOptions, NgbPopover } from "@ng-bootstrap/ng-bootstrap";
import { HebrewEngishCalendarService } from "src/app/services/hebrew-engish-calendar.service";
import { Subscription } from "rxjs";
import { take } from "rxjs/operators";
import { AnalyticsService } from "src/app/services/analytics.service";
declare var $: any;
@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"],
  standalone: false,
})
export class DashboardComponent implements OnInit {
  fullName: string;
  @ViewChild(DaterangepickerDirective, { static: false })
  pickerDirective: DaterangepickerDirective;
  @ViewChild(NgbPopover, { static: false }) popContent: NgbPopover;
  @ViewChild(NgbPopover, { static: false }) popContent2: NgbPopover;
  @ViewChild(NgbPopover, { static: false }) popContent3: NgbPopover;
  popupsDemo!: QueryList<NgbPopover>;
  // @ViewChild('popContent2', { static: false ,read:NgbPopover }) popContentDir: NgbPopover;
  @ViewChild("upcomingCalendar", {
    static: false,
    read: DaterangepickerDirective,
  })
  upComingPickerDirective: DaterangepickerDirective;

  locale: LocaleConfig = {};
  selectedDateRange: any = {
    startDate: moment(new Date()).subtract(29, "days"),
    endDate: moment(new Date()),
  };
  selectedUpcomingDateRange: any = {
    startDate: moment(new Date()),
    endDate: moment(new Date()).add(30, "days"),
  };
  recentDateRange: any = {
    startDate: moment(new Date()).subtract(6, "days"),
    endDate: moment(new Date()),
  };

  isloading: boolean = false;
  popTitle: any;
  campaigns: number = 0;
  canceledPayments: number = 0;
  canceledPaymentsCount: number = 0;
  collectors: number = 0;
  devices: number = 0;
  PageName: any = "Dashboard";
  RecentPageName: any = "RecentDashboard";
  UpcomingPageName: any = "UpcomingDashboard";
  TotalRecentPageName: any = "TotalRecentDashboard";
  isOneDate: any = false;
  donors: number = 0;
  locations: number = 0;
  payments: number = 0;
  paymentsCount: number = 0;
  pendingPayments: number = 0;
  pendingPaymentsCount: number = 0;
  pendingPledges: number = 0;
  pendingPledgesCount: number = 0;
  pledgePayments: number = 0;
  pledgePaymentsCount: number = 0;
  pledges: number = 0;
  pledgesCount: number = 0;
  reasons: number = 0;
  schedulePayments: number = 0;
  schedulePaymentsCount: number = 0;
  totalRecentPayments: number = 0;
  totalUpcoming: number = 0;
  upcomingPayments: number = 0;
  upcomingPaymentsCount: number = 0;
  upcomingPledges: number = 0;
  upcomingPledgesCount: number = 0;
  paymentGrowthPercentage: number = 0;
  pledgesGrowthPercentage: number = 0;
  scheduleGrowthPercentage: number = 0;
  paymentGrwClass: string;
  pledgeGrwClass: string;
  scheduleGrwClass: string;
  donateExt: string;
  donateWeb: string;
  donatePhone: string;
  isRangeSelected = false;
  notificationList: Array<any> = [];

  isinitialize: number = 0;
  isinitializeSecond: number = 0;
  periodWiseDonation: Array<any> = [];
  periodWisePaymentType: Array<any> = [];
  isChartloading: boolean = false;
  pieError: string = "";
  ranges: any = {
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

    "7 הימים האחרונים": [
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

  dateOptionList = [
    { id: 1, itemName: "This Week" },
    { id: 2, itemName: "Last Week" },
    { id: 3, itemName: "Last 7 days" },
    { id: 4, itemName: "Last 30 days" },
    { id: 5, itemName: "This Month" },
    { id: 6, itemName: "Last Month" },
    { id: 7, itemName: "This Year" },
    { id: 8, itemName: "Last Year" },
  ];
  paymentPeriod = 3;
  selectedPaymentType = { id: "PaymentTypes", name: "Payment Types" };
  paymentTypes = [
    { id: "Reasons", name: "Reasons" },
    { id: "Campaigns", name: "Campaigns" },
    { id: "Collectors", name: "Collectors" },
    { id: "Locations", name: "Locations" },
    { id: "Sources", name: "Sources" },
    { id: "PaymentTypes", name: "Payment Types" },
  ];

  donorPermission: boolean = false;
  reasonPermission: boolean = false;
  campaignPermission: boolean = false;
  locationPermission: boolean = false;
  collectorPermission: boolean = false;
  seatPermission: boolean = false;
  sourcePermission: boolean = false;
  redirectPermission: boolean = false;

  modalOptions: NgbModalOptions;
  EngHebCalPlaceholderRecent: string = "Last 30 Days";
  EngHebCalPlaceholderUpcoming: string = "Next 31 Days";
  EngHebCalPlaceholderTotalRecent: string = "Last 7 Days";
  class_id: string;
  class_hid: string;
  getRecentloader: boolean = false;
  getUpcomingLoader: boolean = false;
  getPaymentLoader: boolean = false;
  listloader: boolean = false;
  isRemainderData: boolean = false;
  private TotalRecentcalendarSubscription: Subscription;
  private UpcomingcalendarSubscription: Subscription;
  private RecentcalendarSubscription: Subscription;
  private analytics = inject(AnalyticsService);

  constructor(
    private localstoragedataService: LocalstoragedataService,
    private dashboardService: DashboardService,
    private router: Router,
    public translate: TranslateService,
    public notificationService: NotificationService,
    public commonMethodService: CommonMethodService,
    private commonAPIMethodService: CommonAPIMethodService,
    public hebrewEngishCalendarService: HebrewEngishCalendarService
  ) {
    this.translate.setDefaultLang("en");
  }

  ngOnInit() {
    this.analytics.visitedDashboard();
    this.getAllLabels();
    this.fullName = this.localstoragedataService.getLoginUserFullName();
    if (
      this.localstoragedataService.getLoginUserEventGuId() !=
      "f9878bb3-4bdf-479f-8fcf-b075680a658a"
    ) {
      this.ranges = this.commonMethodService.ranges;
    } else {
    }
    this.commonMethodService.getGlobalLang().subscribe((res) => {
      this.createChartPie();
      this.createChartPie1();
    });
    this.isloading = true;
    // this.getRecentDate();
    // this.getUpcomingDate();
    // this.getRecentPayment();
    this.donorPermission = this.localstoragedataService
      .getPermissionLst()
      .filter((x) => x.permissionName == "Donor List")
      .map((x) => x.isActive)[0];
    this.reasonPermission = this.localstoragedataService
      .getPermissionLst()
      .filter((x) => x.permissionName == "Reason List")
      .map((x) => x.isActive)[0];
    this.campaignPermission = this.localstoragedataService
      .getPermissionLst()
      .filter((x) => x.permissionName == "Campaign List")
      .map((x) => x.isActive)[0];
    this.locationPermission = this.localstoragedataService
      .getPermissionLst()
      .filter((x) => x.permissionName == "Location List")
      .map((x) => x.isActive)[0];
    this.collectorPermission = this.localstoragedataService
      .getPermissionLst()
      .filter((x) => x.permissionName == "Collector List")
      .map((x) => x.isActive)[0];
    this.seatPermission = this.localstoragedataService
      .getPermissionLst()
      .filter((x) => x.permissionName == "Seats")
      .map((x) => x.isActive)[0];
    this.sourcePermission = this.localstoragedataService
      .getPermissionLst()
      .filter((x) => x.permissionName == "Source List")
      .map((x) => x.isActive)[0];

    this.redirectPermission =
      this.donorPermission ||
      this.reasonPermission ||
      this.collectorPermission ||
      this.campaignPermission ||
      this.sourcePermission ||
      this.sourcePermission ||
      this.locationPermission;
    if (this.commonMethodService.locationTypeList.length == 0) {
      this.commonMethodService.getLocationTypeList();
    }
    if (this.commonMethodService.localDonorList.length == 0) {
      this.commonMethodService.getDonorList();
    }
    if (this.commonMethodService.localReasonList.length == 0) {
      this.commonMethodService.getReasonList();
    }
    if (this.commonMethodService.localCampaignList.length == 0) {
      this.commonMethodService.getCampaignList();
    }
    if (this.commonMethodService.localCollectorList.length == 0) {
      this.commonMethodService.getCollectorList();
    }
    if (this.commonMethodService.localLocationList.length == 0) {
      this.commonMethodService.getLocationList();
    }
    if (this.commonMethodService.localscheduleRepatTypeList.length == 0) {
      this.commonMethodService.getScheduleRepeatTypeList();
    }
    let fromDate = moment(new Date()).format("YYYY-MM-DD");
    let toDate = moment(new Date()).add(6, "days").format("YYYY-MM-DD");
    this.notificationService
      .getNotificationList(
        this.localstoragedataService.getLoginUserEventGuId(),
        fromDate,
        toDate,
        "10"
      )
      .subscribe((res) => {
        if (!res || res.length === 0) {
          this.notificationList = [];
          this.listloader = false;
          this.isRemainderData = true;
          return;
        }
        this.notificationList = res.map((o) => {
          this.listloader = false;
          this.isRemainderData = false;
          return {
            ...o,
            donorFullNameJewish:
              o.donorFullNameJewish != ""
                ? o.donorFullNameJewish
                : o.donorFullName,
          };
        });
      });
    this.getDashboardValues();
  }
  closePopover(popover: NgbPopover) {
    popover.close();
  }
  changePeriod(event) {
    this.isChartloading = true;
    if (event.id == 1) {
      this.recentDateRange = {
        startDate: moment(new Date()).startOf("week"),
        endDate: moment(new Date()).endOf("week"),
      };
    }
    if (event.id == 2) {
      this.recentDateRange = {
        startDate: moment(new Date()).subtract(1, "week").startOf("week"),
        endDate: moment(new Date()).subtract(1, "week").endOf("week"),
      };
    }
    if (event.id == 3) {
      this.recentDateRange = {
        startDate: moment(new Date()).subtract(6, "days"),
        endDate: moment(new Date()),
      };
    }
    if (event.id == 4) {
      this.recentDateRange = {
        startDate: moment(new Date()).subtract(29, "days"),
        endDate: moment(new Date()),
      };
    }
    if (event.id == 5) {
      this.recentDateRange = {
        startDate: moment(new Date()).startOf("month"),
        endDate: moment(new Date()).endOf("month"),
      };
    }
    if (event.id == 6) {
      this.recentDateRange = {
        startDate: moment(new Date()).subtract(1, "month").startOf("month"),
        endDate: moment(new Date()).subtract(1, "month").endOf("month"),
      };
    }
    if (event.id == 7) {
      this.recentDateRange = {
        startDate: moment(new Date()).startOf("year"),
        endDate: moment(new Date()).endOf("year"),
      };
    }
    if (event.id == 8) {
      this.recentDateRange = {
        startDate: moment(new Date()).subtract(1, "year").startOf("year"),
        endDate: moment(new Date()).subtract(1, "year").endOf("year"),
      };
    }
    this.getDashboardValues();
  }

  changePaymentType(event) {
    this.isChartloading = true;
    this.selectedPaymentType = event;
    this.getDashboardValues();
  }
  getDashboardValues() {
    var recentObjPayload = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      fromDate:
        this.selectedDateRange.startDate != null
          ? moment(this.selectedDateRange.startDate).format("YYYY-MM-DD")
          : null,
      toDate:
        this.selectedDateRange.endDate != null
          ? moment(this.selectedDateRange.endDate).format("YYYY-MM-DD")
          : null,
    };
    var upcomingObjPayload = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      fromDate:
        this.selectedUpcomingDateRange.startDate != null
          ? moment(this.selectedUpcomingDateRange.startDate).format(
              "YYYY-MM-DD"
            )
          : null,
      toDate:
        this.selectedUpcomingDateRange.endDate != null
          ? moment(this.selectedUpcomingDateRange.endDate).format("YYYY-MM-DD")
          : null,
    };
    this.listloader = true;
    this.dashboardService
      .getdashboardList(this.localstoragedataService.getLoginUserEventGuId())
      .subscribe((res: any) => {
        this.campaigns = res.campaigns;
        this.collectors = res.collectors;
        this.donors = res.donors;
        this.locations = res.locations;
        this.reasons = res.reasons;
        this.devices = res.devices;
      });
    this.getRecentloader = true;
    this.dashboardService.getRecent(recentObjPayload).subscribe((res: any) => {
      this.getRecentloader = false;
      this.canceledPayments = res.canceledPayments;
      this.canceledPaymentsCount = res.canceledPaymentsCount;
      this.payments = res.payments;
      this.paymentsCount = res.paymentsCount;
      this.pledgePayments = res.pledgePayments;
      this.pledgePaymentsCount = res.pledgePaymentsCount;
      this.pledges = res.pledges;
      this.pledgesCount = res.pledgesCount;
      this.schedulePayments = res.schedulePayments;
      this.schedulePaymentsCount = res.schedulePaymentsCount;
      this.totalRecentPayments = res.totalRecentPayments;
      this.paymentGrwClass =
        Math.sign(res.paymentGrowthPercentage) == 1
          ? "perchant_text up"
          : "perchant_text down";
      this.pledgeGrwClass =
        Math.sign(res.pledgesGrowthPercentage) == 1
          ? "perchant_text up"
          : "perchant_text down";
      this.scheduleGrwClass =
        Math.sign(res.scheduleGrowthPercentage) == 1
          ? "perchant_text up"
          : "perchant_text down";
      this.paymentGrowthPercentage = Math.abs(res.paymentGrowthPercentage);
      this.pledgesGrowthPercentage = Math.abs(res.pledgesGrowthPercentage);
      this.scheduleGrowthPercentage = Math.abs(res.scheduleGrowthPercentage);
    });
    this.getUpcomingLoader = true;
    this.dashboardService
      .getUpcoming(upcomingObjPayload)
      .subscribe((res: any) => {
        this.getUpcomingLoader = false;
        this.totalUpcoming = res.totalUpcoming;
        this.upcomingPayments = res.upcomingPayments;
        this.upcomingPaymentsCount = res.upcomingPaymentsCount;
        this.upcomingPledges = res.upcomingPledges;
        this.upcomingPledgesCount = res.upcomingPledgesCount;
      });
    var objPaymentPayload = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      fromDate:
        this.recentDateRange.startDate != null
          ? moment(this.recentDateRange.startDate).format("YYYY-MM-DD")
          : null,
      toDate:
        this.recentDateRange.endDate != null
          ? moment(this.recentDateRange.endDate).format("YYYY-MM-DD")
          : null,
      sumBy: this.selectedPaymentType.id.toString(),
    };
    this.getPaymentLoader = true;
    this.dashboardService
      .getdashboardPayments(objPaymentPayload)
      .subscribe((res: any) => {
        this.getPaymentLoader = false;
        this.isinitialize = 1;
        this.isinitializeSecond = 1;
        this.periodWiseDonation = res.periodWiseDonations;
        this.periodWisePaymentType = res.periodWisePaymentType;
        if (this.periodWisePaymentType == null) {
          this.pieError =
            "No data available for " + this.selectedPaymentType.name;
        } else {
          this.pieError = "";
        }
        setTimeout(() => {
          this.createChartPie1();
          this.createChartPie();
        }, 100);
      });
  }

  CalendarFocus() {
    this.pickerDirective.open();
  }

  upComingCalendarFocus() {
    this.upComingPickerDirective.open();
  }

  datesRecentUpdated(event) {
    if (this.isinitialize == 1) {
      this.isloading = true;
      this.selectedDateRange = event;
      this.getDashboardValues();
    }
  }

  datesUpcomingUpdated(event) {
    if (this.isinitializeSecond == 1) {
      this.isloading = true;
      this.selectedUpcomingDateRange = event;
      this.getDashboardValues();
      this.isRangeSelected == true
        ? $("#upcomingcalendar").removeClass("custom_range")
        : $("#upcomingcalendar").addClass("custom_range");
      this.isRangeSelected = false;
    }
  }
  onClickedOutsidePopover(p1: any) {
    if (!(event.target as HTMLElement).closest(".popover")) {
      p1.close();
    } else {
    }
  }
  upcomingRangeClicked(event) {
    this.isRangeSelected = true;
  }

  RedirectListLink(val) {
    if (this.redirectPermission) {
      this.router.navigate(["lists"], {
        state: {
          activeTab: val,
        },
      });
    }
  }

  RedirectNotificationLink(item) {
    this.router.navigate(["notification"], {
      state: {
        details: item,
        activeTab: "reminder",
      },
    });
  }
  goToRemindersTab() {
    this.router.navigate(["notification"], {
      state: {
        activeTab: "reminder",
      },
    });
  }
  RedirectTransLink(val) {
    this.router.navigate(["transaction"], {
      state: {
        activeTab: val,
        recentStartDate: moment(this.selectedDateRange.startDate).format(
          "YYYY-MM-DD"
        ),
        recentEndDate: moment(this.selectedDateRange.endDate).format(
          "YYYY-MM-DD"
        ),
      },
    });
  }

  RedirectUpcomingTransLink(val) {
    this.router.navigate(["transaction"], {
      state: {
        activeTab: val,
        recentStartDate: moment(
          this.selectedUpcomingDateRange.startDate
        ).format("YYYY-MM-DD"),
        recentEndDate: moment(this.selectedUpcomingDateRange.endDate).format(
          "YYYY-MM-DD"
        ),
      },
    });
  }
  createChartPie1() {
    this.isChartloading = false;
    const result = [];
    let step = 0;
    let currency = this.commonMethodService.currencyIcon;
    if (this.periodWiseDonation && this.periodWiseDonation.length > 0) {
      for (let i = 0; i < this.periodWiseDonation.length; i++) {
        const element = this.periodWiseDonation[i];
        let payment_data = [];
        payment_data[0] = element.period;
        payment_data[1] = Number(element.donations.toFixed(2));
        result.push(payment_data);
      }
    }

    if (this.paymentPeriod == 6) {
      step = 5;
    } else {
      step = 0;
    }
    const data: any[] = [];

    var chart1 = Highcharts.chart({
      chart: {
        renderTo: "chart-pie1",
      },
      title: {
        text: "",
      },
      xAxis: {
        type: "category",
        categories: this.periodWiseDonation
          ? this.periodWiseDonation.map((x) => x.period)
          : null,
        reversed: this.commonMethodService.isHebrew,
        labels: {
          style: {
            fontSize: "13px",
            fontFamily: "Avenir Roman, sans-serif",
            color: "#464549",
          },
          step: step,
        },
      },
      yAxis: {
        min: 0,
        allowDecimals: false,
        title: {
          text: "",
        },
        opposite: this.commonMethodService.isHebrew,

        labels: {
          style: {
            fontSize: "14px",
            fontFamily: "Avenir Roman, sans-serif",
            color: "#A9A7AF",
          },
          formatter: function () {
            return currency + this.value;
          },
        },
      },
      tooltip: {
        backgroundColor: "#404040",
        color: "#fff  ",
        borderRadius: 5,
        borderWidth: 0,
        minWidth: 120,
        useHTML: true,
        formatter: function () {
          return (
            '<span style="color:#FFF">' +
            this.x +
            "<br>" +
            currency +
            this.y.toLocaleString("en-US") +
            "</span>"
          );
        },
      },
      legend: {
        enabled: false,
      },
      series: [
        {
          type: "column",
          data: result,
          minPointLength: 5,
        },
      ],
      credits: {
        enabled: false,
      },
    } as any);
  }
  createChartPie() {
    const data: any[] = [];
    let result = [];
    let totalDonation = 0;
    let currency = this.commonMethodService.currencyIcon;
    if (this.periodWisePaymentType) {
      this.periodWisePaymentType.forEach((element) => {
        element.donations = Number(element.donations.toFixed(2));
        totalDonation += element.donations;
        element.donations = element.donations;
      });
    }
    totalDonation = Number(totalDonation.toFixed(2));
    if (this.periodWisePaymentType) {
      this.periodWisePaymentType.forEach((element) => {
        element.y = (element.donations / totalDonation) * 100;
        element.y = Number(element.y.toFixed(2));
        result.push({
          name: element.paymentType,
          value: element.donations,
          y: element.y,
          sliced: false,
          selected: false,
          type: this.selectedPaymentType.id,
        });
      });
    }
    Highcharts.setOptions({
      colors: ["#826BB8", "#1AC13C", "#EEAE00", "#EC6A56", "#B4B4B4"],
    });

    var chart1 = Highcharts.chart({
      chart: {
        renderTo: "chart-pie",
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
        type: "pie",
      },
      legend: {
        symbolPadding: 0,
        symbolWidth: 0,
        symbolHeight: 0,
        squareSymbol: false,
        layout: "vertical",
        floating: false,
        borderRadius: 0,
        borderWidth: 0,
        align: "right",
        x: 0,
        verticalAlign: "middle",
        y: 0,
        maxHeight: 5000,
        scrollEnabled: true,
        useHTML: true,
        navigation: {
          enabled: false,
        },
        labelFormatter: function () {
          return (
            '<div style="font-size: 12px; font-weight: 500; ">' +
            this.name +
            '</div><div style="font-size: 14px; font-weight: 900; color: #464549; margin-bottom: 10px">' +
            currency +
            this.value.toLocaleString("en-US") +
            "</div>"
          );
        },
      },
      tooltip: {
        backgroundColor: "transparent",
        useHTML: true,
        formatter: function () {
          const resultItem = result.find((item) => item.y === this.y);
          const paymentType = resultItem ? resultItem.name : "";
          const donations = resultItem ? resultItem.value : "";
          const type = resultItem ? resultItem.type : "";
          return (
            '<span style="color:#000">' +
            this.y +
            "%" +
            "<br>" +
            type +
            ":" +
            paymentType +
            "<br>" +
            "donations:" +
            currency +
            donations +
            "</span>"
          );
        },
      },
      title: {
        text: "",
      },
      credits: {
        enabled: false,
      },
      accessibility: {
        point: {
          valueSuffix: "%",
        },
      },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: "pointer",
          dataLabels: {
            enabled: false,
          },
          showInLegend: true,
        },
      },
      series: [
        {
          name: "Brands",

          data: result,
        },
      ],
    } as any);
  }

  getAllLabels() {
    const eventGuId = this.localstoragedataService.getLoginUserEventGuId();
    this.commonAPIMethodService
      .getLabelText(eventGuId)
      .subscribe((res: any) => {
        this.commonMethodService.allLabelsArray = res;
      });
  }

  openRecentCalendarPopup(p1: any) {
    this.commonMethodService.featureName = "Total_recent_date_filter";
    this.RecentcalendarSubscription = this.commonMethodService
      .getCalendarArray()
      .pipe(take(1))
      .subscribe((items) => {
        console.log(items);
        if (
          items &&
          items.pageName == "RecentDashboard" &&
          this.commonMethodService.isCalendarClicked == true
        ) {
          this.commonMethodService.isCalendarClicked = false;
          this.selectedDateRange = items.obj;
          this.EngHebCalPlaceholderRecent =
            this.hebrewEngishCalendarService.EngHebCalPlaceholder;
          this.RecentcalendarSubscription.unsubscribe();
          p1.close();
          this.getRecentDate();
        }
      });
  }

  getRecentDate() {
    var recentObjPayload = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      fromDate:
        this.selectedDateRange.startDate != null
          ? moment(this.selectedDateRange.startDate).format("YYYY-MM-DD")
          : null,
      toDate:
        this.selectedDateRange.endDate != null
          ? moment(this.selectedDateRange.endDate).format("YYYY-MM-DD")
          : null,
    };

    this.getRecentloader = true;
    this.dashboardService.getRecent(recentObjPayload).subscribe((res: any) => {
      this.getRecentloader = false;
      if (res) {
        this.canceledPayments = res.canceledPayments;
        this.canceledPaymentsCount = res.canceledPaymentsCount;
        this.payments = res.payments;
        this.paymentsCount = res.paymentsCount;
        this.pledgePayments = res.pledgePayments;
        this.pledgePaymentsCount = res.pledgePaymentsCount;
        this.pledges = res.pledges;
        this.pledgesCount = res.pledgesCount;
        this.schedulePayments = res.schedulePayments;
        this.schedulePaymentsCount = res.schedulePaymentsCount;
        this.totalRecentPayments = res.totalRecentPayments;
        this.paymentGrwClass =
          Math.sign(res.paymentGrowthPercentage) == 1
            ? "perchant_text up"
            : "perchant_text down";
        this.pledgeGrwClass =
          Math.sign(res.pledgesGrowthPercentage) == 1
            ? "perchant_text up"
            : "perchant_text down";
        this.scheduleGrwClass =
          Math.sign(res.scheduleGrowthPercentage) == 1
            ? "perchant_text up"
            : "perchant_text down";
        this.paymentGrowthPercentage = Math.abs(res.paymentGrowthPercentage);
        this.pledgesGrowthPercentage = Math.abs(res.pledgesGrowthPercentage);
        this.scheduleGrowthPercentage = Math.abs(res.scheduleGrowthPercentage);
      }
    });
  }

  openUpcomingCalendarPopup(p2: any) {
    this.commonMethodService.featureName = "Up_coming_date_filter";
    this.UpcomingcalendarSubscription = this.commonMethodService
      .getCalendarArray()
      .pipe(take(1))
      .subscribe((items) => {
        console.log(items);
        if (
          items &&
          items.pageName == "UpcomingDashboard" &&
          this.commonMethodService.isCalendarClicked == true
        ) {
          this.commonMethodService.isCalendarClicked = false;
          this.selectedUpcomingDateRange = items.obj;
          this.EngHebCalPlaceholderUpcoming =
            this.hebrewEngishCalendarService.EngHebCalPlaceholder;
          this.UpcomingcalendarSubscription.unsubscribe();
          p2.close();
          this.getUpcomingDate();
        }
      });
  }

  getUpcomingDate() {
    var recentObjPayload = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      fromDate:
        this.selectedUpcomingDateRange.startDate != null
          ? moment(this.selectedUpcomingDateRange.startDate).format(
              "YYYY-MM-DD"
            )
          : null,
      toDate:
        this.selectedUpcomingDateRange.endDate != null
          ? moment(this.selectedUpcomingDateRange.endDate).format("YYYY-MM-DD")
          : null,
    };

    this.getUpcomingLoader = true;
    this.dashboardService
      .getUpcoming(recentObjPayload)
      .subscribe((res: any) => {
        this.getUpcomingLoader = false;
        if (res) {
          this.totalUpcoming = res.totalUpcoming;
          this.upcomingPayments = res.upcomingPayments;
          this.upcomingPaymentsCount = res.upcomingPaymentsCount;
          this.upcomingPledges = res.upcomingPledges;
          this.upcomingPledgesCount = res.upcomingPledgesCount;
        }
      });
  }

  openTotalRecentCalendarPopup(p3: any) {
    this.commonMethodService.featureName = null;
    this.TotalRecentcalendarSubscription = this.commonMethodService
      .getCalendarArray()
      .pipe(take(1))
      .subscribe((items) => {
        console.log(items);
        if (
          items &&
          items.pageName == "TotalRecentDashboard" &&
          this.commonMethodService.isCalendarClicked == true
        ) {
          this.commonMethodService.isCalendarClicked = false;
          this.recentDateRange = items.obj;
          this.EngHebCalPlaceholderTotalRecent =
            this.hebrewEngishCalendarService.EngHebCalPlaceholder;

          this.TotalRecentcalendarSubscription.unsubscribe();
          p3.close();
          this.getRecentPayment();
        }
      });
  }

  getRecentPayment() {
    var objPaymentPayload = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      fromDate:
        this.recentDateRange.startDate != null
          ? moment(this.recentDateRange.startDate).format("YYYY-MM-DD")
          : null,
      toDate:
        this.recentDateRange.endDate != null
          ? moment(this.recentDateRange.endDate).format("YYYY-MM-DD")
          : null,
      sumBy: this.selectedPaymentType.id.toString(),
    };
    this.getPaymentLoader = true;
    this.dashboardService
      .getdashboardPayments(objPaymentPayload)
      .subscribe((res: any) => {
        this.getPaymentLoader = false;
        if (res) {
          this.isinitialize = 1;
          this.isinitializeSecond = 1;
          this.periodWiseDonation = res.periodWiseDonations;
          this.periodWisePaymentType = res.periodWisePaymentType;
          if (this.periodWisePaymentType == null) {
            this.pieError =
              "No data available for " + this.selectedPaymentType.name;
          } else {
            this.pieError = "";
          }
          setTimeout(() => {
            this.createChartPie1();
            this.createChartPie();
          }, 100);
        }
      });
  }

  // ngOnDestroy(): void {
  //   if (this.TotalRecentcalendarSubscription) {
  //     console.log("TotalRecentcalendarSubscription");
  //     this.TotalRecentcalendarSubscription.unsubscribe();
  //   }
  //   if (this.RecentcalendarSubscription) {
  //     console.log("RecentcalendarSubscription");
  //     this.RecentcalendarSubscription.unsubscribe();
  //   }
  //   if (this.UpcomingcalendarSubscription) {
  //     console.log("UpcomingcalendarSubscription");
  //     this.UpcomingcalendarSubscription.unsubscribe();
  //   }
  // }
}
