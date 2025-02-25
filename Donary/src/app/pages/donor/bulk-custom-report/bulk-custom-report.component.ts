import { Component, Input, OnInit } from "@angular/core";
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { NgbActiveModal, NgbModalOptions } from "@ng-bootstrap/ng-bootstrap";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { DonorService } from "src/app/services/donor.service";
import { MessengerService } from "src/app/services/messenger.service";
import { PrintableReportService } from "src/app/services/printable-report.service";
import { TotalPanelService } from "src/app/services/totalpanel.service";
import Swal from "sweetalert2";

import { PdfviewerPopupComponent } from "../../cards/payment-card-popup/pdfviewer-popup/pdfviewer-popup.component";
declare var $: any;
interface PanelRes {
  openPledges: number;
  payments: number;
  raised: number;
  scheduled: number;
  accountId: number;
  reasonId: number;
  campaignId: number;
  collectorId: number;
  deviceId: number;
  locationId: number;
}
@Component({
  selector: "app-bulk-custom-report",
  templateUrl: "./bulk-custom-report.component.html",
  standalone: false,
  styleUrls: ["./bulk-custom-report.component.scss"],
})
export class BulkCustomReportComponent implements OnInit {
  isloading: boolean = false;

  modalOptions: NgbModalOptions;
  customReportActionForm: UntypedFormGroup;

  donorList: Array<number> = [];

  stateList: Array<{ label: string; value: string }> = [
    {
      label: "Labels",
      value: "1",
    },
    {
      label: "General Donors List",
      value: "2",
    },
  ];
  selectList;
  bulkDonorList: any = [];
  includeTotals: boolean = false;
  checkIsTotalPanelVisible = false;
  isRunBtnDisable = true;
  generateReportUrl: string;
  customRepostList = [
    { id: "1", itemName: "Labels" },
    { id: "2", itemName: "General Donors List" },
    { id: "3", itemName: "Donors Total Report" },
  ];
  @Input() set SelectedIds(list: Array<number>) {
    if (list && list.length !== 0) {
      this.donorList = list;
    }
  }
  @Input() set reportObj(obj) {
    if (obj) {
      this.customRepostList.push({ id: "4", itemName: obj.reportName });
      this.generateReportUrl = obj.generateReportUrl;
    }
  }
  @Input() set isTotalPanelVisible(list: boolean) {
    this.includeTotals = list;
    this.checkIsTotalPanelVisible = list;
  }
  @Input() set BulkDonorList(list) {
    if (list) {
      for (var res of list) {
        var HomePhone = "";
        var CellPhone = "";
        if (res[0].phoneLabels2) {
          var arrayPhones = res[0].phoneLabels2.split("<br>");
          const p = arrayPhones.filter((item) => {
            var home = item.split("H: ");
            var cell = item.split("c: ");
            if (home[1]) {
              HomePhone = home[1];
            }
            if (cell[1]) {
              CellPhone = cell[1];
            }
          });
        }
        var donordetails: any = [];
        donordetails = {
          AccountID: res[0].accountId,
          FirstNameJewish: res[0].firstNameJewish,
          LastNameJewish: res[0].lastNameJewish,
          FirstName: res[0].firstName,
          LastName: res[0].lastName,
          Father: res[0].father,
          FatherInLaw: res[0].fatherInLaw,
          HomePhone: HomePhone,
          CellPhone: CellPhone,
          EmailAddresses: res[0].emails,
          Address: res[0].address,
          CityStateZip: res[0].cityStateZip,
          Payments: res[0].payments,
          Pledges: res[0].openPledges,
          Scheduled: res[0].scheduled,
          Total: res[0].raised,
        };
        this.bulkDonorList.push(donordetails);
      }
    }
  }
  constructor(
    public activeModal: NgbActiveModal,
    private fb: UntypedFormBuilder,
    private messengerService: MessengerService,
    private localstoragedataService: LocalstoragedataService,
    private donorService: DonorService,
    public commonMethodService: CommonMethodService,
    private totalPanelService: TotalPanelService,
    private printableReport: PrintableReportService
  ) {}

  get ActionControl() {
    return this.customReportActionForm.get("action");
  }

  ngOnInit() {
    this.customReportActionForm = this.fb.group({
      action: this.fb.control("", Validators.required),
    });
  }

  closePopup() {
    this.activeModal.dismiss();
  }

  onSubmit() {
    if (this.ActionControl.invalid) {
      return;
    }
    if (this.ActionControl.value[0].id === "1") {
      this.onLabels();
    }

    if (this.ActionControl.value[0].id === "2") {
      this.onColumn();
    }
    if (this.ActionControl.value[0].id === "3") {
      if (!this.checkIsTotalPanelVisible) {
        this.getTotalPanel();
      } else {
        this.getDonarsReport();
      }
    }
    if (this.ActionControl.value[0].id === "4") {
      this.getCampaignsComparison();
    }
  }
  onDeSelectAll(event) {
    //this.ActionControl.value[0].id=null;
    //this.selectList=undefined;
  }
  onColumn() {
    const params = {
      EventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      AccountIds: this.donorList,
    };
    const modalRef = this.displayReport();
    this.donorService.getDonorColumns(params).subscribe(
      (res) => {
        if (res) {
          modalRef.componentInstance.filePath = res;
        }
      },
      (error) => {
        modalRef.close();
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

  onLabels() {
    const params = {
      EventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      AccountIds: this.donorList,
    };
    const modalRef = this.displayReport();
    this.donorService.getDonorLabels(params).subscribe(
      (res) => {
        if (res) {
          modalRef.componentInstance.filePath = res;
        }
      },
      (error) => {
        modalRef.close();
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

  displayReport() {
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup print_receipt",
    };
    const modalRef = this.commonMethodService.openPopup(
      PdfviewerPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.Title = "Document print";
    return modalRef;
  }
  getPledgeBalanceDropdown() {
    const params = {
      EventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      AccountIds: this.donorList,
    };
    const modalRef = this.displayReport();
    this.donorService.getPledgeBalance(params).subscribe(
      (res) => {
        if (res) {
          modalRef.componentInstance.filePath = res;
        }
      },
      (error) => {
        modalRef.close();
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
  getDonarsReport() {
    var obj = {
      Donors: this.bulkDonorList,
      IncludeTotals: true, //this.includeTotals
    };
    const modalRef = this.displayReport();
    this.donorService.getDonarsReport(obj).subscribe(
      (res) => {
        if (res) {
          modalRef.componentInstance.filePath = res;
        }
      },
      (error) => {
        modalRef.close();
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
  GetPhoneNumbers(donorDetails) {
    let { phonenumbers, phoneLabels } = donorDetails;
    let rowColumn = [];
    if (phoneLabels) {
      const phoneNumberList = phonenumbers.split(", ");
      if (phoneLabels.indexOf(",") > -1) {
        const phoneLabelArray = phoneLabels.split(", ");
        rowColumn = phoneLabelArray.map((v, index) => ({
          label: v,
          value: phoneNumberList[index],
        }));
      } else {
        rowColumn = [
          {
            label: phoneLabels,
            value: phoneNumberList,
          },
        ];
      }
    }
    return rowColumn;
  }
  onItemSelect(item: any) {
    if (this.selectList && this.selectList.length > 0) {
      this.isRunBtnDisable = false;
    } else {
      this.isRunBtnDisable = true;
    }
  }
  OnItemDeSelect(item: any) {
    if (this.selectList && this.selectList.length > 0) {
      this.isRunBtnDisable = false;
    } else {
      this.isRunBtnDisable = true;
    }
  }
  getTotalPanel() {
    this.isloading = true;

    var objTotalPanel = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
    };

    this.totalPanelService.getTotals(objTotalPanel).subscribe(
      (res: Array<PanelRes>) => {
        this.isloading = false;
        var resultRes = res;
        for (let index = 0; index < resultRes.length; index++) {
          const element = resultRes[index];
          for (let i = 0; i < this.bulkDonorList.length; i++) {
            const dlist = this.bulkDonorList[i];
            if (element.accountId == dlist.AccountID) {
              this.bulkDonorList[i].Payments += element.payments;
              this.bulkDonorList[i].Pledges += element.openPledges;
              this.bulkDonorList[i].Scheduled += element.scheduled;
              this.bulkDonorList[i].Total += element.raised;
            }
          }
        }
        this.getDonarsReport();
      },
      (error) => {
        this.isloading = false;
        console.log(error);
      }
    );
  }
  getCampaignsComparison() {
    const params = {
      orgId: this.localstoragedataService.getLoginUserOrganisationId(),
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      accountIds: this.donorList,
    };
    const modalRef = this.displayReport();
    this.printableReport
      .getCampaignsComparison(params, this.generateReportUrl)
      .subscribe(
        (res) => {
          if (res) {
            modalRef.componentInstance.filePath = res;
          }
        },
        (error) => {
          modalRef.close();
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
