import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from "@angular/core";
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { DonorService } from "src/app/services/donor.service";
import { CreditCardService } from "src/app/services/helpers/credit-card.service";

import Swal from "sweetalert2";
declare var $: any;

@Component({
  selector: "app-savecard-popup",
  templateUrl: "./savecard-popup.component.html",
  standalone: false,
  styleUrls: ["./savecard-popup.component.scss"],
})
export class SavecardPopupComponent implements OnInit {
  title: string;
  maskValue: string;
  CVVmaskvalue: string = "000";
  isInValid: boolean = false;
  cvvMaxLength: number = 3;
  cardNumber: any = "";
  isCvvVisible: boolean = true;
  isZipVisible: boolean = true;
  accountName: any = "";
  expiryDate: any = "";
  cardCVV: any = "";
  billingAddress: any = "";
  billingZip: any = "";
  walletId: any = null;
  accountId: any = "";
  isloading = true;
  isAdd: boolean = false;
  isEditable: boolean = false;
  isInvalid: boolean = false;
  isAMEXCard: boolean = false;
  description: string;
  walletType: string;
  isPrimary: boolean = false;
  checkType: string;
  accountType: string;
  accountNumberMask: string = "00000999999999999999";
  routingNumber: string;
  token: string;
  twodigit: string;
  creditCardNumber: string;
  isEditableToken: boolean = false;
  @Output() emtSaveWallet: EventEmitter<any> = new EventEmitter();
  @Output() emitDefaultWallet: EventEmitter<any> = new EventEmitter();

  formGroup!: UntypedFormGroup;
  isDinerCard: boolean;

  constructor(
    private readonly changeDetectorRef: ChangeDetectorRef,
    public activeModal: NgbActiveModal,
    public commonMethodService: CommonMethodService,
    private donorService: DonorService,
    private localstoragedataService: LocalstoragedataService,
    private creditCardService: CreditCardService,
    private fb: UntypedFormBuilder
  ) {}
  @Input() set Type(data: any) {
    if (data) {
      if (data == "add") {
        this.title = "Add Method";
        this.isloading = false;
        this.isAdd = true;
        this.isEditable = false;
      } else {
        this.title = "Edit Method";
        this.isAdd = false;
        this.isEditable = true;
      }
    }
  }
  @Input() set AccountId(data: any) {
    if (data) {
      this.accountId = data;
    }
  }
  @Input() set WalletData(data: any) {
    if (data) {
      this.walletType = data.walletType;
      this.isPrimary = data.isPrimary;
      this.accountName = data.accountName;
      this.cardNumber = data.accountNumber;
      this.routingNumber = data.routingNumber;
      this.accountId = data.accountId;
      this.billingAddress = data.billingAddress;
      this.billingZip = data.billingZip;
      this.cardCVV = data.cvv;
      this.walletId = data.walletId;
      this.expiryDate = data.exp;
      this.checkType = data.checkType;
      this.accountType = data.accountType;
      this.isloading = false;
      this.isAMEXCard = data.isAMEXCard;
      this.description = data.description;
      this.token = data.token;
      this.CheckCardType(this.description);

      this.checkCVV();
    }
  }

  @Input() isPrimaryValue: boolean = false;
  get OptionType() {
    return this.formGroup.get("optionType");
  }
  get AccountNameControl() {
    return this.formGroup.get("accountName");
  }

  get ExpiryDateControl() {
    return this.formGroup.get("expiryDate");
  }
  get CardCVVControl() {
    return this.formGroup.get("cardCVV");
  }
  get BillingAddress1Control() {
    return this.formGroup.get("billingAddress1");
  }
  get BillingAddress2Control() {
    return this.formGroup.get("billingAddress2");
  }
  get BillingZipControl() {
    return this.formGroup.get("billingZip");
  }
  get IsPrimaryControl() {
    return this.formGroup.get("isPrimary");
  }
  get CheckTypeControl() {
    return this.formGroup.get("checkType");
  }
  get AccountTypeControl() {
    return this.formGroup.get("accountType");
  }
  get RoutingNumberControl() {
    return this.formGroup.get("routingNumber");
  }
  get AccountNumberControl() {
    return this.formGroup.get("accountNumber");
  }
  get TokenControl() {
    return this.formGroup.get("token");
  }
  ngAfterContentInit(): void {
    this.changeDetectorRef.detectChanges();
  }
  ngOnInit() {
    this.getFeatureSettingValues();
    $(document).ready(function () {
      let modalContent: any = $(".modal");
      modalContent.draggable({
        handle: ".modal__custom_header",
        cursor: " grab",
      });
    });
    this.inItFormGroup();
    if (this.isAdd) {
      this.inItCardFiels();
    }
    this.OptionType.valueChanges.subscribe((selectedValue) => {
      if (selectedValue == "card") {
        this.inItCardFiels();
      }
      if (selectedValue == "ach") {
        this.inItAchFiels();
      }
      if (selectedValue == "token") {
        this.inItTokenFiels();
      }
      this.updateVAlueAndValidator();
    });
    if (!this.isAdd) {
      this.accountNumberMask = "";
      this.updateFormValue();
    }
  }

  CheckCardType(description) {
    if (!description) {
      return;
    }
    if (
      description.toLowerCase().includes("matbia") ||
      description.toLowerCase().includes("ojc")
    ) {
      this.isCvvVisible = false;
      this.isZipVisible = false;
      return;
    }
    this.isCvvVisible = true;
    this.isZipVisible = true;
  }

  ChangeMask() {
    if (this.AccountNumberControl.value) {
      let twodigit = this.AccountNumberControl.value.substring(0, 2);
      let threedigit = this.AccountNumberControl.value.substring(0, 3);
      if (twodigit == "34" || twodigit == "37") {
        this.maskValue = this.creditCardService.getAmexMask();
      } else {
        if (
          twodigit == "36" ||
          twodigit == "38" ||
          twodigit == "39" ||
          threedigit == "300" ||
          threedigit == "301" ||
          threedigit == "302" ||
          threedigit == "303" ||
          threedigit == "304" ||
          threedigit == "305"
        ) {
          this.DinerCard();
        } else {
          this.isDinerCard = false;
          this.maskValue = this.creditCardService.getDefaultMask();
        }
      }
    } else {
      this.maskValue = this.creditCardService.getDefaultMask();
    }
  }

  ValidateCard(event) {
    this.isInvalid = false;
    this.cardNumber = this.AccountNumberControl.value;
    if (event.target.value.length >= 2) {
      var twodigit = this.cardNumber.substring(0, 2);
      if (twodigit == "34" || twodigit == "37") {
        this.maskValue = this.creditCardService.getAmexMask();
      } else {
        this.maskValue = this.creditCardService.getDefaultMask();
      }
    }
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode == 13) {
      $("#expiryDate").focus();
    }
    var cardlength = event.target.value.replace(/[_-]/g, "").length;
    var masklength = this.maskValue.replace(/[-]/g, "").length;
    if (cardlength == masklength || (this.isDinerCard && cardlength == 14)) {
      var result = this.creditCardService.luhnCheck(
        event.target.value.replace(/[_-]/g, "")
      );
      if (result == true) {
        this.isInvalid = false;
      } else {
        this.isInvalid = true;
      }
      $("#expiryDate").focus();
    }
  }

  CardReader() {
    if (this.isAdd) {
      this.twodigit = this.AccountNumberControl.value.substring(0, 2);
    } else {
      this.twodigit = this.AccountNumberControl.value.substring(0, 2);
    }

    if (this.twodigit == "86") {
      this.isCvvVisible = false;
      this.isZipVisible = false;
    } else if (this.twodigit == "69") {
      this.isCvvVisible = false;
      this.isZipVisible = false;
    } else {
      this.isCvvVisible = true;
      this.isZipVisible = true;
    }
    this.isCvvHideShow();
  }

  checkCVV() {
    if (this.isAdd) {
      var firstdigit = this.cardNumber.substring(0, 1);
      this.cvvMaxLength = firstdigit == "3" ? 4 : 3;
    } else {
      var firstdigit = this.cardNumber.substring(0, 1);
      // if number is not in edit mode and is amex
      if (firstdigit == "*" && this.isAMEXCard) {
        this.cvvMaxLength = 4;
      }
      // if card number is in edit mode and start with 3
      else if (firstdigit == "3") {
        this.cvvMaxLength = 4;
      } else {
        this.cvvMaxLength = 3;
      }
    }
  }

  MaskNumber() {
    this.cardNumber = this.AccountNumberControl.value;
    let twodigit = this.cardNumber.substring(0, 2);
    let threedigit = this.cardNumber.substring(0, 3);
    if (twodigit == "34" || twodigit == "37") {
      this.maskValue = this.creditCardService.getAmexMask();
      if (this.cardNumber.length == 16) {
        this.cardNumber = this.cardNumber.slice(0, -1);
      }
    } else {
      if (
        twodigit == "36" ||
        twodigit == "38" ||
        twodigit == "39" ||
        threedigit == "300" ||
        threedigit == "301" ||
        threedigit == "302" ||
        threedigit == "303" ||
        threedigit == "304" ||
        threedigit == "305"
      ) {
        this.DinerCard();
      } else {
        this.isDinerCard = false;
        this.maskValue = this.creditCardService.getDefaultMask();
        if (this.cardNumber.length == 16) {
          this.maskValue = this.creditCardService.getDefaultMask();
        }
      }
    }
    this.checkCVV();

    var sixdigit = this.cardNumber.substring(0, 6);
    if (sixdigit == "690066") {
      this.isCvvVisible = sixdigit == "690066" ? false : true;
    }
  }

  DinerCard() {
    this.isDinerCard = true;
    if (this.cardNumber.length == 14) {
      this.maskValue = this.creditCardService.getDinersMask(true);
    } else {
      this.maskValue = this.creditCardService.getDinersMask();
    }
  }
  ValidExpiryDate(event) {
    if (event.target.value.length == 5) {
      this.isInValid = false;
      var currentMonth = new Date().getMonth() + 1;
      var currentYear = new Date().getFullYear().toString();
      var intCurYear = Number(currentYear.substring(2, 5));
      var expiryDate = event.target.value;
      var month = expiryDate.substring(0, 2);
      var year = expiryDate.substring(3, 5);

      if (Number(month) > 12) {
        this.isInValid = true;
      }

      if (Number(year) < intCurYear) {
        this.isInValid = true;
      }
      if (Number(year) == intCurYear && Number(month) < currentMonth) {
        this.isInValid = true;
      }
    }
  }

  EnterExpiryDate(event) {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode == 13) {
      $("#wCardCVV").focus();
    }
    var expirydatelength = event.target.value.replace(/[_/]/g, "").length;
    if (expirydatelength == 4) {
      $("#wCardCVV").focus();
    }
  }

  SaveWallet() {
    if (!this.formGroup.valid) {
      return false;
    }
    const billingAddress = `${this.BillingAddress1Control.value || ""} ${
      this.BillingAddress2Control.value || ""
    }`;
    let objSaveWallet = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      createdBy: this.localstoragedataService.getLoginUserId(),
      macAddress: this.localstoragedataService.getLoginUserGuid(),
      walletId: this.walletId,
      accountId: this.accountId,
      accountName: this.AccountNameControl.value,
      routingNumber: this.RoutingNumberControl.value,
      ccNum: this.AccountNumberControl.value,
      expiry: this.ExpiryDateControl.value,
      cvv: this.CardCVVControl.value,
      billingZip: this.BillingZipControl.value,
      billingAddress: billingAddress == " " ? null : billingAddress,
      walletType:
        this.OptionType.value == "ach"
          ? 2
          : this.OptionType.value == "token"
          ? 9
          : 1,
      token: this.TokenControl.value,
      accountType: this.AccountTypeControl.value,
      checkType: this.CheckTypeControl.value,
      isPrimary: this.IsPrimaryControl.value,
    };

    this.donorService
      .SaveDonorWallet(objSaveWallet)
      .pipe()
      .subscribe(
        (res: any) => {
          this.isloading = false;
          if (res) {
            Swal.fire({
              title: "",
              text: "Donor wallet saved successfully",
              icon: "success",
              confirmButtonText: this.commonMethodService.getTranslate(
                "WARNING_SWAL.BUTTON.CONFIRM.OK"
              ),
              customClass: {
                confirmButton: "btn_ok",
              },
            });
            this.activeModal.dismiss();
            this.emtSaveWallet.emit(true);
          }
        },
        (error) => {
          this.isloading = false;
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

  EditCardNumber() {
    this.isEditable = false;
    this.cardNumber = "";
  }

  deleteWallet(walletId) {
    Swal.fire({
      title: this.commonMethodService.getTranslate("WARNING_SWAL.TITLE"),
      text: "You will not be able to recover this wallet!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: this.commonMethodService.getTranslate(
        "WARNING_SWAL.BUTTON.CANCEL.NO_KEEP_IT"
      ),
    }).then((result) => {
      if (result.value) {
        var eventGuId = this.localstoragedataService.getLoginUserEventGuId();
        var updatedBy = this.localstoragedataService.getLoginUserId();
        this.donorService
          .deleteDonorWallet(eventGuId, updatedBy, walletId)
          .subscribe(
            (res: any) => {
              if (res) {
                Swal.fire({
                  title: "Deleted!",
                  text: "Your wallet has been deleted.",
                  icon: "success",
                  confirmButtonText: this.commonMethodService.getTranslate(
                    "WARNING_SWAL.BUTTON.CONFIRM.OK"
                  ),
                  customClass: {
                    confirmButton: "btn_ok",
                  },
                });
                this.activeModal.dismiss();
                this.emtSaveWallet.emit(true);
              }
            },
            (error) => {
              this.isloading = false;
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
          text: "Your wallet is safe :)",
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

  closePopup() {
    this.activeModal.dismiss();
  }
  isCvvHideShow() {
    if (this.isAdd) {
      this.creditCardNumber = this.AccountNumberControl.value.substring(0, 3);
    } else {
      this.creditCardNumber = this.AccountNumberControl.value.substring(0, 3);
    }
    if (this.creditCardNumber == "659") {
      this.isCvvVisible = false;
      return;
    }
  }

  cardClearValidation() {
    this.AccountNumberControl.reset();
    this.AccountNumberControl.clearValidators();
    this.CardCVVControl.reset();
    this.CardCVVControl.clearValidators();
    this.ExpiryDateControl.reset();
    this.ExpiryDateControl.clearValidators();

    this.BillingAddress1Control.clearValidators();
    this.BillingAddress1Control.reset();
    this.BillingAddress2Control.clearValidators();
    this.BillingAddress2Control.reset();
    this.BillingZipControl.clearValidators();
    this.BillingZipControl.reset();
    this.IsPrimaryControl.reset();
    this.IsPrimaryControl.clearValidators();
    this.AccountNameControl.reset();
    this.AccountNameControl.clearValidators();
  }
  inItCardFiels() {
    this.tokenFieldsClearValidation();
    this.achFieldsClearValidation();
    this.AccountNumberControl.setValidators(
      Validators.compose([Validators.required])
    );
    this.ExpiryDateControl.setValidators(
      Validators.compose([Validators.required])
    );
  }
  inItAchFiels() {
    this.cardClearValidation();
    this.tokenFieldsClearValidation();
    this.AccountNameControl.setValidators(
      Validators.compose([Validators.required])
    );
    this.CheckTypeControl.setValidators(
      Validators.compose([Validators.required])
    );

    this.RoutingNumberControl.setValidators(
      Validators.compose([Validators.required])
    );
    this.AccountNumberControl.setValidators(
      Validators.compose([Validators.required])
    );
  }
  inItTokenFiels() {
    this.achFieldsClearValidation();
    this.cardClearValidation();
    this.TokenControl.setValidators(Validators.compose([Validators.required]));
  }
  inItFormGroup() {
    this.formGroup = this.fb.group({
      isPrimary: this.fb.control(""),
      accountName: this.fb.control(""),
      optionType: this.fb.control("card"),
      cardNumber: this.fb.control(""),
      expiryDate: this.fb.control(""),
      cardCVV: this.fb.control(""),
      billingAddress1: this.fb.control(""),
      billingAddress2: this.fb.control(""),
      billingZip: this.fb.control(""),
      checkType: this.fb.control("Personal"),
      accountType: this.fb.control(""),
      routingNumber: this.fb.control(""),
      accountNumber: this.fb.control(""),
      token: this.fb.control(""),
    });
  }
  achFieldsClearValidation() {
    this.CheckTypeControl.reset();
    this.CheckTypeControl.clearValidators();
    this.AccountTypeControl.reset();
    this.AccountTypeControl.clearValidators();
    this.RoutingNumberControl.reset();
    this.RoutingNumberControl.clearValidators();
    this.AccountNumberControl.reset();
    this.AccountNumberControl.clearValidators();
    this.IsPrimaryControl.reset();
    this.IsPrimaryControl.clearValidators();
    this.AccountNameControl.reset();
    this.AccountNameControl.clearValidators();
    if (this.isPrimaryValue) {
      this.IsPrimaryControl.setValue(true);
      this.isPrimary = true;
    }
  }
  tokenFieldsClearValidation() {
    this.TokenControl.reset();
    this.TokenControl.clearValidators();
    this.IsPrimaryControl.reset();
    this.IsPrimaryControl.clearValidators();
    this.AccountNameControl.reset();
    this.AccountNameControl.clearValidators();
  }
  updateVAlueAndValidator() {
    this.CheckTypeControl.updateValueAndValidity();
    this.AccountTypeControl.updateValueAndValidity();
    this.RoutingNumberControl.updateValueAndValidity();
    this.AccountNumberControl.updateValueAndValidity();
    this.IsPrimaryControl.updateValueAndValidity();
    this.AccountNameControl.updateValueAndValidity();
    this.TokenControl.updateValueAndValidity();
    this.IsPrimaryControl.updateValueAndValidity();
    this.AccountNameControl.updateValueAndValidity();
    this.AccountNumberControl.updateValueAndValidity();
    this.CardCVVControl.updateValueAndValidity();
    this.ExpiryDateControl.updateValueAndValidity();
    this.BillingAddress1Control.updateValueAndValidity();
    this.BillingAddress2Control.updateValueAndValidity();
    this.BillingZipControl.updateValueAndValidity();
    this.IsPrimaryControl.updateValueAndValidity();
    this.AccountNameControl.updateValueAndValidity();
  }
  updateFormValue() {
    this.walletType =
      this.walletType == "CC_Wallet" ||
      this.walletType == "Pledger Card" ||
      this.walletType == "CC_Error"
        ? "CARD"
        : this.walletType == "ACH"
        ? this.walletType
        : this.walletType == "Token"
        ? "TOKEN"
        : "";
    this.OptionType.patchValue(this.walletType.toLowerCase());
    this.IsPrimaryControl.patchValue(this.isPrimary);
    this.AccountNameControl.patchValue(this.accountName);
    this.AccountNumberControl.patchValue(this.cardNumber);
    this.ExpiryDateControl.patchValue(this.expiryDate);
    this.CardCVVControl.patchValue(this.cardCVV);
    this.BillingAddress1Control.patchValue(this.billingAddress);
    this.BillingZipControl.patchValue(this.billingZip);
    this.CheckTypeControl.patchValue(this.checkType);
    this.AccountTypeControl.patchValue(this.accountType);
    this.RoutingNumberControl.patchValue(this.routingNumber);
    this.TokenControl.patchValue(this.token);
    this.isEditableToken = this.token ? true : false;
  }
  editAccountNumber() {
    this.isEditable = false;
    this.accountNumberMask = "00000999999999999999";
  }
  editToken() {
    this.isEditableToken = false;
  }

  getFeatureSettingValues() {
    this.commonMethodService.featureName = "Save_new_wallet";
    this.commonMethodService.getFeatureSettingValues();
  }
  onUpgrade() {
    // this.activeModal.dismiss();
    this.commonMethodService.commenSendUpgradeEmail(
      this.commonMethodService.featureDisplayName
    );
  }
}
