import { ApplicationRef, ComponentFactoryResolver, EmbeddedViewRef, Injectable, Injector } from "@angular/core";

@Injectable()
export class TabulatorServiceService {
  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private injector: Injector,
    private appRef: ApplicationRef
  ) {}
  
  createComponent(component: any) {
    const factory = this.componentFactoryResolver.resolveComponentFactory(component);
    const componentRef = factory.create(this.injector);
    this.appRef.attachView(componentRef.hostView);
    const domElem = (componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
    return { componentRef, domElem };
  }
}
