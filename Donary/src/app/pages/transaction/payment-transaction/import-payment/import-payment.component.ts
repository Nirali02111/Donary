import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-import-payment",
  templateUrl: "./import-payment.component.html",
  standalone: false,
  styleUrls: ["./import-payment.component.scss"],
})
export class ImportPaymentComponent implements OnInit {
  uploadedFileName: string = "Choose file";
  uploadedFile: any;
  isloading: boolean;

  constructor() {}

  ngOnInit() {}

  onFileChange(event) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.uploadedFileName = file.name;
      this.uploadedFile = file;
    }
  }
  uploadFile() {}
  closePopup() {}
  downloadSampleFile() {}
}
