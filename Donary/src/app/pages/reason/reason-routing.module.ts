import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NeedAuthGuardGuard } from '../../commons/need-auth-guard.guard';
import { PageRouteVariable } from '../../commons/page-route-variable';
import { ReasonListComponent } from './reason-list/reason-list.component';
const routes: Routes = [
    {
        path: '',
        component: ReasonListComponent,
        children: [
            {
                path: '',
                component: ReasonListComponent,                
            },
            {
                path: PageRouteVariable.Reason_url,
                component: ReasonListComponent,
                canActivate: [NeedAuthGuardGuard]
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ReasonRoutingModule { }
