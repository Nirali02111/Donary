import { BreakpointObserver } from "@angular/cdk/layout";
import {
  Directive,
  OnDestroy,
  TemplateRef,
  ViewContainerRef,
} from "@angular/core";
import { distinctUntilChanged, pluck } from "rxjs/operators";

@Directive({
  selector: "[appIsMobile]",
  standalone: false,
})
export class IsMobileDirective implements OnDestroy {
  constructor(
    private templateReference: TemplateRef<any>,
    private viewContainerRef: ViewContainerRef,
    private breakpointObserver: BreakpointObserver
  ) {
    this.breakpointObserver
      .observe(["(max-width: 767px)"])
      .pipe(pluck("matches"), distinctUntilChanged())
      .subscribe(this.showHideHost);
  }

  private showHideHost = (matches: boolean) => {
    matches
      ? this.viewContainerRef.createEmbeddedView(this.templateReference)
      : this.viewContainerRef.clear();
  };

  ngOnDestroy(): void {
    this.breakpointObserver.ngOnDestroy();
  }
}
