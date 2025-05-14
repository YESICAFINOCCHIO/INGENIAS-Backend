// archivo .env
require ('dotenv').config();
// creación del servidor web con Express JS
const express = require('express'); // framework web
const path = require('path'); // trabaja con ruta de archivos
const fs = require('fs'); // permite leer archivos

const app = express(); // app es mi servidor
const PORT = 3008; // puerto de peticiones

// archivos estaticos desde la carpeta views- osea lo que se ve
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// local host- página principal - ruta básica
app.get('/', (req, res) => {
  res.render('index'); // Esto busca "index.ejs" en la carpeta configurada como 'views'
});

// ruta al archivo JSON_ me da la ubicacion del archivo que contiene las peliculas y series
const jsonPath = path.resolve(__dirname, process.env.JSON_PATH);

// lectura del archivo JSON
const leerJSON = () => {
  const data = fs.readFileSync(jsonPath, 'utf-8'); // lee el archivo como texto
  return JSON.parse(data); // convierte el texto en un objeto JS
};

// lista en HTML
const generarLista = (items) => {
  if (!items.length) return '<h2> Disculpe, no se encontraron resultados</h2>';

  return `
    <h1>TODAS TUS SERIES Y PELÍCULAS</h1>
    <ul>
      ${items
        .map(item => `
          <li>
            <strong>Título:</strong> ${item.titulo} <br>
            <strong>Categoría:</strong> ${item.categoria} <br>
            <strong>Género:</strong> ${item.genero} <br>
            <strong>Reparto:</strong> ${item.reparto} <br>
            ${item.resumen ? `<strong>Resumen:</strong> ${item.resumen} <br>` : ''}
            ${item.trailer ? `<strong>Trailer:</strong> <a href="${item.trailer}" target="_blank">Ver trailer</a><br>` : 'Trailer no disponible'}
            <hr>
          </li>
        `)
        .join('')}
    </ul>
  `;
};

// Endpoint solicitadas

//listado del contenido series y peliculas
app.get('/catalogo', (req, res) => {
  const data = leerJSON();
  res.send(generarLista(data)); // no estoy usando EJS
});


//titulo de los contenidos 
app.get('/titulo/:title', (req, res) => {
  const data = leerJSON();
  const titleParam = req.params.title.toLowerCase();

  const resultado = data.filter(item => //filtro
    item.titulo.toLowerCase().includes(titleParam) //.includes() para que no escribir todo el nombre
  );

  res.send(generarLista(resultado));
});

// categorias del contenido
app.get('/categoria/:cat', (req, res) => {
    const data = leerJSON();
    const catParam = req.params.cat.toLowerCase();
  
    const resultado = data.filter(item =>
      item.categoria.toLowerCase() === catParam
    );
  
    res.send(generarLista(resultado));
  });

//reparto 
app.get('/reparto/:act', (req, res) => {
  const data = leerJSON();
  const actParam = req.params.act.toLowerCase();

  const resultado = data.filter(item =>
    item.reparto.toLowerCase().includes(actParam)
  );

  res.send(generarLista(resultado));
});

///trailer/:id
app.get('/trailer/:id', (req, res) => {
  const data = leerJSON();
  const idParam = parseInt(req.params.id); // muestra su contenido segun el id
  const item = data.find(obj => obj.id === idParam);

  if (!item) {
    return res.status(404).send('<h2>Trailer no disponible</h2>'); // si no tiene tira el mjs 
  }

  res.send(`
    <h2>${item.titulo}</h2>
    <p><strong>ID:</strong> ${item.id}</p> 
    ${item.trailer 
      ? `<iframe width="560" height="315" src="${item.trailer}" frameborder="0" allowfullscreen></iframe>` 
      : '<p>Trailer no disponible</p>'
    }
  `);
});

// mensaje para la terminal
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:3008`);
});
