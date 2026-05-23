import { format } from 'date-fns';

export const parseCreatedDate = (createdAt: any): Date | null => {
  if (!createdAt) return null;
  try {
    if (typeof createdAt.toDate === 'function') {
      return createdAt.toDate();
    }
    if (typeof createdAt === 'string' || typeof createdAt === 'number') {
      const d = new Date(createdAt);
      if (!isNaN(d.getTime())) return d;
    }
    if (createdAt instanceof Date) {
      return createdAt;
    }
    if (typeof createdAt.seconds === 'number') {
      return new Date(createdAt.seconds * 1000);
    }
    if (typeof createdAt._seconds === 'number') {
      return new Date(createdAt._seconds * 1000);
    }
    if (createdAt && typeof createdAt === 'object') {
      // If it looks like firestore timestamp representation from JSON API
      if (typeof createdAt.seconds === 'number') {
        return new Date(createdAt.seconds * 1000);
      }
    }
    const parsed = new Date(createdAt);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
  } catch (e) {
    console.error('Error parsing date:', d => d, createdAt);
  }
  return null;
};

export const formatSafe = (dateVal: any, formatString: string, fallback = 'PENDING'): string => {
  const parsed = parseCreatedDate(dateVal);
  if (!parsed) return fallback;
  try {
    return format(parsed, formatString);
  } catch (e) {
    console.error('Error formatting date:', e, dateVal);
    return fallback;
  }
};
