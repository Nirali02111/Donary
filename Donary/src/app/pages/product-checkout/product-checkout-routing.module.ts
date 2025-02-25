import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { PageRouteVariable } from "../../commons/page-route-variable";
import { NeedAuthGuardGuard } from "../../commons/need-auth-guard.guard";

import { CheckoutLayoutComponent } from "./checkout-layout/checkout-layout.component";
import { ProductCheckoutComponent } from "./product-checkout/product-checkout.component";
import { ThankYouComponent } from "./thank-you/thank-you.component";

const routes: Routes = [
  {
    path: "",
    component: CheckoutLayoutComponent,
    canActivate: [NeedAuthGuardGuard],

    children: [
      {
        path: "",
        component: ProductCheckoutComponent,
      },
      {
        path: "confirm",
        component: ThankYouComponent,
      },
    ],

    /*children: [            
            {
                path: '',
                component: ProductCheckoutComponent,
            },
            {
                path: PageRouteVariable.ProductCheckout_url,
                component: ProductCheckoutComponent,
            }
        ]*/
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProductCheckoutRoutingModule {}
