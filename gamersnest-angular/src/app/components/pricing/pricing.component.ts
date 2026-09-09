import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject } from '@angular/core';
import { LucideArrowUpRight } from '@lucide/angular';
import { ContentService } from '../../services/content.service';
import { BookingInteractionService } from '../../services/booking-interaction.service';
import { SectionLabelComponent } from '../section-label/section-label.component';

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [LucideArrowUpRight, SectionLabelComponent],
  templateUrl: './pricing.component.html',
  styleUrl: './pricing.component.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PricingComponent {
  protected readonly content = inject(ContentService);
  private readonly interaction = inject(BookingInteractionService);

  bookSetup(title: string): void {
    this.interaction.chooseExperience(title === 'CAR SIMULATOR' ? 'RACING SIMULATOR' : title);
  }
}
