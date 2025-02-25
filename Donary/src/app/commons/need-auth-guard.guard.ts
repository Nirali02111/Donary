import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { LocalstoragedataService } from './local-storage-data.service';
import { PageRouteVariable } from './page-route-variable';

@Injectable({
    providedIn: 'root'
})
export class NeedAuthGuardGuard  {
    auth_url: string = '/' + PageRouteVariable.Auth_Main_url;

    constructor(private router: Router, private localstoragedataService: LocalstoragedataService) {    
    }

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
                    
        const currentUser = this.localstoragedataService.getLoginUserData();         
        if (currentUser) {            
            // authorised so return true
            return true;
        }

        // not logged in so redirect to login page with the return url (If pledge payment url then redirect to pledge payment login else normal login)
        if (state.url) {                        
            this.router.navigate([this.auth_url], { queryParams: { returnUrl: state.url } });
        }
        return false;
    }

}
