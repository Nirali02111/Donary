import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { WindowRef } from "../models/Platform";

@Injectable({
  providedIn: "root",
})
export class LinkScriptService {
  private loaded!: Promise<void>;
  protected _windowRef: WindowRef;
  constructor() {
    this._windowRef = new WindowRef();
  }
  public loadLink(): Promise<void> {
    const window = this._windowRef.getNativeWindow() as any;
    if (window.JewishDate) {
      return Promise.resolve();
    }
    const key = environment.jewishDateUrl;
    if (!this.loaded) {
      this.loaded = new Promise<void>((resolve, reject) => {
        const script: any = document.createElement("script");
        script.type = "text/javascript";
        script.src = key;
        script.onerror = (e: any) => reject(e);
        if (script.readyState) {
          script.onreadystatechange = () => {
            if (
              script.readyState === "loaded" ||
              script.readyState === "complete"
            ) {
              script.onreadystatechange = null;
              resolve();
            }
          };
        } else {
          script.onload = () => {
            resolve();
          };
        }
        document.getElementsByTagName("body")[0].appendChild(script);
      });
    }

    return this.loaded;
  }
}
