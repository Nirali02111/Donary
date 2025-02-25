import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { NgbModalOptions } from "@ng-bootstrap/ng-bootstrap";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { environment } from "./../../../../environments/environment";
import { PageSyncService } from "src/app/commons/pagesync.service";
declare var $: any;
@Component({
  selector: "app-transaction-main",
  templateUrl: "./transaction-main.component.html",
  standalone: false,
  styleUrls: ["./transaction-main.component.scss"],
})
export class TransactionMainComponent implements OnInit {
  showSubMenu = false;
  modalOptions: NgbModalOptions;
  isloading: boolean;
  objDonorSave: any;
  routeState: any;
  index = -1;
  activeId = 1;
  activeSchId = 1;
  isDevEnv: boolean;
  constructor(
    public commonMethodService: CommonMethodService,
    private router: Router,
    private pageSyncService: PageSyncService
  ) {
    if (this.router.getCurrentNavigation().extras.state) {
      this.commonMethodService.isRedirect = true;
      this.routeState =
        this.router.getCurrentNavigation().extras.state.activeTab;
      this.commonMethodService.recentEndDate =
        this.router.getCurrentNavigation().extras.state.recentEndDate;
      this.commonMethodService.recentStartDate =
        this.router.getCurrentNavigation().extras.state.recentStartDate;
    }
    this.router.routeReuseStrategy.shouldReuseRoute = () => {
      return false;
    };
    this.router.onSameUrlNavigation = "reload";
  }
  firstFocus = 0;
  ngOnInit() {
    this.isDevEnv = environment.baseUrl.includes("https://dev-api.donary.com/");
    this.commonMethodService.formatAmount(0);
    if (this.routeState) {
      $("#custom-tabs-three-payments-tab").removeClass("active");
      $("#custom-tabs-three-payments").removeClass("show active");

      if (this.routeState == "payment") {
        this.activeId = 1;
        $("#custom-tabs-three-payments-tab").addClass("active");
        $("#custom-tabs-three-payments").addClass("show active");
      } else if (this.routeState == "pledge") {
        this.activeId = 2;
        $("#custom-tabs-three-pledges-tab").addClass("active");
        $("#custom-tabs-three-pledges").addClass("show active");
      } else if (this.routeState == "schedulepayment") {
        this.activeId = 3;
        this.activeSchId = 1;
        this.ScheduleSubMenu(true, "");
        $("#custom-payment").removeClass("fade");
        $("#custom-payment").addClass("highlighted active");
      } else if (this.routeState == "schedulepledge") {
        this.activeSchId = 2;
        this.ScheduleSubMenu(true, "");
        $("#custom-pledge").removeClass("fade");
        $("#custom-pledge").addClass("highlighted active");
      } else if (this.routeState == "batch") {
        $("#custom-tabs-three-batches-tab").removeClass("fade");
        $("#custom-tabs-three-batches").addClass("show active");
      } else {
        $("#custom-tabs-three-payments-tab").addClass("active");
        $("#custom-tabs-three-payments").addClass("show active");
      }
    }
    $("#paymentTypePayment tr[tabindex=0]").focus();
    document.onkeydown = (e: any) => {
      e = e || window.event;
      if ([38, 40].indexOf(e.keyCode) > -1) {
        e.preventDefault();
      }
      if (e.keyCode === 38) {
        var idx = $("#paymentTypePayment tr:focus").attr("tabindex");
        idx--;
        if (idx == 0) {
          document.getElementById("paymentTypePayment").scrollTop = 0;
        }
        $("#paymentTypePayment tr[tabindex=" + idx + "]").focus();
      } else if (e.keyCode === 40) {
        var idx = $("#paymentTypePayment tr:focus").attr("tabindex");
        idx++;
        $("#paymentTypePayment tr[tabindex=" + idx + "]").focus();
      } else if (e.keyCode === 37) {
        document.getElementById("paymentTypePayment").scrollLeft -= 30;
      } else if (e.keyCode === 39) {
        document.getElementById("paymentTypePayment").scrollLeft += 30;
      }
    };
  }

  RemoveClass() {
    this.showSubMenu = false;
  }
  ScheduleSubMenu(value, type) {
    this.showSubMenu = value;
    if (value == true) {
      $("#schedule_tab").addClass("active_schedule");
      if (!this.pageSyncService.isScheduleTabClicked) {
        this.pageSyncService.isScheduleTabClicked = true;
      } else {
        this.pageSyncService.pageClicked = true;
      }
      $("#scheduleTypePayment tr[tabindex=0]").focus();
      document.onkeydown = (e: any) => {
        e = e || window.event;
        if ([38, 40].indexOf(e.keyCode) > -1) {
          e.preventDefault();
        }
        if (e.keyCode === 38) {
          var idx = $("#scheduleTypePayment tr:focus").attr("tabindex");
          idx--;
          if (idx == 0) {
            document.getElementById("scheduleTypePayment").scrollTop = 0;
          }
          $("#scheduleTypePayment tr[tabindex=" + idx + "]").focus();
        } else if (e.keyCode === 40) {
          var idx = $("#scheduleTypePayment tr:focus").attr("tabindex");
          idx++;
          $("#scheduleTypePayment tr[tabindex=" + idx + "]").focus();
        } else if (e.keyCode === 37) {
          document.getElementById("scheduleTypePayment").scrollLeft -= 30;
        } else if (e.keyCode === 39) {
          document.getElementById("scheduleTypePayment").scrollLeft += 30;
        }
      };
    } else {
      $("#schedule_tab").removeClass("active_schedule");
      if (type == "tabPayment") {
        $("#paymentTypePayment tr[tabindex=0]").focus();
        document.onkeydown = (e: any) => {
          e = e || window.event;
          if ([38, 40].indexOf(e.keyCode) > -1) {
            e.preventDefault();
          }
          if (e.keyCode === 38) {
            var idx = $("#paymentTypePayment tr:focus").attr("tabindex");
            idx--;
            if (idx == 0) {
              document.getElementById("paymentTypePayment").scrollTop = 0;
            }
            $("#paymentTypePayment tr[tabindex=" + idx + "]").focus();
          } else if (e.keyCode === 40) {
            var idx = $("#paymentTypePayment tr:focus").attr("tabindex");
            idx++;
            $("#paymentTypePayment tr[tabindex=" + idx + "]").focus();
          } else if (e.keyCode === 37) {
            document.getElementById("paymentTypePayment").scrollLeft -= 30;
          } else if (e.keyCode === 39) {
            document.getElementById("paymentTypePayment").scrollLeft += 30;
          }
        };
      } else if (type == "tabPledge") {
        if (!this.pageSyncService.isPledgeTabClicked) {
          this.pageSyncService.isPledgeTabClicked = true;
          this.commonMethodService.sendPledgeTransSync(true);
        }
        $("#pledgeTypePayment tr[tabindex=0]").focus();
        document.onkeydown = (e: any) => {
          e = e || window.event;
          if ([38, 40].indexOf(e.keyCode) > -1) {
            e.preventDefault();
          }
          if (e.keyCode === 38) {
            var idx = $("#pledgeTypePayment tr:focus").attr("tabindex");
            idx--;
            if (idx == 0) {
              document.getElementById("pledgeTypePayment").scrollTop = 0;
            }
            $("#pledgeTypePayment tr[tabindex=" + idx + "]").focus();
          } else if (e.keyCode === 40) {
            var idx = $("#pledgeTypePayment tr:focus").attr("tabindex");
            idx++;
            $("#pledgeTypePayment tr[tabindex=" + idx + "]").focus();
          } else if (e.keyCode === 37) {
            document.getElementById("pledgeTypePayment").scrollLeft -= 30;
          } else if (e.keyCode === 39) {
            document.getElementById("pledgeTypePayment").scrollLeft += 30;
          }
        };
      }
    }
  }
  ScheduleType(type) {
    if (type == "payment") {
      this.index = -1;
      $("#custom-payment-tab").removeClass("highlighted active inactivate");
      $("#custom-payment-tab").addClass("highlighted");
      $("#custom-pledge-tab").removeClass("highlighted active");
      $("#scheduleTypePayment tr[tabindex=0]").focus();
      document.onkeydown = (e: any) => {
        e = e || window.event;
        if ([38, 40].indexOf(e.keyCode) > -1) {
          e.preventDefault();
        }
        if (e.keyCode === 38) {
          var idx = $("#scheduleTypePayment tr:focus").attr("tabindex");
          idx--;
          if (idx == 0) {
            document.getElementById("scheduleTypePayment").scrollTop = 0;
          }
          $("#scheduleTypePayment tr[tabindex=" + idx + "]").focus();
        } else if (e.keyCode === 40) {
          var idx = $("#scheduleTypePayment tr:focus").attr("tabindex");
          idx++;
          $("#scheduleTypePayment tr[tabindex=" + idx + "]").focus();
        } else if (e.keyCode === 37) {
          document.getElementById("scheduleTypePayment").scrollLeft -= 30;
        } else if (e.keyCode === 39) {
          document.getElementById("scheduleTypePayment").scrollLeft += 30;
        }
      };
    }
    if (type == "pledge") {
      this.index = -1;
      $("#custom-payment-tab").removeClass("highlighted active");
      $("#custom-pledge-tab").addClass("highlighted");
      $("#scheduleTypePledge tr[tabindex=0]").focus();
      document.onkeydown = (e: any) => {
        e = e || window.event;
        if ([38, 40].indexOf(e.keyCode) > -1) {
          e.preventDefault();
        }
        if (e.keyCode === 38) {
          var idx = $("#scheduleTypePledge tr:focus").attr("tabindex");
          idx--;
          if (idx == 0) {
            document.getElementById("scheduleTypePledge").scrollTop = 0;
          }
          $("#scheduleTypePledge tr[tabindex=" + idx + "]").focus();
        } else if (e.keyCode === 40) {
          var idx = $("#scheduleTypePledge tr:focus").attr("tabindex");
          idx++;
          $("#scheduleTypePledge tr[tabindex=" + idx + "]").focus();
        } else if (e.keyCode === 37) {
          document.getElementById("scheduleTypePledge").scrollLeft -= 30;
        } else if (e.keyCode === 39) {
          document.getElementById("scheduleTypePledge").scrollLeft += 30;
        }
      };
    }
  }

  ngOnDestroy() {
    document.onkeydown = () => {};
    // this.commonMethodService.removeNoOptions()
  }
}
