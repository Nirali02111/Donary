import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
} from "@angular/core";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { MinyanimService } from "src/app/services/minyanim.service";
import Swal from "sweetalert2";
import { AddShtibelPopupComponent } from "./add-shtibel-popup/add-shtibel-popup.component";
import { NgbModalOptions } from "@ng-bootstrap/ng-bootstrap";
import { NotificationService } from "src/app/commons/notification.service";
import { UntypedFormBuilder, UntypedFormGroup } from "@angular/forms";
import { AnalyticsService } from "src/app/services/analytics.service";
declare let $: any;
@Component({
  selector: "app-minyanim",
  templateUrl: "./minyanim.component.html",
  styleUrls: ["./minyanim.component.scss"],
  standalone: false,
})
export class MinyanimComponent implements OnInit, AfterViewInit {
  @ViewChild("minyanimTab", { static: true }) minyanimTab: ElementRef<any>;

  navTabId: string;
  groupList = [];
  newGroupList = [];
  selectedGroupList = [];
  isGroupListShow: boolean = false;
  roomsList = [];
  selectedRoom = [];
  grouplistresponse = [];
  isDefaultTab: boolean = true;
  isDefaultTab1: boolean = true;
  isDefaultTab2: boolean = true;
  defaultValue: string = "Default";
  minyanDefault: boolean = true;
  minyanDefault1: boolean = true;
  minyanDefault2: boolean = true;
  isDynamicTabClicked: boolean = true;

  timeList: [];
  defaultTimeList: [];
  gridFilterData = [];
  gridDefaultFilterData = [];
  isloading: boolean = false;
  timeA: "";
  timeB: "";
  StartDateTime: any;
  EndDateTime: any;
  selectedGroup: number;
  selectedGroup1: number;
  selectedGroup2: number;
  selectedGroup3: number;
  dynamicSelectedGroup: number;
  dynamicSelectedGroup1: number;
  dynamicSelectedGroup2: number;
  toggledropdown = false;
  tabDropdownStates: { [key: string]: boolean } = {};

  selectedGroupId: string = "";
  dynamicTabs = [];
  sGroupId: number;

  modalOptions: NgbModalOptions;
  shtibelGridFilterData = [];
  gridData = [];
  totalRecord: number = 0;
  filterRecord: number = 0;
  isFiltered: boolean = false;
  filtercount: number = 1;
  isloading1: boolean = false;

  formattedTime: string = "";
  SelectedAllTabs = [];
  activeTab: string = "minyanim-inner-01"; // Default tab
  selectGrp: number;

  tabName: string = "minyanim-01";
  tabName1: string = "minyanim-02";
  tabName2: string = "minyanim-03";
  dynamicTabName: string = "minyanim-01";

  count: number = 0;
  uniqueId: number = 0;
  repeatedId: number;
  isDisable = false;

  isRoom: boolean = false;
  isDefaultA: boolean = false;
  isDefaultB: boolean = false;
  successAlertDisplayed = false;

  defaultFormGroups: UntypedFormGroup[] = [];
  formGroups: UntypedFormGroup[] = [];
  groupLists: any;
  groupIds: any;
  istabClicked: boolean = false;
  isDefaultTabOpen: boolean = false;
  isDefaultTabOpened: boolean = false;
  groups: any;
  tabOpen: number;
  isnewGroupClicked: any;
  isfromNewGroup: boolean;
  groutabIds: any;
  tabIdarr: any = [];
  tabIdname: string;
  isSaved: boolean = false;
  private analytics = inject(AnalyticsService);

  constructor(
    public minyanimService: MinyanimService,
    private localstoragedataService: LocalstoragedataService,
    public commonMethodService: CommonMethodService,
    private notificationService: NotificationService,
    private fb: UntypedFormBuilder
  ) {}

  ngOnInit() {
    this.analytics.visitedMinyanim();
    this.GetGroups();
    this.GetRooms();
    this.getAllShtibelRoom();
  }

  ngAfterViewInit() {
    this.minyanimTab.nativeElement.classList.add("active");
    // Also, find the corresponding tab content div and add the "active" class to it.
    const tabContentId = this.minyanimTab.nativeElement.getAttribute("href");
    const tabContent = document.querySelector(tabContentId);
    if (tabContent) {
      tabContent.classList.add("active");
    }
  }

  toggledropdownif(index, tab) {
    if (this.activeTab === tab) {
      this.dynamicTabs[index].isShowDropDown =
        !this.dynamicTabs[index].isShowDropDown;
    }
  }

  TimeListResponseData(res: any, selectedGroupId: any, minyanType: any) {
    this.timeList = res;
    this.gridFilterData = [];
    if (selectedGroupId) {
      let selectedGroup = res
        .filter((x) => x.minyanType == minyanType)
        .find((x) => x.groupList.some((y) => y.groupId === +selectedGroupId));
      if (selectedGroup) {
        selectedGroup.groupList.forEach((group) => {
          if (group.groupId === +selectedGroupId) {
            group.timelist.forEach((time) => {
              let timeA = this.convertToAmPmTime(time.timeA);
              let timeB = this.convertToAmPmTime(time.timeB);
              let modifiedTime = {
                ...time,
                timeA: timeA,
                timeB: timeB,
              };
              this.gridFilterData.push(modifiedTime);
            });
          }
        });
      }
      this.initFormData();
    } else {
      res.forEach((x) => {
        x.groupList.forEach((y) => {
          y.timelist.forEach((z) => {
            this.gridFilterData.push(z);
          });
        });
      });
    }
  }

  getTimesList(selectedGroupId: number, minyanType: string) {
    let eventGuId = this.localstoragedataService.getLoginUserEventGuId();
    // let macAddress = this.localstoragedataService.getLoginUserGuid();
    if (this.grouplistresponse && !this.isfromNewGroup) {
      this.TimeListResponseData(
        this.grouplistresponse,
        selectedGroupId,
        minyanType
      );
    } else {
      this.minyanimService.getTimesList(eventGuId).subscribe((res: any) => {
        this.isloading = false;
        this.isSaved = false;
        this.TimeListResponseData(res, selectedGroupId, minyanType);
        this.isfromNewGroup = false;
      });
    }
  }

  GetGroups() {
    let eventGuId = this.localstoragedataService.getLoginUserEventGuId();
    this.isloading = true;
    this.minyanimService.GetGroups(eventGuId).subscribe((res: any) => {
      this.groupList = res;
      this.groups = res;
      this.newGroupList = this.groupList;
      this.defaultTabOpening();
    });
  }

  onGroupList(item: boolean) {
    this.isGroupListShow = item;
  }

  GetRooms() {
    let eventGuId = this.localstoragedataService.getLoginUserEventGuId();
    let macAddress = this.localstoragedataService.getLoginUserGuid();
    this.minyanimService
      .GetRooms(eventGuId, macAddress, "")
      .subscribe((res: any) => {
        this.roomsList = res;
      });
  }

  onSaveTimes() {
    let newData = this.formGroups.filter((x) => x.value.isNew == true);
    this.successAlertDisplayed = false;
    let bulkMinyanimTimeInputParam = [];
    for (let i = 0; i < newData.length; i++) {
      let timeA = this.convertToTimeStampTime(newData[i].value.timeA);
      let timeB = this.convertToTimeStampTime(newData[i].value.timeB);
      let obj = {
        timeA: timeA,
        timeB: timeB,
        groupId: this.selectedGroup,
        roomId: newData[i].value.room,
        minyanType: newData[i].value.minyanType,
        createdBy: this.localstoragedataService.getLoginUserId(),
        minyanId: newData[i].value.minyanId,
      };

      if (
        !obj.roomId ||
        !obj.timeA ||
        !obj.timeB ||
        newData[i].value.showAErrorMessage ||
        newData[i].value.showBErrorMessage
      ) {
        newData[i].value.showRoomErrorMessage = true;
      }
      bulkMinyanimTimeInputParam.push(obj);
    }

    const payload = {
      bulkMinyanimTimeInputParam: bulkMinyanimTimeInputParam,
    };

    if (this.isRoom && this.isDefaultA && this.isDefaultB) {
      this.isSaved = true;
      this.minyanimService.saveTimes(payload).subscribe((res: any) => {
        if (res) {
          this.resetAndGetData(res, false, true);
        }
      });
    }
  }

  onDefaultSaveTimes() {
    let newData = this.defaultFormGroups.filter((x) => x.value.isNew == true);
    let bulkMinyanimTimeInputParam = [];
    this.successAlertDisplayed = false;
    for (let i = 0; i < newData.length; i++) {
      let timeA = this.convertToTimeStampTime(newData[i].value.timeA);
      let timeB = this.convertToTimeStampTime(newData[i].value.timeB);
      let obj = {
        timeA: timeA,
        timeB: timeB,
        groupId: newData[i].value.groupId,
        roomId: newData[i].value.room,
        minyanType: newData[i].value.minyanType,
        createdBy: this.localstoragedataService.getLoginUserId(),
        minyanId: newData[i].value.minyanId,
      };

      if (
        !obj.roomId ||
        !obj.timeA ||
        !obj.timeB ||
        newData[i].value.showAErrorMessage ||
        newData[i].value.showBErrorMessage
      ) {
        newData[i].value.showRoomErrorMessage = true;
      }
      bulkMinyanimTimeInputParam.push(obj);
    }

    const payload = {
      bulkMinyanimTimeInputParam: bulkMinyanimTimeInputParam,
    };

    if (this.isRoom && this.isDefaultA && this.isDefaultB) {
      this.isSaved = true;
      this.minyanimService.saveTimes(payload).subscribe((res: any) => {
        if (res) {
          this.resetAndGetData(res, true, false);
        }
      });
    }
  }

  resetAndGetData(res, isDefault: boolean, isfromNewGroup: boolean) {
    this.isfromNewGroup = isfromNewGroup;
    this.selectedRoom = null;
    this.StartDateTime = null;
    this.EndDateTime = null;
    this.isRoom = false;
    this.isDefaultA = false;
    this.isDefaultB = false;
    this.notificationService.swalAlert("Success!", res, "success");
    this.successAlertDisplayed = true;
    const minyanType = this.getMinyanType(this.dynamicTabName);
    if (isDefault) {
      this.getDefaultTimesList(this.defaultValue, minyanType, true);
      return;
    }
    this.getTimesList(this.selectedGroup, minyanType);
  }

  onTimeASaveTimes() {
    let newData = this.formGroups.filter((x) => x.value.isNew == true);
    this.successAlertDisplayed = false;
    let bulkMinyanimTimeInputParam = [];
    for (let i = 0; i < newData.length; i++) {
      let timeA = this.convertToTimeStampTime(newData[i].value.timeA);
      let obj = {
        timeA: timeA,
        groupId: newData[i].value.groupId,
        roomId: newData[i].value.room,
        minyanType: newData[i].value.minyanType,
        createdBy: this.localstoragedataService.getLoginUserId(),
        minyanId: newData[i].value.minyanId,
      };

      if (!obj.roomId || !obj.timeA || newData[i].value.showAErrorMessage) {
        newData[i].value.showRoomErrorMessage = true;
      }
      bulkMinyanimTimeInputParam.push(obj);
    }

    const payload = {
      bulkMinyanimTimeInputParam: bulkMinyanimTimeInputParam,
    };

    if (this.isRoom && this.isDefaultA) {
      this.isSaved = true;
      this.minyanimService.saveTimes(payload).subscribe((res: any) => {
        if (res) {
          this.resetAndGetData(res, false, true);
        }
      });
    }
  }

  onTimeDefaultASaveTimes() {
    let newData = this.defaultFormGroups.filter((x) => x.value.isNew == true);
    this.successAlertDisplayed = false;
    let bulkMinyanimTimeInputParam = [];
    for (let i = 0; i < newData.length; i++) {
      let timeA = this.convertToTimeStampTime(newData[i].value.timeA);
      let obj = {
        timeA: timeA,
        groupId: newData[i].value.groupId,
        roomId: newData[i].value.room,
        minyanType: newData[i].value.minyanType,
        createdBy: this.localstoragedataService.getLoginUserId(),
        minyanId: newData[i].value.minyanId,
      };

      if (!obj.roomId || !obj.timeA || newData[i].value.showAErrorMessage) {
        newData[i].value.showRoomErrorMessage = true;
      }
      bulkMinyanimTimeInputParam.push(obj);
    }

    const payload = {
      bulkMinyanimTimeInputParam: bulkMinyanimTimeInputParam,
    };

    if (this.isRoom && this.isDefaultA) {
      this.isSaved = true;
      this.minyanimService.saveTimes(payload).subscribe((res: any) => {
        if (res) {
          this.resetAndGetData(res, true, false);
        }
      });
    }
  }

  addNewRow() {
    let minyan = this.getMinyanType(this.dynamicTabName);
    let newItem = this.fb.group({
      timeA: this.StartDateTime,
      timeB: this.EndDateTime,
      groupId: this.selectedGroup,
      room: this.selectedRoom,
      minyanType: minyan,
      createdBy: this.localstoragedataService.getLoginUserId(),
      isNew: true,
      showAErrorMessage: false,
      showBErrorMessage: false,
      showRoomErrorMessage: false,
    });
    this.formGroups.push(newItem);
  }

  addDefaultNewRow() {
    let minyan = this.getMinyanType(this.dynamicTabName);
    let DefaultGroupId = 0;
    let newItem = this.fb.group({
      timeA: this.StartDateTime,
      timeB: this.EndDateTime,
      groupId: DefaultGroupId,
      room: this.selectedRoom,
      minyanType: minyan,
      createdBy: this.localstoragedataService.getLoginUserId(),
      isNew: true,
      showAErrorMessage: false,
      showBErrorMessage: false,
      showRoomErrorMessage: false,
    });
    this.defaultFormGroups.push(newItem);
  }

  selectGroupList(selectedGrp, isnewGroupClicked) {
    this.isnewGroupClicked = isnewGroupClicked;
    if (isnewGroupClicked) {
      var selected = selectedGrp + 1;
      setTimeout(() => {
        $("#dynamicminyanim-inner-0" + selected).tab("show");
      }, 100);
    }
    this.selectedGroup = selectedGrp;
    const selectedGroup = this.groups.find(
      (group) => group.groupId === this.selectedGroup
    );

    if (selectedGroup) {
      this.addNewTab(selectedGroup.groupNameJewish);
    }
    this.onGroupList(false);
    this.groupList
      .filter((x) => x.groupId == selectedGrp)
      .map((x) => (x.timelist = false));
    this.newGroupList
      .filter((x) => x.groupId == selectedGrp)
      .map((x) => (x.timelist = false));
  }

  dynamicSelectGroupList(selectedGrp, indx) {
    const selectedGroup = this.groupList.find(
      (group) => group.groupId === selectedGrp
    );
    if (selectedGroup) {
      this.selectedGroup = selectedGrp;
      this.dynamicAddNewTab(selectedGroup.groupNameJewish);
    }
    this.onGroupList(false);
    for (let i = 0; i < this.groupList.length; i++) {
      if (this.groupList[indx] == this.groupList[i]) {
        this.groupList[indx].timelist = false;
      } else {
        if (this.dynamicTabs.length == 1) {
          this.groupList[i].timelist = null;
          for (let j = 0; j < this.SelectedAllTabs.length; j++) {
            if (this.groupList[i].groupNameJewish == this.SelectedAllTabs[j]) {
              this.groupList[i].timelist = false;
            } else {
              this.groupList[i].timelist = null;
            }
          }
        }
      }
    }

    if (this.dynamicTabs.length > 1) {
      const updatedArrayA = this.groupList.map((aItem) => {
        if (
          !this.dynamicTabs.some(
            (bItem) => bItem.groupName === aItem.groupNameJewish
          )
        ) {
          if (aItem.timelist === false) {
            return { ...aItem, timelist: null };
          }
        }
        return aItem;
      });
      this.groupList = updatedArrayA;
    }
  }

  dynamicAddNewTab(groupName: string) {
    this.count = this.count + 1;
    const upd_obj = this.dynamicTabs.map((obj) => {
      if (obj.uId == this.uniqueId) {
        obj.groupName = groupName;
        obj.tabId = this.count;
        return obj;
      }
      return obj;
    });

    this.dynamicTabs = upd_obj;
    let sgrpId = this.selectedGroup;

    this.sGroupId = sgrpId;
    let minyanType = this.getMinyanType(this.dynamicTabName);
    this.getTimesList(sgrpId, minyanType);
  }
  //code for dynamic tabs ended

  onDeletetimes(minyanId, isDefault) {
    this.isfromNewGroup = true;
    let reqParams = {
      minyanIds: [minyanId],
    };
    let minyanType = this.getMinyanType(this.dynamicTabName);
    this.isloading = true;
    this.minyanimService.deleteTimes(reqParams).subscribe((res: any) => {
      this.notificationService.swalAlert("Delete!", res, "success");
      setTimeout(() => {
        this.addNewRow();
      }, 3000);
      if (isDefault) {
        this.getDefaultTimesList(this.defaultValue, minyanType, true);
        return;
      }
      this.getTimesList(this.sGroupId, minyanType);
    });
  }

  addNewTab(groupName: string) {
    const tabId = `minyanim-inner-0${this.dynamicTabs.length + 1}`;
    this.tabIdname = tabId;
    this.tabIdarr.push(tabId);
    const tabLink = `<li><a href="#${tabId}" data-toggle="tab">${groupName}</a></li>`;
    const tabContent = `<div class="tab-pane" id="${tabId}">${groupName} Content</div>`;

    // Find the existing tab list
    const tabs = document.querySelector(".nav-tabs");

    // Check if there are existing tabs, and if so, insert the new tab to the right of the last tab
    if (tabs.children.length > 0) {
      const lastTab = tabs.children[tabs.children.length - 1];
      lastTab.insertAdjacentHTML("afterend", tabLink);
    } else {
      // If no existing tabs, insert the new tab as the first tab
      tabs.insertAdjacentHTML("beforeend", tabLink);
    }

    // Add the new tab content to the tab-content container
    const tabContentContainer = document.querySelector(".tab-content");
    tabContentContainer.insertAdjacentHTML("beforeend", tabContent);
    // Add the new tab Id to the dynamicTabs array
    let sgrpId = this.selectedGroup;
    this.selectGrp = this.selectedGroup;
    let isShowDropDown = false;

    let uId = sgrpId * 4 + this.uniqueId;
    this.uniqueId = uId;
    this.dynamicTabs.push({ tabId, groupName, sgrpId, isShowDropDown, uId });
    // Set the newly added tab as active
    this.activeTab = tabId;

    if (this.dynamicTabName == this.tabName) {
      if (this.isDefaultTabOpen == true) {
        this.isDefaultTab = false;
        this.isDefaultTabOpen = true;
      } else if (this.isnewGroupClicked) {
        this.isDefaultTab = false;
      }
    } else if (this.dynamicTabName == this.tabName1) {
      if (this.isDefaultTabOpen == true) {
        this.isDefaultTab1 = false;
        this.isDefaultTabOpen = true;
      }
    } else {
      if (this.isDefaultTabOpen == true) {
        this.isDefaultTab2 = false;
        this.isDefaultTabOpen = true;
      }
    }
    this.tabDataLoading(
      { tabId, groupName, sgrpId, uId },
      this.dynamicTabName,
      this.isDynamicTabClicked
    );
    this.clearDropdowns();
  }

  selectGroup(selectedGrp, index, indx, tab) {
    this.clearDropdowns();
    this.toggledropdownif(index, tab);
    this.dynamicSelectGroupList(selectedGrp, indx);
  }

  removeGroup(tabId) {
    this.tabDropdownStates[tabId.groupName] =
      !this.tabDropdownStates[tabId.groupName];
    let filteredData = this.groupList.filter(
      (group) => group.groupNameJewish === tabId.groupName
    );

    // Find the index of the tab to be removed
    const tabIndex = this.dynamicTabs.indexOf(tabId);

    if (tabIndex !== -1 && filteredData[0].groupNameJewish == tabId.groupName) {
      // Remove the tab from the dynamicTabs array
      for (let i = 0; i < this.groupList.length; i++) {
        if (this.groupList[i].groupId == filteredData[0].groupId) {
          this.groupList[i].timelist = null;
        }
      }
      this.dynamicTabs.splice(tabIndex, 1);
      this.SelectedAllTabs = this.SelectedAllTabs.filter(
        (item) => item !== tabId.groupName
      );
      // Remove the tab from the DOM
      const tabElement = document.getElementById(tabId);
      if (tabElement) {
        tabElement.remove();
      }
      let tablen = tabIndex - 1;
      if (tablen !== -1) {
        const previousTab = this.dynamicTabs[tablen].tabId;
        const id = this.dynamicTabs[tablen].sgrpId;
        let minyanType = this.getMinyanType(this.dynamicTabName);
        this.getTimesList(id, minyanType);
        this.activeTab = previousTab;

        if (this.dynamicTabName == this.tabName) {
          this.dynamicSelectedGroup = id;
          return;
        }

        if (this.dynamicTabName == this.tabName1) {
          this.dynamicSelectedGroup1 = id;
          return;
        }

        if (this.dynamicTabName == this.tabName2) {
          this.dynamicSelectedGroup2 = id;
          return;
        }
      } else {
        let minyanType = this.getMinyanType(this.dynamicTabName);
        this.getDefaultTimesList(this.defaultValue, minyanType, true);

        if (this.dynamicTabName == this.tabName) {
          this.isDefaultTab = true;
          this.minyanDefault = true;
          return;
        }

        if (this.dynamicTabName == this.tabName1) {
          this.isDefaultTab1 = true;
          this.minyanDefault1 = true;
          return;
        }

        if (this.dynamicTabName == this.tabName2) {
          this.isDefaultTab2 = true;
          this.minyanDefault2 = true;
          return;
        }
      }
    }
  }

  tabDataLoading(tab, tabname, isDynamicTabClicked) {
    this.selectGrp = tab.sgrpId;
    this.sGroupId = tab.sgrpId;
    this.uniqueId = tab.uId;
    this.selectedGroup = tab.sgrpId;
    this.isloading = false;
    if (this.repeatedId != tab.sgrpId) {
      let minyanType = this.getMinyanType(this.dynamicTabName);
      this.getTimesList(tab.sgrpId, minyanType);
    }
    this.repeatedId = tab.sgrpId;

    this.updateDropdownValues(tabname, tab.groupName);
    this.activeTab = tab.tabId;
    if (isDynamicTabClicked == true) {
      if (this.dynamicTabName == this.tabName) {
        if (this.isDefaultTabOpened == true) {
          this.minyanDefault = false;
        }
        if (this.istabClicked) {
          this.minyanDefault = false;
        }
      } else if (this.dynamicTabName == this.tabName1) {
        this.minyanDefault1 = false;
      } else {
        this.minyanDefault2 = false;
      }
    }
  }

  //SHTIBEL code started
  getAllShtibelRoom() {
    this.isloading1 = true;
    var eventGuid = this.localstoragedataService.getLoginUserEventGuId();
    var macAddress = this.localstoragedataService.getLoginUserGuid();
    this.minyanimService
      .getRoomsList(macAddress, eventGuid)
      .subscribe((res: any) => {
        if (res) {
          this.shtibelGridFilterData = res;
          this.gridData = res;
          this.isloading = false;
        }
      });
  }

  addNewshtibelRoom() {
    this.modalOptions = {
      centered: true,
      size: "md",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup new_apikey api-form create_reason",
    };
    const modalRef = this.commonMethodService.openPopup(
      AddShtibelPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.emtOutputRoomAdded.subscribe((res: any) => {
      if (res) {
        this.getAllShtibelRoom();
      }
    });
  }

  editRoomPopup(item) {
    this.modalOptions = {
      centered: true,
      size: "md",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup new_apikey api-form create_reason",
    };
    const modalRef = this.commonMethodService.openPopup(
      AddShtibelPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.editpop = "editMode";
    modalRef.componentInstance.data = item;
    modalRef.componentInstance.emtOutputRoomAdded.subscribe((res: any) => {
      if (res) {
        this.getAllShtibelRoom();
      }
    });
  }

  delete(roomId) {
    this.minyanimService.delete(roomId).subscribe((res: any) => {
      this.isloading = false;
      this.getAllShtibelRoom();
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
    });
  }

  // Time field formatting code started
  onTimeAInputChange(time, index) {
    const timePattern = /^(0?[1-9]|1[0-2]):([0-5]\d) (AM|PM)$/;

    if (timePattern.test(time)) {
      // Parsing the input time in "hh:mm AM/PM" format
      const [_, hoursStr, minutesStr, period] = time.match(timePattern);
      const hours = parseInt(hoursStr);
      const minutes = parseInt(minutesStr);

      if (
        (period === "AM" || period === "PM") &&
        hours >= 1 &&
        hours <= 12 &&
        minutes >= 0 &&
        minutes <= 59
      ) {
        this.formattedTime = `${hoursStr}:${minutesStr} ${period}`;
        this.formGroups[index].value.timeA = this.formattedTime;
        this.formGroups[index].value.showAErrorMessage = false;
        this.formGroups[index].value.showRoomErrorMessage = false;
        this.isDefaultA = true;
      } else {
        this.formattedTime = "";
        this.formGroups[index].value.showAErrorMessage = true;
      }
    } else {
      this.formattedTime = "";
      this.formGroups[index].value.showAErrorMessage = true;
    }
  }

  onTimeBInputChange(time, index) {
    const timePattern = /^(0?[1-9]|1[0-2]):([0-5]\d) (AM|PM)$/;

    if (timePattern.test(time)) {
      // Parsing the input time in "hh:mm AM/PM" format
      const [_, hoursStr, minutesStr, period] = time.match(timePattern);
      const hours = parseInt(hoursStr);
      const minutes = parseInt(minutesStr);

      if (
        (period === "AM" || period === "PM") &&
        hours >= 1 &&
        hours <= 12 &&
        minutes >= 0 &&
        minutes <= 59
      ) {
        this.formattedTime = `${hoursStr}:${minutesStr} ${period}`;
        this.formGroups[index].value.timeB = this.formattedTime;
        this.formGroups[index].value.showBErrorMessage = false;
        this.formGroups[index].value.showRoomErrorMessage = false;
        this.isDefaultB = true;
      } else {
        this.formattedTime = "";
        this.formGroups[index].value.showBErrorMessage = true;
      }
    } else {
      this.formattedTime = "";
      this.formGroups[index].value.showBErrorMessage = true;
    }
  }
  // Time field formatting code ended

  clearDropdowns() {
    this.selectedGroup1 = null;
    this.selectedGroup2 = null;
    this.selectedGroup3 = null;
  }

  getIdByGroupName(groupName: string) {
    let group = this.groups.filter((x) => x.groupNameJewish == groupName);
    return group[0].groupId;
  }

  tabClick(tabname) {
    this.dynamicTabName = tabname;
    this.defaultTabOpening();
  }

  updateDropdownValues(tabname, groupName) {
    let newID = this.getIdByGroupName(groupName);

    if (tabname == this.tabName) {
      this.dynamicSelectedGroup = newID;
      this.dynamicSelectedGroup1 = undefined;
      this.dynamicSelectedGroup2 = undefined;
    } else if (tabname == this.tabName1) {
      this.dynamicSelectedGroup1 = newID;
      this.dynamicSelectedGroup = undefined;
      this.dynamicSelectedGroup2 = undefined;
    } else {
      this.dynamicSelectedGroup2 = newID;
      this.dynamicSelectedGroup1 = undefined;
      this.dynamicSelectedGroup = undefined;
    }
  }

  defaultTabOpening() {
    if (this.dynamicTabName == this.tabName) {
      this.minyanDefault = true;
    } else if (this.dynamicTabName == this.tabName1) {
      this.minyanDefault1 = true;
    } else {
      this.minyanDefault2 = true;
    }
    let minyanType = this.getMinyanType(this.dynamicTabName);
    this.getDefaultTimesList(this.defaultValue, minyanType, false);
  }

  //   getDefaultTimesList(selectedGroupId:string,minyanType: string) {
  //     let eventGuId = this.localstoragedataService.getLoginUserEventGuId();

  //     this.minyanimService.getTimesList(eventGuId).subscribe((res: any) => {
  //       this.isloading=false;
  //       this.isSaved=false;
  //       this.grouplistresponse = res;
  //       if(this.dynamicTabName == "minyanim-02"){
  //          this.tabOpen=1
  //       }else if(this.dynamicTabName == "minyanim-03"){
  //         this.tabOpen=2
  //       }else{
  //         this.tabOpen=0
  //       }
  //         this.groupLists= res[this.tabOpen] ? res[this.tabOpen].groupList : null

  //         if(this.groupLists){
  // const dynamicTabsGroupNames = this.groupLists.map(tab => tab.groupId);

  // this.groutabIds = dynamicTabsGroupNames
  // const groupListGroupNames = this.groups.map(group => group.groupId);
  // const filteredGroupList = this.groups.filter(
  //   group => !dynamicTabsGroupNames.includes(group.groupId)
  // );
  // this.groupList= filteredGroupList;
  //         this.groupIds = this.groupLists.map(group => group.groupId);

  //         if(this.istabClicked==false) {
  //         this.groupIds.forEach(groupId => {
  //           this.selectGroupList(groupId,false);
  //         });}
  //         this.istabClicked=true;
  //       this.defaultTimeList = res;
  //       this.gridDefaultFilterData = [];
  //       }
  //       if (selectedGroupId) {
  //        let selectedGroup = res.filter((x)=> x.minyanType == minyanType).find(x => x.groupList.some(y => y.groupId === 0 || y.groupName === selectedGroupId));

  //         if (selectedGroup) {
  //           selectedGroup.groupList.forEach(x => {
  //             if (x.groupId === 0 || x.groupName === selectedGroupId) {
  //               x.timelist.forEach(time => {
  //                 let timeA = this.convertToAmPmTime(time.timeA);
  //                 let timeB = this.convertToAmPmTime(time.timeB);
  //                 let modifiedTime = {
  //                   ...time,
  //                   timeA: timeA,
  //                   timeB: timeB
  //                 };
  //                 this.gridDefaultFilterData.push(modifiedTime);
  //               });
  //             }
  //           });
  //           this.initDefaultFormData()
  //         }else{
  //           let nullData = res.filter((x)=> x.minyanType == null || x.minyanType === '').find(x => x.groupList.some(y => y.groupId === 0 || y.groupName === selectedGroupId));
  //           if(nullData){
  //             nullData.groupList.forEach(x => {
  //               if (x.groupId === 0 || x.groupName === selectedGroupId) {
  //                 x.timelist.forEach(time => {
  //                   let timeA = this.convertToAmPmTime(time.timeA);
  //                   let timeB = this.convertToAmPmTime(time.timeB);
  //                   let modifiedTime = {
  //                     ...time,
  //                     timeA: timeA,
  //                     timeB: timeB
  //                   };
  //                   this.gridDefaultFilterData.push(modifiedTime);
  //                 });
  //               }
  //             });
  //           }
  //           this.initDefaultFormData()
  //         }
  //       } else {
  //         res.forEach(x => {
  //           x.groupList.forEach(y => {
  //             y.timelist.forEach(z => {
  //               this.gridDefaultFilterData.push(z);
  //             });
  //           });
  //         });
  //       }
  //     })

  //   }

  //updated getDefaultTimesList code started
  getDefaultTimesList(
    selectedGroupId: string,
    minyanType: string,
    isCrud?: Boolean
  ) {
    if (this.grouplistresponse.length > 0 && !isCrud) {
      this.processDefaultTimesList(
        selectedGroupId,
        minyanType,
        this.grouplistresponse
      );
      return;
    }

    let eventGuId = this.localstoragedataService.getLoginUserEventGuId();
    this.minyanimService.getTimesList(eventGuId).subscribe((res: any) => {
      this.isloading = false;
      if (res) {
        this.processDefaultTimesList(selectedGroupId, minyanType, res);
      }
    });
  }

  processDefaultTimesList(
    selectedGroupId: string,
    minyanType: string,
    res: any
  ) {
    if (res) {
      this.isSaved = false;
      this.grouplistresponse = res;

      if (this.dynamicTabName == "minyanim-02") {
        this.tabOpen = res.findIndex(
          (item: any) => item.minyanType === "Mincha"
        );
      } else if (this.dynamicTabName == "minyanim-03") {
        this.tabOpen = res.findIndex(
          (item: any) => item.minyanType === "Maariv"
        );
      } else {
        this.tabOpen = 0;
      }

      this.groupLists = res[this.tabOpen] ? res[this.tabOpen].groupList : null;
      if (this.groupLists) {
        const dynamicTabsGroupNames = this.groupLists.map((tab) => tab.groupId);

        this.groutabIds = dynamicTabsGroupNames;

        const groupListGroupNames = this.groups.map((group) => group.groupId);

        const filteredGroupList = this.groups.filter(
          (group) => !dynamicTabsGroupNames.includes(group.groupId)
        );

        this.groupList = filteredGroupList;

        this.groupIds = this.groupLists.map((group) => group.groupId);

        if (this.istabClicked == false) {
          this.groupIds.forEach((groupId) => {
            this.selectGroupList(groupId, false);
          });
        }

        this.istabClicked = true;
        this.defaultTimeList = res;
        this.gridDefaultFilterData = [];

        if (selectedGroupId) {
          let selectedGroup = res
            .filter((x) => x.minyanType == minyanType)
            .find((x) =>
              x.groupList.some(
                (y) => y.groupId === 0 || y.groupName === selectedGroupId
              )
            );
          if (selectedGroup) {
            selectedGroup.groupList.forEach((x) => {
              if (x.groupId === 0 || x.groupName === selectedGroupId) {
                x.timelist.forEach((time) => {
                  let timeA = this.convertToAmPmTime(time.timeA);
                  let timeB = this.convertToAmPmTime(time.timeB);
                  let modifiedTime = {
                    ...time,
                    timeA: timeA,
                    timeB: timeB,
                  };
                  this.gridDefaultFilterData.push(modifiedTime);
                });
              }
            });
            this.initDefaultFormData();
          } else {
            let nullData = res
              .filter((x) => x.minyanType == null || x.minyanType === "")
              .find((x) =>
                x.groupList.some(
                  (y) => y.groupId === 0 || y.groupName === selectedGroupId
                )
              );
            if (nullData) {
              nullData.groupList.forEach((x) => {
                if (x.groupId === 0 || x.groupName === selectedGroupId) {
                  x.timelist.forEach((time) => {
                    let timeA = this.convertToAmPmTime(time.timeA);
                    let timeB = this.convertToAmPmTime(time.timeB);
                    let modifiedTime = {
                      ...time,
                      timeA: timeA,
                      timeB: timeB,
                    };
                    this.gridDefaultFilterData.push(modifiedTime);
                  });
                }
              });
            }
            this.initDefaultFormData();
          }
        } else {
          res.forEach((x) => {
            x.groupList.forEach((y) => {
              y.timelist.forEach((z) => {
                this.gridDefaultFilterData.push(z);
              });
            });
          });
        }
      } else {
        this.defaultFormGroups = [];
      }
    }
  }
  //updated getDefaultTimesList code ended

  // Default Tab Time field formatting code started
  onDefaultTimeAInputChange(time, index) {
    const timePattern = /^(0?[1-9]|1[0-2]):([0-5]\d) (AM|PM)$/;

    if (timePattern.test(time)) {
      // Parsing the input time in "hh:mm AM/PM" format
      const [_, hoursStr, minutesStr, period] = time.match(timePattern);
      const hours = parseInt(hoursStr);
      const minutes = parseInt(minutesStr);
      if (
        (period === "AM" || period === "PM") &&
        hours >= 1 &&
        hours <= 12 &&
        minutes >= 0 &&
        minutes <= 59
      ) {
        this.formattedTime = `${hoursStr}:${minutesStr} ${period}`;
        this.defaultFormGroups[index].value.timeA = this.formattedTime;
        this.defaultFormGroups[index].value.showAErrorMessage = false;
        this.defaultFormGroups[index].value.showRoomErrorMessage = false;
        this.isDefaultA = true;
      } else {
        this.formattedTime = "";
        this.defaultFormGroups[index].value.showAErrorMessage = true;
      }
    } else {
      this.formattedTime = "";
      this.defaultFormGroups[index].value.showAErrorMessage = true;
    }
  }

  onDefaultTimeBInputChange(time, index) {
    const timePattern = /^(0?[1-9]|1[0-2]):([0-5]\d) (AM|PM)$/;

    if (timePattern.test(time)) {
      // Parsing the input time in "hh:mm AM/PM" format
      const [_, hoursStr, minutesStr, period] = time.match(timePattern);
      const hours = parseInt(hoursStr);
      const minutes = parseInt(minutesStr);
      if (
        (period === "AM" || period === "PM") &&
        hours >= 1 &&
        hours <= 12 &&
        minutes >= 0 &&
        minutes <= 59
      ) {
        this.formattedTime = `${hoursStr}:${minutesStr} ${period}`;
        this.defaultFormGroups[index].value.timeB = this.formattedTime;
        this.defaultFormGroups[index].value.showBErrorMessage = false;
        this.defaultFormGroups[index].value.showRoomErrorMessage = false;
        this.isDefaultB = true;
      } else {
        this.formattedTime = "";
        this.defaultFormGroups[index].value.showBErrorMessage = true;
      }
    } else {
      this.formattedTime = "";
      this.defaultFormGroups[index].value.showBErrorMessage = true;
    }
  }
  // Default Tab Time field formatting code ended

  getMinyanType(dynamicTabName) {
    if (dynamicTabName === "minyanim-01") {
      return "Shachris";
    } else if (dynamicTabName === "minyanim-02") {
      return "Mincha";
    } else {
      return "Maariv";
    }
  }

  onDefaultRoomInputChange(roomId) {
    if (roomId !== null && roomId.length !== 0) {
      let newData = this.defaultFormGroups.filter((x) => x.value.isNew == true);
      for (let i = 0; i < newData.length; i++) {
        newData[i].value.showRoomErrorMessage = false;
        this.isRoom = true;
      }
    }
  }

  onDynamicRoomInputChange(roomId) {
    if (roomId !== null && roomId.length !== 0) {
      let newData = this.formGroups.filter((x) => x.value.isNew == true);
      for (let i = 0; i < newData.length; i++) {
        newData[i].value.showRoomErrorMessage = false;
        this.isRoom = true;
      }
    }
  }

  convertToTimeStampTime(timeInput) {
    const timeRegex = /^(\d{1,2}):(\d{2})\s(AM|PM)$/;
    if (timeRegex.test(timeInput)) {
      let match = timeInput.match(timeRegex);
      let hours = parseInt(match[1]);
      let minutes = parseInt(match[2]);
      let ampm = match[3];

      // Convert to 24-hour format
      if (ampm === "PM" && hours < 12) {
        hours += 12;
      } else if (ampm === "AM" && hours === 12) {
        hours = 0;
      }

      // Create a new Date object and set the time
      let timestampDate = new Date();
      timestampDate.setHours(hours, minutes, 0, 0);
      return timestampDate.toTimeString().slice(0, 8);
    } else {
      return "";
    }
  }

  convertToAmPmTime(convertedTime) {
    const timeRegex = /^(\d{2}:\d{2}:\d{2})$/;
    if (timeRegex.test(convertedTime)) {
      let match = convertedTime.match(timeRegex);
      let timeParts = match[1].split(":");
      let hours = parseInt(timeParts[0]);
      let minutes = parseInt(timeParts[1]);

      // Convert to AM/PM format
      let ampm = hours >= 12 ? "PM" : "AM";
      let ampmHours = hours > 12 ? hours - 12 : hours;
      let ampmTime = `${ampmHours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")} ${ampm}`;
      return ampmTime;
    } else {
      return "";
    }
  }

  initDefaultFormData() {
    this.defaultFormGroups = [];
    this.gridDefaultFilterData.forEach((item) => {
      const group = this.fb.group({
        room: [item.roomId],
        timeA: [item.timeA],
        timeB: [item.timeB],
        minyanId: [item.minyanId],
        showAErrorMessage: false,
        showBErrorMessage: false,
        showRoomErrorMessage: false,
        isNew: false,
        groupId: 0,
        minyanType: this.getMinyanType(this.dynamicTabName),
      });
      this.defaultFormGroups.push(group);

      group.valueChanges.subscribe((formValues) => {
        this.defaultFormGroups = this.defaultFormGroups.map((group, index) => {
          if (group.value.minyanId === formValues.minyanId) {
            group.value.isNew = true;
            this.isRoom = true;
            this.onDefaultTimeAInputChange(group.value.timeA, index);
            this.onDefaultTimeBInputChange(group.value.timeB, index);
          }
          return group;
        });
      });
    });
  }

  initFormData() {
    this.formGroups = [];
    this.gridFilterData.forEach((item) => {
      const group = this.fb.group({
        room: [item.roomId],
        timeA: [item.timeA],
        timeB: [item.timeB],
        minyanId: [item.minyanId],
        showAErrorMessage: false,
        showBErrorMessage: false,
        showRoomErrorMessage: false,
        isNew: false,
        groupId: this.selectedGroup,
        minyanType: this.getMinyanType(this.dynamicTabName),
      });
      this.formGroups.push(group);

      group.valueChanges.subscribe((formValues) => {
        this.formGroups = this.formGroups.map((group, index) => {
          if (group.value.minyanId === formValues.minyanId) {
            group.value.isNew = true;
            this.isRoom = true;
            this.onTimeAInputChange(group.value.timeA, index);
            this.onTimeBInputChange(group.value.timeB, index);
          }
          return group;
        });
      });
    });
  }

  generateId(index: number, idNum: number): string {
    return `id${idNum}_${index}`;
  }
}
