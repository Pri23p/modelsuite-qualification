function notifyTaskAssignment(task, talent) {
  console.log(
    `[Notification] Task "${task.title}" assigned to ${talent.name} (${talent.email})`
  );
}

module.exports = {
  notifyTaskAssignment,
};