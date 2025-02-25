import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { PageRouteVariable } from "src/app/commons/page-route-variable";
import { CartManagementService } from "src/app/services/helpers/cart-management.service";

@Component({
  selector: "app-product-header",
  templateUrl: "./product-header.component.html",
  standalone: false,
  styleUrls: ["./product-header.component.scss"],
})
export class ProductHeaderComponent implements OnInit {
  HOME_URL: string = "https://donary.com/";
  constructor(
    private router: Router,
    private cartService: CartManagementService
  ) {}

  ngOnInit() {}

  goToCart() {
    this.router.navigate([PageRouteVariable.ProductCart_url]);
  }

  goTOProductAndPlan(event) {
    event.preventDefault();
    this.cartService.removeLastVisitedProduct();
    this.router.navigate([PageRouteVariable.DonorProductPlans_url]);
  }
}
