# LuminaStudio 3D — Interactive Residential Lighting Simulator

**LuminaStudio 3D** is an interactive, real-time 3D web application for designing, testing, and visualizing residential lighting setups. Built with **React**, **Three.js (`@react-three/fiber`)**, and **Tailwind CSS**, it lets users customize room architecture, place and drag 3D light fixtures and furniture, tune photometric parameters (Kelvin color temperature, LED Watts, and Lumens), and capture high-resolution snapshots.

---

## Key Features

- **Photometric Lighting Controls**:
  - **Color Temperature (`2000K` – `7000K`)**: Continuous slider based on Tanner Helland's blackbody radiation algorithm, plus instant presets for **Warm White (`2700K`)**, **Neutral White (`4000K`)**, and **Cool White (`6500K`)**.
  - **Synchronized LED Watts & Lumens**: Coupled sliders (`95 lm/W` residential LED efficacy) with commercial bulb presets (`5W`, `9W`, `12W`, `18W`, `24W`, `36W`).
  - **Real-Time Illuminance Telemetry (`Lux`)**: Live calculation of total room area (`m²`), active luminous flux (`lm`), power consumption (`W`), and estimated average illuminance (`Lux`) based on ceiling height utilization factors.
- **Interactive 3D Fixtures & Drag-and-Drop**:
  - **4 Fixture Models**: Pendant (`pendant`), Flush Mount Ceiling (`plafon`), Recessed Spot (`spot`), and Floor Lamp (`floor_lamp`).
  - **Scalable Dimensions**: Resize individual fixtures from `50%` to `240%`.
  - **Direct 3D Manipulation**: Click and drag any lamp across the room plane with real-time laser projection guides onto the floor, or use inline quick-action buttons (`ON/OFF`, `Center`, `Duplicate`, `Delete`).
- **Room Architecture Customization**:
  - **3 Room Geometries**: Rectangular (`rectangular`), L-Shape (`l-shape`), and Octagonal (`octagonal`).
  - **Configurable Dimensions**: Adjust room width (`3.0m – 12.0m`), depth (`3.0m – 12.0m`), and ceiling height (`2.4m – 4.5m`).
  - **Surface Finishes**: Choose from 6 wall colors and 5 floor materials with custom roughness and metalness properties.
- **3D Furniture & Shadow Testing**:
  - **Built-in Catalog**: Sofa, Dining Table, Double Bed, Office Desk, Bookshelf, Armchair, and Potted Plant.
  - **Shadow Casting**: All furniture meshes cast and receive dynamic 3D shadows (`2048×2048` shadow maps) to inspect light placement and occlusion.
  - **Full Placement Controls**: Drag-and-drop on the floor, rotate in `45°` or `15°` increments, scale (`50% – 180%`), and recolor.
- **Snapshot Studio & Bilingual UI**:
  - **High-Resolution Capture**: Render and download instant PNG snapshots (`preserveDrawingBuffer: true`) with an interactive preview modal.
  - **Bilingual Interface (`PT` / `EN`)**: Instant language toggle between Portuguese and English in the top navigation bar.

---

## Tech Stack

- **Frontend Framework**: [React 18](https://react.dev/) + [Vite 6](https://vite.dev/)
- **3D Rendering Engine**: [Three.js](https://threejs.org/), [`@react-three/fiber`](https://r3f.docs.pmnd.rs/), [`@react-three/drei`](https://drei.docs.pmnd.rs/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## Project Structure

```text
lights_on/
├── index.html                  # Application entry HTML
├── package.json                # Dependencies and build scripts
├── vite.config.js              # Vite + React + Tailwind v4 configuration
└── src/
    ├── main.jsx                # React DOM root mount
    ├── index.css               # Global CSS and custom scrollbars
    ├── App.jsx                 # Main UI layout, state management, and sidebar controls
    ├── assets/img/credit/
    │   └── bruno-head.webp     # Footer author credit
    ├── components/
    │   ├── AuthorCredit.jsx    # Footer signature: small head → LinkedIn / GitHub / "inspiração" note
    │   ├── AuthorCredit.css    # Signature styles, themed to the app
    │   ├── Scene3D.jsx         # Three.js Canvas, camera, OrbitControls, and raycast floor drag plane
    │   ├── RoomMesh.jsx        # Procedural 3D walls, floors, grids, and baseboards per room shape
    │   ├── Lamp3D.jsx          # 3D lamp models, dynamic PointLight/SpotLight, and selection HUD
    │   └── Furniture3D.jsx     # Procedural 3D furniture models with shadow casting and drag support
    └── utils/
        ├── lightingPhysics.js  # Photometric conversions (Kelvin to RGB, Watts/Lumens, Lux) & catalogs
        └── i18n.js             # Complete English (en) and Portuguese (pt) translation dictionaries
```

---

## Getting Started

### Prerequisites

- **Node.js** `>= 18.0.0`
- **npm** `>= 9.0.0`

### Installation & Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the Vite development server:
   ```bash
   npm run dev
   ```

3. Open `http://localhost:5173` in your browser.

### Production Build

To create an optimized production bundle in the `dist/` folder:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

---

## Design inspiration

- The app should feel like a room at night, right before someone turns the lights on: dark slate everywhere, so the lamps are what shines.
- Panels float over the 3D scene like frosted glass, keeping the room visible behind the controls.
- Amber only appears where there is energy: the all-lights switch, the lamps tab, the lumen readouts.
- Blue is reserved for the camera and the furniture, like the cold light of a screen.
- Double-click lamps on and off and take a photo with a flash, as if walking through a site visit.
- The why: picking a bulb is usually a guess (9 W or 12 W? 3000 K or 4000 K?). Here you can test it before drilling the ceiling.

The same text, in Portuguese and in Bruno's own voice, is in the footer: click the small head, then **"inspiração"**.

## Credits

Design and development by **Bruno Villas Boas**. In the app footer, the small head of his 3D figure opens a menu with these links and the design note.

[LinkedIn](https://www.linkedin.com/in/bruno-villas-boas/) · [GitHub](https://github.com/brvboas)
