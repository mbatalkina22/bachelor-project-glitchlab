import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IPendingUser extends Document {
  name: string;
  email: string;
  password: string;
  avatar?: string;
  role?: string;
  emailLanguage?: string;
  surname?: string;
  description?: string;
  website?: string;
  linkedin?: string;
  verificationCode: string;
  verificationCodeExpires: Date;
  createdAt: Date;
}

const PendingUserSchema = new Schema<IPendingUser>({
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
  emailLanguage: {
    type: String,
    enum: ['en', 'it'],
    default: 'en',
  },
  // Instructor specific fields (if registering as instructor)
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
  // Email verification fields
  verificationCode: {
    type: String,
    required: true,
  },
  verificationCodeExpires: {
    type: Date,
    required: true,
  },
  // When the pending user was created
  createdAt: {
    type: Date,
    default: Date.now,
    expires: '24h' // Automatically delete pending users after 24 hours if not verified
  }
}, {
  collection: 'pendingUsers'
});

// Hash password before saving
PendingUserSchema.pre('save', async function(next) {
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
PendingUserSchema.methods.comparePassword = async function(candidatePassword: string) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Create or get model
const PendingUser = mongoose.models.PendingUser || mongoose.model<IPendingUser>('PendingUser', PendingUserSchema);

export default PendingUser;