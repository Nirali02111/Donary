import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { DonorService } from "./../../../services/donor.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import Swal from "sweetalert2";
import { CommonMethodService } from "src/app/commons/common-methods.service";
// import * as $ from "jquery";
declare var $: any;
@Component({
  selector: "app-import-token",
  templateUrl: "./import-token.component.html",
  styleUrls: ["./import-token.component.scss"],
  standalone: false,
})
export class ImportTokenComponent implements OnInit {
  changeText: string = "";
  file: File;
  @Output() emtMergeDonorModel: EventEmitter<any> = new EventEmitter();
  @Output() isloading: EventEmitter<any> = new EventEmitter();

  fileName: string = "";

  constructor(
    public activeModal: NgbActiveModal,
    private donorService: DonorService,
    private localstoragedataService: LocalstoragedataService,
    public commonMethodService: CommonMethodService
  ) {}

  ngOnInit() {}

  resetTokenFile() {
    $("#doc_file").val("");
    $("#TokenNotReadyToUpload").show();
    $("#tokenReadyToUpload").hide();
    this.changeText = "";
    this.file = null;
    this.activeModal.dismiss();
  }

  incomingTokenFile(event) {
    this.file = event.target.files[0];
    this.tokenReadyToUploadChangeText();
  }

  tokenReadyToUploadChangeText() {
    if (this.file === undefined || this.file == null) {
      $("#TokenNotReadyToUpload").show();
      $("#tokenReadyToUpload").hide();
      this.fileName = "";
    } else {
      $("#TokenNotReadyToUpload").hide();
      $("#tokenReadyToUpload").show();
      this.changeText = "is-active";
      this.fileName = this.file.name;
    }
  }

  downloadTokenTemplate(event) {
    this.donorService.downloadTokenTemplate().subscribe(
      (res: any) => {
        const blob = new Blob([res], { type: "application/octet-stream" });
        const url = window.URL.createObjectURL(blob);
        let filename = "Token_Template";
        var link = document.createElement("a");
        link.href = url;
        link.download = filename + ".xlsx";
        link.click();
      },
      (error) => {
        console.log(error);
        this.isloading.emit(false);
      }
    );
    event.preventDefault();
  }

  uploadTokenTemplate() {
    if (this.file !== undefined) {
      if (this.file != null) {
        this.isloading.emit(true);
        this.activeModal.dismiss();
        const fd = new FormData();
        fd.append("RequestId", "");
        fd.append("File", this.file);
        fd.append(
          "EventGuid",
          this.localstoragedataService.getLoginUserEventGuId()
        );
        fd.append("CreatedBy", this.localstoragedataService.getLoginUserId());
        this.donorService.tokenImport(fd).subscribe(
          (res) => {
            $("#doc_file").val("");
            this.file = null;
            this.resetTokenFile();
            this.isloading.emit(false);
            $("#searchText").val("");
            Swal.fire({
              title: "",
              text: res + " see import updates in users email",
              icon: "success",
              confirmButtonText: this.commonMethodService.getTranslate(
                "WARNING_SWAL.BUTTON.CONFIRM.OK"
              ),
              customClass: {
                confirmButton: "btn_ok",
              },
            }).then((result) => {
              /* Read more about isConfirmed, isDenied below */
              if (result.isConfirmed) {
                this.emtMergeDonorModel.emit(true);
              } else if (result.isDenied) {
              }
            });
          },
          (err) => {
            this.isloading.emit(false);
            Swal.fire({
              title: this.commonMethodService.getTranslate(
                "WARNING_SWAL.SOMETHING_WENT_WRONG"
              ),
              text: err.error,
              icon: "error",
              confirmButtonText: this.commonMethodService.getTranslate(
                "WARNING_SWAL.BUTTON.CONFIRM.OK"
              ),
              customClass: {
                confirmButton: "btn_ok",
              },
            });
          }
        );
      } else {
        this.isloading.emit(false);
        Swal.fire({
          title: this.commonMethodService.getTranslate(
            "WARNING_SWAL.SOMETHING_WENT_WRONG"
          ),
          text: "No file chosen",
          icon: "error",
          confirmButtonText: this.commonMethodService.getTranslate(
            "WARNING_SWAL.BUTTON.CONFIRM.OK"
          ),
          customClass: {
            confirmButton: "btn_ok",
          },
        });
      }
    } else {
      this.isloading.emit(false);
      Swal.fire({
        title: this.commonMethodService.getTranslate(
          "WARNING_SWAL.SOMETHING_WENT_WRONG"
        ),
        text: "No file chosen",
        icon: "error",
        confirmButtonText: this.commonMethodService.getTranslate(
          "WARNING_SWAL.BUTTON.CONFIRM.OK"
        ),
        customClass: {
          confirmButton: "btn_ok",
        },
      });
    }
  }
}
