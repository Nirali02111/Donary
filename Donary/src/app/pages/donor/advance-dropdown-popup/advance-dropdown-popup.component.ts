import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { AdvancedFieldService } from "src/app/services/advancedfield.service";
import { AnalyticsService } from "src/app/services/analytics.service";
import Swal from "sweetalert2";
declare var $: any;

@Component({
  selector: "app-advance-dropdown-popup",
  templateUrl: "./advance-dropdown-popup.component.html",
  styleUrls: ["./advance-dropdown-popup.component.scss"],
  standalone: false,
})
export class AdvanceDropdownPopupComponent implements OnInit {
  @Output() emtSaveAdvanceFields: EventEmitter<any> = new EventEmitter();
  @Output() updateAdvancedFieldsList: EventEmitter<any> = new EventEmitter();

  // Create & Edit
  title: string = "";
  isloading: boolean = false;
  isEditMode: boolean = false;

  isDropdownField: boolean;
  fieldType: string;
  fieldTitle: string;
  fieldId: string = null;
  option: any[] = [{ item: null }];
  isFormubmited = false;
  options = [
    { value: "text", icon: "icon-font", label: "TEXTFIELD" },
    { value: "dropdown", icon: "icon-dropdown", label: "DROPDOWN" },
  ];
  private analytics = inject(AnalyticsService);

  constructor(
    public activeModal: NgbActiveModal,
    public localstoragedataService: LocalstoragedataService,
    public advancefieldService: AdvancedFieldService,
    private cdRef: ChangeDetectorRef,
    public commonMethodService: CommonMethodService
  ) {}

  @Input() set FieldType(type) {
    if (type == "text") {
      this.isDropdownField = false;
      this.fieldType = "text";
    } else {
      this.isDropdownField = true;
      this.fieldType = "dropdown";
    }
  }

  @Input() set Type(data) {
    if (data) {
      if (data == "add") {
        this.title = "Add new advanced field";
        this.isloading = false;
        this.isEditMode = false;
      } else {
        this.title = "Edit advanced field";
        this.isEditMode = true;
      }
    }
  }

  @Input() set FieldData(data) {
    if (data) {
      this.fieldTitle = this.advancefieldService.formatFieldName(
        data.fieldName
      );
      this.fieldId = data.advancedFieldId;
      if (data.type == "dropdown" && data.options) {
        this.option = data.options.split(",").map((v) => ({ item: v }));
      }
    }
  }

  ngOnInit() {
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

  ChangeFieldType(selectedValue) {
    this.isFormubmited = false;
    if (selectedValue === "text") {
      this.isDropdownField = false;
    } else {
      this.isDropdownField = true;
    }
  }

  addOption() {
    this.isFormubmited = false;
    this.option.push({ item: null });
    this.cdRef.detectChanges();
    const latestIndex = this.option.length - 1;
    this.focusLatestAddedElement(latestIndex);
  }
  focusLatestAddedElement(index: number) {
    if (index >= 0) {
      const element = document.getElementById(`adv_item_unique${index}`);
      if (element) {
        element.focus();
      }
      this.cdRef.detectChanges();
    }
  }
  SaveAdvanceField() {
    this.isFormubmited = true;
    let isValid = true;
    if (this.fieldType == "text" && !this.fieldTitle) {
      isValid = false;
    }
    if (this.fieldType == "dropdown") {
      this.option.forEach((element) => {
        if (!element.item) {
          isValid = false;
          return;
        }
      });
    }

    if (isValid) {
      this.isloading = true;
      var saveAdvancedField = {
        eventGuid: this.localstoragedataService.getLoginUserEventGuId(),
        MacAddress: this.localstoragedataService.getLoginUserGuid(),
        AdvancedFieldId: this.fieldId,
        FieldName: this.fieldTitle,
        Type: this.fieldType,
        Options:
          this.fieldType == "text"
            ? null
            : this.option.map((x) => x.item).toString(),
        RecordType: 1,
        CreatedBy: this.localstoragedataService.getLoginUserId(),
      };
      this.advancefieldService.save(saveAdvancedField).subscribe((res: any) => {
        if (res) {
          this.isEditMode
            ? this.analytics.editedAdvancedFields()
            : this.analytics.createdAdvancedField();

          var objAdvanceField = {
            advancedFieldId: res.advancedFieldId,
            fieldName: res.fieldName,
            type: res.type,
            options: res.options,
            advancedFieldRecordType: res.advancedFieldRecordType,
          };
          setTimeout(() => {
            this.isloading = false;
          }, 250);
          this.activeModal.dismiss();
          this.emtSaveAdvanceFields.emit(objAdvanceField);
        }
      });
    }
  }

  removeAdvanceFieldOption(index: number) {
    if (this.fieldType == "dropdown" && this.option.length !== 0) {
      Swal.fire({
        title: "Are you sure you want to delete this option?",
        text: "Please be aware that this option will be deleted from all donors that have this option.",
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
          this.option.splice(index, 1);
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          Swal.fire({
            title: this.commonMethodService.getTranslate("CANCELLED"),
            text: "Your Advanced Field option is safe :)",
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
  deleteAdvancedField() {
    Swal.fire({
      title: "Are you sure you want to delete this field from all donors?",

      text: "Please be aware that this field will be deleted from all donors that have this field.",
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
        var objadvanceField = {
          eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
          macAddress: this.localstoragedataService.getLoginUserGuid(),
          advancedFieldId: this.fieldId,
          deletedBy: this.localstoragedataService.getLoginUserId(),
        };
        this.advancefieldService
          .delete(objadvanceField)
          .subscribe((res: any) => {
            if (res) {
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
                this.updateAdvancedFieldsList.emit(this.fieldId);
              });
            }
          });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: this.commonMethodService.getTranslate("CANCELLED"),
          text: "Your Advanced Field is safe :)",
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
