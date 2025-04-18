import { Document, ObjectId } from "mongoose";

export enum ReviewRating {
  POOR = 1,
  FAIR = 2,
  GOOD = 3,
  VERY_GOOD = 4,
  EXCELLENT = 5,
}

export enum ReviewType {
  PRODUCT = "product",
  SELLER = "seller",
}

export interface IReview extends Document {
  user: ObjectId;
  targetId: ObjectId; // Product ID or Seller ID
  targetType: ReviewType;
  rating: ReviewRating;
  title?: string;
  comment: string;
  isVerifiedPurchase: boolean;
  isEdited: boolean;
  helpfulVotes: number;
  images?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IReviewInput {
  targetId: string;
  targetType: ReviewType;
  rating: ReviewRating;
  title?: string;
  comment: string;
  images?: string[];
}

export interface IReviewResponse {
  review: IReview;
  userName: string;
  userAvatar?: string;
}

export interface IReviewFilters {
  sortBy?: string;
  order?: string;
  limit?: number;
  page?: number;
  rating?: ReviewRating;
}

export interface IReviewsSummary {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<ReviewRating, number>;
  verifiedPurchases: number;
}

export enum ROLES {
  ADMIN = "admin",
  USER = "user",
  SELLER = "seller",
}
