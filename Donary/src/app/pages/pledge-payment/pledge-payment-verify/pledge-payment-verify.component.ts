import { Component, Input, OnInit } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { CommonMethodService } from "../../../commons/common-methods.service";
import { LocalstoragedataService } from "../../../commons/local-storage-data.service";
import { NotificationService } from "../../../commons/notification.service";
import { PageRouteVariable } from "../../../commons/page-route-variable";
import { PledgePaymentLoginModel } from "../../../models/pledge-payment-login-model";
import { PledgePaymentService } from "../../../services/pledge-payment.service";
@Component({
  selector: "app-pledge-payment-verify",
  templateUrl: "./pledge-payment-verify.component.html",
  styleUrls: ["./pledge-payment-verify.component.scss"],
  standalone: false,
})
export class PledgePaymentVerifyComponent implements OnInit {
  @Input() accountId: string;
  @Input() phoneNumber: string;
  public user: PledgePaymentLoginModel = new PledgePaymentLoginModel();
  errorMessage: string;
  isloading: boolean;
  pledgePay_url: string = "/" + PageRouteVariable.DonorPledgePaymentPay_url;

  accountlblclass: string;

  phonenolblclass: string;

  constructor(
    public activeModal: NgbActiveModal,
    public donorPledgePaymentService: PledgePaymentService,
    public localstoragedataService: LocalstoragedataService,
    private notificationService: NotificationService,
    public commonMethodService: CommonMethodService
  ) {}

  ngOnInit() {
    document.getElementById("input-accountId").focus();
    if (this.accountId) {
      this.user.accountId = Number(this.accountId);
    }
    if (this.phoneNumber) {
      this.user.phonenumber = this.phoneNumber;
    }
  }

  verify() {
    // show loader
    this.isloading = true;
    this.donorPledgePaymentService.donorPledgePaymentLogin(this.user).subscribe(
      (res: any) => {
        // hide loader
        this.isloading = false;
        if (res) {
          this.localstoragedataService.setLoginUserPayDataandToken(res, "1");
          this.localstoragedataService.changeMessage(true);
          this.closePopup();
          //this.ref.close({ "success": true });
        }
      },
      (error) => {
        this.isloading = false;
        console.log(error);
        this.notificationService.showError(error.error, "Error!");
      }
    );
  }

  closePopup() {
    this.activeModal.dismiss({ success: true });
  }

  focusAccountLabel() {
    this.user && this.user.accountId
      ? ""
      : (this.accountlblclass = "field-active");
  }
  focusPhoneLabel() {
    this.user && this.user.phonenumber
      ? ""
      : (this.phonenolblclass = "field-active");
  }

  blurAccountLabel() {
    if (this.user && this.user.accountId) {
    } else {
      this.accountlblclass = "";
    }
  }
  blurPhoneLabel() {
    if (this.user && this.user.phonenumber) {
    } else {
      this.phonenolblclass = "";
    }
  }
}
