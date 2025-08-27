const { Schema, model } = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  role: {
    type: String,
    default: 'user',
  },
  profileImage: {
    type: String,
  },
  bio: {
    type: String,
    maxlength: 500,
  },
  profession: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });


// hash password before saving
userSchema.pre('save', async function (next) {
  // if (this.isModified('password')) {
  //   const bcrypt = require('bcrypt');
  //   const salt = await bcrypt.genSalt(10);
  //   this.password = await bcrypt.hash(this.password, salt);
  // }
  // next();
                    //  OR
  // if (!this.isModified('password')) return next();
  // try { 
  //   const salt = await bcrypt.genSalt(10);
  //   this.password = await bcrypt.hash(this.password, salt);
  //   next();
  // }
  // catch (error) {
  //   next(error);
  // }
                    // OR
    const user = this;
    if (!user.isModified('password')) return next();
    const hashedPassword = await bcrypt.hash(user.password, 10);
    user.password = hashedPassword;
    next();
});

// method to compare password  // match password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};



//exporting the User model
const User = new model('User', userSchema);
module.exports = User;
