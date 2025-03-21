import { BreakpointObserver } from "@angular/cdk/layout";
import {
  Directive,
  OnDestroy,
  TemplateRef,
  ViewContainerRef,
} from "@angular/core";
import { distinctUntilChanged, pluck } from "rxjs/operators";

@Directive({
  selector: "[appIsWeb]",
  standalone: false,
})
export class IsWebDirective implements OnDestroy {
  constructor(
    private templateReference: TemplateRef<any>,
    private viewContainerRef: ViewContainerRef,
    private breakpointObserver: BreakpointObserver
  ) {
    this.breakpointObserver
      .observe(["(min-width: 768px)"])
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
