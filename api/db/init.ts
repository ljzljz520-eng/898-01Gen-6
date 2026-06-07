import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDatabase, getDb, runQuery, runExecute, saveDatabase } from './database.js';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runMigrations(): Promise<void> {
  const db = await initDatabase();
  const migrationsDir = path.join(__dirname, '..', '..', 'migrations');
  
  if (fs.existsSync(migrationsDir)) {
    const migrationFiles = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();
    
    for (const file of migrationFiles) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      console.log(`Running migration: ${file}`);
      db.exec(sql);
    }
    saveDatabase();
  }
}

export async function seedData(): Promise<void> {
  await initDatabase();
  
  const users = runQuery('SELECT COUNT(*) as count FROM users');
  if (users[0].count > 0) {
    console.log('Database already seeded, skipping...');
    return;
  }

  console.log('Seeding database...');
  
  const hashedPassword = bcrypt.hashSync('password123', 10);

  const samplePhotos1 = JSON.stringify([
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=portrait%20photography%20model%20elegant%20fashion&image_size=square_hd',
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=outdoor%20portrait%20natural%20light%20model&image_size=square_hd',
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=editorial%20fashion%20photography%20model&image_size=square_hd'
  ]);

  const samplePhotos2 = JSON.stringify([
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=landscape%20photography%20sunset%20mountains&image_size=square_hd',
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=street%20photography%20urban%20night&image_size=square_hd',
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=portrait%20photography%20studio%20lighting&image_size=square_hd'
  ]);

  const avatar1 = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20headshot%20portrait%20young%20woman%20model&image_size=square';
  const avatar2 = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20headshot%20portrait%20young%20man%20photographer&image_size=square';
  const avatar3 = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20headshot%20portrait%20asian%20woman%20model&image_size=square';
  const avatar4 = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20headshot%20portrait%20asian%20man%20photographer&image_size=square';

  runExecute(
    `INSERT INTO users (username, password_hash, avatar, role, real_name, phone, city, styles, bio, credit_score, sample_photos)
     VALUES (?, ?, ?, 'model', ?, ?, ?, ?, ?, 100, ?)`,
    ['model_xiaoyue', hashedPassword, avatar1, '小月', '13800138001', '上海', JSON.stringify(['人像', '时尚', '复古']), '专业模特，擅长时尚人像和复古风格，3年拍摄经验。', samplePhotos1]
  );

  runExecute(
    `INSERT INTO users (username, password_hash, avatar, role, real_name, phone, city, styles, bio, credit_score, sample_photos)
     VALUES (?, ?, ?, 'photographer', ?, ?, ?, ?, ?, 95, ?)`,
    ['photo_liwei', hashedPassword, avatar2, '李伟', '13800138002', '北京', JSON.stringify(['人像', '风光', '街拍']), '自由摄影师，专注人像摄影5年，擅长自然光拍摄。', samplePhotos2]
  );

  runExecute(
    `INSERT INTO users (username, password_hash, avatar, role, real_name, phone, city, styles, bio, credit_score, sample_photos)
     VALUES (?, ?, ?, 'model', ?, ?, ?, ?, ?, 98, ?)`,
    ['model_chenxi', hashedPassword, avatar3, '陈曦', '13800138003', '广州', JSON.stringify(['汉服', '古风', '森系']), '兼职模特，热爱古风和汉服文化，表现力强。', samplePhotos1]
  );

  runExecute(
    `INSERT INTO users (username, password_hash, avatar, role, real_name, phone, city, styles, bio, credit_score, sample_photos)
     VALUES (?, ?, ?, 'photographer', ?, ?, ?, ?, ?, 92, ?)`,
    ['photo_wangjie', hashedPassword, avatar4, '王杰', '13800138004', '深圳', JSON.stringify(['商业', '产品', '活动']), '商业摄影师，服务过多家知名品牌。', samplePhotos2]
  );

  const today = new Date();
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const nextMonth = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  const next2Weeks = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);

  const schedulePhotos1 = JSON.stringify([
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fashion%20outdoor%20shooting%20shanghai%20bund&image_size=square_hd',
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=portrait%20shooting%20urban%20background&image_size=square_hd'
  ]);

  const schedulePhotos2 = JSON.stringify([
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=studio%20portrait%20lighting%20setup&image_size=square_hd',
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=creative%20portrait%20photography&image_size=square_hd'
  ]);

  runExecute(
    `INSERT INTO schedules (user_id, title, city, date, style, fee, fee_type, fee_note, duration, work_requirements, contact, description, sample_photos, status)
     VALUES (?, ?, ?, ?, ?, 500, 'paid', ?, ?, ?, ?, ?, ?, 'active')`,
    [1, '上海外滩时尚街拍', '上海', nextWeek.toISOString().split('T')[0], JSON.stringify(['时尚', '街拍']), '包含服装和化妆费用', '4小时', '需要有街拍经验，表现力强', '微信：photo_liwei', '上海外滩时尚街拍，需要表现力强的模特，提供服装造型。', schedulePhotos1]
  );

  runExecute(
    `INSERT INTO schedules (user_id, title, city, date, style, fee, fee_type, fee_note, duration, work_requirements, contact, description, sample_photos, status)
     VALUES (?, ?, ?, ?, ?, 0, 'free', ?, ?, ?, ?, ?, ?, 'active')`,
    [2, '北京798艺术区人像创作', '北京', nextMonth.toISOString().split('T')[0], JSON.stringify(['人像', '复古']), '互勉创作，原片全送，精修10张', '6小时', '需要有气质，愿意尝试不同风格', '微信：model_xiaoyue', '免费互勉创作，寻找有气质的模特共同创作人像作品。', schedulePhotos2]
  );

  runExecute(
    `INSERT INTO schedules (user_id, title, city, date, style, fee, fee_type, fee_note, duration, work_requirements, contact, description, sample_photos, status)
     VALUES (?, ?, ?, ?, ?, 0, 'negotiable', ?, ?, ?, ?, ?, ?, 'active')`,
    [3, '广州岭南园林汉服拍摄', '广州', next2Weeks.toISOString().split('T')[0], JSON.stringify(['汉服', '古风']), '可互勉可付费，具体面议', '3小时', '需要有汉服拍摄经验，自备汉服更佳', '微信：model_chenxi', '汉服主题拍摄，可互勉可付费，具体面议。', schedulePhotos1]
  );

  runExecute(
    `INSERT INTO schedules (user_id, title, city, date, style, fee, fee_type, fee_note, duration, work_requirements, contact, description, sample_photos, status)
     VALUES (?, ?, ?, ?, ?, 800, 'paid', ?, ?, ?, ?, ?, ?, 'active')`,
    [4, '深圳商业产品模特拍摄', '深圳', nextWeek.toISOString().split('T')[0], JSON.stringify(['商业', '产品']), '800元/天，包含午餐', '8小时', '需要有商业拍摄经验，身高175以上', '微信：photo_wangjie', '商业产品拍摄，需要有经验的模特。', schedulePhotos2]
  );

  runExecute(
    `INSERT INTO shooting_plans (schedule_id, requester_id, recipient_id, status, shooting_date, shooting_location, notes, confirmed_at)
     VALUES (1, 2, 1, 'confirmed', ?, '上海外滩', '上午9点集合，准备3套服装', ?)`,
    [nextWeek.toISOString().split('T')[0], new Date().toISOString()]
  );

  runExecute(
    `INSERT INTO shooting_plans (schedule_id, requester_id, recipient_id, status, shooting_date, shooting_location, notes)
     VALUES (2, 3, 2, 'pending', ?, '北京798艺术区', '希望能拍摄复古风格')`,
    [nextMonth.toISOString().split('T')[0]]
  );

  const workImages = [
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20portrait%20photography%20elegant%20woman&image_size=portrait_4_3',
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fashion%20editorial%20photography%20model&image_size=portrait_4_3',
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=artistic%20portrait%20dramatic%20lighting&image_size=portrait_4_3',
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=outdoor%20portrait%20golden%20hour&image_size=portrait_4_3'
  ];

  runExecute(
    `INSERT INTO works (shooting_plan_id, uploader_id, photographer_id, model_id, title, description, image_url, visibility, photographer_confirmed, model_confirmed)
     VALUES (1, 2, 2, 1, '都市丽人', '上海外滩拍摄的时尚人像作品', ?, 'public', 1, 1)`,
    [workImages[0]]
  );

  runExecute(
    `INSERT INTO works (shooting_plan_id, uploader_id, photographer_id, model_id, title, description, image_url, visibility, photographer_confirmed, model_confirmed)
     VALUES (1, 2, 2, 1, '光影之间', '利用午后光线创作的人像作品', ?, 'both', 1, 1)`,
    [workImages[1]]
  );

  runExecute(
    `INSERT INTO works (shooting_plan_id, uploader_id, photographer_id, model_id, title, description, image_url, visibility, photographer_confirmed, model_confirmed)
     VALUES (1, 2, 2, 1, '夜色迷情', '夜景人像创作', ?, 'private', 1, 0)`,
    [workImages[2]]
  );

  runExecute(
    `INSERT INTO works (shooting_plan_id, uploader_id, photographer_id, model_id, title, description, image_url, visibility, photographer_confirmed, model_confirmed)
     VALUES (1, 2, 2, 1, '街角邂逅', '街拍风格人像', ?, 'public', 1, 1)`,
    [workImages[3]]
  );

  console.log('Database seeded successfully!');
  console.log('Test accounts:');
  console.log('  - model_xiaoyue / password123 (模特)');
  console.log('  - photo_liwei / password123 (摄影师)');
  console.log('  - model_chenxi / password123 (模特)');
  console.log('  - photo_wangjie / password123 (摄影师)');
}
