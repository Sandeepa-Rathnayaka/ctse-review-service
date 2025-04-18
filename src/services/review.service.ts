import mongoose from "mongoose";
import Review from "../models/review.model";
import { BadRequestError } from "../errors";
import {
  IReview,
  IReviewInput,
  IReviewFilters,
  IReviewResponse,
  IReviewsSummary,
  ReviewRating,
  ReviewType,
} from "../types/review.types";
import {
  getProductDetails,
  verifyProductPurchase,
  getUserDetails,
  updateProductRating,
} from "../utils/service-clients";
import logger from "../config/logger.config";

// Add a new review
export async function addReview(
  userId: string,
  reviewInput: IReviewInput,
  token: string
): Promise<IReviewResponse> {
  // Validate the target exists
  if (reviewInput.targetType === ReviewType.PRODUCT) {
    await getProductDetails(reviewInput.targetId, token);

    // Check if the user has purchased this product
    const isVerifiedPurchase = await verifyProductPurchase(
      userId,
      reviewInput.targetId,
      token
    );

    // Check if the user already reviewed this product
    const existingReview = await Review.findOne({
      user: userId,
      targetId: reviewInput.targetId,
      targetType: ReviewType.PRODUCT,
    });

    if (existingReview) {
      throw new BadRequestError("You have already reviewed this product");
    }

    // Create the review
    const review = await Review.create({
      user: userId,
      targetId: reviewInput.targetId,
      targetType: reviewInput.targetType,
      rating: reviewInput.rating,
      title: reviewInput.title,
      comment: reviewInput.comment,
      isVerifiedPurchase,
      images: reviewInput.images || [],
    });

    // Update product rating
    await updateProductAverageRating(reviewInput.targetId, token);

    // Get user details for the response
    const user = await getUserDetails(userId, token);

    return {
      review,
      userName: `${user.firstName} ${user.lastName}`,
      userAvatar: user.avatar,
    };
  } else if (reviewInput.targetType === ReviewType.SELLER) {
    // Similar logic for seller reviews
    // Check if user has purchased from this seller

    // Create the review
    const review = await Review.create({
      user: userId,
      targetId: reviewInput.targetId,
      targetType: reviewInput.targetType,
      rating: reviewInput.rating,
      title: reviewInput.title,
      comment: reviewInput.comment,
      isVerifiedPurchase: true, // Assuming always verified for seller reviews
      images: reviewInput.images || [],
    });

    // Get user details for the response
    const user = await getUserDetails(userId, token);

    return {
      review,
      userName: `${user.firstName} ${user.lastName}`,
      userAvatar: user.avatar,
    };
  }

  throw new BadRequestError("Invalid target type");
}

// Get a single review by ID
export async function getReviewById(
  reviewId: string,
  token: string
): Promise<IReviewResponse> {
  const review = await Review.findById(reviewId);

  if (!review) {
    throw new BadRequestError("Review not found");
  }

  // Get user details
  const user = await getUserDetails(review.user.toString(), token);

  return {
    review,
    userName: `${user.firstName} ${user.lastName}`,
    userAvatar: user.avatar,
  };
}

// Get reviews for a product
export async function getProductReviews(
  productId: string,
  filters: IReviewFilters,
  token: string
): Promise<{
  reviews: IReviewResponse[];
  total: number;
  pages: number;
  summary: IReviewsSummary;
}> {
  const {
    sortBy = "createdAt",
    order = "-1",
    limit = 10,
    page = 1,
    rating,
  } = filters;

  const skip = (page - 1) * limit;

  // Build query
  const query: any = {
    targetId: productId,
    targetType: ReviewType.PRODUCT,
  };

  // Add rating filter if provided
  if (rating) {
    query.rating = rating;
  }

  // Get reviews
  const reviews = await Review.find(query)
    .sort({ [sortBy]: parseInt(order as string) })
    .skip(skip)
    .limit(limit);

  // Get total count
  const total = await Review.countDocuments(query);

  // Calculate total pages
  const pages = Math.ceil(total / limit);

  // Get the summary
  const summary = await getReviewsSummary(productId, ReviewType.PRODUCT);

  // Get user details for each review
  const reviewsWithUserDetails = await Promise.all(
    reviews.map(async (review) => {
      const user = await getUserDetails(review.user.toString(), token);

      return {
        review,
        userName: `${user.firstName} ${user.lastName}`,
        userAvatar: user.avatar,
      };
    })
  );

  return {
    reviews: reviewsWithUserDetails,
    total,
    pages,
    summary,
  };
}

// Get reviews for a seller
export async function getSellerReviews(
  sellerId: string,
  filters: IReviewFilters,
  token: string
): Promise<{
  reviews: IReviewResponse[];
  total: number;
  pages: number;
  summary: IReviewsSummary;
}> {
  const {
    sortBy = "createdAt",
    order = "-1",
    limit = 10,
    page = 1,
    rating,
  } = filters;

  const skip = (page - 1) * limit;

  // Build query
  const query: any = {
    targetId: sellerId,
    targetType: ReviewType.SELLER,
  };

  // Add rating filter if provided
  if (rating) {
    query.rating = rating;
  }

  // Get reviews
  const reviews = await Review.find(query)
    .sort({ [sortBy]: parseInt(order as string) } as { [key: string]: number })
    .skip(skip)
    .limit(limit);

  // Get total count
  const total = await Review.countDocuments(query);

  // Calculate total pages
  const pages = Math.ceil(total / limit);

  // Get the summary
  const summary = await getReviewsSummary(sellerId, ReviewType.SELLER);

  // Get user details for each review
  const reviewsWithUserDetails = await Promise.all(
    reviews.map(async (review) => {
      const user = await getUserDetails(review.user.toString(), token);

      return {
        review,
        userName: `${user.firstName} ${user.lastName}`,
        userAvatar: user.avatar,
      };
    })
  );

  return {
    reviews: reviewsWithUserDetails,
    total,
    pages,
    summary,
  };
}

// Update a review
export async function updateReview(
  reviewId: string,
  userId: string,
  updateData: Partial<IReviewInput>,
  token: string
): Promise<IReviewResponse> {
  const review = await Review.findById(reviewId);

  if (!review) {
    throw new BadRequestError("Review not found");
  }

  // Check if the user is the owner of the review
  if (review.user.toString() !== userId) {
    throw new BadRequestError("You can only update your own reviews");
  }

  // Update allowed fields
  if (updateData.rating) review.rating = updateData.rating;
  if (updateData.title) review.title = updateData.title;
  if (updateData.comment) review.comment = updateData.comment;
  if (updateData.images) review.images = updateData.images;

  // Mark as edited
  review.isEdited = true;

  await review.save();

  // If it's a product review, update the average rating
  if (review.targetType === ReviewType.PRODUCT) {
    await updateProductAverageRating(review.targetId.toString(), token);
  }

  // Get user details for the response
  const user = await getUserDetails(userId, token);

  return {
    review,
    userName: `${user.firstName} ${user.lastName}`,
    userAvatar: user.avatar,
  };
}

// Delete a review
export async function deleteReview(
  reviewId: string,
  userId: string,
  isAdmin: boolean,
  token: string
): Promise<{ message: string }> {
  const review = await Review.findById(reviewId);

  if (!review) {
    throw new BadRequestError("Review not found");
  }

  // Check if the user is the owner of the review or an admin
  if (review.user.toString() !== userId && !isAdmin) {
    throw new BadRequestError("You can only delete your own reviews");
  }

  // Store the target type and ID before deletion
  const targetType = review.targetType;
  const targetId = review.targetId.toString();

  // Delete the review
  await review.deleteOne();

  // If it's a product review, update the average rating
  if (targetType === ReviewType.PRODUCT) {
    await updateProductAverageRating(targetId, token);
  }

  return { message: "Review deleted successfully" };
}

// Mark a review as helpful
export async function markReviewAsHelpful(
  reviewId: string
): Promise<{ helpfulVotes: number }> {
  const review = await Review.findById(reviewId);

  if (!review) {
    throw new BadRequestError("Review not found");
  }

  // Increment helpful votes
  review.helpfulVotes += 1;
  await review.save();

  return { helpfulVotes: review.helpfulVotes };
}

// Get reviews summary for a target (product or seller)
// src/services/review.service.ts (continued)
// Get reviews summary for a target (product or seller)
async function getReviewsSummary(
  targetId: string,
  targetType: ReviewType
): Promise<IReviewsSummary> {
  // Get all reviews for this target
  const allReviews = await Review.find({ targetId, targetType });

  if (allReviews.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: {
        [ReviewRating.POOR]: 0,
        [ReviewRating.FAIR]: 0,
        [ReviewRating.GOOD]: 0,
        [ReviewRating.VERY_GOOD]: 0,
        [ReviewRating.EXCELLENT]: 0,
      },
      verifiedPurchases: 0,
    };
  }

  // Calculate average rating
  const totalRating = allReviews.reduce(
    (sum, review) => sum + review.rating,
    0
  );
  const averageRating = totalRating / allReviews.length;

  // Calculate distribution
  const ratingDistribution: Record<ReviewRating, number> = {
    [ReviewRating.POOR]: 0,
    [ReviewRating.FAIR]: 0,
    [ReviewRating.GOOD]: 0,
    [ReviewRating.VERY_GOOD]: 0,
    [ReviewRating.EXCELLENT]: 0,
  };

  allReviews.forEach((review) => {
    ratingDistribution[review.rating as ReviewRating]++;
  });

  // Count verified purchases
  const verifiedPurchases = allReviews.filter(
    (review) => review.isVerifiedPurchase
  ).length;

  return {
    averageRating,
    totalReviews: allReviews.length,
    ratingDistribution,
    verifiedPurchases,
  };
}

// Helper to update product average rating
async function updateProductAverageRating(
  productId: string,
  token: string
): Promise<void> {
  try {
    // Get reviews summary for the product
    const summary = await getReviewsSummary(productId, ReviewType.PRODUCT);

    // Update product with the new rating
    await updateProductRating(
      productId,
      summary.averageRating,
      summary.totalReviews,
      token
    );
  } catch (error) {
    logger.error(`Failed to update product average rating: ${error}`);
    // Don't throw the error, just log it
  }
}

// Get user reviews
export async function getUserReviews(
  userId: string,
  filters: IReviewFilters,
  token: string
): Promise<{
  reviews: IReviewResponse[];
  total: number;
  pages: number;
}> {
  const { sortBy = "createdAt", order = "-1", limit = 10, page = 1 } = filters;

  const skip = (page - 1) * limit;

  // Get user's reviews
  const reviews = await Review.find({ user: userId })
    .sort({ [sortBy]: parseInt(order as string) })
    .skip(skip)
    .limit(limit);

  // Get total count
  const total = await Review.countDocuments({ user: userId });

  // Calculate total pages
  const pages = Math.ceil(total / limit);

  // Get user details
  const user = await getUserDetails(userId, token);

  // Create response with user details
  const reviewsWithUserDetails = reviews.map((review) => ({
    review,
    userName: `${user.firstName} ${user.lastName}`,
    userAvatar: user.avatar,
  }));

  return {
    reviews: reviewsWithUserDetails,
    total,
    pages,
  };
}
