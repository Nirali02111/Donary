import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NeedAuthGuardGuard } from '../../commons/need-auth-guard.guard';
import { PageRouteVariable } from '../../commons/page-route-variable';
import { ReportMainComponent } from './report-main/report-main.component';
import { StandardReportDetailsComponent } from './standard-report-details/standard-report-details.component';
const routes: Routes = [
    {
        path: '',
        component: ReportMainComponent,
        children: [
            {
                path: '',
                component: ReportMainComponent,                
            },
            {
                path: PageRouteVariable.Report_url,
                component: ReportMainComponent,
                canActivate: [NeedAuthGuardGuard]
            }
        ]
    },
    {
        path: ':id',
        component: StandardReportDetailsComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ReportRoutingModule {
    /**
     *
     */
    constructor() {    
    }
 }
