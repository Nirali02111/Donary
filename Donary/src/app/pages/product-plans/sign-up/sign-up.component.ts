import { Component, inject, OnInit } from "@angular/core";
import {
  AbstractControl,
  UntypedFormBuilder,
  UntypedFormGroup,
  ValidatorFn,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { PageRouteVariable } from "src/app/commons/page-route-variable";
import { UserService } from "src/app/services/user.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import Swal from "sweetalert2";
import { AuthService } from "src/app/services/auth.service";
import { AnalyticsService } from "src/app/services/analytics.service";
import { CommonMethodService } from "src/app/commons/common-methods.service";

const MisMatch = (otherInputControl: AbstractControl): ValidatorFn => {
  return (inputControl: AbstractControl): { [key: string]: boolean } | null => {
    if (
      inputControl.value !== undefined &&
      inputControl.value.trim() != "" &&
      inputControl.value !== otherInputControl.value
    ) {
      return { mismatch: true };
    }

    return null;
  };
};

@Component({
  selector: "app-sign-up",
  templateUrl: "./sign-up.component.html",
  styleUrls: ["./sign-up.component.scss"],
  standalone: false,
})
export class SignUpComponent implements OnInit {
  isSignUp = false;
  signUpForm: UntypedFormGroup;
  showPassword: boolean = true;
  passwordType: string = "password";
  isloading: boolean = false;
  isFormubmited: boolean = false;
  isAnimate: boolean = false;
  private analytics = inject(AnalyticsService);

  constructor(
    private router: Router,
    private activeRoute: ActivatedRoute,
    private fb: UntypedFormBuilder,
    private userService: UserService,
    private localstoragedataService: LocalstoragedataService,
    public authAPIService: AuthService,
    public commonMethodService: CommonMethodService
  ) {}

  public get organization(): AbstractControl {
    return this.signUpForm.get("OrgName");
  }

  public get firstname(): AbstractControl {
    return this.signUpForm.get("Firstname");
  }

  public get lastname(): AbstractControl {
    return this.signUpForm.get("Lastname");
  }

  public get email(): AbstractControl {
    return this.signUpForm.get("email");
  }

  public get password(): AbstractControl {
    return this.signUpForm.get("password");
  }

  public get confirmPassword(): AbstractControl {
    return this.signUpForm.get("confirmPassword");
  }

  ngOnInit() {
    this.signUpForm = this.fb.group({
      OrgName: this.fb.control("", Validators.compose([Validators.required])),

      Firstname: this.fb.control("", Validators.compose([Validators.required])),
      Lastname: this.fb.control("", Validators.compose([Validators.required])),
      email: this.fb.control(
        "",
        Validators.compose([Validators.required, Validators.email])
      ),
      password: this.fb.control("", Validators.compose([Validators.required])),
      confirmPassword: this.fb.control(
        "",
        Validators.compose([Validators.required])
      ),
      EventGuid: this.fb.control(""),
    });

    this.confirmPassword.setValidators(
      Validators.compose([
        Validators.required,
        MisMatch(this.signUpForm.get("password")),
      ])
    );

    this.confirmPassword.updateValueAndValidity();

    /*const eventId = this.localstoragedataService.getLoginUserEventGuId();
    if (eventId) {
      this.signUpForm.patchValue({
        EventGuid: eventId
      })

      this.signUpForm.updateValueAndValidity()
    }*/
  }

  onSignUp() {
    this.isFormubmited = true;
    if (this.signUpForm.invalid) {
      this.isAnimate = true;
      setTimeout(() => {
        this.isAnimate = false;
      }, 2000);
      return;
    }

    this.isloading = true;
    this.userService.saveUser({ ...this.signUpForm.value }).subscribe(
      (res: any) => {
        this.isloading = false;
        if (res) {
          this.analytics.editedUser();

          this.isSignUp = true;
          //store local OrganizationId
          var setOrganizationId = res.orgId;
          this.localstoragedataService.setOrganizationId(setOrganizationId);
          // this.goToCheckout();
        } else {
          console.log("onSignUp res error");
        }
      },
      (err) => {
        this.isloading = false;
        console.log(err);
        Swal.fire({
          title: this.commonMethodService.getTranslate(
            "WARNING_SWAL.SOMETHING_WENT_WRONG"
          ),
          text: err.error,
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
  }

  onRegisterClick() {
    this.router.navigate([PageRouteVariable.DonorProductPlans_url, "register"]);
  }

  onContinueShopping() {
    // this.router.navigate([PageRouteVariable.ProductCheckout_url]);
    this.goToCheckout();
  }

  goToCheckout() {
    this.isloading = true;
    this.authAPIService
      .login({ email: this.email.value, password: this.password.value })
      .subscribe(
        (res) => {
          this.isloading = false;
          this.localstoragedataService.setCurrentMenuState(null);
          this.localstoragedataService.setLoginUserDataandToken(res, "0");
          this.router.navigate([PageRouteVariable.ProductCheckout_url], {
            queryParams: {
              isInit: true,
            },
          });
        },
        (err) => {
          this.isloading = false;
          this.router.navigate(["/"], {
            queryParams: { returnUrl: PageRouteVariable.ProductCheckout_url },
          });
        }
      );
  }

  ShowPassword(data) {
    this.showPassword = data;
    if (!data) {
      this.passwordType = "text";
    } else {
      this.passwordType = "password";
    }
  }
}
