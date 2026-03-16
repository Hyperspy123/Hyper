# HYPER - Padel Court Booking App

## Design Guidelines

### Design References
- **Style**: Modern Dark Sports App with RTL Arabic layout
- **Inspiration**: Premium sports booking apps with neon accents

### Color Palette
- Primary Background: #0a0f3c (Deep Navy)
- Secondary Background: #1f2d60 (Dark Blue)
- Card Background: #14224d (Navy Card)
- Accent: #00bcd4 (Cyan/Teal)
- Accent Hover: #00e5ff (Bright Cyan)
- Success: #4caf50 (Green)
- Warning: #ff9800 (Orange)
- Danger: #f44336 (Red)
- Text Primary: #ffffff (White)
- Text Secondary: #94a3b8 (Light Gray)

### Typography
- Font: system Arabic sans-serif stack
- Direction: RTL (Right-to-Left)
- Language: Arabic

### Key Component Styles
- Cards: Dark navy with subtle border, rounded-xl, hover lift effect
- Buttons: Cyan accent, white text, rounded-lg
- Inputs: Dark background with border, focus cyan ring

### Images (Generated via CDN)
1. court-indoor-blue.jpg - Indoor padel court with blue turf
2. court-outdoor-green.jpg - Outdoor padel court with palm trees
3. court-vip-premium.jpg - VIP premium padel court
4. court-indoor-orange.jpg - Indoor court with orange turf
5. hero-padel-banner.jpg - Hero banner for the app

---

## Development Tasks

### Files to Create/Modify (max 8 files):
1. **src/pages/Index.tsx** - Home page with hero section and court listing
2. **src/pages/BookCourt.tsx** - Booking page with date/time selection
3. **src/pages/MyBookings.tsx** - User's booking history
4. **src/pages/Login.tsx** - Login page
5. **src/pages/Signup.tsx** - Signup page (redirect to auth)
6. **src/components/Header.tsx** - Shared navigation header
7. **src/App.tsx** - Update routes
8. **index.html** - Update title

### Data Flow:
- Courts: fetched from backend `courts` entity (public, no auth needed)
- Bookings: fetched from backend `bookings` entity (auth required, user-scoped)
- Auth: using web-sdk client.auth