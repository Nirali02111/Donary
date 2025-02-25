import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { Router } from "@angular/router";
import { NgbActiveModal, NgbModalOptions } from "@ng-bootstrap/ng-bootstrap";

import { CommonMethodService } from "src/app/commons/common-methods.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { AngularMultiSelect } from "src/app/commons/modules/angular-multi-select-module/multiselect.component";
import { PageRouteVariable } from "src/app/commons/page-route-variable";
import { SaveCampaignPopupComponent } from "src/app/pages/campaign/save-campaign-popup/save-campaign-popup.component";
import { SeatService } from "src/app/services/seat.service";
import Swal from "sweetalert2";
declare var $: any;
@Component({
  selector: "app-season-card-popup",
  templateUrl: "./season-card-popup.component.html",
  styleUrls: ["./season-card-popup.component.scss"],
  standalone: false,
})
export class SeasonCardPopupComponent implements OnInit {
  @ViewChild("campaigndrp", { static: false }) dropdownRef: AngularMultiSelect;
  locationList = [];
  selectedLocation = [];
  selectedSeason = [];
  seasonsList = [];
  campaignList = [];
  selectedSeasonID: number;
  selectedLocationId: number;
  modalOptions: NgbModalOptions;
  isloading: boolean = false;
  dropdownVisible: boolean = false;
  @Output() emitSeasonCreated: EventEmitter<any> = new EventEmitter();

  seatUpdateUrl: string = "/" + PageRouteVariable.ListPage_url;

  constructor(
    public activeModal: NgbActiveModal,
    public commonMethodService: CommonMethodService,
    protected localstoragedataService: LocalstoragedataService,
    public seatService: SeatService,
    private router: Router
  ) {}

  ngOnInit() {
    this.getSeasonList();
    this.getMapLocationsList();
  }
  getSeasonList() {
    const eventGuId = this.localstoragedataService.getLoginUserEventGuId();
    this.seatService.getSeasonsDropdown(eventGuId).subscribe((res) => {
      if (res) {
        res.forEach((s) => {
          let obj = {
            id: s.seasonId,
            itemName: s.seasonName,
          };
          this.seasonsList.push(obj);
        });
      }
    });
  }
  getMapLocationsList() {
    const eventGuId = this.localstoragedataService.getLoginUserEventGuId();
    this.seatService.getMapLocationsDropdown(eventGuId).subscribe((res) => {
      if (res) {
        res.forEach((s) => {
          let obj = {
            id: s.mapLocationId,
            itemName: s.mapName,
          };
          this.locationList.push(obj);
        });
      }
    });
  }
  contains_heb(str) {
    return /[\u0590-\u05FF]/.test(str);
  }
  closePopup() {
    this.activeModal.dismiss();
  }

  openDrop() {
    if ($(".dropdown-list[hidden]")) {
      this.dropdownVisible = !this.dropdownVisible;
    }
  }

  selectCampaign(event) {
    this.selectedSeasonID = event.id;
  }

  onSelectLocation(event) {}

  onGenerate() {
    this.isloading = true;
    const eventGuId = this.localstoragedataService.getLoginUserEventGuId();
    let obj = {
      eventGuId: eventGuId,
      campaignId: this.selectedSeasonID,
      mapLocationIds:
        this.selectedLocation.length > 0
          ? this.selectedLocation.map((s) => s.id)
          : null,
    };

    this.seatService.createSeason(obj).subscribe(
      (res: any) => {
        if (res) {
          this.isloading = false;
          this.localstoragedataService.setSeasonId(obj.campaignId);
          this.emitSeasonCreated.emit(true);
          Swal.fire({
            title: "Success",
            text: res,
            icon: "success",
            confirmButtonText: this.commonMethodService.getTranslate(
              "WARNING_SWAL.BUTTON.CONFIRM.OK"
            ),
            customClass: {
              confirmButton: "btn_ok",
            },
          }).then((result) => {
            if (result) {
              this.router.navigate(["lists"], {
                state: {
                  activeTab: "seats",
                },
              });
              this.activeModal.dismiss();
            }
          });
        }
      },
      (error) => {
        this.isloading = false;
        this.emitSeasonCreated.emit(false);
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
        }).then((result) => {
          if (result) {
            this.activeModal.dismiss();
          }
        });
      }
    );
  }

  openSaveCampaignPopup() {
    this.modalOptions = {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
      windowClass: "drag_popup savecampaign_popup",
    };
    const modalRef = this.commonMethodService.openPopup(
      SaveCampaignPopupComponent,
      this.modalOptions
    );
    modalRef.componentInstance.Type = "add";
  }
}
