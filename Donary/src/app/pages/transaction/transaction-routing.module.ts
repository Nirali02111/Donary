import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PageRouteVariable } from '../../commons/page-route-variable';
import { NeedAuthGuardGuard } from '../../commons/need-auth-guard.guard';
import { TransactionMainComponent } from './transaction-main/transaction-main.component';
const routes: Routes = [
    {
        path: '',
        component: TransactionMainComponent,
        children: [
            {
                path: '',
                component: TransactionMainComponent,                
            },
            {
                path: PageRouteVariable.TransactionPage_url,
                component: TransactionMainComponent,
                canActivate: [NeedAuthGuardGuard]
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class TransactionRoutingModule { }
