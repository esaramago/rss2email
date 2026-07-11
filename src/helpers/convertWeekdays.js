// convert weekdays
// Convert weekdays from 1-7 (Sunday-Saturday) to 0-6 (Sunday-Saturday)

export default function convertWeekdays(weekdays = []) {
  return weekdays.map(day => day - 1)
}