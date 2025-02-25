import { Component, HostListener, OnInit } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { TranslateService, TranslateModule } from "@ngx-translate/core";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { LocalstoragedataService } from "../../commons/local-storage-data.service";
import { PageRouteVariable } from "../../commons/page-route-variable";
import { EventService } from "src/app/services/event.service";
import { Observable, Subscription } from "rxjs";
import { DonaryIdleService } from "src/app/commons/donary-idle.service";
import Swal from "sweetalert2";
import * as moment from "moment";
import { PlanService } from "src/app/services/plan.service";
import { DoanryDirective } from "../../commons/modules/doanry-directive.module/doanry-directive.module.module";
import { NgIf } from "@angular/common";
import { environment } from "src/environments/environment";

declare var $: any;
declare const Canny;
@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"],
  host: {
    "(window:click)": "onClick()",
  },
  standalone: true,
  imports: [NgIf, DoanryDirective, RouterLink, TranslateModule],
})
export class HeaderComponent implements OnInit {
  isShowDiv = false;
  isClose: boolean = true;
  isProdEnv: boolean;
  landingPageUrl: string = "/" + PageRouteVariable.Auth_Login_url;
  donateExt: string;
  donateExtImageUrl: string;
  donateExtensionNum: number;
  isFeatureSetting: boolean = true;
  featureDisplayName: string;
  filtereFeaturedData = [];
  public fullName: string;
  public organisationName: string;
  idle$!: Observable<Boolean>;
  sleep$!: Observable<Boolean>;
  wakeUp$!: Observable<Boolean>;
  private _donaryIdleSubscriptions: Subscription = new Subscription();
  timerInterval: any;
  isBannerShow: boolean = false;
  isBanner: any;
  constructor(
    private localstoragedataService: LocalstoragedataService,
    private commonMethodService: CommonMethodService,
    private eventService: EventService,
    private router: Router,
    private translate: TranslateService,
    private donaryIdleService: DonaryIdleService,
    private planService: PlanService
  ) {}

  ngOnInit() {
    this.isProdEnv = environment.baseUrl.includes("https://webapi.donary.com/");
    let userStorage = JSON.parse(localStorage.getItem("user_storage"));
    Canny("identify", {
      appID: "6572173c99e1136e0618a125",
      user: {
        email: userStorage.email,
        name: userStorage.firstname + " " + userStorage.lastname,
        id: userStorage.userId,
      },
    });

    this.isBanner = this.localstoragedataService.getLoginUserEventPlan();

    this.checkDateChange();
    this.fullName = this.localstoragedataService.getLoginUserFullName();
    this.organisationName =
      this.localstoragedataService.getLoginUserOrganisation();

    var extension = this.localstoragedataService.getLoginUserDonateExt();
    this.donateExt = "DONARY.COM/" + extension;
    this.donateExtensionNum = extension;
    this.donateExtImageUrl =
      this.localstoragedataService.getLoginUserDonateExtImageUrl();
    if (localStorage.getItem("defaultLangAPI") != "True") {
      this.eventService
        .GetSetting(this.localstoragedataService.getLoginUserEventGuId(), true)
        .subscribe((res: any) => {
          if (res) {
            let setting = res
              .filter((x) => x.settingName == "Language")
              .map((x) => x.text)
              .toString();
            this.commonMethodService.advancedAPIKey = res
              .filter((x) => x.settingName == "UseReasonForAdvancedAPIKey")
              .map((x) => x.text)
              .toString();
            this.commonMethodService.isDisableAutomaticPledgeReceiptEmail = res
              .filter(
                (x) => x.settingName == "DisableAutomaticPledgeReceiptEmail"
              )
              .map((x) => x.text)
              .toString();
            this.commonMethodService.isACH = res
              .filter((x) => x.settingName == "isEnableACH")
              .map((x) => x.text)
              .toString();
            this.commonMethodService.ShulKioskBulletinImage = res
              .filter((x) => x.settingName == "BulletinImageURL")
              .map((x) => x.isStartup)
              .toString();
            this.commonMethodService.BulletinImageSettingId = res
              .filter((x) => x.settingName == "BulletinImageURL")
              .map((x) => x.settingID)
              .toString();
            if (setting == "Hebrew") {
              this.commonMethodService.isHebrew = true;
              $("body").addClass("rtl");
              this.translate.use("heb");
              this.commonMethodService.setGlobalLang(
                this.commonMethodService.isHebrew
              );
            } else {
              this.commonMethodService.isHebrew = false;
              $("body").removeClass("rtl");
              this.translate.use("en");
              this.commonMethodService.setGlobalLang(
                this.commonMethodService.isHebrew
              );
            }
          }
        });
    }
    const eventGuid = this.localstoragedataService.getLoginUserEventGuId();
    const macAddress = this.localstoragedataService.getLoginUserGuid();

    this.planService.getFeatureSettings({ eventGuid, macAddress }).subscribe(
      (res: any) => {
        if (res) {
          this.commonMethodService.setting = res;
          this.filtereFeaturedData = this.commonMethodService.setting.filter(
            (item) =>
              item.featureSettingValue === false &&
              (item.featureID < 26 || item.featureID > 41)
          );

          if (this.filtereFeaturedData.length !== 0) {
            if (this.isBanner == "Core") this.isFeatureSetting = false;

            if (!this.isFeatureSetting) {
              $("body").addClass("donory-core");
              this.featureDisplayName =
                this.filtereFeaturedData[0].featureDisplayName;
            }
          }
        }
      },
      (err) => {
        console.log("error", err);
      }
    );
  }

  signOut() {
    this.localstoragedataService.setCurrentMenuState(null);
    this.localstoragedataService.setLoginUserDataandToken(null, "0");
    localStorage.setItem("defaultLangAPI", "False");
    this.router.navigateByUrl(this.landingPageUrl);
  }

  useLanguage(language: string): void {
    localStorage.setItem("defaultLangAPI", "True");
    if (
      this.translate.currentLang == "en" ||
      this.translate.currentLang == undefined
    ) {
      this.commonMethodService.isHebrew = true;
      $("body").addClass("rtl");
      this.translate.use("heb");
    } else {
      this.commonMethodService.isHebrew = false;
      $("body").removeClass("rtl");
      this.translate.use("en");
    }
    this.commonMethodService.setGlobalLang(this.commonMethodService.isHebrew);
  }

  toggleDisplayDiv(event) {
    event.stopPropagation();
    this.isShowDiv = !this.isShowDiv;
    this.isClose = false;
  }

  //code for popup close when clicked outside of popup started
  onClick() {
    this.isClose = true;
  }

  closePopup() {
    this.isClose = true;
    this.isShowDiv = false;
  }

  @HostListener("document:click")
  clickedOut() {
    if (this.isClose === false) {
      this.closePopup();
    }
  }
  //code for popup close when clicked outside of popup ended
  checkDateChange() {
    let isClickedContinue = true;
    this.timerInterval = setInterval(() => {
      let currentTime = moment().format("HH:mm");
      if (currentTime == "23:59") {
        this.donaryIdleService.startActivity();
        Swal.fire({
          text: "Now the date changed!",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          confirmButtonText: "Reload",
          cancelButtonText: "Continue",
        }).then((result) => {
          if (result.isConfirmed) {
            this.clearTimerInterval();
            return;
          }
          if (result.dismiss) {
            isClickedContinue = false;
          }
        });
      }
    }, 50000);
    this._donaryIdleSubscriptions = this.donaryIdleService.idle$
      .pipe()
      .subscribe((data) => {
        if (data && isClickedContinue) {
          this.clearTimerInterval();
        }
      });
  }
  clearTimerInterval() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    Swal.close();
    window.location.reload();
  }

  onUpgrade(event) {
    event.preventDefault();
    this.commonMethodService.commenSendUpgradeEmail(this.featureDisplayName);
  }

  ngOnDestroy() {
    this.clearTimerInterval();
  }
}
