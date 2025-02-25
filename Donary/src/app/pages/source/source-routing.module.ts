import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NeedAuthGuardGuard } from '../../commons/need-auth-guard.guard';
import { PageRouteVariable } from '../../commons/page-route-variable';
import { SourceListComponent } from './source-list/source-list.component';
const routes: Routes = [
    {
        path: '',
        component: SourceListComponent,
        children: [
            {
                path: '',
                component: SourceListComponent,                
            },
            {
                path: PageRouteVariable.Source_url,
                component: SourceListComponent,
                canActivate: [NeedAuthGuardGuard]
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class SourceRoutingModule { }
