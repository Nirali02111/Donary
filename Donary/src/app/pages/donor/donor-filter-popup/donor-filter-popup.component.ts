import { PageSyncService } from "src/app/commons/pagesync.service";
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { Subject } from "rxjs";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { AdvancedFieldService } from "src/app/services/advancedfield.service";
import { TagService } from "src/app/services/tag.service";

import * as _ from "lodash";
import { DonorService } from "src/app/services/donor.service";

declare var $: any;
@Component({
  selector: "app-donor-filter-popup",
  templateUrl: "./donor-filter-popup.component.html",
  styleUrls: ["./donor-filter-popup.component.scss"],
  standalone: false,
})
export class DonorFilterPopupComponent implements OnInit, OnDestroy {
  tagsList: Array<{ tagId: number; tagName: string }> = [];
  selectedTaglist = [];

  tagSelectSettings = {
    text: "",
    selectAllText: "Select All",
    unSelectAllText: "UnSelect All",
    classes: "myclass custom-class",
    labelKey: "tagName",
    primaryKey: "tagId",
    noDataLabel: "No record found with search criteria",
    enableSearchFilter: true,
    enableCheckAll: true,
    autoPosition: true,
    enableFilterSelectAll: false,
    multiple: true,
    badgeShowLimit: 2,
    searchAutofocus: true,
    singleSelection: false,
  };

  citysList = [];
  zipsList = [];
  citysSelected = [];
  zipsSelected = [];
  isCityDpwDisable: boolean = false;
  isZipDpwDisable: boolean = false;
  labelsList = [];
  selectedlabelList: any;
  @Output() emtOutputAdvancedFilterData: EventEmitter<any> = new EventEmitter();

  @Input() set AdvancedFilterData(selectedAdvancedSearchFilter: any) {
    if (selectedAdvancedSearchFilter) {
      this.accountNo = selectedAdvancedSearchFilter.accountNo;
      this.fullNameJewish = selectedAdvancedSearchFilter.fullNameJewish;
      this.fullName = selectedAdvancedSearchFilter.fullName;
      this.address = selectedAdvancedSearchFilter.address;
      this.city = selectedAdvancedSearchFilter.city;
      this.state = selectedAdvancedSearchFilter.state;
      this.zip = selectedAdvancedSearchFilter.zip;
      this.defaultLocations = selectedAdvancedSearchFilter.defaultLocation;
      this.group = selectedAdvancedSearchFilter.group;
      this.class = selectedAdvancedSearchFilter.class;
      this.phone = selectedAdvancedSearchFilter.phone;
      this.email = selectedAdvancedSearchFilter.email;
      this.father = selectedAdvancedSearchFilter.father;
      this.fatherInLaw = selectedAdvancedSearchFilter.fatherInLaw;
      this.status = selectedAdvancedSearchFilter.status;
      // this.getAdvanceFieldList = selectedAdvancedSearchFilter.getAdvanceFieldList;
      this.commonMethodService.selectedFromCampaignList =
        selectedAdvancedSearchFilter.campaignId;
      this.commonMethodService.selectedPaymentReasons =
        selectedAdvancedSearchFilter.reasonId;
      this.commonMethodService.selectedPaymentLocations =
        selectedAdvancedSearchFilter.locationId;
      this.commonMethodService.selectedPaymentCollectors =
        selectedAdvancedSearchFilter.collectorId;

      this.citysSelected = selectedAdvancedSearchFilter.cities;
      this.zipsSelected = selectedAdvancedSearchFilter.zips;

      if (
        selectedAdvancedSearchFilter.tags &&
        selectedAdvancedSearchFilter.tags.length !== 0
      ) {
        this.selectedTaglist = selectedAdvancedSearchFilter.tags;
      }
      if (
        selectedAdvancedSearchFilter.AdvancedFields &&
        selectedAdvancedSearchFilter.AdvancedFields.length !== 0
      ) {
        this.AdvancedFields = selectedAdvancedSearchFilter.AdvancedFields;
      }
      this.selectedlabelList = selectedAdvancedSearchFilter.label;
    }
  }

  @Input() set isTotalPanelOpen(data: any) {
    if (data) {
      this.isTotalPanelVisible = data;
    }
  }
  @Input() set labelsListArray(data: any) {
    if (data) {
      let checkDuplicateLabel = [];
      let result = data.map((item) => {
        (item.id = item.labelID),
          (item.itemName = item.labelType + " > " + item.labelName);
        if (!checkDuplicateLabel.includes(item.itemName)) {
          checkDuplicateLabel.push(item.itemName);
          this.labelsList.push(item);
        }
        return item;
      });
    }
  }
  accountNo: string;
  fullNameJewish: string;
  fullName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  group: string;
  class: string;
  phone: string;
  email: string;
  father: string;
  fatherInLaw: string;
  status: string;
  isTotalPanelVisible: boolean;
  defaultLocations = [];
  getAdvanceFieldList: any = [];
  selectAdvanceField: any = [];
  AdvancedFields: any = [];
  protected ngUnsubscribe: Subject<void> = new Subject<void>();
  constructor(
    public activeModal: NgbActiveModal,
    public commonMethodService: CommonMethodService,
    private advanceFieldService: AdvancedFieldService,
    public localstoragedataService: LocalstoragedataService,
    private tagService: TagService,
    private readonly changeDetectorRef: ChangeDetectorRef,
    private donorService: DonorService,
    private pageSyncService: PageSyncService
  ) {}

  ngOnInit() {
    $(document).ready(function () {
      let modalContent: any = $(".modal");
      modalContent.draggable({
        handle: ".modal-body",
      });
    });
    if (!this.isTotalPanelVisible) {
      var eventGuid = this.localstoragedataService.getLoginUserEventGuId();

      this.advanceFieldService.getAll(eventGuid).subscribe(
        (res: any) => {
          if (res) {
            this.getAdvanceFieldList = res;
            this.getAdvanceFieldList = this.getAdvanceFieldList.map((o) => {
              if (o.type == "dropdown") {
                let optionArray = [];
                if (o.options) {
                  optionArray = o.options.split(",");
                }
                return {
                  id: o.advancedFieldId,
                  itemName: o.fieldName.replace(":", "").trim(),
                  displayText: _.trim(o.fieldName, " :"),
                  filtervalue: "",
                  options: optionArray.map((v, i) => ({ id: i, itemName: v })),
                  isDisplayed: false,
                  type: o.type,
                };
              }

              return {
                id: o.advancedFieldId,
                itemName: o.fieldName.replace(":", "").trim(),
                displayText: _.trim(o.fieldName, " :"),
                filtervalue: "",
                options: null,
                isDisplayed: false,
                type: o.type,
              };
            });
          }

          if (this.AdvancedFields.length !== 0) {
            this.getAdvanceFieldList = this.getAdvanceFieldList.map((af) => {
              const selected = this.AdvancedFields.find((a) => a.id === af.id);
              if (!selected) {
                return {
                  ...af,
                };
              }

              if (af.type !== "dropdown") {
                return {
                  ...af,
                  isDisplayed: true,
                  filtervalue: selected.value || "",
                };
              }

              if (!selected.value) {
                return {
                  ...af,
                  isDisplayed: true,
                  filtervalue: "",
                };
              }
              const options = selected.value.split(",");
              return {
                ...af,
                isDisplayed: true,
                filtervalue: af.options.filter((a) =>
                  options.map((x) => x.trim()).includes(a.itemName.trim())
                ),
              };
            });

            this.selectAdvanceField = this.getAdvanceFieldList.filter(
              (o) => o.isDisplayed
            );
          }
        },
        (err) => {}
      );
    }
    if (!this.isTotalPanelVisible) {
      this.getCityStateZipList();
    }
    if (this.isTotalPanelVisible) {
      this.bindData();
    }
    if (!this.isTotalPanelVisible) {
      this.tagService.getAllTag(eventGuid).subscribe(
        (res) => {
          if (res) {
            this.tagsList = res.map((o) => {
              return {
                ...o,
                tagName: this.tagService.formatTagName(o.tagName),
              };
            });
          }
        },
        (err) => {
          console.log(err);
        }
      );
    }
  }

  bindData() {
    this.commonMethodService.bindCommonFieldDropDowns(
      this.ngUnsubscribe,
      false,
      true,
      true,
      true,
      true,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false
    );
  }

  ngOnDestroy() {
    // This aborts all HTTP requests.
    this.ngUnsubscribe.next();
    // This completes the subject properlly.
    this.ngUnsubscribe.complete();
  }

  searchDonors() {
    let objAdvancedSearch = {};

    const objAdvanceField = this.getAdvanceFieldList
      .map((af) => {
        if (af.isDisplayed) {
          if (af.type === "dropdown") {
            if (af.filtervalue) {
              return {
                id: af.id,
                name: af.itemName,
                value: af.filtervalue.map((x) => x.itemName.trim()).toString(),
              };
            }
          }
          return { id: af.id, name: af.itemName, value: af.filtervalue || "" };
        }
        return null;
      })
      .filter((a) => a !== null);

    if (!this.isTotalPanelVisible) {
      objAdvancedSearch = {
        AdvancedFields: objAdvanceField,
        isTotalPanel: false,
        accountNo: this.accountNo,
        fullName: this.fullName,
        fullNameJewish: this.fullNameJewish,
        address: this.address,
        city: this.city,
        state: this.state,
        zip: this.zip,
        defaultLocation: this.defaultLocations,
        group: this.group,
        class: this.class,
        phone: this.phone,
        email: this.email,
        father: this.father,
        fatherinlaw: this.fatherInLaw,
        status: this.status,
        collectorId: [],
        locationId: [],
        campaignId: [],
        reasonId: [],
        sourceId: [],
        tags:
          this.selectedTaglist && this.selectedTaglist.length != 0
            ? this.selectedTaglist
            : [],
        cities: this.citysSelected,
        zips: this.zipsSelected,
        label:
          this.selectedlabelList && this.selectedlabelList.length != 0
            ? this.selectedlabelList
            : [],
      };
    } else {
      objAdvancedSearch = {
        isTotalPanel: true,
        AdvancedFields: objAdvanceField,
        collectorId:
          this.commonMethodService.selectedPaymentCollectors &&
          this.commonMethodService.selectedPaymentCollectors.length != 0
            ? this.commonMethodService.selectedPaymentCollectors
            : [],
        locationId:
          this.commonMethodService.selectedPaymentLocations &&
          this.commonMethodService.selectedPaymentLocations.length != 0
            ? this.commonMethodService.selectedPaymentLocations
            : [],
        campaignId:
          this.commonMethodService.selectedFromCampaignList &&
          this.commonMethodService.selectedFromCampaignList.length != 0
            ? this.commonMethodService.selectedFromCampaignList
            : [],
        reasonId:
          this.commonMethodService.selectedPaymentReasons &&
          this.commonMethodService.selectedPaymentReasons.length != 0
            ? this.commonMethodService.selectedPaymentReasons
            : [],
        sourceId: [],
        defaultLocation: [],
        //"advancedFields":
        tags:
          this.selectedTaglist && this.selectedTaglist.length != 0
            ? this.selectedTaglist
            : [],
      };
    }
    this.pageSyncService.donorFilterData = objAdvancedSearch;
    this.emtOutputAdvancedFilterData.emit(objAdvancedSearch);
    this.activeModal.dismiss();
    this.changeDetectorRef.detectChanges();
  }

  closePopup() {
    this.activeModal.dismiss();
    this.resetSearchBox();
  }

  clearFilter() {
    this.resetSearchBox();
  }

  onItemSelect(data) {
    this.getAdvanceFieldList = this.getAdvanceFieldList.map((element) => {
      if (element.id == data.id) {
        return {
          ...element,
          isDisplayed: true,
        };
      }
      return {
        ...element,
      };
    });
  }

  onItemDeselect(data) {
    this.getAdvanceFieldList = this.getAdvanceFieldList.map((element) => {
      if (element.id == data.id) {
        return {
          ...element,
          isDisplayed: false,
        };
      }
      return {
        ...element,
      };
    });
  }

  onDeselectAll() {
    for (var item of this.getAdvanceFieldList) {
      item.filtervalue = "";
      item.isDisplayed = false;
    }
  }

  resetSearchBox() {
    this.fullName = "";
    this.fullNameJewish = "";
    this.accountNo = "";
    this.address = "";
    this.city = "";
    this.state = "";
    this.zip = "";
    this.defaultLocations = [];
    this.group = "";
    this.class = "";
    this.phone = "";
    this.email = "";
    this.father = "";
    this.fatherInLaw = "";
    this.status = "";
    this.commonMethodService.selectedPaymentCollectors = [];
    this.commonMethodService.selectedPaymentLocations = [];
    this.commonMethodService.selectedFromCampaignList = [];
    this.commonMethodService.selectedPaymentReasons = [];
    this.selectAdvanceField = [];
    this.selectedTaglist = [];
    this.selectedlabelList = [];
    for (var item of this.getAdvanceFieldList) {
      item.filtervalue = "";
      item.isDisplayed = false;
    }
    //this.isCommonDropDownloading = false;
  }
  contains_heb(str) {
    return /[\u0590-\u05FF]/.test(str);
  }
  onDeleteTags() {
    this.selectedTaglist = [];
  }
  getCityStateZipList() {
    var eventGuid = this.localstoragedataService.getLoginUserEventGuId();
    this.donorService.getDonorCityStateZip(eventGuid).subscribe((res: any) => {
      this.bindCityZipListDropDown(res);
    });
  }
  bindCityZipListDropDown(cityStateZipRes) {
    if (cityStateZipRes) {
      let citys = [];
      let zips = [];
      if (cityStateZipRes && cityStateZipRes.length > 0) {
        cityStateZipRes.forEach((element, i) => {
          let objCity = {
            id: i,
            itemName: `${element.city || ""} ${element.state || ""}`,
            city: element.city,
            state: element.state,
          };
          let objZip = {
            id: i,
            itemName: `${element.zip || ""}`,
            zip: element.zip,
          };
          if (objCity.itemName) {
            citys.push(objCity);
          }
          if (objZip.itemName) {
            zips.push(objZip);
          }
        });
      }
      this.citysList = citys.reduce((uniqueCitys, o) => {
        if (!uniqueCitys.some((obj) => obj.itemName === o.itemName)) {
          uniqueCitys.push(o);
        }
        return uniqueCitys;
      }, []);
      this.zipsList = zips.reduce((uniqueZips, o) => {
        if (!uniqueZips.some((obj) => obj.itemName === o.itemName)) {
          uniqueZips.push(o);
        }
        return uniqueZips;
      }, []);
    }
  }
  onDeleteCitys() {
    this.citysSelected = [];
    this.isZipDpwDisable = false;
  }
  onCitysSelect() {
    if (this.citysList && this.citysSelected.length > 0) {
      this.isCityDpwDisable = false;
      this.isZipDpwDisable = true;
    }
  }
  enableCityDpw() {
    if (this.citysList && this.citysSelected.length == 0) {
      this.isCityDpwDisable = false;
      this.isZipDpwDisable = false;
    }
  }
  onDeleteZips() {
    this.zipsSelected = [];
    this.isCityDpwDisable = false;
  }
  onZipsSelect() {
    if (this.zipsSelected && this.zipsSelected.length > 0) {
      this.isCityDpwDisable = true;
      this.isZipDpwDisable = false;
    }
  }
  enableZipDpw() {
    if (this.zipsSelected && this.zipsSelected.length == 0) {
      this.isCityDpwDisable = false;
      this.isZipDpwDisable = false;
    }
  }
  onDeleteLabels() {
    this.selectedlabelList = [];
  }
}
