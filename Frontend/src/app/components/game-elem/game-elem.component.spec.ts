import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameElemComponent } from './game-elem.component';

describe('GameElemComponent', () => {
  let component: GameElemComponent;
  let fixture: ComponentFixture<GameElemComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [GameElemComponent]
    });
    fixture = TestBed.createComponent(GameElemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
