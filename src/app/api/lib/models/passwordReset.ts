import mongoose, { Schema } from 'mongoose';

const PasswordResetSchema = new Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  code: {
    type: String,
    required: true,
  },
  expires: {
    type: Date,
    required: true,
  },
  used: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  collection: 'password_resets'
});

export default mongoose.models.PasswordReset || mongoose.model('PasswordReset', PasswordResetSchema);