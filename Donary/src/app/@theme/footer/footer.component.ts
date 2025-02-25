import { Component, OnInit } from '@angular/core';
import packageInfo from '../../../../package.json';
import { TranslateService, TranslateModule } from "@ngx-translate/core";

import { CommonMethodService } from 'src/app/commons/common-methods.service';
import { NavigationEnd, Router } from '@angular/router';
import { NgIf, NgTemplateOutlet } from '@angular/common';



@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.scss'],
    standalone: true,
    imports: [NgIf, NgTemplateOutlet, TranslateModule]
})
export class FooterComponent implements OnInit {
  public currentYear: number;
  public version: string = packageInfo.version;

  showFullFill = false;

  constructor(
    private router: Router,
    public translate: TranslateService,
    private modalService: CommonMethodService
  ) {
    translate.setDefaultLang("en");
  }

  ngOnInit() {

    this.router.events.subscribe((event) => {

      if (event instanceof NavigationEnd) {
        this.showFullFill = event.url.indexOf('productandplans') !== -1
      }

    });


    this.currentYear = (new Date()).getFullYear();
  }


  openFulFillment(content) {
    this.modalService.openPopup(content, {
      centered: true,
      size: "xl",
      backdrop: "static",
      keyboard: true,
      windowClass: "transaction_modal fulfilment_modal",
    })
  }
}
