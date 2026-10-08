import { useEffect, useState } from "react";
import TaskList from "./TaskList";
import ProgressBar from "./ProgressBar";
import Navbar from "./Navbar";
import AddTaskForm from "./AddTaskForm";
import Profile from "./Profile";
import { createTask, deleteTask, getTasks, updateTask } from "./taskApi";
import "./App.css";

function getSavedLoginState() {
  try {
    return localStorage.getItem("flowly-is-logged-in") === "true";
  } catch {
    return false;
  }
}

function App() {
  const user = { name: "Jonas Jonaitis", email: "jonas@flowly.lt" };
  const [activePage, setActivePage] = useState("home");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(getSavedLoginState);
  const [loginError, setLoginError] = useState("");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    let isCurrent = true;
    getTasks()
      .then((data) => {
        if (isCurrent) setTasks(data);
      })
      .catch((error) => {
        if (isCurrent) setApiError(`Nepavyko įkelti užduočių: ${error.message}`);
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });
    return () => { isCurrent = false; };
  }, []);

  function handleSubmit(event) {
    event.preventDefault();
    if (email === "admin" && password === "admin") {
      setIsLoggedIn(true);
      setLoginError("");
      try {
        localStorage.setItem("flowly-is-logged-in", "true");
      } catch {
        // Prisijungimas veiks šiame lange, net jei naršyklė blokuoja saugyklą.
      }
      return;
    }
    setLoginError("Neteisingas vartotojo vardas arba slaptažodis.");
  }

  async function handleAddTask(newTask) {
    setApiError("");
    try {
      const createdTask = await createTask(newTask);
      setTasks((current) => [...current, { ...newTask, ...createdTask }]);
    } catch (error) {
      setApiError(`Nepavyko išsaugoti užduoties: ${error.message}`);
      throw error;
    }
  }

  async function handleTaskChange(taskId, changes) {
    const currentTask = tasks.find((task) => String(task.id) === String(taskId));
    if (!currentTask) return false;
    setApiError("");
    try {
      const updatedTask = await updateTask(taskId, { ...currentTask, ...changes });
      setTasks((current) => current.map((task) =>
        String(task.id) === String(taskId)
          ? { ...task, ...changes, ...(updatedTask || {}) }
          : task,
      ));
      return true;
    } catch (error) {
      setApiError(`Nepavyko atnaujinti užduoties: ${error.message}`);
      return false;
    }
  }

  async function handleDeleteTask(taskId) {
    setApiError("");
    try {
      await deleteTask(taskId);
      setTasks((current) => current.filter((task) => String(task.id) !== String(taskId)));
    } catch (error) {
      setApiError(`Nepavyko ištrinti užduoties: ${error.message}`);
    }
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const completedTaskCount = tasks.filter((task) => task.status === "Atlikta").length;
  const overdueTaskCount = tasks.filter((task) => {
    if (task.status === "Atlikta" || !task.deadline) return false;
    return new Date(`${task.deadline}T00:00:00`) < today;
  }).length;

  return (
    <>
      <Navbar activePage={activePage} onNavigate={setActivePage} />
      {activePage === "home" && (
        <>
          {isLoggedIn && <header className="welcome-message"><h1>Sveiki sugrįžę!</h1><p>Prisijungėte kaip admin.</p></header>}
          <main className="login-page">
            {!isLoggedIn && (
              <div className="login-card">
                <header className="login-card__header"><h1>Prisijungti</h1><p>Įveskite savo duomenis, kad tęstumėte</p></header>
                <form className="login-form" onSubmit={handleSubmit}>
                  <label className="login-field"><span>Vartotojo vardas</span><input type="text" name="username" autoComplete="username" placeholder="admin" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
                  <label className="login-field"><span>Slaptažodis</span><input type="password" name="password" autoComplete="current-password" placeholder="••••••••" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
                  <button type="submit" className="login-submit">Prisijungti</button>
                  {loginError && <p className="login-error" role="alert">{loginError}</p>}
                </form>
              </div>
            )}
            {isLoggedIn && (
              <>
                <section className="dashboard-summary" aria-label="Užduočių suvestinė"><p><strong>{tasks.length} užduotys</strong><span aria-hidden="true">·</span><strong>{completedTaskCount} atliktos</strong><span aria-hidden="true">·</span><strong>{overdueTaskCount} vėluoja</strong></p></section>
                {apiError && <p className="login-error" role="alert">{apiError}</p>}
                <TaskList tasks={tasks} loading={loading} onTaskChange={handleTaskChange} onDelete={handleDeleteTask} />
                <AddTaskForm onAddTask={handleAddTask} />
                <ProgressBar initialProgress={50} />
              </>
            )}
          </main>
        </>
      )}
      {activePage === "profile" && <Profile user={user} tasks={tasks} />}
    </>
  );
}

export default App;
