import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { NgbModalOptions, NgbPopover } from "@ng-bootstrap/ng-bootstrap";
import * as moment from "moment";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { DynamicGridReportService } from "src/app/services/dynamic-grid-report.service";
import { CommonAPIMethodService } from "src/app/services/common-api-method.service";
import Swal from "sweetalert2";
import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";
import { DaterangepickerDirective } from "ngx-daterangepicker-material";
import { HebrewEngishCalendarService } from "src/app/services/hebrew-engish-calendar.service";

import { Subscription } from "rxjs";
import { environment } from "src/environments/environment";
import { XLSXService } from "src/app/services/xlsx.service";
declare var $: any;
@Component({
  selector: "app-report-main",
  templateUrl: "./report-main.component.html",
  styleUrls: ["./report-main.component.scss"],
  standalone: false,
})
export class ReportMainComponent implements OnInit {
  showSubMenu = false;
  modalOptions: NgbModalOptions;
  isloading: boolean = false;
  objDonorSave: any;
  routeState: any;
  selectedAllDynamicList: any = [];
  allDyanamicReportList: any = [];
  getParamsList: any = [];
  selectedReportId: string;
  isInvalid: boolean = false;
  localDeviceList: any = [];
  selectedPaymentDevice: any = [];
  tableExecute: any = [];
  isCheckDyanamicParams: boolean = false;
  isQueryReportTable: boolean = false;
  isinitialize = 0;
  isToinitialize = 0;
  popTitle: any;

  selectedDateRange: any = {
    startDate: moment(new Date()).startOf("week"),
    endDate: moment(new Date()).endOf("week"),
  };
  @ViewChild(DaterangepickerDirective, { static: false })
  pickerDirective: DaterangepickerDirective;
  @ViewChild("toDate", { static: false, read: DaterangepickerDirective })
  ToPickerDirective: DaterangepickerDirective;
  @ViewChild(NgbPopover, { static: false }) popContent: NgbPopover;
  selecteFromdDate: any = [];
  FromPageName: any = "ReportMainFrom";
  ToPageName: any = "ReportMainTo";
  isOneDate: any = true;
  selecteTodDate: any = [];
  isDateFrom: boolean = false;
  isDateTo: boolean = false;
  isDeviceNametxt: boolean = false;
  addClass = "";
  dnyText: any;
  isDnyText: boolean = false;
  isRunLoader: boolean = false;
  dnyParam: string;
  mainArray: any = [];
  sub;
  tempFd: any;
  tempTd: any;
  setClsTableTestTreport = "";
  showDatepicker: boolean = false;
  showDateTopicker: boolean = false;
  testDate: any;
  index = -1;

  queryReportPermission: boolean = false;
  customReportPermission: boolean = false;

  FromEngHebCalPlaceholder: string = moment(new Date()).format("MM/DD/YYYY");
  ToEngHebCalPlaceholder: string = moment(new Date()).format("MM/DD/YYYY");
  class_id: string;
  class_hid: string;
  private FromcalendarSubscription: Subscription;
  private TocalendarSubscription: Subscription;
  reportType: string = "custom";
  isStandardReportRelease: boolean;
  constructor(
    public commonMethodService: CommonMethodService,
    public elementRef: ElementRef,
    private router: Router,
    private dynamicGridReportService: DynamicGridReportService,
    private localstoragedataService: LocalstoragedataService,
    private commonAPIMethodService: CommonAPIMethodService,
    public hebrewEngishCalendarService: HebrewEngishCalendarService,
    private xlsxService: XLSXService
  ) {
    if (this.router.getCurrentNavigation().extras.state) {
      this.routeState =
        this.router.getCurrentNavigation().extras.state.activeTab;
    }
    this.router.routeReuseStrategy.shouldReuseRoute = () => {
      return false;
    };
    this.router.onSameUrlNavigation = "reload";
  }

  firstFocus = 0;
  ngOnInit() {
    this.isStandardReportRelease =
      environment.releaseFeature.isStandardReportRelease;

    this.getFeatureSettingValues();

    this.queryReportPermission = this.localstoragedataService
      .getPermissionLst()
      .filter((x) => x.permissionName == "Query Reports")
      .map((x) => x.isActive)[0];

    this.customReportPermission = this.localstoragedataService
      .getPermissionLst()
      .filter((x) => x.permissionName == "Custom Reports")
      .map((x) => x.isActive)[0];
    this.commonMethodService.formatAmount(0);
    this.getAllDynamicReport();
    if (this.routeState) {
      $("#custom-tabs-queries-tab").removeClass("active");
      $("#custom-tabs-queries").removeClass("show active");

      if (this.routeState == "queryreport" && this.queryReportPermission) {
        $("#custom-tabs-queries-tab").addClass("active");
        $("#custom-tabs-queries").addClass("show active");
      } else if (
        this.routeState == "customreport" &&
        this.customReportPermission
      ) {
        $("#custom-tabs-queries-report-tab").addClass("active");
        $("#custom-tabs-queries-report").addClass("show active");
      }
    }

    //this.getPaymentDevices();

    $(document.body).bind("mousemove", function (e) {
      if (this.firstFocus == 0) {
        $("#queryReportScroll tr[tabindex=0]").focus();
        this.firstFocus = 1;
      }
    });
    document.onkeydown = (e: any) => {
      e = e || window.event;
      if ([38, 40].indexOf(e.keyCode) > -1) {
        e.preventDefault();
      }
      if (e.keyCode === 38) {
        var idx = $("#queryReportScroll tr:focus").attr("tabindex");
        idx--;
        if (idx == 0) {
          document.getElementById("queryReportScroll").scrollTop = 0;
        }
        $("#queryReportScroll tr[tabindex=" + idx + "]").focus();
      } else if (e.keyCode === 40) {
        var idx = $("#queryReportScroll tr:focus").attr("tabindex");
        idx++;
        $("#queryReportScroll tr[tabindex=" + idx + "]").focus();
      } else if (e.keyCode === 37) {
        document.getElementById("queryReportScroll").scrollLeft -= 30;
      } else if (e.keyCode === 39) {
        document.getElementById("queryReportScroll").scrollLeft += 30;
      }
    };
  }

  ScheduleSubMenu(tabName, value) {
    this.showSubMenu = value;
    this.showDateTopicker = false;
    this.showDatepicker = false;
    if (tabName == "queryReport") {
      $("#queryReportScroll tr[tabindex=0]").focus();
      document.onkeydown = (e: any) => {
        e = e || window.event;
        if ([38, 40].indexOf(e.keyCode) > -1) {
          e.preventDefault();
        }
        if (e.keyCode === 38) {
          var idx = $("#queryReportScroll tr:focus").attr("tabindex");
          idx--;
          if (idx == 0) {
            document.getElementById("queryReportScroll").scrollTop = 0;
          }
          $("#queryReportScroll tr[tabindex=" + idx + "]").focus();
        } else if (e.keyCode === 40) {
          var idx = $("#queryReportScroll tr:focus").attr("tabindex");
          idx++;
          $("#queryReportScroll tr[tabindex=" + idx + "]").focus();
        } else if (e.keyCode === 37) {
          document.getElementById("queryReportScroll").scrollLeft -= 30;
        } else if (e.keyCode === 39) {
          document.getElementById("queryReportScroll").scrollLeft += 30;
        }
      };

      // $("#schedule_tab").addClass("active_schedule")
      $("#custom-tabs-queries-reports").removeClass("active");
      $("#custom-tabs-standard").removeClass("active");
      $("#custom-tabs-queries").addClass("active");
    } else if (tabName == "customReport") {
      this.reportType = "custom";
      $("#customReportScroll tr[tabindex=0]").focus();
      document.onkeydown = (e: any) => {
        e = e || window.event;
        if ([38, 40].indexOf(e.keyCode) > -1) {
          e.preventDefault();
        }
        if (e.keyCode === 38) {
          var idx = $("#customReportScroll tr:focus").attr("tabindex");
          idx--;
          if (idx == 0) {
            document.getElementById("customReportScroll").scrollTop = 0;
          }
          $("#customReportScroll tr[tabindex=" + idx + "]").focus();
        } else if (e.keyCode === 40) {
          var idx = $("#customReportScroll tr:focus").attr("tabindex");
          idx++;
          $("#customReportScroll tr[tabindex=" + idx + "]").focus();
        } else if (e.keyCode === 37) {
          document.getElementById("customReportScroll").scrollLeft -= 30;
        } else if (e.keyCode === 39) {
          document.getElementById("customReportScroll").scrollLeft += 30;
        }
      };
      $("#custom-tabs-queries").removeClass("active");
      $("#custom-tabs-standard").removeClass("active");
      $("#custom-tabs-queries-reports").addClass("active");
    } else if (tabName == "standardReport") {
      this.reportType = "standard";
      $("#custom-tabs-queries").removeClass("active");
      $("#custom-tabs-queries-reports").removeClass("active");
      $("custom-tabs-standard").addClass("active");
    }
  }

  getAllDynamicReport() {
    var eventGuId = this.localstoragedataService.getLoginUserEventGuId();
    this.dynamicGridReportService
      .getAllDynamicGridReport(eventGuId, this.reportType)
      .subscribe(
        (res: any) => {
          this.allDyanamicReportList = res.map((element) => {
            let obj = {
              id: element.reportId,
              itemName: element.reportName,
            };
            return obj;
          });
        },
        (error) => {
          console.log(error);
        }
      );
  }
  onDeSelectAll(filterName: any) {
    switch (filterName) {
      case "selectedAllDynamicList":
        this.selectedAllDynamicList = [];
        this.tableExecute = [];
        this.isQueryReportTable = false;
        this.isDateFrom = false;
        this.isDateTo = false;
        this.isDeviceNametxt = false;
        this.getParamsList = [];
        this.isRunLoader = false;
        this.resetText();
        break;
      case "selectedPaymentDevice":
        this.selectedPaymentDevice = [];
        this.tableExecute = [];
        this.isQueryReportTable = false;
        this.isDateFrom = false;
        this.isDateTo = false;
        this.isDeviceNametxt = false;
        break;
    }
  }

  onGetParams(reportId: string) {
    this.isloading = true;
    this.resetText();
    this.dynamicGridReportService.getParams(reportId).subscribe(
      (res: any) => {
        this.getParamsList = res;
        this.getParamsList.forEach((element) => {
          element.validation = false;
        });
        this.tempTd.startDate = moment(new Date());
        this.tempTd.endDate = moment(new Date());
        this.tempFd.startDate = moment(new Date());
        this.tempTd.endDate = moment(new Date());

        this.isloading = false;

        this.getParamsList.forEach((el) => {
          if (el.uiDataType === "DateTime") {
            const paramNameLower = el.paramName.toLowerCase();

            // Check if it's a 'from' date
            if (paramNameLower.includes("from")) {
              // Match 'from1' or 'from2', or if there's no number, assign a single from date
              const match = paramNameLower.match(/(?:from)?(\d)?(?:from)?/);

              if (match && match[1]) {
                el["type"] = `from${match[1]}`;
              } else {
                el["type"] = "singleFromDate";
              }
            }

            // Check if it's a 'to' date
            if (paramNameLower.includes("to")) {
              // Match 'to1' or 'to2', or if there's no number, assign a single to date
              const match = paramNameLower.match(/(?:to)?(\d)?(?:to)?/);

              if (match && match[1]) {
                el["type"] = `to${match[1]}`;
              } else {
                el["type"] = "singleToDate";
              }
            }
          }
        });

        //

        //   this.addClass="";
        //   this.getParamsList.forEach((element) => {

        //     if(element.paramName=="EventID"){

        //     }
        //     else if(element.paramName=="DtFrom"){
        //      this.isDateFrom=true;
        //     }
        //    else if(element.paramName=="DtTo"){
        //       this.isDateTo=true;
        //     }
        //     else{
        //       if(element.paramName){
        //       this.addClass="active-item-show";
        //       this.dnyParam=element.paramName;
        //       this.isDnyText=true;
        //      //this.isDeviceNametxt=true;
        //       }
        //     }

        // });
        //
      },
      (error) => {
        this.isloading = false;
        console.log(error);
      }
    );
  }
  resetText() {
    this.isDateFrom = false;
    this.isDateTo = false;
    this.isDeviceNametxt = false;
    this.isDnyText = false;
    this.dnyText = "";
    this.tdate = undefined;
    this.fdate = undefined;
    this.tempFd = [];
    this.tempTd = [];
  }
  onSelect(event: any) {
    this.tableExecute = [];
    this.isQueryReportTable = false;
    var reportId = event.id;
    this.selectedReportId = reportId;
    this.onGetParams(reportId);
  }
  onRun() {
    var checkInvalidDate = "";
    var checkOtherParam = "";
    var checkParamName = "";
    this.selectedReportId;
    var paramsList = [];
    this.getParamsList.forEach((element) => {
      var paramSet;
      if (element.isRequired && element.uiDataType == "string") {
        if (
          element.value == undefined ||
          element.value == "" ||
          element.value == null
        ) {
          element.validation = true;
          this.isInvalid = true;
          return false;
        } else {
          element.validation = false;
          this.isInvalid = false;
        }
      }
      if (element.isRequired && element.uiDataType == "DateTime") {
        if (element.paramName == "DtFrom" && this.tempFd.startDate == null) {
          element.validation = true;
          this.isInvalid = true;
          return false;
        } else {
          element.validation = false;
          this.isInvalid = false;
        }
        if (element.paramName == "DtTo" && this.tempTd.startDate == null) {
          element.validation = true;
          this.isInvalid = true;
          return false;
        } else {
          element.validation = false;
          this.isInvalid = false;
        }
      }
      if (element.paramName == "EventID") {
        element.value = this.localstoragedataService.getLoginUserEventGuId(); //"136";//
      } else if (element.uiDataType == "DateTime") {
        if (element.paramName == "DtFrom") {
          var f =
            this.tempFd != undefined
              ? this.tempFd.startDate != null
                ? moment(this.tempFd.startDate).format("YYYY-MM-DD")
                : null
              : null;
          element.value = f;
        } else if (element.paramName == "DtTo") {
          var t =
            this.tempTd != undefined
              ? this.tempTd.startDate != null
                ? moment(this.tempTd.startDate).format("YYYY-MM-DD")
                : null
              : null;
          element.value = t;
        } else if (
          element.uiDataType == "DateTime" &&
          element.paramName != "DtTo" &&
          element.paramName != "DtFrom"
        ) {
          var t =
            this.testDate != undefined
              ? this.testDate.startDate != null
                ? moment(this.testDate.startDate).format("YYYY-MM-DD")
                : null
              : null;
          element.value = t;
        } else {
          var t =
            element.value != undefined
              ? element.value.startDate != null
                ? moment(element.value.startDate).format("YYYY-MM-DD")
                : null
              : null;
          element.value = t;
        }
        //   //element.value=element.value != undefined ? element.value != null ? moment(element.value.startDate).format("MM/DD/YYYY") : null : null;
        //   //this.selecteFromdDate != undefined ? this.selecteFromdDate != null ? moment(this.selecteFromdDate.startDate).format("YYYY-MM-DD") : null : null;
        // //if(element.value=="Invalid date"){
        //   if(this.fdate && this.fParam==element.paramName && this.tempFd.length==0){
        //     //element.value=this.tempFd != undefined ? this.tempFd != null ? moment(this.tempFd.startDate).format("MM/DD/YYYY") : null : null;
        //     element.value=this.fdate;
        //   }
        //   else if(this.tdate && this.tParam==element.paramName && this.tempTd.length==0){
        //     //element.value=this.tempTd != undefined ? this.tempTd != null ? moment(this.tempTd.startDate).format("MM/DD/YYYY") : null : null;

        //     element.value=this.tdate;

        //   }
        //   else{
        //     if(element.paramName=="DtFrom" && !this.fdate){
        //     element.value=this.tempFd != undefined ? this.tempFd != null ? moment(this.tempFd.startDate).format("MM/DD/YYYY") : null : null;
        //     }
        //     if(element.paramName=="DtTo"&& !this.tdate){
        //       element.value=this.tempTd != undefined ? this.tempTd != null ? moment(this.tempTd.startDate).format("MM/DD/YYYY") : null : null;
        //       }
        //         // if(element.value.startDate===null){
        //         //     checkInvalidDate="Invalid date";//element.value;
        //         // }else{
        //         //   element.value=element.value != undefined ? element.value != null ? moment(element.value.startDate).format("MM/DD/YYYY") : null : null;
        //         // }
        //        }
        // //}
      } else {
        if (element.value == "" || element.value == undefined) {
          checkOtherParam = element.value;
          checkParamName = element.paramName;
        }
      }
      let obj = {
        name: element.paramName,
        value: element.value === undefined ? "" : element.value,
      };
      paramsList.push(obj);
    });

    var listObj = {
      reportId: this.selectedReportId,
      params: paramsList,
    };
    if (this.selectedReportId == undefined) {
    } else if (checkInvalidDate == "Invalid date") {
      // Swal.fire({
      //   title: this.commonMethodService.getTranslate('WARNING_SWAL.SOMETHING_WENT_WRONG'),
      //   text: checkInvalidDate,
      //   icon: 'error',
      //   confirmButtonText: this.commonMethodService.getTranslate('WARNING_SWAL.BUTTON.CONFIRM.OK'),
      //   customClass: {
      //     confirmButton: 'btn_ok'
      // },
      // })
    }
    // else if(checkOtherParam==undefined){
    //   Swal.fire({
    //     title: this.commonMethodService.getTranslate('WARNING_SWAL.SOMETHING_WENT_WRONG'),
    //     text: checkParamName,
    //     icon: 'error',
    //     confirmButtonText: this.commonMethodService.getTranslate('WARNING_SWAL.BUTTON.CONFIRM.OK'),
    //     customClass: {
    //       confirmButton: 'btn_ok'
    //   },
    //   })
    // }
    else {
      var isValid = this.getParamsList.filter(
        (x) => x.validation == true
      ).length;
      if (isValid == 0) {
        this.isRunLoader = true;
        this.isloading = true;
        this.showDateTopicker = false;
        this.showDatepicker = false;
        this.tableExecute = [];
        this.mainArray = [];
        this.setClsTableTestTreport = "";
        this.sub = this.dynamicGridReportService.getExecute(listObj).subscribe(
          (res: any) => {
            this.isRunLoader = false;
            this.isloading = false;
            // this.fdate="";
            // this.tdate="";
            this.isQueryReportTable = true;
            console.log(res);
            this.tableExecute = res.table;
            this.mainArray = this.tableExecute;
            //

            // var dataObject = {};
            // if(this.tableExecute) {
            //   for (var key in this.tableExecute) {
            //
            //     var obj = this.tableExecute[key];
            //     for (var prop in obj) {
            //        if(obj.hasOwnProperty(prop)){
            //          //console.log(prop + " = " + obj[prop]);
            //          var lable=prop;
            //          var timestamp = obj[prop].toString();
            //         //var isValidDate= moment(obj[prop], moment.ISO_8601).isValid();
            //          if (timestamp.includes("T00:00:00")) {
            //           var date = new Date(obj[prop]);
            // var nDate= ((date.getMonth() > 8) ? (date.getMonth() + 1) : ('0' + (date.getMonth() + 1))) + '/' +
            // ((date.getDate() > 9) ? date.getDate() : ('0' + date.getDate())) + '/' + date.getFullYear();
            // dataObject[lable] =nDate;
            //         }
            //         else{
            //           dataObject[lable] =obj[prop];
            //         }
            //        }
            //     }
            //     this.mainArray.push(dataObject)
            //  }
            //  console.log(this.mainArray);
            //  //this.tableExecute=this.mainArray;
            // }

            //
          },
          (error) => {
            console.log(error);
            this.isloading = false;
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
      this.showDateTopicker = false;
      this.showDatepicker = false;
    }
  }
  fdate: string;
  fParam = "";
  tdate: string;
  tParam = "";
  dateSetValue(event: any, item) {
    const charCode = event.which ? event.which : event.keyCode;
    if (item == "DtFrom" || item == "FromDate") {
      if (event.target.value.length == 2 || event.target.value.length == 5) {
        if (charCode == 8) {
        } else {
          var k = event.target.value;
          var thisVal = k;
          thisVal += "/";
          //this.fdate=thisVal;
          //event.target.value=thisVal;
        }
      }
      // this.fdate=event.target.value;
      // this.fParam=item;
    }
    if (item == "DtTo" || item == "ToDate") {
      if (event.target.value.length == 2 || event.target.value.length == 5) {
        if (charCode == 8) {
        } else {
          var k = event.target.value;
          var thisVal = k;
          thisVal += "/";
          //this.fdate=thisVal;
          //event.target.value=thisVal;
        }
      }
      // this.tdate=event.target.value;
      // this.tParam=item;
    }
  }
  passValueToDate(event: any, item) {
    if (item == "DtFrom" || item == "FromDate") {
      this.fdate = event.target.value;
      this.fParam = item;
    }
    if (item == "DtTo" || item == "ToDate") {
      this.tdate = event.target.value;
      this.tParam = item;
    }
  }
  handleClick = (ev) => {
    if (
      this.showDatepicker &&
      !this.elementRef.nativeElement
        .querySelector("ngx-daterangepicker-material")
        .contains(ev.target)
    ) {
      this.pickerDirective.open();
    } else {
      window.removeEventListener("click", this.handleClick);
    }
  };

  handleToClick = (ev) => {
    if (
      this.showDateTopicker &&
      !this.elementRef.nativeElement
        .querySelector("ngx-daterangepicker-material")
        .contains(ev.target)
    ) {
      this.ToPickerDirective.open();
    } else {
      window.removeEventListener("click", this.handleToClick);
    }
  };

  OnDatePickerOpen() {
    this.showDatepicker = true;
    this.showDateTopicker = false;
    window.addEventListener("click", this.handleClick);
  }

  OnDatePickerToOpen() {
    this.showDatepicker = false;
    this.showDateTopicker = true;
    window.addEventListener("click", this.handleToClick);
  }

  clearFrom() {
    this.tempFd = [];
  }
  clearTo() {
    this.tempTd = [];
  }

  FocusOut() {
    this.pickerDirective.open();
  }
  datesFromUpdated(event) {
    if (this.isinitialize == 1) {
      // this.tempFd = event;
    } else {
      this.isinitialize = 1;
      this.tempFd.startDate = moment(new Date());
      this.tempFd.endDate = moment(new Date());
      //this.tempFd = undefined;
    }
  }

  datesToUpdated(event) {
    if (this.isToinitialize == 1) {
      //this.tempTd = event;
    } else {
      this.isToinitialize = 1;
      this.tempTd.startDate = moment(new Date());
      this.tempTd.endDate = moment(new Date());

      //this.tempTd = undefined;
    }
  }

  getPaymentDevices() {
    let eventId = this.localstoragedataService.getLoginUserEventGuId();
    this.commonAPIMethodService.getPaymentDevices(eventId).subscribe(
      (res: any) => {
        res.forEach((element) => {
          let obj = {
            id: element.deviceId,
            itemName: element.deviceName,
          };
          this.localDeviceList.push(obj);
          // console.log(res);
        });
      },
      (error) => {
        console.log(error);
      }
    );
  }
  exportToExcel() {
    this.showDateTopicker = false;
    this.showDatepicker = false;
    if (this.pickerDirective) {
      this.pickerDirective.hide();
    }

    if (this.tableExecute && this.tableExecute.length > 0) {
      this.isloading = true;
      var temp = [];
      var dataObject = {};
      if (this.tableExecute) {
        for (var key in this.tableExecute) {
          var obj = this.tableExecute[key];
          for (var prop in obj) {
            if (obj.hasOwnProperty(prop)) {
              //console.log(prop + " = " + obj[prop]);
              var lable = prop;
              var timestamp = Date.parse(obj[prop]);
              var isValidDate = moment(obj[prop], moment.ISO_8601).isValid();
              if (isValidDate) {
                var date = new Date(obj[prop]);
                var nDate =
                  (date.getMonth() > 8
                    ? date.getMonth() + 1
                    : "0" + (date.getMonth() + 1)) +
                  "/" +
                  (date.getDate() > 9 ? date.getDate() : "0" + date.getDate()) +
                  "/" +
                  date.getFullYear();
                dataObject[lable] = nDate;
              } else {
                dataObject[lable] = obj[prop];
              }
            }
          }
          temp.push(dataObject);
        }
      }

      //console.log(testNewArray);
      const data = this.tableExecute; //temp;//testNewArray;
      const filename = this.xlsxService.getFilename("");

      const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data, {
        cellStyles: true,
      });
      //const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data,{header:testArray,cellStyles:true});

      var range = XLSX.utils.decode_range(worksheet["!ref"]);
      //
      // currency column Array
      let currencyColumn = [];
      for (var R = range.s.r; R < 1; ++R) {
        for (var C = range.s.c; C <= range.e.c; ++C) {
          var cell_address = { c: C, r: R };
          var cell_ref = XLSX.utils.encode_cell(cell_address);
          // worksheet[cell_ref].s = { alignment: { horizontal: 'center' } }

          if (!worksheet[cell_ref]) continue;

          if (
            worksheet[cell_ref].v &&
            worksheet[cell_ref].v.includes("total")
          ) {
            currencyColumn.push(C);
            continue;
          }

          if (
            worksheet[cell_ref].v &&
            worksheet[cell_ref].v.includes("TOTAL PAYMENTS")
          ) {
            currencyColumn.push(C);
            continue;
          }
          if (
            worksheet[cell_ref].v &&
            worksheet[cell_ref].v.includes("totalPayments")
          ) {
            currencyColumn.push(C);
            continue;
          }
          if (
            worksheet[cell_ref].v &&
            worksheet[cell_ref].v.includes("average")
          ) {
            currencyColumn.push(C);
            continue;
          }

          //  if (worksheet[cell_ref].v && worksheet[cell_ref].v.includes('Schedules')) {
          //    currencyColumn.push(C);
          //    continue;
          //  }

          //  if (worksheet[cell_ref].v && worksheet[cell_ref].v.includes('Total')) {
          //    currencyColumn.push(C);
          //    continue;
          //  }
        }
      }

      let fmt = '"$"#,##0.00_);\\("$"#,##0.00\\)';
      for (var R = range.s.r; R <= range.e.r; ++R) {
        if (R === 0) continue;
        for (let index = 0; index < currencyColumn.length; index++) {
          let C = currencyColumn[index];
          let cell_address = { c: C, r: R };
          let cell_ref = XLSX.utils.encode_cell(cell_address);
          if (worksheet[cell_ref]) {
            worksheet[cell_ref].t = "n";
            worksheet[cell_ref].z = fmt;
            // worksheet[cell_ref].s = { alignment: { horizontal: 'left' } } ;
          }
        }
      }
      //

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
    } else {
    }
  }
  getHeaders() {
    let headers: string[] = [];
    if (this.tableExecute) {
      this.tableExecute.forEach((value) => {
        Object.keys(value).forEach((key) => {
          if (!headers.find((header) => header == key)) {
            headers.push(key);
          }
        });
      });
    }
    if (headers && headers.length > 9) {
      this.setClsTableTestTreport = "table-test-report";
    }
    return headers;
  }
  isInvalidDate(date) {
    let today = moment(new Date());
    // allow only features date for next payment
    if (today.diff(date, "days") < 0) {
      return true;
    }
    return false;
  }
  stopRun() {
    this.isloading = false;
    this.isRunLoader = false;
    this.sub.unsubscribe();
  }
  //
  search(keyword) {
    var filterdRecord = [];
    var oldfilterRecord = [];

    keyword = keyword.toLowerCase().replace(/[().-]/g, "");
    if (keyword != "") {
      var searchArray = keyword.split(" ");
      for (var searchValue of searchArray) {
        // filterdRecord = this.mainArray.filter((obj) =>
        //   (obj.friendlyName && obj.friendlyName.toString().toLowerCase().indexOf(searchValue) > -1)
        //   || (obj.paymentDate && obj.paymentDate.toString().toLowerCase().indexOf(searchValue) > -1)
        //   || (obj.total && obj.total.toString().toLowerCase().indexOf(searchValue) > -1)
        // );
        filterdRecord = this.mainArray.filter(
          (o) =>
            Object.values(o).toString().toLowerCase().indexOf(searchValue) > -1
        );
        this.tableExecute = filterdRecord;
        oldfilterRecord = filterdRecord;
      }
    } else {
      if (oldfilterRecord.length > 0) {
        this.tableExecute = oldfilterRecord;
      } else {
        this.tableExecute = this.mainArray;
      }
    }
  }
  passTestDate(event) {
    if (event.target.value.length == 8) {
      const pair = Array.from(event.target.value);
      pair.splice(2, 0, "/");
      pair.splice(5, 0, "/");
      console.log(pair.join(""));
      this.testDate.startDate = pair.join("");
      //console.log(this.testDate)
    }
  }
  //

  ngOnDestroy() {
    document.onkeydown = () => {};
  }

  // openHebrewCalendarPopup(type,p:any) {
  //   this.commonMethodService.openCalendarPopup(this.class_id, this.class_hid, this.selectedDateRange,true);
  //   this.commonMethodService.getCalendarArray().subscribe(items => {
  //     if(items &&  items.pageName=="ReportMain" && this.commonMethodService.isCalendarClicked == true){
  //       if(items.obj){
  //         this.commonMethodService.isCalendarClicked = false
  //         p.close()
  //         this.selectedDateRange = items.obj;
  //         if(type == 'from'){
  //           this.tempFd.startDate = this.selectedDateRange.startDate;
  //           this.FromEngHebCalPlaceholder = this.hebrewEngishCalendarService.EngHebCalPlaceholder
  //         }
  //         if(type == 'to'){
  //           this.tempTd.startDate = this.selectedDateRange.startDate;
  //           this.ToEngHebCalPlaceholder = this.hebrewEngishCalendarService.EngHebCalPlaceholder
  //         }
  //       }
  //     }
  //   });
  // }

  openFromHebrewCalendarPopup(p: any) {
    this.commonMethodService.featureName = null;
    this.commonMethodService.openCalendarPopup(
      this.class_id,
      this.class_hid,
      this.selectedDateRange,
      true
    );
    this.FromcalendarSubscription = this.commonMethodService
      .getCalendarArray()
      .subscribe((items) => {
        if (
          items &&
          items.pageName == "ReportMainFrom" &&
          this.commonMethodService.isCalendarClicked == true
        ) {
          if (items.obj) {
            this.commonMethodService.isCalendarClicked = false;
            this.FromcalendarSubscription.unsubscribe();
            p.close();
            this.selectedDateRange = items.obj;
            this.tempFd.startDate = this.selectedDateRange.startDate;
            this.FromEngHebCalPlaceholder =
              this.hebrewEngishCalendarService.EngHebCalPlaceholder;
          }
        }
      });
  }
  getFeatureSettingValues() {
    this.commonMethodService.featureName = "Run_Custom_query";
    this.commonMethodService.getFeatureSettingValues();
  }
  onUpgrade() {
    this.commonMethodService.commenSendUpgradeEmail(
      this.commonMethodService.featureDisplayName
    );
  }

  openToHebrewCalendarPopup(p: any) {
    this.commonMethodService.openCalendarPopup(
      this.class_id,
      this.class_hid,
      this.selectedDateRange,
      true
    );
    this.TocalendarSubscription = this.commonMethodService
      .getCalendarArray()
      .subscribe((items) => {
        if (
          items &&
          items.pageName == "ReportMainTo" &&
          this.commonMethodService.isCalendarClicked == true
        ) {
          if (items.obj) {
            this.commonMethodService.isCalendarClicked = false;
            this.TocalendarSubscription.unsubscribe();
            p.close();
            this.selectedDateRange = items.obj;
            this.tempTd.startDate = this.selectedDateRange.startDate;
            this.ToEngHebCalPlaceholder =
              this.hebrewEngishCalendarService.EngHebCalPlaceholder;
          }
        }
      });
  }

  onClickedOutsidePopover(p1: any) {
    if (!(event.target as HTMLElement).closest(".popover")) {
      p1.close();
    } else {
    }
  }
}
