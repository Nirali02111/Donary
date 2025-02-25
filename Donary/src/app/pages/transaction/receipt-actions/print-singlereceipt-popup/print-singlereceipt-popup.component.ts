import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import * as _ from "lodash";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";

import { DomSanitizer } from "@angular/platform-browser";
declare var $: any;

interface SelectedDonorObj {
  accountId: number;
  paymentId?: number;
  receiptNum?: number;
  defaultAddress?: string;
  cityStateZip?: string;
  isPrint?: boolean;
}
@Component({
  selector: "app-print-singlereceipt-popup",
  templateUrl: "./print-singlereceipt-popup.component.html",
  styleUrls: ["./print-singlereceipt-popup.component.scss"],
  standalone: false,
})
export class PrintSingleReceiptPopupComponent implements OnInit {
  @Output() emtEditPledge: EventEmitter<any> = new EventEmitter();
  fileName: any;
  fileType: string;
  showContent = false;
  isloading = true;

  @Input() set fileDetails(data: any) {
    if (data) {
      this.fileName = data.filename;
      this.fileType = data.filetype;
      this.SafeUrl();
      this.showContent = true;
      this.isloading = false;
    }
  }

  constructor(
    public activeModal: NgbActiveModal,
    protected _sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    $(document).ready(function () {
      let modalContent: any = $(".modal");
      modalContent.draggable({
        handle: ".modal-header-custom",
      });
    });
  }

  closePopup() {
    this.activeModal.dismiss();
    this.emtEditPledge.emit(true);
  }

  SafeUrl() {
    this.fileName = this._sanitizer.bypassSecurityTrustResourceUrl(
      this.fileName
    );
  }
}
