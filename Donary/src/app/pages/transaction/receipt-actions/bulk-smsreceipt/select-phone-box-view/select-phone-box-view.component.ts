import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { CommonMethodService } from 'src/app/commons/common-methods.service';
interface grpClm {
  list: Array<number>;
  sentList: Array<string>,
  selectedChild: number,
  originalLabelList:Array<string>

}
declare var $: any;
interface AccandPhone {
  accountId: number;
  receiptNum: string;
  selectedPhone?: string;

}
@Component({
  selector: "app-select-phone-box-view",
  templateUrl: "./select-phone-box-view.component.html",
  styleUrls: ["./select-phone-box-view.component.scss"],
  standalone:false,
})
export class SelectPhoneBoxViewComponent implements OnInit {

  @Input("grpColumn") grpColumn: grpClm;

  @Input("accountId") accountId: number;

  @Input("receiptNum") receiptNum: string;

  @Input("label") label: string;

  @Output() showMoreChange: EventEmitter<any> = new EventEmitter();
  @Output() emtOutputList:EventEmitter<any>=new EventEmitter();

  filterBy: any;
  selectedAccountList: Array<AccandPhone> = [];
  constructor(public commonMethodService: CommonMethodService) {}

  ngOnInit() {
    this.filterBy = this.grpColumn.list[0];

    $(document).on('click', '.show_more_wrapper', function (e) {
      e.stopPropagation();
    });
  }

  showCounts() {
    return this.grpColumn.list.length - 1;
  }

  selectedItem(event, i) {
    event.preventDefault();
  }
  checkPhoneIsSelectOrNot(phone): Boolean {
    if(this.receiptNum && phone){
    var k=this.commonMethodService.getChaldPArray();
    const found = k.find(e => e.receiptNum === this.receiptNum && e.selectedPhone === phone);
    return found ? true : false;
    }
  }

  selectedItemCheck(event, i,selectedPhone) {
    event.stopPropagation();
    event.preventDefault();

    this.grpColumn.selectedChild = i;
    //console.log(event)    
    if (event.target.checked) {
      this.selectedAccountList.push({ accountId: this.accountId, selectedPhone: selectedPhone, receiptNum:this.receiptNum })
      this.commonMethodService.childPArray.push({ accountId: this.accountId, selectedPhone: selectedPhone, receiptNum:this.receiptNum });
      var k=this.commonMethodService.getChaldPArray();
    } else {
     // this.selectedAccountList = this.selectedAccountList.filter(e => !(e.selectedPhone === phone && e.receiptNum === receiptNum));
     this.commonMethodService.childPArray=this.commonMethodService.childPArray.filter(e => !(e.selectedPhone === selectedPhone && e.receiptNum === this.receiptNum));
    }

  }

  onClick(){
  }
}
