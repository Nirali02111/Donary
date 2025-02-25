import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { NgbActiveModal, NgbModalOptions } from "@ng-bootstrap/ng-bootstrap";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { DonorSaveComponent } from "../donor-save/donor-save.component";
declare var $: any;

@Component({
  selector: "app-donor-addfamily-popup",
  templateUrl: "./donor-addfamily-popup.component.html",
  styleUrls: ["./donor-addfamily-popup.component.scss"],
  standalone: false,
})
export class DonorAddfamilyPopupComponent implements OnInit {
  familyTypeDrp = [
    { id: "אב", itemName: "אב" },
    { id: "חמיו", itemName: "חמיו" },
    { id: "חתנו", itemName: "חתנו" },
    { id: "בנו", itemName: "בנו" },
  ];
  isloading: boolean = false;
  keyword: string;
  modalOptions: NgbModalOptions;
  familyMemberType: any;
  noFamilyMemberType: boolean = false;
  noFamilyMember: boolean = false;
  familyType: string;
  clickOutSide = 0;
  showFamilyBox: boolean = false;
  isGlobalFamilyList: boolean = true;
  nonFamilyMemberEditable = false;
  familyMemberId: any;
  selectedFamilyMemberId: number;
  displayFamilySearchIcon = false;
  isCreateDonorPopup = false;
  @Output() emtOutputFamilyUpdate: EventEmitter<any> = new EventEmitter();
  @Input() set FamilyType(type: any) {
    this.familyType = type;
  }
  constructor(
    public commonMethodService: CommonMethodService,
    public activeModal: NgbActiveModal
  ) {}

  ngOnInit() {
    setTimeout(() => {
      $("#familyText").focus();
    }, 500);
  }

  SearchFamilyMember(event) {
    this.showFamilyBox = true;
    if (event == "") {
      this.commonMethodService.donorList = [];
    }
    if (event.target.value.length > 2) {
      this.noFamilyMember = false;
      this.keyword = event.target.value.toLowerCase().replace(/[().-]/g, "");
      if ($("#globalfamilylist").is(":checked")) {
        if (event.keyCode === 13) {
          this.isGlobalFamilyList = true;
          this.showFamilyBox = true;
          this.commonMethodService.onDonorSearchFieldChange(
            event.target.value,
            true
          );
        }
      } else {
        this.isGlobalFamilyList = false;
        this.search(event.target.value);
      }
    }
  }
  changeMemberType(event) {
    if (event == undefined) {
      this.noFamilyMemberType = true;
    } else {
      this.noFamilyMemberType = false;
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

  RemoveFamilyMember() {
    this.nonFamilyMemberEditable = false;
    this.selectedFamilyMemberId = undefined;
    this.familyMemberId = null;
  }

  SearchGlobalFamilyMember() {
    this.isGlobalFamilyList = true;
    var text = $("#familyText").val();
    this.showFamilyBox = true;
    this.commonMethodService.onDonorSearchFieldChange(text, true);
    this.showFamilyBox = true;
    this.clickOutSide = 1;
  }
  OnGlobalFamilyCheckboxChange(event) {
    if (event.target.checked) {
      this.displayFamilySearchIcon = true;
    } else {
      this.displayFamilySearchIcon = false;
    }
  }

  onClickedOutside() {
    if (this.clickOutSide != 1) {
      this.showFamilyBox = false;
    }
  }

  SelectFamilyMember(accountId) {
    this.nonFamilyMemberEditable = true;
    this.noFamilyMember = false;
    this.showFamilyBox = false;
    this.selectedFamilyMemberId = accountId;
    this.commonMethodService.donorList =
      this.commonMethodService.donorList.filter((s) => s.id == accountId);
    this.familyMemberId =
      this.commonMethodService.donorList[0].fullNameJewish == null
        ? this.commonMethodService.donorList[0].displayText
        : this.commonMethodService.donorList[0].fullNameJewish;
  }

  closePopup() {
    this.activeModal.dismiss();
  }
  onSave() {
    if (this.familyMemberType == undefined) {
      this.noFamilyMemberType = true;
      return false;
    }
    if (
      (this.familyMemberId == undefined && this.familyMemberType == "אב") ||
      (this.familyMemberId == undefined && this.familyMemberType == "חמיו")
    ) {
      this.noFamilyMember = true;
      return false;
    }
    var memberDetail = {
      familyType: this.familyType,
      memberLabel: this.familyMemberType,
      fullName: this.familyMemberId,
      memberAccountId:
        this.selectedFamilyMemberId == undefined
          ? this.familyMemberId
          : this.selectedFamilyMemberId,
    };
    this.emtOutputFamilyUpdate.emit(memberDetail);
    this.activeModal.dismiss();
  }

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
        console.log(response);
        this.isCreateDonorPopup = false;
        this.selectedFamilyMemberId = response.accountId;
        this.familyMemberId =
          response.fullNameJewish != null
            ? response.fullNameJewish
            : response.fullName;
        this.commonMethodService.donorList = [response];
        this.nonFamilyMemberEditable = true;
      }
    );
  }
  contains_heb(str) {
    return /[\u0590-\u05FF]/.test(str);
  }
}
