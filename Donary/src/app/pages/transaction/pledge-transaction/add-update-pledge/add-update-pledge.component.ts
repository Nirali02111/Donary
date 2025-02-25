import { Component, OnDestroy, OnInit } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { Subject } from "rxjs";
import { CommonMethodService } from "../../../../commons/common-methods.service";
import { LocalstoragedataService } from "../../../../commons/local-storage-data.service";
import { NotificationService } from "../../../../commons/notification.service";

@Component({
  selector: "app-add-update-pledge",
  templateUrl: "./add-update-pledge.component.html",
  standalone: false,
  styleUrls: ["./add-update-pledge.component.scss"],
})
export class AddUpdatePledgeComponent implements OnInit, OnDestroy {
  protected ngUnsubscribe: Subject<void> = new Subject<void>();

  isloading: boolean;

  constructor(
    public activeModal: NgbActiveModal,
    public commonMethodService: CommonMethodService,
    public localstoragedataService: LocalstoragedataService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.commonMethodService.resetCommonDropDownList();
    this.bindData();
  }

  // if route change then unsubscribe all http request of current page using unsubscribe method
  ngOnDestroy() {
    // This aborts all HTTP requests.
    this.ngUnsubscribe.next();
    // This completes the subject properlly.
    this.ngUnsubscribe.complete();
  }

  bindData() {
    this.commonMethodService.bindCommonFieldDropDowns(
      this.ngUnsubscribe,
      false,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      false,
      false,
      false,
      false,
      true
    );
  }

  onItemSelect(item: any) {}
  onSelectAll(items: any) {}
  OnItemDeSelect(items: any) {}
  onDeSelectAll(items: any) {}

  closePopup() {
    this.activeModal.dismiss();
  }
}
