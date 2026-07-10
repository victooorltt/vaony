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
      update: {},
      create: { name: "Basic Mathematics", slug: "basic-mathematics", order: 1 },
    }),
    db.category.upsert({
      where: { slug: "exact-sciences" },
      update: {},
      create: { name: "Exact Sciences", slug: "exact-sciences", order: 2 },
    }),
    db.category.upsert({
      where: { slug: "engineering-specialties" },
      update: {},
      create: { name: "Engineering & Specialties", slug: "engineering-specialties", order: 3 },
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
      title: "M.Sc. Mechanical Engineering",
      specialization: "CNC Machining & Manufacturing",
      bio: "Manufacturing engineer with 9 years programming CNC lathes and machining centers for the aerospace industry. I teach G-code from zero to production-ready parts.",
      languages: "Spanish, English",
      tags: ["Mastercam", "Fusion 360", "SolidWorks", "G-code", "Fanuc"],
      featured: true,
    },
    {
      email: "daniel.mora@vaony.com",
      firstName: "Daniel",
      lastName: "Mora",
      title: "Ph.D. Applied Mathematics",
      specialization: "Calculus & Linear Algebra",
      bio: "University lecturer and researcher. I've helped 300+ students pass Calculus I–III by rebuilding their algebra foundations first.",
      languages: "Spanish, English",
      tags: ["MATLAB", "Python", "LaTeX", "GeoGebra"],
      featured: true,
    },
    {
      email: "sofia.leal@vaony.com",
      firstName: "Sofía",
      lastName: "Leal",
      title: "B.Eng. Computer Science",
      specialization: "Programming & Data Structures",
      bio: "Senior software engineer. I teach Python and C++ the way real codebases use them — with projects, code review and debugging practice.",
      languages: "English",
      tags: ["Python", "C++", "Git", "VS Code", "SQL"],
      featured: true,
    },
    {
      email: "marco.vega@vaony.com",
      firstName: "Marco",
      lastName: "Vega",
      title: "M.Sc. Fluid Dynamics",
      specialization: "Fluid Mechanics & Thermodynamics",
      bio: "CFD specialist in the energy sector. From Bernoulli to Navier-Stokes, I make transport phenomena click with simulations you can run yourself.",
      languages: "Spanish, English",
      tags: ["ANSYS Fluent", "OpenFOAM", "MATLAB", "Excel"],
      featured: false,
    },
  ];

  const teacherProfiles: { userId: string; profileId: string }[] = [];
  for (const t of teachersData) {
    const user = await db.user.upsert({
      where: { email: t.email },
      update: {},
      create: {
        email: t.email,
        passwordHash: password,
        role: "TEACHER",
        firstName: t.firstName,
        lastName: t.lastName,
        timezone: "America/Mexico_City",
      },
    });
    const profile = await db.teacherProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        title: t.title,
        specialization: t.specialization,
        bio: t.bio,
        languages: t.languages,
        featured: t.featured,
        ratingAvg: 4.6 + Math.random() * 0.4,
        ratingCount: 12 + Math.floor(Math.random() * 40),
      },
    });
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
    { title: "Algebra Foundations", slug: "algebra-foundations", cat: basicMath.id, level: "BEGINNER", price: 18, teacher: 1, featured: true, short: "Equations, factoring and functions — the base everything else stands on.", desc: "A structured one-on-one program covering linear equations, systems, polynomials, factoring and an introduction to functions. Each session ends with a targeted exercise set corrected live in the next class." },
    { title: "Arithmetic & Pre-Algebra", slug: "arithmetic-pre-algebra", cat: basicMath.id, level: "BEGINNER", price: 15, teacher: 1, featured: false, short: "Fractions, ratios, percentages and negative numbers without fear.", desc: "For students who need to rebuild fundamentals: number sense, fractions, decimals, proportions and order of operations, taught with visual models and real examples." },
    { title: "Geometry & Trigonometry", slug: "geometry-trigonometry", cat: basicMath.id, level: "INTERMEDIATE", price: 18, teacher: 1, featured: false, short: "From triangles to the unit circle, with proofs you can actually follow.", desc: "Euclidean geometry, similarity, circles, and a full trigonometry track: identities, equations and applications to vectors and physics problems." },
    { title: "Calculus I–III", slug: "calculus", cat: exactSciences.id, level: "INTERMEDIATE", price: 22, teacher: 1, featured: true, short: "Limits, derivatives, integrals and multivariable — exam-focused.", desc: "Differential and integral calculus through multivariable, taught with graphical intuition first and formalism second. Includes past-exam drills from major universities." },
    { title: "University Physics", slug: "university-physics", cat: exactSciences.id, level: "INTERMEDIATE", price: 22, teacher: 3, featured: false, short: "Mechanics, waves, and electromagnetism with problem-solving method.", desc: "Newtonian mechanics, energy, momentum, oscillations, waves and E&M. Every topic is anchored to a problem-solving framework you can reuse in any exam." },
    { title: "General Chemistry", slug: "general-chemistry", cat: exactSciences.id, level: "BEGINNER", price: 20, teacher: 3, featured: false, short: "Stoichiometry, bonding and equilibrium made systematic.", desc: "Atomic structure, the periodic table, stoichiometry, thermochemistry, and chemical equilibrium — with a session-by-session roadmap matched to your syllabus." },
    { title: "Python Programming", slug: "python-programming", cat: engineering.id, level: "BEGINNER", price: 25, teacher: 2, featured: true, short: "From first script to real projects: data, files, APIs and OOP.", desc: "A project-based path: syntax and control flow, data structures, file handling, APIs, object-oriented programming and debugging like a professional. You leave with a portfolio project." },
    { title: "C++ & Data Structures", slug: "cpp-data-structures", cat: engineering.id, level: "INTERMEDIATE", price: 28, teacher: 2, featured: false, short: "Pointers, memory, and the classic data structures — done right.", desc: "Memory model, pointers and references, classes, templates, and the core data structures (lists, trees, hash tables, graphs) with complexity analysis for technical interviews and coursework." },
    { title: "CNC Programming (G-code)", slug: "cnc-programming", cat: engineering.id, level: "INTERMEDIATE", price: 30, teacher: 0, featured: true, short: "Program lathes and machining centers from drawing to finished part.", desc: "Blueprint reading, work offsets, tool compensation, canned cycles and full G-code programs for Fanuc-style controls. Includes CAM workflow with Fusion 360 / Mastercam." },
    { title: "Fluid Mechanics", slug: "fluid-mechanics", cat: engineering.id, level: "ADVANCED", price: 28, teacher: 3, featured: true, short: "From hydrostatics to Navier-Stokes with worked engineering cases.", desc: "Fluid properties, hydrostatics, control-volume analysis, Bernoulli, dimensional analysis, pipe flow and an introduction to CFD. Built around solved engineering cases." },
    { title: "MATLAB for Engineers", slug: "matlab-for-engineers", cat: engineering.id, level: "BEGINNER", price: 24, teacher: 3, featured: false, short: "Scripts, plotting, matrices and numerical methods for coursework.", desc: "MATLAB environment, vectorized operations, plotting, scripts vs functions, and applied numerical methods: root finding, integration, ODEs — matched to your engineering courses." },
    { title: "SolidWorks CAD", slug: "solidworks-cad", cat: engineering.id, level: "BEGINNER", price: 26, teacher: 0, featured: false, short: "Parts, assemblies and drawings with manufacturing in mind.", desc: "Sketching, feature-based part modeling, assemblies, and production drawings with GD&T basics — taught by a manufacturing engineer who machines what she designs." },
  ];

  for (const c of coursesData) {
    const course = await db.course.upsert({
      where: { slug: c.slug },
      update: {},
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
