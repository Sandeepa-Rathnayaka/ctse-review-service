import { z } from "zod";
import mongoose from "mongoose";
import { ReviewRating, ReviewType } from "../types/review.types";

// Helper function to check if a string is a valid MongoDB ObjectId
const isValidObjectId = (id: string): boolean => {
  return mongoose.Types.ObjectId.isValid(id);
};

export const addReviewSchema = z.object({
  body: z.object({
    targetId: z
      .string()
      .refine(isValidObjectId, { message: "Invalid target ID" }),
    targetType: z.nativeEnum(ReviewType, {
      errorMap: () => ({
        message: 'Target type must be either "product" or "seller"',
      }),
    }),
    rating: z.nativeEnum(ReviewRating, {
      errorMap: () => ({ message: "Rating must be between 1 and 5" }),
    }),
    title: z
      .string()
      .max(100, "Title must be at most 100 characters")
      .optional(),
    comment: z
      .string()
      .min(2, "Comment must be at least 2 characters")
      .max(1000, "Comment must be at most 1000 characters"),
    images: z.array(z.string().url("Image URL must be valid")).optional(),
  }),
});

export const updateReviewSchema = z.object({
  params: z.object({
    id: z.string().refine(isValidObjectId, { message: "Invalid review ID" }),
  }),
  body: z
    .object({
      rating: z
        .nativeEnum(ReviewRating, {
          errorMap: () => ({ message: "Rating must be between 1 and 5" }),
        })
        .optional(),
      title: z
        .string()
        .max(100, "Title must be at most 100 characters")
        .optional(),
      comment: z
        .string()
        .min(2, "Comment must be at least 2 characters")
        .max(1000, "Comment must be at most 1000 characters")
        .optional(),
      images: z.array(z.string().url("Image URL must be valid")).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided for update",
      path: [],
    }),
});

export const getReviewSchema = z.object({
  params: z.object({
    id: z.string().refine(isValidObjectId, { message: "Invalid review ID" }),
  }),
});

export const getProductReviewsSchema = z.object({
  params: z.object({
    productId: z
      .string()
      .refine(isValidObjectId, { message: "Invalid product ID" }),
  }),
  query: z
    .object({
      sortBy: z.string().optional(),
      order: z.string().regex(/^-?1$/).optional(),
      limit: z.string().regex(/^\d+$/).transform(Number).optional(),
      page: z.string().regex(/^\d+$/).transform(Number).optional(),
      rating: z
        .string()
        .regex(/^[1-5]$/)
        .transform(Number)
        .optional(),
    })
    .optional(),
});

export const getSellerReviewsSchema = z.object({
  params: z.object({
    sellerId: z
      .string()
      .refine(isValidObjectId, { message: "Invalid seller ID" }),
  }),
  query: z
    .object({
      sortBy: z.string().optional(),
      order: z.string().regex(/^-?1$/).optional(),
      limit: z.string().regex(/^\d+$/).transform(Number).optional(),
      page: z.string().regex(/^\d+$/).transform(Number).optional(),
      rating: z
        .string()
        .regex(/^[1-5]$/)
        .transform(Number)
        .optional(),
    })
    .optional(),
});

export const markReviewAsHelpfulSchema = z.object({
  params: z.object({
    id: z.string().refine(isValidObjectId, { message: "Invalid review ID" }),
  }),
});
