import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';

/**
 * Reusable eyebrow + heading + optional copy block, matching the original
 * SectionLabel helper. Uses global .section-heading / .eyebrow styles.
 */
@Component({
  selector: 'app-section-label',
  standalone: true,
  templateUrl: './section-label.component.html',
  styleUrl: './section-label.component.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionLabelComponent {
  @Input({ required: true }) eyebrow!: string;
  @Input({ required: true }) title!: string;
  @Input() copy?: string;
}
