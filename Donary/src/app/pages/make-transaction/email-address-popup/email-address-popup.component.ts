import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import {
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { CommonAPIMethodService } from "src/app/services/common-api-method.service";
import { DonorService } from "src/app/services/donor.service";
import Swal from "sweetalert2";
declare var $: any;
@Component({
  selector: "app-email-address-popup",
  templateUrl: "./email-address-popup.component.html",
  styleUrls: ["./email-address-popup.component.scss"],
  standalone: false,
})
export class EmailAddressPopupComponent implements OnInit {
  @Output() emtOutput: EventEmitter<any> = new EventEmitter();
  isEmailValid = true;
  isAdd: boolean = true;
  isDisabled: boolean = true;
  inputEmail: string;
  emailList = [];
  isLabelSelected: boolean = true;
  emailLabelArray: Array<any> = [];
  selectedLabelArray: Array<any> = [];
  accountId: number;
  form: UntypedFormGroup = new UntypedFormGroup({
    emailName: new UntypedFormControl("", [
      Validators.required,
      Validators.email,
    ]),
  });

  isEmailAddressPopupClicked: boolean = false;

  constructor(
    public activeModal: NgbActiveModal,
    public commonMethodService: CommonMethodService,
    private localstoragedataService: LocalstoragedataService,
    private commonAPIMethodService: CommonAPIMethodService,
    private donorService: DonorService
  ) {}
  @Input() set DonorDetails(donorDetailsValue: any) {
    if (donorDetailsValue) {
      this.accountId = donorDetailsValue.accountId;
    }
  }
  ngOnInit() {
    $(document).ready(function () {
      let modalContent: any = $(".modal");
      modalContent.draggable({
        handle: ".modal-header-custom",
      });
    });
    this.getAllEmailLabels();
  }
  get emailNameCtrl() {
    return this.form.get("emailName");
  }
  closePopup() {
    this.activeModal.dismiss();
  }

  getAllEmailLabels() {
    const eventGuId = this.localstoragedataService.getLoginUserEventGuId();
    this.commonAPIMethodService
      .getLabelText(eventGuId, "Email")
      .subscribe((res: any) => {
        if (res.length > 0) {
          this.emailLabelArray = res;
        }
      });
  }
  onLabelSelect(event: any) {
    if (event.id != null) {
      this.isLabelSelected = true;
      return;
    }
    this.isLabelSelected = false;
  }
  onLabelDeSelect(event: any) {
    if (event.id == null) {
      this.selectedLabelArray = [];
      return;
    }
  }

  addEmail() {
    if (this.selectedLabelArray.length == 0) {
      this.isLabelSelected = false;
      return;
    }
    this.isEmailAddressPopupClicked = true;
    let objDonorEmail = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      accountEmailID: null,
      accountID: this.accountId,
      emailLabel:
        this.selectedLabelArray &&
        this.selectedLabelArray.map((x) => x.itemName).toString(),
      emailAddress: this.emailNameCtrl.value,
      loginUserId: this.localstoragedataService.getLoginUserId(),
    };

    this.donorService.SaveDonorEmail(objDonorEmail).subscribe((res: any) => {
      if (res) {
        Swal.fire({
          title: this.commonMethodService.getTranslate(
            "WARNING_SWAL.SUCCESS_TITLE"
          ),
          text: "Email Save Successfully",
          icon: "success",
          confirmButtonText: this.commonMethodService.getTranslate(
            "WARNING_SWAL.BUTTON.CONFIRM.OK"
          ),
          customClass: {
            confirmButton: "btn_ok",
          },
        });
        this.isEmailAddressPopupClicked = false;
        this.emtOutput.emit(objDonorEmail);
        this.commonMethodService.sendPaymentTrans(true);
        this.commonMethodService.sendPledgeTrans(true);
        this.closePopup();
      }
    });
  }
}
