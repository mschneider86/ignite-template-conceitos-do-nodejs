const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(404).json({ error: "User not found" });
  }

  request.user = user;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const usernameTaken = users.some((user) => user.username === username);

  if (usernameTaken) {
    return response
      .status(400)
      .json({ error: "This username is not available" });
  }

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(newUser);

  return response.status(201).json(newUser);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const user = request.user;

  return response.status(200).json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;

  const { title, deadline } = request.body;

  const todoToUpdate = request.user.todos.find((todo) => todo.id === id);

  if (todoToUpdate) {
    todoToUpdate.title = title;
    todoToUpdate.deadline = deadline;

    return response.status(200).json(todoToUpdate);
  } else {
    return response.status(404).json({ error: "ToDO not found!" });
  }
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;

  const todoToUpdate = request.user.todos.find((todo) => todo.id === id);

  const { username } = request.headers;

  if (todoToUpdate) {
    todoToUpdate.done = true;
    return response.status(200).json(todoToUpdate);
  } else {
    return response.status(404).json({ error: "ToDO not found!" });
  }
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;

  const todoToUpdate = request.user.todos.find((todo) => todo.id === id);

  if (todoToUpdate) {
    request.user.todos = request.user.todos.filter(
      (todo) => todo.id !== todoToUpdate.id
    );

    return response.status(204).json(request.user.todos);
  } else {
    return response.status(404).json({ error: "ToDO not found!" });
  }
});

module.exports = app;
