import { Component, Input, OnInit } from "@angular/core";
import { NgbActiveModal, NgbModalOptions } from "@ng-bootstrap/ng-bootstrap";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { NotificationService } from "src/app/commons/notification.service";
import { DonorService } from "src/app/services/donor.service";
import Swal from "sweetalert2";
import { DonorSaveEmailComponent } from "./donor-save-email/donor-save-email.component";
declare var $: any;
@Component({
  selector: "app-donor-email",
  templateUrl: "./donor-email.component.html",
  standalone: false,
  styleUrls: ["./donor-email.component.scss"],
})
export class DonorEmailComponent implements OnInit {
  gridData: Array<any>;
  gridFilterData: Array<any>;
  modalOptions: NgbModalOptions;
  objDonorEmailSave: any;
  accountId: Int32Array;
  @Input() set DonorEmailListData(EmailListData: any) {
    if (EmailListData) {
      this.accountId = EmailListData.accountId;
      this.setValue(EmailListData.list);
    }
    this.isloading = false;
  }
  isloading: boolean;
  constructor(
    public activeModal: NgbActiveModal,
    public commonMethodService: CommonMethodService,
    private localstoragedataService: LocalstoragedataService,
    private donorService: DonorService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    $(document).ready(function () {
      let modalContent: any = $(".modal");
      modalContent.draggable({
        handle: ".modal-header",
      });
    });
    this.isloading = true;
  }
  setValue(EmailListData: any) {
    this.gridData = EmailListData;
    this.gridFilterData = this.gridData;
    this.isloading = false;
  }

  SaveDonorEmailData() {
    this.isloading = false;
    var objSaveDonorEmailData: any = {};
    if (this.objDonorEmailSave) {
      objSaveDonorEmailData = {
        eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
        loginUserId: this.localstoragedataService.getLoginUserId(),
        accountEmailID: this.objDonorEmailSave.accountEmailID,
        accountID: this.accountId,
        emailLabel: this.objDonorEmailSave.emailLabel,
        emailAddress: this.objDonorEmailSave.emailAddress,
      };
    }

    this.donorService.SaveDonorEmail(objSaveDonorEmailData).subscribe(
      (res: any) => {
        // hide loader
        this.isloading = false;
        if (res) {
          this.GetEmailList();
          this.commonMethodService.sendUpdateDonorCard(true);
        }
      },
      (error) => {
        this.isloading = false;
        console.log(error);
        this.notificationService.showError(
          error.error,
          "Error while fetching data !!"
        );
      }
    );
  }

  addDonorEmailPopup() {
    this.isloading = false;
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup",
    };
    const modalRef = this.commonMethodService.openPopup(
      DonorSaveEmailComponent,
      this.modalOptions
    );
    modalRef.componentInstance.EditDonorEmail = null;
    modalRef.componentInstance.emtOutputSaveDonorEmail.subscribe(
      (objResponse) => {
        this.objDonorEmailSave = objResponse;
        this.SaveDonorEmailData();
      }
    );
  }

  closePopup() {
    this.activeModal.dismiss();
  }

  editDonorEmail(emailID) {
    this.isloading = false;
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup",
    };
    const modalRef = this.commonMethodService.openPopup(
      DonorSaveEmailComponent,
      this.modalOptions
    );
    var eventGuId = this.localstoragedataService.getLoginUserEventGuId();
    var loginUserId = this.localstoragedataService.getLoginUserId();
    this.donorService
      .getEmailByAccountEmailId(eventGuId, emailID, loginUserId)
      .subscribe((res: any) => {
        // hide loader
        this.isloading = false;
        modalRef.componentInstance.EditDonorEmail = res;
      });
    modalRef.componentInstance.emtOutputSaveDonorEmail.subscribe(
      (objResponse) => {
        this.objDonorEmailSave = objResponse;
        this.SaveDonorEmailData();
      }
    );
  }

  deleteDonorEmail(emailID) {
    Swal.fire({
      title: this.commonMethodService.getTranslate("WARNING_SWAL.TITLE"),
      text: "You will not be able to recover this record!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: this.commonMethodService.getTranslate(
        "WARNING_SWAL.BUTTON.CONFIRM.Yes_DELETE_IT"
      ),
      cancelButtonText: this.commonMethodService.getTranslate(
        "WARNING_SWAL.BUTTON.CANCEL.NO_KEEP_IT"
      ),
    }).then((result) => {
      if (result.value) {
        var eventGuId = this.localstoragedataService.getLoginUserEventGuId();
        var loginUserId = this.localstoragedataService.getLoginUserId();
        this.donorService
          .deleteDonorEmail(eventGuId, emailID, loginUserId)
          .subscribe((res: any) => {
            if (res) {
              Swal.fire({
                title: "Deleted!",
                text: "Your record has been deleted.",
                icon: "success",
                confirmButtonText: this.commonMethodService.getTranslate(
                  "WARNING_SWAL.BUTTON.CONFIRM.OK"
                ),
                customClass: {
                  confirmButton: "btn_ok",
                },
              });
              this.GetEmailList();
              this.commonMethodService.sendUpdateDonorCard(true);
            }
          });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: this.commonMethodService.getTranslate("CANCELLED"),
          text: "Your record is safe :)",
          icon: "error",
          confirmButtonText: this.commonMethodService.getTranslate(
            "WARNING_SWAL.BUTTON.CONFIRM.OK"
          ),
          customClass: {
            confirmButton: "btn_ok",
          },
        });
      }
    });
  }
  GetEmailList() {
    this.isloading = true;
    var eventGuId = this.localstoragedataService.getLoginUserEventGuId();
    this.donorService
      .getDonorEmailList(eventGuId, this.accountId)
      .subscribe((res: any) => {
        var obj: any = {};
        if (res != null) {
          obj.list = res;
        }
        this.isloading = false;
        this.gridFilterData = obj.list;
      });
  }
}
