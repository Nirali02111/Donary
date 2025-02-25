import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class TotalPanelService {

    version = 'v1/';
    TotalPanel_MAIN_URL = 'TotalPanel';        
   TotalPanel_GET_TOTAL_URL = `${this.version}${this.TotalPanel_MAIN_URL}/GetTotals`;    
   

    constructor(private http: HttpClient) { }       

    getTotals(formdata: any): Observable<any> {
        return this.http.post(this.TotalPanel_GET_TOTAL_URL,formdata ).pipe(response => {
          return response;
        });
      }
      

}