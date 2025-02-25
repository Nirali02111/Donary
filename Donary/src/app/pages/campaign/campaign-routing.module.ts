import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NeedAuthGuardGuard } from '../../commons/need-auth-guard.guard';
import { PageRouteVariable } from '../../commons/page-route-variable';
import { CampaignListComponent } from './campaign-list/campaign-list.component';


const routes: Routes = [
    {
        path: '',
        component: CampaignListComponent,
        children: [
            {
                path: '',
                component: CampaignListComponent,                
            },
            {
                path: PageRouteVariable.Campaign_url,
                component: CampaignListComponent,
                canActivate: [NeedAuthGuardGuard]
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CampaignRoutingModule { }
