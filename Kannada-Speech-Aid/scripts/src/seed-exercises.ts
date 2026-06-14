import crypto from "crypto";

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}


import { db } from "@workspace/db";
import { exercisesTable, patientsTable } from "@workspace/db/schema";

const exercises = [
  // Vowels - Beginner
  { kannadaText: "ಅ", transliteration: "a", englishMeaning: "A (as in 'fun')", category: "vowels", difficulty: "beginner", orderIndex: 1 },
  { kannadaText: "ಆ", transliteration: "aa", englishMeaning: "AA (as in 'father')", category: "vowels", difficulty: "beginner", orderIndex: 2 },
  { kannadaText: "ಇ", transliteration: "i", englishMeaning: "I (as in 'sit')", category: "vowels", difficulty: "beginner", orderIndex: 3 },
  { kannadaText: "ಈ", transliteration: "ee", englishMeaning: "EE (as in 'feet')", category: "vowels", difficulty: "beginner", orderIndex: 4 },
  { kannadaText: "ಉ", transliteration: "u", englishMeaning: "U (as in 'put')", category: "vowels", difficulty: "beginner", orderIndex: 5 },
  { kannadaText: "ಊ", transliteration: "oo", englishMeaning: "OO (as in 'food')", category: "vowels", difficulty: "beginner", orderIndex: 6 },
  { kannadaText: "ಎ", transliteration: "e", englishMeaning: "E (as in 'bed')", category: "vowels", difficulty: "beginner", orderIndex: 7 },
  { kannadaText: "ಏ", transliteration: "ae", englishMeaning: "AE (as in 'day')", category: "vowels", difficulty: "beginner", orderIndex: 8 },
  { kannadaText: "ಒ", transliteration: "o", englishMeaning: "O (as in 'go')", category: "vowels", difficulty: "beginner", orderIndex: 9 },
  { kannadaText: "ಓ", transliteration: "oo", englishMeaning: "OO (as in 'boat')", category: "vowels", difficulty: "beginner", orderIndex: 10 },

  // Consonants - Beginner
  { kannadaText: "ಕ", transliteration: "ka", englishMeaning: "KA (as in 'ka-te')", category: "consonants", difficulty: "beginner", orderIndex: 1 },
  { kannadaText: "ಖ", transliteration: "kha", englishMeaning: "KHA (aspirated ka)", category: "consonants", difficulty: "beginner", orderIndex: 2 },
  { kannadaText: "ಗ", transliteration: "ga", englishMeaning: "GA (as in 'game')", category: "consonants", difficulty: "beginner", orderIndex: 3 },
  { kannadaText: "ಚ", transliteration: "cha", englishMeaning: "CHA (as in 'chair')", category: "consonants", difficulty: "beginner", orderIndex: 4 },
  { kannadaText: "ಜ", transliteration: "ja", englishMeaning: "JA (as in 'jar')", category: "consonants", difficulty: "beginner", orderIndex: 5 },
  { kannadaText: "ಟ", transliteration: "ta", englishMeaning: "TA (retroflex t)", category: "consonants", difficulty: "beginner", orderIndex: 6 },
  { kannadaText: "ನ", transliteration: "na", englishMeaning: "NA (as in 'name')", category: "consonants", difficulty: "beginner", orderIndex: 7 },
  { kannadaText: "ಪ", transliteration: "pa", englishMeaning: "PA (as in 'park')", category: "consonants", difficulty: "beginner", orderIndex: 8 },
  { kannadaText: "ಮ", transliteration: "ma", englishMeaning: "MA (as in 'mother')", category: "consonants", difficulty: "beginner", orderIndex: 9 },
  { kannadaText: "ರ", transliteration: "ra", englishMeaning: "RA (rolled r)", category: "consonants", difficulty: "beginner", orderIndex: 10 },
  { kannadaText: "ಲ", transliteration: "la", englishMeaning: "LA (as in 'lake')", category: "consonants", difficulty: "beginner", orderIndex: 11 },
  { kannadaText: "ವ", transliteration: "va", englishMeaning: "VA (as in 'van')", category: "consonants", difficulty: "beginner", orderIndex: 12 },
  { kannadaText: "ಸ", transliteration: "sa", englishMeaning: "SA (as in 'sun')", category: "consonants", difficulty: "beginner", orderIndex: 13 },
  { kannadaText: "ಹ", transliteration: "ha", englishMeaning: "HA (as in 'hat')", category: "consonants", difficulty: "beginner", orderIndex: 14 },

  // Words - Beginner
  { kannadaText: "ಅಮ್ಮ", transliteration: "amma", englishMeaning: "Mother", category: "words", difficulty: "beginner", orderIndex: 1 },
  { kannadaText: "ಅಪ್ಪ", transliteration: "appa", englishMeaning: "Father", category: "words", difficulty: "beginner", orderIndex: 2 },
  { kannadaText: "ನೀರು", transliteration: "neeru", englishMeaning: "Water", category: "words", difficulty: "beginner", orderIndex: 3 },
  { kannadaText: "ಅನ್ನ", transliteration: "anna", englishMeaning: "Rice/Food", category: "words", difficulty: "beginner", orderIndex: 4 },
  { kannadaText: "ಮನೆ", transliteration: "mane", englishMeaning: "House", category: "words", difficulty: "beginner", orderIndex: 5 },
  { kannadaText: "ಕಾಲು", transliteration: "kaalu", englishMeaning: "Leg/Foot", category: "words", difficulty: "beginner", orderIndex: 6 },
  { kannadaText: "ಕೈ", transliteration: "kai", englishMeaning: "Hand", category: "words", difficulty: "beginner", orderIndex: 7 },
  { kannadaText: "ಬಾಯಿ", transliteration: "baayi", englishMeaning: "Mouth", category: "words", difficulty: "beginner", orderIndex: 8 },
  { kannadaText: "ಕಣ್ಣು", transliteration: "kannu", englishMeaning: "Eye", category: "words", difficulty: "beginner", orderIndex: 9 },
  { kannadaText: "ಮೂಗು", transliteration: "moogu", englishMeaning: "Nose", category: "words", difficulty: "beginner", orderIndex: 10 },

  // Words - Intermediate
  { kannadaText: "ಆಸ್ಪತ್ರೆ", transliteration: "aaspatre", englishMeaning: "Hospital", category: "words", difficulty: "intermediate", orderIndex: 1 },
  { kannadaText: "ವೈದ್ಯರು", transliteration: "vaidyaru", englishMeaning: "Doctor", category: "words", difficulty: "intermediate", orderIndex: 2 },
  { kannadaText: "ನೋವು", transliteration: "novu", englishMeaning: "Pain", category: "words", difficulty: "intermediate", orderIndex: 3 },
  { kannadaText: "ಔಷಧ", transliteration: "aushadha", englishMeaning: "Medicine", category: "words", difficulty: "intermediate", orderIndex: 4 },
  { kannadaText: "ತಲೆ", transliteration: "tale", englishMeaning: "Head", category: "words", difficulty: "intermediate", orderIndex: 5 },

  // Sentences - Intermediate
  { kannadaText: "ನನ್ನ ಹೆಸರು ...", transliteration: "nanna hesaru ...", englishMeaning: "My name is ...", category: "sentences", difficulty: "intermediate", orderIndex: 1 },
  { kannadaText: "ನನಗೆ ನೀರು ಬೇಕು", transliteration: "nanage neeru beku", englishMeaning: "I need water", category: "sentences", difficulty: "intermediate", orderIndex: 2 },
  { kannadaText: "ನನಗೆ ಹೊಟ್ಟೆ ನೋಯುತ್ತಿದೆ", transliteration: "nanage hotte noyuttide", englishMeaning: "My stomach hurts", category: "sentences", difficulty: "intermediate", orderIndex: 3 },
  { kannadaText: "ದಯವಿಟ್ಟು ಸಹಾಯ ಮಾಡಿ", transliteration: "dayavittu sahaaya maadi", englishMeaning: "Please help me", category: "sentences", difficulty: "intermediate", orderIndex: 4 },
  { kannadaText: "ನನಗೆ ತಲೆ ನೋಯುತ್ತಿದೆ", transliteration: "nanage tale noyuttide", englishMeaning: "I have a headache", category: "sentences", difficulty: "intermediate", orderIndex: 5 },

  // Sentences - Advanced
  { kannadaText: "ನಾನು ಪ್ರತಿದಿನ ವ್ಯಾಯಾಮ ಮಾಡುತ್ತೇನೆ", transliteration: "naanu pratidina vyaayaama maaduttene", englishMeaning: "I exercise every day", category: "sentences", difficulty: "advanced", orderIndex: 1 },
  { kannadaText: "ಡಾಕ್ಟರ್ ನನ್ನನ್ನು ನೋಡಿದರು", transliteration: "daaktar nannanu noodidaru", englishMeaning: "The doctor examined me", category: "sentences", difficulty: "advanced", orderIndex: 2 },
];

const samplePatients = [
  { 
    name: "ರಾಮಸ್ವಾಮಿ (Ramaswamy)", 
    email: "ramaswamy@example.com",
    password: "password123",
    role: "patient" as const,
    age: 67, 
    condition: "Post-stroke aphasia, mild", 
    therapistNotes: "Good motivation, responds well to positive reinforcement" 
  },
  { 
    name: "ಸರಸ್ವತಿ (Saraswathi)", 
    email: "saraswathi@example.com",
    password: "password123",
    role: "patient" as const,
    age: 72, 
    condition: "Post-stroke apraxia of speech", 
    therapistNotes: "Needs extra time, improved consistency over last 2 weeks" 
  },
  { 
    name: "ವೆಂಕಟೇಶ (Venkatesh)", 
    email: "venkatesh@example.com",
    password: "password123",
    role: "patient" as const,
    age: 58, 
    condition: "Post-stroke mild aphasia", 
    therapistNotes: "High motivation, practices daily at home" 
  },
  {
    name: "Therapist Admin",
    email: "therapist@example.com",
    password: "password123",
    role: "therapist" as const,
    age: 35,
    condition: "N/A",
    therapistNotes: "Admin therapist account"
  }
];

async function seed() {
  console.log("Seeding exercises...");
  
  const existing = await db.select().from(exercisesTable).limit(1);
  if (existing.length > 0) {
    console.log("Exercises already seeded, skipping.");
  } else {
    await db.insert(exercisesTable).values(exercises);
    console.log(`Inserted ${exercises.length} exercises.`);
  }

  const existingPatients = await db.select().from(patientsTable).limit(1);
  if (existingPatients.length > 0) {
    console.log("Patients already seeded, skipping.");
  } else {
    await db.insert(patientsTable).values(samplePatients);
    console.log(`Inserted ${samplePatients.length} sample patients.`);
  }

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
