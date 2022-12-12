import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchingPlayerComponent } from './searching-player.component';

describe('SearchingPlayerComponent', () => {
  let component: SearchingPlayerComponent;
  let fixture: ComponentFixture<SearchingPlayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SearchingPlayerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchingPlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
