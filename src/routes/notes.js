const express = require('express');
const db = require('../db');
const { createError } = require('../middleware/errorHandler');

const router = express.Router();

// GET /api/notes - List all notes with optional search
router.get('/', async (req, res, next) => {
  try {
    const { search } = req.query;
    
    let queryText;
    let queryParams;

    if (search) {
      // Search by title (case-insensitive)
      queryText = `
        SELECT id, title, content, created_at, updated_at 
        FROM notes 
        WHERE title ILIKE $1
        ORDER BY updated_at DESC
      `;
      queryParams = [`%${search}%`];
    } else {
      queryText = `
        SELECT id, title, content, created_at, updated_at 
        FROM notes 
        ORDER BY updated_at DESC
      `;
      queryParams = [];
    }

    const result = await db.query(queryText, queryParams);
    res.json({ notes: result.rows });
  } catch (err) {
    next(err);
  }
});

// GET /api/notes/:id - Get a single note
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Validate ID is a number
    if (isNaN(parseInt(id, 10))) {
      throw createError('Invalid note ID', 400);
    }

    const result = await db.query(
      'SELECT id, title, content, created_at, updated_at FROM notes WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      throw createError('Note not found', 404);
    }

    res.json({ note: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// POST /api/notes - Create a new note
router.post('/', async (req, res, next) => {
  try {
    const { title, content } = req.body;

    // Validation
    if (!title || typeof title !== 'string' || title.trim() === '') {
      throw createError('Title is required', 400);
    }
    if (!content || typeof content !== 'string' || content.trim() === '') {
      throw createError('Content is required', 400);
    }

    const result = await db.query(
      `INSERT INTO notes (title, content) 
       VALUES ($1, $2) 
       RETURNING id, title, content, created_at, updated_at`,
      [title.trim(), content.trim()]
    );

    res.status(201).json({ note: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// PUT /api/notes/:id - Update a note
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    // Validate ID
    if (isNaN(parseInt(id, 10))) {
      throw createError('Invalid note ID', 400);
    }

    // Validation
    if (!title || typeof title !== 'string' || title.trim() === '') {
      throw createError('Title is required', 400);
    }
    if (!content || typeof content !== 'string' || content.trim() === '') {
      throw createError('Content is required', 400);
    }

    const result = await db.query(
      `UPDATE notes 
       SET title = $1, content = $2, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $3 
       RETURNING id, title, content, created_at, updated_at`,
      [title.trim(), content.trim(), id]
    );

    if (result.rows.length === 0) {
      throw createError('Note not found', 404);
    }

    res.json({ note: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/notes/:id - Delete a note
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (isNaN(parseInt(id, 10))) {
      throw createError('Invalid note ID', 400);
    }

    const result = await db.query(
      'DELETE FROM notes WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      throw createError('Note not found', 404);
    }

    res.json({ message: 'Note deleted successfully', id: parseInt(id, 10) });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
