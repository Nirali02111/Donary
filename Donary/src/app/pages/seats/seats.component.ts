import { SettingsService } from "./../../services/settings.service";
import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import {
  AfterContentInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  AfterViewInit,
  ViewChild,
  ChangeDetectionStrategy,
  inject,
} from "@angular/core";
import { NgbModalOptions } from "@ng-bootstrap/ng-bootstrap";
import * as moment from "moment";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { SeatService } from "src/app/services/seat.service";
import { SaveSeatPopupComponent } from "../cards/save-seat-popup/save-seat-popup.component";
import { SeatsCardPopupComponent } from "../cards/seats-card-popup/seats-card-popup.component";
import * as XLSX from "xlsx";
import * as FileSaver from "file-saver";
import { DonorCardPopupComponent } from "../cards/donor-card-popup/donor-card-popup.component";
import { CardService } from "src/app/services/card.service";
import { SeatFilterPopupComponent } from "./seat-filter-popup/seat-filter-popup.component";
import { UIPageSettingService } from "src/app/services/uipagesetting.service";
import { NotificationService } from "src/app/commons/notification.service";
import Swal from "sweetalert2";
import { PrintSeatStickersCardPopupComponent } from "../cards/print-seat-stickers-card-popup/print-seat-stickers-card-popup.component";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import { PdfviewerPopupComponent } from "../cards/payment-card-popup/pdfviewer-popup/pdfviewer-popup.component";
import { PageSyncService } from "src/app/commons/pagesync.service";
import { EventService } from "src/app/services/event.service";
import { XLSXService } from "src/app/services/xlsx.service";
import { mapType, SeatMapModel } from "src/app/models/seats-model";
import { HttpErrorResponse } from "@angular/common/http";
import { AnalyticsService } from "src/app/services/analytics.service";
declare var $: any;

interface SeatItem {
  seatId: string;
  donor: string;
  location: string;
  section: string;
  rowNum: string;
  seatNum: string;
  seatReservedType: string;
  aisle: string;
  paidStatus: string;
  price: string;
  status_class: string;
  campaignId: string;
}
function fullhtml2canvas(el) {
  return new Promise((resolve) => {
    html2canvas(el, {
      width: el.scrollWidth,
      height: el.scrollHeight,
      scale: 2,
    }).then((canvas) => {
      resolve(canvas);
    });
  });
}
@Component({
  selector: "app-seats",
  templateUrl: "./seats.component.html",
  styleUrls: ["./seats.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class SeatsComponent implements OnInit, AfterContentInit, AfterViewInit {
  @ViewChild("mapprint", { static: false }) mapprint: ElementRef;
  @ViewChild("canvas", { static: false }) canvas: ElementRef;
  @ViewChild("downloadLink", { static: false }) downloadLink: ElementRef;

  gridFilterData: Array<SeatItem> = [];
  gridData: Array<SeatItem> = [];
  totalRecord: number = 0;
  isloading: boolean = true;
  isFiltered: boolean = false;
  filterRecord: number = 0;
  modalOptions: NgbModalOptions;
  private destroyed = false;
  isLocationSelected: boolean = false;

  isSeatIdColVisible: boolean = true;
  isSeatDonorNameColVisible: boolean = true;
  isSeatLocationColVisible: boolean = true;
  isSeatSectionColVisible: boolean = true;
  isSeatRowColVisible: boolean = true;
  isSeatSeatNumColVisible: boolean = true;
  isSeatReservedStatusColVisible: boolean = true;
  isSeatAisleColVisible: boolean = true;
  isSeatPaymentStatusColVisible: boolean = true;
  isSeatPriceColVisible: boolean = true;
  isSeatColumnColVisible: boolean = false;
  isSeatColumnGroupColVisible: boolean = false;
  selectCampingSeason: any;
  filtercount: number = 0;
  objAdvancedSearch: any = {};
  mapSection: Array<any> = [];
  highestXPos: Array<any> = [];
  highestYPos: Array<any> = [];
  mapXPos: Array<any> = [];
  pdf1MapXPos: Array<any> = [];
  seatTwoDimensionalArray = [];
  maxXPos: number = 0;
  maxYPos: number = 0;
  scale = 1;
  uiPageSettingId = null;
  uiPageSetting: any;
  selectedSeasonID: any;
  selectedLocationId: number;
  loaderSearch: boolean;
  seatCardId: number = 0;
  seatSaleIdAfterPaymentTransaction: number = 0;
  fromPopup: boolean = false;
  editSeat: boolean = false;
  modalRef: any;
  itemSeat: any;
  isPaymentFromEditSeat: boolean = false;
  colFields = [
    {
      id: 1,
      //title: '',
      isTotalPanel: true,
      items: [
        {
          colName: "SEATID",
          isVisible: true,
          colId: "seatId",
          sortName: "seatId",
        },
        {
          colName: "DONORNAME",
          isVisible: true,
          colId: "donornameId",
          sortName: "donor",
        },
        {
          colName: "LOCATION",
          isVisible: true,
          colId: "locationId",
          sortName: "location",
        },
        {
          colName: "SECTION",
          isVisible: true,
          colId: "sectionId",
          sortName: "section",
        },
        {
          colName: "ROW",
          isVisible: true,
          colId: "rowId",
          sortName: "rowNum",
        },
        {
          colName: "SEAT#",
          isVisible: true,
          colId: "seatNumId",
          sortName: "seatNum",
        },
        {
          colName: "RESERVEDSTATUS",
          isVisible: true,
          colId: "seatReservedId",
          sortName: "seatReservedType",
        },
        {
          colName: "AISLE",
          isVisible: true,
          colId: "aisleId",
          sortName: "aisle",
        },
        {
          colName: "PAYMENTSTATUS",
          isVisible: true,
          colId: "paidStatusId",
          sortName: "paidStatus",
        },
        {
          colName: "SEATPRICE",
          isVisible: true,
          colId: "priceId",
          sortName: "price",
        },
        {
          colName: "Seat Column",
          isVisible: false,
          colId: "columnId",
          sortName: "column",
        },
        {
          colName: "Group Column",
          isVisible: false,
          colId: "columnGroupId",
          sortName: "columnGroup",
        },
      ],
    },
  ];
  isEditSeatPopupClicked: boolean = false;
  itemList = [];
  settings = {};
  iteLocation = [];
  settingLocation = {};
  isListViewShow: boolean = true;
  seasonsList = [];
  selectedSeason = [];
  locationList = [];
  selectedLocation = [];
  isPrintSticker: boolean = false;
  isLabelDisplayed: boolean = false;
  isPDF1: boolean = false;
  isPrice: boolean = true;
  isLoadingIcon: boolean = true;
  isPriceformat: boolean = true;
  settingValue: any;
  isNotifyDonarEmailShow: boolean = false;
  colfieldsValue: any;
  SeatLocationMapId: number;
  private analytics = inject(AnalyticsService);

  constructor(
    public commonMethodService: CommonMethodService,
    protected localstoragedataService: LocalstoragedataService,
    public seatService: SeatService,
    public cardService: CardService,
    private elementRef: ElementRef,
    private notificationService: NotificationService,
    private uiPageSettingService: UIPageSettingService,
    private readonly changeDetectorRef: ChangeDetectorRef,
    private pageSyncService: PageSyncService,
    private eventService: EventService,
    public settingsService: SettingsService,
    private xlsxService: XLSXService
  ) {}

  ngOnInit() {
    this.analytics.visitedSeats();
    this.isloading = true;
    this.colfieldsValue = this.pageSyncService.seatsFieldsCol;
    this.colfieldsValue.forEach((obj: { key: boolean }) => {
      let key = Object.keys(obj)[0];
      let value: boolean = Object.values(obj)[0];
      let data = this.colFields[0].items.find((data) => data.colName === key);
      data.isVisible = value;
    });
    this.GetSetting();
    this.commonMethodService.getSettings();
    this.isPriceformat = false;
    this.commonMethodService.getCampaignList();
    if (
      !this.pageSyncService.listFlag ||
      (!this.pageSyncService.isSeatsListClicked &&
        this.pageSyncService.seatLayout.length == 0)
    ) {
      let objLayout = {
        uiPageSettingId: this.uiPageSettingId,
        userId: this.localstoragedataService.getLoginUserId(),
        moduleName: "lists",
        screenName: "seats",
      };
      this.uiPageSettingService.Get(objLayout).subscribe((res: any) => {
        this.pageSyncService.seatLayout = res;
        this.pageSyncService.isSeatsListClicked = true;
        this.pageSyncService.lastSyncListTime = new Date();
        this.resListModification(res);
      });
    } else {
      let seatRes = this.pageSyncService.seatLayout;
      this.resListModification(seatRes);
      //this.isloading = false;
      //this.changeDetectorRef.detectChanges();
    }
    this.itemList = [
      { id: 1, itemName: "India" },
      { id: 2, itemName: "Singapore" },
      { id: 3, itemName: "Australia" },
      { id: 4, itemName: "Canada" },
      { id: 5, itemName: "South Korea" },
      { id: 6, itemName: "Brazil" },
    ];
    this.settings = {
      text: "Season",
      enableSearchFilter: true,
      addNewItemOnFilter: true,
      singleSelection: true,
    };

    this.iteLocation = [
      { id: 1, itemName: "India" },
      { id: 2, itemName: "Singapore" },
      { id: 3, itemName: "Australia" },
      { id: 4, itemName: "Canada" },
      { id: 5, itemName: "South Korea" },
      { id: 6, itemName: "Brazil" },
    ];
    this.settings = {
      text: "Season",
      enableSearchFilter: true,
      addNewItemOnFilter: true,
      singleSelection: true,
    };
    this.settingLocation = {
      text: "Location",
      enableSearchFilter: true,
      addNewItemOnFilter: true,
      singleSelection: true,
    };
    $(document).ready(function () {
      let modalContent: any = $(".modal");
      modalContent.draggable({
        handle: ".modal-header",
      });
    });

    this.commonMethodService.getSeatLst().subscribe((res: any) => {
      if (res) {
        this.isEditSeatPopupClicked = false;

        this.loadData();
      }
    });
    this.commonMethodService.getPaymentTrans().subscribe((res) => {
      if (res) {
      }
    });

    if (this.pageSyncService.seasonsList.length == 0) {
      this.loadSeasonList();
    } else {
      this.seasonsList = this.pageSyncService.seasonsList;
      /*   if(this.pageSyncService.seatSelectedLocation && this.pageSyncService.seatSelectedSeason)
        this.isloading=false 
       */
    }
    if (this.pageSyncService.seatsFilterData) {
      this.advancedFilterData(this.pageSyncService.seatsFilterData);
    }
  }

  GetSetting() {
    const eventGuid = this.localstoragedataService.getLoginUserEventGuId();
    this.eventService.GetSetting(eventGuid, true).subscribe((res) => {
      this.isNotifyDonarEmailShow = res.some(
        (item) =>
          (item.settingName == "DisableAutomaticPledgeReceiptEmail" &&
            item.text.toLowerCase() == "true") ||
          (item.settingName == "DisableAutomaticPaymentReceiptEmail" &&
            item.text.toLowerCase() == "true")
      );
    });
  }
  ngOnDestroy() {
    this.destroyed = true;
  }

  resListModification(res) {
    if (res) {
      this.uiPageSettingId = res.uiPageSettingId;
      this.uiPageSetting = JSON.parse(res.setting);
      if (this.uiPageSetting != null) {
        if (this.uiPageSetting.isSeatIdColVisible != undefined) {
          this.isSeatIdColVisible = this.uiPageSetting.isSeatIdColVisible;
          this.isSeatDonorNameColVisible =
            this.uiPageSetting.isSeatDonorNameColVisible;
          this.isSeatLocationColVisible =
            this.uiPageSetting.isSeatLocationColVisible;
          this.isSeatSectionColVisible =
            this.uiPageSetting.isSeatSectionColVisible;
          this.isSeatRowColVisible = this.uiPageSetting.isSeatRowColVisible;
          this.isSeatSeatNumColVisible =
            this.uiPageSetting.isSeatSeatNumColVisible;
          this.isSeatReservedStatusColVisible =
            this.uiPageSetting.isSeatReservedStatusColVisible;
          this.isSeatAisleColVisible = this.uiPageSetting.isSeatAisleColVisible;
          this.isSeatPaymentStatusColVisible =
            this.uiPageSetting.isSeatPaymentStatusColVisible;
          this.isSeatPriceColVisible = this.uiPageSetting.isSeatPriceColVisible;
          this.isSeatColumnColVisible =
            this.uiPageSetting.isSeatColumnColVisible;
          this.isSeatColumnGroupColVisible =
            this.uiPageSetting.isSeatColumnGroupColVisible;
          this.selectedSeasonID = this.uiPageSetting.seatSeasonId;
          if (this.localstoragedataService.getSeasonId() != "null") {
            this.isloading = true;

            this.selectedSeasonID = this.localstoragedataService.getSeasonId();
            if (this.selectedSeasonID) {
              this.getSeatLocation();
            }
            // this.changeDetectorRef.detectChanges();
            setTimeout(() => {
              this.selectedSeason = this.seasonsList.filter(
                (x) => x.id == this.selectedSeasonID
              );
              this.selectedLocationId =
                this.locationList.length > 0 && this.locationList[0].id;
              this.selectedLocation =
                this.commonMethodService.localSeatLocationList.filter(
                  (x) => x.id == this.locationList[0].id
                );

              this.loadData();
              if (!this.destroyed) {
                this.changeDetectorRef.detectChanges();
              }
            }, 5000);
            this.localstoragedataService.setSeasonId(null);
            this.changeDetectorRef.detectChanges();
          } else {
            if (this.selectedSeasonID) {
              if (this.pageSyncService.seatLocationList.length == 0) {
                this.getSeatLocation();
              } else {
                this.locationList = this.pageSyncService.seatLocationList;
              }
            }
            this.selectedLocationId = this.uiPageSetting.seatLocationId;

            if (this.pageSyncService.seatSelectedSeason) {
              this.selectedSeasonID = this.pageSyncService.seatSelectedSeason;
            }

            if (this.pageSyncService.seatSelectedLocation) {
              this.selectedLocationId =
                this.pageSyncService.seatSelectedLocation;
            }

            setTimeout(() => {
              this.selectedSeason =
                this.commonMethodService.localSeasonList.filter(
                  (x) => x.id == this.uiPageSetting.seatSeasonId
                );
              this.selectedLocation =
                this.commonMethodService.localSeatLocationList.filter(
                  (x) => x.id == this.selectedLocationId
                );
              if (
                this.pageSyncService.seatSelectedSeason &&
                this.pageSyncService.seatSelectedLocation
              ) {
                this.selectedSeason =
                  this.commonMethodService.localSeasonList.filter(
                    (x) => x.id == this.pageSyncService.seatSelectedSeason
                  );
                this.selectedLocation =
                  this.commonMethodService.localSeatLocationList.filter(
                    (x) => x.id == this.selectedLocationId
                  );
              }
              //this.isloading = false;
              if (!this.destroyed) {
                this.changeDetectorRef.detectChanges();
              }
              this.loadData();
            }, 5000);
          }
          this.selectedLocationId = this.uiPageSetting.seatLocationId;
          if (this.pageSyncService.seatSelectedSeason) {
            this.selectedSeasonID = this.pageSyncService.seatSelectedSeason;
          }

          if (this.pageSyncService.seatSelectedLocation) {
            this.selectedLocationId = this.pageSyncService.seatSelectedLocation;
          }

          this.objAdvancedSearch = this.uiPageSetting.seatSearchitem;
          this.colFields.forEach((element) => {
            element.items.forEach((item) => {
              item.isVisible = this.checkVisibility(item.colName);
            });
          });
          if (this.objAdvancedSearch) {
            this.filterLocalData();
          }
        }
      } else {
        this.isloading = false;
        if (this.localstoragedataService.getSeasonId() != "null") {
          this.isloading = true;

          this.selectedSeasonID = this.localstoragedataService.getSeasonId();
          if (this.selectedSeasonID) {
            this.getSeatLocation();
          }
          setTimeout(() => {
            this.selectedSeason = this.seasonsList.filter(
              (x) => x.id == this.selectedSeasonID
            );
            this.selectedLocationId =
              this.locationList.length > 0 && this.locationList[0].id;
            this.selectedLocation =
              this.commonMethodService.localSeatLocationList.filter(
                (x) => x.id == this.locationList[0].id
              );
            this.loadData();

            if (!this.destroyed) {
              this.changeDetectorRef.detectChanges();
            }
          }, 5000);
          this.localstoragedataService.setSeasonId(null);
        }
        if (!this.destroyed) {
          this.changeDetectorRef.detectChanges();
        }
      }
    } else {
      this.selectedSeason = this.commonMethodService.localSeasonList.filter(
        (x) => x.id == this.localstoragedataService.getSeasonId()
      );
      this.selectedSeasonID = this.localstoragedataService.getSeasonId();
      if (
        this.pageSyncService.seatSelectedSeason &&
        this.pageSyncService.seatSelectedLocation
      ) {
        this.selectedSeason = this.commonMethodService.localSeasonList.filter(
          (x) => x.id == this.pageSyncService.seatSelectedSeason
        );
        this.selectedLocationId = this.pageSyncService.seatSelectedLocation;
        this.selectedLocation =
          this.commonMethodService.localSeatLocationList.filter(
            (x) => x.id == this.selectedLocationId
          );
        this.gridFilterData = this.pageSyncService.seatListData;

        this.mapSection = this.pageSyncService.sections;
        this.resLoadDataModification(this.pageSyncService.seatList);

        this.totalRecord = this.gridFilterData.length;
        this.locationList = this.commonMethodService.localSeatLocationList;
      }
      if (this.selectedSeasonID != "null") {
        this.loadData();

        this.isloading = false;
        if (!this.destroyed) {
          this.changeDetectorRef.detectChanges();
        }
      } else {
        this.isloading = false;
        if (!this.destroyed) {
          this.changeDetectorRef.detectChanges();
        }
      }
    }
  }

  getSeatLocation() {
    const eventGuId = this.localstoragedataService.getLoginUserEventGuId();
    this.seatService
      .getLocationsDropdown(eventGuId, this.selectedSeasonID)
      .subscribe((res) => {
        if (res) {
          this.locationList = res.map((s) => {
            let obj = {
              id: s.locationId,
              itemName: s.locationName,
            };
            return obj;
          });
          this.commonMethodService.localSeatLocationList = this.locationList;
          this.pageSyncService.seatLocationList = this.locationList;
        }
      });
  }

  loadSeasonList() {
    const eventGuId = this.localstoragedataService.getLoginUserEventGuId();
    this.seatService.getSeasonsDropdown(eventGuId).subscribe((res) => {
      if (res) {
        this.isloading = false;
        this.seasonsList = res.map((s) => {
          let obj = {
            id: s.seasonId,
            itemName: s.seasonName,
          };
          return obj;
        });
        this.commonMethodService.localSeasonList = this.seasonsList;
        this.pageSyncService.seasonsList = this.seasonsList;
      } else this.isloading = false;
    });
  }

  ngAfterContentInit(): void {
    if (!this.destroyed) {
      this.changeDetectorRef.detectChanges();
    }
  }

  ngAfterViewInit(): void {
    if (!this.destroyed) {
      this.changeDetectorRef.detectChanges();
    }
  }

  loadData() {
    this.pageSyncService.seatList = [];
    if (this.selectedSeasonID && this.selectedLocationId) {
      this.isPrintSticker = true;
    }
    let locationIdExistInSeason = this.locationList.find(
      (location) => location.id == this.selectedLocationId
    );

    if (
      !this.selectedSeasonID ||
      !this.selectedLocationId ||
      !locationIdExistInSeason
    ) {
      this.isloading = false;
      return false;
    }

    if (
      this.pageSyncService.seatList.length == 0 ||
      this.fromPopup ||
      this.isLocationSelected ||
      this.editSeat
    ) {
      if (this.selectedSeasonID != "null") {
        const objSeat = {
          eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
          seatLocationId: this.selectedLocationId,
          seasonId: this.selectedSeasonID,
        };
        this.isloading = true;

        this.seatService.getSeatList(objSeat).subscribe(
          (res) => {
            this.isloading = false;
            this.isLocationSelected = false;
            if (res) {
              if (this.fromPopup) {
                this.getSeatDataAfterTransaction();
              }
              this.fromPopup = false;

              this.pageSyncService.seatList = res;
              this.pageSyncService.seatListData = res.seats;
              this.pageSyncService.sections = res.sections;
              this.SeatLocationMapId = res.maps[0].seatLocationMapId;
              this.resLoadDataModification(res);

              //this.changeDetectorRef.detectChanges();
            }
          },
          (err) => {
            this.isloading = false;
          }
        );
      } else this.isloading = false;
    } else {
      setTimeout(() => {
        this.isloading = false;
        this.resLoadDataModification(this.pageSyncService.seatList), 2000;
      });
      // this.changeDetectorRef.detectChanges();
    }
    this.editSeat = false;
  }

  resLoadDataModification(res) {
    this.mapSection = res.sections;

    res.seats.forEach((s) => {
      if (s.paidStatus == "Paid") {
        s.status_class = "pledge_paid";
      } else if (s.paidStatus == "Open") {
        s.status_class = "pledge_open";
      } else if (s.paidStatus == "Partially Paid") {
        s.status_class = "pledge_partial";
      } else if (s.paidStatus == "Voided") {
        s.status_class = "pledge_void";
      } else if (s.paidStatus == "Running") {
        s.status_class = "pledge_running";
      }

      if (s.seatId === this.seatCardId) {
        this.seatSaleIdAfterPaymentTransaction = s.seatSaleId;
      }
    });
    //const highestXPos = res.seats.reduce((prev, current) => (prev.xPos > current.xPos) ? prev : current).xPos;
    //this.maxXPos =highestXPos;
    //this.highestXPos = new Array(highestXPos).fill(null).map((_, i) => i + 1);
    //this.highestXPos=this.highestXPos.reverse();
    this.highestXPos = [];
    this.highestYPos = [];

    let highestXPos = res.seats.map((x) => Number(x.xPos));
    let sortedXPos = highestXPos.filter(this.onlyUnique).sort();

    const xPosArrayList = sortedXPos.reduce((prev, current) =>
      prev > current ? prev : current
    );
    const colNumArrayList = new Array(xPosArrayList)
      .fill(null)
      .map((_, i) => i + 1);
    this.maxXPos = xPosArrayList;
    let highestYPos = res.seats.map((x) => Number(x.yPos));
    let sortedYPos = highestYPos.filter(this.onlyUnique).sort();

    const yPosArrayList = sortedYPos.reduce((prev, current) =>
      prev > current ? prev : current
    );
    const rowNumArrayList = new Array(yPosArrayList)
      .fill(null)
      .map((_, i) => i + 1);
    this.maxYPos = yPosArrayList;

    let rowNumMap = res.seats.map((x) => Number(x.rowNum));
    let sortedRowNum = rowNumMap.filter(this.onlyUnique).sort();

    let finalArray = [];
    let tempArray = [];
    for (let i = 0; i < yPosArrayList; i++) {
      if (
        sortedYPos.indexOf(rowNumArrayList[i]) >= 0 &&
        sortedRowNum.indexOf(rowNumArrayList[i]) >= 0
      ) {
        if (tempArray.length > 0) {
          finalArray.push(tempArray[tempArray.length - 1]);
          tempArray.pop();
          finalArray.push(rowNumArrayList[i]);
        } else {
          finalArray.push(rowNumArrayList[i]);
        }
      } else {
        if (i != yPosArrayList - 1) {
          if (sortedRowNum.indexOf(rowNumArrayList[i]) >= 0) {
            tempArray.push(rowNumArrayList[i]);
            finalArray.push("");
          } else {
            finalArray.push("");
          }
        }
      }
    }
    this.highestYPos = finalArray;

    res.sections.forEach((element) => {
      res.seats.forEach((item) => {
        if (item.seatSectionId == element.seatSectionId) {
          item.color = element.color;
        }
      });
    });

    this.MapView(res);
    this.isloading = false;
    if (this.selectCampingSeason && this.selectCampingSeason[0].id) {
      this.onSelectCampingSeason();
    }
    this.gridFilterData = res.seats;
    this.gridData = res.seats;
    this.totalRecord = this.gridData.length;
    this.filterRecord = this.gridFilterData.length;
    let resultArray = [];
    if (!this.destroyed) {
      this.changeDetectorRef.detectChanges();
    }
  }
  getSeatDataAfterTransaction() {
    let objSeatCard = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      seatSaleId: this.seatSaleIdAfterPaymentTransaction,
    };
    this.seatService.getSeat(objSeatCard).subscribe(
      (res: any) => {
        if (res) {
          this.modalRef.componentInstance.SeatCardData = res;
          this.modalRef.componentInstance.seatIdData = this.seatCardId;
          this.modalRef.componentInstance.SeatValueItem = this.itemSeat;
        }
      },
      (error) => {
        console.log(error, "err");
      }
    );
  }
  onlyUnique(value, index, array) {
    return array.indexOf(value) === index;
  }
  temp = 0;
  isEmpty = true;
  MapView(res) {
    this.seatTwoDimensionalArray = [];
    this.mapXPos = [];
    this.pdf1MapXPos = [];
    let reverseColGroup = [];
    for (let i = 1; i <= this.maxYPos; i++) {
      this.seatTwoDimensionalArray[i] = [];
      this.isEmpty = true;
      let k = 0;
      let colGrp = "";
      for (let j = 1; j <= this.maxXPos + 1; j++) {
        let cell = res.seats.find((obj) => {
          return obj.yPos === i && obj.xPos === j;
        });

        if (cell != null) {
          let loctChar = cell.location.substring(0, 1);
          let colLeng =
            cell.column.length == 1 ? "0" + cell.column : cell.column;
          let rowLeng =
            cell.rowNum.length == 1 ? "0" + cell.rowNum : cell.rowNum;
          cell.label = loctChar + rowLeng + colLeng;
          cell.pdf1Label = k + 1;
          if (this.isPriceformat == false) {
            if (cell.price) {
              cell.price = cell.price?.toString().replace("$", "");
              cell.price = parseFloat(cell.price);
            }
            cell.price = this.commonMethodService.formatAmount(cell.price);
          }

          cell.groupedBy = "";
          if (j == this.maxXPos - 1) {
            cell.rowNumber = i;
          } else {
            cell.rowNumber = "";
          }
          this.seatTwoDimensionalArray[i][j] = cell;
          if (i == 4) {
            this.highestXPos.push(cell.columnGroup);
            this.pdf1MapXPos.push(cell.column);
          }
          this.isEmpty = false;
          colGrp = cell.columnGroup;
          k++;
        } else {
          let hideRowNum = k;
          if (!this.isEmpty) {
            cell = {
              donor: "empty",
              xPos: j,
              yPos: i,
              rowNumber: i,
              groupedBy: "block-group grouped_by_" + hideRowNum,
            };
            if (i == 4) {
              this.mapXPos.push({
                groupedBy: "block-group grouped_by_" + hideRowNum,
              });
              reverseColGroup.push(colGrp);
            }
            this.isEmpty = true;
            k = 0;
            colGrp = "";
          } else {
            cell = {
              donor: "empty",
              xPos: j,
              yPos: i,
              rowNumber: "",
              groupedBy: "",
              posNum: "",
            };
          }
          this.seatTwoDimensionalArray[i][j] = cell;
          if (i == 4) {
            this.temp = 0;
            for (let iT = 1; iT <= this.maxYPos; iT++) {
              let tempCell = res.seats.find((obj) => {
                return obj.yPos === iT && obj.xPos === j;
              });
              if (tempCell != null && this.temp != 1) {
                this.highestXPos.push(tempCell.columnGroup);
                this.pdf1MapXPos.push(tempCell.column);
                this.temp = 1;
                k++;
              }
              if (iT == this.maxYPos && this.temp == 0) {
                this.highestXPos.push("");
                this.pdf1MapXPos.push("");
              }
            }
          }
        }
      }
    }
    this.pdf1MapXPos = this.pdf1MapXPos.reverse();
    this.highestXPos = this.highestXPos.reverse();
    this.mapXPos.forEach((element, index) => {
      element.posNum = reverseColGroup[index];
    });
    this.mapXPos = this.mapXPos.reverse();

    //    let highestMapXPos = this.highestXPos.filter(this.onlyUnique).sort();
    //  const mapXPosLength = highestMapXPos.length-1;
    //  this.mapXPos = new Array(mapXPosLength).fill(null).map((_, i) => i + 1);

    this.seatTwoDimensionalArray.shift();
    for (let i = 0; i < this.seatTwoDimensionalArray.length; i++) {
      this.seatTwoDimensionalArray[i].shift();
    }
  }

  getStyleList(item) {
    if (item.color) {
      let backcolor = this.hexToRgbA(item.color);
      return {
        "background-color": backcolor,
        color: item.color,
        "border-color": item.color,
      };
    }
  }

  getSeatStyleList(item) {
    if (item.color) {
      let backcolor = this.hexToRgbA(item.color);
      return {
        "background-color": backcolor,
        color: "#434246",
        "border-color": item.color,
      };
    }
  }

  getPriceStyle(item) {
    if (item.color) {
      let backcolor = this.hexToRgbA(item.color);
      return { color: item.color, "border-color": item.color };
    }
  }

  getLabelStyle(item) {
    if (item.color) {
      let backcolor = this.hexToRgbA(item.color);
      return { background: item.color };
    }
  }

  hexToRgbA(hex) {
    let c;
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
      c = hex.substring(1).split("");
      if (c.length == 3) {
        c = [c[0], c[0], c[1], c[1], c[2], c[2]];
      }
      c = "0x" + c.join("");
      return (
        "rgba(" +
        [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(",") +
        ",0.08)"
      );
    }
    throw new Error("Bad Hex");
  }

  arrayMove(arr, fromIndex, toIndex) {
    var element = arr[fromIndex];
    arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, element);
  }
  zoomLevel = 1;

  zoomIn() {
    if (this.zoomLevel < 1.5) {
      this.zoomLevel += 0.1;
    }
  }

  zoomOut() {
    if (this.zoomLevel > 0.5) {
      this.zoomLevel -= 0.1;
    }
  }

  SaveLayout() {
    let setting = {
      isSeatIdColVisible: this.isSeatIdColVisible,
      isSeatDonorNameColVisible: this.isSeatDonorNameColVisible,
      isSeatLocationColVisible: this.isSeatLocationColVisible,
      isSeatSectionColVisible: this.isSeatSectionColVisible,
      isSeatRowColVisible: this.isSeatRowColVisible,
      isSeatSeatNumColVisible: this.isSeatSeatNumColVisible,
      isSeatReservedStatusColVisible: this.isSeatReservedStatusColVisible,
      isSeatAisleColVisible: this.isSeatAisleColVisible,
      isSeatPaymentStatusColVisible: this.isSeatPaymentStatusColVisible,
      isSeatPriceColVisible: this.isSeatPriceColVisible,
      seatSeasonId: this.selectedSeasonID,
      seatLocationId: this.selectedLocationId,
      seatSearchitem: this.objAdvancedSearch,
      isSeatColumnColVisible: this.isSeatColumnColVisible,
      isSeatColumnGroupColVisible: this.isSeatColumnGroupColVisible,
    };
    let objLayout = {
      uiPageSettingId: this.uiPageSettingId,
      userId: this.localstoragedataService.getLoginUserId(),
      moduleName: "lists",
      screenName: "seats",
      setting: JSON.stringify(setting),
    };
    this.uiPageSettingService.Save(objLayout).subscribe((res: any) => {
      if (res) {
        this.uiPageSetting = res.uiPageSetting;
        Swal.fire({
          title: "Layout Saved Successfully",
          icon: "success",
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
  checkColVisibility(colName) {
    let col = this.colfieldsValue.find(
      (data) => Object.keys(data)[0] == colName
    );
    return col ? col[colName] : false;
  }

  checkVisibility(colName) {
    let col = this.colfieldsValue.find(
      (data) => Object.keys(data)[0] == colName
    );
    if (col) {
      return col[colName];
    } else {
      return this.checkGridColVisibility(colName);
    }
  }
  checkGridColVisibility(colName) {
    colName = colName.toLowerCase().replace(/\s/g, "");
    switch (colName) {
      case "seatid":
        return this.isSeatIdColVisible;
      case "donorname":
        return this.isSeatDonorNameColVisible;
      case "location":
        return this.isSeatLocationColVisible;
      case "section":
        return this.isSeatSectionColVisible;
      case "row":
        return this.isSeatRowColVisible;
      case "seat#":
        return this.isSeatSeatNumColVisible;
      case "reservedstatus":
        return this.isSeatReservedStatusColVisible;
      case "aisle":
        return this.isSeatAisleColVisible;
      case "paymentstatus":
        return this.isSeatPaymentStatusColVisible;
      case "seatprice":
        return this.isSeatPriceColVisible;
      case "groupcolumn":
        return this.isSeatColumnColVisible;
      case "seatcolumn":
        return this.isSeatColumnGroupColVisible;
    }
  }

  setGridColVisibility($event, colName, isVisible) {
    var fieldsData = this.pageSyncService.seatsFieldsCol;
    var obj = fieldsData.find((data) => Object.keys(data)[0] === colName);
    obj
      ? (obj[colName] = isVisible)
      : fieldsData.push({ [colName]: isVisible });
    colName = colName.toLowerCase().replace(/\s/g, "");
    switch (colName) {
      case "seatid":
        this.isSeatIdColVisible = isVisible;
        break;
      case "donorname":
        this.isSeatDonorNameColVisible = isVisible;
        break;
      case "location":
        this.isSeatLocationColVisible = isVisible;
        break;
      case "section":
        this.isSeatSectionColVisible = isVisible;
        break;
      case "row":
        this.isSeatRowColVisible = isVisible;
        break;
      case "seat#":
        this.isSeatSeatNumColVisible = isVisible;
        break;
      case "reservedstatus":
        this.isSeatReservedStatusColVisible = isVisible;
        break;
      case "aisle":
        this.isSeatAisleColVisible = isVisible;
        break;
      case "paymentstatus":
        this.isSeatPaymentStatusColVisible = isVisible;
        break;
      case "seatprice":
        this.isSeatPriceColVisible = isVisible;
        break;
      case "groupcolumn":
        this.isSeatColumnColVisible = isVisible;
        break;
      case "seatcolumn":
        this.isSeatColumnGroupColVisible = isVisible;
        break;
    }
    $event.stopPropagation();
  }

  search(keyword) {
    let record = this.searchFilterLocalData();
    let filterdRecord;
    keyword = keyword.toLowerCase().replace(/[().]/g, "");
    if (keyword != "") {
      let searchArray = keyword.split(" ");
      for (let searchValue of searchArray) {
        filterdRecord = record.filter(
          (obj) =>
            (obj.seatId &&
              obj.seatId.toString().toLowerCase().indexOf(searchValue) > -1) ||
            (obj.donor &&
              obj.donor.toString().toLowerCase().indexOf(searchValue) > -1) ||
            (obj.location &&
              obj.location.toLowerCase().toString().indexOf(searchValue) >
                -1) ||
            (obj.section &&
              obj.section.toLowerCase().toString().indexOf(searchValue) > -1) ||
            (obj.rowNum &&
              obj.rowNum.toString().toLowerCase().indexOf(searchValue) > -1) ||
            (obj.seatNum &&
              obj.seatNum.toString().toLowerCase().indexOf(searchValue) > -1) ||
            (obj.seatReservedType &&
              obj.seatReservedType
                .toString()
                .toLowerCase()
                .indexOf(searchValue) > -1) ||
            (obj.aisle &&
              obj.aisle.toString().toLowerCase().indexOf(searchValue) > -1) ||
            (obj.paidStatus &&
              obj.paidStatus.toString().toLowerCase().indexOf(searchValue) >
                -1) ||
            (obj.price &&
              obj.price.toString().toLowerCase().indexOf(searchValue) > -1)
        );

        this.gridFilterData = filterdRecord;
        this.filterRecord = filterdRecord.length;
        this.isFiltered = true;
        record = this.gridFilterData;
      }
    }
    if (keyword == "") {
      this.gridFilterData = this.searchFilterLocalData();
      this.filterRecord = this.gridFilterData.length;
    }
  }

  dropGroupItem(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
  }

  getConnectedList(): any[] {
    return this.colFields.map((x) => `${x.id}`);
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.colFields, event.previousIndex, event.currentIndex);
    moveItemInArray(
      this.gridFilterData,
      event.previousIndex,
      event.currentIndex
    );
  }

  openSeatsCardPopup(seatId, item) {
    this.isPaymentFromEditSeat = false;
    let amountFromSeatPaymentType = 0;

    if (seatId != null) {
      this.modalOptions = {
        centered: true,
        size: "lg",
        backdrop: "static",
        keyboard: true,
        windowClass: "drag_popup seat_card",
      };
      this.modalRef = this.commonMethodService.openPopup(
        SeatsCardPopupComponent,
        this.modalOptions
      );
      this.seatCardId = item.seatId;
      this.itemSeat = item;
      var objSeatCard = {
        eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
        seatSaleId: item.seatSaleId,
      };
      this.seatService.getSeat(objSeatCard).subscribe(
        (res: any) => {
          // hide loader
          this.modalRef.componentInstance.isNotifyDonarEmailShow =
            this.isNotifyDonarEmailShow;
          this.modalRef.componentInstance.SeatCardData = res;
          this.modalRef.componentInstance.seatIdData = seatId;
          this.modalRef.componentInstance.SeatValueItem = item;
          this.modalRef.componentInstance.emtSeatSave.subscribe((res: any) => {
            if (res) {
              this.editSeat = true;
              this.loadData();
            }
          });
          if (res && res.pledgePayments && res.pledgePayments.length !== 0) {
            res.pledgePayments.map((el) => {
              if (el.type === "Payment") {
                this.isPaymentFromEditSeat = true;
                amountFromSeatPaymentType = el.amount;
              }
            });
          }

          this.modalRef.componentInstance.amountFromSeatPaymentType =
            amountFromSeatPaymentType;
          this.modalRef.componentInstance.isPaymentFromEditSeat =
            this.isPaymentFromEditSeat;
        },
        (error) => {
          Swal.fire({
            title: this.commonMethodService.getTranslate(
              "WARNING_SWAL.SOMETHING_WENT_WRONG"
            ),
            text: error.error.errors.seatSaleId,
            icon: "error",
            confirmButtonText: this.commonMethodService.getTranslate(
              "WARNING_SWAL.BUTTON.CONFIRM.OK"
            ),
            customClass: { confirmButton: "btn_ok" },
          });
          this.modalRef.close();
        }
      );
      this.isEditSeatPopupClicked = true;
      this.modalRef.componentInstance.emtOpenSeatCard.subscribe((res: any) => {
        if (res) {
          this.fromPopup = true;
          this.loadData();
        }
      });
    }
  }

  SaveSeatPopup(item) {
    this.isloading = false;
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup save_seat",
    };
    const modalRef = this.commonMethodService.openPopup(
      SaveSeatPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.SeatValue = item;
    modalRef.componentInstance.SeatTitle = "Reserve Seat";
    modalRef.componentInstance.AddSeat = true;
  }
  EditSeatPopup(item) {
    // this.isloading = true;
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup save_seat",
    };

    var obj = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      seatSaleId: item.seatSaleId,
    };
    this.seatService.getSeat(obj).subscribe(
      (res: any) => {
        // hide loader
        this.isloading = false;
        this.modalRef = this.commonMethodService.openPopup(
          SaveSeatPopupComponent,
          this.modalOptions
        );
        this.modalRef.componentInstance.isNotifyDonarEmailShow =
          this.isNotifyDonarEmailShow;
        this.modalRef.componentInstance.SeatValue = item;
        this.modalRef.componentInstance.SeatTitle = "Edit Seat";
        this.modalRef.componentInstance.SeatData = res;
        this.isEditSeatPopupClicked = true;
        if (!this.destroyed) {
          this.changeDetectorRef.detectChanges();
        }
        this.modalRef.componentInstance.emtSeatSave.subscribe((res: any) => {
          if (res) {
            this.editSeat = true;
            this.loadData();
          }
        });
      },
      (error) => {
        Swal.fire({
          title: this.commonMethodService.getTranslate(
            "WARNING_SWAL.SOMETHING_WENT_WRONG"
          ),
          text: error.error.errors.seatSaleId,
          icon: "error",
          confirmButtonText: this.commonMethodService
            .getTranslate("WARNING_SWAL.BUTTON.CONFIRM.OK")
            .commonMethodService.getTranslate("WARNING_SWAL.BUTTON.CONFIRM.OK")
            .commonMethodService.getTranslate("WARNING_SWAL.BUTTON.CONFIRM.OK"),
          customClass: { confirmButton: "btn_ok" },
        });
        this.modalRef.close();
      }
    );
  }

  openDonorCardPopup(accountID) {
    if (accountID != null && accountID != 0) {
      this.isloading = false;
      this.modalOptions = {
        centered: true,
        size: "lg",
        backdrop: "static",
        keyboard: true,
        windowClass: "drag_popup donor_card",
      };
      const modalRef = this.commonMethodService.openPopup(
        DonorCardPopupComponent,
        this.modalOptions
      );
      modalRef.componentInstance.AccountId = accountID;
      var objDonorCard = {
        eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
        accountId: accountID,
      };

      this.cardService.getDonorCard(objDonorCard).subscribe((res: any) => {
        // hide loader
        this.isloading = false;
        modalRef.componentInstance.DonorCardData = res;
      });
    }
  }

  downloadExcel() {
    this.isloading = true;
    let results = this.gridFilterData.length && this.gridFilterData;
    let data = [];
    if (results) {
      Object.values(results).forEach((item: any) => {
        let row = {};
        if (this.isSeatIdColVisible) {
          row["Seat #"] = item && item.seatId;
        }
        if (this.isSeatDonorNameColVisible) {
          row["Donor"] = item && item.donor;
        }
        if (this.isSeatLocationColVisible) {
          row["Location"] = item && item.location;
        }
        if (this.isSeatSectionColVisible) {
          row["Section"] = item && item.section;
        }
        if (this.isSeatRowColVisible) {
          row["Row"] = item && item.rowNum;
        }
        if (this.isSeatSeatNumColVisible) {
          row["Seat #"] = item && item.seatNum;
        }
        if (this.isSeatSeatNumColVisible) {
          row["Reserved Seat"] = item && item.seatReservedType;
        }
        if (this.isSeatSeatNumColVisible) {
          row["Aisle"] = item && item.aisle;
        }
        if (this.isSeatSeatNumColVisible) {
          row["Payment Status"] = item && item.paidStatus;
        }
        if (this.isSeatPriceColVisible) {
          row["Seat Price"] = this.commonMethodService.formatAmount(
            Number(item && item.price)
          );
        }
        if (this.isSeatColumnColVisible) {
          row["Seat Column"] = item && item.column;
        }
        if (this.isSeatColumnGroupColVisible) {
          row["Group Column"] = item && item.columnGroup;
        }
        data.push(row);
      });
    } else {
      return;
    }

    const filename = this.xlsxService.getFilename("Seat List");
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data, {
      cellStyles: true,
    });
    var range = XLSX.utils.decode_range(worksheet["!ref"]);
    for (var C = range.s.r; C <= range.e.r; ++C) {
      var address = XLSX.utils.encode_col(C) + "1"; // <-- first row, column number C
      if (!worksheet[address]) continue;
      worksheet[address].s = { bold: true };
    }

    const workbook: XLSX.WorkBook = {
      Sheets: { data: worksheet },
      SheetNames: ["data"],
    };

    const excelBuffer: any = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
      cellStyles: true,
    });

    const excelData: Blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });
    FileSaver.saveAs(excelData, filename);
    this.isloading = false;
    if (!this.destroyed) {
      this.changeDetectorRef.detectChanges();
    }
  }
  onSelectCampingSeason() {
    this.gridFilterData = this.gridData;
    this.gridFilterData = this.gridFilterData.filter(
      (x) => x.campaignId == this.selectCampingSeason[0].id
    );
    this.totalRecord = this.gridData.length;
    this.filterRecord = this.gridFilterData.length;
    //this.isFiltered = true;
  }
  onDeSelectCampingSeason() {
    this.gridFilterData = this.gridData;
    this.totalRecord = this.gridData.length;
    this.filterRecord = this.gridFilterData.length;
    this.isFiltered = false;
  }
  openSearchFilterPopup() {
    this.isloading = false;
    this.modalOptions = {
      centered: true,
      size: "lg",
      keyboard: true,
      windowClass: "donor_filter modal_responsive",
    };
    const modalRef = this.commonMethodService.openPopup(
      SeatFilterPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.allData = this.gridData;
    modalRef.componentInstance.AdvancedFilterData = this.objAdvancedSearch;
    modalRef.componentInstance.emtOutputAdvancedFilterData.subscribe(
      (objResponse) => {
        this.advancedFilterData(objResponse);
      }
    );
  }
  advancedFilterData(objResponse) {
    this.objAdvancedSearch = objResponse;
    this.filtercount = 0;
    const countFilter = Object.keys(objResponse).map((key) => {
      let filtervalue = objResponse[key];
      if (filtervalue && filtervalue.length > 0) {
        this.filtercount += 1;
        return;
      }
      if (filtervalue && (filtervalue.minValue || filtervalue.maxValue)) {
        this.filtercount += 1;
        return;
      }
    });

    if (this.filtercount > 0) {
      this.filterLocalData();
    }

    this.gridFilterData =
      this.filtercount == 0 ? this.gridData : this.gridFilterData;
    this.isFiltered = true;
    this.totalRecord = this.gridData.length;
    this.filterRecord = this.gridFilterData.length;
  }
  isContain(val: string, search: string) {
    if (!search) {
      return true;
    }
    return (
      val && val.toString().toLowerCase() == search.toString().toLowerCase()
    );
  }
  filterLocalData() {
    this.gridFilterData = this.gridData.filter((o) => {
      return this.inAllFields(o);
    });

    this.filterRecord = this.gridFilterData.length;
  }
  inAllFields(o) {
    return (
      this.isContain(
        o.campaignId,
        this.objAdvancedSearch.season.length > 0 &&
          this.objAdvancedSearch.season[0].id
      ) &&
      this.isMultipleContain(
        o.seatReservedType,
        this.objAdvancedSearch.seatStatus.length > 0 &&
          this.objAdvancedSearch.seatStatus
      ) &&
      this.isMultipleContain(
        o.paidStatus,
        this.objAdvancedSearch.paymentStatus.length > 0 &&
          this.objAdvancedSearch.paymentStatus
      ) &&
      this.isMultipleContain(
        o.section,
        this.objAdvancedSearch.section.length > 0 &&
          this.objAdvancedSearch.section
      ) &&
      this.isMultipleContain(
        o.location,
        this.objAdvancedSearch.location.length > 0 &&
          this.objAdvancedSearch.location
      ) &&
      this.isMultipleContain(
        o.rowNum,
        this.objAdvancedSearch.row.length > 0 && this.objAdvancedSearch.row
      ) &&
      this.isMultipleContain(
        o.seatNum,
        this.objAdvancedSearch.seat.length > 0 && this.objAdvancedSearch.seat
      ) &&
      this.isMultipleContain(
        o.aisle,
        this.objAdvancedSearch.aisle.length > 0 && this.objAdvancedSearch.aisle
      ) &&
      this.isPriceContain(o.price, this.objAdvancedSearch.seatPrice)
    );
  }
  isPriceContain(val: string, search: any) {
    if (!search.minValue && !search.maxValue) {
      return true;
    }
    if (search.minValue && !search.maxValue) {
      return val && val <= search.minValue;
    }
    if (search.maxValue && !search.minValue) {
      return val && val <= search.maxValue;
    }
    if (search.maxValue && search.minValue) {
      return val >= search.minValue && val <= search.maxValue;
    }
  }
  isMultipleContain(val: string, search: any) {
    if (!search) {
      return true;
    }
    return search.some((item) => item.id == val);
  }
  searchFilterLocalData() {
    if (this.filtercount > 0) {
      const resultData = this.gridData.filter((o) => {
        return this.inAllFields(o);
      });
      return resultData;
    }
    return this.gridData;
  }
  onListView() {
    this.isListViewShow = true;
  }
  onMapView() {
    this.isListViewShow = false;
  }
  contains_heb(str) {
    return /[\u0590-\u05FF]/.test(str);
  }
  onDeSelectAll(item) {
    switch (item) {
      case "selectedLocation":
        this.selectedLocation = [];
        break;

      case "selectedSeason":
        this.selectedSeason = [];
        break;
    }
  }

  onSelectSeason(event) {
    this.locationList = [];
    this.selectedLocation = [];
    this.selectedSeasonID = event.id;
    this.pageSyncService.seatSelectedSeason = this.selectedSeasonID;
    this.selectedLocation = [];
    const eventGuId = this.localstoragedataService.getLoginUserEventGuId();
    this.seatService
      .getLocationsDropdown(eventGuId, this.selectedSeasonID)
      .subscribe((res) => {
        if (res) {
          this.locationList = [];
          this.locationList = res.map((s) => {
            let obj = {
              id: s.locationId,
              itemName: s.locationName,
            };
            return obj;
          });
        }
        this.commonMethodService.localSeatLocationList = this.locationList;
        this.pageSyncService.seatLocationList = this.locationList;
      });
    this.onSeasonLocationFilter();
  }

  onSelectLocation(event) {
    this.selectedLocationId = event.id;
    this.pageSyncService.seatSelectedLocation = this.selectedLocationId;
    this.isLocationSelected = true;
    this.loadData();

    this.onSeasonLocationFilter();
  }
  onSeasonLocationFilter() {
    let obj = {};
    if (
      Object.keys(this.objAdvancedSearch).length === 0 &&
      this.objAdvancedSearch.constructor === Object
    ) {
      obj = {
        aisle: [],
        location: this.selectedLocation,
        paymentStatus: [],
        row: [],
        season: this.selectedSeason,
        seat: [],
        seatPrice: { minValue: "", maxValue: "" },
        seatStatus: [],
        section: [],
      };
    } else {
      this.objAdvancedSearch.location = this.selectedLocation;
      this.objAdvancedSearch.season = this.selectedSeason;
      obj = this.objAdvancedSearch;
    }
    this.objAdvancedSearch = obj;
    this.filterLocalData();
    //this.isFiltered = true;
    this.totalRecord = this.gridData.length;
    this.filterRecord = this.gridFilterData.length;
  }
  getSeasonCount(id) {
    let count = 0;
    if (id) {
      count = this.gridData.filter((x) => x.seatId == id).length;
    }
    return count;
  }
  getLocationCount(location) {
    let count = 0;
    if (location) {
      count = this.gridData.filter((x) => x.location == location).length;
    }
    return count;
  }

  printOptionsModal(event) {
    this.modalOptions = {
      centered: true,
      size: "md",
      keyboard: true,
      windowClass: "printOptionsModal_popup",
    };
    const modalRef = this.commonMethodService.openPopup(
      PrintSeatStickersCardPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.allData = event;
    modalRef.componentInstance.seatLocationId = this.selectedLocationId;
    modalRef.componentInstance.seasonId = this.selectedSeasonID;
    modalRef.componentInstance.emtMapPrint.subscribe((res) => {
      let mapType!: mapType;
      if (res == "SeatRow") mapType = "rowColumn";
      else if (res == "SeatId") mapType = "seatId";

      this.getMapPdfUrl(mapType);
    });
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

  /** get pdf url for seat map and open it in a popup component */
  getMapPdfUrl(mapType: mapType) {
    const eventGuid = this.localstoragedataService.getLoginUserEventGuId();
    let mapPdfObj: SeatMapModel = {
      eventGuId: eventGuid,
      seasonId: this.selectedSeasonID,
      mapId: this.SeatLocationMapId,
      mapType: mapType,
    };

    this.seatService.getMapPdf(mapPdfObj).subscribe(
      (mapUrl: string) => {
        const modalRef = this.displayReport();
        modalRef.componentInstance.filePath = mapUrl;
      },
      (error: HttpErrorResponse) => {
        this.isloading = false;
        Swal.fire({
          title: error.error,
          icon: "error",
          confirmButtonText: "Ok",
          customClass: {
            confirmButton: "btn_ok",
          },
        });
      }
    );
  }
}
