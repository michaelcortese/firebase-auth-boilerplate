const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const charities = [
  {
    name: "Red Cross",
    description: "Providing emergency assistance, disaster relief, and disaster preparedness education.",
    category: "Disaster Relief",
    location: "International",
    website: "https://www.redcross.org",
    createdAt: new Date().toISOString(),
  },
  {
    name: "UNICEF",
    description: "Working in over 190 countries for children's rights, survival, development and protection.",
    category: "Children",
    location: "Global",
    website: "https://www.unicef.org",
    createdAt: new Date().toISOString(),
  },
];

async function seedCharities() {
  const db = admin.firestore();
  const batch = db.batch();

  charities.forEach((charity) => {
    const ref = db.collection("charities").doc();
    batch.set(ref, charity);
  });

  await batch.commit();
  console.log("Charities seeded successfully");
}

seedCharities().then(() => process.exit());
