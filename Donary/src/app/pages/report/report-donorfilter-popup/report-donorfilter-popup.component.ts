import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { Subject } from "rxjs";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
declare var $: any;
@Component({
  selector: "app-report-donorfilter-popup",
  templateUrl: "./report-donorfilter-popup.component.html",
  styleUrls: ["./report-donorfilter-popup.component.scss"],
  standalone: false,
})
export class ReportDonorfilterPopupComponent implements OnInit {
  @Output() emtOutputAdvancedFilterData: EventEmitter<any> = new EventEmitter();

  @Input() set AdvancedFilterData(result: any) {
    var selectedAdvancedSearchFilter = result.data;
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
    }
    if (result.isButtonGenerate) {
      this.buttonName = "Generate";
    } else {
      this.buttonName = "Update";
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
  buttonName: string;
  defaultLocations = [];
  protected ngUnsubscribe: Subject<void> = new Subject<void>();
  constructor(
    public activeModal: NgbActiveModal,
    public commonMethodService: CommonMethodService,
    public localstoragedataService: LocalstoragedataService
  ) {}

  ngOnInit() {
    $(document).ready(function () {
      let modalContent: any = $(".modal");
      modalContent.draggable({
        handle: ".modal-header",
      });
    });
    this.bindData();
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
  ngOnDestroy() {
    // This aborts all HTTP requests.
    this.ngUnsubscribe.next();
    // This completes the subject properlly.
    this.ngUnsubscribe.complete();
  }
  searchDonors() {
    var objAdvancedSearch = {
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
    };

    this.emtOutputAdvancedFilterData.emit(objAdvancedSearch);
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
    //this.isCommonDropDownloading = false;
  }
}
