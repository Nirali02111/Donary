import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import {
  CartItem,
  CartManagementService,
} from "src/app/services/helpers/cart-management.service";
import * as _ from "lodash";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { PageRouteVariable } from "src/app/commons/page-route-variable";

@Component({
  selector: "app-thank-you",
  templateUrl: "./thank-you.component.html",
  standalone: false,
  styleUrls: ["./thank-you.component.scss"],
})
export class ThankYouComponent implements OnInit {
  isloading: boolean = false;

  orderId = "";
  clientName = "";
  Address = "";
  city = "";
  state = "";
  zip = "";
  firstName = "";
  phone = "";
  email = "";
  cardending = "";
  products: any = [];
  cartList: Array<CartItem> = [];

  monthlyTotalAmount: number = 0;
  yearlyTotalAmount: number = 0;
  deviceTotalAmount: number = 0;
  taxTotalAmount: number = 0;
  subTotalAmount: number = 0;
  shippingAmount: number = 20;
  monthlyNextCharge: any = "";
  yearlyNextCharge: any = "";

  needFullyRegister = false;
  IsSelfPickup: boolean = false;
  constructor(
    private router: Router,
    private activeRouter: ActivatedRoute,
    private cartService: CartManagementService,
    public commonMethodService: CommonMethodService
  ) {
    const data = this.router.getCurrentNavigation().extras.state;
    if (data) {
      this.orderId = data.orderId;
      this.clientName = data.billingDetails.clientName;
      this.Address = data.billingDetails.Address;
      this.city = data.billingDetails.city;
      this.state = data.billingDetails.state;
      this.zip = data.billingDetails.zip;
      this.firstName = data.billingDetails.firstName;
      this.phone = data.billingDetails.phone;
      this.email = data.billingDetails.email;
      this.cardending = data.billingDetails.cardending;
      this.products = data.billingDetails.products;
    }
  }

  ngOnInit() {
    this.activeRouter.queryParamMap.subscribe((params) => {
      console.log(params);

      if (params.get("isInit")) {
        this.needFullyRegister = true;
      }
    });

    this.cartList = this.cartService.getCartList();
    this.cartService.clearCart();
    this.cartService.removeLastVisitedProduct();
    this.getMonthlyTotal();
    this.getAnnualTotal();
    //this.getTaxAmount();    ;
    this.getDeviceTotal(); ///added
    this.getSelfPickup(); //added new
    this.getSubTotal();
    this.changeDate();
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

  ContinueShopping() {
    if (this.needFullyRegister) {
      location.href = `${PageRouteVariable.DonorProductPlans_url}/register`;
      return;
    }
    this.router.navigate([PageRouteVariable.DonorProductPlans_url]);
  }

  // set date
  rMonth: any;
  rDay: any;
  yMonth: any;
  yDay: any;
  changeDate() {
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
}
