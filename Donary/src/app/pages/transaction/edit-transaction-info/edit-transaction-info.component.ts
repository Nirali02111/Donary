import { Component, OnInit, Input, inject } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { Subject } from "rxjs";
import * as moment from "moment";
import Swal from "sweetalert2";

import { CommonMethodService } from "src/app/commons/common-methods.service";

import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { PaymentService } from "src/app/services/payment.service";
import { PledgeService } from "src/app/services/pledge.service";
import { AnalyticsService } from "src/app/services/analytics.service";

declare var $: any;

interface option {
  id: number;
  itemName: string;
}

@Component({
  selector: "app-edit-transaction-info",
  templateUrl: "./edit-transaction-info.component.html",
  styleUrls: ["./edit-transaction-info.component.scss"],
  standalone: false,
})
export class EditTransactionInfoComponent implements OnInit {
  @Input("types") types: string;
  @Input("transactionIds") transactionIds: Array<number>;
  @Input("checkTypeTransactionIds") checkTypeTransactionIds: Array<number>;
  appliedPledges: boolean = false;
  isPaymentTypeCheck: boolean = false;
  disableDropdown: string;
  @Input() set data(item) {
    if (item) {
      this.isPaymentTypeCheck = item.isPaymentTypeCheck;
      this.appliedPledges = item.appliedPledges;
      this.disableDropdown = this.appliedPledges ? "disable-dropdown" : "";
    }
  }
  @Input() set locations(item) {
    if (item) {
      this.getSelectedLocation(item);
    }
  }
  @Input() set collectors(item) {
    if (item) {
      this.getSelectedCollector(item);
    }
  }

  editAmount: number;
  updateDate: any;

  isloading: boolean = false;

  // models
  selectedPaymentReasons: Array<option> = [];
  selectedFromCampaignList: Array<option> = [];
  paymentLocationList: Array<option> = [];
  paymentCollectorList: Array<option> = [];
  checkStatusList: any = [
    { id: 9, itemName: "Pending" },
    { id: 10, itemName: "Deposited" },
    { id: 3, itemName: "Declined" },
  ];
  checkStatusId: any = [];
  isCheckStatusDwp: boolean = true;
  protected ngUnsubscribe: Subject<void> = new Subject<void>();
  private analytics = inject(AnalyticsService);

  constructor(
    public activeModal: NgbActiveModal,
    public commonMethodService: CommonMethodService,
    public localstoragedataService: LocalstoragedataService,
    public paymentService: PaymentService,
    public pledgeService: PledgeService
  ) {}

  ngOnInit() {
    this.getFeatureSettingValues();
    $(document).ready(function () {
      let modalContent: any = $(".modal");
      modalContent.draggable({
        handle: ".popup_header",
      });
    });
    this.bindData();
  }

  closePopup() {
    this.activeModal.dismiss();
  }

  bindData() {
    this.commonMethodService.bindCommonFieldDropDowns(
      this.ngUnsubscribe,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true
    );
  }

  getDate() {
    return this.updateDate != undefined
      ? this.updateDate.startDate != null
        ? moment(this.updateDate.startDate.format("YYYY-MM-DD")).format(
            "YYYY-MM-DD"
          )
        : null
      : null;
  }

  fieldsArrayToObj() {
    const objReq: any = {
      ReasonId:
        this.selectedPaymentReasons.length !== 0
          ? this.selectedPaymentReasons[0].id
          : null,
    };

    let selectedDateValue = this.getDate();

    if (this.selectedFromCampaignList.length !== 0) {
      objReq.CampaignId = this.selectedFromCampaignList[0].id;
    }

    if (this.paymentLocationList.length !== 0) {
      objReq.LocationId = this.paymentLocationList[0].id;
    }

    if (this.paymentCollectorList.length !== 0) {
      objReq.CollectorId = this.paymentCollectorList[0].id;
    }

    if (this.types === "Payments") {
      objReq.PaymentDate = selectedDateValue;
    }

    if (this.types === "Pledges") {
      objReq.PledgeDate = selectedDateValue;
    }

    return objReq;
  }

  updatePaymentTransactions() {
    if (this.isPaymentTypeCheck) {
      this.bulkUpdateCheckStatus();
    }
    // if(this.appliedPledges && this.paymentTypeCheckHideShow){
    //   return false;
    // }
    const updatedObj = this.fieldsArrayToObj();
    const paymentBulkUpdates = this.transactionIds.map((o) => {
      return {
        PaymentId: o,
        ...updatedObj,
      };
    });

    const bodyData = {
      MacAddress: this.localstoragedataService.getLoginUserEventGuId(),
      UpdatedBy: this.localstoragedataService.getLoginUserId(),
      PaymentBulkUpdates: paymentBulkUpdates,
    };
    this.isloading = true;
    this.paymentService.BulkUpdatePaymentTransactions(bodyData).subscribe(
      (res) => {
        this.isloading = false;
        if (res) {
          this.analytics.bulkEditedPayment();
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
          }).then(() => {
            this.commonMethodService.sendPaymentTrans(true);
            this.closePopup();
          });
        } else {
          Swal.fire({
            title: "Try Again!",
            text: res.errorResponse,
            icon: "error",
            confirmButtonText: this.commonMethodService.getTranslate(
              "WARNING_SWAL.BUTTON.CONFIRM.OK"
            ),
            customClass: {
              confirmButton: "btn_ok",
            },
          }).then(() => {
            this.closePopup();
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
        }).then(() => {
          this.closePopup();
        });
      }
    );
  }

  updatePlegeTransactions() {
    const updatedObj = this.fieldsArrayToObj();

    const pledgeBulkUpdates = this.transactionIds.map((o) => {
      return {
        PledgeId: o,
        ...updatedObj,
      };
    });

    const bodyData = {
      MacAddress: this.localstoragedataService.getLoginUserEventGuId(),
      UpdatedBy: this.localstoragedataService.getLoginUserId(),
      PledgeBulkUpdates: pledgeBulkUpdates,
    };

    this.isloading = true;
    this.pledgeService.BulkUpdatePledgeTransactions(bodyData).subscribe(
      (res) => {
        this.isloading = false;
        if (res) {
          this.analytics.bulkEditedPledge();
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
          }).then(() => {
            this.commonMethodService.sendPledgeTrans(true);
            this.closePopup();
          });
        } else {
          Swal.fire({
            title: "Try Again!",
            text: res.errorResponse,
            icon: "error",
            confirmButtonText: this.commonMethodService.getTranslate(
              "WARNING_SWAL.BUTTON.CONFIRM.OK"
            ),
            customClass: {
              confirmButton: "btn_ok",
            },
          }).then(() => {
            this.closePopup();
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
        }).then(() => {
          this.closePopup();
        });
      }
    );
  }

  update() {
    Swal.fire({
      icon: "warning",
      input: "number",
      showClass: {
        popup: `
              swal2-modal-primary
            `,
      },
      html: `<div>
                 <h2>Edit ${this.transactionIds.length} transactions?</h2>
                 <p>You're editing multiple transactions.</p>
                 <span>To continue, type the amount of transactions you selected. </span>
             </div>`,
      showCloseButton: true,
      confirmButtonText: this.commonMethodService.getTranslate("CONFIRM"),
      confirmButtonColor: "#7b5bc4",
      customClass: {
        confirmButton: "modal-are-you-sure",
      },

      onOpen: function () {
        //$(Swal.getConfirmButton()).prop('disabled', true);
      },
      didOpen: () => {
        $(".swal2-actions").on("click", () =>
          $("#swal2-content + .swal2-input").focus()
        );
      },
      inputValidator: (value: any) => {
        if (value != this.transactionIds.length) {
          return 'Count entered does not match selected count"!';
        } else {
        }
      },
    }).then((result) => {
      if (result.value) {
        if (this.types === "Payments") {
          this.updatePaymentTransactions();
        }

        if (this.types === "Pledges") {
          this.updatePlegeTransactions();
        }
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: this.commonMethodService.getTranslate("CANCELLED"),
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

  disableSendBtn(): Boolean {
    if (this.editAmount) {
      return false;
    }

    return true;
  }
  setClsCheckStatusDrp(item) {
    if (item == "Pending") {
      return "check-pending";
    }
    if (item == "Deposited") {
      return "check-deposited";
    }
    if (item == "Declined") {
      return "check-declined";
    }
  }
  setDropDownSettings(
    placeholder: string,
    itemsShowLimit: number,
    multiple: boolean,
    singleSelection: boolean,
    enableSearch?: boolean,
    enableCheckAll?: boolean,
    position?: string,
    autoPosition?: boolean,
    disabled?: boolean,
    groupBy?: string
  ) {
    return {
      text: placeholder,
      selectAllText: "Select All",
      unSelectAllText: "UnSelect All",
      classes: "myclass custom-class check-status-drop",
      labelKey: "itemName",
      noDataLabel: "No record found with search criteria",
      enableSearchFilter: enableSearch,
      enableCheckAll: enableCheckAll,
      autoPosition: true,
      enableFilterSelectAll: false,
      position: "top",
      multiple: multiple,
      badgeShowLimit: itemsShowLimit,
      searchAutofocus: true,
      singleSelection: singleSelection,
      disabled: disabled,
      groupBy: groupBy,
    };
  }
  onItemSelectCheckStatus(event) {
    let setCls = this.setClsCheckStatusDrp(event.itemName);
    $(".check-status-drop").removeClass("check-pending");
    $(".check-status-drop").removeClass("check-deposited");
    $(".check-status-drop").removeClass("check-declined");
    $(".check-status-drop").addClass(setCls);
  }
  bulkUpdateCheckStatus() {
    let obj = {
      paymentIds: this.checkTypeTransactionIds,
      statusId:
        this.checkStatusId && this.checkStatusId.length > 0
          ? this.checkStatusId[0].id
          : 0,
      updatedBy: this.localstoragedataService.getLoginUserId(),
    };
    this.isloading = true;
    this.paymentService.bulkUpdateCheckStatusPayment(obj).subscribe((res) => {
      this.isloading = false;
      if (res) {
        if (this.appliedPledges) {
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
          }).then(() => {
            this.commonMethodService.sendPaymentTrans(true);
            this.closePopup();
          });
        }
      }
    });
  }
  getFeatureSettingValues() {
    this.commonMethodService.featureName = "Bulk_edit_transactions";
    this.commonMethodService.getFeatureSettingValues();
  }
  onUpgrade() {
    // this.activeModal.dismiss();
    this.commonMethodService.commenSendUpgradeEmail(
      this.commonMethodService.featureDisplayName
    );
  }
  get paymentTypeCheckHideShow() {
    return this.isPaymentTypeCheck == false && this.appliedPledges
      ? "disable-dropdown"
      : "";
  }
  getSelectedLocation(data) {
    let isBulkLocation = data.every(
      (value, index, array) => value.locationId === array[0].locationId
    );
    if (isBulkLocation && data && data.length != 0) {
      this.paymentLocationList.push({
        id: data[0].locationId,
        itemName: data[0].locationName,
      });
    }
  }
  getSelectedCollector(data) {
    let isBulkCollector = data.every(
      (value, index, array) => value.collectorId === array[0].collectorId
    );
    if (isBulkCollector && data && data.length != 0) {
      this.paymentCollectorList.push({
        id: data[0].collectorId,
        itemName: data[0].collectorName,
      });
    }
  }
}
