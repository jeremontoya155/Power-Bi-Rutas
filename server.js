const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Configurar el motor de plantillas EJS
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

// Conectar a la base de datos SQLite (usando un archivo en lugar de en memoria)
let db = new sqlite3.Database('./database.db');

// Crear la tabla si no existe
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        categoria TEXT,
        nombre TEXT,
        descripcion TEXT,
        link TEXT,
        vigencia TEXT
    )`, (err) => {
        if (err) {
            console.error(err.message);
        } else {
            // Comprobar si la tabla está vacía
            db.get('SELECT COUNT(*) AS count FROM data', (err, row) => {
                if (err) {
                    console.error(err.message);
                } else if (row.count === 0) {
                    // Insertar datos iniciales si la tabla está vacía
                    let insert = db.prepare(`INSERT INTO data (categoria, nombre, descripcion, link, vigencia) VALUES (?, ?, ?, ?, ?)`);
                    insert.run('Compras', 'Comparaciones Variante Copia N', 'Controlar Unidades-Facturacion-Tickets Por categorias subcategorias Marcas y laboratorios', 'Link', 'Vigente');
                    insert.run('Ventas', 'Completo Turnero 1.0', 'Analisis de Venta de sucursales y empleados por zona horaria y tipo de venta', 'Link', 'Vigente');
                    insert.run('Ventas', 'Completo Convenios 1.0', 'Analisis de Venta de Convenios-Cantidad de empleados asociados y cuanto uso tuvo el beneficio del convenio', 'Link', 'Vigente');
                    insert.run('Seguimentos Stock', 'Stock 1.1', 'Stock De sucursales Quiebres y movimientos en si por sucursal', 'Link', 'En Proceso');
                    insert.run('Informe de incentivos', 'Completo Analisis', 'Compras sobre ventas - Mal Entregados,Cajas y pendientes', 'Link', 'En revision');
                    insert.run('Eccomerce', 'Eccomerce 1.0', 'Analisis de Venta de sucursales y empleados por zona horaria y tipo de venta para las ventas de Eccomerce', 'Link', 'En Proceso');
                    insert.run('Ventas Call', 'Ventas Call 1.0', 'Analisis de Venta de sucursales y empleados por zona horaria y tipo de venta para las ventas de Eccomerce', 'Link', 'En Proceso');
                    insert.run('Recetas y Medicos', 'Medicos 1.0', 'Ver Avance de obras sociales por recetas y venta sumado a rendimiento de los medicos, monodrogas y laboratorios', 'Link', 'En revision');
                    insert.finalize();
                }
            });
        }
    });
});

// Ruta para mostrar los datos
app.get('/', (req, res) => {
    db.all('SELECT * FROM data', (err, rows) => {
        if (err) {
            throw err;
        }
        res.render('index', { data: rows });
    });
});

// Ruta para mostrar el formulario de edición
app.get('/edit/:id', (req, res) => {
    const id = req.params.id;
    db.get('SELECT * FROM data WHERE id = ?', [id], (err, row) => {
        if (err) {
            throw err;
        }
        res.render('edit', { item: row });
    });
});

// Ruta para manejar la edición de datos
app.post('/edit/:id', (req, res) => {
    const id = req.params.id;
    const { categoria, nombre, descripcion, link, vigencia } = req.body;
    db.run('UPDATE data SET categoria = ?, nombre = ?, descripcion = ?, link = ?, vigencia = ? WHERE id = ?', [categoria, nombre, descripcion, link, vigencia, id], (err) => {
        if (err) {
            throw err;
        }
        res.redirect('/');
    });
});

// Ruta para mostrar el formulario de creación
app.get('/new', (req, res) => {
    res.render('new');
});

// Ruta para manejar la creación de nuevos datos
app.post('/new', (req, res) => {
    const { categoria, nombre, descripcion, link, vigencia } = req.body;
    db.run('INSERT INTO data (categoria, nombre, descripcion, link, vigencia) VALUES (?, ?, ?, ?, ?)', [categoria, nombre, descripcion, link, vigencia], (err) => {
        if (err) {
            throw err;
        }
        res.redirect('/');
    });
});

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
