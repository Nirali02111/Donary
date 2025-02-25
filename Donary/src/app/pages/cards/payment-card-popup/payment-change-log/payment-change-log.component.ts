import { Component, Input, OnInit } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
declare var $: any;
@Component({
  selector: "app-payment-change-log",
  templateUrl: "./payment-change-log.component.html",
  styleUrls: ["./payment-change-log.component.scss"],
  standalone: false,
})
export class PaymentChangeLogComponent implements OnInit {
  changeLog: string;
  isloading: boolean;
  @Input() set ChangeLogData(data: any) {
    if (data) {
      var loglist = data.split(",");
      this.changeLog = loglist;
    }
    this.isloading = false;
  }

  constructor(public activeModal: NgbActiveModal) {}

  ngOnInit() {
    $(document).ready(function () {
      let modalContent: any = $(".modal");
      modalContent.draggable({
        handle: ".modal-header",
      });
    });
    this.isloading = true;
  }

  closePopup() {
    this.activeModal.dismiss();
  }
}
