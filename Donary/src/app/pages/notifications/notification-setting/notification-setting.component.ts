import { Component, OnInit } from "@angular/core";
import { NotificationSettingPopupComponent } from "../notification-setting-popup/notification-setting-popup.component";

import { NgbModalOptions } from "@ng-bootstrap/ng-bootstrap";

import { CommonMethodService } from "src/app/commons/common-methods.service";
import {
  NotificationService,
  alertRuleResponseObj,
} from "src/app/services/notification.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import Swal from "sweetalert2";
import { UserService } from "src/app/services/user.service";
import { CommonAPIMethodService } from "src/app/services/common-api-method.service";

@Component({
  selector: "app-notification-setting",
  templateUrl: "./notification-setting.component.html",
  styleUrls: ["./notification-setting.component.scss"],
  standalone: false,
})
export class NotificationSettingComponent implements OnInit {
  assigneeList: Array<any> = [];
  eventGuid: string = this.localstoragedataService.getLoginUserEventGuId();
  modalOptions: NgbModalOptions = {
    size: "lg",
    keyboard: true,
    animation: false,
    windowClass: "sidebar_modal setting_modal",
    backdropClass: "sidebar_backdrop",
  };
  gridData: Array<alertRuleResponseObj> = [];
  item: any;
  constructor(
    public commonMethodService: CommonMethodService,
    private notificationService: NotificationService,
    private localstoragedataService: LocalstoragedataService,
    protected userService: UserService,
    private commonAPIMethodService: CommonAPIMethodService
  ) {}

  ngOnInit() {
    this.getSettingsList();
    this.getAssigneeDropdown();
  }
  getSettingsList() {
    this.gridData = [];

    const alertObj = {
      eventGuid: this.eventGuid,
    };
    this.notificationService.getAlertRules(alertObj).subscribe(
      (res) => {
        if (res) {
          this.gridData = res;
        }
      },
      (err) => {
        console.log(err, "error");
      }
    );
  }
  deleteAlert(item) {
    Swal.fire({
      title: this.commonMethodService.getTranslate("WARNING_SWAL.TITLE"),
      icon: "warning",
      text: 'Are you sure you want to delete alert "Payment received on DRM"',
      showCancelButton: true,
      cancelButtonText: "Nevermind",
      confirmButtonText: "Delete",
      showClass: {
        popup: `
              swal2-modal-danger
            `,
      },
    }).then((result) => {
      if (result.value) {
        const deleteObj = {
          ruleId: item.ruleId,
          eventGuid: this.eventGuid,
        };
        this.deleteAction(deleteObj);
      }
    });
  }
  deleteAction(deleteObj) {
    this.notificationService.deleteAlertRule(deleteObj).subscribe(
      (res) => {
        if (res) {
          Swal.fire({
            position: "bottom-end",
            title: "Success!...",
            text: res,
            timer: 3000000,
            confirmButtonColor: "#00b300",
            customClass: {
              confirmButton: "btn-success",
            },
            showClass: {
              popup: `
              swal2-modal-success
            `,
            },
          });

          this.getSettingsList();
        }
      },
      (err) => {
        console.log(err, "error");
      }
    );
  }
  addNewAlert() {
    const modalRef = this.commonMethodService.openPopup(
      NotificationSettingPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.isEdit = false;
    modalRef.componentInstance.saveAlertValues.subscribe((val) => {
      if (val) this.getSettingsList();
    });
  }
  editAlert(item) {
    this.getItemValues(item);
  }

  getItemValues(item) {
    const itemAlertObj = {
      ruleId: item?.ruleId,
      eventGuid: this.eventGuid,
    };
    this.notificationService.getAlertRule(itemAlertObj).subscribe(
      (res) => {
        if (res) {
          this.item = res;
          const modalRef = this.commonMethodService.openPopup(
            NotificationSettingPopupComponent,
            this.modalOptions
          );
          modalRef.componentInstance.isEdit = true;
          modalRef.componentInstance.itemFromParent = item;
          modalRef.componentInstance.item = this.item;
          modalRef.componentInstance.deleteEvent.subscribe((val) => {
            if (val) {
              this.deleteAlert(val);
            }
          });
          modalRef.componentInstance.saveAlertValues.subscribe((val) => {
            if (val) this.getSettingsList();
          });
        }
      },
      (err) => {
        console.log(err, "error");
      }
    );
  }
  getAssigneeDropdown() {
    this.userService.getUsersList(this.eventGuid).subscribe(
      (res) => {
        if (res) {
          for (let i = 0; i < res.length; i++) {
            if (res[i].firstname || res[i].lastName) {
              this.assigneeList.push({
                itemName: res[i].firstname + " " + res[i].lastname,
                id: res[i].userId,
                email: res[i].email,
              });
            }
            this.commonMethodService.localAssigneeList = this.assigneeList;
          }
        }
      },
      (err) => {}
    );
  }
}
