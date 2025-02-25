import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { CommonAPIMethodService } from "src/app/services/common-api-method.service";
import { DonorService } from "src/app/services/donor.service";
import Swal from "sweetalert2";
declare var $: any;
@Component({
  selector: "app-phone-number-popup",
  templateUrl: "./phone-number-popup.component.html",
  standalone: false,
  styleUrls: ["./phone-number-popup.component.scss"],
})
export class PhoneNumberPopupComponent implements OnInit {
  @Output() emtOutput: EventEmitter<any> = new EventEmitter();
  inputPhoneNumber: string;
  isPhoneValid = true;
  isDisabled: boolean = true;
  isAdd: boolean = true;
  phoneNumberList = [];
  phoneLabelArray: Array<any> = [];
  selectedLabelArray: Array<any> = [];
  isLabelSelected: boolean = true;
  accountId: number;
  countries: any;
  isPhoneNumberPopupClicked: boolean = false;
  selectedCountry: any =
    this.commonMethodService.getDefaultSelectedCountryCode();
  dailingCode: any = this.commonMethodService.getDefaultDailingCode();
  selectedFlag: any = this.commonMethodService.getDefaultSelectedFlag();
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
    this.getCountryCodes();
    this.getAllPhoneLabels();
  }

  getCountryCodes() {
    this.commonAPIMethodService
      .getCountryCodes(this.localstoragedataService.getLoginUserEventGuId())
      .subscribe((res) => {
        this.countries = res;
      });
  }
  flagClasses = {
    "1": "flag flag-usa",
    "2": "flag flag-canada",
    "3": "flag flag-bleguim",
    "4": "flag flag-uk",
    "5": "flag flag-israel",
  };

  getFlagClass(countryCode: string): string {
    return this.flagClasses[countryCode] || "";
  }
  onCountryChange(countryCodeID: any, dialingCode: any) {
    this.selectedCountry = countryCodeID;
    this.dailingCode = dialingCode;
    this.selectedFlag = this.getFlagClass(countryCodeID);
  }
  closePopup() {
    this.activeModal.dismiss();
  }
  ValidPhone(event) {
    let val = event.target.value;
    if (val != "") {
      let regex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
      if (val != "" && !regex.test(val)) {
        this.isPhoneValid = false;
        this.isDisabled = true;
        this.isAdd = true;
      } else {
        this.isPhoneValid = true;
        this.isDisabled = false;
        this.isAdd = false;
      }
    }
  }
  EnableAddButton(event) {
    if (event.target.value != "") {
      this.isAdd = false;
      this.isDisabled = false;
    } else {
      this.isAdd = true;
      this.isDisabled = true;
      this.isPhoneValid = true;
      if (this.phoneNumberList.length > 0) {
        this.isDisabled = false;
      }
    }
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
  getAllPhoneLabels() {
    const eventGuId = this.localstoragedataService.getLoginUserEventGuId();
    this.commonAPIMethodService
      .getLabelText(eventGuId, "Phone")
      .subscribe((res: any) => {
        if (res.length > 0) {
          this.phoneNumberList.forEach((element) => {
            res = res.filter(
              (x) => x.itemName.toLowerCase() != element.label.toLowerCase()
            );
          });
          this.phoneLabelArray = res;
        }
      });
  }

  addPhoneNumber() {
    if (this.selectedLabelArray.length == 0) {
      this.isLabelSelected = false;
      return;
    }
    this.isPhoneNumberPopupClicked = true;
    let objDonorPhone = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),

      accountID: this.accountId,
      phoneLabel:
        this.selectedLabelArray &&
        this.selectedLabelArray.map((x) => x.itemName).toString(),
      phoneNumber: this.inputPhoneNumber,
      loginUserId: this.localstoragedataService.getLoginUserId(),
      countryCodeID: this.selectedCountry,
    };
    this.donorService.SaveDonorPhone(objDonorPhone).subscribe((res: any) => {
      if (res) {
        Swal.fire({
          title: this.commonMethodService.getTranslate(
            "WARNING_SWAL.SUCCESS_TITLE"
          ),
          text: "Phone Save Successfully",
          icon: "success",
          confirmButtonText: this.commonMethodService.getTranslate(
            "WARNING_SWAL.BUTTON.CONFIRM.OK"
          ),
          customClass: {
            confirmButton: "btn_ok",
          },
        });
        this.isPhoneNumberPopupClicked = false;
        this.emtOutput.emit(objDonorPhone);
        this.commonMethodService.sendPaymentTrans(true);
        this.commonMethodService.sendPledgeTrans(true);
        this.closePopup();
      }
    });
  }
}
