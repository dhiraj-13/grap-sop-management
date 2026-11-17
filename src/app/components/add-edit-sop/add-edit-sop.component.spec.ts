import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditSopComponent } from './add-edit-sop.component';

describe('AddEditSopComponent', () => {
  let component: AddEditSopComponent;
  let fixture: ComponentFixture<AddEditSopComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddEditSopComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddEditSopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
