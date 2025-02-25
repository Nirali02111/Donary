import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NeedAuthGuardGuard } from '../../commons/need-auth-guard.guard';
import { UserListComponent } from './user-list/user-list.component';
const routes: Routes = [
    {
        path: '',
       component: UserListComponent,
        children: [
            {
                path: '',
                component: UserListComponent,                
            },
            {
                path: '',
                component: UserListComponent,
                canActivate: [NeedAuthGuardGuard]
            }
        ]
    }
    
    
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class UserRoutingModule { }
