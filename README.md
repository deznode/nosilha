
# Nos Ilha - Brava Island Cultural & Tourism Directory

**nosilha.com** is a community-driven online tourism and cultural heritage hub for Brava Island, Cape Verde. This open-source, volunteer-supported project aims to provide a comprehensive digital experience that connects international tourists, local residents, business owners, and the global Cape Verdean diaspora to the heart of Brava.

As a community-supported initiative with limited resources, the platform focuses on showcasing the island's unique landmarks, vibrant businesses, rich history, and living culture through a modern and accessible web application.

## 🎯 Project Goal

To create a community-maintained, authoritative online resource for Brava that promotes sustainable tourism, preserves cultural memory, and fosters economic opportunity for the local community through volunteer contributions and collaborative development.

## 👥 Target Audience

  * **International Tourists:** Travelers seeking authentic experiences, planning trips, and looking for reliable information on accommodations, dining, and activities.
  * **Local Residents:** Community members looking for a centralized directory of local services and a platform to celebrate their shared heritage.
  * **Business Owners:** Local entrepreneurs who need a modern platform to market their services to a global audience.
  * **Cape Verdean Diaspora:** Members of the diaspora community seeking to reconnect with their roots, explore their heritage, and stay informed about life on Brava.

## ✨ Core Features

  * **Comprehensive Directory:** A curated database of businesses, services, and points of interest, organized by categories like `Restaurants`, `Lodging`, `Artisans`, and `Services`.
  * **Interactive Maps:** A multi-layered, offline-ready map built with Leaflet.js and OpenStreetMap, featuring custom markers for landmarks, businesses, and historical sites.
  * **Rich Media Galleries:** Stunning photo and video galleries showcasing Brava's landscapes, people, and culture, with AI-enhanced organization.
  * **Town & Historical Pages:** Detailed pages for each town (`Vila Nova Sintra`, `Furna`, `Nossa Senhora do Monte`, etc.) and significant historical figures or events.
  * **AI-Enhanced Discovery:** Automated media tagging, location inference from photos, OCR for historical documents, and facial/landmark recognition to make content more searchable and accessible.
  * **Multilingual Support:** Full content translation and localization for English, Portuguese, and French to serve a global audience.

## 💻 Technology Stack

This project is built with a modern, scalable, and robust technology stack designed for performance and maintainability.

| Layer                 | Technology                                                              | Purpose                                                                |
| --------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| **Frontend** | [React](https://react.dev/) + [Next.js](https://nextjs.org/) (App Router) | UI, Server-Side Rendering (SSR), Static Site Generation (SSG)          |
|                       | [TypeScript](https://www.typescriptlang.org/)                           | Type safety and developer experience                                   |
|                       | [Tailwind CSS](https://tailwindcss.com/)                                | Utility-first styling for rapid, responsive UI development             |
| **Backend** | [Spring Boot](https://spring.io/projects/spring-boot) + [Kotlin](https://kotlinlang.org/)    | Robust, concise, and scalable REST API development                     |
| **Databases** | [PostgreSQL](https://www.postgresql.org/)                               | Primary relational database for structured content (businesses, towns) |
|                       | [Google Firestore](https://firebase.google.com/docs/firestore)         | Flexible metadata storage for AI-processed images and documents        |
| **Mapping** | [Leaflet.js](https://leafletjs.com/) + [OpenStreetMap](https://www.openstreetmap.org/) | Interactive, customizable, and open-source mapping solution            |
| **AI Services** | [Google Cloud Vision API](https://cloud.google.com/vision)              | Image/video analysis, OCR, and recognition tasks                       |
| **Storage & CDN** | [Google Cloud Storage](https://cloud.google.com/storage)                | Scalable storage for all media assets with CDN integration             |
| **Infrastructure** | [Google Cloud Run](https://cloud.google.com/run)                        | Serverless deployment and scaling of containerized applications        |
| **Security** | Let's Encrypt                                                           | Free, automated SSL/TLS certificates                                   |

## 🧱 Architectural & Implementation Guidelines

This project adheres to clean architecture principles to ensure separation of concerns, testability, and long-term maintainability.

### Backend (Kotlin & Spring Boot)

  * **Controller Layer:** Controllers are lightweight and responsible for request/response handling. They return clean DTOs (Data Transfer Objects) and map domain entities within this layer. `ResponseEntity` is used sparingly, only for custom status code responses.
  * **Service Layer:** Contains the core business logic.
  * **Repository Layer:** Manages data access and persistence.

### Frontend (Next.js App Router)

  * **Route Groups:** Routes are logically organized using parentheses (e.g., `(directory)`, `(marketing)`) to avoid affecting the URL path.
  * **Dynamic Routing:** Used extensively for profile pages (e.g., `/directory/[category]/[slug]`, `/towns/[name]`).
  * **Server-First Components:** We prioritize React Server Components (RSCs) for fetching data and rendering static content to improve performance. Client Components are used only when interactivity (`useState`, `useEffect`) is required.
  * **Mobile-Optimized:** All components and layouts are designed with a mobile-first approach.
  * **Streaming & Suspense:** Used to progressively render UI and improve perceived load times on complex pages.

### Key Principles

  * **SEO & Structured Data:** All public pages are optimized for search engines with proper `meta` tags, `sitemap.xml`, `robots.txt`, and [Schema.org](https://schema.org/) structured data (e.g., `LocalBusiness`, `TouristAttraction`).
  * **Performance:** We target fast load times via route-level caching, Incremental Static Regeneration (ISR), CDN asset delivery, and image optimization (WebP format, lazy loading).
  * **Accessibility (a11y):** We adhere to WCAG guidelines to ensure the platform is usable by everyone.
  * **GDPR Compliance:** User data privacy is paramount. AI features involving facial recognition will have strict privacy controls and consent mechanisms.

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** and npm
- **Java 21** (OpenJDK or Oracle JDK)
- **Docker** and Docker Compose
- **PostgreSQL** (or use Docker Compose setup)

### Local Development Setup

1. **Start infrastructure services**:
   ```bash
   cd infrastructure/docker && docker-compose up -d
   ```
   This starts:
   - PostgreSQL database (localhost:5432)
   - Firestore emulator (localhost:8081)
   - Google Cloud Storage emulator (localhost:8082)

2. **Backend setup**:
   ```bash
   cd backend
   # Database will auto-migrate on startup via Flyway
   ./gradlew bootRun --args='--spring.profiles.active=local'
   ```

3. **Frontend setup**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### Application URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080/api/v1/
- **PostgreSQL**: localhost:5432 (database: `nosilha_db`, user: `nosilha`, password: `nosilha`)
- **Firestore Emulator**: http://localhost:8081
- **GCS Emulator**: http://localhost:8082

## 🤝 Contribution Guidelines

This is an open project dedicated to the celebration of Brava. We welcome contributions from the community. Please read our `CONTRIBUTING.md` file for details on our code of conduct and the process for submitting pull requests.

## 📜 License

This project is licensed under the MIT License - see the `LICENSE.md` file for details.

## ✉️ Contact

For inquiries, partnerships, or to get involved, please contact the project maintainers at **contact@nosilha.com**.

-----
