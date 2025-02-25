import { NgModule, Provider } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AddressAutocompleteDirective } from "./address-autocomplete.directive";

import { GoogleMapService } from "src/app/services/google-map.service.service";
import { DocumentRef, WindowRef } from "src/app/models/Platform";
import { FilterDataPipe } from "./filter-data.pipe";

import { Directive, HostBinding, Input } from "@angular/core";
import { HoverTooltipDirective } from "./hover-tooltip.directive";
import { DataHoverDirective } from "./data-hover.directive";
import { IsMobileDirective } from "./is-mobile.directive";
import { IsWebDirective } from "./is-web.directive";
import { ClickOutsideDirective } from "./click-outside.directive";
import { JoinAndUpperCasePipe } from "../../text-transform.pipe";

export const BROWSER_GLOBALS_PROVIDERS: Provider[] = [WindowRef, DocumentRef];

@NgModule({
  declarations: [
    AddressAutocompleteDirective,
    FilterDataPipe,
    JoinAndUpperCasePipe,
    HoverTooltipDirective,
    DataHoverDirective,
    IsMobileDirective,
    IsWebDirective,
    ClickOutsideDirective,
  ],
  imports: [CommonModule],
  exports: [
    AddressAutocompleteDirective,
    FilterDataPipe,
    JoinAndUpperCasePipe,
    HoverTooltipDirective,
    DataHoverDirective,
    IsMobileDirective,
    IsWebDirective,
    ClickOutsideDirective,
  ],
  providers: [
    BROWSER_GLOBALS_PROVIDERS,
    GoogleMapService,
    FilterDataPipe,
    JoinAndUpperCasePipe,
  ],
})
export class DoanryDirective {}
