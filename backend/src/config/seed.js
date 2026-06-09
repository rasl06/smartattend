require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const bcrypt = require('bcryptjs');
const { pool, testConnection } = require('./db');

async function seed() {
  await testConnection();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Кафедра
    const dept = await client.query(
      `INSERT INTO departments (name) VALUES ($1)
       ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      ['Информационные технологии']
    );
    const deptId = dept.rows[0].id;

    // Группа
    const grp = await client.query(
      `INSERT INTO groups (name, year, department_id) VALUES ($1,$2,$3)
       ON CONFLICT (name) DO UPDATE SET year = EXCLUDED.year
       RETURNING id`,
      ['КВТп 22-9', 2022, deptId]
    );
    const groupId = grp.rows[0].id;

    // Пароли
    const hash = (pw) => bcrypt.hashSync(pw, 10);

    // Пользователи
    const admin = await client.query(
      `INSERT INTO users (role,full_name,email,password_hash) VALUES ($1,$2,$3,$4)
       ON CONFLICT (email) DO UPDATE SET full_name=EXCLUDED.full_name RETURNING id`,
      ['admin','Администратор Системы','admin@smartattend.kz', hash('Admin123!')]
    );

    const teacher = await client.query(
      `INSERT INTO users (role,full_name,email,password_hash) VALUES ($1,$2,$3,$4)
       ON CONFLICT (email) DO UPDATE SET full_name=EXCLUDED.full_name RETURNING id`,
      ['teacher','Иванов Иван Иванович','teacher@smartattend.kz', hash('Teacher123!')]
    );
    const teacherId = teacher.rows[0].id;

    const student = await client.query(
      `INSERT INTO users (role,full_name,email,password_hash) VALUES ($1,$2,$3,$4)
       ON CONFLICT (email) DO UPDATE SET full_name=EXCLUDED.full_name RETURNING id`,
      ['student','Зульяр Расул','student@smartattend.kz', hash('Student123!')]
    );
    const studentId = student.rows[0].id;

    // Дополнительные студенты для демо
    const extraStudents = [
      ['Ахметов Алибек', 'alibek@smartattend.kz'],
      ['Нурланова Айгерим', 'aigerim@smartattend.kz'],
      ['Сейткали Диас', 'dias@smartattend.kz'],
      ['Жаксыбекова Дана', 'dana@smartattend.kz'],
    ];
    const extraIds = [];
    for (const [name, email] of extraStudents) {
      const r = await client.query(
        `INSERT INTO users (role,full_name,email,password_hash) VALUES ($1,$2,$3,$4)
         ON CONFLICT (email) DO UPDATE SET full_name=EXCLUDED.full_name RETURNING id`,
        ['student', name, email, hash('Student123!')]
      );
      extraIds.push(r.rows[0].id);
    }

    // Дисциплины
    const subjects = [
      ['Программирование на Python', 'CS101'],
      ['Базы данных', 'DB201'],
      ['Веб-разработка', 'WEB301'],
    ];
    const subjectIds = [];
    for (const [name, code] of subjects) {
      const r = await client.query(
        `INSERT INTO subjects (name,code,hours_total) VALUES ($1,$2,$3)
         ON CONFLICT (code) DO UPDATE SET name=EXCLUDED.name RETURNING id`,
        [name, code, 60]
      );
      subjectIds.push(r.rows[0].id);
    }

    // Зачисление студентов в группу
    for (const sid of [studentId, ...extraIds]) {
      await client.query(
        `INSERT INTO enrollments (student_id,group_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
        [sid, groupId]
      );
    }

    // Занятия
    const now = new Date();
    const todayStart = new Date(now); todayStart.setHours(9,0,0,0);
    const todayEnd   = new Date(now); todayEnd.setHours(10,30,0,0);

    const classResult = await client.query(
      `INSERT INTO classes (subject_id,teacher_id,room,lat,lng,starts_at,ends_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
      [subjectIds[0], teacherId, 'A-301', 43.238949, 76.889709, todayStart, todayEnd]
    );
    const classId = classResult.rows[0].id;

    await client.query(
      `INSERT INTO class_groups (class_id,group_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
      [classId, groupId]
    );

    // Несколько записей посещаемости для демо
    await client.query(
      `INSERT INTO attendance_logs (class_id,student_id,status,lat,lng)
       VALUES ($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING`,
      [classId, studentId, 'present', 43.238950, 76.889710]
    );
    await client.query(
      `INSERT INTO attendance_logs (class_id,student_id,status)
       VALUES ($1,$2,$3) ON CONFLICT DO NOTHING`,
      [classId, extraIds[0], 'late']
    );

    await client.query('COMMIT');
    console.log('✓ Seed completed successfully');
    console.log('  Admin:   admin@smartattend.kz    / Admin123!');
    console.log('  Teacher: teacher@smartattend.kz  / Teacher123!');
    console.log('  Student: student@smartattend.kz  / Student123!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seed failed:', err);
  } finally {
    client.release();
    process.exit(0);
  }
}

seed();
