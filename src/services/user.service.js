import User from "../models/user.model";

export const getUsers = async () => {
  return await User.find();
};

export const createUser = async (user) => {
  return await User.create({
    ...user,
  });
};

export const getUserById = async (id, flag = false) => {
  return await User.findById(id).select(flag ? "+password" : "");
};

export const getUserByEmail = async (email, flag = false) => {
  return await User.findOne({ email }).select(flag ? "+password" : "");
};

export const getResetToken = async (resetToken) => {
  return await User.findOne({
    resetToken,
    resetTokenExpiration: {
      $gt: Date.now(),
    },
  });
};

export const updateUser = async (id, userInfo) => {
  return await User.findByIdAndUpdate(id, userInfo, {
    new: true,
    runValidators: true,
  });
};
