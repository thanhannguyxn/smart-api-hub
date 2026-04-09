import fs from 'fs';
import { db } from './knex';

export async function runMigration() {
  try {
    
    if (!fs.existsSync('./db.json')) {
      console.log('Không tìm thấy file db.json, bỏ qua quá trình tự động tạo bảng (Migration).');
      return;
    }

    const raw = fs.readFileSync('./db.json', 'utf-8');
    const schema = JSON.parse(raw);

    for (const tableName of Object.keys(schema)) {
      const exists = await db.schema.hasTable(tableName);
      
      if (!exists) {
        const rows = schema[tableName];
        if (rows.length === 0) continue; 
        
        const sample = rows[0];
        
        
        await db.schema.createTable(tableName, (table) => {
          table.increments('id').primary(); 
          
          Object.entries(sample).forEach(([col, val]) => {
            if (col === 'id') return; 
            
            
            if (typeof val === 'number') table.integer(col);
            else if (typeof val === 'boolean') table.boolean(col);
            else table.text(col);
          });
          
          table.timestamps(true, true);
        });
        
        await db(tableName).insert(rows);
        console.log(`Đã tạo bảng: ${tableName}`);
        await db.raw(`SELECT setval('"${tableName}_id_seq"', (SELECT MAX(id) FROM "${tableName}"))`);
        
      } else {
        console.log(`Bảng '${tableName}' đã tồn tại.`);
      }
    }
    
    console.log('Quá trình kiểm tra và cập nhật Database hoàn tất!');
    
  } catch (error) {
    console.error("Lỗi trong quá trình Migration:", error);
  }
}