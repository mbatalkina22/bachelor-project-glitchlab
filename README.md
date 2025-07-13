# 🧪 Glitch Lab - Workshop Management Platform

**Glitch Lab** is a comprehensive digital platform developed as part of a bachelor thesis project to support participatory technology design workshops. This platform was created in collaboration with LUXIA – the User Experience, Interaction and Accessibility laboratory at Università della Svizzera italiana (USI)

## 🎓 Project Overview

This full-stack web application demonstrates advanced software engineering principles and modern web development practices. The platform serves as both a functional workshop management system and a showcase of technical competencies in:

- **Full-Stack Development**: Complete CRUD operations with secure API design
- **User Experience Design**: Intuitive interface with accessibility considerations
- **Database Architecture**: Efficient MongoDB schema design and optimization
- **Security Implementation**: JWT authentication, password encryption, and data validation
- **Internationalization**: Multi-language support for diverse user bases
- **Cloud Integration**: Professional-grade file management and email systems

## 🚀 Key Features & Technical Achievements

- **🎯 Workshop Management System**: Complete CRUD functionality for workshop lifecycle management
- **📅 Interactive Calendar**: Advanced scheduling with FullCalendar integration and conflict resolution
- **👥 Secure Authentication**: JWT-based authentication with bcrypt password hashing and email verification
- **🌐 Internationalization**: Multi-language support (English/Italian) using next-intl framework
- **📱 Responsive Design**: Mobile-first approach with Tailwind CSS and accessibility compliance
- **⭐ Review & Rating System**: User feedback collection with data analytics capabilities
- **🏆 Gamification Elements**: Achievement badge system to encourage user engagement
- **📧 Automated Communications**: Professional email system with Nodemailer integration
- **☁️ Cloud File Management**: Scalable image upload and storage via Cloudinary
- **👨‍🏫 Role-Based Access Control**: Sophisticated user permission system for instructors and participants

## 🛠️ Technical Stack & Architecture

**Frontend Technologies:**
- **Next.js 15**: Latest React framework with App Router for optimal performance
- **React 19**: Modern React with concurrent features and improved performance
- **TypeScript**: Type-safe development ensuring code reliability and maintainability
- **Tailwind CSS 4**: Utility-first CSS framework for rapid UI development

**Backend & Database:**
- **MongoDB**: NoSQL database with efficient document storage and indexing
- **Mongoose**: Object Document Mapping (ODM) for schema validation and data modeling
- **JWT**: Stateless authentication with secure token management
- **bcryptjs**: Industry-standard password hashing for security

**Third-Party Integrations:**
- **Cloudinary**: Professional cloud-based image and video management
- **Nodemailer**: Reliable email delivery system
- **FullCalendar**: Advanced calendar component
- **next-intl**: Comprehensive internationalization framework

**Development Tools:**
- **ESLint**: Code quality and consistency enforcement
- **TypeScript**: Static type checking for enhanced developer experience

## 📋 Prerequisites

- Node.js 18+ 
- MongoDB database
- Cloudinary account (for image uploads)
- SMTP server credentials (for email functionality)


## 🗂️ Project Structure

```
src/
├── app/
│   ├── [locale]/           # Internationalized routes
│   │   ├── workshops/      # Workshop pages
│   │   ├── calendar/       # Calendar view
│   │   ├── profile/        # User profiles
│   │   └── ...
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── workshops/     # Workshop CRUD operations
│   │   ├── reviews/       # Review system
│   │   └── ...
│   └── messages/          # Internationalization files
├── components/            # Reusable React components
├── context/              # React context providers
├── styles/               # Global styles
└── utils/                # Utility functions
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/verify-email` - Email verification

### Workshops
- `GET /api/workshops` - Get all workshops
- `POST /api/workshops` - Create new workshop
- `PUT /api/workshops/[id]` - Update workshop
- `DELETE /api/workshops/[id]` - Delete workshop

### Reviews
- `GET /api/reviews` - Get all reviews
- `POST /api/reviews` - Create review
- `PUT /api/reviews/[id]` - Update review

## 🌐 Internationalization

The application supports multiple languages:
- English (en)
- Italian (it)

Translation files are located in `src/app/messages/`

## 🚀 Deployment

**Current Production Environment**: This application is deployed on the USI (Università della Svizzera italiana) server infrastructure through a dedicated virtual machine setup, ensuring secure and reliable access for academic and research purposes.

### USI Server Deployment
- **Environment**: Production VM hosted by USI IT infrastructure
- **Access**: Available to authorized university personnel and research participants
- **Security**: Enterprise-grade security protocols and university network protection

### Alternative Deployment Options
For development or testing purposes:
```bash
npm run build
npm start
```

## 📄 Academic Context

**Thesis Information:**
- **Institution**: Università della Svizzera italiana (USI)
- **Faculty**: Informatics
- **Project Type**: Bachelor Thesis in Computer Science
- **Academic Year**: 2024-2025

---

*A modern workshop management platform showcasing full-stack development expertise for academic and professional evaluation.*



