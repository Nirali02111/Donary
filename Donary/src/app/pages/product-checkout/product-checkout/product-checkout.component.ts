import { Component, OnInit } from "@angular/core";
import {
  AbstractControl,
  UntypedFormBuilder,
  UntypedFormGroup,
  ValidatorFn,
  Validators,
} from "@angular/forms";
import * as _ from "lodash";
import { Guid } from "guid-typescript";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { CommonAPIMethodService } from "src/app/services/common-api-method.service";
import {
  CartItem,
  CartManagementService,
} from "src/app/services/helpers/cart-management.service";
import { CreditCardService } from "src/app/services/helpers/credit-card.service";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { OrderService } from "src/app/services/order.service";
import { OrganizationService } from "src/app/services/organization.service";
import { NotificationService } from "src/app/commons/notification.service";
import { Router } from "@angular/router";
import { PageRouteVariable } from "src/app/commons/page-route-variable";
import Swal from "sweetalert2";
import { PromocodeService } from "src/app/services/promocode.service";

declare var $: any;

interface stateObj {
  abbreviations: string;
  name: string;
}
@Component({
  selector: "app-product-checkout",
  templateUrl: "./product-checkout.component.html",
  styleUrls: ["./product-checkout.component.scss"],
  standalone: false,
})
export class ProductCheckoutComponent implements OnInit {
  isloading: boolean = false;
  isFormSubmited: boolean = false;

  isCheckoutLoading: boolean = false;

  checkoutForm: UntypedFormGroup;
  shippingAddressInEdit: boolean = false;
  stateList: Array<stateObj> = [];

  cardMask: string;
  CVVMASK: string = "000";

  cartList: Array<CartItem> = [];

  monthlyTotalAmount: number = 0;
  yearlyTotalAmount: number = 0;
  deviceTotalAmount: number = 0;
  taxTotalAmount: number = 0;
  subTotalAmount: number = 0;
  phone: string = "";
  email: string = "";
  fileOutTaxExemptForm: string;
  fileOutTaxExemptForm_Name: string;
  shippingAmount: number = 20;
  monthlyNextCharge: any = "";
  yearlyNextCharge: any = "";
  passContactId;
  IsSelfPickup: boolean = false;
  promoCode: any;
  encryptedPromoCodeId: string;
  get CCDetails() {
    return this.checkoutForm.get("CCDetails");
  }

  get sameCheckbox() {
    return this.checkoutForm.get("IsBillingSameAsShippingAddress");
  }

  get ShippingAddress() {
    return this.checkoutForm.get("ShippingAddress");
  }

  get IsBillingSameAsShippingAddress() {
    return this.CCDetails.get("IsBillingSameAsShippingAddress");
  }

  get BillingAddress() {
    return this.CCDetails.get("BillingAddress");
  }

  get CCNum() {
    return this.CCDetails.get("CCNum");
  }

  get Expiry() {
    return this.CCDetails.get("Expiry");
  }

  get CVV() {
    return this.CCDetails.get("CVV");
  }

  constructor(
    private fb: UntypedFormBuilder,
    private router: Router,
    public commonMethodService: CommonMethodService,
    private commonAPI: CommonAPIMethodService,
    private localstorageService: LocalstoragedataService,
    private creditCardService: CreditCardService,
    private cartService: CartManagementService,
    private orderService: OrderService,
    private organizationService: OrganizationService,
    private notificationService: NotificationService,
    private promocodeService: PromocodeService
  ) {}

  ngOnInit() {
    this.initForm();
    this.isloading = true;
    let eventGuid = this.localstorageService.getLoginUserEventGuId();
    this.commonAPI.getStates(eventGuid).subscribe(
      (res: Array<stateObj>) => {
        this.isloading = false;
        if (res) {
          this.stateList = res;
        }
      },
      (err) => {
        this.isloading = false;
      }
    );

    let orgId = this.localstorageService.getLoginUserOrganisationId();
    this.organizationService.getOrganizationContact(orgId).subscribe((res) => {
      if (res) {
        let firstname = "";
        let lastname = "";
        this.passContactId = res.contactId; //added new
        if (res.contactName) {
          const names = res.contactName.split(" ");
          if (names && names.length > 1) {
            const lastString = names.slice(1);
            firstname = names[0];
            lastname = lastString.join(" ");
          } else {
            firstname = res.contactName;
            // lastname = res.contactName;
          }
        }
        this.phone = res.contactPhone;
        this.email = res.contactEmail;

        /* last original
        this.checkoutForm.patchValue({
          ShippingAddress: {
            ContactId: res.contactId,
            FirstName: firstname,
            LastName: lastname,
            Address: res.streetName,
            City: res.city,
            State: res.state,
            Zip: res.zip,
          },
          CCDetails: {
            BillingAddress: {
              ContactId: res.contactId,
              FirstName: firstname,
              LastName: lastname,
            },
          },
        });
        */

        // when first time ordering and address is blank

        /*if (!res.streetName && !res.city && !res.state && !res.zip) {
          this.checkoutForm.patchValue({
            CCDetails: {
              BillingAddress: {
                ContactId: res.contactId,
                FirstName: firstname,
                LastName: lastname,
              },
              IsBillingSameAsShippingAddress: true
            },
          });

          this.IsBillingSameAsShippingAddress.disable()

          this.onEditShipping()
        } else {
          this.checkoutForm.patchValue({
            ShippingAddress: {
              ContactId: res.contactId,
              FirstName: firstname,
              LastName: lastname,
              Address: res.streetName,
              City: res.city,
              State: res.state,
              Zip: res.zip,
            },
            CCDetails: {
              BillingAddress: {
                ContactId: res.contactId,
                FirstName: firstname,
                LastName: lastname,
              },
            },
          });
        }*/

        if (!res.streetName || !res.city || !res.state || !res.zip) {
          //added new logic
          if (res.streetName) {
            var sptSteetN = res.streetName.split(" ");
            this.checkoutForm.patchValue({
              ShippingAddress: {
                ContactId: res.contactId,
                FirstName: firstname,
                LastName: lastname,
                Address: sptSteetN[0] + " " + sptSteetN[1],
                City: sptSteetN[2],
                State: sptSteetN[3],
                Zip: sptSteetN[4],
              },
              CCDetails: {
                BillingAddress: {
                  ContactId: res.contactId,
                  FirstName: firstname,
                  LastName: lastname,
                },
              },
            });
          } else {
            this.checkoutForm.patchValue({
              CCDetails: {
                BillingAddress: {
                  ContactId: res.contactId,
                  FirstName: firstname,
                  LastName: lastname,
                },
                IsBillingSameAsShippingAddress: false,
              },

              ShippingAddress: {
                ContactId: res.contactId,
              },
            });

            this.onEditShipping();
          }
          //
          //old code commets
          // this.checkoutForm.patchValue({
          //   CCDetails: {
          //     BillingAddress: {
          //       ContactId: res.contactId,
          //       FirstName: firstname,
          //       LastName: lastname,
          //     },
          //     IsBillingSameAsShippingAddress: false
          //   },
          // });

          // this.onEditShipping()
          //end old code commets
        } else {
          this.checkoutForm.patchValue({
            ShippingAddress: {
              ContactId: res.contactId,
              FirstName: firstname,
              LastName: lastname,
              Address: res.streetName,
              City: res.city,
              State: res.state,
              Zip: res.zip,
            },
            CCDetails: {
              BillingAddress: {
                ContactId: res.contactId,
                FirstName: firstname,
                LastName: lastname,
              },
            },
          });
        }

        this.checkoutForm.updateValueAndValidity();
      }
    });

    this.cartList = this.cartService.getCartList();
    this.getMonthlyTotal();
    this.getAnnualTotal();

    this.getDeviceTotal(); ///added
    //this.getTaxAmount(); for issue
    this.getSelfPickup(); //added new
    this.getSubTotal();
    this.fileOutTaxExemptForm =
      this.commonMethodService.getFileOutTaxExemptForm();
    this.fileOutTaxExemptForm_Name = localStorage.getItem(
      "fileOutTaxExemptForm_Name"
    );
    this.changeDate();
    this.encryptedPromoCodeId = localStorage.getItem("encryptedPromoCodeId");
    this.promoCode = localStorage.getItem("promoCode");
    $("#txtpromoCode").val(localStorage.getItem("promoCode"));
    this.description = localStorage.getItem("description");
  }

  luhanCheck(): ValidatorFn {
    return (
      inputControl: AbstractControl
    ): { [key: string]: boolean } | null => {
      if (
        inputControl.value !== undefined &&
        inputControl.value.trim() != "" &&
        !this.creditCardService.luhnCheck(inputControl.value)
      ) {
        return { inValidCard: true };
      }

      return null;
    };
  }

  initForm() {
    this.checkoutForm = this.fb.group({
      CCDetails: this.fb.group({
        CCNum: this.fb.control(
          "",
          Validators.compose([Validators.required, this.luhanCheck()])
        ),
        Expiry: this.fb.control("", Validators.compose([Validators.required])),
        CVV: this.fb.control("", Validators.compose([Validators.required])),
        BillingAddress: this.newAddressGroup(
          this.localstorageService.getLoginUserFirstname(),
          this.localstorageService.getLoginUserLastname()
        ),
        IsBillingSameAsShippingAddress: this.fb.control(false),
      }),
      ShippingAddress: this.newAddressGroup(
        this.localstorageService.getLoginUserFirstname(),
        this.localstorageService.getLoginUserLastname()
      ),
    });

    this.onBillingSameAsShippingEvent();
    this.cardMask = this.creditCardService.getDefaultMask();
    this.onCheckCVV();
  }

  newAddressGroup(firstname: string = "", lastname: string = "") {
    return this.fb.group({
      ContactId: this.fb.control(""),
      FirstName: this.fb.control(firstname, Validators.compose([])),
      LastName: this.fb.control(lastname, Validators.compose([])),
      Address: this.fb.control("", Validators.compose([Validators.required])),
      City: this.fb.control("", Validators.compose([Validators.required])),
      State: this.fb.control("", Validators.compose([Validators.required])),
      Zip: this.fb.control("", Validators.compose([Validators.required])),
    });
  }

  onBillingSameAsShippingEvent() {
    this.IsBillingSameAsShippingAddress.valueChanges.subscribe((val) => {
      if (val) {
        this.BillingAddress.disable();
        this.BillingAddress.setValue({
          ...this.ShippingAddress.value,
        });
      } else {
        this.BillingAddress.enable();
      }

      this.checkoutForm.updateValueAndValidity();
    });
  }

  onCheckCVV() {
    this.CCNum.valueChanges.subscribe((val) => {
      if (val) {
        var twodigit = val.substring(0, 2);
        if (twodigit == "34" || twodigit == "37") {
          this.cardMask = this.creditCardService.getAmexMask();
          this.CVVMASK = "0000";
        } else {
          this.cardMask = this.creditCardService.getDefaultMask();
          this.CVVMASK = "000";
        }
        this.CVV.updateValueAndValidity();
      }
    });
  }

  onEditShipping() {
    this.shippingAddressInEdit = true;
  }

  getMonthlyTotal() {
    this.monthlyTotalAmount = _.reduce(
      this.cartList,
      (sumOf: number, element: CartItem) => {
        let sum = _.reduce(
          element.selectedPlan,
          (sumOfPlans: number, elementPlan: any) => {
            if (elementPlan.recurringType === "Monthly") {
              let planSum = elementPlan.PlanCount * elementPlan.price;
              sumOfPlans = sumOfPlans + planSum;
            }

            return sumOfPlans;
          },
          0
        );

        sumOf = sumOf + sum;
        return sumOf;
      },
      0
    );

    return this.monthlyTotalAmount;
  }

  getAnnualTotal() {
    this.yearlyTotalAmount = _.reduce(
      this.cartList,
      (sumOf: number, element: CartItem) => {
        if (element.saleType === "Licence Fee") {
          let sum = element.productCount * element.price;
          sumOf = sumOf + sum;
        }
        return sumOf;
      },
      0
    );

    return this.yearlyTotalAmount;
  }

  getDeviceTotal() {
    this.deviceTotalAmount = _.reduce(
      this.cartList,
      (sumOf: number, element: CartItem) => {
        if (element.saleType === "Sale") {
          let sum = element.productCount * element.price;
          sumOf = sumOf + sum;
        }

        return sumOf;
      },
      0
    );

    return this.deviceTotalAmount;
  }

  getTaxAmount() {
    let totalAmount =
      this.monthlyTotalAmount + this.yearlyTotalAmount + this.deviceTotalAmount;

    this.taxTotalAmount = this.cartService.calculateTaxAmount(totalAmount);
    return this.taxTotalAmount;
  }

  getSubTotal() {
    /*
    this.subTotalAmount =
      this.monthlyTotalAmount +
      this.yearlyTotalAmount +
      this.deviceTotalAmount +
      this.taxTotalAmount+
      this.shippingAmount;

    this.subTotalAmount;
    this.IsSelfPickup?this.subTotalAmount=this.subTotalAmount-this.shippingAmount:this.subTotalAmount;//added new
    */

    const val =
      this.monthlyTotalAmount +
      this.yearlyTotalAmount +
      this.deviceTotalAmount +
      this.taxTotalAmount;

    if (!this.canDisplayPickup()) {
      if (this.IsSelfPickup) {
        this.subTotalAmount = val;
        return;
      }
      this.subTotalAmount = val + this.shippingAmount;
      return;
    }

    this.subTotalAmount = val;
  }

  checkoutanimation: string = "";
  onPlaceOrder() {
    // added new
    var isInValid = this.checkoutForm.invalid;
    if (
      this.IsSelfPickup &&
      this.checkoutForm.controls.CCDetails.status == "VALID"
    ) {
      isInValid = false;
    }
    //end new
    this.isFormSubmited = true;
    if (isInValid) {
      this.checkoutForm.markAllAsTouched();
      if (this.fileOutTaxExemptForm_Name == null) {
        this.checkoutanimation = "checkout-animation";
      } else {
        this.checkoutanimation = "";
      }
      return;
    }

    const products = this.cartList.map((o) => {
      return {
        ProductId: o.productId,
        ProductName: o.productName,
        Qty: o.productCount,
        UnitAmount: o.price,
        ProductPlans: o.selectedPlan.map((s) => {
          return {
            PlanId: s.planId,
            Users: s.PlanCount,
            PlanAmount: s.price,
          };
        }),
      };
    });
    let formdata = {
      EventGuId: this.localstorageService.getLoginUserEventGuId(),
      encryptedPromoCodeId: this.encryptedPromoCodeId,
      CCDetails: this.CCDetails.value,
      IsBillingSameAsShippingAddress: this.IsBillingSameAsShippingAddress.value,
      IsSelfPickup: this.IsSelfPickup,
      ShippingAddress: this.ShippingAddress.value,
      TotalAmount: this.subTotalAmount,
      CreatedBy: this.localstorageService.getLoginUserId(),
      Products: products,
      UniqueTransId: Guid.create().toString(),
      taxExemptDocBase64: (
        this.commonMethodService.getFileOutTaxExemptForm() || "base64,"
      ).split("base64,")[1], //this.fileOutTaxExemptForm,
    };
    formdata.ShippingAddress.ContactId = this.passContactId;
    if (this.IsBillingSameAsShippingAddress.value) {
      formdata = {
        ...formdata,
        CCDetails: {
          ...this.CCDetails.value,
          BillingAddress: this.ShippingAddress.value,
        },
      };
    }
    // remove expdate /
    var tempExp = formdata.CCDetails.Expiry;
    var tempResult = tempExp.replace(/\\|\//g, "");
    formdata.CCDetails.Expiry = tempResult;
    this.isCheckoutLoading = true;
    this.orderService.CheckoutOrder(formdata).subscribe(
      (res) => {
        this.isCheckoutLoading = false;
        if (res.paymentStatus == "Success") {
          const passData = {
            orderId: res.orderDBResponse.orderId,
            billingDetails: {
              clientName: `${formdata.CCDetails.BillingAddress.FirstName} ${formdata.CCDetails.BillingAddress.LastName}`,
              Address: formdata.CCDetails.BillingAddress.Address,
              city: formdata.CCDetails.BillingAddress.City,
              state: formdata.CCDetails.BillingAddress.State,
              zip: formdata.CCDetails.BillingAddress.Zip,
              firstName: formdata.CCDetails.BillingAddress.FirstName,
              phone: this.phone,
              email: this.email,
              cardending: formdata.CCDetails.CCNum.substr(
                formdata.CCDetails.CCNum.length - 4
              ),
              products: formdata["Products"],
            },
          };
          this.goToThankyouPage(passData);
        } else {
          Swal.fire({
            title: this.commonMethodService.getTranslate(
              "WARNING_SWAL.TRY_AGAIN"
            ),
            text: res.errorResponse,
            icon: "error",
            confirmButtonText: this.commonMethodService.getTranslate(
              "WARNING_SWAL.BUTTON.CONFIRM.OK"
            ),
            customClass: {
              confirmButton: "btn_ok",
            },
          });
        }
      },
      (err) => {
        this.isCheckoutLoading = false;
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

  goToThankyouPage(data) {
    this.router.navigate([PageRouteVariable.ProductCheckout_url, "confirm"], {
      queryParamsHandling: "merge",
      state: {
        ...data,
      },
    });
  }

  customSearchFn(term: string, item: { name: string; abbreviations: string }) {
    let terms = term.toLowerCase();
    return (
      item.name.toLowerCase().indexOf(terms) > -1 ||
      item.abbreviations.toLowerCase() === terms
    );
  }
  EnterExpiryDate(event) {
    const charCode = event.which ? event.which : event.keyCode;
    var expirydatelength = event.target.value.replace(/[_/]/g, "").length;
    if (event.target.value.length == 2) {
      if (charCode == 8) {
      } else {
        var k = event.target.value;
        var thisVal = k;
        thisVal += "/";
        event.target.value = thisVal;
      }
    }
  }

  onAddressChange(data: any, isBillingAddress) {
    let streetAddress = data.streetName;
    if (data.streetNumber && data.streetName) {
      streetAddress = `${data.streetNumber} ${data.streetName}`;
    }

    if (isBillingAddress) {
      this.checkoutForm.patchValue({
        CCDetails: {
          BillingAddress: {
            Address: streetAddress,
            City: data.locality.long || data.locality.short || data.sublocality,
            State: data.state.short,
            Zip: data.postalCode,
          },
        },
      });
    } else {
      this.checkoutForm.patchValue({
        ShippingAddress: {
          Address: streetAddress,
          City: data.locality.long || data.locality.short || data.sublocality,
          State: data.state.short,
          Zip: data.postalCode,
        },
      });
    }
  }
  incomingfileName(event) {
    const file = event.target.files[0];
    this.fileOutTaxExemptForm_Name = file.name.toString();
    this.checkoutanimation = "";
  }
  // set date
  rMonth: any;
  rDay: any;
  yMonth: any;
  yDay: any;
  changeDate() {
    //var _now= new Date().toLocaleDateString();
    //this.monthlyNextCharge=_now;
    if (this.monthlyTotalAmount > 0) {
      var now = new Date();
      var year = now.getFullYear();
      this.rMonth = now.getMonth() + 2;
      this.rDay = now.getDate();
      if (this.rMonth.toString().length == 1) {
        this.rMonth = "0" + this.rMonth;
      }
      if (this.rDay.toString().length == 1) {
        this.rDay = "0" + this.rDay;
      }
      this.monthlyNextCharge = this.rMonth + "/" + this.rDay + "/" + year;
    }
    if (this.yearlyTotalAmount > 0) {
      var now = new Date();
      var year = now.getFullYear() + 1;
      this.yMonth = now.getMonth() + 1;
      this.yDay = now.getDate();
      if (this.yMonth.toString().length == 1) {
        this.yMonth = "0" + this.yMonth;
      }
      if (this.yDay.toString().length == 1) {
        this.yDay = "0" + this.yDay;
      }
      this.yearlyNextCharge = this.yMonth + "/" + this.yDay + "/" + year;
    }
  }

  getSelfPickup() {
    var result = localStorage.getItem("IsSelfPickup");
    if (result != null) {
      if (result == "true") {
        this.IsSelfPickup = true;
      } else {
        this.IsSelfPickup = false;
      }
    }
    return this.IsSelfPickup;
  }

  canDisplayPickup() {
    const haveDRMProduct = this.cartList.filter((o) => {
      return o.productName.indexOf("DRM") !== -1;
    });

    return haveDRMProduct.length !== 0 && this.cartList.length === 1;
  }
  //
  description: string;
  onAddPromoCode() {
    this.promoCode = $("#txtpromoCode").val();
    if (this.promoCode) {
      this.promocodeService.getValidate(this.promoCode).subscribe(
        (res: any) => {
          if (res) {
            this.encryptedPromoCodeId = res.encryptedPromoCodeId;
            this.description = res.description;
            localStorage.setItem(
              "encryptedPromoCodeId",
              res.encryptedPromoCodeId
            );
            localStorage.setItem("promoCode", this.promoCode);
            localStorage.setItem("description", this.description);
          }
        },
        (error) => {
          console.log(error);
          Swal.fire({
            title: "Try Again!",
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
    }
  }
  onRemovePromoCode() {
    this.encryptedPromoCodeId = null;
    localStorage.removeItem("encryptedPromoCodeId");
    localStorage.removeItem("promoCode");
    this.promoCode = null;
  }
}
