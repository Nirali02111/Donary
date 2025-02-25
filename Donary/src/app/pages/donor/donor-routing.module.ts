import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NeedAuthGuardGuard } from '../../commons/need-auth-guard.guard';
import { PageRouteVariable } from '../../commons/page-route-variable';
import { DonorListComponent } from './donor-list/donor-list.component';
const routes: Routes = [
    {
        path: '',
        component: DonorListComponent,
        children: [
            {
                path: '',
                component: DonorListComponent,                
            },
            {
                path: PageRouteVariable.DonorPay_url,
                component: DonorListComponent,
                canActivate: [NeedAuthGuardGuard]
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class DonorRoutingModule { }
