import { Component, OnInit } from "@angular/core";
import { Subject } from "rxjs";
import { ActivatedRoute, Router, RouterOutlet } from "@angular/router";
import { PageRouteVariable } from "./commons/page-route-variable";
import packageInfo from "../../package.json";
import Swal from "sweetalert2";
import { TranslateService } from "@ngx-translate/core";
import { FooterComponent } from "./@theme/footer/footer.component";
import { SidebarMenuComponent } from "./@theme/sidebar-menu/sidebar-menu.component";
import { HeaderComponent } from "./@theme/header/header.component";
import { NgIf } from "@angular/common";
import { BroadcastChannelService } from "./services/broadcast-channel.service";
import {
  RECAPTCHA_LOADER_OPTIONS,
  RECAPTCHA_V3_SITE_KEY,
  RecaptchaV3Module,
  ReCaptchaV3Service,
} from "ng-recaptcha";
import { environment } from "src/environments/environment";
import { Params } from "./commons/enums/Params";
import { AnalyticsService } from "./services/analytics.service";
import { CommonMethodService } from "./commons/common-methods.service";

declare var $: any;

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
  standalone: true,
  imports: [
    NgIf,
    HeaderComponent,
    SidebarMenuComponent,
    RouterOutlet,
    FooterComponent,
    RecaptchaV3Module,
  ],
  providers: [
    {
      provide: RECAPTCHA_V3_SITE_KEY,
      useValue: environment.RECAPTCHA_V3_SITE_KEY,
    },
    ReCaptchaV3Service,
    {
      provide: RECAPTCHA_LOADER_OPTIONS,
      useValue: {
        onBeforeLoad(_url: any) {
          return {
            url: new URL("https://www.google.com/recaptcha/enterprise.js"),
          };
        },
        onLoaded(recaptcha: any) {
          return recaptcha.enterprise;
        },
      },
    },
  ],
})
export class AppComponent implements OnInit {
  title = "";
  private destroy$: Subject<void> = new Subject<void>();
  path = "";
  isHeaderMenuVisible: boolean = false;
  isSideMenuVisible: boolean = false;

  isFooterVisible = true;

  landingPage_url: string = "/";
  authPage_url: string = "/" + PageRouteVariable.Auth_Main_url;
  donarPledgePaymentPay_url: string =
    "/" + PageRouteVariable.DonorPledgePaymentPay_url;
  pledgePaymentlogin_url: string =
    "/" + PageRouteVariable.DonorPledgePaymentLogin_url;
  productPlans_url: string = "/" + PageRouteVariable.DonorProductPlans_url;
  drm_url: string = "/" + PageRouteVariable.DonorDrm_url;
  mobiledevice_url: string = "/" + PageRouteVariable.DonorMobileDevice_url;
  productCheckout_url: string = "/" + PageRouteVariable.ProductCheckout_url;
  resetLink_url: string = "/auth/resetpass";
  resetLinkDynamic: string = "";

  donaryDonateUrl: string = "/" + PageRouteVariable.DonaryDonate_url;
  donaryUpdateUrl: string = "/" + PageRouteVariable.DonaryUpdates_url;

  // for panel

  isDashboard = "/" + PageRouteVariable.Dashboard_url;
  isGrid = "/" + PageRouteVariable.Grid_url;
  isNotificationUrl = "/" + PageRouteVariable.Notification_url;
  isTransaction = "/" + PageRouteVariable.TransactionPage_url;
  isDonorPay = "/" + PageRouteVariable.DonorPay_url;
  isReport = "/" + PageRouteVariable.Report_url;
  isList = "/" + PageRouteVariable.ListPage_url;
  isAdmin = "/" + PageRouteVariable.Admin_url;
  isFinance = "/" + PageRouteVariable.Finance_url;

  href;
  orginUrl;
  isLoading = true;
  isFeatureSetting: boolean;
  currentUser;
  modalOptions = {
    keyboard: false,
    centered: true,
    backdrop: "static",
  };

  constructor(
    private router: Router,
    public translate: TranslateService,
    private broadcastService: BroadcastChannelService,
    private analytics: AnalyticsService,
    private activeRoute: ActivatedRoute,
    public commonMethodService: CommonMethodService
  ) {
    router.events.subscribe((val) => {
      this.UserLoggedInChangeEvent();
    });
    this.checkUIVersion();
  }

  ngOnInit(): void {
    this.currentUser = JSON.parse(localStorage.getItem("user_storage"));
    this.handleNewLogin();
    this.setupUTMParams();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupUTMParams() {
    this.activeRoute.queryParamMap.subscribe((params) => {
      if (
        (params.has(Params.UTM_CAMPAIGN) ||
          params.has(Params.UTM_MEDIUM) ||
          params.has(Params.UTM_SOURCE)) &&
        !environment.GA_KEEP_UTM_PARAMETER
      ) {
        const utm_c = params.get(Params.UTM_CAMPAIGN) as string;
        const utm_m = params.get(Params.UTM_MEDIUM) as string;
        const utm_s = params.get(Params.UTM_SOURCE) as string;

        this.analytics.initCampaignDetails(utm_c as string, {
          campaign: utm_c,
          source: utm_s,
          medium: utm_m,
        });
      }
    });
  }

  handleNewLogin() {
    this.broadcastService.getMessage().subscribe(
      (data) => {
        if (
          this.currentUser.userId !== data.userId ||
          this.currentUser.organizationName !== data.organizationName
        ) {
          let organizationName = data["organizationName"]
            ? `"${data["organizationName"]}"`
            : "";
          let popupText = `You have logged into a different account ${organizationName}. you will now be redirected to that account.`;

          const modalRef = Swal.fire({
            title: "Warning...!",
            text: popupText,
            allowEscapeKey: false,
            allowOutsideClick: false,
            reverseButtons: true,
            focusCancel: true,
            confirmButtonText: this.commonMethodService.getTranslate(
              "WARNING_SWAL.BUTTON.CONFIRM.OK"
            ),
          });

          modalRef.then((result) => {
            if (result.value) window.location.reload();
          });
        }
      },
      (error) => {}
    );
  }

  version = packageInfo.version;
  checkUIVersion() {
    if (
      localStorage.getItem("UIVersion") !== this.version &&
      localStorage.getItem("UIVersion") != null
    ) {
      localStorage.setItem("UIVersion", this.version);
      Swal.fire({
        title: "",
        icon: "warning",
        text: "New Version available. Reloading the page for new updates.",
        confirmButtonText: this.commonMethodService.getTranslate(
          "WARNING_SWAL.BUTTON.CONFIRM.OK"
        ),
      }).then((result) => {
        if (result.value) {
          window.location.reload();
        }
      });
    }
  }

  UserLoggedInChangeEvent() {
    this.path = window.location.pathname;
    this.orginUrl = window.location.origin;
    if (!this.href) {
      this.href = window.location.href;
      this.setPageTitile();
    }

    if (
      this.path.includes(this.isDashboard) ||
      this.path.includes(this.isGrid) ||
      this.path.includes(this.isNotificationUrl) ||
      this.path.includes(this.isTransaction) ||
      this.path.includes(this.isDonorPay) ||
      this.path.includes(this.isReport) ||
      this.path.includes(this.isList) ||
      this.path.includes(this.isAdmin) ||
      this.path.includes(this.isFinance)
    ) {
      this.isHeaderMenuVisible = true;
      this.isSideMenuVisible = true;
      this.isFooterVisible = false;
    } else {
      this.isHeaderMenuVisible = false;
      this.isSideMenuVisible = false;
      this.isFooterVisible = true;
      if (
        this.path.includes(this.donaryDonateUrl) ||
        this.path.includes(this.donaryUpdateUrl)
      ) {
        this.isFooterVisible = false;
      }
    }
  }

  setPageTitile() {
    //set page
    if (this.orginUrl == "https://drm.donary.com") {
      $("#PageTitle").text("Donary | DRM • Donor Relations Management");
    }
    if (this.orginUrl == "https://drm.donary.com/") {
      $("#PageTitle").text("Donary | DRM • Donor Relations Management");
    }
    if (this.href == "https://p.donary.com/productandplans") {
      $("#PageTitle").text("Donary | Products & Plans");
    }
    if (this.href == "https://p.donary.com/productandplans/") {
      $("#PageTitle").text("Donary | Products & Plans");
    }
    if (this.orginUrl == "https://dev-drm.donary.com") {
      $("#PageTitle").text("Donary | DRM • Donor Relations Management");
    }
    if (this.orginUrl == "https://dev-drm.donary.com/") {
      $("#PageTitle").text("Donary | DRM • Donor Relations Management");
    }
    if (this.href == "https://dev-drm.donary.com/productandplans") {
      $("#PageTitle").text("Donary | Products & Plans");
    }
    if (this.href == "https://dev-drm.donary.com/productandplans/") {
      $("#PageTitle").text("Donary | Products & Plans");
    }
    //
  }
}
