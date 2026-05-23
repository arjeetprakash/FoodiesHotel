import { Schema, model } from 'mongoose';

const websiteVisitSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    count: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export const WebsiteVisitModel = model('WebsiteVisit', websiteVisitSchema);