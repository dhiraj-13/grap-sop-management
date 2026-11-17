import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewSopComponent } from './review-sop.component';

describe('ReviewSopComponent', () => {
  let component: ReviewSopComponent;
  let fixture: ComponentFixture<ReviewSopComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReviewSopComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReviewSopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
