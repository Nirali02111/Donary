import { Component, Input, OnInit } from "@angular/core";
import { NgbActiveModal, NgbModalOptions } from "@ng-bootstrap/ng-bootstrap";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { NotificationService } from "src/app/commons/notification.service";
import { DonorService } from "src/app/services/donor.service";
import Swal from "sweetalert2";
import { DonorSavePhoneComponent } from "./donor-save-phone/donor-save-phone.component";
declare var $: any;
@Component({
  selector: "app-donor-phone",
  templateUrl: "./donor-phone.component.html",
  styleUrls: ["./donor-phone.component.scss"],
  standalone: false,
})
export class DonorPhoneComponent implements OnInit {
  gridData: Array<any>;
  gridFilterData: Array<any>;
  modalOptions: NgbModalOptions;
  objDonorPhoneSave: any;
  accountId: Int32Array;
  @Input() set DonorPhoneListData(PhoneListData: any) {
    if (PhoneListData) {
      this.accountId = PhoneListData.accountId;
      this.setValue(PhoneListData.list);
    }
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
    //this.gridData = null;
  }
  setValue(PhoneListData: any) {
    this.gridData = PhoneListData;
    this.gridFilterData = this.gridData;
    this.isloading = false;
  }
  SaveDonorPhoneData() {
    this.isloading = false;
    var objSaveDonorPhoneData: any = {};
    if (this.objDonorPhoneSave) {
      objSaveDonorPhoneData = {
        eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
        loginUserId: this.localstoragedataService.getLoginUserId(),
        accountPhoneID: this.objDonorPhoneSave.accountPhoneID,
        accountID: this.accountId,
        phoneLabel: this.objDonorPhoneSave.phoneLabel,
        phoneNumber: this.objDonorPhoneSave.phoneNumber,
      };
    }

    this.donorService.SaveDonorPhone(objSaveDonorPhoneData).subscribe(
      (res: any) => {
        // hide loader
        this.isloading = false;
        if (res) {
          this.GetPhoneList();
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

  addDonorPhonePopup() {
    this.isloading = false;
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup",
    };
    const modalRef = this.commonMethodService.openPopup(
      DonorSavePhoneComponent,
      this.modalOptions
    );
    modalRef.componentInstance.EditDonorPhone = null;
    modalRef.componentInstance.emtOutputSaveDonorPhone.subscribe(
      (objResponse) => {
        this.objDonorPhoneSave = objResponse;
        this.SaveDonorPhoneData();
      }
    );
  }

  closePopup() {
    this.activeModal.dismiss();
  }

  editDonorPhone(phoneID) {
    this.isloading = false;
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup",
    };
    const modalRef = this.commonMethodService.openPopup(
      DonorSavePhoneComponent,
      this.modalOptions
    );
    var eventGuId = this.localstoragedataService.getLoginUserEventGuId();
    var loginUserId = this.localstoragedataService.getLoginUserId();
    this.donorService
      .getPhoneByAccountPhoneId(eventGuId, phoneID, loginUserId)
      .subscribe((res: any) => {
        // hide loader
        this.isloading = false;
        modalRef.componentInstance.EditDonorPhone = res;
      });
    modalRef.componentInstance.emtOutputSaveDonorPhone.subscribe(
      (objResponse) => {
        this.objDonorPhoneSave = objResponse;
        this.SaveDonorPhoneData();
      }
    );
  }

  deleteDonorPhone(phoneID) {
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
          .deleteDonorPhone(eventGuId, phoneID, loginUserId)
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
              this.GetPhoneList();
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
  GetPhoneList() {
    this.isloading = true;
    var eventGuId = this.localstoragedataService.getLoginUserEventGuId();
    this.donorService
      .getDonorPhoneList(eventGuId, this.accountId)
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
