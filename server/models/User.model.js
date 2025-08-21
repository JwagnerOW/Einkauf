const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 60,
      unique: true, // optional: eindeutige Namen
    },
    toPay: Number,
    hasPayed: Number,
  },
  { timestamps: true }
);

userSchema.index({ name: 1 }, { unique: true }); // falls unique genutzt

module.exports = mongoose.model("User", userSchema);
