import { HttpErrorResponse } from "@angular/common/http";
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
  Renderer2,
  ViewChild,
} from "@angular/core";
import {
  NgbActiveModal,
  NgbModalOptions,
  NgbPopover,
} from "@ng-bootstrap/ng-bootstrap";

import { Guid } from "guid-typescript";
import * as moment from "moment";
import { DaterangepickerDirective } from "ngx-daterangepicker-material";
import { Subject, Subscription, throwError, TimeoutError } from "rxjs";
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  shareReplay,
  takeUntil,
  tap,
} from "rxjs/operators";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { CardService } from "src/app/services/card.service";
import { DonorService } from "src/app/services/donor.service";
import { MessengerService } from "src/app/services/messenger.service";
import { PaymentService } from "src/app/services/payment.service";
import { PledgeService } from "src/app/services/pledge.service";
import Swal from "sweetalert2";
import { DonorCardPopupComponent } from "../../cards/donor-card-popup/donor-card-popup.component";
import { PaymentCardPopupComponent } from "../../cards/payment-card-popup/payment-card-popup.component";
import { PledgeCardPopupComponent } from "../../cards/pledge-card-popup/pledge-card-popup.component";
import { SendEmailreceiptPopupComponent } from "../../transaction/receipt-actions/send-emailreceipt-popup/send-emailreceipt-popup.component";
import { SendMailreceiptPopupComponent } from "../../transaction/receipt-actions/send-mailreceipt-popup/send-mailreceipt-popup.component";
import { SendTextreceiptPopupComponent } from "../../transaction/receipt-actions/send-textreceipt-popup/send-textreceipt-popup.component";
import { OptionTabPopupComponent } from "./../option-tab-popup/option-tab-popup.component";
import { PayPledgePopupComponent } from "./../pay-pledge-popup/pay-pledge-popup.component";

import { CreditCardService } from "src/app/services/helpers/credit-card.service";
import { Router } from "@angular/router";
import { DonorSaveComponent } from "../../donor/donor-save/donor-save.component";
import { CommonAPIMethodService } from "src/app/services/common-api-method.service";

import { PrintSingleReceiptPopupComponent } from "../../transaction/receipt-actions/print-singlereceipt-popup/print-singlereceipt-popup.component";
import { CampaignService } from "src/app/services/campaign.service";
import { PresetAmountService } from "src/app/services/presetAmounts.service";
import { UIPageSettingService } from "src/app/services/uipagesetting.service";
import { SavecardPopupComponent } from "../../cards/donor-card-popup/savecard-popup/savecard-popup.component";
import { TagObj } from "src/app/services/tag.service";
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { environment } from "./../../../../environments/environment";
import { HebrewEngishCalendarService } from "src/app/services/hebrew-engish-calendar.service";

import { EventService } from "src/app/services/event.service";
import { EmailAddressPopupComponent } from "../email-address-popup/email-address-popup.component";
import { PhoneNumberPopupComponent } from "../phone-number-popup/phone-number-popup.component";
import { AngularMultiSelect } from "src/app/commons/modules/angular-multi-select-module/multiselect.component";
import { LegalReceiptPopupComponent } from "../legal-receipt-popup/legal-receipt-popup.component";
import { PaymentTransactionService } from "src/app/services/payment-transaction.service";
import { LegalReceiptCountryPopupComponent } from "../legal-receipt-country-popup/legal-receipt-country-popup.component";
import { PaymentApiGatewayService } from "src/app/services/payment-api-gateway.service";
import { JoinAndUpperCasePipe } from "src/app/commons/text-transform.pipe";
import { DonaryDateFormatPipe } from "src/app/commons/donary-date-format.pipe";
import { NgbPopoverWindow } from "@ng-bootstrap/ng-bootstrap/popover/popover";
import { AnalyticsService } from "src/app/services/analytics.service";

declare var $: any;
@Component({
  selector: "app-add-transaction-popup",
  templateUrl: "./add-transaction-popup.component.html",
  styleUrls: ["./add-transaction-popup.component.scss"],
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddTransactionPopupComponent implements OnInit, AfterViewInit {
  modalOptions: NgbModalOptions;
  isCash: boolean = false;
  @Input() cardPledge: boolean = false;
  @ViewChild(PayPledgePopupComponent, { static: false })
  payPledge: PayPledgePopupComponent;
  @Output() emtPaymentTrans: EventEmitter<any> = new EventEmitter();
  @Output() emtPaymentTransSeatList: EventEmitter<any> = new EventEmitter();
  @ViewChild(DaterangepickerDirective, { static: false })
  pickerDirective: DaterangepickerDirective;
  @ViewChild("campaigndrp", { static: false }) dropdownRef: AngularMultiSelect;
  @ViewChild("donorNextButton", { static: false }) donorNext: ElementRef;
  @ViewChild("donorProcessButton", { static: false }) donorProcess: ElementRef;
  @ViewChild("paymentNextBtn", { static: false }) paymentNext: ElementRef;
  @ViewChild("paymentProcessBtn", { static: false }) paymentProcess: ElementRef;
  @ViewChild("cashNextBtn", { static: false }) cashNext: ElementRef;
  @ViewChild("cashProcessBtn", { static: false }) cashProcess: ElementRef;
  @ViewChild("pledgeNextBtn", { static: false }) pledgeNext: ElementRef;
  @ViewChild("peldgeProcessBtn", { static: false }) pledgeProcess: ElementRef;
  @ViewChild("donationAmt", { static: false }) donationAmtField: ElementRef;
  @ViewChild("donorSearch", { static: false }) donorSearchField: ElementRef;
  @ViewChild("amount10", { static: false }) amount10Field: ElementRef;
  @ViewChild("ccField", { static: false }) ccField: ElementRef;
  @ViewChild(NgbPopover, { static: false }) popContent: NgbPopover;
  @ViewChild("reasondrp", { static: false })
  reasondropdownRef: AngularMultiSelect;
  @ViewChild("locationdrp", { static: false })
  locationdropdownRef: AngularMultiSelect;
  @ViewChild("collectordrp", { static: false })
  collectiondropdownRef: AngularMultiSelect;

  @ViewChild("walletListContainer", { static: false })
  walletListContainer!: ElementRef;

  protected ngUnsubscribe: Subject<void> = new Subject<void>();
  isCreditCard: boolean = false;
  isloading2: boolean = true;
  isCharity: boolean = false;
  isAch: boolean = false;
  isNoAch: boolean = false;
  popTitle: any;
  isCheckNumber: boolean = false;
  isPledgePayment: boolean = false;
  isOJC: boolean = false;
  isOther: boolean = false;
  isDonorFund: boolean = false;
  isWallet: boolean = false;
  PageName: any = "AddTransaction";
  isOneDate: any = true;
  pledgeList: Array<any>;
  showBox: boolean = false;
  isRecordHovered = false;
  isPledgeCard: boolean = false;
  creditCardNumber: any = "";
  donorFundCCNumber: any = "";
  oldcreditCardNumber: any = "";
  isZipVisible: boolean = true;
  creditCardOJCNumber: any = "";
  refNumber: any = "";
  nopledgeMessage: string = "";
  creditCardCVV: any = "";
  oldcreditCardCVV: any = "";
  creditCardZip: any = "";
  oldcreditCardZip: any = "";
  expDate: any = "";
  oldexpDate: any = "";
  expOJCDate: any = "";
  checkNumber: any = "";
  oldcheckNumber: any = "";
  payOffPledges: any = [];
  pledgeDataIfAmountNotUpdated: any = [];
  availableAmt = 0.0;
  maskCreditValue: string;
  maskOJCValue: string;
  cvvMaxLength: number = 3;
  pledgeId: number;
  isCvvVisible: boolean = true;
  isActionloading: boolean = false;
  isPledgeDisabled: boolean = false;
  isPayoffPledgeDisable: boolean = false;
  ispayoffPledgeTabSelected: boolean = false;
  isRoundIcon: boolean = false;
  disablePledgeProcess: boolean = false;
  selectedWalletId: number = null;
  oldselectedWalletId: number = null;
  isLockCollector: boolean;
  isLockLocation: boolean;
  isLockCampaign: boolean;
  isLockReason: boolean;
  isLockDate: boolean;
  isOptionList: boolean = true;
  isPaymentList: boolean = false;
  isCollectorDropdown: boolean = false;
  isLocationDropdown: boolean = false;
  isCampaignDropdown: boolean = false;
  isReasonDropdown: boolean = false;
  isDateSelection: boolean = false;
  collectorList: any = [];
  locationList: any = [];
  campaignList: any = [];
  reasonList: any = [];
  selectedCollector: string;
  selectedLocation: string;
  selectedCampaign: string;
  selectedReason: string;
  selectedReasonId: number;
  selectedCampaignId: number = 0;
  campaignIDFromSeat: number = 0;
  selectedCollectorId: number;
  selectedLocationId: number;
  selectedDate: any = { startDate: moment(new Date()) };
  isPaymentTab: boolean = false;
  objScheduleData: any = [];
  scheduleDonationAmount: string;
  scheduleCount: string;
  selectedScheduleStartDate: any;
  scheduleAmtPerPayment: string;
  scheduleFrequency: any;
  paymentModeDetail: string;
  isloading: boolean = false;
  isloadingdonor: boolean = false;
  isPaymentModeList: boolean = true;
  showMoreOption: boolean = true;
  selectedDonor: string;
  selectedAmount: number;
  selectedDonorId: number = null;
  isDonorSelected: boolean = false;
  showRemoveDonorIcon: boolean = false;
  isInValid: boolean = false;
  isExpiryDateValid: boolean = false;
  paymentMethodId: number = 0;
  isSaveCard: boolean = false;
  isAmountTab: boolean = false;
  fullNameJewish: string;
  displayText: string;
  defaultLocation: string;
  address: string;
  father: string;
  fatherInLaw: string;
  accountNum: string;
  phoneNumber: string;
  accountId: number;
  isReadOnly = false;
  isPaymentDone = false;
  showTransaction = true;
  isError = false;
  isSuccess = false;
  donorname: string;
  paymentStatus: string;
  isPaymentExist: boolean = false;
  errorMessage: string;
  receiptNum: number;
  paymentId: number;
  donorJewishname: string;
  email: string;
  emailLabel: string;
  phoneLabel: string;
  paymentAccountId: number = 0;
  disableTitle: string = "";
  payPledgeToolTip: string = "";
  pledgeCount: number = 0;
  pledgeRemainingAmount: number = 0;
  showTooltip: boolean = false;
  isCloseTooltip: boolean = true;
  disableValue: boolean = true;
  checkSchedule: boolean = false;
  isFutureDate: boolean = false;
  uniqueTransactionId: Guid;
  oldTransactionId: Guid = null;
  oldSelectedDonorId: number = null;
  oldSelectedAmount: number = null;
  oldpaymentMethodId: number = null;
  note: string;
  phone: number;
  successMessage: string;
  getPayPledgeList: boolean = false;
  type: string;
  printActionBtn: string;
  textActionBtn: string;
  mailActionBtn: string;
  emailActionBtn: string;
  walletList = [];
  donorlist = [];
  isGlobalList: boolean = true;
  displaySearchIcon = false;
  isDonorSelect: boolean = false;
  isPayPledgeError: boolean = false;
  isCampaignSelect: boolean = false;
  isWalletFound = false;
  userName: string;
  inValidCCNum: boolean = false;
  inValidDonorFundNum: boolean = false;
  inValidOJCNum: boolean = false;
  cityStateZip: string;
  emails: string;
  phones: string;
  phoneLabels: string;
  additionalPhones: string;
  additionalPhoneLabels: string;
  countryCodeId: string;
  additionalEmailLabels: string;
  additionalEmail: string;
  isOpenCampaign: boolean = false;
  initalpymtType = 0;
  isDonorSkipped = false;
  isSearchDisable: boolean = true;
  isLocationGLobal = false;
  ojcValidationMsg = false;
  selectedDonorIndex = 0;
  accountList = [];
  keyword: string;
  caretPresent = false;
  equalPresent = false;
  cardReaderNum: string = "";
  localStorageArray = {
    selectedCollectorId: null,
    selectedCollector: null,
    selectedLocation: null,
    selectedCampaign: null,
    selectedReason: null,
    selectedReasonId: null,
    selectedCampaignId: null,
    selectedLocationId: null,
    selectedDate: null,
    isLockLocation: false,
    isLockCollector: false,
    isLockCampaign: false,
    isLockReason: false,
    isLockDate: false,
  };
  bulkDonorList: any = [];
  txtQuery: string;
  isDonorBulkSelected = false;
  pledgeinternalnotes: string;
  pledgeexternalnotes: string;
  isTxtCardHolderName = false;
  cardHolderName: string;
  refNum: string;
  phonenumbers;
  emailList;
  isCampaignRequired: boolean = false;
  isReasonRequired: boolean = false;
  seatId: Number;
  label: String;
  seatReservedType: String;
  isSeatPayNow: boolean = false;
  globalId: number;
  uiPageSettingId = null;
  uiPageSetting: any;
  savedDefault: boolean = false;

  exportEmailList = [];
  exportPhoneList = [];
  exportAddressList = [];
  phoneList: [];
  fullName: string;
  group: string;
  class: string;
  totalPayments: string;
  totalPledges: string;
  totalSchedules: string;
  totalRaised: number = 0;
  changelog: string;
  mostRecentPayment: string;
  mostRecentPaymentDate: string;
  mostRecentPledge: string;
  mostRecentPledgeDate: string;
  upcomingScheduleDate: string;
  lstPhoneNumber: [];
  lstEmail: [];
  lstAddress: [];
  fatherId: number;
  fatherInLawId: number;
  fatherName: string;
  fatherInLawName: string;
  locationDetails: any;
  accountWalletDetails: any;
  totalLocationsCount: number;
  fatherNameJewish: string;
  fatherInLawNameJewish: string;
  locationGridData: Array<any>;
  advancedFieldValues: any[] = [];
  isDonorActive: boolean;
  lstDonorReceiptLog: Array<any>;
  lstRelatedNotifications: Array<any>;
  donorTagList: Array<TagObj> = [];
  families = [];
  familyMember = [];

  isEnableACH: string;
  isDevEnv: boolean;

  isDropDownOpen: boolean = false;
  isSmsDropDownOpen: boolean = false;
  fullCount: number = 0;
  EmailCheckbox: boolean = false;
  PhoneCheckbox: boolean = false;

  public formatAmt$ = new Subject<string>();

  // for swipe
  public sulKioskKeyUp = new Subject<KeyboardEvent>();
  public manualKeyUp = new Subject<KeyboardEvent>();

  public ccInputEvent = new Subject<KeyboardEvent>();
  isSwipe = false;

  isVisaCard: boolean = true;
  isDinerCard: boolean = true;
  isMasterCard: boolean = true;
  isAmericanExpress: boolean = true;
  isDiscoverCard: boolean = true;
  isMatbiaCard: boolean = true;
  isOJCCard: boolean = true;
  isDonorFundCard: boolean = true;
  isPledgerCard: boolean = true;
  isSwipeLoader: boolean = false;
  isGlobalId: boolean = false;
  presetAmountList: Array<any>;
  isDefaultCls: string;
  seatPrice: string;

  currencies = [];
  currency: string;
  symbol: string;
  scheduleToggle: boolean = false;
  achForm: UntypedFormGroup;
  payCallSubscription!: Subscription;
  isFromBuilkDonarList: false;
  notifyDonarEmailArray = [];
  notifyDonarEmail: any;
  isNotifyDonarEmailShow = false;
  notifyDonarPhoneArray = [];
  notifyDonarPhoneNumber: any = { phone: "Select Phone", label: "" };
  @Input() pledgePaid: any;
  @Input() paidStatus: string;
  EngHebCalPlaceholder: string = moment(new Date()).format("MM/DD/YYYY");
  class_id: string;
  class_hid: string;

  iconClasses = ["icn-loader", "icn-success", "icn-danger"];
  isEmailLoading: boolean = false;
  isEmailSuccess: boolean = false;
  isEmailError: boolean = false;

  isPhoneLoading: boolean = false;
  isPhoneSuccess: boolean = false;
  isPhoneError: boolean = false;

  private calendarSubscription: Subscription;
  defaultCardDonorLength: any = 0;
  selectCardDonorLength: any;
  selectedDonorLength: any;
  listLength: any = 0;
  donorListWallets: any;
  DonorsList: any;
  donorWithoutWallet: any;
  walletIds: any[];
  isPaymentCredit: boolean = false;
  valueFromPopup: any;
  gridFilterData: any;
  paymentType: string = "";
  OtherCurrencyId: boolean = false;
  checkboxemail: any = "";
  paymentDetails: any;
  isOpenFromCard: boolean = false;
  cardtype: any;
  phoneResult: any;
  emailResult: any[];
  isVisited: boolean = false;
  isPaymentVisited: boolean;
  tempemailCheckbox: boolean = false;
  tempnotifyDonarEmail: any;
  isPaymentFailed: boolean = false;
  isCalldonorApi: boolean = false;
  showNotifySection: boolean = true;
  isGenerateReceiptDisable: boolean = false;
  isBulkDonorList: boolean = false;
  receiptGenerated: boolean = false;
  get BankType() {
    return this.achForm.get("bankType");
  }

  get AccountType() {
    return this.achForm.get("accountType");
  }

  get NameOnAccount() {
    return this.achForm.get("nameOnAccount");
  }

  get RoutingNumber() {
    return this.achForm.get("routingNumber");
  }

  get AccountNumber() {
    return this.achForm.get("accountNumber");
  }

  get Note() {
    return this.achForm.get("note");
  }

  private _payTransactionSubject = new Subject();

  get payTransactionSubject() {
    return this._payTransactionSubject.asObservable();
  }

  private analytics = inject(AnalyticsService);

  get transformedPaymentModeDetail() {    
    return (
      
      this.paymentModeDetail?.split(" ").join("").toUpperCase() //||
      //this.paymentDetails
    );
  }

  constructor(
    private readonly changeDetectorRef: ChangeDetectorRef,
    public commonMethodService: CommonMethodService,
    private campaignService: CampaignService,
    private presetAmountService: PresetAmountService,
    private donorService: DonorService,
    private renderer: Renderer2,
    public activeModal: NgbActiveModal,
    private cardService: CardService,
    private localstoragedataService: LocalstoragedataService,
    private paymentService: PaymentService,
    private pledgeService: PledgeService,
    private messengerService: MessengerService,
    private creditCardService: CreditCardService,
    private router: Router,
    private commonAPIMethodService: CommonAPIMethodService,
    private uiPageSettingService: UIPageSettingService,
    private fb: UntypedFormBuilder,
    public hebrewEngishCalendarService: HebrewEngishCalendarService,
    private eventService: EventService,
    private paymentTransactionService: PaymentTransactionService,
    public paymentApiGatewayService: PaymentApiGatewayService,
    private datePipe: DonaryDateFormatPipe,
    private cdr:ChangeDetectorRef
  ) {}

  @Input() set donorDetails(donorDetailsValue: any) {
    if (donorDetailsValue) {
      this.GetSetting();
      if (donorDetailsValue.paymentDetails) {
        this.paymentDetails = donorDetailsValue.paymentDetails;
      }
      if (donorDetailsValue.type) {
      }
      this.isOpenFromCard = true;
      //this.isloadingdonor=true;
      if (!!donorDetailsValue.pledgeId) {
        this.pledgeDataIfAmountNotUpdated.push({
          pledgeID: donorDetailsValue.pledgeId,
          paidAmount: donorDetailsValue.amountToPay,
          remainingAmount: 0,
        });
      }
      if (donorDetailsValue.accountId) {
        this.selectedDonorId = donorDetailsValue.accountId;
      }
      this.isDonorSelected = true;
      this.isAmountTab = true;
      this.isReadOnly = true;
      this.selectedDonor =
        donorDetailsValue.jewishname != null
          ? donorDetailsValue.jewishname
          : donorDetailsValue.fullname;
      this.isPledgeCard = donorDetailsValue.isPledgeCard;
      this.globalId = donorDetailsValue.globalId;
      this.isGlobalId = donorDetailsValue.globalId == 688008 ? true : false;
      this.isDefaultCls = this.isGlobalId ? "default-donor" : "";
      this.donorService
        .getDonorById(
          this.localstoragedataService.getLoginUserEventGuId(),
          donorDetailsValue.accountId
        )
        .subscribe((res: any) => {
          if (res) {
            this.additionalPhoneLabels = res.phoneLabels; //added new

            this.additionalPhones = res.phonenumbers; //added new

            this.additionalEmailLabels = res.emailLabels;
            this.additionalEmail = res.emails;
            this.displayText =
              (donorDetailsValue.fullname != null
                ? donorDetailsValue.fullname + " / "
                : "") +
              "" +
              (donorDetailsValue.jewishname != null
                ? donorDetailsValue.jewishname
                : "");
            this.fullNameJewish = res.fullNameJewish;
            this.defaultLocation = res.defaultLocation;
            this.address = res.address;
            this.father = res.father;
            this.fatherInLaw = res.fatherInLaw;
            this.phoneNumber =
              this.commonMethodService.setDonorPhoneNumber(res);
            this.accountNum = res.accountNum;
            this.accountId = res.accountId;
            this.selectedDonorId = res.accountId;
            this.GetWalletList();

            this.showBox = false;
            if (this.isPledgeCard) {
              this.getPayPledgeList = false;
              this.pledgeId = donorDetailsValue.pledgeId;
              this.selectedAmount = donorDetailsValue.balance;

              this.isAmountTab = false;
              this.isPaymentTab = true;
            } else {
              this.getPayPledgeList = true;
            }
            setTimeout(() => {
              this.donationAmtField.nativeElement.focus(), 10;
            });

            //code for adding email & phone numbers
            const item = res; // Assuming res is now a single object
            const emails = item.emails ? item.emails.split(",") : [];
            const emailLabels = item.emailLabels
              ? item.emailLabels.split(",")
              : [];
            const emailResult = this.margeKeyValue(
              emails,
              emailLabels,
              "email"
            );

            const phoneNumber = item.additionalPhoneNumbers
              ? item.additionalPhoneNumbers.split(",")
              : [];
            const phoneLabels = item.additionalPhoneLabels
              ? item.additionalPhoneLabels.split(",")
              : [];
            const phoneResult = this.margeKeyValue(
              phoneNumber,
              phoneLabels,
              "phone"
            );

            const donarDetails = { email: emailResult, phone: phoneResult };

            this.notifyDonarEmailArray =
              donarDetails && donarDetails.email ? donarDetails.email : [];
            this.notifyDonarEmail =
              this.notifyDonarEmailArray.length > 0
                ? this.notifyDonarEmailArray[0]
                : "";

            if (!this.isNotifyDonarEmailShow) {
              this.notifyDonarEmail = {
                email: "Select Email",
                label: "",
              };
            }

            this.EmailCheckbox =
              this.notifyDonarEmail &&
              this.notifyDonarEmail.email != "Select Email";
            this.tempemailCheckbox = this.EmailCheckbox;
            this.tempnotifyDonarEmail = this.notifyDonarEmail;
            this.notifyDonarPhoneArray =
              donarDetails && donarDetails.phone ? donarDetails.phone : [];
          }
        });
      //this.commonMethodService.onDonorSearchFieldChange(donorDetailsValue.jewishname)
      // setTimeout(() => this.SelectDonor(donorDetailsValue.accountId), 10000);
    }
  }

  @Input() set alertDonorDetails(donorDetails: any) {
    if (donorDetails) {
      //this.isloadingdonor=true;
      this.isDonorSelected = true;
      this.isAmountTab = true;
      this.isReadOnly = true;
      this.selectedDonor = donorDetails.donorName;
      this.isGlobalId = false;
      this.campaignList = this.commonMethodService.localCampaignList.filter(
        (s) => s.id == donorDetails.campaignID
      );
      this.donorService
        .getDonorById(
          this.localstoragedataService.getLoginUserEventGuId(),
          donorDetails.accountID
        )
        .subscribe((res: any) => {
          if (res) {
            this.phoneLabels = res.phoneLabels; //added new
            this.phonenumbers = res.phonenumbers; //added new
            this.emailList = res.accountEmails;
            this.displayText = donorDetails.donorName;
            this.fullNameJewish = res.fullNameJewish;
            this.defaultLocation = res.defaultLocation;
            this.address = res.address;
            this.father = res.father;
            this.fatherInLaw = res.fatherInLaw;
            this.phoneNumber =
              this.commonMethodService.setDonorPhoneNumber(res);
            this.accountNum = res.accountNum;
            this.accountId = res.accountId;
            this.selectedDonorId = res.accountId;
            this.showBox = false;
            this.getPayPledgeList = true;
            this.selectedAmount = donorDetails.recordAmount;
            this.isAmountTab = true;
            this.objScheduleData = {
              count: donorDetails.scheduleInfo.recurrenceCount,
              donationAmount: donorDetails.recordAmount,
              frequency: donorDetails.scheduleInfo.recurrenceFrequency,
              checked: true,
              startDate: moment(new Date()),
              isAlert: true,
              amtPerPayment: donorDetails.scheduleInfo.recurrenceAmount,
            };
            this.submitScheduleData(this.objScheduleData);
            this.GetWalletList();
            $("#schedulePaymentTab").addClass("active");
            $("#moreOptionsTab").removeClass("active");
            $("#moreOptions").removeClass("active show");
            $("#schedulePayment").addClass("active show");

            setTimeout(() => {
              this.donationAmtField.nativeElement.focus(), 10;
            });
          }
        });
      //this.commonMethodService.onDonorSearchFieldChange(donorDetailsValue.jewishname)
      // setTimeout(() => this.SelectDonor(donorDetailsValue.accountId), 10000);
    }
  }

  @Input() set BulkDonorList(list) {
    this.isBulkDonorList = true;
    this.bulkDonorDetails(list);
  }

  @Input() set AccountIdList(ids) {
    this.accountList = ids;
    setTimeout(() => {
      this.OpenAmountTab("donationTab");
      this.changeDetectorRef.detectChanges();
    }, 100);
  }
  @Input() set IsFromBuilkDonarList(item) {
    this.isFromBuilkDonarList = item;
  }
  seatEmail: any;
  seatPhone: any;
  @Input() set SeatData(item) {
    if (item) {
      this.seatId = item.seatId;
      this.label = item.label;
      this.seatReservedType = item.seatReservedType;
      this.isSeatPayNow = item.isSeatPayNow;
      this.selectedAmount = item.price;
      this.commonMethodService.getPledgeAmount(this.selectedAmount);
      this.seatPrice = item.price;
      this.campaignList = this.commonMethodService.localCampaignList.filter(
        (s) => s.id == item.campaignId
      );
      this.selectedCampaignId = item.campaignId;
      this.campaignIDFromSeat = item.campaignId;
      this.seatEmail = item.Email;
      this.seatPhone = item.Phone;
      this.selectNotifyDonarEmail(this.seatEmail);
      this.selectNotifyDonarPhone(this.seatPhone);
      this.donorService
        .getDonorById(
          this.localstoragedataService.getLoginUserEventGuId(),
          item.donorId
        )
        .subscribe((res: any) => {
          if (res) {
            this.isDonorSelected = true;
            this.isAmountTab = true;
            this.isReadOnly = true;
            this.selectedDonor =
              res.fullNameJewish != null ? res.fullNameJewish : res.fullName;
            this.phoneLabels = res.phoneLabels; //added new
            this.phonenumbers = res.phonenumbers; //added new
            this.emailList = res.accountEmails;
            // this.displayText = (donorDetailsValue.fullname != null ? donorDetailsValue.fullname + " / " : "") + "" + (donorDetailsValue.jewishname != null ? donorDetailsValue.jewishname : "");
            this.displayText =
              (res.fullName != null ? res.fullName + " / " : "") +
              "" +
              (res.fullNameJewish != null ? res.fullNameJewish : "");
            this.fullNameJewish = res.fullNameJewish;
            this.defaultLocation = res.defaultLocation;
            this.address = res.address;
            this.father = res.father;
            this.fatherInLaw = res.fatherInLaw;
            this.phoneNumber =
              this.commonMethodService.setDonorPhoneNumber(res);
            this.accountNum = res.accountNum;
            this.accountId = res.accountId;
            this.selectedDonorId = res.accountId;
            this.GetWalletList();

            this.showBox = false;
            this.getPayPledgeList = true;
            this.pledgeId = item.pledgeId;
            this.isAmountTab = false;

            setTimeout(() => {
              this.donationAmtField.nativeElement.focus(), 10;
            });
          }
        });
    }
  }

  isShortcut: boolean = false;
  ngOnInit() {
    this.isDevEnv =
      environment.releaseFeature.isSelectCountryInAddAPIKeyRelease;
    this.EngHebCalPlaceholder = this.datePipe.transform(
      this.EngHebCalPlaceholder,
      "short"
    );
    this.GetSetting();
    this.commonMethodService.getSettings();
    this.getAllPaymentAPIGateway();
    this.getFeatureSettingValues();

    this.commonMethodService.isBackTranctionCliked = false;
    this.commonMethodService.isFrequencyError = false;
    this.formatAmt$
      .pipe(
        debounceTime(1000) // discard emitted values that take less than the specified time between output
      )
      .subscribe((term: any) => {
        this.SelectAmount(term);
      });
    this.commonMethodService.donorList = [];
    $(document).ready(function () {
      let modalContent: any = $(".modal");
      modalContent.draggable({
        handle:
          ".modal__custom_header,.modal__custom_footer_inside,.modal_custom_footer",
        cursor: "grab",
      });
    });
    if (
      localStorage.getItem("user_storage") == null ||
      this.localstoragedataService.getLoginUserGuid() == null
    ) {
      this.router.navigate(["auth"]);
      this.activeModal.dismiss();
    }
    this.disableValue = true;
    this.uniqueTransactionId = Guid.create();
    var eventGuid = this.localstoragedataService.getLoginUserEventGuId();
    this.userName =
      this.localstoragedataService.getLoginUserUserName() + "-" + eventGuid;
    if (JSON.parse(localStorage.getItem(this.userName))) {
      this.localStorageArray = JSON.parse(localStorage.getItem(this.userName));
      this.selectedCollectorId = +JSON.parse(
        localStorage.getItem(this.userName)
      ).selectedCollectorId;
      this.selectedCollector = JSON.parse(
        localStorage.getItem(this.userName)
      ).selectedCollector;
      this.selectedLocation = JSON.parse(
        localStorage.getItem(this.userName)
      ).selectedLocation;
      this.selectedLocationId = +JSON.parse(localStorage.getItem(this.userName))
        .selectedLocationId;
      this.selectedReason = JSON.parse(
        localStorage.getItem(this.userName)
      ).selectedReason;
      this.selectedReasonId = +JSON.parse(localStorage.getItem(this.userName))
        .selectedReasonId;
      this.selectedCampaign = JSON.parse(
        localStorage.getItem(this.userName)
      ).selectedCampaign;
      this.selectedCampaignId =
        this.selectedCampaignId == 0
          ? +JSON.parse(localStorage.getItem(this.userName)).selectedCampaignId
          : this.selectedCampaignId;

      this.isLockLocation = JSON.parse(
        localStorage.getItem(this.userName)
      ).isLockLocation;
      this.isLockCollector = JSON.parse(
        localStorage.getItem(this.userName)
      ).isLockCollector;
      this.isLockReason = JSON.parse(
        localStorage.getItem(this.userName)
      ).isLockReason;
      this.isLockCampaign = JSON.parse(
        localStorage.getItem(this.userName)
      ).isLockCampaign;
      this.isLockDate = JSON.parse(
        localStorage.getItem(this.userName)
      ).isLockDate;
      this.collectorList = this.commonMethodService.localCollectorList.filter(
        (s) => s.id == this.selectedCollectorId
      );
      this.campaignList =
        this.campaignList.length > 0
          ? this.campaignList
          : this.commonMethodService.localCampaignList.filter(
              (s) => s.id == this.selectedCampaignId
            );
      this.reasonList = this.commonMethodService.localReasonList.filter(
        (s) => s.id == this.selectedReasonId
      );
      this.locationList =
        this.commonMethodService.paymentGlobalLocationList.filter(
          (s) => s.id == this.selectedLocationId
        );
      // var slctDate = JSON.parse(localStorage.getItem(this.userName)).selectedDate;
      // if (slctDate != undefined) {
      //   this.selectedDate = { startDate: moment(slctDate) };
      // }
    }
    if (this.campaignList != undefined) {
      this.setPresetAmount();
    }

    this.commonMethodService.txtQuery = "";
    //
    if (this.commonMethodService.localDonorList.length == 0) {
      this.commonMethodService.getDonorList();
    }

    // setTimeout(() => {
    //   this.ccField.nativeElement.value = '%B4111111111111111^FISCH/JOEL^24062011906875870000000000000000?;4111111111111111=240620119067941700000?+?';
    //   this.ccField.nativeElement.dispatchEvent(new KeyboardEvent("keyup", {keyCode: 13}), )
    // }, 10000);

    // setTimeout(() => {
    //   this.ccField.nativeElement.value = '%B4263982640269299^FISCH/JOEL^23022011906875870000000000000000?;4263982640269299=230220119067941700000?+?';
    //   this.ccField.nativeElement.dispatchEvent(new KeyboardEvent("keyup", {keyCode: 13}), )
    // }, 20000);

    this.sulKioskKeyUp
      .pipe(
        debounceTime(150),
        filter((e: KeyboardEvent) => e.keyCode === 13),
        map((event) => (event.target as HTMLInputElement).value),
        filter((val: string | null) => val && val.includes("%")),
        tap(() => {
          this.creditCardNumber = "";
          this.maskCreditValue = "";
          this.changeDetectorRef.detectChanges();
        }),
        debounceTime(150),
        distinctUntilChanged()
      )
      .subscribe((val: string) => {
        const readedData = this.creditCardService.parseMagneticStrip(val);
        this.creditCardNumber = readedData.cardNumber;
        this.expDate = readedData.expDate;
        this.changeDetectorRef.detectChanges();

        let twodigit = this.creditCardNumber.substring(0, 2);
        if (twodigit == "34" || twodigit == "37") {
          this.maskCreditValue = this.creditCardService.getAmexMask();
        } else {
          this.maskCreditValue = this.creditCardService.getDefaultMask();
        }

        this.creditCardCVV = "";

        this.checkCardAndExpValidation();
        this.changeDetectorRef.detectChanges();
      });

    this.manualKeyUp
      .pipe(
        debounceTime(150),
        map((event) => (event.target as HTMLInputElement).value),
        filter((val: string | null) => val && !val.includes("%")),
        debounceTime(150),
        distinctUntilChanged()
      )
      .subscribe((val: string) => {
        this.ChangeCreditMask();
        this.changeDetectorRef.detectChanges();
        this.checkCardAndExpValidation();
        this.changeDetectorRef.detectChanges();
      });

    this.ccInputEvent
      .pipe(
        debounceTime(100),
        distinctUntilChanged(),
        tap(() => {})
      )
      .subscribe((e) => {
        this.CardReader(e);
      });
    this.getOptionUISetting();
    this.getCurrencies();
    this.achFormInit();
    this.isEnableACH = this.commonMethodService.isACH;
    this.payCallSubscription = this.payTransactionSubject
      .pipe(
        debounceTime(2000) // Debounce for 2 seconds
      )
      .subscribe(() => {
        this.callPayApi(); // This function contains your API call logic
      });

    this.getPartiallyPaidBalance();

    this.hebrewEngishCalendarService.hebFromDateTodate = "";

    if (this.commonMethodService.localCampaignList.length == 0) {
      this.commonMethodService.getCampaignList();
    }
    if (this.commonMethodService.localCollectorList.length == 0) {
      this.commonMethodService.getCollectorList();
    }
    if (this.commonMethodService.localReasonList.length == 0) {
      this.commonMethodService.getReasonList();
    }
    if (this.commonMethodService.localLocationList.length == 0) {
      this.commonMethodService.getLocationList();
    }
  }

  getAllPaymentAPIGateway() {
    let eventGuId = this.localstoragedataService.getLoginUserEventGuId();
    this.paymentApiGatewayService
      .getAllPaymentAPIGateway(eventGuId)
      .subscribe((res: any) => {
        res.forEach((item) => {
          if (!(item.countryCodeId == 1 || item.countryCodeId == null)) {
            this.OtherCurrencyId = true;
            if (this.isDevEnv) {
              this.showNotifySection = false;
            }
          }
        });
      });
  }
  bulkDonorDetails(list) {
    this.DonorsList = list;
    this.listLength = list.length;
    if (list) {
      this.selectedDonor = "(" + list.length + ")";
      for (var res of list) {
        var donordetails: any = [];
        donordetails = {
          displayText:
            (res[0].fullName != "" ? res[0].fullName + " / " : "") +
            "" +
            (res[0].fullNameJewish != "" ? res[0].fullNameJewish : ""),
          fullNameJewish: res[0].fullNameJewish,
          defaultLocation: res[0].defaultLocation,
          address: res[0].address,
          father: res[0].father,
          fatherInLaw: res[0].fatherInLaw,
          phoneNumber: res[0].phoneLabels2,
          accountNum: res[0].accountNum,
          accountId: res[0].accountId,
          selectedDonorId: res[0].accountId,
        };
        this.bulkDonorList.push(donordetails);
        this.isDonorBulkSelected = true;
        this.isDonorSelected = true;
        this.showBox = false;
        if (
          !this.CheckPaymentValidation(this.paymentMethodId) ||
          this.selectedAmount == undefined
        ) {
          setTimeout(() => {
            this.donorNext.nativeElement.focus(), 10;
          });
        } else if (
          this.CheckPaymentValidation(this.paymentMethodId) &&
          this.selectedAmount != 0 &&
          this.selectedAmount != undefined
        ) {
          setTimeout(() => {
            this.donorProcess.nativeElement.focus(), 10;
          });
        }
      }
    }
  }
  getOptionUISetting() {
    let objLayout = {
      uiPageSettingId: this.uiPageSettingId,
      userId: this.localstoragedataService.getLoginUserId(),
      moduleName: "new transactions",
      screenName: "options",
    };
    this.uiPageSettingService.Get(objLayout).subscribe((res: any) => {
      if (res) {
        this.savedDefault = true;
        this.uiPageSettingId = res.uiPageSettingId;
        this.uiPageSetting = JSON.parse(res.setting);
        this.collectorList =
          this.uiPageSetting.collectorId != 0
            ? this.commonMethodService.localCollectorList.filter(
                (s) => s.id == this.uiPageSetting.collectorId
              )
            : [];
        this.campaignList =
          this.uiPageSetting.campaignId != 0
            ? this.commonMethodService.localCampaignList.filter(
                (s) => s.id == this.uiPageSetting.campaignId
              )
            : [];
        this.reasonList =
          this.uiPageSetting.paymentReasonId != 0
            ? this.commonMethodService.localReasonList.filter(
                (s) => s.id == this.uiPageSetting.paymentReasonId
              )
            : [];

        this.locationList =
          this.uiPageSetting.locationId != 0
            ? this.commonMethodService.paymentGlobalLocationList.filter(
                (s) => s.id == this.uiPageSetting.locationId
              )
            : [];
        this.selectedCampaign =
          this.campaignList &&
          this.campaignList.length > 0 &&
          this.campaignList[0].itemName;
        (this.selectedCampaignId = this.uiPageSetting.campaignId),
          (this.selectedCollectorId = this.uiPageSetting.collectorId),
          (this.selectedLocationId = this.uiPageSetting.locationId),
          (this.selectedReasonId = this.uiPageSetting.paymentReasonId);
      } else {
        this.collectorList = "";
        this.campaignList = "";
        this.reasonList = "";
        this.locationList = "";
        this.selectedCampaign = "";
        (this.selectedCampaignId = null),
          (this.selectedCollectorId = null),
          (this.selectedLocationId = null),
          (this.selectedReasonId = null);
      }
    });
  }

  ngAfterViewInit() {
    if (this.isDonorSelected) {
      $("#donorInfo").removeClass("active show");
      $("#donationAmount").addClass("active show");
      $("#donorTab").removeClass("active");
      $("#donorAmtTab").addClass("active");
    } else {
      this.donorSearchField.nativeElement.focus();
    }
    if (this.isPledgeCard) {
      this.OpenAmountTab("paymentTab");
    }

    if (this.isSeatPayNow) {
      this.OpenAmountTab("paymentTab");
    }
  }

  ngOnDestroy() {
    // This aborts all HTTP requests.
    this.ngUnsubscribe.next();
    this.payCallSubscription.unsubscribe();
    // This completes the subject properlly.
    this.ngUnsubscribe.complete();
  }

  setPresetAmount() {
    if (this.campaignList.length > 0) {
      let campaign = this.campaignList;
      let eventGuid = this.localstoragedataService.getLoginUserEventGuId();
      this.campaignService
        .getCampaigns("", "", "", eventGuid)
        .subscribe((res: any) => {
          if (res) {
            let presetAmount = res.filter(
              (x) => x.campaignId == campaign[0].id
            );
            this.presetAmountList = presetAmount[0].presetAmounts;
            if (this.presetAmountList.length == 0) {
              this.getPresetAmountList();
            }
          }
        });
    }
    if (this.presetAmountList == undefined) {
      this.getPresetAmountList();
    }
  }

  getPresetAmountList() {
    this.presetAmountService.getPresetAmount().subscribe((res: any) => {
      if (res) {
        this.presetAmountList = res;
      }
    });
  }

  checkCardAndExpValidation() {
    var cardlength = this.creditCardNumber.length;
    var masklength = this.maskCreditValue.replace(/[-]/g, "").length;
    if (cardlength == masklength) {
      var result = this.creditCardService.luhnCheck(this.creditCardNumber);
      if (result == true) {
        this.inValidCCNum = false;
        this.inValidDonorFundNum = false;
      } else {
        this.inValidCCNum = true;
        this.inValidDonorFundNum = true;
      }
    }
    this.changeDetectorRef.detectChanges();
  }

  RemoveSelectedCls() {
    this.isRecordHovered = true;
  }

  submitPayPledge(data) {
    if (data && data.length > 0) {
      this.payOffPledges = data;
    }
  }
  GetAvailableAmt(data) {
    this.availableAmt = Math.round(data * 100) / 100;
  }
  onClickedOutside() {
    if (this.isListBind) {
      this.showBox = true;
      return;
    }
    this.showBox = false;
  }
  openDonorCardPopup(accountId) {
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup donor_card new_trans_donor",
    };
    const modalRef = this.commonMethodService.openPopup(
      DonorCardPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.AccountId = accountId;
    var objDonorCard = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      accountId: accountId,
    };
    this.cardService.getDonorCard(objDonorCard).subscribe((res: any) => {
      modalRef.componentInstance.DonorCardData = res;
    });
  }

  RemovePaymentTabClass() {
    $("#creditcardtab").removeClass("active");
    $("#cashtab").removeClass("active");
    $("charitytab").removeClass("active");
    $("#checktab").removeClass("active");
    $("#pledgetab").removeClass("active");
    $("#ojctab").removeClass("active");
    $("#wallettab").removeClass("active");
    $("#notepanel").removeClass("note_payment");
    $("#donorfundtab").removeClass("active");
    $("#othertab").removeClass("active");
    $("#achtab").removeClass("active");
  }

  submitScheduleData(data) {
    this.RemovePaymentTabClass();
    this.paymentModeDetail = "";
    this.creditCardNumber = "";
    this.donorFundCCNumber = "";
    this.creditCardCVV = "";
    this.creditCardZip = "";
    this.expDate = "";
    this.checkNumber = "";
    this.expOJCDate = "";
    this.creditCardOJCNumber = "";
    this.isInValid = false;
    this.isSaveCard = false;
    this.isPayoffPledgeDisable = false;
    this.selectedWalletId = null;
    this.isCvvVisible = true;
    this.isZipVisible = true;
    this.isFutureDate = false;
    this.inValidCCNum = false;
    $("#notepanel").show();
    this.isCreditCard = false;
    this.paymentMethodId = 0;
    this.isAch = false;
    this.isCharity = false;
    this.isCash = false;
    this.isCheckNumber = false;
    this.isPledgePayment = false;
    this.isOJC = false;
    this.isWallet = false;
    this.isDonorFund = false;
    this.isOther = false;
    this.changeDetectorRef.detectChanges();
    this.objScheduleData = data;
    if (this.objScheduleData) {
      this.scheduleDonationAmount = this.objScheduleData.donationAmount;
      this.scheduleCount = this.objScheduleData.count;
      this.scheduleFrequency = this.objScheduleData.frequency;
      this.scheduleAmtPerPayment = this.objScheduleData.amtPerPayment;
      if (this.objScheduleData.startDate.startDate == undefined) {
        this.selectedScheduleStartDate = this.objScheduleData.startDate;
      } else {
        this.selectedScheduleStartDate =
          this.objScheduleData.startDate.startDate;
      }
      if (
        this.selectedScheduleStartDate.format("YYYY-MM-DD") !=
        moment(new Date()).format("YYYY-MM-DD")
      ) {
        this.ojcValidationMsg = true;
      } else {
        this.isFutureDate = false;
        this.ojcValidationMsg = false;
      }
      this.disableButton(false);
      this.checkSchedule = true;
      this.disableTitle = "Not available with Schedules";
      this.objScheduleData.checked = "true";
      this.isDonorSkipped = false;
      //code to remove cash payment option if schedule payment selected
      //this.paymentMethodId = 0;
      $("#cashtab").removeClass("active");
      this.isCash = false;
      if (this.paymentModeDetail == "Cash") {
        this.paymentModeDetail = "";
      }
    }
  }

  private getElementDropdown(): HTMLElement {
    return this.dropdownRef._elementRef.nativeElement.getElementsByClassName(
      "dropdown-list"
    )[0] as HTMLElement;
  }

  OpenCampaignDrp() {
    this.dropdownRef.openDropdown();
    // this.renderer.setStyle(this.getElementDropdown(), 'display', 'block');
    // this.renderer.removeAttribute(this.getElementDropdown(), 'hidden');
  }
  private getReasonElementDropdown(): HTMLElement {
    return this.reasondropdownRef._elementRef.nativeElement.getElementsByClassName(
      "dropdown-list"
    )[0] as HTMLElement;
  }
  private getLocationElementDropdown(): HTMLElement {
    return this.locationdropdownRef._elementRef.nativeElement.getElementsByClassName(
      "dropdown-list"
    )[0] as HTMLElement;
  }
  private getCollectionElementDropdown(): HTMLElement {
    return this.collectiondropdownRef._elementRef.nativeElement.getElementsByClassName(
      "dropdown-list"
    )[0] as HTMLElement;
  }

  OpenReasonDrp() {
    this.reasondropdownRef.openDropdown();
  }
  OpenLocationDrp() {
    this.locationdropdownRef.openDropdown();
  }
  OpenCollectionDrp() {
    this.collectiondropdownRef.openDropdown();
  }

  closeReasonDrp() {
    this.reasondropdownRef.closeDropdown();
  }
  closeCampaignDrp() {
    this.dropdownRef.closeDropdown();
  }
  closeLocationDrp() {
    this.locationdropdownRef.closeDropdown();
  }
  closeCollectionDrp() {
    this.collectiondropdownRef.closeDropdown();
  }
  OpenDatePicker() {
    this.pickerDirective.open();
  }

  disableButton(value) {
    if (value == null) {
      this.checkSchedule = false;
      this.isDonorSkipped = true;
      this.disableTitle = "";
      value = false;
    }

    this.disableValue = value;
    if (this.disableValue) {
      $("#donorTab").addClass("disabled");
      $("#paymentTab").addClass("disabled");
      $("#moreOptionsTab").addClass("disabled");
      $("#payoffPledgeTab").addClass("disabled");
    } else {
      $("#donorTab").removeClass("disabled");
      $("#paymentTab").removeClass("disabled");
      $("#moreOptionsTab").removeClass("disabled");
      if (!this.isDonorBulkSelected) {
        $("#payoffPledgeTab").removeClass("disabled");
      }
    }
  }

  OpenDropdown(type) {
    this.isLocationDropdown = false;
    this.isCollectorDropdown = false;
    this.isCampaignDropdown = false;
    this.isReasonDropdown = false;
    this.isDateSelection = false;

    if (type == "optionlist") {
      if (!this.isOptionList) {
        this.isOptionList = true;
      } else {
        this.ShowDonorTab();
      }
    }

    if (type == "collector") {
      this.isCollectorDropdown = true;
      this.isOptionList = false;
      this.collectorList = this.commonMethodService.paymentCollectorList;
    }

    if (type == "location") {
      this.isLocationDropdown = true;
      this.isOptionList = false;
      this.locationList = this.commonMethodService.paymentLocationList;
    }
    if (type == "campaign") {
      this.isCampaignDropdown = true;
      this.isOptionList = false;
      this.campaignList = this.commonMethodService.CampaignList;
    }

    if (type == "reason") {
      this.isReasonDropdown = true;
      this.isOptionList = false;
      this.reasonList = this.commonMethodService.paymentReasonList;
    }

    if (type == "date") {
      this.isDateSelection = true;
      this.isOptionList = false;
    }
  }

  closePledgeTooltip() {
    this.showTooltip = false;
    this.isCloseTooltip = false;
    this.isRoundIcon = false;
  }

  OpenAmountTab(type) {
    if (type == "donationTab") {
      $("#notepanel").removeClass("note_payment");
      $("#payment_section").addClass("payment_sect");
      $("#donationAmount").tab("show");
      $("#donorInfo").removeClass("active show");
      $("#paymentMathod").removeClass("active show");
      $("#donorAmtTab").addClass("active");
      $("#donorTab").removeClass("active");
      $("#paymentTab").removeClass("active");
      this.isAmountTab = true;
      this.donationAmtField.nativeElement.focus();
      if (
        this.selectedAmount == undefined ||
        this.selectedAmount.toString() == ""
      ) {
        this.disableValue = true;
      }
    } else if (type == "donorInfoTab") {
      $("#notepanel").removeClass("note_payment");
      $("#payment_section").removeClass("payment_sect");
      $("#donorInfo").tab("show");
      $("#donationAmount").removeClass("active show");
      $("#paymentMathod").removeClass("active show");
      this.isAmountTab = false;
      this.isOptionList = true;
      this.isPaymentList = false;
      $("#schedulePayment").removeClass("active show");
      $("#payoffPledge").removeClass("active show");
      $("#moreOptions").tab("show");
      $("#moreOptions").addClass("active");
      $("#donorAmtTab").removeClass("active");
      $("#donorTab").addClass("active");
      $("#paymentTab").removeClass("active");
      $("#right_section").removeClass("partition");
      if (!this.isDonorSelected) {
        this.donorSearchField.nativeElement.focus();
      }
      // //
      if (this.isTxtCardHolderName == true) {
        // $("#searcheddonorlist").hide();
        // $(".skip_button").hide();
        $(".txtBtn").removeAttr("disabled");
      }

      // //
    } else {
      if (this.initalpymtType == 0) {
        $("#notepanel").addClass("note_payment");
        this.initalpymtType = 1;
      } else {
        $("#notepanel").removeClass("note_payment");
      }
      $("#paymentMathod").tab("show");
      $("#moreOptionsTab").tab("show");
      $("#donationAmount").removeClass("active show");
      $("#donorInfo").removeClass("fade in active show");
      $("#donorAmtTab").removeClass("active");
      $("#donorTab").removeClass("active");
      $("#payment_section").addClass("payment_sect");
      $("#paymentTab").addClass("active");
      if (this.paymentMethodId == 4) {
        $("#creditcardtab").addClass("active");
        if (this.ccField.nativeElement) {
          this.ccField.nativeElement.focus();
        }
      }
      if (this.paymentMethodId == 1) {
        $("#cashtab").addClass("active");
      }
      if (this.paymentMethodId == 2) {
        $("#checktab").addClass("active");
      }
      if (this.paymentMethodId == -1) {
        $("#pledgetab").addClass("active");
      }
      if (this.paymentMethodId == 3) {
        $("#ojctab").addClass("active");
      }
      if (this.paymentMethodId == 5) {
        $("#othertab").addClass("active");
      }
      if (this.paymentMethodId == null) {
        $("#wallettab").addClass("active");
      }
      if (this.paymentMethodId == 6) {
        $("#donorfundtab").addClass("active");
      }
      this.isAmountTab = false;
      this.isOptionList = true;
      this.isPaymentList = true;
      $("#schedulePayment").removeClass("active show");
      $("#payoffPledge").removeClass("active show");
      $("#moreOptions").tab("show");
      $("#moreOptions").addClass("active");
      $("#right_section").removeClass("partition");
    }
  }

  OpenTab() {
    if (this.checkSchedule) {
      if (this.selectedDonorId == null && this.bulkDonorList.length == 0) {
        this.isDonorSelect = true;
      }
      if (this.isDonorSelect && !this.isDonorBulkSelected) {
        return false;
      }
    } else {
      if (
        !this.isDonorSkipped &&
        !this.isDonorSelected &&
        this.selectedAmount != undefined &&
        String(this.selectedAmount) != ""
      ) {
        this.OpenAmountTab("donorInfoTab");
      } else if (
        this.selectedAmount == undefined ||
        String(this.selectedAmount) == ""
      ) {
        this.OpenAmountTab("donationTab");
      } else if (
        (this.isDonorSkipped || this.isDonorSelected) &&
        this.selectedAmount != undefined &&
        String(this.selectedAmount) != ""
      ) {
        this.OpenAmountTab("paymentTab");
      }
    }
  }

  SwitchTab() {
    if (this.checkSchedule) {
      if (this.selectedDonorId == null && this.bulkDonorList.length == 0) {
        this.isDonorSelect = true;
      }
    }
    if (
      !this.isDonorSkipped &&
      this.selectedDonorId == null &&
      !this.isFromBuilkDonarList
    ) {
      this.OpenAmountTab("donorInfoTab");
    } else {
      this.OpenAmountTab("paymentTab");
    }
  }

  SkipDonor() {
    if (this.checkSchedule) {
      this.isDonorSkipped = false;
    } else {
      this.isDonorSkipped = true;
    }
    if (
      this.selectedAmount == undefined ||
      String(this.selectedAmount) == "" ||
      this.selectedAmount == 0 ||
      this.paymentMethodId == 0
    )
      this.OpenAmountTab("donationTab");
  }

  CheckPaymentValidation(paymentmethodId) {
    if (paymentmethodId != 0) {
      if (
        this.paymentMethodId == 4 &&
        this.creditCardNumber != "" &&
        this.expDate != "" &&
        !this.isInValid &&
        !this.inValidCCNum
      ) {
        return true;
      } else if (paymentmethodId == 1) {
        return true;
      } else if (paymentmethodId == 2 && this.checkNumber != "") {
        return true;
      } else if (
        paymentmethodId == -1 &&
        this.selectedDonorId != null &&
        !this.isDonorBulkSelected &&
        this.selectedCampaign != "" &&
        !this.isCampaignSelect &&
        !this.isDonorSelect
      ) {
        return true;
      } else if (
        this.paymentMethodId == 3 &&
        this.creditCardOJCNumber != "" &&
        this.expOJCDate != "" &&
        !this.isInValid &&
        !this.inValidOJCNum
      ) {
        return true;
      } else if (
        this.paymentMethodId == null &&
        !this.isWalletFound &&
        this.selectedWalletId != null
      ) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  OpenSideTab(type) {
    if (type == "optionTab") {
      this.isOptionList = true;
      this.ispayoffPledgeTabSelected = false;
      $("#moreOptions").tab("show");
      $("#schedulePaymentTab").removeClass("active");
      $("#payoffPledgeTab").removeClass("active");
      $("#schedulePayment").removeClass("active show");
      $("#payoffPledge").removeClass("active show");
      $("#right_section").removeClass("partition");
    } else if (type == "schedulePaymentTab") {
      this.ispayoffPledgeTabSelected = false;
      $("#moreOptionsTab").removeClass("active");
      $("#payoffPledgeTab").removeClass("active");
      $("#schedulePayment").tab("show");
      $("#moreOptions").removeClass("active show");
      $("#payoffPledge").removeClass("active show");
      $("#right_section").removeClass("partition");
    } else {
      if (!this.isDonorBulkSelected) {
        this.ispayoffPledgeTabSelected = true;
        $("#payoffPledge").tab("show");
        $("#payoffPledgeTab").addClass("active");
        $("#moreOptionsTab").removeClass("active");
        $("#schedulePaymentTab").removeClass("active");
        $("#moreOptions").removeClass("active show");
        $("#schedulePayment").removeClass("active show");
        $("#right_section").addClass("partition");
      }
    }
  }
  ShowDonorTab() {
    if (this.isPaymentTab) {
      $("#paymentMathod").tab("show");
      $("#donorInfo").removeClass("active show");
    } else {
      $("#donorInfo").tab("show");
      $("#paymentMathod").removeClass("active show");
    }

    $("#moreOptions").removeClass("active show");
    $("#donationAmount").removeClass("active show");
    $("#optiontab").removeClass("active");
    this.isPaymentTab = false;
  }
  ShowDropdown(type) {
    $("#moreOptions").tab("show");
    this.isOptionList = false;
    this.isLocationDropdown = false;
    this.isCollectorDropdown = false;
    this.isCampaignDropdown = false;
    this.isReasonDropdown = false;
    this.isDateSelection = false;
    this.isPaymentTab = true;
    if (type == "campaign") {
      this.isCampaignDropdown = true;
      this.campaignList = this.commonMethodService.CampaignList;
    }
    if (type == "date") {
      this.isDateSelection = true;
    }
  }

  payPledgeMessagePopup() {
    this.pledgeCount = this.commonMethodService.payPledgeCount;
    let amt = this.commonMethodService.pledgeRemainingAmountTotal;
    this.pledgeRemainingAmount = parseFloat(amt.toFixed(2));
    if (this.pledgeRemainingAmount != 0) {
      if (!this.isPledgeDisabled) {
        this.isRoundIcon = true;
      } else {
        this.isRoundIcon = false;
      }
      this.showTooltip = true;
      this.isCloseTooltip = true;
    }
  }

  ChangePayment(type) {
    $("#creditcardtab").removeClass("active");
    $("#cashtab").removeClass("active");
    $("charitytab").removeClass("active");
    $("#checktab").removeClass("active");
    $("#pledgetab").removeClass("active");
    $("#ojctab").removeClass("active");
    $("#wallettab").removeClass("active");
    $("#notepanel").removeClass("note_payment");
    $("#donorfundtab").removeClass("active");
    $("#othertab").removeClass("active");
    $("#achtab").removeClass("active");
    this.paymentModeDetail = "";
    this.creditCardNumber = "";
    this.donorFundCCNumber = "";
    this.creditCardCVV = "";
    this.creditCardZip = "";
    this.expDate = "";
    this.checkNumber = "";
    this.expOJCDate = "";
    this.creditCardOJCNumber = "";
    this.isInValid = false;
    this.isSaveCard = false;
    this.isPayoffPledgeDisable = false;
    this.selectedWalletId = null;
    this.isCvvVisible = true;
    this.isZipVisible = true;
    this.isFutureDate = false;
    this.inValidCCNum = false;
    $("#notepanel").show();
    if (type == "creditcard") {
      this.payPledgeMessagePopup();
      $("#creditcardtab").addClass("active");
      this.paymentMethodId = 4;
      this.isCreditCard = true;
      this.paymentModeDetail = "Credit Card";
      this.isCharity = false;
      this.isPaymentModeList = false;
      this.isCash = false;
      this.isCheckNumber = false;
      this.isPledgePayment = false;
      this.isOJC = false;
      this.isWallet = false;
      this.isDonorFund = false;
      this.isOther = false;
      this.isPayoffPledgeDisable = false;
      this.isVisaCard = true;
      this.isDinerCard = true;
      this.isMasterCard = true;
      this.isAmericanExpress = true;
      this.isDiscoverCard = true;
      this.isMatbiaCard = true;
      this.isOJCCard = true;
      this.isDonorFundCard = true;
      this.isPledgerCard = true;
      this.isAch = false;
      this.isNoAch = false;
      // this.ccField.nativeElement.value = '%B4111111111111112^FISCH/JOEL^24062011906875870000000000000000?;4111111111111112=240620119067941700000?+?';
      // this.ccField.nativeElement.value = '%B8628241406803648^ORG/MATBIA^28123214321987?;8628241406803648=2812321432187?';
      // this.ccField.nativeElement.value = '%B8628243785214868^ORG/MATBIA^28123214321987?;?+?';
      // this.ccField.nativeElement.dispatchEvent(new Event('input'));

      //this.ChangeMask();
      setTimeout(() => {
        $("#input-creditCardNumber").focus();
      }, 1000);
    } else if (type == "ach") {
      this.payPledgeMessagePopup();
      $("#achtab").addClass("active");
      this.paymentMethodId = 9;
      if (this.isEnableACH === "True") {
        this.isAch = true;
      }
      if (this.isEnableACH === "False") {
        this.isNoAch = true;
      }
      this.isCheckNumber = false;
      this.isCharity = false;
      this.isCash = false;
      this.isCharity = false;
      this.isCreditCard = false;
      this.isPaymentModeList = false;
      this.isPledgePayment = false;
      this.isOJC = false;
      this.isDonorFund = false;
      this.isWallet = false;
      this.isOther = false;
      this.isPayoffPledgeDisable = false;
      this.isOJCCard = false;
      this.paymentModeDetail = "Ach";
    } else if (type == "charity") {
      this.payPledgeMessagePopup();
      $("#charitytab").addClass("active");
      this.paymentMethodId = -2;
      this.isCharity = true;
      this.isCreditCard = false;
      this.isPaymentModeList = false;
      this.isCash = false;
      this.isCheckNumber = false;
      this.isPledgePayment = false;
      this.isOJC = false;
      this.isWallet = false;
      this.isDonorFund = false;
      this.isOther = false;
      this.isPayoffPledgeDisable = false;
      this.isOJCCard = true;
      this.isAmericanExpress = false;
      setTimeout(() => {
        $("#input-charityCardNumber").focus();
      }, 1000);
      this.paymentModeDetail = "Charity";
    } else if (type == "cash") {
      this.payPledgeMessagePopup();
      $("#cashtab").addClass("active");
      this.paymentMethodId = 1;
      this.isCash = true;
      this.isCharity = false;
      this.isCreditCard = false;
      this.isPaymentModeList = false;
      this.isCheckNumber = false;
      this.isPledgePayment = false;
      this.isOJC = false;
      this.isWallet = false;
      this.isDonorFund = false;
      this.isOther = false;
      this.paymentModeDetail = "Cash";
      this.isPayoffPledgeDisable = false;
      this.isOJCCard = false;

      if (
        !this.disableValue &&
        this.selectedAmount != 0 &&
        this.selectedAmount != undefined &&
        (this.isDonorSkipped || this.isDonorSelected)
      ) {
        setTimeout(() => {
          this.cashProcess.nativeElement.focus(), 10;
        });
      }
      if (
        this.disableValue ||
        this.selectedAmount == undefined ||
        (!this.isDonorSkipped && !this.isDonorSelected)
      ) {
        setTimeout(() => {
          this.cashNext.nativeElement.focus(), 10;
        });
      }
    } else if (type == "check") {
      this.payPledgeMessagePopup();
      $("#checktab").addClass("active");
      this.paymentMethodId = 2;
      this.isCheckNumber = true;
      this.isCharity = false;
      this.isCash = false;
      this.isCharity = false;
      this.isCreditCard = false;
      this.isPaymentModeList = false;
      this.isPledgePayment = false;
      this.isOJC = false;
      this.isDonorFund = false;
      this.isWallet = false;
      this.isOther = false;
      this.isPayoffPledgeDisable = false;
      this.isOJCCard = false;
      setTimeout(() => {
        $("#input-txtCheckNumber").focus();
      }, 1000);
      this.paymentModeDetail = "Check";
    } else if (type == "pledge") {
      this.closePledgeTooltip();
      $("#pledgetab").addClass("active");
      this.paymentMethodId = -1;
      this.isPledgePayment = true;
      this.isCharity = false;
      this.isCheckNumber = false;
      this.isCash = false;
      this.isCreditCard = false;
      this.isPaymentModeList = false;
      this.isWallet = false;
      this.isOJC = false;
      this.isDonorFund = false;
      this.isOther = false;
      this.isPayoffPledgeDisable = true;
      this.isOJCCard = false;
      this.paymentModeDetail = "Pledge";
      $("#notepanel").hide();
      if (this.selectedCampaign == null || this.selectedCampaign == "") {
        this.disablePledgeProcess = true;
        this.isCampaignSelect = true;
      } else {
        this.disablePledgeProcess = false;
        this.isCampaignSelect = false;
      }
      if (
        !this.disableValue &&
        this.selectedAmount != 0 &&
        this.selectedAmount != undefined &&
        (this.isDonorSkipped || this.isDonorSelected)
      ) {
        setTimeout(() => {
          this.pledgeProcess.nativeElement.focus(), 10;
        });
      }
      if (
        this.disableValue ||
        this.selectedAmount == undefined ||
        (!this.isDonorSkipped && !this.isDonorSelected)
      ) {
        setTimeout(() => {
          this.pledgeNext.nativeElement.focus(), 10;
        });
      }
    } else if (type == "ojc") {
      this.payPledgeMessagePopup();
      $("#ojctab").addClass("active");
      this.paymentMethodId = 3;
      this.isCharity = false;
      this.isOJC = true;
      this.isPledgePayment = false;
      this.isCheckNumber = false;
      this.isCash = false;
      this.isCreditCard = false;
      this.isWallet = false;
      this.isDonorFund = false;
      this.isPaymentModeList = false;
      this.isPayoffPledgeDisable = false;
      this.paymentModeDetail = "Ojc";
      setTimeout(() => {
        $("#input-creditCardOJCNumber").focus();
      }, 1000);
    } else if (type == "wallet") {
      this.payPledgeMessagePopup();
      $("#wallettab").addClass("active");
      this.paymentMethodId = null;
      this.isCharity = false;
      this.isWallet = true;
      this.isPledgePayment = false;
      this.isCheckNumber = false;
      this.isCash = false;
      this.isCreditCard = false;
      this.isPaymentModeList = false;
      this.isOJC = false;
      this.isDonorFund = false;
      this.isPayoffPledgeDisable = false;
      this.isOJCCard = false;
      this.paymentModeDetail = "Wallet";
    } else if (type == "other") {
      this.payPledgeMessagePopup();
      $("#othertab").addClass("active");
      this.paymentMethodId = 5;
      this.isOther = true;
      this.isCharity = false;
      this.isWallet = false;
      this.isPledgePayment = false;
      this.isCheckNumber = false;
      this.isCash = false;
      this.isCreditCard = false;
      this.isPaymentModeList = false;
      this.isOJC = false;
      this.isDonorFund = false;
      this.isPayoffPledgeDisable = false;
      this.isOJCCard = false;
      this.paymentModeDetail = "Other";
    } else if (type == "donorfund") {
      this.payPledgeMessagePopup();
      $("#donorfundtab").addClass("active");
      this.paymentMethodId = 6;
      this.isDonorFund = true;
      this.isCreditCard = false;
      this.isPaymentModeList = false;
      this.isCash = false;
      this.isCheckNumber = false;
      this.isPledgePayment = false;
      this.isOJC = false;
      this.isWallet = false;
      this.isOther = false;
      this.isPayoffPledgeDisable = false;
      this.isOJCCard = false;
      setTimeout(() => {
        $("#input-donorFundCCNumber").focus();
      }, 1000);
      this.paymentModeDetail = "Donor Fund";
    } else if (type == "moreOption") {
      this.payPledgeMessagePopup();
      this.isPaymentModeList = true;
      this.isCreditCard = false;
      this.isCharity = false;
      this.isCash = false;
      this.isCheckNumber = false;
      this.isPledgePayment = false;
      this.isOJC = false;
      this.isDonorFund = false;
      this.isWallet = false;
      this.isOther = false;
      this.paymentModeDetail = "";
      this.creditCardNumber = "";
      this.donorFundCCNumber = "";
      this.creditCardCVV = "";
      this.creditCardZip = "";
      this.expDate = "";
      this.checkNumber = "";
      this.expOJCDate = "";
      this.creditCardOJCNumber = "";
      this.isInValid = false;
      this.isPayoffPledgeDisable = false;
      this.isOJCCard = false;
    }
  }

  CardReader(cardValue) {
    let twodigit = this.creditCardNumber.substring(0, 2);
    let onedigit = this.creditCardNumber.substring(0, 1);
    let threedigit = this.creditCardNumber.substring(0, 3);
    if (twodigit == "34" || twodigit == "37") {
      this.isVisaCard = false;
      this.isDinerCard = false;
      this.isMasterCard = false;
      this.isAmericanExpress = true;
      this.isDiscoverCard = false;
      this.isMatbiaCard = false;
      this.isOJCCard = false;
      this.isDonorFundCard = false;
      this.isPledgerCard = false;
      this.isZipVisible = true;
      this.isCvvVisible = true;
      this.isFutureDate = false;
    } else if (twodigit == "86") {
      this.isVisaCard = false;
      this.isDinerCard = false;
      this.isMasterCard = false;
      this.isAmericanExpress = false;
      this.isDiscoverCard = false;
      this.isMatbiaCard = true;
      this.isOJCCard = false;
      this.isDonorFundCard = false;
      this.isPledgerCard = false;
      this.isCvvVisible = false;
      this.isZipVisible = false;
      this.isFutureDate = false;
      this.paymentMethodId = -2;
    } else if (twodigit == "69") {
      this.isVisaCard = false;
      this.isDinerCard = false;
      this.isMasterCard = false;
      this.isAmericanExpress = false;
      this.isDiscoverCard = false;
      this.isMatbiaCard = false;
      this.isOJCCard = true;
      this.isDonorFundCard = false;
      this.isPledgerCard = false;
      this.isCvvVisible = false;
      this.isZipVisible = false;
      this.paymentMethodId = -2;
    } else if (twodigit == "65") {
      this.isVisaCard = false;
      this.isDinerCard = false;
      this.isMasterCard = false;
      this.isAmericanExpress = false;
      this.isDiscoverCard = false;
      this.isMatbiaCard = false;
      this.isOJCCard = false;
      this.isDonorFundCard = false;
      this.isPledgerCard = true;
      this.isZipVisible = true;
      this.isCvvVisible = true;
      this.isFutureDate = false;
      this.paymentMethodId = -2;
    } else if (onedigit == "4") {
      this.isVisaCard = true;
      this.isDinerCard = false;
      this.isMasterCard = false;
      this.isAmericanExpress = false;
      this.isDiscoverCard = false;
      this.isMatbiaCard = false;
      this.isOJCCard = false;
      this.isDonorFundCard = false;
      this.isPledgerCard = false;
      this.isZipVisible = true;
      this.isCvvVisible = true;
      this.isFutureDate = false;
    } else if (onedigit == "5") {
      this.isVisaCard = false;
      this.isDinerCard = false;
      this.isMasterCard = true;
      this.isAmericanExpress = false;
      this.isDiscoverCard = false;
      this.isMatbiaCard = false;
      this.isOJCCard = false;
      this.isDonorFundCard = false;
      this.isPledgerCard = false;
      this.isZipVisible = true;
      this.isCvvVisible = true;
      this.isFutureDate = false;
    } else if (onedigit == "6") {
      this.isVisaCard = false;
      this.isDinerCard = false;
      this.isMasterCard = false;
      this.isAmericanExpress = false;
      this.isDiscoverCard = true;
      this.isMatbiaCard = false;
      this.isOJCCard = false;
      this.isDonorFundCard = false;
      this.isPledgerCard = false;
      this.isZipVisible = true;
      this.isCvvVisible = true;
      this.isFutureDate = false;
    } else if (onedigit == "") {
      this.isVisaCard = true;
      this.isDinerCard = true;
      this.isMasterCard = true;
      this.isAmericanExpress = true;
      this.isDiscoverCard = true;
      this.isMatbiaCard = true;
      this.isOJCCard = true;
      this.isDonorFundCard = true;
      this.isPledgerCard = true;
      this.isZipVisible = true;
      this.isCvvVisible = true;
      this.isFutureDate = false;
    } else if (
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
      this.isDinerCard = true;
      this.isVisaCard = false;
      this.isMasterCard = false;
      this.isAmericanExpress = false;
      this.isDiscoverCard = false;
      this.isMatbiaCard = false;
      this.isOJCCard = false;
      this.isDonorFundCard = false;
      this.isPledgerCard = false;
      this.isZipVisible = true;
      this.isCvvVisible = true;
      this.isFutureDate = false;
    }
    this.isSwipe = false;
    if (cardValue.data == undefined) {
      this.cardReaderNum = cardValue.target.value;
      if (this.cardReaderNum.charAt(0) != "%") {
        this.EnterCreditCard(cardValue);
      }
    } else {
      if (cardValue.data == "%" || this.cardReaderNum.slice(0, 1) == "%") {
        this.cardReaderNum = this.cardReaderNum + cardValue.data;
        this.cardReaderNum = this.cardReaderNum.replace("%%", "%");
        if (this.cardReaderNum == "____-____-____-____%") {
          this.cardReaderNum = "%";
        }
      } else {
        this.EnterCreditCard(cardValue);
      }
    }

    const magnetData = this.creditCardService.parseMagneticStrip(
      this.cardReaderNum
    );
    if (magnetData.isSwipe) {
      this.isSwipeLoader = true;
      this.isSwipe = true;
      const frmtCardNumber = magnetData.cardNumber.replace(/\D/g, "");
      this.expDate = magnetData.expDate;
      this.creditCardNumber = frmtCardNumber;
      const twodigit = frmtCardNumber.substring(0, 2);
      if (twodigit == "34" || twodigit == "37") {
        this.maskCreditValue = this.creditCardService.getAmexMask();
      } else {
        this.maskCreditValue = this.creditCardService.getDefaultMask();
      }
      const cardlength = frmtCardNumber.length;
      const masklength = this.maskCreditValue.replace(/[-]/g, "").length;
      if (cardlength == masklength) {
        const result = this.creditCardService.luhnCheck(this.creditCardNumber);
        if (result == true) {
          this.inValidCCNum = false;
          this.inValidDonorFundNum = false;
        } else {
          this.inValidCCNum = true;
          this.inValidDonorFundNum = true;
        }
      }
    }
    this.isSwipeLoader = false;

    this.isCvvHideShow();
    this.isCharityShowHideIcon();
  }

  SearchCollector(keyword) {
    this.collectorList = this.commonMethodService.localCollectorList;
    if (keyword != "") {
      var filterdRecord = this.collectorList.filter(
        (obj) =>
          obj.itemName &&
          obj.itemName.toString().toLowerCase().indexOf(keyword) > -1
      );
      this.collectorList = filterdRecord;
    }
  }
  SelectCollector(event) {
    if (event.id != undefined) {
      var id = event.id;
      var name = event.itemName;
      this.selectedCollectorId = id;
      this.selectedCollector = name;
      this.savedDefault = false;
    } else {
      this.selectedCollectorId = null;
      this.selectedCollector = "";
    }
    this.localStorageArray.selectedCollectorId =
      this.selectedCollectorId == null
        ? null
        : this.selectedCollectorId.toString();
    this.localStorageArray.selectedCollector = this.selectedCollector;
  }

  SelectLocation(event) {
    if (event.id != undefined) {
      var id = event.id;
      var name = event.itemName;
      this.selectedLocation = name;
      this.selectedLocationId = id;
      this.savedDefault = false;
    } else {
      this.selectedLocation = "";
      this.selectedLocationId = null;
    }
    this.localStorageArray.selectedLocationId =
      this.selectedLocationId == null
        ? null
        : this.selectedLocationId.toString();
    this.localStorageArray.selectedLocation = this.selectedLocation;
  }

  SearchLocation(keyword) {
    this.locationList = this.commonMethodService.localLocationList;
    if (keyword != "") {
      var filterdRecord = this.locationList.filter(
        (obj) =>
          obj.itemName &&
          obj.itemName.toString().toLowerCase().indexOf(keyword) > -1
      );
      this.locationList = filterdRecord;
    }
  }

  SelectCampaign(event) {
    this.renderer.removeStyle(this.getElementDropdown(), "display");
    this.renderer.setAttribute(this.getElementDropdown(), "hidden", "hidden");
    if (event.id != undefined) {
      var id = event.id;
      var name = event.itemName;
      this.selectedCampaign = name;
      this.selectedCampaignId = id;

      this.isCampaignSelect = false;
      this.disablePledgeProcess = false;
      this.isCampaignRequired = false;
      this.setPresetAmount();
      this.savedDefault = false;
    } else {
      this.selectedCampaign = "";
      this.selectedCampaignId = null;

      this.isCampaignSelect = true;
      this.disablePledgeProcess = true;
      if (
        this.localstoragedataService.getLoginUserisReasonRequiredForTransaction()
      ) {
        this.isCampaignRequired = true;
      }

      this.getPresetAmountList();
    }
    this.localStorageArray.selectedCampaignId =
      this.selectedCampaignId == null
        ? null
        : this.selectedCampaignId.toString();
    this.localStorageArray.selectedCampaign = this.selectedCampaign;

    // if (this.isPaymentTab) {
    //   $("#paymentMathod").tab("show");
    //   $("#donorInfo").removeClass("active show");
    //   $("#moreOptions").removeClass("active show");
    //   $("#donationAmount").removeClass("active show");
    // }

    // this.isCampaignDropdown = false;
    // this.isCampaignSelect=false;
    // this.isOptionList = true;
  }

  SearchCampaign(keyword) {
    this.campaignList = this.commonMethodService.localCampaignList;
    if (keyword != "") {
      var filterdRecord = this.campaignList.filter(
        (obj) =>
          obj.itemName &&
          obj.itemName.toString().toLowerCase().indexOf(keyword) > -1
      );
      this.campaignList = filterdRecord;
    }
  }

  SelectReason(event) {
    if (event.id != undefined) {
      var id = event.id;
      var name = event.itemName;
      this.selectedReason = name;
      this.selectedReasonId = id;
      this.isReasonRequired = false;
      this.savedDefault = false;
    } else {
      this.selectedReason = "";
      this.selectedReasonId = null;
      if (
        this.localstoragedataService.getLoginUserisReasonRequiredForTransaction()
      ) {
        this.isReasonRequired = true;
      }
    }
    this.localStorageArray.selectedReasonId =
      this.selectedReasonId == null ? null : this.selectedReasonId.toString();
    this.localStorageArray.selectedReason = this.selectedReason;
  }

  OpenLegalReceipt(paymentId, paymentType) {
    if (
      (paymentType == "Cash" ||
      paymentType == "Check" ||
      paymentType == "Other") &&
      !this.receiptGenerated
    ) {
      this.modalOptions = {
        centered: true,
        size: "md",
        backdrop: "static",
        keyboard: true,
        windowClass: "receipt_popup modal-generate-receipt",
      };
      const modalRef = this.commonMethodService.openPopup(
        LegalReceiptCountryPopupComponent,
        this.modalOptions
      );

      modalRef.componentInstance.paymentId = paymentId;
      modalRef.componentInstance.gridFilterData = this.gridFilterData;
      modalRef.componentInstance.IsPayment = true;
      modalRef.componentInstance.recallPaymentCard?.subscribe((val) => {
          this.receiptGenerated = val;
          this.cdr.detectChanges();
        });
    } else {
      var obj = {
        paymentId: paymentId,
      };
      this.paymentTransactionService
        .GenerateLegalReceipt(obj)
        .subscribe((res) => {
          if (res) {
            if (res.legalReceiptNum != null) {
              this.modalOptions = {
                centered: true,
                size: "md",
                backdrop: "static",
                keyboard: true,
                windowClass: "receipt_popup",
              };
              let phoneArray: any = [];
              if (
                this.additionalPhones &&
                this.additionalPhones.indexOf(",") > -1
              ) {
                phoneArray = this.additionalPhones.split(", ");
              } else {
                phoneArray = this.additionalPhones;
              }
              const modalRef = this.commonMethodService.openPopup(
                LegalReceiptPopupComponent,
                this.modalOptions
              );
              modalRef.result.then((result) => {
                this.valueFromPopup = result;
                if (this.valueFromPopup == true) {
                  this.commonMethodService.sendPaymentTrans(true);
                }
              });
              var transactionData = {
                paymentId: paymentId,
                globalId: this.globalId,
                emailList: this.emailList,
                "fullNameJewish ": this.isDonorSelected,
                phoneNumberList: phoneArray,
                pledgePayment: false,
                accountId: this.paymentAccountId,
                phoneCountryCodeID: this.countryCodeId,
                address: this.address || "",
                cityStateZip: this.cityStateZip || "",
              };

              var Data = {
                additionalPhoneLabels: this.additionalPhoneLabels,
                additionalPhones: this.additionalPhones,
                additionalEmail: this.additionalEmail,
                phones: this.phones,
                phone: this.phone,
                additionalEmailLabels: this.additionalEmailLabels,
                countryCodeId: this.countryCodeId,
              };
              modalRef.componentInstance.DataTrans = Data;
              modalRef.componentInstance.transactionData = transactionData; 
              modalRef.componentInstance.receiptGenerated = this.receiptGenerated;

            } else {
              Swal.fire({
                title: "Error",
                icon: "error",
                confirmButtonText: "Ok",
                customClass: {
                  confirmButton: "btn_ok",
                },
              });
            }
          }
        });
    }
  }
  onDeselectAllresonDpwn() {
    this.savedDefault = false;
    this.isSelectAmoutClickddlPaymentReason = false;
  }

  onDeselectAllDpwn() {
    this.savedDefault = false;
  }

  SearchReason(keyword) {
    this.reasonList = this.commonMethodService.localReasonList;
    if (keyword != "") {
      var filterdRecord = this.reasonList.filter(
        (obj) =>
          obj.itemName &&
          obj.itemName.toString().toLowerCase().indexOf(keyword) > -1
      );
      this.reasonList = filterdRecord;
    }
  }

  datesUpdated(event) {
    if (event.startDate != null) {
      //this.localStorageArray.selectedDate=this.selectedDate.startDate;
      if (this.isPaymentTab) {
        $("#paymentMathod").tab("show");
        $("#donorInfo").removeClass("active show");
        $("#moreOptions").removeClass("active show");
        $("#donationAmount").removeClass("active show");
      }

      this.isDateSelection = false;
      this.isOptionList = true;
    }
  }

  ShowOption() {
    this.showMoreOption = false;
  }
  closeModal() {
    this.activeModal.dismiss();
    this.commonMethodService.sendDonorLst(true);
  }
  SelectonEnter(index) {
    this.selectedDonorIndex = index;
  }
  SelectDonor(accountId) {
    this.selectedDonorId = accountId;
    this.showBox = false;
    this.commonMethodService.donorList =
      this.commonMethodService.donorList.filter((s) => s.id == accountId);
    this.GetWalletList();

    this.getPayPledgeList = true;
    this.selectedDonor =
      this.commonMethodService.donorList[0].fullNameJewish != null &&
      this.commonMethodService.donorList[0].fullNameJewish != ""
        ? this.commonMethodService.donorList[0].fullNameJewish
        : this.commonMethodService.donorList[0].fullName;
    this.displayText = this.commonMethodService.donorList[0].displayText;
    this.fullNameJewish = this.commonMethodService.donorList[0].fullNameJewish;
    this.defaultLocation =
      this.commonMethodService.donorList[0].defaultLocation;
    this.address = this.commonMethodService.donorList[0].address;
    this.cityStateZip = this.commonMethodService.donorList[0].cityStateZip;
    this.father = this.commonMethodService.donorList[0].father;
    this.fatherInLaw = this.commonMethodService.donorList[0].fatherInLaw;
    this.phoneNumber =
      this.commonMethodService.donorList[0].phoneNumber.replace(
        "<br/>",
        "&nbsp&nbsp&nbsp"
      );
    this.accountNum = this.commonMethodService.donorList[0].accountNum;
    this.accountId = this.commonMethodService.donorList[0].accountId;
    this.isDonorSelected = true;
    this.showRemoveDonorIcon = true;
    this.isReadOnly = true;
    this.isDonorSelect = false;
    this.commonMethodService.loaderSearch = false;
    this.cityStateZip = this.commonMethodService.donorList[0].cityStateZip;
    this.isListBind = false;
    this.additionalPhoneLabels =
      this.commonMethodService.donorList[0].phoneLabels;
    this.countryCodeId = this.commonMethodService.donorList[0].countryCodeIds;
    this.additionalPhones = this.commonMethodService.donorList[0].phonenumbers;
    this.additionalEmailLabels =
      this.commonMethodService.donorList[0].emailLabels;
    this.additionalEmail = this.commonMethodService.donorList[0].emails;
    if (this.commonMethodService.donorList[0].emails) {
      if (this.commonMethodService.donorList[0].emails.indexOf(",") > 1) {
        this.emails = this.commonMethodService.donorList[0].emails.split(",");
      } else {
        this.emails = this.commonMethodService.donorList[0].emails;
      }
    } else {
      this.emails = this.commonMethodService.donorList[0].emails;
    }
    if (this.commonMethodService.donorList[0].phoneLabels) {
      this.phoneLabels = this.commonMethodService.donorList[0].phoneLabels;
    }

    if (
      this.commonMethodService.donorList[0].phonenumbers &&
      this.commonMethodService.donorList[0].phonenumbers.indexOf(",") > 1
    ) {
      this.phones =
        this.commonMethodService.donorList[0].phonenumbers.split(",");
    } else {
      this.phones = this.commonMethodService.donorList[0].phonenumbers;
    }
    if (
      !this.CheckPaymentValidation(this.paymentMethodId) ||
      this.selectedAmount == undefined
    ) {
      setTimeout(() => {
        this.donorNext.nativeElement.focus(), 10;
      });
    } else if (
      this.CheckPaymentValidation(this.paymentMethodId) &&
      this.selectedAmount != 0 &&
      this.selectedAmount != undefined
    ) {
      setTimeout(() => {
        this.donorProcess.nativeElement.focus(), 10;
      });
    }

    if (this.commonMethodService.donorList[0].globalId == 688008) {
      this.isGlobalId = true;
    }
    this.isDefaultCls = this.isGlobalId ? "default-donor" : "";

    const donarDetails = this.commonMethodService.donorList.map((item) => {
      const emails = item.emails ? item.emails.split(",") : [];
      const emailLabels = item.emailLabels ? item.emailLabels.split(",") : [];
      const emailResult = this.margeKeyValue(emails, emailLabels, "email");

      const phoneNumber = item.additionalPhoneNumbers
        ? item.additionalPhoneNumbers.split(",")
        : [];
      const phoneLabels = item.additionalPhoneLabels
        ? item.additionalPhoneLabels.split(",")
        : [];
      const phoneResult = this.margeKeyValue(phoneNumber, phoneLabels, "phone");
      return { email: emailResult, phone: phoneResult };
    });
    this.notifyDonarEmailArray =
      donarDetails && donarDetails.length > 0 ? donarDetails[0].email : [];
    this.notifyDonarEmail =
      this.notifyDonarEmailArray && this.notifyDonarEmailArray.length > 0
        ? this.notifyDonarEmailArray[0]
        : "";

    if (!this.isNotifyDonarEmailShow) {
      this.notifyDonarEmail = {
        email: "Select Email",
        label: "",
      };
    }
    this.EmailCheckbox =
      this.notifyDonarEmail && this.notifyDonarEmail.email != "Select Email";
    this.tempemailCheckbox = this.EmailCheckbox;
    this.tempnotifyDonarEmail = this.notifyDonarEmail;
    this.notifyDonarPhoneArray =
      donarDetails && donarDetails.length > 0 ? donarDetails[0].phone : [];
  }

  GetWalletList() {
    var eventGuId = this.localstoragedataService.getLoginUserEventGuId();
    this.donorService
      .getWalletByAccountId(eventGuId, this.selectedDonorId)
      .subscribe((res: any) => {
        if (res) {
          this.isWalletFound = false;
          this.walletList = res;
        } else {
          this.isWalletFound = true;
          this.walletList = [];
        }
      });
  }

  changeWallet(walletId) {
    this.selectedWalletId = walletId;
  }

  removeDonor(accountNum = null) {
    if (this.isDonorBulkSelected) {
      this.bulkDonorList = this.bulkDonorList.filter(
        (donor) => donor.accountId !== accountNum
      );
      this.selectedDonor = "(" + this.bulkDonorList.length + ")";
      this.fullCount = this.bulkDonorList.length;
      this.accountList = this.accountList.filter(
        (accountId) => accountId !== accountNum
      );
      this.RemoveCard(accountNum);
    } else {
      this.selectedDonor = "";
      this.selectedAmount = null;
      this.bulkDonorList = [];
      this.paymentModeDetail = "";
      this.isReadOnly = false;
      this.EmailCheckbox = false;
      this.notifyDonarEmail = "";
      this.PhoneCheckbox = false;
      this.commonMethodService.txtQuery = "";
      this.showRemoveDonorIcon = false;
      this.commonMethodService.donorList = [];
      this.notifyDonarPhoneNumber = { phone: "Select Phone", label: "" };
      this.isDonorSelected = false;
      this.selectedDonorId = null;
      this.isReadOnly = false;
      this.getPayPledgeList = false;
      this.displaySearchIcon = false;
      this.selectedDonorIndex = 0;
      this.isRecordHovered = false;
      this.paymentType = "";
      this.isCreditCard = false;
      this.isAch = false;
      this.isCharity = false;
      this.isPaymentModeList = false;
      this.isOther = false;
      this.isCash = false;
      this.isCheckNumber = false;
      this.isPledgePayment = false;
      this.isOJC = false;
      this.isWallet = false;
      this.objScheduleData = [];
      this.checkSchedule = false;
      this.cardHolderName = "";
      this.creditCardNumber = "";
      this.cardReaderNum = "";
      this.expDate = "";
      this.creditCardZip = "";
      this.creditCardCVV = "";
      this.isTxtCardHolderName = false;
      $("#searcheddonorlist").show();
      $(".skip_button").show();
      this.pledgeinternalnotes = "";
      this.pledgeexternalnotes = "";
      this.getOptionUISetting();
      this.isPaymentList = false;
    }
  }

  IdentifyCardType(paymentType) {
    if (paymentType == "creditcard") {
      this.MaskNumber();
      if (
        this.creditCardNumber.length == 15 ||
        this.creditCardNumber.length == 16
      ) {
        let last4Digit = this.creditCardNumber.substring(
          this.creditCardNumber.length - 4
        );
        let firstdigit = this.creditCardNumber.substring(0, 1);
        if (firstdigit == "3") {
          this.paymentModeDetail = this.getPaymentModeDetail(
            "Amex",
            last4Digit
          );
        } else if (firstdigit == "4") {
          this.paymentModeDetail = this.getPaymentModeDetail(
            "Visa",
            last4Digit
          );
        } else if (firstdigit == "5") {
          this.paymentModeDetail = this.getPaymentModeDetail(
            "Master",
            last4Digit
          );
        } else if (firstdigit == "6") {
          this.paymentModeDetail = this.isOJCCard
            ? this.getPaymentModeDetail("OJC", last4Digit)
            : this.getPaymentModeDetail("Discover", last4Digit);
        } else {
          this.paymentModeDetail = last4Digit;
        }
      }
    } else if (paymentType == "ojc") {
      this.MaskOJCNumber();
      let last4Digit = this.creditCardOJCNumber.substring(
        this.creditCardOJCNumber.length - 4
      );
      this.paymentModeDetail = this.getPaymentModeDetail("OJC", last4Digit);
    } else if (paymentType == "check") {
      if (this.checkNumber.length == 16) {
        let last4Digit = this.checkNumber.substring(
          this.checkNumber.length - 4
        );
        this.paymentModeDetail = this.getPaymentModeDetail("Check", last4Digit);
      } else {
        this.paymentModeDetail = "";
      }
    } else {
      this.paymentModeDetail = "";
    }
  }

  // onMouseEnter() {
  //   this.showTooltip = true;
  //   this.isCloseTooltip = true;
  // }

  // onMouseLeave() {
  //   this.showTooltip = false;
  //   this.isCloseTooltip = false;
  // }

  isSelectAmoutClickddlPaymentReason = false;
  SelectAmount(amount, id = "") {
    //code to add pledge Count and pledge Remaining Amount in PAY OFF PledgeTab
    let amt = this.commonMethodService.pledgeRemainingAmountTotal;
    if (amt != 0) {
      this.pledgeCount = this.commonMethodService.payPledgeCount;
      this.pledgeRemainingAmount = parseFloat(amt.toFixed(2));
    }

    if (amount != "") {
      amount = Number(amount);
      this.selectedAmount = amount.toFixed(2);
      this.disableValue = false;
      if (
        !this.CheckPaymentValidation(this.paymentMethodId) ||
        (!this.isDonorSkipped && !this.isDonorSelected)
      ) {
        setTimeout(() => {
          // this.paymentNext.nativeElement.focus(), 10
        });
      }
      if (
        this.CheckPaymentValidation(this.paymentMethodId) &&
        (this.isDonorSkipped || this.isDonorSelected)
      ) {
        setTimeout(() => {
          // this.paymentProcess.nativeElement.focus(), 10
        });
      }
      if (id != "") {
        $("#" + id).focus();
      }
      // this.isSelectAmoutClickddlPaymentReason=true;
    } else {
      this.disableValue = true;
    }
  }
  removeDpw() {
    this.isSelectAmoutClickddlPaymentReason = false;
  }
  resonDrpFirstTime = false;
  reasonDrpTabIn(event) {
    this.isSelectAmoutClickddlPaymentReason = false;
    if (!this.resonDrpFirstTime) {
      //event.srcElement.firstElementChild.hidden=true;
      this.OpenReasonDrp();
      $(".md-drppicker").addClass("hidden");
      $(".md-drppicker").removeClass("shown");
      event.preventDefault();
    } else {
      this.resonDrpFirstTime = true;
    }
  }
  CampaingDrpTabIn(event) {
    this.isSelectAmoutClickddlPaymentReason = false;
    this.closeReasonDrp();
    this.OpenCampaignDrp();
  }
  LocationDrpTabIn(event) {
    this.closeCampaignDrp();
    this.OpenLocationDrp();
  }

  CollectorDrpTabIn(event) {
    this.closeLocationDrp();
    this.OpenCollectionDrp();
  }

  DateTabIn(event) {
    this.closeCollectionDrp();
    this.OpenDatePicker();
  }

  btnAmountTabNextTabIn() {
    this.resonDrpFirstTime = false;
    $(".md-drppicker").addClass("hidden");
    $(".md-drppicker").removeClass("shown");
    if (
      !this.CheckPaymentValidation(this.paymentMethodId) ||
      (!this.isDonorSkipped && !this.isDonorSelected)
    ) {
      setTimeout(() => {
        this.paymentNext.nativeElement.focus(), 10;
      });
    }
    if (
      this.CheckPaymentValidation(this.paymentMethodId) &&
      (this.isDonorSkipped || this.isDonorSelected)
    ) {
      setTimeout(() => {
        this.paymentProcess.nativeElement.focus(), 10;
      });
    }
    $("#ddlPaymentReason").focus();
    this.isSelectAmoutClickddlPaymentReason = true;
  }

  TypeAmount(amount) {
    if (amount != "") {
      this.disableValue = false;
    } else {
      this.disableValue = true;
    }
  }

  TriggerPaymentEvent() {
    if (
      this.selectedAmount != 0 &&
      this.selectedAmount != undefined &&
      !this.isPayPledgeError
    ) {
      if (
        !this.CheckPaymentValidation(this.paymentMethodId) ||
        (!this.isDonorSkipped && !this.isDonorSelected)
      ) {
        this.SwitchTab();
      }
      if (
        this.CheckPaymentValidation(this.paymentMethodId) &&
        (this.isDonorSkipped || this.isDonorSelected)
      ) {
        this.ProcessTransaction();
      }
    }
  }
  ChangeEmail($event) {
    this.EmailCheckbox = $event.target.checked;
  }

  ChangePhone($event) {
    this.PhoneCheckbox = $event.target.checked;
  }
  TriggerPaymentTypeEvent() {
    if (
      this.disableValue ||
      this.selectedAmount == undefined ||
      (!this.isDonorSkipped && !this.isDonorSelected)
    ) {
      this.OpenTab();
    }
  }

  SearchGlobalDonor() {
    this.isGlobalList = true;
    this.showBox = true;
    var text = $("#donorText").val().trim();
    this.commonMethodService.onDonorSearchFieldChange(text, true);
    setTimeout(() => {
      this.changeDetectorRef.detectChanges();
    }, 5000);
  }
  OnCheckboxChange(event) {
    this.showBox = false;
    if (event.target.checked) {
      this.isCalldonorApi = true;
      this.displaySearchIcon = true;
    } else {
      this.isCalldonorApi = false;
      this.displaySearchIcon = false;
    }
  }
  isListBind = false;
  SearchDonor(event) {
    if (event == "") {
      this.commonMethodService.donorList = [];
    }
    if (event.target.value.length > 2) {
      this.keyword = event.target.value.toLowerCase().replace(/[().-]/g, "");
      if ($("#globallist").is(":checked")) {
        if (!this.isGlobalList) {
          this.commonMethodService.donorList = [];
        }
        this.displaySearchIcon = true;
        if (event.keyCode === 13 && !this.isGlobalList) {
          this.showBox = true;
          this.isGlobalList = true;
          this.displaySearchIcon = false;
          this.commonMethodService.onDonorSearchFieldChange(
            this.keyword.trim(),
            true
          );
          setTimeout(() => {
            this.changeDetectorRef.detectChanges();
          }, 5000);
        }
      } //local donor serach
      else {
        this.showBox = true;
        this.isGlobalList = false;
        this.search(this.keyword);
      }
      if (event.keyCode === 13) {
        var selectedAccountId =
          this.commonMethodService.donorList.length > 0 &&
          this.commonMethodService.donorList[this.selectedDonorIndex].accountId;
        if (selectedAccountId != false) {
          this.SelectDonor(selectedAccountId);
        }
      }
      this.isSearchDisable = false;
      this.isListBind = true;
    } else {
      this.isSearchDisable = true;
    }
  }

  //local search DonorList
  search(keyword) {
    var record = this.commonMethodService.localDonorList;
    keyword = keyword.toLowerCase();
    var filterdRecord;
    if (keyword != "") {
      var searchArray = keyword.split(" ");
      for (var searchValue of searchArray) {
        filterdRecord = record.filter(
          (obj) =>
            (obj.donorStatus == "Active" &&
              ((obj.accountNum &&
                obj.accountNum.toString().toLowerCase().indexOf(searchValue) >
                  -1) ||
                (obj.fullName &&
                  obj.fullName.toString().toLowerCase().indexOf(searchValue) >
                    -1) ||
                (obj.fullNameJewish &&
                  obj.fullNameJewish
                    .toLowerCase()
                    .toString()
                    .indexOf(searchValue) > -1) ||
                (obj.address &&
                  obj.address.toString().toLowerCase().indexOf(searchValue) >
                    -1) ||
                (obj.cityStateZip &&
                  obj.cityStateZip
                    .toString()
                    .toLowerCase()
                    .indexOf(searchValue) > -1) ||
                (obj.group &&
                  obj.group.toString().toLowerCase().indexOf(searchValue) >
                    -1) ||
                (obj.class &&
                  obj.class.toString().toLowerCase().indexOf(searchValue) >
                    -1) ||
                (obj.phoneLabels &&
                  obj.phoneLabels
                    .toString()
                    .toLowerCase()
                    .indexOf(searchValue) > -1) ||
                (obj.phonenumbers &&
                  obj.phonenumbers
                    .toString()
                    .toLowerCase()
                    .indexOf(searchValue) > -1) ||
                (obj.emailLabels &&
                  obj.emailLabels
                    .toString()
                    .toLowerCase()
                    .indexOf(searchValue) > -1) ||
                (obj.emails &&
                  obj.emails.toString().toLowerCase().indexOf(searchValue) >
                    -1))) ||
            (obj.additionalPhoneNumbers &&
              obj.additionalPhoneNumbers
                .toString()
                .toLowerCase()
                .indexOf(searchValue) > -1)
        );

        if (filterdRecord.length > 0) {
          for (var i = 0; i < filterdRecord.length; i++) {
            filterdRecord[i].phoneNumber = this.setDonorPhoneNumber(
              filterdRecord[i]
            );
            filterdRecord[i].displayText = filterdRecord[i].fullName;
            filterdRecord[i].id = filterdRecord[i].accountId;
          }
        }
        this.commonMethodService.donorList = filterdRecord.filter(
          (x) => x.donorStatus == "Active"
        );
        record = this.commonMethodService.donorList;
      }
    } else {
      this.commonMethodService.donorList = [];
    }
  }

  setDonorPhoneNumber(donorObj) {
    donorObj.phoneLabels2 = "";
    donorObj.phoneNumber = "";
    if (donorObj.phonenumbers && donorObj.phoneLabels) {
      if (donorObj.phoneLabels && donorObj.phoneLabels.indexOf(",") > -1) {
        var lblArray = donorObj.phoneLabels.split(",");
        var phoneNoArray = donorObj.phonenumbers.split(",");
        phoneNoArray = phoneNoArray.slice(0, 2);
        lblArray = lblArray.slice(0, 2);
        var phoneLblArray = [];
        for (var k = 0; k < lblArray.length; k++) {
          phoneLblArray.push(lblArray[k].trim().charAt(0));
        }
        for (var j = 0; j < phoneLblArray.length; j++) {
          if (donorObj.phoneLabels2)
            donorObj.phoneLabels2 =
              donorObj.phoneLabels2 +
              "<br/>" +
              '<span class="formt_lbl">' +
              phoneLblArray[j] +
              "</span>" +
              ": " +
              "<strong>" +
              this.formatPhoneNumber(phoneNoArray[j]) +
              "</strong>";
          else
            donorObj.phoneLabels2 =
              '<span class="formt_lbl">' +
              phoneLblArray[j] +
              "</span>" +
              ": " +
              "<strong>" +
              this.formatPhoneNumber(phoneNoArray[j]) +
              "</strong>";
        }
      } else {
        donorObj.phoneLabels2 =
          '<span class="formt_lbl">' +
          donorObj.phoneLabels.trim().charAt(0) +
          "</span>" +
          ": " +
          "<strong>" +
          this.formatPhoneNumber(donorObj.phonenumbers) +
          "</strong>";
      }
      return donorObj.phoneLabels2;
    }
    return "";
  }
  formatPhoneNumber(phoneNumberString) {
    return this.commonMethodService.formatPhoneNumber(phoneNumberString);
  }
  closePopup() {
    this.closePledgeTooltip();
    this.commonMethodService.pledgeRemainingAmountTotal = 0;
    this.pledgeCount = this.commonMethodService.payPledgeCount = 0;
    localStorage.setItem(this.userName, JSON.stringify(this.localStorageArray));
    this.activeModal.dismiss();
    if (this.calendarSubscription) this.calendarSubscription.unsubscribe();
  }

  changeAmount(event) {
    this.selectedAmount = event;
  }

  changeSideTab(amount, tabName) {
    this.selectedAmount = amount;
    if (this.isPledgeDisabled) {
      this.OpenSideTab(tabName);
    }
  }

  OpenOptionTab() {
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup",
    };
    const modalRef = this.commonMethodService.openPopup(
      OptionTabPopupComponent,
      this.modalOptions
    );
  }

  ChangeCreditMask() {
    if (
      this.creditCardNumber != "" &&
      this.creditCardNumber.replace(/[_-]/g, "") != ""
    ) {
      var twodigit = this.creditCardNumber.substring(0, 2);
      var onedigit = this.creditCardCVV.substring(0, 1);
      if (twodigit == "34" || twodigit == "37") {
        this.maskCreditValue = this.creditCardService.getAmexMask();
      } else {
        if (this.isDinerCard) {
          this.DinerCard();
        } else {
          this.maskCreditValue = this.creditCardService.getDefaultMask();
        }
      }
    } else {
      this.maskCreditValue = this.creditCardService.getDefaultMask();
    }
  }
  DinerCard() {
    if (this.creditCardNumber.length == 14) {
      this.maskCreditValue = this.creditCardService.getDinersMask(true);
    } else if (this.creditCardNumber.length == 16) {
      this.maskCreditValue = this.creditCardService.getDinersMask();
    }
  }
  //code started for show currency and sybmol
  getCurrencies() {
    this.currency = this.localstoragedataService.getLoginUserCurrency();
    if (this.currency != null) {
      this.symbol = this.getCurrencySymbol(this.currency);
    } else {
      this.symbol = "";
    }
    let eventGuId = this.localstoragedataService.getLoginUserEventGuId();
    this.commonAPIMethodService.getCurrencies(eventGuId).subscribe((res) => {
      this.currencies = res;
    });
  }

  updateSymbol() {
    const selectedCurrency = this.currencies.find(
      (c) => c.currencyName === this.currency
    );
    if (selectedCurrency) {
      this.symbol = this.getCurrencySymbol(selectedCurrency.currencyName);
    } else {
      this.symbol = "";
    }
  }
  getCurrencySymbol(currencyName: string): string {
    switch (currencyName) {
      case "USD":
        return "$";
      case "CAD":
        return "$";
      case "EUR":
        return "€";
      case "GBP":
        return "£";
      case "ILS":
        return "₪";
      default:
        return "";
    }
  }
  //for show currency and sybmol code ended

  ChangeOJCMask() {
    if (
      this.creditCardOJCNumber != "" &&
      this.creditCardOJCNumber.replace(/[_-]/g, "") != ""
    ) {
      var twodigit = this.creditCardOJCNumber.substring(0, 2);
      if (twodigit == "34" || twodigit == "37") {
        this.maskOJCValue = this.creditCardService.getAmexMask();
      } else {
        this.maskOJCValue = this.creditCardService.getDefaultMask();
      }
    } else {
      this.maskOJCValue = this.creditCardService.getDefaultMask();
    }
  }

  MaskNumber() {
    var twodigit = this.creditCardNumber.substring(0, 2);
    if (twodigit == "34" || twodigit == "37") {
      this.maskCreditValue = this.creditCardService.getAmexMask();
      if (this.creditCardNumber.length == 16) {
        this.creditCardNumber = this.creditCardNumber.slice(0, -1);
        this.donorFundCCNumber = this.creditCardNumber;
      }
    } else {
      this.maskCreditValue = this.creditCardService.getDefaultMask();
      if (this.creditCardNumber.length == 16) {
        this.maskCreditValue = this.creditCardService.getDefaultMask();
      } else if (this.creditCardNumber.length == 15) {
        this.maskCreditValue = this.creditCardService.getDefaultMask(true);
      } else {
        if (this.isDinerCard) {
          this.DinerCard();
        } else {
          this.maskCreditValue = this.creditCardService.getDefaultMask();
        }
      }
    }
    var firstdigit = this.creditCardNumber.substring(0, 1);
    this.cvvMaxLength = firstdigit == "3" ? 4 : 3;
    var sixdigit = this.creditCardNumber.substring(0, 6);
    if (sixdigit == "690066") {
      this.isCvvVisible = sixdigit == "690066" ? false : true;
    }
  }
  EnterCreditCard(event) {
    this.inValidCCNum = false;
    this.inValidDonorFundNum = false;

    // added by new
    if (event.target.value.length >= 2) {
      var twodigit = this.creditCardNumber.substring(0, 2);
      if (twodigit == "34" || twodigit == "37") {
        this.maskCreditValue = this.creditCardService.getAmexMask();
      } else {
        if (this.isDinerCard) {
          this.DinerCard();
        } else {
          this.maskCreditValue = this.creditCardService.getDefaultMask();
        }
      }
    }

    const charCode = event.which ? event.which : event.keyCode;
    if (charCode == 13) {
      $("#expiryDate").focus();
    }
    var cardlength = event.target.value.replace(/[_-]/g, "").length;
    var masklength = this.maskCreditValue.replace(/[-]/g, "").length;
    if (cardlength == masklength || (this.isDinerCard && cardlength == 14)) {
      var result = this.creditCardService.luhnCheck(
        event.target.value.replace(/[_-]/g, "")
      );
      if (result == true) {
        this.inValidCCNum = false;
        this.inValidDonorFundNum = false;
      } else {
        this.inValidCCNum = true;
        this.inValidDonorFundNum = true;
      }

      $("#expiryDate").focus();
    }
  }
  EnterExpiryDate(event) {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode == 13) {
      $("#input-txtcreditCardCVV").focus();
    }
    var expirydatelength = event.target.value.replace(/[_/]/g, "").length;
    //if(expirydatelength==2){

    if (event.target.value.length == 2) {
      if (charCode == 8) {
      } else {
        var k = event.target.value;
        var thisVal = k;
        thisVal += "/";
        this.expDate = thisVal;
      }
    }
    //}
    if (expirydatelength == 4) {
      $("#input-txtcreditCardCVV").focus();
    }
  }
  EnterCVV(event) {
    if (this.isCvvVisible) {
      const charCode = event.which ? event.which : event.keyCode;
      if (charCode == 13) {
        $("#input-txtcreditCardZip").focus();
      }
      var cvvlength = event.target.value.length;
      if (cvvlength == this.cvvMaxLength) {
        $("#input-txtcreditCardZip").focus();
      }
    }
  }
  EnterOJCCreditCard(event) {
    this.inValidOJCNum = false;

    // added by new
    if (event.target.value.length >= 2) {
      var twodigit = this.creditCardOJCNumber.substring(0, 2);
      if (twodigit == "34" || twodigit == "37") {
        this.maskOJCValue = this.creditCardService.getAmexMask();
      } else {
        this.maskOJCValue = this.creditCardService.getDefaultMask();
      }
    }

    const charCode = event.which ? event.which : event.keyCode;
    if (charCode == 13) {
      $("#ojcexpirydate").focus();
    }
    var cardlength = event.target.value.replace(/[_-]/g, "").length;
    var masklength = this.maskOJCValue.replace(/[-]/g, "").length;
    if (cardlength == masklength) {
      var result = this.creditCardService.luhnCheck(
        event.target.value.replace(/[_-]/g, "")
      );
      if (result == true) {
        this.inValidOJCNum = false;
      } else {
        this.inValidOJCNum = true;
      }
      $("#ojcexpirydate").focus();
    }
  }

  //Edit card on wallet functionality code started
  EditWallet(type, walletId) {
    this.isloading = false;
    this.modalOptions = {
      centered: false,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup edit_wallet",
    };

    if (type == "add") {
      const modalRef = this.commonMethodService.openPopup(
        SavecardPopupComponent,
        this.modalOptions
      );
      modalRef.componentInstance.Type = type;
      modalRef.componentInstance.AccountId = this.accountId;
      modalRef.componentInstance.emtSaveWallet.subscribe((res) => {
        if (res) {
          var objDonorCard = {
            eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
            accountId: this.accountId,
          };
          this.cardService.getDonorCard(objDonorCard).subscribe((res: any) => {
            // hide loader
            this.isloading = true;
            this.LoadDonorCard(res);
          });
        }
        this.GetWalletList();
      });
    } else {
      var eventGuId = this.localstoragedataService.getLoginUserEventGuId();
      this.donorService
        .getWalletById(eventGuId, walletId)
        .subscribe((res: any) => {
          if (res) {
            const modalRef = this.commonMethodService.openPopup(
              SavecardPopupComponent,
              this.modalOptions
            );
            this.isloading = false;
            modalRef.componentInstance.WalletData = res;
            modalRef.componentInstance.Type = type;
            modalRef.componentInstance.emtSaveWallet.subscribe((res) => {
              if (res) {
                var objDonorCard = {
                  eventGuId:
                    this.localstoragedataService.getLoginUserEventGuId(),
                  accountId: this.accountId,
                };
                this.cardService
                  .getDonorCard(objDonorCard)
                  .subscribe((res: any) => {
                    // hide loader
                    this.isloading = true;
                    this.LoadDonorCard(res);
                    //calling wallet list code started

                    var eventGuId =
                      this.localstoragedataService.getLoginUserEventGuId();
                    this.donorService
                      .getWalletByAccountId(eventGuId, this.selectedDonorId)
                      .subscribe((res: any) => {
                        if (res) {
                          this.isWalletFound = false;
                          this.walletList = res;
                          // Find the index of the matching wallet in the walletList
                          const index = this.walletList.findIndex(
                            (wallet: any) =>
                              wallet.walletId === this.selectedWalletId
                          );

                          if (index !== -1) {
                            // If the matching wallet is found, remove it from its original position
                            const matchingWallet = this.walletList.splice(
                              index,
                              1
                            )[0];

                            // Add the matching wallet to the top of the walletList
                            this.walletList.unshift(matchingWallet);
                          }
                        } else {
                          this.isWalletFound = true;
                          this.walletList = [];
                        }
                      });
                    //calling wallet list code ended

                    // Scroll to the top of the list
                    this.scrollToTop();
                  });
              }
            });
          } else {
            Swal.fire({
              title: "No data found",
              text: "",
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
  }

  AddCard(accountId) {
    this.isloading = false;
    this.modalOptions = {
      centered: false,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup edit_wallet",
    };

    const modalRef = this.commonMethodService.openPopup(
      SavecardPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.Type = "add";
    modalRef.componentInstance.isPrimaryValue = true;
    modalRef.componentInstance.AccountId = accountId;
    modalRef.componentInstance.emtSaveWallet.subscribe((res) => {
      if (res) {
        this.isloading = false;
        this.Wallet();
      }
    });
  }

  RemoveCard(accountId) {
    var donors = this.DonorsList.filter(
      (donor) => donor[0].accountId !== accountId
    );
    this.bulkDonorList = [];
    this.bulkDonorDetails(donors);
    this.defaultCardDonorLength = this.defaultCardDonorLength - 1;
    this.fullCount = this.bulkDonorList.length;
    if (this.donorListWallets) {
      var listWallets = this.donorListWallets.filter(
        (donor) => donor.accountId !== accountId
      );
      this.walletIds = listWallets.map((item) => item.walletId);
      this.donorWithoutWallet = this.donorWithoutWallet.filter(
        (donor) => donor[0].accountId !== accountId
      );
    }
  }
  // Add this function to scroll to the top of the list
  scrollToTop() {
    if (this.walletListContainer && this.walletListContainer.nativeElement) {
      const containerElement = this.walletListContainer.nativeElement;
      containerElement.scrollTop = 0;
    }
  }

  LoadDonorCard(DonorCardValue: any) {
    this.setValue(DonorCardValue);
  }

  setValue(DonorCardDataValue: any) {
    if (DonorCardDataValue.lstPhoneNumber) {
      let phoneNumberList = [];
      for (var i = 0; i < DonorCardDataValue.lstPhoneNumber.length; i++) {
        var phoneLbl = DonorCardDataValue.lstPhoneNumber[i].split(":");
        var formattedphone = this.formatPhoneNumber(phoneLbl[1]);
        phoneNumberList.push({ number: formattedphone, type: phoneLbl[0] });
        this.exportPhoneList.push({ label: phoneLbl[0], value: phoneLbl[1] });
      }
      DonorCardDataValue.phoneNumberList = phoneNumberList;
    }
    if (DonorCardDataValue.lstEmail) {
      let emaillist = [];
      for (var i = 0; i < DonorCardDataValue.lstEmail.length; i++) {
        var emailLbl = DonorCardDataValue.lstEmail[i].split(":");
        emaillist.push({
          email: emailLbl[1],
          type: emailLbl[0] != null ? emailLbl[0].toUpperCase() : null,
        });
        this.exportEmailList.push(emailLbl[1]);
      }
      DonorCardDataValue.emaillist = emaillist;
    }

    if (DonorCardDataValue.lstAddress) {
      let addresslit = [];
      for (var i = 0; i < DonorCardDataValue.lstAddress.length; i++) {
        DonorCardDataValue.lstAddress[i].addressLabel =
          DonorCardDataValue.lstAddress[i].addressLabel != null
            ? DonorCardDataValue.lstAddress[i].addressLabel.toUpperCase()
            : null;
        addresslit.push(DonorCardDataValue.lstAddress[i]);
        this.exportAddressList.push(DonorCardDataValue.lstAddress[i]);
      }
      DonorCardDataValue.addresslit = addresslit;
    }
    for (var i = 0; i < DonorCardDataValue.phoneNumberList.length; i++) {
      DonorCardDataValue.phoneNumberList[i].type =
        DonorCardDataValue.phoneNumberList[i].type != null
          ? DonorCardDataValue.phoneNumberList[i].type.toUpperCase()
          : null;
    }
    this.phoneList = DonorCardDataValue.phoneNumberList;
    if (DonorCardDataValue.fullName == "") {
      this.fullName =
        DonorCardDataValue.title +
        " " +
        DonorCardDataValue.firstName +
        " " +
        DonorCardDataValue.lastName;
    } else {
      this.fullName = DonorCardDataValue.fullName;
    }
    if (DonorCardDataValue.fullNameJewish == "") {
      this.fullNameJewish =
        DonorCardDataValue.titleJewish +
        " " +
        DonorCardDataValue.firstNameJewish +
        " " +
        DonorCardDataValue.lastNameJewish;
    } else {
      this.fullNameJewish = DonorCardDataValue.fullNameJewish;
    }
    this.address = DonorCardDataValue.address;
    this.cityStateZip = DonorCardDataValue.cityStateZip;
    this.group = DonorCardDataValue.group;
    this.class = DonorCardDataValue.class;
    this.totalPayments = DonorCardDataValue.totalPayments;
    this.totalPledges = DonorCardDataValue.totalPledges;
    this.totalSchedules = DonorCardDataValue.totalSchedules;
    this.mostRecentPayment = DonorCardDataValue.mostRecentPayment;
    this.mostRecentPaymentDate = DonorCardDataValue.mostRecentPaymentDate;
    this.mostRecentPledge = DonorCardDataValue.mostRecentPledge;
    this.mostRecentPledgeDate = DonorCardDataValue.mostRecentPledgeDate;
    this.upcomingScheduleDate = DonorCardDataValue.upcomingScheduleDate;
    this.lstPhoneNumber = DonorCardDataValue.lstPhoneNumber;
    this.lstEmail = DonorCardDataValue.emaillist;
    this.lstAddress = DonorCardDataValue.lstAddress;
    this.accountId = DonorCardDataValue.accountId;
    this.fatherInLawId = DonorCardDataValue.fatherInLawId;
    this.fatherId = DonorCardDataValue.fatherId;
    this.fatherName = DonorCardDataValue.fatherName;
    this.fatherInLawName = DonorCardDataValue.fatherInLawName;
    this.accountWalletDetails = DonorCardDataValue.lstAccountWalletDetails;
    this.locationDetails = DonorCardDataValue.lstLocation;
    this.defaultLocation = DonorCardDataValue.defaultLocation;
    this.totalLocationsCount = DonorCardDataValue.totalLocationsCount;
    this.fatherNameJewish = DonorCardDataValue.fatherNameJewish;
    this.fatherInLawNameJewish = DonorCardDataValue.fatherInLawNameJewish;
    this.locationGridData = DonorCardDataValue.lstLocation;
    this.totalRaised =
      Number(DonorCardDataValue.totalPayments) +
      Number(DonorCardDataValue.totalPledges) +
      Number(DonorCardDataValue.totalSchedules);
    this.changelog = DonorCardDataValue.changeLog;
    this.globalId = DonorCardDataValue.globalId;
    this.advancedFieldValues = DonorCardDataValue.advancedFields;
    this.isDonorActive = DonorCardDataValue.active;
    this.lstDonorReceiptLog = DonorCardDataValue.lstDonorReceiptLog;
    this.lstRelatedNotifications =
      DonorCardDataValue.lstRelatedNotifications || [];

    this.donorTagList = DonorCardDataValue.tags;
    this.families = this.setFamily(DonorCardDataValue.families) || [];
    if (this.advancedFieldValues) {
      this.advancedFieldValues.forEach((element) => {
        if (
          element.advancedField.type == "dropdown" &&
          element.advancedField.options != null &&
          element.advancedField.options.indexOf(",") > -1
        ) {
          element.advancedField.options =
            element.advancedField.options.split(",");
        } else {
          element.advancedField.options = [element.advancedField.options];
        }
      });
    }

    this.isloading = false;
  }

  setFamily(res: Array<any>) {
    const memberTypeOrder = { אב: 1, חמיו: 2, חתנו: 3, בנו: 4 };
    if (res) {
      let familyMember = [];
      let fatherMember = [];
      var fatherInLawMember = [];
      let memberLength = 0;
      this.familyMember = [];
      this.families = [];
      res.forEach((element) => {
        if (element.familyType == "Family") {
          element.members.sort((memberA, memberB) => {
            if (memberA.memberType !== memberB.memberType) {
              return (
                memberTypeOrder[memberA.memberType] -
                memberTypeOrder[memberB.memberType]
              );
            } else {
              return memberA.familyMemberId - memberB.familyMemberId;
            }
          });
          element.members &&
            element.members.forEach((el) => {
              familyMember.push(el);
              if (el.memberType == "אב") {
                this.fatherNameJewish = el.fullName;
                this.fatherId = el.memberAccountId;
              }
              if (el.memberType == "חמיו") {
                this.fatherInLawNameJewish = el.fullName;
                this.fatherInLawId = el.memberAccountId;
              }
            });

          memberLength = familyMember.length;
        }
        if (element.familyType == "Father-Family") {
          element.members.sort((memberA, memberB) => {
            if (memberA.memberType !== memberB.memberType) {
              return (
                memberTypeOrder[memberA.memberType] -
                memberTypeOrder[memberB.memberType]
              );
            } else {
              return memberA.familyMemberId - memberB.familyMemberId;
            }
          });

          element.members &&
            element.members.forEach((el) => {
              fatherMember.push(el);
            });
          if (
            fatherMember.length > familyMember.length &&
            memberLength < familyMember.length
          ) {
            memberLength = fatherMember.length;
          }
        }
        if (element.familyType == "FatherInLaw-Family") {
          element.members.sort((memberA, memberB) => {
            if (memberA.memberType !== memberB.memberType) {
              return (
                memberTypeOrder[memberA.memberType] -
                memberTypeOrder[memberB.memberType]
              );
            } else {
              return memberA.familyMemberId - memberB.familyMemberId;
            }
          });
          element.members &&
            element.members.forEach((el) => {
              fatherInLawMember.push(el);
            });
          if (
            fatherInLawMember.length > fatherMember.length &&
            memberLength < fatherMember.length
          ) {
            memberLength = fatherInLawMember.length;
          }
        }
      });
      for (let i = 0; i < memberLength; i++) {
        this.familyMember.push({
          family: familyMember[i] != undefined ? familyMember[i] : null,
          father: fatherMember[i] != undefined ? fatherMember[i] : null,
          fatherInLaw:
            fatherInLawMember[i] != undefined ? fatherInLawMember[i] : null,
        });
      }
      return this.familyMember;
    }
    return [];
  }
  //Edit card on wallet functionality code ended

  focusAmtEvent() {
    this.amount10Field.nativeElement.focus();
    ///alert("Hello");
  }
  MaskOJCNumber() {
    var twodigit = this.creditCardOJCNumber.substring(0, 2);
    if (twodigit == "34" || twodigit == "37") {
      this.maskOJCValue = this.creditCardService.getAmexMask();
      if (this.creditCardOJCNumber.length == 16) {
        this.creditCardOJCNumber = this.creditCardOJCNumber.slice(0, -1);
      }
    } else {
      this.maskOJCValue = this.creditCardService.getDefaultMask();
      if (this.creditCardOJCNumber.length == 16) {
        this.maskOJCValue = this.creditCardService.getDefaultMask();
      } else if (this.creditCardOJCNumber.length == 15) {
        this.maskOJCValue = this.creditCardService.getDefaultMask(true);
      } else {
        this.maskOJCValue = this.creditCardService.getDefaultMask();
      }
    }
  }

  ValidExpiryDate(event) {
    if (event.target.value.length == 5) {
      this.isInValid = false;
      this.isExpiryDateValid = false;
      var currentMonth = new Date().getMonth() + 1;
      var currentYear = new Date().getFullYear().toString();
      var intCurYear = Number(currentYear.substring(2, 5));
      var expiryDate = event.target.value;
      var month = expiryDate.substring(0, 2);
      var year = expiryDate.substring(3, 5);
      if (this.inValidCCNum) {
        this.isInValid = true;
      }
      if (Number(month) > 12) {
        this.isExpiryDateValid = true;
        this.isInValid = true;
      }

      if (Number(year) < intCurYear) {
        this.isExpiryDateValid = true;
        this.isInValid = true;
      }
      if (Number(year) == intCurYear && Number(month) < currentMonth) {
        this.isExpiryDateValid = true;
        this.isInValid = true;
      }
    }
    if (event.target.value.length == 2) {
      // var spt=event.target.value;
      // var resSpt=spt.split('/');
      // var st=resSpt[0];
      // var sptLast=resSpt[1].split('');
      // var actulReult=st+'/'+ sptLast[2]+''+sptLast[3];
      // this.expDate=actulReult;
      // $('#expiryDate').val(actulReult);
      // //this.maskExpDateValue="00/0000";
    }
  }

  UnLock(value, type) {
    if (type == "collector") {
      this.isLockCollector = value;
      this.localStorageArray.isLockCollector = value;
    }

    if (type == "location") {
      this.isLockLocation = value;
      this.localStorageArray.isLockLocation = value;
    }

    if (type == "campaign") {
      this.isLockCampaign = value;
      this.localStorageArray.isLockCampaign = value;
    }

    if (type == "reason") {
      this.isLockReason = value;
      this.localStorageArray.isLockReason = value;
    }
    if (type == "date") {
      this.isLockDate = value;
      this.localStorageArray.isLockDate = value;
    }
  }
  NewTransaction() {
    this.selectedDonor = "";
    this.selectedAmount = null;
    this.bulkDonorList = [];
    this.paymentModeDetail = null;
    this.PhoneCheckbox = false;
    this.isReadOnly = false;
    this.EmailCheckbox = false;
    this.commonMethodService.txtQuery = "";
    this.isDonorSelected = false;
    this.commonMethodService.isBackTranctionCliked = false;
    this.isPaymentDone = false;
    this.paymentMethodId = 0;
    this.showTransaction = true;
    this.uniqueTransactionId = Guid.create();
    this.notifyDonarPhoneArray = [];
    this.notifyDonarEmailArray = [];
    this.notifyDonarEmail = "";
    this.removeDonor();
    this.selectedAmount = null;
    this.oldTransactionId = null;
    this.paymentModeDetail = "";
    this.OpenAmountTab("paymentTab");
    this.isCreditCard = false;
    this.isPaymentModeList = false;
    this.isCash = false;
    this.isCheckNumber = false;
    this.isPledgePayment = false;
    this.isOJC = false;
    this.isAch = false;
    this.isCharity = false;
    this.isPaymentModeList = false;
    this.isOther = false;
    this.isCash = false;
    this.isWallet = false;
    this.objScheduleData = [];
    this.checkSchedule = false;
    this.cardHolderName = "";
    this.creditCardNumber = "";
    this.cardReaderNum = "";
    this.expDate = "";
    this.creditCardZip = "";
    this.creditCardCVV = "";
    this.isTxtCardHolderName = false;
    $("#searcheddonorlist").show();
    $(".skip_button").show();
    this.pledgeinternalnotes = "";
    this.pledgeexternalnotes = "";
    this.getOptionUISetting();
    this.isPaymentList = false;
    this.selectedDate = { startDate: moment(new Date()) };
    this.EngHebCalPlaceholder = moment(new Date()).format("MM/DD/YYYY");
    this.refNumber = "";
  }

  BackToTransaction() {
    this.isPaymentDone = false;
    this.oldTransactionId = Guid.create();
    this.oldSelectedDonorId = this.selectedDonorId;
    this.oldpaymentMethodId = this.paymentMethodId;
    // error or decline
    this.commonMethodService.isBackTranctionCliked = true;
    if (!this.isSwipe) {
      this.creditCardCVV = "";
      this.creditCardZip = "";
      this.creditCardNumber = "";
      this.expDate = "";
      this.paymentModeDetail = null;
    }

    this.oldcreditCardNumber = this.creditCardNumber;
    // this.expDate= this.expDate.substring(0, 2) + "/" + this.expDate.substring(2, this.expDate.length);
    this.oldexpDate = this.expDate;
    this.selectedWalletId = null;
    this.oldcreditCardCVV = this.creditCardCVV;
    this.oldcheckNumber = this.checkNumber;
    this.oldcreditCardZip = this.creditCardZip;
    this.showTransaction = true;
    this.objScheduleData = { isAlert: true, ...this.objScheduleData };
    this.cardReaderNum = "";
    this.selectedScheduleStartDate = this.objScheduleData.startDate;

    this.maskCreditValue = "";

    if (this.checkSchedule) {
      this.selectedAmount = this.objScheduleData.donationAmount;
    } else {
      this.selectedAmount = this.selectedAmount;
    }
    this.oldSelectedAmount = this.selectedAmount;
    setTimeout(() => {
      this.OpenAmountTab("paymentTab"), 1000;
    });
  }
  ProcessTransaction() {    
    this.closePledgeTooltip();
    if (
      this.checkSchedule &&
      this.payOffPledges &&
      this.payOffPledges.length > 0 &&
      this.availableAmt > 0 &&
      this.isPledgeDisabled
    ) {
      Swal.fire({
        title:
          "Sorry but total schedule amount needs to be same as the pledge amount see your options below",
        html: "1. Update schedule amount to the pledge amount </br> 2. Create a pledge with the remaining schedule amount in apply the schedule to all pledges",
        icon: "error",
        confirmButtonText: this.commonMethodService.getTranslate(
          "WARNING_SWAL.BUTTON.CONFIRM.OK"
        ),
        customClass: {
          confirmButton: "btn_ok",
        },
      });
      return false;
    }
    this.commonMethodService.pledgeRemainingAmountTotal = 0;
    this.pledgeCount = this.commonMethodService.payPledgeCount;
    this.isloading = true;
    this.showTransaction = false;
    this.isCampaignRequired =
      this.localstoragedataService.getLoginUserisCampaignRequiredForTransaction();
    this.isReasonRequired =
      this.localstoragedataService.getLoginUserisReasonRequiredForTransaction();
    if (this.isCampaignRequired || this.isReasonRequired) {
      if (this.isCampaignRequired) {
        this.isCampaignRequired =
          this.selectedCampaignId == null || this.selectedCampaignId == 0
            ? true
            : false;
      }
      if (this.isReasonRequired) {
        this.isReasonRequired =
          this.selectedReasonId == null || this.selectedReasonId == 0
            ? true
            : false;
      }
      if (this.isCampaignRequired || this.isReasonRequired) {
        this.isloading = false;
        this.showTransaction = true;
        return false;
      }
    }
    if (
      !this.isPledgeDisabled ||
      !this.payOffPledges ||
      this.payOffPledges.length === 0
    ) {
      this.payOffPledges = this.pledgeDataIfAmountNotUpdated;
    }

    if (this.checkSchedule && this.scheduleDonationAmount != undefined) {
      if (this.scheduleFrequency && this.scheduleFrequency.length == 0) {
        Swal.fire({
          title: "Error",
          text: "Please select schedule frequency",
          icon: "error",
          confirmButtonText: this.commonMethodService
            .getTranslate("WARNING_SWAL.BUTTON.CONFIRM.OK")
            .commonMethodService.getTranslate("WARNING_SWAL.BUTTON.CONFIRM.OK"),
          customClass: {
            confirmButton: "btn_ok",
          },
        });
        this.showTransaction = true;
        this.isloading = false;
        return false;
      }
      var actualAmt =
        Number(this.scheduleAmtPerPayment) * Number(this.scheduleCount);

      if (actualAmt > Number(this.selectedAmount)) {
        Swal.fire({
          title:
            "Schedule Amount is increased " +
            this.commonMethodService.formatAmount(actualAmt),
          text: "To match amount with schedule payments",
          icon: "info",
          showCancelButton: true,
          confirmButtonText: "Continue",
          cancelButtonText: this.commonMethodService.getTranslate("CANCEL"),
          customClass: {
            confirmButton: "btn_continue",
            container: "schedule-amount-modal",
          },
        }).then((result) => {
          if (result.value) {
            this.selectedAmount = actualAmt;
            this.ProcessTransaction();
          }
        });
        this.showTransaction = true;
        this.isloading = false;
        return false;
      }
      if (this.scheduleDonationAmount)
        if (
          this.selectedScheduleStartDate.format("YYYY-MM-DD") ==
          moment(new Date()).format("YYYY-MM-DD")
        ) {
          this.selectedAmount =
            this.selectedAmount / Number(this.scheduleCount);
          this.scheduleDonationAmount = this.selectedAmount.toString();
          var count = Number(this.scheduleCount) - 1;
          this.scheduleCount = count == 0 ? "1" : count.toString();
          this.isFutureDate = false;
        }
      if (
        this.selectedScheduleStartDate.format("YYYY-MM-DD") >
        moment(new Date()).format("YYYY-MM-DD")
      ) {
        this.isFutureDate = false;
        this.selectedAmount = 0;
        var scheduleAmt =
          Number(this.scheduleDonationAmount) / Number(this.scheduleCount);
        this.scheduleDonationAmount = scheduleAmt.toString();
      }
    } else {
      this.scheduleDonationAmount = null;
      this.scheduleCount = null;
      this.selectedScheduleStartDate = null;
      this.scheduleFrequency = null;
    }

    if (this.paymentMethodId == -1) {
      var objPledgeTransaction = {
        macAddress: this.localstoragedataService.getLoginUserGuid(),
        accountId: !this.isDonorBulkSelected ? this.selectedDonorId : null,
        accountIds: !this.isDonorBulkSelected ? null : this.accountList,
        amount: this.selectedAmount,
        campaignId: this.selectedCampaignId,
        refNum: this.note,
        note: this.pledgeinternalnotes,
        externalNote: this.pledgeexternalnotes,
        paymentReasonId: this.selectedReasonId,
        createdBy: this.localstoragedataService.getLoginUserId(),
        recurringScheduleModel: {
          recurrenceAmount: parseFloat(this.scheduleDonationAmount),
          recurrenceCount: parseInt(this.scheduleCount),
          scheduleDateTime:
            this.selectedScheduleStartDate != undefined
              ? moment(this.selectedScheduleStartDate).format("YYYY-MM-DD")
              : null,
          recurrenceFrequency:
            this.scheduleFrequency != undefined
              ? parseInt(this.scheduleFrequency.map((s) => s.id))
              : null,
        },
        pledgeDate:
          this.selectedDate != undefined && this.selectedDate.startDate !== null
            ? moment(this.selectedDate.startDate).format("YYYY-MM-DD")
            : null,
        locationId: this.selectedLocationId,
        collectorId: this.selectedCollectorId,
        isSendPledgeEmail: false,
      };
      this.pledgeService
        .addPledge(objPledgeTransaction)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(
          (res: any) => {
            this.isloading = false;
            if (res) {
              this.scheduleToggle
                ? this.analytics.createdSchedulePledge()
                : this.analytics.createdPledge();

              this.isPaymentDone = true;
              this.isSuccess = true;
              this.isError = false;
              this.showTransaction = false;
              this.donorJewishname = res.donorJewishName;
              this.donorname = res.donorFullName;
              this.paymentStatus = "Success";
              this.receiptNum = res.pledgeNum;
              this.paymentId = res.pledgeId;
              this.email = res.emails;
              this.phone = res.phoneNums;
              this.accountNum = res.accountNum;
              this.successMessage = "Pledge added successfully";
              this.type = "Pledge";
              this.printActionBtn = "Print Bill";
              this.emailActionBtn = "Email Bill";
              this.textActionBtn = "Text Bill";
              this.mailActionBtn = "Mail Bill";
              this.accountId = res.accountId;
              this.commonMethodService.sendPledgeTrans(true);
              this.commonMethodService.sendPledgeSchdleTrans(true);
              this.note = "";
              this.pledgeId = undefined; // clear Pledge Id after complete
              this.isPledgeDisabled = false;
              this.payOffPledges = [];
              if (this.EmailCheckbox) {
                this.sendEmailRecieptApi(this.type, this.paymentId);
              }
              if (this.PhoneCheckbox) {
                this.sendPhoneRecieptApi(this.type, this.paymentId);
              }
            } else {
              this.isError = true;
              this.isSuccess = false;
              this.isPaymentDone = true;
              this.showTransaction = false;
              this.printActionBtn = "Print Bill";
              this.emailActionBtn = "Email Bill";
              this.textActionBtn = "Text Bill";
              this.mailActionBtn = "Mail Bill";
              this.errorMessage = "Error";
              // this.paymentStatus=res.paymentStatus;
            }
            this.changeDetectorRef.detectChanges();
          },
          (error) => {
            this.isloading = false;
            console.log(error);
            this.activeModal.dismiss();
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
    } else if (this.paymentMethodId == 9) {
      let tmpRef = this.checkNumber || "";
      var objPayTransaction1 = {
        accountId: this.selectedDonorId,
        amount: this.selectedAmount,
        loginUserGuId: this.localstoragedataService.getLoginUserGuid(),
        paymentReasonId: this.selectedReasonId,
        paymentMethodId: this.paymentMethodId,
        cCNum: this.creditCardNumber,
        expiry: this.expDate,
        cVV: this.creditCardCVV,
        refNum: tmpRef,
        // refNum: this.checkNumber,
        zip: this.creditCardZip,
        isSaveToWallet: this.isSaveCard,
        createdBy: this.localstoragedataService.getLoginUserId(),
        uniqueTransactionId: this.uniqueTransactionId.toString(),
        paymentRecurringModel: {
          recurrenceAmount: parseFloat(this.scheduleDonationAmount),
          recurrenceCount: parseInt(this.scheduleCount),
          scheduleDateTime:
            this.selectedScheduleStartDate != undefined
              ? moment(this.selectedScheduleStartDate).format("YYYY-MM-DD")
              : null,
          recurrenceFrequency:
            this.scheduleFrequency != undefined
              ? parseInt(this.scheduleFrequency.map((s) => s.id))
              : null,
        },
        walletId: this.selectedWalletId,
        Pledges: this.payOffPledges,
        note: this.Note.value,
        cardHolderName: this.cardHolderName,
        campaignId: this.campaignIDFromSeat
          ? this.campaignIDFromSeat
          : this.selectedCampaignId,
        locationId: this.selectedLocationId,
        paymentDate: moment(this.selectedDate.startDate).format("YYYY-MM-DD"),
        // "Note": "string",
        collectorId: this.selectedCollectorId,
        SeatId: this.seatId,
        Label: this.label,
        SeatReservedType: this.seatReservedType,
        seatPrice: this.seatPrice,
        currency: this.currency,
        bankAccountVerify: {
          routingNum: this.RoutingNumber.value,
          accountNum: this.AccountNumber.value,
          accountType: this.AccountType.value,
          checkType: this.BankType.value,
          nameOnAccount: this.NameOnAccount.value,
        },
        macAddress: this.localstoragedataService.getLoginUserGuid(),
      };

      //ach api code started
      if (this.achForm.valid && this.isAch) {
        this.paymentService.AchTransaction(objPayTransaction1).subscribe(
          (res: any) => {
            this.isloading = false;
            if (res) {
              this.emtPaymentTransSeatList.emit(true);

              if (res.isDBTransSucceed || res.paymentStatus == "Success") {
                this.isPaymentFailed = false;
                this.isPaymentDone = true;
                this.isSuccess = true;
                this.isError = false;
                this.showTransaction = false;
                this.isPaymentExist = res.isPaymentExist;
                this.donorJewishname = res.responseMessage[0].donorJewishName;
                this.donorname = res.responseMessage[0].donorFullName;
                this.paymentStatus = res.paymentStatus;
                this.receiptNum = res.responseMessage[0].receiptNum;
                this.paymentId = res.responseMessage[0].paymentId;
                this.accountNum = res.responseMessage[0].accountNum;
                this.email = res.responseMessage[0].email;
                this.phone = res.responseMessage[0].phone;
                this.printActionBtn = "Print Receipt";
                this.emailActionBtn = "Email Receipt";
                this.textActionBtn = "Text Receipt";
                this.mailActionBtn = "Mail Receipt";
                this.successMessage = res.responseTitle;
                this.type = "Payment";
                this.commonMethodService.sendPaymentTrans(true);
                this.commonMethodService.sendPledgeTrans(true);
                this.commonMethodService.sendPaymentSchdleTrans(true);
                this.commonMethodService.sendPledgeSchdleTrans(true);
                this.note = "";
                this.pledgeId = undefined;
                this.isPledgeDisabled = false;
                this.payOffPledges = [];
                this.refNum = res.responseMessage[0].refNum;
                this.emtPaymentTrans.emit(true);
                this.errorMessage = "<h4>" + res.errorResponse + "</h4>";
                if (this.EmailCheckbox) {
                  this.sendEmailRecieptApi(this.type, this.paymentId);
                }
                if (this.PhoneCheckbox) {
                  this.sendPhoneRecieptApi(this.type, this.paymentId);
                }
              } else {
                this.donorJewishname =
                  res &&
                  res.responseMessage != null &&
                  res.responseMessage.length > 0
                    ? res.responseMessage[0].donorJewishName
                    : null;
                this.donorname =
                  res &&
                  res.responseMessage != null &&
                  res.responseMessage.length > 0
                    ? res.responseMessage[0].donorFullName
                    : null;
                this.receiptNum =
                  res &&
                  res.responseMessage != null &&
                  res.responseMessage.length > 0
                    ? res.responseMessage[0].receiptNum
                    : null;
                this.paymentId =
                  res &&
                  res.responseMessage != null &&
                  res.responseMessage.length > 0
                    ? res.responseMessage[0].paymentId
                    : null;
                this.isError = true;
                this.isSuccess = false;
                this.isPaymentDone = true;
                this.showTransaction = false;
                this.errorMessage = res.errorResponse;
                this.printActionBtn = "Print Receipt";
                this.emailActionBtn = "Email Receipt";
                this.textActionBtn = "Text Receipt";
                this.mailActionBtn = "Mail Receipt";
                this.paymentStatus = res.paymentStatus;
              }
              if (
                res &&
                res.responseMessage.length > 0 &&
                res.responseMessage[0].accountNum == "DEFAULT"
              ) {
                this.isDefaultCls = "default-donor";
              }
              this.changeDetectorRef.detectChanges();
            }
          },
          (error) => {
            this.isloading = false;
            console.log(error);
            this.activeModal.dismiss();
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
      //ach api code ended
    } else {
      if (this.paymentMethodId == 3) {
        this.creditCardNumber = this.creditCardOJCNumber;
        this.expDate = this.expOJCDate;
      }
      if (this.paymentMethodId == -2) {
        if (this.isMatbiaCard) {
          this.paymentMethodId = 6;
        } else if (this.isOJCCard) {
          this.paymentMethodId = 3;
        } else if (this.isPledgerCard) {
          this.paymentMethodId = 7;
        } else if (this.isDonorFundCard) {
          this.paymentMethodId = 8;
        } else {
          this.paymentMethodId = 4;
        }
      }

      if (this.oldTransactionId != null) {
        if (
          this.oldSelectedDonorId == this.selectedDonorId &&
          this.oldSelectedAmount == this.selectedAmount &&
          this.oldpaymentMethodId == this.oldpaymentMethodId
        ) {
          if (
            this.oldcreditCardNumber == this.creditCardNumber &&
            this.oldexpDate == this.expDate &&
            this.oldcreditCardCVV == this.creditCardCVV &&
            this.oldcreditCardZip == this.creditCardZip &&
            this.oldcheckNumber == this.checkNumber &&
            this.oldselectedWalletId == this.selectedWalletId
          ) {
            this.uniqueTransactionId = Guid.create();
          } else {
            this.uniqueTransactionId = Guid.create();
          }
        } else {
          this.uniqueTransactionId = Guid.create();
        }
      }
      // if expDate "/"
      if (this.expDate.includes("/")) {
        var vl = this.expDate;
        var vr = vl.split("/");
        var rr = vr[0] + "" + vr[1];
        this.expDate = rr;
      }

      let tmpRef = this.checkNumber || "";
      if (this.paymentMethodId == 5) {
        tmpRef = this.refNumber || "";
      }
      if (this.isWallet && this.isDonorBulkSelected) {
        this.walletPayment();
      } else {
        this._payTransactionSubject.next(true);
      }
      this.changeDetectorRef.detectChanges();
    }
  }
  walletPayment() {
    var obj = {
      walletIds: this.walletIds,
      amount: this.selectedAmount,
      loginUserGuId: this.localstoragedataService.getLoginUserGuid(),
      paymentReasonId: this.selectedReasonId,
      paymentMethodId: this.paymentMethodId,
      paymentRecurringModel: {
        recurrenceAmount: parseFloat(this.scheduleDonationAmount),
        recurrenceCount: parseInt(this.scheduleCount),
        scheduleDateTime:
          this.selectedScheduleStartDate != undefined
            ? moment(this.selectedScheduleStartDate).format("YYYY-MM-DD")
            : null,
        recurrenceFrequency:
          this.scheduleFrequency != undefined
            ? parseInt(this.scheduleFrequency.map((s) => s.id))
            : null,
        holidayId: 0,
      },
      campaignId: this.campaignIDFromSeat
        ? this.campaignIDFromSeat
        : this.selectedCampaignId,
      note: "",
      collectorId: this.selectedCollectorId,
      createdBy: this.localstoragedataService.getLoginUserId(),
      uniqueTransactionId: this.uniqueTransactionId.toString(),
      paymentDate: moment(this.selectedDate.startDate).format("YYYY-MM-DD"),
      locationId: this.selectedLocationId,
      currency: this.currency,
      isWithoutAuth: this.isWithoutAuth,
      stopAutoReciept: true,
    };
    this.paymentService.BulkPayTransaction(obj).subscribe((res) => {
      if (res) {
        this.analytics.bulkChargeDonor();
        this.isloading = false;
        this.isSuccess = true;
        this.successMessage = "Success";
        this.changeDetectorRef.detectChanges();
      }
    });
  }
  disableTab(event) {
    this.isPayPledgeError = event;
    this.payPledgeToolTip =
      this.isPayPledgeError == true
        ? "Please fix pledge errors before leaving"
        : "";
  }

  CheckPledgeValidation() {
    if (this.isDonorSelect && !this.isCampaignSelect) {
      this.OpenAmountTab("donorInfoTab");
    }
    if (this.selectedDonorId == null && this.bulkDonorList.length == 0) {
      this.isDonorSelect = true;
    }
    if (this.selectedCampaign == "") {
      this.isCampaignSelect = true;
    }
    if (
      (this.selectedDonorId != null || this.bulkDonorList.length != 0) &&
      this.selectedCampaign != ""
    ) {
      if (
        this.selectedAmount == undefined ||
        this.selectedAmount == null ||
        String(this.selectedAmount) == ""
      )
        this.OpenAmountTab("donationTab");
      else {
        this.ProcessTransaction();
      }
    }
  }
  isOnlyPledgePayment: boolean = false;
  printReceipt(paymentId, type) {
    if (this.isDefaultCls == "default-donor") {
      return true;
    }
    this.isActionloading = false;
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup print_receipt",
    };
    const modalRef = this.commonMethodService.openPopup(
      PrintSingleReceiptPopupComponent,
      this.modalOptions
    );

    var objMailReceipt = {
      type: type,
      id: paymentId,
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      isOnlyPledgePayment: this.isOnlyPledgePayment,
    };
    this.messengerService.PrintReceipt(objMailReceipt).subscribe((res: any) => {
      this.isActionloading = false;
      if (res) {
        modalRef.componentInstance.fileDetails = {
          filename: res.receiptFileUrl,
          filetype: res.contentType,
        };
      } else {
        this.activeModal.dismiss();
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
    }),
      (error) => {
        this.isActionloading = false;
        console.log(error);
        this.activeModal.dismiss();
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
      };
  }
  SendTextReceipt(paymentId, type) {
    if (this.isDefaultCls == "default-donor") {
      return true;
    }
    this.isActionloading = false;
    this.modalOptions = {
      centered: true,
      size: "md",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup send_textreceipt send_emailreceipt",
    };
    let phoneArray: any = [];
    if (this.additionalPhones && this.additionalPhones.indexOf(",") > -1) {
      phoneArray = this.additionalPhones.split(", ");
    } else {
      phoneArray = this.additionalPhones;
    }

    let rowColumn = this.commonMethodService.getLabelArray(
      this.additionalPhoneLabels,
      phoneArray,
      this.countryCodeId
    );

    const modalRef = this.commonMethodService.openPopup(
      SendTextreceiptPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.Info = {
      id: paymentId,
      type: type,
      phoneList: rowColumn,
      accountId: this.paymentAccountId,
      isDonorSelected: this.isDonorSelected,
      globalId: this.globalId,
    };
  }
  SendMailReceipt(paymentId, type) {
    if (this.isDefaultCls == "default-donor") {
      return true;
    }
    this.isActionloading = false;
    this.modalOptions = {
      centered: true,
      size: "md",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup send_mailreceipt",
    };
    const modalRef = this.commonMethodService.openPopup(
      SendMailreceiptPopupComponent,
      this.modalOptions
    );

    modalRef.componentInstance.Info = {
      id: paymentId,
      type: type,
      accountId: this.paymentAccountId,

      accountNum: this.accountNum,
      address: this.address || "",
      cityStateZip: this.cityStateZip || "",
      isGlobalId: this.isGlobalId,
    };

    modalRef.componentInstance.emitAddressUpdated.subscribe((obj) => {
      this.address = obj.address;
      this.cityStateZip = obj.cityStateZip;
    });
  }

  SendEmailReceipt(paymentId, type) {
    if (this.isDefaultCls == "default-donor") {
      return true;
    }
    this.isActionloading = false;
    this.modalOptions = {
      centered: true,
      size: "md",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup send_emailreceipt",
    };
    let elist: any = [];
    let emailArray: any = [];
    if (this.emailList) {
      for (let index = 0; index < this.emailList.length; index++) {
        const element = this.emailList[index].emailAddress;
        elist.push(element);
      }
    }
    if (this.additionalEmail && this.additionalEmail.indexOf(",") > -1) {
      emailArray = this.additionalEmail.split(", ");
    } else {
      emailArray = this.additionalEmail;
    }
    let rowColumn = this.commonMethodService.getLabelArray(
      this.additionalEmailLabels,
      emailArray,
      this.countryCodeId
    );

    const modalRef = this.commonMethodService.openPopup(
      SendEmailreceiptPopupComponent,
      this.modalOptions
    );

    modalRef.componentInstance.Info = {
      id: paymentId,
      type: type,
      emailList: rowColumn ? rowColumn : elist,
      accountId: this.paymentAccountId,
      isDonorSelected: this.isDonorSelected,
      globalId: this.globalId,
      phoneNumber: this.phones == undefined ? this.phone : this.phones,
    };
  }

  VoidPayment(paymentId) {
    Swal.fire({
      title: this.commonMethodService.getTranslate("WARNING_SWAL.TITLE"),
      text: this.commonMethodService.getTranslate("WARNING_SWAL.TEXT"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: this.commonMethodService.getTranslate(
        "WARNING_SWAL.BUTTON.CONFIRM.YES_VOID_IT"
      ),
      cancelButtonText: this.commonMethodService.getTranslate(
        "WARNING_SWAL.BUTTON.CANCEL.NO_KEEP_IT"
      ),
    }).then((result) => {
      if (result.value) {
        this.isActionloading = true;
        var objVoidPayment = {
          paymentId: paymentId,
          loginUserId: this.localstoragedataService.getLoginUserId(),
          macAddress: this.localstoragedataService.getLoginUserGuid(),
          eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
        };
        this.paymentService.VoidPayment(objVoidPayment).subscribe(
          (res: any) => {
            this.isActionloading = false;
            if (res) {
              if (res.status == "Success") {
                Swal.fire({
                  title: this.commonMethodService.getTranslate(
                    "WARNING_SWAL.SUCCESS_TITLE"
                  ),
                  text: res.message,
                  icon: "success",
                  confirmButtonText: this.commonMethodService.getTranslate(
                    "WARNING_SWAL.BUTTON.CONFIRM.OK"
                  ),
                  customClass: {
                    confirmButton: "btn_ok",
                  },
                });

                this.commonMethodService.sendPaymentTrans(true);
              } else if (res.status == "Error") {
                this.activeModal.dismiss();
                Swal.fire({
                  title: this.commonMethodService.getTranslate(
                    "WARNING_SWAL.SOMETHING_WENT_WRONG"
                  ),
                  text: res.message,
                  icon: "error",
                  confirmButtonText: this.commonMethodService.getTranslate(
                    "WARNING_SWAL.BUTTON.CONFIRM.OK"
                  ),
                  customClass: {
                    confirmButton: "btn_ok",
                  },
                });
              } else {
                this.activeModal.dismiss();
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
            }
          },
          (error) => {
            this.isloading = false;
            console.log(error);
            this.activeModal.dismiss();
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
          text: this.commonMethodService.getTranslate(
            "WARNING_SWAL.NO_ACTION_TAKEN"
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
  }

  VoidPledge(pledgeId) {
    Swal.fire({
      title: this.commonMethodService.getTranslate("WARNING_SWAL.TITLE"),
      text: this.commonMethodService.getTranslate("WARNING_SWAL.TEXT"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: this.commonMethodService.getTranslate(
        "WARNING_SWAL.BUTTON.CONFIRM.YES_VOID_IT"
      ),
      cancelButtonText: this.commonMethodService.getTranslate(
        "WARNING_SWAL.BUTTON.CANCEL.NO_KEEP_IT"
      ),
    }).then((result) => {
      if (result.value) {
        this.isActionloading = true;
        var objVoidPledge = {
          pledgeId: pledgeId,
          statusId: 3,
          accountId: this.accountId,
          macAddress: this.localstoragedataService.getLoginUserGuid(),
          eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
        };
        this.pledgeService.updatePledge(objVoidPledge).subscribe(
          (res: any) => {
            this.isActionloading = false;
            this.isloading = false;
            if (res) {
              this.analytics.editedPledge();

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
              this.commonMethodService.sendPledgeTrans(true);
            } else {
              this.activeModal.dismiss();
              Swal.fire({
                title: this.commonMethodService.getTranslate(
                  "WARNING_SWAL.TRY_AGAIN"
                ),
                text: res,
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
            this.isActionloading = false;
            console.log(error);
            this.activeModal.dismiss();
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
          text: this.commonMethodService.getTranslate(
            "WARNING_SWAL.NO_ACTION_TAKEN"
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
  }

  openPaymentCardPopup(paymentId) {
    this.isloading = false;
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: false,
      keyboard: true,
      windowClass: "drag_popup payment_card",
    };
    const modalRef = this.commonMethodService.openPopup(
      PaymentCardPopupComponent,
      this.modalOptions
    );
    var objDonorCard = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      paymentId: paymentId,
    };

    this.cardService.getPaymentCard(objDonorCard).subscribe((res: any) => {
      // hide loader
      this.isloading = false;
      if (res) {
        modalRef.componentInstance.PaymentCardData = res;
      }
    });
  }

  openPledgeCardPopup(pledgeId) {
    this.isActionloading = false;
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup pledgeCard",
    };
    const modalRef = this.commonMethodService.openPopup(
      PledgeCardPopupComponent,
      this.modalOptions
    );
    var eventGuid = this.localstoragedataService.getLoginUserEventGuId();
    this.pledgeService
      .GetPledgeCard(eventGuid, pledgeId)
      .subscribe((res: any) => {
        // hide loader
        this.isActionloading = false;

        modalRef.componentInstance.PledgeCardData = res;
      });
  }

  OnGlobalCheckboxChange(event) {
    if (event.target.checked) {
      this.isLocationGLobal = true;
    } else {
      this.isLocationGLobal = false;
    }
  }

  disablePledgePayment(value) {
    this.isPledgeDisabled = value;
  }

  contains_heb(str) {
    return /[\u0590-\u05FF]/.test(str);
  }
  isCreateDonorPopup = false;
  OpenCreateDonorPopup() {
    this.isCreateDonorPopup = true;
    this.modalOptions = {
      centered: false,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup  donor_popup ",
    };
    const modalRef = this.commonMethodService.openPopup(
      DonorSaveComponent,
      this.modalOptions
    );
    modalRef.componentInstance.Type = "add";
    var ishebrew = this.contains_heb(this.keyword);
    if (ishebrew) {
      var jewish = this.keyword;
    } else {
      var english = this.keyword;
    }
    modalRef.componentInstance.DonorName = {
      jewishName: jewish,
      englishName: english,
    };
    modalRef.componentInstance.emtOutputDonorTransaction.subscribe(
      (response) => {
        this.isCreateDonorPopup = false;
        //this.commonMethodService.localDonorList;
        this.commonMethodService.donorList = [response];
        this.SelectDonorTest(response.accountId);
      }
    );
  }

  cardHolderNameHideShow() {
    this.isTxtCardHolderName = true;
    $("#searcheddonorlist").hide();
    $(".skip_button").hide();
    $(".txtBtn").removeAttr("disabled");
    this.cardHolderName = $("#donorText").val();
    this.isDonorSkipped = true;
    //this.isDonorSelected=true;
  }
  cardHolderNameTextEnableNextButton() {
    // if(this.cardHolderName.length>0){
    //    $('.txtBtn').removeAttr('disabled');
    // }else{
    //   $('.txtBtn').attr('disabled','disabled');
    //}
  }
  resetCardHolderName() {
    this.isTxtCardHolderName = false; //added new
    this.isDonorSkipped = true; //added new
    this.cardHolderName = "";
    $(".txtBtn").attr("disabled", "disabled");
    this.removeDonor();
    this.OpenAmountTab("donorInfoTab");
  }

  // added new
  SelectDonorTest(accountId) {
    this.selectedDonorId = accountId;
    this.showBox = false;
    this.commonMethodService.donorList =
      this.commonMethodService.donorList.filter(
        (s) => s.accountId == accountId
      );
    this.GetWalletList();

    this.getPayPledgeList = true;
    this.selectedDonor =
      this.commonMethodService.donorList[0].fullNameJewish != null &&
      this.commonMethodService.donorList[0].fullNameJewish != ""
        ? this.commonMethodService.donorList[0].fullNameJewish
        : this.commonMethodService.donorList[0].fullName;
    this.commonMethodService.donorList[0].displayText = this.selectedDonor;
    this.displayText = this.commonMethodService.donorList[0].displayText;
    this.fullNameJewish = this.commonMethodService.donorList[0].fullNameJewish;
    this.defaultLocation =
      this.commonMethodService.donorList[0].defaultLocation;
    this.address = this.commonMethodService.donorList[0].address;
    this.cityStateZip = this.commonMethodService.donorList[0].cityStateZip;
    this.father = this.commonMethodService.donorList[0].father;
    this.fatherInLaw = this.commonMethodService.donorList[0].fatherInLaw;
    this.phoneNumber = this.commonMethodService.donorList[0].phoneLabels2
      ? '<span class="trs-donor-contact">' +
        this.commonMethodService.donorList[0].phoneLabels2.replace(
          "<br/>",
          "&nbsp&nbsp&nbsp"
        ) +
        "</span>"
      : "";
    this.accountNum = this.commonMethodService.donorList[0].accountNum;
    this.accountId = this.commonMethodService.donorList[0].accountId;
    this.isDonorSelected = true;
    this.showRemoveDonorIcon = true;
    this.isReadOnly = true;
    this.isDonorSelect = false;
    this.commonMethodService.loaderSearch = false;
    this.cityStateZip = this.commonMethodService.donorList[0].cityStateZip;

    if (this.commonMethodService.donorList[0].emails) {
      if (this.commonMethodService.donorList[0].emails.indexOf(",") > 1) {
        this.emails = this.commonMethodService.donorList[0].emails.split(",");
      } else {
        this.emails = this.commonMethodService.donorList[0].emails;
      }
    }
    if (this.commonMethodService.donorList[0].phoneLabels) {
      this.phoneLabels = this.commonMethodService.donorList[0].phoneLabels;
    }

    if (
      this.commonMethodService.donorList[0].phonenumbers &&
      this.commonMethodService.donorList[0].phonenumbers.indexOf(",") > 1
    ) {
      this.phones =
        this.commonMethodService.donorList[0].phonenumbers.split(",");
    } else {
      this.phones = this.commonMethodService.donorList[0].phonenumbers;
    }
    if (
      !this.CheckPaymentValidation(this.paymentMethodId) ||
      this.selectedAmount == undefined
    ) {
      setTimeout(() => {
        this.donorNext.nativeElement.focus(), 10;
      });
    } else if (
      this.CheckPaymentValidation(this.paymentMethodId) &&
      this.selectedAmount != 0 &&
      this.selectedAmount != undefined
    ) {
      setTimeout(() => {
        this.donorProcess.nativeElement.focus(), 10;
      });
    }
    //this.isloadingdonor=false;
  }
  fisrtIndexTab(event, amt: any, cls: number) {
    $(".tab-active").removeClass("tab-active");
    $(".li-" + cls).addClass("tab-active");
    this.selectedAmount = amt.toFixed(2);
    this.commonMethodService.getPledgeAmount(amt);
  }
  removeClsfisrtIndexTab(event) {
    //console.log(event)
    $(".tab-active").removeClass("tab-active");
  }
  isTab_Amount = false;
  backToFistIndexTab(event) {
    this.isTab_Amount = true;
    $(".tab-active").removeClass("tab-active");
    if (this.isAmtBtnEnterKye) {
      this.isAmtBtnEnterKye = false;
    } else {
      // $('#id_btn_ten').focus();
      $(".btn-ten-li").removeClass("tab-active");

      if (
        !this.CheckPaymentValidation(this.paymentMethodId) ||
        (!this.isDonorSkipped && !this.isDonorSelected)
      ) {
        setTimeout(() => {
          this.paymentNext.nativeElement.focus(), 10;
        });
      }
      if (
        this.CheckPaymentValidation(this.paymentMethodId) &&
        (this.isDonorSkipped || this.isDonorSelected)
      ) {
        setTimeout(() => {
          this.paymentProcess.nativeElement.focus(), 10;
        });
      }
      $("#ddlPaymentReason").focus();
      this.isSelectAmoutClickddlPaymentReason = true;
    }
  }
  backToPaymentFistIndexTab(event) {
    //$('#id_tab_creditcard').focus();
  }
  PaymentFisrtIndexTab(event, type) {
    if (this.OtherCurrencyId) {
      type == "creditcard"
        ? (this.isPaymentCredit = false)
        : (this.isPaymentCredit = true);
    }

    if (type == "other" && this.checkSchedule) {
      return true;
    }
    $(".tab-active").removeClass("tab-active");
    var cls = event.target.childNodes[0].classList[1];
    $("." + cls).addClass("tab-active");
    this.indexTab_ChangePayment(type);
  }

  Wallet() {
    var obj = {
      eventGuid: this.localstoragedataService.getLoginUserEventGuId(),
      accountIds: this.accountList,
    };
    this.walletIds = [];
    this.donorService.getDefaultWallet(obj).subscribe((res: any) => {
      if (res) {
        this.isloading2 = false;

        this.donorListWallets = res;
        this.walletIds = res.map((item) => item.walletId);
        this.selectCardDonorLength = res.length;
        this.donorWithoutWallet = this.DonorsList.filter(
          (item) =>
            !this.donorListWallets.some(
              (walletItem) => walletItem.accountId === item[0].accountId
            )
        );
        this.selectedDonorLength = this.listLength;
        this.defaultCardDonorLength = this.selectedDonorLength - res.length;
        this.fullCount =
          this.selectCardDonorLength + this.defaultCardDonorLength;
        this.showTooltip = true;
        this.isCloseTooltip = true;
        this.changeDetectorRef.detectChanges();
      } else {
        this.isloading2 = false;
        this.donorListWallets = [];
        this.selectCardDonorLength = 0;
        this.donorWithoutWallet = this.DonorsList;
        this.fullCount = this.accountList.length;
        this.defaultCardDonorLength = this.listLength;
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  indexTab_ChangePayment(type) {
    $("#creditcardtab").removeClass("active");
    $("#achtab").removeClass("active");
    $("#charitytab").removeClass("active");
    $("#cashtab").removeClass("active");
    $("#checktab").removeClass("active");
    $("#pledgetab").removeClass("active");
    $("#ojctab").removeClass("active");
    $("#wallettab").removeClass("active");
    $("#notepanel").removeClass("note_payment");
    $("#donorfundtab").removeClass("active");
    $("#othertab").removeClass("active");
    this.paymentModeDetail = "";
    this.creditCardNumber = "";
    this.donorFundCCNumber = "";
    this.creditCardCVV = "";
    this.creditCardZip = "";
    this.expDate = "";
    this.checkNumber = "";
    this.expOJCDate = "";
    this.creditCardOJCNumber = "";
    this.isInValid = false;
    this.isSaveCard = false;
    this.isPayoffPledgeDisable = false;
    this.selectedWalletId = null;
    this.isVisaCard = true;
    this.isMasterCard = true;
    this.isAmericanExpress = true;
    this.isDiscoverCard = true;
    this.isMatbiaCard = true;
    this.isOJCCard = true;
    this.isDonorFundCard = true;
    this.isPledgerCard = true;
    this.isFutureDate = false;
    this.inValidCCNum = false;
    $("#notepanel").show();
    if (type == "creditcard") {
      if (!this.commonMethodService.isDisableAutomaticPayment) {
        this.EmailCheckbox = false;
        this.isPaymentVisited = true;
        this.notifyDonarEmail = {
          email: "Select Email",
          label: "",
        };
      }
      $("#creditcardtab").addClass("active");
      this.paymentMethodId = 4;
      this.isCharity = false;
      this.isCreditCard = true;
      this.paymentModeDetail = "Credit Card";
      this.paymentType = "Credit Card";
      this.isPaymentModeList = false;
      this.isCash = false;
      this.isCheckNumber = false;
      this.isPledgePayment = false;
      this.isOJC = false;
      this.isWallet = false;
      this.isDonorFund = false;
      this.isOther = false;
      this.isPayoffPledgeDisable = false;
      this.isAch = false;
      this.isNoAch = false;
      this.payPledgeMessagePopup();
      if (this.checkboxemail != "" && this.isVisited == true) {
        this.EmailCheckbox = this.checkboxemail;
        this.notifyDonarEmail = this.tempnotifyDonarEmail;
        this.isVisited = false;
      }
    } else if (type == "ach") {
      if (!this.commonMethodService.isDisableAutomaticPayment) {
        this.EmailCheckbox = false;
        this.notifyDonarEmail = {
          email: "Select Email",
          label: "",
        };
      }
      $("#id_tab_ach").addClass("active");
      this.paymentMethodId = 9;
      if (this.checkboxemail != "" && this.isVisited == true) {
        this.notifyDonarEmail = this.tempnotifyDonarEmail;
        this.EmailCheckbox = this.checkboxemail;
        this.isVisited = false;
      }
      if (this.isEnableACH === "True") {
        this.isAch = true;
      }
      if (this.isEnableACH === "False") {
        this.isNoAch = true;
      }
      this.paymentModeDetail = "Ach";
      this.paymentType = "Ach";
      this.isCharity = false;
      this.isCreditCard = false;
      this.isPaymentModeList = false;
      this.isCash = false;
      this.isCheckNumber = false;
      this.isPledgePayment = false;
      this.isOJC = false;
      this.isWallet = false;
      this.isDonorFund = false;
      this.isOther = false;
      this.isPayoffPledgeDisable = false;
      this.payPledgeMessagePopup();
      if (this.checkboxemail != "" && this.isVisited == true) {
        this.EmailCheckbox = this.checkboxemail;
        this.notifyDonarEmail = this.tempnotifyDonarEmail;
        this.isVisited = false;
      }
    } else if (type == "charity") {
      if (!this.commonMethodService.isDisableAutomaticPayment) {
        this.EmailCheckbox = false;
        this.notifyDonarEmail = {
          email: "Select Email",
          label: "",
        };
      }
      $("#charitytab").addClass("active");
      this.isCharity = true;
      this.paymentModeDetail = "Charity";
      this.paymentType = "Charity";
      this.paymentMethodId = -2;
      this.isCreditCard = false;
      this.isPaymentModeList = false;
      this.isCash = false;
      this.isCheckNumber = false;
      this.isPledgePayment = false;
      this.isOJC = false;
      this.isWallet = false;
      this.isDonorFund = false;
      this.isOther = false;
      this.isPayoffPledgeDisable = false;
      this.isAch = false;
      this.isNoAch = false;
      this.payPledgeMessagePopup();
      if (this.checkboxemail != "" && this.isVisited == true) {
        this.EmailCheckbox = this.checkboxemail;
        this.notifyDonarEmail = this.tempnotifyDonarEmail;
        this.isVisited = false;
      }
    } else if (type == "cash") {
      if (!this.commonMethodService.isDisableAutomaticPayment) {
        this.EmailCheckbox = false;
        this.notifyDonarEmail = {
          email: "Select Email",
          label: "",
        };
      }
      if (!this.checkSchedule) {
        $("#cashtab").addClass("active");
        this.paymentMethodId = 1;
        this.isCharity = false;
        this.isCash = true;
        this.isCreditCard = false;
        this.isPaymentModeList = false;
        this.isCheckNumber = false;
        this.isPledgePayment = false;
        this.isOJC = false;
        this.isWallet = false;
        this.isDonorFund = false;
        this.isOther = false;
        this.paymentModeDetail = "Cash";
        this.paymentType = "Cash";
        this.isPayoffPledgeDisable = false;
        this.isAch = false;
        this.isNoAch = false;
        this.payPledgeMessagePopup();
        if (this.checkboxemail != "" && this.isVisited == true) {
          this.EmailCheckbox = this.checkboxemail;
          this.notifyDonarEmail = this.tempnotifyDonarEmail;
          this.isVisited = false;
        }
      }
    } else if (type == "check") {
      if (!this.commonMethodService.isDisableAutomaticPayment) {
        this.EmailCheckbox = false;
        this.notifyDonarEmail = {
          email: "Select Email",
          label: "",
        };
      }
      $("#checktab").addClass("active");
      this.paymentModeDetail = "Check";
      this.paymentType = "Check";
      this.paymentMethodId = 2;
      this.isCharity = false;
      this.isCheckNumber = true;
      this.isCash = false;
      this.isCreditCard = false;
      this.isPaymentModeList = false;
      this.isPledgePayment = false;
      this.isOJC = false;
      this.isDonorFund = false;
      this.isWallet = false;
      this.isOther = false;
      this.isPayoffPledgeDisable = false;
      this.isOJCCard = false;
      this.isAch = false;
      this.isNoAch = false;
      setTimeout(() => {
        //$("#input-txtCheckNumber").focus();
      }, 1000);
      this.payPledgeMessagePopup();
      if (this.checkboxemail != "" && this.isVisited == true) {
        this.EmailCheckbox = this.checkboxemail;
        this.notifyDonarEmail = this.tempnotifyDonarEmail;
        this.isVisited = false;
      }
    } else if (
      type == "pledge" &&
      (!this.isPledgeDisabled || this.isDonorBulkSelected)
    ) {
      $("#pledgetab").addClass("active");
      this.paymentModeDetail = "Pledge";
      this.paymentType = "Pledge";
      if (!this.commonMethodService.isDisableAutomaticPledge) {
        this.checkboxemail = this.EmailCheckbox;
        this.EmailCheckbox = false;
        this.isVisited = true;
      } else {
        this.EmailCheckbox = this.tempemailCheckbox;
        this.notifyDonarEmail = this.tempnotifyDonarEmail;
      }
      if (
        this.commonMethodService.isDisableAutomaticPayment &&
        !this.commonMethodService.isDisableAutomaticPledge
      ) {
        this.EmailCheckbox = false;
        this.notifyDonarEmail = {
          email: "Select Email",
          label: "",
        };
      }
      this.paymentMethodId = -1;
      this.isCharity = false;
      this.isPledgePayment = true;
      this.isCheckNumber = false;
      this.isCash = false;
      this.isCreditCard = false;
      this.isPaymentModeList = false;
      this.isWallet = false;
      this.isOJC = false;
      this.isDonorFund = false;
      this.isOther = false;
      this.isPayoffPledgeDisable = true;
      this.isAch = false;
      this.isNoAch = false;
      $("#notepanel").hide();
      if (this.selectedCampaign == null || this.selectedCampaign == "") {
        this.disablePledgeProcess = true;
        this.isCampaignSelect = true;
      } else {
        this.disablePledgeProcess = false;
        this.isCampaignSelect = false;
      }
      if (
        !this.disableValue &&
        this.selectedAmount != 0 &&
        this.selectedAmount != undefined &&
        (this.isDonorSkipped || this.isDonorSelected)
      ) {
        setTimeout(() => {
          //this.pledgeProcess.nativeElement.focus(), 10
        });
      }
      if (
        this.disableValue ||
        this.selectedAmount == undefined ||
        (!this.isDonorSkipped && !this.isDonorSelected)
      ) {
        setTimeout(() => {
          //this.pledgeNext.nativeElement.focus(), 10
        });
      }
      this.closePledgeTooltip();
    } else if (type == "ojc") {
      if (!this.commonMethodService.isDisableAutomaticPayment) {
        this.EmailCheckbox = false;
        this.notifyDonarEmail = {
          email: "Select Email",
          label: "",
        };
      }
      $("#ojctab").addClass("active");
      this.paymentModeDetail = "Ojc";
      this.paymentType = "Ojc";
      this.paymentMethodId = 3;
      this.isCharity = false;
      this.isOJC = true;
      this.isPledgePayment = false;
      this.isCheckNumber = false;
      this.isCash = false;
      this.isCreditCard = false;
      this.isWallet = false;
      this.isDonorFund = false;
      this.isPaymentModeList = false;
      this.isPayoffPledgeDisable = false;
      this.isAch = false;
      this.isNoAch = false;
      setTimeout(() => {
        //$("#input-creditCardOJCNumber").focus();
      }, 1000);
      this.payPledgeMessagePopup();
      if (this.checkboxemail != "" && this.isVisited == true) {
        this.EmailCheckbox = this.checkboxemail;
        this.notifyDonarEmail = this.tempnotifyDonarEmail;
        this.isVisited = false;
      }
    } else if (type == "wallet") {
      if (!this.commonMethodService.isDisableAutomaticPayment) {
        this.EmailCheckbox = false;
        this.notifyDonarEmail = {
          email: "Select Email",
          label: "",
        };
      }
      $("#wallettab").addClass("active");
      this.paymentModeDetail = "Wallet";
      this.paymentType = "Wallet";
      this.paymentMethodId = null;
      this.isCharity = false;
      this.isWallet = true;
      this.isPledgePayment = false;
      this.isCheckNumber = false;
      this.isCash = false;
      this.isCreditCard = false;
      this.isPaymentModeList = false;
      this.isOJC = false;
      this.isDonorFund = false;
      this.isPayoffPledgeDisable = false;
      this.isAch = false;
      this.isNoAch = false;
      this.payPledgeMessagePopup();
      if (this.checkboxemail != "" && this.isVisited == true) {
        this.EmailCheckbox = this.checkboxemail;
        this.notifyDonarEmail = this.tempnotifyDonarEmail;
        this.isVisited = false;
      }
    } else if (type == "other") {
      if (!this.commonMethodService.isDisableAutomaticPayment) {
        this.EmailCheckbox = false;
        this.notifyDonarEmail = {
          email: "Select Email",
          label: "",
        };
      }
      $("#othertab").addClass("active");
      this.paymentModeDetail = "Other";
      this.paymentType = "Other";
      this.paymentMethodId = 5;
      this.isCharity = false;
      this.isOther = true;
      this.isWallet = false;
      this.isPledgePayment = false;
      this.isCheckNumber = false;
      this.isCash = false;
      this.isCreditCard = false;
      this.isPaymentModeList = false;
      this.isOJC = false;
      this.isDonorFund = false;
      this.isPayoffPledgeDisable = false;
      this.isAch = false;
      this.isNoAch = false;
      this.payPledgeMessagePopup();
      if (this.checkboxemail != "" && this.isVisited == true) {
        this.EmailCheckbox = this.checkboxemail;
        this.notifyDonarEmail = this.tempnotifyDonarEmail;
        this.isVisited = false;
      }
    } else if (type == "donorfund") {
      $("#donorfundtab").addClass("active");
      this.paymentModeDetail = "Donor Fund";
      this.paymentMethodId = 6;
      this.isCharity = false;
      this.isDonorFund = true;
      this.isCreditCard = false;
      this.isPaymentModeList = false;
      this.isCash = false;
      this.isCheckNumber = false;
      this.isPledgePayment = false;
      this.isOJC = false;
      this.isWallet = false;
      this.isOther = false;
      this.isPayoffPledgeDisable = false;
      this.isAch = false;
      this.isNoAch = false;
      setTimeout(() => {
        //$("#input-donorFundCCNumber").focus();
      }, 1000);
      this.payPledgeMessagePopup();
      if (this.checkboxemail != "" && this.isVisited == true) {
        this.EmailCheckbox = this.checkboxemail;
        this.notifyDonarEmail = this.tempnotifyDonarEmail;
        this.isVisited = false;
      }
    } else if (type == "moreOption") {
      this.isPaymentModeList = true;
      this.isCreditCard = false;
      this.isCharity = false;
      this.isCash = false;
      this.isCheckNumber = false;
      this.isPledgePayment = false;
      this.isOJC = false;
      this.isDonorFund = false;
      this.isWallet = false;
      this.isOther = false;
      this.paymentModeDetail = "";
      this.creditCardNumber = "";
      this.donorFundCCNumber = "";
      this.creditCardCVV = "";
      this.creditCardZip = "";
      this.expDate = "";
      this.checkNumber = "";
      this.expOJCDate = "";
      this.creditCardOJCNumber = "";
      this.isInValid = false;
      this.isPayoffPledgeDisable = false;
      this.isAch = false;
      this.isNoAch = false;
      this.payPledgeMessagePopup();
      if (this.checkboxemail != "" && this.isVisited == true) {
        this.EmailCheckbox = this.checkboxemail;
        this.notifyDonarEmail = this.tempnotifyDonarEmail;
        this.isVisited = false;
      }
    }
  }
  isAmtBtnEnterKye = false;
  amtButtonEnterPress(event) {
    if (event.keyCode == 13 && !this.isPayPledgeError) {
      this.isAmtBtnEnterKye = true;
      this.SwitchTab();
    }
  }
  paymentButtonEnterPress(event) {
    if (event.keyCode == 13) {
      this.ProcessTransaction();
    }
  }
  donarInfoTabReturn(id) {
    var chek = $("#btn_chooseProcesstypeProcess").is(":disabled");
    if (id == "txtareanote") {
      if (chek == true && id == "txtareanote") {
        $("#input-txtrefNumber").focus();
      } else {
        $("#btn_chooseProcesstypeProcess").focus();
      }
    } else if (id == "donorText" && this.isCreateDonorPopup) {
      this.isCreateDonorPopup = false;
      $("#globalDonorText").focus();
    } else {
      //$("#"+id).focus();//for issue
    }
  }

  onDown(event) {
    $(".tab-focus-0").focus();
  }
  onUp(event) {}
  onDownTabFocus(i) {
    i += 1;
    $(".tab-focus-" + i).focus();
    $(".selected_record").removeClass("selected_record");
    $(".tab-focus-" + i).addClass("selected_record");
  }
  onUpTabFocus(i) {
    i > 0 ? (i -= 1) : i;
    $(".tab-focus-" + i).focus();
    $(".selected_record").removeClass("selected_record");
    $(".tab-focus-" + i).addClass("selected_record");
  }

  isPresetAmountList() {
    if (this.presetAmountList && this.presetAmountList.length == 0) {
      return false;
    }
    if (this.presetAmountList == undefined) {
      return false;
    }
    return true;
  }
  isCvvHideShow() {
    let creditCardNumber = this.creditCardNumber.substring(0, 3);
    if (creditCardNumber == "659") {
      this.isCvvVisible = false;
      return;
    }
  }
  isCharityShowHideIcon() {
    if (this.isCharity || this.isCreditCard) {
      this.isDonorFundCard = false;
      this.isPledgerCard = false;
      let threeDigit = this.creditCardNumber.substring(0, 3);
      let sixDigit = this.creditCardNumber.substring(0, 6);
      if (threeDigit == "659" && sixDigit != "659999") {
        this.isPledgerCard = true;
        this.isDonorFundCard = true;
      }
      if (sixDigit == "659999") {
        this.isDonorFundCard = true;
        this.isPledgerCard = false;
      }
      if (sixDigit != "659999" && sixDigit.length > 5) {
        this.isDonorFundCard = false;
      }
    }
    if (this.isCharity && !this.creditCardNumber) {
      this.isDonorFundCard = true;
      this.isPledgerCard = true;
      this.isAmericanExpress = false;
    }
  }
  saveOptionsLayout() {
    let setting = {
      campaignId: this.selectedCampaignId,
      paymentReasonId: this.selectedReasonId,
      locationId: this.selectedLocationId,
      collectorId: this.selectedCollectorId,
    };
    let objLayout = {
      uiPageSettingId: this.uiPageSettingId,
      userId: this.localstoragedataService.getLoginUserId(),
      moduleName: "new transactions",
      screenName: "options",
      setting: JSON.stringify(setting),
    };
    this.uiPageSettingService.Save(objLayout).subscribe((res: any) => {
      if (res) {
        this.savedDefault = true;
        this.uiPageSetting = res.uiPageSetting;
        Swal.fire({
          title: "Layout Saved Successfully",
          icon: "success",
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

  setToggle(event) {
    this.scheduleToggle = event;
  }

  dismissPop() {
    this.activeModal.dismiss();
  }

  achFormInit() {
    this.achForm = this.fb.group({
      bankType: ["", Validators.required],
      accountType: ["", Validators.required],
      nameOnAccount: ["", Validators.required],
      routingNumber: ["", Validators.required],
      accountNumber: ["", Validators.required],
      note: [""],
    });
  }
  private callPayApi() {
    let tmpRef = this.checkNumber || "";
    let ref = this.refNumber || "";
    let objPayTransaction: any = {
      accountId: this.selectedDonorId,
      amount: this.selectedAmount,
      loginUserGuId: this.localstoragedataService.getLoginUserGuid(),
      paymentReasonId: this.selectedReasonId,
      paymentMethodId: this.paymentMethodId,
      cCNum: this.creditCardNumber,
      expiry: this.expDate,
      cVV: this.creditCardCVV,
      refNum: ref || tmpRef,
      // refNum: this.checkNumber,
      zip: this.creditCardZip,
      isSaveToWallet: this.isSaveCard,
      createdBy: this.localstoragedataService.getLoginUserId(),
      uniqueTransactionId: this.uniqueTransactionId.toString(),
      paymentRecurringModel: {
        recurrenceAmount: parseFloat(this.scheduleDonationAmount),
        recurrenceCount: parseInt(this.scheduleCount),
        scheduleDateTime:
          this.selectedScheduleStartDate != undefined
            ? moment(this.selectedScheduleStartDate).format("YYYY-MM-DD")
            : null,
        recurrenceFrequency:
          this.scheduleFrequency != undefined
            ? this.scheduleFrequency.length > 0
              ? parseInt(this.scheduleFrequency.map((s) => s.id))
              : this.scheduleFrequency
            : null,
      },
      walletId: this.selectedWalletId,
      Pledges: this.payOffPledges,
      note: this.note,
      cardHolderName: this.cardHolderName,
      campaignId: this.campaignIDFromSeat
        ? this.campaignIDFromSeat
        : this.selectedCampaignId,
      locationId: this.selectedLocationId,
      paymentDate: moment(this.selectedDate.startDate).format("YYYY-MM-DD"),
      // "Note": "string",
      collectorId: this.selectedCollectorId,
      SeatId: this.seatId,
      Label: this.label,
      SeatReservedType: this.seatReservedType,
      seatPrice: this.seatPrice,
      currency: this.currency,
      stopAutoReciept: true,
    };
    if (this.isWithoutAuth) {
      objPayTransaction.isWithoutAuth = true;
      this.isWithoutAuth = false;
      const uId: any = Guid.create();
      objPayTransaction.uniqueTransactionId = uId.value;
    }
    this.paymentService
      .PayTransaction(objPayTransaction)
      .pipe(
        takeUntil(this.ngUnsubscribe),
        catchError((error: HttpErrorResponse) => {
          // Error... // Handle 'timeout over' error
          if (error instanceof TimeoutError) {
          } else {
            this.uniqueTransactionId = Guid.create();
          }
          return throwError(error);
        })
      )
      .subscribe(
        (res: any) => {
          this.isloading = false;
          if (res) {
            this.scheduleToggle
              ? this.analytics.createdSchedulePayment()
              : this.analytics.createdPayment();

            if (
              (res.paymentStatus == "Declined" ||
                res.paymentStatus == "Pending") &&
              this.isCheckNumber &&
              this.isDevEnv &&
              !this.showNotifySection
            ) {
              this.isGenerateReceiptDisable = true;
            }
            if (this.isCalldonorApi) {
              this.commonMethodService.getDonorList();
            }
            this.emtPaymentTransSeatList.emit(true);
            if (res.isDBTransSucceed || res.paymentStatus == "Success") {
              this.isPaymentDone = true;
              this.isSuccess = true;
              this.isError = false;
              this.showTransaction = false;
              this.isPaymentExist = res.isPaymentExist;
              this.donorJewishname = res.responseMessage[0].donorJewishName;
              this.donorname = res.responseMessage[0].donorFullName;
              this.paymentStatus = res.paymentStatus;
              this.receiptNum = res.responseMessage[0].receiptNum;
              this.paymentId = res.responseMessage[0].paymentId;
              this.accountNum = res.responseMessage[0].accountNum;
              this.email = res.responseMessage[0].email;
              this.emailLabel = res.responseMessage[0].emailLabel;
              this.phoneLabel = res.responseMessage[0].phoneLabel;
              this.phone = res.responseMessage[0].phone;
              this.paymentAccountId = res.responseMessage[0].accountId;
              this.printActionBtn = "Print Receipt";
              this.emailActionBtn = "Email Receipt";
              this.textActionBtn = "Text Receipt";
              this.mailActionBtn = "Mail Receipt";
              this.successMessage = res.responseTitle;
              this.type = "Payment";
              this.commonMethodService.notshowPaymentLoader = true;
              this.commonMethodService.sendPaymentTrans(true);
              this.commonMethodService.sendPledgeTrans(true);
              this.commonMethodService.sendPaymentSchdleTrans(true);
              this.commonMethodService.sendPledgeSchdleTrans(true);
              this.note = "";
              this.pledgeId = undefined;
              this.isPledgeDisabled = false;
              this.payOffPledges = [];
              this.refNum = res.responseMessage[0].refNum;
              this.emtPaymentTrans.emit(true);
              this.errorMessage = "<h4>" + res.errorResponse + "</h4>";
              if (this.EmailCheckbox) {
                this.sendEmailRecieptApi(this.type, this.paymentId);
              }
              if (this.PhoneCheckbox) {
                this.sendPhoneRecieptApi(this.type, this.paymentId);
              }
            } else {
              this.isPaymentFailed = true;
              this.donorJewishname =
                res &&
                res.responseMessage != null &&
                res.responseMessage.length > 0
                  ? res.responseMessage[0].donorJewishName
                  : null;
              this.donorname =
                res &&
                res.responseMessage != null &&
                res.responseMessage.length > 0
                  ? res.responseMessage[0].donorFullName
                  : null;
              this.receiptNum =
                res &&
                res.responseMessage != null &&
                res.responseMessage.length > 0
                  ? res.responseMessage[0].receiptNum
                  : null;
              this.paymentId =
                res &&
                res.responseMessage != null &&
                res.responseMessage.length > 0
                  ? res.responseMessage[0].paymentId
                  : null;
              this.isError = true;
              this.isSuccess = false;
              this.isPaymentDone = true;
              this.showTransaction = false;
              this.errorMessage = res.errorResponse;
              this.printActionBtn = "Print Receipt";
              this.emailActionBtn = "Email Receipt";
              this.textActionBtn = "Text Receipt";
              this.mailActionBtn = "Mail Receipt";
              this.paymentStatus = res.paymentStatus;
              if (res.responseMessage > 0)
              {
                this.refNum = res.responseMessage[0].refNum;
              }
            }
            if (
              res &&
              res.responseMessage != null &&
              res.responseMessage.length > 0 &&
              res.responseMessage[0].accountNum == "DEFAULT"
            ) {
              this.isDefaultCls = "default-donor";
            }
            this.changeDetectorRef.detectChanges();
          }
        },
        (error) => {
          this.isloading = false;
          console.log(error);
          this.activeModal.dismiss();
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

  get isPartiallyPaid() {
    return this.paidStatus === "Partially Paid";
  }

  getPartiallyPaidBalance() {
    if (this.isPartiallyPaid && this.pledgePaid.length > 1) {
      const pledge = this.pledgePaid.find((el) => {
        return el.type === "Pledge";
      });
      this.pledgePaid.find((el) => {
        if (el.type === "Payment") {
          this.selectedAmount = this.selectedAmount - el.amount;
        }
        if (el.type === "Schedule") {
          this.selectedAmount = this.selectedAmount - el.amount;
        }
      });
    }
  }

  openHebrewCalendarPopup() {
    if (!this.isBulkDonorList) {
      this.commonMethodService.featureName = null;
    }

    this.commonMethodService.openCalendarPopup(
      this.class_id,
      this.class_hid,
      this.selectedDate,
      true,
      "recordDateDynamicsCalender"
    );
    this.calendarSubscription = this.commonMethodService
      .getCalendarArray()
      .pipe(shareReplay(1))
      .subscribe((items) => {
        if (items && items.pageName == "AddTransaction") {
          this.commonMethodService.isCalendarClicked = false;
          this.calendarSubscription.unsubscribe();
          if (this.popContent) {
            this.popContent.close();
            $("#calendar_input_add_transaction").click();
          }
          if (items.obj) {
            this.selectedDate.startDate = items.obj.startDate;
            this.EngHebCalPlaceholder =
              this.hebrewEngishCalendarService.EngHebCalPlaceholder;
          }
        }
      });
  }

  onClickedOutsidePopover(p1: any) {
    if (!(event.target as HTMLElement).closest(".popover")) {
      p1.close();
    } else {
    }
  }
  getPaymentModeDetail(cardName = "", lastDigit = "") {
    return `${cardName} ${lastDigit}`;
  }
  donarNotifyDwnHideShow(cls) {
    if (!this.isDonorSelected) {
      return false;
    }
    this.isDropDownOpen = true;
    let clsSelected = `.${cls}`;
    $(clsSelected).toggleClass("show");
  }
  donarSmsNotifyDwnHideShow(cls) {
    if (!this.isDonorSelected) {
      return false;
    }
    this.isSmsDropDownOpen = true;
    let clsSelected = `.${cls}`;
    $(clsSelected).toggleClass("show");
  }
  GetSetting() {
    const eventGuid = this.localstoragedataService.getLoginUserEventGuId();
    this.eventService.GetSetting(eventGuid, true).subscribe((res) => {
      this.isNotifyDonarEmailShow = res.some(
        (item) =>
          (item.settingName == "DisableAutomaticPledgeReceiptEmail" &&
            item.text.toLowerCase() == "false") ||
          (item.settingName == "DisableAutomaticPaymentReceiptEmail" &&
            item.text.toLowerCase() == "false")
      );
      if (this.isOpenFromCard == true) {
        this.isOpenFromCard = false;
        this.paymentDetailsValue();
      }
    });
  }

  paymentDetailsValue() {
    if (this.paymentDetails) {
      if (this.cardtype == "DonorCard") {
        this.emailResult = this.paymentDetails.lstEmail.map((item) => {
          const [label, email] = item.split(":");
          return {
            email: email.trim(),
            label: label.trim(),
          };
        });

        this.phoneResult = this.paymentDetails.lstPhoneNumber.map((item) => {
          const [label, phone] = item.split(":");
          return {
            phone: phone.trim(),
            label: label.trim(),
          };
        });
        //  var donarDetails = [{ "email": emailArray, "phone": phoneResult }];
      } else {
        const emails = this.paymentDetails.emails
          ? this.paymentDetails.emails.split(",")
          : [];
        const emailLabels = this.paymentDetails.emailLabels
          ? this.paymentDetails.emailLabels.split(",")
          : [];
        this.emailResult = this.margeKeyValue(emails, emailLabels, "email");

        const phoneNumber = this.paymentDetails.additionalPhoneNumbers
          ? this.paymentDetails.additionalPhoneNumbers.split(",")
          : [];
        const phoneLabels = this.paymentDetails.additionalPhoneLabels
          ? this.paymentDetails.additionalPhoneLabels.split(",")
          : [];
        this.phoneResult = this.margeKeyValue(
          phoneNumber,
          phoneLabels,
          "phone"
        );
      }
      var donarDetails = [{ email: this.emailResult, phone: this.phoneResult }];
      this.notifyDonarEmailArray =
        donarDetails && donarDetails.length > 0 ? donarDetails[0].email : [];
      this.notifyDonarEmail =
        this.notifyDonarEmailArray && this.notifyDonarEmailArray.length > 0
          ? this.notifyDonarEmailArray[0]
          : "";

      if (!this.isNotifyDonarEmailShow) {
        this.notifyDonarEmail = {
          email: "Select Email",
          label: "",
        };
      }
      this.notifyDonarPhoneArray =
        donarDetails && donarDetails.length > 0 ? donarDetails[0].phone : [];
      this.EmailCheckbox =
        this.notifyDonarEmail && this.notifyDonarEmail.email != "Select Email";
      this.tempemailCheckbox = this.EmailCheckbox;
      this.tempnotifyDonarEmail = this.notifyDonarEmail;
    }
  }
  selectNotifyDonarEmail(item) {
    if (!!item && item.email != "Select Email") {
      this.EmailCheckbox = true;
      this.notifyDonarEmail = item;
    }
  }
  get getEmailSelected() {
    if (this.notifyDonarEmail) {
      return this.notifyDonarEmail.email != "Select Email"
        ? `${this.notifyDonarEmail.email} (${this.notifyDonarEmail.label})`
        : this.notifyDonarEmail.email;
    }
    return "Select Email";
  }
  openEmailAddressPopup() {
    this.modalOptions = {
      centered: true,
      size: "md",
      backdrop: "static",
      keyboard: true,
      windowClass: " send_emailreceipt",
    };
    const modalRef = this.commonMethodService.openPopup(
      EmailAddressPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.DonorDetails = {
      accountId: this.accountId,
    };
    modalRef.componentInstance.emtOutput.subscribe((res) => {
      if (res) {
        let result = res;
        let obj = {
          email: result.emailAddress,
          label: result.emailLabel,
        };
        this.notifyDonarEmail = obj;
        this.notifyDonarEmailArray.push(obj);
      }
    });
  }
  get isChekedNotifyDonarEmail() {
    return (
      this.notifyDonarEmail && this.notifyDonarEmail.email != "Select Email"
    );
  }
  margeKeyValue(keys = [], values = [], item = "") {
    const resultArray = [];
    for (let index = 0; index < keys.length; index++) {
      let obj =
        item == "email"
          ? { email: keys[index], label: values[index] }
          : { phone: keys[index], label: values[index] };
      resultArray.push(obj);
    }
    return resultArray;
  }

  getFeatureSettingValues() {
    if (this.isBulkDonorList) {
      this.commonMethodService.featureName = "Save_bulk_charge_payments";
    } else {
      this.commonMethodService.featureName = "Save_new_Transaction";
    }
    this.commonMethodService.getFeatureSettingValues();
  }

  onUpgrade() {
    // this.activeModal.dismiss();
    this.commonMethodService.commenSendUpgradeEmail(
      this.commonMethodService.featureDisplayName
    );
  }
  get isOtherActionShow() {
    if (this.isError && this.checkSchedule) {
      return false;
    }
    if (this.paymentId != null) {
      return true;
    }
  }
  isWithoutAuth = false;
  scheduleWithoutAuthorization() {
    this.isloading = true;
    this.isPaymentDone = false;
    this.isWithoutAuth = true;
    setTimeout(() => {
      this.callPayApi(), 3000;
    });
  }
  get isScheduleWithoutAuthorization() {
    let selectedScheduleStartDate =
      this.selectedScheduleStartDate != undefined
        ? moment(this.selectedScheduleStartDate).format("YYYY-MM-DD")
        : null;
    this.selectedDate = moment(this.selectedDate.startDate).format(
      "YYYY-MM-DD"
    );
    let isDate = false;
    if (selectedScheduleStartDate > this.selectedDate) {
      isDate = true;
    }
    return this.paymentStatus == "Declined" &&
      this.checkSchedule &&
      this.isError &&
      isDate
      ? true
      : false;
  }

  selectNotifyDonarPhone(item) {
    if (!!item && item.phone != "Select Phone") {
      this.PhoneCheckbox = true;
      this.notifyDonarPhoneNumber = item;
    }
  }
  get getPhoneSelected() {
    if (this.notifyDonarPhoneNumber) {
      return this.notifyDonarPhoneNumber.phone != "Select Phone"
        ? `${this.notifyDonarPhoneNumber.phone} (${this.notifyDonarPhoneNumber.label})`
        : this.notifyDonarPhoneNumber.phone;
    }
    return "";
  }
  get isChekedNotifyDonarPhone() {
    return (
      this.notifyDonarPhoneNumber &&
      this.notifyDonarPhoneNumber.phone != "Select Phone"
    );
  }
  openPhoneNumberPopup() {
    this.modalOptions = {
      centered: true,
      size: "md",
      backdrop: "static",
      keyboard: true,
      windowClass: "send_emailreceipt",
    };
    const modalRef = this.commonMethodService.openPopup(
      PhoneNumberPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.DonorDetails = {
      accountId: this.accountId,
    };
    modalRef.componentInstance.emtOutput.subscribe((res) => {
      if (res) {
        const result = res;
        const obj = {
          phone: result.phoneNumber,
          label: result.phoneLabel,
        };
        this.notifyDonarPhoneNumber = obj;
        this.notifyDonarPhoneArray.push(obj);
      }
    });
  }

  sendEmailRecieptApi(type, id) {
    this.isEmailLoading = true;
    this.isEmailSuccess = false;
    this.isEmailError = false;
    if (!this.notifyDonarEmail) {
      return false;
    }
    if (this.notifyDonarEmail.email == "Select Email") {
      return false;
    }
    const objEmailReceipt = {
      type: type,
      id: id,
      emailAddress: this.notifyDonarEmail.email,
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
    };
    this.messengerService.SendEmailReceipt(objEmailReceipt).subscribe(
      (res) => {
        if (res) {
          this.isEmailLoading = false;
          this.isEmailSuccess = true;
          this.isEmailError = false;
          this.changeDetectorRef.detectChanges();
        }
      },
      (error) => {
        this.isloading = false;
        this.isEmailLoading = false;
        this.isEmailSuccess = false;
        this.isEmailError = true;
        this.changeDetectorRef.detectChanges();
      }
    );
  }

  sendPhoneRecieptApi(type, id) {
    this.isPhoneLoading = true;
    this.isPhoneSuccess = false;
    this.isPhoneError = false;
    if (this.notifyDonarPhoneNumber.phone == "Select Phone") {
      return false;
    }
    const objTextReceipt = {
      type: type,
      id: id,
      phoneNumber: this.notifyDonarPhoneNumber.phone.replace(/\s/g, ""),
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      isOnlyPledgePayment: this.isOnlyPledgePayment,
    };
    this.messengerService.SendSMSReceipt(objTextReceipt).subscribe(
      (res) => {
        if (res) {
          this.isPhoneLoading = false;
          this.isPhoneSuccess = true;
          this.isPhoneError = false;
          this.changeDetectorRef.detectChanges();
        }
      },
      (error) => {
        this.isloading = false;
        this.isPhoneLoading = false;
        this.isPhoneSuccess = false;
        this.isPhoneError = true;
        this.changeDetectorRef.detectChanges();
      }
    );
  }

  getSelectedPhoneIconClass() {
    if (this.isPhoneLoading) return this.iconClasses[0];
    if (this.isPhoneSuccess) return this.iconClasses[1];
    if (this.isPhoneError) return this.iconClasses[2];
    return "";
  }

  getSelectedEmailIconClass() {
    if (this.isEmailLoading) return this.iconClasses[0];
    if (this.isEmailSuccess) return this.iconClasses[1];
    if (this.isEmailError) return this.iconClasses[2];
    return "";
  }

  //if clicked outside close dropdown for email and sms code started
  closeTransactionEmailDropdown(event: any) {
    if (this.isDropDownOpen) {
      this.isDropDownOpen = false;
      let cls = "notify-credit-card";
      let clsSelected = `.${cls}`;
      $(clsSelected).removeClass("show");
    }
  }

  closeTransactionSmsDropdown(event: any) {
    if (this.isSmsDropDownOpen) {
      this.isSmsDropDownOpen = false;
      let cls = "notify-sms-credit-card";
      let clsSelected = `.${cls}`;
      $(clsSelected).removeClass("show");
    }
  }
  //if clicked outside close dropdown for email and sms code ended
}
