import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { Subject } from "rxjs";
declare var $: any;
@Component({
  selector: "app-donor-save-phone",
  templateUrl: "./donor-save-phone.component.html",
  styleUrls: ["./donor-save-phone.component.scss"],
  standalone: false,
})
export class DonorSavePhoneComponent implements OnInit {
  isloading: boolean = true;
  accountPhoneID: number;
  accountID: number;
  phoneLabel: string;
  phoneNumber: string;
  isEdit: boolean = false;

  protected ngUnsubscribe: Subject<void> = new Subject<void>();
  @Output() emtOutputSaveDonorPhone: EventEmitter<any> = new EventEmitter();

  @Input() set EditDonorPhone(phonedata: any) {
    this.isloading = true;
    if (phonedata) {
      this.accountPhoneID = phonedata.phoneID;
      this.accountID = phonedata.accountID;
      this.phoneLabel = phonedata.phoneLabel;
      this.phoneNumber = phonedata.phoneNumber;
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
  UpsertDonorPhone() {
    var objdonorphone: any;
    if (this.isEdit == false) {
      objdonorphone = {
        accountID: this.accountID,
        phoneLabel: this.phoneLabel,
        phoneNumber: this.phoneNumber,
      };
    } else {
      objdonorphone = {
        accountID: this.accountID,
        accountPhoneID: this.accountPhoneID,
        phoneLabel: this.phoneLabel,
        phoneNumber: this.phoneNumber,
      };
    }
    this.emtOutputSaveDonorPhone.emit(objdonorphone);
    this.activeModal.dismiss();
  }

  closePopup() {
    this.activeModal.dismiss();
  }
}
