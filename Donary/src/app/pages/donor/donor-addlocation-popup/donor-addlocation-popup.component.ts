import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { CommonMethodService } from "src/app/commons/common-methods.service";
declare var $: any;
@Component({
  selector: "app-donor-addlocation-popup",
  templateUrl: "./donor-addlocation-popup.component.html",
  styleUrls: ["./donor-addlocation-popup.component.scss"],
  standalone: false,
})
export class DonorAddlocationPopupComponent implements OnInit {
  title: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;

  @Output() emtOutputAddLocation: EventEmitter<any> = new EventEmitter();

  constructor(
    public activeModal: NgbActiveModal,
    public commonMethodService: CommonMethodService
  ) {}

  ngOnInit() {
    $(document).ready(function () {
      let modalContent: any = $(".modal");
      modalContent.draggable({
        handle: ".modal__custom_header",
        cursor: " grab",
      });
    });
    this.commonMethodService.getStatesList();
  }

  closePopup() {
    this.activeModal.dismiss();
  }

  AddLocation() {
    var objdonorlocation: any;

    objdonorlocation = {
      title: this.title,
      address: this.streetAddress,
      city: this.city,
      state: this.state,
      zip: this.zipCode,
    };
    this.emtOutputAddLocation.emit(objdonorlocation);
    this.activeModal.dismiss();
  }
}
