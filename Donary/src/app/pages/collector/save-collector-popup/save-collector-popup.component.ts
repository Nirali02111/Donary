import {
  Component,
  EventEmitter,
  HostListener,
  inject,
  Input,
  OnInit,
  Output,
} from "@angular/core";
import { NgbActiveModal, NgbModalOptions } from "@ng-bootstrap/ng-bootstrap";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { AnalyticsService } from "src/app/services/analytics.service";
import {
  CommonAPIMethodService,
  SaveLabelApiPayload,
} from "src/app/services/common-api-method.service";
import { DonorService } from "src/app/services/donor.service";
import Swal from "sweetalert2";
declare var $: any;
export enum DefaultLabels {
  Home = "Home",
  Email = "Email",
  Cell = "Cell",
}
@Component({
  selector: "app-save-collector-popup",
  templateUrl: "./save-collector-popup.component.html",
  styleUrls: ["./save-collector-popup.component.scss"],
  standalone: false,
})
export class SaveCollectorPopupComponent implements OnInit {
  @Output() emtOutputEditCollector: EventEmitter<any> = new EventEmitter();
  @Output() emtOutputDismissCard: EventEmitter<any> = new EventEmitter();
  F;
  isloading: boolean = true;
  isEditMode = false;
  accountNum: string;
  collectorListLocal = [];
  accountId: string = null;
  fullNameJewish: string = null;
  fullName: string = null;
  address: string;
  cityStateZip: string;
  isSearchDisable: boolean = true;
  firstNameJewish: string = "";
  lastNameJewish: string = "";
  titleJewish: string = "";
  suffixJewish: string = "";
  titleEnglish: string = "";
  firstNameEnglish: string = "";
  lastNameEnglish: string = "";
  skeletonitems: any = [{}, {}, {}, {}, {}];
  disableTitle = "Need to be more then 3 characters";
  homephone: any[] = [
    {
      phoneID: null,
      phoneLabel: "Home",
      phoneNumber: "",
      isLabelErrorMessage: false,
      countryCodeID: this.commonMethodService.getDefaultSelectedCountryCode(),
      dailingCode: this.commonMethodService.getDefaultDailingCode(),
      selectedFlag: this.commonMethodService.getDefaultSelectedFlag(),
      selectedCountry: this.commonMethodService.getDefaultSelectedCountryCode(),
    },
  ];
  cellphone: any[] = [
    {
      phoneID: null,
      phoneLabel: "Cell",
      phoneNumber: "",
      isLabelErrorMessage: false,
      countryCodeID: this.commonMethodService.getDefaultSelectedCountryCode(),
      dailingCode: this.commonMethodService.getDefaultDailingCode(),
      selectedFlag: this.commonMethodService.getDefaultSelectedFlag(),
      selectedCountry: this.commonMethodService.getDefaultSelectedCountryCode(),
    },
  ];
  email: any[] = [
    {
      emailID: null,
      emailLabel: "Email",
      emailAddress: "",
      invalid: false,
      isLabelErrorMessage: false,
    },
  ];

  donorAddresses: any[] = [
    {
      addressId: 0,
      accountId: 0,
      careOf: null,
      houseNum: null,
      street: null,
      unit: null,
      city: null,
      state: null,
      zip: null,
      country: null,
      isDefault: true,
      neighborhood: null,
      note: null,
      latitude: 0,
      longitude: 0,
      streetAddress: null,
      addressLabel: "Home",
      isLabelErrorMessage: false,
    },
  ];

  globalDonor: string;
  selectedGlobalDonor: number;
  title: string;
  nonGlobalDonorEditable = false;
  showGlobalDonor: boolean = true;
  noResult: boolean = false;

  isGlobalEditIcon = false;
  formValid: boolean = false;
  nameJewishReq: boolean = false;
  nameReq: boolean = false;
  isHomeAddressOpen = false;
  isHomePhoneOpen = false;
  isCellPhoneOpen = false;
  isEmailOpen = false;

  modalOptions: NgbModalOptions;
  phoneLabelArray = [];
  emailLabelArray = [];
  addressLabelArray = [];
  countries: Object;
  temphomephone: any[];
  tempCellphone: any[];

  @Input() set Type(data: any) {
    if (data) {
      if (data == "add") {
        this.title = "Create Collector";
        this.isloading = false;
        this.isEditMode = false;
      } else {
        this.title = "Edit Collector";
        this.isEditMode = true;
        this.isloading = false;
      }
    }
  }

  @Input() set EditCollectorData(collectordata: any) {
    //this.isEditMode=true;
    this.formValid = true;
    if (collectordata) {
      if (
        collectordata.accountPhones &&
        collectordata.accountPhones.length > 0
      ) {
        this.homephone = [];
        this.cellphone = [];
        const foundCell = collectordata.accountPhones.some(
          (el) => el.phoneLabel == "Cell"
        );
        if (!foundCell) {
          let obj = {
            phoneID: null,
            phoneLabel: "Cell",
            phoneNumber: "",
            selectedCountry:
              this.commonMethodService.getDefaultSelectedCountryCode(),
            dailingCode: this.commonMethodService.getDefaultDailingCode(),
            selectedFlag: this.commonMethodService.getDefaultSelectedFlag(),
          };
          this.cellphone.push(obj);
        }
        const foundHome = collectordata.accountPhones.some(
          (el) => el.phoneLabel == "Home"
        );
        if (!foundHome) {
          let obj = {
            phoneID: null,
            phoneLabel: "Home",
            phoneNumber: "",
            countryCodeID:
              this.commonMethodService.getDefaultSelectedCountryCode(),
            selectedCountry:
              this.commonMethodService.getDefaultSelectedCountryCode(),
            dailingCode: this.commonMethodService.getDefaultDailingCode(),
            selectedFlag: this.commonMethodService.getDefaultSelectedFlag(),
          };
          this.homephone.push(obj);
        }
        collectordata.accountPhones.forEach((element) => {
          if (element.phoneLabel == "Home") {
            let obj = {
              phoneID: element.phoneID,
              phoneLabel: element.phoneLabel,
              phoneNumber: element.phoneNumber,
              countryCodeID: element.countryCodeID
                ? element.countryCodeID
                : this.commonMethodService.getDefaultSelectedCountryCode(),
              selectedCountry: element.countryCodeID
                ? element.countryCodeID
                : this.commonMethodService.getDefaultSelectedCountryCode(),
              dailingCode: this.getDailingCode(
                element.countryCodeID
                  ? element.countryCodeID
                  : this.commonMethodService.getDefaultSelectedCountryCode()
              ),
              selectedFlag: this.getFlagClass(
                element.countryCodeID
                  ? element.countryCodeID
                  : this.commonMethodService.getDefaultSelectedCountryCode()
              ),
            };
            this.homephone.push(obj);
          } else {
            let obj = {
              phoneID: element.phoneID,
              phoneLabel: element.phoneLabel,
              phoneNumber: element.phoneNumber,
              countryCodeID: element.countryCodeID
                ? element.countryCodeID
                : this.commonMethodService.getDefaultSelectedCountryCode(),
              selectedCountry: element.countryCodeID
                ? element.countryCodeID
                : this.commonMethodService.getDefaultSelectedCountryCode(),
              dailingCode: this.getDailingCode(
                element.countryCodeID
                  ? element.countryCodeID
                  : this.commonMethodService.getDefaultSelectedCountryCode()
              ),
              selectedFlag: this.getFlagClass(
                element.countryCodeID
                  ? element.countryCodeID
                  : this.commonMethodService.getDefaultSelectedCountryCode()
              ),
            };
            this.cellphone.push(obj);
          }
        });
      }
      if (
        collectordata.accountEmails &&
        collectordata.accountEmails.length > 0
      ) {
        this.email = [];
        collectordata.accountEmails.forEach((element) => {
          let obj = {
            emailID: element.emailID,
            emailLabel: element.emailLabel,
            emailAddress: element.emailAddress,
            invalid: false,
          };
          this.email.push(obj);
        });
      }

      if (
        collectordata.donorAddresses &&
        collectordata.donorAddresses.length > 0
      ) {
        this.donorAddresses = [];
        collectordata.donorAddresses.forEach((element) => {
          let obj = {
            addressId: element.addressId,
            accountId: element.accountId,
            careOf: element.careOf,
            houseNum: element.houseNum,
            street: element.street,
            unit: element.unit,
            city: element.city,
            state: element.state,
            zip: element.zip,
            country: element.country,
            isDefault: element.isDefault,
            neighborhood: element.neighborhood,
            note: element.note,
            latitude: element.latitude,
            longitude: element.longitude,
            streetAddress: `${element.houseNum} ${element.street}`,
            addressLabel: element.addressLabel,
          };
          this.donorAddresses.push(obj);
        });
      }

      this.nonGlobalDonorEditable = true;
      this.accountId = collectordata.accountId;
      this.titleEnglish = collectordata.title;
      this.firstNameEnglish = collectordata.firstName;
      this.lastNameEnglish = collectordata.lastName;
      this.titleJewish = collectordata.titleJewish;
      this.suffixJewish = collectordata.suffixJewish;
      this.firstNameJewish = collectordata.firstNameJewish;
      this.lastNameJewish = collectordata.lastNameJewish;

      // if(collectordata.fullName!=null)
      // {
      // this.fullName=collectordata.fullName.trim()==""?null:collectordata.fullName;
      // }
      // if(collectordata.fullNameJewish!=null)
      // {
      // this.fullNameJewish=collectordata.fullNameJewish.trim()==""?null:collectordata.fullNameJewish;
      // }
      this.address = collectordata.address;
      this.accountNum = collectordata.accountNum;
      //this.cityStateZip=collectordata.cityStateZip.trim();
      this.isloading = false;
    }
  }
  private analytics = inject(AnalyticsService);

  constructor(
    public activeModal: NgbActiveModal,
    public commonMethodService: CommonMethodService,
    private localstoragedataService: LocalstoragedataService,
    private donorService: DonorService,
    private commonAPIMethodService: CommonAPIMethodService
  ) {}

  ngOnInit() {
    this.getFeatureSettingValues();
    this.getCountryCodes();
    $(document).ready(function () {
      let modalContent: any = $(".modal");
      modalContent.draggable({
        handle: ".modal-header",
      });
    });
    this.commonMethodService.getStatesList();
    if (this.commonMethodService.localCollectorList.length == 0) {
      this.commonMethodService.getDonorList();
      this.collectorListLocal = this.commonMethodService.localCollectorList;
    } else {
      this.collectorListLocal = this.commonMethodService.localCollectorList;
    }
    this.getAllLabels();
  }
  getCountryCodes() {
    this.commonAPIMethodService
      .getCountryCodes(this.localstoragedataService.getLoginUserEventGuId())
      .subscribe((res) => {
        this.countries = res;
      });
  }
  closePopup() {
    this.activeModal.dismiss();
  }
  flagDailingCode = {
    "1": "+1",
    "2": "+1",
    "3": "+32",
    "4": "+44",
    "5": "+972",
  };

  getDailingCode(countryCodeId: any) {
    return this.flagDailingCode[countryCodeId] || "";
  }
  SearchGlobalDonor() {
    var text = $("#globalDonorText").val();
    this.showGlobalDonor = true;
    this.commonMethodService.onDonorSearchFieldChange(text, true);
    this.noResult = true;
  }
  SelectGlobalDonor(accountId) {
    this.isloading = true;
    this.nonGlobalDonorEditable = true;
    this.showGlobalDonor = false;
    this.selectedGlobalDonor = accountId;
    this.commonMethodService.donorList =
      this.commonMethodService.donorList.filter((s) => s.id == accountId);
    this.globalDonor = null;
    var eventGuId = this.localstoragedataService.getLoginUserEventGuId();
    this.donorService
      .getDonorById(eventGuId, accountId, true)
      .subscribe((res: any) => {
        this.isloading = false;
        this.EditCollectorData = res;
      });
    this.isSearchDisable = true;
  }

  isDuplicateAccNumber = false;
  isSetBorderCls = "";
  duplicateAccNumber(event: any) {
    var val = event.target.value;
    const isElementPresent = this.collectorListLocal.filter(
      (o) => o.accountNum == val
    );

    if (isElementPresent.length > 0) {
      this.isDuplicateAccNumber = true;
      this.isSetBorderCls = "dublicate-acc-no";
    } else {
      this.isDuplicateAccNumber = false;
      this.isSetBorderCls = "";
    }
  }

  EnterDonor(event: any) {
    let value = event.target.value;
    var loclength = value.length;
    if (loclength >= 3) {
      this.isSearchDisable = false;
      this.disableTitle = "";
      if (event.keyCode === 13) {
        this.SearchGlobalDonor();
      }
    } else {
      this.isSearchDisable = true;
      this.disableTitle = "Need to be more then 3 characters";
      this.noResult = false;
    }
  }

  addHomePhone() {
    if (this.addHonePhoneClicked || this.addCellPhoneClicked) {
      return false;
    }
    this.homephone.push({
      phoneID: null,
      phoneLabel: "",
      phoneNumber: "",
    });
    setTimeout(() => {
      this.addHonePhoneClicked = true;
      this.homephoneIndexI = this.homephone.length - 1;
      $("#id_HomePhoneDwn_" + this.homephoneIndexI).toggle();
    }, 100);
  }

  addCellPhone() {
    if (this.addHonePhoneClicked || this.addCellPhoneClicked) {
      return false;
    }
    this.cellphone.push({
      phoneID: null,
      phoneLabel: "",
      phoneNumber: "",
      countryCodeID: this.commonMethodService.getDefaultSelectedCountryCode(),
      dailingCode: this.commonMethodService.getDefaultDailingCode(),
      isdisabled: true,
      selectedFlag: this.commonMethodService.getDefaultSelectedFlag(),
      selectedCountry: this.commonMethodService.getDefaultSelectedCountryCode(),
    });
    setTimeout(() => {
      this.addCellPhoneClicked = true;
      this.cellphoneIndexI = this.cellphone.length - 1;
      $("#id_CellPhoneDwn_" + this.cellphoneIndexI).toggle();
    }, 100);
  }

  addEmailAddress() {
    if (this.addEmailClicked) {
      return false;
    }
    this.email.push({
      emailID: null,
      emailLabel: "",
      emailAddress: "",
      invalid: false,
    });
    setTimeout(() => {
      this.addEmailClicked = true;
      this.emailIndexI = this.email.length - 1;
      $("#id_isEmailOpenDwn_" + this.emailIndexI).toggle();
    }, 100);
  }

  ValidDonorKeyPress(event, parameter) {
    var val = event.target.value;
    if (val != "" && parameter == "name") {
      this.nameReq = false;
      this.nameJewishReq = false;
      this.formValid = true;
    } else if (
      val == "" &&
      parameter == "name" &&
      (this.firstNameJewish == null || this.firstNameJewish == "")
    ) {
      this.nameReq = true;
      this.formValid = false;
    }
    if (val != "" && parameter == "namejewish") {
      this.nameReq = false;
      this.nameJewishReq = false;
      this.formValid = true;
    } else if (
      val == "" &&
      parameter == "namejewish" &&
      (this.fullName == null || this.fullName == "")
    ) {
      this.formValid = false;
    }
    if (this.email.length > 0) {
      var regex =
        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

      for (var i = 0; i < this.email.length; i++) {
        if (
          this.email[i].emailAddress != "" &&
          !regex.test(this.email[i].emailAddress)
        ) {
          this.email[i].invalid = true;
          this.formValid = false;
        } else {
          this.email[i].invalid = false;
          this.formValid = true;
          if (this.fullName != null && this.fullName != "") {
            this.formValid = true;
          }
        }
      }
    }
  }

  removeHomePhone(i: number) {
    this.homephone.splice(i, 1);
    this.addCellPhoneClicked = false;
    this.addHonePhoneClicked = false;
    this.formValid = true;
  }

  removeCellPhone(i: number) {
    this.cellphone.splice(i, 1);
    this.addCellPhoneClicked = false;
    this.addHonePhoneClicked = false;
    this.formValid = true;
  }

  removeEmailAddress(i: number) {
    this.email.splice(i, 1);
    this.addEmailClicked = false;
    this.formValid = true;
  }

  OpenHomeAddressPopup(i) {
    this.addressIndexI = i;
    $("#id_HomeAddressDwn_" + i).toggle();
    this.hideEditTextBox();
  }

  OpenHomePhonePopup(i) {
    if (this.addHonePhoneClicked) {
      return false;
    }
    this.homephoneIndexI = i;
    this.isHomePhoneOpen = !this.isHomePhoneOpen;
    $("#id_HomePhoneDwn_" + i).toggle();
    this.editLabel = false;
    this.addNewLabel = false;
    this.hideEditTextBox();
  }
  selectedCellLabel = "";
  OpenCellPhonePopup(i) {
    if (this.addCellPhoneClicked) {
      return false;
    }
    this.cellphoneIndexI = i;
    $("#id_CellPhoneDwn_" + i).toggle();
    this.editLabel = false;
    this.addNewLabel = false;
    this.hideEditTextBox();
    this.isCellPhoneOpen = !this.isCellPhoneOpen;
    this.selectedCellLabel = this.cellphone[i].phoneLabel;
  }
  OpenEmailPopup(i) {
    this.emailIndexI = i;
    if (this.addEmailClicked) {
      return false;
    }
    $("#id_isEmailOpenDwn_" + i).toggle();
    this.hideEditTextBox();
  }

  onClickedOutsidePrimary() {
    this.isHomeAddressOpen = false;
  }

  onClickedOutsideHomePhone() {
    this.isHomePhoneOpen = false;
  }

  addDonorAddress() {
    if (this.addAddressClicked) {
      return false;
    }
    this.donorAddresses.push({
      addressId: 0,
      accountId: 0,
      careOf: null,
      houseNum: null,
      street: null,
      unit: null,
      city: null,
      state: null,
      zip: null,
      country: null,
      isDefault: false,
      neighborhood: null,
      note: null,
      latitude: 0,
      longitude: 0,
      addressLabel: "",
    });
    setTimeout(() => {
      this.addAddressClicked = true;
      this.addressIndexI = this.donorAddresses.length - 1;
      $("#id_HomeAddressDwn_" + this.addressIndexI).toggle();
    }, 100);
  }
  flagClasses = {
    "1": "flag flag-usa",
    "2": "flag flag-canada",
    "3": "flag flag-bleguim",
    "4": "flag flag-uk",
    "5": "flag flag-israel",
  };
  getFlagClass(countryCodeId: string): string {
    return this.flagClasses[countryCodeId] || "";
  }
  onCountryChange(
    countryCodeID: any,
    dialingCode: any,
    phoneLabel: any,
    countryCode: any,
    isNew: any
  ) {
    if (isNew == true) {
      this.cellphone = this.cellphone.map((phone) => {
        if (phone.phoneLabel === phoneLabel) {
          phone.countryCodeID = countryCodeID;
          phone.dailingCode = dialingCode;
          phone.selectedFlag = this.getFlagClass(countryCodeID);
          phone.selectedCountry = countryCodeID;
        }
        return phone;
      });
    } else {
      this.homephone = this.homephone.map((phone) => {
        if (phone.phoneLabel === phoneLabel) {
          phone.countryCodeID = countryCodeID;
          phone.dailingCode = dialingCode;
          phone.selectedFlag = this.getFlagClass(countryCodeID);
          phone.selectedCountry = countryCodeID;
        }
        return phone;
      });
    }
  }

  SaveCollectorInfo() {
    this.labelNullValidation();
    const found = this.cellphone.some((el) => el.isLabelErrorMessage == true);
    const found1 = this.email.some((el) => el.isLabelErrorMessage == true);
    const found2 = this.donorAddresses.some(
      (el) => el.isLabelErrorMessage == true
    );
    if (found || found1 || found2) {
      this.formValid = false;
      return false;
    }
    this.ValidCollector();
    const elem = document.querySelector("#globalDonorText");
    if (elem === document.activeElement) {
      this.SearchGlobalDonor();
      return false;
    }
    if (this.formValid) {
      this.isloading = true;
      if (this.homephone && this.homephone.length > 0) {
        if (this.homephone.length == 1) {
          if (this.homephone[0].phoneNumber == "") {
            this.homephone = [];
          }
        }
      }
      if (this.cellphone && this.cellphone.length > 0) {
        if (this.cellphone.length == 1) {
          if (this.cellphone[0].phoneNumber != "") {
            this.temphomephone = this.homephone;
            this.tempCellphone = this.cellphone;
            this.homephone = this.homephone.concat(this.cellphone);
          }
        } else {
          this.homephone = this.homephone.concat(this.cellphone);
        }
      }
      if (this.email && this.email.length > 0) {
        if (this.email.length == 1) {
          if (this.email[0].emailAddress == "") {
            this.email = null;
          }
        }
      }
      if (this.donorAddresses && this.donorAddresses.length > 0) {
        if (this.donorAddresses.length == 1) {
          if (this.donorAddresses[0].houseNum == "") {
            this.donorAddresses = [];
          }
        }
      }
      let newPhones = this.homephone.map(
        ({ dailingCode, selectedFlag, selectedCountry, ...rest }) => rest
      );

      var objSaveDonor = {
        eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
        macAddress: this.localstoragedataService.getLoginUserGuid(),
        accountId: this.accountId,
        fullName: this.fullName,
        fullJewishName: this.fullNameJewish,
        donorAddresses: this.donorAddresses,
        title: this.titleEnglish,
        firstName: this.firstNameEnglish,
        lastName: this.lastNameEnglish,
        titleJewish: this.titleJewish,
        SuffixJewish: this.suffixJewish,
        firstNameJewish: this.firstNameJewish,
        lastNameJewish: this.lastNameJewish,
        //address:this.address,
        // cityStateZip:this.cityStateZip,
        phones: newPhones,
        emails: this.email,
        loginUserId: this.localstoragedataService.getLoginUserId(),
        accountNum: this.accountNum,
        isCollector: true,
        SaveWhenPhoneExists: false,
      };
      this.donorService.SaveDonor(objSaveDonor).subscribe(
        (res: any) => {
          this.isloading = false;
          if (res) {
            this.activeModal.dismiss();
            if (this.isEditMode) {
              this.analytics.editedCollector();
              Swal.fire({
                title: "",
                text: "Collector updated successfully",
                icon: "success",
                confirmButtonText: this.commonMethodService.getTranslate(
                  "WARNING_SWAL.BUTTON.CONFIRM.OK"
                ),
                customClass: {
                  confirmButton: "btn_ok",
                },
              }).then(() => {
                this.emtOutputEditCollector.emit(true);
              });
            } else {
              this.analytics.createdCollector();
              Swal.fire({
                title: "",
                text: "Collector added successfully",
                icon: "success",
                confirmButtonText: this.commonMethodService.getTranslate(
                  "WARNING_SWAL.BUTTON.CONFIRM.OK"
                ),
                customClass: {
                  confirmButton: "btn_ok",
                },
              });
            }
            this.commonMethodService.sendCollectorLst(true);
          } else {
            Swal.fire({
              title: this.commonMethodService.getTranslate(
                "WARNING_SWAL.TRY_AGAIN"
              ),
              text: this.commonMethodService.getTranslate(
                "WARNING_SWAL.SOMETHING_WENT_WRONG"
              ),
              icon: "error",
              confirmButtonText: this.commonMethodService.getTranslate(
                "WARNING_SWAL.BUTTON.CONFIRM.OK"
              ),
              customClass: {
                confirmButton: "btn_ok",
              },
            });
          }
        },
        (error) => {
          this.homephone = this.homephone.filter((home) => {
            return !this.cellphone.some(
              (cell) => cell.phoneID === home.phoneID
            );
          });

          this.isloading = false;
          console.log(error);
          var str = error.error;
          var regex = /<br\s*[\/]?>/gi;
          var msg = str.replace(regex, "\n");

          Swal.fire({
            title: this.commonMethodService.getTranslate(
              "WARNING_SWAL.SOMETHING_WENT_WRONG"
            ),
            //text: msg,//error.error,
            html: error.error,
            icon: "error",
            showDenyButton: false,
            showCancelButton: true,
            confirmButtonText: "Save anyway",
            confirmButtonColor: "#726ab9",
            //denyButtonText: `Don't save`,
          }).then((result) => {
            /* Read more about isConfirmed, isDenied below */
            if (result.isConfirmed) {
              this.isloading = true;
              objSaveDonor.SaveWhenPhoneExists = true;
              this.donorService
                .SaveDonor(objSaveDonor)
                .subscribe((res: any) => {
                  this.isloading = false;
                  if (res) {
                    this.activeModal.dismiss();
                    if (this.isEditMode) {
                      this.analytics.editedCollector();
                      Swal.fire({
                        title: "",
                        text: "Collector updated successfully",
                        icon: "success",
                        confirmButtonText:
                          this.commonMethodService.getTranslate(
                            "WARNING_SWAL.BUTTON.CONFIRM.OK"
                          ),
                        customClass: {
                          confirmButton: "btn_ok",
                        },
                      }).then(() => {
                        this.emtOutputEditCollector.emit(true);
                      });
                    } else {
                      Swal.fire({
                        title: "",
                        text: "Collector added successfully",
                        icon: "success",
                        confirmButtonText:
                          this.commonMethodService.getTranslate(
                            "WARNING_SWAL.BUTTON.CONFIRM.OK"
                          ),
                        customClass: {
                          confirmButton: "btn_ok",
                        },
                      });
                    }
                    this.commonMethodService.sendCollectorLst(true);
                  } else {
                    Swal.fire({
                      title: this.commonMethodService.getTranslate(
                        "WARNING_SWAL.TRY_AGAIN"
                      ),
                      text: this.commonMethodService.getTranslate(
                        "WARNING_SWAL.SOMETHING_WENT_WRONG"
                      ),
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
            } else if (result.isDismissed) {
              //this.formValid=false;
            }
          });
        }
      );
    }
  }

  onClickedOutside() {
    this.showGlobalDonor = false;
  }
  removeDonorAddress(i: number) {
    if (this.donorAddresses[i].isDefault) {
      this.donorAddresses = this.donorAddresses.map((item) => {
        return {
          ...item,
          isDefault: item.addressLabel == "Home" ? true : false,
        };
      });
    }
    let deletedAccountAddressId = this.donorAddresses[i].addressId;
    if (deletedAccountAddressId) {
      this.deleteDonorAddress(deletedAccountAddressId);
    }
    this.donorAddresses.splice(i, 1);
    this.formValid = true;
    this.addAddressClicked = false;
  }

  ValidCollectorKeyPress(event, parameter) {
    var val = event.target.value;
    if (val != "" && parameter == "name") {
      this.nameReq = false;
      this.nameJewishReq = false;
      this.formValid = true;
    } else if (
      val == "" &&
      parameter == "name" &&
      (this.firstNameJewish == null || this.firstNameJewish == "")
    ) {
      this.nameReq = true;
      this.formValid = false;
    }
    if (val != "" && parameter == "namejewish") {
      this.nameReq = false;
      this.nameJewishReq = false;
      this.formValid = true;
    } else if (
      val == "" &&
      parameter == "namejewish" &&
      (this.firstNameEnglish == null || this.firstNameEnglish == "")
    ) {
      this.formValid = false;
    }
    if (this.email.length > 0) {
      var regex =
        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

      for (var i = 0; i < this.email.length; i++) {
        if (
          this.email[i].emailAddress != "" &&
          !regex.test(this.email[i].emailAddress)
        ) {
          this.email[i].invalid = true;
          this.formValid = false;
        } else {
          this.email[i].invalid = false;
          if (this.fullName != null && this.fullName != "") {
            this.formValid = true;
          }
        }
      }
    }
  }

  ValidCollector() {
    this.formValid = true;
    if (
      (this.firstNameEnglish == null || this.firstNameEnglish == "") &&
      (this.firstNameJewish == null || this.firstNameJewish == "")
    ) {
      this.nameReq = true;
      this.formValid = false;
    } else if (
      ((this.firstNameEnglish && this.firstNameEnglish.trim() != null) ||
        (this.firstNameJewish && this.firstNameJewish.trim()) != null) != null
    ) {
      this.nameReq = false;
      this.nameJewishReq == false;
    }
    if (this.email && this.email.length > 0) {
      var regex =
        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      for (var i = 0; i < this.email.length; i++) {
        if (
          this.email[i].emailAddress != "" &&
          !regex.test(this.email[i].emailAddress)
        ) {
          this.email[i].invalid = true;
          this.formValid = false;
        } else {
          this.email[i].invalid = false;
        }
      }
    }
  }

  deleteCollector() {
    Swal.fire({
      title: this.commonMethodService.getTranslate("WARNING_SWAL.TITLE"),
      text: "You will not be able to recover this collector!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: this.commonMethodService.getTranslate(
        "WARNING_SWAL.BUTTON.CANCEL.NO_KEEP_IT"
      ),
    }).then((result) => {
      if (result.value) {
        var objDonor = {
          eventGuid: this.localstoragedataService.getLoginUserEventGuId(),
          macAddress: this.localstoragedataService.getLoginUserGuid(),
          accountId: this.accountId,
          IsCollector: true,
          deletedBy: this.localstoragedataService.getLoginUserId(),
        };
        this.donorService.deleteDonor(objDonor).subscribe(
          (res: any) => {
            this.isloading = false;
            if (res) {
              this.activeModal.dismiss();
              Swal.fire({
                title: this.commonMethodService.getTranslate(
                  "WARNING_SWAL.SUCCESS_TITLE"
                ),
                text: "Collector deleted Successfully",
                icon: "success",
                confirmButtonText: this.commonMethodService.getTranslate(
                  "WARNING_SWAL.BUTTON.CONFIRM.OK"
                ),
                customClass: {
                  confirmButton: "btn_ok",
                },
              });
              this.emtOutputDismissCard.emit(true);
              this.commonMethodService.sendCollectorLst(true);
            } else {
              Swal.fire({
                title: this.commonMethodService.getTranslate(
                  "WARNING_SWAL.TRY_AGAIN"
                ),
                text: res.errorResponse,
                icon: "error",
                confirmButtonText: this.commonMethodService.getTranslate(
                  "WARNING_SWAL.BUTTON.CONFIRM.OK"
                ),
                customClass: {
                  confirmButton: "btn_ok",
                },
              });
            }
          },
          (error) => {
            this.isloading = false;
            console.log(error);
            Swal.fire({
              title: this.commonMethodService.getTranslate(
                "WARNING_SWAL.SOMETHING_WENT_WRONG"
              ),
              text: error.error,
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
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: this.commonMethodService.getTranslate("CANCELLED"),
          text: "Your collector is safe :)",
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
  onAddressChange(data, i) {
    let streetAddress = data.streetName;
    if (data.streetNumber && data.streetName) {
      streetAddress = `${data.streetNumber} ${data.streetName}`;
    }
    var City = data.locality.long || data.locality.short || data.sublocality;
    var State = data.state.short;
    var Zip = data.postalCode;
    var oss = streetAddress.split(" ");
    var HouseNumVal = oss.length > 0 ? oss[0] : "";
    var mystring = streetAddress;
    var newstr = mystring.replace(HouseNumVal, "");
    var streetVal = newstr.trim();
    this.donorAddresses[i].streetAddress = streetAddress;
    this.donorAddresses[i].street = streetVal;
    this.donorAddresses[i].houseNum = HouseNumVal;
    //this.donorAddresses[i].unit=data.streetNumber;
    this.donorAddresses[i].city = City;
    this.donorAddresses[i].state = State;
    this.donorAddresses[i].zip = Zip;
  }
  //label logic
  editLabel = false;
  addNewLabel = false;
  selectedLabel: any;
  isListLabelExist = false;
  isEditLabelBtnDisable = false;
  homephoneIndexI: number;
  addHonePhoneClicked = false;
  cellphoneIndexI: number;
  addCellPhoneClicked = false;
  emailIndexI: number;
  addEmailClicked = false;
  addressIndexI: number;
  addAddressClicked = false;

  getAllLabels() {
    const eventGuId = this.localstoragedataService.getLoginUserEventGuId();
    this.commonAPIMethodService
      .getLabelText(eventGuId)
      .subscribe((res: any) => {
        this.phoneLabelArray = res.filter((x) => x.labelType == "Phone");
        this.emailLabelArray = res.filter((x) => x.labelType == "Email");
        this.addressLabelArray = res.filter(
          (x) => x.labelType == "Address" && x.labelName != "Home"
        );
        this.hideEditTextBox();
      });
  }
  addNewPhoneLabel(event) {
    event.preventDefault();
    event.stopPropagation();
    this.editLabel = false;
    this.addNewLabel = true;
  }
  changePhoneLabel(event, labelName, i) {
    this.addHonePhoneClicked = false;
    this.homephone[i].phoneLabel = labelName;
    this.homephone[i].isLabelErrorMessage = false;
    this.formValid = true;
    $("#id_HomePhoneDwn_" + i).hide();
  }
  editLableDyn(event, id) {
    event.preventDefault();
    event.stopPropagation();
    this.isEditLabelBtnDisable = false;
    this.editLabel = true;
    this.selectedLabel = id.labelName;
    this.hideEditTextBox(id.labelID);
  }
  hideEditTextBox(id = "") {
    this.addNewLabel = false;
    this.phoneLabelArray = this.phoneLabelArray.map((item) => {
      return {
        ...item,
        editVisable: id && item.labelID == id ? true : false,
      };
    });
    this.emailLabelArray = this.emailLabelArray.map((item) => {
      return {
        ...item,
        editVisable: id && item.labelID == id ? true : false,
      };
    });
    this.addressLabelArray = this.addressLabelArray.map((item) => {
      return {
        ...item,
        editVisable: id && item.labelID == id ? true : false,
      };
    });
  }
  homePhonePopupLabel(i) {
    if (this.homephone.length > 0) {
      if (i != undefined) {
        return this.homephone[i].phoneLabel;
      }
    }
    return "";
  }
  saveNewPhoneLabel(event, labelID = "") {
    event.stopPropagation();
    const found = this.phoneLabelArray.some(
      (el) => el.labelName.toLowerCase() == this.selectedLabel.toLowerCase()
    );
    if (found) {
      this.isListLabelExist = true;
      this.isEditLabelBtnDisable = true;
      return false;
    }
    this.onSaveLabelText(labelID, "Phone");
  }
  removeLableError() {
    $(".label-error").removeAttr("style");
    this.isEditLabelBtnDisable = false;
    return (this.isListLabelExist = false);
  }
  isLabelExist(labelName) {
    if (!labelName) {
      return "";
    }
    const clsName = "label-disable";
    return this.homephone.some((el) => el.phoneLabel == labelName)
      ? clsName
      : this.cellphone.some((el) => el.phoneLabel == labelName)
      ? clsName
      : "";
  }
  cellPhonePopupLabel(labelName) {
    return this.selectedCellLabel == labelName;
  }
  changeCellLabel(event, labelName, i) {
    this.addCellPhoneClicked = false;
    this.cellphone[i].phoneLabel = labelName;
    this.cellphone[i].isdisabled = false;
    this.cellphone[i].isLabelErrorMessage = false;
    this.formValid = true;
    $("#id_CellPhoneDwn_" + i).hide();
  }
  @HostListener("document:click", ["$event.target"])
  public onClick(targetElement) {
    let clsName = targetElement.parentElement.className;
    const clsNameArray = [
      "",
      "dropdown-menu",
      "arrow_trigger",
      "input-radio",
      "input_custom",
      "input-check-primary",
      "input_editAdd",
    ];
    if (!clsNameArray.includes(clsName)) {
      if (
        this.addHonePhoneClicked ||
        this.addCellPhoneClicked ||
        this.addEmailClicked ||
        this.addAddressClicked
      ) {
      } else {
        $(".dropdown-menu").hide();
      }
    }
  }
  isEmailLabelExist(labelName) {
    if (!labelName) {
      return "";
    }
    return this.email.some((el) => el.emailLabel == labelName)
      ? "label-disable"
      : "";
  }
  changeEmailLabel(event, labelName, i) {
    this.addEmailClicked = false;
    this.email[i].emailLabel = labelName;
    this.email[i].isLabelErrorMessage = false;
    this.formValid = true;
    $("#id_isEmailOpenDwn_" + i).hide();
  }
  onSaveLabelText(labelID = "", labelType = "") {
    let obj: SaveLabelApiPayload = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      labelName: this.selectedLabel,
      labelType: labelType,
      createdBy: this.localstoragedataService.getLoginUserId(),
    };
    if (labelID) {
      obj = { ...obj, labelID: labelID };
    }
    this.commonAPIMethodService.saveLabelText(obj).subscribe((res: any) => {
      if (res) {
        this.getAllLabels();
        this.editLabel = false;
        this.addNewLabel = false;
      }
    });
  }
  saveNewEmailLabel(event, labelID = "") {
    event.stopPropagation();
    const found = this.emailLabelArray.some(
      (el) => el.labelName.toLowerCase() == this.selectedLabel.toLowerCase()
    );
    if (found) {
      this.isListLabelExist = true;
      this.isEditLabelBtnDisable = true;
      return false;
    }
    this.onSaveLabelText(labelID, "Email");
  }
  isAddressLabelExist(labelName) {
    if (!labelName) {
      return "";
    }
    return this.donorAddresses.some((el) => el.addressLabel == labelName)
      ? "label-disable"
      : "";
  }
  changeAddressLabel(event, labelName, i) {
    this.addAddressClicked = false;
    this.donorAddresses[i].addressLabel = labelName;
    this.donorAddresses[i].isLabelErrorMessage = false;
    this.formValid = true;
    $("#id_HomeAddressDwn_" + i).hide();
  }
  saveNewAddressLabel(event, labelID = "") {
    event.stopPropagation();
    const found = this.addressLabelArray.some(
      (el) => el.labelName.toLowerCase() == this.selectedLabel.toLowerCase()
    );
    if (found) {
      this.isListLabelExist = true;
      this.isEditLabelBtnDisable = true;
      return false;
    }
    this.onSaveLabelText(labelID, "Address");
  }
  getDefaultLabels() {
    return DefaultLabels;
  }
  primryAddress(event: any, id: number) {
    if (
      (event.target.checked == false &&
        this.donorAddresses[id].addressLabel == "Home") ||
      (event.target.checked == false &&
        this.donorAddresses[id].addressLabel == "Work") ||
      (event.target.checked == false && !this.donorAddresses[id].addressLabel)
    ) {
      event.target.checked = true;
    }
    const index = this.donorAddresses.findIndex((x) => x.isDefault == true);
    if (index > -1) this.donorAddresses[index].isDefault = false;
    this.donorAddresses[id].isDefault = event.target.checked;
  }
  deleteDonorAddress(accountAddressId) {
    let eventGuId = this.localstoragedataService.getLoginUserEventGuId();
    let loginUserId = this.localstoragedataService.getLoginUserId();
    let macAddress = this.localstoragedataService.getLoginUserGuid();
    this.donorService
      .deleteDonorAddress(accountAddressId, loginUserId, eventGuId, macAddress)
      .subscribe((res: any) => {});
  }
  labelNullValidation() {
    this.formValid = true;
    this.cellphone = this.cellphone.map((x) => {
      if (!x.phoneLabel) {
        x.isLabelErrorMessage = true;
      }
      return x;
    });
    this.homephone = this.homephone.map((x) => {
      if (!x.phoneLabel) {
        x.isLabelErrorMessage = true;
      }
      return x;
    });
    this.email = this.email.map((x) => {
      if (!x.emailLabel) {
        x.isLabelErrorMessage = true;
      }
      return x;
    });
    this.donorAddresses = this.donorAddresses.map((x) => {
      if (!x.addressLabel) {
        x.isLabelErrorMessage = true;
      }
      return x;
    });
  }

  getFeatureSettingValues() {
    this.commonMethodService.featureName = "Save_collector";
    this.commonMethodService.getFeatureSettingValues();
  }

  onUpgrade() {
    // this.activeModal.dismiss();
    this.commonMethodService.commenSendUpgradeEmail(
      this.commonMethodService.featureDisplayName
    );
  }
}
