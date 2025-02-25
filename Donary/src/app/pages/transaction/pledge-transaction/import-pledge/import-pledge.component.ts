import { Component, OnInit } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { NotificationService } from "../../../../commons/notification.service";
import { PledgeTransactionService } from "../../../../services/pledge-transaction.service";
import { CommonMethodService } from "../../../../commons/common-methods.service";
import { PageRouteVariable } from "../../../../commons/page-route-variable";
import { CommonAPIMethodService } from "../../../../services/common-api-method.service";

@Component({
  selector: "app-import-pledge",
  templateUrl: "./import-pledge.component.html",
  styleUrls: ["./import-pledge.component.scss"],
  standalone: false,
})
export class ImportPledgeComponent implements OnInit {
  uploadedFileName: string = "Choose file";
  uploadedFile: any;
  isloading: boolean;

  constructor(
    private activeModal: NgbActiveModal,
    private notificationService: NotificationService,
    private pledgeTransactionService: PledgeTransactionService,
    private commonMethodService: CommonMethodService,
    private commonAPIMethodService: CommonAPIMethodService
  ) {}

  ngOnInit() {}

  onFileChange(event) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.uploadedFileName = file.name;
      this.uploadedFile = file;
    }
  }

  uploadFile() {
    const formData = new FormData();
    formData.append("file", this.uploadedFile);
  }

  closePopup() {
    this.activeModal.dismiss();
  }

  downloadSampleFile() {
    // PledgeTrans = 1
    this.commonAPIMethodService.downloadSampleFile(1).subscribe(
      (res: any) => {
        this.commonMethodService.downloadFile(
          res,
          PageRouteVariable.PledgeTransSampleFileName
        );
      },
      (error) => {
        this.notificationService.showError(
          "Error while downloading Sample File",
          "Error!"
        );
      }
    );
  }
}
