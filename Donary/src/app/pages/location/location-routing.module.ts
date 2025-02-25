import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NeedAuthGuardGuard } from '../../commons/need-auth-guard.guard';
import { PageRouteVariable } from '../../commons/page-route-variable';
import { LocationListComponent } from './location-list/location-list.component';



const routes: Routes = [
    {
        path: '',
        component: LocationListComponent,
        children: [
            {
                path: '',
                component: LocationListComponent,                
            },
            {
                path: PageRouteVariable.Location_url,
                component: LocationListComponent,
                canActivate: [NeedAuthGuardGuard]
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class LocationRoutingModule { }
