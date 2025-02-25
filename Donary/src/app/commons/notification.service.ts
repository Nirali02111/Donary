import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { TranslatePipe } from '@ngx-translate/core';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {


    constructor(private toastr: ToastrService, private translatePipe: TranslatePipe,) { }
    msgCount:number=0;
    showSuccess(message, title) {
        this.toastr.success(message, title)
    }

    showError(message, title) {
        if(this.msgCount==0){
        this.toastr.error(message, title,{
            disableTimeOut:true,
            tapToDismiss:true,
        });
        }
        this.msgCount=1;

    }

    showInfo(message, title) {
        this.toastr.info(message, title)
        this.toastr.toastrConfig.preventDuplicates = true;
    }

    showWarning(message, title) {
        this.toastr.warning(message, title)
        this.toastr.toastrConfig.preventDuplicates = true;
    }
    swalAlert(title='Success!',text="",icon:any='success'){
        return Swal.fire({
           title: title ,
           text:text,
           icon: icon,
           confirmButtonText:  this.translatePipe.transform('WARNING_SWAL.BUTTON.CONFIRM.OK'),
           customClass: {
             confirmButton: 'btn_ok'
         },
         })
       }
}