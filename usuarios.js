const sqlite3 = require('sqlite3').verbose();

// Conectar a la base de datos SQLite (crear usuarios.db si no existe)
let db = new sqlite3.Database('./database.db');

// Insertar usuarios de ejemplo
const usuarios = [
    { username: 'admin', password: 'admin123', isAdmin: 1 },
    { username: 'user1', password: 'user123', isAdmin: 0 }
];

// Crear la tabla de usuarios si no existe
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        isAdmin INTEGER DEFAULT 0
    )`, (err) => {
        if (err) {
            console.error('Error al crear la tabla de usuarios:', err.message);
        } else {
            console.log('Tabla de usuarios creada correctamente');
        }
    });

    // Insertar usuarios en la tabla
    usuarios.forEach(usuario => {
        db.run('INSERT INTO users (username, password, isAdmin) VALUES (?, ?, ?)',
            [usuario.username, usuario.password, usuario.isAdmin],
            (err) => {
                if (err) {
                    console.error('Error al insertar usuario:', err.message);
                } else {
                    console.log(`Usuario ${usuario.username} insertado correctamente`);
                }
            }
        );
    });
});

// Cerrar la conexión a la base de datos
db.close();
