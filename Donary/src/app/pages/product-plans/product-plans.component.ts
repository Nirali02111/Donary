import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { PageRouteVariable } from "src/app/commons/page-route-variable";
import { CartManagementService } from "src/app/services/helpers/cart-management.service";
import { ProductService } from "src/app/services/product.service";
import { ProductItem, PlanItem } from "./models";
import * as _ from "lodash";

@Component({
  selector: "app-product-plans",
  templateUrl: "./product-plans.component.html",
  styleUrls: ["./product-plans.component.scss"],
  standalone: false,
})
export class ProductPlansComponent implements OnInit {
  isCheckOut = false;
  isMainPage = true;
  isloading: boolean = false;
  listData: Array<ProductItem> = [];
  isCore = "Donary Core";

  lastProductPlan: Array<PlanItem>;
  lastProduct: ProductItem;

  constructor(
    private router: Router,
    public commonMethod: CommonMethodService,
    private productService: ProductService,
    public cartService: CartManagementService
  ) {}

  ngOnInit() {
    this.isloading = true;
    this.productService.getProductsList().subscribe(
      (res: Array<ProductItem>) => {
        this.isloading = false;
        this.listData = res;
        this.lastVisitedProduct();
      },
      (err) => {
        this.isloading = false;
      }
    );
  }

  OpenCart() {
    this.isCheckOut = true;
    this.isMainPage = false;
  }

  isStandartPlan(planName: string) {
    return planName.toLowerCase() === "standart";
  }

  lastVisitedProduct() {
    const product = this.cartService.getLastVisitedProduct();

    if (product) {
      if (product.product) {
        this.lastProduct = product.product;
      }

      if (product.productPlans && product.productPlans.length !== 0) {
        this.lastProductPlan = product.productPlans;
      }
    }
  }

  subTotalAmount() {
    const amount = _.reduce(
      this.lastProductPlan,
      (sumOf: number, element: PlanItem) => {
        let planSum = element.user * element.price;
        sumOf = sumOf + planSum;
        return sumOf;
      },
      this.lastProduct.price
    );
    return amount;
  }

  onCheckout() {
    this.router.navigate([PageRouteVariable.ProductCheckout_url]);
  }

  onViewCart() {
    this.router.navigate([PageRouteVariable.ProductCart_url]);
  }

  goToProductPage(productId) {
    this.router.navigate([PageRouteVariable.DonorProductPlans_url, productId]);
  }
}
