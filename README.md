
# Nos Ilha - Brava Island Cultural Heritage Hub

**nosilha.com** is a community-driven cultural heritage hub for Brava Island, Cape Verde. This open-source, volunteer-supported project aims to preserve and celebrate the island's rich cultural memory while providing a comprehensive digital experience that connects the global Cape Verdean diaspora, local residents, business owners, and international visitors to the heart of Brava.

As a community-supported initiative, the platform focuses on showcasing the island's rich history, living culture, unique landmarks, and vibrant community through a modern and accessible web application.

## 🎯 Project Goal

To create a community-maintained, authoritative online resource for Brava that preserves cultural memory, celebrates the island's heritage, and connects the global diaspora to their roots, while supporting sustainable tourism and economic opportunity for the local community through volunteer contributions and collaborative development.

## 👥 Target Audience

  * **Cape Verdean Diaspora:** Members of the diaspora community seeking to reconnect with their roots, explore their cultural heritage, and stay informed about life on Brava.
  * **Local Residents:** Community members looking for a centralized platform to celebrate their shared heritage and directory of local services.
  * **Cultural Researchers & Historians:** Scholars and enthusiasts studying Cape Verdean history, culture, and traditions.
  * **International Visitors:** Travelers seeking authentic cultural experiences, planning trips, and looking for reliable information on the island's heritage sites, accommodations, and local businesses.

## ✨ Core Features

  * **Cultural Heritage Archive:** Rich documentation of Brava's history, traditions, and cultural practices, featuring significant historical figures, events, and community stories.
  * **Town & Historical Pages:** Detailed pages for each town (`Vila Nova Sintra`, `Furna`, `Nossa Senhora do Monte`, etc.) with historical context and cultural significance.
  * **Rich Media Galleries:** Stunning photo and video galleries showcasing Brava's landscapes, people, and culture, with AI-enhanced organization for preservation and discovery.
  * **Interactive Heritage Maps:** Multi-layered, responsive maps built with Mapbox, featuring custom markers for landmarks, historical sites, and cultural points of interest with rich storytelling.
  * **Community Directory:** A curated database of local businesses, artisans, and services that contribute to Brava's cultural and economic vitality.
  * **AI-Enhanced Discovery:** Automated media tagging, location inference from photos, OCR for historical documents, and landmark recognition to preserve and make cultural content more searchable and accessible.
  * **Multilingual Support:** Full content translation and localization for English, Portuguese, and French to serve the global Cape Verdean community.

## 💻 Technology Stack

This project is built with a modern, scalable, and robust technology stack designed for performance and maintainability.

| Layer                 | Technology                                                              | Purpose                                                                |
 | --------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| **Frontend** | [React](https://react.dev/) 19 + [Next.js](https://nextjs.org/) 15 (App Router) | UI, Server-Side Rendering (SSR), Incremental Static Regeneration (ISR) |
|                       | [TypeScript](https://www.typescriptlang.org/)                           | Type safety and developer experience                                   |
|                       | [Tailwind CSS](https://tailwindcss.com/) + [Catalyst UI](https://catalyst.tailwindui.com/) | Utility-first styling with professional component library             |
|                       | [Supabase Auth](https://supabase.com/auth)                             | Authentication with JWT token management                               |
| **Backend** | [Spring Boot](https://spring.io/projects/spring-boot) 3.4.7 + [Kotlin](https://kotlinlang.org/) | Robust, concise, and scalable REST API development                     |
|                       | [Flyway](https://flywaydb.org/)                                        | Database migration management and versioning                           |
|                       | [Spring Boot Actuator](https://spring.io/guides/gs/actuator-service)   | Production monitoring and health checks                                |
| **Databases** | [PostgreSQL](https://www.postgresql.org/) 15                           | Primary relational database with single-table inheritance pattern     |
|                       | [Google Firestore](https://firebase.google.com/docs/firestore)         | Flexible metadata storage for AI-processed images and documents        |
| **Mapping** | [Mapbox](https://www.mapbox.com/)                                       | Interactive, customizable mapping with rich styling and geocoding     |
| **AI Services** | [Google Cloud Vision API](https://cloud.google.com/vision)              | Image/video analysis, OCR, landmark recognition, and content tagging   |
| **Storage & CDN** | [Google Cloud Storage](https://cloud.google.com/storage)                | Scalable media storage with public CDN distribution                    |
| **Infrastructure** | [Google Cloud Run](https://cloud.google.com/run)                        | Serverless deployment with auto-scaling and zero-downtime updates      |
|                       | [Terraform](https://www.terraform.io/)                                 | Infrastructure as Code for reproducible cloud resource management      |
|                       | [Docker](https://www.docker.com/)                                      | Containerization for consistent deployments across environments        |
| **CI/CD** | [GitHub Actions](https://github.com/features/actions)                  | Automated testing, security scanning, and deployment workflows         |
|                       | [Trivy](https://trivy.dev/) + [detekt](https://detekt.dev/)            | Security vulnerability scanning and code quality analysis              |
| **Security** | Let's Encrypt + [Google IAM](https://cloud.google.com/iam)             | Automated SSL/TLS certificates and least-privilege access control      |

## 🧱 Architectural & Implementation Guidelines

This project adheres to clean architecture principles to ensure separation of concerns, testability, and long-term maintainability.

### System Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │  Infrastructure │
│   (Next.js)     │    │ (Spring Boot)   │    │     (GCP)       │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ • React 19      │◄──►│ • Kotlin/JVM    │◄──►│ • Cloud Run     │
│ • App Router    │    │ • PostgreSQL    │    │ • Artifact Reg. │
│ • Tailwind CSS  │    │ • Firestore     │    │ • Cloud Storage │
│ • ISR Caching   │    │ • JWT Auth      │    │ • Secret Mgr.   │
│ • Mapbox Maps   │    │ • Domain-Driven │    │ • Vision API    │
│ • Supabase Auth │    │ • RESTful APIs  │    │ • IAM Security  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
           │                      │                      │
           └──────────────────────┼──────────────────────┘
                                  │
                    ┌─────────────────┐
                    │    CI/CD        │
                    │ (GitHub Actions)│
                    ├─────────────────┤
                    │ • Modular Flows │
                    │ • Security Scan │
                    │ • Auto Deploy   │
                    │ • Health Checks │
                    └─────────────────┘
```

### Backend (Kotlin & Spring Boot)

  * **Controller Layer:** Controllers are lightweight and responsible for request/response handling. They return clean DTOs (Data Transfer Objects) and map domain entities within this layer. `ResponseEntity` is used sparingly, only for custom status code responses.
  * **Service Layer:** Contains the core business logic with clear separation of concerns.
  * **Repository Layer:** Manages data access and persistence using Spring Data JPA.
  * **Domain-Driven Design:** Single Table Inheritance pattern for `DirectoryEntry` with type-specific subclasses.
  * **Security:** JWT-based authentication with Supabase token validation and role-based access control.

### Frontend (Next.js App Router)

  * **Route Groups:** Routes are logically organized using parentheses (e.g., `(auth)`, `(main)`, `(admin)`) to avoid affecting the URL path.
  * **Dynamic Routing:** Used extensively for profile pages (e.g., `/directory/[category]/[slug]`, `/towns/[name]`).
  * **Server-First Components:** We prioritize React Server Components (RSCs) for fetching data and rendering static content to improve performance. Client Components are used only when interactivity (`useState`, `useEffect`) is required.
  * **Mobile-Optimized:** All components and layouts are designed with a mobile-first approach.
  * **Caching Strategy:** ISR (1-hour cache for directories, 30-min for entries) with real-time updates for interactive features.
  * **Authentication Flow:** Supabase Auth → JWT tokens → API integration with automatic token refresh.

### Infrastructure & CI/CD

  * **Modular Workflows:** Path-based triggering ensures only relevant services are built and deployed.
  * **Security Integration:** Comprehensive scanning (Trivy, detekt, ESLint, tfsec) with SARIF reporting.
  * **Production Deployment:** Single environment strategy with auto-scaling Cloud Run services.
  * **Infrastructure as Code:** Terraform manages all GCP resources with remote state management.

### Key Principles

  * **SEO & Structured Data:** All public pages are optimized for search engines with proper `meta` tags, `sitemap.xml`, `robots.txt`, and [Schema.org](https://schema.org/) structured data (e.g., `LocalBusiness`, `TouristAttraction`).
  * **Performance:** We target fast load times via route-level caching, Incremental Static Regeneration (ISR), CDN asset delivery, and image optimization (WebP format, lazy loading).
  * **Accessibility (a11y):** We adhere to WCAG guidelines to ensure the platform is usable by everyone.
  * **Security:** Comprehensive security scanning, least-privilege IAM, and encrypted secrets management.
  * **GDPR Compliance:** User data privacy is paramount. AI features involving facial recognition will have strict privacy controls and consent mechanisms.

## ✅ Modern Architecture & Implementation

The Nos Ilha platform has been built with a sophisticated, production-ready architecture that prioritizes scalability, maintainability, and developer experience:

### Backend Modularity
  * **Spring Modulith Architecture:** Fully modular backend with enforced module boundaries (`shared`, `auth`, `directory`, `media`), event-driven communication, and verified zero circular dependencies. See [`docs/SPRING_MODULITH.md`](docs/SPRING_MODULITH.md) for comprehensive module architecture guide.

### Frontend State Management
  * **Zustand:** Lightweight client state management with persistence middleware and Redux DevTools integration for UI preferences, authentication, and filter state.
  * **TanStack Query:** Server state management with automatic caching, background refetching, optimistic updates, and cache invalidation for directory entries, user profiles, and media metadata.
  * **Zod:** TypeScript-first schema validation enabling runtime type safety for forms (React Hook Form integration), API responses, and data parsing across the platform.

  See [`docs/STATE_MANAGEMENT.md`](docs/STATE_MANAGEMENT.md) for detailed patterns, integration examples, and best practices.

### Testing Infrastructure
  * **Playwright:** Comprehensive E2E testing with 6 critical user flows, mobile viewport testing, and <5-minute execution time target. Includes Playwright MCP server for browser automation.
  * **Vitest:** Fast unit testing with jsdom environment, >70% coverage threshold enforcement, and Testing Library integration for components and hooks.
  * **Storybook:** Living component documentation with 20+ components, accessibility testing (addon-a11y), and visual testing for design system consistency.

  See [`docs/TESTING.md`](docs/TESTING.md) for complete testing guide, patterns, and CI/CD integration.

This modern architecture demonstrates the project's commitment to engineering excellence while serving the cultural heritage preservation mission at its core.

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** and npm
- **Java 21** (OpenJDK or Oracle JDK)
- **Docker** and Docker Compose
- **PostgreSQL** (or use Docker Compose setup)
- **Google Cloud SDK** (for production deployment)
- **Terraform** (for infrastructure management)

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
   pnpm install
   pnpm run dev
   ```

### Application URLs

- **Frontend**: http://localhost:3000 (Next.js with hot reload)
- **Backend API**: http://localhost:8080/api/v1/ (Spring Boot with live reload)
- **Health Check**: http://localhost:8080/actuator/health
- **PostgreSQL**: localhost:5432 (database: `nosilha_db`, user: `nosilha`, password: `nosilha`)
- **Firestore Emulator**: http://localhost:8081 (AI metadata storage)
- **GCS Emulator**: http://localhost:8082 (Media file storage)

### Verification

```bash
# Test backend health
curl http://localhost:8080/actuator/health

# Test API endpoint
curl http://localhost:8080/api/v1/directory/entries

# Check database
docker-compose exec postgres psql -U nosilha -d nosilha_db -c "SELECT version();"
```

### Production Deployment

For production deployment to Google Cloud:

1. **Review Setup**: See [`docs/CI_CD_PIPELINE.md`](docs/CI_CD_PIPELINE.md) for comprehensive deployment guide
2. **Configure Secrets**: Set up GitHub secrets and Google Cloud credentials
3. **Deploy Infrastructure**: Use Terraform to provision GCP resources
4. **Automated Deployment**: Push to `main` branch triggers automatic deployment

See [`CLAUDE.md`](CLAUDE.md) for detailed architecture documentation and troubleshooting guide.

## 🧾 Version History

You can view all project releases, updates, and planned milestones in the  
➡️ [**Nos Ilha Changelog**](CHANGELOG.md)

## 🤝 Contribution Guidelines

This is an open project dedicated to the celebration of Brava. We welcome contributions from the community. Please read our `CONTRIBUTING.md` file for details on our code of conduct and the process for submitting pull requests.

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

**Why MIT?** This permissive license allows maximum flexibility for developers and organizations to use, modify, and build upon Nos Ilha while encouraging contributions back to the community. It ensures the platform can be freely adapted to serve cultural heritage preservation missions worldwide while maintaining the collaborative spirit of open source.

## ✉️ Contact

For inquiries, partnerships, or to get involved, please contact the project maintainers at **contact@nosilha.com**.

-----
