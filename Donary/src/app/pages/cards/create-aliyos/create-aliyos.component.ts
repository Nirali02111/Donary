import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import {
  NgbActiveModal,
  NgbModalOptions,
  NgbModalRef,
  NgbPopover,
} from "@ng-bootstrap/ng-bootstrap";
import * as moment from "moment";
import { DaterangepickerDirective } from "ngx-daterangepicker-material";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { CommonAPIMethodService } from "src/app/services/common-api-method.service";
import { DonorService } from "src/app/services/donor.service";
import { HebrewEngishCalendarService } from "src/app/services/hebrew-engish-calendar.service";
import { PledgeService } from "src/app/services/pledge.service";
import Swal from "sweetalert2";
import { PledgeGroupService } from "src/app/services/pledge-group.service";
import { DonorSaveComponent } from "../../donor/donor-save/donor-save.component";
import { Subscription } from "rxjs";
import { environment } from "src/environments/environment";
import { MessengerService } from "src/app/services/messenger.service";
import { PhoneNumberPopupComponent } from "../../make-transaction/phone-number-popup/phone-number-popup.component";
import { EmailAddressPopupComponent } from "../../make-transaction/email-address-popup/email-address-popup.component";

declare var $: any;
interface PledgeData {
  selectedOptionEmail: string;
  selectedOptionLabel: string;
  selectedIndex: number;
}

interface PledgeSmsData {
  selectedOptionSms: number;
  selectedOptionLabel: string;
  selectedIndex: number;
}

@Component({
  selector: "app-create-aliyos",
  templateUrl: "./create-aliyos.component.html",
  styleUrls: ["./create-aliyos.component.scss"],
  standalone: false,
})
export class CreateAliyosComponent implements OnInit {
  @Output() emtOutputAliyos: EventEmitter<any> = new EventEmitter();
  aliyaCampaignId: number;
  PledgeID: any;
  isGlobalCheckboxchecked: boolean = false;
  current_j: any;

  skeletonitems = [{}, {}];
  phoneData2: any = [];
  parentPledgesWithAliyaNameId10Length: any;
  @Input() set AliyosData(AliyosValue: any) {
    if (AliyosValue) {
      this.groupTitle = AliyosValue.groupTitle;
      this.selectedDateRange.startDate = AliyosValue.aliyosDate.englishDate;
      this.selectedDateRange.endDate = AliyosValue.aliyosDate.englishDate;
      this.selectedCampaign = AliyosValue.campaignId;
      if (this.selectedCampaign.length > 0) {
        this.isDefaultCampaignReq = false;
      }
    }
  }

  @Input() set data(item) {
    if (item) {
      this.isEditAliyos = true;
      this.groupId = item.groupID;

      if (this.commonMethodService.localCampaignList.length == 0) {
        this.commonMethodService.getCampaignList();
      }
      if (this.commonMethodService.localDonorList.length == 0) {
        this.commonMethodService.getDonorList();
      }
      this.getPledgeAliyaTypes();
      this.getAliaGroup();
    }
  }

  private changeDonorPopupRef: NgbModalRef | undefined;
  private saveChangePopupRef: NgbModalRef | undefined;

  aliyosDate: string;
  groupTitle: string;

  isOpenFirst: boolean = false;
  isOpenSecond: boolean = false;
  isOpenThird: boolean = false;
  isOpenFourth: boolean = false;
  modalOptions: NgbModalOptions;
  selectedCampaign: Array<any> = [];
  selectedAliyaNames: Array<any> = [];
  pledgeAliyaNames: Array<any> = [];
  count: number = 0;
  count2: number = 0;
  shortLink: string = "";
  loading: boolean = false;
  pledgeAliyaTotal: number = 0;
  isDonorNameReq: boolean = false;
  pledgeAliyaTypes: Array<any> = [];
  selectedDonor1: Array<any> = [];
  donorList: Array<any> = [];
  isloading: boolean = true;
  selectedItem = -1;
  isDefaultCampaignReq = false;
  isGroupDateReq = false;
  selecteditems: any = [];
  selectHosafa: any = [];
  showBox = -1;
  isExpand = -1;
  isExpandShebirach = -1;
  isExpandShebirach2 = -1;

  isExpandHosafa1 = -1;
  isExpandHosafa2 = -1;
  isExpanded: number;
  ShebirachOpen1: boolean = false;
  ShebirachOpen2: boolean = false;
  HosafaOpen1: boolean = false;
  HosafaOpen2: boolean = false;
  isGlobalList: boolean = true;
  showForm: boolean = false;
  hosafacount = 0;
  nonEditable = -1;
  nonEditable2 = 2;
  showBox2 = -2;
  isGlobalList2: boolean = true;
  displaySearchIcon = -10000000;
  displaySearchIcon2 = -100000;

  selectedDateRange: any = { startDate: null, endDate: null };
  commondonorList: any;
  headers: any;
  body: any;

  isAddPhoneDisable: boolean = false;

  EngHebCalPlaceholder: string = "All Time";
  class_id: string;
  class_hid: string;

  email: string;
  label: string;
  emailPledge: boolean = true;
  isEmailPledge: boolean = true;

  isAddEmailButtonDisabled: boolean = false;

  phone: string;
  phoneLabel: string;
  phoneNotify: boolean = false;

  emailData: any[] = [];
  phoneData: any[] = [];
  accountId: Int32Array;
  pledgeAliya: Array<any> = [];
  pledgeAliyaType: Array<any> = [];
  pledgeId: number;
  jIndexPos: number;
  isClearSection: boolean = false;
  isRemoveDonor: boolean = false;
  isRemoveDonor2: boolean = false;
  groupId: number;
  aliyaPledges = [];

  dropdownOptions: any[] = [];
  isDropdownOpen: boolean[] = [];
  isDropdownOpen1: boolean[] = [];
  pledgeData: PledgeData[] = [];
  pledgeData1: PledgeData[] = [];
  pledgeSmsData: PledgeSmsData[] = [];
  pledgeSmsData1: PledgeSmsData[] = [];
  isSmsDropdownOpen: boolean[] = [];
  isSmsDropdownOpen1: boolean[] = [];
  isCalendarDisabled: boolean = false;
  isDevEnv: boolean;
  isEditAliyos: boolean = false;
  pledgeStatus: string;
  isSavedChanges: boolean = false;

  accId: any;

  isDonorSelected: boolean[] = [];
  isDonorSelected1: boolean[] = [];

  private calendarSubscription: Subscription;
  @ViewChild(NgbPopover, { static: false }) popContent: NgbPopover;
  PageName: any = "CreateAliyos";
  popTitle: any;
  isOneDate: any = true;

  pledges: any[] = [
    {
      campaignId: 0,
      accountId: 0,
      amount: 0,
      pledgeDate: "",
      aliyaTypeId: 0,
      aliyaNameId: 0,
      externalNote: "",
      notifyPhoneId: 0,
      notifyEmailId: 0,
      notifyPhone: "",
      notifyEmail: "",
    },
  ];

  @ViewChild(DaterangepickerDirective, { static: false })
  pickerDirective: DaterangepickerDirective;

  constructor(
    public activeModal: NgbActiveModal,
    public commonAPIMethodService: CommonAPIMethodService,
    private localstoragedataService: LocalstoragedataService,
    private pledgeService: PledgeService,
    public commonMethodService: CommonMethodService,
    public donorService: DonorService,
    public elementRef: ElementRef,
    public hebrewEngishCalendarService: HebrewEngishCalendarService,
    private pledgeGroupService: PledgeGroupService,
    private plegeGroupListService: PledgeGroupService,
    private messengerService: MessengerService
  ) {}

  ngOnInit() {
    this.commonMethodService.getSettings();
    this.isDevEnv = environment.baseUrl.includes("https://dev-api.donary.com/");

    if (this.commonMethodService.localCampaignList.length == 0) {
      this.commonMethodService.getCampaignList();
    }
    var selectedSaturday;
    if (
      this.selectedDateRange.startDate == null ||
      this.selectedDateRange.endDate == null
    ) {
      selectedSaturday = moment(new Date());
      while (selectedSaturday.day() !== 6) {
        selectedSaturday.subtract(1, "day");
      }
      this.selectedDateRange.startDate = selectedSaturday;
      this.selectedDateRange.endDate = selectedSaturday;
      selectedSaturday = moment(selectedSaturday)
        .format("YYYY-MM-DD")
        .toString();
    }
    selectedSaturday = this.selectedDateRange.startDate;
    let selectedDate = moment(this.selectedDateRange.startDate)
      .format("YYYY-MM-DD")
      .toString();
    this.EngHebCalPlaceholder = selectedSaturday;
    if (!this.isEditAliyos) {
      this.commonAPIMethodService.GetPledgeAliyaNames(selectedDate).subscribe(
        (res: any) => {
          if (res) {
            this.pledgeAliya = res;
            this.pledgeAliyaTotal = this.pledgeAliya.length;
            for (var i = 0; i < this.pledgeAliya.length; i++) {
              this.isloading = true;
              this.pledgeAliyaNames.push({
                itemName: this.pledgeAliya[i].aliyaName,
                itemName5: "עלה",
                itemName2: "מי שברך",
                id: this.pledgeAliya[i].aliyaNameId,
                accountId: null,
                amount: "",
                note1: "עלה " + this.pledgeAliya[i].aliyaName,
                note: "עלה " + this.pledgeAliya[i].aliyaName,
                note2: "מי שברך" + " " + this.pledgeAliya[i].aliyaName,
                note3: "מי שברך" + " " + this.pledgeAliya[i].aliyaName,
                pledgeDate: "",
                aliyaTypeId: 2,
                donorname: "",
                aliyaNameId: this.pledgeAliya[i].aliyaNameId,
                nonEditable: -99,
                displaySearchIcon: -99,
                nonEditable2: -22,
                displaySearchIcon2: -22,
                expandShebirach1: [],
                expandShebirach2: [],
                emailNotify: false,
                phoneNotify: false,
                emailNotify1: false,
                phoneNotify1: false,
                notifyPhoneId: 0,
                notifyEmailId: 0,
                notifyPhone: "",
                notifyEmail: "",
                notifyPhoneId1: 0,
                notifyEmailId1: 0,
                notifyPhone1: "",
                notifyEmail1: "",
                childAmount: "",
                childNote: "עלה " + this.pledgeAliya[i].aliyaName,
                firstDonorEmailData: [],
                secondDonorEmailData: [],
                campaign1: this.selectedCampaign,
                childCampaign1: this.selectedCampaign,
                isCampaign1Selected: false,
                isGlobalCheckboxchecked: false,
              });
            }

            this.isloading = false;
          }
        },
        () => {}
      );

      this.getPledgeAliyaTypes();
    }

    if (this.commonMethodService.localCampaignList.length == 0) {
      this.commonMethodService.getCampaignList();
    }
    if (this.commonMethodService.localDonorList.length == 0) {
      this.commonMethodService.getDonorList();
    }
    this.commonMethodService.formatAmount(0);
  }

  UpdateNotes(i, pledge) {
    if (i == 1) {
      this.pledgeAliyaNames.forEach((element) => {
        if (element.id == pledge.id) {
          const noteName = element.itemName;
          if (
            pledge.note1.includes(noteName) &&
            pledge.note1 == `עלה ${element.itemName}`
          ) {
            element.note1 = `קנה ${element.itemName}`;
            element.isGlobalCheckboxchecked2 = false;
          } else {
            element.note1 = pledge.note1;
            element.isGlobalCheckboxchecked2 = false;
          }
        }
      });
    } else {
      this.pledgeAliyaNames.forEach((element) => {
        if (element.id == pledge.id) {
          const noteName = element.itemName;
          if (
            pledge.note1.includes(noteName) &&
            pledge.note1 == `קנה ${element.itemName}`
          ) {
            element.note1 = `עלה ${element.itemName}`;
            element.isGlobalCheckboxchecked2 = false;
          } else {
            element.note1 = pledge.note1;
            element.isGlobalCheckboxchecked2 = false;
          }
          // element.note1 = "עלה " + element.itemName
          // element.childNote = "עלה " + element.itemName
        }
      });
    }
  }

  onCampaignSelect(selectCampaign) {
    if (selectCampaign) {
      // Update campaign1 and childCampaign1 properties in each object of pledgeAliyaNames
      this.pledgeAliyaNames.forEach((item) => {
        if (!item.isCampaign1Selected) {
          item.campaign1 = selectCampaign;
          item.childCampaign1 = selectCampaign;
        }
      });
    }
    if (selectCampaign.length > 0) {
      this.isDefaultCampaignReq = false;
    }
  }

  OnCampaignDeSelect(event) {
    this.isDefaultCampaignReq = true;
    this.selectedCampaign = [];
  }
  SearchGlobalDonor(j) {
    this.commonMethodService.isglobalSearchApiCall = true;

    this.isGlobalList = true;
    var text = $("#donorText_" + j).val();
    if (text != "") {
      this.showBox = j;
      this.commonMethodService.onDonorSearchFieldChange(text, true);
    }
  }

  ExpandOptions(j) {
    // if(p==1)
    // {
    this.isExpanded = j;
    //  }
  }
  AddMiShebirach(j, aliyaNameId) {
    this.isExpandShebirach = j;
    if (this.isExpandShebirach == j) {
      this.ShebirachOpen1 = true;
    }
    this.pledgeAliyaNames.forEach((element) => {
      if (aliyaNameId == element.aliyaNameId) {
        element.expandShebirach1.push({
          amount3: "",
          note2: "",
          campaign2: this.selectedCampaign,
        });
      }
    });
  }

  AddMiShebirach2(j, aliyaNameId) {
    this.isExpandShebirach2 = j;
    if (this.isExpandShebirach2 == j) {
      this.ShebirachOpen2 = true;
    }
    this.pledgeAliyaNames.forEach((element) => {
      if (aliyaNameId == element.aliyaNameId) {
        element.expandShebirach2.push({
          amount4: "",
          note3: "",
          campaign4: this.selectedCampaign,
        });
      }
    });
  }

  AddHosafa1(j) {
    this.isExpandHosafa1 = j;
    if (this.isExpandHosafa1 == j) {
      this.HosafaOpen1 = true;
    }
    if (this.HosafaOpen1 == true) {
      this.hosafacount += 1;
      let index = this.pledgeAliyaNames.findIndex(
        (pledge) => pledge.aliyaNameId == 9
      );
      this.pledgeAliyaNames.splice(index, 0, {
        itemName: `#${this.hosafacount} הוספה`,
        itemName5: "עלה",
        id: 10,
        accountId: null,
        amount: "",
        note1: `${this.hosafacount} עלה הוספה`,
        note: `${this.hosafacount} עלה הוספה`,
        aliyaTypeId: 2,
        hosafacount: this.hosafacount,
        campaign1: this.selectedCampaign,
      });

      Swal.fire({
        title: "",
        text: "The הוספה was added in the Bottom before מפטיר",
        icon: "success",
        confirmButtonText: this.commonMethodService.getTranslate(
          "WARNING_SWAL.BUTTON.CONFIRM.OK"
        ),
        customClass: {
          confirmButton: "btn_ok",
        },
      });
    }
  }

  contains_heb(str) {
    return /[\u0590-\u05FF]/.test(str);
  }

  OpenCreateDonorPopup(donorname, item, j, radioBtn) {
    var aliyaNameId = item.aliyaNameId;
    var aliyaTypeId = item.aliyaTypeId;
    var hosafacount;
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
    var ishebrew = this.contains_heb(donorname);
    if (ishebrew) {
      var jewish = donorname;
    } else {
      var english = donorname;
    }
    modalRef.componentInstance.DonorName = {
      jewishName: jewish,
      englishName: english,
    };
    modalRef.componentInstance.emtOutputDonorTransaction.subscribe(
      (response) => {
        if (radioBtn == 1) {
          this.pledgeAliyaNames.forEach((element) => {
            if (
              element.aliyaNameId == aliyaNameId &&
              element.aliyaTypeId == aliyaTypeId
            ) {
              element.nonEditable = j;
              if (j == 0) {
                element.displaySearchIcon = -99;
              } else {
                element.displaySearchIcon = -j;
              }
              if (
                element.hosafacount == undefined ||
                element.hosafacount == hosafacount
              ) {
                element.donorname = response.fullNameJewish
                  ? response.fullNameJewish
                  : response.fullName;
                element.accountId = response.accountId;
                element.isDonorNameReq = false;
                element.isDonorNameSel = false;
              }
            }
          });
        }
        if (radioBtn == 2) {
          this.pledgeAliyaNames.forEach((element) => {
            if (element.aliyaNameId == aliyaNameId) {
              element.nonEditable2 = j;
              if (j == 0) {
                element.displaySearchIcon2 = -22;
              } else {
                element.displaySearchIcon2 = -j;
              }
              if (
                element.hosafacount == undefined ||
                element.hosafacount == hosafacount
              ) {
                element.selectedDonor2 = response.fullNameJewish
                  ? response.fullNameJewish
                  : response.fullName;
                element.accountId2 = response.accountId;
                element.isDonorName2Req = false;
                element.isDonorName2Sel = false;
              }
            }
          });
        }
      }
    );
  }

  AddHosafa2(j) {
    this.isExpandHosafa2 = j;
    if (this.isExpandHosafa2 == j) {
      this.HosafaOpen2 = true;
    }
    if (this.HosafaOpen2 == true) {
      this.hosafacount += 1;
      let index = this.pledgeAliyaNames.findIndex(
        (pledge) => pledge.aliyaNameId == 9
      );

      this.pledgeAliyaNames.splice(index, 0, {
        itemName: `#${this.hosafacount} הוספה`,
        itemName5: "עלה",
        id: 10,
        accountId2: null,
        amount2: "",
        note3: "עלה הוספה",
        note: "עלה הוספה",
        aliyaTypeId: 2,
      });
      this.pledgeAliyaNames.sort((a, b) => a.aliyaNameId - b.aliyaNameId);
      Swal.fire({
        title: "",
        text: "The הוספה was added in the Bottom before מפטיר",
        icon: "success",
        confirmButtonText: this.commonMethodService.getTranslate(
          "WARNING_SWAL.BUTTON.CONFIRM.OK"
        ),
        customClass: {
          confirmButton: "btn_ok",
        },
      });
    }
  }

  clearSection(j, accountId, content, pledgeStatus) {
    if (this.isEditAliyos) {
      this.pledgeId = accountId;
      this.pledgeStatus = pledgeStatus;
      this.jIndexPos = j;
      this.isClearSection = true;
      this.changeDonorPopupRef = this.commonMethodService.openPopup(content, {
        centered: true,
        backdrop: "static",
        keyboard: false,
        windowClass: "modal-popup modal-donor-change",
        size: "md",
        scrollable: true,
      });
    } else {
      this.clearData(j);
    }
  }

  clearData(j) {
    this.pledgeAliyaNames[j].note1 = null;
    this.pledgeAliyaNames[j].note2 = null;
    this.pledgeAliyaNames[j].campaign1 = null;
    this.pledgeAliyaNames[j].childCampaign1 = null;
    this.pledgeAliyaNames[j].campaign2 = null;
    this.pledgeAliyaNames[j].accountId = null;
    this.pledgeAliyaNames[j].amount = null;
    this.pledgeAliyaNames[j].childAmount = null;
    this.pledgeAliyaNames[j].donorname = [];
    this.pledgeAliyaNames[j].displaySearchIcon = -99;
    this.pledgeAliyaNames[j].nonEditable = -99;
    this.pledgeAliyaNames[j].childNote = null;
  }

  clearSection2(j) {
    this.pledgeAliyaNames[j].note = null;
    this.pledgeAliyaNames[j].note3 = null;
    this.pledgeAliyaNames[j].campaign3 = null;
    this.pledgeAliyaNames[j].campaign4 = null;
    this.pledgeAliyaNames[j].accountId2 = null;
    this.pledgeAliyaNames[j].amount2 = null;
    this.pledgeAliyaNames[j].selectedDonor2 = [];
    this.pledgeAliyaNames[j].displaySearchIcon2 = -22;
    this.pledgeAliyaNames[j].nonEditable2 = -22;
  }

  onClickedOutside(j) {
    if (this.count == 1) {
      this.showBox = -9999;
      this.count = 0;
    } else {
      this.showBox = j;
      this.count = 1;
    }
  }

  SearchGlobalDonor2(j) {
    this.commonMethodService.isglobalSearchApiCall2 = true;

    this.isGlobalList2 = true;
    let text = $("#donorText2_" + j).val();
    if (text != "") {
      this.showBox2 = j;
      this.commonMethodService.onDonorSearchFieldChange(text, true);
    }
  }
  onClickedOutside2(j) {
    if (this.count2 == 1) {
      this.showBox2 = -9999;
      this.count2 = 0;
    } else {
      this.showBox2 = j;
      this.count2 = 1;
    }
  }

  SelectDonor(
    accountId,
    aliyaNameId,
    aliyaTypeId,
    j,
    hosafacount,
    isAddedFromCard,
    resValue = null
  ) {
    if (j == 0) {
      this.showBox = -9999;
    } else {
      this.showBox = -j;
    }

    this.isDonorSelected[j] = true;
    this.accId = accountId;
    this.GetEmailList(j, "donor1");

    this.getDonorPhoneList(accountId, "donor1");
    if (isAddedFromCard) {
      this.commonMethodService.donorList = [resValue];
    } else {
      this.commonMethodService.donorList =
        this.commonMethodService.donorList.filter((s) => s.id == accountId);
    }
    this.pledgeAliyaNames.forEach((element) => {
      if (
        element.aliyaNameId == aliyaNameId &&
        element.aliyaTypeId == aliyaTypeId
      ) {
        element.nonEditable = j;
        if (j == 0) {
          element.displaySearchIcon = -99;
        } else {
          element.displaySearchIcon = -j;
        }

        if (
          element.hosafacount == undefined ||
          element.hosafacount == hosafacount
        ) {
          element.donorname = this.commonMethodService.donorList[0]
            .fullNameJewish
            ? this.commonMethodService.donorList[0].fullNameJewish
            : this.commonMethodService.donorList[0].displayText;
          element.accountId = this.commonMethodService.donorList[0].accountId;
          element.isDonorNameReq = false;
          element.isDonorNameSel = false;
        }

        if (this.emailPledge) {
          if (!this.commonMethodService.isDisableAutomaticPledge) {
            element.emailNotify = false;
          } else {
            element.emailNotify = true;
          }
        }
      }
    });
  }

  DonorRequired(aliyaNameId, aliyaTypeId, value, hosafacount, j) {
    if (value) {
      if (value.length > 2) {
        this.pledgeAliyaNames.forEach((element) => {
          if (
            element.aliyaNameId == aliyaNameId &&
            element.aliyaTypeId == aliyaTypeId &&
            element.accountId == null
          ) {
            if (
              element.hosafacount == undefined ||
              element.hosafacount == hosafacount
            ) {
              element.isDonorNameSel = true;
            }
          }
        });
      } else {
        this.pledgeAliyaNames.forEach((element) => {
          if (
            element.aliyaNameId == aliyaNameId &&
            element.aliyaTypeId == aliyaTypeId &&
            element.accountId == null
          ) {
            if (
              element.hosafacount == undefined ||
              element.hosafacount == hosafacount
            ) {
              element.isDonorNameSel = false;
            }
          }
        });
      }
    }
  }

  Donor2Required(aliyaNameId, aliyaTypeId, value, hosafacount) {
    if (value) {
      if (value != "") {
        this.pledgeAliyaNames.forEach((element) => {
          if (
            element.aliyaNameId == aliyaNameId &&
            element.aliyaTypeId == aliyaTypeId &&
            (!element.accountId2 || element.accountId2 == undefined)
          ) {
            if (
              element.hosafacount == undefined ||
              element.hosafacount == hosafacount
            ) {
              element.isDonorName2Sel = true;
            }
          }
        });
      } else {
        this.pledgeAliyaNames.forEach((element) => {
          if (
            element.aliyaNameId == aliyaNameId &&
            element.aliyaTypeId == aliyaTypeId &&
            element.accountId == null
          ) {
            if (
              element.hosafacount == undefined ||
              element.hosafacount == hosafacount
            ) {
              element.isDonorName2Sel = false;
            }
          }
        });
      }
    }
  }

  SelectDonor2(
    accountId,
    aliyaNameId,
    j,
    hosafacount,
    isAddedFromCard,
    resValue = null
  ) {
    if (j == 0) {
      this.showBox2 = -9999;
    } else {
      this.showBox2 = -j;
    }

    this.isDonorSelected1[j] = true;
    this.accId = accountId;
    this.GetEmailList(j, "donor2");

    this.getDonorPhoneList(accountId, "donor2");
    if (isAddedFromCard) {
      this.commonMethodService.donorList = [resValue];
    } else {
      this.commonMethodService.donorList =
        this.commonMethodService.donorList.filter((s) => s.id == accountId);
    }
    this.pledgeAliyaNames.forEach((element) => {
      if (element.aliyaNameId == aliyaNameId) {
        element.nonEditable2 = j;
        if (j == 0) {
          element.displaySearchIcon2 = -22;
        } else {
          element.displaySearchIcon2 = -j;
        }
        if (
          element.hosafacount == undefined ||
          element.hosafacount == hosafacount
        ) {
          element.selectedDonor2 = this.commonMethodService.donorList[0]
            .fullNameJewish
            ? this.commonMethodService.donorList[0].fullNameJewish
            : this.commonMethodService.donorList[0].displayText;
          element.accountId2 = this.commonMethodService.donorList[0].accountId;
          element.isDonorName2Req = false;
          element.isDonorName2Sel = false;
        }
        if (this.emailPledge) {
          element.emailNotify1 = true;
        }
      }
    });
  }

  SearchDonor(event, j) {
    if (event == "") {
      this.commonMethodService.donorList = [];
    }
    if (event.target.value.length > 2) {
      this.commonMethodService.donorList = [];
      this.showBox = j;
      if ($("#globallist" + j).is(":checked")) {
        if (event.keyCode === 13) {
          this.isGlobalList = true;
          this.showBox = j;
          this.commonMethodService.onDonorSearchFieldChange(
            event.target.value,
            true
          );
        }
      } else {
        this.isGlobalList = false;
        this.search(event.target.value);
      }
    } else {
      this.commonMethodService.donorList = [];
    }
  }

  SearchDonor2(event, j) {
    if (event == "") {
      this.commonMethodService.donorList = [];
    }
    if (event.target.value.length > 2) {
      this.commonMethodService.donorList = [];
      this.showBox2 = j;
      if ($("#globallist").is(":checked")) {
        if (event.keyCode === 13) {
          this.isGlobalList2 = true;
          this.showBox2 = j;
          this.commonMethodService.onDonorSearchFieldChange(
            event.target.value,
            true
          );
        }
      } else {
        this.isGlobalList2 = false;
        this.search(event.target.value);
      }
    } else {
      this.commonMethodService.donorList = [];
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
        this.commonMethodService.donorList = filterdRecord.filter(
          (x) => x.donorStatus == "Active"
        );
        record = this.commonMethodService.donorList;
      }
    } else {
      this.commonMethodService.donorList = [];
    }
  }

  RemoveDonor(accountId, content, pledgeStatus, pledgeID, j, pledge) {
    //this.nonEditable = -99;
    this.current_j = j;
    if (this.isEditAliyos) {
      this.pledgeId = accountId;
      this.pledgeStatus = pledgeStatus;
      this.isRemoveDonor = true;
      this.PledgeID = pledgeID;

      this.changeDonorPopupRef = this.commonMethodService.openPopup(content, {
        centered: true,
        backdrop: "static",
        keyboard: false,
        windowClass: "modal-popup modal-donor-change",
        size: "md",
        scrollable: true,
      });
    } else {
      this.remove(accountId);
    }
    this.pledgeData[j] = {
      selectedOptionEmail: "Select Email",
      selectedOptionLabel: "",
      selectedIndex: null,
    };
    this.pledgeAliyaNames[j].firstDonorEmailData = undefined;
    pledge.emailNotify = false;
    this.isDropdownOpen[j] = false;
    this.isSmsDropdownOpen[j] = false;
    this.isDonorSelected[j] = false;
  }

  RemoveDonor2(accountId, content, j, pledge) {
    this.current_j = j;
    this.pledgeId = accountId;
    if (this.isEditAliyos) {
      this.PledgeID = pledge.pledgeID;
      this.changeDonorPopupRef = this.commonMethodService.openPopup(content, {
        centered: true,
        backdrop: "static",
        keyboard: false,
        windowClass: "modal-popup modal-donor-change",
        size: "md",
        scrollable: true,
      });
      this.isRemoveDonor2 = true;
    } else {
      this.remove2(accountId);
    }
    this.pledgeData1[j] = {
      selectedOptionEmail: "Select Email",
      selectedOptionLabel: "",
      selectedIndex: null,
    };
    this.pledgeAliyaNames[j].secondDonorEmailData = undefined;
    pledge.emailNotify1 = false;
    this.pledgeData1[j].selectedOptionEmail = null;
    this.isDropdownOpen1[j] = false;
    this.isSmsDropdownOpen1[j] = false;
    this.isDonorSelected1[j] = false;

    //this.pledgeAliyaNames.forEach(element => {

    // if (element.accountId2 == accountId) {
    //   element.accountId2 = null;
    //   element.selectedDonor2 = null;
    //   element.nonEditable2 = -99;
    // }
    //});
  }
  remove(accountId) {
    // Ensure current_j is within bounds of the array
    if (this.pledgeAliyaNames.length > 0) {
      // Get the element at current_j
      const element = this.pledgeAliyaNames[this.current_j];

      // Check if the accountId matches
      if (element.accountId == accountId) {
        // Set the values to null and -99
        element.accountId = null;
        element.donorname = null;
        element.nonEditable = -99;
      }
    }
  }
  remove2(accountId) {
    // Ensure current_j is within bounds of the array
    if (this.pledgeAliyaNames.length > 0) {
      // Get the element at current_j
      const element = this.pledgeAliyaNames[this.current_j];
      // Check if the accountId matches
      if (element.accountId2 == accountId) {
        element.accountId2 = null;
        element.selectedDonor2 = null;
        element.nonEditable2 = -99;
      }
    }
  }

  OnGlobalCheckboxChange(event, j, aliyaNameId) {
    if (event.target.checked) {
      this.isGlobalCheckboxchecked = true;
      this.pledgeAliyaNames = this.pledgeAliyaNames.map((element) => {
        if (element.aliyaNameId == aliyaNameId) {
          element.displaySearchIcon = j;
          element.isGlobalCheckboxchecked = true;
          // element.isDonorNameSel = false;
        }
        return element;
      });
    } else {
      this.isGlobalCheckboxchecked = false;
      this.pledgeAliyaNames.forEach((element) => {
        if (element.aliyaNameId == aliyaNameId) {
          element.isGlobalCheckboxchecked = false;
          if (j == 0) {
            element.displaySearchIcon = -9999;
          } else {
            element.displaySearchIcon = -j;
          }
        }
      });
    }
  }

  OnGlobalCheckboxChange2(event, j, aliyaNameId) {
    if (event.target.checked) {
      //  this.isGlobalCheckboxchecked= true;
      this.pledgeAliyaNames = this.pledgeAliyaNames.map((element) => {
        if (element.aliyaNameId == aliyaNameId) {
          element.displaySearchIcon2 = j;
          //element.isDonorName2Sel = false;
          element.isGlobalCheckboxchecked2 = true;
        }
        return element;
      });
    } else {
      // this.isGlobalCheckboxchecked= false;
      this.pledgeAliyaNames.forEach((element) => {
        element.isGlobalCheckboxchecked2 = false;
        if (element.aliyaNameId == aliyaNameId) {
          if (j == 0) {
            element.displaySearchIcon2 = -22;
          } else {
            element.displaySearchIcon2 = -j;
          }
        }
      });
    }
  }

  SavePledges() {
    // Arrays to hold the state of global checkboxes
    const isGlobalCheckboxCheckedArray = this.pledgeAliyaNames.map(
      (element) => element.isGlobalCheckboxchecked
    );
    const isGlobalCheckboxCheckedArray2 = this.pledgeAliyaNames.map(
      (element) => element.isGlobalCheckboxchecked2
    );

    // Check if any checkbox is selected
    const isSomeGlobalSearch = isGlobalCheckboxCheckedArray.includes(true);
    const isSomeGlobalSearch2 = isGlobalCheckboxCheckedArray2.includes(true);

    // Validate selected campaign and date range
    this.isDefaultCampaignReq = this.selectedCampaign.length === 0;
    this.isGroupDateReq =
      this.isDefaultCampaignReq && !this.selectedDateRange?.endDate;

    // Validate each pledgeAliyaNames entry
    this.pledgeAliyaNames.forEach((element) => {
      this.validateElement(element);
      this.validateShebirach(element);
    });

    // Check if any validation fails before saving
    if (this.isValidationFailed(isSomeGlobalSearch, isSomeGlobalSearch2)) {
      this.handleValidationFailure();
      return false;
    }

    // Prepare the pledges for saving
    this.preparePledges();

    // Create the object to save the group pledge
    const objSavePledge = this.createSavePledgeObject();

    // Call the service to save the pledge
    this.saveGroupPledge(
      objSavePledge,
      isSomeGlobalSearch,
      isSomeGlobalSearch2
    );
  }

  validateElement(element) {
    // Validate donor name requirement based on amount
    element.isDonorNameReq = element.amount && !element.donorname;

    // Validate campaign fields
    element.iscampaign1Req = element.campaign1?.length === 0;
    element.isChildCampaign1Req = element.childCampaign1?.length === 0;

    // Clear amount validation
    element.isAmount = false;
    element.isDonorName2Req =
      (element.amount2 && !element.selectedDonor2) ||
      (element.childAmount && !element.selectedDonor2);

    // Clear child amount validation
    element.isChildAmount = false;
  }

  validateShebirach(element) {
    // Validate expandShebirach1 items
    if (element.expandShebirach1?.length > 0) {
      element.expandShebirach1.forEach((item) => {
        item.isAmount3 = false;
        if (item.amount3 && !element.donorname) {
          element.isDonorNameReq = true;
        }
      });
    }

    // Validate expandShebirach2 items
    if (element.expandShebirach2?.length > 0) {
      element.expandShebirach2.forEach((item) => {
        item.isAmount4 = item.amount4 && !element.donorname;
        if (item.amount4 && !element.donorname) {
          element.isDonorNameReq = true;
        }
      });
    }
  }

  isValidationFailed(isSomeGlobalSearch, isSomeGlobalSearch2) {
    return (
      this.hasRequiredFields(this.pledgeAliyaNames, "isDonorNameReq") ||
      this.hasRequiredFields(this.pledgeAliyaNames, "isAmount") ||
      this.hasExpandShebirachIssues("expandShebirach1", "isAmount3") ||
      this.hasExpandShebirachIssues("expandShebirach2", "isAmount4") ||
      this.hasRequiredFields(this.pledgeAliyaNames, "isDonorName2Req") ||
      this.hasRequiredFields(this.pledgeAliyaNames, "iscampaign1Req") ||
      this.hasRequiredFields(this.pledgeAliyaNames, "isChildCampaign1Req") ||
      this.isGroupDateReq ||
      this.isDefaultCampaignReq ||
      this.isAllDonorNamesMissing()
    );
  }

  hasRequiredFields(array, field) {
    return array.filter((x) => x[field]).length > 0;
  }

  hasExpandShebirachIssues(expandField, amountField) {
    return this.pledgeAliyaNames.some((pledge) =>
      pledge[expandField]?.some((item) => item[amountField] === true)
    );
  }

  isAllDonorNamesMissing() {
    return (
      this.pledgeAliyaNames.filter((x) => x.donorname === "").length ===
        this.pledgeAliyaTotal &&
      this.pledgeAliyaNames.find((x) => x.selectedDonor2) == undefined
    );
  }

  handleValidationFailure() {
    if (this.isAllDonorNamesMissing()) {
      this.pledgeAliyaNames[0].isDonorNameReq = true;
      this.pledgeAliyaNames[0].isAmount = true;
      this.pledgeAliyaNames[0].isDonorName2Req = true;
      this.pledgeAliyaNames[0].isChildAmount = true;
      this.pledgeAliyaNames[0].iscampaign1Req = true;
      this.pledgeAliyaNames[0].isChildCampaign1Req = true;
    }
  }

  preparePledges() {
    this.pledges = [];
    this.pledgeAliyaNames.forEach((element) => {
      if (this.isPledgeValid(element)) {
        this.addPledge(element);
        this.addExpandShebirachPledges(element);
      }
    });
  }

  isPledgeValid(element) {
    return (
      (element.selectedDonor2 || element.accountId) &&
      element.aliyaTypeId != null
    );
  }

  addPledge(element) {
    const pledge1 = this.createPledgeObject(
      element,
      element.aliyaTypeId,
      element.accountId,
      element.amount,
      element.note1
    );
    if (pledge1) this.pledges.push(pledge1);

    const pledge2 = this.createPledgeObject(
      element,
      element.aliyaTypeId,
      element.accountId2,
      element.childAmount,
      element.childNote
    );
    if (pledge2) {
      pledge2.pledgeID = element.childPledgeId;
      this.pledges.push(pledge2);
    }
  }

  createPledgeObject(element, aliyaTypeId, accountId, amount, note) {
    if (accountId != null) {
      return {
        campaignId:
          element[`campaign${aliyaTypeId}`]?.reduce((s) => s.id)?.id || null,
        accountId,
        amount: amount || 0,
        externalNote: note,
        pledgeDate: moment(new Date()).format("YYYY-MM-DD"),
        aliyaTypeId,
        aliyaNameId: element.aliyaNameId || 10,
        notifyPhoneId: element[`phoneNotify${aliyaTypeId}`]
          ? element[`notifyPhoneId${aliyaTypeId}`]
          : 0,
        notifyEmailId: element[`emailNotify${aliyaTypeId}`]
          ? element[`notifyEmailId${aliyaTypeId}`]
          : 0,
        notifyPhone: element[`phoneNotify${aliyaTypeId}`] || "",
        notifyEmail: element[`emailNotify${aliyaTypeId}`] || "",
        pledgeID: element.pledgeID || 0,
      };
    }
    return null;
  }

  addExpandShebirachPledges(element) {
    if (this.ShebirachOpen2 && element.expandShebirach2) {
      element.expandShebirach2.forEach((item) => {
        const pledge = this.createPledgeObject(
          element,
          2,
          element.accountId2,
          item.amount4,
          item.note3
        );
        if (pledge) this.pledges.push(pledge);
      });
    }

    if (this.ShebirachOpen1 && element.expandShebirach1) {
      element.expandShebirach1.forEach((item) => {
        const pledge = this.createPledgeObject(
          element,
          1,
          element.accountId,
          item.amount3,
          item.note2
        );
        if (pledge) this.pledges.push(pledge);
      });
    }
  }

  createSavePledgeObject() {
    return {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      pledges: this.pledges,
      groupDate: this.selectedDateRange?.startDate
        ? moment(this.selectedDateRange.startDate).format("YYYY-MM-DD")
        : null,
      campaignId: this.selectedCampaign?.reduce((s) => s.id)?.id || null,
      isSendPledgeEmail: this.emailPledge,
      groupTitle: this.groupTitle,
      groupId: this.isEditAliyos ? this.groupId : null,
    };
  }

  saveGroupPledge(objSavePledge, isSomeGlobalSearch, isSomeGlobalSearch2) {
    this.isloading = true;
    this.pledgeGroupService.saveGroupPledge(objSavePledge).subscribe(
      (res: any) => {
        this.isloading = false;
        if (res) {
          if (isSomeGlobalSearch || isSomeGlobalSearch2) {
            this.commonMethodService.getDonorList();
          }

          if (res === "Pledge Group Title already exist.") {
            this.showError("Something went wrong!", res);
            return;
          }

          this.showSuccess("Group pledge saved successfully");
          this.closeModal();
        }
      },
      (error) => {
        this.isloading = false;
        this.showError("Something went wrong!", error.error);
      }
    );
  }

  showError(title, message) {
    Swal.fire({
      title,
      text: message,
      icon: "error",
      confirmButtonText: "Ok",
      customClass: { confirmButton: "btn_ok" },
    });
  }

  showSuccess(message) {
    Swal.fire({
      title: "",
      text: message,
      icon: "success",
      confirmButtonText: "Ok",
      customClass: { confirmButton: "btn_ok" },
    });
  }

  closeModal() {
    // this.pledgeModalRef.close();
  }

  //
  showDatepicker: boolean = false;
  showDateTopicker: boolean = false;

  handleClick = (ev) => {
    if (
      this.showDatepicker &&
      !this.elementRef.nativeElement
        .querySelector("ngx-daterangepicker-material")
        .contains(ev.target)
    ) {
      this.pickerDirective.open();
    } else {
      window.removeEventListener("click", this.handleClick);
    }
  };
  isinitialize = 0;

  datesFromUpdated(event) {
    if (this.isinitialize == 1) {
      if (event.endDate == null) {
        this.isGroupDateReq = true;
      } else {
        this.isGroupDateReq = false;
        var selectedDate = moment(this.selectedDateRange.startDate)
          .format("YYYY-MM-DD")
          .toString();
        this.commonAPIMethodService.GetPledgeAliyaNames(selectedDate).subscribe(
          (res: any) => {
            this.pledgeAliyaTotal = res.length;
            this.pledgeAliyaNames = [];
            for (var i = 0; i < res.length; i++) {
              this.isloading = true;
              this.pledgeAliyaNames.push({
                itemName: res[i].aliyaName,
                itemName5: "עלה",
                itemName2: "מי שברך",
                id: res[i].aliyaNameId,
                accountId: null,
                amount: "",
                note1: "עלה " + res[i].aliyaName,
                note: "עלה " + res[i].aliyaName,
                note2: "מי שברך" + " " + res[i].aliyaName,
                note3: "מי שברך" + " " + res[i].aliyaName,
                pledgeDate: "",
                aliyaTypeId: 2,
                donorname: "",
                aliyaNameId: res[i].aliyaNameId,
                expandShebirach1: [],
                expandShebirach2: [],
                childNote: "עלה " + res[i].aliyaName,
              });
            }
            this.isloading = false;
          },
          () => {}
        );
      }
      // this.tempFd = event;
    } else {
      this.isinitialize = 1;
      //this.tempFd = undefined;
    }
  }

  openHebrewCalendarPopup() {
    //this.datesFromUpdated(this.selectedDateRange);
    this.commonMethodService.featureName = null;
    this.commonMethodService.openCalendarPopup(
      this.class_id,
      this.class_hid,
      this.selectedDateRange,
      true,
      "createAliyosDynamicsCalender"
    );
    this.calendarSubscription = this.commonMethodService
      .getCalendarArray()
      .subscribe((items) => {
        if (
          items &&
          items.pageName == "CreateAliyos" &&
          this.commonMethodService.isCalendarClicked == true
        ) {
          this.commonMethodService.isCalendarClicked = false;
          this.calendarSubscription.unsubscribe();
          if (this.popContent) {
            this.popContent.close();
          }
          this.selectedDateRange = items.obj;
          this.selectedDateRange.endDate = this.selectedDateRange.startDate;
          // this.datesFromUpdated(this.selectedDateRange);
          this.EngHebCalPlaceholder =
            this.hebrewEngishCalendarService.EngHebCalPlaceholder;
        }
      });
  }

  onClickedOutsidePopover(p1: any) {
    if (!(event.target as HTMLElement).closest(".popover")) {
      p1.close();
    } else {
    }
  }

  openTextPopup(event, content) {
    event.preventDefault();
    this.commonMethodService.openPopup(content, {
      centered: true,
      backdrop: "static",
      keyboard: false,
      windowClass: "modal-popup send_textreceipt send_emailreceipt",
      size: "md",
      scrollable: true,
    });
  }

  toggleDropdown(index: number, cls) {
    if (!this.isDonorSelected[index]) {
      return false;
    }
    let clsSelected = `.${cls}-${index}`;
    $(clsSelected).toggleClass("show");
    this.isDropdownOpen[index] = !this.isDropdownOpen[index];
  }

  toggleSmsDropdown(index: number, cls) {
    if (!this.isDonorSelected[index]) {
      return false;
    }
    let clsSelected = `.${cls}-${index}`;
    $(clsSelected).toggleClass("show");
    this.isSmsDropdownOpen[index] = !this.isSmsDropdownOpen[index];
  }

  toggleDropdown1(index: number, cls) {
    if (!this.isDonorSelected1[index]) {
      return false;
    }
    let clsSelected = `.${cls}-${index}`;
    $(clsSelected).toggleClass("show");
    this.isDropdownOpen1[index] = !this.isDropdownOpen1[index];
  }

  toggleSmsDropdown1(index: number, cls) {
    if (!this.isDonorSelected1[index]) {
      return false;
    }
    let clsSelected = `.${cls}-${index}`;
    $(clsSelected).toggleClass("show");
    this.isSmsDropdownOpen1[index] = !this.isSmsDropdownOpen1[index];
  }

  selectOptionAndCloseDropdown(
    option: any,
    index: number,
    selectedIndex: number
  ) {
    this.pledgeData[index] = {
      selectedOptionEmail: option.emailAddress,
      selectedOptionLabel: "(" + option.emailLabel + ")",
      selectedIndex: selectedIndex,
    };
    this.pledgeAliyaNames[index].notifyEmailId = option.emailID;
    this.pledgeAliyaNames[index].notifyEmail = option.emailAddress;

    setTimeout(() => {
      this.isDropdownOpen[index] = false;
    }, 200);

    this.pledgeData[index].selectedOptionEmail = option.emailAddress;
    this.pledgeAliyaNames[index].emailNotify = true;
  }

  selectOptionAndCloseDropdown1(
    option: any,
    index: number,
    selectedIndex: number
  ) {
    this.pledgeData1[index] = {
      selectedOptionEmail: option.emailAddress,
      selectedOptionLabel: "(" + option.emailLabel + ")",
      selectedIndex: selectedIndex,
    };
    this.pledgeAliyaNames[index].notifyEmailId1 = option.emailID;
    this.pledgeAliyaNames[index].notifyEmail1 = option.emailAddress;
    setTimeout(() => {
      this.isDropdownOpen1[index] = false;
    }, 200);

    this.pledgeData1[index].selectedOptionEmail = option.emailAddress;
    this.pledgeAliyaNames[index].emailNotify1 = true;
  }

  selectSmsOptionAndCloseDropdown(
    option: any,
    index: number,
    selectedIndex: number
  ) {
    this.pledgeSmsData[index] = {
      selectedOptionSms: option.phoneNumber,
      selectedOptionLabel: "(" + option.phoneLabel + ")",
      selectedIndex: selectedIndex,
    };
    setTimeout(() => {
      this.isSmsDropdownOpen[index] = false;
    }, 200);
    this.pledgeAliyaNames[index].notifyPhoneId = option.phoneID;
    this.pledgeAliyaNames[index].notifyPhone = option.phoneNumber;
    this.pledgeAliyaNames[index].phoneNotify = true;
  }

  selectSmsOptionAndCloseDropdown1(
    option: any,
    index: number,
    selectedIndex: number
  ) {
    this.pledgeSmsData1[index] = {
      selectedOptionSms: option.phoneNumber,
      selectedOptionLabel: "(" + option.phoneLabel + ")",
      selectedIndex: selectedIndex,
    };
    setTimeout(() => {
      this.isSmsDropdownOpen1[index] = false;
    }, 200);
    this.pledgeAliyaNames[index].notifyPhoneId = option.phoneID;
    this.pledgeAliyaNames[index].notifyPhone = option.phoneNumber;
    this.pledgeAliyaNames[index].phoneNotify1 = true;
  }

  GetEmailList(jIndex?: number, donor?: string, accountId = null) {
    let eventGuId = this.localstoragedataService.getLoginUserEventGuId();
    var accId = this.accId ? this.accId : accountId;
    this.donorService
      .getDonorEmailList(eventGuId, accId)
      .subscribe((res: any) => {
        var obj: any = {};
        if (res) {
          obj.list = res;
          this.emailData = obj.list;
          if (jIndex != undefined) {
            if (donor == "donor1") {
              this.pledgeAliyaNames[jIndex].firstDonorEmailData =
                this.emailData;

              if (this.emailPledge) {
                this.fillEmailData();
              }
              this.isDropdownOpen[jIndex] = false;
              return;
            }

            if (donor == "donor2") {
              this.pledgeAliyaNames[jIndex].secondDonorEmailData =
                this.emailData;
              if (this.emailPledge) {
                this.fillEmailData2();
              }

              this.isDropdownOpen1[jIndex] = false;
              return;
            }
          }
        }
      });
  }

  closeEmailPopup(modal: NgbModalRef) {
    modal.dismiss();
  }

  AddEmail() {
    if (!this.email || !this.label) {
      return;
    }
    this.isAddEmailButtonDisabled = true;

    var objDonorEmail = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      accountEmailID: null,
      accountID: this.accId,
      emailLabel: this.label,
      emailAddress: this.email,
      loginUserId: this.localstoragedataService.getLoginUserId(),
    };
    this.donorService.SaveDonorEmail(objDonorEmail).subscribe((res: any) => {
      if (res) {
        this.isAddEmailButtonDisabled = false;
        this.GetEmailList();
      }
    });
  }

  getDonorPhoneList(accountID = null, donor = "donor1") {
    let eventGuId = this.localstoragedataService.getLoginUserEventGuId();
    if (this.commonMethodService?.donorList[0]?.accountId) {
      var accountId = this.commonMethodService.donorList[0].accountId;
    }

    var AccountId = accountID ? accountID : accountId;
    if (donor == "donor1") {
      this.donorService
        .getDonorPhoneList(eventGuId, AccountId)
        .subscribe((res: any) => {
          var obj: any = {};
          if (res != null) {
            obj.list = res;
            this.phoneData = obj.list;
          }
        });
    } else {
      this.donorService
        .getDonorPhoneList(eventGuId, AccountId)
        .subscribe((res: any) => {
          var obj: any = {};
          if (res != null) {
            obj.list = res;
            this.phoneData2 = obj.list;
          }
        });
    }
  }

  AddPhone() {
    if (!this.phone || !this.phoneLabel) {
      return;
    }
    this.isAddPhoneDisable = true;

    let objDonorPhone = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      macAddress: this.localstoragedataService.getLoginUserGuid(),

      accountID: this.commonMethodService.donorList[0].accountId,
      phoneLabel: this.phoneLabel,
      phoneNumber: this.phone,
      loginUserId: this.localstoragedataService.getLoginUserId(),
    };
    this.donorService.SaveDonorPhone(objDonorPhone).subscribe((res: any) => {
      if (res) {
        this.isAddPhoneDisable = false;
        this.getDonorPhoneList();
      }
    });
  }

  getAliaGroup() {
    const eventGuId = this.localstoragedataService.getLoginUserEventGuId();
    const groupID = this.groupId;
    this.plegeGroupListService.getAliyaGroup(eventGuId, groupID).subscribe(
      (res) => {
        if (res) {
          this.groupTitle = res[0].groupTitle;
          if (res[0].groupDate) {
            this.isCalendarDisabled = true;
            this.selectedDateRange.startDate = res[0].groupDate;
            this.selectedDateRange.endDate = res[0].groupDate;
            this.EngHebCalPlaceholder = res[0].groupDate;
          }
          var data = res[0].pledges;
          const markParentChild = (data) => {
            // Create a map to store the parent-child relationship
            const parentChildMap = new Map();

            data.forEach((item) => {
              const { aliyaNameId, aliyaTypeId } = item;
              // if(item.accountId && item.aliyaTypeId ==1){
              //   //this.emailData
              // }
              // if(item.accountId && item.aliyaTypeId == 2){

              // }
              if (!parentChildMap.has(aliyaNameId)) {
                parentChildMap.set(aliyaNameId, { parent: null, child: null });
              }

              if (aliyaTypeId === 1) {
                parentChildMap.get(aliyaNameId).parent = item;
              } else if (aliyaTypeId === 2) {
                parentChildMap.get(aliyaNameId).child = item;
              }
            });

            // Now mark the items as parent or child based on the map
            return data.map((item) => {
              const { aliyaNameId, aliyaTypeId } = item;
              const relationship = parentChildMap.get(aliyaNameId);

              if (relationship) {
                if (aliyaTypeId === 1 && relationship.child) {
                  return { ...item, parent: 1 };
                } else if (aliyaTypeId === 2 && relationship.parent) {
                  return { ...item, parent: 0 };
                }
              }
              return { ...item, parent: 1 }; // Default to parent if no match found
            });
          };

          let result = markParentChild(data);

          /**  non hosafa childPledges */
          let childPledges = result.filter(
            (item) => item.parent == 0 && item.aliyaNameId != 10
          );

          /**  hosafa parentPledges */
          let parentPledgesWithAliyaNameId10 = result.filter(
            (item) => item.aliyaNameId == 10 && item.parent != 0
          );

          /** hosafa childPledges */
          let childPledgesWithAliyaNameId10 = result.filter(
            (item) => item.aliyaNameId == 10 && item.parent == 0
          );

          /** non hosafa parent pledges */
          let parentPledges = result.filter(
            (item) => item.parent == 1 && item.aliyaNameId != 10
          );
          const accountIdMap: { [key: string]: boolean } = {};
          const uniquePledges: any[] = [];

          childPledgesWithAliyaNameId10.forEach((pledge) => {
            pledge["isHosafa"] = true;
            /* if (accountIdMap[pledge.accountId]) {
              parentPledgesWithAliyaNameId10.push(pledge);
            } else {
              accountIdMap[pledge.accountId] = true;
              uniquePledges.push(pledge);
            } */
          });

          childPledges.push(...childPledgesWithAliyaNameId10);
          this.selectedCampaign =
            this.commonMethodService.localCampaignList.filter(
              (x) => x.id == res[0].campaignId
            );

          if (this.selectedCampaign.length > 0) {
            this.isDefaultCampaignReq = false;
          }

          this.aliyaPledges = res[0].pledges.sort((a, b) => {
            return a.aliyaNameId - b.aliyaNameId;
          });

          this.aliyaPledges = parentPledges;
          let selectedDate = moment(this.selectedDateRange.startDate)
            .format("YYYY-MM-DD")
            .toString();
          this.commonAPIMethodService
            .GetPledgeAliyaNames(selectedDate)
            .subscribe(
              (res: any) => {
                if (res) {
                  this.pledgeAliya = res;
                  this.pledgeAliyaTotal = this.pledgeAliya.length;
                  this.pledgeAliyaNames = [];

                  for (
                    let i = this.pledgeAliya.length;
                    i <
                    this.pledgeAliya.length +
                      parentPledgesWithAliyaNameId10.length;
                    i++
                  ) {
                    this.aliyaPledges[i] =
                      parentPledgesWithAliyaNameId10[
                        i - this.pledgeAliya.length
                      ];
                  }

                  parentPledgesWithAliyaNameId10.forEach((pledge, i) => {
                    this.pledgeAliya.push({
                      aliyaNameId: this.pledgeAliya.length + 1,
                      aliyaName: `#${i + 1} הוספה`,
                    });
                    this.hosafacount++;
                  });

                  this.parentPledgesWithAliyaNameId10Length =
                    parentPledgesWithAliyaNameId10.length;
                  this.setPledgeAliyaNames();
                  // this.pledgeAliyaNames.sort((a, b) => a.aliyaNameId - b.aliyaNameId);
                }

                if (childPledges.length > 0) {
                  childPledges.forEach((childPledge, i) => {
                    if (!childPledge.isHosafa) {
                      this.processNonHosafaPledge(childPledge, i);
                    } else {
                      const offset = this.getAliyaPledgeOffset();
                      this.processHosafaPledge(childPledge, i, offset);
                    }
                  });
                }

                let index = this.pledgeAliyaNames.findIndex(
                  (pledge) => pledge.aliyaNameId == 9
                );

                let hosafaPledges = this.pledgeAliyaNames
                  .filter((pledge) => pledge.aliyaNameId == 10)
                  .slice(1);
                this.pledgeAliyaNames.splice(
                  this.pledgeAliyaNames.length - hosafaPledges.length
                );

                this.pledgeAliyaNames.splice(index, 0, ...hosafaPledges);

                this.pledgeAliyaNames.forEach((pledge, i) => {
                  if (pledge.aliyaTypeId == 1) this.selecteditems[i] = true;
                });

                if (this.pledgeAliyaNames) {
                  this.pledgeAliyaNames.forEach((item, i) => {
                    if (item.accountId) {
                      this.GetEmailList(i, "donor1", item.accountId);
                      this.getDonorPhoneList(item.accountId, "donor1");
                    }
                    if (item.accountId2) {
                      this.GetEmailList(i, "donor2", item.accountId2);
                      this.getDonorPhoneList(item.accountId2, "donor2");
                    }
                  });
                }
                this.isloading = false;
              },
              (err) => {
                console.log("error", err);
              }
            );
        }
      },
      (error) => {
        Swal.fire({
          title: "Something went wrong!",
          text: error.error,
          icon: "error",
          confirmButtonText: "Ok",
          customClass: {
            confirmButton: "btn_ok",
          },
        });
      }
    );
  }

  getAliyaPledgeOffset(): number {
    return this.aliyaPledges.length - this.parentPledgesWithAliyaNameId10Length;
  }

  processNonHosafaPledge(result: any, index: number) {
    this.pledgeAliyaNames.forEach((aliya, j) => {
      if (result.aliyaNameId === aliya.aliyaNameId) {
        this.assignDonorDetails(result, aliya, j);
        aliya.childCampaign1 = this.getCampaignList(result.campaignId);
        aliya.childAmount = result.amount;
        aliya.childNote = result.externalNote;
        this.isDonorSelected1[index] = true;
        this.selecteditems[j] = true;
        aliya.accountId2 = result.accountId;
        aliya.childPledgeId = result.pledgeID;
      }
    });
  }

  processHosafaPledge(result: any, index: number, offset: number) {
    const pledgeAliyaNamesWithHosafa: any[] =
      this.pledgeAliyaNames.splice(offset);

    pledgeAliyaNamesWithHosafa.forEach((aliya, j) => {
      if (
        result.aliyaNameId === aliya.aliyaNameId &&
        result.pledgeID === aliya.pledgeID + 1
      ) {
        this.assignDonorDetails(result, aliya, this.aliyaPledges.length + j);
        aliya.childCampaign1 = this.getCampaignList(result.campaignId);
        aliya.childAmount = result.amount;
        aliya.childNote = result.externalNote;
        this.isDonorSelected1[index] = true;
        aliya.accountId2 = result.accountId;
        aliya.childPledgeId = result.pledgeID;
        // this.selcteditems[offset + j] = true;
      }
      this.pledgeAliyaNames.push(aliya);
    });
  }

  assignDonorDetails(result: any, aliya: any, index: number) {
    const donor = this.commonMethodService.localDonorList.find(
      (s) => s.accountId === result.accountId
    );

    if (donor) {
      aliya.nonEditable2 = index;
      aliya.selectedDonor2 = donor.fullNameJewish || donor.fullName;
    }
  }

  getCampaignList(campaignId: number) {
    return this.commonMethodService.localCampaignList.filter(
      (x) => x.id === campaignId
    );
  }

  setPledgeAliyaNames() {
    for (var i = 0; i < this.pledgeAliya.length; i++) {
      var aliyaName = null;
      var campaign = null;
      var donorName = null;
      var accountId = null;
      var pledgeID = null;
      if (i < this.aliyaPledges.length && this.aliyaPledges[i]) {
        aliyaName = this.getAliyaNameById(this.aliyaPledges[i].aliyaNameId);
        this.aliyaCampaignId = this.aliyaPledges[i].campaignId;
        let donor = this.commonMethodService.localDonorList.filter(
          (s) => s.accountId === this.aliyaPledges[i].accountId
        );

        pledgeID = this.aliyaPledges[i].pledgeID;

        if (donor.length > 0) {
          donorName =
            donor[0].fullNameJewish !== null
              ? donor[0].fullNameJewish
              : donor[0].fullName;
          accountId = donor[0].accountId;
        }
      }

      campaign = this.commonMethodService.localCampaignList.filter(
        (x) => x.id == this.aliyaCampaignId
      );
      this.isDonorSelected[i] = true;
      this.pledgeAliyaNames.push({
        itemName:
          !!aliyaName &&
          i <
            this.pledgeAliya.length - this.parentPledgesWithAliyaNameId10Length
            ? aliyaName
            : this.pledgeAliya[i].aliyaName,
        itemName5: "עלה",
        itemName2: "מי שברך",
        id: !!this.aliyaPledges[i]
          ? this.aliyaPledges[i].aliyaNameId
          : this.pledgeAliya[i].aliyaNameId,
        accountId: accountId,
        amount: !!this.aliyaPledges[i] ? this.aliyaPledges[i].amount : "",
        note1: !!aliyaName
          ? this.aliyaPledges[i].externalNote
          : "עלה " + this.pledgeAliya[i].aliyaName,
        note: !!aliyaName
          ? this.aliyaPledges[i].externalNote
          : "עלה " + this.pledgeAliya[i].aliyaName,
        note2: !!aliyaName
          ? "מי שברך" + " " + aliyaName
          : "מי שברך" + " " + this.pledgeAliya[i].aliyaName,
        note3: !!aliyaName
          ? "מי שברך" + " " + aliyaName
          : "מי שברך" + " " + this.pledgeAliya[i].aliyaName,
        pledgeDate: !!this.aliyaPledges[i]
          ? this.aliyaPledges[i].pledgeDate
          : "",
        aliyaTypeId: !!this.aliyaPledges[i]
          ? this.aliyaPledges[i].aliyaTypeId
          : 2,
        donorname: !!donorName ? donorName : "",
        aliyaNameId: !!this.aliyaPledges[i]
          ? this.aliyaPledges[i].aliyaNameId
          : this.pledgeAliya[i].aliyaNameId,
        nonEditable: !!this.aliyaPledges[i] ? i : -99,
        displaySearchIcon: -99,
        nonEditable2: -22,
        displaySearchIcon2: -22,
        expandShebirach1: [],
        expandShebirach2: [],
        emailNotify: false,
        phoneNotify: false,
        emailNotify1: false,
        phoneNotify1: false,
        notifyPhoneId: 0,
        notifyEmailId: 0,
        notifyPhoneId1: 0,
        notifyEmailId1: 0,
        notifyPhone: "",
        notifyEmail: "",
        notifyPhone1: "",
        notifyEmail1: "",
        childAmount: "",
        childNote: "עלה " + this.pledgeAliya[i].aliyaName,
        campaign1: campaign,
        pledgeStatus: !!this.aliyaPledges[i]
          ? this.aliyaPledges[i].pledgeStatus
          : "",
        pledgeID: pledgeID,
        accountId2: null,
        isDonorName2Sel: false,
        isDonorNameSel: false,
        isDonorNameReq: false,
        isDonorName2Req: false,
        selectedDonor2: null,
        childCampaign1: null,
      });
    }
  }

  getAliyaNameById(aliyaNameId: number): string | undefined {
    const aliyaObject = this.pledgeAliya.find(
      (aliya) => aliya.aliyaNameId === aliyaNameId
    );
    return aliyaObject ? aliyaObject.aliyaName : undefined;
  }

  voidPledge() {
    let obj = {
      pledgeId: this.PledgeID,
      eventGuid: this.localstoragedataService.getLoginUserEventGuId(),
      hasPayments: this.pledgeStatus != "Open" ? true : false,
      aliyaGroupId: this.groupId,
    };
    this.pledgeService.voidPledge(obj).subscribe(
      (res) => {
        if (res) {
          if (this.isClearSection) {
            this.clearData(this.jIndexPos);
          }
          if (this.isRemoveDonor) {
            this.remove(this.pledgeId);
          }
          if (this.isRemoveDonor2) {
            this.remove2(this.pledgeId);
          }

          if (this.changeDonorPopupRef) {
            this.changeDonorPopupRef.close();
          }
        }
      },
      (err) => {
        console.log("error", err);
      }
    );
  }

  onChange(newValue, i = null, value = null, pledge = null, type = null) {
    if (i != null && type == "email") {
      this.FirstEmailSelected(i, value, pledge, 1);
    }
    if (i != null && type == "phone") {
      this.FirstPhoneSelected(i, value, pledge, 1);
    }

    if (newValue) {
      this.isSavedChanges = true;
    }
  }
  FirstEmailSelected(i, emailNotify, pledge, aliyasType = 1) {
    // this.fillEmailData()
    if (aliyasType == 2) {
      if (emailNotify) {
        if (pledge.firstDonorEmailData.length > 0) {
          const [firstDonorEmailData] = pledge.firstDonorEmailData;

          // Update pledgeData
          this.pledgeData[i] = {
            selectedOptionEmail: firstDonorEmailData.emailAddress,
            selectedOptionLabel: `(${firstDonorEmailData.emailLabel})`,
            selectedIndex: 0,
          };

          pledge.notifyEmailId = firstDonorEmailData.emailID;
          pledge.notifyEmail = firstDonorEmailData.emailAddress;
          this.isDropdownOpen[i] = false;
          pledge.emailNotify = true;
        }
      } else {
        this.pledgeData[i].selectedIndex = null;
      }
    } else {
      if (emailNotify) {
        if (pledge.accountId2) {
          if (pledge.secondDonorEmailData.length > 0) {
            const [secondDonorEmailData] = pledge.secondDonorEmailData;

            // Update pledgeData
            this.pledgeData1[i] = {
              selectedOptionEmail: secondDonorEmailData.emailAddress,
              selectedOptionLabel: `(${secondDonorEmailData.emailLabel})`,
              selectedIndex: 0,
            };

            pledge.notifyEmailId1 = secondDonorEmailData.emailID;
            pledge.notifyEmail1 = secondDonorEmailData.emailAddress;
            this.isDropdownOpen[i] = false;
            pledge.emailNotify1 = true;
          }
        } else {
        }
      } else {
        this.pledgeData1[i].selectedIndex = null;
      }
    }
  }

  FirstPhoneSelected(i, phoneNotify, pledge, aliyasType = 1) {
    if (aliyasType == 2) {
      if (phoneNotify) {
        if (this.phoneData.length > 0) {
          const [firstDonorPhoneData] = this.phoneData;

          this.pledgeSmsData[i] = {
            selectedOptionSms: firstDonorPhoneData.phoneNumber,
            selectedOptionLabel: `(${firstDonorPhoneData.phoneLabel})`,
            selectedIndex: 0,
          };
          this.isDropdownOpen[i] = false;
          pledge.phoneNotify = true;
        }
      } else {
        pledge.phoneNotify = false;
        this.pledgeSmsData[i].selectedIndex = null;
      }
    } else {
      if (pledge.accountId2) {
        if (phoneNotify) {
          if (this.phoneData2.length > 0) {
            const [secondDonorPhoneData] = this.phoneData2;

            // Update pledgeData
            this.pledgeSmsData1[i] = {
              selectedOptionSms: secondDonorPhoneData.phoneNumber,
              selectedOptionLabel: `(${secondDonorPhoneData.phoneLabel})`,
              selectedIndex: 0,
            };

            this.isDropdownOpen1[i] = false;
            pledge.phoneNotify1 = true;
          }
        } else {
          pledge.phoneNotify1 = false;
          this.pledgeSmsData1[i].selectedIndex = null;
        }
      }
    }
  }
  closePopup(content) {
    const hasNonNullAccountIds = this.pledgeAliyaNames.some(
      (obj) => obj.accountId !== null
    );
    if (this.isSavedChanges || hasNonNullAccountIds) {
      this.saveChangePopupRef = this.commonMethodService.openPopup(content, {
        centered: true,
        backdrop: "static",
        keyboard: false,
        windowClass: "modal-popup modal-donor-change",
        size: "md",
        scrollable: true,
      });
    } else {
      this.activeModal.dismiss();
    }
  }

  exit() {
    if (this.saveChangePopupRef) {
      this.saveChangePopupRef.close();
    }
    this.activeModal.dismiss();
    this.emtOutputAliyos.emit(true);
  }

  //code for popup close when clicked outside of popup started
  closeEmailDropdown(event: any, index: number) {
    event.stopPropagation();
    if (this.isDropdownOpen[index]) {
      this.isDropdownOpen[index] = false;
      let cls = "notify-credit-card";
      let clsSelected = `.${cls}-${index}`;
      $(clsSelected).removeClass("show");
    }
  }

  closeEmailDropdown2ndDonor(event: any, index: number) {
    event.stopPropagation();
    if (this.isDropdownOpen1[index]) {
      this.isDropdownOpen1[index] = false;
      let cls = "notify-credit-card-donor";
      let clsSelected = `.${cls}-${index}`;
      $(clsSelected).toggleClass("show");
    }
  }

  closeSMSDropdown(event: any, index: number) {
    event.stopPropagation();
    if (this.isSmsDropdownOpen[index]) {
      this.isSmsDropdownOpen[index] = false;
      let cls = "notify-sms-credit-card";
      let clsSelected = `.${cls}-${index}`;
      $(clsSelected).removeClass("show");
    }
  }

  closeSMS2ndDonorDropdown(event: any, index: number) {
    event.stopPropagation();
    if (this.isSmsDropdownOpen1[index]) {
      this.isSmsDropdownOpen1[index] = false;
      let cls = "notify-sms-credit-card-donor";
      let clsSelected = `.${cls}-${index}`;
      $(clsSelected).toggleClass("show");
    }
  }

  //code for popup close when clicked outside of popup ended

  onCampaign1Select(pledge) {
    pledge.isCampaign1Selected = true;
  }

  getPledgeAliyaTypes() {
    this.commonAPIMethodService.GetPledgeAliyaTypes().subscribe(
      (res: any) => {
        for (var i = 0; i < res.length; i++) {
          this.pledgeAliyaTypes.push({
            itemName: res[i].aliyaType,
            id: res[i].aliyaTypeId,
          });
        }

        this.pledgeAliyaTypes = this.pledgeAliyaTypes.reverse();
      },
      (err) => {
        console.log("Error", err);
      }
    );
  }

  onEmailPledgeChange() {
    if (this.emailPledge) {
      this.fillEmailData();
      this.fillEmailData2();
    } else {
      this.removeAllEmailData();
      this.removeAllEmailData2();
    }
  }
  removeAllEmailData() {
    this.pledgeAliyaNames.forEach((pledge, index) => {
      // Check if donorname exists
      if (pledge.donorname) {
        if (pledge.firstDonorEmailData.length > 0) {
          // Update pledgeData
          this.pledgeData[index] = {
            selectedOptionEmail: "Select Email",
            selectedOptionLabel: "",
            selectedIndex: null,
          };

          pledge.notifyEmailId = 0;
          pledge.notifyEmail = "";
          pledge.emailNotify = false;
        }
      }
    });
  }

  removeAllEmailData2() {
    // Iterate through pledgeAliyaNames array
    this.pledgeAliyaNames.forEach((pledge, index) => {
      // Check if donorname exists
      if (pledge.accountId2) {
        if (pledge.secondDonorEmailData.length > 0) {
          // Update pledgeData
          this.pledgeData1[index] = {
            selectedOptionEmail: "Select Email",
            selectedOptionLabel: "",
            selectedIndex: null,
          };

          pledge.notifyEmailId1 = 0;
          pledge.notifyEmail1 = "";
          pledge.emailNotify1 = false;
        }
      }
    });
  }
  fillEmailData() {
    // Iterate through pledgeAliyaNames array

    this.pledgeAliyaNames.forEach((pledge, index) => {
      // Check if donorname exists
      if (pledge.donorname) {
        if (pledge.firstDonorEmailData.length > 0) {
          const [firstDonorEmailData] = pledge.firstDonorEmailData;

          // Update pledgeData
          this.pledgeData[index] = {
            selectedOptionEmail: firstDonorEmailData.emailAddress,
            selectedOptionLabel: `(${firstDonorEmailData.emailLabel})`,
            selectedIndex: 0,
          };

          pledge.notifyEmailId = firstDonorEmailData.emailID;
          pledge.notifyEmail = firstDonorEmailData.emailAddress;
          this.isDropdownOpen[index] = false;
          pledge.emailNotify = true;
        }
      }
    });
  }

  fillEmailData2() {
    // Iterate through pledgeAliyaNames array
    this.pledgeAliyaNames.forEach((pledge, index) => {
      // Check if donorname exists
      if (pledge.accountId2) {
        if (pledge.secondDonorEmailData.length > 0) {
          const [secondDonorEmailData] = pledge.secondDonorEmailData;

          // Update pledgeData
          this.pledgeData1[index] = {
            selectedOptionEmail: secondDonorEmailData.emailAddress,
            selectedOptionLabel: `(${secondDonorEmailData.emailLabel})`,
            selectedIndex: 0,
          };

          pledge.notifyEmailId1 = secondDonorEmailData.emailID;
          pledge.notifyEmail1 = secondDonorEmailData.emailAddress;
          this.isDropdownOpen[index] = false;
          pledge.emailNotify1 = true;
        }
      }
    });
  }

  sendEmailAndSMSReceipts(pledges: any[], pledgeGroupId: number) {
    const eventGuId = this.localstoragedataService.getLoginUserEventGuId();
    this.plegeGroupListService
      .getAliyaGroup(eventGuId, pledgeGroupId)
      .subscribe(
        (res) => {
          if (res) {
            let pledgeList = res[0].pledges;

            //code to send email & sms
            if (pledgeList) {
              pledgeList.forEach((item, index) => {
                const objEmailReceipt = {
                  type: "Pledge",
                  id: item.pledgeID,
                  emailId: pledges[index].notifyEmailId,
                  emailAddress: pledges[index].notifyEmail,
                  eventGuId:
                    this.localstoragedataService.getLoginUserEventGuId(),
                };
                if (
                  pledges[index].notifyEmailId != 0 &&
                  pledges[index].amount != 0
                ) {
                  this.messengerService
                    .SendEmailReceipt(objEmailReceipt)
                    .subscribe(
                      (res) => {},
                      (error) => {
                        console.log(error);
                      }
                    );
                }

                const objTextReceipt = {
                  type: "Pledge",
                  id: item.pledgeID,
                  phoneId: pledges[index].notifyPhoneId,
                  phoneNumber: pledges[index].notifyPhone,
                  eventGuId:
                    this.localstoragedataService.getLoginUserEventGuId(),
                };
                if (
                  pledges[index].notifyPhoneId != 0 &&
                  pledges[index].amount != 0
                ) {
                  this.messengerService
                    .SendSMSReceipt(objTextReceipt)
                    .subscribe((res) => {});
                }
              });
            }
          }
        },
        (error) => {
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
  openPhoneNumberPopup(j, type) {
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
    var accountId;
    if (type == 1) {
      accountId = this.pledgeAliyaNames[j].accountId;
    }
    if (type == 2) {
      accountId = this.pledgeAliyaNames[j].accountId2;
    }
    modalRef.componentInstance.DonorDetails = {
      accountId: accountId,
    };
    modalRef.componentInstance.emtOutput.subscribe((res) => {
      if (res) {
        if (type == 1) {
          this.phoneData.push(res);
          this.selectSmsOptionAndCloseDropdown(
            res,
            j,
            this.phoneData.length - 1
          );
        }
        if (type == 2) {
          this.phoneData2.push(res);
          this.selectSmsOptionAndCloseDropdown1(
            res,
            j,
            this.phoneData2.length - 1
          );
        }
      }
    });
  }

  openEmailAddressPopup(j, type) {
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
    var accountId;
    if (type == 1) {
      accountId = this.pledgeAliyaNames[j].accountId;
    }
    if (type == 2) {
      accountId = this.pledgeAliyaNames[j].accountId2;
    }
    modalRef.componentInstance.DonorDetails = {
      accountId: accountId,
    };
    modalRef.componentInstance.emtOutput.subscribe((res) => {
      if (res) {
        if (type == 1) {
          this.pledgeAliyaNames[j].firstDonorEmailData.push(res);
          this.selectOptionAndCloseDropdown(
            res,
            j,
            this.pledgeAliyaNames[j].firstDonorEmailData.length - 1
          );
        }
        if (type == 2) {
          this.pledgeAliyaNames[j].secondDonorEmailData.push(res);
          this.selectOptionAndCloseDropdown1(
            res,
            j,
            this.pledgeAliyaNames[j].secondDonorEmailData.length - 1
          );
        }
      }
    });
  }
  AddNewDonor(pledge, j, aliyastype = 2) {
    this.commonMethodService.AddNewDonor().then((value) => {
      if (value) {
        if (aliyastype == 1) {
          this.SelectDonor2(
            value.accountId,
            pledge.aliyaNameId,
            j,
            pledge.hosafacount,
            true,
            value
          );
        }
        if (aliyastype == 2) {
          this.SelectDonor(
            value.accountId,
            pledge.aliyaNameId,
            pledge.aliyaTypeId,
            j,
            pledge.hosafacount,
            true,
            value
          );
        }
      }
    });
  }
}
