import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AreYouReadyComponent } from './are-you-ready.component';

describe('AreYouReadyComponent', () => {
  let component: AreYouReadyComponent;
  let fixture: ComponentFixture<AreYouReadyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AreYouReadyComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AreYouReadyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
