import RSS2Email from './main.js'
import { schedule } from 'node-cron'
import dotenv from 'dotenv'
import { readFile } from 'fs/promises'
import convertWeekdays from './helpers/convertWeekdays.js'

dotenv.config()

const feedsList = JSON.parse(await readFile(new URL('../data/feeds.json', import.meta.url), 'utf8'))
const settings = JSON.parse(await readFile(new URL('../data/settings.json', import.meta.url), 'utf8'))

const rss2Email = new RSS2Email(feedsList,settings)
if (process.env.ENV === 'development') {
  // Test execution
  rss2Email.init()
} else {
  // Execute every week day
  const jsWeekdays = convertWeekdays(settings.weekdays)
  const weekdays = jsWeekdays.join(',')
  const cron = `0 0 * * ${weekdays}`
  schedule(cron, () => rss2Email.init())
}
