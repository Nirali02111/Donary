import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { PageRouteVariable } from "../../commons/page-route-variable";
import { NeedAuthGuardGuard } from "../../commons/need-auth-guard.guard";
import { ProductPlansComponent } from "./product-plans.component";
import { LayoutComponent } from "./layout/layout.component";
import { ProductDetailsComponent } from "./product-details/product-details.component";
import { SignUpComponent } from "./sign-up/sign-up.component";
import { RegisterAccountComponent } from "./register-account/register-account.component";
import { ViewCartComponent } from "./view-cart/view-cart.component";

const routes: Routes = [
  {
    path: "",
    component: LayoutComponent,
    children: [
      {
        path: "",
        component: ProductPlansComponent,
      },
      {
        path: "sign-up",
        component: SignUpComponent,
      },

      {
        path: "register",
        component: RegisterAccountComponent,
      },

      {
        path: "cart",
        component: ViewCartComponent,
      },

      {
        path: ":id",
        component: ProductDetailsComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProductPlansRoutingModule {}
