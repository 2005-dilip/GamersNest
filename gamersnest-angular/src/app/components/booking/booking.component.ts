import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject, signal } from '@angular/core';
import { LucideArrowUpRight, LucideCheck, LucideMessageCircle } from '@lucide/angular';
import { ContentService } from '../../services/content.service';
import { BookingInteractionService } from '../../services/booking-interaction.service';
import { SectionLabelComponent } from '../section-label/section-label.component';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [LucideArrowUpRight, LucideCheck, LucideMessageCircle, SectionLabelComponent],
  templateUrl: './booking.component.html',
  styleUrl: './booking.component.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingComponent {
  protected readonly content = inject(ContentService);
  protected readonly interaction = inject(BookingInteractionService);

  protected readonly submitted = signal(false);
  protected readonly today = new Date().toISOString().split('T')[0];

  onExperienceChange(value: string): void {
    this.interaction.selectedExperience.set(this.content.normalizeBookingExperience(value));
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    this.submitted.set(true);
  }

  reset(): void {
    this.submitted.set(false);
  }
}
