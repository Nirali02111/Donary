import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { NeedAuthGuardGuard } from "src/app/commons/need-auth-guard.guard";
import { PageRouteVariable } from "src/app/commons/page-route-variable";
import { FinanceMainComponent } from "./finance-main/finance-main.component";

const routes: Routes = [
    {
      path: '',
      component: FinanceMainComponent,
      children: [
          {
              path: '',
              component: FinanceMainComponent,                
          },
          {
              path: PageRouteVariable.Finance_url,
              component: FinanceMainComponent,
              canActivate: [NeedAuthGuardGuard]
          }
      ]
    }
  ];
  
  @NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
  })
  export class FinanceRoutingModule { }