// Utility functions for business logic

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Calculate points from transaction amount
 * Rule: 1 point per 1000 rupiah (floored)
 */
export function calculatePoints(amount: number): number {
  if (amount < 0) return 0;
  return Math.floor(amount / 1000);
}

/**
 * Generate unique voucher code
 * Format: POIN-XXXXXXXX (8 random alphanumeric)
 */
export function generateVoucherCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'POIN-';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Determine membership level based on points
 */
export function getMembershipLevel(points: number): string {
  if (points >= 10000) return 'GOLD';
  if (points >= 5000) return 'SILVER';
  return 'BRONZE';
}

/**
 * Format currency to IDR
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format date to Indonesian locale
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

/**
 * Format datetime to Indonesian locale
 */
export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}
