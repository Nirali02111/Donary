import { Component, OnInit } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: "app-color-warning",
  templateUrl: "./color-warning.component.html",
  styleUrls: ["./color-warning.component.scss"],
  standalone: false,
})
export class ColorWarningComponent implements OnInit {
  constructor(private activeModal: NgbActiveModal) {}

  ngOnInit() {}

  uploadNewLogo() {
    this.activeModal.close({ uploadNew: true });
  }

  closeModal() {
    this.activeModal.close();
  }
}
