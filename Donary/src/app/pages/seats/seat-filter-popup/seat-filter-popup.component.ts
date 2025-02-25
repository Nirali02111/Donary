import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { PageSyncService } from "src/app/commons/pagesync.service";

@Component({
  selector: "app-seat-filter-popup",
  templateUrl: "./seat-filter-popup.component.html",
  standalone: false,
  styleUrls: ["./seat-filter-popup.component.scss"],
})
export class SeatFilterPopupComponent implements OnInit {
  sectionList = [];
  locationList = [];
  rowList = [];
  seatList = [];
  aisleList = [];
  seatPriceList = [];
  seatStatusList = [];
  paymentStatusList = [];
  selectedSection = [];
  selectedLocation = [];
  selectedRow = [];
  selectedSeat = [];
  selectedAisle = [];
  selectedSeatPrice = { minValue: "", maxValue: "" };
  selectedSeason = [];
  selectedSeatStatus = [];
  selectedPaymentStatus = [];
  isloading: boolean = false;
  @Output() emtOutputAdvancedFilterData: EventEmitter<any> = new EventEmitter();
  @Input() set allData(data: any) {
    this.isloading = true;
    const resultData = data.map((x) => {
      this.sectionList.push({ id: x.section, itemName: x.section });
      this.locationList.push({ id: x.location, itemName: x.location });
      let rowNum = this.filterNumerbes(x.rowNum);
      this.rowList.push({ id: x.rowNum, itemName: x.rowNum });
      let seatNum = this.filterNumerbes(x.seatNum);
      this.seatList.push({ id: x.seatNum, itemName: x.seatNum });
      this.aisleList.push({ id: x.aisle, itemName: x.aisle });
      this.seatPriceList.push({ id: x.price, itemName: x.price });
      if (x.seatReservedType) {
        this.seatStatusList.push({
          id: x.seatReservedType,
          itemName: x.seatReservedType,
        });
      }
      if (x.paidStatus) {
        this.paymentStatusList.push({
          id: x.paidStatus,
          itemName: x.paidStatus,
        });
      }
    });
    this.sectionList = this.removeDuplicates(this.sectionList);
    this.locationList = this.removeDuplicates(this.locationList);
    this.rowList = this.removeDuplicates(this.rowList);
    this.seatList = this.removeDuplicates(this.seatList);
    this.aisleList = this.removeDuplicates(this.aisleList);
    this.seatPriceList = this.removeDuplicates(this.seatPriceList);
    this.seatPriceList = this.sortByAscending(this.seatPriceList);
    this.seatList = this.sortByNumber(this.seatList);
    this.rowList = this.sortByNumber(this.rowList);
    this.seatStatusList = this.removeDuplicates(this.seatStatusList);
    this.paymentStatusList = this.removeDuplicates(this.paymentStatusList);
    this.isloading = false;
  }
  @Input() set AdvancedFilterData(filterData: any) {
    if (filterData) {
      this.selectedSection = filterData.section;
      this.selectedLocation = filterData.location;
      this.selectedRow = filterData.row;
      this.selectedSeat = filterData.seat;
      this.selectedAisle = filterData.aisle;
      this.selectedSeatPrice = filterData.seatPrice
        ? filterData.seatPrice
        : this.selectedSeatPrice;
      this.selectedSeason = filterData.season;
      this.selectedSeatStatus = filterData.seatStatus;
      this.selectedPaymentStatus = filterData.paymentStatus;
    }
  }
  constructor(
    public activeModal: NgbActiveModal,
    public commonMethodService: CommonMethodService,
    public pageSyncService: PageSyncService
  ) {}

  ngOnInit() {}
  closePopup() {
    this.activeModal.dismiss();
    this.clearFilter();
  }
  removeDuplicates(items) {
    const uniqueVal = items.reduce((unique, o) => {
      if (!unique.some((obj) => obj.id === o.id)) {
        unique.push(o);
      }
      return unique;
    }, []);
    return uniqueVal;
  }
  clearFilter() {
    this.isloading = true;
    this.selectedSection = [];
    this.selectedLocation = [];
    this.selectedRow = [];
    this.selectedSeat = [];
    this.selectedAisle = [];
    this.selectedSeatPrice = { minValue: "", maxValue: "" };
    this.selectedSeason = [];
    this.selectedSeatStatus = [];
    this.selectedPaymentStatus = [];
    this.isloading = false;
  }

  contains_heb(str) {
    return /[\u0590-\u05FF]/.test(str);
  }

  searchSeats() {
    const objAdvancedSearch = {
      season: this.selectedSeason ? this.selectedSeason : [],
      section: this.selectedSection ? this.selectedSection : [],
      location: this.selectedLocation ? this.selectedLocation : [],
      row: this.selectedRow ? this.selectedRow : [],
      seat: this.selectedSeat ? this.selectedSeat : [],
      aisle: this.selectedAisle ? this.selectedAisle : [],
      seatPrice: this.selectedSeatPrice ? this.selectedSeatPrice : [],
      seatStatus: this.selectedSeatStatus ? this.selectedSeatStatus : [],
      paymentStatus: this.selectedPaymentStatus
        ? this.selectedPaymentStatus
        : [],
    };
    this.pageSyncService.seatsFilterData = objAdvancedSearch;
    this.emtOutputAdvancedFilterData.emit(objAdvancedSearch);
    this.activeModal.dismiss();
  }
  onDeSelectAll(item) {
    switch (item) {
      case "selectedSection":
        this.selectedSection = [];
        break;
      case "selectedLocation":
        this.selectedLocation = [];
        break;
      case "selectedRow":
        this.selectedRow = [];
        break;
      case "selectedSeat":
        this.selectedSeat = [];
        break;
      case "selectedAisle":
        this.selectedAisle = [];
        break;
      case "selectedSeason":
        this.selectedSeason = [];
        break;
      case "selectedSeatStatus":
        this.selectedSeatStatus = [];
        break;
      case "selectedPaymentStatus":
        this.selectedPaymentStatus = [];
        break;
    }
  }
  sortByAscending(items) {
    const result = items.sort((a, b) => {
      if (a.id < b.id) return -1;
      return a.id > b.id ? 1 : 0;
    });
    return result;
  }
  filterNumerbes(value) {
    const val = Number(value) ? Number(value) : value;
    return val;
  }
  sortByNumber(items) {
    const newItem = items.sort((a, b) => a.id - b.id);
    return newItem;
  }
}
