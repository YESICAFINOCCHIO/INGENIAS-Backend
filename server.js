// archivo .env
require ('dotenv').config();
// creación del servidor web con Express JS
const express = require('express'); // framework web
const path = require('path'); // trabaja con ruta de archivos
const fs = require('fs'); // permite leer archivos

const app = express(); // app es mi servidor
const PORT = 3008; // puerto de peticiones

// el archivo .ejs estan en la carpeta views
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// archivos estaticos
app.use(express.static(path.join(__dirname, 'public')));

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

// lista en HTML 1 catalogo completo
const generarLista = (items) => {
  if (!items.length) return '<h2> No se encontraron resultados</h2>';

  return `
    <h1>TODAS TUS SERIES Y PELÍCULAS EN UN SOLO LUGAR</h1>
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

  if (resultados.length === 0) {
    return res.send('<h2>No se encontraron títulos.</h2>');
  }
});

// categorias- pelicula y serie
app.get('/categoria/:cat', (req, res) => {
    const data = leerJSON();
    const catParam = req.params.cat.toLowerCase();
  
    const resultado = data.filter(item =>
      item.categoria.toLowerCase() === catParam
    );
  
    res.send(generarLista(resultado));
  });

//reparto  

// lista en HTML 2 para la busqueda de reparto 
const generarLista2 = (items) => {
  if (!items.length) return '<h2> Disculpe, no se encontraron resultados</h2>';

  return `
    <h1>LISTA DE ACTORES</h1>
    <ul>
      ${items
        .map(item => `
          <li>
            <strong>Título:</strong> ${item.titulo} <br>
            <strong>Reparto:</strong> ${item.reparto} <br>
            <hr>
          </li>
        `)
        .join('')}
    </ul>
  `;
};

    //código de reparto
app.get('/reparto/:act', (req, res) => {
  const data = leerJSON();
  const actParam = req.params.act.toLowerCase();

  const resultado = data.filter(item => //filtro
    item.reparto.toLowerCase().includes(actParam) //.includes() para que no escribir todo el nombre
  );

  res.send(generarLista2(resultado));
  
    //CODIGO UTILIZADO AL PPIO-tiraba Json en crudo :( _ por eso decidimos hacer una 2da lista en html
  //const resultado = data
   // .filter(item => item.reparto.toLowerCase().includes(actParam))
   // .map(item => ({
   // Título: item.titulo,
   // Reparto: item.reparto
   // }));

  if (resultado.length === 0) {
    return res.status(404).json("No se encontraron resultados para ese actor/actriz que busca" );   // respetando la consigna
  }

});

// trailer/:id

app.get('/trailer/:id', (req, res) => {
  const data = leerJSON();
  const idParam = parseInt(req.params.id);
  const item = data.find(obj => obj.id === idParam);

  if (!item) {
    // En caso de que no encuentre ningún ítem con ese id
    return res.status(404).json({ error: 'Trailer no disponible' });
  }

  if (!item.trailer) {
    // En el caso de que exista el ítem existe, pero no tiene trailer
    return res.json({
      id: item.id,
      titulo: item.titulo,
      trailer: null
    });
  }

  // si tiene todo y esta completo :)
  res.send(`
    <h2>${item.titulo}</h2>
    <p><strong>ID:</strong> ${item.id}</p> 
    <iframe width="560" height="315" src="${item.trailer}" frameborder="0" allowfullscreen></iframe>
  `);
});

// mensaje para la terminal
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:3008`);
});
