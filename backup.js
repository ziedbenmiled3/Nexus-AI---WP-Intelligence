import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const DB_FILE = 'nexus.db';
const BACKUP_DIR = path.resolve(process.cwd(), 'backups');
const MAX_BACKUPS = 7; // Limit retention to 7 daily snapshots

async function runBackup() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║       NEXUS SYSTEM AUTOMATED DATABASE BACKUP SYSTEM      ║');
  console.log('║               ENGINEER & CYBERSECURITY AUDIT             ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  
  if (!fs.existsSync(DB_FILE)) {
    console.error(`❌ Source database "${DB_FILE}" not found. No backup required.`);
    process.exit(0);
  }

  // Ensure backups directory exists
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    console.log(`📁 Created backup repository at: ${BACKUP_DIR}`);
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFileName = `nexus_backup_${timestamp}.db`;
  const backupPath = path.join(BACKUP_DIR, backupFileName);

  console.log(`⏱️ Initializing safe hot-backup process for "${DB_FILE}"...`);
  
  try {
    const db = new Database(DB_FILE);
    
    // safe better-sqlite3 hot-backup operation
    await db.backup(backupPath);
    console.log(`✅ Safe hot-backup snapshot created: ${backupFileName}`);
    
    // Close temporary connection
    db.close();

    // Rotate old backups (keep last 7)
    rotateBackups();
    
    console.log('🏁 Backup protocol successfully executed.');
  } catch (error) {
    console.error('❌ Hot-backup protocol failed:', error);
    process.exit(1);
  }
}

function rotateBackups() {
  console.log('🔄 Checking backup retention and rotation quotas...');
  try {
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(file => file.startsWith('nexus_backup_') && file.endsWith('.db'))
      .map(file => {
        const fullPath = path.join(BACKUP_DIR, file);
        return {
          name: file,
          path: fullPath,
          time: fs.statSync(fullPath).mtime.getTime()
        };
      })
      .sort((a, b) => b.time - a.time); // Sort newest first

    console.log(`📊 Currently storing ${files.length}/${MAX_BACKUPS} historical snapshots.`);

    if (files.length > MAX_BACKUPS) {
      const oldFiles = files.slice(MAX_BACKUPS);
      console.log(`🗑️ Found ${oldFiles.length} expired snapshot(s). Initiating purging...`);
      for (const file of oldFiles) {
        fs.unlinkSync(file.path);
        console.log(`   Purged: ${file.name}`);
      }
    } else {
      console.log('✨ Retention quota complies with storage policy. No rotation required.');
    }
  } catch (err) {
    console.error('⚠️ Rotation policy enforcement error:', err.message);
  }
}

runBackup();
