import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./App.css";
import AppBar from "./Appbar";
import { jwtDecode } from "jwt-decode";

interface Note {
  id: number;
  title: string;
  content: string;
  status: string;
  importance: string;
  dueDate?: string;   // Optional field for due date
  dueTime?: string;   // Optional field for due time
  assignedUsers: string[]; // New field to store usernames
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
  const [dueDate, setDueDate] = useState<string | undefined>(selectedNote?.dueDate);
  const [dueTime, setDueTime] = useState<string | undefined>(selectedNote?.dueTime);

  const { taskboardId } = useParams<{ taskboardId: string }>();
  const navigate = useNavigate();

  const [loggedInUserId, setLoggedInUserId] = useState<string | null>(null);

  // Fetch the logged-in user's ID from the token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken: any = jwtDecode(token); // Use a JWT decoding library
      setLoggedInUserId(decodedToken.userId);
    }
  }, []);

  useEffect(() => {
    const fetchTaskboardId = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/user_taskboard_id`, {
          headers: {
            'Authorization': `Bearer ${token}`
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
          navigate('/login');
          return;
        }

        const response = await fetch(`/api/tasks?taskboardId=${boardId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
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
          dueDate: task.due_date,   // Include due date
          dueTime: task.due_time,   // Include due time
          assignedUsers: task.assigned_users || [] // Store the usernames
        }));

        setNotes(notes);
        console.log("Mapped notes:", notes);
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
      dueDate: dueDate, // Include due date
      dueTime: dueTime, // Include due time
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
      setDueDate(undefined); // Clear due date
      setDueTime(undefined); // Clear due time
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
    setDueDate(note.dueDate);  // Set due date
    setDueTime(note.dueTime);  // Set due time
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
      dueDate: dueDate, // Include due date
      dueTime: dueTime, // Include due time
      assignedUsers: selectedNote.assignedUsers // Keep the assigned users intact
    };

    try {
      const response = await fetch(`http://localhost:3001/api/update/${selectedNote.id}`, {
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
      setDueDate(undefined); // Clear due date
      setDueTime(undefined); // Clear due time
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
    setDueDate(undefined); // Clear due date
    setDueTime(undefined); // Clear due time
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
                  />
                  <textarea
                      value={content}
                      onChange={(event) => setContent(event.target.value)}
                      placeholder="Content"
                      rows={10}
                      required
                  />
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

                  {/* Due Date Field */}
                  <input
                      type="date"
                      value={dueDate || ''} // Use the existing dueDate state or an empty string if it's undefined
                      onChange={(event) => setDueDate(event.target.value)}
                      placeholder="Due Date"
                  />

                  {/* Due Time Field */}
                  <input
                      type="time"
                      value={dueTime || ''} // Use the existing dueTime state or an empty string if it's undefined
                      onChange={(event) => setDueTime(event.target.value)}
                      placeholder="Due Time"
                  />

                  <button type="submit">Add Note</button>
                  <button type="button" onClick={() => setIsPopupOpen(false)}>Close</button>
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
                            <div className="note-due-date">
                              {note.dueDate && (
                                  <div>
                                    <strong
                                        style={{
                                          color: (() => {
                                            const dueDateTime = new Date(`${note.dueDate}T${note.dueTime || '23:59'}`);
                                            const now = new Date();
                                            return dueDateTime.getTime() < now.getTime() ? 'red' : 'inherit';
                                          })(),
                                        }}
                                    >
                                      Due Date:
                                    </strong>
                                    <span
                                        style={{
                                          color: (() => {
                                            const dueDateTime = new Date(`${note.dueDate}T${note.dueTime || '23:59'}`);
                                            const now = new Date();
                                            return dueDateTime.getTime() < now.getTime() ? 'red' : 'inherit';
                                          })(),
                                        }}
                                    >
        {note.dueDate} {note.dueTime}
      </span>

                                    {(() => {
                                      const dueDateTime = new Date(`${note.dueDate}T${note.dueTime || '23:59'}`);
                                      const now = new Date();
                                      return dueDateTime.getTime() < now.getTime() ? (
                                          <span style={{color: 'red', fontWeight: 'bold', marginLeft: '10px'}}>
            Overdue!
          </span>
                                      ) : null;
                                    })()}
                                  </div>
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
