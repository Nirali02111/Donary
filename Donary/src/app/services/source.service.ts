import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SourceService {

    version = 'v1/';
    SOURCE_MAIN_URL = 'Source';        
    Source_GET_LIST_URL = `${this.version}${this.SOURCE_MAIN_URL}/GetSources`; 
    Source_GET_CARD_URL = `${this.version}${this.SOURCE_MAIN_URL}/GetDeviceCard`; 
   

    constructor(private http: HttpClient) { }       

    getSourceList(formdata: any): Observable<any> {
        return this.http.post(this.Source_GET_LIST_URL,formdata ).pipe(response => {
          return response;
        });
      }
      

}