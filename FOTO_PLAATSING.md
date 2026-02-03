# 📸 Foto Plaatsing Instructies

Dit document beschrijft waar je foto's moet plaatsen voor je DJ Bazuri website.

## 📁 Folder Structuur

Alle foto's moeten in de `public/images/` folder worden geplaatst. Deze folder is direct toegankelijk vanaf de website root.

```
public/
└── images/
    ├── profile.jpg           # Je profiel foto voor de /links pagina
    ├── hero-bg.jpg          # Hero sectie achtergrond (optioneel)
    ├── gallery/             # Foto's voor de gallery pagina
    │   ├── event1.jpg
    │   ├── event2.jpg
    │   └── event3.jpg
    └── logo.png             # Je DJ logo (optioneel)
```

## 🎯 Benodigde Foto's

### 1. Profiel Foto (`profile.jpg`)
- **Locatie:** `public/images/profile.jpg`
- **Gebruikt op:** `/links` pagina
- **Aanbevolen formaat:** 512x512 pixels (vierkant)
- **Bestandstype:** JPG of PNG
- **Beschrijving:** Je professionele DJ foto die wordt weergegeven als profielfoto op de linktree pagina

### 2. Hero Achtergrond (`hero-bg.jpg`) - Optioneel
- **Locatie:** `public/images/hero-bg.jpg`
- **Gebruikt op:** Homepage hero sectie
- **Aanbevolen formaat:** 1920x1080 pixels (landscape)
- **Bestandstype:** JPG
- **Beschrijving:** Een professionele foto van jou achter de DJ booth of tijdens een event

### 3. Gallery Foto's
- **Locatie:** `public/images/gallery/`
- **Gebruikt op:** Gallery pagina
- **Aanbevolen formaat:** 1200x800 pixels (landscape) of 800x1200 (portrait)
- **Bestandstype:** JPG
- **Beschrijving:** Foto's van je events, opstellingen, en sfeerimpressies

### 4. Logo (`logo.png`) - Optioneel
- **Locatie:** `public/images/logo.png`
- **Gebruikt op:** Navigation en footer
- **Aanbevolen formaat:** 200x200 pixels (transparante achtergrond)
- **Bestandstype:** PNG
- **Beschrijving:** Je DJ logo of branding

## 🖼️ Foto Optimalisatie Tips

1. **Comprimeer je foto's** - Gebruik tools zoals TinyPNG of Squoosh.app om bestandsgrootte te verkleinen zonder kwaliteitsverlies
2. **Gebruik het juiste formaat:**
   - JPG voor foto's met veel kleuren
   - PNG voor logo's en afbeeldingen met transparantie
   - WebP voor optimale compressie (modern browsers)

3. **Responsive images** - Next.js Image component optimaliseert automatisch je foto's voor verschillende schermformaten

## 📝 Hoe Foto's Toevoegen

### Stap 1: Foto's voorbereiden
1. Zorg dat je foto's de juiste afmetingen hebben
2. Comprimeer de foto's voor snelle laadtijden
3. Gebruik duidelijke bestandsnamen (bijv. `event-bruiloft-2024.jpg`)

### Stap 2: Foto's uploaden
1. Open de `public/images/` folder in je project
2. Sleep je foto's naar de juiste subfolder
3. Voor gallery foto's, plaats ze in `public/images/gallery/`

### Stap 3: Foto's gebruiken in code

#### In React/Next.js componenten:
```jsx
import Image from 'next/image';

<Image
  src="/images/profile.jpg"
  alt="DJ Bazuri"
  width={512}
  height={512}
  priority
/>
```

#### Direct in HTML:
```html
<img src="/images/profile.jpg" alt="DJ Bazuri" />
```

#### Als CSS achtergrond:
```css
.hero {
  background-image: url('/images/hero-bg.jpg');
  background-size: cover;
  background-position: center;
}
```

## 🎨 Huidige Foto Gebruik

### `/links` pagina
- **Profiel foto:** `/images/profile.jpg` (regel 17 in `src/app/links/page.tsx`)
- Deze foto wordt weergegeven als cirkel met een primary colored border

### Gallery pagina
- Alle foto's in `/images/gallery/` worden automatisch getoond
- Je kunt onbeperkt foto's toevoegen aan deze folder

## ⚙️ Technische Details

- Next.js Image component optimaliseert automatisch alle images
- Foto's worden lazy-loaded voor betere prestaties
- Verschillende formaten worden gegenereerd voor verschillende schermgroottes
- WebP conversie gebeurt automatisch waar ondersteund

## 🔧 Troubleshooting

### Foto wordt niet weergegeven
1. Controleer of het bestand in de juiste folder staat (`public/images/`)
2. Controleer de bestandsnaam (let op hoofdletters!)
3. Ververs de browser cache (Ctrl+F5)
4. Restart de development server (`npm run dev`)

### Foto laadt langzaam
1. Comprimeer de foto met TinyPNG of Squoosh.app
2. Verklein de afmetingen als de foto te groot is
3. Gebruik JPG in plaats van PNG voor foto's

### Foto ziet er wazig uit
1. Gebruik een hogere resolutie bronbestand
2. Controleer de `width` en `height` props in de Image component
3. Voeg `quality={90}` toe aan de Image component voor hogere kwaliteit

## 📧 Hulp Nodig?

Als je problemen hebt met het uploaden of weergeven van foto's, neem dan contact op of check de Next.js Image documentatie: https://nextjs.org/docs/app/building-your-application/optimizing/images
