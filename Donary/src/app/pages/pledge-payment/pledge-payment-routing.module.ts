import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { UnpaidPledgeListComponent } from "./unpaid-pledge-list/unpaid-pledge-list.component";
import { PageRouteVariable } from "../../commons/page-route-variable";
import { NeedAuthGuardGuard } from "../../commons/need-auth-guard.guard";

const routes: Routes = [
  {
    path: "",
    component: UnpaidPledgeListComponent,
    children: [
      {
        path: "",
        component: UnpaidPledgeListComponent,
      },
      {
        path: PageRouteVariable.DonorPledgePaymentPay_url,
        component: UnpaidPledgeListComponent,
        canActivate: [NeedAuthGuardGuard],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PledgePaymentRoutingModule {}
