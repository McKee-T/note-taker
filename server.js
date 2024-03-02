const express = require('express');
const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
// Middleware for parsing application/json
app.use(express.json());
// Serve static files from the 'public' directory
app.use(express.static('public'));

// Route to serve the notes.html file
app.get('/notes', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/notes.html'));
});

// GET route to return all saved notes
app.get('/api/notes', async (req, res) => {
  try {
    const notes = await fs.readJson(path.join(__dirname, '/db/db.json'));
    res.json(notes);
  } catch (err) {
    res.status(500).json(err);
  }
});

// POST route to save a new note
app.post('/api/notes', async (req, res) => {
  try {
    const newNote = { ...req.body, id: uuidv4() };
    const notes = await fs.readJson(path.join(__dirname, '/db/db.json'));
    notes.push(newNote);
    await fs.writeJson(path.join(__dirname, '/db/db.json'), notes);
    res.json(newNote);
  } catch (err) {
    res.status(500).json(err);
  }
});

// DELETE route to delete a note
app.delete('/api/notes/:id', async (req, res) => {
  try {
    // Read notes from db.json
    const notes = await fs.readJson(path.join(__dirname, '/db/db.json'));
    // Filter out the note with the id to delete
    const filteredNotes = notes.filter(note => note.id !== req.params.id);
    // Write the filtered notes back to db.json
    await fs.writeJson(path.join(__dirname, '/db/db.json'), filteredNotes);
    // Respond to the client
    res.json({ message: 'Note has been deleted' });
  } catch (err) {
    res.status(500).json(err);
  }
});

// Route to serve the index.html file as a fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});
