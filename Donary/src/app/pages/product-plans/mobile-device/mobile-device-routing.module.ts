import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NeedAuthGuardGuard } from 'src/app/commons/need-auth-guard.guard';
import { PageRouteVariable } from 'src/app/commons/page-route-variable';
import { MobiledeviceComponent } from './mobiledevice.component';

const routes: Routes = [
    {
        path: '',
        component: MobiledeviceComponent,
        children: [            
            {
                path: '',
                component: MobiledeviceComponent,
                //canActivate: [NeedAuthGuardGuard]
            },
            {
                path: PageRouteVariable.DonorMobileDevice_url,
                component: MobiledeviceComponent,
                canActivate: [NeedAuthGuardGuard]
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class MobileDeviceRoutingModule { }
