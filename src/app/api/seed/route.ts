import { NextResponse } from 'next/server';
import dbConnect from '../lib/mongodb';
import Workshop from '../lib/models/workshop';
import User from '../lib/models/user';
import mongoose from 'mongoose';

export async function GET() {
  try {
    await dbConnect();

    // Clear existing workshops for reseeding
    await Workshop.deleteMany({});
    console.log('Cleared existing workshops for reseeding');

    // Use the specific instructor ID provided
    const instructorId = new mongoose.Types.ObjectId('68389c85e76677a138adcf04');
    
    // Verify the instructor exists
    const instructor = await User.findById(instructorId);
    if (!instructor) {
      return NextResponse.json({ 
        error: 'Instructor with provided ID not found in the database.' 
      }, { status: 400 });
    }

    console.log(`Using instructor: ${instructor.name} (${instructor.email})`);
    
    // Define workshop card colors - removed white (#ffffff)
    const workshopColors = [
      "#c3c2fc", // Soft purple
      "#f8c5f4", // Soft pink
      "#fee487", // Soft yellow
      "#aef9e1"  // Soft mint
    ];

    // Function to get a random color from the array
    const getRandomColor = () => {
      const randomIndex = Math.floor(Math.random() * workshopColors.length);
      return workshopColors[randomIndex];
    };
    
    // Sample workshop data updated for GlitchLab platform
    const sampleWorkshops = [
      {
        name: "Creative Technology Design Workshop",
        nameTranslations: {
          en: "Creative Technology Design Workshop",
          it: "Workshop di Design Tecnologico Creativo"
        },
        description: "Explore creative and conscious use of technology for learning. Participants will collaborate on designing innovative tech solutions through participatory design methods.",
        descriptionTranslations: {
          en: "Explore creative and conscious use of technology for learning. Participants will collaborate on designing innovative tech solutions through participatory design methods.",
          it: "Esplora l'uso creativo e consapevole della tecnologia per l'apprendimento. I partecipanti collaboreranno nella progettazione di soluzioni tecnologiche innovative attraverso metodi di design partecipativo."
        },
        startDate: new Date("2025-06-15T14:00:00"),
        endDate: new Date("2025-06-15T16:00:00"),
        imageSrc: "/images/workshop.jpg",
        badgeName: "Creative Tech Designer",
        badgeNameTranslations: {
          en: "Creative Tech Designer",
          it: "Designer Tecnologico Creativo"
        },
        categories: ["Design", "Technology", "Creativity"],
        level: "Beginner",
        location: "LUXIA Lab - USI",
        instructorIds: [instructorId],
        capacity: 15,
        registeredCount: 0,
        bgColor: getRandomColor()
      },
      {
        name: "Inclusive Design Fundamentals",
        nameTranslations: {
          en: "Inclusive Design Fundamentals",
          it: "Fondamenti di Design Inclusivo"
        },
        description: "Learn about ethical and inclusive design focused on values and diversity. This workshop emphasizes creating technology that works for everyone.",
        descriptionTranslations: {
          en: "Learn about ethical and inclusive design focused on values and diversity. This workshop emphasizes creating technology that works for everyone.",
          it: "Impara il design etico e inclusivo focalizzato su valori e diversità. Questo workshop enfatizza la creazione di tecnologie che funzionano per tutti."
        },
        startDate: new Date("2025-06-22T14:00:00"),
        endDate: new Date("2025-06-22T16:00:00"),
        imageSrc: "/images/workshop.jpg",
        badgeName: "Inclusion Advocate",
        badgeNameTranslations: {
          en: "Inclusion Advocate",
          it: "Sostenitore dell'Inclusione"
        },
        categories: ["Design", "Ethics", "Inclusion"],
        level: "Beginner",
        location: "LUXIA Lab - USI",
        instructorIds: [instructorId],
        capacity: 15,
        registeredCount: 0,
        bgColor: getRandomColor()
      },
      {
        name: "Participatory Prototyping Session",
        nameTranslations: {
          en: "Participatory Prototyping Session",
          it: "Sessione di Prototipazione Partecipativa"
        },
        description: "Hands-on prototyping workshop where participants create tangible technology prototypes through collaborative design processes.",
        descriptionTranslations: {
          en: "Hands-on prototyping workshop where participants create tangible technology prototypes through collaborative design processes.",
          it: "Workshop pratico di prototipazione dove i partecipanti creano prototipi tecnologici tangibili attraverso processi di design collaborativo."
        },
        startDate: new Date("2025-06-29T14:00:00"),
        endDate: new Date("2025-06-29T16:00:00"),
        imageSrc: "/images/workshop.jpg",
        badgeName: "Prototype Builder",
        badgeNameTranslations: {
          en: "Prototype Builder",
          it: "Costruttore di Prototipi"
        },
        categories: ["Prototype", "Collaboration", "Making"],
        level: "Intermediate",
        location: "LUXIA Lab - USI",
        instructorIds: [instructorId],
        capacity: 12,
        registeredCount: 0,
        bgColor: getRandomColor()
      },
      {
        name: "User Experience Evaluation Methods",
        nameTranslations: {
          en: "User Experience Evaluation Methods",
          it: "Metodi di Valutazione dell'Esperienza Utente"
        },
        description: "Learn various methods for evaluating user experiences and testing technology solutions with real users.",
        descriptionTranslations: {
          en: "Learn various methods for evaluating user experiences and testing technology solutions with real users.",
          it: "Impara vari metodi per valutare le esperienze utente e testare soluzioni tecnologiche con utenti reali."
        },
        startDate: new Date("2025-07-06T14:00:00"),
        endDate: new Date("2025-07-06T16:00:00"),
        imageSrc: "/images/workshop.jpg",
        badgeName: "UX Evaluator",
        badgeNameTranslations: {
          en: "UX Evaluator",
          it: "Valutatore UX"
        },
        categories: ["Test", "UX", "Research"],
        level: "Intermediate",
        location: "LUXIA Lab - USI",
        instructorIds: [instructorId],
        capacity: 15,
        registeredCount: 0,
        bgColor: getRandomColor()
      },
      {
        name: "Digital Storytelling for Social Change",
        nameTranslations: {
          en: "Digital Storytelling for Social Change",
          it: "Narrativa Digitale per il Cambiamento Sociale"
        },
        description: "Create compelling digital stories that promote social awareness and positive change through technology and media.",
        descriptionTranslations: {
          en: "Create compelling digital stories that promote social awareness and positive change through technology and media.",
          it: "Crea storie digitali coinvolgenti che promuovono la consapevolezza sociale e il cambiamento positivo attraverso tecnologia e media."
        },
        startDate: new Date("2025-07-13T14:00:00"),
        endDate: new Date("2025-07-13T16:00:00"),
        imageSrc: "/images/workshop.jpg",
        badgeName: "Digital Storyteller",
        badgeNameTranslations: {
          en: "Digital Storyteller",
          it: "Narratore Digitale"
        },
        categories: ["Design", "Media", "Social Impact"],
        level: "Beginner",
        location: "LUXIA Lab - USI",
        instructorIds: [instructorId],
        capacity: 15,
        registeredCount: 0,
        bgColor: getRandomColor()
      },
      {
        name: "Collaborative Ideation Workshop",
        nameTranslations: {
          en: "Collaborative Ideation Workshop",
          it: "Workshop di Ideazione Collaborativa"
        },
        description: "Participate in collective ideation sessions to generate innovative technology solutions for educational and social challenges.",
        descriptionTranslations: {
          en: "Participate in collective ideation sessions to generate innovative technology solutions for educational and social challenges.",
          it: "Partecipa a sessioni di ideazione collettiva per generare soluzioni tecnologiche innovative per sfide educative e sociali."
        },
        startDate: new Date("2025-07-20T14:00:00"),
        endDate: new Date("2025-07-20T16:00:00"),
        imageSrc: "/images/workshop.jpg",
        badgeName: "Innovation Catalyst",
        badgeNameTranslations: {
          en: "Innovation Catalyst",
          it: "Catalizzatore di Innovazione"
        },
        categories: ["Design", "Innovation", "Collaboration"],
        level: "Beginner",
        location: "LUXIA Lab - USI",
        instructorIds: [instructorId],
        capacity: 18,
        registeredCount: 0,
        bgColor: getRandomColor()
      },
      {
        name: "Technology Ethics and Values Workshop",
        nameTranslations: {
          en: "Technology Ethics and Values Workshop",
          it: "Workshop di Etica e Valori Tecnologici"
        },
        description: "Explore the ethical implications of technology design and development, focusing on creating value-driven solutions.",
        descriptionTranslations: {
          en: "Explore the ethical implications of technology design and development, focusing on creating value-driven solutions.",
          it: "Esplora le implicazioni etiche del design e sviluppo tecnologico, concentrandosi sulla creazione di soluzioni guidate dai valori."
        },
        startDate: new Date("2025-07-27T14:00:00"),
        endDate: new Date("2025-07-27T16:00:00"),
        imageSrc: "/images/workshop.jpg",
        badgeName: "Ethics Champion",
        badgeNameTranslations: {
          en: "Ethics Champion",
          it: "Campione di Etica"
        },
        categories: ["Design", "Ethics", "Values"],
        level: "Intermediate",
        location: "LUXIA Lab - USI",
        instructorIds: [instructorId],
        capacity: 15,
        registeredCount: 0,
        bgColor: getRandomColor()
      },
      {
        name: "Critical Design Thinking Session",
        nameTranslations: {
          en: "Critical Design Thinking Session",
          it: "Sessione di Pensiero Critico nel Design"
        },
        description: "Develop critical thinking skills applied to design processes, questioning assumptions and exploring alternative approaches.",
        descriptionTranslations: {
          en: "Develop critical thinking skills applied to design processes, questioning assumptions and exploring alternative approaches.",
          it: "Sviluppa competenze di pensiero critico applicate ai processi di design, mettendo in discussione assunzioni ed esplorando approcci alternativi."
        },
        startDate: new Date("2025-08-03T14:00:00"),
        endDate: new Date("2025-08-03T16:00:00"),
        imageSrc: "/images/workshop.jpg",
        badgeName: "Critical Thinker",
        badgeNameTranslations: {
          en: "Critical Thinker",
          it: "Pensatore Critico"
        },
        categories: ["Design", "Critical Thinking", "Analysis"],
        level: "Advanced",
        location: "LUXIA Lab - USI",
        instructorIds: [instructorId],
        capacity: 12,
        registeredCount: 0,
        bgColor: getRandomColor()
      },
      {
        name: "Gender Equity in Technology Design",
        nameTranslations: {
          en: "Gender Equity in Technology Design",
          it: "Equità di Genere nel Design Tecnologico"
        },
        description: "Address gender equity and diversity in technological fields through hands-on design activities and discussions.",
        descriptionTranslations: {
          en: "Address gender equity and diversity in technological fields through hands-on design activities and discussions.",
          it: "Affronta l'equità di genere e la diversità nei campi tecnologici attraverso attività di design pratiche e discussioni."
        },
        startDate: new Date("2025-08-10T14:00:00"),
        endDate: new Date("2025-08-10T16:00:00"),
        imageSrc: "/images/workshop.jpg",
        badgeName: "Equity Advocate",
        badgeNameTranslations: {
          en: "Equity Advocate",
          it: "Sostenitore dell'Equità"
        },
        categories: ["Design", "Gender Equity", "Diversity"],
        level: "Intermediate",
        location: "LUXIA Lab - USI",
        instructorIds: [instructorId],
        capacity: 15,
        registeredCount: 0,
        bgColor: getRandomColor()
      },
      {
        name: "Mentorship and Peer Learning Workshop",
        nameTranslations: {
          en: "Mentorship and Peer Learning Workshop",
          it: "Workshop di Mentoring e Apprendimento tra Pari"
        },
        description: "Experience mentoring relationships between participants and researchers while fostering peer-to-peer learning.",
        descriptionTranslations: {
          en: "Experience mentoring relationships between participants and researchers while fostering peer-to-peer learning.",
          it: "Sperimenta relazioni di mentoring tra partecipanti e ricercatori promuovendo l'apprendimento tra pari."
        },
        startDate: new Date("2025-08-17T14:00:00"),
        endDate: new Date("2025-08-17T16:00:00"),
        imageSrc: "/images/workshop.jpg",
        badgeName: "Peer Mentor",
        badgeNameTranslations: {
          en: "Peer Mentor",
          it: "Mentore tra Pari"
        },
        categories: ["Design", "Mentorship", "Learning"],
        level: "Advanced",
        location: "LUXIA Lab - USI",
        instructorIds: [instructorId],
        capacity: 10,
        registeredCount: 0,
        bgColor: getRandomColor()
      }
    ];

    // Create workshops with the new schema
    await Workshop.insertMany(sampleWorkshops);

    return NextResponse.json({ 
      message: 'Database reseeded successfully with GlitchLab workshops', 
      workshopsCreated: sampleWorkshops.length,
      instructorUsed: instructor.name
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error seeding database:', error);
    return NextResponse.json({ 
      error: 'Failed to seed database',
      details: error.message 
    }, { status: 500 });
  }
}