import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NeedAuthGuardGuard } from '../../commons/need-auth-guard.guard';
import { PageRouteVariable } from '../../commons/page-route-variable';
import { CollectorListComponent } from './collector-list/collector-list.component';


const routes: Routes = [
    {
        path: '',
        component: CollectorListComponent,
        children: [
            {
                path: '',
                component: CollectorListComponent,                
            },
            {
                path: PageRouteVariable.Collector_url,
                component: CollectorListComponent,
                canActivate: [NeedAuthGuardGuard]
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CollectorRoutingModule { }
