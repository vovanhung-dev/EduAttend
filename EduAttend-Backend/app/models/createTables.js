const db = require('../config/db');

const createTables = async () => {
    try {
        // Create "users" table if it does not exist
        await db.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                phone VARCHAR(255),
                username VARCHAR(255),
                password VARCHAR(255) NOT NULL,
                role VARCHAR(255),
                status VARCHAR(255) DEFAULT 'noactive',
                image VARCHAR(255) DEFAULT 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png',
                full_name VARCHAR(255) NOT NULL,
                phone_number VARCHAR(15) NOT NULL,
                class VARCHAR(50) DEFAULT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
            `);


        console.log('Table "users" created or already exists.');



        // Tạo bảng "password_reset_tokens" nếu chưa tồn tại
        await db.execute(`
        CREATE TABLE IF NOT EXISTS password_reset_tokens (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            token VARCHAR(255) NOT NULL,
            expires_at TIMESTAMP NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
        `);

        console.log('Table "password_reset_tokens" created or already exists.');

        // Tạo bảng "class" nếu chưa tồn tại
        await db.execute(`
            CREATE TABLE IF NOT EXISTS class (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) UNIQUE NOT NULL,
                description TEXT,
                image VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
            `);

        console.log('Table "class" created or already exists.');

        // Create the junction table "class_users" to manage the many-to-many relationship
        await db.execute(`
          CREATE TABLE IF NOT EXISTS class_users (
              class_id INT NOT NULL,
              user_id INT NOT NULL,
              PRIMARY KEY (class_id, user_id),
              FOREIGN KEY (class_id) REFERENCES class(id),
              FOREIGN KEY (user_id) REFERENCES users(id)
          )
      `);

        // Tạo bảng "exam_schedule" nếu chưa tồn tại
        await db.execute(`
    CREATE TABLE IF NOT EXISTS exam_schedule (
        id INT AUTO_INCREMENT PRIMARY KEY,
        subject VARCHAR(255) NOT NULL,
        class_id INT NOT NULL,
        teacher_id INT,
        exam_date DATE,
        start_time TIME,
        end_time TIME,
        room VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (class_id) REFERENCES class(id),
        FOREIGN KEY (teacher_id) REFERENCES users(id)
    )
`);

        console.log('Table "exam_schedule" created or already exists.');



    } catch (error) {
        console.error('Error creating tables:', error);
    }
};

createTables();
