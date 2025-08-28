import dotenv from "dotenv";
import path from "path";
import { MongoClient } from 'mongodb'

async function getDb() {
  const envPath = path.resolve(__dirname, "..", ".env");
  dotenv.config({ path: envPath });
  const uri = process.env.DATABASE_URL;
  if (!uri) throw new Error('DATABASE_URL must be set');
  const client = new MongoClient(uri);
  await client.connect();
  const dbName = (() => { try { const u = new URL(uri); const p = u.pathname?.replace(/^\//,''); return p || 'smart_grocery' } catch { return 'smart_grocery' } })();
  return { db: client.db(dbName), client };
}

async function main() {
  const { db, client } = await getDb();
  const Products = db.collection('Product');

  const updates = [
    {
      name: 'Organic Bell Peppers',
      update: {
        $set: {
          imageUrl: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?q=80&w=800&auto=format&fit=crop',
          images: [
            { url: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?q=80&w=1200&auto=format&fit=crop', alt: 'Bell peppers', isPrimary: true }
          ]
        }
      }
    },
    {
      name: 'Local Strawberries',
      update: {
        $set: {
          imageUrl: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?q=80&w=800&auto=format&fit=crop',
          images: [
            { url: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?q=80&w=1200&auto=format&fit=crop', alt: 'Strawberries', isPrimary: true }
          ]
        }
      }
    }
  ];

  for (const u of updates) {
    const res = await Products.updateOne({ name: u.name }, u.update as any);
    console.log(`Updated ${u.name}: matched=${res.matchedCount}, modified=${res.modifiedCount}`);
  }

  await client.close();
}

main().catch((e) => {
  console.error('❌ Update failed:', e);
  process.exit(1);
});


