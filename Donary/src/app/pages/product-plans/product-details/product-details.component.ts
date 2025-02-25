import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ProductPlanService } from "src/app/services/product-plan.service";
import { PlanItem, ProductItem, ProductAndPlans } from "../models";
import * as _ from "lodash";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import {
  CartManagementService,
  CartItem,
} from "src/app/services/helpers/cart-management.service";
import { PageRouteVariable } from "src/app/commons/page-route-variable";
import {
  animate,
  animation,
  keyframes,
  style,
  transition,
  trigger,
  useAnimation,
} from "@angular/animations";

export const swing = animation(
  animate(
    "{{ timing }}s {{ delay }}s",
    keyframes([
      style({ transform: "rotate3d(0, 0, 1, 15deg)", offset: 0.2 }),
      style({ transform: "rotate3d(0, 0, 1, -10deg)", offset: 0.4 }),
      style({ transform: "rotate3d(0, 0, 1, 5deg)", offset: 0.6 }),
      style({ transform: "rotate3d(0, 0, 1, -5deg)", offset: 0.8 }),
      style({ transform: "rotate3d(0, 0, 1, 0deg)", offset: 1 }),
    ])
  ),
  { params: { timing: 1, delay: 0 } }
);

@Component({
  selector: "app-product-details",
  templateUrl: "./product-details.component.html",
  styleUrls: ["./product-details.component.scss"],
  standalone: false,
  animations: [trigger("swing", [transition("* => *", useAnimation(swing))])],
})
export class ProductDetailsComponent implements OnInit {
  selectedID: number;
  isLoading: boolean = false;
  swingAnimate: boolean = false;
  productDetail: ProductItem;
  productCount: number = 1;
  planList: Array<PlanItem> = [];
  cartList: Array<CartItem> = [];
  defaultFooter: boolean = false;

  constructor(
    private router: Router,
    private activeRoute: ActivatedRoute,
    private productPlanService: ProductPlanService,
    public commonMethod: CommonMethodService,
    public cartService: CartManagementService
  ) {}

  ngOnInit() {
    this.activeRoute.paramMap.subscribe((params) => {
      this.selectedID = +params.get("id");
      this.getPlansList();
      this.refreshFooterCart();
    });
  }

  goToProductPage() {
    this.router.navigate([PageRouteVariable.DonorProductPlans_url]);
  }

  isProductCountZero() {
    return !this.isLoading && this.productCount !== 0;
  }

  isStandartPlan(planName: string) {
    return planName.toLowerCase() === "standart";
  }

  onHideDefaultFooter() {
    this.defaultFooter = false;
    this.onUnSelectProduct();
  }

  onHideDefaultFooterPlan(planId) {
    this.planList = this.planList.map((p) => {
      if (p.planId !== planId) {
        return {
          ...p,
        };
      }
      return {
        ...p,
        user: 0,
      };
    });
  }

  lastVisitedSync() {
    this.cartService.setLastVisitedProduct({
      product: this.productDetail,
      productPlans: this.planList,
    });
  }

  getPlansList() {
    this.isLoading = true;
    this.productPlanService
      .getProductsPlanList(this.selectedID.toString())
      .subscribe(
        (res: ProductAndPlans) => {
          this.isLoading = false;
          this.productDetail = res.product;
          this.planList = res.productPlans.map((o) => {
            if (this.isPlanAddedToCart(o.planId)) {
              return {
                ...o,
                user: this.getPlanUserCountFromCart(o.planId),
              };
            }

            if (this.isStandartPlan(o.planName)) {
              return {
                ...o,
                user: 1,
              };
            }

            return {
              ...o,
              user: 0,
            };
          });

          this.productCount = this.getProductUserCountFromCart();
          this.lastVisitedSync();
          if (!this.isProductAddedToCart()) {
            this.defaultFooter = true;
          }
        },
        (error) => {
          this.isLoading = false;
        }
      );
  }

  refreshFooterCart() {
    this.cartList = this.cartService.getCartList();
  }

  getMinCount(count: number): number {
    let checkCount = count - 1;
    return checkCount > 0 ? checkCount : 0;
  }

  /**
   * Reduce Product count
   */
  DecreaseProduct() {
    this.productCount = this.getMinCount(this.productCount);
    if (this.productCount === 0) {
      this.planList = this.planList.map((p) => {
        return {
          ...p,
          user: 0,
        };
      });
    }
    this.syncCartItems();
  }

  /**
   * Increase product copunt
   */
  IncreaseProduct() {
    this.productCount += 1;
    this.syncCartItems();
  }

  /**
   * Decrease User counts in Product plan and if plan selected in cart then sync with cart item
   */
  DecreaseUserInPlan(planId: number) {
    this.planList = this.planList.map((o) => {
      if (o.planId !== planId) {
        return o;
      }
      const userCount = this.getMinCount(o.user);

      return {
        ...o,
        user: userCount,
      };
    });

    this.lastVisitedSync();
    if (this.isPlanAddedToCart(planId)) {
      this.syncCartItems();
    }
  }

  /**
   * Increase User counts in Product plan and if plan selected in cart then sync with cart item
   * @param planId number
   */
  IncreaseUserInPlan(planId: number) {
    this.planList = this.planList.map((o) => {
      if (o.planId !== planId) {
        return o;
      }
      return {
        ...o,
        user: o.user + 1,
      };
    });

    if (this.productCount === 0) {
      this.productCount = 1;
    }

    this.lastVisitedSync();
    if (this.isPlanAddedToCart(planId)) {
      this.syncCartItems();
    }
  }

  getProductPrice() {
    if (this.productDetail && this.productDetail.price) {
      return this.productDetail.price;
    }
    return 0;
  }

  getTotalCount() {
    const amount = _.reduce(
      this.planList,
      (sumOf: number, element: PlanItem) => {
        if (this.isPlanAddedToCart(element.planId)) {
          let planSum = element.user * element.price;
          sumOf = sumOf + planSum;
        }
        return sumOf;
      },

      this.productCount * this.getProductPrice()
    );

    return this.commonMethod.formatAmount(amount);
  }

  getDefaultTotalCount() {
    const amount = _.reduce(
      this.planList,
      (sumOf: number, element: PlanItem) => {
        let planSum = element.user * element.price;
        sumOf = sumOf + planSum;
        return sumOf;
      },

      this.productCount * this.getProductPrice()
    );

    return this.commonMethod.formatAmount(amount);
  }

  triggerAnimation() {
    if (this.swingAnimate) {
      return;
    }

    this.swingAnimate = true;
    setTimeout(() => {
      this.swingAnimate = false;
    }, 800);
  }

  isAllPlansEmptyUser() {
    const emptyPlans = this.planList.filter((p) => {
      return !p.user || p.user === 0;
    });
    return emptyPlans.length === this.planList.length;
  }

  private canProceed() {
    if (this.isAllPlansEmptyUser()) {
      this.triggerAnimation();
      return false;
    }
    return true;
  }

  /**
   * Add product and plans to cart only those plan which has user count > 0
   * @param event
   */
  onClickAddToCart(event: any) {
    event.preventDefault();

    if (!this.canProceed()) {
      return;
    }

    if (this.productCount === 0) {
      this.swingAnimate = true;
      setTimeout(() => {
        this.swingAnimate = false;
      }, 800);
      return;
    }

    const selectedPlan = this.planList.filter((o) => {
      return o.user > 0;
    });

    if (selectedPlan.length === 0 && this.productCount === 0) {
      this.goToProductPage();
      return;
    }

    const cartItem: CartItem = {
      productId: this.selectedID,
      productCount: this.productCount,
      price: this.productDetail.price,
      productName: this.productDetail.productName,
      productNote: this.productDetail.productNote,
      saleType: this.productDetail.saleType,
      selectedPlan: selectedPlan.map((o) => ({
        planId: o.planId,
        planName: o.planName,
        PlanCount: o.user,
        price: o.price,
        recurringType: o.recurringType,
      })),
    };

    this.cartService.addToCart(cartItem);

    this.refreshFooterCart();
    this.goToProductPage();
  }

  /**
   * Change product count by Input event
   * @param event
   */
  onChangeProductCount(event: any) {
    event.preventDefault();
    let count = parseInt(event.target.value);
    if (!count || count < 1) {
      this.productCount = 1;
    } else {
      this.productCount = count;
    }

    this.lastVisitedSync();
    this.syncCartItems();
  }

  /**
   * Change product plan user count by Input change
   * @param event
   * @param planId number
   */
  onChangePlanCount(event: any, planId: number) {
    event.preventDefault();
    let count = parseInt(event.target.value);
    if (!count || count < 1) {
      count = 1;
    }

    this.planList = this.planList.map((o) => {
      if (o.planId !== planId) {
        return o;
      }
      return {
        ...o,
        user: count,
      };
    });

    this.lastVisitedSync();
    if (this.isPlanAddedToCart(planId)) {
      this.syncCartItems();
    }
  }

  /**
   * if product added to Cart then sync only selected plan with cart
   *
   */
  syncCartItems() {
    if (!this.isProductAddedToCart()) {
      return;
    }

    const productInCart = this.cartList.find((c) => {
      return c.productId === this.selectedID;
    });

    let selectedPlansId = productInCart.selectedPlan.map((p) => p.planId);

    const selectedPlan = this.planList.filter((o) => {
      return selectedPlansId.findIndex((s) => s === o.planId) !== -1;
    });

    const cartItem: CartItem = {
      productId: this.selectedID,
      productCount: this.productCount,
      price: this.productDetail.price,
      productName: this.productDetail.productName,
      productNote: this.productDetail.productNote,
      saleType: this.productDetail.saleType,
      selectedPlan: selectedPlan.map((o) => ({
        planId: o.planId,
        planName: o.planName,
        PlanCount: o.user,
        price: o.price,
        recurringType: o.recurringType,
      })),
    };

    this.cartService.addToCart(cartItem);
    this.refreshFooterCart();
  }

  isProductAddedToCart() {
    const productInCart = this.cartList.find((c) => {
      return c.productId === this.selectedID;
    });

    if (productInCart) {
      return true;
    }

    return false;
  }

  isPlanAddedToCart(planId: number) {
    const productInCart = this.cartList.find((c) => {
      return c.productId === this.selectedID;
    });

    if (!productInCart) {
      return false;
    }

    const selectedPlan = productInCart.selectedPlan.find((p) => {
      return p.planId === planId;
    });

    if (selectedPlan) {
      return true;
    }

    return false;
  }

  getProductUserCountFromCart() {
    if (!this.isProductAddedToCart()) {
      return 1;
    }

    const productInCart = this.cartList.find((c) => {
      return c.productId === this.selectedID;
    });

    return productInCart.productCount;
  }

  getPlanUserCountFromCart(planId) {
    if (!this.isPlanAddedToCart(planId)) {
      return 1;
    }

    const productInCart = this.cartList.find((c) => {
      return c.productId === this.selectedID;
    });

    const selectedPlan = productInCart.selectedPlan.find((p) => {
      return p.planId === planId;
    });

    return selectedPlan.PlanCount;
  }

  onUnSelectPlan(planId: number) {
    if (!this.isPlanAddedToCart(planId)) {
      return 1;
    }

    this.planList = this.planList.map((p) => {
      if (p.planId === planId) {
        return {
          ...p,
          user: 0,
        };
      }

      return {
        ...p,
      };
    });

    const productInCart = this.cartList.find((c) => {
      return c.productId === this.selectedID;
    });

    let selectedPlansId = productInCart.selectedPlan.map((p) => {
      if (p.planId === planId) {
        return null;
      }

      return p.planId;
    });

    selectedPlansId = selectedPlansId.filter((s) => s !== null);

    const selectedPlan = this.planList.filter((o) => {
      return selectedPlansId.findIndex((s) => s === o.planId) !== -1;
    });

    const cartItem: CartItem = {
      productId: this.selectedID,
      productCount: this.productCount,
      price: this.productDetail.price,
      productName: this.productDetail.productName,
      productNote: this.productDetail.productNote,
      saleType: this.productDetail.saleType,
      selectedPlan: selectedPlan.map((o) => ({
        planId: o.planId,
        planName: o.planName,
        PlanCount: o.user,
        price: o.price,
        recurringType: o.recurringType,
      })),
    };

    this.cartService.addToCart(cartItem);
    this.refreshFooterCart();
  }

  onUnSelectProduct() {
    this.productCount = 0;
    this.planList = this.planList.map((p) => {
      return {
        ...p,
        user: 0,
      };
    });

    const cartItem: CartItem = {
      productId: this.selectedID,
      productCount: this.productCount,
      price: this.productDetail.price,
      productName: this.productDetail.productName,
      productNote: this.productDetail.productNote,
      saleType: this.productDetail.saleType,
      selectedPlan: [],
    };
    this.cartService.removeFromCart(cartItem);
    this.refreshFooterCart();
  }

  needToAnimate() {
    const emptyPlans = this.planList.filter((p) => {
      return !p.user || p.user === 0;
    });

    if (emptyPlans.length === this.planList.length && this.swingAnimate) {
      return true;
    }

    return false;
  }
}
