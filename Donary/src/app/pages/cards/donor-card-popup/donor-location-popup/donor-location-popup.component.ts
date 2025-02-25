import { Component, Input, OnInit } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
declare var $: any;
@Component({
  selector: "app-donor-location-popup",
  templateUrl: "./donor-location-popup.component.html",
  styleUrls: ["./donor-location-popup.component.scss"],
  standalone: false,
})
export class DonorLocationPopupComponent implements OnInit {
  isloading: boolean;
  gridData: Array<any>;
  gridFilterData: Array<any>;
  @Input() set LocationDetails(data: any) {
    if (data) {
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
        cursor: " grab",
      });
    });
    //this.isloading=true;
  }

  closePopup() {
    this.activeModal.dismiss();
  }
}
