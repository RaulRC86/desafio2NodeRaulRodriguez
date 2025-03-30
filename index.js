import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filePath = path.join(__dirname, "canciones.json");

app.use(express.json());


let canciones = [];


const leerCanciones = () => {
  try {
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    canciones = data; 
    return canciones;
  } catch (error) {
    return [];
  }
};

const escribirCanciones = (data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

leerCanciones(); 

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.get("/canciones", (req, res) => {
  res.json(canciones); 
});


app.post("/canciones", (req, res) => {
  const {titulo, artista, tono} = req.body;
  if (!titulo || !artista || !tono === undefined) {
    return res.status(400).json({
      error: "Todos los campos son requeridos.",
    });
  }


  const nuevaCancion = { id: Date.now(), ...req.body }; 
  canciones.push(nuevaCancion); 
  escribirCanciones(canciones); 
  res.status(201).json({ mensaje: "Canción agregada", nuevaCancion });
});

app.put("/canciones/:id", (req, res) => {
  const { id } = req.params;
  const index = canciones.findIndex((c) => c.id == id);

  if (index !== -1) {
    canciones[index] = { id: Number(id), ...req.body }; 
    escribirCanciones(canciones); 
    res.json({ mensaje: "Canción editada", cancion: canciones[index] });
  } else {
    res.status(404).json({ mensaje: "Canción no encontrada" });
  }
});

app.delete("/canciones/:id", (req, res) => {
  const { id } = req.params;
  const cancionesFiltradas = canciones.filter((c) => c.id != id);

  if (canciones.length === cancionesFiltradas.length) {
    return res.status(404).json({ mensaje: "Canción no encontrada" });
  }

  canciones = cancionesFiltradas; 
  escribirCanciones(canciones); 
  res.json({ mensaje: "Canción eliminada" });
});

app.listen(3000, () => {
  console.log('Aplicacion corriendo en http://localhost:3000');
});
