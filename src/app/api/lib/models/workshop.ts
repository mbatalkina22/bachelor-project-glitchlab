import mongoose, { Schema } from 'mongoose';

// Schema for localized content
const LocalizedContentSchema = new Schema({
  en: { type: String, required: false },
  it: { type: String, required: false }
}, { _id: false });

const WorkshopSchema = new Schema({
  // Keeping name as a fallback but making it not required
  name: {
    type: String,
    required: false,
    trim: true,
  },
  nameTranslations: {
    type: LocalizedContentSchema,
    required: [true, 'Please provide workshop name translations']
  },
  // Keeping description as a fallback but making it not required
  description: {
    type: String,
    required: false,
  },
  descriptionTranslations: {
    type: LocalizedContentSchema,
    required: [true, 'Please provide workshop description translations']
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

  badgeName: {
    type: String,
    required: false,
  },
  badgeNameTranslations: {
    type: LocalizedContentSchema,
    required: [true, 'Please provide a name for the workshop badge in both languages']
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
  instructorIds: {
    type: [Schema.Types.ObjectId],
    ref: 'User',
    required: [true, 'Please provide at least one instructor ID'],
  },
  capacity: {
    type: Number,
    default: 10,
    required: [true, 'Please provide the maximum capacity for the workshop'],
  },
  registeredCount: {
    type: Number,
    default: 0,
  },
  bgColor: {
    type: String,
    default: '#ffffff',
  },
  canceled: {
    type: Boolean,
    default: false,
  },
}, {
  collection: 'workshops'
});

export default mongoose.models.Workshop || mongoose.model('Workshop', WorkshopSchema);