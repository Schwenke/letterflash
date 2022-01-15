import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VictoryDialogComponent } from './victory-dialog.component';

describe('VictoryDialogComponent', () => {
  let component: VictoryDialogComponent;
  let fixture: ComponentFixture<VictoryDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VictoryDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VictoryDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
