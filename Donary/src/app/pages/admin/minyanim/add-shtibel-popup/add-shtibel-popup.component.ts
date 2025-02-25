import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from "@angular/core";
import { NgbActiveModal, NgbModalOptions } from "@ng-bootstrap/ng-bootstrap";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { AnalyticsService } from "src/app/services/analytics.service";
import { MinyanimService } from "src/app/services/minyanim.service";
import Swal from "sweetalert2";

@Component({
  selector: "app-add-shtibel-popup",
  templateUrl: "./add-shtibel-popup.component.html",
  standalone: false,
  styleUrls: ["./add-shtibel-popup.component.scss"],
})
export class AddShtibelPopupComponent implements OnInit {
  modalOptions: NgbModalOptions;
  title = "Add shtibel name";
  shtibelName: string;
  isloading: boolean = false;
  roomId: number;
  isDeleted: boolean = false;
  @Output() emtOutputRoomAdded: EventEmitter<any> = new EventEmitter();
  isEdit: boolean;

  @Input() set data(item) {
    if (item) {
      this.roomId = item.roomId;
      this.shtibelName = item.roomName;
    }
  }

  @Input() set editpop(editpop) {
    if (editpop === "editMode") {
      this.isEdit = true;
      this.title = "Edit shtibel name";
      this.isDeleted = true;
    }
  }
  private analytics = inject(AnalyticsService);

  constructor(
    public activeModal: NgbActiveModal,
    private minyanimService: MinyanimService,
    private localstoragedataService: LocalstoragedataService,
    public commonMethodService: CommonMethodService
  ) {}

  ngOnInit() {}

  closePopup() {
    this.activeModal.dismiss();
  }

  onSaveChanges() {
    this.isloading = true;
    let obj = {
      roomId: this.roomId,
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      createdBy: this.localstoragedataService.getLoginUserId(),
      roomName: this.shtibelName,
      macAddress: this.localstoragedataService.getLoginUserGuid(),
    };
    this.minyanimService.save(obj).subscribe(
      (res: any) => {
        if (this.isEdit) this.analytics.editedMinyanim();
        else this.analytics.createdMinyanim();

        this.emtOutputRoomAdded.emit(true);
        this.closePopup();
        this.isloading = false;
        Swal.fire({
          title: "",
          text: res,
          icon: "success",
          confirmButtonText: this.commonMethodService.getTranslate(
            "WARNING_SWAL.BUTTON.CONFIRM.OK"
          ),
          customClass: {
            confirmButton: "btn_ok",
          },
        });
      },
      (err) => {
        this.isloading = false;
        Swal.fire({
          title: this.commonMethodService.getTranslate(
            "WARNING_SWAL.SOMETHING_WENT_WRONG"
          ),
          text: err.error,
          icon: "error",
          confirmButtonText: this.commonMethodService.getTranslate(
            "WARNING_SWAL.BUTTON.CONFIRM.OK"
          ),
          customClass: {
            confirmButton: "btn_ok",
          },
        });
      }
    );
  }

  delete(roomId) {
    this.minyanimService.delete(roomId).subscribe((res: any) => {
      this.emtOutputRoomAdded.emit(true);
      this.closePopup();
      this.isloading = false;
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
