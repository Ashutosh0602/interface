class Action {
  constructor(type, position, content) {
    this.type = type; // 'insert' or 'delete'
    this.position = position;
    this.content = content;
  }
}

class UserAction {
  constructor(userId, action) {
    this.userId = userId;
    this.action = action;
  }
}

class TextEditor {
  constructor() {
    this.text = "";
    this.userHistories = {};
    this.userRedoStacks = {};
  }

  ensureUserHistory(userId) {
    if (!this.userHistories[userId]) {
      this.userHistories[userId] = [];
      this.userRedoStacks[userId] = [];
    }
  }

  insert(userId, position, content) {
    this.text =
      this.text.slice(0, position) + content + this.text.slice(position);
    const action = new Action("insert", position, content);
    this.ensureUserHistory(userId);
    this.userHistories[userId].push(action);
    this.userRedoStacks[userId] = []; // Clear redo stack on new action
  }

  delete(userId, position, length) {
    const deletedText = this.text.slice(position, position + length);
    this.text =
      this.text.slice(0, position) + this.text.slice(position + length);
    const action = new Action("delete", position, deletedText);
    this.ensureUserHistory(userId);
    this.userHistories[userId].push(action);
    this.userRedoStacks[userId] = []; // Clear redo stack on new action
  }

  undo(userId) {
    this.ensureUserHistory(userId);
    if (this.userHistories[userId].length === 0) return;

    const lastAction = this.userHistories[userId].pop();

    if (lastAction.type === "insert") {
      this.text =
        this.text.slice(0, lastAction.position) +
        this.text.slice(lastAction.position + lastAction.content.length);
    } else if (lastAction.type === "delete") {
      this.text =
        this.text.slice(0, lastAction.position) +
        lastAction.content +
        this.text.slice(lastAction.position);
    }

    this.userRedoStacks[userId].push(lastAction);
  }

  redo(userId) {
    this.ensureUserHistory(userId);
    if (this.userRedoStacks[userId].length === 0) return;

    const lastAction = this.userRedoStacks[userId].pop();

    if (lastAction.type === "insert") {
      this.text =
        this.text.slice(0, lastAction.position) +
        lastAction.content +
        this.text.slice(lastAction.position);
    } else if (lastAction.type === "delete") {
      this.text =
        this.text.slice(0, lastAction.position) +
        this.text.slice(lastAction.position + lastAction.content.length);
    }

    this.userHistories[userId].push(lastAction);
  }

  getText() {
    return this.text;
  }
}

module.exports = TextEditor;
