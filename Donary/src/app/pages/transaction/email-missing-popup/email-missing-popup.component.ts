import { Component, OnInit } from "@angular/core";
import { NgbActiveModal, NgbModalOptions } from "@ng-bootstrap/ng-bootstrap";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { AdvancereceiptActionPopupComponent } from "../advancereceipt-action-popup/advancereceipt-action-popup.component";
declare var $: any;
@Component({
  selector: "app-email-missing-popup",
  templateUrl: "./email-missing-popup.component.html",
  styleUrls: ["./email-missing-popup.component.scss"],
  standalone: false,
})
export class EmailMissingPopupComponent implements OnInit {
  isloading: boolean = false;
  modalOptions: NgbModalOptions;
  constructor(
    public activeModal: NgbActiveModal,
    public commonMethodService: CommonMethodService
  ) {}

  ngOnInit() {
    $(document).ready(function () {
      let modalContent: any = $(".modal");
      modalContent.draggable({
        handle: ".modal_custom",
      });
    });
  }
  closePopup() {
    this.activeModal.dismiss();
  }

  advanceReceiptPopup() {
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup advance_receipt",
    };
    const modalRef = this.commonMethodService.openPopup(
      AdvancereceiptActionPopupComponent,
      this.modalOptions
    );
  }

  sendMail() {
    this.isloading = true;
  }
  stopProccessing() {
    this.isloading = false;
  }
}
