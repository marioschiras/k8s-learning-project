// API base URL - empty string means same origin
const API_BASE = '/api';

// DOM Elements
const notesListEl = document.getElementById('notes-list');
const noteForm = document.getElementById('note-form');
const formTitleEl = document.getElementById('form-title');
const noteIdEl = document.getElementById('note-id');
const titleEl = document.getElementById('title');
const contentEl = document.getElementById('content');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const clearBtn = document.getElementById('clear-btn');
const statusEl = document.getElementById('status');

// State
let editingNoteId = null;

// Show status message
function showStatus(message, type) {
  statusEl.textContent = message;
  statusEl.className = `status ${type}`;
  statusEl.classList.remove('hidden');
  
  // Auto-hide after 3 seconds
  setTimeout(() => {
    statusEl.classList.add('hidden');
  }, 3000);
}

// Format date for display
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString();
}

// Truncate text for preview
function truncate(text, maxLength = 150) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// Fetch all notes
async function fetchNotes(searchTerm = '') {
  try {
    let url = `${API_BASE}/notes`;
    if (searchTerm) {
      url += `?search=${encodeURIComponent(searchTerm)}`;
    }
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to fetch notes');
    }
    
    return data.notes;
  } catch (err) {
    showStatus(err.message, 'error');
    return [];
  }
}

// Render notes list
function renderNotes(notes) {
  if (notes.length === 0) {
    notesListEl.innerHTML = '<p class="empty-state">No notes found. Create your first note above!</p>';
    return;
  }
  
  notesListEl.innerHTML = notes.map(note => `
    <div class="note-card" data-id="${note.id}">
      <h3>${escapeHtml(note.title)}</h3>
      <p>${escapeHtml(truncate(note.content))}</p>
      <div class="meta">
        Updated: ${formatDate(note.updated_at)}
      </div>
      <div class="actions">
        <button onclick="editNote(${note.id})">Edit</button>
        <button class="danger" onclick="deleteNote(${note.id})">Delete</button>
      </div>
    </div>
  `).join('');
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Load and display notes
async function loadNotes(searchTerm = '') {
  notesListEl.innerHTML = '<p class="loading">Loading notes...</p>';
  const notes = await fetchNotes(searchTerm);
  renderNotes(notes);
}

// Create a new note
async function createNote(title, content) {
  const response = await fetch(`${API_BASE}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, content }),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error?.message || 'Failed to create note');
  }
  
  return data.note;
}

// Update a note
async function updateNote(id, title, content) {
  const response = await fetch(`${API_BASE}/notes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, content }),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error?.message || 'Failed to update note');
  }
  
  return data.note;
}

// Delete a note
async function deleteNote(id) {
  if (!confirm('Are you sure you want to delete this note?')) {
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE}/notes/${id}`, {
      method: 'DELETE',
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to delete note');
    }
    
    showStatus('Note deleted successfully!', 'success');
    loadNotes(searchInput.value);
  } catch (err) {
    showStatus(err.message, 'error');
  }
}

// Fetch a single note for editing
async function fetchNote(id) {
  const response = await fetch(`${API_BASE}/notes/${id}`);
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error?.message || 'Failed to fetch note');
  }
  
  return data.note;
}

// Start editing a note
async function editNote(id) {
  try {
    const note = await fetchNote(id);
    
    editingNoteId = id;
    noteIdEl.value = id;
    titleEl.value = note.title;
    contentEl.value = note.content;
    
    formTitleEl.textContent = 'Edit Note';
    submitBtn.textContent = 'Update Note';
    cancelBtn.classList.remove('hidden');
    
    // Scroll to form
    noteForm.scrollIntoView({ behavior: 'smooth' });
  } catch (err) {
    showStatus(err.message, 'error');
  }
}

// Reset form to create mode
function resetForm() {
  editingNoteId = null;
  noteIdEl.value = '';
  titleEl.value = '';
  contentEl.value = '';
  formTitleEl.textContent = 'Create Note';
  submitBtn.textContent = 'Create Note';
  cancelBtn.classList.add('hidden');
}

// Form submit handler
noteForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const title = titleEl.value.trim();
  const content = contentEl.value.trim();
  
  if (!title || !content) {
    showStatus('Title and content are required', 'error');
    return;
  }
  
  submitBtn.disabled = true;
  
  try {
    if (editingNoteId) {
      await updateNote(editingNoteId, title, content);
      showStatus('Note updated successfully!', 'success');
    } else {
      await createNote(title, content);
      showStatus('Note created successfully!', 'success');
    }
    
    resetForm();
    loadNotes(searchInput.value);
  } catch (err) {
    showStatus(err.message, 'error');
  } finally {
    submitBtn.disabled = false;
  }
});

// Cancel edit
cancelBtn.addEventListener('click', resetForm);

// Search
searchBtn.addEventListener('click', () => {
  loadNotes(searchInput.value.trim());
});

// Search on Enter key
searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    loadNotes(searchInput.value.trim());
  }
});

// Clear search
clearBtn.addEventListener('click', () => {
  searchInput.value = '';
  loadNotes();
});

// Make functions available globally for onclick handlers
window.editNote = editNote;
window.deleteNote = deleteNote;

// Initial load
loadNotes();
