import { Component, inject, Inject, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { LocalstoragedataService } from "../../../../commons/local-storage-data.service";
import { NotificationService } from "../../../../commons/notification.service";
import { PageRouteVariable } from "../../../../commons/page-route-variable";
import { LoginModel } from "./../../../../models/login-model";
import { AuthService } from "../../../../services/auth.service";
import packageInfo from "../../../../../../package.json";
import { GoogleLoginModel } from "src/app/models/google-login-model";
import { UserService } from "src/app/services/user.service";
import { NgbModalOptions } from "@ng-bootstrap/ng-bootstrap";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import Swal from "sweetalert2";
import { NgForm } from "@angular/forms";
import { Observable } from "rxjs";
import {
  GoogleAuthService,
  SocialUser,
} from "src/app/services/helpers/google-auth.service";
import { PlanService } from "src/app/services/plan.service";
import { BroadcastChannelService } from "src/app/services/broadcast-channel.service";
import { ReCaptchaV3Service } from "ng-recaptcha";
import { AnalyticsService } from "src/app/services/analytics.service";
declare var $: any;
@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
  standalone: false,
})
export class LoginComponent implements OnInit {
  public user: LoginModel = new LoginModel();
  public userGoogle: GoogleLoginModel = new GoogleLoginModel();
  returnUrl: string;
  public version: string = packageInfo.version;
  recaptchaToken: string = "";
  transaction_url: string = "/" + PageRouteVariable.TransactionPage_url;
  dashboard_url: string = "/" + PageRouteVariable.Dashboard_url;
  isloading: boolean = false;
  showPassword: boolean = true;
  setClass: string = "";
  passwordType: string = "password";
  isGoogleLoginRegisterd = false;
  googleEmail: string;
  modalOptions: NgbModalOptions;
  txtForgotEmail: string;
  isloadingForgot: boolean = false;
  emailPattern =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/; //"^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$";
  isCheckEmailPage: boolean = false;

  auth2: any;
  dashboardPermission: boolean;
  socialUser$!: Observable<SocialUser | null>;
  planTypeName: string = "Core";
  planTypeName2: string = "Rental";
  analytics = inject(AnalyticsService);

  constructor(
    public AuthService: AuthService,
    private localstoragedataService: LocalstoragedataService,
    private route: ActivatedRoute,
    private notificationService: NotificationService,
    public userService: UserService,
    public commonMethodService: CommonMethodService,
    private socialAuth: GoogleAuthService,
    private planService: PlanService,
    private broadcastService: BroadcastChannelService,
    private recaptchaV3Service: ReCaptchaV3Service
  ) {}

  ngOnInit() {
    this.analytics.visitedUserPasswordLogin();
    const body = document.getElementsByTagName("body")[0];
    body.classList.add("login_footer");
    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams["returnUrl"] || "/";

    this.socialUser$ = this.socialAuth.socialUser$;

    this.socialUser$.subscribe((res) => {
      if (!res) {
        return;
      }
      $(".loginwith-google-newl").hide();
      $(".fetching-mail-id").show();

      const obj = {
        email: res.email,
        token: res.jti,
      };

      this.userService.saveGoogleToken(obj).subscribe(
        (resResult: any) => {
          if (resResult === "Email Token saved successfully") {
            this.recaptchaV3Service.execute("login").subscribe((token) => {
              this.user.recapcha = token;
              const obj = {
                email: res.email,
                token: res.jti,
                recaptcha: this.user.recapcha,
              };

              this.AuthService.googleLogin(obj).subscribe(
                (res: any) => {
                  $(".fetching-mail-id").hide();

                  $(".loginwith-google-newl").show();
                  if (res) {
                    this.localstoragedataService.setCurrentMenuState(null);
                    this.localstoragedataService.setLoginUserDataandToken(
                      res,
                      "0"
                    );
                    this.userService
                      .getUser(
                        this.localstoragedataService.getLoginUserId(),
                        this.localstoragedataService.getLoginUserEventGuId()
                      )
                      .subscribe((res: any) => {
                        if (res) {
                          this.broadcastService.sendMessage(res);
                          this.localstoragedataService.setPermissionLst(
                            res.lstUserPermissionModel
                          );
                          if (this.returnUrl != "/") {
                            location.href = this.returnUrl;
                          } else {
                            if (res.isRedirectToCheckOut == true) {
                              location.href = "/productandplans";
                            } else if (res.directTo == "CheckOut") {
                              location.href = "/checkout";
                            } else if (res.directTo == "AddOrgInfo") {
                              location.href = "/productandplans/register";
                            } else {
                              if (this.dashboardPermission) {
                                location.href = this.dashboard_url;
                              } else {
                                location.href = this.transaction_url;
                              }
                            }
                          }
                        }
                      });
                  }
                },
                (error) => {
                  alert(error.error);
                  this.isloading = false;
                  this.notificationService.showError(error.error, "Error !");
                }
              );
              this.analytics.visitedGoogleLogin();
            });
          }
        },
        (error) => {
          this.isloading = false;
          this.isGoogleLoginRegisterd = true;
          $("#Div_gError").show();
          $("#googleEmailId").text(this.googleEmail);
          $(".fetching-mail-id").hide();
          $(".loginwith-google-newl").show();
        }
      );
    });
  }

  ngAfterViewInit() {
    this.socialAuth.load().then(() => {
      this.socialAuth.renderGoogleButton();
    });
  }

  login() {
    this.recaptchaV3Service.execute("login").subscribe((token) => {
      this.user.recapcha = token;
      // show loader
      this.isloading = true;
      this.AuthService.login(this.user).subscribe(
        (res: any) => {
          // hide loader
          this.isloading = false;
          if (res) {
            this.broadcastService.sendMessage(res);
            this.localstoragedataService.setCurrentMenuState(null);
            this.localstoragedataService.setLoginUserDataandToken(res, "0");
            if (
              this.planTypeName === res.eventPlan ||
              this.planTypeName2 === res.eventPlan
            ) {
              const eventGuid =
                this.localstoragedataService.getLoginUserEventGuId();
              const macAddress =
                this.localstoragedataService.getLoginUserGuid();
              this.planService
                .getFeatureSettings({ eventGuid, macAddress })
                .subscribe(
                  (res: any) => {
                    if (res) {
                      this.commonMethodService.setting = res;
                    }
                  },
                  (err) => {
                    console.log("error", err);
                  }
                );
            }
            this.userService
              .getUser(
                this.localstoragedataService.getLoginUserId(),
                this.localstoragedataService.getLoginUserEventGuId()
              )
              .subscribe((res: any) => {
                if (res) {
                  this.localstoragedataService.setPermissionLst(
                    res.lstUserPermissionModel
                  );
                  this.dashboardPermission = this.localstoragedataService
                    .getPermissionLst()
                    .filter((x) => x.permissionName == "Dashboard")
                    .map((x) => x.isActive)[0];
                  if (this.returnUrl != "/") {
                    location.href = this.returnUrl;
                    //this.router.navigate([this.returnUrl]);
                  } else {
                    if (res.isRedirectToCheckOut == true) {
                      location.href = "/productandplans";
                    } else if (res.directTo == "CheckOut") {
                      location.href = "/checkout";
                    } else if (res.directTo == "AddOrgInfo") {
                      location.href = "/productandplans/register";
                    } else {
                      if (this.dashboardPermission) {
                        location.href = this.dashboard_url;
                      } else {
                        location.href = this.transaction_url;
                      }
                      //this.router.navigate([this.dashboard_url]);
                    }
                  }
                }
              });
          }
        },
        (error) => {
          this.isloading = false;
          this.notificationService.showError(error.error, "Error !");
        }
      );
    });
  }

  ShowPassword() {
    if (this.passwordType == "password") {
      this.passwordType = "text";
      this.setClass = "close-eye-icon";
    } else {
      this.passwordType = "password";
      this.setClass = "";
    }
  }
  /////////////// google login end

  // forgot password
  onforgotpassword() {
    $("#Forgot_div").show();
    $("#login_div").hide();
  }
  onloginDiv() {
    $("#Forgot_div").hide();
    $("#login_div").show();
    this.txtForgotEmail = null;
  }

  getSendForgotPasswordEmail(form: NgForm) {
    if (form.invalid) {
      return;
    }
    if (this.txtForgotEmail) {
      this.isloadingForgot = true;
      this.AuthService.sendForgotPasswordEmail(this.txtForgotEmail).subscribe(
        (res: any) => {
          this.isloadingForgot = false;
          this.isCheckEmailPage = true;
          if (res) {
            this.isCheckEmailPage = true;
            $(".email-confirmation").show();
            $("#Forgot_div").hide();
            this.txtForgotEmail = null;
          }
        },
        (error) => {
          this.isloadingForgot = false;
          console.log(error);
          //this.notificationService.showError(error.error, "Error !");
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
    } else {
    }
  }
  anotherEmail() {
    this.isCheckEmailPage = false;
    $("#Forgot_div").show();
    $("#Forgot_div").css("display", "block");
    $("#login_div").hide();
    $(".email-confirmation").hide();
  }
  openEmail() {
    window.location.href = "https://mail.google.com/mail/u/0/#inbox";
  }
}
