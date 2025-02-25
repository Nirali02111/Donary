import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import * as _ from "lodash";

export interface SaveTag {
  EventGuId: string;
  MacAddress: string;
  TagId: number;
  TagName: string;
  RecordType: number;
  CreatedBy: number;
}

export interface DeleteTag {
  EventGuId: string;
  MacAddress: string;
  TagId: number;
  DeletedBy: number;
}

export interface TagObj {
  tagId: number;
  tagName: string;
  tagRecordType: number;
  tagColor?: string;
  statusId:number;//added new
  tagsDropdownMenu:boolean;
}

export interface TagListObj {
  tag: TagObj;
  value: string;
  colorId?: number;
}

@Injectable({
  providedIn: "root",
})
export class TagService {
  version = "v1/";
  MAIN_URL = "Tag";

  GET_TAG_URL = `${this.version}${this.MAIN_URL}/Get`;
  GET_ALL_TAGS_URL = `${this.version}${this.MAIN_URL}/GetAll`;

  SAVE_TAG_URL = `${this.version}${this.MAIN_URL}/Save`;
  SAVEBULK_TAG_URL = `${this.version}${this.MAIN_URL}/SaveTagsBulk`;
  DELETE_TAG_URL = `${this.version}${this.MAIN_URL}/Delete`;
  constructor(private http: HttpClient) {}

  formatTagName(tagName: string) {
    return _.trim(tagName, " :");
  }

  getTag(
    tagId: string,
    eventGuId: string,
    macAddress: string
  ): Observable<any> {
    return this.http
      .get(this.GET_TAG_URL, {
        params: {
          tagId,
          eventGuId,
          macAddress,
        },
      })
      .pipe((response) => {
        return response;
      });
  }

  getAllTag(eventGuId: string): Observable<any> {
    return this.http
      .get(this.GET_ALL_TAGS_URL, {
        params: {
          eventGuId,
        },
      })
      .pipe((response) => {
        return response;
      });
  }

  saveTAg(formData: SaveTag): Observable<any> {
    return this.http.post(this.SAVE_TAG_URL, formData).pipe((response) => {
      return response;
    });
  }

  saveBulkTag(formData: any): Observable<any> {
    return this.http.post(this.SAVEBULK_TAG_URL, formData).pipe((response) => {
      return response;
    });
  }

  deleteTag(formData: DeleteTag) {
    return this.http
      .request("delete", this.DELETE_TAG_URL, { body: formData })
      .pipe((response) => {
        return response;
      });
  }
}
