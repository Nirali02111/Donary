import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import * as _ from 'lodash';

export interface AdvancedFieldObj{
  advancedFieldId: number;
  advancedFieldRecordType: number;
  fieldName: string;
  options: string;
  type: string;
}

@Injectable({
    providedIn: 'root'
})
export class AdvancedFieldService {

    version = 'v1/';
    ADVANCEDFIELD_MAIN_URL = 'AdvancedField';    
    GET_URL = `${this.version}${this.ADVANCEDFIELD_MAIN_URL}/Get`;   
    SAVE_URL = `${this.version}${this.ADVANCEDFIELD_MAIN_URL}/Save`;
    DELETE_URL = `${this.version}${this.ADVANCEDFIELD_MAIN_URL}/Delete`;    
    GETALL_URL = `${this.version}${this.ADVANCEDFIELD_MAIN_URL}/GetAll`;    
   
    constructor(private http: HttpClient) { }   
    
    formatFieldName(fieldname: string) {
      return _.trim(fieldname, ' :')
    }

    get(advancedFieldId:number,eventGuId:string,macAddress:string): Observable<any> {
        return this.http.get(this.GET_URL+ '?advancedFieldId=' + advancedFieldId + '&&eventGuId=' + eventGuId+ '&&macAddress=' + macAddress).pipe(response => {
          return response;
        });
      }

    getAll(eventGuId:string): Observable<any> {
        return this.http.get(this.GETALL_URL + '?eventGuId=' + eventGuId).pipe(response => {
          return response;
        });
      }

    save(formdata: any): Observable<any> {
        return this.http.post(this.SAVE_URL,formdata).pipe(response => {
          return response;
        });
      }

   delete(formdata: any): Observable<any> {
        return this.http.request('delete', this.DELETE_URL, { body: formdata }).pipe(response => {
          return response;
        });
      }  
}