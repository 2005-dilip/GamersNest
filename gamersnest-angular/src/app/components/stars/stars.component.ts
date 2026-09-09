import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { LucideStar } from '@lucide/angular';

/** Reusable five-star rating, matching the original Stars helper. */
@Component({
  selector: 'app-stars',
  standalone: true,
  imports: [LucideStar],
  templateUrl: './stars.component.html',
  styleUrl: './stars.component.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StarsComponent {
  @Input() label = '5 out of 5 stars';
  protected readonly indexes = [0, 1, 2, 3, 4];
}
