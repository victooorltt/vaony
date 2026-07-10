# Plan de Implementación — Vaony

**Plataforma de tutorías privadas online — Ciencias Exactas, Ingeniería y Matemáticas**

> Fuente de verdad: `Vaony_Technical_Specification.md`. Idioma de la aplicación: **inglés**. Este documento define arquitectura, sistema de diseño, modelo de datos, módulos y orden de ejecución antes de escribir la primera línea de código.

---

## 1. Visión del producto

Vaony es una plataforma de captación y gestión de tutorías 1-a-1 100% online. El objetivo #1 es la **adquisición de estudiantes** (lead generation): cada página pública debe empujar hacia el registro/reserva. Sobre esa capa pública se montan tres portales privados (Student, Teacher, Admin) con calendario de reservas, chat en tiempo real, pagos y gestión de materiales.

**Audiencia:** jóvenes de 18–30 (universitarios) y profesionales en activo. Mobile-first obligatorio.

---

## 2. Stack tecnológico (decisiones firmes)

| Capa | Tecnología | Justificación |
|---|---|---|
| Framework | **Next.js 15 (App Router) + TypeScript estricto** | Server Components para SEO extremo en páginas públicas; Client Components en portales |
| Estilos | **Tailwind CSS v4** | Tokens de diseño vía CSS variables + utilidades |
| Iconos | **Heroicons** (outline/solid) | Requerido por spec; línea moderna |
| Base de datos | **PostgreSQL + Prisma ORM** (SQLite en desarrollo local) | Relacional encaja con reservas/pagos; Prisma da tipos end-to-end |
| Autenticación | **JWT (access + refresh) con `jose`, cookies httpOnly** + placeholder Google OAuth 2.0 | Control total del RBAC; sin dependencia de SaaS |
| Chat en tiempo real | **Socket.IO** sobre servidor Node custom (`server.ts`) + persistencia en Postgres | Requerido por spec; fallback long-polling incluido |
| Calendario | **FullCalendar (React)** — vistas mes/semana | Requerido por spec |
| Pagos | Adaptador común con drivers **Stripe, PayPal, Mercado Pago** (endpoints y checkout listos, claves placeholder) | Los tres exigidos por spec |
| Storage de archivos | Abstracción `StorageProvider` → driver local en dev, interfaz lista para S3/Cloudinary | Materiales, certificados, adjuntos de chat |
| Email | Abstracción `MailProvider` → consola en dev, interfaz lista para Resend/SendGrid | Confirmaciones, recordatorios, notificaciones offline |
| Validación | **Zod** en todos los formularios y route handlers | Tipado compartido cliente/servidor |
| Fechas/zonas horarias | **date-fns + date-fns-tz**; todo se almacena en UTC, se renderiza en la TZ del usuario | Requerido por spec (§4.6) |

---

## 3. Sistema de diseño ("Vaony Design System")

### 3.1 Dirección estética — "The Coordinate Plane"

Vaony enseña ciencias exactas: el mundo visual del producto es el **plano cartesiano, el papel milimetrado y la anotación matemática**. En lugar de fotos de stock, la interfaz se sostiene sobre:

- **Grid de coordenadas sutil** como textura de fondo (CSS puro: `linear-gradient` repetido) en heros y secciones clave — el "papel milimetrado" de la marca.
- **Curvas de función trazadas en SVG** (una parábola/senoide animada con `stroke-dashoffset`) como elemento hero: la clase se "dibuja" delante del usuario.
- **El ángulo de la V del logo** (~60°) reutilizado como corte diagonal en separadores de sección, bordes de cards y clip-paths — motivo geométrico propio, no decoración genérica.
- **Anotaciones tipo pizarra técnica**: etiquetas en monospace (`f(x)`, `Δt`, `∑`) como eyebrows y microcopy de secciones, usadas solo donde aportan significado (ej. contador de horas = `∑ hours`).
- **Glassmorphism con disciplina**: solo en la navbar fija (con fondo sólido al hacer scroll) y en cards flotantes sobre el grid del hero. No en todas partes.

**Elemento firma:** el hero de la Home — un plano cartesiano vivo donde una curva se traza sola y los puntos de datos son las cards de cursos destacados, ancladas como "puntos plotteados" con sus coordenadas en mono. Todo CSS/SVG, cero imágenes.

### 3.2 Paleta (derivada de los SVG de marca)

| Token | Hex | Uso |
|---|---|---|
| `--vaony-blue` | `#2924FD` | Primario de marca (del logo), CTAs, links |
| `--vaony-deep` | `#060D90` | Extremo del gradiente de marca, hovers, fondos oscuros secundarios |
| `--vaony-ink` | `#000B36` | Navy tinta (texto del logotipo), fondo dark y texto sobre claro |
| `--vaony-paper` | `#F7F8FC` | Fondo claro frío (papel técnico, no crema) |
| `--vaony-amber` | `#FFB020` | Acento cálido (spec sugiere verde o naranja): ratings, highlights, badges |
| `--vaony-grid` | `rgba(41,36,253,0.07)` | Líneas del grid de coordenadas |

Gradiente de marca: `#2924FD → #060D90` (mismo del logo). Dark mode opcional en Fase 3 (los tokens ya lo permiten).

### 3.3 Tipografía

| Rol | Fuente | Notas |
|---|---|---|
| Display | **Space Grotesk** (600/700) | Carácter técnico-geométrico, tracking apretado en headlines |
| Cuerpo | **Inter** (400/500) | Legibilidad; sugerida por spec |
| Utilidad/datos | **JetBrains Mono** | Eyebrows, coordenadas, precios, contadores, notación matemática |

Escala: `clamp()` fluido — display 2.5–4.5rem, h2 1.75–2.5rem, body 1rem/1.6. Todas vía `next/font` (self-hosted, sin CDN externo).

### 3.4 Componentes UI base (`src/components/ui/`)

`Button` (primary/secondary/ghost/danger), `Input`, `Textarea`, `Select`, `Badge` (software tags), `Card`, `Avatar` (fallback: isotipo `vaony_solo_logo.svg`), `Modal`, `Tabs`, `Toast`, `Skeleton`, `EmptyState`, `Rating` (estrellas ámbar), `Tag`, `Table`, `Pagination`, `GridPattern` (el fondo milimetrado), `SectionDivider` (corte diagonal 60°), `AnimatedCounter`, `FunctionCurve` (SVG animado).

Animaciones: fade-in/slide-up al hacer scroll con `IntersectionObserver` (componente `Reveal`), respetando `prefers-reduced-motion`.

---

## 4. Estructura del proyecto

```
vaony/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts                  # datos demo: admin, teachers, students, cursos, bookings
├── public/
│   └── brand/ (vaony_solo_logo.svg, vaony_con_letra.svg, favicon)
├── server.ts                    # Node server: Next + Socket.IO
├── src/
│   ├── app/
│   │   ├── (public)/            # Server Components — SEO
│   │   │   ├── page.tsx                 # Home
│   │   │   ├── courses/ [+ [slug]/]     # Catálogo con filtros + detalle
│   │   │   ├── teachers/ [+ [id]/]      # Directorio + perfil público
│   │   │   ├── about/  ├── contact/  ├── gallery/
│   │   │   └── apply-teacher/           # Teacher application form
│   │   ├── (auth)/
│   │   │   ├── login/  ├── register/
│   │   │   ├── forgot-password/  └── reset-password/
│   │   ├── (student)/student/           # Client-heavy, protegido RBAC
│   │   │   ├── dashboard/ ├── courses/ ├── calendar/
│   │   │   ├── materials/ ├── payments/ ├── messages/ └── settings/
│   │   ├── (teacher)/teacher/
│   │   │   ├── dashboard/ ├── profile/ ├── schedule/
│   │   │   ├── students/ ├── resources/ ├── earnings/ ├── messages/ └── settings/
│   │   ├── (admin)/admin/
│   │   │   ├── dashboard/ ├── users/ ├── courses/ ├── payments/
│   │   │   ├── applications/ ├── gallery/ └── moderation/
│   │   ├── api/
│   │   │   ├── auth/ (login, register, refresh, logout, forgot, reset, google)
│   │   │   ├── courses/  ├── teachers/  ├── bookings/  ├── availability/
│   │   │   ├── payments/ (checkout, webhooks/{stripe,paypal,mercadopago})
│   │   │   ├── chat/ (conversations, messages, upload)
│   │   │   ├── materials/  ├── contact/  ├── applications/  └── admin/
│   │   ├── layout.tsx / globals.css / sitemap.ts / robots.ts
│   ├── components/
│   │   ├── ui/            # design system (§3.4)
│   │   ├── layout/        # Navbar, Footer, PortalShell, Sidebar
│   │   ├── marketing/     # Hero, FeaturedCourses, Counters, CTABanner, TeacherCard…
│   │   ├── calendar/      # BookingCalendar, AvailabilityEditor, SlotPicker
│   │   ├── chat/          # ChatWindow, MessageBubble, FileAttachment, ChatList
│   │   └── forms/         # ContactForm, EnrollmentForm, LoginForm…
│   ├── lib/
│   │   ├── auth/          # jwt.ts, session.ts, rbac.ts, passwords.ts
│   │   ├── db.ts          # cliente Prisma
│   │   ├── payments/      # provider.ts (interfaz) + stripe.ts, paypal.ts, mercadopago.ts
│   │   ├── storage/       # provider.ts + local.ts (S3-ready)
│   │   ├── mail/          # provider.ts + console.ts, templates/
│   │   ├── socket/        # servidor y cliente Socket.IO, eventos tipados
│   │   ├── validators/    # esquemas Zod compartidos
│   │   └── utils/         # timezone.ts, currency.ts, slugify.ts…
│   ├── types/             # tipos de dominio compartidos
│   ├── hooks/             # useSocket, useToast, useBookings…
│   └── middleware.ts      # protección de rutas por rol
└── .env.example
```

**Convención de renderizado:** `(public)` y `(auth)` → Server Components por defecto (SEO, metadata dinámica, Schema.org `Course`/`Person`); portales → shells cliente con data fetching vía route handlers.

---

## 5. Modelo de datos (Prisma)

Entidades y relaciones clave:

- **User** `(id, email, passwordHash, role: ADMIN|STUDENT|TEACHER, firstName, lastName, avatarUrl, timezone, status, createdAt)`
- **RefreshToken** `(token, userId, expiresAt, revokedAt)` — rotación de refresh tokens
- **TeacherProfile** `(userId 1-1, title, specialization, bio, languages[], rating cached, socialLinks json)`
  - **Credential** `(title, institution, fileUrl)` · **PortfolioItem** `(title, type, url/fileUrl)` · **SoftwareTag** `(name)` M-N
- **Category** `(name, slug)` → Basic Mathematics / Exact Sciences / Engineering & Specialties
- **Course** `(title, slug, description, categoryId, level, durationMinutes, price, currency, published)` — M-N con teachers (**CourseTeacher**)
- **Enrollment** `(studentId, courseId, teacherId, status, progress)`
- **AvailabilitySlot** `(teacherId, weekday, startTime, endTime)` — plantilla semanal recurrente
- **BlockedTime** `(teacherId, startsAt, endsAt, reason)` — vacaciones/bloqueos
- **Booking** `(studentId, teacherId, courseId, startsAt UTC, endsAt UTC, status: PENDING|CONFIRMED|CANCELLED|COMPLETED|RESCHEDULED, meetingUrl)`
- **Payment** `(userId, bookingId?, packageId?, provider: STRIPE|PAYPAL|MERCADOPAGO, providerRef, amount, currency, status, receiptUrl)`
- **SessionPackage** `(name, sessions: 1|5|10, price, discountPct)`
- **Review** `(bookingId 1-1, studentId, teacherId, ratingInt 1–5, comment)` → recalcula rating cacheado
- **Conversation** `(studentId, teacherId, unique pair)` · **Message** `(conversationId, senderId, body, fileUrl?, fileType?, sentAt, deliveredAt?, readAt?, flagged)` 
- **Material** `(uploaderId, courseId?, studentId?, title, fileUrl, fileType, sizeBytes)` — por curso o por estudiante
- **TeacherApplication** `(fullName, email, specialization, yearsExperience, bio, cvUrl, status)`
- **GalleryItem** `(title, category, mediaUrl, type: IMAGE|VIDEO|PDF, published)`
- **ContactMessage** `(name, email, phone?, subject, message, honeypotPassed)`
- **Notification** `(userId, type, payload json, readAt?)` — badge in-app

Reglas de negocio críticas: un chat solo existe tras un booking pagado (spec §4.7); los slots reservables = plantilla semanal − bloqueos − bookings existentes, calculados en UTC y proyectados a la TZ del cliente.

---

## 6. Autenticación y RBAC

1. **Registro** (student): Zod + bcrypt, email de bienvenida. Teachers entran solo vía aprobación admin de `TeacherApplication`.
2. **Login**: access token JWT (15 min, cookie httpOnly `vaony_at`) + refresh token (7 días, cookie httpOnly `vaony_rt`, rotación y revocación en DB).
3. **Google OAuth 2.0**: endpoint `/api/auth/google` + callback implementados con envs placeholder (`GOOGLE_CLIENT_ID/SECRET`) — flujo completo, activable con solo poner claves.
4. **Recuperación de contraseña**: token de un solo uso con expiración 1 h, email con enlace.
5. **`middleware.ts`**: verifica JWT con `jose` (edge-safe) y aplica mapa ruta→rol: `/student/** → STUDENT`, `/teacher/** → TEACHER`, `/admin/** → ADMIN`; sin sesión → redirect a `/login?next=…`; rol equivocado → 403 page.
6. **Auto-logout por inactividad**: hook cliente que cierra sesión tras 30 min sin actividad + expiración corta del access token en servidor.
7. **RBAC en API**: helper `requireRole(request, [...roles])` en cada route handler — nunca se confía solo en el middleware.

---

## 7. Módulos funcionales (qué se construye en cada uno)

### 7.1 Sitio público
- **Home**: hero "Coordinate Plane" con curva animada + CTA doble ("Book your first class" / "Explore courses"), contadores animados (`∑ students`, `∑ hours`, `∑ courses`), cursos destacados, franja de beneficios, testimonios (placeholder editable), CTA banner final. Botón flotante de WhatsApp.
- **Courses**: catálogo con filtros por categoría (server-side via searchParams → SEO), cards con hover, precio, duración, nivel y botón "Enroll"; página de detalle con Schema.org `Course` y teachers vinculados.
- **Teachers/About**: misión-visión-valores + directorio de profesores (cards con avatar, especialidades, rating, software badges); perfil público completo por profesor (bio, credenciales, portfolio, idiomas, reviews) con Schema.org `Person`.
- **Gallery**: grid con lightbox, filtros por categoría, lazy loading; placeholders geométricos CSS hasta que el cliente entregue multimedia.
- **Contact**: formulario validado (Zod + honeypot anti-spam), auto-reply + notificación admin, mapa/redes.
- **Apply as teacher**: formulario con subida de CV (PDF).
- SEO: metadata por página, `sitemap.ts`, `robots.ts`, OG tags, headings correctos.

### 7.2 Portal del estudiante
Dashboard (próximas clases, cursos, pagos pendientes, botón "Join class"), lista de cursos con progreso, calendario de reservas (FullCalendar: ver slots libres del teacher y reservar), materiales descargables, historial de pagos con recibo, chat, envío de review post-sesión, ajustes de perfil (avatar, TZ, contraseña).

### 7.3 Portal del profesor
Dashboard (clases próximas, solicitudes nuevas, mensajes sin leer, resumen de ganancias), editor de perfil público (foto, bio, credenciales con upload, portfolio, software tags, idiomas, links), gestión de agenda (plantilla semanal de disponibilidad + bloqueos + cancelar/reprogramar con notificación automática), listado de estudiantes con historial de sesiones y notas, subida de recursos (PDF/DOCX/XLSX/JPG/PNG/MP4/ZIP) por curso o por estudiante, panel de ganancias e historial de pagos, chat.

### 7.4 Portal de administración
Dashboard con métricas (revenue, bookings, usuarios), CRUD de usuarios y cursos/categorías, historial completo de transacciones y reporte de ingresos, aprobación de solicitudes de teachers, gestión de galería, moderación de chat (ver/flag/borrar mensajes), bandeja de mensajes de contacto.

### 7.5 Calendario y reservas
- Motor de disponibilidad: `getAvailableSlots(teacherId, range, studentTz)` en servidor (única fuente de verdad).
- FullCalendar vista mes/semana; selector de TZ visible; confirmación de reserva → email + notificación.
- Recordatorios 24 h y 1 h: job programado (cron en `server.ts` con `node-cron`) que consulta bookings próximos.
- Estructura preparada para sync con Google Calendar (Fase 3).

### 7.6 Chat en tiempo real
- Socket.IO en `server.ts`; handshake autenticado con el JWT de la cookie; salas por `conversation:{id}`.
- Eventos tipados: `message:send/new/delivered/read`, `typing`, `presence`.
- Persistencia en DB antes de emitir; historial paginado por cursor.
- Adjuntos ≤10 MB (PDF, imágenes, DOCX, XLSX) vía endpoint de upload → StorageProvider.
- Read receipts (enviado/entregado/leído), emojis (picker ligero), badge de no leídos, email si el receptor está offline.
- Guard: la conversación solo se crea cuando existe un booking pagado entre las partes.

### 7.7 Pagos
- Interfaz `PaymentProvider { createCheckout, verifyWebhook, refund }` con tres drivers.
- **Stripe**: Checkout Session + webhook `checkout.session.completed` (funcional con claves de test).
- **PayPal** y **Mercado Pago**: endpoints, flujo de checkout y webhooks estructurados con claves placeholder.
- Pago por sesión única y packs (5/10 sesiones con descuento); confirmación → email con recibo descargable + activación de booking/paquete.
- Página `/checkout` con selección de método y resumen; páginas success/cancel.

---

## 8. Fases de ejecución (orden de construcción)

### Fase 0 — Fundaciones
1. Scaffolding Next.js 15 + TS estricto + Tailwind v4 + ESLint/Prettier.
2. Tokens del design system en `globals.css`, fuentes con `next/font`, componentes UI base.
3. Prisma schema completo + migración + `seed.ts` con datos demo realistas (en inglés).
4. Abstracciones: storage, mail, validadores Zod base. `.env.example` documentado.

### Fase 1 — Auth + Sitio público (Core)
5. Sistema de auth completo (§6) + middleware RBAC + páginas de auth con branding (`vaony_con_letra.svg`).
6. Layout público (Navbar glass, Footer), Home completa con hero firma, Courses + detalle, Teachers/About + perfiles públicos, Contact, Gallery, Apply-teacher.
7. SEO técnico: metadata, sitemap, robots, Schema.org.

### Fase 2 — Portales + Calendario + Pagos
8. Shell de portales (sidebar responsive, header con notificaciones, guards).
9. Motor de disponibilidad + BookingCalendar (FullCalendar) + flujo de reserva con TZ.
10. Checkout multi-proveedor + webhooks + historial de pagos + recibos.
11. Portal estudiante completo → Portal profesor completo → Portal admin.

### Fase 3 — Tiempo real + pulido
12. `server.ts` con Socket.IO + chat completo con adjuntos y receipts.
13. Notificaciones (in-app + email) y recordatorios cron 24 h/1 h.
14. Reviews y ratings con recálculo de promedio.
15. QA final: responsive audit, accesibilidad AA (focus visible, contraste, alt), `prefers-reduced-motion`, estados vacíos y de error en todos los flujos, cross-browser.

Cada fase termina compilando (`tsc --noEmit` + `next build`) y con el seed funcionando de punta a punta.

---

## 9. Calidad, seguridad y rendimiento

- **TypeScript estricto** sin `any`; tipos de dominio compartidos entre API y UI.
- **Seguridad**: bcrypt (cost 12), cookies `httpOnly/secure/sameSite=lax`, validación Zod en todo input, rate limiting en auth y contacto, honeypot anti-spam, sanitización de nombres de archivo, verificación de firma en webhooks, mensajes accesibles solo a sus dos partes.
- **Rendimiento**: Server Components + streaming en público, `next/image`, code-splitting por portal, lazy load de FullCalendar y chat, CSS puro para el arte del hero (cero peso de imágenes). Objetivo PageSpeed >85 móvil / >90 desktop.
- **Accesibilidad**: WCAG 2.1 AA básico — contraste verificado de la paleta, navegación por teclado, `aria` en modales/tabs/toasts.

---

## 10. Variables de entorno (`.env.example`)

```
DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET, NEXT_PUBLIC_APP_URL,
GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET,
STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET,
MERCADOPAGO_ACCESS_TOKEN,
STORAGE_DRIVER=local, MAIL_DRIVER=console,
WHATSAPP_NUMBER
```

---

## 11. Próximo paso

Con este plan aprobado, se ejecuta la **Fase 0** (scaffolding + design system + schema + seed) y se continúa fase a fase hasta el alcance completo.
