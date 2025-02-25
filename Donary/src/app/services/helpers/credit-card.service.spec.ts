import { TestBed, waitForAsync } from '@angular/core/testing';

import { CreditCardService } from './credit-card.service';

const stringOne = '%B4263982640269299^FISCH/JOEL^24062011906875870000000000000000?;4263982640269299=240620119067941700000?+?'

const stringTwo = '%B8628241406803648^ORG/MATBIA^28123214321987?;8628241406803648=2812321432187?'

describe('CreditCardService', () => {
  let service: CreditCardService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({});
  }));

  beforeEach(() => (service = TestBed.inject(CreditCardService)));

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should be swipe', () => {
    const service: CreditCardService = TestBed.get(CreditCardService);
    const values = service.parseMagneticStrip(stringOne)
    expect(values.isSwipe).toEqual(true);
    expect(values.cardNumber).toEqual('4263982640269299');
    expect(values.firstName).toEqual('JOEL');
    expect(values.lastName).toEqual('FISCH');
  });

  it('should be swipe string two', () => {
    const service: CreditCardService = TestBed.get(CreditCardService);
    const values = service.parseMagneticStrip(stringTwo)
    expect(values.isSwipe).toEqual(true);
    expect(values.cardNumber).toEqual('8628241406803648');
    expect(values.firstName).toEqual('MATBIA');
    expect(values.lastName).toEqual('ORG');
  });
});
