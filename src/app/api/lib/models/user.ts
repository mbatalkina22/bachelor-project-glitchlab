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

// Define the notification schema for user notifications
const NotificationSchema = new Schema({
  type: {
    type: String,
    enum: ['workshop_removal', 'badge_awarded', 'workshop_update', 'general'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  workshopId: {
    type: Schema.Types.ObjectId,
    ref: 'Workshop'
  },
  workshopName: String,
  read: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  action: {
    label: String,
    href: String
  }
});

// Define the email notifications schema
const EmailNotificationsSchema = new Schema({
  workshops: {
    type: Boolean,
    default: true
  },
  changes: {
    type: Boolean,
    default: true
  }
}, { _id: false });

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
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false, // Don't return password in queries by default
  },
  emailLanguage: {
    type: String,
    enum: ['en', 'it'],
    default: 'en',
  },
  emailNotifications: {
    type: EmailNotificationsSchema,
    default: {
      workshops: true,
      changes: true
    }
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
  // Added notifications array to store user notifications
  notifications: [NotificationSchema],
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
  // Email verification fields
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationCode: {
    type: String,
  },
  verificationCodeExpires: {
    type: Date,
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