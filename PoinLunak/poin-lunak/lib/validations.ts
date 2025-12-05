// Zod validation schemas for API input validation

import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export const transactionSchema = z.object({
  users_id: z.number().positive('User ID harus valid'),
  total_item: z.number().positive('Total item harus lebih dari 0'),
  total_transaction: z.number().positive('Total transaksi harus lebih dari 0'),
  items: z.string().optional(),
});

export const redeemRewardSchema = z.object({
  users_id: z.number().positive('User ID harus valid'),
  reward_id: z.number().positive('Reward ID harus valid'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter').optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export const manualPointAdjustmentSchema = z.object({
  users_id: z.number().positive('User ID harus valid'),
  points: z.number().int('Poin harus bilangan bulat'),
  reason: z.string().min(5, 'Alasan minimal 5 karakter'),
});
