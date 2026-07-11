const Task = require('../models/Task');

// @desc  Get all tasks
// @route GET /api/tasks
// @access Admin
const Submission = require('../models/Submission');

const User = require("../models/User");
const notifications = require("../utils/notifications");
console.log("Notifications:", notifications);

const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find({})
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get single task
// @route GET /api/tasks/:id
// @access Admin
const getTaskById = async (req, res) => {
  try {
    // — will throw a CastError from Mongoose instead of a clean 400
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name');

    if (!task) return res.status(404).json({ message: 'Task not found' });

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Create a task
// @route POST /api/tasks
// @access Admin
const createTask = async (req, res) => {
  const { title, description, status, assignedTo, dueDate } = req.body;

  try {
    const task = await Task.create({
      title,
      description,
      status,
      assignedTo: assignedTo || null,
      dueDate,
      createdBy: req.user._id,
    });


   if (assignedTo) {
  const talent = await User.findById(assignedTo);

  if (talent) {
    console.log(
      `[Notification] Task "${task.title}" assigned to ${talent.name} (${talent.email})`
    );
  }
}

    res.status(201).json(task);
  } catch (error) {
  console.error("Create Task Error:", error);
  res.status(500).json({ message: error.message });
}
};
// @desc  Update a task
// @route PUT /api/tasks/:id
// @access Admin
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Store previous assignee
    const previousAssignedTo = task.assignedTo
      ? task.assignedTo.toString()
      : null;

    const updated = await Task.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true }
    ).populate('assignedTo', 'name email');

    // Notify only if assignment changed
    if (
      updated.assignedTo &&
      previousAssignedTo !== updated.assignedTo._id.toString()
    ) {
      console.log(
        `[Notification] Task "${updated.title}" assigned to ${updated.assignedTo.name} (${updated.assignedTo.email})`
      );
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc  Delete a task
// @route DELETE /api/tasks/:id
// @access Admin
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    // Delete all submissions associated with this task
    await Submission.deleteMany({ taskId: req.params.id });

    // Delete the task
    await Task.findByIdAndDelete(req.params.id);

    res.json({ message: 'Task and associated submissions deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAllTasks, getTaskById, createTask, updateTask, deleteTask };
