import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['Admin', 'TeamLead', 'User', 'Auditor'], default: 'User' },
    permissions: [String],
    avatarUrl: { type: String, default: null },
    status: { type: String, enum: ['active', 'suspended', 'archived'], default: 'active' },
    lastLogin: { type: Date },
    loginCount: { type: Number, default: 0 },
    teams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team' }],
  },
  { timestamps: true }
);

// Indexes for performance
userSchema.index({ role: 1 });
userSchema.index({ createdAt: 1 });
userSchema.index({ lastLogin: 1 });
userSchema.index({ name: 'text', email: 'text' });

// Pre-save hook to hash password
userSchema.pre('save', async function () {
  const user = this;
  if (!user.isModified('password')) return;

  const salt = await bcrypt.genSalt(12);
  const hash = await bcrypt.hash(user.password, salt);
  user.password = hash;
});

// Method to compare password
userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Start method check
userSchema.methods.isSuspended = function () {
  return this.status === 'suspended';
};

const User = model('User', userSchema);
export default User;
