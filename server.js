const express = require('express');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT||3000;

// Configurar middleware
app.set('view engine', 'ejs'); // Motor de plantillas EJS
app.use(express.static('public')); // Carpeta para archivos estáticos
app.use(bodyParser.urlencoded({ extended: true })); // Parsear body de las peticiones POST

// Configurar middleware para manejar sesiones
app.use(session({
    secret: 'secret-key', // Cambiar por una clave segura en producción
    resave: false,
    saveUninitialized: true,
}));

// Conectar a la base de datos SQLite
let db = new sqlite3.Database('./database.db'); // Conectar a la base de datos database.db

// Middleware para verificar si el usuario está autenticado
function requireLogin(req, res, next) {
    if (req.session.userId) {
        next(); // Permitir acceso si el usuario está autenticado
    } else {
        res.redirect('/login'); // Redirigir al inicio de sesión si no hay sesión activa
    }
}

// Middleware para verificar si el usuario es administrador
function requireAdmin(req, res, next) {
    if (req.session.userId) {
        db.get('SELECT isAdmin FROM users WHERE id = ?', [req.session.userId], (err, user) => {
            if (err) {
                throw err;
            }
            if (user && user.isAdmin === 1) {
                next(); // Permitir acceso si es administrador
            } else {
                res.send('Acceso denegado');
            }
        });
    } else {
        res.redirect('/login'); // Redirigir al inicio de sesión si no hay sesión activa
    }
}

// Rutas
app.get('/', requireLogin, (req, res) => {
    db.all('SELECT * FROM data', (err, rows) => {
        if (err) {
            throw err;
        }
        const isAdmin = req.session.isAdmin === 1; // Verificar si el usuario es administrador
        res.render('index', { data: rows, isAdmin });
    });
});

app.get('/edit/:id', requireAdmin, (req, res) => {
    const id = req.params.id;
    db.get('SELECT * FROM data WHERE id = ?', [id], (err, row) => {
        if (err) {
            throw err;
        }
        res.render('edit', { item: row });
    });
});

app.post('/edit/:id', requireAdmin, (req, res) => {
    const id = req.params.id;
    const { categoria, nombre, descripcion, link, vigencia } = req.body;
    db.run('UPDATE data SET categoria = ?, nombre = ?, descripcion = ?, link = ?, vigencia = ? WHERE id = ?', [categoria, nombre, descripcion, link, vigencia, id], (err) => {
        if (err) {
            throw err;
        }
        res.redirect('/');
    });
});

app.get('/new', requireAdmin, (req, res) => {
    res.render('new');
});

app.post('/new', requireAdmin, (req, res) => {
    const { categoria, nombre, descripcion, link, vigencia } = req.body;
    db.run('INSERT INTO data (categoria, nombre, descripcion, link, vigencia) VALUES (?, ?, ?, ?, ?)', [categoria, nombre, descripcion, link, vigencia], (err) => {
        if (err) {
            throw err;
        }
        res.redirect('/');
    });
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, user) => {
        if (err) {
            throw err;
        }
        if (user) {
            req.session.userId = user.id; // Almacenar el ID del usuario en la sesión
            req.session.isAdmin = user.isAdmin; // Almacenar si el usuario es administrador en la sesión
            res.redirect('/');
        } else {
            res.send('Credenciales incorrectas');
        }
    });
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error(err);
        }
        res.redirect('/');
    });
});

app.post('/delete/:id', requireAdmin, (req, res) => {
    const id = req.params.id;
    db.run('DELETE FROM data WHERE id = ?', [id], (err) => {
        if (err) {
            throw err;
        }
        res.redirect('/');
    });
});


// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
