import { Component, OnInit } from "@angular/core";
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
} from "@angular/router";
import { LocalstoragedataService } from "../../commons/local-storage-data.service";
import { PageRouteVariable } from "../../commons/page-route-variable";
import packageInfo from "../../../../package.json";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { TranslateService, TranslateModule } from "@ngx-translate/core";
import { NgTemplateOutlet, NgFor, NgClass, NgIf } from "@angular/common";
import { DoanryDirective } from "../../commons/modules/doanry-directive.module/doanry-directive.module.module";
import { NotificationService } from "src/app/services/notification.service";
import moment from "moment";
import { Subscription } from "rxjs";
import { environment } from "src/environments/environment";

declare var $: any;

@Component({
  selector: "app-sidebar-menu",
  templateUrl: "./sidebar-menu.component.html",
  styleUrls: ["./sidebar-menu.component.scss"],
  standalone: true,
  imports: [
    RouterLink,
    DoanryDirective,
    NgTemplateOutlet,
    NgFor,
    NgClass,
    NgIf,
    RouterLinkActive,
    TranslateModule,
  ],
})
export class SidebarMenuComponent implements OnInit {
  showMenus: any = {
    adminMenu: false,
    notificationMenu: false,
    reportMenu: false,
    transacionMenu: false,
    listMenu: false,
  };

  panels = ["First", "Second", "Third"];
  alertSubscriber$: Subscription
  public version: string = packageInfo.version;
  public fullName: string;
  public organisationName: string;
  public eventName: string;
  public currentYear: number;
  dashboardPage_Url: string = "/" + PageRouteVariable.Dashboard_url;

  transactionPage_Url: string = "/" + PageRouteVariable.TransactionPage_url;
  donorPage_Url: string = "/" + PageRouteVariable.DonorPay_url;
  reasonPage_Url: string = "/" + PageRouteVariable.Reason_url;
  campaignPage_Url: string = "/" + PageRouteVariable.Campaign_url;
  locationPage_Url: string = "/" + PageRouteVariable.Location_url;
  collectorPage_Url: string = "/" + PageRouteVariable.Collector_url;
  sourcePage_Url: string = "/" + PageRouteVariable.Source_url;
  listPage_Url: string = "/" + PageRouteVariable.ListPage_url;
  notificationPage_Url: string = "/" + PageRouteVariable.Notification_url;
  dashboardPermission: boolean = this.localstoragedataService
    .getPermissionLst()
    .filter((x) => x.permissionName == "Dashboard")
    .map((x) => x.isActive)[0];
  NotificationPermission: boolean = this.localstoragedataService
    .getPermissionLst()
    .filter((x) => x.permissionName == "Notifications")
    .map((x) => x.isActive)[0];
  reportPermission: boolean = this.localstoragedataService
    .getPermissionLst()
    .filter((x) => x.permissionName == "Reports")
    .map((x) => x.isActive)[0];
  adminPermission: boolean = this.localstoragedataService
    .getPermissionLst()
    .filter((x) => x.permissionName == "Admin")
    .map((x) => x.isActive)[0];
  queryReportPermission = this.localstoragedataService
    .getPermissionLst()
    .filter((x) => x.permissionName == "Query Reports")
    .map((x) => x.isActive)[0];

  customReportPermission = this.localstoragedataService
    .getPermissionLst()
    .filter((x) => x.permissionName == "Custom Reports")
    .map((x) => x.isActive)[0];
  donorPermission = this.localstoragedataService
    .getPermissionLst()
    .filter((x) => x.permissionName == "Donor List")
    .map((x) => x.isActive)[0];
  reasonPermission = this.localstoragedataService
    .getPermissionLst()
    .filter((x) => x.permissionName == "Reason List")
    .map((x) => x.isActive)[0];
  campaignPermission = this.localstoragedataService
    .getPermissionLst()
    .filter((x) => x.permissionName == "Campaign List")
    .map((x) => x.isActive)[0];
  locationPermission = this.localstoragedataService
    .getPermissionLst()
    .filter((x) => x.permissionName == "Location List")
    .map((x) => x.isActive)[0];
  collectorPermission = this.localstoragedataService
    .getPermissionLst()
    .filter((x) => x.permissionName == "Collector List")
    .map((x) => x.isActive)[0];
  seatPermission = this.localstoragedataService
    .getPermissionLst()
    .filter((x) => x.permissionName == "Seats")
    .map((x) => x.isActive)[0];
  sourcePermission = this.localstoragedataService
    .getPermissionLst()
    .filter((x) => x.permissionName == "Source List")
    .map((x) => x.isActive)[0];

  reportPage_Url: string = "/" + PageRouteVariable.Report_url;

  adminPage_Url: string = "/" + PageRouteVariable.Admin_url;

  financePage_Url: string = "/" + PageRouteVariable.Finance_url;

  donateExt: string;
  donateExtensionNum: number;
  alertCount: number;
  isProdEnv: boolean;
  constructor(
    private localstoragedataService: LocalstoragedataService,
    private router: Router,
    private notificationService: NotificationService,
    public commonMethodService: CommonMethodService,
    public translate: TranslateService,
    private activatedRoute: ActivatedRoute
  ) {
    translate.setDefaultLang("en");

    // set only when page is reloaded and get current state of menu from local storage
    if (this.localstoragedataService.getCurrentMenuState()) {
      this.sideMenuItems = this.localstoragedataService.getCurrentMenuState();
      this.localstoragedataService.setCurrentMenuState(null);
    }
    this.router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        let url = val.url;
        if (
          url.includes(this.dashboardPage_Url) ||
          url.includes(this.transactionPage_Url) ||
          url.includes(this.donorPage_Url) ||
          url.includes(this.reasonPage_Url) ||
          url.includes(this.campaignPage_Url) ||
          url.includes(this.locationPage_Url) ||
          url.includes(this.sourcePage_Url) ||
          url.includes(this.collectorPage_Url) ||
          url.includes(this.reportPage_Url) ||
          url.includes(this.listPage_Url) ||
          url.includes(this.adminPage_Url) ||
          url.includes(this.notificationPage_Url) ||
          url.includes(this.financePage_Url)
        ) {
          this.resetAllMenuSelection();
          this.setSelectedMenu(url);
        }
      }
    });
  }

  // @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {
  //   this.localstoragedataService.setCurrentMenuState(this.sideMenuItems);
  //   //event.returnValue = false;
  // }

  ngOnInit() {
    this.isProdEnv=environment.baseUrl.includes("https://webapi.donary.com/");
    let alertsObj = {eventGuid: this.localstoragedataService.getLoginUserEventGuId()};
    this.fullName = this.localstoragedataService.getLoginUserFullName();
    this.organisationName =
      this.localstoragedataService.getLoginUserOrganisation();
    this.currentYear = new Date().getFullYear();
    this.eventName = this.localstoragedataService.getLoginUserEventName();
    //this.localstoragedataService.setCurrentMenuState(this.sideMenuItems);
    //this.sideMenuItems=this.sideMenuItems;
    let extension = this.localstoragedataService.getLoginUserDonateExt();
    this.donateExt = "DONARY.COM/" + extension;
    this.donateExtensionNum = extension;
    this.alertSubscriber$ = this.notificationService.alert$.subscribe((data) => {
      this.alertCount = data});
    this.notificationService
      .getAlert(alertsObj)
      .subscribe((data: any[]) => {
        this.alertCount = data?.filter(alert => alert?.statusID == '1').length;
        
        if(this.alertCount) this.notificationService.alert$.next(this.alertCount)
      });
  }

  resetAllMenuSelection() {
    // set active to false for each menu
    this.sideMenuItems.forEach((s) => (s.active = false));
    // set all childeren selected to false
    this.sideMenuItems.forEach((s) => {
      if (s.children && s.children.length > 0) {
        s.children.filter((element) => (element.selected = false));
      }
    });
  }

  openDropdown() {
    this.commonMethodService.openDropdown();
    $("body").removeClass("sidebar-open");
    $("body").addClass("sidebar-collapse");
  }

  setSelectedMenu(url) {
    let childMenu: any = null;
    this.sideMenuItems.forEach((s) => {
      let selectedSubMenu = s.children.filter(
        (element) => element.route == url
      );
      if (selectedSubMenu && selectedSubMenu.length > 0) {
        childMenu = selectedSubMenu[0];
        selectedSubMenu[0].selected = true; // set selected submenu -> active to true
      }
    });
    if (childMenu) {
      let activeParentMenu = this.sideMenuItems.filter(
        (s) => s.id == childMenu.parentId
      );
      if (activeParentMenu && activeParentMenu.length > 0) {
        activeParentMenu[0].active = true; // set active = true for current selected menu
      }
    } else {
      let activeParentMenu = this.sideMenuItems.filter(
        (element) => element.route == url
      );
      if (activeParentMenu && activeParentMenu.length > 0) {
        activeParentMenu[0].active = true; // set active = true for current selected menu
      }
    }

    this.localstoragedataService.setCurrentMenuState(this.sideMenuItems);
  }

  setLIMenuClass(liMenu) {
    if (liMenu.isSeperator) {
      return "nav-header";
    } else {
      if (liMenu.children && liMenu.children.length > 0) {
        return "nav-item has-treeview";
      } else {
        return "nav-item";
      }
    }
  }

  sideMenuItems: Array<any> = [
    // {
    //   label: 'Dashboards', isSeperator: true, route: '', id: 1, active: false, iconClasses: 'nav-icon fas fa-clipboard-list', children: []
    // },
    {
      label: "DASHBOARD",
      route: this.dashboardPage_Url,
      permission: this.dashboardPermission,
      isSeperator: false,
      id: 1,
      active: true,
      iconClasses: "nav-icon fas fa-tachometer-alt",
      children: [],
      //   children: [ { label: 'Dashboard v1', parentId: 2, route: this.dashboardPage_Url, selected: true, iconClass: "far fas fa-chart-line nav-icon" },
      //   { label: 'Dashboard v2', parentId: 2, route: 'dashboard1', selected: false, iconClass: "far fas fa-chart-line nav-icon" },
      // ]
    },
    {
      label: "LISTS",
      route: this.listPage_Url,
      isSeperator: false,
      permission:
        this.donorPermission ||
        this.reasonPermission ||
        this.campaignPermission ||
        this.locationPermission ||
        this.collectorPermission ||
        this.seatPermission ||
        this.sourcePermission,
      id: 2,
      active: false,
      iconClasses: "nav-icon fas fa-list",
      children: [],
      //   children: [
      //   { label: 'Donors', parentId: 2, route:this.donorPage_Url , selected: false, iconClass: "fas fa-user  nav-icon" },
      //   { label: 'Reasons', parentId: 2, route:this.reasonPage_Url , selected: false, iconClass: "far fas fa-comments  nav-icon" },
      //   { label: 'Campaigns', parentId: 2, route: this.campaignPage_Url, selected: false, iconClass: "far fas fa-volume-up nav-icon" },
      //   { label: 'Locations', parentId: 2, route: this.locationPage_Url, selected: false, iconClass: "far fas fa-map-marker nav-icon" },
      //   { label: 'Collectors', parentId: 2, route: this.collectorPage_Url, selected: false, iconClass: "far fas fa-user nav-icon" },
      //   { label: 'Sources', parentId: 2, route:this.sourcePage_Url, selected: false, iconClass: "far fas fa-share-alt nav-icon" }
      // ]
    },
    {
      label: "TRANSACTIONS",
      isSeperator: false,
      route: this.transactionPage_Url,
      permission: true,
      id: 3,
      active: false,
      iconClasses: "nav-icon fas fa-clipboard-list",
      children: [],
    },
    // {
    //   //   label: 'ENTITIES', isSeperator: true, route: '', id: 4, active: false, iconClasses: 'nav-icon fas fa-clipboard-list', children: []
    //   // },
    //   // {
    //   //   label: 'Donors', isSeperator: false, route: this.donorPage_Url, id: 5, active: false, iconClasses: 'nav-icon fas fa-user', children: []
    //   // },
    {
      label: "REPORTS",
      isSeperator: false,
      route: this.reportPage_Url,
      id: 6,
      permission: this.queryReportPermission || this.customReportPermission,
      active: false,
      iconClasses: "nav-icon fas fa-file",
      children: [],
    },
    {
      label: "NOTIFICATIONS",
      isSeperator: false,
      route: this.notificationPage_Url,
      permission: this.NotificationPermission,
      id: 7,
      active: false,
      iconClasses: "nav-icon fas fa-bell",
      children: [],
    },
    {
      label: "ADMIN",
      isSeperator: false,
      route: this.adminPage_Url,
      id: 8,
      active: false,
      permission: this.adminPermission,
      iconClasses: "nav-icon fas fa-user",
      children: [],
    },
    // {
    //   label: 'Donations', isSeperator: false, route: '', id: 8, active: false, iconClasses: 'nav-icon fas fa-donate', children: [
    //     //{ label: 'Payments', route: 'grid', parentId: 7, selected: false, iconClass: "fas fa-credit-card nav-icon" },
    //     { label: 'Pledges', route: this.gridPage_Url, parentId:8, selected: false, iconClass: "far fas fa-gift nav-icon" },
    //     { label: 'Schedules', route: 'grid4', parentId: 8, selected: false, iconClass: "far fas fa-clipboard-list nav-icon" },

    //   ]
    // }
    {
      label: "Finance",
      isSeperator: false,
      route: this.financePage_Url,
      id: 9,
      active: false,
      permission: true,
      iconClasses: "nav-icon fas fa-user",
      children: [],
    },
  ];

  syncWithLocalMenu() {
    const hasValue = localStorage.getItem("sidebarMenu");

    if (!hasValue) {
      return;
    }

    this.showMenus = JSON.parse(hasValue);
  }

  toggleNavbar(menu: string) {
    this.showMenus[menu] = !this.showMenus[menu];
    if (this.showMenus[menu]) {
      Object.keys(this.showMenus).forEach((key) => {
        if (key !== menu) {
          this.showMenus[key] = false;
        }
      });
    }

    localStorage.setItem("sidebarMenu", JSON.stringify(this.showMenus));
  }

  closeAllMenus() {
    this.showMenus = {
      adminMenu: false,
      notificationMenu: false,
      reportMenu: false,
      transacionMenu: false,
      listMenu: false,
    };
    localStorage.setItem("sidebarMenu", JSON.stringify(this.showMenus));
  }

  RedirectListLink(val, event) {
    $("body").removeClass("sidebar-open");
    $("body").addClass("sidebar-collapse");
    event.preventDefault();
    this.router.navigate(["lists"], {
      state: {
        activeTab: val,
      },
    });
  }

  RedirectTransLink(val, event) {
    $("body").removeClass("sidebar-open");
    $("body").addClass("sidebar-collapse");
    event.preventDefault();
    this.router.navigate(["transaction"], {
      state: {
        activeTab: val,
      },
    });
  }
  RedirectNotificationLink(item) {
    $("body").removeClass("sidebar-open");
    $("body").addClass("sidebar-collapse");
    this.router.navigate(["notification"], {
      state: {
        activeTab: item,
      },
    });
  }

  RedirectReportLink(val) {
    $("body").removeClass("sidebar-open");
    $("body").addClass("sidebar-collapse");
    this.router.navigate(["report"], {
      state: {
        activeTab: val,
      },
    });
  }

  onDashboardClick() {
    $("body").removeClass("sidebar-open");
    $("body").addClass("sidebar-collapse");
  }
}
