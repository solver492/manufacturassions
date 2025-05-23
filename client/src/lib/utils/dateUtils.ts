import { format, parse, isValid, addDays, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';

export const formatDate = (dateString: string, formatStr: string = 'dd/MM/yyyy'): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return isValid(date) ? format(date, formatStr, { locale: fr }) : dateString;
};

export const formatTime = (timeString: string | undefined, formatStr: string = 'HH:mm'): string => {
  if (!timeString) return '';
  
  try {
    const date = parse(timeString, 'HH:mm', new Date());
    return isValid(date) ? format(date, formatStr) : timeString;
  } catch (error) {
    return timeString;
  }
};

export const isToday = (dateString: string): boolean => {
  if (!dateString) return false;
  
  const date = new Date(dateString);
  const today = new Date();
  
  return isValid(date) && 
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
};

export const addDaysToDate = (dateString: string, days: number): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  if (!isValid(date)) return dateString;
  
  const newDate = addDays(date, days);
  return format(newDate, 'yyyy-MM-dd');
};

export const getDaysDifference = (startDateString: string, endDateString: string): number => {
  if (!startDateString || !endDateString) return 0;
  
  const startDate = new Date(startDateString);
  const endDate = new Date(endDateString);
  
  if (!isValid(startDate) || !isValid(endDate)) return 0;
  
  return differenceInDays(endDate, startDate);
};

export const getCurrentMonthName = (): string => {
  return format(new Date(), 'MMMM yyyy', { locale: fr });
};

export const getCurrentWeekRange = (): string => {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday, etc.
  
  // Adjust to get first day of week (Monday in French format)
  const firstDay = addDays(today, dayOfWeek === 0 ? -6 : 1 - dayOfWeek); 
  const lastDay = addDays(firstDay, 6);
  
  const start = format(firstDay, 'dd/MM', { locale: fr });
  const end = format(lastDay, 'dd/MM/yyyy', { locale: fr });
  
  return `${start} - ${end}`;
};
