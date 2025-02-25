import { ChangeDetectorRef, Component, HostListener, inject } from '@angular/core';
import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { CommonMethodService } from 'src/app/commons/common-methods.service';
import { LocalstoragedataService } from 'src/app/commons/local-storage-data.service';
import { AdvancedFieldService } from 'src/app/services/advancedfield.service';
import { AdvanceDropdownPopupComponent } from '../../donor/advance-dropdown-popup/advance-dropdown-popup.component';
import Swal from 'sweetalert2';
import { TagObj, TagService } from 'src/app/services/tag.service';
import { DonorAddtagPopupComponent } from '../../donor/donor-addtag-popup/donor-addtag-popup.component';
import { AnalyticsService } from 'src/app/services/analytics.service';

@Component({
  selector: "app-advanced-fields",
  standalone: false,

  templateUrl: './advanced-fields.component.html',
  styleUrl: './advanced-fields.component.scss'
})
export class AdvancedFieldsComponent {
  private analytics = inject(AnalyticsService);

  constructor(    private advanceFieldService: AdvancedFieldService,
    private localstorageService: LocalstoragedataService,
    public commonMethodService: CommonMethodService,
    private readonly changeDetectorRef: ChangeDetectorRef,
    public tagService: TagService,
  ){

  }

  ngOnInit(){
    this.analytics.visitedAdvancedFields();
    this.getAllAdvancedField()
    this.getTagList()

  }
  activeSection: string = 'section1'; // Set the initial active section
  setAdvancedField: any[] = [
    { name: 'Custom Fields', id: 'section1' }, 
    { name: 'Tags', id: 'section2' } 
  ];
  advancedFieldValues: any[] = [];
  modalOptions: NgbModalOptions;
  tagList: Array<TagObj> = [];

  @HostListener('window:scroll', [])
  onScroll() {
    const section1 = document.getElementById('section1');
    const section2 = document.getElementById('section2');

    if (this.isElementInViewport(section1)) {
      this.activeSection = 'section1';
      return;
    }
    if (this.isElementInViewport(section2)) {
      this.activeSection = 'section2';
      return;
    }
  }

  isElementInViewport(el: HTMLElement | null): boolean {
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  
  onSectionChange(cls) {
    const element = document.querySelector(`.${cls}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      this.activeSection = cls;
    }
  } 
  getAllAdvancedField() {
    const eventGuId = this.localstorageService.getLoginUserEventGuId();
    this.advanceFieldService.getAll(eventGuId).subscribe(
      (res: any) => {
        if (res) {
          this.advancedFieldValues = res.map((obj) => {
            return {
              advancedField: obj,
              value: null,
            };
          });
          this.advancedFieldValues.forEach((element) => {
            if (
              element.advancedField.type == "dropdown" &&
              element.advancedField.options != null &&
              element.advancedField.options.indexOf(",") > -1
            ) {
              element.advancedField.options =
                element.advancedField.options.split(",");
            } else {
              element.advancedField.options = [element.advancedField.options];
            }
          });
          
        }
      },
      (err) => {
        console.log(err,'error');
        
      }
    );
  }
  deleteField(item,i){

    Swal.fire({
      title: "Are you sure you want to delete this field from all donors?",
      text: "Please be aware that this field will be deleted from all donors that have this field.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Nevermind",
      onOpen: function () {
      },
      showClass: {
        popup: `
          swal2-modal-danger
        `
      },
    }).then((result) => {
      if (result.value) {
        
        //  Swal.getConfirmButton().prop("disabled", false);
          var objadvanceField = {
            eventGuId: this.localstorageService.getLoginUserEventGuId(),
            macAddress: this.localstorageService.getLoginUserGuid(),
            advancedFieldId: item.advancedField.advancedFieldId,
            deletedBy: this.localstorageService.getLoginUserId(),
          };
          this.advanceFieldService
            .delete(objadvanceField)
            .subscribe((res: any) => {
              if (res) {
                Swal.fire({
                  title: this.commonMethodService.getTranslate('WARNING_SWAL.SUCCESS_TITLE'),
                  text: res,
                  icon: "success",
                  confirmButtonText: this.commonMethodService.getTranslate('WARNING_SWAL.BUTTON.CONFIRM.OK'),
                  customClass: {
                    confirmButton: "btn_ok",
                  },
                });
                this.advancedFieldValues.splice(i, 1);
              }
            });
        
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: this.commonMethodService.getTranslate('CANCELLED'),
          text: "Your Advanced Field is safe :)",
          icon: "error",
          confirmButtonText: this.commonMethodService.getTranslate('WARNING_SWAL.BUTTON.CONFIRM.OK'),
          customClass: {
            confirmButton: "btn_ok",
          },
        });
      }
    });


  


  }
  editField(item){
  
      this.modalOptions = {
        centered: true,
        size: "lg",
        backdrop: "static",
        keyboard: true,
        windowClass: "drag_popup advance_dropdown",
      };
  
      const eventGuid = this.localstorageService.getLoginUserEventGuId();
      const MacAddress = this.localstorageService.getLoginUserGuid();
      const modalRef = this.commonMethodService.openPopup(
        AdvanceDropdownPopupComponent,
        this.modalOptions
      );
  
      this.advanceFieldService.get(item.advancedField.advancedFieldId, eventGuid, MacAddress).subscribe(
        (res: any) => {
          if (res) {
         //   this.isloading = false;
            modalRef.componentInstance.Type = "edit";
            modalRef.componentInstance.FieldType = res.type;
            modalRef.componentInstance.FieldData = res;
          }
        },
        (err) => {
         // this.isloading = false;
        }
      );
  
      modalRef.componentInstance.emtSaveAdvanceFields.subscribe((res: any) => {
        if (res) {
          if (this.advancedFieldValues == null) {
            this.advancedFieldValues = [];
          }
          this.advancedFieldValues = this.advancedFieldValues.map((obj) => {
            if (obj.advancedField.advancedFieldId == res.advancedFieldId) {
              return {
                advancedField: res,
                value: null,
              };
            }
            return {
              ...obj,
            };
          });
          this.changeDetectorRef.detectChanges();
          this.advancedFieldValues.forEach((element) => {
            if (
              element.advancedField.type == "dropdown" &&
              element.advancedField.options != null &&
              element.advancedField.options.indexOf(",") > -1
            ) {
              element.advancedField.options =
                element.advancedField.options.split(",");
            } else {
              element.advancedField.options = [element.advancedField.options];
            }
          });
          this.changeDetectorRef.detectChanges();
        }
      });
      modalRef.componentInstance.updateAdvancedFieldsList.subscribe((val)=>{
        
        this.advancedFieldValues = this.advancedFieldValues.filter((o) => {
          
          return o.advancedField.advancedFieldId !== val; // issue
        });
        
      })
    }
    getTagList() {
      const eventGuId = this.localstorageService.getLoginUserEventGuId();
      this.tagService.getAllTag(eventGuId).subscribe(
        (res) => {
          if (res) {
            this.tagList = res;
            
          }
        },
        (err) => {
          console.log(err);
        }
      );
    }
    editTag(item){
      
      this.modalOptions = {
        centered: true,
        size: "lg",
        backdrop: "static",
        keyboard: true,
        windowClass: "advance_dropdown",
      };
  
      const eventGuId = this.localstorageService.getLoginUserEventGuId();
      const macAddress = this.localstorageService.getLoginUserGuid();
      const modalRef = this.commonMethodService.openPopup(
        DonorAddtagPopupComponent,
        this.modalOptions
      );
  
      this.tagService.getTag(item.tagId, eventGuId, macAddress).subscribe(
        (res) => {
          this.changeDetectorRef.detectChanges();
          if (res) {
            modalRef.componentInstance.Type = "edit";
            modalRef.componentInstance.TagData = { ...res };
          }
        },
        (err) => {
        }
      );
  
      modalRef.componentInstance.emtOutputTagUpdate.subscribe((res) => {
        this.tagList = this.tagList.map((t) => {
          if (t.tagId !== res.tagId) {
            return {
              ...t,
            };
          }
          return { ...res };
        });
  
        this.tagList = this.tagList.map((t) => {
          if (t.tagId !== res.tagId) {
            return {
              ...t,
            };
          }
          return { ...res };
        });
      });
  
      modalRef.componentInstance.emtOutputTagRemove.subscribe((res) => {
        this.tagList = this.tagList.filter((o) => {
          return o.tagId !== res;
        });
  
        this.tagList = this.tagList.filter((o) => {
          return o.tagId !== res;
        });
      });
    }
    onDelete(item){
      
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
            `
          },
        }).then((result) => {
          if (result.value) {
            if (result.value) {
       
              const formData = {
                EventGuId: this.localstorageService.getLoginUserEventGuId(),
                MacAddress: this.localstorageService.getLoginUserGuid(),
                TagId: item.tagId,
                DeletedBy: this.localstorageService.getLoginUserId(),
              };
              this.tagService.deleteTag(formData).subscribe(
                (res: any) => {
                  Swal.fire({
                    title: this.commonMethodService.getTranslate('WARNING_SWAL.SUCCESS_TITLE'),
                    text: res,
                    icon: 'success',
                    confirmButtonText: this.commonMethodService.getTranslate('WARNING_SWAL.BUTTON.CONFIRM.OK'),
                    customClass: {
                      confirmButton: 'btn_ok'
                  },
                  }).then(()=>{
                  
                  this.tagList = this.tagList.filter((o) => {
                    return o.tagId !== item.tagId;
                  });
            
                  
                  });
                },
                (err) => {
                  console.log(err,'error');

                }
              );
    
    
            }
          } else if (result.dismiss === Swal.DismissReason.cancel) {
            Swal.fire({
              title: this.commonMethodService.getTranslate('CANCELLED'),
              text: 'Your tag is safe :)',
              icon: 'error',
              confirmButtonText: this.commonMethodService.getTranslate('WARNING_SWAL.BUTTON.CONFIRM.OK'),
              customClass: {
                confirmButton: 'btn_ok'
            },
            })
          }
        });
      
    
    }
    addAdvanceField(fieldType){
 
      this.modalOptions = {
        centered: true,
        size: "lg",
        backdrop: "static",
        keyboard: true,
        windowClass: "drag_popup advance_dropdown",
      };
      const modalRef = this.commonMethodService.openPopup(
        AdvanceDropdownPopupComponent,
        this.modalOptions
      );
      modalRef.componentInstance.FieldType = fieldType;
      modalRef.componentInstance.Type = "add";
      modalRef.componentInstance.emtSaveAdvanceFields.subscribe((res: any) => {
        if (res) {
          if (this.advancedFieldValues == null) {
            this.advancedFieldValues = [];
          }
          this.advancedFieldValues.push({ advancedField: res, value: null });
          this.advancedFieldValues.forEach((element) => {
            if (
              element.advancedField.type == "dropdown" &&
              element.advancedField.options != null &&
              element.advancedField.options.indexOf(",") > -1
            ) {
              element.advancedField.options =
                element.advancedField.options.split(",");
            } else {
              element.advancedField.options = [element.advancedField.options];
            }
          });
        }
      });
    }
    AddNewTag() {
      this.modalOptions = {
        centered: true,
        size: "lg",
        backdrop: "static",
        keyboard: true,
        windowClass: "advance_dropdown",
      };
      const modalRef = this.commonMethodService.openPopup(
        DonorAddtagPopupComponent,
        this.modalOptions
      );
  
      modalRef.componentInstance.Type = "add";
      modalRef.componentInstance.emtOutputTagUpdate.subscribe((res) => {
        this.tagList.push({ ...res });
      });
    }
}

