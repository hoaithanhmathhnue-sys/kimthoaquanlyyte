import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import dayjs from "dayjs";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
}

export function formatDate(date: string | Date, format = "DD/MM/YYYY") {
  return dayjs(date).format(format);
}

export function generateId() {
  return Math.random().toString(36).substring(2, 9);
}
