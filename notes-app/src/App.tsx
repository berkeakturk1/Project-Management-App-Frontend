 import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./App.css";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import AppBar from "./Appbar";
import { Select, MenuItem, Checkbox, ListItemText, FormControl, InputLabel } from "@mui/material";
import SprintBoardHeader from "./SprintBoardHeader";


interface Note {
  id: number;
  title: string;
  content: string;
  status: string;
  importance: string;
  assignedUsers: string[]; // New field to store usernames
}


const columns = {
  todo: "TO DO",
  inProgress: "In Progress",
  codeReview: "Code Review",
  done: "Done",
};

interface WorkforceMember {
  username: string;
}

const App = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [importance, setImportance] = useState("No time Constraint");
  const [workforce, setWorkforce] = useState<WorkforceMember[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
  const [currentColumn, setCurrentColumn] = useState<string | null>(null);
  const [selectedWorkforce, setSelectedWorkforce] = useState<string[]>([]);

  const { taskboardId } = useParams<{ taskboardId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWorkforce = async () => {
      try {
        const response = await fetch(`/api/workforce?taskboard_id=${taskboardId}`);
        const data: WorkforceMember[] = await response.json();
        console.log('Fetched workforce:', data); // Debug: Log fetched workforce
        setWorkforce(data); // Update the workforce state with fetched data
      } catch (error) {
        console.error('Error fetching workforce:', error);
      }
    };

    fetchWorkforce();
  }, [taskboardId]);

  useEffect(() => {
    const fetchNotes = async () => {
      if (!taskboardId) {
        console.error('Taskboard ID is missing');
        return;
      }
  
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token available, redirecting to login.');
          navigate('/login'); // Redirect to login if token is missing
          return;
        }
  
        const response = await fetch(`/api/tasks?taskboardId=${taskboardId}`, {
          headers: {
            'Authorization': `Bearer ${token}`  // Add Bearer prefix
          }
        });
  
        if (!response.ok) {
          if (response.status === 403) {
            console.error('Access denied to the taskboard');
            navigate('/');
          }
          throw new Error(`Failed to fetch tasks: ${response.statusText}`);
        }
  
        const data = await response.json();
        console.log("Fetched tasks data:", data);
  
        if (!Array.isArray(data)) {
          throw new Error('Fetched data is not an array');
        }
  
        const notes = data.map((task: any) => ({
          id: task.m_id, 
          title: task.task_title,
          content: task.task_content,
          status: task.status,
          importance: task.importance,
          assignedUsers: task.assigned_users || [] // Store the usernames
        }));
  
        setNotes(notes);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };
  
    fetchNotes();
  }, [taskboardId, navigate]);
  

  const handleAddNote = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!currentColumn || !taskboardId) return;

    const newNote = {
        title: title,
        content: content,
        status: currentColumn,
        importance: importance,
        taskboardId: parseInt(taskboardId, 10),
        assignedTo: selectedWorkforce // Pass selected users
    };

    try {
        const response = await fetch("http://localhost:3001/api/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newNote),
        });

        if (!response.ok) {
            throw new Error("Failed to add note");
        }

        const addedNote = await response.json();
        setNotes([addedNote, ...notes]);
        setTitle("");
        setContent("");
        setImportance("No time Constraint");
        setSelectedWorkforce([]); // Clear selected workforce
        setIsPopupOpen(false);
    } catch (error) {
        console.error("Error adding note:", error);
    }
};

  const handleNoteClick = (note: Note) => {
    setSelectedNote(note);
    setTitle(note.title);
    setContent(note.content);
    setImportance(note.importance);
    setIsEditPopupOpen(true);
  };

  const handleUpdateNote = async (event: React.FormEvent) => {

    if (!selectedNote) {
        console.error("No note selected for updating.");
        return;
    }

    // Log the selected note's ID
    console.log("Selected Note ID:", selectedNote.id);

    // Prepare the updated note with the necessary fields
    const updatedNote = {
        id: selectedNote.id,
        title: title,
        content: content,
        status: selectedNote.status,
        importance: importance,
        assignedTo: selectedWorkforce // Pass selected usernames to the backend
    };

    // Log the ID in the updated note payload
    console.log("Updated Note Payload - ID:", updatedNote.id);

    try {
        // Send a PUT request to update the note
        const response = await fetch(`http://localhost:3001/api/update/${selectedNote.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedNote),
        });

        // Log the response status
        console.log("Response Status for Note ID", selectedNote.id, ":", response.status);

        // Handle non-OK response
        if (!response.ok) {
            throw new Error("Failed to update note");
        }

        // Parse the updated note from the server's response
        const updatedNoteFromServer = await response.json();

        // Log the updated note's ID from the server response
        console.log("Updated Note from Server - ID:", updatedNoteFromServer.id);

        // Update the local state with the updated note
        const updatedNotesList = notes.map((note) =>
            note.id === selectedNote.id ? updatedNoteFromServer : note
        );
        
        // Log the IDs of all notes in the updated notes list
        console.log("Updated Notes List IDs:", updatedNotesList.map(note => note.id));

        setNotes(updatedNotesList);

        // Clear the form and close the popup
        setTitle("");
        setContent("");
        setImportance("No time Constraint");
        setSelectedWorkforce([]); // Clear selected workforce
        setIsEditPopupOpen(false);
    } catch (error) {
        // Log the error with specific reference to the note ID
        console.error("Error updating note with ID", selectedNote.id, ":", error);
    }
};




  const handleDeleteNote = async (id: number, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      const response = await fetch(`http://localhost:3001/api/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete note");
      }

      setNotes(notes.filter((note) => note.id !== id));
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  const onDragEnd = async (result: any) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    const updatedNotes = Array.from(notes);

    const movedNoteIndex = updatedNotes.findIndex(note => note.id.toString() === draggableId);
    if (movedNoteIndex === -1) return;

    const [movedNote] = updatedNotes.splice(movedNoteIndex, 1);

    movedNote.status = destination.droppableId;

    updatedNotes.splice(destination.index, 0, movedNote);

    setNotes(updatedNotes);

    try {
      const response = await fetch(`http://localhost:3001/api/${movedNote.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(movedNote),
      });

      if (!response.ok) {
        throw new Error("Failed to update task status");
      }

      const updatedNote = await response.json();

      setNotes((prevNotes) =>
        prevNotes.map((note) => (note.id === updatedNote.id ? updatedNote : note))
      );
    } catch (error) {
      console.error("Error updating task status:", error);
      setNotes(notes);
    }
  };

  const handleWorkforceSelection = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(event.target.selectedOptions, option => option.value);
    setSelectedWorkforce(selectedOptions);
    console.log('Selected workforce:', selectedOptions);
  };

  const togglePopup = (columnId: string) => {
    setTitle("");
    setContent("");
    setImportance("No time Constraint");
    setCurrentColumn(columnId);
    setIsPopupOpen(!isPopupOpen);
  };

  return (
    <div className="app-container">
      <SprintBoardHeader />
      {isPopupOpen && (
        <div className="popup">
          <div className="popup-content">
            <form onSubmit={handleAddNote} className="note-form">
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Title"
                required
              ></input>
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Content"
                rows={10}
                required
              ></textarea>
              <select
                value={importance}
                onChange={(event) => setImportance(event.target.value)}
                required
              >
                <option value="No time Constraint">No time Constraint</option>
                <option value="Low time Constraint">Low time Constraint</option>
                <option value="Medium time constraint">Medium time constraint</option>
                <option value="High time constraint">High time constraint</option>
              </select> 

              <FormControl fullWidth margin="normal">
  <InputLabel id="workforce-select-label">Select Workforce</InputLabel>
  <Select
    labelId="workforce-select-label"
    id="workforce-select"
    multiple
    value={selectedWorkforce}
    onChange={(event) => {
      const value = event.target.value;
      setSelectedWorkforce(
        typeof value === 'string' ? value.split(',') : value
      );
    }}
    label="Select Workforce"
    renderValue={(selected) => selected.join(', ')}
  >
    {workforce.map((worker) => (
      <MenuItem key={worker.username} value={worker.username}>
        <Checkbox checked={selectedWorkforce.indexOf(worker.username) > -1} />
        <ListItemText primary={worker.username} />
      </MenuItem>
    ))}
  </Select>
</FormControl>

              <button type="submit">Add Note</button>
              <button type="button" onClick={() => setIsPopupOpen(false)}>Close</button>
            </form>
          </div>
        </div>
      )}
      {isEditPopupOpen && (
        <div className="popup">
          <div className="popup-content">
            <form onSubmit={handleUpdateNote} className="note-form">
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Title"
                required
              ></input>
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Content"
                rows={10}
                required
              ></textarea>
              <select
                value={importance}
                onChange={(event) => setImportance(event.target.value)}
                required
              >
                <option value="No time Constraint">No time Constraint</option>
                <option value="Low time Constraint">Low time Constraint</option>
                <option value="Medium time constraint">Medium time constraint</option>
                <option value="High time constraint">High time constraint</option>
              </select>

              <FormControl fullWidth margin="normal">
  <InputLabel id="workforce-select-label">Select Workforce</InputLabel>
  <Select
    labelId="workforce-select-label"
    id="workforce-select"
    multiple
    value={selectedWorkforce}
    onChange={(event) => {
      const value = event.target.value;
      setSelectedWorkforce(
        typeof value === 'string' ? value.split(',') : value
      );
    }}
    label="Select Workforce"
    renderValue={(selected) => selected.join(', ')}
  >
    {workforce.map((worker) => (
      <MenuItem key={worker.username} value={worker.username}>
        <Checkbox checked={selectedWorkforce.indexOf(worker.username) > -1} />
        <ListItemText primary={worker.username} />
      </MenuItem>
    ))}
  </Select>
</FormControl>


              <button type="submit">Update Note</button>
              <button type="button" onClick={() => setIsEditPopupOpen(false)}>Close</button>
            </form>
          </div>
        </div>
      )}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="columns">
          {Object.entries(columns).map(([columnId, columnTitle]) => {
            const columnNotes = notes.filter((note) => note.status === columnId);
            return (
              <Droppable key={columnId} droppableId={columnId}>
                {(provided) => (
                  <div
                    className="column"
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    <div className="column-header">
                      <h2>{columnTitle} <span className="note-count">{columnNotes.length} &#9679;</span></h2>
                      {columnId === 'todo' && (
                        <button className="add-task-button" onClick={() => togglePopup(columnId)}>+</button>
                      )}
                    </div>
                    {columnNotes.map((note, index) => {
                      if (!note.id) {
                        console.error("Note ID is undefined:", note);
                        return null;
                      }
                      return (
                        <Draggable key={note.id} draggableId={note.id.toString()} index={index}>
                          {(provided) => (
                            <div className="note-item"
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={() => handleNoteClick(note)}
                          >
                            <div className="notes-header">
                              {note.status === "done" ? (
                                <button onClick={(event) => handleDeleteNote(note.id, event)}>
                                  🗑️
                                </button>
                              ) : note.status === "todo" ? (
                                <button onClick={(event) => handleDeleteNote(note.id, event)}>
                                  ❌
                                </button>
                              ) : null}
                            </div>
                            <div className="note-title">{note.title}</div>
                            <div className="note-content">
                              <p>{note.content}</p>
                              <div className="note-assigned-users">
                                {note.assignedUsers.length > 0 ? (
                                  <div>
                                    <strong>Assigned to:</strong>
                                    <ul>
                                      {note.assignedUsers.map((username) => (
                                        <li key={username}>{username}</li>
                                      ))}
                                    </ul>
                                  </div>
                                ) : (
                                  <p>No users assigned</p>
                                )}
                              </div>
                            </div>
                            <div className="note-importance">
                              <span className={`importance-tag ${note.importance.replace(/\s+/g, '-').toLowerCase()}`}>
                                {note.importance}
                              </span>
                            </div>
                            {note.status === "done" && (
                              <div className="checkmark-icon">
                                ✅ 
                              </div>
                            )}
                          </div>
                          
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
};

export default App;
