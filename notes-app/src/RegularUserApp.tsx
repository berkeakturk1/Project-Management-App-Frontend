import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./App.css";
import AppBar from "./Appbar";

interface Note {
  id: number;
  title: string;
  content: string;
  status: string;
  importance: string;
}

const columns = {
  todo: "TO DO",
  inProgress: "In Progress",
  codeReview: "Code Review",
  done: "Done",
};

const RegularUserApp = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [importance, setImportance] = useState("No time Constraint");
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
  const [currentColumn, setCurrentColumn] = useState<string | null>(null);
  const [userTaskboardId, setUserTaskboardId] = useState<string | null>(null);

  const { taskboardId } = useParams<{ taskboardId: string }>();
  const navigate = useNavigate(); // Initialize navigate,

  useEffect(() => {
    const fetchTaskboardId = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/user_taskboard_id`, {
          headers: {
            'Authorization': `Bearer ${token}` // Add Bearer prefix
          }
        });
    
        if (!response.ok) {
          if (response.status === 403) {
            console.error('Access denied to the taskboard');
            navigate('/');
          }
          throw new Error(`Failed to fetch user taskboard ID: ${response.statusText}`);
        }
    
        const data = await response.json();
        if (data.taskboardId) {
          setUserTaskboardId(data.taskboardId);
        } else {
          console.error('Taskboard ID not found for user');
        }
      } catch (error) {
        console.error("Error fetching user taskboard ID:", error);
      }
    };
    

    fetchTaskboardId();
  }, [navigate]);

  useEffect(() => {
    const fetchNotes = async () => {
        const boardId = taskboardId;
    
        if (!boardId) {
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
    
            const response = await fetch(`/api/tasks?taskboardId=${boardId}`, {
                headers: {
                    'Authorization': `Bearer ${token}` // Include the token in the Authorization header
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
            console.log("Fetched tasks data:", data);  // Debugging line

            if (!Array.isArray(data)) {
                throw new Error('Fetched data is not an array');
            }

            const notes = data.map((task: any) => ({
                id: task.m_id,
                title: task.task_title,
                content: task.task_content,
                status: task.status,
                importance: task.importance
            }));

            setNotes(notes);
            console.log("Mapped notes:", notes);  // Debugging line
        } catch (error) {
            console.error("Error fetching tasks:", error);
        }
    };

    fetchNotes();
}, [taskboardId, userTaskboardId, navigate]);


  const handleAddNote = async (event: React.FormEvent) => {
    if (!currentColumn || !taskboardId) return;

    const newNote = {
      title: title,
      content: content,
      status: currentColumn,
      importance: importance,
      taskboardId: parseInt(taskboardId, 10)
    };

    try {
      const response = await fetch("http://localhost:3001/api", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newNote),
      });

      if (!response.ok) {
        throw new Error("Failed to add note");
      }

      const addedNote: Note = await response.json();
      setNotes([addedNote, ...notes]);
      setTitle("");
      setContent("");
      setImportance("No time Constraint");
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
    if (!selectedNote) return;
  
    const updatedNote: Note = {
      id: selectedNote.id,
      title: title,
      content: content,
      status: selectedNote.status,
      importance: importance,
    };
  
    try {
      const response = await fetch(`http://localhost:3001/api/${selectedNote.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedNote),
      });
  
      if (!response.ok) {
        throw new Error("Failed to update note");
      }
  
      const updatedNoteFromServer = await response.json();
      const updatedNotesList = notes.map((note) =>
        note.id === selectedNote.id ? updatedNoteFromServer : note
      );
      setNotes(updatedNotesList);
      setTitle("");
      setContent("");
      setImportance("No time Constraint");
      setSelectedNote(null);
      setIsEditPopupOpen(false);
    } catch (error) {
      console.error("Error updating note:", error);
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

  const togglePopup = (columnId: string) => {
    setTitle("");
    setContent("");
    setImportance("No time Constraint");
    setCurrentColumn(columnId);
    setIsPopupOpen(!isPopupOpen);
  };

  return (
    <div className="app-container">
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
              <button type="submit">Update Note</button>
              <button type="button" onClick={() => setIsEditPopupOpen(false)}>Close</button>
            </form>
          </div>
        </div>
      )}
      <div className="columns">
        {Object.entries(columns).map(([columnId, columnTitle]) => {
          const columnNotes = notes.filter((note) => note.status === columnId);
          return (
            <div className="column" key={columnId}>
              <div className="column-header">
                <h2>{columnTitle} <span className="note-count">{columnNotes.length} &#9679;</span></h2>
              </div>
              {columnNotes.map((note) => {
                if (!note.id) {
                  console.error("Note ID is undefined:", note);
                  return null;
                }
                return (
                  <div
                    key={note.id}
                    className="note-item"
                    onClick={() => handleNoteClick(note)}
                  >
                    <div className="note-title">{note.title}</div>
                    <div className="note-content"><p>{note.content}</p></div>
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
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RegularUserApp;
