import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TwofatogglebarComponent } from './twofatogglebar.component';

describe('TwofatogglebarComponent', () => {
  let component: TwofatogglebarComponent;
  let fixture: ComponentFixture<TwofatogglebarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TwofatogglebarComponent]
    });
    fixture = TestBed.createComponent(TwofatogglebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
