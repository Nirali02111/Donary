import { Injectable } from "@angular/core";
import * as moment from "moment";
import { BehaviorSubject } from "rxjs";
import { Router, NavigationEnd } from '@angular/router';
@Injectable({
  providedIn: "root",
})
export class LocalstoragedataService {
  private previousUrl: string = undefined;
  private currentUrl: string = undefined;
  constructor(private router : Router) {
    this.currentUrl = this.router.url;
    router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.previousUrl = this.currentUrl;
        this.currentUrl = event.url;
      };
    });
  }


  setLoginUserDataandToken(userdata: any, isPledgePaymentLogin: string = "0") {
    localStorage.setItem("user_storage", JSON.stringify(userdata));
    this.setTokenExpiryTime(
      userdata !== null && userdata !== "" ? userdata.expiresIn : 0
    );
    this.setAccessToken(
      userdata !== null && userdata !== "" ? userdata.accessToken : ""
    );
    this.setRefreshToken(
      userdata !== null && userdata !== "" ? userdata.refreshToken : ""
    );
    this.setPledgePaymentLoginFlag(isPledgePaymentLogin);
  }

  setLoginUserPayDataandToken(userdata: any, isPledgePaymentLogin: string = "0") {
    const {  userId, ...restUserData } = userdata;
    localStorage.setItem("userpay_storage", JSON.stringify(restUserData));
    this.setPayAccessToken(
      userdata !== null && userdata !== "" ? userdata.accessToken : ""
    );
    this.setPledgePaymentLoginFlag(isPledgePaymentLogin);
  }

  setPledgePaymentLoginFlag(isPledgePaymentLogin: string) {
    localStorage.setItem("isPledgePaymentLogin", isPledgePaymentLogin);
  }

  setPayAccessToken(accessToken: string) {
    localStorage.setItem("payaccesstoken", accessToken);
  }

  setAccessToken(accessToken: string) {
    localStorage.setItem("accesstoken", accessToken);
  }

  setRefreshToken(refreshToken: string) {
    localStorage.setItem("refreshtoken", refreshToken);
  }

  setPermissionLst(permissionLst) {
    localStorage.setItem("permissionLst", JSON.stringify(permissionLst));
  }

  getLoginUserData() {
    return JSON.parse(localStorage.getItem("user_storage"));
  }

  getLoginUserPayData() {
    return JSON.parse(localStorage.getItem("userpay_storage"));
  }

  getPermissionLst() {
    return JSON.parse(localStorage.getItem("permissionLst"));
  }
  
  setCurrentMenuState(menuItems) {
    if (menuItems) {
      localStorage.setItem("currentMenu", JSON.stringify(menuItems));
    } else {
      localStorage.setItem("currentMenu", null);
    }
  }

  getCurrentMenuState() {
    return JSON.parse(localStorage.getItem("currentMenu"));
  }

  getLoginUserDonateExt() {
    if (JSON.parse(localStorage.getItem("user_storage"))) {
      return JSON.parse(localStorage.getItem("user_storage")).donateExt;
    } else {
      return "";
    }
  }

  getLoginUserEventPlan() {
    if (JSON.parse(localStorage.getItem("user_storage"))) {
      return JSON.parse(localStorage.getItem("user_storage")).eventPlan;
    } else {
      return "";
    }
  }

  getLoginUserDonateExtImageUrl() {
    if (JSON.parse(localStorage.getItem("user_storage"))) {
      return JSON.parse(localStorage.getItem("user_storage")).donateExtImageUrl;
    } else {
      return "";
    }
  }

  getLoginUserisAliyasPledge() {
    if (JSON.parse(localStorage.getItem("user_storage"))) {
      return JSON.parse(localStorage.getItem("user_storage")).isAliyasPledge;
    } else {
      return "";
    }
  }

  getLoginUserisCampaignRequiredForTransaction() {
    if (JSON.parse(localStorage.getItem("user_storage"))) {
      return JSON.parse(localStorage.getItem("user_storage")).isCampaignRequiredForTransaction;
    } else {
      return "";
    }
  }

  getLoginUserisReasonRequiredForTransaction() {
    if (JSON.parse(localStorage.getItem("user_storage"))) {
      return JSON.parse(localStorage.getItem("user_storage")).isReasonRequiredForTransaction;
    } else {
      return "";
    }
  }

  getLoginUserDonateWeb() {
    if (JSON.parse(localStorage.getItem("user_storage"))) {
      return JSON.parse(localStorage.getItem("user_storage")).donateWeb;
    } else {
      return "";
    }
  }

  getLoginUserDonatePhone() {
    if (JSON.parse(localStorage.getItem("user_storage"))) {
      return JSON.parse(localStorage.getItem("user_storage")).donatePhone;
    } else {
      return "";
    }
  }

  getLoginUserUserName() {
    if (JSON.parse(localStorage.getItem("user_storage"))) {
      return JSON.parse(localStorage.getItem("user_storage")).username;
    } else {
      return "";
    }
  }

  getLoginUserEmail() : string {
    if (JSON.parse(localStorage.getItem("user_storage"))) {
      return JSON.parse(localStorage.getItem("user_storage")).email;
    } else {
      return "";
    }
  }

  getLoginUserEventName() {
    if (JSON.parse(localStorage.getItem("user_storage"))) {
      return JSON.parse(localStorage.getItem("user_storage")).eventName;
    } else {
      return "";
    }
  }

  getLoginUserFullName() {
    if (JSON.parse(localStorage.getItem("user_storage"))) {
      return (
        JSON.parse(localStorage.getItem("user_storage")).firstname +
        " " +
        JSON.parse(localStorage.getItem("user_storage")).lastname
      );
    } else {
      return "";
    }
  }

  getLoginUserOrganisation() {
    if (JSON.parse(localStorage.getItem("user_storage"))) {
      return JSON.parse(localStorage.getItem("user_storage")).organizationName;
    } else {
      return "";
    }
  }

  getLoginUserOrganisationId() {
    if (JSON.parse(localStorage.getItem("user_storage"))) {
      return JSON.parse(localStorage.getItem("user_storage")).organizationID;
    } else {
      return "";
    }
  }
  getLoginUserCurrency() {
    if (JSON.parse(localStorage.getItem("user_storage"))) {
      return JSON.parse(localStorage.getItem("user_storage")).eventCurrency;
    } else {
      return null;
    }
  }

  getPayCurrency() {
    if (JSON.parse(localStorage.getItem("userpay_storage"))) {
      return JSON.parse(localStorage.getItem("userpay_storage")).eventCurrency;
    } else {
      return null;
    }
  }

  getLoginUserEventGuId() {
    return this.getLoginUserData() && this.getLoginUserData().eventGuid;
  }
  getLoginUserId() {
    return this.getLoginUserData() && this.getLoginUserData().userId;
  }

  getLoginUserGuid() {
    return this.getLoginUserData() && this.getLoginUserData().userGUID;
  }
  
  getLoginEventID() {
    return this.getLoginUserData() && this.getLoginUserData().eventId;
  }

  getloginUserAccessToken() {
    return localStorage.getItem("accesstoken");
  }

  getloginPayUserAccessToken() {
    return localStorage.getItem("payaccesstoken");
  }

  getloginUserRefreshToken() {
    return localStorage.getItem("refreshtoken");
  }

  getPledgePaymentLoginFlag() {
    return JSON.parse(localStorage.getItem("isPledgePaymentLogin"));
  }

  setTokenExpiryTime(expiryTime) {
    const expiresAt = moment().add(expiryTime, "second");
    localStorage.setItem("expires_at", JSON.stringify(expiresAt.valueOf()));
  }

  getTokenExpiryTime() {
    return localStorage.getItem("expires_at");
  }

  isLoggedIn() {
    return moment().isBefore(this.getExpiration());
  }

  isLoggedOut() {
    return !this.isLoggedIn();
  }

  getExpiration() {
    const expiration = localStorage.getItem("expires_at");
    const expiresAt = JSON.parse(expiration);
    return moment(expiresAt);
  }

  private messageSource = new BehaviorSubject(false);
  currentMessage = this.messageSource.asObservable();

  changeMessage(success: boolean) {
    this.messageSource.next(success);
  }

  getLoginUserFirstname() {
    if (JSON.parse(localStorage.getItem("user_storage"))) {
      return JSON.parse(localStorage.getItem("user_storage")).firstname
    } else {
      return "";
    }
  }

  getLoginUserLastname() {
    if (JSON.parse(localStorage.getItem("user_storage"))) {
      return JSON.parse(localStorage.getItem("user_storage")).lastname;
    } else {
      return "";
    }
  }
  getUserEventCurrency() {
    if (JSON.parse(localStorage.getItem("user_storage"))) {
      return JSON.parse(localStorage.getItem("user_storage")).eventCurrency
    } else {
      return "";
    }
  }
  public getPreviousUrl(){
    return this.previousUrl;
  }
  setOrganizationId(OrganizationId: string) {
    localStorage.setItem("OrganizationId", OrganizationId);
  }
  getOrganizationId() {
   return localStorage.getItem("OrganizationId");
  }

  setSeasonId(seasonId: any) {
    localStorage.setItem("seasonId", seasonId);
  }
  getSeasonId() {
   return localStorage.getItem("seasonId");
  }


  isTabulatorEvent() {
 
    const value = this.getLoginUserData().eventGuid;
    
    if (!value) {
      return false
    }

    const event1 = 'f2d4dd3a-fa6d-48b0-a542-2cefb8f62d59';
    const event2 = '6655dd44-5f4b-4cf5-9f57-cb82a7e16671';
    const event3 = '4a1a582d-dc69-448f-ab97-fd960a44709c';

    if (value.toLowerCase() === event1 || value.toLowerCase() === event2 || value.toLowerCase() === event3 ) {
      return true
    }

    return false
  }
  

}
