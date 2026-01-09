# Nos Ilha - Brava Island Cultural Heritage Hub

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0-brightgreen)](https://spring.io/projects/spring-boot)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

**[View Live Site](https://nosilha.com)**

<!-- TODO: Add hero screenshot of nosilha.com homepage (recommended: 1200x630px) -->
<!-- ![Nos Ilha Homepage](docs/images/hero-screenshot.png) -->

**nosilha.com** is a community-driven cultural heritage hub for Brava Island, Cape Verde. This open-source, volunteer-supported project aims to preserve and celebrate the island's rich cultural memory while providing a comprehensive digital experience that connects the global Cape Verdean diaspora, local residents, business owners, and international visitors to the heart of Brava.

As a community-supported initiative, the platform focuses on showcasing the island's rich history, living culture, unique landmarks, and vibrant community through a modern and accessible web application.

## Table of Contents

- [Project Goal](#project-goal)
- [Target Audience](#target-audience)
- [Core Features](#core-features)
- [Built With](#built-with)
- [Getting Started](#getting-started)
- [Version History](#version-history)
- [Contributing](#contributing)
- [Getting Help](#getting-help)
- [License](#license)

## Project Goal

To create a community-maintained, authoritative online resource for Brava that preserves cultural memory, celebrates the island's heritage, and connects the global diaspora to their roots, while supporting sustainable tourism and economic opportunity for the local community through volunteer contributions and collaborative development.

## Target Audience

  * **Cape Verdean Diaspora:** Members of the diaspora community seeking to reconnect with their roots, explore their cultural heritage, and stay informed about life on Brava.
  * **Local Residents:** Community members looking for a centralized platform to celebrate their shared heritage and directory of local services.
  * **Cultural Researchers & Historians:** Scholars and enthusiasts studying Cape Verdean history, culture, and traditions.
  * **International Visitors:** Travelers seeking authentic cultural experiences, planning trips, and looking for reliable information on the island's heritage sites, accommodations, and local businesses.

## Core Features

  * **Cultural Heritage Archive:** Rich documentation of Brava's history, traditions, and cultural practices, featuring significant historical figures, events, and community stories.
  * **Town & Historical Pages:** Detailed pages for each town (`Vila Nova Sintra`, `Furna`, `Nossa Senhora do Monte`, etc.) with historical context and cultural significance.
  * **Rich Media Galleries:** Stunning photo and video galleries showcasing Brava's landscapes, people, and culture.
  * **Interactive Heritage Maps:** Multi-layered, responsive maps built with Mapbox, featuring custom markers for landmarks, historical sites, and cultural points of interest with rich storytelling.
  * **Community Directory:** A curated database of local businesses, artisans, and services that contribute to Brava's cultural and economic vitality.
  * **Multilingual Support:** Full content translation and localization for English, Portuguese, and French to serve the global Cape Verdean community.

## Built With

| Frontend | Backend | Infrastructure |
|----------|---------|----------------|
| Next.js 16 + React 19.2 | Spring Boot 4.0.0 + Kotlin 2.3.0 | Google Cloud Run |
| TypeScript + Tailwind CSS | PostgreSQL 15 + Flyway | Terraform IaC |
| Supabase Auth + Mapbox | Spring Modulith | GitHub Actions CI/CD |

For detailed architecture documentation, see [docs/architecture.md](docs/architecture.md).

## Getting Started

### Prerequisites

- **Node.js 20.9+** and pnpm
- **Java 25** (OpenJDK or Oracle JDK)
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

2. **Backend setup**:
   ```bash
   cd apps/api
   # Database will auto-migrate on startup via Flyway
   ./gradlew bootRun --args='--spring.profiles.active=local'
   ```

3. **Frontend setup**:
   ```bash
   cd apps/web
   pnpm install
   pnpm run dev
   ```

### Application URLs

- **Frontend**: http://localhost:3000 (Next.js with hot reload)
- **Backend API**: http://localhost:8080/api/v1/ (Spring Boot with live reload)
- **Health Check**: http://localhost:8080/actuator/health
- **PostgreSQL**: localhost:5432 (database: `nosilha_db`, user: `nosilha`, password: `nosilha`)

### Verification

```bash
# Test backend health
curl http://localhost:8080/actuator/health

# Test API endpoint
curl http://localhost:8080/api/v1/directory/entries

# Check database
docker-compose exec db psql -U nosilha -d nosilha_db -c "SELECT version();"
```

### Production Deployment

For production deployment to Google Cloud:

1. **Review Setup**: See [`docs/ci-cd-pipeline.md`](docs/ci-cd-pipeline.md) for comprehensive deployment guide
2. **Configure Secrets**: Set up GitHub secrets and Google Cloud credentials
3. **Deploy Infrastructure**: Use Terraform to provision GCP resources
4. **Automated Deployment**: Push to `main` branch triggers automatic deployment

See [`docs/architecture.md`](docs/architecture.md) for detailed architecture documentation and [`docs/troubleshooting.md`](docs/troubleshooting.md) for troubleshooting guide.

## Version History

You can view all project releases, updates, and planned milestones in the [Nos Ilha Changelog](CHANGELOG.md).

## Contributing

This is an open project dedicated to the celebration of Brava. We welcome contributions from the community. Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## Getting Help

- **Questions & Discussion**: [GitHub Discussions](../../discussions)
- **Bug Reports & Features**: [GitHub Issues](../../issues)
- **Security Vulnerabilities**: See [SECURITY.md](SECURITY.md)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

**Why MIT?** This permissive license allows maximum flexibility for developers and organizations to use, modify, and build upon Nos Ilha while encouraging contributions back to the community. It ensures the platform can be freely adapted to serve cultural heritage preservation missions worldwide while maintaining the collaborative spirit of open source.

---

*For Brava. By Brava. Always.*
