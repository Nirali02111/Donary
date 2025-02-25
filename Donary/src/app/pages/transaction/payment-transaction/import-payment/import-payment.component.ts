import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-import-payment",
  templateUrl: "./import-payment.component.html",
  styleUrls: ["./import-payment.component.scss"],
  standalone: false,
})
export class ImportPaymentComponent implements OnInit {
  uploadedFileName: string = "Choose file";
  uploadedFile: any;
  isloading: boolean;

  constructor() {}

  ngOnInit() {
    //document.getElementById('input-uploadFile').focus();
  }

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
