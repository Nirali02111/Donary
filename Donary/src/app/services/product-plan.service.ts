import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

// /v1/ProductPlan/GetProductPlans
@Injectable({
  providedIn: "root",
})
export class ProductPlanService {
  version = "v1/";
  PRODUCT_PLAN_MAIN_URL = "ProductPlan";

  GET_PRODUCTS_PLAN_URL = `${this.version}${this.PRODUCT_PLAN_MAIN_URL}/GetProductPlans`;

  constructor(private http: HttpClient) {}

  getProductsPlanList(productId: string): Observable<any> {
    return this.http
      .get(this.GET_PRODUCTS_PLAN_URL, { params: { productId } })
      .pipe((response) => {
        return response;
      });
  }
}
