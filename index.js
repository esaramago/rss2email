import RSS2Email from './src/main.js'
import { schedule } from 'node-cron'

const rss2Email = new RSS2Email()

// Execute once a day
schedule('0 0 * * *', () => rss2Email.init())

// Test execution
rss2Email.init()