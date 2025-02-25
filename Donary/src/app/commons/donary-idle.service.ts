import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import * as IdleJs from 'idle-js';
@Injectable({
  providedIn: 'root'
})
export class DonaryIdleService {
  private _idle$ = new Subject<boolean>();

  private _sleep$ = new Subject<boolean>();

  private _wakeUp$ = new Subject<boolean>();

  get idle$() {
    return this._idle$.asObservable();
  }

  get sleep$() {
    return this._sleep$.asObservable();
  }

  get wakeUp$() {
    return this._wakeUp$.asObservable();
  }
  private idleTime = 10000//for testing

  private jsObj: IdleJs;
  constructor() { 
    this.jsObj = new IdleJs({
      onIdle: () => {
        this._idle$.next(true);
      },
      onActive: () => {},
      onHide: () => {
        this._sleep$.next(true);
        this._wakeUp$.next(false);
      },
      onShow: () => {
        this._wakeUp$.next(true);
        this._sleep$.next(false);
      },
      idle: this.idleTime,
      keepTracking: true,
    });
  }
  startActivity() {
    this.jsObj.start();
  }
}
