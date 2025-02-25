import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class EntityPermissionService {

    version = 'v1/';
    ENTITYPERMISSION_MAIN_URL = 'EntityPermission';        
    ENTITYPERMISSION_SAVE_URL = `${this.version}${this.ENTITYPERMISSION_MAIN_URL}/SaveEntityPermission`;
    ENTITYPERMISSION_GET_URL = `${this.version}${this.ENTITYPERMISSION_MAIN_URL}/GetEntityPermissions`;      
   

    constructor(private http: HttpClient) { }       

    saveEntityPermission(formdata: any): Observable<any> {
        return this.http.post(this.ENTITYPERMISSION_SAVE_URL,formdata ).pipe(response => {
          return response;
        });
      }

    getEntityPermission(userId:number): Observable<any> {
        return this.http.get(this.ENTITYPERMISSION_GET_URL + '?userId=' + userId).pipe(response => {
          return response;
        });
      }
      

}