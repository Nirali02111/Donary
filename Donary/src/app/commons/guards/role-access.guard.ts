import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { Observable } from "rxjs";
import { LocalstoragedataService } from "../local-storage-data.service";
import { PageRouteVariable } from "../page-route-variable";

@Injectable({
    providedIn: 'root',
  })
  export class RoleAccessGuard  {
    constructor(
      private localStorageDataService: LocalstoragedataService,
      private router: Router,      
    ) {}
  
    canActivate(
      route: ActivatedRouteSnapshot,
      state: RouterStateSnapshot
    ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      return this.checkUserType(route, state.url);
    }
  
    checkUserType(route: ActivatedRouteSnapshot, url: any): boolean {        
      const currentUser = this.localStorageDataService.getLoginUserData();
  
      if (!currentUser) {
        this.router.navigate([PageRouteVariable.Auth_Main_url]);
        return false;
      }  
      const userPermissionLst = this.localStorageDataService.getPermissionLst();
      var searchUrl=url.replace('/','');
      if(searchUrl=='dashboard'){searchUrl='dashboard'}
      if(searchUrl=='report'){searchUrl='reports'}
      if(searchUrl=='lists'){searchUrl='list menu'}
      if(searchUrl=='notification'){searchUrl='notifications'}      
      var urlPermission=userPermissionLst.filter(x=>x.permissionName.toLowerCase()==searchUrl);
      if (!urlPermission[0].isActive) {
        this.router.navigate([PageRouteVariable.TransactionPage_url]);       
        return false;
      }  
      return true;
    }
  }
  