// ============================================================================
// Seed Script — populates the database with realistic MHASA content.
// Run: bun run db:seed
// ============================================================================

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  console.log("🌱 Seeding MHASA database...");

  // ---- Admin user ----
  const passwordHash = await bcrypt.hash("Admin@2024", 12);
  const admin = await db.user.upsert({
    where: { email: "admin@mhaksa.com" },
    update: {},
    create: {
      email: "admin@mhaksa.com",
      name: "MHASA Administrator",
      passwordHash,
      role: "ADMIN",
      isActive: true,
    },
  });
  console.log(`  ✓ Admin user: ${admin.email} (password: Admin@2024)`);

  // ---- Services ----
  const services = [
    {
      slug: "rtr-pipe-installation",
      title: "RTR Pipe Installation",
      titleAr: "تركيب أنابيب RTR",
      excerpt: "Reinforced Thermosetting Resin pipe systems for corrosive industrial environments.",
      excerptAr: "أنظمة أنابيب الراتنج المقوى للبيئات الصناعية المسببة للتآكل.",
      description:
        "MHASA specializes in the installation of Reinforced Thermosetting Resin (RTR) piping systems engineered for highly corrosive industrial environments. Our certified crews handle everything from trenching and bedding to jointing, hydrostatic testing, and commissioning — ensuring leak-free, decades-long service life in oil & gas, petrochemical, and water treatment facilities.",
      descriptionAr:
        "تتخصص مهاكسا في تركيب أنظمة أنابيب الراتنج المقوى (RTR) المصممة للبيئات الصناعية شديدة التآكل. يتعامل طاقمنا المعتمد مع كل شيء من الحفر والفرش إلى الوصلات والاختبار الهيدروستاتيكي والتشغيل — لضمان خدمة خالية من التسرب لعقود في منشآت النفط والغاز والبتروكيماويات ومعالجة المياه.",
      icon: "GitBranch",
      features: JSON.stringify(["DN50 to DN3000 diameter range", "Butt & strap and flanged joints", "Hydrostatic pressure testing", "ASME B31.3 compliance", "Corrosion-resistant FRP linings"]),
      sortOrder: 1,
      isFeatured: true,
    },
    {
      slug: "grp-pipe",
      title: "GRP Pipe Systems",
      titleAr: "أنظمة أنابيب GRP",
      excerpt: "Glass Reinforced Polyester pipes for water, sewer, and drainage networks.",
      excerptAr: "أنابيب البوليستر المقوى بالألياف الزجاجية لشبكات المياه والصرف والتصريف.",
      description:
        "We install Glass Reinforced Polyester (GRP) pipe systems — the industry standard for large-diameter water transmission, sewer forcemains, and gravity networks. Our expertise covers Hobas and Amibru-style centrifugally cast pipes, with engineered joint systems that accommodate Saudi Arabia's challenging soil conditions and high groundwater tables.",
      descriptionAr:
        "نقوم بتركيب أنظمة أنابيب البوليستر المقوى بالألياف الزجاجية (GRP) — المعيار الصناعي لنقل المياه بأقطار كبيرة وخطوط الصرف وشبكات الجاذبية. تشمل خبرتنا الأنابيب المصبوبة مركزياً مع أنظمة وصلات هندسية تتناسب مع الظروف الترابية الصعبة في المملكة ومناسيب المياه الجوفية المرتفعة.",
      icon: "Cylinder",
      features: JSON.stringify(["DN300 to DN4000 capability", "SN2500 to SN10000 stiffness classes", "Trenchless & open-cut installation", "AWWA M45 design compliance", "50+ year design life"]),
      sortOrder: 2,
      isFeatured: true,
    },
    {
      slug: "gre-pipe",
      title: "GRE Pipe Solutions",
      titleAr: "حلول أنابيب GRE",
      excerpt: "Glass Reinforced Epoxy piping for high-pressure hydrocarbon service.",
      excerptAr: "أنابيب الإيبوكسي المقوى بالألياف الزجاجية لخدمات الهيدروكربون عالية الضغط.",
      description:
        "Our GRE (Glass Reinforced Epoxy) pipe solutions serve the most demanding high-pressure applications in the oil & gas sector — including produced water injection, saltwater disposal, and chemical transport. We deliver systems rated up to 1500 PSI with threaded, flanged, and bonded joint configurations, backed by full third-party NDT and hydrotest verification.",
      descriptionAr:
        "تخدم حلول أنابيب الإيبوكسي المقوى بالألياف الزجاجية (GRE) أكثر التطبيقات طلباً لضغط العالي في قطاع النفط والغاز — بما في ذلك حقن المياه المنتجة والتخلص من المياه المالحة ونقل المواد الكيميائية. نقدم أنظمة مصنفة حتى 1500 رطل/بوصة مربعة مع وصلات ملولبة ومثبتة ومتصلة، مدعومة بفحوصات NDT كاملة من جهات خارجية.",
      icon: "FlaskConical",
      features: JSON.stringify(["Up to 1500 PSI pressure rating", "API 15HR conformance", "Threaded & bonded joints", "High-temperature service to 120°C", "H2S and CO2 resistant"]),
      sortOrder: 3,
      isFeatured: true,
    },
    {
      slug: "frp-pipe",
      title: "FRP Pipe Fabrication",
      titleAr: "تصنيع أنابيب FRP",
      excerpt: "Custom Fiberglass Reinforced Plastic piping for chemical and process plants.",
      excerptAr: "أنابيب البلاستيك المقوى بالألياف الزجاجية المخصصة للمصانع الكيميائية ومعالجة العمليات.",
      description:
        "MHASA's FRP fabrication division produces custom Fiberglass Reinforced Plastic piping, ducting, and tanks for chemical processing, desalination, and power plants. Our in-house filament winding and hand lay-up capabilities allow us to engineer bespoke solutions for non-standard geometries, aggressive media, and specialized flow requirements.",
      descriptionAr:
        "قسم تصنيع FRP في مهاكسا ينتج أنابيب ومجاري وخزانات البلاستيك المقوى بالألياف الزجاجية المخصصة لمعالجة المواد الكيميائية وتحلية المياه ومحطات الطاقة. تتيح لنا قدراتنا في اللف الخيطي والتشكيل اليدوي هندسة حلول مخصصة للأشكال غير القياسية والوسائط العدوانية ومتطلبات التدفق المتخصصة.",
      icon: "Layers",
      features: JSON.stringify(["Filament winding & hand lay-up", "Vinylester & isophthalic resins", "Custom diameter & fittings", "Chemical resistance database", "Duct & tank fabrication"]),
      sortOrder: 4,
      isFeatured: true,
    },
    {
      slug: "sewer-line-installation",
      title: "Sewer Line Installation",
      titleAr: "تركيب خطوط الصرف الصحي",
      excerpt: "Complete sewer collection and transmission systems for municipalities.",
      excerptAr: "أنظمة جمع ونقل مياه الصرف الصحي الكاملة للبلديات.",
      description:
        "We deliver turnkey sewer line installation projects — from manhole construction and pipe laying to connection testing and municipal handover. Our experience spans gravity sewers, forcemains, and lift stations across Saudi Arabia's Eastern Province, with full compliance to Saudi Aramco engineering standards and municipal codes.",
      descriptionAr:
        "نقدم مشاريع تركيب خطوط الصرف الصحي المتكاملة — من بناء غرف التفتيش ومد الأنابيب إلى اختبار الوصلات والتسليم البلدي. تمتد خبرتنا إلى شبكات الجاذبية وخطوط الضغط ومحطات الرفع في المنطقة الشرقية من المملكة، مع الالتزام الكامل بمعايير أرامكو الهندسية والأنظمة البلدية.",
      icon: "Waves",
      features: JSON.stringify(["Gravity & pressure sewer systems", "HDPE, PVC, GRP & RTR materials", "Manhole & lift station construction", "CCTV inspection & leak detection", "Municipal & Aramco compliance"]),
      sortOrder: 5,
      isFeatured: false,
    },
    {
      slug: "fiberglass-works",
      title: "Fiberglass Engineering Works",
      titleAr: "أعمال هندسة الألياف الزجاجية",
      excerpt: "Tanks, vessels, ducts, and custom fiberglass structures.",
      excerptAr: "خزانات وأوعية ومجاري وهياكل ألياف زجاجية مخصصة.",
      description:
        "Our fiberglass engineering division fabricates storage tanks, pressure vessels, scrubbers, ducts, and custom architectural elements. From small chemical storage tanks to large-diameter process vessels, we engineer every product to meet specific media, temperature, and pressure requirements with full QA/QC documentation.",
      descriptionAr:
        "قسم هندسة الألياف الزجاجية لدينا يصنع خزانات التخزين وأوعية الضغط والغسالات والمجاري والعناصر المعمارية المخصصة. من خزانات تخزين المواد الكيميائية الصغيرة إلى أوعية العمليات ذات القطر الكبير، نقوم بتصميم كل منتج لتلبية متطلبات الوسائط ودرجة الحرارة والضغط المحددة مع توثيق كامل لضمان الجودة.",
      icon: "Box",
      features: JSON.stringify(["Vertical & horizontal tanks", "Scrubbers & absorbers", "Custom ductwork", "Architectural elements", "API 12F & ASME RTP-1 compliant"]),
      sortOrder: 6,
      isFeatured: false,
    },
    {
      slug: "engineering-solutions",
      title: "Engineering Solutions",
      titleAr: "الحلول الهندسية",
      excerpt: "Design, consultancy, and project management for industrial piping.",
      excerptAr: "التصميم والاستشارات وإدارة المشاريع لأنظمة الأنابيب الصناعية.",
      description:
        "Beyond installation, MHASA provides end-to-end engineering solutions — including system design, material selection, hydraulic analysis, project management, and third-party inspection. Our engineering team partners with EPC contractors and owner-operators to de-risk complex piping projects from concept to commissioning.",
      descriptionAr:
        "إلى جانب التركيب، تقدم مهاكسا حلولاً هندسية شاملة — بما في ذلك تصميم الأنظمة واختيار المواد والتحليل الهيدروليكي وإدارة المشاريع والتفتيش من طرف ثالث. يتعاون فريقنا الهندسي مع مقاولين EPC ومالكي التشغيل لتقليل مخاطر مشاريع الأنابيب المعقدة من المفهوم إلى التشغيل.",
      icon: "Compass",
      features: JSON.stringify(["Piping system design", "Hydraulic & stress analysis", "Material selection consultancy", "Project management (PMP certified)", "Third-party QA/QC inspection"]),
      sortOrder: 7,
      isFeatured: false,
    },
  ];

  for (const svc of services) {
    await db.service.upsert({
      where: { slug: svc.slug },
      update: {},
      create: svc,
    });
  }
  console.log(`  ✓ ${services.length} services seeded`);

  // ---- Projects ----
  const projects = [
    {
      slug: "aramco-jubail-rtr-network",
      title: "Aramco Jubail RTR Cooling Water Network",
      clientName: "Saudi Aramco",
      category: "RTR Pipe",
      location: "Jubail Industrial City",
      value: 18500000,
      completionDate: new Date("2023-09-15"),
      description:
        "Design, supply, and installation of 28 km of DN600-DN1200 RTR cooling water piping for Saudi Aramco's Jubail refinery expansion. Project included trenching, pipe laying, jointing, hydrostatic testing to 1.5x design pressure, and full reinstatement across live plant operations.",
      imageUrl: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1200&q=80",
      isFeatured: true,
    },
    {
      slug: "sabic-grp-sewer-main",
      title: "SABIC Yanbu GRP Sewer Forcemain",
      clientName: "SABIC",
      category: "GRP Pipe",
      location: "Yanbu Industrial City",
      value: 12200000,
      completionDate: new Date("2023-04-22"),
      description:
        "Installation of 15 km of DN1600 GRP sewer forcemain for SABIC's Yanbu petrochemical complex. The project featured trenchless crossings under existing process piping and a 1.2 km HDD installation beneath the Red Sea cooling water intake channel.",
      imageUrl: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=1200&q=80",
      isFeatured: true,
    },
    {
      slug: "swcc-gre-desalination",
      title: "SWCC Khobar GRE Brine Discharge",
      clientName: "Saline Water Conversion Corporation",
      category: "GRE Pipe",
      location: "Al Khobar",
      value: 8700000,
      completionDate: new Date("2022-12-10"),
      description:
        "Supply and installation of DN900 GRE brine discharge pipelines for the SWCC Khobar desalination plant upgrade. The system handles concentrated brine at 65°C with engineered corrosion allowance and 50-year design life.",
      imageUrl: "https://images.unsplash.com/photo-1565109604439-cb1f1d9d3e30?w=1200&q=80",
      isFeatured: true,
    },
    {
      slug: "satorp-frp-chemical",
      title: "SATORP Jubail FRP Chemical Distribution",
      clientName: "SATORP",
      category: "FRP Pipe",
      location: "Jubail Refinery",
      value: 6400000,
      completionDate: new Date("2023-07-03"),
      description:
        "Custom fabrication and installation of DN50-DN400 FRP piping for sulfuric acid and caustic soda distribution within the SATORP full-conversion refinery. All systems engineered with vinylester resin for 99% H2SO4 service.",
      imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&q=80",
      isFeatured: true,
    },
    {
      slug: "qatif-municipality-sewer",
      title: "Qatif Municipality Sewer Network",
      clientName: "Qatif Municipality",
      category: "Sewer Line",
      location: "Qatif",
      value: 4200000,
      completionDate: new Date("2022-11-18"),
      description:
        "Turnkey installation of 22 km of gravity sewer network including 145 manholes, serving 12,000 residential connections across Qatif governorate. Project delivered 3 weeks ahead of schedule with zero lost-time incidents.",
      imageUrl: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1200&q=80",
      isFeatured: true,
    },
    {
      slug: "marafiq-fiberglass-tanks",
      title: "Marafiq Fiberglass Storage Tanks",
      clientName: "Marafiq",
      category: "Fiberglass Works",
      location: "Jubail",
      value: 5800000,
      completionDate: new Date("2023-02-28"),
      description:
        "Fabrication and installation of 8 vertical fiberglass storage tanks (DN4000, 50m³ each) for Marafiq's industrial wastewater treatment facility, including integral scrubbers and ductwork.",
      imageUrl: "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=1200&q=80",
      isFeatured: false,
    },
    {
      slug: "dammam-industrial-consultancy",
      title: "Dammam Industrial City Piping Consultancy",
      clientName: "Royal Commission — Dammam",
      category: "Engineering Solutions",
      location: "Dammam",
      value: 1800000,
      completionDate: new Date("2023-05-20"),
      description:
        "Engineering design and project management for the relocation of 14 km of process piping during the Dammam Industrial City capacity expansion, including hydraulic analysis, stress evaluation, and construction supervision.",
      imageUrl: "https://images.unsplash.com/photo-1581093588401-fbb62a02f120?w=1200&q=80",
      isFeatured: false,
    },
    {
      slug: "sadara-rtr-firewater",
      title: "Sadara RTR Firewater System",
      clientName: "Sadara Chemical Company",
      category: "RTR Pipe",
      location: "Jubail",
      value: 9600000,
      completionDate: new Date("2022-08-14"),
      description:
        "Installation of 18 km of DN300-DN600 RTR firewater distribution piping for the Sadara mixed-feed cracker complex, with full UL/FM compliance and integration with the plant's deluge and foam systems.",
      imageUrl: "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=1200&q=80",
      isFeatured: false,
    },
  ];

  for (const proj of projects) {
    await db.project.upsert({
      where: { slug: proj.slug },
      update: {},
      create: {
        ...proj,
        galleryImages: JSON.stringify([proj.imageUrl]),
        currency: "SAR",
      },
    });
  }
  console.log(`  ✓ ${projects.length} projects seeded`);

  // ---- Team ----
  const team = [
    {
      name: "Mohd H. Al Marhoon",
      nameAr: "محمد حمد المرحون",
      designation: "Founder & Managing Director",
      designationAr: "المؤسس والعضو المنتدب",
      bio: "With over 30 years in the Saudi construction industry, Mr. Al Marhoon established the company in 1995 and has led its growth into a trusted contractor for the Kingdom's most demanding industrial projects.",
      imageUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80",
      sortOrder: 1,
    },
    {
      name: "Khalid Al-Otaibi",
      nameAr: "خالد العتيبي",
      designation: "Operations Director",
      designationAr: "مدير العمليات",
      bio: "PMP-certified leader with 18 years managing large-diameter piping projects across the GCC, specializing in Saudi Aramco and SABIC execution standards.",
      imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
      sortOrder: 2,
    },
    {
      name: "Ahmed Hassan",
      nameAr: "أحمد حسن",
      designation: "Technical Manager",
      designationAr: "المدير الفني",
      bio: "Chartered Engineer (CEng) with expertise in GRE/GRP system design, hydraulic modeling, and ASME/API compliance for hydrocarbon service.",
      imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80",
      sortOrder: 3,
    },
    {
      name: "Faisal Al-Qahtani",
      nameAr: "فيصل القحطاني",
      designation: "HSE Manager",
      designationAr: "مدير الصحة والسلامة",
      bio: "NEBOSH IDip-certified safety professional championing a zero-incident culture across all project sites, with 12 years in oil & gas construction.",
      imageUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80",
      sortOrder: 4,
    },
  ];

  for (const member of team) {
    await db.teamMember.upsert({
      where: { id: member.name }, // using name as pseudo-key; will create new
      update: {},
      create: member,
    });
  }
  console.log(`  ✓ ${team.length} team members seeded`);

  // ---- Testimonials ----
  const testimonials = [
    {
      clientName: "Eng. Abdullah Al-Shehri",
      designation: "Project Director",
      company: "Saudi Aramco — Jubail Refinery",
      content:
        "MHASA delivered our RTR cooling water network ahead of schedule with exceptional safety performance. Their technical expertise in large-diameter piping is unmatched in the Eastern Province.",
      rating: 5,
      sortOrder: 1,
    },
    {
      clientName: "Mohammed Al-Ghamdi",
      designation: "Maintenance Manager",
      company: "SABIC Yanbu",
      content:
        "The SABIC forcemain project required innovative trenchless solutions under live plant infrastructure. MHASA's engineering team executed flawlessly with zero process disruptions.",
      rating: 5,
      sortOrder: 2,
    },
    {
      clientName: "Salem Al-Dossari",
      designation: "Facilities Head",
      company: "Marafiq",
      content:
        "Their fiberglass tank fabrication quality is world-class. Every weld, every laminate — fully documented and third-party verified. A true partner for critical industrial infrastructure.",
      rating: 5,
      sortOrder: 3,
    },
  ];

  for (const t of testimonials) {
    await db.testimonial.create({ data: t });
  }
  console.log(`  ✓ ${testimonials.length} testimonials seeded`);

  // ---- Clients ----
  const clients = [
    { name: "Saudi Aramco", industry: "Oil & Gas", sortOrder: 1 },
    { name: "SABIC", industry: "Petrochemicals", sortOrder: 2 },
    { name: "SWCC", industry: "Desalination", sortOrder: 3 },
    { name: "Sadara", industry: "Chemicals", sortOrder: 4 },
    { name: "SATORP", industry: "Refining", sortOrder: 5 },
    { name: "Marafiq", industry: "Utilities", sortOrder: 6 },
    { name: "Royal Commission", industry: "Industrial Cities", sortOrder: 7 },
    { name: "Saudi Electricity Co.", industry: "Power", sortOrder: 8 },
  ];

  for (const c of clients) {
    await db.client.create({ data: c });
  }
  console.log(`  ✓ ${clients.length} clients seeded`);

  // ---- Gallery ----
  const gallery = [
    { title: "RTR Pipe Laying — Jubail", category: "Projects", imageUrl: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&q=80", sortOrder: 1 },
    { title: "GRP Forcemain Installation", category: "Projects", imageUrl: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&q=80", sortOrder: 2 },
    { title: "Fiberglass Tank Fabrication", category: "Equipment", imageUrl: "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=800&q=80", sortOrder: 3 },
    { title: "Engineering Team on Site", category: "Team", imageUrl: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80", sortOrder: 4 },
    { title: "Sewer Network Construction", category: "Projects", imageUrl: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&q=80", sortOrder: 5 },
    { title: "Chemical Piping — SATORP", category: "Projects", imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80", sortOrder: 6 },
    { title: "Desalination Plant Upgrade", category: "Projects", imageUrl: "https://images.unsplash.com/photo-1565109604439-cb1f1d9d3e30?w=800&q=80", sortOrder: 7 },
    { title: "Site Office — Dammam", category: "Office", imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80", sortOrder: 8 },
  ];
  for (const g of gallery) {
    await db.galleryItem.create({ data: g });
  }
  console.log(`  ✓ ${gallery.length} gallery items seeded`);

  // ---- Jobs ----
  const jobs = [
    {
      slug: "senior-piping-engineer",
      title: "Senior Piping Engineer",
      department: "Engineering",
      location: "Jubail, Saudi Arabia",
      type: "Full-time",
      experience: "8+ years",
      description: "Lead the engineering design and execution of large-diameter RTR/GRP/GRE piping projects for oil & gas and petrochemical clients. Manage a team of 4-6 engineers and coordinate with site supervisors.",
      requirements: JSON.stringify(["BS in Mechanical/Chemical Engineering", "8+ years piping design experience", "Proficiency in AutoCAD Plant 3D / CAESAR II", "ASME B31.3 knowledge", "Saudi Aramco project experience preferred"]),
      salaryRange: "SAR 18,000 - 24,000 / month",
      status: "OPEN",
      closingDate: new Date("2025-12-31"),
    },
    {
      slug: "site-supervisor-frp",
      title: "FRP Site Supervisor",
      department: "Construction",
      location: "Dammam, Saudi Arabia",
      type: "Full-time",
      experience: "5+ years",
      description: "Supervise FRP/GRP pipe installation crews on industrial construction sites. Ensure compliance with QA/QC procedures, HSE standards, and project schedules.",
      requirements: JSON.stringify(["Diploma in Mechanical/Civil Engineering", "5+ years site supervision", "FRP/GRP installation experience", "Aramco HSE certification", "Transferable Iqama"]),
      salaryRange: "SAR 9,000 - 13,000 / month",
      status: "OPEN",
      closingDate: new Date("2025-11-30"),
    },
    {
      slug: "qa-qc-inspector",
      title: "QA/QC Inspector — Piping",
      department: "Quality",
      location: "Jubail, Saudi Arabia",
      type: "Full-time",
      experience: "6+ years",
      description: "Perform inspection and quality control of pipe installation, welding, and testing activities. Prepare QA/QC documentation and liaise with client third-party inspectors.",
      requirements: JSON.stringify(["CSWIP 3.1 or equivalent", "6+ years QA/QC in piping", "NDT Level II certification", "Aramco approved inspector preferred", "Strong documentation skills"]),
      salaryRange: "SAR 11,000 - 15,000 / month",
      status: "OPEN",
      closingDate: new Date("2025-12-15"),
    },
  ];
  for (const j of jobs) {
    await db.job.upsert({
      where: { slug: j.slug },
      update: {},
      create: j,
    });
  }
  console.log(`  ✓ ${jobs.length} jobs seeded`);

  // ---- Blog Posts ----
  const posts = [
    {
      slug: "rtr-pipe-advantages-oil-gas",
      title: "Why RTR Pipes Are the Future of Oil & Gas Fluid Transport",
      excerpt: "An in-depth look at how Reinforced Thermosetting Resin piping outperforms traditional steel in corrosive environments.",
      content: "# Why RTR Pipes Are the Future\n\nReinforced Thermosetting Resin (RTR) piping has emerged as the preferred choice for corrosive fluid transport in the oil & gas sector...",
      coverImage: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1200&q=80",
      category: "Industry News",
      tags: JSON.stringify(["RTR", "Oil & Gas", "Piping"]),
      status: "PUBLISHED",
      publishedAt: new Date("2024-01-15"),
      authorId: admin.id,
    },
    {
      slug: "mhasa-aramco-jubail-completion",
      title: "MHASA Completes Aramco Jubail RTR Network Ahead of Schedule",
      excerpt: "We're proud to announce the successful completion of the 28 km RTR cooling water network for Saudi Aramco.",
      content: "# Aramco Jubail Project Completion\n\nMHASA has successfully delivered the 28 km RTR cooling water network for Saudi Aramco's Jubail refinery expansion...",
      coverImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&q=80",
      category: "Company Updates",
      tags: JSON.stringify(["Aramco", "Jubail", "Project Completion"]),
      status: "PUBLISHED",
      publishedAt: new Date("2023-09-20"),
      authorId: admin.id,
    },
    {
      slug: "fiberglass-tank-design-principles",
      title: "Engineering Principles for Fiberglass Storage Tank Design",
      excerpt: "Key considerations for specifying fiberglass tanks in chemical service applications.",
      content: "# Fiberglass Tank Design Principles\n\nWhen specifying fiberglass storage tanks for chemical service, several engineering principles must guide the design process...",
      coverImage: "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=1200&q=80",
      category: "Articles",
      tags: JSON.stringify(["Fiberglass", "Tanks", "Engineering"]),
      status: "PUBLISHED",
      publishedAt: new Date("2024-02-10"),
      authorId: admin.id,
    },
  ];
  for (const p of posts) {
    await db.blogPost.upsert({
      where: { slug: p.slug },
      update: {},
      create: p,
    });
  }
  console.log(`  ✓ ${posts.length} blog posts seeded`);

  // ---- FAQ ----
  const faqs = [
    { question: "What geographic areas does MHASA serve?", answer: "We primarily serve the Eastern Province of Saudi Arabia — including Jubail, Khobar, Qatif, and Dammam — and undertake projects across the wider Kingdom on a case-by-case basis.", category: "General", sortOrder: 1 },
    { question: "What pipe diameter ranges can you install?", answer: "Our crews are equipped to install piping from DN50 (2 inch) up to DN4000 (160 inch), covering everything from chemical process lines to large-diameter water transmission mains.", category: "Technical", sortOrder: 2 },
    { question: "Are you an approved Saudi Aramco vendor?", answer: "Yes, MHASA is an approved contractor with Saudi Aramco and complies with all SAMD vendor registration requirements. We also hold approved status with SABIC, SWCC, Sadara, and other major operators.", category: "Compliance", sortOrder: 3 },
    { question: "Do you provide engineering design services, or only installation?", answer: "We offer end-to-end solutions — from system design and material selection through to installation, testing, and commissioning. Our in-house engineering team can support projects at any stage.", category: "Services", sortOrder: 4 },
    { question: "What is your typical project quotation turnaround?", answer: "For standard inquiries, we provide an initial quotation within 24-48 hours. Complex engineered solutions may require 5-7 business days for detailed material take-offs and pricing.", category: "General", sortOrder: 5 },
    { question: "How do you ensure HSE compliance on site?", answer: "Every project is governed by our HSE management system, aligned to ISO 45001 and Saudi Aramco safety standards. We maintain a zero-incident target with daily toolbox talks, weekly audits, and full-time site safety officers.", category: "Safety", sortOrder: 6 },
  ];
  for (const f of faqs) {
    await db.faqItem.create({ data: f });
  }
  console.log(`  ✓ ${faqs.length} FAQs seeded`);

  // ---- Stats ----
  const stats = [
    { label: "Years of Experience", value: 30, suffix: "+", icon: "Calendar", sortOrder: 1 },
    { label: "Projects Completed", value: 450, suffix: "+", icon: "Briefcase", sortOrder: 2 },
    { label: "Kilometers of Pipe Installed", value: 1200, suffix: "+", icon: "GitBranch", sortOrder: 3 },
    { label: "Happy Clients", value: 85, suffix: "+", icon: "Users", sortOrder: 4 },
  ];
  for (const s of stats) {
    await db.stat.create({ data: s });
  }
  console.log(`  ✓ ${stats.length} stats seeded`);

  // ---- Hero Slides ----
  const heroes = [
    {
      title: "Engineering Excellence in Pipe Installation",
      subtitle: "Trusted by Saudi Arabia's leading oil & gas, petrochemical, and industrial operators for over 30 years.",
      imageUrl: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1920&q=80",
      ctaText: "Explore Services",
      ctaLink: "services",
      sortOrder: 1,
    },
    {
      title: "RTR • GRP • GRE • FRP Specialists",
      subtitle: "From DN50 to DN4000 — engineered piping solutions for the Kingdom's most demanding environments.",
      imageUrl: "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=1920&q=80",
      ctaText: "View Projects",
      ctaLink: "projects",
      sortOrder: 2,
    },
    {
      title: "Safety First. Quality Always.",
      subtitle: "Zero-incident culture, ISO 45001 aligned, and approved by Saudi Aramco, SABIC, and SWCC.",
      imageUrl: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=1920&q=80",
      ctaText: "Request Quotation",
      ctaLink: "contact",
      sortOrder: 3,
    },
  ];
  for (const h of heroes) {
    await db.heroSlide.create({ data: h });
  }
  console.log(`  ✓ ${heroes.length} hero slides seeded`);

  // ---- Site Settings ----
  await db.siteSetting.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      siteName: "MHASA",
      siteNameAr: "مهاكسا",
      tagline: "Engineering Excellence in Pipe Installation & Industrial Solutions",
      taglineAr: "التميز الهندسي في تركيب الأنابيب والحلول الصناعية",
      description: "Mohd H. Al Marhoon Cont. Est. (MHASA) — leading Saudi contractor for RTR, GRP, GRE, FRP pipe installation, sewer lines, and fiberglass engineering.",
      email: "info@mhaksa.com",
      phonePrimary: "+966592329710",
      phoneSecondary: "+966553094452",
      address: "Jubail, Khobar, Qatif & Dammam — Kingdom of Saudi Arabia",
      addressAr: "الجبيل، الخبر، القطيف، الدمام — المملكة العربية السعودية",
      mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d28755.5!2d50.15!3d26.27!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e49e7f2f6c0a0a1%3A0x0!2sJubail!5e0!3m2!1sen!2ssa!4v1700000000000",
      whatsappNumber: "966592329710",
      linkedinUrl: "https://www.linkedin.com",
      facebookUrl: "https://www.facebook.com",
      instagramUrl: "https://www.instagram.com",
      youtubeUrl: "https://www.youtube.com",
    },
  });
  console.log("  ✓ Site settings seeded");

  console.log("\n✅ Seed complete. Admin login: admin@mhaksa.com / Admin@2024");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
