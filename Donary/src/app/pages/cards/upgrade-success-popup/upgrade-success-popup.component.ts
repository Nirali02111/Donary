import { Component, OnInit } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: "app-upgrade-success-popup",
  templateUrl: "./upgrade-success-popup.component.html",
  standalone: false,
  styleUrls: ["./upgrade-success-popup.component.scss"],
})
export class UpgradeSuccessPopupComponent implements OnInit {
  constructor(public activeModal: NgbActiveModal) {}

  ngOnInit() {}

  cancel() {
    this.activeModal.dismiss();
  }
}
