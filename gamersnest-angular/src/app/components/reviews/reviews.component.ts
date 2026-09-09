import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject } from '@angular/core';
import { LucideQuote, LucideCheck } from '@lucide/angular';
import { ContentService } from '../../services/content.service';
import { SectionLabelComponent } from '../section-label/section-label.component';
import { StarsComponent } from '../stars/stars.component';

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [LucideQuote, LucideCheck, SectionLabelComponent, StarsComponent],
  templateUrl: './reviews.component.html',
  styleUrl: './reviews.component.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReviewsComponent {
  protected readonly content = inject(ContentService);

  protected get backgroundImage(): string {
    return `linear-gradient(110deg, rgba(6, 10, 14, .98) 2%, rgba(6, 10, 14, .93) 50%, rgba(6, 10, 14, .79) 100%), url(${this.content.reviewAtmosphere})`;
  }
}
