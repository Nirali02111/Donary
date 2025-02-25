import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { Subject } from "rxjs";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { UserService } from "src/app/services/user.service";
declare var $: any;
@Component({
  selector: "app-notification-filter",
  templateUrl: "./notification-filter.component.html",
  standalone: false,
  styleUrls: ["./notification-filter.component.scss"],
})
export class NotificationFilterComponent implements OnInit {
  @Output() emtOutputSourceFilterData: EventEmitter<any> = new EventEmitter();

  @Input() set AdvancedFilterData(selectedAdvancedSearchFilter: any) {
    if (selectedAdvancedSearchFilter) {
      this.status = selectedAdvancedSearchFilter;
    }
  }
  @Input() set AdvancedFilterAAData(selectedAdvancedSearchAAFilter: any) {
    if (selectedAdvancedSearchAAFilter) {
      this.commonMethodService.isCommonDropDownloading = true;
      setTimeout(() => {
        let assignee = this.commonMethodService.localAssigneeList.filter(
          (x) => x.id == selectedAdvancedSearchAAFilter
        );
        this.assigneeId = assignee;
      }, 1000);
    } else {
      this.assigneeNames();
      setTimeout(() => {
        this.assigneeId = [];
      }, 1000);
    }
  }
  @Input() set Data(item: any) {
    if (item) {
    }
  }

  @Input() set isTotalPanelOpen(data: any) {
    if (data) {
      this.isTotalPanelVisible = data;
    }
  }

  deviceType = [];
  orderDeviceStatus = [];
  eventName: string;
  product: string;
  device: string;
  activationCode: string;
  macAddress: string;
  plan: string;
  status: string; //="Unread";
  notes: string;
  deviceNum: string;
  simNum: string;
  collector: string;
  campaign: string;
  reason: string;
  location: string;
  isTotalPanelVisible: boolean;
  deviceStatusList: [];
  deviceStatusName: "";
  assigneeList: Array<any> = [];
  assignee: string;
  assigneeId;
  assigneeLoading: boolean = true;
  protected ngUnsubscribe: Subject<void> = new Subject<void>();
  constructor(
    public activeModal: NgbActiveModal,
    public commonMethodService: CommonMethodService,
    public localstoragedataService: LocalstoragedataService,
    protected userService: UserService
  ) {}

  ngOnInit() {
    $(document).ready(function () {
      let modalContent: any = $(".modal");
      modalContent.draggable({
        handle: ".modal-body",
      });
    });

    this.assigneeNames();
  }

  ngOnDestroy() {}
  assigneeNames() {
    const eventGuId = this.localstoragedataService.getLoginUserEventGuId();
    this.userService.getUsersList(eventGuId).subscribe(
      (res) => {
        if (res) {
          this.assigneeLoading = false;
          this.commonMethodService.isCommonDropDownloading = false;
          for (let i = 0; i < res.length; i++) {
            if (res[i].firstname || res[i].lastName) {
              this.assigneeList.push({
                itemName: res[i].firstname + " " + res[i].lastname,
                id: res[i].userId,
              });
            }
            this.commonMethodService.localAssigneeList = this.assigneeList;
          }
        }
      },
      (err) => {}
    );
  }

  searchSource() {
    var obj = {
      status: this.status,
      assigneeId:
        this.assigneeId.length == 0
          ? "null"
          : this.assigneeId.length > 0 && this.assigneeId[0].id,
    };

    this.emtOutputSourceFilterData.emit(obj);
    this.activeModal.dismiss();
  }

  closePopup() {
    this.activeModal.dismiss();
    this.resetSearchBox();
  }

  clearFilter() {
    this.resetSearchBox();
  }

  resetSearchBox() {
    this.status = "0";
    var obj = {
      status: this.status,
      assigneeId: [],
    };
    this.emtOutputSourceFilterData.emit(obj);
    this.assigneeList = [];
    this.activeModal.dismiss();
  }
  removeFilter(filterName) {
    switch (filterName) {
      case "deviceType":
        this.deviceType = [];
        break;
      case "orderDeviceStatus":
        this.orderDeviceStatus = [];
        break;
    }
  }

  onDeSelectAssignee(item: any) {
    this.assigneeId = [];
  }

  SelectAssignee(data) {
    let assignee = this.assigneeList.filter((x) => x.id == data.id);
    this.assignee = assignee[0].id;
    this.assigneeId = assignee;
  }
}
