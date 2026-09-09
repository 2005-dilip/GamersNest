import { Injectable } from '@angular/core';

export type ReasonIcon = 'users' | 'gamepad' | 'play' | 'trophy' | 'zap';

export type BookingExperience = 'PS2' | 'PS4' | 'PS5' | 'RACING SIMULATOR' | 'VR GAMING';

export interface Experience {
  title: string;
  formValue: string;
  description: string;
  price: string;
  photo: string;
  tint: 'cyan' | 'lime';
}

export interface Game {
  title: string;
  genre: string;
  category: string;
  photo: string;
}

export interface PricingItem {
  title: string;
  accent: string;
  price?: string;
  detail?: string;
  tiers?: [string, string][];
}

export interface Reason {
  icon: ReasonIcon;
  title: string;
  description: string;
}

export interface Review {
  name: string;
  time: string;
  initials: string;
  text: string;
}

export interface GalleryItem {
  src: string;
  alt: string;
  size: string;
}

/**
 * Holds all static site content and business constants exactly as authored in
 * the original site, so pages/components stay declarative and reusable.
 */
@Injectable({ providedIn: 'root' })
export class ContentService {
  readonly photos = {
    hero: 'https://res.cloudinary.com/awaaiqbl/image/upload/v1788163422/home.webp',
    location: 'https://res.cloudinary.com/awaaiqbl/image/upload/v1788163423/adress.webp',
    one: 'https://res.cloudinary.com/awaaiqbl/image/upload/v1788163422/1.webp',
    two: 'https://res.cloudinary.com/awaaiqbl/image/upload/v1788163422/2.webp',
    three: 'https://res.cloudinary.com/awaaiqbl/image/upload/v1788163422/3.webp',
    four: 'https://res.cloudinary.com/awaaiqbl/image/upload/v1788163422/4.webp',
  };

  // Original Manus-proxied assets. These are served through a backend proxy in
  // the source project and do not resolve in a standalone app, so they are kept
  // as configurable paths to preserve layout without breaking the build.
  readonly logoMark = '/manus-storage/gamers-nest-mark_a8e32472.png';
  readonly reviewAtmosphere = '/manus-storage/gamers-nest-review-atmosphere_69df7b1b.jpg';

  readonly whatsappLink =
    'https://wa.me/919159588666?text=Hi%20Gamers%20Nest!%20I%20would%20like%20to%20enquire%20about%20a%20gaming%20session.';
  readonly directionsLink =
    'https://www.google.com/maps/search/?api=1&query=Gamers%20Nest%2C%20Shop%20No.%202%2C%20First%20Floor%2C%20MIG%20No.%202165%2C%20TNHB%2C%204th%20Main%20Road%2C%20Ayappakkam%2C%20Chennai%20600077';
  readonly instagramLink = 'https://www.instagram.com/gamersnest.chennai/';
  readonly phone = '+91 91595 88666';
  readonly phoneHref = 'tel:+919159588866';
  readonly email = 'gamersnest.chennai@gmail.com';
  readonly hours = '11:00 AM – 11:00 PM';

  readonly experiences: Experience[] = [
    {
      title: 'PS2 GAMING',
      formValue: 'PS2',
      description: 'Relive classic gaming experiences with your friends.',
      price: '₹60 / hour',
      photo: this.photos.two,
      tint: 'cyan',
    },
    {
      title: 'PS4 GAMING',
      formValue: 'PS4',
      description: 'Jump into your favourite competitive and action titles.',
      price: 'From ₹70 / player / hour',
      photo: this.photos.one,
      tint: 'lime',
    },
    {
      title: 'PS5 GAMING',
      formValue: 'PS5',
      description: 'Experience modern gaming on a premium setup.',
      price: 'From ₹70 / player / hour',
      photo: this.photos.hero,
      tint: 'cyan',
    },
    {
      title: 'RACING SIMULATOR',
      formValue: 'RACING SIMULATOR',
      description: 'Get behind the wheel and experience high-speed racing.',
      price: '₹120 / hour',
      photo: this.photos.three,
      tint: 'lime',
    },
    {
      title: 'VR GAMING',
      formValue: 'VR GAMING',
      description: 'Step beyond the screen and into an immersive virtual world.',
      price: '₹120 / hour',
      photo: this.photos.four,
      tint: 'cyan',
    },
  ];

  readonly games: Game[] = [
    { title: 'EA SPORTS FC 25', genre: 'SPORTS', category: 'SPORTS', photo: this.photos.one },
    { title: 'WWE 2K25', genre: 'SPORTS', category: 'SPORTS', photo: this.photos.two },
    { title: 'Mortal Kombat 1', genre: 'FIGHTING', category: 'FIGHTING', photo: this.photos.three },
    { title: 'Grand Theft Auto V', genre: 'OPEN WORLD', category: 'OPEN WORLD', photo: this.photos.hero },
    { title: 'Red Dead Redemption 2', genre: 'OPEN WORLD', category: 'OPEN WORLD', photo: this.photos.four },
    { title: 'God of War', genre: 'ACTION', category: 'ACTION', photo: this.photos.one },
    { title: 'Metro Exodus', genre: 'ACTION', category: 'ACTION', photo: this.photos.three },
    { title: 'Uncharted', genre: 'ACTION', category: 'ACTION', photo: this.photos.two },
    { title: 'Forza Horizon', genre: 'RACING', category: 'RACING', photo: this.photos.four },
    { title: 'VR Gaming Experiences', genre: 'VR', category: 'VR', photo: this.photos.hero },
  ];

  readonly categories = ['ALL', 'SPORTS', 'FIGHTING', 'OPEN WORLD', 'ACTION', 'RACING', 'VR'];

  readonly pricing: PricingItem[] = [
    { title: 'PS2', accent: 'Classic', price: '₹60', detail: '/ hour' },
    {
      title: 'PS4 & PS5',
      accent: 'Squad play',
      tiers: [
        ['1 Player', '₹100 / hour'],
        ['2 Players', '₹80 / player / hour'],
        ['3 Players', '₹70 / player / hour'],
        ['4 Players', '₹70 / player / hour'],
      ],
    },
    { title: 'CAR SIMULATOR', accent: 'Take the wheel', price: '₹120', detail: '/ hour' },
    { title: 'VR GAMING', accent: 'Beyond the screen', price: '₹120', detail: '/ hour' },
  ];

  readonly reasons: Reason[] = [
    { icon: 'users', title: 'PLAY WITH YOUR SQUAD', description: 'Bring your friends and compete together.' },
    { icon: 'gamepad', title: 'MULTIPLE GAMING EXPERIENCES', description: 'PS2, PS4, PS5, racing and VR.' },
    { icon: 'play', title: 'BIG-SCREEN GAMING', description: 'Enjoy an immersive gaming environment.' },
    { icon: 'trophy', title: 'RACING EXPERIENCE', description: 'Get behind the wheel and experience high-speed racing.' },
    { icon: 'zap', title: 'VR ADVENTURE', description: 'Step beyond the screen.' },
  ];

  readonly reviews: Review[] = [
    {
      name: 'Alwin Samson',
      time: '5 months ago',
      initials: 'AS',
      text: 'Great gaming experience with smooth playstation setup. Perfect place to chill and play with friends 😍',
    },
    {
      name: 'Mathi M',
      time: '4 months ago',
      initials: 'MM',
      text: 'Cool place for all latest games. Explore the games with please environment.',
    },
    {
      name: 'Elangaroshni07',
      time: '5 months ago',
      initials: 'E7',
      text: 'We had a great experience, good ambience, best place to hangout with friends and family for better gaming experience.',
    },
    {
      name: 'Ramesh r',
      time: '3 months ago',
      initials: 'RR',
      text: 'Very fun to play and clean and snacks with no (extra charges)',
    },
  ];

  readonly galleryItems: GalleryItem[] = [
    { src: this.photos.one, alt: 'Gaming setup inside Gamers Nest', size: 'gallery-large' },
    { src: this.photos.two, alt: 'PlayStation gaming area inside Gamers Nest', size: 'gallery-tall' },
    { src: this.photos.three, alt: 'Gaming lounge interior at Gamers Nest', size: 'gallery-small' },
    { src: this.photos.four, alt: 'Gaming experience area inside Gamers Nest', size: 'gallery-wide' },
  ];

  readonly bookingExperiences: BookingExperience[] = ['PS2', 'PS4', 'PS5', 'RACING SIMULATOR', 'VR GAMING'];

  readonly navLinks: [string, string][] = [
    ['HOME', 'home'],
    ['EXPERIENCES', 'experiences'],
    ['GAMES', 'games'],
    ['PRICING', 'pricing'],
    ['GALLERY', 'gallery'],
    ['REVIEWS', 'reviews'],
    ['LOCATION', 'location'],
  ];

  normalizeBookingExperience(value: string): BookingExperience | '' {
    if (value.includes('PS2')) return 'PS2';
    if (value.includes('PS4')) return 'PS4';
    if (value.includes('PS5')) return 'PS5';
    if (value.includes('CAR')) return 'RACING SIMULATOR';
    if (value.includes('RACING')) return 'RACING SIMULATOR';
    if (value.includes('VR')) return 'VR GAMING';
    return '';
  }
}
