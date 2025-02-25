import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { AdvancedFieldService } from "src/app/services/advancedfield.service";
import { DonorService } from "src/app/services/donor.service";
import { TagService } from "src/app/services/tag.service";
declare var $: any;
@Component({
  selector: "app-new-query-popup",
  templateUrl: "./new-query-popup.component.html",
  standalone: false,
  styleUrls: ["./new-query-popup.component.scss"],
})
export class NewQueryPopupComponent implements OnInit {
  objAdvancedSearch: any = [];
  baseField: any = [{ id: 1, itemName: "Donor" }];
  baseFieldFilter: any = [];
  displayField = [];
  displayFieldFilter: any = [];
  queryName: string;
  isDonorFilter = false;
  isReasonFilter = false;
  isCampaignFilter = false;
  isLocationFilter = false;
  isCollectorFilter = false;
  isSourceFilter = false;
  fieldReq = false;
  queryReq = false;
  donorFieldList = [];
  isFatherInLawFilterVisible = false;
  isFatherFilterVisible = false;
  isFullNameFilterVisible = false;
  isFullNameJewishFilterVisible = false;
  isPhoneFilterVisible = false;
  isEmailFilterVisible = false;
  isNoteFilterVisible = false;
  isAcctNoFilterVisible = false;
  isFamilyFilterVisible = false;
  isAddressFilterVisible = false;
  isCityStateZipFilterVisible = false;
  isAdvanceFieldFilterVisible = false;
  isTagFieldFilterVisible = false;
  isLoacationFieldFilterVisible = false; //added new
  isStatusFieldFilterVisible = false; //added new
  selectedLocationList: any[]; //added new
  selectedStatus: string = ""; //"0";
  advanceFilterName: string;
  fullName: string;
  fullNameJewish: string;
  acctNo: string;
  address: string;
  cityStateZip: string;
  family: string;
  phone: string;
  email: string;
  note: string;
  father: string;
  selectedCityStateZipList: [];
  fatherInLaw: string;
  status: string;
  campaignName: string;
  friendlyName: string;
  advanceFieldList: any = [];
  newTagList: any = [];
  tagList: any = [];
  advancedFieldIndex: number;
  advancedFieldIndex1: number;

  reasonFieldList = [
    { key: "reasonName", value: "Reason Name" },
    { key: "reasonNo", value: "Reason #" },
    { key: "rgoal", value: "Goal" },
    { key: "rpercentage", value: "Percentage" },
    { key: "remail", value: "Email" },
    { key: "rhomePhone", value: "Home Phone" },
    { key: "rcell", value: "Cell" },
  ];
  isReasonNameFilterVisible = false;
  isReasonNoFilterVisible = false;
  isGoalFilterVisible = false;
  isPercentageFilterVisible = false;
  isReasonEmailFilterVisible = false;
  isHomePhoneFilterVisible = false;
  isCellFilterVisible = false;
  reasonName: string;
  reasonNo: string;
  mingoal: number;
  maxgoal: number;
  minpercentage: number;
  maxpercentage: number;
  reasonEmail: string;
  reasonHomePhone: string;
  reasonCell: string;

  collectorFieldList = [
    { key: "cacctNo", value: "Acct #" },
    { key: "cfullName", value: "Full Name" },
    { key: "cphone", value: "Phone" },
    { key: "cemail", value: "Email" },
    { key: "cgroup", value: "Group" },
    { key: "cclass", value: "Class" },
    { key: "cstatus", value: "Status" },
  ];
  isCollectorAcctNoFilterVisible = false;
  isCollectorFullNameFilterVisible = false;
  isCollectorPhoneFilterVisible = false;
  isCollectorEmailFilterVisible = false;
  isCollectorGroupFilterVisible = false;
  isCollectorClassFilterVisible = false;
  isCollectorStatusFilterVisible = false;
  collectorAcctNo: string;
  collectorFullName: string;
  collectorPhone: string;
  collectorEmail: string;
  collectorGroup: string;
  collectorClass: string;
  collectorStatus: string;

  locationFieldList = [
    { key: "locationName", value: "Location Name" },
    { key: "nusach", value: "Nusach" },
    { key: "rabbi", value: "Rabbi" },
    { key: "lphone", value: "Phone" },
    { key: "shortName", value: "Short Name" },
    { key: "typeId", value: "Location Type" },
  ];
  isLocationNameFilterVisible = false;
  isLocationNusachFilterVisible = false;
  isLocationRabbiFilterVisible = false;
  isLocationPhoneFilterVisible = false;
  isLocationShortNameFilterVisible = false;
  isLocationTypeFilterVisible = false;
  isCampaignNameFilterVisible = false;
  isFriendlyNameFilterVisible = false;
  locationName: string;
  nusach: string;
  rabbi: string;
  lphone: string;
  shortName: string;
  typeId: Array<any>;

  campaignFieldList = [
    { key: "campaignName", value: "Campaign Name" },
    { key: "friendlyName", value: "Friendly Name" },
  ];

  sourceFieldList = [
    { key: "sEvent", value: "Event" },
    { key: "sProduct", value: "Product" },
    { key: "sDevice", value: "Device" },
    { key: "sActivation", value: "Activation Code" },
    { key: "sMacAddress", value: "Mac Address" },
    { key: "sPlan", value: "Plan" },
    { key: "sStatus", value: "Status" },
    { key: "sNotes", value: "Notes" },
    { key: "sDeviceNo", value: "Device  #" },
    { key: "sSim", value: "Sim #" },
    { key: "sCollector", value: "Collector" },
    { key: "sCampaign", value: "Campaign" },
    { key: "sReason", value: "Reason" },
    { key: "sLocation", value: "Location" },
  ];
  isSourceEventFilterVisible = false;
  isSourceProductFilterVisible = false;
  isSourceDeviceFilterVisible = false;
  isSourceActivationFilterVisible = false;
  isSourceMacAddressFilterVisible = false;
  isSourcePlanFilterVisible = false;
  isSourceStatusFilterVisible = false;
  isSourceNotesFilterVisible = false;
  isSourceDeviceNoFilterVisible = false;
  isSourceSimFilterVisible = false;
  isSourceCollectorFilterVisible = false;
  isSourceCampaignFilterVisible = false;
  isSourceReasonFilterVisible = false;
  isSourceLocationFilterVisible = false;
  sourceEvent: string;
  sourceProduct: string;
  sourceDevice: string;
  sourceActivation: string;
  sourceMacAddress: string;
  sourcePlan: string;
  sourceStatus: string;
  sourceNotes: string;
  sourceDeviceNo: string;
  sourceSim: string;
  sourceCollector: string;
  sourceCampaign: string;
  sourceReason: string;
  sourceLocation: string;
  selectDonorField = [];
  title: string;
  buttonName: string;
  populateArray = [];
  localLocationList = [];
  citysList = [];
  zipsList = [];
  citysSelected = [];
  zipsSelected = [];
  isCityDpwDisable: boolean = false;
  isZipDpwDisable: boolean = false;
  @Input() set editDonarReport(data) {
    if (data) {
      this.title = "Edit Query";
      this.buttonName = "Update";
    } else {
      this.title = "Create Query";
      this.buttonName = "Create";
    }
  }
  constructor(
    public activeModal: NgbActiveModal,
    public commonMethodService: CommonMethodService,
    private localstoragedataService: LocalstoragedataService,
    public advancedFieldService: AdvancedFieldService,
    private donorService: DonorService,
    public tagService: TagService
  ) {}
  @Input() set populateDonarReport(populateData) {
    this.queryName = populateData.queryName;
    const df = populateData.displayFiel;
    for (var i = 0; i < df.length; i++) {
      this.displayField.push(df[i]);
    }

    //location added
    let resultList = this.commonMethodService.paymentLocationList;
    if (
      populateData.objAdvancedSearch.locationIds &&
      populateData.objAdvancedSearch.locationIds.length > 0
    ) {
      this.isLoacationFieldFilterVisible = true;
      this.selectDonorField.push({ id: "location", itemName: "location" });
      let id_filter = populateData.objAdvancedSearch.locationIds;
      let filtered = resultList.filter(function (item) {
        return id_filter.indexOf(item.id) !== -1;
      });
      this.selectedLocationList = filtered;
    }

    //this.populateArray=this.displayFieldList(populateData[0].toLowerCase());
    for (let propt in populateData.objAdvancedSearch) {
      if (
        populateData.objAdvancedSearch[propt] !== undefined &&
        propt != "advancedFields"
      ) {
        let filterNameSearch = {
          id: propt.toString(),
          value: populateData.objAdvancedSearch[propt],
        };
        this.populateDisplayFilter(filterNameSearch);
        let result = this.donorFieldList.find((x) => x.id == propt.toString());
        if (result && result.id != undefined) {
          this.selectDonorField.push({
            id: result.id,
            itemName: result.itemName,
          });
        }
      }
      if (
        populateData.objAdvancedSearch[propt] !== undefined &&
        propt == "advancedFields"
      ) {
        let filterNameSearch = {
          id: propt.toString(),
          value: populateData.objAdvancedSearch[propt],
        };
        this.populateDisplayFilter(filterNameSearch);
        this.donorFieldList = this.commonMethodService.reportdonorFieldList;
        for (let i = 0; i < filterNameSearch.value.length; i++) {
          let result = this.donorFieldList.find(
            (x) => x.id == filterNameSearch.value[i].name.toString()
          );
          if (result && result.id != undefined) {
            this.selectDonorField.push({
              id: result.id,
              itemName: result.itemName,
            });
          }
        }
      }
    }
    //status dropdown
    if (populateData.objAdvancedSearch.status != undefined) {
      this.selectedStatus = populateData.objAdvancedSearch.status;
    }
    this.selectedCityStateZipList = populateData.objAdvancedSearch.address;
    this.citysSelected = populateData.objAdvancedSearch.cities;
    this.zipsSelected = populateData.objAdvancedSearch.zips;
    if (this.citysSelected && this.citysSelected.length > 0) {
      this.isZipDpwDisable = true;
    }
    if (this.zipsSelected && this.zipsSelected.length > 0) {
      this.isCityDpwDisable = true;
    }
  }
  @Output() emtOutputQueryData: EventEmitter<any> = new EventEmitter();

  ngOnInit() {
    this.getFeatureSettingValues();
    $(document).ready(function () {
      let modalContent: any = $(".modal");
      modalContent.draggable({
        handle: ".modal-header-custom",
      });
    });
    this.baseFieldFilter = [
      { id: 1, itemName: "Donor" },
      { id: 2, itemName: "Reason" },
      { id: 3, itemName: "Campaign" },
      { id: 4, itemName: "Location" },
      { id: 5, itemName: "Collector" },
      { id: 6, itemName: "Source" },
    ];
    if (this.commonMethodService.locationTypeList.length == 0) {
      this.commonMethodService.getLocationTypeList();
    }
    this.commonMethodService.getCityStateZipList();
    this.getCityStateZipList();
    this.displayFieldFilter = this.displayFieldList("donor");
    this.isDonorFilter = true;
    var eventGuId = this.localstoragedataService.getLoginUserEventGuId();
    this.advancedFieldService.getAll(eventGuId).subscribe((res: any) => {
      if (res) {
        if (res) {
          if (this.advanceFieldList.length == 0) {
            for (var item of res) {
              item.options =
                item.options != null ? item.options.split(",") : null;

              if (item.options) {
                item.options = item.options.map((o, i) => {
                  return {
                    id: i,
                    itemName: o,
                  };
                });
              }
              item.filtervalue = "";
              item.isDisplayed = false;
            }
            this.advanceFieldList = res;
            this.advanceFieldList =
              this.advanceFieldList &&
              this.advanceFieldList.map((o, i) => {
                return {
                  id: o.advancedFieldId,
                  itemName: o.fieldName,
                  isDisplayed: false,
                  filtervalue: "",
                  type: o.type,
                  options: o.options,
                };
              });
            this.commonMethodService.reportAdvanceFieldList =
              this.advanceFieldList;
          } else {
            for (var item of res) {
              item.options =
                item.options != null ? item.options.split(",") : null;
              if (item.options) {
                item.options = item.options.map((o, i) => {
                  return {
                    id: i,
                    itemName: o,
                  };
                });
              }
              this.advanceFieldList = this.advanceFieldList.map((i) => {
                if (i.name == item.fieldName) {
                  if (item.type == "dropdown") {
                    return {
                      ...i,
                      filtervalue: i.value,
                      options: item.options,
                      isDisplayed: true,
                      type: item.type,
                      itemName: item.fieldName,
                    };
                  } else {
                    return {
                      ...i,
                      filtervalue: i.value,
                      isDisplayed: true,
                      type: item.type,
                      itemName: item.fieldName,
                    };
                  }
                }
                return {
                  ...i,
                };
              });
            }
            this.advanceFieldList =
              this.advanceFieldList &&
              this.advanceFieldList.map((o, i) => {
                return {
                  id: o.advancedFieldId,
                  itemName: o.itemName,
                  isDisplayed: o.isDisplayed,
                  filtervalue: o.filtervalue,
                  type: o.type,
                  options: o.options,
                };
              });

            //this.selectAdvanceField=this.getAdvanceFieldList;
          }
        }
      }
    });

    // start code for tag api call and fetching value in tagList
    this.tagService.getAllTag(eventGuId).subscribe((res: any) => {
      if (res) {
        if (res) {
          if (this.newTagList.length == 0) {
            this.newTagList = res;
          }

          if (this.tagList.length == 0) {
            for (var item of res) {
              item.filtervalue = "";
              item.isDisplayed = false;
            }
            this.tagList = res;
            this.tagList =
              this.tagList &&
              this.tagList.map((o, i) => {
                return {
                  id: o.tagId,
                  itemName: o.tagName,
                  isDisplayed: false,
                  filtervalue: "",
                };
              });
            this.commonMethodService.reportTagList = this.tagList;
          } else {
            for (var item of res) {
              this.tagList = this.tagList.map((i) => {
                if (i.name == item.tagName) {
                  return {
                    ...i,
                    filtervalue: i.value,
                    isDisplayed: true,
                    itemName: item.tagName,
                  };
                }
                return {
                  ...i,
                };
              });
            }
            this.tagList =
              this.tagList &&
              this.tagList.map((o, i) => {
                return {
                  id: o.tagId,
                  itemName: o.itemName,
                  isDisplayed: o.isDisplayed,
                  filtervalue: o.filtervalue,
                };
              });
          }
        }
        this.donorFieldList =
          this.commonMethodService.multiselectDonorFieldList;
        this.commonMethodService.reportdonorFieldList = this.donorFieldList;
      }
    });

    //this.donorFieldList.push
    // get location for dropdown
    this.commonMethodService.getLocationList();
    var resultList = this.commonMethodService.paymentLocationList;
    // this.localLocationList=resultList;
    // for(var item of resultList){
    //   //this.donorFieldList.push({"id":item.id,"itemName":item.itemName});
    //   }
  }
  closePopup() {
    this.activeModal.dismiss();
  }

  changeBaseField(basefield) {
    var baseId = this.baseField.map((s) => s.id).toString();
    this.isDonorFilter = false;
    this.isReasonFilter = false;
    this.isLocationFilter = false;
    this.isCampaignFilter = false;
    this.isCollectorFilter = false;
    this.isSourceFilter = false;
    this.hideFilter();
    if (baseId == 1) {
      this.displayFieldFilter = this.displayFieldList("donor");
      this.isDonorFilter = true;
    } else if (baseId == 2) {
      this.displayFieldFilter = this.displayFieldList("reason");
      this.isReasonFilter = true;
    } else if (baseId == 3) {
      this.displayFieldFilter = this.displayFieldList("campaign");
      this.isCampaignFilter = true;
    } else if (baseId == 4) {
      this.displayFieldFilter = this.displayFieldList("location");
      this.isLocationFilter = true;
    } else if (baseId == 5) {
      this.displayFieldFilter = this.displayFieldList("collector");
      this.isCollectorFilter = true;
    } else if (baseId == 6) {
      this.displayFieldFilter = this.displayFieldList("source");
      this.isSourceFilter = true;
    }
  }

  deselectBaseField() {
    this.displayField = [];
    this.isDonorFilter = false;
    this.isReasonFilter = false;
    this.isLocationFilter = false;
    this.isCampaignFilter = false;
    this.isCollectorFilter = false;
    this.isSourceFilter = false;
    this.hideFilter();
  }

  displayFieldList(val) {
    // this.displayField=[];
    if (val == "donor") {
      var list = [];
      list = this.commonMethodService.multiSelectFieldList;
      this.populateArray = list;
      return list;
    } else if (val == "reason") {
      var arrayList = [
        { id: 1, itemName: "Reason Name" },
        { id: 2, itemName: "Reason #" },
        { id: 3, itemName: "Goal" },
        { id: 4, itemName: "Percentage" },
        { id: 5, itemName: "Email" },
        { id: 6, itemName: "Home Phone" },
        { id: 7, itemName: "Cell" },
      ];
      this.populateArray = arrayList;
      return arrayList;
    } else if (val == "campaign") {
      var arrayList = [
        { id: 1, itemName: "Campaign Name" },
        { id: 2, itemName: "Friendly Name" },
      ];
      this.populateArray = arrayList;
      return arrayList;
    } else if (val == "location") {
      var arrayList = [
        { id: 1, itemName: "Location" },
        { id: 2, itemName: "Nusach" },
        { id: 3, itemName: "Address" },
        { id: 4, itemName: "Rabbi" },
        { id: 5, itemName: "Phone" },
        { id: 6, itemName: "Short Name" },
        { id: 7, itemName: "Type" },
      ];
      this.populateArray = arrayList;
      return arrayList;
    } else if (val == "collector") {
      var arrayList = [
        { id: 1, itemName: "Acct #" },
        { id: 2, itemName: "Full Name" },
        { id: 3, itemName: "Address" },
        { id: 4, itemName: "Group" },
        { id: 5, itemName: "Class" },
        { id: 6, itemName: "Phone/Email" },
        { id: 7, itemName: "Status" },
      ];
      this.populateArray = arrayList;
      return arrayList;
    } else if (val == "source") {
      var arrayList = [
        { id: 1, itemName: "Event" },
        { id: 2, itemName: "Product" },
        { id: 3, itemName: "Device" },
        { id: 4, itemName: "Activation Code" },
        { id: 5, itemName: "Mac Address" },
        { id: 6, itemName: "Plan" },
        { id: 7, itemName: "Status" },
        { id: 8, itemName: "Notes" },
        { id: 9, itemName: "Device #" },
        { id: 10, itemName: "Sim #" },
        { id: 11, itemName: "Collector" },
        { id: 12, itemName: "Campaign" },
        { id: 13, itemName: "Reason" },
        { id: 14, itemName: "Location" },
      ];
      this.populateArray = arrayList;
      return arrayList;
    }
  }

  onDeSelectAll() {
    this.selectDonorField = [];
  }
  ItemSelect(item: any) {
    this.fieldReq = false;
  }
  ItemDeSelect() {
    if (this.displayField.length == 0) {
      this.fieldReq = true;
    } else {
      this.fieldReq = false;
    }
  }

  ItemDeSelectAll() {
    this.fieldReq = true;
  }

  CreateQuery() {
    if (this.queryName == undefined || this.queryName == "") {
      this.queryReq = true;
      return false;
    } else {
      this.queryReq = false;
    }
    if (this.displayField.length == 0) {
      this.fieldReq = true;
      return false;
    } else {
      this.fieldReq = false;
    }
    var baseId = this.baseField.map((s) => s.id).toString();
    if (baseId == 1) {
      var objAdvanceField = [];
      for (var item of this.advanceFieldList) {
        if (item.filtervalue != "" && item.isDisplayed == true) {
          if (item.type == "dropdown" && item.filtervalue != "") {
            objAdvanceField.push({
              name: item.itemName,
              value: item.filtervalue.map((x) => x.itemName).toString(),
            });
          } else {
            objAdvanceField.push({
              name: item.itemName,
              value: item.filtervalue,
            });
          }
        }
      }

      var objNewTagField = [];
      for (var item of this.newTagList) {
        for (let i = 0; i < this.displayField.length; i++) {
          let tagname = item.tagName.replace(":", "");
          if (this.displayField[i].itemName == tagname) {
            objNewTagField.push({
              ...item,
            });
          }
        }
      }

      var objTagField = [];
      for (var item of this.tagList) {
        if (item.filtervalue != "" && item.isDisplayed == true) {
          objTagField.push({
            name: item.itemName,
            value: item.filtervalue,
          });
        }
      }

      this.objAdvancedSearch = {
        fullName: this.fullName,
        fullNameJewish: this.fullNameJewish,
        accountNo: this.acctNo,
        fatherInLaw: this.fatherInLaw,
        phone: this.phone,
        email: this.email,
        note: this.note,
        father: this.father,
        address: this.selectedCityStateZipList,
        advancedFields: objAdvanceField,
        locationIds:
          this.selectedLocationList && this.selectedLocationList.length > 0
            ? this.selectedLocationList.map((s) => s.id)
            : this.selectedLocationList, //added new
        status: this.selectedStatus, //added new
        cities: this.citysSelected,
        zips: this.zipsSelected,
        tags: objTagField,
        newtags: objNewTagField,
      };
    }
    if (baseId == 2) {
      this.objAdvancedSearch = {
        reasonName: this.reasonName,
        reasonNum: this.reasonNo,
        minGoal: this.mingoal,
        maxGoal: this.maxgoal,
        minPercentage: this.minpercentage,
        maxPercentage: this.maxpercentage,
        homePhone: this.reasonHomePhone,
        cell: this.reasonCell,
      };
    }
    if (baseId == 3) {
      this.objAdvancedSearch = {
        campaignName: this.campaignName,
        friendlyName: this.friendlyName,
      };
    }
    if (baseId == 4) {
      this.objAdvancedSearch = {
        locationName: this.locationName,
        nusach: this.nusach,
        rabbi: this.rabbi,
        phone: this.lphone,
        shortName: this.shortName,
        typeId:
          this.typeId != null
            ? this.typeId.length > 0
              ? parseInt(this.typeId.map((s) => s.id).toString())
              : null
            : null,
      };
    }
    if (baseId == 5) {
      this.objAdvancedSearch = {
        fullName: this.collectorFullName,
        accountNo: this.collectorAcctNo,
        phone: this.collectorPhone,
        email: this.collectorEmail,
        group: this.collectorGroup,
        class: this.collectorClass,
        status: this.collectorStatus,
      };
    }
    if (baseId == 6) {
      this.objAdvancedSearch = {
        eventName: this.sourceEvent,
        product: this.sourceProduct,
        device: this.sourceDevice,
        activationCode: this.sourceActivation,
        macAddress: this.sourceMacAddress,
        plan: this.sourcePlan,
        status: this.sourceStatus,
        notes: this.sourceNotes,
        deviceNum: this.sourceDeviceNo,
        simNum: this.sourceSim,
        collector: this.sourceCollector,
        campaign: this.sourceCampaign,
        reason: this.sourceReason,
        location: this.sourceLocation,
      };
    }
    var objCreateQuery = {
      queryName: this.queryName,
      baseColumn: this.baseField,
      displayField: this.displayField,
      objAdvancedSearch: this.objAdvancedSearch,
    };
    this.emtOutputQueryData.emit(objCreateQuery);
    this.activeModal.dismiss();
  }

  displayFilter(filterName) {
    switch (filterName.id) {
      case "accountNo":
        this.isAcctNoFilterVisible = true;
        break;
      case "fullName":
        this.isFullNameFilterVisible = true;
        break;
      case "family":
        this.isFamilyFilterVisible = true;
        break;
      case "address":
        this.isAddressFilterVisible = true;
        break;
      case "cityStateZip":
        this.isCityStateZipFilterVisible = true;
        break;
      case "fullNameJewish":
        this.isFullNameJewishFilterVisible = true;
        break;
      case "note":
        this.isNoteFilterVisible = true;
        break;
      case "phone":
        this.isPhoneFilterVisible = true;
        break;
      case "email":
        this.isEmailFilterVisible = true;
        break;
      case "father":
        this.isFatherFilterVisible = true;
        break;
      case "fatherinlaw":
        this.isFatherInLawFilterVisible = true;
        break;
      case "location":
        this.isLoacationFieldFilterVisible = true; //added new
        break;
      case "status":
        this.isStatusFieldFilterVisible = true; //added new
        break;
      case "cacctNo":
        this.isCollectorAcctNoFilterVisible = true;
        break;
      case "cfullName":
        this.isCollectorFullNameFilterVisible = true;
        break;
      case "cgroup":
        this.isCollectorGroupFilterVisible = true;
        break;
      case "cclass":
        this.isCollectorClassFilterVisible = true;
        break;
      case "cstatus":
        this.isCollectorStatusFilterVisible = true;
        break;
      case "cphone":
        this.isCollectorPhoneFilterVisible = true;
        break;
      case "cemail":
        this.isCollectorEmailFilterVisible = true;
        break;
      case "reasonName":
        this.isReasonNameFilterVisible = true;
        break;
      case "reasonNo":
        this.isReasonNoFilterVisible = true;
        break;
      case "rgoal":
        this.isGoalFilterVisible = true;
        break;
      case "rpercentage":
        this.isPercentageFilterVisible = true;
        break;
      case "remail":
        this.isReasonEmailFilterVisible = true;
        break;
      case "rhomePhone":
        this.isHomePhoneFilterVisible = true;
        break;
      case "rcell":
        this.isCellFilterVisible = true;
        break;
      case "locationName":
        this.isLocationNameFilterVisible = true;
        break;
      case "nusach":
        this.isLocationNusachFilterVisible = true;
        break;
      case "rabbi":
        this.isCellFilterVisible = true;
        break;
      case "lphone":
        this.isLocationPhoneFilterVisible = true;
        break;
      case "shortName":
        this.isLocationShortNameFilterVisible = true;
        break;
      case "typeId":
        this.isLocationTypeFilterVisible = true;
        break;
      case "campaignName":
        this.isCampaignNameFilterVisible = true;
        break;
      case "friendlyName":
        this.isFriendlyNameFilterVisible = true;
        break;
      case "sEvent":
        this.isSourceEventFilterVisible = true;
        break;
      case "sProduct":
        this.isSourceProductFilterVisible = true;
        break;
      case "sDevice":
        this.isSourceDeviceFilterVisible = true;
        break;
      case "sActivation":
        this.isSourceActivationFilterVisible = true;
        break;
      case "sMacAddress":
        this.isSourceMacAddressFilterVisible = true;
        break;
      case "sPlan":
        this.isSourcePlanFilterVisible = true;
        break;
      case "sStatus":
        this.isSourceStatusFilterVisible = true;
        break;
      case "sNotes":
        this.isSourceNotesFilterVisible = true;
        break;
      case "sDeviceNo":
        this.isSourceDeviceNoFilterVisible = true;
        break;
      case "sSim":
        this.isSourceSimFilterVisible = true;
        break;
      case "sCollector":
        this.isSourceCollectorFilterVisible = true;
        break;
      case "sCampaign":
        this.isSourceCampaignFilterVisible = true;
        break;
      case "sReason":
        this.isSourceReasonFilterVisible = true;
        break;
      case "sLocation":
        this.isSourceLocationFilterVisible = true;
        break;
      default:
        this.isAdvanceFieldFilterVisible = true;
        this.advanceFieldList = this.advanceFieldList.map((element) => {
          if (element.itemName == filterName.id) {
            return {
              ...element,
              isDisplayed: true,
            };
          }
          return {
            ...element,
          };
        });
        //this.advanceFilterName=filterName.id;

        // start code for making tag isDisplayed true
        this.isTagFieldFilterVisible = true;
        this.tagList = this.tagList.map((element) => {
          if (element.itemName == filterName.id) {
            return {
              ...element,
              isDisplayed: true,
            };
          }
          return {
            ...element,
          };
        });
        break;
    }
  }
  populateDisplayFilter(filterName) {
    switch (filterName.id) {
      case "accountNo":
        this.isAcctNoFilterVisible = true;
        this.acctNo = filterName.value;
        break;
      case "family":
        this.isFamilyFilterVisible = true;
        this.family = filterName.value;
        break;
      case "address":
        this.isAddressFilterVisible = true;
        this.address = filterName.value ? filterName.value.itemName : null; //filterName.value[0].itemName:null;
        break;
      case "cityZipCode":
        this.isCityStateZipFilterVisible = true;
        this.cityStateZip = filterName.value;
        break;
      case "fullName":
        this.isFullNameFilterVisible = true;
        this.fullName = filterName.value;
        break;
      case "fullNameJewish":
        this.isFullNameJewishFilterVisible = true;
        this.fullNameJewish = filterName.value;
        break;
      case "note":
        this.isNoteFilterVisible = true;
        this.note = filterName.value;
        break;
      case "phone":
        this.isPhoneFilterVisible = true;
        this.phone = filterName.value;
        break;
      case "email":
        this.isEmailFilterVisible = true;
        this.email = filterName.value;
        break;
      case "father":
        this.isFatherFilterVisible = true;
        this.father = filterName.value;
        break;
      case "fatherinlaw":
        this.isFatherInLawFilterVisible = true;
        this.fatherInLaw = filterName.value;
        break;
      case "cacctNo":
        this.isCollectorAcctNoFilterVisible = true;
        this.collectorAcctNo = filterName.value;
        break;
      case "cfullName":
        this.isCollectorFullNameFilterVisible = true;
        this.collectorFullName = filterName.value;
        break;
      case "cgroup":
        this.isCollectorGroupFilterVisible = true;
        this.collectorGroup = filterName.value;
        break;
      case "cclass":
        this.isCollectorClassFilterVisible = true;
        this.collectorClass = filterName.value;
        break;
      case "cstatus":
        this.isCollectorStatusFilterVisible = true;
        this.collectorStatus = filterName.value;
        break;
      case "cphone":
        this.isCollectorPhoneFilterVisible = true;
        this.collectorPhone = filterName.value;
        break;
      case "cemail":
        this.isCollectorEmailFilterVisible = true;
        this.collectorEmail = filterName.value;
        break;
      case "reasonName":
        this.isReasonNameFilterVisible = true;
        this.reasonName = filterName.value;
        break;
      case "reasonNo":
        this.isReasonNoFilterVisible = true;
        this.reasonNo = filterName.value;
        break;
      case "rgoal":
        this.isGoalFilterVisible = true;
        this.maxgoal = filterName.value;
        break;
      case "rpercentage":
        this.isPercentageFilterVisible = true;
        this.maxpercentage = filterName.value;
        break;
      case "remail":
        this.isReasonEmailFilterVisible = true;
        this.reasonEmail = filterName.value;
        break;
      case "rhomePhone":
        this.isHomePhoneFilterVisible = true;
        this.reasonHomePhone = filterName.value;
        break;
      case "rcell":
        this.isCellFilterVisible = true;
        this.reasonCell = filterName.value;
        break;
      case "locationName":
        this.isLocationNameFilterVisible = true;
        this.locationName = filterName.value;
        break;
      case "nusach":
        this.isLocationNusachFilterVisible = true;
        this.nusach = filterName.value;
        break;
      case "rabbi":
        this.isCellFilterVisible = true;
        this.reasonCell = filterName.value;
        break;
      case "lphone":
        this.isLocationPhoneFilterVisible = true;
        this.lphone = filterName.value;
        break;
      case "shortName":
        this.isLocationShortNameFilterVisible = true;
        this.shortName = filterName.value;
        break;
      case "typeId":
        this.isLocationTypeFilterVisible = true;
        this.typeId = filterName.value;
        break;
      case "campaignName":
        this.isCampaignNameFilterVisible = true;
        this.campaignName = filterName.value;
        break;
      case "friendlyName":
        this.isFriendlyNameFilterVisible = true;
        this.friendlyName = filterName.value;
        break;
      case "sEvent":
        this.isSourceEventFilterVisible = true;
        this.sourceEvent = filterName.value;
        break;
      case "sProduct":
        this.isSourceProductFilterVisible = true;
        this.sourceProduct = filterName.value;
        break;
      case "sDevice":
        this.isSourceDeviceFilterVisible = true;
        this.sourceDevice = filterName.value;
        break;
      case "sActivation":
        this.isSourceActivationFilterVisible = true;
        this.sourceActivation = filterName.value;
        break;
      case "sMacAddress":
        this.isSourceMacAddressFilterVisible = true;
        this.sourceMacAddress = filterName.value;
        break;
      case "sPlan":
        this.isSourcePlanFilterVisible = true;
        this.sourcePlan = filterName.value;
        break;
      case "sStatus":
        this.isSourceStatusFilterVisible = true;
        this.sourceStatus = filterName.value;
        break;
      case "sNotes":
        this.isSourceNotesFilterVisible = true;
        this.sourceNotes = filterName.value;
        break;
      case "sDeviceNo":
        this.isSourceDeviceNoFilterVisible = true;
        this.sourceDevice = filterName.value;
        break;
      case "sSim":
        this.isSourceSimFilterVisible = true;
        this.sourceSim = filterName.value;
        break;
      case "sCollector":
        this.isSourceCollectorFilterVisible = true;
        this.sourceCollector = filterName.value;
        break;
      case "sCampaign":
        this.isSourceCampaignFilterVisible = true;
        this.sourceCampaign = filterName.value;
        break;
      case "sReason":
        this.isSourceReasonFilterVisible = true;
        this.sourceReason = filterName.value;
        break;
      case "sLocation":
        this.isSourceLocationFilterVisible = true;
        this.sourceLocation = filterName.value;
        break;
      default:
        this.isAdvanceFieldFilterVisible = true;
        if (this.advanceFieldList.length == 0) {
          this.advanceFieldList =
            this.commonMethodService.reportAdvanceFieldList;
        }
        this.advanceFieldList = this.advanceFieldList.map((element) => {
          for (let i = 0; i < filterName.value.length; i++) {
            if (element.itemName == filterName.value[i].name) {
              if (element.type == "dropdown") {
                return {
                  ...element,
                  filtervalue: element.options.filter(
                    (x) => x.itemName == filterName.value[0].value
                  ),
                  isDisplayed: true,
                };
              } else {
                return {
                  ...element,
                  filtervalue: filterName.value[0].value,
                  isDisplayed: true,
                };
              }
            }
          }
          return {
            ...element,
          };
        });

        //start code for tag
        this.isTagFieldFilterVisible = true;
        if (this.tagList.length == 0) {
          this.tagList = this.commonMethodService.reportTagList;
        }
        this.tagList = this.tagList.map((element) => {
          for (let i = 0; i < filterName.value.length; i++) {
            if (element.itemName == filterName.value[i].name) {
              return {
                ...element,
                filtervalue: filterName.value[0].value,
                isDisplayed: true,
              };
            }
          }
          return {
            ...element,
          };
        });
        break;
    }
  }
  hideDonorFilter(filterName) {
    switch (filterName.id) {
      case "accountNo":
        this.isAcctNoFilterVisible = false;
        break;
      case "family":
        this.isFamilyFilterVisible = false;
        break;
      case "address":
        this.isAddressFilterVisible = false;
        break;
      case "cityStateZip":
        this.isCityStateZipFilterVisible = false;
        break;
      case "fullName":
        this.isFullNameFilterVisible = false;
        break;
      case "fullNameJewish":
        this.isFullNameJewishFilterVisible = false;
        break;
      case "note":
        this.isNoteFilterVisible = false;
        break;
      case "phone":
        this.isPhoneFilterVisible = false;
        break;
      case "email":
        this.isEmailFilterVisible = false;
        break;
      case "father":
        this.isFatherFilterVisible = false;
        break;
      case "fatherinlaw":
        this.isFatherInLawFilterVisible = false;
        break;
      case "cacctNo":
        this.isCollectorAcctNoFilterVisible = false;
        break;
      case "cfullName":
        this.isCollectorFullNameFilterVisible = false;
        break;
      case "cgroup":
        this.isCollectorGroupFilterVisible = false;
        break;
      case "cclass":
        this.isCollectorClassFilterVisible = false;
        break;
      case "cstatus":
        this.isCollectorStatusFilterVisible = false;
        break;
      case "cphone":
        this.isCollectorPhoneFilterVisible = false;
        break;
      case "cemail":
        this.isCollectorEmailFilterVisible = false;
        break;
      case "reasonName":
        this.isReasonNameFilterVisible = false;
        break;
      case "reasonNo":
        this.isReasonNoFilterVisible = false;
        break;
      case "rgoal":
        this.isGoalFilterVisible = false;
        break;
      case "rpercentage":
        this.isPercentageFilterVisible = false;
        break;
      case "remail":
        this.isReasonEmailFilterVisible = false;
        break;
      case "rhomePhone":
        this.isHomePhoneFilterVisible = false;
        break;
      case "rcell":
        this.isCellFilterVisible = false;
        break;
      case "locationName":
        this.isLocationNameFilterVisible = false;
        break;
      case "nusach":
        this.isLocationNusachFilterVisible = false;
        break;
      case "rabbi":
        this.isCellFilterVisible = false;
        break;
      case "lphone":
        this.isLocationPhoneFilterVisible = false;
        break;
      case "shortName":
        this.isLocationShortNameFilterVisible = false;
        break;
      case "typeId":
        this.isLocationTypeFilterVisible = false;
        break;
      case "campaignName":
        this.isCampaignNameFilterVisible = false;
        break;
      case "friendlyName":
        this.isFriendlyNameFilterVisible = false;
        break;
      case "sEvent":
        this.isSourceEventFilterVisible = false;
        break;
      case "sProduct":
        this.isSourceProductFilterVisible = false;
        break;
      case "sDevice":
        this.isSourceDeviceFilterVisible = false;
        break;
      case "sActivation":
        this.isSourceActivationFilterVisible = false;
        break;
      case "sMacAddress":
        this.isSourceMacAddressFilterVisible = false;
        break;
      case "sPlan":
        this.isSourcePlanFilterVisible = false;
        break;
      case "sStatus":
        this.isSourceStatusFilterVisible = false;
        break;
      case "sNotes":
        this.isSourceNotesFilterVisible = false;
        break;
      case "sDeviceNo":
        this.isSourceDeviceNoFilterVisible = false;
        break;
      case "sSim":
        this.isSourceSimFilterVisible = false;
        break;
      case "sCollector":
        this.isSourceCollectorFilterVisible = false;
        break;
      case "sCampaign":
        this.isSourceCampaignFilterVisible = false;
        break;
      case "sReason":
        this.isSourceReasonFilterVisible = false;
        break;
      case "sLocation":
        this.isSourceLocationFilterVisible = false;
        break;
      default:
        //this.isAdvanceFieldFilterVisible=false;
        this.advanceFieldList = this.advanceFieldList.map((element) => {
          if (element.itemName == filterName.id) {
            return {
              ...element,
              isDisplayed: false,
            };
          }
          return {
            ...element,
          };
        });

        //start code to hide tag
        this.tagList = this.tagList.map((element) => {
          if (element.itemName == filterName.id) {
            return {
              ...element,
              isDisplayed: false,
            };
          }
          return {
            ...element,
          };
        });
        break;
    }
  }

  hideFilter() {
    this.isFatherInLawFilterVisible = false;
    this.isFatherFilterVisible = false;
    this.isFullNameFilterVisible = false;
    this.isFullNameJewishFilterVisible = false;
    this.isPhoneFilterVisible = false;
    this.isEmailFilterVisible = false;
    this.isNoteFilterVisible = false;
    this.isAcctNoFilterVisible = false;
    this.isAddressFilterVisible = false;
    this.isCityStateZipFilterVisible = false;
    this.isFamilyFilterVisible = false;
    this.isCollectorFullNameFilterVisible = false;
    this.isCollectorGroupFilterVisible = false;
    this.isCollectorStatusFilterVisible = false;
    this.isCollectorPhoneFilterVisible = false;
    this.isCollectorGroupFilterVisible = false;
    this.isCollectorEmailFilterVisible = false;
    this.isCollectorAcctNoFilterVisible = false;
    this.isReasonNameFilterVisible = false;
    this.isReasonNoFilterVisible = false;
    this.isGoalFilterVisible = false;
    this.isPercentageFilterVisible = false;
    this.isReasonEmailFilterVisible = false;
    this.isHomePhoneFilterVisible = false;
    this.isCellFilterVisible = false;
    this.isLocationNameFilterVisible = false;
    this.isLocationNusachFilterVisible = false;
    this.isLocationRabbiFilterVisible = false;
    this.isLocationPhoneFilterVisible = false;
    this.isLocationShortNameFilterVisible = false;
    this.isLocationTypeFilterVisible = false;
    this.isCampaignNameFilterVisible = false;
    this.isFriendlyNameFilterVisible = false;
    this.isSourceEventFilterVisible = false;
    this.isSourceProductFilterVisible = false;
    this.isSourceDeviceFilterVisible = false;
    this.isSourceActivationFilterVisible = false;
    this.isSourceMacAddressFilterVisible = false;
    this.isSourcePlanFilterVisible = false;
    this.isSourceStatusFilterVisible = false;
    this.isSourceNotesFilterVisible = false;
    this.isSourceDeviceNoFilterVisible = false;
    this.isSourceSimFilterVisible = false;
    this.isSourceCollectorFilterVisible = false;
    this.isSourceCampaignFilterVisible = false;
    this.isSourceReasonFilterVisible = false;
    this.isSourceLocationFilterVisible = false;
    this.isAdvanceFieldFilterVisible = false;
    this.isTagFieldFilterVisible = false;
    this.isLoacationFieldFilterVisible = false;
    this.isStatusFieldFilterVisible = false;
    for (var item of this.advanceFieldList) {
      item.filtervalue = "";
      item.isDisplayed = false;
    }
    for (var item of this.tagList) {
      item.filtervalue = "";
      item.isDisplayed = false;
    }
  }

  ///for issue  hideDonorFilter changed
  removeDonorFilter(filterName) {
    switch (filterName.id) {
      case "accountNo":
        this.isAcctNoFilterVisible = false;
        this.acctNo = filterName.value;
        break;
      case "address":
        this.isAddressFilterVisible = false;
        this.address = filterName.value;
        break;
      case "cityStateZip":
        this.isCityStateZipFilterVisible = false;
        this.cityStateZip = filterName.value;
        break;
      case "family":
        this.isFamilyFilterVisible = false;
        this.family = filterName.value;
        break;
      case "fullName":
        this.isFullNameFilterVisible = false;
        this.fullName = filterName.value;
        break;
      case "fullNameJewish":
        this.isFullNameJewishFilterVisible = false;
        this.fullNameJewish = filterName.value;
        break;
      case "note":
        this.isNoteFilterVisible = false;
        this.note = filterName.value;
        break;
      case "phone":
        this.isPhoneFilterVisible = false;
        this.phone = filterName.value;
        break;
      case "email":
        this.isEmailFilterVisible = false;
        this.email = filterName.value;
        break;
      case "father":
        this.isFatherFilterVisible = false;
        this.father = filterName.value;
        break;
      case "fatherinlaw":
        this.isFatherInLawFilterVisible = false;
        this.fatherInLaw = filterName.value;
        break;
      case "location":
        this.isLoacationFieldFilterVisible = false; //added new
        break;
      case "status":
        this.isStatusFieldFilterVisible = false; //added new
        this.selectedStatus = undefined;
      case "cacctNo":
        this.isCollectorAcctNoFilterVisible = false;
        this.collectorAcctNo = filterName.value;
        break;
      case "cfullName":
        this.isCollectorFullNameFilterVisible = false;
        this.collectorFullName = filterName.value;
        break;
      case "cgroup":
        this.isCollectorGroupFilterVisible = false;
        this.collectorGroup = filterName.value;
        break;
      case "cclass":
        this.isCollectorClassFilterVisible = false;
        this.collectorClass = filterName.value;
        break;
      case "cstatus":
        this.isCollectorStatusFilterVisible = false;
        this.collectorStatus = filterName.value;
        break;
      case "cphone":
        this.isCollectorPhoneFilterVisible = false;
        this.collectorPhone = filterName.value;
        break;
      case "cemail":
        this.isCollectorEmailFilterVisible = false;
        this.collectorEmail = filterName.value;
        break;
      case "reasonName":
        this.isReasonNameFilterVisible = false;
        this.reasonName = filterName.value;
        break;
      case "reasonNo":
        this.isReasonNoFilterVisible = false;
        this.reasonNo = filterName.value;
        break;
      case "rgoal":
        this.isGoalFilterVisible = false;
        this.maxgoal = filterName.value;
        break;
      case "rpercentage":
        this.isPercentageFilterVisible = false;
        this.maxpercentage = filterName.value;
        break;
      case "remail":
        this.isReasonEmailFilterVisible = false;
        this.reasonEmail = filterName.value;
        break;
      case "rhomePhone":
        this.isHomePhoneFilterVisible = false;
        this.reasonHomePhone = filterName.value;
        break;
      case "rcell":
        this.isCellFilterVisible = false;
        this.reasonCell = filterName.value;
        break;
      case "locationName":
        this.isLocationNameFilterVisible = false;
        this.locationName = filterName.value;
        break;
      case "nusach":
        this.isLocationNusachFilterVisible = false;
        this.nusach = filterName.value;
        break;
      case "rabbi":
        this.isCellFilterVisible = false;
        this.reasonCell = filterName.value;
        break;
      case "lphone":
        this.isLocationPhoneFilterVisible = false;
        this.lphone = filterName.value;
        break;
      case "shortName":
        this.isLocationShortNameFilterVisible = false;
        this.shortName = filterName.value;
        break;
      case "typeId":
        this.isLocationTypeFilterVisible = false;
        this.typeId = filterName.value;
        break;
      case "campaignName":
        this.isCampaignNameFilterVisible = false;
        this.campaignName = filterName.value;
        break;
      case "friendlyName":
        this.isFriendlyNameFilterVisible = false;
        this.friendlyName = filterName.value;
        break;
      case "sEvent":
        this.isSourceEventFilterVisible = false;
        this.sourceEvent = filterName.value;
        break;
      case "sProduct":
        this.isSourceProductFilterVisible = false;
        this.sourceProduct = filterName.value;
        break;
      case "sDevice":
        this.isSourceDeviceFilterVisible = false;
        this.sourceDevice = filterName.value;
        break;
      case "sActivation":
        this.isSourceActivationFilterVisible = false;
        this.sourceActivation = filterName.value;
        break;
      case "sMacAddress":
        this.isSourceMacAddressFilterVisible = false;
        this.sourceMacAddress = filterName.value;
        break;
      case "sPlan":
        this.isSourcePlanFilterVisible = false;
        this.sourcePlan = filterName.value;
        break;
      case "sStatus":
        this.isSourceStatusFilterVisible = false;
        this.sourceStatus = filterName.value;
        break;
      case "sNotes":
        this.isSourceNotesFilterVisible = false;
        this.sourceNotes = filterName.value;
        break;
      case "sDeviceNo":
        this.isSourceDeviceNoFilterVisible = false;
        this.sourceDevice = filterName.value;
        break;
      case "sSim":
        this.isSourceSimFilterVisible = false;
        this.sourceSim = filterName.value;
        break;
      case "sCollector":
        this.isSourceCollectorFilterVisible = false;
        this.sourceCollector = filterName.value;
        break;
      case "sCampaign":
        this.isSourceCampaignFilterVisible = false;
        this.sourceCampaign = filterName.value;
        break;
      case "sReason":
        this.isSourceReasonFilterVisible = false;
        this.sourceReason = filterName.value;
        break;
      case "sLocation":
        this.isSourceLocationFilterVisible = false;
        this.sourceLocation = filterName.value;
        break;
      default:
        this.advanceFieldList = this.advanceFieldList.map((element) => {
          if (element.itemName === filterName.id) {
            if (element.type === "dropdown") {
              return {
                ...element,
                isDisplayed: false,
              };
            } else {
              return {
                ...element,
                isDisplayed: false,
              };
            }
          }
          return {
            ...element,
          };
        });
        break;
    }
  }
  ///for issue
  queryValidation() {
    if (this.queryName == undefined || this.queryName == "") {
      this.queryReq = true;
    } else {
      this.queryReq = false;
    }
  }
  onDeleteAllCityStateZip() {
    this.selectedCityStateZipList = [];
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
  onDeleteZips() {
    this.zipsSelected = [];
    this.isCityDpwDisable = false;
  }
  onCitysSelect() {
    if (this.citysList && this.citysSelected.length > 0) {
      this.isCityDpwDisable = false;
      this.isZipDpwDisable = true;
    }
  }
  onZipsSelect() {
    if (this.zipsSelected && this.zipsSelected.length > 0) {
      this.isCityDpwDisable = true;
      this.isZipDpwDisable = false;
    }
  }
  enableCityDpw() {
    if (this.citysList && this.citysSelected.length == 0) {
      this.isCityDpwDisable = false;
      this.isZipDpwDisable = false;
    }
  }
  enableZipDpw() {
    if (this.zipsSelected && this.zipsSelected.length == 0) {
      this.isCityDpwDisable = false;
      this.isZipDpwDisable = false;
    }
  }
  getFeatureSettingValues() {
    this.commonMethodService.featureName = "Create_new_query";
    this.commonMethodService.getFeatureSettingValues();
  }
  onUpgrade() {
    // this.activeModal.dismiss();
    this.commonMethodService.commenSendUpgradeEmail(
      this.commonMethodService.featureDisplayName
    );
  }
}
