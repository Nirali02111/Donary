import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import { Component, inject, OnInit } from "@angular/core";
import { NgbModalOptions } from "@ng-bootstrap/ng-bootstrap";
import * as moment from "moment";
import * as XLSX from "xlsx";
import * as FileSaver from "file-saver";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { UserService } from "src/app/services/user.service";
import { EditUserPopupComponent } from "../edit-user-popup/edit-user-popup.component";
import { XLSXService } from "src/app/services/xlsx.service";
import { AnalyticsService } from "src/app/services/analytics.service";

interface UserItem {
  accessToken: null;
  donateExt: null;
  donateExtImageUrl: null;
  donatePhone: null;
  donateWeb: null;
  email: string;
  eventGuid: null;
  eventName: null;
  expiresIn: number;
  firstname: string;
  lastCollectorId: null;
  lastname: string;
  lstUserPermissionModel: null;
  organizationName: null;
  password: null;
  phone: string;
  planTypeId: null;
  planTypeName: null;
  refreshToken: null;
  roleId: null;
  title: string;
  userGUID: null;
  userId: number;
  username: string;
}

@Component({
  selector: "app-user-list",
  templateUrl: "./user-list.component.html",
  styleUrls: ["./user-list.component.scss"],
  standalone: false,
})
export class UserListComponent implements OnInit {
  gridFilterData: Array<UserItem> = [];
  gridData: Array<UserItem> = [];
  totalRecord: number = 0;
  isloading: boolean = false;
  isFiltered: boolean = false;
  filterRecord: number = 0;
  modalOptions: NgbModalOptions;

  isUserFirstNameColVisible: boolean = true;
  isUserLastNameColVisible: boolean = true;
  isUserUserNameColVisible: boolean = true;
  isUserEmailColVisible: boolean = true;
  isUserPhoneColVisible: boolean = true;
  isUserTitleColVisible: boolean = false;
  isUserOrganizationColVisible: boolean = false;
  isUserVersionColVisible: boolean = false;

  colFields = [
    {
      id: 1,
      //title: '',
      isTotalPanel: true,
      items: [
        {
          colName: "First name",
          isVisible: true,
          colId: "firstnameId",
          sortName: "firstname",
        },
        {
          colName: "Last name",
          isVisible: true,
          colId: "lastnameId",
          sortName: "lastname",
        },
        {
          colName: "Email / User",
          isVisible: true,
          colId: "emailId",
          sortName: "email",
        },
        {
          colName: "Phone",
          isVisible: true,
          colId: "phoneId",
          sortName: "phone",
        },
        {
          colName: "Title",
          isVisible: false,
          colId: "titleId",
          sortName: "title",
        },
      ],
    },
  ];
  private analytics = inject(AnalyticsService);

  constructor(
    protected localstoragedataService: LocalstoragedataService,
    public commonMethodService: CommonMethodService,
    protected userService: UserService,
    private xlsxService: XLSXService
  ) {}

  ngOnInit() {
    this.analytics.visitedUsers();
    this.loadData();
    this.commonMethodService.getUserLst().subscribe((res: any) => {
      if (res.items == undefined) {
        this.localstoragedataService.setPermissionLst(
          res.lstUserPermissionModel
        );
        this.loadData();
      }
    });
  }

  loadData() {
    const eventGuId = this.localstoragedataService.getLoginUserEventGuId();
    this.isloading = true;
    this.userService.getUsersList(eventGuId).subscribe(
      (res: Array<UserItem>) => {
        this.isloading = false;
        this.gridFilterData = res;
        this.gridData = res;
        this.totalRecord = this.gridFilterData.length;
      },
      (err) => {
        this.isloading = false;
      }
    );
  }

  dropGroupItem(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
  }

  getConnectedList(): any[] {
    return this.colFields.map((x) => `${x.id}`);
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.colFields, event.previousIndex, event.currentIndex);
    moveItemInArray(
      this.gridFilterData,
      event.previousIndex,
      event.currentIndex
    );
  }

  getTableTdClassName(objHeader) {
    if (
      objHeader.colName === "Payments" ||
      objHeader.colName === "Open Pledges" ||
      objHeader.colName === "Scheduled" ||
      objHeader.colName === "Total" ||
      objHeader.colName === "Count of Payments" ||
      objHeader.colName === "Count of Pledges" ||
      objHeader.colName === "Count of Schedules"
    ) {
      return "total_panel_tbl_th";
    }
  }

  checkGridColVisibility(colName) {
    colName = colName.toLowerCase().replace(/\s/g, "");
    switch (colName) {
      case "username":
        return this.isUserUserNameColVisible;
      case "firstname":
        return this.isUserFirstNameColVisible;
      case "lastname":
        return this.isUserLastNameColVisible;
      case "email/user":
        return this.isUserEmailColVisible;
      case "phone":
        return this.isUserPhoneColVisible;
      case "title":
        return this.isUserTitleColVisible;
    }
  }

  setGridColVisibility($event, colName, isVisible) {
    colName = colName.toLowerCase().replace(/\s/g, "");
    switch (colName) {
      case "firstname":
        this.isUserFirstNameColVisible = isVisible;
        break;
      case "lastname":
        this.isUserLastNameColVisible = isVisible;
        break;
      case "username":
        this.isUserUserNameColVisible = isVisible;
        break;
      case "email/user":
        this.isUserEmailColVisible = isVisible;
        break;
      case "phone":
        this.isUserPhoneColVisible = isVisible;
        break;
      case "title":
        this.isUserTitleColVisible = isVisible;
        break;
    }
    $event.stopPropagation();
  }

  search(keyword) {
    var record = this.gridData;
    var filterdRecord;
    this.totalRecord = this.gridData.length;
    this.isFiltered = false;
    keyword = keyword.toLowerCase().replace(/[().-]/g, "");
    if (keyword != "") {
      var searchArray = keyword.split(" ");
      for (var searchValue of searchArray) {
        filterdRecord = record.filter(
          (obj) =>
            (obj.firstname &&
              obj.firstname.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.lastname &&
              obj.lastname.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.username &&
              obj.username.toLowerCase().toString().indexOf(searchValue) >
                -1) ||
            (obj.email &&
              obj.email.toLowerCase().toString().indexOf(searchValue) > -1) ||
            (obj.phone &&
              obj.phone.toLowerCase().toString().indexOf(searchValue) > -1) ||
            (obj.title &&
              obj.title.toString().toLowerCase().indexOf(searchValue) > -1)
        );
        this.gridFilterData = filterdRecord;
        this.filterRecord = filterdRecord.length;
        this.isFiltered = true;
        record = this.gridFilterData;
      }
    } else {
      this.gridFilterData = this.gridData;
    }
  }

  editUser(userId) {
    this.isloading = false;
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup edit_user admin-page",
    };
    const modalRef = this.commonMethodService.openPopup(
      EditUserPopupComponent,
      this.modalOptions
    );
    var eventGuId = this.localstoragedataService.getLoginUserEventGuId();
    this.userService.getUser(userId, eventGuId).subscribe((res: any) => {
      this.isloading = false;
      modalRef.componentInstance.EditUser = res;
    });
  }

  downloadExcel() {
    this.isloading = true;
    let results = this.gridFilterData.length && this.gridFilterData;
    let data = [];
    if (results) {
      Object.values(results).forEach((item: any) => {
        let row = {};
        if (this.isUserUserNameColVisible) {
          row["UserName"] = item && item.username;
        }
        if (this.isUserFirstNameColVisible) {
          row["First Name"] = item && item.firstname;
        }
        if (this.isUserLastNameColVisible) {
          row["Last Name"] = item && item.lastname;
        }
        if (this.isUserEmailColVisible) {
          row["Email / User"] = item && item.email;
        }
        if (this.isUserPhoneColVisible) {
          row["Phone"] = item && item.email;
        }
        if (this.isUserTitleColVisible) {
          row["Title"] = item && item.title;
        }
        data.push(row);
      });
    } else {
      return;
    }

    const filename = this.xlsxService.getFilename("User List");

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data, {
      cellStyles: true,
    });
    var range = XLSX.utils.decode_range(worksheet["!ref"]);
    for (var C = range.s.r; C <= range.e.r; ++C) {
      var address = XLSX.utils.encode_col(C) + "1"; // <-- first row, column number C
      if (!worksheet[address]) continue;
      worksheet[address].s = { bold: true };
      //worksheet[address]['bold']=true;
    }

    const workbook: XLSX.WorkBook = {
      Sheets: { data: worksheet },
      SheetNames: ["data"],
    };

    const excelBuffer: any = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
      cellStyles: true,
    });

    const excelData: Blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });
    FileSaver.saveAs(excelData, filename);
    this.isloading = false;
  }
}
