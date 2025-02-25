import { Component, OnInit } from "@angular/core";
import { forkJoin } from "rxjs";
import * as _ from "lodash";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import {
  CartManagementService,
  CartItem,
} from "src/app/services/helpers/cart-management.service";
import { ProductPlanService } from "src/app/services/product-plan.service";
import {
  PlanItem,
  ProductItem,
  ProductAndPlans,
} from "./../../product-plans/models";

import { swingTrigger } from "src/app/commons/animation";
import { Router } from "@angular/router";
import { PromocodeService } from "src/app/services/promocode.service";
import Swal from "sweetalert2";

declare var $: any;
interface CheckOutItem {
  product: ProductItem;
  productCount: number;
  productPlans: Array<PlanItem>;
}

@Component({
  selector: "app-view-cart",
  templateUrl: "./view-cart.component.html",
  styleUrls: ["./view-cart.component.scss"],
  animations: [swingTrigger],
  standalone: false,
})
export class ViewCartComponent implements OnInit {
  isLoading: Boolean = false;
  cartList: Array<CartItem> = [];
  checkOutList: Array<CheckOutItem> = [];

  monthlyTotalAmount: number = 0;
  yearlyTotalAmount: number = 0;
  deviceTotalAmount: number = 0;
  taxTotalAmount: number = 0;
  subTotalAmount: number = 0;
  fileOutTaxExemptForm_Name: string;
  monthlyNextCharge: any = "";
  yearlyNextCharge: any = "";
  IsSelfPickup: boolean = false;
  shippingAmount: number = 20;

  inAnimation = false;
  allPlansEmptyProductList: Array<CheckOutItem> = [];
  promoCode: string;
  constructor(
    private router: Router,
    public commonMethod: CommonMethodService,
    private productPlanService: ProductPlanService,
    public cartService: CartManagementService,
    private promocodeService: PromocodeService
  ) {}

  ngOnInit() {
    this.cartList = this.cartService.getCartList();
    this.getLists();
    localStorage.removeItem("fileOutTaxExemptForm");
    localStorage.removeItem("fileOutTaxExemptForm_Name");
    this.refreshSummary();
    localStorage.removeItem("encryptedPromoCodeId");
    localStorage.removeItem("promoCode");
  }

  syncGetWithCartItem(product: ProductAndPlans) {
    const inCart = this.cartList.find(
      (c) => c.productId === product.product.productId
    );

    const productPlans = product.productPlans.map((p) => {
      const planInCart = inCart.selectedPlan.find((s) => s.planId === p.planId);
      if (planInCart) {
        return {
          ...p,
          user: planInCart.PlanCount,
        };
      }
      return null;
    });

    return {
      product: product.product,
      productCount: inCart.productCount,
      productPlans: productPlans.filter((pp) => pp !== null),
    };
  }

  syncWithLocalStorage(productId: number) {
    const item = this.checkOutList.find((c) => {
      return c.product.productId === productId;
    });
    if (!item) {
      return;
    }
    const cartItem: CartItem = {
      productId: item.product.productId,
      productCount: item.productCount,
      price: item.product.price,
      productName: item.product.productName,
      productNote: item.product.productNote,
      saleType: item.product.saleType,
      selectedPlan: item.productPlans.map((o) => ({
        planId: o.planId,
        planName: o.planName,
        PlanCount: o.user,
        price: o.price,
        recurringType: o.recurringType,
      })),
    };

    this.cartService.addToCart(cartItem);
    this.refreshSummary();
  }

  getLists() {
    if (this.cartList.length === 0) {
      return;
    }

    this.isLoading = true;
    const reqAry = this.cartList.map((i) => {
      return this.productPlanService.getProductsPlanList(
        i.productId.toString()
      );
    });

    forkJoin(reqAry).subscribe(
      (results: Array<ProductAndPlans>) => {
        this.isLoading = false;

        this.checkOutList = results.map((i) => {
          return this.syncGetWithCartItem(i);
        });
        this.refreshSummary();
      },
      (err) => {
        this.isLoading = false;
      }
    );
  }

  getMinCount(count: number): number {
    let checkCount = count - 1;
    return checkCount > 0 ? checkCount : 0;
  }

  DecreaseProduct(productId: number) {
    this.checkOutList = this.checkOutList.map((o) => {
      if (o.product.productId !== productId) {
        return o;
      }

      const productCount = this.getMinCount(o.productCount);

      return {
        ...o,
        productCount: productCount,
      };
    });

    this.syncWithLocalStorage(productId);
  }

  IncreaseProduct(productId: number) {
    this.checkOutList = this.checkOutList.map((o) => {
      if (o.product.productId !== productId) {
        return o;
      }
      return {
        ...o,
        productCount: o.productCount + 1,
      };
    });

    this.syncWithLocalStorage(productId);
  }

  onChangeProductCount(event: any, productId: number) {
    let count = parseInt(event.target.value);
    if (!count || count < 0) {
      count = 0;
    }
    this.checkOutList = this.checkOutList.map((o) => {
      if (o.product.productId !== productId) {
        return o;
      }
      return {
        ...o,
        productCount: count,
      };
    });

    this.syncWithLocalStorage(productId);
  }

  DecreaseUserInPlan(productId: number, planId: number) {
    this.checkOutList = this.checkOutList.map((o) => {
      if (o.product.productId !== productId) {
        return o;
      }

      o.productPlans = o.productPlans.map((p) => {
        if (p.planId !== planId) {
          return p;
        }

        const userCount = this.getMinCount(p.user);

        return {
          ...p,
          user: userCount,
        };
      });

      return {
        ...o,
      };
    });

    this.syncWithLocalStorage(productId);
  }

  IncreaseUserInPlan(productId: number, planId: number) {
    this.checkOutList = this.checkOutList.map((o) => {
      if (o.product.productId !== productId) {
        return o;
      }

      o.productPlans = o.productPlans.map((p) => {
        if (p.planId !== planId) {
          return p;
        }

        return {
          ...p,
          user: p.user + 1,
        };
      });

      return {
        ...o,
      };
    });

    this.syncWithLocalStorage(productId);
  }

  onChangeUserInPlan(event: any, productId: number, planId: number) {
    let count = parseInt(event.target.value);
    if (!count || count < 0) {
      count = 0;
    }
    this.checkOutList = this.checkOutList.map((o) => {
      if (o.product.productId !== productId) {
        return o;
      }

      o.productPlans = o.productPlans.map((p) => {
        if (p.planId !== planId) {
          return p;
        }

        return {
          ...p,
          user: count,
        };
      });

      return {
        ...o,
      };
    });

    this.syncWithLocalStorage(productId);
  }

  refreshSummary() {
    this.getMonthlyTotal();
    this.getAnnualTotal();
    this.getDeviceTotal();
    //this.getTaxAmount(); for issue
    this.getSubTotal();
    this.changeDate(); //added new

    this.allPlansEmptyProductList = this.getEmptyProduct();
  }

  getMonthlyTotal() {
    this.monthlyTotalAmount = _.reduce(
      this.checkOutList,
      (sumOf: number, element: CheckOutItem) => {
        let sum = _.reduce(
          element.productPlans,
          (sumOfPlans: number, elementPlan: PlanItem) => {
            if (elementPlan.recurringType === "Monthly") {
              let planSum = elementPlan.user * elementPlan.price;
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
      this.checkOutList,
      (sumOf: number, element: CheckOutItem) => {
        if (element.product.saleType === "Licence Fee") {
          let sum = element.productCount * element.product.price;
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
      this.checkOutList,
      (sumOf: number, element: CheckOutItem) => {
        if (element.product.saleType === "Sale") {
          let sum = element.productCount * element.product.price;
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
    /*this.subTotalAmount =
      this.monthlyTotalAmount +
      this.yearlyTotalAmount +
      this.deviceTotalAmount +
      this.taxTotalAmount +
      this.shippingAmount;

    this.subTotalAmount;

    if (this.canDisplayPickup()) {
      this.IsSelfPickup ? this.subTotalAmount = this.subTotalAmount-this.shippingAmount: this.subTotalAmount;
      return
    }

    this.subTotalAmount = this.subTotalAmount-this.shippingAmount;*/

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

  onRemoveFromList(event, product) {
    event.preventDefault();
    this.checkOutList = this.checkOutList.filter((c) => {
      return c.product.productId !== product.productId;
    });
    this.cartService.removeFromCart(product);
    this.refreshSummary();
  }
  file: File;
  incomingfileName(event) {
    const file = event.target.files[0];
    this.fileOutTaxExemptForm_Name = file.name.toString();
  }

  // setIncomingFile(){
  //   this.commonMethod.fileOutTaxExemptForm=this.file;
  // }

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

  canDisplayPickup() {
    // const list = this.getEmptyProduct();
    // return list.length === this.checkOutList.length;

    const haveDRMProduct = this.checkOutList.filter((o) => {
      return o.product.productName.indexOf("DRM") !== -1;
    });

    return haveDRMProduct.length !== 0 && this.checkOutList.length === 1;
  }

  changePickupStatus(item: string) {
    if (item == "true") {
      this.IsSelfPickup = true;
    } else {
      this.IsSelfPickup = false;
    }

    this.refreshSummary();
    localStorage.setItem("IsSelfPickup", item);
  }

  ngAfterViewInit() {
    this.IsSelfPickup = false;
    $("#shipping").prop("checked", true);
    $("#freepick").prop("checked", false);
    this.changePickupStatus("false");
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

  triggerAnimation() {
    if (this.inAnimation) {
      return;
    }

    this.inAnimation = true;
    setTimeout(() => {
      this.inAnimation = false;
    }, 1000);
  }

  private getEmptyProduct() {
    return this.checkOutList.filter((o) => {
      const emptyPlans = o.productPlans.filter((p) => {
        return !p.user || p.user === 0;
      });

      return emptyPlans.length === o.productPlans.length;
    });
  }

  private canProceed() {
    this.allPlansEmptyProductList = this.getEmptyProduct();

    if (this.allPlansEmptyProductList.length !== 0) {
      this.triggerAnimation();
      return false;
    }
    return true;
  }

  loginToProceed(event) {
    event.preventDefault();
    const check = this.canProceed();
    if (!check) {
      return;
    }

    this.router.navigate(["/"], {
      queryParams: {
        returnUrl: "/checkout",
      },
    });
  }

  signUpToProceed(event) {
    event.preventDefault();
    const check = this.canProceed();
    if (!check) {
      return;
    }

    this.router.navigate(["/productandplans/sign-up"]);
  }

  needToAnimate(item: PlanItem, product: ProductItem) {
    const isInvalid = this.allPlansEmptyProductList.find((o) => {
      return o.product.productId === product.productId;
    });
    if (!item.user && isInvalid && this.inAnimation) {
      return true;
    }

    return false;
  }

  needToAnimateRedBorder(item: PlanItem, product: ProductItem) {
    const isInvalid = this.allPlansEmptyProductList.find((o) => {
      return o.product.productId === product.productId;
    });
    if (!item.user && isInvalid) {
      return true;
    }

    return false;
  }

  //
  encryptedPromoCodeId: string;
  description: string;
  onAddPromoCode(event) {
    event.preventDefault();
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
            confirmButtonText: this.commonMethod.getTranslate(
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
