import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NeedAuthGuardGuard } from 'src/app/commons/need-auth-guard.guard';
import { PageRouteVariable } from 'src/app/commons/page-route-variable';
import { DrmComponent } from './drm.component';

const routes: Routes = [
    {
        path: '',
        component: DrmComponent,
        children: [            
            {
                path: '',
                component: DrmComponent,
                //canActivate: [NeedAuthGuardGuard]
            },
            {
                path: PageRouteVariable.DonorDrm_url,
                component: DrmComponent,
                canActivate: [NeedAuthGuardGuard]
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class DrmRoutingModule { }
