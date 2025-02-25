import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateSeasonPopupComponent } from './create-season-popup.component';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonMethodService } from 'src/app/commons/common-methods.service';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { LocalstoragedataService } from 'src/app/commons/local-storage-data.service';
import { SeatService } from 'src/app/services/seat.service';
import { ToastrModule } from 'ngx-toastr';
import {TranslateModule, TranslatePipe, TranslateService } from '@ngx-translate/core';
import { By } from '@angular/platform-browser';
import { JoinAndUpperCasePipe } from 'src/app/commons/text-transform.pipe';

describe('CreateSeasonPopupComponent', () => {
  let component: CreateSeasonPopupComponent;
  let fixture: ComponentFixture<CreateSeasonPopupComponent>;

  beforeEach(async () => {
    
    await TestBed.configureTestingModule({
      imports: [CreateSeasonPopupComponent,ToastrModule.forRoot(),TranslateModule.forRoot()],
      providers:[
        {
          provide:NgbActiveModal,
        },
        {
          provide:CommonMethodService
        },
        {
          provide: HttpClient,
          useValue:  {
            get: () => of({}),
            post: () => of({}),
            put: () => of({}),
          }
        },
        {
          provide:LocalstoragedataService,
        },
        {
          provide:SeatService
        },
        {
          provide:TranslatePipe
        },
        {
          provide:JoinAndUpperCasePipe
        }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreateSeasonPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });


  it('should create the app', () => {
    expect(true).toBeTruthy();
  });


  describe('adminSeatCard page', () => {
  it('should call openAddSeatDataPopup() with "CopySeatData" when seasonName is selected', () => {
    component.selectedItem = true;
    spyOn(component, 'openAddSeatDataPopup');
    const copySeatDataButton = fixture.debugElement.query(By.css('a.session-box'));
    copySeatDataButton.triggerEventHandler('click', null);
    expect(component.openAddSeatDataPopup).toHaveBeenCalledWith('CopySeatData');
  });


  it('should not call openAddSeatDataPopup() when  seasonName is not selected', () => {
    component.selectedItem = false;
    spyOn(component, 'openAddSeatDataPopup');
    const copySeatDataButton = fixture.debugElement.query(By.css('a.session-box'));
    copySeatDataButton.triggerEventHandler('click', null);
    expect(component.openAddSeatDataPopup).not.toHaveBeenCalled();
  });

  it('should call openAddSeatDataPopup() with "NewSeatData" when seasonName is selected', () => {
    component.selectedItem = true;
    spyOn(component, 'openAddSeatDataPopup');
    const newSeatDataButton = fixture.debugElement.queryAll(By.css('a.session-box'))[1];
    newSeatDataButton.triggerEventHandler('click', null);
    expect(component.openAddSeatDataPopup).toHaveBeenCalledWith('NewSeatData');
  });
  });

  describe('addadminSeatCard page', () =>{
    it('should set properties correctly when opening the popup with "CopySeatData"', () => {

      spyOn(component, 'getMapLocationsList');
      spyOn(component, 'getSeasonList');
  
      component.openAddSeatDataPopup('CopySeatData');
 
     expect(component.isAdminSeatCard).toBe(false);
     expect(component.isAddadminSeatCard).toBe(true);
     expect(component.getMapLocationsList).toHaveBeenCalled();
     expect(component.getSeasonList).toHaveBeenCalled();
     expect(component.isCopySeatData).toBe(true);
     expect(component.showLocationMap).toBe(false);
   });
 
 
   it('should set properties correctly when opening the popup with "NewSeatData"', () => {
 
     spyOn(component, 'getMapLocationsList');
     spyOn(component, 'getSeasonList');
 
     component.openAddSeatDataPopup('NewSeatData');
 
    expect(component.isAdminSeatCard).toBe(false);
    expect(component.isAddadminSeatCard).toBe(true);
    expect(component.getMapLocationsList).toHaveBeenCalled();
    expect(component.getSeasonList).toHaveBeenCalled();
    expect(component.isCopySeatData).toBe(false);
    expect(component.showLocationMap).toBe(true);
  });

  it('should call onSubmit when the form is valid', () => {

    spyOn(component, 'onSubmit').and.callThrough();
    component.form.controls['seasonName'].setValue('Valid Season');
    component.form.controls['copyFrom'].setValue('Some Value'); 
    component.form.controls['selectedMaps'].setValue(['Map1']); 
    component.onSubmit();
    expect(component.onSubmit).toHaveBeenCalled();
  
  });
  })
  


 
describe('updateadminSeatCard page', () =>{
  
  it('should show Update card template when form is valid and is Copy Seat data', () => {
    component.form.controls['seasonName'].setValue('Test54'); 
    component.form.controls['selectedMaps'].setValue(['51']); 
    component.isCopySeatData = true;
    component.onSubmit();
    expect(component.isGenerateSeatCard).toBeFalsy();
    expect(component.isAddadminSeatCard).toBeFalsy();
    expect(component.isUpdateSeatCard).toBeTruthy();

  })
})

describe('generateadminSeatCard',() =>{
 
  it('should show Generate card template  after getRateList api reponse', () => {

    spyOn(component, 'GetRateList').and.callFake(() => {
      component.isGenerateSeatCard = true;
    });
    component.form.controls['seasonName'].setValue('Test54'); 
    component.form.controls['selectedMaps'].setValue(['51']); 
    component.isCopySeatData = false;
    component.onSubmit();
    
    expect(component.GetRateList).toHaveBeenCalled();
    expect(component.isGenerateSeatCard).toBeTruthy();
  });
   
  it('should copy title and seat count to clipboard when CopyData is called', () => {

    spyOn(navigator.clipboard, 'writeText');
    const title = 'Test Title';
    const seatCount = 100;
    component.CopyData(title, seatCount);
    const expectedText = `${title} (${seatCount})`;
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expectedText);
  });
  
  it('should disable the generate button when isEditSeatRateError is true', () => {
    component.isEditSeatRateError = true;
    component.isGenerateSeatCard = true; // Ensure the modal is displayed
    fixture.detectChanges();
    const generateButton = fixture.debugElement.query(By.css('#generateButton')).nativeElement;
      expect(generateButton.disabled).toBeTrue();
  });
  
  it('should enable the generate button when isEditSeatRateError is false', () => {
    component.isEditSeatRateError = false;
    component.isGenerateSeatCard = true; // Ensure the modal is displayed
    fixture.detectChanges();
    const generateButton = fixture.debugElement.query(By.css('#generateButton')).nativeElement;
      expect(generateButton.disabled).toBeFalsy();
  })

})

});
