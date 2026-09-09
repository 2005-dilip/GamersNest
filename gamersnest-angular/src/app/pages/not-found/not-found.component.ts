import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject } from '@angular/core';
import { Router } from '@angular/router';
import { LucideCircleAlert, LucideHouse } from '@lucide/angular';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [LucideCircleAlert, LucideHouse],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundComponent {
  private readonly router = inject(Router);

  goHome(): void {
    this.router.navigate(['/']);
  }
}
