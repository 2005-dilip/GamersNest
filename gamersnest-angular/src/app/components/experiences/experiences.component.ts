import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject } from '@angular/core';
import { LucideArrowUpRight } from '@lucide/angular';
import { ContentService } from '../../services/content.service';
import { BookingInteractionService } from '../../services/booking-interaction.service';
import { SectionLabelComponent } from '../section-label/section-label.component';

@Component({
  selector: 'app-experiences',
  standalone: true,
  imports: [LucideArrowUpRight, SectionLabelComponent],
  templateUrl: './experiences.component.html',
  styleUrl: './experiences.component.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExperiencesComponent {
  protected readonly content = inject(ContentService);
  private readonly interaction = inject(BookingInteractionService);

  chooseExperience(experience: string): void {
    this.interaction.chooseExperience(experience);
  }
}
