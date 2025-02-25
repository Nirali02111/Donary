import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { AnalyticsService } from "src/app/services/analytics.service";
import { CommonAPIMethodService } from "src/app/services/common-api-method.service";
import { DonorService } from "src/app/services/donor.service";
import { ReasonService } from "src/app/services/reason.service";
import Swal from "sweetalert2";
declare var $: any;
@Component({
  selector: "app-save-reason-popup",
  templateUrl: "./save-reason-popup.component.html",
  styleUrls: ["./save-reason-popup.component.scss"],
  standalone: false,
})
export class SaveReasonPopupComponent implements OnInit {
  @Output() emtOutputEditReason: EventEmitter<any> = new EventEmitter();
  @Output() emtOutputDismissCard: EventEmitter<any> = new EventEmitter();
  title: string;
  isloading: boolean = true;
  selectedGlobalDonor: number;
  campaignList: any = [];
  reasonList: any = [];
  isEditMode = false;
  nonGlobalDonorEditable = false;
  globalDonor: string;
  showGlobalDonor: boolean = true;
  selectedCampaignId: number;
  selectedReasonId: number;
  reasonId: number = 0;
  sortNumber: number;
  reasonName: string = null;
  reasonNameJewish: string = null;
  goal: number;
  phone1: string = "";
  phone2: string = "";
  email: string = "";
  parentId: any;
  reasonNum: string;
  campaignId: any;
  reasonReq: boolean = false;
  reasonNumReq: boolean = false;
  reasonYiddishReq: boolean = false;
  formValid: boolean = false;
  emailInvalid: boolean = false;
  isSearchDisable: boolean = true;
  reasonDuplicate: boolean = false;
  selectedCountry: any = "usa";
  reasonOrgList: any = [];
  noResult: boolean = false;
  maskSetVal: string = "";
  maskSetVal2: string = "";
  disabledSaveButton: boolean = false;
  disableTitle = "Need to be more then 3 characters";
  skeletonitems: any = [{}, {}, {}, {}, {}, {}, {}, {}];
  countries: Object;
  dailingPhoneCode: any = this.commonMethodService.getDefaultDailingCode();
  selectedPhoneCountry: number =
    this.commonMethodService.getDefaultSelectedCountryCode();
  selectedCellCountry: number =
    this.commonMethodService.getDefaultSelectedCountryCode();
  dailingCellCode: any = this.commonMethodService.getDefaultDailingCode();
  selectedCellFlag: string = this.commonMethodService.getDefaultSelectedFlag();
  selectedPhoneFlag: string = this.commonMethodService.getDefaultSelectedFlag();
  @Input() set Type(data: any) {
    if (data) {
      if (data == "add") {
        this.title = "Create Reason";
        this.isloading = false;
        this.isEditMode = false;
      } else {
        this.title = "EDITREASON";
        this.isloading = false;
        this.isEditMode = true;
      }
    }
  }

  @Input() set EditReasonData(reasondata: any) {
    if (reasondata) {
      var eventGuId = this.localstoragedataService.getLoginUserEventGuId();
      this.reasonNum = reasondata.urlTag;
      this.reasonId = reasondata.reasonId;
      this.reasonName = reasondata.reasonName;
      this.reasonNameJewish = reasondata.reasonNameJewish;
      this.parentId = this.commonMethodService.localReasonList.filter(
        (s) => s.id == reasondata.parentId
      );
      this.campaignId = this.commonMethodService.localCampaignList.filter(
        (s) => s.id == reasondata.campaignId
      );
      this.goal = reasondata.goal;
      this.selectedPhoneCountry =
        reasondata.countryCodeID != null
          ? reasondata.countryCodeID
          : this.commonMethodService.getDefaultSelectedCountryCode();
      this.dailingPhoneCode = this.getDailingCode(
        reasondata.countryCodeID != null
          ? reasondata.countryCodeID
          : this.commonMethodService.getDefaultSelectedCountryCode()
      );
      this.selectedPhoneFlag = this.getFlagClass(
        reasondata.countryCodeID != null
          ? reasondata.countryCodeID
          : this.commonMethodService.getDefaultSelectedCountryCode()
      );
      this.selectedCellCountry =
        reasondata.phone2CountryCodeID != null
          ? reasondata.phone2CountryCodeID
          : this.commonMethodService.getDefaultSelectedCountryCode();
      this.dailingCellCode = this.getDailingCode(
        reasondata.phone2CountryCodeID != null
          ? reasondata.phone2CountryCodeID
          : this.commonMethodService.getDefaultSelectedCountryCode()
      );
      this.selectedCellFlag = this.getFlagClass(
        reasondata.phone2CountryCodeID != null
          ? reasondata.phone2CountryCodeID
          : this.commonMethodService.getDefaultSelectedCountryCode()
      );
      this.phone1 = reasondata.phone1;
      this.phone2 = reasondata.phone2;
      this.email = reasondata.email == null ? "" : reasondata.email;
      this.isloading = false;
    }
  }
  private analytics = inject(AnalyticsService);

  constructor(
    public activeModal: NgbActiveModal,
    public commonMethodService: CommonMethodService,
    private commonAPIMethodService: CommonAPIMethodService,
    private localstoragedataService: LocalstoragedataService,
    private reasonService: ReasonService,
    private donorService: DonorService
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
    this.campaignList = this.commonMethodService.localCampaignList.filter(
      (s) => s.id == this.selectedCampaignId
    );
    this.reasonList = this.commonMethodService.localReasonList.filter(
      (s) => s.id == this.selectedReasonId
    );
    var objReason = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
    };
    this.reasonService.getReasonList(objReason).subscribe((res: any) => {
      if (res) {
        this.reasonOrgList = res;
      }
    });
    if (this.commonMethodService.localReasonList.length == 0) {
      this.commonMethodService.getReasonList();
    }
    if (this.commonMethodService.localCampaignList.length == 0) {
      this.commonMethodService.getCampaignList();
    }
  }

  flagClasses = {
    "1": "flag flag-usa",
    "2": "flag flag-canada",
    "3": "flag flag-bleguim",
    "4": "flag flag-uk",
    "5": "flag flag-israel",
  };
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

  onCountryChange(countryCodeID: any, dialingCode: any, type: any) {
    if (type == "Phone") {
      this.selectedPhoneCountry = countryCodeID;
      this.dailingPhoneCode = dialingCode;
      this.selectedPhoneFlag = this.getFlagClass(countryCodeID);
    } else if (type == "Cell") {
      this.selectedCellCountry = countryCodeID;
      this.dailingCellCode = dialingCode;
      this.selectedCellFlag = this.getFlagClass(countryCodeID);
    }
    this.selectedCountry = countryCodeID;
  }
  getFlagClass(countryCode: string): string {
    return this.flagClasses[countryCode] || "";
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

  SearchGlobalDonor() {
    var text = $("#globalDonorText").val();
    this.showGlobalDonor = true;
    this.commonMethodService.onDonorSearchFieldChange(text, true);
    this.noResult = true;
  }

  RemoveGlobalDonor() {
    this.nonGlobalDonorEditable = false;
    this.globalDonor = null;
  }
  onClickedOutside() {
    this.showGlobalDonor = false;
  }
  SelectGlobalDonor(accountId) {
    this.isloading = false;
    this.nonGlobalDonorEditable = true;
    this.showGlobalDonor = false;
    this.selectedGlobalDonor = accountId;
    this.commonMethodService.donorList =
      this.commonMethodService.donorList.filter((s) => s.id == accountId);
    this.globalDonor = null;
    this.isSearchDisable = true;
    var eventGuId = this.localstoragedataService.getLoginUserEventGuId();
    this.donorService
      .getDonorById(eventGuId, accountId, true)
      .subscribe((res: any) => {
        this.isloading = false;
        if (res.fullName != null) {
          this.reasonName = res.fullName.trim() == "" ? null : res.fullName;
        }
        if (res.fullNameJewish != null) {
          this.reasonNameJewish =
            res.fullNameJewish.trim() == "" ? null : res.fullNameJewish;
        }
        if (res.accountEmails && res.accountEmails.length > 0) {
          res.accountEmails.forEach((element) => {
            if (this.email == "") {
              this.email = element.emailAddress;
            }
          });
        }
        if (res.accountPhones && res.accountPhones.length > 0) {
          res.accountPhones.forEach((element) => {
            if (element.phoneLabel == "Home") {
              if (this.phone1 == "") {
                this.phone1 = element.phoneNumber;
              }
            } else if (element.phoneLabel == "Cell") {
              if (this.phone2 == "") {
                this.phone2 = element.phoneNumber;
              }
            } else {
              if (this.phone2 == "") {
                this.phone2 = element.phoneNumber;
              }
            }
          });
        }
      });
  }

  DuplicateReason(event) {
    var reasonNo = event.target.value;
    if (reasonNo != "") {
      var duplicate = this.reasonOrgList.filter(
        (x) => x.urlTag == reasonNo && x.reasonId != this.reasonId
      );
      if (duplicate.length == 0) {
        this.reasonDuplicate = false;
      } else {
        this.reasonDuplicate = true;
      }
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

  ValidReasonKeyPress(event, parameter) {
    var val = event.target.value;
    if (!this.formValid) {
      if (val != "" && parameter == "reasonnum") {
        this.reasonNumReq = false;
        this.formValid = true;
      }
      if (val == "" && parameter == "reasonnum") {
        this.reasonNumReq = true;
        this.formValid = false;
      }

      if (val != "" && parameter == "name") {
        this.reasonReq = false;
        this.reasonYiddishReq = false;
        this.formValid = true;
      } else if (val == "" && parameter == "name") {
        this.reasonReq = true;
        this.formValid = false;
      }
      if (val != "" && parameter == "nameyiddish") {
        this.reasonReq = false;
        this.reasonYiddishReq = false;
        this.formValid = true;
      }
      if (val != "" && parameter == "email") {
        var regex =
          /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (this.email != "" && !regex.test(this.email)) {
          this.emailInvalid = true;
          this.formValid = false;
        } else {
          this.emailInvalid = false;
        }
      }
    }
  }
  ValidReason() {
    this.formValid = true;
    if (
      (this.reasonName == null || this.reasonName == "") &&
      (this.reasonNameJewish == null || this.reasonNameJewish == "")
    ) {
      this.reasonReq = true;
      this.formValid = false;
    }
    if (this.reasonDuplicate) {
      this.formValid = false;
    } else if (
      (this.reasonName && this.reasonName.trim() != null) ||
      (this.reasonNameJewish && this.reasonNameJewish.trim()) != null
    ) {
      this.reasonReq = false;
      this.reasonYiddishReq == false;
    }
    if (this.reasonNum == null || this.reasonNum == "") {
      this.reasonNumReq = true;
      this.formValid = false;
    }
    var regex =
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (this.email != "" && !regex.test(this.email)) {
      this.emailInvalid = true;
      this.formValid = false;
    } else {
      this.emailInvalid = false;
    }

    if (this.reasonNameJewish && !this.reasonName) {
      this.formValid = false;
      this.reasonReq = true;
    }
  }

  SaveReasonInfo() {
    this.ValidReason();
    this.disabledSaveButton = true;
    const elem = document.querySelector("#globalDonorText");
    if (elem === document.activeElement) {
      this.SearchGlobalDonor();
      return false;
    }
    if (this.formValid) {
      var objSaveReason = {
        eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
        macAddress: this.localstoragedataService.getLoginUserGuid(),
        userId: this.localstoragedataService.getLoginUserId(),
        reasonId: this.reasonId,
        //sortNumber:this.sortNumber,
        reasonName: this.reasonName,
        reasonNameJewish: this.reasonNameJewish,
        goal: this.goal == null ? "0" : this.goal,
        phone1: this.phone1,
        phone2: this.phone2,
        email: this.email,
        campaignId:
          this.campaignId != undefined
            ? parseInt(this.campaignId.map((s) => s.id))
            : null,
        parentId:
          this.parentId != undefined
            ? parseInt(this.parentId.map((s) => s.id))
            : null,
        urlTag: this.reasonNum,
        countryCodeID: this.selectedPhoneCountry,
        phone2CountryCodeID: this.selectedCellCountry,
      };

      this.reasonService.saveReason(objSaveReason).subscribe(
        (res: any) => {
          this.isloading = false;
          this.disabledSaveButton = false;
          if (res) {
            this.activeModal.dismiss();
            if (this.isEditMode) {
              this.analytics.editedReason();
              Swal.fire({
                title: "",
                text: "Reason updated successfully",
                icon: "success",
                confirmButtonText: this.commonMethodService.getTranslate(
                  "WARNING_SWAL.BUTTON.CONFIRM.OK"
                ),
                customClass: {
                  confirmButton: "btn_ok",
                },
              }).then(() => {
                this.emtOutputEditReason.emit(true);
              });
            } else {
              this.analytics.createdReason();
              Swal.fire({
                title: "",
                text: "Reason added successfully",
                icon: "success",
                confirmButtonText: this.commonMethodService.getTranslate(
                  "WARNING_SWAL.BUTTON.CONFIRM.OK"
                ),
                customClass: {
                  confirmButton: "btn_ok",
                },
              });
            }
            this.commonMethodService.sendReasonLst(true);
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
    }
  }
  contains_heb(str) {
    return /[\u0590-\u05FF]/.test(str);
  }
  deleteReason() {
    Swal.fire({
      title: this.commonMethodService.getTranslate("WARNING_SWAL.TITLE"),
      text: "You will not be able to recover this reason!",
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
        var objReason = {
          eventGuid: this.localstoragedataService.getLoginUserEventGuId(),
          macAddress: this.localstoragedataService.getLoginUserGuid(),
          reasonId: this.reasonId,
          deletedBy: this.localstoragedataService.getLoginUserId(),
        };
        this.reasonService.deleteReason(objReason).subscribe(
          (res: any) => {
            this.isloading = false;
            if (res) {
              this.activeModal.dismiss();
              Swal.fire({
                title: this.commonMethodService.getTranslate(
                  "WARNING_SWAL.SUCCESS_TITLE"
                ),
                text: res,
                icon: "success",
                confirmButtonText: this.commonMethodService.getTranslate(
                  "WARNING_SWAL.BUTTON.CONFIRM.OK"
                ),
                customClass: {
                  confirmButton: "btn_ok",
                },
              });
              this.emtOutputDismissCard.emit(true);
              this.commonMethodService.sendReasonLst(true);
            } else {
              Swal.fire({
                title: "Try Again!",
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
          text: "Your reason is safe :)",
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

  OnItemDeSelect(event: any) {
    this.parentId = undefined;
  }

  OnCampaignDeSelect(event: any) {
    this.campaignId = undefined;
  }

  onSearchChange(searchValue: string): void {
    this.maskSetVal = "";
    if (searchValue.startsWith("1", 0)) {
      this.maskSetVal = "0(000) 000-000099999";
    } else if (searchValue.startsWith("(1", 1)) {
      this.maskSetVal = "0(000) 000-000099999";
    } else if (searchValue.length == 1) {
      if (searchValue.startsWith("(", 0)) {
        this.maskSetVal = "";
      }
    } else {
      this.maskSetVal = "(000) 000-000099999";
    }
  }
  onSearchChange2(searchValue: string): void {
    this.maskSetVal2 = "";
    if (searchValue.startsWith("1", 0)) {
      this.maskSetVal2 = "0(000) 000-000099999";
    } else if (searchValue.startsWith("(1", 1)) {
      this.maskSetVal2 = "0(000) 000-000099999";
    } else if (searchValue.length == 1) {
      if (searchValue.startsWith("(", 0)) {
        this.maskSetVal2 = "";
      }
    } else {
      this.maskSetVal2 = "(000) 000-000099999";
    }
  }

  getFeatureSettingValues() {
    this.commonMethodService.featureName = "Save_reason";
    this.commonMethodService.getFeatureSettingValues();
  }

  onUpgrade() {
    this.commonMethodService.commenSendUpgradeEmail(
      this.commonMethodService.featureDisplayName
    );
  }
}
