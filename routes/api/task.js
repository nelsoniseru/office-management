const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator/check");
const sgMail = require("@sendgrid/mail");

const Task = require("../../models/Task");
const Template = require("../../models/Template");
const User = require("../../models/User");
const Brokerage = require("../../models/Brokerage");
const auth = require("../../middleware/auth");

const keys = require("../../config/keys");

sgMail.setApiKey(keys.sendgridKey);
const accountSid = keys.twilioId;
const authToken = keys.twilioAuth;
const client = require("twilio")(accountSid, authToken);

// @route   GET api/task
// @desc    get all tasks by logged in user
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const tasks = await Task.find({ assignee: req.user.id })
      .populate("agent")
      .populate("brokerage")
      .populate("assignee")
      .populate("template");

    if (tasks.length === 0) {
      return res.json({ msg: "User has no tasks" });
    }

    res.json(tasks);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route   POST api/task/:user
// @desc    create a task
// @access  Private
router.post(
  "/:user",
  [
    auth,
    [
      check("taskName", "Task name is required")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { brokerage } = req.user;
    const assignee = req.params.user;

    const {
      agent,
      taskName,
      taskType,
      status,
      notes,
      template,
      dueDate,
      description
    } = req.body;

    const userAgent = await User.findOne({ name: agent });
    const templateInfo = await Template.findOne({ title: template });

    try {
      let task = new Task({
        agent: userAgent.id,
        taskName,
        taskType,
        assignee,
        brokerage,
        status,
        template: templateInfo._id,
        notes,
        dueDate,
        description
      })
        .populate("brokerage")
        .populate("agent")
        .populate("assignee")
        .populate("template");

      await task.save();

      res.json(task);
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ msg: "Server Error" });
    }
  }
);

// @route   GET api/task/brokerage
// @desc    get all tasks by logged in user's brokerage
// @access  Private
router.get("/brokerage", auth, async (req, res) => {
  try {
    const tasks = await Task.find({ brokerage: req.user.brokerage })
      .populate("brokerage")
      .populate("agent")
      .populate("assignee")
      .populate("template");
    if (tasks.length === 0) {
      return res.json({ msg: "Brokerage has no tasks" });
    }

    res.json(tasks);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route   GET api/task/:id
// @desc    get a task
// @access  Private
router.get("/:id", auth, async (req, res) => {
  const id = req.params.id;
  try {
    let task = await Task.findById(id)
      .populate("agent")
      .populate("assignee")
      .populate("template")
      .populate("brokerage");

    if (!task) {
      return res.status(400).json({ msg: "Task not found" });
    }
    const user = await User.findById(task.agent);
    const template = await Template.findById(task.template);

    task = {
      ...task._doc,
      templateInfo: { ...template._doc }
    };

    task.templateInfo.body = task.templateInfo.body.replace(
      /{{name}}/gi,
      user.name
    );

    res.json(task);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route   POST api/task/:id
// @desc    Update a task
// @access  Private
router.post("/:id", auth, async (req, res) => {
  const id = req.params.id;
  const {
    taskName,
    dueDate,
    description,
    assignee,
    taskType,
    template
  } = req.body;

  const updates = {};
  if (taskName) updates.taskName = taskName;
  if (dueDate) updates.dueDate = dueDate;
  if (description) updates.description = description;
  if (assignee) updates.assignee = assignee;
  if (taskType) updates.taskType = taskType;
  if (template) updates.template = template;

  try {
    let task = await Task.findById(id);
    if (!task) {
      return res.status(400).json({ msg: "Task not found" });
    }

    task = await Task.findOneAndUpdate(
      id,
      { $set: updates },
      { new: true, useFindAndModify: false }
    );
    res.json(task);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route   POST api/task/:id/complete
// @desc    Completes a task
// @access  Private
router.post("/:id/complete", auth, async (req, res) => {
  const id = req.params.id;
  const { body, subject, from } = req.body;

  const updates = {};
  updates.status = "complete";
  updates.completeDate = Date.now();
  updates.completedBy = req.user.id;

  try {
    let task = await Task.findById(id)
      .populate("agent")
      .populate("template")
      .populate("brokerage");
    if (!task) {
      return res.status(400).json({ msg: "Task not found" });
    }

    const user = await User.findById(task.agent);
    const assignee = await User.findById(task.assignee).populate("user");
    const brokerage = await Brokerage.findById(assignee.brokerage);

    if (task.taskType == "email") {
      let msg = {
        to: user.email,
        from: assignee.email,
        subject,
        text: body
      };
      sgMail.send(msg);
    }

    if (task.taskType == "text") {
      if (!from) {
        return res.status(400).json({ msg: "Texting number not set up" });
      }
      //send text through twilio
      let msg = {
        from,
        body,
        to: user.phone
      };
      const sms = await client.messages.create(msg);
    }

    task = await Task.findOneAndUpdate(
      { _id: id },
      { $set: updates },
      { new: true, useFindAndModify: false }
    );
    res.json(task);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route   POST api/task/:id/uncomplete
// @desc    Uncompletes a task
// @access  Private
router.post("/:id/uncomplete", auth, async (req, res) => {
  const id = req.params.id;

  try {
    let task = await Task.findById(id);
    if (!task) {
      return res.status(400).json({ msg: "Task not found" });
    }

    task = await Task.findOneAndUpdate(
      id,
      {
        $set: { status: "open" },
        $unset: { completeDate: "", completedBy: "" }
      },
      { new: true, useFindAndModify: false }
    );
    res.json(task);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server Error" });
  }
});

module.exports = router;
