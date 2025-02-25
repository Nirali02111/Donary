import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import {
  NgbActiveModal,
  NgbDropdown,
  NgbModalOptions,
  NgbPopover,
} from "@ng-bootstrap/ng-bootstrap";
import * as moment from "moment";
import { DaterangepickerDirective } from "ngx-daterangepicker-material";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { CommonAPIMethodService } from "src/app/services/common-api-method.service";
import { DonorService } from "src/app/services/donor.service";
import { PledgeService } from "src/app/services/pledge.service";
import Swal from "sweetalert2";
import { DonorSaveComponent } from "../donor/donor-save/donor-save.component";
import { HebrewEngishCalendarService } from "src/app/services/hebrew-engish-calendar.service";
import { Subscription } from "rxjs";
import { PdfviewerPopupComponent } from "../cards/payment-card-popup/pdfviewer-popup/pdfviewer-popup.component";
import { environment } from "src/environments/environment";

declare var $: any;
declare var require: any;
@Component({
  selector: "app-aliyas-pledge",
  templateUrl: "./aliyas-pledge.component.html",
  styleUrls: ["./aliyas-pledge.component.scss"],
  standalone: false,
})
export class AliyasPledgeComponent implements OnInit {
  PageName: any = "AliyasPledge";
  popTitle: any;
  isOneDate: any = true;
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
  isloading = true;
  selectedItem = -1;
  isDefaultCampaignReq = false;
  isGroupDateReq = false;
  selcteditems: any = [];
  selectHosafa: any = [];
  showBox = -1;
  isExpand = -1;
  isExpandShebirach = -1;
  isExpandShebirach2 = -1;
  isProdEnv: boolean;
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
  selectedDateRange: any = { startDate: [], endDate: [] };
  commondonorList: any;
  headers: any;
  body: any;

  EngHebCalPlaceholder: string = "All Time";
  class_id: string;
  class_hid: string;

  isEmailPledge: boolean = true;

  pledges: any[] = [
    {
      accountId: 0,
      amount: 0,
      refNum: "",
      pledgeDate: "",
      aliyaTypeId: 0,
      aliyaNameId: 0,
    },
  ];
  @ViewChild("myDropdown", { static: false }) myDropdown: NgbDropdown;
  @ViewChild(DaterangepickerDirective, { static: false })
  pickerDirective: DaterangepickerDirective;
  @ViewChild(NgbPopover, { static: false }) popContent: NgbPopover;
  isOpen: boolean;
  private calendarSubscription: Subscription;
  private PickercalendarSubscription: Subscription;
  constructor(
    public activeModal: NgbActiveModal,
    public commonAPIMethodService: CommonAPIMethodService,
    private localstoragedataService: LocalstoragedataService,
    private pledgeService: PledgeService,
    public commonMethodService: CommonMethodService,
    public donorService: DonorService,
    public elementRef: ElementRef,
    public hebrewEngishCalendarService: HebrewEngishCalendarService
  ) {}

  ngOnInit() {
    this.getFeatureSettingValues();
    this.isProdEnv = environment.baseUrl.includes("https://webapi.donary.com/");
    // this.isloading=true;
    var selectedSaturday;
    selectedSaturday = moment(new Date());
    while (selectedSaturday.day() !== 6) {
      selectedSaturday.subtract(1, "day");
    }
    this.selectedDateRange.startDate = selectedSaturday;
    this.selectedDateRange.endDate = selectedSaturday;
    selectedSaturday = moment(selectedSaturday).format("YYYY-MM-DD").toString();
    this.EngHebCalPlaceholder = selectedSaturday;
    this.commonAPIMethodService.GetPledgeAliyaNames(selectedSaturday).subscribe(
      (res: any) => {
        this.pledgeAliyaTotal = res.length;
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
            nonEditable: -99,
            displaySearchIcon: -99,
            nonEditable2: -22,
            displaySearchIcon2: -22,
            expandShebirach1: [],
            expandShebirach2: [],
          });
        }
        this.isloading = false;
      },
      (err) => {}
    );

    this.commonAPIMethodService.GetPledgeAliyaTypes().subscribe(
      (res: any) => {
        for (var i = 0; i < res.length; i++) {
          this.isloading = true;
          this.pledgeAliyaTypes.push({
            itemName: res[i].aliyaType,
            id: res[i].aliyaTypeId,
          });
        }
        this.pledgeAliyaTypes = this.pledgeAliyaTypes.reverse();
        this.isloading = false;
      },
      (err) => {}
    );

    if (this.commonMethodService.localCampaignList.length == 0) {
      this.commonMethodService.getCampaignList();
    }
    if (this.commonMethodService.localDonorList.length == 0) {
      this.commonMethodService.getDonorList();
    }
    this.commonMethodService.formatAmount(0);
  }

  closePopup() {
    this.activeModal.dismiss();
  }

  UpdateNotes(i, pledge) {
    if (i == 1) {
      this.pledgeAliyaNames.forEach((element) => {
        if (element.id == pledge.id) {
          element.note1 = "קנה " + element.itemName;
        }
      });
    } else {
      this.pledgeAliyaNames.forEach((element) => {
        if (element.id == pledge.id) {
          element.note1 = "עלה " + element.itemName;
        }
      });
    }
  }

  onCampaignSelect(selectCampaign) {
    if (selectCampaign.length > 0) {
      this.isDefaultCampaignReq = false;
    }
  }

  OnCampaignDeSelect(event) {
    this.isDefaultCampaignReq = true;
    this.selectedCampaign = [];
  }
  SearchGlobalDonor(j) {
    this.isGlobalList = true;
    var text = $("#donorText_" + j).val();
    if (text != "") {
      this.showBox = j;
      this.commonMethodService.onDonorSearchFieldChange(text, true);
    }
  }

  ExpandOption(j) {
    this.isExpand = j;
  }

  ExpandOptions(j) {
    this.isExpanded = j;
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
          campaign2: null,
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
          campaign4: null,
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
      this.pledgeAliyaNames.push({
        itemName: "הוספה",
        itemName5: "עלה",
        id: 10,
        accountId: null,
        amount: "",
        note1: "עלה הוספה",
        note: "עלה הוספה",
        aliyaTypeId: 2,
        hosafacount: this.hosafacount,
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
      this.pledgeAliyaNames.push({
        itemName: "הוספה",
        itemName5: "עלה",
        id: 10,
        accountId2: null,
        amount2: "",
        note3: "עלה הוספה",
        note: "עלה הוספה",
        aliyaTypeId: 2,
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

  clearSection(j) {
    this.pledgeAliyaNames[j].note1 = null;
    this.pledgeAliyaNames[j].note2 = null;
    this.pledgeAliyaNames[j].campaign1 = null;
    this.pledgeAliyaNames[j].campaign2 = null;
    this.pledgeAliyaNames[j].accountId = null;
    this.pledgeAliyaNames[j].amount = null;
    this.pledgeAliyaNames[j].donorname = [];
    this.pledgeAliyaNames[j].displaySearchIcon = -99;
    this.pledgeAliyaNames[j].nonEditable = -99;
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

  SelectDonor(accountId, aliyaNameId, aliyaTypeId, j, hosafacount) {
    if (j == 0) {
      this.showBox = -9999;
    } else {
      this.showBox = -j;
    }
    this.commonMethodService.donorList =
      this.commonMethodService.donorList.filter((s) => s.id == accountId);

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
      }
    });
  }

  DonorRequired(aliyaNameId, aliyaTypeId, value, hosafacount) {
    if (value != "") {
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

  Donor2Required(aliyaNameId, aliyaTypeId, value, hosafacount) {
    if (value != "") {
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

  SelectDonor2(accountId, aliyaNameId, j, hosafacount) {
    if (j == 0) {
      this.showBox2 = -9999;
    } else {
      this.showBox2 = -j;
    }
    this.commonMethodService.donorList =
      this.commonMethodService.donorList.filter((s) => s.id == accountId);
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
      if ($("#globallist").is(":checked")) {
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

  RemoveDonor(accountId) {
    //this.nonEditable = -99;
    this.pledgeAliyaNames.forEach((element) => {
      if (element.accountId == accountId) {
        element.accountId = null;
        element.donorname = null;
        element.nonEditable = -99;
      }
    });
  }

  RemoveDonor2(accountId) {
    this.pledgeAliyaNames.forEach((element) => {
      if (element.accountId2 == accountId) {
        element.accountId2 = null;
        element.selectedDonor2 = null;
        element.nonEditable2 = -99;
      }
    });
  }

  OnGlobalCheckboxChange(event, j, aliyaNameId) {
    if (event.target.checked) {
      this.pledgeAliyaNames = this.pledgeAliyaNames.map((element) => {
        if (element.aliyaNameId == aliyaNameId) {
          element.displaySearchIcon = j;
        }
        return element;
      });
    } else {
      this.pledgeAliyaNames.forEach((element) => {
        if (element.aliyaNameId == aliyaNameId) {
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
      this.pledgeAliyaNames = this.pledgeAliyaNames.map((element) => {
        if (element.aliyaNameId == aliyaNameId) {
          element.displaySearchIcon2 = j;
        }
        return element;
      });
    } else {
      this.pledgeAliyaNames.forEach((element) => {
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
    if (this.selectedCampaign.length == 0) {
      this.isDefaultCampaignReq = true;
      this.isGroupDateReq =
        this.selectedDateRange.endDate == null ? true : false;
    } else {
      this.isDefaultCampaignReq = false;
      if (this.selectedDateRange.endDate == null) {
        this.isGroupDateReq = true;
      } else {
        this.isGroupDateReq = false;
      }
    }
    this.pledgeAliyaNames.forEach((element) => {
      if (element.amount != "" && element.donorname == "") {
        if (element.amount != undefined) {
          element.isDonorNameReq = true;
        }
      } else {
        element.isDonorNameReq = false;
      }
      if (element.amount2 != "" && element.selectedDonor2 == undefined) {
        if (element.amount2 != undefined) {
          element.isDonorName2Req = true;
        }
      } else {
        element.isDonorName2Req = false;
      }
    });
    if (
      this.pledgeAliyaNames.filter((x) => x.isDonorNameReq == true).length >
        0 ||
      this.pledgeAliyaNames.filter((x) => x.isDonorName2Req == true).length >
        0 ||
      this.isGroupDateReq ||
      this.isDefaultCampaignReq ||
      (this.pledgeAliyaNames.filter((x) => x.donorname == "").length ==
        this.pledgeAliyaTotal &&
        this.pledgeAliyaNames.find((x) => x.selectedDonor2) == undefined)
    ) {
      if (
        this.pledgeAliyaNames.filter((x) => x.donorname == "").length ==
        this.pledgeAliyaTotal
      ) {
        this.pledgeAliyaNames[0].isDonorNameReq = true;
      }
      return false;
    }
    this.isloading = true;
    if (this.pledgeAliyaNames.length > 0) {
      this.pledges = [];
      let obj = {};
      this.pledgeAliyaNames.forEach((element) => {
        if (
          (element.selectedDonor2 != null && element.selectedDonor2 != "") ||
          element.accountId != null
        ) {
          if (element.aliyaNameId == null && element.id == 10) {
            element.aliyaNameId = 10;
          }
          if (element.aliyaTypeId == 1) {
            if (element.accountId != null) {
              obj = {
                campaignId:
                  element.campaign1 && element.campaign1.length != 0
                    ? element.campaign1.reduce((s) => s.id).id
                    : null,
                accountId: element.accountId,
                amount:
                  element.amount == undefined || element.amount == ""
                    ? 0
                    : element.amount,
                pledgeDate: null, //moment(new Date()).format("YYYY-MM-DD"),
                aliyaTypeId: element.aliyaTypeId,
                aliyaNameId: element.aliyaNameId,
                externalNote: element.note1,
              };
              this.pledges.push(obj);
            }
            if (element.accountId2 != null) {
              obj = {
                campaignId:
                  element.campaign3 && element.campaign3.length != 0
                    ? element.campaign3.reduce((s) => s.id).id
                    : null,
                accountId: element.accountId2,
                amount:
                  element.amount2 == undefined || element.amount2 == ""
                    ? 0
                    : element.amount2,
                externalNote: element.note,
                pledgeDate: null, /// moment(new Date()).format("YYYY-MM-DD"),
                aliyaTypeId: 2,
                aliyaNameId: element.aliyaNameId,
              };
              this.pledges.push(obj);
            }

            if (this.ShebirachOpen2 == true) {
              element.expandShebirach2.forEach((item) => {
                obj = {
                  campaignId:
                    item.campaign4 && item.campaign4.length != 0
                      ? item.campaign4.reduce((s) => s.id).id
                      : null,
                  accountId: element.accountId2,
                  amount:
                    item.amount4 == undefined || item.amount4 == ""
                      ? 0
                      : item.amount4,
                  externalNote: item.note3,
                  pledgeDate: null, ///moment(new Date()).format("YYYY-MM-DD"),
                  aliyaTypeId: 2,
                  aliyaNameId: element.aliyaNameId,
                };
                this.pledges.push(obj);
              });
            }
          } else {
            if (element.accountId != null) {
              obj = {
                campaignId:
                  element.campaign1 && element.campaign1.length != 0
                    ? element.campaign1.reduce((s) => s.id).id
                    : null,
                accountId: element.accountId,
                amount:
                  element.amount == undefined || element.amount == ""
                    ? 0
                    : element.amount,
                externalNote: element.note1,
                pledgeDate: null, ///moment(new Date()).format("YYYY-MM-DD"),
                aliyaTypeId: element.aliyaTypeId,
                aliyaNameId: element.aliyaNameId,
              };
              this.pledges.push(obj);
            }
            if (this.ShebirachOpen1 == true && element.accountId != null) {
              element.expandShebirach1.forEach((item) => {
                obj = {
                  campaignId:
                    item.campaign2 && item.campaign2.length != 0
                      ? item.campaign2.reduce((s) => s.id).id
                      : null,
                  accountId: element.accountId,
                  amount:
                    item.amount3 == undefined || item.amount3 == ""
                      ? 0
                      : item.amount3,
                  externalNote: item.note2,
                  pledgeDate: null, /// moment(new Date()).format("YYYY-MM-DD"),
                  aliyaTypeId: 2,
                  aliyaNameId: element.aliyaNameId,
                };
                this.pledges.push(obj);
              });
            }
          }
        }
      });
      var objSavePledge = {
        eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
        pledges: this.pledges,
        GroupDate:
          this.selectedDateRange != undefined
            ? this.selectedDateRange.startDate != null
              ? moment(this.selectedDateRange.startDate).format("YYYY-MM-DD")
              : null
            : null,
        campaignId:
          this.selectedCampaign && this.selectedCampaign.length != 0
            ? this.selectedCampaign.reduce((s) => s.id).id
            : null,
        isSendPledgeEmail: this.isEmailPledge,
      };
      //return false;
      this.pledgeService.addGroupPledge(objSavePledge).subscribe(
        (res: any) => {
          this.isloading = false;
          if (res) {
            Swal.fire({
              title: "",
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
            this.activeModal.dismiss();
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

  openDropdown() {
    this.isOpen = false;
    if (this.commonMethodService.isReportdropdownOpen == true) {
      this.myDropdown.close();
      this.commonMethodService.isReportdropdownOpen = false;
    }
  }
  closeDropdown() {
    let calendarRef = document.getElementById("popContent2");
    if (!calendarRef) {
      this.myDropdown.close();
    }
  }
  datesFromUpdated(event) {
    if (this.isinitialize == 1) {
      if (event.startDate == null) {
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
              });
            }
            this.isloading = false;
          },
          (err) => {}
        );
      }
      // this.tempFd = event;
    } else {
      this.isinitialize = 1;
      //this.tempFd = undefined;
    }
  }
  openHebrewPickerPopup(p2: any) {
    this.PickercalendarSubscription = this.commonMethodService
      .getReport()
      .subscribe((res: any) => {
        if (res && this.commonMethodService.ReportClicked == true) {
          this.commonMethodService.ReportClicked = false;
          if (this.commonMethodService.isReportdropdownOpen == true) {
            this.openDropdown();
            this.isOpen = true;
          }
          this.PickercalendarSubscription.unsubscribe();
          p2.close();
        }
      });
  }

  getDonorReport() {
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup print_receipt",
    };
    let objgetDonorReport: any = {};
    objgetDonorReport = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
    };
    const modalRef = this.commonMethodService.openPopup(
      PdfviewerPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.Title = "Document print";
    this.isloading = false;
    this.donorService
      .getReportByDonor(objgetDonorReport)
      .subscribe((res: any) => {
        if (res) {
          modalRef.componentInstance.filePath = res;
        }
        (error) => {
          this.isloading = false;
          console.log(error);
        };
      });
  }

  openHebrewCalendarPopup() {
    this.commonMethodService.featureName = null;
    this.datesFromUpdated(this.selectedDateRange);
    this.commonMethodService.openCalendarPopup(
      this.class_id,
      this.class_hid,
      this.selectedDateRange,
      true
    );
    this.calendarSubscription = this.commonMethodService
      .getCalendarArray()
      .subscribe((items) => {
        if (
          items &&
          items.pageName == "AliyasPledge" &&
          this.commonMethodService.isCalendarClicked == true
        ) {
          this.commonMethodService.isCalendarClicked = false;
          this.calendarSubscription.unsubscribe();
          if (this.popContent) {
            this.popContent.close();
          }
          this.selectedDateRange = items.obj;
          this.selectedDateRange.endDate = items.obj.startDate;
          this.EngHebCalPlaceholder =
            this.hebrewEngishCalendarService.EngHebCalPlaceholder;
          this.datesFromUpdated(this.selectedDateRange);
        }
      });
  }

  getFeatureSettingValues() {
    this.commonMethodService.featureName = "Save_Aliyos";
    this.commonMethodService.getFeatureSettingValues();
  }

  onUpgrade() {
    // this.activeModal.dismiss();
    this.commonMethodService.commenSendUpgradeEmail(
      this.commonMethodService.featureDisplayName
    );
  }

  onClickedOutsidePopover(p1: any) {
    if (!(event.target as HTMLElement).closest(".popover")) {
      p1.close();
    }
  }
}
