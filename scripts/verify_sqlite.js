import Database from 'better-sqlite3';
import * as path from 'node:path';

const dbPath = path.resolve(process.cwd(), 'database.sqlite');
const db = new Database(dbPath);

console.log('Checking SQLite database at:', dbPath);

try {
    const newsCount = db.prepare('SELECT COUNT(*) as count FROM news').get();
    console.log('News items in SQLite:', newsCount.count);
    
    if (newsCount.count > 0) {
        const firstNews = db.prepare('SELECT title FROM news LIMIT 1').get();
        console.log('Sample news title:', firstNews.title);
    }

    const groupsCount = db.prepare('SELECT COUNT(*) as count FROM manual_groups').get();
    console.log('Manual group items in SQLite:', groupsCount.count);

    if (groupsCount.count > 0) {
        const sampleGroup = db.prepare('SELECT group_key, product_id FROM manual_groups LIMIT 1').get();
        console.log('Sample group item:', sampleGroup.group_key, '-', sampleGroup.product_id);
    }

    const groups = db.prepare('SELECT DISTINCT group_key FROM manual_groups').all();
    console.log('Available groups:', groups.map(g => g.group_key).join(', '));

} catch (e) {
    console.error('Verification failed:', e.message);
} finally {
    db.close();
}
