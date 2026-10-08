const TASKS_URL = "https://testapi.io/api/alinaberdovska/resource/tasklist";

async function request(url, options) {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options?.body ? { "Content-Type": "application/json" } : {}),
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Serverio klaida (${response.status}).`);
  }

  if (response.status === 204) return null;
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

function unwrapTasks(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.records)) return data.records;
  return [];
}

export async function getTasks() {
  return unwrapTasks(await request(TASKS_URL));
}

export function createTask(task) {
  return request(TASKS_URL, {
    method: "POST",
    body: JSON.stringify(task),
  });
}

export function updateTask(id, task) {
  return request(`${TASKS_URL}/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(task),
  });
}

export function deleteTask(id) {
  return request(`${TASKS_URL}/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
