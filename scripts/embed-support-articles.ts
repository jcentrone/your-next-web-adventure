import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.VITE_OPENAI_API_KEY });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function getDocs() {
  const pagesDir = path.resolve('src/pages');
  const entries = fs.readdirSync(pagesDir);
  return entries
    .filter((file) => {
      const content = fs.readFileSync(path.join(pagesDir, file), 'utf8');
      return content.toLowerCase().includes('documentation');
    })
    .map((file) => {
      const content = fs.readFileSync(path.join(pagesDir, file), 'utf8');
      return { title: path.parse(file).name, content };
    });
}

async function main() {
  const docs = getDocs();
  for (const doc of docs) {
    const embedding = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: doc.content,
    });

    const { error } = await supabase.from('support_articles').insert({
      title: doc.title,
      content: doc.content,
      embedding: embedding.data[0].embedding,
    });

    if (error) {
      console.error('Error inserting support article', error);
    } else {
      console.log(`Inserted ${doc.title}`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
