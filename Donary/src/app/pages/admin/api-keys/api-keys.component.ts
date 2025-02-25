import { Component, inject, OnInit } from "@angular/core";
import { NgbModalOptions } from "@ng-bootstrap/ng-bootstrap";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { PaymentApiGatewayService } from "src/app/services/payment-api-gateway.service";
import Swal from "sweetalert2";
import { AddApikeyPopupComponent } from "./add-apikey-popup/add-apikey-popup.component";
import { AnalyticsService } from "src/app/services/analytics.service";
declare let $: any;
@Component({
  selector: "app-api-keys",
  templateUrl: "./api-keys.component.html",
  styleUrls: ["./api-keys.component.scss"],
  standalone: false,
})
export class ApiKeysComponent implements OnInit {
  modalOptions: NgbModalOptions;
  navTabId: string;
  gridFilterData = [];
  gridData = [];
  totalRecord: number = 0;
  filterRecord: number = 0;
  isFiltered: boolean = false;
  filtercount: number = 1;
  hasNonUSD: boolean;
  private analytics = inject(AnalyticsService);

  constructor(
    public commonMethodService: CommonMethodService,
    public paymentApiGatewayService: PaymentApiGatewayService,
    private localstoragedataService: LocalstoragedataService
  ) {}

  ngOnInit() {
    this.analytics.visitedAPI();
    this.getAllPaymentAPIGateway();
  }

  AddNewApiKey(isAdvancedKeys = false) {
    this.modalOptions = {
      centered: false,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup new_apikey api-form create_reason",
    };
    const modalRef = this.commonMethodService.openPopup(
      AddApikeyPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.keys = {
      isAdvancedKeys: isAdvancedKeys,
      isAddNewApiKey: true,
      gridFilterData: this.gridFilterData,
    };
    modalRef.componentInstance.emtOutputEditApiKeys.subscribe((res: any) => {
      if (res) {
        this.getAllPaymentAPIGateway();
      }
    });
  }

  getAllPaymentAPIGateway() {
    let eventGuId = this.localstoragedataService.getLoginUserEventGuId();
    this.paymentApiGatewayService
      .getAllPaymentAPIGateway(eventGuId)
      .subscribe((res: any) => {
        this.gridFilterData = res;
        this.gridData = res;
        res.forEach((item) => {
          item.countryName = this.commonMethodService.getCountryName(
            item.countryCodeId
          );
          if (item.countryCodeId !== 1 && !!item.countryCodeId) {
            this.commonMethodService.hasNonUSD = true;
          }
        });
      });
  }
  isDefaultGridShow(item) {
    if (item.campaignName || item.reasonName) {
      return false;
    }
    return true;
  }
  copyToClipboard(elementId) {
    let id = "inputId-" + elementId;
    let el = document.getElementById(id);
    el.setAttribute("contenteditable", "true");
    el.focus();
    document.execCommand("selectAll");
    document.execCommand("copy");
    el.setAttribute("contenteditable", "false");
    el.blur();
  }
  search(keyword) {
    var record = this.gridData;
    this.totalRecord = this.gridData.length;
    keyword = keyword.toLowerCase().replace(/[().-]/g, "");
    this.isFiltered = false;
    if (keyword != "") {
      var searchArray = keyword.split(" ");
      var filterdRecord;
      for (var searchValue of searchArray) {
        filterdRecord = record.filter(
          (obj) =>
            (obj.gatewayAPIId &&
              obj.gatewayAPIId.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.gatewayTypeName &&
              obj.gatewayTypeName
                .toString()
                .toLowerCase()
                .indexOf(searchValue) > -1) ||
            (obj.gatewayProviderName &&
              obj.gatewayProviderName
                .toString()
                .toLowerCase()
                .indexOf(searchValue) > -1) ||
            (obj.currencyName &&
              obj.currencyName.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.campaignName &&
              obj.campaignName.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.reasonName &&
              obj.reasonName.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.integrationKey &&
              obj.integrationKey.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.pin &&
              obj.pin.toString().toLowerCase().indexOf(searchValue) > -1)
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
  editOpenApiKeyPopup(isAdvancedKeys = false, item) {
    this.modalOptions = {
      centered: false,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup new_apikey api-form create_reason",
    };
    const modalRef = this.commonMethodService.openPopup(
      AddApikeyPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.keys = {
      isAdvancedKeys: isAdvancedKeys,
      isAddNewApiKey: false,
      gridFilterData: this.gridFilterData,
    };
    modalRef.componentInstance.data = item;
    modalRef.componentInstance.emtOutputEditApiKeys.subscribe((res: any) => {
      if (res) {
        this.getAllPaymentAPIGateway();
      }
    });
  }
  delete(gatewayAPIId) {
    let eventGuId = this.localstoragedataService.getLoginUserEventGuId();
    let deletedBy = this.localstoragedataService.getLoginUserId();
    let obj = {
      eventGuId: eventGuId,
      gatewayAPIId: gatewayAPIId,
      deletedBy: deletedBy,
    };

    this.paymentApiGatewayService.delete(obj).subscribe((res: any) => {
      this.getAllPaymentAPIGateway();
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
}
