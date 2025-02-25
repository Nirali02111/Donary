import { Injectable } from "@angular/core";
@Injectable()
export class WindowRef {
  getNativeWindow(): any {
    return window;
  }
}

@Injectable()
export class DocumentRef {
  getNativeDocument(): any {
    return document;
  }
}
