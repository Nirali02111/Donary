import { Component, OnInit } from "@angular/core";
import { NgForm } from "@angular/forms";
import Swal from "sweetalert2";
import { AuthService } from "src/app/services/auth.service";
import { Router, ActivatedRoute } from "@angular/router";
import { CommonMethodService } from "src/app/commons/common-methods.service";
@Component({
  selector: "app-reset-password",
  templateUrl: "./reset-password.component.html",
  styleUrls: ["./reset-password.component.scss"],
  standalone: false,
})
export class ResetPasswordComponent implements OnInit {
  isloading: boolean = false;
  txtPassword: string;
  txtConfirmPassWord: string;
  userId: string;
  isConfirmPage: boolean = false;
  passwordType: string = "password";
  passwordTypeConf: string = "password";
  setClass: string = "";
  setClass1: string = "";
  checkPassMessage: string = null;
  constructor(
    public AuthService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public commonMethodService: CommonMethodService
  ) {
    //Router subscriber
    this.activatedRoute.url.subscribe((params) => {
      this.userId = params[1].path;
    });
  }

  ngOnInit() {}

  onResetPassword(form: NgForm) {
    if (form.invalid) {
      return;
    }
    if (this.txtPassword === this.txtConfirmPassWord) {
      this.isloading = true;
      var obj = {
        userId: this.userId,
        newPassword: this.txtPassword,
      };
      this.AuthService.resetPassword(obj).subscribe(
        (res: any) => {
          this.isloading = false;
          if (res) {
            this.router.navigate(["/auth/passwordconformation"]);
          }
        },
        (error) => {
          this.isloading = false;
          console.log(error);
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
      this.checkPassMessage = "Password Not Match";
    }
  }
  ShowPassword(data) {
    if (this.passwordType == "password") {
      this.passwordType = "text";
      this.setClass = "close-eye-icon";
    } else {
      this.passwordType = "password";
      this.setClass = "";
    }
  }
  ShowPassword1(data) {
    if (this.passwordTypeConf == "password") {
      this.passwordTypeConf = "text";
      this.setClass1 = "close-eye-icon";
    } else {
      this.passwordTypeConf = "password";
      this.setClass1 = "";
    }
  }
  checkPassMatch() {
    if (this.txtPassword === this.txtConfirmPassWord) {
      this.checkPassMessage = null;
    } else {
      this.checkPassMessage = "Password Not Match";
    }
  }
}
