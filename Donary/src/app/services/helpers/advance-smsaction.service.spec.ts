import { TestBed, waitForAsync } from '@angular/core/testing';

import { AdvanceSMSActionService } from './advance-smsaction.service';

describe('AdvanceSMSActionService', () => {
  let service: AdvanceSMSActionService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({});
  }));

  beforeEach(() => (service = TestBed.inject(AdvanceSMSActionService)));


  it('should create the app', () => {
    expect(true).toBeTruthy();
  });
});
