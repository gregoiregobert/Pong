import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FriendMenuComponent } from './friend-menu.component';

describe('FriendMenuComponent', () => {
  let component: FriendMenuComponent;
  let fixture: ComponentFixture<FriendMenuComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FriendMenuComponent]
    });
    fixture = TestBed.createComponent(FriendMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
