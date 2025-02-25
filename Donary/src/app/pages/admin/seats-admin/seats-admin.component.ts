import { Component, inject, OnInit } from "@angular/core";
import { NgbModalOptions } from "@ng-bootstrap/ng-bootstrap";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { AddSeatsPopupComponent } from "./add-seats-popup/add-seats-popup.component";
import { SeasonCardPopupComponent } from "./season-card-popup/season-card-popup.component";
import { RateListObj, SeatService } from "src/app/services/seat.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import Swal from "sweetalert2";
import { environment } from "src/environments/environment";
import { CreateSeasonPopupComponent } from "./create-season-popup/create-season-popup.component";
import { AnalyticsService } from "src/app/services/analytics.service";

@Component({
  selector: "app-seats-admin",
  templateUrl: "./seats-admin.component.html",
  standalone: false,
  styleUrls: ["./seats-admin.component.scss"],
})
export class SeatsAdminComponent implements OnInit {
  isLoading = false;
  modalOptions: NgbModalOptions;
  listData: Array<RateListObj> = [];
  isNewCreateSeasonRelease: boolean = false;
  private analytics = inject(AnalyticsService);

  constructor(
    public commonMethodService: CommonMethodService,
    private seatAPIService: SeatService,
    private localStorageDataService: LocalstoragedataService
  ) {}

  ngOnInit() {
    this.analytics.visitedAdminSeats();
    this.isNewCreateSeasonRelease =
      environment.releaseFeature.isNewCreateSeasonRelease;

    this.getData();
    if (this.commonMethodService.localCampaignList.length == 0) {
      this.commonMethodService.getCampaignList();
    }
  }

  private getData() {
    this.isLoading = true;
    const eventGuId = this.localStorageDataService.getLoginUserEventGuId();
    this.seatAPIService.getRateList(eventGuId).subscribe(
      (res) => {
        this.isLoading = false;
        this.listData = res;
      },
      () => {
        this.isLoading = false;
      }
    );
  }

  AddNewSeason() {
    if (this.isNewCreateSeasonRelease) {
      this.modalOptions = {
        centered: true,
        size: "md",
        backdrop: "static",
        keyboard: true,
        windowClass: "modal-season",
      };

      const modalRef = this.commonMethodService.openPopup(
        CreateSeasonPopupComponent,
        this.modalOptions
      );
    } else {
      this.modalOptions = {
        centered: true,
        size: "md",
        backdrop: "static",
        keyboard: true,
        windowClass: "drag_popup AddNewSeason-popup",
      };

      const modalRef = this.commonMethodService.openPopup(
        SeasonCardPopupComponent,
        this.modalOptions
      );
      modalRef.componentInstance.emitSeasonCreated.subscribe((res) => {
        if (res) {
          this.commonMethodService.getCampaignList();
        }
      });
    }
  }

  private commonSeatRatePopup() {
    this.modalOptions = {
      centered: true,
      size: "md",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup add-adminSeats-popup",
    };
    return this.commonMethodService.openPopup(
      AddSeatsPopupComponent,
      this.modalOptions
    );
  }

  onAddNewSeatRate() {
    const modalRef = this.commonSeatRatePopup();
    modalRef.componentInstance.refresh.subscribe((val) => {
      this.getData();
    });
  }

  onEditSeatRate(item: RateListObj) {
    Swal.fire({
      text: "Are you sure you want to edit this rate, Please note this rate will only be changed on new seasons, it will not change the rate on existing seats",
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Continue Edit",
      cancelButtonText: this.commonMethodService.getTranslate("CANCEL"),
    }).then((result) => {
      if (result.value) {
        const modalRef = this.commonSeatRatePopup();
        modalRef.componentInstance.seatRateData = item;
        modalRef.componentInstance.refresh.subscribe((val) => {
          this.getData();
        });
      }
    });
  }

  onDeleteSeatRate(item: RateListObj) {
    Swal.fire({
      title: this.commonMethodService.getTranslate("WARNING_SWAL.TITLE"),
      text: "Are you sure you want to delete this rate, please note this rate will only be deleted on new season, it will not delete the rate on existing seats",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: this.commonMethodService.getTranslate(
        "WARNING_SWAL.BUTTON.CANCEL.NO_KEEP_IT"
      ),
    }).then((result) => {
      if (result.value) {
        this.isLoading = true;
        this.seatAPIService.deleteRate(item.rateId).subscribe(
          (res) => {
            this.getData();
          },
          (err) => {
            this.isLoading = false;
          }
        );
      }
    });
  }
}
