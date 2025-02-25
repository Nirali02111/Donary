import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { TagService } from "src/app/services/tag.service";
import * as _ from "lodash";
import Swal from "sweetalert2";
import {
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { AnalyticsService } from "src/app/services/analytics.service";
import { CommonMethodService } from "src/app/commons/common-methods.service";

declare var $: any;

@Component({
  selector: "app-donor-addtag-popup",
  templateUrl: "./donor-addtag-popup.component.html",
  styleUrls: ["./donor-addtag-popup.component.scss"],
  standalone: false,
})
export class DonorAddtagPopupComponent implements OnInit {
  @Output() emtOutputTagUpdate: EventEmitter<any> = new EventEmitter();
  @Output() emtOutputTagRemove: EventEmitter<any> = new EventEmitter();

  // Create & Edit
  title: string = "";
  isloading: boolean = false;
  isEditMode: boolean = false;
  confirmMessage = "";
  tagForm: UntypedFormGroup = new UntypedFormGroup({
    TagId: new UntypedFormControl(""),
    TagName: new UntypedFormControl("", [Validators.required]),
    TagColor: new UntypedFormControl("red"),
    RecordType: new UntypedFormControl(1),
  });
  featureName: string = "Add_Tags_advanced_fields";

  @Input() set Type(data) {
    if (data) {
      if (data == "add") {
        this.title = "Add new tag";
        this.isloading = false;
        this.isEditMode = false;
        this.confirmMessage = "Tag added successfully";
      } else {
        this.title = "Edit tag";
        this.isEditMode = true;
        this.confirmMessage = "Tag updated successfully";
      }
    }
  }

  @Input() set TagData(data) {
    if (data) {
      this.tagForm.patchValue({
        TagName: _.trim(data.tagName, " :"),
        TagColor: data.tagColor,
        TagId: data.tagId,
      });
    }
  }
  private analytics = inject(AnalyticsService);

  constructor(
    public activeModal: NgbActiveModal,
    public localstoragedataService: LocalstoragedataService,
    private tagService: TagService,
    public commonMethodService: CommonMethodService
  ) {}

  ngOnInit() {
    this.commonMethodService.getFeatureSetting(this.featureName);
    $(document).ready(function () {
      let modalContent: any = $(".modal");
      modalContent.draggable({
        handle: ".headbar",
      });
    });
  }

  closePopup() {
    this.activeModal.dismiss();
  }

  get TagNameCtrl() {
    return this.tagForm.get("TagName");
  }

  get TagId() {
    return this.tagForm.get("TagId");
  }

  get TagColorValue() {
    return this.tagForm.get("TagColor");
  }

  onSave() {
    if (this.tagForm.invalid) {
      return;
    }
    this.isloading = true;
    const saveData = {
      EventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      MacAddress: this.localstoragedataService.getLoginUserGuid(),
      CreatedBy: this.localstoragedataService.getLoginUserId(),
      ...this.tagForm.value,
    };

    this.tagService.saveTAg(saveData).subscribe(
      (res) => {
        this.isloading = false;
        this.emtOutputTagUpdate.emit({
          ...res,
        });
        this.isEditMode
          ? this.analytics.editedTag
          : this.analytics.createdTag();
        this.closePopup();
        Swal.fire({
          title: "",
          text: this.confirmMessage,
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
      }
    );
  }

  onDelete() {
    Swal.fire({
      title: "Are you sure you want to delete this tag from all donors?",

      text: "Please be aware that this tag will be deleted from all donors that have this tag.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Nevermind",
      onOpen: function () {},
      showClass: {
        popup: `
          swal2-modal-danger
        `,
      },
    }).then((result) => {
      if (result.value) {
        if (result.value) {
          $(Swal.getConfirmButton()).prop("disabled", false);

          this.isloading = true;
          const formData = {
            EventGuId: this.localstoragedataService.getLoginUserEventGuId(),
            MacAddress: this.localstoragedataService.getLoginUserGuid(),
            TagId: this.TagId.value,
            DeletedBy: this.localstoragedataService.getLoginUserId(),
          };
          this.tagService.deleteTag(formData).subscribe(
            (res: any) => {
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
              }).then(() => {
                this.closePopup();
                this.emtOutputTagRemove.emit(this.TagId.value);
              });
            },
            (err) => {
              this.isloading = false;
            }
          );
        }
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: this.commonMethodService.getTranslate("CANCELLED"),
          text: "Your tag is safe :)",
          icon: "error",
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
}
