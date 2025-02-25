import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NeedAuthGuardGuard } from '../../commons/need-auth-guard.guard';
import { PageRouteVariable } from '../../commons/page-route-variable';
import { ListMainComponent } from './list-main/list-main.component';

const routes: Routes = [
    {
        path: '',
        component: ListMainComponent,
        children: [
            {
                path: '',
                component: ListMainComponent,                
            },
            {
                path: PageRouteVariable.ListPage_url,
                component: ListMainComponent,
                canActivate: [NeedAuthGuardGuard]
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ListRoutingModule { }
