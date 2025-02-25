import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { Subject } from "rxjs";
declare var $: any;
@Component({
  selector: "app-donor-save-email",
  templateUrl: "./donor-save-email.component.html",
  standalone: false,
  styleUrls: ["./donor-save-email.component.scss"],
})
export class DonorSaveEmailComponent implements OnInit {
  isloading: boolean = true;
  accountEmailID: number;
  accountID: number;
  emailLabel: string;
  emailAddress: string;
  isEdit: boolean = false;

  protected ngUnsubscribe: Subject<void> = new Subject<void>();
  @Output() emtOutputSaveDonorEmail: EventEmitter<any> = new EventEmitter();

  @Input() set EditDonorEmail(emaildata: any) {
    this.isloading = true;
    if (emaildata) {
      this.accountEmailID = emaildata.emailID;
      this.accountID = emaildata.accountID;
      this.emailLabel = emaildata.emailLabel;
      this.emailAddress = emaildata.emailAddress;
      this.isloading = false;
      this.isEdit = true;
    }
    this.isloading = false;
  }
  constructor(public activeModal: NgbActiveModal) {}

  ngOnInit() {
    $(document).ready(function () {
      let modalContent: any = $(".modal");
      modalContent.draggable({
        handle: ".modal-header",
      });
    });
  }
  ngOnDestroy() {
    // This aborts all HTTP requests.
    this.ngUnsubscribe.next();
    // This completes the subject properlly.
    this.ngUnsubscribe.complete();
  }
  UpsertDonorEmail() {
    var objdonoremail: any;
    if (this.isEdit == false) {
      objdonoremail = {
        accountID: this.accountID,
        emailLabel: this.emailLabel,
        emailAddress: this.emailAddress,
        accountEmailID: 0,
      };
    } else {
      objdonoremail = {
        accountID: this.accountID,
        accountEmailID: this.accountEmailID,
        emailLabel: this.emailLabel,
        emailAddress: this.emailAddress,
      };
    }
    this.emtOutputSaveDonorEmail.emit(objdonoremail);
    this.activeModal.dismiss();
  }

  closePopup() {
    this.activeModal.dismiss();
  }
}
