# Technical Specification Document | Online Private Tutoring Platform

**Website:** Vaony — Exact Sciences, Engineering & Mathematics
**Issue Date:** June 2025
**Document Type:** Technical Brief for Web Designer & Developer
**Status:** New Development (from scratch)

---

## 1. Project Overview

This document defines the technical requirements for the development of a professional website whose primary goal is client acquisition for an online private tutoring service. The platform covers both specialized higher-education subjects (Programming, CNC, Fluid Mechanics, and others) and foundational mathematics (Arithmetic, Algebra, etc.).

### Project Summary

- **Project Name:** Vaony
- **Delivery Mode:** 100% Online (virtual classes)
- **Primary Goal:** New student acquisition (lead generation)
- **Development Type:** Brand-new website built from scratch
- **Target Audience:** Young adults and working professionals
- **User Profile:** Individuals struggling with exact-science subjects

---

## 2. Target Audience

The site must be designed with two primary user profiles in mind:

| Profile A: Young Adult | Profile B: Working Professional |
|---|---|
| Age range 18 – 30 years old | — |
| University students or recent graduates | Active professionals |
| Need to reinforce exact-science subjects | Looking to update or acquire technical knowledge |
| Comfortable with modern digital interfaces | Value clarity, speed, and professionalism |
| Motivated by accessibility and affordability | Motivated by results and schedule flexibility |

---

## 3. Website Structure (Navigation Map)

The site must include at minimum the following pages and sections:

### Main Pages

**HOME PAGE**
- Hero section with a prominent Call-to-Action (CTA)
- Brief presentation of services and key benefits
- Featured courses section with thumbnail cards
- Quick contact / registration banner

**COURSES / SERVICES PAGE**
- Subject catalog organized by category:
  - Basic Mathematics: Arithmetic, Algebra, Geometry, etc.
  - Exact Sciences: Physics, Chemistry, Calculus
  - Engineering & Specialties: CNC, Fluid Mechanics, Programming, etc.
- Description, duration, mode and price for each course
- Enrollment button on every course card

**ABOUT US**
- Mission, vision, and values
- Teacher directory: photo, name, short bio, specialties

**GALLERY**
- Photos and/or videos from sessions, materials and student results

**BLOG / RESOURCES** (Optional - recommended for SEO)
- Support articles on mathematics and science topics

**CONTACT PAGE**
- Contact form, map and social media links

**STUDENT PORTAL** (Login)
- Private area: class access, calendar, and course materials

**TEACHER PORTAL** (Login)
- Private area: profile management, class schedule, student communication, and resource upload

---

## 4. Required Features

### 4.1 Authentication & User Login System

**Supported user roles:**
- **Administrator:** full control of the platform, courses, users, and payments
- **Student:** access to their private portal, calendar, and contracted materials
- **Teacher:** access to their own portal, profile editor, schedule, and student chat

**General login features:**
- Registration with email and password
- Login with email/password and social login (Google OAuth 2.0)
- Password recovery via email
- Editable user profile (avatar, personal data)
- Role-based access control (RBAC): each role sees only its own area
- Secure session management with JWT tokens + refresh tokens
- Auto-logout after inactivity period

### 4.2 Student Portal

**Dashboard / Home:**
- Overview of enrolled courses, upcoming classes, and pending payments
- Quick link to enter ongoing class (video call or LMS link)

**Features:**
- Enrolled courses list with progress tracker
- Class calendar with upcoming sessions and reservation status
- Payment history and invoice download
- Downloadable course materials (PDFs, exercises)
- Chat with assigned teacher (see Section 4.7)
- Rating and review submission after each completed session

### 4.3 Teacher Portal

Teachers on this platform are qualified engineers and specialists from different fields. The teacher portal allows them to manage their public profile, upload credentials, and interact with students.

**Teacher Dashboard:**
- Overview of upcoming scheduled classes, new student requests, and unread messages
- Earnings summary and payment history

**Teacher Public Profile** (visible to students on the website):

The teacher profile acts as a personal showcase page. It must include:
- Professional photo (upload from device or webcam)
- Full name, academic title, and area of specialization
- Personal biography / academic and professional background
- Certificates & credentials: upload files (PDF, JPG, PNG) with title and issuing institution
- Projects & portfolio: upload images, PDFs or external links to completed projects
- Software & tools used: tag-based list (e.g., AutoCAD, MATLAB, Python, SolidWorks, etc.)
- Languages of instruction (e.g., Spanish, English)
- Student rating: average score from student reviews (read-only, auto-generated)
- Subjects taught: linked to the course catalog
- Social/professional links: LinkedIn, GitHub, ResearchGate, personal website (optional)

**Teacher Schedule Management:**
- Set available time slots on a weekly calendar
- Mark days off or blocked hours
- View confirmed bookings and pending requests
- Cancel or reschedule a class with automatic student notification

**Student Communication:**
- Access to chat with each enrolled student (see Section 4.7)
- View student session history and notes

**Resource Upload:**
- Upload course materials per student or per course group
- Supported formats: PDF, DOCX, XLSX, JPG, PNG, MP4, ZIP
- Files are stored in private cloud storage (accessible only to assigned students)

### 4.4 Forms

**General Contact Form:**
- Fields: Full name, email, phone (optional), subject, message
- Auto-reply email to user + notification to admin
- Anti-spam validation (CAPTCHA or honeypot)

**Enrollment / Class Request Form:**
- Fields: Name, email, phone, subject of interest, current level, preferred schedule
- After submission: redirect to payment gateway or confirmation screen

**User Registration Form (Student):**
- First name, last name, email, password, confirm password, accept Terms & Conditions

**Teacher Application Form:**
- Fields: Full name, email, area of specialization, years of experience, brief bio, attach CV (PDF)
- Admin receives application and manually activates teacher account

### 4.5 Payment System

**Required payment gateways:**
- Stripe and/or PayPal (credit/debit card support for Mexico and internationally)
- Mercado Pago (recommended for the Mexican market: OXXO, bank transfer, cards)

**Payment features:**
- Single session payment
- Session package payment (e.g., 5-session pack, 10-session pack)
- Monthly subscription (optional, for future phase)
- Automatic payment confirmation email with downloadable receipt
- Admin dashboard: full transaction history and revenue reports

> **IMPORTANT:** SSL certificate (HTTPS) is mandatory for all payment transactions.

### 4.6 Class Calendar

**Student-facing features:**
- Monthly/weekly calendar view showing available time slots
- Book a session directly from the calendar
- Automatic booking confirmation email
- Automatic reminder: 24h and 1h before class (email or push notification)

**Teacher-facing features:**
- Set and manage available hours per week
- View all confirmed bookings at a glance
- Block specific dates or time ranges (vacation, unavailability)
- Cancel or reschedule with student notification

**General settings:**
- Configurable time zones (important for students in different states or countries)
- Google Calendar integration (recommended)

**Suggested tools:** Calendly API, Acuity Scheduling, or custom implementation with FullCalendar.js

### 4.7 Real-Time Chat System (Student ↔ Teacher)

A built-in messaging system allows direct communication between students and their assigned teachers, reducing the need for external apps and keeping all interactions within the platform.

**Scope:**
- One-on-one chat between a student and their assigned teacher
- Admin can view any conversation for moderation purposes
- No group chat required in Phase 1

**Core messaging features:**
- Real-time messaging (WebSockets / Socket.IO or similar)
- Message read receipts (sent, delivered, read indicators)
- File sharing within chat: PDF, images, DOCX, XLSX (max 10 MB per file)
- Message history persisted in database (students and teachers can scroll back)
- Emoji support

**Notifications:**
- In-app notification badge when a new message arrives
- Email notification for new message if user is offline (with unsubscribe option)
- Optional: browser push notification

**Security & privacy:**
- Messages are only accessible to the two parties involved (student and teacher)
- Content moderation: admin can flag or delete inappropriate messages
- No chat is accessible before a session is booked and paid

**Suggested implementation:**
- Backend: Socket.IO (Node.js) or Firebase Realtime Database / Firestore
- Frontend: Custom chat UI component (React) integrated into both portals
- Alternative SaaS option: Stream Chat SDK or Sendbird (faster to implement)

### 4.8 Multimedia Gallery

**Content to display:**
- Class session screenshots or teacher workspace photos
- Short demo or testimonial videos (optional)
- Sample exercises and solved problems (image or PDF format)

**Technical features:**
- Grid layout with lightbox on click
- Filter by category (Programming, CNC, Mathematics, etc.)
- Lazy loading for performance optimization
- Admin panel to add, edit, and delete gallery items

---

## 5. Visual Design & Brand Identity

The design must convey a modern, innovative, and accessible image, balancing academic professionalism with a youthful and dynamic aesthetic that resonates with the target audience.

### Design Guidelines

| Aspect | Guideline |
|---|---|
| **General Style** | Modern minimalist with dynamic, eye-catching details |
| **Visual Tone** | Professional + Youthful. Inspiration: Platzi, Coursera, Duolingo |
| **Color Palette** | Suggested: Electric blue + white + green or orange accent (to confirm with client) |
| **Typography** | Modern sans-serif: Inter, Poppins or Nunito. Clear hierarchy for headings and body |
| **Iconography** | Modern line icons: Heroicons, Phosphor Icons or equivalent |
| **Photography** | High-quality photos of people studying on screen. Avoid generic stock images |
| **Animations** | Subtle scroll animations (fade-in, slide-up) for dynamism without performance impact |
| **Responsive Design** | 100% mobile-first: optimized for phone, tablet and desktop |

### Differentiating Design Elements

- Hero section with background video or looping silent animation
- Animated counters: number of students, courses, teaching hours
- Course cards with appealing hover effect
- Fixed navigation bar with glassmorphism effect or solid background on scroll
- Floating support button (WhatsApp or live chat)
- Teacher profile cards with photo, specialties, rating, and software badges
- Dark Mode toggle (optional but recommended)

---

## 6. Technical Requirements

### 6.1 Suggested Technology Stack

| Component | Technology / Tool |
|---|---|
| Frontend | React.js, Next.js or Astro (developer's choice) |
| Backend | Node.js + Express, Laravel (PHP) or Django (Python) |
| Database | MySQL, PostgreSQL or MongoDB |
| Authentication | JWT + Refresh Tokens + OAuth 2.0 (Google) |
| Real-time Chat | Socket.IO (Node.js) or Firebase Realtime DB |
| Payment Gateway | Stripe, PayPal + Mercado Pago |
| Calendar | FullCalendar.js or Calendly API |
| File Storage | Amazon S3, Cloudinary or Backblaze B2 |
| Admin Panel | Custom dashboard or Strapi / Sanity CMS |
| Email Service | SendGrid, Mailgun or Resend |
| Hosting | Vercel, DigitalOcean, AWS or Hostinger (to define) |
| SSL Certificate | Let's Encrypt or hosting-provided (MANDATORY) |

### 6.2 Performance & SEO Requirements

**Loading Speed:**
- Google PageSpeed score > 85 on mobile, > 90 on desktop
- Images served in WebP or AVIF format
- CDN for static assets

**Basic SEO** (included in scope):
- Configurable meta tags (title, description, og:tags) per page
- XML Sitemap and robots.txt
- SEO-friendly URLs and correct heading structure (H1, H2, H3)
- Structured data (Schema.org) for courses and services

**Accessibility:**
- Basic WCAG 2.1 Level AA compliance
- Alt text on all images
- Adequate color contrast for readability

---

## 7. Third-Party Integrations

| Integration | Details |
|---|---|
| Google Analytics 4 | Track visits, conversions and user behavior |
| Meta Pixel | Pixel tracking for Facebook/Instagram ad campaigns |
| Live Chat (optional) | Tawk.to, Crisp or Intercom for real-time support |
| Google Maps | Embedded in Contact page (if physical location applies) |
| Google Calendar | Sync teacher/student class schedules |
| YouTube / Vimeo | Embedded demo class or testimonial videos |

---

## 8. Content & Materials to be Provided by the Client

The client agrees to deliver the following assets to the development team before production begins:

**Brand Identity:**
- Logo in vector format (SVG or AI) or high-resolution PNG with transparent background
- Corporate color codes (HEX values)
- Website name and desired domain

**Written Content:**
- Texts for all pages: home, about us, courses, contact
- Detailed course descriptions: name, objectives, duration, price, level
- Teacher biographies, photos, certificates, and portfolio items (one per teacher)

**Multimedia:**
- Original photos (minimum 15-20 high-quality images)
- Videos (if any) in MP4 format or YouTube/Vimeo link

**Configuration:**
- Hosting and domain access credentials (or specify if developer will manage)
- Business email account for forms and notifications
- Payment gateway accounts (Stripe, PayPal, Mercado Pago)

---

## 9. Delivery Scope & Final Notes

### Important Notes for the Developer

**Project priorities:**
1. Client acquisition is the #1 objective: every page must have clear, visible CTAs.
2. Mobile experience is critical: the target audience primarily uses smartphones.
3. Visual trust must be immediate: clean design, visible testimonials, and payment security badges.

**Recommended development phases:**

- **Phase 1 (Core):** Public site + Student Login + Payment System + Booking Calendar
- **Phase 2 (Portals):** Full Student Portal + Full Teacher Portal + Chat System + Gallery
- **Phase 3 (Growth):** Blog/SEO, advanced analytics, subscription billing, mobile app (optional)

**Deliverables expected from developer:**
- Documented source code in a private repository (GitHub or GitLab)
- Basic admin panel usage guide
- Cross-browser testing: Chrome, Firefox, Safari and Edge
- Device testing: Android and iOS
- Post-launch support window: to be agreed (recommended: 30 days)

---

## 10. Signatures & Approval

| Role | Name & Signature |
|---|---|
| Client / Requester | __________________________________ |
| Web Designer | __________________________________ |
| Web Developer | __________________________________ |
| Approval Date | ______ / ______ / ____________ |

*By signing this document, all parties confirm that they have read, understood and agreed to the specifications described in this technical brief.*
