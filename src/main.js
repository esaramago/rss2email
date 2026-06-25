import dotenv from 'dotenv'
import Parser from 'rss-parser'
import { createTransport } from 'nodemailer'
import { readFile } from 'fs/promises'
import TemplateHTML from './template.html.js'

dotenv.config()

export default class RSS2Email {

  async init() {

    const feedsList = JSON.parse(await readFile(new URL('./feeds.json', import.meta.url), 'utf8'))

    const feedsData = []
    for (const feed of feedsList) {
      const parser = new Parser()
      const parsedFeed = await parser.parseURL(feed.url)
      const feedData = await this.#getArticlesData(parsedFeed, feed.categories)
      feedData.color = feed.color || '#333'
      feedsData.push(feedData)
    }

    const template = new TemplateHTML(feedsData)
    const content = template.render()

    await this.#sendEmail(
      `Artigos de RSS Feed da semana`,
      content
    )
  }

  async #getArticlesData(feed, categories = null) {

    // filter articles from the last week
    feed.items = feed.items.filter(item => {
      const pubDate = new Date(item.pubDate)
      const now = new Date()
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      return pubDate.getTime() >= oneWeekAgo.getTime()
    })

    // filter articles by category
    if (categories && categories.length > 0) {
      feed.items = feed.items.filter(item => {
        return item.categories?.some(category => categories.includes(category.toLowerCase()))
      })
    }

    return feed
  }

  async #sendEmail(subject, text) {

    const smtpPort = Number(process.env.SMTP_PORT || 587)

    const transporter = createTransport({
      host: process.env.SMTP_HOST,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
    })

    await transporter.sendMail({
      from: `"RSS2Email" <${process.env.EMAIL_FROM}>`,
      to: process.env.EMAIL_TO,
      subject,
      text,
    })

    console.log(`EMAIL SENT SUCCESSFULLY: ${subject}`)
  }
}