import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StandardReportSidebarComponent } from './standard-report-sidebar.component';

describe('StandardReportSidebarComponent', () => {
  let component: StandardReportSidebarComponent;
  let fixture: ComponentFixture<StandardReportSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StandardReportSidebarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StandardReportSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
