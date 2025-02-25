import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NeedAuthGuardGuard } from '../../commons/need-auth-guard.guard';
import { PageRouteVariable } from '../../commons/page-route-variable';
import { AdminMainComponent } from './admin-main/admin-main.component';

const routes: Routes = [
  {
    path: '',
    component: AdminMainComponent,
    children: [
        {
            path: '',
            component: AdminMainComponent,                
        },
        {
            path: PageRouteVariable.Admin_url,
            component: AdminMainComponent,
            canActivate: [NeedAuthGuardGuard]
        }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
