import mongoose from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email address is required"],
    unique: true,
    validate: {
      validator: (val) => {
        return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g.test(val);
      },
      message: "Invalid format",
    },
  },
  password: {
    type: String,
    trim: true,
    required: [true, "Password is required"],
    minLength: [6, "Password must be at least 6 characters"],
    select: false,
  },
  confirmPassword: {
    type: String,
    trim: true,
    required: [true, "Confirm password is required"],
    validate: {
      validator: function (value) {
        return this.password === value;
      },
      message: "Password are not the same.",
    },
  },
  passwordChangeAt: Date,
  resetToken: String,
  resetTokenExpiration: Date,
});

// userSchema.pre(/^find/, function (next) {
//   this.select("-password");
//   next();
// });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) next();
  // remove field before saving
  this.confirmPassword = undefined;
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();
  this.passwordChangeAt = Date.now();
  next();
});

userSchema.methods.comparePassword = async (inputPassword, userPassword) => {
  return bcrypt.compare(inputPassword, userPassword);
};

userSchema.methods.changedPassword = function (JWTTimestamp) {
  if (this.passwordChangeAt) {
    // convert to milliseconds to seconds
    const changeAtSeconds = parseInt(
      this.passwordChangeAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changeAtSeconds;
  }
  return false;
};

userSchema.methods.createResetToken = function () {
  const token = crypto.randomBytes(32).toString("hex");

  this.resetToken = crypto.createHash("sha256").update(token).digest("hex");
  this.resetTokenExpiration = Date.now() + 5 * 60 * 1000; // expiration after 5 minutes

  return token;
};

const User = mongoose.model("Users", userSchema);

export default User;
