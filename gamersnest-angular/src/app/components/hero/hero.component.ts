import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject } from '@angular/core';
import { LucideArrowUpRight, LucidePlay, LucideMapPin, LucideClock3 } from '@lucide/angular';
import { ContentService } from '../../services/content.service';
import { BookingInteractionService } from '../../services/booking-interaction.service';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [LucideArrowUpRight, LucidePlay, LucideMapPin, LucideClock3],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroComponent {
  protected readonly content = inject(ContentService);
  private readonly interaction = inject(BookingInteractionService);

  chooseExperience(experience: string): void {
    this.interaction.chooseExperience(experience);
  }

  scrollToId(id: string): void {
    this.interaction.scrollToId(id);
  }
}
