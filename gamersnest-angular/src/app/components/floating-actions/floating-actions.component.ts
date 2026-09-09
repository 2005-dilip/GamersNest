import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject } from '@angular/core';
import { LucideMessageCircle, LucideCalendarDays, LucidePhone } from '@lucide/angular';
import { ContentService } from '../../services/content.service';
import { BookingInteractionService } from '../../services/booking-interaction.service';

@Component({
  selector: 'app-floating-actions',
  standalone: true,
  imports: [LucideMessageCircle, LucideCalendarDays, LucidePhone],
  templateUrl: './floating-actions.component.html',
  styleUrl: './floating-actions.component.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FloatingActionsComponent {
  protected readonly content = inject(ContentService);
  private readonly interaction = inject(BookingInteractionService);

  chooseExperience(experience: string): void {
    this.interaction.chooseExperience(experience);
  }
}
