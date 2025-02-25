import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

export interface Address {
  ContactId: 0;
  FirstName: string;
  LastName: string;
  Address: string;
  City: string;
  State: string;
  Zip: string;
}

export interface CheckOutOrderProduct {
  ProductId: number;
  Qty: number;
  UnitAmount: number;
  ProductPlans: Array<{
    PlanId: number;
    Users: number;
    PlanAmount: number;
  }>;
}

export interface CheckOutPayload {
  EventGuId: string;
  CCDetails: {
    CCNum: string;
    Expiry: string;
    CVV: string;
    BillingAddress: Address;
  };
  IsBillingSameAsShippingAddress: boolean;
  ShippingAddress: Address;
  Products: Array<CheckOutOrderProduct>;
  TotalAmount: number;
  CreatedBy: number;
  UniqueTransId?: string;
}

@Injectable({
  providedIn: "root",
})
export class OrderService {
  version = "v1/";
  ORDER_MAIN_URL = "Order";

  protected CheckOut_URL = `${this.version}${this.ORDER_MAIN_URL}/CheckOut`;
  constructor(private http: HttpClient) {}

  CheckoutOrder(formdata): Observable<any> {
    return this.http.post(this.CheckOut_URL, formdata).pipe((response) => {
      return response;
    });
  }
}
