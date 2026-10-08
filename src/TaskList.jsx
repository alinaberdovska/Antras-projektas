import { useState } from "react";
import "./TaskList.css";

function TaskList({ tasks = [], loading = false, onTaskChange, onDelete }) {
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  function startEditing(task) {
    setEditingId(task.id);
    setEditTitle(task.title || "");
  }

  async function saveTitle(taskId) {
    const title = editTitle.trim();
    if (!title) return;

    const saved = await onTaskChange?.(taskId, { title });
    if (saved) setEditingId(null);
  }

  if (loading) {
    return <section className="task-card"><p className="task-state">Kraunamos užduotys...</p></section>;
  }

  if (tasks.length === 0) {
    return <section className="task-card"><p className="task-state">Užduočių kol kas nėra.</p></section>;
  }

  return (
    <section className="task-card">
      <header className="task-card__header"><h2>Užduotys</h2><p>Artimiausi darbai ir jų būsena</p></header>
      <div className="task-list">
        {tasks.map((task) => (
          <article className="task-item" key={task.id}>
            <div className="task-item__top">
              {editingId === task.id ? (
                <div className="task-edit-title">
                  <label className="visually-hidden" htmlFor={`task-title-${task.id}`}>Užduoties pavadinimas</label>
                  <input id={`task-title-${task.id}`} value={editTitle} onChange={(event) => setEditTitle(event.target.value)} />
                  <button type="button" className="task-action" onClick={() => saveTitle(task.id)} disabled={!editTitle.trim()}>Išsaugoti</button>
                  <button type="button" className="task-action" onClick={() => setEditingId(null)}>Atšaukti</button>
                </div>
              ) : (
                <>
                  <h3>{task.title}</h3>
                  <button type="button" className="task-action" onClick={() => startEditing(task)}>Redaguoti</button>
                </>
              )}
              <label className="task-status-field">
                <span className="visually-hidden">Užduoties statusas</span>
                <select className={`task-status task-status--${(task.status || "").toLowerCase().replace(" ", "-")}`} value={task.status || "Nepradėta"} onChange={(event) => onTaskChange?.(task.id, { status: event.target.value })} aria-label={`Keisti užduoties „${task.title}“ statusą`}>
                  <option value="Nepradėta">Nepradėta</option><option value="Vykdoma">Vykdoma</option><option value="Atlikta">Atlikta</option>
                </select>
              </label>
            </div>
            <label className="task-deadline"><span>Terminas:</span><input type="date" value={task.deadline || ""} onChange={(event) => onTaskChange?.(task.id, { deadline: event.target.value })} aria-label={`Keisti užduoties „${task.title}“ terminą`} /></label>
            <button type="button" className="task-delete" onClick={() => onDelete?.(task.id)} aria-label={`Ištrinti užduotį „${task.title}“`}>Ištrinti</button>
          </article>
        ))}
      </div>
    </section>
  );
}

export default TaskList;
