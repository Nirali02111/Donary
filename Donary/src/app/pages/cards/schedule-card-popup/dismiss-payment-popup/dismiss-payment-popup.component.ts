import { Component, OnInit } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
declare var $: any;
@Component({
  selector: "app-dismiss-payment-popup",
  templateUrl: "./dismiss-payment-popup.component.html",
  styleUrls: ["./dismiss-payment-popup.component.scss"],
  standalone: false,
})
export class DismissPaymentPopupComponent implements OnInit {
  constructor(public activeModal: NgbActiveModal) {}

  ngOnInit() {
    $(document).ready(function () {
      let modalContent: any = $(".modal");
      modalContent.draggable({
        handle: ".popup_header",
      });
    });
  }

  closePopup() {
    this.activeModal.dismiss();
  }
}
