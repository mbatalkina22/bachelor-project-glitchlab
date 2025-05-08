import mongoose, { Schema } from 'mongoose';

const ReviewSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required for a review'],
  },
  workshop: {
    type: Schema.Types.ObjectId,
    ref: 'Workshop',
    required: [true, 'Workshop ID is required for a review'],
  },
  userName: {
    type: String,
    required: [true, 'User name is required for a review'],
  },
  circleColor: {
    type: String,
    required: [true, 'Circle color is required'],
  },
  circleFont: {
    type: String,
    required: [true, 'Circle font is required'],
  },
  circleText: {
    type: String,
    required: [true, 'Circle text is required'],
  },
  comment: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  collection: 'reviews'
});

// Create a compound index to ensure one review per user per workshop
ReviewSchema.index({ user: 1, workshop: 1 }, { unique: true });

export default mongoose.models.Review || mongoose.model('Review', ReviewSchema); 