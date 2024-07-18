import { DateTime } from 'luxon'

export const useDateTime = (date: string) => {
  if (!date) return ''

  const formatted = DateTime.fromISO(date).toFormat('HH:mm')

  return formatted
}

export const useGetISOStringFromDate = (date: string | Date) => {
  /**
   * Takes a date in either string or Date type, it converts it
   * to an ISO string if it's an object.
   *
   * @remarks
   *
   * @param date - The date to format
   * @returns An ISO string, either the date you've put in the params
   * already is one, or it converts it to one
   */
  if (!date) return null
  return typeof date === 'object' ? date.toISOString() : date
}
