import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ElementRef,
  HostListener,
  ViewChild,
  ViewChildren,
  QueryList,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  inject,
} from "@angular/core";
import { NgbActiveModal, NgbModalOptions } from "@ng-bootstrap/ng-bootstrap";
import { Subject, forkJoin, of } from "rxjs";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { AdvancedFieldService } from "src/app/services/advancedfield.service";
import { CommonAPIMethodService } from "src/app/services/common-api-method.service";
import { DonorService } from "src/app/services/donor.service";
import { LocationService } from "src/app/services/location.sevice";
import { TagService, TagObj } from "src/app/services/tag.service";
import Swal from "sweetalert2";
import { LocationCardPopupComponent } from "../../cards/location-card-popup/location-card-popup.component";
import { AdvanceDropdownPopupComponent } from "../advance-dropdown-popup/advance-dropdown-popup.component";

import { DonorAddtagPopupComponent } from "../donor-addtag-popup/donor-addtag-popup.component";
import { DonorEmailComponent } from "../donor-email/donor-email.component";
import { DonorPhoneComponent } from "../donor-phone/donor-phone.component";
import { DonorAddfamilyPopupComponent } from "../donor-addfamily-popup/donor-addfamily-popup.component";
import { map, switchMap } from "rxjs/operators";
import { FamilyService } from "src/app/services/family.service";

import { FormControl, UntypedFormGroup } from "@angular/forms";
import { AnalyticsService } from "src/app/services/analytics.service";
export enum Relationship {
  Father = "אב",
  FatherInLaw = "חמיו",
  Son = "בנו",
  SonInLaw = "חתנו",
}

declare var $: any;

@Component({
  selector: "app-donor-save",
  templateUrl: "./donor-save.component.html",
  standalone: false,
  styleUrls: ["./donor-save.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DonorSaveComponent implements OnInit {
  @Output() emtOutputEditDonor: EventEmitter<any> = new EventEmitter();
  @Output() emtOutputEditDonorUpdatedValue: EventEmitter<any> =
    new EventEmitter();
  @Output() emtOutputDismissCard: EventEmitter<any> = new EventEmitter();
  @Output() emtOutputDonorTransaction: EventEmitter<any> = new EventEmitter();
  @ViewChildren("checkboxes") checkboxes: QueryList<ElementRef>;
  isloading: boolean = true;
  memberArr: Array<any> = [];
  familyArr: Array<any> = [];
  isEditMode = false;
  accountNum: string;
  accountId: any = null;
  isHomeAddressOpen = false;
  isHomePhoneOpen = false;
  isCellPhoneOpen = false;
  isEmailOpen = false;
  fullNameJewish: string = null;
  fullNameJewish2: string = null;
  fullName: string = null;
  selectedCountry: any =
    this.commonMethodService.getDefaultSelectedCountryCode();
  addressLine1: string;
  addressLine2: string;
  addressLine3: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  cityStateZip: string;
  lstLocation: any = [];
  donorLocation: any = [];
  locationIDS: any = [];
  donorSaveResponse: any;
  advancedDropdownMenu = false;
  tagsDropdownMenu = false;
  accountLocationId: number = -1;
  skeletonLoader: [{}, {}, {}, {}];
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
  cellphone: any[] = [];
  email: any[] = [
    {
      emailID: null,
      emailLabel: "Home",
      emailAddress: "",
      textEmailAddress: null,
      invalid: false.valueOf,
      isDefault: true,
      isLabelErrorMessage: false,
    },
  ];
  //code for add new member started
  familiesInput: any[] = [];
  selectedValue: string;
  options: string[] = ["בנו", "חתנו"];
  sonInLawId: number[] = [];
  sonId: number[] = [];
  newcountryCodeID: any = "+1";
  newselectedFlag: any = "flag flag-usa";
  englishToHebrewMap: Record<string, Relationship> = {
    Father: Relationship.Father,
    FatherInLaw: Relationship.FatherInLaw,
    Son: Relationship.Son,
    SonInLaw: Relationship.SonInLaw,
  };
  activeTab = "donorinfo";
  //code for add new member ended
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
      isDefault: false,
      neighborhood: null,
      note: null,
      latitude: 0,
      longitude: 0,
      addressLabel: "Home", ///added new
      textAddressLabel: null,
      streetAddress: null,
      isLabelErrorMessage: false,
    },
  ];
  advancedFieldValues: any[] = [];
  advancedStrFieldValues: any[] = [];
  addressIndex = 0;
  phoneLabel: string;
  phoneNumber: string;
  emailLabel: string;
  donorClass: string;
  group: string;
  longitude: string;
  latitude: string;
  isDisabled: boolean = true;
  isEdit: boolean = false;
  fatherId: string;
  globalDonor: string;
  fatherInLawId: string;
  selectedFatherId: number;
  selectedFatherinLaw: number;
  selectedGlobalDonor: number;
  title: string;
  showFatherBox: boolean = false;
  noResult: boolean = false;
  showFatherInLawBox: boolean = false;
  isGlobalFatherList: boolean = true;
  isGlobalFatherInLawList: boolean = true;
  displayFatherSearchIcon = false;
  displayFatherinLawSearchIcon = false;
  nonFatherEditable = false;
  nonGlobalDonorEditable = false;
  nonFatherInLawEditable = false;
  //isGlobalDonor=false;
  isGlobalEditIcon = false;
  showGlobalDonor: boolean = true;
  formValid: boolean = false;
  nameJewishReq: boolean = false;
  nameReq: boolean = false;
  isSearchDisable: boolean = true;
  disableTitle = "Need to be more then 3 characters";

  paymenLocationData: any;
  searchText: string;
  isGlobal: boolean = false;

  displaySearchIcon = false;
  isGlobalList: boolean = true;
  keyword: string;
  showBox: boolean = true;
  filteredLocations: any[] = [];
  locationSearchText: string;
  isLocationSearchDisable: boolean = false;
  showDropdown: boolean = true;
  isLocationClicked: boolean = true;
  skeletonitems: any = [{}, {}, {}, {}, {}, {}, {}, {}];
  skeletonitems2: any = [{}, {}, {}, {}];
  maskSetVal: string = "";
  maskSetVal2: string = "";
  donarListLocal = [];
  firstNameJewish: string = "";
  lastNameJewish: string = "";
  titleJewish: string = "";
  suffixJewish: string = "";
  titleEnglish: string = "";
  firstNameEnglish: string = "";
  lastNameEnglish: string = "";
  rtl = "RTL";
  deletedAccountEmailIDs: string = "";
  deletedAccountAddressIds: string = "";
  deletedAccountPhoneIds: string = "";
  // Donor Tags
  donorTagList: Array<TagObj> = [];
  newDonorTagList: Array<TagObj> = [];
  modalOptions: NgbModalOptions;
  protected ngUnsubscribe: Subject<void> = new Subject<void>();
  isRemoveAccountNumber: boolean = false;
  lastNameReq: boolean = false;
  lastNameJewishReq: boolean = false;
  isPhoneError: boolean = false;
  isErrorLable: string;
  isErrorPhoneID: string;
  labelsArray = [];

  selectedLabel: any;
  selectedAddressLabel: any;
  selectedEmailLabel: any;
  isListLabelExist: boolean = false;
  isEmailListLabelExist: boolean = false;
  isAddressListLabelExist: boolean = false;
  father: string;
  fatherInLaw: string;
  familiesData: any[] = [];
  countries: any;
  dialingCode: any;
  flag: any;
  isLabel: boolean = false;
  removedFamilies: Array<any> = [];
  tagSearchQuery: FormControl<string> = new FormControl("");
  tempNewDonorTagList: TagObj[];
  globalCheckbox: boolean;

  @Input() set EditDonorData(donordata: any) {
    this.formValid = true;
    if (donordata) {
      this.fatherId = donordata.fatherId;
      if (donordata.fatherId) {
        let fatherDetail = this.commonMethodService.localDonorList.filter(
          (item) => item.accountId == donordata.fatherId
        );
        if (fatherDetail && fatherDetail.length > 0) {
          this.father = fatherDetail[0].fullNameJewish
            ? fatherDetail[0].fullNameJewish
            : fatherDetail[0].fullName;
        }
      } else {
        this.father = donordata.father;
      }
      this.fatherInLawId = donordata.fatherInLawId;
      if (donordata.fatherInLawId) {
        let fatherInLawDetail = this.commonMethodService.localDonorList.filter(
          (item) => item.accountId == donordata.fatherInLawId
        );
        if (fatherInLawDetail && fatherInLawDetail.length > 0) {
          this.fatherInLaw = fatherInLawDetail[0].fullNameJewish
            ? fatherInLawDetail[0].fullNameJewish
            : fatherInLawDetail[0].fullName;
        }
      } else {
        this.fatherInLaw = donordata.fatherInLaw;
      }
      this.isRemoveFather = this.fatherId ? true : false;
      this.isRemoveFatherInLaw = this.fatherInLawId ? true : false;
      if (donordata.accountPhones && donordata.accountPhones.length > 0) {
        this.cellphone = [];
        donordata.accountPhones.forEach((element) => {
          if (
            element.phoneLabel &&
            element.phoneLabel.toLowerCase().includes("cell")
          ) {
            var lblC = null;
            if (
              element.phoneLabel.toLowerCase() == "cell" ||
              element.phoneLabel == "Home Cell"
            ) {
              lblC = null;
            } else {
              lblC = element.phoneLabel;
            }
            let obj = {
              phoneID: element.phoneID,
              phoneLabel:
                element.phoneLabel != null
                  ? element.phoneLabel.replace(" ", "")
                  : null,
              phoneNumber: element.phoneNumber,
              textPhoneLabel: lblC,
              isDefault: element.isDefault,
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

            if (obj.countryCodeID == null) {
              obj.countryCodeID =
                this.commonMethodService.getDefaultSelectedCountryCode();
              (obj.dailingCode =
                this.commonMethodService.getDefaultDailingCode()),
                (obj.selectedFlag =
                  this.commonMethodService.getDefaultSelectedFlag());
            } else {
              obj.countryCodeID = element.countryCodeID
                ? element.countryCodeID
                : this.commonMethodService.getDefaultSelectedCountryCode();
              obj.selectedFlag = this.getFlagClass(
                element.countryCodeID
                  ? element.countryCodeID
                  : this.commonMethodService.getDefaultSelectedCountryCode()
              );
            }

            if (
              element.phoneLabel.toLowerCase() == "cell" &&
              !this.homephone[1].phoneNumber
            ) {
              this.homephone[1] = obj;
            } else {
              this.cellphone.push(obj);
            }
            this.onSearchChange(obj.phoneNumber, obj.phoneLabel);
          } else {
            var lblC = null;
            if (
              element.phoneLabel == "HOME" ||
              (element.phoneLabel != null &&
                element.phoneLabel.toLowerCase() == "cell")
            ) {
              lblC = null;
            } else {
              lblC = element.phoneLabel;
            }
            let obj = {
              phoneID: element.phoneID,
              phoneLabel:
                element.phoneLabel != null ? element.phoneLabel : null,
              phoneNumber: element.phoneNumber,
              textPhoneLabel: lblC,
              isDefault: element.isDefault,
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
            if (element.phoneLabel == "Home") {
              this.homephone[0] = obj;
            } else {
              this.homephone.push(obj);
            }
            // added new for issue
            if (obj.phoneNumber) {
              this.onSearchChange(obj.phoneNumber, obj.phoneLabel);
            }
            //this.maskSetVal="";
          }
        });
      }
      if (donordata.accountEmails && donordata.accountEmails.length > 0) {
        let emailHomeArray = [];
        let isHomeLabelExist = donordata.accountEmails.filter((x) => {
          if (x.emailLabel) {
            return x.emailLabel.toLowerCase().includes("home");
          }
        });
        if (isHomeLabelExist.length !== 0) {
          this.email = [];
        }
        donordata.accountEmails.forEach((element) => {
          var lblC = null;
          if (
            element.emailLabel &&
            (element.emailLabel == "Home" || element.emailLabel == "Work")
          ) {
            lblC = null;
          } else {
            lblC = element.emailLabel;
          }
          let obj = {
            emailID: element.emailID,
            emailLabel: element.emailLabel != null ? element.emailLabel : null,
            emailAddress: element.emailAddress,
            textEmailAddress: lblC,
            invalid: false,
            isDefault: element.isDefault,
          };
          if (element.emailLabel == "Home" || element.emailLabel == "HOME") {
            this.email[0] = obj;
          } else {
            emailHomeArray.push(obj);
          }
        });
        this.email = this.email.concat(emailHomeArray);
      }

      if (donordata.donorAddresses && donordata.donorAddresses.length > 0) {
        let donorHomeArray = [];
        this.donorAddresses = donordata.donorAddresses.some(
          (e) => e.addressLabel == "Home"
        )
          ? []
          : this.donorAddresses;
        donordata.donorAddresses.forEach((element) => {
          var lblC = null;
          if (
            element.addressLabel == "Home" ||
            element.addressLabel == "Work"
          ) {
            lblC = null;
          } else {
            lblC = element.addressLabel != null ? element.addressLabel : null;
          }
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
            addressLabel:
              element.addressLabel != null ? element.addressLabel : null,
            textAddressLabel: lblC,
            isDisplayed: false,
            streetAddress: element.houseNum + " " + element.street,
          };
          // if(obj.addressLabel=="Home"){
          //   obj.textAddressLabel=null;
          // }
          // else if (obj.addressLabel=="Work"){
          //   obj.textAddressLabel=null;
          // }
          // else{
          //   obj.textAddressLabel=obj.addressLabel;
          // }
          if (
            element.addressLabel == "Home" ||
            element.addressLabel == "HOME"
          ) {
            this.donorAddresses[0] = obj;
          } else {
            donorHomeArray.push(obj);
          }
          // this.donorAddresses.push(obj);
        });
        this.donorAddresses = this.donorAddresses.concat(donorHomeArray);
      }

      this.nonGlobalDonorEditable = true;
      this.accountId = donordata.accountId;
      this.lstLocation =
        donordata.lstLocation == null ? [] : donordata.lstLocation;
      this.titleEnglish = donordata.title;
      this.firstNameEnglish = donordata.firstName;
      this.lastNameEnglish = donordata.lastName;
      this.titleJewish = donordata.titleJewish;
      this.suffixJewish = donordata.suffixJewish;
      this.firstNameJewish = donordata.firstNameJewish;
      this.lastNameJewish = donordata.lastNameJewish;
      // if(donordata.fullName!=null)
      // {
      // this.fullName=donordata.fullName.trim()==""?null:donordata.fullName;
      // }
      // if(donordata.fullNameJewish!=null)
      // {
      // this.fullNameJewish=donordata.fullNameJewish.trim()==""?null:donordata.fullNameJewish;
      // }
      //this.longitude=donordata.longitude;
      //this.latitude=donordata.latitude;
      //this.address=donordata.address;
      this.accountNum = donordata.accountNum;
      // if(donordata.cityStateZip!=null)
      // {
      // this.cityStateZip=donordata.cityStateZip.trim()==""?null:donordata.cityStateZip;
      // }
      this.advancedFieldValues = donordata.advancedFields;
      if (this.advancedFieldValues) {
        this.advancedFieldValues.forEach((element) => {
          element.advancedDropdownMenu = false;
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

      if (donordata.tags) {
        this.donorTagList = donordata.tags;
        this.donorTagList.forEach((element) => {
          element.tagsDropdownMenu = false;
        });
      }

      this.familyService.Get(this.accountId).subscribe((res) => {
        //get family data adding in edit popup add member functionality code started
        this.familiesData = res;
        let familyMembers = [];
        for (const family of this.familiesData) {
          if (family.familyType === "Own") {
            const filteredMembersInFamily = family.familyMembers.filter(
              (member) => member.type === "Son" || member.type === "SonInLaw"
            );
            familyMembers.push(...filteredMembersInFamily);
          }
        }

        for (let i = 0; i < familyMembers.length; i++) {
          this.familyIDCounter++;
          // Create a new family object with its own unique familyID
          const newFamily = {
            familyID: this.familyIDCounter,
            familyName: familyMembers[i].fullName,
            selectedValue: this.getHebrewWord(familyMembers[i].type),
            showCancelIcon: false,
            isShowBox: false,
            accountId: familyMembers[i].accountId,
            isDisplaySearchIcon: false,
            familyNameInputName: `familyName_${this.familyIDCounter}`, // Generate a unique name for input
            familySelectedValue: `selectedValue_${this.familyIDCounter}`, // Generate a unique name for input
            familyGlobalList: `GlobalValue_${this.familyIDCounter}`,
          };

          // Push the newFamily object to the familiesInput array
          this.familiesInput.push(newFamily);
        }
        //get family data adding in edit popup add member functionality code started

        if (res.families && res.families.length > 0) {
          res.families.forEach((element) => {
            element.members.forEach((item) => {
              (item.memberLabel = item.memberLabel),
                (item.memberType = item.memberType),
                (item.accountFamilyId = item.accountFamilyId),
                (item.fullName = item.fullName),
                (item.memberAccountId =
                  item.memberAccountId == null
                    ? item.fullName
                    : item.memberAccountId),
                (item.familyType = element.familyType);
            });
            var familyObj = {
              accountFamilyId: 0,
              familyType: element.familyType,
              familyLabel: null,
              members: element.members,
            };
            element.members.forEach((item) => {
              var memberObj = {
                memberLabel: item.memberLabel,
                memberType: item.memberType,
                accountFamilyId: item.accountFamilyId,
                fullName: item.fullName,
                memberAccountId:
                  item.memberAccountId == null
                    ? item.fullName
                    : item.memberAccountId,
                familyType: element.familyType,
              };
              this.memberArr.push(memberObj);
            });
            this.familyArr.push(familyObj);
          });
        }
      });

      //this.maskSetVal="";
      this.isloading = false;
      this.changeDetectorRef.detectChanges();
    }
  }

  @Input() set Type(data: any) {
    if (data) {
      if (data == "add") {
        this.title = "Create Donor";
        this.isloading = false;
        this.isEditMode = false;
        this.isGlobalEditIcon = true;

        this.getAllAdvancedField();
        this.isRemoveAccountNumber = true;
      } else {
        this.title = "EDITDONOR";
        this.isEditMode = true;
        this.isGlobalEditIcon = false;
        this.isRemoveAccountNumber = false;
      }
    }
  }

  @Input() set DonorName(data: any) {
    if (data) {
      if (Number(data.englishName)) {
        this.homephone = [
          {
            phoneID: null,
            phoneLabel: "Home",
            textPhoneLabel: null,
            phoneNumber: data.englishName,
            isDefault: true,
          },
        ];
      } else {
        this.firstNameJewish = data.jewishName;
        this.firstNameEnglish = data.englishName;
      }
    }
  }
  @Input() set donorNumberVal(data: any) {
    if (data && Number(data)) {
      this.homephone[0].phoneNumber = data;
      this.onSearchChange(
        data,
        this.homephone[0].phoneLabel,
        this.homephone[0].phoneID
      );
      this.changeDetectorRef.detectChanges();
    }
  }
  phoneLabelArray: any[] = [];
  addressLabelArray: any[] = [];
  emailLabelArray: any[] = [];
  selectedLabelData: any;
  editLabel: boolean = false;
  addNewLabel: boolean = false;
  dropDownId: number;
  selectedDynVal: any;
  openPopup: string;
  selectedAddressLabelData: any;
  selectedEmailLabelData: any;
  editEmailLabel: boolean = false;
  isEmailEditLabelBtnDisable = false;
  editAddressLabel: boolean = false;
  isAddressEditLabelBtnDisable = false;

  // Initialize an empty form group
  familyForm: UntypedFormGroup;
  private analytics = inject(AnalyticsService);

  constructor(
    public activeModal: NgbActiveModal,
    private donorService: DonorService,
    private localstoragedataService: LocalstoragedataService,
    private commonAPIMethodService: CommonAPIMethodService,
    private advanceFieldService: AdvancedFieldService,
    public commonMethodService: CommonMethodService,
    private locationService: LocationService,
    private familyService: FamilyService,
    public tagService: TagService,
    private eRef: ElementRef,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.tagSearchQuery.valueChanges.subscribe((query) => {
      this.newDonorTagList = this.tempNewDonorTagList.filter((tag) =>
        tag.tagName.toLowerCase().includes(query.toLowerCase())
      );
    });

    this.getFeatureSettingValues();
    this.getCountryCodes();
    $(document).ready(function () {
      let modalContent: any = $(".modal");
      modalContent.draggable({
        handle: ".modal-header",
      });
    });
    this.commonMethodService.getStatesList();
    //this.bindData();
    this.getPaymentLocation(this.searchText, this.isGlobal);
    this.getTagList();
    //get donar list
    if (this.commonMethodService.localDonorList.length == 0) {
      this.commonMethodService.getDonorList();
      this.donarListLocal = this.commonMethodService.localDonorList;
    } else {
      this.donarListLocal = this.commonMethodService.localDonorList;
    }
    // for issue
    this.email[0].invalid = false;
    $("#globalDonorText").focus();
    this.getAllLabels();

    $(document).on("click", ".custom-radio-btn", function (event) {
      event.stopPropagation();
      event.stopImmediatePropagation();
    });
    this.commonMethodService.searchLoader.subscribe((val) =>
      this.changeDetectorRef.detectChanges()
    );
  }

  activateTab(val) {
    this.activeTab = val;
  }
  getCountryCodes() {
    this.commonAPIMethodService
      .getCountryCodes(this.localstoragedataService.getLoginUserEventGuId())
      .subscribe((res) => {
        this.countries = res;
      });
  }

  //updated code for get all labels started
  getAllLabels(callApi: boolean = false) {
    if (this.commonMethodService.allLabelsArray.length == 0 || callApi) {
      const eventGuId = this.localstoragedataService.getLoginUserEventGuId();
      this.commonAPIMethodService
        .getLabelText(eventGuId)
        .subscribe((res: any) => {
          this.labelsArray = res;
          this.commonMethodService.allLabelsArray = res;
          this.changeDetectorRef.detectChanges();
          this.labeldata();
        });
    } else {
      this.labelsArray = this.commonMethodService.allLabelsArray;
      this.labeldata();
      this.changeDetectorRef.detectChanges();
    }
  }

  labeldata() {
    if (this.labelsArray.length != 0) {
      this.phoneLabelArray = this.labelsArray.filter(
        (x) => x.labelType == "Phone"
      );
      this.phoneLabelArray = this.phoneLabelArray.filter(
        (x) => x.labelName != "Home"
      );
      this.phoneLabelArray = this.phoneLabelArray.filter(
        (x) => x.labelName != "Cell"
      );
      this.changeDetectorRef.detectChanges();
      this.homephone.map((x) => (x.isLabelErrorMessage = false));
      this.cellphone.map((x) => (x.isLabelErrorMessage = false));
      this.phoneLabelArray = this.phoneLabelArray.map((item, index) => {
        item.editVisable = false;
        item.isLabelAdded = false;
        item.phoneRdioId = "phoneRedioId_" + index;
        item.cellRedioId = "cellRedioId_" + index;
        return item;
      });

      // address label
      this.addressLabelArray = this.labelsArray.filter(
        (x) => x.labelType == "Address"
      );
      this.addressLabelArray = this.addressLabelArray.filter(
        (x) => x.labelName != "Home"
      );
      this.donorAddresses.map((x) => (x.isLabelErrorMessage = false));
      this.addressLabelArray = this.addressLabelArray.map((item, index) => {
        item.editVisable = false;
        item.isLabelAdded = false;
        item.addressRdioId = "addressRedioId_" + index;
        return item;
      });

      // email label
      this.emailLabelArray = this.labelsArray.filter(
        (x) => x.labelType == "Email"
      );
      this.emailLabelArray = this.emailLabelArray.filter(
        (x) => x.labelName.toLowerCase() != "home"
      );
      let homeEmailLbl =
        this.labelsArray != null
          ? this.labelsArray.filter(
              (x) =>
                x.labelName.toLowerCase() == "home" &&
                x.labelType.toLowerCase() == "email"
            )
          : null;
      this.email = this.email.map((item) => {
        if (item.emailLabel && item.emailLabel.toLowerCase() == "home") {
          item.emailID = homeEmailLbl[0].labelID;
        }
        return item;
      });
      this.email.map((x) => (x.isLabelErrorMessage = false));
      this.emailLabelArray = this.emailLabelArray.map((item, index) => {
        item.editVisable = false;
        item.isLabelAdded = false;
        item.emailRdioId = "emailRedioId_" + index;
        return item;
      });
    }
  }
  //updated code for get all labels ended

  bindData() {
    this.commonMethodService.bindCommonFieldDropDowns(
      this.ngUnsubscribe,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false
    );
  }

  ngOnDestroy() {
    // This aborts all HTTP requests.
    this.ngUnsubscribe.next();
    // This completes the subject properlly.
    this.ngUnsubscribe.complete();
  }

  getPaymentLocation(searchText, isGlobal) {
    const eventGuId = this.localstoragedataService.getLoginUserEventGuId();
    this.commonAPIMethodService
      .getPaymentLocations(eventGuId, searchText, isGlobal)
      .subscribe((res) => {
        this.paymenLocationData = res;
        this.filteredLocations = this.paymenLocationData;
        this.showDropdown = true;
        if (!this.globalCheckbox && searchText.length > 0)
          this.searchLocations(searchText);
        this.changeDetectorRef.detectChanges();
      });
  }

  // switch code started
  OnCheckboxChange(event) {
    this.showBox = false;
    if (event.target.checked) {
      this.displaySearchIcon = true;
      this.isLocationSearchDisable = true;
      this.showDropdown = false;
    } else {
      this.displaySearchIcon = false;
      this.isLocationSearchDisable = false;
      this.showDropdown = true;
      this.isGlobal = false;
      this.getPaymentLocation(this.locationSearchText, this.isGlobal);
    }
  }

  searchLocations(searchTerm: string) {
    if (
      (this.globalCheckbox && searchTerm.length >= 3) ||
      !this.globalCheckbox
    ) {
      if (this.paymenLocationData) {
        this.filteredLocations = this.paymenLocationData.filter((location) => {
          if (location && location.locationName) {
            return location.locationName
              .toLowerCase()
              .includes(searchTerm.toLowerCase());
          }
          return null;
        });
      }
      if (this.globalCheckbox) this.isLocationSearchDisable = false;
    } else if (searchTerm.length == 0) {
      this.filteredLocations = this.paymenLocationData;
      this.isLocationSearchDisable = true;
    } else {
      this.filteredLocations = [];
      this.isLocationSearchDisable = true;
    }
  }

  SearchGlobalPaymentLocation() {
    this.isGlobal = true;
    this.getPaymentLocation(this.locationSearchText, this.isGlobal);
  }
  // switch code ended

  getTagList() {
    const eventGuId = this.localstoragedataService.getLoginUserEventGuId();
    this.tagService.getAllTag(eventGuId).subscribe(
      (res) => {
        if (res) {
          this.newDonorTagList = res;
          this.tempNewDonorTagList = [...this.newDonorTagList];
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  closePopup() {
    this.activeModal.dismiss();
  }

  getDonorEmailList(accountId) {
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup",
    };
    const modalRef = this.commonMethodService.openPopup(
      DonorEmailComponent,
      this.modalOptions
    );
    var eventGuId = this.localstoragedataService.getLoginUserEventGuId();

    this.donorService
      .getDonorEmailList(eventGuId, accountId)
      .subscribe((res: any) => {
        var obj: any = {};
        if (res != null) {
          obj.list = res;
        }
        if (accountId != undefined) {
          obj.accountId = accountId;
        } else {
          obj.accountId = this.accountId;
        }
        modalRef.componentInstance.DonorEmailListData = obj;
      });
  }
  setValueCustomRadioTest(id: any) {
    $("#lblOpenHomeAddressPopup_" + id).text(
      this.donorAddresses[id].addressLabel
    );
    this.donorAddresses[id].textAddressLabel = null;
    $("#r-custom_" + id).prop("checked", false);

    var vl = $("#lblOpenHomeAddressPopup_" + id).text();
    if (vl == "Work" || vl == "WORK") {
      $("#idtxtcareOf_" + id).show();
    } else {
      $("#idtxtcareOf_" + id).hide();
      this.donorAddresses[id].careOf = null;
    }
  }
  TxtClearRadioDisplayValue0(item: any, id: any) {
    var tt = $("#custom_" + id).val();
    this.donorAddresses[id].addressLabel = tt;
    $("#lblOpenHomeAddressPopup_" + id).text(
      this.donorAddresses[id].addressLabel
    );
    // $("#r-custom_"+id).prop('checked', 'checked');
  }
  TxtRadioDisplayValue0(item: any, id: any) {
    var tt = $("#custom_" + id).val();
    this.donorAddresses[id].addressLabel = tt;
    $("#lblOpenHomeAddressPopup_" + id).text(
      this.donorAddresses[id].addressLabel
    );
    $("#r-custom_" + id).prop("checked", "checked");
  }
  setValueCustomRadioTestReset(item: any) {
    $("#r-work").prop("checked", false);
    $("#r-home").prop("checked", false);
    for (let index = 0; index < this.donorAddresses.length; index++) {
      const element = (this.donorAddresses[index].addressLabel = null);
    }
  }
  setValueCustomRadio(item: any) {
    $("#r-home").prop("checked", false);
    $("#r-work").prop("checked", false);
    $("#r-custom").prop("checked", "checked");
    for (let index = 0; index < this.donorAddresses.length; index++) {
      const element = (this.donorAddresses[index].addressLabel =
        item.target.value);
    }
    $("#r-custom").prop("checked", "checked");
  }

  OpenHomeAddressPopup(id: any) {
    /* $("#isOpenHomeAddressPopup_" + id).toggle();
    $("#lblOpenHomeAddressPopup_" + id).text(
      this.donorAddresses[id].addressLabel
    );
    this.donorAddresses; */
    $(".custom-radio-btn").hide();
    $("#isOpenHomeAddressPopup_" + id).show();
    $("#lblOpenHomeAddressPopup_" + id).text(
      this.donorAddresses[id].addressLabel
    );
    this.dropDownId = id;
    this.openPopup = "HomeAddress";
    this.hideEditTextBox();
    this.isAddressListLabelExist = false;
    this.isAddressEditLabelBtnDisable = false;
    this.selectedAddressLabel = "";
    this.addNewLabel = false;
    if (this.donorAddresses[id].addressLabel) {
      let index = this.addressLabelArray
        .findIndex(
          (item) =>
            item.labelName.toLowerCase() ==
            this.donorAddresses[id].addressLabel.toLowerCase()
        )
        .toString();
      let dyId = "#addressRedioId_" + index + "_" + id;
      $(dyId).prop("checked", true);
    } else {
      this.dropDownId = id;
      this.checkboxes.forEach((element) => {
        element.nativeElement.checked = false;
      });
    }
    this.updateIndexId = id;
    // this.donorAddresses;
  }
  setValueCustomRadioTest1(item: any) {
    var v = item.target.defaultValue;
    for (let index = 0; index < this.homephone.length; index++) {
      const element = (this.homephone[index].phoneLabel =
        item.target.defaultValue);
      this.homephone[index].textPhoneLabel = null;
    }
    if (v == "Home") {
      $("#r-work1").prop("checked", false);
      $("#r-custom1").prop("checked", false);
      $("##r-home1").prop("checked", "checked");
    } else if (v == "Work") {
      $("#r-home1").prop("checked", false);
      $("#r-custom1").prop("checked", false);
      $("#r-work1").prop("checked", "checked");
    }
  }
  setValueCustomRadio1(item: any) {
    $("#r-home1").prop("checked", false);
    $("#r-work1").prop("checked", false);
    $("#r-custom1").prop("checked", "checked");
    for (let index = 0; index < this.homephone.length; index++) {
      const element = (this.homephone[index].phoneLabel = item.target.value);
    }
    $("#r-custom1").prop("checked", "checked");
  }
  setValueCustomRadioTestReset1(item: any) {
    $("#r-work1").prop("checked", false);
    $("#r-home1").prop("checked", false);
    for (let index = 0; index < this.homephone.length; index++) {
      const element = (this.homephone[index].phoneLabel = null);
    }
  }
  updateIndexId;
  OpenHomePhonePopup(id: any) {
    $(".custom-radio-btn").hide();
    $("#idHomePhoneOpen_" + id).show();
    $("#lblHomePhoneOpen_" + id).text(this.homephone[id].phoneLabel);
    this.dropDownId = this.homephone[id].phoneID;
    this.openPopup = "HomePhone";
    this.hideEditTextBox();
    this.isListLabelExist = false;
    this.isEditLabelBtnDisable = false;
    this.selectedLabel = "";
    this.addNewLabel = false;
    let index = this.phoneLabelArray
      .findIndex(
        (item) =>
          item.labelName.toLowerCase() ==
          this.homephone[id].phoneLabel.toLowerCase()
      )
      .toString();
    let dyId = "#phoneRedioId_" + index + "_" + id;
    $(dyId).prop("checked", true);
    this.updateIndexId = id;
  }
  RadioDisplayValue(item: any, id: any) {
    $("#lblHomePhoneOpen_" + id).text(this.homephone[id].phoneLabel);
    this.homephone[id].textPhoneLabel = null;
    $("#r-custom1_" + id).prop("checked", false);
    //added new fun
    this.primryPhone(item, id, this.homephone[id].phoneLabel);
  }

  DynRadioDisplayValue(item: any, id: any, labelName: any, labelID: any) {
    item.target.checked = true;
    this.isLabelNotSelected = false;
    if (this.openPopup == "cellPhone") {
      id = this.dropDownId;

      this.cellphone[id].phoneLabel = labelName;
      this.cellphone[id].textPhoneLabel = null;
      this.OpenCellPhonePopup(id);
      $(".custom-radio-btn").hide();
      this.labelNullValidation();
    }
    if (this.openPopup == "HomePhone") {
      const index = this.homephone.findIndex(
        (x) => x.phoneID == this.dropDownId
      );
      id = index;
      this.homephone[id].phoneLabel = labelName;
      this.homephone[id].textPhoneLabel = null;
      this.OpenHomePhonePopup(id);
      $(".custom-radio-btn").hide();
      this.labelNullValidation();
    }
  }

  TxtRadioDisplayValue(item: any, id: any) {
    var val = item.target.value;
    this.homephone[id].phoneLabel = val;
    $("#lblHomePhoneOpen_" + id).text(this.homephone[id].phoneLabel);
    $("#r-custom1_" + id).prop("checked", "checked");
  }
  TxtClearRadioDisplayValue(item: any, id: any) {
    var tt = $("#custom1_" + id).val();
    this.homephone[id].phoneLabel = tt;
    $("#lblHomePhoneOpen_" + id).text(this.homephone[id].phoneLabel);
    $("#r-custom1_" + id).prop("checked", "checked");
  }
  OpenCellPhonePopup(id: any) {
    $(".custom-radio-btn").hide();
    $("#idCellPhoneOpen_" + id).toggle();
    $("#lblOpenCellPhonePopup_" + id).text(this.cellphone[id].phoneLabel);

    this.dropDownId = id;
    this.openPopup = "cellPhone";
    this.hideEditTextBox();
    this.isListLabelExist = false;
    this.isEditLabelBtnDisable = false;
    this.selectedLabel = "";
    this.addNewLabel = false;
    let index = this.phoneLabelArray
      .findIndex(
        (item) =>
          item.labelName.toLowerCase() ==
          this.cellphone[id].phoneLabel.toLowerCase()
      )
      .toString();
    let dyId = "#cellRedioId_" + index + "_" + id;
    $(dyId).prop("checked", true);
    this.updateIndexId = id;
  }
  RadioDisplayValue3(id: any) {
    $("#lblOpenCellPhonePopup_" + id).text(this.cellphone[id].phoneLabel);
    this.cellphone[id].textPhoneLabel = null;
    $("#r-custom3_" + id).prop("checked", false);
    // added new fun
    var item = null;
    this.primryCell(item, id, this.cellphone[id].phoneLabel);
  }

  CellDynRadioDisplayValue(item: any, id: any, labelName: any) {
    item.target.checked = true;
    this.isLabelNotSelected = false;
    this.cellphone[id].phoneLabel = labelName;
    this.cellphone[id].isdisabled = false;
    this.cellphone[id].textPhoneLabel = null;

    this.OpenCellPhonePopup(id);
    $(".custom-radio-btn").hide();
    this.labelNullValidation();
  }

  SetRadioDisplayValue3(item: any, id: any) {
    var val = item.target.value;
    this.cellphone[id].phoneLabel = val;
    $("#lblOpenCellPhonePopup_" + id).text(this.cellphone[id].phoneLabel);
    $("#r-custom3_" + id).prop("checked", "checked");
  }
  TxtClearRadioDisplayValue3(item: any, id: any) {
    var tt = $("#custom3_" + id).val();
    this.cellphone[id].phoneLabel = tt;
    $("#lblOpenCellPhonePopup_" + id).text(this.cellphone[id].phoneLabel);
    //$("#r-custom1_"+id).prop('checked', 'checked');
  }
  setValueCustomRadio2(item: any, id: any) {
    var val = item.target.value;
    this.email[id].emailLabel = val;
    $("#lblOpenEmailPopup_" + id).text(this.email[id].emailLabel);
    $("#r-custom2_" + id).prop("checked", "checked");
  }
  OpenEmailPopup(id: any) {
    /* $("#idEmailOpen_" + id).toggle();
    $("#lblOpenEmailPopup_" + id).text(this.email[id].emailLabel);
    this.email; */
    //this.isEmailOpen=!this.isEmailOpen;
    $(".custom-radio-btn").hide();
    $("#idEmailOpen_" + id).show();
    $("#lblOpenEmailPopup_" + id).text(this.email[id].emailLabel);
    this.dropDownId = id;
    this.openPopup = "HomeEmail";
    this.hideEditTextBox();
    this.isEmailListLabelExist = false;
    this.isEmailEditLabelBtnDisable = false;
    this.selectedEmailLabel = "";
    this.addNewLabel = false;
    if (this.email[id].emailLabel) {
      let index = this.emailLabelArray
        .findIndex(
          (item) =>
            item.labelName.toLowerCase() ==
            this.email[id].emailLabel.toLowerCase()
        )
        .toString();
      let dyId = "#emailRedioId_" + index + "_" + id;
      $(dyId).prop("checked", true);
    } else {
      this.dropDownId = id;
      this.checkboxes.forEach((element) => {
        element.nativeElement.checked = false;
      });
    }
    this.updateIndexId = id;
    // this.email;
  }
  RadioDisplayValue2(id: any) {
    $("#lblOpenEmailPopup_" + id).text(this.email[id].emailLabel);
    this.email[id].textEmailAddress = null;
    $("#r-custom2_" + id).prop("checked", false);
  }

  TxtClearRadioDisplayValue2(item: any, id: any) {
    var tt = $("#custom2_" + id).val();
    this.email[id].emailLabel = tt;
    $("#lblOpenEmailPopup_" + id).text(this.email[id].emailLabel);
    //$("#r-custom1_"+id).prop('checked', 'checked');
  }
  getDonorPhoneList(accountId) {
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup",
    };
    const modalRef = this.commonMethodService.openPopup(
      DonorPhoneComponent,
      this.modalOptions
    );
    var eventGuId = this.localstoragedataService.getLoginUserEventGuId();

    this.donorService
      .getDonorPhoneList(eventGuId, accountId)
      .subscribe((res: any) => {
        var obj: any = {};
        if (res != null) {
          obj.list = res;
        }
        if (accountId != undefined) {
          obj.accountId = accountId;
        } else {
          obj.accountId = this.accountId;
        }
        modalRef.componentInstance.DonorPhoneListData = obj;
      });
  }

  AddAdvanceField(fieldType) {
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup advance_dropdown",
    };
    const modalRef = this.commonMethodService.openPopup(
      AdvanceDropdownPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.FieldType = fieldType;
    modalRef.componentInstance.Type = "add";
    modalRef.componentInstance.emtSaveAdvanceFields.subscribe((res: any) => {
      if (res) {
        if (this.advancedFieldValues == null) {
          this.advancedFieldValues = [];
        }
        this.advancedFieldValues.push({ advancedField: res, value: null });
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
    });
  }

  onEditPopupAdvancedField(fieldId) {
    this.isloading = true;
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup advance_dropdown",
    };

    const eventGuid = this.localstoragedataService.getLoginUserEventGuId();
    const MacAddress = this.localstoragedataService.getLoginUserGuid();
    const modalRef = this.commonMethodService.openPopup(
      AdvanceDropdownPopupComponent,
      this.modalOptions
    );

    this.advanceFieldService.get(fieldId, eventGuid, MacAddress).subscribe(
      (res: any) => {
        if (res) {
          this.isloading = false;
          modalRef.componentInstance.Type = "edit";
          modalRef.componentInstance.FieldType = res.type;
          modalRef.componentInstance.FieldData = res;
        }
      },
      (err) => {
        this.isloading = false;
      }
    );

    modalRef.componentInstance.emtSaveAdvanceFields.subscribe((res: any) => {
      if (res) {
        if (this.advancedFieldValues == null) {
          this.advancedFieldValues = [];
        }
        this.advancedFieldValues = this.advancedFieldValues.map((obj) => {
          if (obj.advancedField.advancedFieldId == res.advancedFieldId) {
            return {
              advancedField: res,
              value: null,
            };
          }
          return {
            ...obj,
          };
        });
        this.changeDetectorRef.detectChanges();
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
        this.changeDetectorRef.detectChanges();
      }
    });
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
      this.noResult = false;
      this.disableTitle = "Need to be more then 3 characters";
    }
  }

  onClickedOutsidePrimary() {
    this.donorAddresses.forEach((element) => {
      element.isDisplayed = false;
    });
  }

  onClickedOutsideHomePhone() {
    // this.isHomePhoneOpen = false;
  }

  deleteDonor() {
    Swal.fire({
      title: this.commonMethodService.getTranslate("WARNING_SWAL.TITLE"),
      input: "text",
      text: "Please type delete",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete it!",
      cancelButtonText: this.commonMethodService.getTranslate(
        "WARNING_SWAL.BUTTON.CANCEL.NO_KEEP_IT"
      ),
      onOpen: function () {
        //$(Swal.getConfirmButton()).prop('disabled', true);
      },
      inputValidator: (value) => {
        if (value.toLowerCase() != "delete") {
          return 'You need to type "delete"!';
        } else {
        }
      },
    }).then((result) => {
      if (result.value) {
        if (result.value.toLowerCase() == "delete") {
          $(Swal.getConfirmButton()).prop("disabled", false);
          var objDonor = {
            eventGuid: this.localstoragedataService.getLoginUserEventGuId(),
            macAddress: this.localstoragedataService.getLoginUserGuid(),
            accountId: this.accountId,
            deletedBy: this.localstoragedataService.getLoginUserId(),
            deleteCause: result.value,
          };
          this.donorService.deleteDonor(objDonor).subscribe(
            (res: any) => {
              this.isloading = false;
              this.commonMethodService.sendDonorSingle([objDonor]);
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
        }
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: this.commonMethodService.getTranslate("CANCELLED"),
          text: "Your donor is safe :)",
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

  SearchGlobalDonor() {
    var text = $("#globalDonorText").val();
    this.showGlobalDonor = true;
    this.showFatherInLawBox = false;
    this.showFatherBox = false;
    this.commonMethodService.onDonorSearchFieldChange(text, true);
    this.noResult = true;
    setTimeout(() => {
      this.changeDetectorRef.detectChanges();
    }, 3000);
  }
  SelectGlobalDonor(accountId) {
    this.isloading = true;
    this.nonGlobalDonorEditable = true;
    this.showGlobalDonor = false;
    this.selectedGlobalDonor = accountId;
    this.selectedFatherId = accountId;
    this.selectedFatherinLaw = accountId;
    this.commonMethodService.donorList =
      this.commonMethodService.donorList.filter((s) => s.id == accountId);
    this.fatherId =
      this.commonMethodService.donorList[0].displayText == ""
        ? this.commonMethodService.donorList[0].fullNameJewish
        : this.commonMethodService.donorList[0].displayText;
    this.fatherInLawId =
      this.commonMethodService.donorList[0].displayText == ""
        ? this.commonMethodService.donorList[0].fullNameJewish
        : this.commonMethodService.donorList[0].displayText;
    this.globalDonor = null;
    var eventGuId = this.localstoragedataService.getLoginUserEventGuId();
    this.donorService
      .getDonorById(eventGuId, accountId, true)
      .subscribe((res: any) => {
        this.isloading = false;
        this.EditDonorData = res;
        this.selectedFatherId = res.fatherId;
        this.selectedFatherinLaw = res.fatherInLawId;
      });
    this.isSearchDisable = true;
  }

  addHomePhone() {
    this.homephone.push({
      phoneID: null,
      phoneLabel: "Home",
      phoneNumber: "",
    });
  }
  isLabelNotSelected = false;
  isLabelNotSelectedId = "";
  addCellPhone() {
    this.isLabelNotSelected = true;
    this.isLabel = false;
    this.cellphone.push({
      phoneID: null,
      phoneLabel: "",
      phoneNumber: "",
      countryCodeID: this.commonMethodService.getDefaultSelectedCountryCode(),
      dailingCode: this.commonMethodService.getDefaultDailingCode(),
      isdisabled: true,
      selectedFlag: this.commonMethodService.getDefaultSelectedFlag(),
      isLabelErrorMessage: false,
      selectedCountry: this.commonMethodService.getDefaultSelectedCountryCode(),
    });
    setTimeout(() => {
      let id = this.cellphone.length - 1;
      this.isLabelNotSelectedId = "#idCellPhoneOpen_" + id;
      $(".custom-radio-btn").hide();
      $("#idCellPhoneOpen_" + id).toggle();
      this.dropDownId = id;
      this.checkboxes.forEach((element) => {
        element.nativeElement.checked = false;
      });
    }, 100);
  }
  addEmailAddress() {
    this.isLabelNotSelected = true;
    this.email.push({
      emailID: null,
      emailLabel: "",
      emailAddress: "",
      invalid: false,
      isLabelErrorMessage: false,
    });
    setTimeout(() => {
      let id = this.email.length - 1;
      this.isLabelNotSelectedId = "#idEmailOpen_" + id;
      $(".custom-radio-btn").hide();
      $("#idEmailOpen_" + id).toggle();
      this.dropDownId = id;
      this.checkboxes.forEach((element) => {
        element.nativeElement.checked = false;
      });
    }, 100);
  }

  onNewCountryChange() {}
  //code for add new member started
  familyIDCounter = 0;
  addFamilies() {
    this.familyIDCounter++; // Increment the counter to get a new unique family ID
    // Create a new family object with its own unique familyID
    const newFamily = {
      familyID: this.familyIDCounter,
      familyName: "",
      selectedValue: null,
      showCancelIcon: false,
      isShowBox: false,
      isSelectDynamicDonar: false,
      isDynamicTextAdding: false,
      accountId: null,
      isDisplaySearchIcon: false,
      familyNameInputName: `familyName_${this.familyIDCounter}`, // Generate a unique name for input
      familySelectedValue: `selectedValue_${this.familyIDCounter}`, // Generate a unique name for input
      familyGlobalList: `GlobalValue_${this.familyIDCounter}`,
    };

    // Push the newFamily object to the familiesInput array
    this.familiesInput.push(newFamily);
  }

  //code for add new member ended
  addDonorAddress() {
    this.isLabelNotSelected = true;
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
      index: this.addressIndex,
      addressLabel: "",
      isLabelErrorMessage: false,
    });
    this.addressIndex += 1;

    let id = this.donorAddresses.length - 1;
    this.isLabelNotSelectedId = "#isOpenHomeAddressPopup_" + id;
    $(".custom-radio-btn").hide();
    $("#isOpenHomeAddressPopup_" + id).toggle();
    this.dropDownId = id;
  }
  removeHomePhone(i: number) {
    var t = "&&accountPhoneIds=";
    var id = this.homephone[i].phoneID;
    let phoneID = t + id;
    this.deletedAccountPhoneIds += phoneID;
    this.homephone.splice(i, 1);
  }
  removeCellPhone(i: number) {
    this.formValid = true;
    let t = "&&accountPhoneIds=";
    let id = this.cellphone[i].phoneID;
    if (id) {
      let phoneID = t + id;
      this.deletedAccountPhoneIds += phoneID;
    }
    this.cellphone.splice(i, 1);
  }
  removeEmailAddress(i: number) {
    var t = "&&accountEmailIds=";
    var e = this.email[i].emailID;
    let emailId = t + e;
    this.deletedAccountEmailIDs += emailId;
    this.email.splice(i, 1);
  }
  //code for add new member started
  removeFamilies(i: number, family) {
    if (family.accountId != null) {
      if (family.selectedValue === "חתנו") {
        this.sonInLawId.push(family.accountId);
      } else if (family.selectedValue === "בנו") {
        this.sonId.push(family.accountId);
      }
    }
    this.removedFamilies.push(this.familiesInput[0]);
    this.familiesInput.splice(i, 1);
  }
  //code for add new member  ended
  removeDonorAddress(i: number) {
    var t = "accountAddressIds=";
    var a = this.donorAddresses[i].addressId;
    if (this.deletedAccountAddressIds.length == 0) {
      this.deletedAccountAddressIds += t + a;
    } else {
      this.deletedAccountAddressIds += "&accountAddressIds=" + a;
    }

    this.donorAddresses.splice(i, 1);
  }
  removeAdvanceField(advanceFieldId, i) {
    Swal.fire({
      title: this.commonMethodService.getTranslate("WARNING_SWAL.TITLE"),
      input: "text",
      text: "Please type delete",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete it!",
      cancelButtonText: this.commonMethodService.getTranslate(
        "WARNING_SWAL.BUTTON.CANCEL.NO_KEEP_IT"
      ),
      onOpen: function () {
        //$(Swal.getConfirmButton()).prop('disabled', true);
      },
      inputValidator: (value) => {
        if (value.toLowerCase() != "delete") {
          return 'You need to type "delete"!';
        } else {
        }
      },
    }).then((result) => {
      if (result.value) {
        if (result.value.toLowerCase() == "delete") {
          $(Swal.getConfirmButton()).prop("disabled", false);
          var objadvanceField = {
            eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
            macAddress: this.localstoragedataService.getLoginUserGuid(),
            advancedFieldId: advanceFieldId,
            deletedBy: this.localstoragedataService.getLoginUserId(),
          };
          this.advanceFieldService
            .delete(objadvanceField)
            .subscribe((res: any) => {
              if (res) {
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
                this.advancedFieldValues.splice(i, 1);
              }
            });
        }
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: this.commonMethodService.getTranslate("CANCELLED"),
          text: "Your Advanced Field is safe :)",
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

  ValidDonorKeyPress(event, parameter) {
    var val = event.target.value;
    if (val != "" && parameter == "name") {
      this.formValid = true;
    } else if (
      (this.firstNameEnglish === "" ||
        this.firstNameEnglish === null ||
        this.lastNameJewish !== null ||
        this.lastNameJewish !== "") &&
      (this.firstNameJewish == null || this.firstNameJewish == "")
    ) {
      if (val !== "" && parameter == "Lastnameenglish") {
        this.nameReq = false;
        this.formValid = true;
      } else if (val === "" && parameter == "Lastnameenglish") {
        this.formValid = false;
      }
    }
    if (
      (val != "" && parameter == "namejewish") ||
      (val != "" && parameter == "lastnamejewish")
    ) {
      this.formValid = true;
    } else if (
      ((val == "" && parameter == "lastnamejewish") ||
        (val == "" && parameter == "namejewish")) &&
      (this.firstNameEnglish == null || this.firstNameEnglish == "")
    ) {
      this.formValid = false;
    }
    if (
      this.firstNameEnglish !== "" ||
      this.lastNameEnglish !== "" ||
      this.firstNameJewish !== "" ||
      this.lastNameJewish !== ""
    ) {
      this.formValid = true;
    }
    if (
      (this.firstNameJewish == null || this.firstNameJewish == "") &&
      (this.lastNameJewish == null || this.lastNameJewish == "")
    ) {
      if (
        (this.lastNameEnglish !== null || this.lastNameEnglish !== "") &&
        val == "" &&
        parameter == "name"
      ) {
        this.nameReq = false;
        this.formValid = true;
      } else if (
        (this.lastNameEnglish === null || this.lastNameEnglish === "") &&
        val == "" &&
        parameter == "name"
      ) {
        this.nameReq = true;
        this.formValid = false;
      }
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
          if (this.firstNameEnglish != null && this.firstNameEnglish != "") {
            this.formValid = true;
          }
        }
      }
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
  ValidDonor() {
    this.formValid = true;

    if (!this.firstNameEnglish) {
      this.nameReq = true;
      this.formValid = false;
    }
    if (!this.firstNameJewish) {
      this.nameJewishReq = true;
      this.formValid = false;
    }
    if (!this.lastNameEnglish) {
      this.lastNameReq = true;
      this.formValid = false;
    }
    if (!this.lastNameJewish) {
      this.lastNameJewishReq = true;
      this.formValid = false;
    }
    if (
      this.firstNameEnglish ||
      this.firstNameJewish ||
      this.lastNameEnglish ||
      this.lastNameJewish
    ) {
      this.nameReq = false;
      this.nameJewishReq = false;
      this.lastNameReq = false;
      this.lastNameJewishReq = false;
      this.formValid = true;
    }
    if (this.email && this.email.length > 0) {
      var regex =
        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      for (var i = 0; i < this.email.length; i++) {
        if (
          this.email[i].emailAddress != "" &&
          !regex.test(this.email[i].emailAddress)
        ) {
          $(".tab-pane").removeClass("active");
          $(".li_tab").removeClass("active");
          $("#donorinfo").addClass("active");
          $("#editdonorInfo").addClass("active");
          this.email[i].invalid = true;
          this.formValid = false;
        } else {
          this.email[i].invalid = false;
        }
      }
    }
  }

  getFlagClass(countryCodeId: string): string {
    this.flag = this.flagClasses[countryCodeId];
    return this.flagClasses[countryCodeId] || "";
  }

  getDailingCode(countryCodeId: any) {
    return this.flagDailingCode[countryCodeId] || "";
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
          phone.selectedCountry = countryCodeID;
          phone.selectedFlag = this.getFlagClass(countryCodeID);
          this.selectedCountry = countryCodeID;
        }
        return phone;
      });
    } else {
      this.homephone = this.homephone.map((phone) => {
        if (phone.phoneLabel.toLowerCase() === phoneLabel.toLowerCase()) {
          phone.countryCodeID = countryCodeID;
          phone.dailingCode = dialingCode;
          phone.selectedCountry = countryCodeID;
          phone.selectedFlag = this.getFlagClass(countryCodeID);
          this.selectedCountry = countryCodeID;
        }
        return phone;
      });
    }
  }

  SaveDonorInfo(islocation = false) {
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
    this.homephone = this.homephone.filter((x) => x.phoneNumber != "");
    this.ValidDonor();
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
      if (this.donorAddresses && this.donorAddresses.length > 0) {
        this.AddressesCheckNullContaint();
        // code started to make Home address isDefault true if no primary address selected
        let count = 0;
        for (let i = 0; i < this.donorAddresses.length; i++) {
          const element = this.donorAddresses[i];
          if (element.isDefault == false) {
            count = count + 1;
          }
        }
        if (count == this.donorAddresses.length) {
          const element = this.donorAddresses[0];
          if (element && element.isDefault == false) {
            if (element.addressLabel == "Home") {
              element.isDefault = true;
              this.donorAddresses[0] = element;
            } else {
              element.isDefault = false;
              this.donorAddresses[0] = element;
            }
          }
        }
        //code ended
      }
      if (this.cellphone && this.cellphone.length > 0) {
        if (this.cellphone.length == 1) {
          if (this.cellphone[0].phoneNumber != "") {
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
        if (this.email && this.email.length > 1) {
          let homeEmail = this.email.filter(
            (x) => x.emailLabel.toLowerCase() == "home" && x.emailAddress == ""
          );
          if (homeEmail.length > 0) {
            this.email = this.email.filter(
              (obj) => obj.emailLabel != homeEmail[0].emailLabel
            );
          }
        }
      }
      if (this.advancedFieldValues) {
        this.advancedStrFieldValues = this.AdvanceFieldArray([
          ...this.advancedFieldValues,
        ]);
      }
      this.updateAddressArray();
      //deleteEmail
      if (
        this.deletedAccountEmailIDs &&
        this.deletedAccountEmailIDs.length > 0
      ) {
        this.deleteMultipleDonorEmail(this.deletedAccountEmailIDs);
      }
      //deleteAddress
      if (
        this.deletedAccountAddressIds &&
        this.deletedAccountAddressIds.length > 0
      ) {
        this.deleteMultipleDonorAddress(this.deletedAccountAddressIds);
      }
      //deletePhone
      if (
        this.deletedAccountPhoneIds &&
        this.deletedAccountPhoneIds.length > 0
      ) {
        this.deleteMultipleDonorPhone(this.deletedAccountPhoneIds);
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
        //address:this.address,
        //cityStateZip:this.cityStateZip,
        phones: newPhones,
        emails:
          this.email && this.email.length > 0
            ? this.email.map(({ emailID, emailLabel, emailAddress }) => ({
                emailID,
                emailLabel,
                emailAddress,
              }))
            : [],
        advancedFieldValues: this.advancedStrFieldValues,
        TagValues: [...this.donorTagList],
        TagIds: [...this.donorTagList.map((a) => a.tagId)],
        loginUserId: this.localstoragedataService.getLoginUserId(),
        //longitude:this.longitude,
        //latitude:this.latitude,
        title: this.titleEnglish,
        firstName: this.firstNameEnglish,
        lastName: this.lastNameEnglish,
        titleJewish: this.titleJewish,
        SuffixJewish: this.suffixJewish,
        firstNameJewish: this.firstNameJewish,
        lastNameJewish: this.lastNameJewish,
        fatherId: this.selectedFatherId,
        fatherInLawId: this.selectedFatherinLaw,
        accountNum: this.accountNum,
        isCollector: false,
        SaveWhenPhoneExists: false,
        father: this.father,
        fatherInLaw: this.fatherInLaw,
        DonorLocations: this.donorLocation,
        locationIds: this.locationIDS,
      };

      this.donorService
        .SaveDonor(objSaveDonor)
        .pipe(
          map((data) => data),
          switchMap((data) => {
            this.donorSaveResponse = data;
            this.commonMethodService.sendDonorLst(true);
            //save family api code started
            if (this.familiesInput.length > 0) {
              // Initialize arrays to store the results
              const sonInLawIds: number[] = [];
              const sonIds: number[] = [];

              // Loop through the familyList array
              for (const family of this.familiesInput) {
                // Check the selectedValue for each object
                if (family.selectedValue === "חתנו") {
                  // If selectedValue is "חתנו", add the accountId to sonInLawIds
                  sonInLawIds.push(family.accountId);
                } else if (family.selectedValue === "בנו") {
                  // If selectedValue is "בנו", add the accountId to sonIds
                  sonIds.push(family.accountId);
                }
              }

              var objFamily = {
                eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
                accountId: this.donorSaveResponse.accountId,
                sonIds: sonIds,
                sonInLawIds: sonInLawIds,
              };

              var delObjFamily = {
                eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
                accountId: this.donorSaveResponse.accountId,
                sonIds: this.sonId,
                sonInLawIds: this.sonInLawId,
              };

              return forkJoin([
                this.familyService.Save(objFamily),
                delObjFamily.sonIds.length != 0 ||
                delObjFamily.sonInLawIds.length != 0
                  ? this.familyService.Delete(delObjFamily)
                  : of("No deletion required"),
              ]);
            } else {
              if (this.removedFamilies.length) {
                var delObjFamily = {
                  eventGuId:
                    this.localstoragedataService.getLoginUserEventGuId(),
                  accountId: this.donorSaveResponse.accountId,
                  sonIds: this.sonId,
                  sonInLawIds: this.sonInLawId,
                };

                return this.familyService.Delete(delObjFamily);
              }
              return of([]);
            }
          })
        )
        .subscribe(
          (response) => {
            var res = this.donorSaveResponse;
            if (res) {
              if (islocation) {
                this.EditDonorData = res;
              } else {
                this.activeModal.close(res);
              }
              if (this.isEditMode) {
                this.analytics.editedDonor();
                Swal.fire({
                  title: "",
                  text: "Donor updated successfully",
                  icon: "success",
                  confirmButtonText: this.commonMethodService.getTranslate(
                    "WARNING_SWAL.BUTTON.CONFIRM.OK"
                  ),
                  customClass: {
                    confirmButton: "btn_ok",
                  },
                }).then(() => {
                  // this.emtOutputEditDonor.emit(true);
                  this.emtOutputEditDonor.emit(true);
                  this.emtOutputEditDonorUpdatedValue.emit(res);
                  this.commonMethodService.sendPaymentTrans(true);
                  this.commonMethodService.sendPledgeTrans(true);
                });
              } else {
                this.analytics.createdDonor();
                Swal.fire({
                  title: "",
                  text: "Donor added successfully",
                  icon: "success",
                  confirmButtonText: this.commonMethodService.getTranslate(
                    "WARNING_SWAL.BUTTON.CONFIRM.OK"
                  ),
                  customClass: {
                    confirmButton: "btn_ok",
                  },
                }).then(() => {
                  this.emtOutputEditDonor.emit(true);
                  this.emtOutputDonorTransaction.emit(res); //added new
                });
              }

              var donarList = [res];
              this.commonMethodService.sendDonorSingle(donarList);
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
            var str = error.error;
            var regex = /<br\s*[\/]?>/gi;
            var msg = str.replace(regex, "\n");

            Swal.fire({
              //text: msg,//error.error,
              html: error.error,
              iconHtml: "<img src='assets/dist/img/icon-alert.svg'>",
              showDenyButton: false,
              showCancelButton: true,
              confirmButtonText: "Save anyway",
              confirmButtonColor: "#726ab9",
              customClass: {
                container: "donor-edit-modal",
              },
              //denyButtonText: `Don't save`,
            }).then((result) => {
              /* Read more about isConfirmed, isDenied below */
              if (result.isConfirmed) {
                this.isloading = true;
                objSaveDonor.SaveWhenPhoneExists = true;
                this.donorService
                  .SaveDonor(objSaveDonor)
                  .pipe(
                    map((data) => data),
                    switchMap((data) => {
                      this.donorSaveResponse = data;

                      if (this.familiesInput.length > 0) {
                        // Initialize arrays to store the results
                        const sonInLawIds: number[] = [];
                        const sonIds: number[] = [];

                        // Loop through the familyList array
                        for (const family of this.familiesInput) {
                          // Check the selectedValue for each object
                          if (family.selectedValue === "חתנו") {
                            // If selectedValue is "חתנו", add the accountId to sonInLawIds
                            sonInLawIds.push(family.accountId);
                          } else if (family.selectedValue === "בנו") {
                            // If selectedValue is "בנו", add the accountId to sonIds
                            sonIds.push(family.accountId);
                          }
                        }

                        var objFamily = {
                          eventGuId:
                            this.localstoragedataService.getLoginUserEventGuId(),
                          accountId: this.donorSaveResponse.accountId,
                          sonIds: sonIds,
                          sonInLawIds: sonInLawIds,
                        };

                        var delObjFamily = {
                          eventGuId:
                            this.localstoragedataService.getLoginUserEventGuId(),
                          accountId: this.donorSaveResponse.accountId,
                          sonIds: this.sonId,
                          sonInLawIds: this.sonInLawId,
                        };

                        return forkJoin([
                          this.familyService.Save(objFamily),
                          delObjFamily.sonIds.length != 0 ||
                          delObjFamily.sonInLawIds.length != 0
                            ? this.familyService.Delete(delObjFamily)
                            : of("No deletion required"),
                        ]);
                      } else {
                        // If familiesInput is empty, return an empty observable (or any desired fallback)
                        return of([]);
                      }
                    })
                  )
                  .subscribe(
                    (res: any) => {
                      res = this.donorSaveResponse;
                      this.isloading = false;
                      this.activeModal.close(res);
                      Swal.fire({
                        title: "",
                        text: "Donor added successfully",
                        icon: "success",
                        confirmButtonText:
                          this.commonMethodService.getTranslate(
                            "WARNING_SWAL.BUTTON.CONFIRM.OK"
                          ),
                        customClass: {
                          confirmButton: "btn_ok",
                        },
                      }).then(() => {
                        this.emtOutputEditDonor.emit(true);
                        this.emtOutputDonorTransaction.emit(res); //added new
                      });
                      // this.commonMethodService.sendDonorLst(true); for issue
                      var donarList = [res];
                      this.commonMethodService.sendDonorSingle(donarList);
                      this.emtOutputEditDonorUpdatedValue.emit(res); //added new
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
                        confirmButtonText:
                          this.commonMethodService.getTranslate(
                            "WARNING_SWAL.BUTTON.CONFIRM.OK"
                          ),
                        customClass: {
                          confirmButton: "btn_ok",
                        },
                      });
                      this.isloading = false;
                    }
                  );
              } else if (result.isDismissed) {
                //this.formValid=false;
              }
            });
          }
        );
    }
  }

  AdvanceFieldArray(list = []) {
    if (list && list.length > 0) {
      return list.map((element) => {
        let resultArr = null;
        if (
          element.advancedField.type == "dropdown" &&
          element.advancedField.options != null
        ) {
          resultArr = element.advancedField.options.toString();
        }
        return {
          ...element,
          advancedField: {
            ...element.advancedField,
            options: resultArr,
          },
        };
      });
    }

    return [];
  }

  openLocationCard(locationId) {
    if (locationId != null && locationId != 0) {
      this.isloading = false;

      this.modalOptions = {
        centered: true,
        size: "lg",
        backdrop: "static",
        keyboard: true,
        windowClass: "drag_popup location_card donor_card",
      };
      const modalRef = this.commonMethodService.openPopup(
        LocationCardPopupComponent,
        this.modalOptions
      );
      modalRef.componentInstance.LocationId = locationId;
      var objCollectorCard = {
        eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
        locationId: locationId,
      };
      this.locationService
        .getLocationCard(objCollectorCard)
        .subscribe((res: any) => {
          this.isloading = false;
          if (res) {
            modalRef.componentInstance.LocationCardData = res;
          }
        });
    }
  }

  ClickedAddLocation() {
    this.isLocationClicked = true;
  }

  dropdownHideAndShow(isLocationClicked, event) {
    if (isLocationClicked == true) {
      event.stopPropagation();
    }
  }

  AddLocation(locationID) {
    let finalLocationIds = [];
    this.isLocationClicked = false;

    for (let i = 0; i < this.lstLocation.length; i++) {
      this.locationIDS.push(this.lstLocation[i].locationId);
    }

    finalLocationIds = this.locationIDS.filter((x) => x != undefined);

    let locationData = [];

    locationData = this.paymenLocationData.filter(
      (x) => x.locationID === locationID
    );

    const address = locationData[0].address;
    const locationId = locationData[0].locationID;

    // Split the address string into an array of individual words
    const addressArray = address.split(" ");

    // Extract the city, ZIP, state, and address fields
    const city = addressArray.slice(2, addressArray.length - 2).join(" ");
    const ZIP = addressArray[addressArray.length - 1];
    const state = addressArray[addressArray.length - 2];
    const addressField = addressArray
      .slice(0, addressArray.length - 4)
      .join(" ");

    let objdonorlocation = {
      accountLocationId: this.accountLocationId,
      locationName: locationData[0].locationName,
      address: addressField,
      city: city,
      state: state,
      zip: ZIP,
    };

    let location = {
      accountLocationId: this.accountLocationId,
      title: locationData[0].locationName,
      address: addressField,
      city: city,
      state: state,
      zip: ZIP,
    };

    finalLocationIds.push(locationId);
    this.locationIDS = finalLocationIds;
    this.donorLocation.push(location);
    this.lstLocation.push(objdonorlocation);
    this.accountLocationId += -1;
  }

  DeleteDonorLocation(donorlocationId) {
    this.isloading = true;
    Swal.fire({
      title: this.commonMethodService.getTranslate("WARNING_SWAL.TITLE"),
      text: "You will not be able to recover this donor's location!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: this.commonMethodService.getTranslate(
        "WARNING_SWAL.BUTTON.CANCEL.NO_KEEP_IT"
      ),
    }).then((result) => {
      if (result.value) {
        if (Math.sign(donorlocationId) == -1) {
          var index = this.donorLocation
            .map((x) => {
              return x.accountLocationId;
            })
            .indexOf(donorlocationId);
          var index1 = this.lstLocation
            .map((x) => {
              return x.accountLocationId;
            })
            .indexOf(donorlocationId);
          this.donorLocation.splice(index, 1);
          this.lstLocation.splice(index1, 1);
          this.isloading = false;
          Swal.fire({
            title: this.commonMethodService.getTranslate(
              "WARNING_SWAL.SUCCESS_TITLE"
            ),
            text: "Deleted",
            icon: "success",
            confirmButtonText: this.commonMethodService.getTranslate(
              "WARNING_SWAL.BUTTON.CONFIRM.OK"
            ),
            customClass: {
              confirmButton: "btn_ok",
            },
          });
        } else {
          this.donorService.deleteDonorLocation(donorlocationId).subscribe(
            (res: any) => {
              this.isloading = false;
              if (res) {
                this.isloading = true;
                //this.activeModal.dismiss();
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
                var eventGuId =
                  this.localstoragedataService.getLoginUserEventGuId();
                this.donorService
                  .getDonorById(eventGuId, this.accountId)
                  .subscribe((res: any) => {
                    this.isloading = false;
                    this.EditDonorData = res;
                  });
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
                this.isloading = false;
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
              this.isloading = false;
            }
          );
        }
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: this.commonMethodService.getTranslate("CANCELLED"),
          text: "Your location is safe :)",
          icon: "error",
          confirmButtonText: this.commonMethodService.getTranslate(
            "WARNING_SWAL.BUTTON.CONFIRM.OK"
          ),
          customClass: {
            confirmButton: "btn_ok",
          },
        });
        this.isloading = false;
      }
    });
  }

  SearchGlobalFather() {
    this.isGlobalFatherList = true;
    var text = $("#fatherText").val();
    this.showFatherBox = true;
    this.showFatherInLawBox = false;
    this.commonMethodService.onDonorSearchFieldChange(text, true);
  }
  SearchGlobalFatherInLaw() {
    this.isGlobalFatherInLawList = true;
    var text = $("#fatherInLawText").val();
    this.showFatherInLawBox = true;
    this.showFatherBox = false;
    this.commonMethodService.onDonorSearchFieldChange(text, true);
  }

  SearchDonorFather(event) {
    this.showFatherBox = true;
    if (event == "") {
      this.commonMethodService.donorList = [];
    }
    if (event.target.value.length > 2) {
      if ($("#globalfatherlist").is(":checked")) {
        if (event.keyCode === 13) {
          this.isGlobalFatherList = true;
          this.showFatherBox = true;
          this.showFatherInLawBox = false;
          this.commonMethodService.onDonorSearchFieldChange(
            event.target.value,
            true
          );
        }
      } else {
        this.isGlobalFatherList = false;
        this.search(event.target.value);
      }
    }
  }

  SearchDonorFatherInLaw(event) {
    this.showFatherInLawBox = true;
    if (event == "") {
      this.commonMethodService.donorList = [];
    }
    if (event.target.value.length > 2) {
      if ($("#globalfatherinlawlist").is(":checked")) {
        if (event.keyCode === 13) {
          this.isGlobalFatherInLawList = true;
          this.showFatherInLawBox = true;
          this.showFatherBox = false;
          this.commonMethodService.onDonorSearchFieldChange(
            event.target.value,
            true
          );
        }
      } else {
        this.isGlobalFatherInLawList = false;
        this.search(event.target.value);
      }
    }
  }

  search(keyword) {
    var record = this.commonMethodService.localDonorList;
    keyword = keyword.toLowerCase();
    var filterdRecord;
    if (keyword != "") {
      var searchArray = keyword.split(" ");
      for (var searchValue of searchArray) {
        filterdRecord = record.filter(
          (obj) =>
            (obj.accountNum &&
              obj.accountNum.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.fullName &&
              obj.fullName.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.fullNameJewish &&
              obj.fullNameJewish.toLowerCase().toString().indexOf(searchValue) >
                -1) ||
            (obj.address &&
              obj.address.toString().toLowerCase().indexOf(searchValue) > -1) ||
            (obj.cityStateZip &&
              obj.cityStateZip.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.group &&
              obj.group.toString().toLowerCase().indexOf(searchValue) > -1) ||
            (obj.class &&
              obj.class.toString().toLowerCase().indexOf(searchValue) > -1) ||
            (obj.phoneLabels &&
              obj.phoneLabels.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.phonenumbers &&
              obj.phonenumbers.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.emailLabels &&
              obj.emailLabels.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.emails &&
              obj.emails.toString().toLowerCase().indexOf(searchValue) > -1)
        );
        if (filterdRecord.length > 0) {
          for (var i = 0; i < filterdRecord.length; i++) {
            filterdRecord[i].id = filterdRecord[i].accountId;
            filterdRecord[i].displayText = filterdRecord[i].fullName;
          }
        }
        this.commonMethodService.donorList = filterdRecord;
        record = this.commonMethodService.donorList;
      }
    } else {
      this.commonMethodService.donorList = [];
    }
  }

  OnGlobalFatherCheckboxChange(event) {
    if (event.target.checked) {
      this.displayFatherSearchIcon = true;
    } else {
      this.displayFatherSearchIcon = false;
    }
  }
  OnGlobalFatherInLawCheckboxChange(event) {
    if (event.target.checked) {
      this.displayFatherinLawSearchIcon = true;
    } else {
      this.displayFatherinLawSearchIcon = false;
    }
  }

  AddNewTag() {
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "advance_dropdown",
    };
    const modalRef = this.commonMethodService.openPopup(
      DonorAddtagPopupComponent,
      this.modalOptions
    );

    modalRef.componentInstance.Type = "add";
    modalRef.componentInstance.emtOutputTagUpdate.subscribe((res) => {
      this.newDonorTagList.push({ ...res });
    });
  }

  AddFamilyMember(type) {
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup addfamily addtag",
    };
    const modalRef = this.commonMethodService.openPopup(
      DonorAddfamilyPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.FamilyType = type;
    modalRef.componentInstance.emtOutputFamilyUpdate.subscribe((res) => {
      if (res) {
        var memberArr = {
          memberLabel: res.memberLabel,
          memberType: res.memberType,
          accountFamilyId: 0,
          fullName: res.fullName,
          memberAccountId: res.memberAccountId,
          familyMemberId: 0,
          familyType: res.familyType,
        };
        if (this.familyArr && this.familyArr.length > 0) {
          let isValue = this.familyArr.filter(
            (x) => x.familyType == res.familyType
          );
          if (isValue.length > 0) {
            isValue[0].members.push(memberArr);
            this.memberArr.push(memberArr);
          } else {
            this.memberArr.push(memberArr);
            var familyObj = {
              accountFamilyId: 0,
              familyType: res.familyType,
              familyLabel: null,
              members: this.memberArr.filter(
                (x) => x.familyType == res.familyType
              ),
            };

            this.familyArr.push(familyObj);
          }
        } else {
          this.memberArr.push(memberArr);
          var familyObj = {
            accountFamilyId: 0,
            familyType: res.familyType,
            familyLabel: null,
            members: this.memberArr.filter(
              (x) => x.familyType == res.familyType
            ),
          };

          this.familyArr.push(familyObj);
        }
      }
    });

    //this.newDonorTagList.push({...res})
  }

  RemoveMember(memberAccountId, value) {
    if (this.familyArr && this.familyArr.length > 0) {
      let requiredValue = this.familyArr.filter((x) => x.familyType != value);
      this.familyArr = this.familyArr.filter((x) => x.familyType == value);
      let member = this.familyArr.map((x) =>
        x.members.filter((x) => x.memberAccountId != memberAccountId)
      );
      this.familyArr.forEach((element) => {
        element.members = [];
        element.members.push(...member[0]);
      });
      this.familyArr = this.familyArr.concat(requiredValue);
      this.familyArr = this.familyArr.filter((x) => x.members.length > 0);
    }
    if (this.memberArr && this.memberArr.length > 0) {
      this.memberArr = this.memberArr.filter(
        (x) => x.memberAccountId != memberAccountId
      );
    }
  }
  onTagEdit(tagId) {
    this.isloading = true;
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup addtag edit-tag-modal",
    };

    const eventGuId = this.localstoragedataService.getLoginUserEventGuId();
    const macAddress = this.localstoragedataService.getLoginUserGuid();
    const modalRef = this.commonMethodService.openPopup(
      DonorAddtagPopupComponent,
      this.modalOptions
    );

    this.tagService.getTag(tagId, eventGuId, macAddress).subscribe(
      (res) => {
        this.isloading = false;
        this.changeDetectorRef.detectChanges();
        if (res) {
          modalRef.componentInstance.Type = "edit";
          modalRef.componentInstance.TagData = { ...res };
        }
      },
      (err) => {
        this.isloading = false;
      }
    );

    modalRef.componentInstance.emtOutputTagUpdate.subscribe((res) => {
      this.donorTagList = this.donorTagList.map((t) => {
        if (t.tagId !== res.tagId) {
          return {
            ...t,
          };
        }
        return { ...res };
      });

      this.newDonorTagList = this.newDonorTagList.map((t) => {
        if (t.tagId !== res.tagId) {
          return {
            ...t,
          };
        }
        return { ...res };
      });
    });

    modalRef.componentInstance.emtOutputTagRemove.subscribe((res) => {
      this.donorTagList = this.donorTagList.filter((o) => {
        return o.tagId !== res;
      });

      this.newDonorTagList = this.newDonorTagList.filter((o) => {
        return o.tagId !== res;
      });
    });
  }

  onTagDelete(tagId) {
    // Remove tag locally
    // this.donorTagList = this.donorTagList.filter((a) => a.tagId !== tagId);
    this.donorTagList = this.donorTagList.filter((a) => {
      if (a.tagId == tagId) {
        (a.tagId = a.tagId),
          (a.statusId = -1),
          delete a.tagColor,
          delete a.tagName,
          delete a.tagRecordType;
      }
      return a;
    });
  }

  onClickedOutside() {
    this.showFatherBox = false;
    this.showFatherInLawBox = false;
    this.showGlobalDonor = false;
  }
  SelectFather(accountId) {
    this.nonFatherEditable = true;
    this.showFatherBox = false;
    this.selectedFatherId = accountId;
    this.commonMethodService.donorList =
      this.commonMethodService.donorList.filter((s) => s.id == accountId);
    this.fatherId =
      this.commonMethodService.donorList[0].displayText == ""
        ? this.commonMethodService.donorList[0].fullNameJewish
        : this.commonMethodService.donorList[0].displayText;
  }

  SelectFatherInLaw(accountId) {
    this.nonFatherInLawEditable = true;
    this.showFatherInLawBox = false;
    this.selectedFatherinLaw = accountId;
    this.commonMethodService.donorList =
      this.commonMethodService.donorList.filter((s) => s.id == accountId);
    this.fatherInLawId =
      this.commonMethodService.donorList[0].displayText == ""
        ? this.commonMethodService.donorList[0].fullNameJewish
        : this.commonMethodService.donorList[0].displayText;
  }

  RemoveGlobalDonor() {
    this.nonGlobalDonorEditable = false;
    this.globalDonor = null;
    this.cityStateZip = null;
    this.fullName = null;
    this.address = null;
    this.fullNameJewish = null;
    this.homephone = [
      {
        phoneID: null,
        phoneLabel: "Home",
        phoneNumber: "",
      },
    ];
    this.cellphone = [
      {
        phoneID: null,
        phoneLabel: "cell",
        phoneNumber: "",
      },
    ];
    this.email = [
      {
        emailID: null,
        emailLabel: "Email",
        emailAddress: "",
        invalid: false,
      },
    ];
  }

  onSelectTag(tagId: number) {
    const tag = this.newDonorTagList.find((o) => o.tagId === tagId);
    const inDonor = this.donorTagList.find((a) => a.tagId === tagId);
    if (tag && !inDonor) {
      this.donorTagList.push({
        ...tag,
      });
    }
  }

  contains_hebrew(str) {
    var hebrewstr = /[\u0590-\u05FF]/.test(str);
    if (hebrewstr) {
      return "hebrew_lng";
    } else {
      return "";
    }
  }

  getAllAdvancedField() {
    const eventGuId = this.localstoragedataService.getLoginUserEventGuId();
    this.advanceFieldService.getAll(eventGuId).subscribe(
      (res: any) => {
        if (res) {
          this.advancedFieldValues = res.map((obj) => {
            return {
              advancedField: obj,
              value: null,
            };
          });
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
      },
      (err) => {
        this.isloading = false;
      }
    );
  }

  //

  @ViewChild("insideElement", { static: false }) insideElement;
  @HostListener("document:click", ["$event.target"])
  public onClick(targetElement) {
    var kk = targetElement.parentElement.className;
    if (kk != "dropdown-menu") {
      if (kk != "arrow_trigger") {
        if (kk != "") {
          if (kk != "input-radio") {
            if (kk != "input_custom") {
              if (kk != "input-check-primary") {
                $(".dropdown-menu").hide();
              }
            }
          }
        }
      }
    }
  }

  onSearchChange(
    searchValue: string,
    phoneLabel: string,
    phoneID = null
  ): void {
    this.maskSetVal = "";
    if (searchValue.startsWith("1", 0)) {
      this.maskSetVal = "0(000) 000-000099999";
    } else if (searchValue.startsWith("(1", 1)) {
      this.maskSetVal = "0(000) 000-000099999";
    } else {
      if (searchValue.startsWith("0", 1)) {
        this.maskSetVal = "(000) 000-000099999";
        let outString = searchValue.replace(
          /[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi,
          ""
        );
        outString = outString.replace(/\s+/g, "");
        if (!this.isEditMode) {
          const result = this.homephone.map((item) => {
            if (
              item.phoneNumber == outString &&
              item.phoneLabel == phoneLabel &&
              this.checkZeroValidation(outString)
            ) {
              item.isErrorMessage = true;
              this.formValid = false;
            }
            if (!this.checkZeroValidation(outString)) {
              item.isErrorMessage = false;
              this.formValid = true;
            }
          });
        }
        this.isErrorPhoneID = phoneID;
        const result = this.homephone.map((item) => {
          if (
            item.phoneID == phoneID &&
            this.isEditMode &&
            this.checkZeroValidation(outString)
          ) {
            item.isErrorMessage = true;
            this.formValid = false;
          }
          if (!this.checkZeroValidation(outString)) {
            item.isErrorMessage = false;
            this.formValid = true;
          }
        });
      } else {
        this.maskSetVal = "(000) 000-000099999";
        const result = this.homephone.map((item) => {
          if (item.phoneID == phoneID) {
            item.isErrorMessage = false;
            this.formValid = true;
          }
        });
      }
    }
    const cellphone = this.cellphone.map((item) => {
      if (item.isErrorMessage) {
        this.formValid = false;
      }
    });
    const homephone = this.homephone.map((item) => {
      if (item.isErrorMessage) {
        this.formValid = false;
      }
    });
  }
  onSearchChange2(
    searchValue: string,
    phoneLabel: string,
    phoneID = null
  ): void {
    this.maskSetVal2 = "";
    if (searchValue.startsWith("1", 0)) {
      this.maskSetVal2 = "0(000) 000-000099999";
    } else if (searchValue.startsWith("(1", 1)) {
      this.maskSetVal2 = "0(000) 000-000099999";
    } else {
      let outString = searchValue.replace(
        /[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi,
        ""
      );
      outString = outString.replace(/\s+/g, "");
      if (searchValue.startsWith("0", 1)) {
        this.maskSetVal2 = "(000) 000-000099999";
        if (!this.isEditMode) {
          const result = this.cellphone.map((item) => {
            if (
              item.phoneNumber == outString &&
              item.phoneLabel == phoneLabel &&
              this.checkZeroValidation(outString)
            ) {
              item.isErrorMessage = true;
              this.formValid = false;
            }
            if (!this.checkZeroValidation(outString)) {
              item.isErrorMessage = false;
              this.formValid = true;
            }
          });
        }
        const result = this.cellphone.map((item) => {
          if (
            item.phoneID == phoneID &&
            this.isEditMode &&
            item.phoneNumber == outString &&
            this.checkZeroValidation(outString)
          ) {
            item.isErrorMessage = true;
            this.formValid = false;
          }
          if (!this.checkZeroValidation(outString)) {
            item.isErrorMessage = false;
            this.formValid = true;
          }
        });
      } else {
        this.maskSetVal2 = "(000) 000-000099999";
        const result = this.cellphone.map((item) => {
          if (item.phoneID == phoneID) {
            item.isErrorMessage = false;
            this.formValid = true;
          }
        });
      }
    }
    const cellphone = this.cellphone.map((item) => {
      if (item.isErrorMessage) {
        this.formValid = false;
      }
    });
    const homephone = this.homephone.map((item) => {
      if (item.isErrorMessage) {
        this.formValid = false;
      }
    });
  }

  primryAddress(event: any, id: number) {
    for (let index = 0; index < this.donorAddresses.length; index++) {
      this.donorAddresses[index].isDefault = false;
    }
    // this.donorAddresses[id].isDefault=event.target.checked;
    if (
      event.target.checked == false &&
      this.donorAddresses[id].addressLabel == "HOME"
    ) {
      event.target.checked = true;
    } else if (
      event.target.checked == false &&
      this.donorAddresses[id].addressLabel == "Work"
    ) {
      event.target.checked = true;
    } else if (
      event.target.checked == false &&
      this.donorAddresses[id].addressLabel == null
    ) {
      event.target.checked = true;
    } else if (
      event.target.checked == false &&
      this.donorAddresses[id].addressLabel == ""
    ) {
      event.target.checked = true;
    }
    // else{
    this.donorAddresses[id].isDefault = event.target.checked;
    // }
  }
  primryPhone(event: any, id: number, plable) {
    this.homephone = this.homephone.map((o) => {
      return {
        ...o,
        isDefault: false,
      };
    });
    this.cellphone = this.cellphone.map((o) => {
      return {
        ...o,
        isDefault: false,
      };
    });
    // this.homephone[id].isDefault=event.target.checked;
    if (
      event.target.checked == false &&
      this.homephone[id].phoneLabel == "Home"
    ) {
      event.target.checked = true;
    } else if (
      event.target.checked == false &&
      this.homephone[id].phoneLabel.toLowerCase() == "cell"
    ) {
      event.target.checked = true;
    } else if (
      event.target.checked == false &&
      this.homephone[id].phoneLabel == null
    ) {
      event.target.checked = true;
    } else if (
      event.target.checked == false &&
      this.homephone[id].phoneLabel == ""
    ) {
      event.target.checked = true;
    }
    // else{
    this.homephone[id].isDefault = event.target.checked;
    // }
  }
  primryCell(event: any, id: number, plable) {
    for (let index = 0; index < this.homephone.length; index++) {
      this.homephone[index].isDefault = false;
    }
    for (let index = 0; index < this.cellphone.length; index++) {
      // if(this.cellphone[index].phoneLabel==plable){
      this.cellphone[index].isDefault = false;
      // }
    }
    // this.cellphone[id].isDefault=event.target.checked;
    if (
      event.target.checked == false &&
      this.cellphone[id].phoneLabel == "Home Cell"
    ) {
      event.target.checked = true;
    } else if (
      event.target.checked == false &&
      this.cellphone[id].phoneLabel.toLowerCase() == "cell"
    ) {
      event.target.checked = true;
    } else if (
      event.target.checked == false &&
      this.cellphone[id].phoneLabel == null
    ) {
      event.target.checked = true;
    } else if (
      event.target.checked == false &&
      this.cellphone[id].phoneLabel == ""
    ) {
      event.target.checked = true;
    }
    // else{
    this.cellphone[id].isDefault = event.target.checked;
    // }
  }
  primryEmail(event: any, id: number) {
    for (let index = 0; index < this.email.length; index++) {
      this.email[index].isDefault = false;
    }
    // this.email[id].isDefault=event.target.checked;
    if (event.target.checked == false && this.email[id].emailLabel == "Home") {
      event.target.checked = true;
    } else if (
      event.target.checked == false &&
      this.email[id].emailLabel == "Work"
    ) {
      event.target.checked = true;
    } else if (
      event.target.checked == false &&
      this.email[id].emailLabel == "Email"
    ) {
      event.target.checked = true;
    } else if (
      event.target.checked == false &&
      this.email[id].emailLabel.toLowerCase() == "email"
    ) {
      event.target.checked = true;
    } else if (
      event.target.checked == false &&
      this.email[id].emailLabel == null
    ) {
      event.target.checked = true;
    } else if (
      event.target.checked == false &&
      this.email[id].emailLabel == ""
    ) {
      event.target.checked = true;
    }
    // else{
    this.email[id].isDefault = event.target.checked;
    // }
  }
  //
  isDuplicateAccNumber = false;
  isSetBorderCls = "";
  duplicateAccNumber(event: any) {
    var val = event.target.value;
    const isElementPresent = this.donarListLocal.filter(
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
  updateAddressArray() {
    for (let index = 0; index < this.donorAddresses.length; index++) {
      const streetAddress = this.donorAddresses[index].streetAddress;
      if (streetAddress) {
        var oss = streetAddress.split(" ");
        var HouseNumVal = oss && oss.length > 0 ? oss[0] : "";
        var mystring = streetAddress;
        var newstr = mystring.replace(HouseNumVal, "");
        var streetVal = newstr.trim();
        this.donorAddresses[index].street = streetVal;
        this.donorAddresses[index].houseNum = HouseNumVal;
      }
    }
  }
  checkContains_heb(str) {
    var check = /[\u0590-\u05FF]/.test(str);
    if (check) {
      $("#txtLastNameJewish").css("direction", "RTL");
    } else {
      $("#txtLastNameJewish").css("direction", "");
    }
  }
  checkContains_heb1(str) {
    var check = /[\u0590-\u05FF]/.test(str);
    if (check) {
      $("#txtFirstNameJewish").css("direction", "RTL");
    } else {
      $("#txtFirstNameJewish").css("direction", "");
    }
  }
  checkContains_heb_txtSuffixJewish(str) {
    var check = /[\u0590-\u05FF]/.test(str);
    if (check) {
      $("#txtSuffixJewish").css("direction", "RTL");
    } else {
      $("#txtSuffixJewish").css("direction", "");
    }
  }

  checkContains_heb_txtTitleJewish(str) {
    var check = /[\u0590-\u05FF]/.test(str);
    if (check) {
      $("#txtTitleJewish").css("direction", "RTL");
    } else {
      $("#txtTitleJewish").css("direction", "");
    }
  }
  deleteMultipleDonorEmail(accountEmailIds) {
    var eventGuId = this.localstoragedataService.getLoginUserEventGuId();
    var loginUserId = this.localstoragedataService.getLoginUserId();
    this.donorService
      .deleteMultipleDonorEmail(eventGuId, accountEmailIds, loginUserId)
      .subscribe((res: any) => {});
  }
  deleteMultipleDonorAddress(accountAddressIds) {
    var eventGuId = this.localstoragedataService.getLoginUserEventGuId();
    var loginUserId = this.localstoragedataService.getLoginUserId();
    var macAddress = this.localstoragedataService.getLoginUserGuid();
    this.donorService
      .deleteMultipleDonorAddress(
        accountAddressIds,
        loginUserId,
        eventGuId,
        macAddress
      )
      .subscribe((res: any) => {});
  }
  deleteMultipleDonorPhone(accountPhoneIds) {
    var eventGuId = this.localstoragedataService.getLoginUserEventGuId();
    var loginUserId = this.localstoragedataService.getLoginUserId();
    this.donorService
      .deleteMultipleDonorPhone(eventGuId, accountPhoneIds, loginUserId)
      .subscribe((res: any) => {});
  }
  deleteDonorAddress(i: number) {
    if (this.donorAddresses && this.donorAddresses.length > 0) {
      if (this.donorAddresses[i].isDefault) {
        this.donorAddresses = this.donorAddresses.map((item) => {
          if (item.addressLabel == "Home") {
            item.isDefault = true;
          }
          return item;
        });
      }
      this.isloading = true;
      let accountAddressId = this.donorAddresses[i].addressId;
      let eventGuId = this.localstoragedataService.getLoginUserEventGuId();
      let loginUserId = this.localstoragedataService.getLoginUserId();
      let macAddress = this.localstoragedataService.getLoginUserGuid();
      this.donorAddresses.splice(i, 1);
      this.donorService
        .deleteDonorAddress(
          accountAddressId,
          loginUserId,
          eventGuId,
          macAddress
        )
        .subscribe((res: any) => {
          this.isloading = false;
          this.changeDetectorRef.detectChanges();
          this.emtOutputEditDonor.emit(true);
        });
    }
  }
  removeErrorMsg(key: string) {
    this.formValid = true;
    this.lastNameJewishReq = false;
    this.lastNameReq = false;
    this.nameReq = false;
    this.nameJewishReq = false;
  }
  isPhoneZeroValidation(phoneLabel, PhoneID) {
    return this.isPhoneError && this.isErrorLable == phoneLabel;
  }
  checkZeroValidation(searchValue) {
    if (
      searchValue == "0000000000" ||
      searchValue == "00000000000" ||
      searchValue == "000000000000"
    ) {
      return true;
    }
    return false;
  }
  isEditLabelBtnDisable = false;
  editLableDyn(event, id) {
    event.preventDefault();
    event.stopPropagation();
    this.isEditLabelBtnDisable = true;
    this.editLabel = true;
    this.selectedLabelData = id;
    this.selectedLabel = id.labelName;
    this.hideEditTextBox();
  }
  addNewPhoneLabel(event) {
    event.preventDefault();
    event.stopPropagation();
    this.editLabel = false;
    this.addNewLabel = true;
    this.selectedLabel = "";
    this.hideEditTextBox();
  }
  editLabelData(event) {
    event.preventDefault();
    event.stopPropagation();
  }
  saveNewPhoneLabel(event, rdoBtnId = "") {
    event.preventDefault();
    event.stopPropagation();

    const found = this.phoneLabelArray.some(
      (el) => el.labelName.toLowerCase() == this.selectedLabel.toLowerCase()
    );
    if (found) {
      this.selectedLabelData;
      if (
        this.selectedLabelData.labelName.toLowerCase() !=
        this.selectedLabel.toLowerCase()
      ) {
        this.isListLabelExist = true;
      }
      this.isEditLabelBtnDisable = true;
      return false;
    }
    let obj;
    if (this.editLabel) {
      obj = {
        labelID: this.selectedLabelData.labelID,
        eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
        labelName: this.selectedLabel,
        labelType: this.selectedLabelData.labelType,
        createdBy: this.localstoragedataService.getLoginUserId(),
      };
    } else {
      obj = {
        eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
        labelName: this.selectedLabel,
        labelType: "Phone",
        createdBy: this.localstoragedataService.getLoginUserId(),
      };
    }
    this.commonAPIMethodService.saveLabelText(obj).subscribe((res: any) => {
      if (res) {
        this.getAllLabels(true);
        this.addNewLabel = false;
        this.changeDetectorRef.detectChanges();
        if (this.editLabel) {
          let rdoBtnIdChecked = $("#" + rdoBtnId).is(":checked");
          if (this.openPopup == "HomePhone" && rdoBtnIdChecked) {
            this.homephone[this.updateIndexId].phoneLabel = this.selectedLabel;
            $("#lblHomePhoneOpen_" + this.updateIndexId).text(
              this.homephone[this.updateIndexId].phoneLabel
            );
            $(".custom-radio-btn").hide();
          }
          if (this.openPopup == "cellPhone" && rdoBtnIdChecked) {
            this.cellphone[this.updateIndexId].phoneLabel = this.selectedLabel;
            $("#lblOpenCellPhonePopup_" + this.updateIndexId).text(
              this.cellphone[this.updateIndexId].phoneLabel
            );
            $(".custom-radio-btn").hide();
          }
        }
        this.editLabel = false;
        this.addNewLabel = false;
        this.selectedLabel = "";
        this.getAllLabels();
        if (!this.editLabel) {
          setTimeout(() => {
            this.checkboxes.forEach((element) => {
              element.nativeElement.checked = false;
            });
          }, 1000);
        }
      }
      event.preventDefault();
      event.stopPropagation();
    });
  }
  showHideLabelList(labelName) {
    if (labelName == "Home") {
      return false;
    }
    if (labelName && labelName.toLowerCase() == "cell") {
      return false;
    }
    if (labelName == "") {
      return false;
    }
    return true;
  }
  hideEditTextBox() {
    this.phoneLabelArray = this.phoneLabelArray.map((item) => {
      item.editVisable = false;
      return item;
    });
    this.emailLabelArray = this.emailLabelArray.map((item) => {
      item.editVisable = false;
      return item;
    });
    this.addressLabelArray = this.addressLabelArray.map((item) => {
      item.editVisable = false;
      return item;
    });
  }
  removeLableError() {
    $(".label-error").removeAttr("style");
    this.isEditLabelBtnDisable = false;
    return (this.isListLabelExist = false);
  }
  hideHomeCell(phoneLabel) {
    if (phoneLabel && phoneLabel.toLowerCase() == "home") {
      return false;
    }
    if (phoneLabel && phoneLabel.toLowerCase() == "cell") {
      return false;
    }
    return true;
  }
  hideHomeAddressCell(addressLabel) {
    if (addressLabel) {
      if (addressLabel.toLowerCase() == "home") {
        return false;
      }
    }
    return true;
  }
  hideHomeEmailCell(emailLabel) {
    if (emailLabel) {
      if (emailLabel.toLowerCase() == "home") {
        return false;
      }
    }
    return true;
  }
  isLabelExist(labelName) {
    if (labelName) {
      const found = this.homephone.some(
        (el) =>
          el.phoneLabel &&
          el.phoneLabel.toLowerCase() == labelName.toLowerCase()
      );
      if (found) {
        return "label-disable";
      }
      const found1 = this.cellphone.some(
        (el) =>
          el.phoneLabel &&
          el.phoneLabel.toLowerCase() == labelName.toLowerCase()
      );
      if (found1) {
        return "label-disable";
      }
    }
    return "";
  }
  isAddressLabelExist(labelName) {
    if (labelName) {
      const found = this.donorAddresses.some(
        (el) =>
          el.addressLabel &&
          el.addressLabel.toLowerCase() == labelName.toLowerCase()
      );
      if (found) {
        return "label-disable";
      }
    }
    return "";
  }
  isEmailLabelExist(labelName) {
    if (labelName) {
      const found = this.email.some(
        (el) =>
          el.emailLabel &&
          el.emailLabel.toLowerCase() == labelName.toLowerCase()
      );
      if (found) {
        return "label-disable";
      }
    }
    return "";
  }
  labelPopupOutsideClick(event) {
    if (this.isLabelNotSelected) {
      $(this.isLabelNotSelectedId).show();
    }
  }
  labelNullValidation() {
    this.formValid = true;
    this.cellphone = this.cellphone.map((x) => {
      if (!x.phoneLabel) {
        x.isLabelErrorMessage = true;
      }
      if (x.phoneLabel) {
        x.isLabelErrorMessage = false;
      }
      return x;
    });
    this.homephone = this.homephone.map((x) => {
      if (!x.phoneLabel) {
        x.isLabelErrorMessage = true;
      }
      if (x.phoneLabel) {
        x.isLabelErrorMessage = false;
      }
      return x;
    });
    this.email = this.email.map((x) => {
      if (!x.emailLabel) {
        x.isLabelErrorMessage = true;
      }
      if (x.emailLabel) {
        x.isLabelErrorMessage = false;
      }
      return x;
    });
    this.donorAddresses = this.donorAddresses.map((x) => {
      if (!x.addressLabel) {
        x.isLabelErrorMessage = true;
      }
      if (x.addressLabel) {
        x.isLabelErrorMessage = false;
      }
      return x;
    });
  }
  fieldsShortName(colName) {
    if (colName && colName.length > 14) {
      let colString = colName.substring(0, 10);
      colName = colString + "...";
      return colName;
    }
    return colName;
  }
  addNewAddressLabel(event) {
    event.preventDefault();
    event.stopPropagation();
    this.editAddressLabel = false;
    this.addNewLabel = true;
    this.selectedAddressLabel = "";
    this.hideEditTextBox();
  }
  saveNewAddressLabel(event, rdoBtnId = "") {
    event.preventDefault();
    event.stopPropagation();

    const found = this.addressLabelArray.some(
      (el) =>
        el.labelName &&
        el.labelName.toLowerCase() == this.selectedAddressLabel &&
        this.selectedAddressLabel.toLowerCase()
    );
    if (found) {
      this.selectedAddressLabelData;
      if (
        this.selectedAddressLabelData.labelName.toLowerCase() !=
        this.selectedAddressLabel.toLowerCase()
      ) {
        this.isAddressListLabelExist = true;
      }
      this.isAddressEditLabelBtnDisable = true;
      return false;
    }
    let obj;
    if (this.editAddressLabel) {
      obj = {
        labelID: this.selectedAddressLabelData.labelID,
        eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
        labelName: this.selectedAddressLabel,
        labelType: this.selectedAddressLabelData.labelType,
        createdBy: this.localstoragedataService.getLoginUserId(),
      };
    } else {
      obj = {
        eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
        labelName: this.selectedAddressLabel,
        labelType: "Address",
        createdBy: this.localstoragedataService.getLoginUserId(),
      };
    }
    this.commonAPIMethodService.saveLabelText(obj).subscribe((res: any) => {
      if (res) {
        if (this.editAddressLabel) {
          let rdoBtnIdChecked = $("#" + rdoBtnId).is(":checked");
          if (this.openPopup == "HomeAddress" && rdoBtnIdChecked) {
            this.donorAddresses[this.updateIndexId].addressLabel =
              this.selectedAddressLabel;
            $("#lblOpenHomeAddressPopup_" + this.updateIndexId).text(
              this.donorAddresses[this.updateIndexId].addressLabel
            );
            $(".custom-radio-btn").hide();
          }
        }
        this.editAddressLabel = false;
        this.addNewLabel = false;
        this.selectedAddressLabel = "";
        this.getAllLabels();
        if (!this.editAddressLabel) {
          setTimeout(() => {
            this.checkboxes.forEach((element) => {
              element.nativeElement.checked = false;
            });
          }, 1000);
        }
      }
      event.preventDefault();
      event.stopPropagation();
    });
  }
  addNewEmailLabel(event) {
    event.preventDefault();
    event.stopPropagation();
    this.editEmailLabel = false;
    this.addNewLabel = true;
    this.selectedEmailLabel = "";
    this.hideEditTextBox();
  }
  saveNewEmailLabel(event, rdoBtnId = "") {
    event.preventDefault();
    event.stopPropagation();

    const found = this.emailLabelArray.some(
      (el) =>
        el.labelName &&
        el.labelName.toLowerCase() == this.selectedEmailLabel.toLowerCase()
    );
    if (found) {
      this.selectedEmailLabelData;
      if (
        this.selectedEmailLabelData.labelName.toLowerCase() !=
        this.selectedEmailLabel.toLowerCase()
      ) {
        this.isEmailListLabelExist = true;
      }
      this.isEmailEditLabelBtnDisable = true;
      return false;
    }
    let obj;
    if (this.editEmailLabel) {
      obj = {
        labelID: this.selectedEmailLabelData.labelID,
        eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
        labelName: this.selectedEmailLabel,
        labelType: this.selectedEmailLabelData.labelType,
        createdBy: this.localstoragedataService.getLoginUserId(),
      };
    } else {
      obj = {
        eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
        labelName: this.selectedEmailLabel,
        labelType: "Email",
        createdBy: this.localstoragedataService.getLoginUserId(),
      };
    }
    this.commonAPIMethodService.saveLabelText(obj).subscribe((res: any) => {
      if (res) {
        if (this.editEmailLabel) {
          let rdoBtnIdChecked = $("#" + rdoBtnId).is(":checked");
          if (this.openPopup == "HomeEmail" && rdoBtnIdChecked) {
            this.email[this.updateIndexId].emailLabel = this.selectedEmailLabel;
            $("#lblOpenEmailPopup_" + this.updateIndexId).text(
              this.email[this.updateIndexId].emailLabel
            );
            $(".custom-radio-btn").hide();
          }
        }
        this.editEmailLabel = false;
        this.addNewLabel = false;
        this.selectedEmailLabel = "";
        this.getAllLabels();
        if (!this.editEmailLabel) {
          setTimeout(() => {
            this.checkboxes.forEach((element) => {
              element.nativeElement.checked = false;
            });
          }, 1000);
        }
      }
      event.preventDefault();
      event.stopPropagation();
    });
  }
  EmailDynRadioDisplayValue(item: any, id: any, labelName: any) {
    item.target.checked = true;
    this.isLabelNotSelected = false;
    this.email[id].emailLabel = labelName;
    this.email[id].textEmailAddress = null;

    this.OpenEmailPopup(id);
    $(".custom-radio-btn").hide();
    this.labelNullValidation();
  }
  editEmailLabelDyn(event, id) {
    event.preventDefault();
    event.stopPropagation();
    this.isEmailEditLabelBtnDisable = true;
    this.editEmailLabel = true;
    this.selectedEmailLabelData = id;
    this.selectedEmailLabel = id.labelName;
    this.hideEditTextBox();
  }
  removeEmailLabelError() {
    $(".label-error").removeAttr("style");
    this.isEmailEditLabelBtnDisable = false;
    return (this.isEmailListLabelExist = false);
  }
  removeAddressLabelError() {
    $(".label-error").removeAttr("style");
    this.isAddressEditLabelBtnDisable = false;
    return (this.isAddressListLabelExist = false);
  }
  editAddressLabelDyn(event, id) {
    event.preventDefault();
    event.stopPropagation();
    this.isAddressEditLabelBtnDisable = true;
    this.editAddressLabel = true;
    this.selectedAddressLabelData = id;
    this.selectedAddressLabel = id.labelName;
    this.hideEditTextBox();
  }
  AddressDynRadioDisplayValue(item: any, id: any, labelName: any) {
    item.target.checked = true;
    this.isLabelNotSelected = false;
    this.donorAddresses[id].addressLabel = labelName;
    this.donorAddresses[id].textAddressLabel = null;

    this.OpenHomeAddressPopup(id);
    $(".custom-radio-btn").hide();
    this.labelNullValidation();
  }
  // globel search
  showBoxFather = false;
  SearchDonorFatherNew(event) {
    if (event == "") {
      this.commonMethodService.donorList = [];
    }
    if (event.target.value.length > 2) {
      if ($("#globallist").is(":checked")) {
        this.showBoxFather = false;
        if (event.keyCode === 13) {
          this.isGlobalList = true;
          this.showBoxFather = true;
          this.commonMethodService.onDonorSearchFieldChange(
            event.target.value,
            true
          );
        }
      } else {
        this.showBoxFather = true;
        this.isGlobalList = false;
        this.search(event.target.value);
      }
    }
    if (event.target.value.length > 6) {
      this.showBoxFather = false;
    }
  }
  displaySearchIconFather = false;
  SelectDonorFather(accountId) {
    this.showBoxFather = false;
    this.displaySearchIconFather = false;
    this.commonMethodService.donorList =
      this.commonMethodService.donorList.filter((s) => s.id == accountId);
    this.isRemoveFather = true;
    this.selectedFatherId = accountId;
    this.fatherId = accountId;
    this.father = this.commonMethodService.donorList[0].fullNameJewish
      ? this.commonMethodService.donorList[0].fullNameJewish
      : this.commonMethodService.donorList[0].displayText;
  }
  OnGlobalCheckboxChangeFather(event) {
    if (event.target.checked) {
      this.displaySearchIconFather = true;
    } else {
      this.displaySearchIconFather = false;
    }
  }
  isRemoveFather = false;
  RemoveFather() {
    this.nonFatherEditable = false;
    this.selectedFatherId = -1;
    this.fatherId = null;
    this.isRemoveFather = false;
    this.father = "";
  }
  searchGlobalFatherDonar() {
    this.isGlobalList = true;
    var text = $("#txtFatherName").val();
    this.showBoxFather = true;
    this.commonMethodService.onDonorSearchFieldChange(text, true);
  }

  showBoxFatherInLaw = false;
  SearchDonorFatherInLawNew(event) {
    if (event == "") {
      this.commonMethodService.donorList = [];
    }
    if (event.target.value.length > 2) {
      if ($("#globallistfatherInLaw").is(":checked")) {
        this.showBoxFatherInLaw = false;
        if (event.keyCode === 13) {
          this.isGlobalList = true;
          this.showBoxFatherInLaw = true;
          this.commonMethodService.onDonorSearchFieldChange(
            event.target.value,
            true
          );
        }
      } else {
        this.showBoxFatherInLaw = true;
        this.isGlobalList = false;
        this.search(event.target.value);
      }
    }
    if (event.target.value.length > 6) {
      this.showBoxFatherInLaw = false;
    }
  }
  isRemoveFatherInLaw = false;
  RemoveFatherInLaw() {
    this.nonFatherInLawEditable = false;
    this.selectedFatherinLaw = -1;
    this.fatherInLawId = null;
    this.isRemoveFatherInLaw = false;
    this.fatherInLaw = "";
  }
  displaySearchIconFatherInLaw = false;
  searchGlobalFatherDonarInLaw() {
    this.isGlobalList = true;
    var text = $("#txtFatherInLawName").val();
    this.showBoxFatherInLaw = true;
    this.commonMethodService.onDonorSearchFieldChange(text, true);
  }
  OnGlobalCheckboxChangeFatherInLaw(event) {
    if (event.target.checked) {
      this.displaySearchIconFatherInLaw = true;
    } else {
      this.displaySearchIconFatherInLaw = false;
    }
  }

  SelectDonorFatherInLaw(accountId) {
    this.showBoxFatherInLaw = false;
    this.displaySearchIconFatherInLaw = false;
    this.commonMethodService.donorList =
      this.commonMethodService.donorList.filter((s) => s.id == accountId);

    this.isRemoveFatherInLaw = true;
    this.selectedFatherinLaw = accountId;
    this.fatherInLawId = accountId;
    this.fatherInLaw = this.commonMethodService.donorList[0].fullNameJewish
      ? this.commonMethodService.donorList[0].fullNameJewish
      : this.commonMethodService.donorList[0].displayText;
  }
  // globel search

  //code for add new member started
  SearchDonorNew(event, familyGlobalList, familyIndex: number) {
    if (event == "") {
      this.commonMethodService.donorList = [];
    }
    if (event.target.value.length > 2) {
      this.familiesInput[familyIndex].isDynamicTextAdding = true;
      this.familiesInput[familyIndex].isSelectDynamicDonar = false;
      if ($("#" + familyGlobalList).is(":checked")) {
        this.familiesInput[familyIndex].isShowBox = false;
        if (event.keyCode === 13) {
          this.isGlobalList = true;
          this.familiesInput[familyIndex].isShowBox = true;
          this.commonMethodService.onDonorSearchFieldChange(
            event.target.value,
            true
          );
        }
      } else {
        this.familiesInput[familyIndex].isShowBox = true;
        this.isGlobalList = false;
        this.search(event.target.value);
      }
    }
  }

  isDisableSaveButton() {
    for (let i = 0; i < this.familiesInput.length; i++) {
      if (
        !this.familiesInput[i].isSelectDynamicDonar &&
        this.familiesInput[i].isDynamicTextAdding
      ) {
        return true;
      }
    }
  }

  RemoveDonor(familyIndex: number, event: Event) {
    event.stopPropagation(); // Prevent the event from propagating to parent elements
    this.selectedFatherinLaw = -1;
    this.fatherInLawId = null;

    if (this.familiesInput[familyIndex].familyName !== "") {
      // Clear the family name for the selected family
      this.familiesInput[familyIndex].familyName = "";
      this.familiesInput[familyIndex].showCancelIcon = false;
    }
  }

  searchGlobalDonar(familyNameInputName, familyIndex: number) {
    this.isGlobalList = true;
    var text = $("#" + familyNameInputName).val();
    this.familiesInput[familyIndex].isShowBox = true;
    this.commonMethodService.onDonorSearchFieldChange(text, true);
  }

  OnGlobalCheckbox(event, familyIndex: number) {
    if (event.target.checked) {
      this.familiesInput[familyIndex].isDisplaySearchIcon = true;
    } else {
      this.familiesInput[familyIndex].isDisplaySearchIcon = false;
    }
  }

  SelectDonor(accountId, familyIndex: number) {
    this.familiesInput[familyIndex].isSelectDynamicDonar =
      !this.familiesInput[familyIndex].isSelectDynamicDonar;
    for (let i = 0; i < this.familiesInput.length; i++) {
      this.familiesInput[i].isShowBox = false;
    }
    this.commonMethodService.donorList =
      this.commonMethodService.donorList.filter((s) => s.id == accountId);

    // Update the familyName property only for the selected family
    this.familiesInput[familyIndex].familyName =
      this.commonMethodService.donorList[0].displayText == ""
        ? this.commonMethodService.donorList[0].fullNameJewish
        : this.commonMethodService.donorList[0].displayText;

    this.familiesInput[familyIndex].accountId = accountId;
    this.familiesInput[familyIndex].showCancelIcon = true;
    this.familiesInput[familyIndex].isDisplaySearchIcon = false;
  }

  getHebrewWord(englishName: string): string | null {
    return this.englishToHebrewMap[englishName] || null;
  }

  areAllDropdownsSelected(): boolean {
    let isNull = this.familiesInput.filter((e) => e.selectedValue == null);
    if (isNull.length > 0) {
      return isNull[0].selectedValue == null ? false : true;
    } else {
      return true;
    }
  }

  onClickedOutsideAdvance(index) {
    this.advancedFieldValues.forEach((element, i) => {
      if (i === index) {
        element.advancedDropdownMenu = false;
      }
    });
  }

  onClickedOutsideTag(index) {
    this.donorTagList.forEach((element, i) => {
      if (i === index) {
        element.tagsDropdownMenu = false;
      }
    });
  }
  //code for add new member ended
  advancedDropdown(index) {
    this.advancedFieldValues.forEach((element, i) => {
      if (i === index) {
        element.advancedDropdownMenu = true;
      } else {
        element.advancedDropdownMenu = false;
      }
    });
  }
  tagsDropdown(index) {
    this.donorTagList.forEach((element, i) => {
      if (i === index) {
        element.tagsDropdownMenu = true;
      } else {
        element.tagsDropdownMenu = false;
      }
    });
  }

  clearAddress(event, i) {
    const key = event.keyCode || event.charCode;
    if (key === 8 || key === 46) {
      this.donorAddresses[i].houseNum = "";
      this.donorAddresses[i].street = "";
    }
  }
  AddressesCheckNullContaint() {
    const result = this.donorAddresses.filter((e) => e.addressLabel == "Home");
    const homeAddress = result && result.length > 0 && result[0];
    if (
      homeAddress &&
      this.isEmptyOrSpaces(homeAddress.houseNum) &&
      this.isEmptyOrSpaces(homeAddress.street) &&
      this.isEmptyOrSpaces(homeAddress.unit) &&
      this.isEmptyOrSpaces(homeAddress.city) &&
      this.isEmptyOrSpaces(homeAddress.state) &&
      this.isEmptyOrSpaces(homeAddress.zip)
    ) {
      this.donorAddresses = this.donorAddresses.filter(
        (e) => e.addressLabel != "Home"
      );
    }
  }
  isEmptyOrSpaces(str) {
    return str === null || str.match(/^ *$/) !== null;
  }

  getFeatureSettingValues() {
    this.commonMethodService.featureName = "Add_new_donor";
    this.commonMethodService.getFeatureSettingValues();
  }

  onUpgrade(e: Event) {
    e.preventDefault();
    e.stopPropagation();
    // this.activeModal.dismiss();
    this.commonMethodService.commenSendUpgradeEmail(
      this.commonMethodService.featureDisplayName
    );
  }
}
