import { Component, OnInit } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { NotificationService } from "src/app/commons/notification.service";
import { CommonAPIMethodService } from "src/app/services/common-api-method.service";
import { PledgeTransactionService } from "src/app/services/pledge-transaction.service";

@Component({
  selector: "app-import-schedule",
  templateUrl: "./import-schedule.component.html",
  standalone: false,
  styleUrls: ["./import-schedule.component.scss"],
})
export class ImportScheduleComponent implements OnInit {
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
}
