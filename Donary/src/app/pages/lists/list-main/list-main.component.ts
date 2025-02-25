import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { PageSyncService } from "src/app/commons/pagesync.service";

declare var $: any;

@Component({
  selector: "app-list-main",
  templateUrl: "./list-main.component.html",
  styleUrls: ["./list-main.component.scss"],
  standalone: false,
})
export class ListMainComponent implements OnInit {
  routeState: any;
  isShulSeating: boolean = false;
  donorPermission: boolean = false;
  reasonPermission: boolean = false;
  collectorPermission: boolean = false;
  campaignPermission: boolean = false;
  locationPermission: boolean = false;
  sourcePermission: boolean = false;
  seatPermission: boolean = false;

  tab: string;

  activeId = 1;

  @ViewChild("donorsTab", { static: false }) donorsTab!: ElementRef;
  @ViewChild("reasonsTab", { static: false }) reasonsTab!: ElementRef;
  @ViewChild("campaignsTab", { static: false }) campaignsTab!: ElementRef;

  constructor(
    public commonMethodService: CommonMethodService,
    private router: Router,
    private localstoragedataService: LocalstoragedataService,
    private pageSyncService: PageSyncService
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

  ngOnInit() {
    this.commonMethodService.formatAmount(0);

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
    $("body").addClass("sticky_table_list");
    if (this.routeState) {
      $("#custom-tabs-donors-tab").removeClass("active");
      $("#custom-tabs-donors").removeClass("show active");
      if (this.routeState == "donor" && this.donorPermission) {
        $("#custom-tabs-donors").addClass("show active");
      } else if (this.routeState == "reason" && this.reasonPermission) {
        setTimeout(() => {
          this.activeId = 2;
          $(".nav-link").removeClass("active");
          $("#custom-tabs-reasons-tab").addClass("active");
        }, 100);

        $("#custom-tabs-reasons").addClass("show active");
      } else if (this.routeState == "location" && this.locationPermission) {
        setTimeout(() => {
          this.activeId = 4;
          $(".nav-link").removeClass("active");
          $("#custom-tabs-locations-tab").addClass("active");
        }, 100);
        $("#custom-tabs-locations").addClass("show active");
      } else if (this.routeState == "device" && this.sourcePermission) {
        setTimeout(() => {
          this.activeId = 6;
          $(".nav-link").removeClass("active");
          $("#custom-tabs-sources-tab").addClass("active");
        }, 100);

        $("#custom-tabs-sources").addClass("show active");
      } else if (this.routeState == "collector" && this.collectorPermission) {
        setTimeout(() => {
          this.activeId = 5;
          $(".nav-link").removeClass("active");
          $("#custom-tabs-collectors-tab").addClass("active");
        }, 100);

        $("#custom-tabs-collectors").addClass("show active");
      } else if (this.routeState == "campaign" && this.campaignPermission) {
        setTimeout(() => {
          this.activeId = 3;
          $(".nav-link").removeClass("active");
          $("#custom-tabs-campaigns-tab").addClass("active");
        }, 100);

        $("#custom-tabs-campaigns").addClass("show active");
      } else if (this.routeState == "seats" && this.seatPermission) {
        setTimeout(() => {
          this.activeId = 7;
          $(".nav-link").removeClass("active");
          $("#custom-tabs-seats-tab").addClass("active");
        }, 100);
        $("#custom-tabs-seats").addClass("show active");
      }
    }
    let UserDetails: any = {};
    UserDetails = JSON.parse(localStorage.getItem("user_storage"));
    this.isShulSeating = UserDetails.isShulSeating;
  }

  ngAfterViewInit() {}

  ngOnDestroy() {
    document.onkeydown = () => {};
  }

  donorList() {
    $("#scrollDonorList tr[tabindex=0]").focus();
    if (!this.pageSyncService.isDonorListClicked) {
      this.pageSyncService.isDonorListClicked = true;
    }

    //  this.tableScrollHeight = document.getElementById("scrollDonorList").clientHeight - 160;
    document.onkeydown = (e: any) => {
      e = e || window.event;
      if ([38, 40].indexOf(e.keyCode) > -1) {
        e.preventDefault();
      }
      if (e.keyCode === 38) {
        let idx = $("#scrollDonorList tr:focus").attr("tabindex");
        idx--;
        if (idx == 0) {
          document.getElementById("scrollDonorList").scrollTop = 0;
        }
        $("#scrollDonorList tr[tabindex=" + idx + "]").focus();
      } else if (e.keyCode === 40) {
        let idx = $("#scrollDonorList tr:focus").attr("tabindex");
        idx++;
        $("#scrollDonorList tr[tabindex=" + idx + "]").focus();
      } else if (e.keyCode === 37) {
        document.getElementById("scrollDonorList").scrollLeft -= 30;
      } else if (e.keyCode === 39) {
        document.getElementById("scrollDonorList").scrollLeft += 30;
      }
    };
  }
  reasonList() {
    $("#reasonDonorList tr[tabindex=0]").focus();
    document.onkeydown = (e: any) => {
      e = e || window.event;
      if ([38, 40].indexOf(e.keyCode) > -1) {
        e.preventDefault();
      }
      if (e.keyCode === 38) {
        let idx = $("#reasonDonorList tr:focus").attr("tabindex");
        idx--;
        if (idx == 0) {
          document.getElementById("reasonDonorList").scrollTop = 0;
        }
        $("#reasonDonorList tr[tabindex=" + idx + "]").focus();
      } else if (e.keyCode === 40) {
        let idx = $("#reasonDonorList tr:focus").attr("tabindex");
        idx++;
        $("#reasonDonorList tr[tabindex=" + idx + "]").focus();
      } else if (e.keyCode === 37) {
        document.getElementById("reasonDonorList").scrollLeft -= 30;
      } else if (e.keyCode === 39) {
        document.getElementById("reasonDonorList").scrollLeft += 30;
      }
    };
  }

  campaignsList() {
    $("#campaignsList .table-row[tabindex=0]").focus();
    document.onkeydown = (e: any) => {
      e = e || window.event;
      if ([38, 40].indexOf(e.keyCode) > -1) {
        e.preventDefault();
      }
      if (e.keyCode === 38) {
        let idx = $("#campaignsList .table-row:focus").attr("tabindex");
        idx--;
        if (idx == 0) {
          document.getElementById("campaignsList").scrollTop = 0;
        }
        $("#campaignsList .table-row[tabindex=" + idx + "]").focus();
      } else if (e.keyCode === 40) {
        let idx = $("#campaignsList .table-row:focus").attr("tabindex");
        idx++;
        $("#campaignsList .table-row[tabindex=" + idx + "]").focus();
      } else if (e.keyCode === 37) {
        document.getElementById("campaignsList").scrollLeft -= 30;
      } else if (e.keyCode === 39) {
        document.getElementById("campaignsList").scrollLeft += 30;
      }
    };
  }
  locationsList() {
    $("#locationsList tr[tabindex=0]").focus();
    document.onkeydown = (e: any) => {
      e = e || window.event;
      if ([38, 40].indexOf(e.keyCode) > -1) {
        e.preventDefault();
      }
      if (e.keyCode === 38) {
        let idx = $("#locationsList tr:focus").attr("tabindex");
        idx--;
        if (idx == 0) {
          document.getElementById("locationsList").scrollTop = 0;
        }
        $("#locationsList tr[tabindex=" + idx + "]").focus();
      } else if (e.keyCode === 40) {
        let idx = $("#locationsList tr:focus").attr("tabindex");
        idx++;
        $("#locationsList tr[tabindex=" + idx + "]").focus();
      } else if (e.keyCode === 37) {
        document.getElementById("locationsList").scrollLeft -= 30;
      } else if (e.keyCode === 39) {
        document.getElementById("locationsList").scrollLeft += 30;
      }
    };
  }
  collectorsList() {
    $("#collectorsList tr[tabindex=0]").focus();
    document.onkeydown = (e: any) => {
      e = e || window.event;
      if ([38, 40].indexOf(e.keyCode) > -1) {
        e.preventDefault();
      }
      if (e.keyCode === 38) {
        let idx = $("#collectorsList tr:focus").attr("tabindex");
        idx--;
        if (idx == 0) {
          document.getElementById("collectorsList").scrollTop = 0;
        }
        $("#collectorsList tr[tabindex=" + idx + "]").focus();
      } else if (e.keyCode === 40) {
        let idx = $("#collectorsList tr:focus").attr("tabindex");
        idx++;
        $("#collectorsList tr[tabindex=" + idx + "]").focus();
      } else if (e.keyCode === 37) {
        document.getElementById("collectorsList").scrollLeft -= 30;
      } else if (e.keyCode === 39) {
        document.getElementById("collectorsList").scrollLeft += 30;
      }
    };
  }
  sourcesList() {
    $("#sourcesList tr[tabindex=0]").focus();
    document.onkeydown = (e: any) => {
      e = e || window.event;
      if ([38, 40].indexOf(e.keyCode) > -1) {
        e.preventDefault();
      }
      if (e.keyCode === 38) {
        let idx = $("#sourcesList tr:focus").attr("tabindex");
        idx--;
        if (idx == 0) {
          document.getElementById("sourcesList").scrollTop = 0;
        }
        $("#sourcesList tr[tabindex=" + idx + "]").focus();
      } else if (e.keyCode === 40) {
        let idx = $("#sourcesList tr:focus").attr("tabindex");
        idx++;
        $("#sourcesList tr[tabindex=" + idx + "]").focus();
      } else if (e.keyCode === 37) {
        document.getElementById("sourcesList").scrollLeft -= 30;
      } else if (e.keyCode === 39) {
        document.getElementById("sourcesList").scrollLeft += 30;
      }
    };
  }

  seatsList() {
    $("#seatsList tr[tabindex=0]").focus();
    document.onkeydown = (e: any) => {
      e = e || window.event;
      if ([38, 40].indexOf(e.keyCode) > -1) {
        e.preventDefault();
      }
      if (e.keyCode === 38) {
        let idx = $("#seatsList tr:focus").attr("tabindex");
        idx--;
        if (idx == 0) {
          document.getElementById("seatsList").scrollTop = 0;
        }
        $("#seatsList tr[tabindex=" + idx + "]").focus();
      } else if (e.keyCode === 40) {
        let idx = $("#seatsList tr:focus").attr("tabindex");
        idx++;
        $("#seatsList tr[tabindex=" + idx + "]").focus();
      } else if (e.keyCode === 37) {
        document.getElementById("seatsList").scrollLeft -= 30;
      } else if (e.keyCode === 39) {
        document.getElementById("seatsList").scrollLeft += 30;
      }
    };
  }
}
