import RSS2Email from './src/main.js'
import { schedule } from 'node-cron'
import dotenv from 'dotenv'

dotenv.config()

const rss2Email = new RSS2Email()

if (process.env.ENV === 'development') {
  // Test execution
  rss2Email.init()
} else {
  // Execute once a day
  schedule('0 0 * * *', () => rss2Email.init())
}
