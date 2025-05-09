import mongoose, { Schema } from 'mongoose';

const WorkshopSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name for the workshop'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please provide a description for the workshop'],
  },
  startDate: {
    type: Date,
    required: [true, 'Please provide a start date for the workshop'],
  },
  endDate: {
    type: Date,
    required: [true, 'Please provide an end date for the workshop'],
  },
  imageSrc: {
    type: String,
    required: [true, 'Please provide an image URL for the workshop'],
  },
  badgeImageSrc: {
    type: String,
    required: [true, 'Please provide a badge image URL for the workshop'],
  },
  categories: {
    type: [String],
    required: [true, 'Please provide at least one category for the workshop'],
  },
  level: {
    type: String,
    required: [true, 'Please provide the required level for the workshop'],
  },
  location: {
    type: String,
    required: [true, 'Please provide a location for the workshop'],
  },
  instructor: {
    type: String,
    required: [true, 'Please provide the name of the instructor'],
  },
  capacity: {
    type: Number,
    default: 30,
    required: [true, 'Please provide the maximum capacity for the workshop'],
  },
  registeredCount: {
    type: Number,
    default: 0,
  },
}, {
  collection: 'workshops'
});

export default mongoose.models.Workshop || mongoose.model('Workshop', WorkshopSchema); 