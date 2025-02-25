import { Component, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";

import { environment } from "./../../../../environments/environment";

import { CommonMethodService } from "src/app/commons/common-methods.service";
import { NotificationService } from "src/app/services/notification.service";
import { Subscription } from "rxjs";
declare var $: any;
@Component({
  selector: "app-notification-main",
  templateUrl: "./notification-main.component.html",
  standalone: false,
  styleUrls: ["./notification-main.component.scss"],
})
export class NotificationMainComponent implements OnInit, OnDestroy {
  routeState: any;
  isDevEnv: boolean;
  alertCount: number;
  alertSubscriber$: Subscription;
  constructor(
    private router: Router,
    public commonMethodService: CommonMethodService,
    private notificationService: NotificationService
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

  ngOnDestroy(): void {
    this.alertSubscriber$.unsubscribe();
  }

  ngOnInit() {
    this.alertSubscriber$ = this.notificationService.alert$.subscribe(
      (data) => {
        this.alertCount = data;
      }
    );
    this.isDevEnv = environment.baseUrl.includes("https://dev-api.donary.com/");
    this.commonMethodService.getScheduleRepeatTypeList();
    if (this.routeState) {
      $("#custom-tabs-reminders-tab").removeClass("active");
      $("#custom-tabs-reminders").removeClass("show active");

      if (this.routeState == "reminder") {
        $("#custom-tabs-reminders-tab").addClass("active");
        $("#custom-tabs-reminders").addClass("show active");
        $("#custom-tabs-alerts-tab").removeClass("active");
        $("#custom-tabs-alerts").removeClass("show active");
      } else if (this.routeState == "alert") {
        $("#custom-tabs-alerts-tab").addClass("active");
        $("#custom-tabs-alerts").addClass("show active");
        $("#custom-tabs-reminders-tab").removeClass("active");
        $("#custom-tabs-reminders").removeClass("show active");
      }
    }
    if (this.commonMethodService.locationTypeList.length == 0) {
      this.commonMethodService.getLocationTypeList();
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
  }
}
