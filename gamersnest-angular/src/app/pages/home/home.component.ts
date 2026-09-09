import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { HeroComponent } from '../../components/hero/hero.component';
import { IntroComponent } from '../../components/intro/intro.component';
import { ExperiencesComponent } from '../../components/experiences/experiences.component';
import { GamesComponent } from '../../components/games/games.component';
import { PricingComponent } from '../../components/pricing/pricing.component';
import { ReasonsComponent } from '../../components/reasons/reasons.component';
import { GalleryComponent } from '../../components/gallery/gallery.component';
import { ReviewsComponent } from '../../components/reviews/reviews.component';
import { BookingComponent } from '../../components/booking/booking.component';
import { LocationComponent } from '../../components/location/location.component';
import { InstagramSectionComponent } from '../../components/instagram-section/instagram-section.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { FloatingActionsComponent } from '../../components/floating-actions/floating-actions.component';

/** Composes the full single-page Gamers Nest experience. */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    NavbarComponent,
    HeroComponent,
    IntroComponent,
    ExperiencesComponent,
    GamesComponent,
    PricingComponent,
    ReasonsComponent,
    GalleryComponent,
    ReviewsComponent,
    BookingComponent,
    LocationComponent,
    InstagramSectionComponent,
    FooterComponent,
    FloatingActionsComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {}
