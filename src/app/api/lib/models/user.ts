import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

// Define the badge schema
const BadgeSchema = new Schema({
  id: String,
  workshopId: {
    type: Schema.Types.ObjectId,
    ref: 'Workshop'
  },
  name: String,
  image: String,
  date: Date,
  description: String,
  awardedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
});

const UserSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false, // Don't return password in queries by default
  },
  avatar: {
    type: String,
    default: '/images/default-avatar.png',
  },
  role: {
    type: String,
    enum: ['user', 'instructor'],
    default: 'user',
  },
  registeredWorkshops: [{
    type: Schema.Types.ObjectId,
    ref: 'Workshop'
  }],
  // Added badges array to store user's earned badges
  badges: [BadgeSchema],
  // Instructor specific fields
  surname: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
  },
  website: {
    type: String,
    trim: true,
  },
  linkedin: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
  collection: 'users'
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function(candidatePassword: string) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.models.User || mongoose.model('User', UserSchema);