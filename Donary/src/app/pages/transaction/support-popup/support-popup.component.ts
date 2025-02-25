import { Component, OnInit } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
declare var $: any;
@Component({
  selector: "app-support-popup",
  templateUrl: "./support-popup.component.html",
  standalone: false,
  styleUrls: ["./support-popup.component.scss"],
})
export class SupportPopupComponent implements OnInit {
  isloading: boolean;
  constructor(public activeModal: NgbActiveModal) {}

  ngOnInit() {
    $(document).ready(function () {
      let modalContent: any = $(".modal");
      modalContent.draggable({
        handle: ".modal-header",
      });
    });
  }

  closePopup() {
    this.activeModal.dismiss();
  }
}
