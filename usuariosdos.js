const sqlite3 = require('sqlite3').verbose();

// Conectar a la base de datos SQLite (crear database.db si no existe)
let db = new sqlite3.Database('./database.db');

// Crear y configurar la tabla de usuarios
db.serialize(() => {
    // Crear la tabla de usuarios si no existe
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        isAdmin INTEGER DEFAULT 0,
        roles TEXT
    )`, (err) => {
        if (err) {
            console.error('Error al crear la tabla de usuarios:', err.message);
        } else {
            console.log('Tabla de usuarios creada correctamente');
        }
    });

    // Agregar la columna roles si no existe
    db.run(`ALTER TABLE users ADD COLUMN roles TEXT`, (err) => {
        if (err && !err.message.includes("duplicate column name")) {
            console.error('Error al agregar la columna roles:', err.message);
        } else {
            console.log('La columna roles ya existe o fue agregada correctamente');
        }
    });

    // Insertar usuarios de ejemplo con roles personalizados
    const usuarios = [
        { username: 'admin', password: 'Farmacia2024*', isAdmin: 1, roles: 'Ventas,Compras,Stock,RRHH,Gerencia' },
        { username: 'compras', password: 'Farmacia2024*', isAdmin: 0, roles: 'Compras,Stock' },
        { username: 'rrhh', password: 'Farmacia2024*', isAdmin: 0, roles: 'RRHH' },
        { username: 'ventas', password: 'Farmacia2024*', isAdmin: 0, roles: 'Ventas' },
        { username: 'gerencia', password: 'Farmacia2024*', isAdmin: 0, roles: 'Ventas,Compras,Stock,RRHH,Gerencia' },
        { username: 'supervisores', password: 'Farmacia2024*', isAdmin: 0, roles: 'Ventas,Compras,Stock,RRHH,Gerencia' },
    ];

    // Insertar cada usuario en la tabla
    usuarios.forEach(usuario => {
        db.run('INSERT OR IGNORE INTO users (username, password, isAdmin, roles) VALUES (?, ?, ?, ?)',
            [usuario.username, usuario.password, usuario.isAdmin, usuario.roles],
            (err) => {
                if (err) {
                    console.error(`Error al insertar usuario ${usuario.username}:`, err.message);
                } else {
                    console.log(`Usuario ${usuario.username} insertado correctamente`);
                }
            }
        );
    });
});
;

// Cerrar la conexión a la base de datos
db.close((err) => {
    if (err) {
        console.error('Error al cerrar la conexión a la base de datos:', err.message);
    } else {
        console.log('Conexión a la base de datos cerrada correctamente');
    }
});
