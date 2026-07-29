import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  console.log("Seeding Vaony demo data…");
  const password = await bcrypt.hash("Password123!", 12);

  // ---- Categories ----
  const [basicMath, exactSciences, engineering] = await Promise.all([
    db.category.upsert({
      where: { slug: "basic-mathematics" },
      update: { name: "Matemáticas Básicas" },
      create: { name: "Matemáticas Básicas", slug: "basic-mathematics", order: 1 },
    }),
    db.category.upsert({
      where: { slug: "exact-sciences" },
      update: { name: "Ciencias Exactas" },
      create: { name: "Ciencias Exactas", slug: "exact-sciences", order: 2 },
    }),
    db.category.upsert({
      where: { slug: "engineering-specialties" },
      update: { name: "Ingeniería y Especialidades" },
      create: { name: "Ingeniería y Especialidades", slug: "engineering-specialties", order: 3 },
    }),
  ]);

  // ---- Users ----
  const admin = await db.user.upsert({
    where: { email: "admin@vaony.com" },
    update: {},
    create: {
      email: "admin@vaony.com",
      passwordHash: password,
      role: "ADMIN",
      firstName: "Victoria",
      lastName: "Admin",
      timezone: "America/Mexico_City",
    },
  });

  const teachersData = [
    {
      email: "elena.rios@vaony.com",
      firstName: "Elena",
      lastName: "Ríos",
      title: "M.Sc. Ingeniería Mecánica",
      specialization: "Mecanizado CNC y manufactura",
      bio: "Ingeniera de manufactura con 9 años programando tornos y centros de mecanizado CNC para la industria aeroespacial. Enseño código G desde cero hasta piezas listas para producción.",
      languages: "Español, Inglés",
      tags: ["Mastercam", "Fusion 360", "SolidWorks", "G-code", "Fanuc"],
      featured: true,
      avatarUrl: "/teacher_female.jpg",
      yearsExperience: 9,
      youtubeUrl: "https://www.youtube.com/watch?v=Kd-Y0hFV3Yg",
      extraSubjects: "Lectura de planos, GD&T, Metrología dimensional, Optimización de herramentales",
      credentials: [
        { title: "Mastercam Certified Professional", institution: "Mastercam University" },
        { title: "Certificación en Metrología Dimensional", institution: "CENAM" },
        { title: "M.Sc. Ingeniería Mecánica", institution: "Universidad Politécnica de Madrid" },
      ],
      portfolio: [
        { title: "Programa CNC para álabes de turbina", type: "PROJECT", url: "https://vaony.com/portfolio/elena-turbina" },
        { title: "Guía de ciclos fijos Fanuc", type: "DOCUMENT", url: "https://vaony.com/portfolio/elena-fanuc" },
      ],
    },
    {
      email: "daniel.mora@vaony.com",
      firstName: "Daniel",
      lastName: "Mora",
      title: "Ph.D. Matemáticas Aplicadas",
      specialization: "Cálculo y álgebra lineal",
      bio: "Profesor universitario e investigador. He ayudado a más de 300 estudiantes a aprobar Cálculo I–III reconstruyendo primero sus bases de álgebra.",
      languages: "Español, Inglés",
      tags: ["MATLAB", "Python", "LaTeX", "GeoGebra"],
      featured: true,
      avatarUrl: "/teacher_male.jpg",
      yearsExperience: 7,
      youtubeUrl: "https://www.youtube.com/watch?v=WUvTyaaNkzM",
      extraSubjects: "Ecuaciones diferenciales, Probabilidad y estadística, Métodos numéricos, Preparación de exámenes de admisión",
      credentials: [
        { title: "Ph.D. Matemáticas Aplicadas", institution: "Universidad de Buenos Aires" },
        { title: "Certificación docente en educación superior", institution: "UBA — Facultad de Ciencias Exactas" },
      ],
      portfolio: [
        { title: "Curso abierto: Límites y continuidad", type: "COURSE", url: "https://vaony.com/portfolio/daniel-limites" },
        { title: "Cuadernillo de 200 ejercicios resueltos", type: "DOCUMENT", url: "https://vaony.com/portfolio/daniel-ejercicios" },
      ],
    },
    {
      email: "sofia.leal@vaony.com",
      firstName: "Sofía",
      lastName: "Leal",
      title: "Ing. en Ciencias de la Computación",
      specialization: "Programación y estructuras de datos",
      bio: "Ingeniera de software senior. Enseño Python y C++ como se usan en bases de código reales: con proyectos, revisión de código y práctica de depuración.",
      languages: "Español, Inglés",
      tags: ["Python", "C++", "Git", "VS Code", "SQL"],
      featured: true,
      avatarUrl: "/teacher_sofia.jpg",
      yearsExperience: 8,
      youtubeUrl: "https://www.youtube.com/watch?v=rfscVS0vtbw",
      extraSubjects: "Git y control de versiones, Bases de datos SQL, Entrevistas técnicas, Testing automatizado",
      credentials: [
        { title: "AWS Certified Developer – Associate", institution: "Amazon Web Services" },
        { title: "Ing. en Ciencias de la Computación", institution: "Universidad de Chile" },
      ],
      portfolio: [
        { title: "API de reservas en Python (open source)", type: "PROJECT", url: "https://vaony.com/portfolio/sofia-api" },
        { title: "Taller: estructuras de datos en C++", type: "COURSE", url: "https://vaony.com/portfolio/sofia-taller" },
      ],
    },
    {
      email: "marco.vega@vaony.com",
      firstName: "Marco",
      lastName: "Vega",
      title: "M.Sc. Dinámica de Fluidos",
      specialization: "Mecánica de fluidos y termodinámica",
      bio: "Especialista en CFD en el sector energético. De Bernoulli a Navier-Stokes, hago que los fenómenos de transporte se entiendan con simulaciones que puedes correr tú mismo.",
      languages: "Español, Inglés",
      tags: ["ANSYS Fluent", "OpenFOAM", "MATLAB", "Excel"],
      featured: false,
      avatarUrl: "/teacher_marco.jpg",
      yearsExperience: 6,
      youtubeUrl: "https://www.youtube.com/watch?v=q1PGSFmZ5-M",
      extraSubjects: "Transferencia de calor, Turbomáquinas, Simulación CFD aplicada, Diseño de redes de tuberías",
      credentials: [
        { title: "ANSYS Fluent Advanced Training", institution: "ANSYS Inc." },
        { title: "M.Sc. Dinámica de Fluidos", institution: "Universidad Nacional de Colombia" },
      ],
      portfolio: [
        { title: "Simulación CFD de intercambiador de calor", type: "PROJECT", url: "https://vaony.com/portfolio/marco-cfd" },
        { title: "Caso práctico: pérdidas de carga en tuberías", type: "DOCUMENT", url: "https://vaony.com/portfolio/marco-tuberias" },
      ],
    },
  ];

  const teacherProfiles: { userId: string; profileId: string }[] = [];
  for (const t of teachersData) {
    const user = await db.user.upsert({
      where: { email: t.email },
      update: { avatarUrl: t.avatarUrl },
      create: {
        email: t.email,
        passwordHash: password,
        role: "TEACHER",
        firstName: t.firstName,
        lastName: t.lastName,
        avatarUrl: t.avatarUrl,
        timezone: "America/Mexico_City",
      },
    });
    const profileFields = {
      title: t.title,
      specialization: t.specialization,
      bio: t.bio,
      languages: t.languages,
      featured: t.featured,
      youtubeUrl: t.youtubeUrl,
      extraSubjects: t.extraSubjects,
      yearsExperience: t.yearsExperience,
    };
    const profile = await db.teacherProfile.upsert({
      where: { userId: user.id },
      update: profileFields,
      create: {
        userId: user.id,
        ...profileFields,
        ratingAvg: 4.6 + Math.random() * 0.4,
        ratingCount: 12 + Math.floor(Math.random() * 40),
      },
    });

    // Credentials & portfolio — only seeded when the profile has none yet
    if ((await db.credential.count({ where: { profileId: profile.id } })) === 0) {
      await db.credential.createMany({
        data: t.credentials.map((c) => ({ ...c, profileId: profile.id })),
      });
    }
    if ((await db.portfolioItem.count({ where: { profileId: profile.id } })) === 0) {
      await db.portfolioItem.createMany({
        data: t.portfolio.map((p) => ({ ...p, profileId: profile.id })),
      });
    }
    for (const tagName of t.tags) {
      const tag = await db.softwareTag.upsert({
        where: { name: tagName },
        update: {},
        create: { name: tagName },
      });
      await db.teacherSoftwareTag.upsert({
        where: { profileId_tagId: { profileId: profile.id, tagId: tag.id } },
        update: {},
        create: { profileId: profile.id, tagId: tag.id },
      });
    }
    // Weekly availability: Mon–Fri 16:00–20:00
    const existing = await db.availabilitySlot.count({ where: { teacherId: user.id } });
    if (existing === 0) {
      for (const weekday of [1, 2, 3, 4, 5]) {
        await db.availabilitySlot.create({
          data: { teacherId: user.id, weekday, startTime: "16:00", endTime: "20:00" },
        });
      }
    }
    teacherProfiles.push({ userId: user.id, profileId: profile.id });
  }

  const student = await db.user.upsert({
    where: { email: "student@vaony.com" },
    update: {},
    create: {
      email: "student@vaony.com",
      passwordHash: password,
      role: "STUDENT",
      firstName: "Alex",
      lastName: "Torres",
      timezone: "America/Mexico_City",
    },
  });

  // ---- Courses ----
  const coursesData = [
    { title: "Fundamentos de Álgebra", slug: "algebra-foundations", cat: basicMath.id, level: "BEGINNER", price: 18, teacher: 1, featured: true, short: "Ecuaciones, factorización y funciones: la base sobre la que se apoya todo lo demás.", desc: "Un programa estructurado uno a uno que cubre ecuaciones lineales, sistemas, polinomios, factorización y una introducción a las funciones. Cada sesión termina con una tanda de ejercicios que se corrige en vivo en la clase siguiente." },
    { title: "Aritmética y Pre-Álgebra", slug: "arithmetic-pre-algebra", cat: basicMath.id, level: "BEGINNER", price: 15, teacher: 1, featured: false, short: "Fracciones, razones, porcentajes y números negativos sin miedo.", desc: "Para estudiantes que necesitan reconstruir los fundamentos: sentido numérico, fracciones, decimales, proporciones y jerarquía de operaciones, con modelos visuales y ejemplos reales." },
    { title: "Geometría y Trigonometría", slug: "geometry-trigonometry", cat: basicMath.id, level: "INTERMEDIATE", price: 18, teacher: 1, featured: false, short: "Del triángulo a la circunferencia unitaria, con demostraciones que sí se siguen.", desc: "Geometría euclidiana, semejanza, circunferencias y un recorrido completo de trigonometría: identidades, ecuaciones y aplicaciones a vectores y problemas de física." },
    { title: "Cálculo I–III", slug: "calculus", cat: exactSciences.id, level: "INTERMEDIATE", price: 22, teacher: 1, featured: true, short: "Límites, derivadas, integrales y varias variables, enfocado al examen.", desc: "Cálculo diferencial e integral hasta varias variables, con la intuición gráfica primero y el formalismo después. Incluye práctica con exámenes reales de universidades." },
    { title: "Física Universitaria", slug: "university-physics", cat: exactSciences.id, level: "INTERMEDIATE", price: 22, teacher: 3, featured: false, short: "Mecánica, ondas y electromagnetismo con un método de resolución.", desc: "Mecánica newtoniana, energía, momento, oscilaciones, ondas y electromagnetismo. Cada tema se ancla a un método de resolución de problemas que puedes reutilizar en cualquier examen." },
    { title: "Química General", slug: "general-chemistry", cat: exactSciences.id, level: "BEGINNER", price: 20, teacher: 3, featured: false, short: "Estequiometría, enlaces y equilibrio, de forma sistemática.", desc: "Estructura atómica, tabla periódica, estequiometría, termoquímica y equilibrio químico, con una hoja de ruta sesión a sesión ajustada a tu plan de estudios." },
    { title: "Programación en Python", slug: "python-programming", cat: engineering.id, level: "BEGINNER", price: 25, teacher: 2, featured: true, short: "Del primer script a proyectos reales: datos, archivos, APIs y POO.", desc: "Un recorrido basado en proyectos: sintaxis y control de flujo, estructuras de datos, manejo de archivos, APIs, programación orientada a objetos y depuración profesional. Terminas con un proyecto para tu portafolio." },
    { title: "C++ y Estructuras de Datos", slug: "cpp-data-structures", cat: engineering.id, level: "INTERMEDIATE", price: 28, teacher: 2, featured: false, short: "Punteros, memoria y las estructuras de datos clásicas, bien hechas.", desc: "Modelo de memoria, punteros y referencias, clases, plantillas y las estructuras de datos fundamentales (listas, árboles, tablas hash, grafos) con análisis de complejidad para entrevistas técnicas y para la carrera." },
    { title: "Programación CNC (código G)", slug: "cnc-programming", cat: engineering.id, level: "INTERMEDIATE", price: 30, teacher: 0, featured: true, short: "Programa tornos y centros de mecanizado, del plano a la pieza terminada.", desc: "Lectura de planos, ceros de trabajo, compensación de herramienta, ciclos fijos y programas completos en código G para controles tipo Fanuc. Incluye flujo CAM con Fusion 360 y Mastercam." },
    { title: "Mecánica de Fluidos", slug: "fluid-mechanics", cat: engineering.id, level: "ADVANCED", price: 28, teacher: 3, featured: true, short: "De la hidrostática a Navier-Stokes con casos de ingeniería resueltos.", desc: "Propiedades de los fluidos, hidrostática, análisis por volumen de control, Bernoulli, análisis dimensional, flujo en tuberías e introducción al CFD. Construido alrededor de casos de ingeniería resueltos." },
    { title: "MATLAB para Ingenieros", slug: "matlab-for-engineers", cat: engineering.id, level: "BEGINNER", price: 24, teacher: 3, featured: false, short: "Scripts, gráficas, matrices y métodos numéricos para la carrera.", desc: "Entorno de MATLAB, operaciones vectorizadas, gráficas, scripts frente a funciones y métodos numéricos aplicados: búsqueda de raíces, integración y ecuaciones diferenciales, ajustados a tus materias de ingeniería." },
    { title: "SolidWorks CAD", slug: "solidworks-cad", cat: engineering.id, level: "BEGINNER", price: 26, teacher: 0, featured: false, short: "Piezas, ensambles y planos pensando siempre en la fabricación.", desc: "Croquizado, modelado de piezas por operaciones, ensambles y planos de producción con fundamentos de GD&T, impartido por una ingeniera de manufactura que mecaniza lo que diseña." },
  ];

  for (const c of coursesData) {
    const course = await db.course.upsert({
      where: { slug: c.slug },
      update: {
        title: c.title,
        shortDesc: c.short,
        description: c.desc,
      },
      create: {
        title: c.title,
        slug: c.slug,
        shortDesc: c.short,
        description: c.desc,
        categoryId: c.cat,
        level: c.level,
        price: c.price,
        currency: "USD",
        featured: c.featured,
        durationMinutes: 60,
      },
    });
    const tp = teacherProfiles[c.teacher];
    if (tp) {
      await db.courseTeacher.upsert({
        where: { courseId_profileId: { courseId: course.id, profileId: tp.profileId } },
        update: {},
        create: { courseId: course.id, profileId: tp.profileId },
      });
    }
  }

  // ---- Demo reviews (need a completed booking each) ----
  const reviewAuthors = [
    { email: "lucia.fernandez@example.com", firstName: "Lucía", lastName: "Fernández" },
    { email: "mateo.silva@example.com", firstName: "Mateo", lastName: "Silva" },
    { email: "carla.benitez@example.com", firstName: "Carla", lastName: "Benítez" },
    { email: "andres.pineda@example.com", firstName: "Andrés", lastName: "Pineda" },
    { email: "valeria.ortiz@example.com", firstName: "Valeria", lastName: "Ortiz" },
    { email: "tomas.aguirre@example.com", firstName: "Tomás", lastName: "Aguirre" },
    { email: "noelia.campos@example.com", firstName: "Noelia", lastName: "Campos" },
    { email: "javier.rueda@example.com", firstName: "Javier", lastName: "Rueda" },
  ];
  const reviewStudents = [];
  for (const s of reviewAuthors) {
    reviewStudents.push(
      await db.user.upsert({
        where: { email: s.email },
        update: {},
        create: {
          email: s.email,
          passwordHash: password,
          role: "STUDENT",
          firstName: s.firstName,
          lastName: s.lastName,
          timezone: "America/Mexico_City",
        },
      })
    );
  }

  const reviewsByTeacher: { rating: number; comment: string }[][] = [
    [
      { rating: 5, comment: "Pasé de no entender el código G a programar mi primera pieza completa en seis clases. Elena revisa cada línea contigo." },
      { rating: 5, comment: "Explica el porqué de cada ciclo fijo, no solo la sintaxis. Se nota la experiencia en planta." },
      { rating: 4, comment: "Muy buenas clases y material propio. Solo me faltó más tiempo para practicar entre sesiones." },
      { rating: 5, comment: "Trabajamos sobre los planos reales de mi taller. Salí con los programas listos para el torno." },
      { rating: 5, comment: "Me preparó la certificación de Mastercam en dos meses. Aprobé a la primera." },
      { rating: 5, comment: "Aclara dudas incluso entre clases. Se toma en serio que aprendas." },
      { rating: 4, comment: "Nivel muy alto. Si vienes sin base de lectura de planos, conviene reforzarla antes." },
      { rating: 5, comment: "La mejor inversión de mi año. Ahora programo yo lo que antes mandaba fuera." },
    ],
    [
      { rating: 5, comment: "Aprobé Cálculo II después de dos intentos. Daniel detectó que mi problema real era álgebra y lo trabajamos primero." },
      { rating: 5, comment: "Paciencia infinita y ejercicios calcados a los de mi examen. Cien por ciento recomendado." },
      { rating: 5, comment: "Las clases están muy bien estructuradas: teoría corta, muchos ejercicios y corrección en vivo." },
      { rating: 5, comment: "Por fin entiendo de dónde salen las fórmulas en lugar de memorizarlas." },
      { rating: 4, comment: "Muy buen profesor. El ritmo es exigente, pero avisa desde el principio." },
      { rating: 5, comment: "Preparé el examen de admisión con él y entré. Explica con una claridad enorme." },
      { rating: 5, comment: "Me mandó un cuadernillo propio con 200 ejercicios resueltos. Un lujo." },
      { rating: 4, comment: "Clases muy útiles. Me habría gustado alguna sesión extra de repaso antes del final." },
    ],
    [
      { rating: 5, comment: "Sofía me enseñó a depurar de verdad, no a adivinar. Cambió mi forma de programar." },
      { rating: 4, comment: "Muy buen nivel técnico. Las revisiones de código son lo mejor de la clase." },
      { rating: 5, comment: "Terminé el curso con un proyecto real en mi portafolio y conseguí prácticas gracias a eso." },
      { rating: 5, comment: "Enseña como se trabaja en una empresa: Git, tests y revisión. Muy distinto a la facultad." },
      { rating: 5, comment: "Preparé entrevistas técnicas con ella y pasé tres de cuatro. Sabe exactamente qué preguntan." },
      { rating: 4, comment: "Explica muy bien. Las sesiones de C++ requieren repasar bastante por tu cuenta." },
      { rating: 5, comment: "Me desatascó con punteros y memoria en dos clases. Llevaba meses perdido." },
      { rating: 5, comment: "Feedback concreto y accionable en cada entrega. Se nota que revisa código a diario." },
    ],
    [
      { rating: 5, comment: "Marco hace que Navier-Stokes tenga sentido físico. Las simulaciones ayudan muchísimo." },
      { rating: 5, comment: "Resolvimos casos idénticos a los de mi trabajo. Aplicable desde la primera clase." },
      { rating: 4, comment: "Clases exigentes pero muy claras. Conviene llegar con los apuntes leídos." },
      { rating: 5, comment: "Me enseñó a montar la simulación en Fluent paso a paso, sin recetas mágicas." },
      { rating: 5, comment: "Aprobé Fenómenos de Transporte gracias a sus esquemas de volumen de control." },
      { rating: 5, comment: "Responde rápido y prepara el material a medida de lo que necesitas." },
      { rating: 4, comment: "Buenísimo en la parte teórica. La práctica de CFD pide un equipo potente." },
      { rating: 5, comment: "Dimensioné la red de tuberías de mi planta con lo que vimos en clase." },
    ],
  ];

  for (let i = 0; i < teacherProfiles.length; i++) {
    const tp = teacherProfiles[i];
    const set = reviewsByTeacher[i];
    if (!tp || !set) continue;
    // Top up to the target number of reviews, so re-running the seed is safe
    const existingReviews = await db.review.count({ where: { teacherId: tp.userId } });

    const link = await db.courseTeacher.findFirst({ where: { profileId: tp.profileId } });
    if (!link) continue;

    for (let j = existingReviews; j < set.length; j++) {
      const author = reviewStudents[j % reviewStudents.length];
      const entry = set[j];
      if (!author || !entry) continue;
      const startsAt = new Date();
      startsAt.setDate(startsAt.getDate() - (7 * (j + 1)));
      startsAt.setHours(18, 0, 0, 0);
      const booking = await db.booking.create({
        data: {
          studentId: author.id,
          teacherId: tp.userId,
          courseId: link.courseId,
          startsAt,
          endsAt: new Date(startsAt.getTime() + 60 * 60 * 1000),
          status: "COMPLETED",
        },
      });
      await db.review.create({
        data: {
          bookingId: booking.id,
          studentId: author.id,
          teacherId: tp.userId,
          rating: entry.rating,
          comment: entry.comment,
          createdAt: new Date(startsAt.getTime() + 2 * 60 * 60 * 1000),
        },
      });
    }
  }

  // Keep the headline rating in sync with the reviews actually stored, so the
  // profile's rating breakdown always adds up to the count shown next to it.
  for (const tp of teacherProfiles) {
    const agg = await db.review.aggregate({
      where: { teacherId: tp.userId },
      _avg: { rating: true },
      _count: { rating: true },
    });
    await db.teacherProfile.update({
      where: { userId: tp.userId },
      data: {
        ratingAvg: agg._avg.rating ?? 0,
        ratingCount: agg._count.rating,
      },
    });
  }

  // ---- Session packages ----
  const packages = [
    { name: "Single session", sessions: 1, price: 25, discountPct: 0 },
    { name: "5-session pack", sessions: 5, price: 112, discountPct: 10 },
    { name: "10-session pack", sessions: 10, price: 200, discountPct: 20 },
  ];
  for (const p of packages) {
    const exists = await db.sessionPackage.findFirst({ where: { name: p.name } });
    if (!exists) await db.sessionPackage.create({ data: p });
  }

  // ---- Demo enrollment + booking + conversation for the demo student ----
  const pythonCourse = await db.course.findUnique({ where: { slug: "python-programming" } });
  const sofia = teacherProfiles[2];
  if (pythonCourse && sofia) {
    await db.enrollment.upsert({
      where: { studentId_courseId: { studentId: student.id, courseId: pythonCourse.id } },
      update: {},
      create: {
        studentId: student.id,
        courseId: pythonCourse.id,
        teacherId: sofia.userId,
        progress: 30,
      },
    });

    const existingBooking = await db.booking.findFirst({
      where: { studentId: student.id, courseId: pythonCourse.id },
    });
    if (!existingBooking) {
      const startsAt = new Date();
      startsAt.setDate(startsAt.getDate() + 2);
      startsAt.setHours(17, 0, 0, 0);
      const endsAt = new Date(startsAt.getTime() + 60 * 60 * 1000);
      const booking = await db.booking.create({
        data: {
          studentId: student.id,
          teacherId: sofia.userId,
          courseId: pythonCourse.id,
          startsAt,
          endsAt,
          status: "CONFIRMED",
          meetingUrl: "https://meet.example.com/vaony-demo",
        },
      });
      await db.payment.create({
        data: {
          userId: student.id,
          bookingId: booking.id,
          provider: "STRIPE",
          providerRef: "demo_session_001",
          amount: 25,
          currency: "USD",
          status: "PAID",
        },
      });
      const convo = await db.conversation.create({
        data: { studentId: student.id, teacherId: sofia.userId },
      });
      await db.message.createMany({
        data: [
          {
            conversationId: convo.id,
            senderId: sofia.userId,
            body: "Hi Alex! Before our next session, try finishing exercise 3 from the file I sent. Bring your questions 🙂",
            deliveredAt: new Date(),
            readAt: new Date(),
          },
          {
            conversationId: convo.id,
            senderId: student.id,
            body: "Will do! I got stuck on the loop part, I'll show you what I tried.",
            deliveredAt: new Date(),
          },
        ],
      });
    }
  }

  // ---- Gallery placeholders ----
  if ((await db.galleryItem.count()) === 0) {
    await db.galleryItem.createMany({
      data: [
        { title: "Solving limits step by step", category: "Mathematics", mediaUrl: "placeholder:math", type: "IMAGE" },
        { title: "CNC toolpath simulation", category: "CNC", mediaUrl: "placeholder:cnc", type: "IMAGE" },
        { title: "Python debugging session", category: "Programming", mediaUrl: "placeholder:code", type: "IMAGE" },
        { title: "Pipe flow worked example", category: "Engineering", mediaUrl: "placeholder:fluids", type: "IMAGE" },
        { title: "Trigonometry unit circle drill", category: "Mathematics", mediaUrl: "placeholder:math2", type: "IMAGE" },
        { title: "Student result: Calculus II passed", category: "Results", mediaUrl: "placeholder:result", type: "IMAGE" },
      ],
    });
  }

  console.log("Seed complete.");
  console.log("  admin@vaony.com / Password123!");
  console.log("  student@vaony.com / Password123!");
  console.log("  elena.rios@vaony.com (teacher) / Password123!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
