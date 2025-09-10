import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TwofaComponent } from './twofa.component';

describe('TwofaComponent', () => {
  let component: TwofaComponent;
  let fixture: ComponentFixture<TwofaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TwofaComponent]
    });
    fixture = TestBed.createComponent(TwofaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
