import Database from 'better-sqlite3';
import * as fs from 'node:fs';
import * as path from 'node:path';

const dbPath = path.resolve(process.cwd(), 'database.sqlite');
const db = new Database(dbPath);

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS news (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE,
    image TEXT,
    tag TEXT,
    title TEXT,
    description TEXT,
    link TEXT,
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS manual_groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_key TEXT,
    product_id TEXT,
    product_data TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(group_key, product_id)
  );
`);

const newsJsonPath = path.resolve(process.cwd(), 'app/data/news.json');
const groupsJsonPath = path.resolve(process.cwd(), 'app/data/manual-groups.json');

// Migrate News
if (fs.existsSync(newsJsonPath)) {
    console.log('Migrating news.json...');
    const newsData = JSON.parse(fs.readFileSync(newsJsonPath, 'utf-8'));
    const insertNews = db.prepare(`
        INSERT OR IGNORE INTO news (slug, image, tag, title, description, link, content)
        VALUES (@slug, @image, @tag, @title, @description, @link, @content)
    `);
    
    db.transaction(() => {
        for (const item of newsData) {
            insertNews.run({
                slug: item.slug || '',
                image: item.image || '',
                tag: item.tag || '',
                title: item.title || '',
                description: item.description || '',
                link: item.link || '',
                content: item.content || ''
            });
        }
    })();
}

// Migrate Groups
if (fs.existsSync(groupsJsonPath)) {
    console.log('Migrating manual-groups.json...');
    const groupsData = JSON.parse(fs.readFileSync(groupsJsonPath, 'utf-8'));
    const insertGroup = db.prepare(`
        INSERT OR IGNORE INTO manual_groups (group_key, product_id, product_data)
        VALUES (@group_key, @product_id, @product_data)
    `);
    
    db.transaction(() => {
        for (const groupKey in groupsData) {
            const products = groupsData[groupKey];
            if (Array.isArray(products)) {
                for (const product of products) {
                    insertGroup.run({
                        group_key: groupKey,
                        product_id: String(product.id || product.productId),
                        product_data: JSON.stringify(product)
                    });
                }
            }
        }
    })();
}

console.log('Migration complete.');
const newsCount = db.prepare('SELECT COUNT(*) as count FROM news').get();
const groupsCount = db.prepare('SELECT COUNT(*) as count FROM manual_groups').get();
console.log(`Summary: ${newsCount.count} news items, ${groupsCount.count} product group entries.`);

db.close();
