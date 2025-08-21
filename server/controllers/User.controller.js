const User = require("../models/User.model");

exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

exports.createUser = async (req, res, next) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const id = req.params["id"];
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const id = req.params["id"];
    const user = await User.findByIdAndUpdate(id, req.body, { new: true });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const id = req.params["id"];
    await User.findByIdAndDelete(id);
    res.status(200).json("User has been deleted successfully");
  } catch (error) {
    next(error);
  }
};
exports.createUsersBulk = async (req, res, next) => {
  try {
    const { names } = req.body; // ["Jan", "Alex", ...]
    if (!Array.isArray(names) || names.length === 0) {
      return res.status(400).json({ message: "names[] required" });
    }
    const docs = names
      .map((n) => ({ name: String(n).trim() }))
      .filter((n) => n.name);
    const result = await User.insertMany(docs, { ordered: false });
    res.status(201).json(result);
  } catch (err) {
    // Duplikate o.ä. mit verständlicher Meldung rausgeben
    if (err?.writeErrors?.length) {
      return res.status(207).json({
        message: "partial success",
        errors: err.writeErrors.map((e) => e.errmsg || e.message),
      });
    }
    next(err);
  }
};
