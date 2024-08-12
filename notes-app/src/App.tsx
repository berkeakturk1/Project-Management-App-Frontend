import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./App.css";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
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

interface WorkforceMember {
  username: string;
}

const App = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [importance, setImportance] = useState("No time Constraint");
  const [workforce, setWorkforce] = useState<WorkforceMember[]>([]);  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
  const [currentColumn, setCurrentColumn] = useState<string | null>(null);
  const [selectedWorkforce, setSelectedWorkforce] = useState('');

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
          importance: task.importance
        }));

        setNotes(notes);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    fetchNotes();
  }, [taskboardId, navigate]);


  const moveToPreviousColumn = (note: Note, event: React.MouseEvent) => {
    // event.stopPropagation();
    let newStatus = note.status;
    if (note.status === "in-progress") {
      newStatus = "todo";
    } else if (note.status === "code-review") {
      newStatus = "in-progress";
    }
  
    const updatedNote = { ...note, status: newStatus };
  
    fetch(`http://localhost:3001/api/${note.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedNote),
    })
      .then((response) => response.json())
      .then((updatedNoteFromServer) => {
        setNotes((prevNotes) =>
          prevNotes.map((n) => (n.id === note.id ? updatedNoteFromServer : n))
        );
      })
      .catch((error) => console.error("Error updating note:", error));
  };

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

              <select
                value={selectedWorkforce}
                onChange={(event) => setSelectedWorkforce(event.target.value)}
                required
              >
                <option value="">Select Workforce</option>
                {workforce.map((worker, index) => (
                  <option key={index} value={worker.username}>
                    {worker.username}
                  </option>
                ))}
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

              <select
                value={selectedWorkforce}
                onChange={(event) => setSelectedWorkforce(event.target.value)}
                required
              >
                <option value="">Select Workforce</option>
                {workforce.map((worker, index) => (
                  <option key={index} value={worker.username}>
                    {worker.username}
                  </option>
                ))}
              </select>

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
                            <div
                              className="note-item"
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
