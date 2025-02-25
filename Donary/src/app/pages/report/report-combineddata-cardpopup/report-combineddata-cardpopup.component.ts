import { Component, OnInit } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: "app-report-combineddata-cardpopup",
  templateUrl: "./report-combineddata-cardpopup.component.html",
  styleUrls: ["./report-combineddata-cardpopup.component.scss"],
  standalone: false,
})
export class ReportCombineddataCardpopupComponent implements OnInit {
  constructor(public activeModal: NgbActiveModal) {}

  ngOnInit() {}
  closePopup() {
    this.activeModal.dismiss();
  }
}
