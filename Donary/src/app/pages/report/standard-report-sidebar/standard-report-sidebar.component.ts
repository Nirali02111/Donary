import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-standard-report-sidebar',
  standalone: true,
  imports: [FormsModule,NgSelectModule,CommonModule],
  templateUrl: './standard-report-sidebar.component.html',
  styleUrl: './standard-report-sidebar.component.scss'
})
export class StandardReportSidebarComponent {
  @Input() sidebarOptions:any = [];
  @Input() phoneLabelArray:Array<any> = [];
  @Input() addressLabelArray:Array<any> = [];
  @Input() emailLabelArray:Array<any> = [];
  @Output() emitSelectedData: EventEmitter<{type: string, value: any}> = new EventEmitter();
  @Output() emitSwitchData:EventEmitter<boolean> = new EventEmitter();
  @Input() selectedPhoneData:any = []
  @Input() selectedAddressData:Array<any> = [];
  @Input() selectedEmailAddressData:Array<any> = [];
  @Input() isSwitchOn: boolean = false
  @Output() emitData: EventEmitter<any> = new EventEmitter();
  addresses = [
    { id: 1, name: 'Home' },
    { id: 2, name: 'Work' },
    { id: 3, name: 'Cell' },
    {id:4, name:'Mother Phone'}
  ];

  selectedCountries = [];
  selectedPhoneLabel = [];
  selectedAddressLabel = [];
  selectedEmailLabel = [];
  
  ngOnInit(){
    this.selectedCountries = this.addresses.filter(option => option.id === 1 || option.id === 2);
   
    if(this.selectedPhoneData){
      this.selectedPhoneLabel = this.selectedPhoneData
    }
    if(this.selectedEmailAddressData){
      this.selectedEmailLabel = this.selectedEmailAddressData
    }
    if(this.selectedAddressData){
      this.selectedAddressLabel = this.selectedAddressData
    }
  }
  onCheckboxChange(checkbox: any) {
    let obj = {
      label: checkbox.label,
      checked: checkbox.label === checkbox.label? checkbox.checked : checkbox.checked
    }
   this.emitData.emit(obj) 
  }

 
  onSelectionChange(type:string,value) {
    this.emitSelectedData.emit({ type: type, value: value });
  }

  onCheckboxClick(event: MouseEvent): void {
    event.preventDefault();
  }

  onSwitchChange(event: Event): void {
    this.isSwitchOn = (event.target as HTMLInputElement).checked;
    this.emitSwitchData.emit(this.isSwitchOn)
  }

}
