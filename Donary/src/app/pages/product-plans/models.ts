export interface ProductItem {
  productId: number;
  saleType: string;
  productName: string;
  price: number;
  productNote: string;
  productImage: any;
  features: any;
}

export interface PlanItem {
  features: null;
  planId: number;
  planName: string;
  price: number;
  recurringType: string;
  user?: number;
}

export interface ProductAndPlans {
  product: ProductItem;
  productPlans: Array<PlanItem>;
}
