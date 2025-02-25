import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { CommonMethodService } from "src/app/commons/common-methods.service";
import { LocalstoragedataService } from "src/app/commons/local-storage-data.service";
import { CommonAPIMethodService } from "src/app/services/common-api-method.service";
import { DonorService } from "src/app/services/donor.service";
import { MessengerService } from "src/app/services/messenger.service";
import Swal from "sweetalert2";
declare var $: any;
@Component({
  selector: "app-send-emailreceipt-popup",
  templateUrl: "./send-emailreceipt-popup.component.html",
  styleUrls: ["./send-emailreceipt-popup.component.scss"],
  standalone: false,
})
export class SendEmailreceiptPopupComponent implements OnInit {
  @Output() emtEditPledge: EventEmitter<any> = new EventEmitter();
  emailList = [];
  paymentType: string;
  id: number;
  email: number;
  phoneNumber: string;
  emailNo: number;
  inputEmail: string;
  accountId: number;
  macAddress: string;
  type: string = null;
  isDisabled: boolean = true;
  isSaveDisabled: boolean = false;
  isDefaultDonor: boolean = false;
  isDonorSelected: boolean = false;
  isSending: boolean = false;
  statementSpecificFilters: any = [];
  fromDate = null;
  toDate = null;
  isEmailValid = true;
  isAdd: boolean = true;
  isOnlyPledgePayment = false;
  statementType: any;
  globalId: number;
  accountNum: string;
  hidePaymentsList: boolean = false;
  hide0BalancePledges: boolean = false;
  isPaymentByClicked: boolean = false;
  emailLabelArray: Array<any> = [];
  selectedLabelArray: Array<any> = [];
  isLabelSelected: boolean = true;
  @Input() set ExportInfo(data: any) {
    if (data) {
      if (data.emailList && data.emailList.length > 0) {
        if (Array.isArray(data.emailList)) {
          this.emailList = data.emailList;
        } else {
          this.emailList.push(data.emailList);
        }
        this.email = this.emailList[0].value;
        this.emailNo = 0;
      }
      if (this.emailList.length > 0) {
        this.isDisabled = false;
      }
      //this.emailList = data.emailList;
      this.id = data.id;
      this.type = data.type;
      this.statementSpecificFilters = data.statementSpecificFilters;
      this.fromDate = data.fromDate;
      this.toDate = data.toDate;
      this.accountId = data.accountId;
      this.isOnlyPledgePayment = data.isOnlyPledgePayment;
      this.statementType = data.statementType;
      this.hidePaymentsList = data.hidePaymentsList;
      this.hide0BalancePledges = data.hide0BalancePledges;
    }
  }
  @Input() set Info(details: any) {
    if (details) {
      this.phoneNumber = details.phoneNumber;
      this.isPaymentByClicked = details.isPaymentByClicked
        ? details.isPaymentByClicked
        : false;
      if (details.emailList && details.emailList.length > 0) {
        if (Array.isArray(details.emailList)) {
          this.emailList = details.emailList;
        } else {
          this.emailList.push(details.emailList);
        }
        this.email = this.emailList[0].value;
        this.emailNo = 0;
      }
      this.paymentType = details.type;
      this.id = details.id;
      this.isDonorSelected = details.isDonorSelected;
      this.accountId = details.accountId;
      this.accountNum = details.accountNum;
      this.globalId = details.globalId;
      if (this.emailList.length > 0) {
        this.isDisabled = false;
      }
    }
    if (
      this.paymentType == "Pledge" &&
      (this.phoneNumber == null || this.phoneNumber == "")
    ) {
      this.isSaveDisabled = true;
    }
    if (this.globalId === 688008) {
      this.isDefaultDonor = true;
      this.isSaveDisabled = false;
    }
  }

  constructor(
    public activeModal: NgbActiveModal,
    private localstoragedataService: LocalstoragedataService,
    private messengerService: MessengerService,
    private donorService: DonorService,
    public commonMethodService: CommonMethodService,
    private commonAPIMethodService: CommonAPIMethodService
  ) {}

  ngOnInit() {
    $(document).ready(function () {
      let modalContent: any = $(".modal");
      modalContent.draggable({
        handle: ".modal-header-custom",
      });
    });
    this.getAllEmailLabels();
  }

  closePopup() {
    this.activeModal.dismiss();
  }

  OnCheck(event, email, i) {
    if (event.target.checked) {
      this.email = email;
      this.emailNo = i;
      this.isDisabled = false;
    } else {
      this.isDisabled = true;
    }
  }

  AddEmail() {
    if (this.selectedLabelArray.length == 0) {
      this.isLabelSelected = false;
      return;
    }
    var objDonorEmail = {
      eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      accountEmailID: null,
      accountID: this.accountId,
      emailLabel:
        this.selectedLabelArray &&
        this.selectedLabelArray.map((x) => x.itemName).toString(),
      emailAddress: this.inputEmail,
      loginUserId: this.localstoragedataService.getLoginUserId(),
    };
    this.donorService.SaveDonorEmail(objDonorEmail).subscribe((res: any) => {
      if (res) {
        this.emailList.unshift({
          value: this.inputEmail,
          label:
            this.selectedLabelArray &&
            this.selectedLabelArray.map((x) => x.itemName).toString(),
        });
        this.email = this.emailList[0].value;
        this.emailLabelArray = this.emailLabelArray.filter(
          (x) =>
            x.itemName.toLowerCase() !=
            this.selectedLabelArray
              .map((x) => x.itemName)
              .toString()
              .toLowerCase()
        );
        this.emailNo = 0;
        this.inputEmail = null;
        this.selectedLabelArray = [];
        this.isDisabled = false;
        this.isAdd = true;
        this.commonMethodService.sendPaymentTrans(true);
        this.commonMethodService.sendPledgeTrans(true);
        this.emtEditPledge.emit(res);
      }
    });
  }
  SendReceipt() {
    this.isDisabled = true;
    this.isSending = true;
    var objEmailReceipt = {};
    if (this.type == "Statement") {
      objEmailReceipt = {
        type: "Statement",
        id: this.id,
        fromDate: this.fromDate,
        toDate: this.toDate,
        emailAddress: this.email.toString().trim(),
        statementSpecificFilters: this.statementSpecificFilters,
        eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
        isOnlyPledgePayment: this.isOnlyPledgePayment,
        statementType:
          this.statementType === undefined || this.statementType === null
            ? ""
            : this.statementType[0].id,
        hidePaymentsList: this.hidePaymentsList,
        hide0BalancePledges: this.hide0BalancePledges,
      };
    } else {
      objEmailReceipt = {
        type: this.paymentType,
        id: this.id,
        emailAddress:
          this.email == undefined
            ? this.inputEmail.toString().trim()
            : this.email.toString().trim(),
        eventGuId: this.localstoragedataService.getLoginUserEventGuId(),
      };
    }
    this.messengerService.SendEmailReceipt(objEmailReceipt).subscribe(
      (res: any) => {
        if (res) {
          if (res) {
            Swal.fire({
              title: this.commonMethodService.getTranslate(
                "WARNING_SWAL.SUCCESS_TITLE"
              ),
              text: "Email Receipt Sent Successfully",
              icon: "success",
              confirmButtonText: this.commonMethodService.getTranslate(
                "WARNING_SWAL.BUTTON.CONFIRM.OK"
              ),
              customClass: {
                confirmButton: "btn_ok",
              },
            });
            this.emtEditPledge.emit(res);
            this.closePopup();
          } else {
            Swal.fire({
              title: this.commonMethodService.getTranslate(
                "WARNING_SWAL.TRY_AGAIN"
              ),
              text: res.errorResponse,
              icon: "error",
              confirmButtonText: this.commonMethodService.getTranslate(
                "WARNING_SWAL.BUTTON.CONFIRM.OK"
              ),
              customClass: {
                confirmButton: "btn_ok",
              },
            });
          }
        }
        this.isDisabled = false;
        this.isSending = true;
      },
      (error) => {
        this.isDisabled = false;
        this.isSending = true;
        console.log(error);
        Swal.fire({
          title: this.commonMethodService.getTranslate(
            "WARNING_SWAL.SOMETHING_WENT_WRONG"
          ),
          text: error.error,
          icon: "error",
          confirmButtonText: this.commonMethodService
            .getTranslate("WARNING_SWAL.BUTTON.CONFIRM.OK")
            .commonMethodService.getTranslate("WARNING_SWAL.BUTTON.CONFIRM.OK"),
          customClass: {
            confirmButton: "btn_ok",
          },
        });
      }
    );
  }

  onLabelSelect(event: any) {
    if (event.id != null) {
      this.isLabelSelected = true;
      return;
    }
    this.isLabelSelected = false;
  }

  onLabelDeSelect(event: any) {
    if (event.id == null) {
      this.selectedLabelArray = [];
      return;
    }
  }

  EnableAddButton(event) {
    if (event.target.value != "") {
      this.isAdd = false;
      this.isDisabled = false;
    } else {
      this.isAdd = true;
      this.isDisabled = true;
      this.isEmailValid = true;
      if (this.emailList.length > 0) {
        this.isDisabled = false;
      }
    }
  }

  ValidEmail(event) {
    var val = event.target.value;
    if (val != "") {
      var regex =
        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

      if (val != "" && !regex.test(val)) {
        this.isEmailValid = false;
        this.isDisabled = true;
        this.isAdd = true;
      } else {
        this.isEmailValid = true;
        this.isDisabled = false;
        this.isAdd = false;
      }
    }
  }

  getAllEmailLabels() {
    const eventGuId = this.localstoragedataService.getLoginUserEventGuId();
    this.commonAPIMethodService
      .getLabelText(eventGuId, "Email")
      .subscribe((res: any) => {
        if (res.length > 0) {
          this.emailList.forEach((element) => {
            res = res.filter(
              (x) => x.itemName.toLowerCase() != element.label.toLowerCase()
            );
          });
          this.emailLabelArray = res;
        }
      });
  }
}
