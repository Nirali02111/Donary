import { Component, Input, OnInit } from "@angular/core";
import { environment } from "./../../../../environments/environment";
import { DomSanitizer } from "@angular/platform-browser";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
declare var $: any;
@Component({
  selector: "app-map-view-card-popup",
  templateUrl: "./map-view-card-popup.component.html",
  styleUrls: ["./map-view-card-popup.component.scss"],
  standalone: false,
})
export class MapViewCardPopupComponent implements OnInit {
  latitude: string;
  longitude: string;
  iFrameUrl: any;
  constructor(
    public activeModal: NgbActiveModal,
    public sanitizer: DomSanitizer
  ) {}

  @Input() set MapViewCardData(LocationValue: any) {
    if (LocationValue) {
      this.latitude = LocationValue.latitude + ",";
      this.longitude = LocationValue.longitude;
      this.iFrameUrl = `https://www.google.com/maps/embed/v1/place?key=${environment.GOOGLE_MAP_API_KEY}&q=`;
      this.iFrameUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
        `${this.iFrameUrl}${this.latitude}${this.longitude}`
      );
    }
  }

  ngOnInit() {
    $(document).ready(function () {
      let modalContent: any = $(".modal");
      modalContent.draggable({
        handle:
          ".cards_secton,.modal__custom_header,.donor_information,.footer-drag",
        cursor: "grab",
        cancel: ".donor_name,.sort_num",
      });
    });
  }

  closePopup() {
    this.activeModal.dismiss();
  }
}
