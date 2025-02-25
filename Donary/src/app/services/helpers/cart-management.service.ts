import { Injectable } from "@angular/core";
import { ProductAndPlans } from "src/app/pages/product-plans/models";

export interface SelectedPlan {
  planId: number;
  PlanCount: number;
  planName: string;
  price?: number;
  recurringType: string;
}

export interface CartItem {
  productId: number;
  productCount: number;
  productName: string;
  selectedPlan: Array<SelectedPlan>;
  price?: number;
  productNote: string;
  saleType: string;
}

@Injectable({
  providedIn: "root",
})
export class CartManagementService {
  protected TaxPercentages: number = 8.875;
  protected storageKey: string = "cart";
  protected lastVisitedProduct: string = "lastVisitedProduct";

  constructor() {}

  protected getCart(): Array<CartItem> {
    const cartArray = localStorage.getItem(this.storageKey);
    if (cartArray !== null) {
      return JSON.parse(cartArray);
    }
    return [];
  }

  protected setCart(value) {
    localStorage.setItem(this.storageKey, JSON.stringify(value));
  }

  protected haveItemInCart(
    cartArray: Array<CartItem>,
    item: CartItem
  ): Boolean {
    if (cartArray.filter((i) => i.productId === item.productId).length > 0) {
      return true;
    }

    return false;
  }

  addToCart(productItem: CartItem) {
    let cartArray = this.getCart();

    if (this.haveItemInCart(cartArray, productItem)) {
      cartArray = cartArray.map((o) => {
        if (o.productId === productItem.productId) {
          return productItem;
        }
        return o;
      });
      this.setCart(cartArray);
    } else {
      cartArray.push(productItem);
      this.setCart(cartArray);
    }
  }

  removeFromCart(productItem: CartItem) {
    let cartArray = this.getCart();
    if (this.haveItemInCart(cartArray, productItem)) {
      cartArray = cartArray.filter((o) => {
        return o.productId !== productItem.productId;
      });
      this.setCart(cartArray);
      // added new for issue
      this.removeLastVisitedProduct()
      // 
    }
  }

  getCartList(): Array<CartItem> {
    return this.getCart();
  }

  calculateTaxAmount(totalAmount: number) {
    return (totalAmount * this.TaxPercentages) / 100;
  }

  setLastVisitedProduct(productAndPlan) {
    localStorage.setItem(this.lastVisitedProduct,JSON.stringify(productAndPlan) );
  }

  getLastVisitedProduct() : ProductAndPlans {
    const lastItem = localStorage.getItem(this.lastVisitedProduct);
    if (lastItem !== null) {
      return JSON.parse(lastItem);
    }
    return null;
  }

  removeLastVisitedProduct(){
    localStorage.removeItem(this.lastVisitedProduct)
  }

  clearCart() {
    localStorage.removeItem(this.storageKey)
  }
}
