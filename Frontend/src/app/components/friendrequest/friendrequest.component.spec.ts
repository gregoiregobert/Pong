import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FriendrequestComponent } from './friendrequest.component';

describe('FriendrequestComponent', () => {
  let component: FriendrequestComponent;
  let fixture: ComponentFixture<FriendrequestComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FriendrequestComponent]
    });
    fixture = TestBed.createComponent(FriendrequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
