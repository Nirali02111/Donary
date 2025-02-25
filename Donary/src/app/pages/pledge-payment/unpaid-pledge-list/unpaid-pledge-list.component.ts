import {
  Component,
  ElementRef,
  OnInit,
  QueryList,
  ViewChildren,
} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { NgbModalOptions } from "@ng-bootstrap/ng-bootstrap";

import { CommonMethodService } from "../../../commons/common-methods.service";
import { LocalstoragedataService } from "../../../commons/local-storage-data.service";
import { NotificationService } from "../../../commons/notification.service";
import { PageRouteVariable } from "../../../commons/page-route-variable";
import { PledgePaymentModel } from "../../../models/pledge-payment-model";
import { PledgePaymentService } from "../../../services/pledge-payment.service";
import { PledgePaymentPayPopupComponent } from "../pledge-payment-pay-popup/pledge-payment-pay-popup.component";
import { PledgePaymentVerifyComponent } from "../pledge-payment-verify/pledge-payment-verify.component";

@Component({
  selector: "app-unpaid-pledge-list",
  templateUrl: "./unpaid-pledge-list.component.html",
  standalone: false,
  styleUrls: ["./unpaid-pledge-list.component.scss"],
})
export class UnpaidPledgeListComponent implements OnInit {
  @ViewChildren("checkboxes") checkboxes: QueryList<ElementRef>;
  data: Array<PledgePaymentModel> = [];
  filterData: Array<PledgePaymentModel> = [];
  isloading: boolean;
  OrganizationName: string;
  OrganizationNameJewish: string;
  OrganizationAddressInfo: string;
  OrganizationCityStateZip: string;
  EventName: string;
  EventNameJewish: string;
  FullNameJewish: string;
  FullName: string;
  eventLogo: string;
  UserAddress: string;
  UserCityStateZip: string;
  totalPayableAmount: string;
  accountId: string;
  emailAddress: string;
  phonenumber: string;
  landingPage_url: string = PageRouteVariable.Auth_Login_url;
  popupSuccessmessage: boolean;
  modalOptions: NgbModalOptions;
  recordSelectedArray = [];
  isChecked: boolean = false;
  eventCurrency: string;
  currencyIcon: string;

  constructor(
    private pledgePaymentService: PledgePaymentService,
    public localstoragedataService: LocalstoragedataService,
    private notificationService: NotificationService,
    private route: ActivatedRoute,
    public commonMethodService: CommonMethodService
  ) {}
  ngOnInit() {
    const body = document.getElementsByTagName("body")[0];
    body.classList.add("paypledge_footer");
    this.callEventBasedOnSuccessMessage();
  }
  isBindDataCall = false;
  callEventBasedOnSuccessMessage() {
    // used when popup dilog close after save button click and initially Login verify button click
    this.localstoragedataService.currentMessage.subscribe((message) => {
      this.popupSuccessmessage = message;
      if (this.popupSuccessmessage) {
        this.isBindDataCall = true;
        this.bindData();
      } else {
        this.totalPayableAmount = "0.00";
        // Used When call externally either from old donary or by clicking of email/sms
        this.accountId = this.route.snapshot.paramMap.get("accountId");
        this.phonenumber = this.route.snapshot.paramMap.get("phonenumber");
        if (this.accountId && this.phonenumber) {
          this.login();
        } else {
          // when load this page from Pay link in landing page from same website
          this.OpenPledgePaymentLoginPage();
        }
      }
    });
  }

  login() {
    let objUser = {
      accountId: this.accountId,
      phonenumber: this.phonenumber,
    };
    // show loader
    this.isloading = true;
    this.pledgePaymentService.donorPledgePaymentLogin(objUser).subscribe(
      (res: any) => {
        // hide loader
        this.isloading = false;
        if (res) {
          this.localstoragedataService.setLoginUserPayDataandToken(res, "1");
          this.localstoragedataService.changeMessage(true);
          if (!this.isBindDataCall) {
            this.bindData();
          }
        }
      },
      (error) => {
        this.notificationService.showError(error.error, "Error!!");
        this.isloading = false;
        this.OpenPledgePaymentLoginPage();
      }
    );
  }

  OpenPledgePaymentLoginPage() {
    const modalRef = this.commonMethodService.openPopup(
      PledgePaymentVerifyComponent
    );
    modalRef.componentInstance.accountId = this.accountId;
    modalRef.componentInstance.phoneNumber = this.phonenumber;
  }

  bindData() {
    let logInUserObj = this.localstoragedataService.getLoginUserPayData();
    if (logInUserObj) {
      this.isloading = true;

      let accountId = logInUserObj.accountId;
      let eventGuid = logInUserObj.eventGuid;
      this.OrganizationName = logInUserObj.organizationName;
      this.OrganizationNameJewish = logInUserObj.organizationNameJewish;
      this.OrganizationAddressInfo = logInUserObj.organizationAddressInfo;
      this.OrganizationCityStateZip = logInUserObj.organizationCityStateZip;
      this.EventName = logInUserObj.eventName;
      this.EventNameJewish = logInUserObj.eventNameJewish;
      this.FullNameJewish = logInUserObj.fullNameJewish;
      this.FullName = logInUserObj.fullName;
      this.UserAddress = logInUserObj.userAddress;
      this.UserCityStateZip = logInUserObj.userCityStateZip;
      this.emailAddress = logInUserObj.emailAddress;
      this.eventCurrency = logInUserObj.eventCurrency;
      // show loader

      this.pledgePaymentService
        .donorPledgePaymentList(accountId, eventGuid)
        .subscribe(
          (res: any) => {
            // hide loader
            this.isloading = false;
            if (res) {
              this.eventLogo = res.ticketImage;
              this.data = res.unpaidPledges;
              this.filterData = res.unpaidPledges;
              for (let data of this.data) {
                this.recordSelectedArray.push(data.pledgeId);
                data.pledgeRemainingAmount =
                  Number(data.pledgeRemainingAmount) -
                  Number(data.pledgeDefaultDisplayAmount);
                data.orgRemainingAmount = data.pledgeDefaultDisplayAmount;
              }
              this.isChecked = true;
              this.getTotalPayableAmount();
            } else {
              this.data = [];
              this.filterData = [];
              this.getTotalPayableAmount();
            }
          },
          (error) => {
            this.isloading = false;
            console.log(error);
            this.notificationService.showError(
              error.error,
              "Error while fetching data !!"
            );
          }
        );
    } else {
      this.notificationService.showError(
        "Donor details could not be found.",
        "Error while fetching data !!"
      );
    }
  }

  getCurrencySymbol() {
    if (
      this.eventCurrency == null ||
      this.eventCurrency == "USD" ||
      this.eventCurrency == "CAD"
    ) {
      this.currencyIcon = "$";
    } else if (this.eventCurrency == "GBP") {
      this.currencyIcon = "£";
    } else if (this.eventCurrency == "EUR") {
      this.currencyIcon = "€";
    } else if (this.eventCurrency == "ILS") {
      this.currencyIcon = "₪";
    }
    return this.currencyIcon;
  }

  search(term: string) {
    if (!term) {
      this.filterData = this.data;
    } else {
      this.filterData = this.data.filter(
        (x) =>
          (x.pledgeNum &&
            x.pledgeNum
              .trim()
              .toLowerCase()
              .includes(term.trim().toLowerCase())) ||
          (x.pledgeNum &&
            x.campaignName
              .trim()
              .toLowerCase()
              .includes(term.trim().toLowerCase())) ||
          (x.refNum &&
            x.refNum
              .trim()
              .toLowerCase()
              .includes(term.trim().toLowerCase())) ||
          (x.description &&
            x.description
              .trim()
              .toLowerCase()
              .includes(term.trim().toLowerCase())) ||
          (x.reasonName &&
            x.reasonName
              .trim()
              .toLowerCase()
              .includes(term.trim().toLowerCase())) ||
          (x.locationName &&
            x.locationName
              .trim()
              .toLowerCase()
              .includes(term.trim().toLowerCase())) ||
          (x.scheduleRepeatType &&
            x.scheduleRepeatType
              .trim()
              .toLowerCase()
              .includes(term.trim().toLowerCase())) ||
          (x.externalNote &&
            x.externalNote
              .trim()
              .toLowerCase()
              .includes(term.trim().toLowerCase()))
      );
    }
  }

  selectRecord(event, type, pledgeId) {
    if (type == "selectAll") {
      if (event.target.checked) {
        this.isChecked = true;
        this.data.forEach((element) => {
          this.recordSelectedArray.push(element.pledgeId);
        });
        this.data.forEach((element) => {
          element.pledgeDefaultDisplayAmount = Number(
            element.orgRemainingAmount.toFixed(2)
          );
          element.pledgeRemainingAmount = 0;
        });
        this.getTotalPayableAmount();
      } else {
        this.isChecked = false;
        this.checkboxes.forEach((element) => {
          element.nativeElement.checked = false;
          this.totalPayableAmount = "0.00";
        });
        this.data.forEach((element) => {
          element.pledgeDefaultDisplayAmount = 0;
          element.pledgeRemainingAmount = Number(
            element.orgRemainingAmount.toFixed(2)
          );
        });
        this.recordSelectedArray = [];
      }
    } else {
      if (event.target.checked) {
        if (!this.recordSelectedArray.includes(pledgeId)) {
          this.recordSelectedArray.push(pledgeId);
        }

        this.data.forEach((element) => {
          if (element.pledgeId == pledgeId) {
            var amount = this.totalPayableAmount.replace(
              this.getCurrencySymbol(),
              ""
            );
            if (amount.indexOf(",") > -1) {
              amount = amount.replace(",", "");
            }
            var payablamt =
              Number(amount) + Number(element.pledgeRemainingAmount);
            this.totalPayableAmount =
              this.commonMethodService.formatAmount(payablamt);
            element.pledgeDefaultDisplayAmount = Number(
              element.orgRemainingAmount.toFixed(2)
            );
            element.pledgeRemainingAmount = 0;
          }
        });
      } else {
        if (this.recordSelectedArray.includes(pledgeId)) {
          this.recordSelectedArray.forEach((element, index) => {
            if (element == pledgeId) this.recordSelectedArray.splice(index, 1);
          });
        }
        this.data.forEach((element) => {
          if (element.pledgeId == pledgeId) {
            var amount = this.totalPayableAmount.replace(
              this.getCurrencySymbol(),
              ""
            );
            if (amount.indexOf(",") > -1) {
              amount = amount.replace(",", "");
            }
            var payablamt =
              Number(amount) - Number(element.orgRemainingAmount.toFixed(2));
            this.totalPayableAmount =
              this.commonMethodService.formatAmount(payablamt);
            element.pledgeDefaultDisplayAmount = 0;
            element.pledgeRemainingAmount = element.orgRemainingAmount;
          }
        });
      }
    }
  }

  checkselectRecord(pledgeId): Boolean {
    return this.recordSelectedArray.includes(pledgeId);
  }

  OpenPledgePaymentPopupPage() {
    // if (this.localstoragedataService.isLoggedIn()) {
    this.modalOptions = {
      centered: true,
      //size: "lg",
      backdrop: false,
      keyboard: true,
      windowClass: "drag_popup pledge_payment",
    };
    var datalist = [];
    this.data.forEach((element) => {
      if (this.recordSelectedArray.includes(element.pledgeId)) {
        datalist.push(element);
      }
    });
    const modalRef = this.commonMethodService.openPopup(
      PledgePaymentPayPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.lstSelectedPledgeDetailsObj = datalist;
    this.totalPayableAmount = this.totalPayableAmount.replace(/\,/g, "");
    modalRef.componentInstance.totalPaidAmount = Number(
      this.totalPayableAmount.replace(this.getCurrencySymbol(), "")
    );
    modalRef.componentInstance.emtOutputreloadList.subscribe((res: any) => {
      if (res) {
        this.bindData();
      }
    });
  }

  resetPayAmount(pledgeId) {
    let pledgeObj = this.data.filter((s) => s.pledgeId == pledgeId);
    if (pledgeObj) {
      pledgeObj[0].pledgeDefaultDisplayAmount = 0;
      this.getTotalPayableAmount();
    }
  }

  resetAllPledgeAmount() {
    this.data.forEach((element) => {
      element.pledgeDefaultDisplayAmount = 0;
    });

    this.getTotalPayableAmount();
  }

  getTotalPayableAmount() {
    let total: number = 0;
    for (let data of this.data) {
      total += Number(data.pledgeDefaultDisplayAmount.toFixed(2));
    }
    this.totalPayableAmount = this.commonMethodService.formatAmount(total);

    return total;
  }

  getUpdatedTotalPayableAmount(
    pledgePayment: PledgePaymentModel,
    value: string
  ) {
    let { pledgeNum, pledgeId, orgRemainingAmount } = pledgePayment;
    let total: number = 0;
    // added new
    let formattedAmount = +value
      .replace(this.getCurrencySymbol(), "")
      .replace(/,/g, "");
    if (+orgRemainingAmount < formattedAmount)
      pledgePayment["pledgeDefaultDisplayAmount"] = 0;
    else pledgePayment["pledgeDefaultDisplayAmount"] = formattedAmount;

    for (let data of this.data) {
      if (
        Number(data.orgRemainingAmount) >=
        Number(data.pledgeDefaultDisplayAmount)
      ) {
        total += Number(data.pledgeDefaultDisplayAmount);
        if (data.pledgeNum == pledgeNum) {
          data.pledgeRemainingAmount =
            Number(data.orgRemainingAmount) -
            Number(data.pledgeDefaultDisplayAmount);
          // if amount is greater then 0 then select record
          if (Number(data.pledgeDefaultDisplayAmount) != 0) {
            if (!this.recordSelectedArray.includes(pledgeId)) {
              this.recordSelectedArray.push(pledgeId);
            }
          }
        }
      } else {
        data.pledgeDefaultDisplayAmount = 0;
      }
    }
    // end new
    this.totalPayableAmount = this.commonMethodService.formatAmount(total);

    return total;
  }
}
