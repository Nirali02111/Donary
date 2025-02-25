import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class ProductService {
  version = "v1/";
  PRODUCT_MAIN_URL = "Product";

  GET_PRODUCTS_URL = `${this.version}${this.PRODUCT_MAIN_URL}/GetProducts`;

  constructor(private http: HttpClient) {}

  getProductsList(): Observable<any> {
    return this.http.get(this.GET_PRODUCTS_URL).pipe((response) => {
      return response;
    });
  }
}
