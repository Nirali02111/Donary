import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NeedAuthGuardGuard } from '../../commons/need-auth-guard.guard';
import { PageRouteVariable } from '../../commons/page-route-variable';
import { NotificationMainComponent } from './notification-main/notification-main.component';
const routes: Routes = [
    {
        path: '',
        component: NotificationMainComponent,
        children: [
            {
                path: '',
                component: NotificationMainComponent,                
            },
            {
                path: PageRouteVariable.Notification_url,
                component: NotificationMainComponent,
                canActivate: [NeedAuthGuardGuard]
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class NotificationRoutingModule {
    /**
     *
     */
    constructor() {    
    }
 }
