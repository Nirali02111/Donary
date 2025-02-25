import { Component, Input, OnInit } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
declare var $: any;
@Component({
  selector: "app-pdfviewer-popup",
  templateUrl: "./pdfviewer-popup.component.html",
  styleUrls: ["./pdfviewer-popup.component.scss"],
  standalone: false,
})
export class PdfviewerPopupComponent implements OnInit {
  fileName: any;
  showContent = false;
  isloading = true;
  title: string;

  @Input() set Title(data: any) {
    if (data) {
      this.title = data;
    }
  }
  @Input() set filePath(data: any) {
    if (data) {
      this.isloading = true;
      this.fileName = data;
      this.SafeUrl();
      this.showContent = true;
      setTimeout(() => {
        this.isloading = false;
      }, 1000);
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
        handle: ".modal__custom_header",
      });
    });
  }

  closePopup() {
    this.activeModal.dismiss();
  }

  SafeUrl() {
    this.fileName = this._sanitizer.bypassSecurityTrustResourceUrl(
      this.fileName
    );
  }
}
