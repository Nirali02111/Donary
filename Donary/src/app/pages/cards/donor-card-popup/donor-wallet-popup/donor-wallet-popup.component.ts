import { Component, Input, OnInit } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
declare var $: any;
@Component({
  selector: "app-donor-wallet-popup",
  templateUrl: "./donor-wallet-popup.component.html",
  standalone: false,
  styleUrls: ["./donor-wallet-popup.component.scss"],
})
export class DonorWalletPopupComponent implements OnInit {
  isloading: boolean;
  gridData: Array<any>;
  gridFilterData: Array<any>;
  @Input() set WalletDetails(data: any) {
    if (data) {
      if (data) {
        for (var i = 0; i < data.length; i++) {
          var expiryfirstSplit = data[i].exp.slice(0, 2);
          var expirysecondSplit = data[i].exp.slice(2, 4);
          data[i].exp = expiryfirstSplit + "/" + expirysecondSplit;
        }
      }
      this.gridData = data;
      this.gridFilterData = this.gridData;
      this.isloading = false;
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
    //this.isloading=true;
  }

  closePopup() {
    this.activeModal.dismiss();
  }
}
