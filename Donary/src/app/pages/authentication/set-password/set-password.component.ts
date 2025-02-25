import { AuthService } from "./../../../services/auth.service";
import { Component, OnInit } from "@angular/core";
import {
  AbstractControl,
  UntypedFormBuilder,
  UntypedFormGroup,
  ValidatorFn,
  Validators,
} from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { Observable } from "rxjs";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { NotificationService } from "src/app/commons/notification.service";
import { PageRouteVariable } from "src/app/commons/page-route-variable";
import {
  GoogleAuthService,
  SocialUser,
} from "src/app/services/helpers/google-auth.service";
import { UserService } from "src/app/services/user.service";

const MisMatch = (otherInputControl: AbstractControl | null): ValidatorFn => {
  return (inputControl: AbstractControl): { [key: string]: boolean } | null => {
    if (
      inputControl.value !== undefined &&
      inputControl.value.trim() !== "" &&
      inputControl.value !== otherInputControl.value
    ) {
      return { mismatch: true };
    }

    return null;
  };
};

declare var $: any;
@Component({
  selector: "app-set-password",
  templateUrl: "./set-password.component.html",
  standalone: false,
  styleUrls: ["./set-password.component.scss"],
})
export class SetPasswordComponent implements OnInit {
  passwordType: string = "password";
  confirmPasswordType: string = "password";
  setClass: string = "";
  setConfirmClass: string = "";
  showPassword: boolean = true;
  inviteId: string;
  isloading: boolean = false;
  isInvited: boolean = true;
  isSuccess: boolean = false;
  fullName: string;
  firstName: string;
  lastName: string;
  userName: string;
  eventName: string;
  email: string;
  organizationName: string;
  checkPassMessage: string;
  isSubmitted = false;
  socialUser$!: Observable<SocialUser | null>;
  setPasswordForm!: UntypedFormGroup;
  passwordFieldFocusOut = false;
  confirmPasswordFieldFocusOut = false;
  params: any;
  isVisited: boolean = false;
  returnUrl: string;
  dashboardPermission: any;
  dashboard_url: string = "/" + PageRouteVariable.Dashboard_url;
  transaction_url: string;
  isGoogleLoginRegisterd: boolean;
  googleEmail: any;
  forceGoogleLogin: boolean = false;

  get Password() {
    return this.setPasswordForm.get("password");
  }

  get ConfirmPassword() {
    return this.setPasswordForm.get("confirmPassword");
  }
  password: string;
  confirmPassword: string;
  constructor(
    private route: ActivatedRoute,
    public userService: UserService,
    private fb: UntypedFormBuilder,
    public authService: AuthService,
    private socialAuth: GoogleAuthService,
    private AuthService: AuthService,
    private localstoragedataService: LocalstoragedataService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const keys = Object.keys(params);
      if (keys.length > 0) {
        const key = keys[0];
        this.inviteId = key;
      }
    });
    this.setPasswordForm = this.fb.group({
      password: this.fb.control(
        "",
        Validators.compose([Validators.required, Validators.minLength(6)])
      ),
      confirmPassword: this.fb.control(
        "",
        Validators.compose([Validators.required])
      ),
    });
    this.ConfirmPassword.setValidators(
      Validators.compose([
        Validators.required,
        Validators.minLength(6),
        MisMatch(this.Password),
      ])
    );
    this.ConfirmPassword.updateValueAndValidity();

    this.Password.valueChanges.subscribe((val) => {
      if (val) {
        const conf = this.ConfirmPassword.value;
        if (conf !== undefined && conf.trim() !== "" && conf !== val) {
          this.ConfirmPassword.setErrors({ mismatch: true });
        }
        this.ConfirmPassword.updateValueAndValidity();
      }
    });

    this.socialUser$ = this.socialAuth.socialUserLogin$;

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

      if (this.forceGoogleLogin) {
        obj["inviteId"] = this.inviteId;
      }

      this.userService.saveGoogleToken(obj).subscribe(
        (resResult: any) => {
          if (resResult === "Email Token saved successfully") {
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
                        this.localstoragedataService.setPermissionLst(
                          res.lstUserPermissionModel
                        );
                        location.href = this.dashboard_url;
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

    const body = document.getElementsByTagName("body")[0];
    body.classList.add("login_footer");

    this.route.paramMap.subscribe((params) => {
      // this.inviteId= params.get('inviteId');
      this.isloading = true;
      this.userService.getInvite(this.inviteId).subscribe(
        (res: any) => {
          if (res) {
            this.isVisited = true;
            this.isloading = false;
            this.isInvited = true;
            this.fullName = res.firstName + " " + res.lastName;
            this.userName = res.userName;
            this.organizationName = res.organizationName;
            this.email = res.email;
            this.firstName = res.firstName;
            this.lastName = res.lastName;
            if (
              res.forceGoogleLogin == "true" ||
              res.forceGoogleLogin == "True"
            ) {
              this.forceGoogleLogin = true;
            }
          }
        },
        (error) => {
          this.isVisited = true;
          this.isloading = false;
          this.isInvited = false;
        }
      );
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.socialAuth.load().then(() => {
        this.socialAuth.renderGoogleButton();
      });
    }, 1500);
  }

  focused() {
    this.Password.markAsTouched();
  }

  confirmedFocused() {
    this.ConfirmPassword.markAsTouched();
  }

  ShowPassword() {
    if (this.passwordType == "password") {
      this.passwordType = "text";
      this.setClass = "close-eye-icon";
      return;
    }
    this.passwordType = "password";
    this.setClass = "";
  }

  ShowConfirmPassword() {
    if (this.confirmPasswordType == "password") {
      this.confirmPasswordType = "text";
      this.setConfirmClass = "close-eye-icon";
      return;
    }
    this.confirmPasswordType = "password";
    this.setConfirmClass = "";
  }

  onSetPassword() {
    if (this.setPasswordForm.invalid) {
      return;
    }
    if (this.Password.value === this.ConfirmPassword.value) {
      this.isloading = true;
      var obj = {
        inviteId: this.inviteId,
        password: this.Password.value,
      };
      this.authService.setPassword(obj).subscribe(
        (res: any) => {
          this.isloading = false;
          if (res) {
            this.isSuccess = true;
          }
        },
        (err) => {}
      );
    }
  }
}
