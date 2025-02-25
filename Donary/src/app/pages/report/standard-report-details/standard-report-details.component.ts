import { KeyValuePipe, NgFor, NgIf } from "@angular/common";
import {
  Component,
  OnInit,
  Renderer2,
  TemplateRef,
  ViewChild,
  effect,
  inject,
} from "@angular/core";
import { TranslateModule } from "@ngx-translate/core";
import { StandardarReportFilterPopupComponent } from "../standardar-report-filter-popup/standardar-report-filter-popup.component";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { ActivatedRoute, RouterModule } from "@angular/router";
import { AddNewDropdownModule } from "src/app/commons/modules/add-new-dropdown/add-new-dropdown.module";
import { TabulatorModule } from "src/app/commons/modules/tabulator/tabulator.module";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { TabulatorTableComponent } from "src/app/commons/modules/tabulator/tabulator-table/tabulator-table.component";
import { ColumnDefinitionType } from "src/app/commons/modules/tabulator/interface";
import { DynamicGridReportService } from "src/app/services/dynamic-grid-report.service";
import { SkeletonLoaderModule } from "src/app/commons/modules/skeleton-loader/skeleton-loader.module";
import { delay } from "rxjs/operators";
import { StandardReportSidebarComponent } from "../standard-report-sidebar/standard-report-sidebar.component";
import {
  NgbOffcanvas,
  OffcanvasDismissReasons,
} from "@ng-bootstrap/ng-bootstrap";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { CommonAPIMethodService } from "src/app/services/common-api-method.service";
import { Observable } from "rxjs";
import { AnalyticsService } from "src/app/services/analytics.service";

interface ParamFormGroup {
  name: string;
  gridReportQueryParamId: number;
  uiControl: string;
  uiDataType: string;
  inputValue: any;
}

@Component({
  selector: "app-standard-report-details",
  standalone: true,
  imports: [
    TranslateModule,
    NgIf,
    AddNewDropdownModule,
    TabulatorModule,
    ReactiveFormsModule,
    SkeletonLoaderModule,
    RouterModule,
    StandardReportSidebarComponent,
  ],
  templateUrl: "./standard-report-details.component.html",
  styleUrl: "./standard-report-details.component.scss",
})
export class StandardReportDetailsComponent implements OnInit {
  reportName: string = "";
  filterCount: number = 0;
  reportId: string;
  columnNames: any[] = [];
  columnNames2: any[] = [];
  reportArray: any[] = [];
  reportTableHeaders: any[] = [];
  reportSearch: FormControl = new FormControl();
  @ViewChild(TabulatorTableComponent) tabulator: TabulatorTableComponent;
  filterFormData: {} = {};
  isloading: boolean;
  reportParams: any[];
  skeletonRows: number = 5;
  autoRun: boolean;
  sidebarOptions = [
    { label: "Full English Name", checked: false },
    { label: "English title", checked: false },
    { label: "English first Name", checked: false },
    { label: "English last Name", checked: false },
    { label: "Full Hebrew name", checked: false },
    { label: "Hebrew title", checked: false },
    { label: "Hebrew first name", checked: false },
    { label: "Hebrew last name", checked: false },
    { label: "Hebrew suffix", checked: false },
    { label: "English & Hebrew full name", checked: false },
    { label: "Address", checked: false },
    { label: "Phone number", checked: false },
    { label: "Email Address", checked: false },
  ];
  currentPageFromTable: number;
  currentPageSizeFromTable: number;

  private offcanvasService = inject(NgbOffcanvas);
  closeResult = "";
  labelsArray: Array<any> = [];
  phoneLabelArray: any[];
  addressLabelArray: any[];
  emailLabelArray: any[];
  list: any[];
  selectedPhoneData: any[] = [];
  selectedAddressData: any[] = [];
  selectedEmailAddressData: any[] = [];
  data: any;
  executeData: any;
  isSwitchOn: boolean = false;
  currentRowHeight: any;
  showCustomField: boolean = false;
  private analytics = inject(AnalyticsService);
  filterReportParamsLength: number = 0;

  constructor(
    public commonMethodService: CommonMethodService,
    private activatedRoute: ActivatedRoute,
    private dynamicGridReportService: DynamicGridReportService,
    private localstoragedataService: LocalstoragedataService,
    private commonAPIMethodService: CommonAPIMethodService,
    private renderer: Renderer2
  ) {
    effect(() => {
      this.autoRun = dynamicGridReportService.isAutoRun();
    });
  }
  ngOnInit(): void {
    this.activatedRoute.params.subscribe((data) => {
      this.reportId = data?.id;
      if (this.reportId) this.getFilterData();
    });
    this.getAllLabels();
    if (this.commonMethodService.localDonorList.length == 0) {
      this.commonMethodService.getDonorList();
    }
    this.commonMethodService.donorList$.subscribe(() => {
      this.PhoneData().subscribe(() => {});
    });
  }

  getAllLabels() {
    // Phone labels
    if (this.commonMethodService.allLabelsArray.length == 0) {
      const eventGuId = this.localstoragedataService.getLoginUserEventGuId();
      this.commonAPIMethodService
        .getLabelText(eventGuId)
        .subscribe((res: any) => {
          this.labelsArray = res;
          this.labeldata();
        });
    } else {
      this.labelsArray = this.commonMethodService.allLabelsArray;
      this.labeldata();
    }
  }

  labeldata() {
    if (this.labelsArray.length != 0) {
      this.phoneLabelArray = this.labelsArray.filter(
        (x) => x.labelType == "Phone"
      );
      this.phoneLabelArray = this.phoneLabelArray.map((item, index) => {
        item.editVisable = false;
        item.isLabelAdded = false;
        item.phoneRdioId = "phoneRedioId_" + index;
        item.cellRedioId = "cellRedioId_" + index;
        return item;
      });
      const homePhoneLabel = this.phoneLabelArray.find(
        (label) => label.labelName == "Home"
      );
      const cellPhoneLabel = this.phoneLabelArray.find(
        (label) => label.labelName == "Cell"
      );

      if (homePhoneLabel) {
        this.selectedPhoneData.push(homePhoneLabel);
      }
      if (cellPhoneLabel) {
        this.selectedPhoneData.push(cellPhoneLabel);
      }

      this.addressLabelArray = this.labelsArray.filter(
        (x) => x.labelType == "Address"
      );
      const homeAddressLabel = this.addressLabelArray.find(
        (label) => label.labelName == "Home"
      );
      if (homeAddressLabel) {
        this.selectedAddressData.push(homeAddressLabel);
      }
      this.addressLabelArray = this.addressLabelArray.map((item, index) => {
        item.editVisable = false;
        item.isLabelAdded = false;
        item.addressRdioId = "addressRedioId_" + index;
        return item;
      });

      this.emailLabelArray = this.labelsArray.filter(
        (x) => x.labelType == "Email"
      );
      const homeEmailLabel = this.emailLabelArray.find(
        (label) => label.labelName == "Home"
      );

      if (homeEmailLabel) {
        this.selectedEmailAddressData.push(homeEmailLabel);
      }

      this.emailLabelArray = this.emailLabelArray.map((item, index) => {
        item.editVisable = false;
        item.isLabelAdded = false;
        item.emailRdioId = "emailRedioId_" + index;
        return item;
      });
    }
  }
  getFilterData() {
    this.dynamicGridReportService
      .getParams(this.reportId)
      .subscribe((res: any[]) => {
        if (res && res.length > 0) {
          this.reportName = res[0].reportName;
          this.reportParams = res;
          this.filterReportParamsLength = this.reportParams.filter(
            (item) => item.paramName !== "EventId"
          ).length;
          let isAllDefaultValueAvailable = true;
          if (res.some((param) => !param.defaultValue))
            isAllDefaultValueAvailable = false;

          if (!this.autoRun) this.openFilterPopup();
          else if (isAllDefaultValueAvailable) this.setFilterValues();
          else this.openFilterPopup();
        } else this.executeQuery({});
      });
  }

  openFilterPopup() {
    let modalOptions = {
      centered: true,
      size: "sm",
      backdrop: false,
      keyboard: true,
      windowClass: "modal-report",
    };

    const modalRef = this.commonMethodService.openPopup(
      StandardarReportFilterPopupComponent,
      modalOptions
    );

    modalRef.componentInstance.reportId = this.reportId;
    modalRef.componentInstance.formData = this.filterFormData;
    modalRef.componentInstance.params = this.reportParams;
    modalRef.componentInstance.filterReportParamsLength =
      this.filterReportParamsLength;
    modalRef.closed.subscribe((data) => {
      this.getFeatureSettingValues();
      if (data) this.setQuery(data);
    });
  }

  setFilterValues() {
    let filterParams: any = {};
    filterParams.reportId = this.reportId;
    filterParams.reportParam = this.reportParams;

    let reportvalues = this.reportParams.map((item) => ({
      name: item.paramName,
      value: item.defaultValue ? item.defaultValue : null,
    }));
    filterParams.Params = reportvalues;

    this.executeQuery(filterParams);
  }

  setQuery(values) {
    if (values.reportParam && values.reportParam.length !== 0) {
      values.Params = values.reportParam.map((o: ParamFormGroup) => {
        if (o.uiDataType === "DateTime") {
          return {
            name: o.name,
            value:
              o.inputValue && o.inputValue.startDate
                ? o.inputValue.startDate
                : o.inputValue,
          };
        }

        if (o.uiDataType === "INT") {
          return {
            name: o.name,
            value: o.inputValue ? Number(o.inputValue) : o.inputValue,
          };
        }

        if (
          o.uiControl.toLocaleLowerCase() === "multiselectdropdown" ||
          o.uiControl.toLocaleLowerCase() === "singleselectdropdown"
        )
          return {
            name: o.name,
            value:
              o.inputValue?.map((i) => i.id).toString() == "-1"
                ? -1
                : o.inputValue?.map((i) => i.id).toString(),
          };

        return {
          name: o.name,
          value: o.inputValue,
        };
      });
    }

    this.executeQuery(values);
  }

  executeQuery(values) {
    this.isloading = true;
    this.filterFormData = values;

    // Filter out the report parameters that use the "MultiSelectdropdown" control and
    // If the length of inputValue matches the list data length, set the value to null
    let multiSelectValues: any[] = values.reportParam.filter(
      (report) => report.uiControl.toLowerCase() == "multiselectdropdown"
    );
    if (multiSelectValues.length > 0) {
      multiSelectValues.forEach((value) => {
        let paramItem = values.Params.find((param) => param.name == value.name);
        paramItem.value =
          value.inputValue?.length ==
          this.getListData(value.uiDataType).length - 1
            ? null
            : paramItem.value;
      });
    }

    this.filterCount = (values.Params as [])?.filter((item: any) => {
      if (Array.isArray(item.value)) {
        if (item.value.length > 0) return true;
        else return false;
      } else if (item.value) return true;
      else return false;
    }).length;

    let { reportParam, ...rest } = values;
    this.dynamicGridReportService
      .getExecute({ ...rest })
      .pipe(delay(3000))
      .subscribe(
        (data) => {
          this.executeData = data;
          this.isloading = false;
          this.tableData(data);
          this.analytics.editedStandardReport();
        },
        (err) => {
          this.isloading = false;
        }
      );
  }
  tableData(data) {
    if (data.table && data.table.length > 0) {
      let tableArr = data?.table;
      this.reportArray = tableArr;
      this.reportArray = this.reportArray.map((s) => {
        const matchingDonor = this.commonMethodService.localDonorList.find(
          (donor) => donor.accountId == s.accountID
        );
        if (!matchingDonor) {
          this.showCustomField = false;
          return;
        }
        this.showCustomField = true;
        return {
          ...s,
          "Full English Name": matchingDonor ? matchingDonor.fullName : null,
          "English title": matchingDonor ? matchingDonor.title : null,
          "English first Name": matchingDonor ? matchingDonor.firstName : null,
          "English last Name": matchingDonor ? matchingDonor.lastName : null,
          "Full Hebrew name": matchingDonor
            ? matchingDonor.fullNameJewish
            : null,
          "Hebrew title": matchingDonor ? matchingDonor.titleJewish : null,
          "Hebrew first name": matchingDonor
            ? matchingDonor.firstNameJewish
            : null,
          "Hebrew last name": matchingDonor
            ? matchingDonor.lastNameJewish
            : null,
          "Hebrew suffix": matchingDonor ? matchingDonor.suffixJewish : null,
          "English & Hebrew full name": matchingDonor
            ? this.EnglishHebrewFullName(matchingDonor)
            : null,
          "Phone number": this.matchingphoneData(matchingDonor),
          "Email Address": this.matchingEmailData(matchingDonor),
          Address: this.matchingAddress(matchingDonor),
        };
      });
      this.columnNames = [];
      if (tableArr && tableArr.length > 0) {
        Object.keys(tableArr[0]).forEach((key: string) => {
          this.reportTableHeaders.push(key);
          let col: ColumnDefinitionType = {
            title: key.toLocaleUpperCase(),
            visible: true,
            field: key,
            frozen: false,
            headerHozAlign: "center",
          };
          this.columnNames.push(col);
        });
      }
    }
  }
  matchingAddress(matchingDonor) {
    if (this.list) {
      const matchList = this.list.find(
        (s) => s.accountId === matchingDonor.accountId
      );
      if (this.selectedAddressData) {
        const selectedLabelNames = this.selectedAddressData.map(
          (item) => item.labelName
        );

        let matchedAddressDetails = matchList.addressLabelArray.filter(
          (addressLabel) => selectedLabelNames.includes(addressLabel.labelName)
        );

        if (matchList) {
          return matchedAddressDetails;
        }
      }
    }
  }
  matchingEmailData(matchingDonor) {
    if (this.list) {
      const matchList = this.list.find(
        (s) => s.accountId === matchingDonor.accountId
      );
      if (this.selectedEmailAddressData) {
        const selectedLabelNames = this.selectedEmailAddressData.map(
          (item) => item.labelName
        );

        let matchedEmailDetails = matchList.emailLabelArray.filter(
          (emailLabel) => selectedLabelNames.includes(emailLabel.labelName)
        );

        if (matchList) {
          return matchedEmailDetails;
        }
      }
    }
  }
  matchingphoneData(matchingDonor) {
    if (this.list) {
      const matchList = this.list.find(
        (s) => s.accountId === matchingDonor.accountId
      );
      if (this.selectedPhoneData) {
        const selectedLabelNames = this.selectedPhoneData.map(
          (item) => item.labelName
        );

        let matchedPhoneDetails = matchList.phoneLabelArray.filter(
          (phoneLabel) => selectedLabelNames.includes(phoneLabel.labelName)
        );

        return matchedPhoneDetails;
      }
    }
  }

  PhoneData(): Observable<any[]> {
    return new Observable((observer) => {
      const eventGuId = this.localstoragedataService.getLoginUserEventGuId();
      this.commonAPIMethodService
        .getLabelText(eventGuId)
        .subscribe((res: any) => {
          const allPhoneLabelsArray = res.filter((x) => x.labelType == "Phone");
          const allEmailLabelsArray = res.filter((x) => x.labelType == "Email");
          const allAddressLabelsArray = res.filter(
            (x) => x.labelType == "Address"
          );
          const list = this.commonMethodService.localDonorList.map(
            (x, index: any) => {
              const phoneLabels = this.getSplit(x.additionalPhoneLabels);
              const phoneNumbers = this.getSplit(x.additionalPhoneNumbers);
              const phoneObj = this.addLabels(
                phoneLabels,
                phoneNumbers,
                "Phone",
                index
              );
              const phoneLabelArray = this.addLabelRemoveDuplicate(
                allPhoneLabelsArray,
                phoneObj
              );

              const emailLabels = this.getSplit(x.emailLabels);
              const emails = this.getSplit(x.emails);
              const emailObj = this.addLabels(
                emailLabels,
                emails,
                "Email",
                index
              );
              const emailLabelArray = this.addLabelRemoveDuplicate(
                allEmailLabelsArray,
                emailObj
              );

              const addressLabels = this.getSplit(x.accountAddressLabels, ";");
              const addresses = this.getSplit(x.accountAddresses, ";");
              const addressId = this.getSplit(x.addressIds, ",");
              const addressObj = this.addLabels(
                addressLabels,
                addresses,
                "Address",
                index,
                addressId
              );
              const addressLabelArray = this.addLabelRemoveDuplicate(
                allAddressLabelsArray,
                addressObj
              );

              return {
                ...x,
                phoneLabelArray,
                emailLabelArray,
                addressLabelArray,
              };
            }
          );
          this.list = list;
          observer.next(list);
          observer.complete();
        });
    });
  }

  addLabelRemoveDuplicate(allLabel = [], objArray = []) {
    let resultArray = objArray;
    allLabel.map((item) => {
      const found = objArray.some(
        (el) => el.labelName.toLowerCase() == item.labelName.toLowerCase()
      );
      let resValue = objArray
        .filter(
          (x) => x.labelName.toLowerCase() == item.labelName.toLowerCase()
        )
        .map((x) => x.addressId)
        .toString();
      if (!found) {
        if (item.labelType == "Address") {
          resultArray.push(
            this.createAddressObj(
              item.labelID,
              item.labelType,
              item.labelName,
              "",
              resValue
            )
          );
        } else {
          resultArray.push({
            labelID: item.labelID,
            labelType: item.labelType,
            labelName: item.labelName,
            labelValue: "",
          });
        }
      }
    });
    return resultArray;
  }

  createAddressObj(id, type, name, value, addressId) {
    let obj = {
      labelID: id,
      labelType: type,
      labelName: name,
      labelValue: value,
      addressId: addressId,
    };
    return obj;
  }

  getSplit(item, separator = ",") {
    if (item != undefined && item != null && item && item.length > 0) {
      let sptItem = item.split(separator);
      return sptItem.map((e) => (!e ? "" : e.trim()));
    }
    return [];
  }

  addLabels(
    itemLabels = [],
    valuelList = [],
    labelType = "",
    i = "",
    addressId = null
  ) {
    let resultValue = [];
    for (let index = 0; index < itemLabels.length; index++) {
      let label = itemLabels[index];
      let value = valuelList[index];
      let labelId = `${labelType}_${i}_${index}`;
      let addressIdValue = addressId && addressId[index];
      let obj = {};
      if (label && labelType != "Address") {
        obj = {
          labelID: labelId,
          labelType: labelType,
          labelName: label,
          labelValue: value,
        };
      } else {
        obj = this.createAddressObj(
          labelId,
          labelType,
          label,
          value,
          addressIdValue
        );
      }
      resultValue.push(obj);
    }
    return resultValue;
  }
  EnglishHebrewFullName(matchingDonor) {
    return matchingDonor.fullName + "  " + matchingDonor.fullNameJewish;
  }
  downloadCSV() {
    this.tabulator.downLoadExcel("standard report");
  }

  printReports() {
    this.tabulator.downloadPDF();
  }

  getListData(type: string) {
    switch (type) {
      case "Campaign":
        return this.commonMethodService.localCampaignList;
      case "Reason":
        return this.commonMethodService.localReasonList;
      case "Collector":
        return this.commonMethodService.localCollectorList;
      case "Location":
        return this.commonMethodService.localLocationList;
      case "Source":
        return this.commonMethodService.localDeviceTypeList;
      default:
        break;
    }
  }

  OpenStandardReportSidebar() {
    let modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup bulk_custom_report_card",
    };
    const modalRef = this.commonMethodService.openPopup(
      StandardReportSidebarComponent,
      modalOptions
    );

    modalRef.componentInstance.sidebarOptions = this.sidebarOptions;
    this.phoneLabelArray = this.phoneLabelArray.filter(
      (s) => s.labelName != "" && s.labelName != null
    );
    modalRef.componentInstance.phoneLabelArray = this.phoneLabelArray;
    modalRef.componentInstance.emitData.subscribe((data) => {
      this.setData(data);
    });
    modalRef.componentInstance.emitSelectedData.subscribe((data) => {
      this.handleSelectionChange(data);
    });
  }

  setData(data) {
    if (data) {
      let newCol: ColumnDefinitionType = {
        title: data.label.toLocaleUpperCase(),
        visible: data.checked,
        field: data.label,
        frozen: false,
        headerHozAlign: "center",
        minWidth: 200,
        // formatter: "customComponent"
      };

      if (
        data.label == "Phone number" ||
        data.label == "Email Address" ||
        data.label == "Address"
      ) {
        newCol = {
          ...newCol,
          formatter: "customComponent",
        };
      }
      const existingColumnIndex = this.columnNames2.findIndex(
        (col) => col.field === data.label
      );

      if (existingColumnIndex !== -1) {
        this.columnNames2.splice(existingColumnIndex, 1);
      }
      if (this.columnNames.length > 0) {
        this.columnNames2 = [...this.columnNames2, newCol];
        this.columnNames2 = this.columnNames2.filter(
          (col) => col.visible == true
        );
      }
      this.sidebarOptions = this.sidebarOptions.map((s) =>
        s.label == data.label ? { ...s, checked: data.checked } : s
      );
    }
  }

  open(content: TemplateRef<any>) {
    this.offcanvasService
      .open(content, {
        ariaLabelledBy: "offcanvas-basic-title",
        position: "end",
      })
      .result.then(
        (result) => {
          this.closeResult = `Closed with: ${result}`;
        },
        (reason) => {
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        }
      );
  }

  private getDismissReason(reason: any): string {
    switch (reason) {
      case OffcanvasDismissReasons.ESC:
        return "by pressing ESC";
      case OffcanvasDismissReasons.BACKDROP_CLICK:
        return "by clicking on the backdrop";
      default:
        return `with: ${reason}`;
    }
  }
  onPageChanged(pageNo: number) {
    this.currentPageFromTable = pageNo;
  }
  onPageSizeChanged(pageSize: number) {
    this.currentPageSizeFromTable = pageSize;
  }

  handleSelectionChange(eventData: { type: string; value: any }) {
    if (eventData.type == "Phone") {
      this.selectedPhoneData = eventData.value;
    }
    if (eventData.type == "emailAddress") {
      this.selectedEmailAddressData = eventData.value;
    }
    if (eventData.type == "address") {
      this.selectedAddressData = eventData.value;
    }
    this.tableData(this.executeData);
  }
  addAddressColumn() {
    let newCol: ColumnDefinitionType = {
      title: (
        "Address" +
        " > " +
        this.selectedAddressData[0].labelName
      ).toLocaleUpperCase(),
      visible: this.isSwitchOn,
      field: "Address" + this.selectedAddressData[0].labelName,
      frozen: false,
      headerHozAlign: "center",
      // formatter: "customComponent"
    };

    const existingColumnIndex = this.columnNames2.findIndex(
      (col) => col.field == "Address" + this.selectedAddressData[0].labelName
    );

    const addressColumn = this.columnNames2.find(
      (col) => col.field === "Address"
    );

    if (existingColumnIndex !== -1) {
      this.columnNames2.splice(existingColumnIndex, 1);
    }
    if (addressColumn) {
      addressColumn.visible = !this.isSwitchOn;
    }
    if (this.columnNames.length > 0) {
      this.columnNames2 = [...this.columnNames2, newCol];
    }
  }

  handleSwitch(event) {
    this.isSwitchOn = event;
    // this.addAddressColumn()
  }
  rowHeightChanged(rowheight) {
    this.currentRowHeight = rowheight;
  }

  getFeatureSettingValues() {
    this.commonMethodService.featureName = "Standard_Reports";
    this.commonMethodService.getFeatureSettingValues();
    if (!this.commonMethodService.isfeatureSetting) {
      this.renderer.addClass(document.body, "overflow-hidden");
    } else {
      this.renderer.removeClass(document.body, "overflow-hidden");
    }
  }

  onUpgrade() {
    this.commonMethodService.commenSendUpgradeEmail(
      this.commonMethodService.featureDisplayName
    );
  }

  ngOnDestroy() {
    this.renderer.removeClass(document.body, "overflow-hidden");
  }
}
