import mongoose, { Schema } from "mongoose";
import { IReview, ReviewRating, ReviewType } from "../types/review.types";

const ReviewSchema = new Schema<IReview>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    targetType: {
      type: String,
      enum: Object.values(ReviewType),
      required: true,
    },
    rating: {
      type: Number,
      enum: Object.values(ReviewRating).filter((x) => typeof x === "number"),
      required: true,
    },
    title: {
      type: String,
      maxlength: 100,
    },
    comment: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 1000,
    },
    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    helpfulVotes: {
      type: Number,
      default: 0,
    },
    images: {
      type: [String],
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index for user+targetId to prevent multiple reviews
ReviewSchema.index({ user: 1, targetId: 1 }, { unique: true });

const Review = mongoose.model<IReview>("Review", ReviewSchema);
export default Review;
