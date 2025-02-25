import {
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
declare var $: any;
@Component({
  selector: "app-campaign-trans-grid-filter-popup",
  templateUrl: "./campaign-trans-grid-filter-popup.component.html",
  standalone: false,
  styleUrls: ["./campaign-trans-grid-filter-popup.component.scss"],
})
export class CampaignTransGridFilterPopupComponent
  implements OnInit, OnDestroy
{
  @Output() emtOutputAdvancedFilterData: EventEmitter<any> = new EventEmitter();
  @Input() set AdvancedFilterData(selectedAdvancedSearchFilter: any) {
    if (selectedAdvancedSearchFilter) {
      this.commonMethodService.selectedDonors =
        selectedAdvancedSearchFilter.donors;
      this.commonMethodService.selectedFromCampaignList =
        selectedAdvancedSearchFilter.campaigns;
    }
  }
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
  ngOnDestroy() {
    // This aborts all HTTP requests.
    this.ngUnsubscribe.next();
    // This completes the subject properlly.
    this.ngUnsubscribe.complete();
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
      false,
      false
    );
  }

  searchDonors() {
    var objAdvancedSearch = {
      donors: this.commonMethodService.selectedDonors,
      campaigns: this.commonMethodService.selectedFromCampaignList,
    };

    this.emtOutputAdvancedFilterData.emit(objAdvancedSearch);
    this.activeModal.dismiss();
  }

  closePopup() {
    this.activeModal.dismiss();
    this.commonMethodService.resetCommonDropDownList();
  }
  clearFilter() {
    this.commonMethodService.resetCommonDropDownList();
  }
}
