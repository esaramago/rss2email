import dotenv from 'dotenv'
import Parser from 'rss-parser'
import { createTransport } from 'nodemailer'
import TemplateHTML from './template.html.js'
import convertWeekdays from './helpers/convertWeekdays.js'

dotenv.config()

export default class RSS2Email {

  constructor(feedsList, settings) {
    this.feedsList = feedsList
    this.settings = settings

    this.weekdays = convertWeekdays(settings.weekdays)
  }

  async init() {

    if (!this.feedsList) return

    const feedsData = []
    for (const feed of this.feedsList) {
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
      const startDate = new Date(this.#getLastSentDate())
      return pubDate.getTime() >= startDate.getTime()
    })

    // filter articles by category
    if (categories && categories.length > 0) {
      feed.items = feed.items.filter(item => {
        return item.categories?.some(category => categories.includes(category.toLowerCase()))
      })
    }

    return feed
  }

  #getLastSentDate() {
    const today = new Date()
    const todayWeekday = today.getDay() // 0-6

    // Ordenar os dias em ordem descendente
    const sortedWeekdays = [...this.settings.weekdays].sort((a, b) => b - a)

    // Encontrar o dia mais recente que é <= hoje
    let lastSentWeekday = null
    for (const weekday of sortedWeekdays) {
      if (weekday <= todayWeekday) {
        lastSentWeekday = weekday
        break
      }
    }

    // Se não encontrou, pega o último do array (que será o maior) e volta uma semana
    if (lastSentWeekday === null) {
      lastSentWeekday = sortedWeekdays[0]
    }

    const daysDiff = todayWeekday - lastSentWeekday
    const lastSentDate = new Date(today)
    lastSentDate.setDate(today.getDate() - daysDiff)

    return lastSentDate
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
      from: `"RSS2Email" <${process.env.SMTP_USER}>`,
      to: this.settings.emailTo,
      subject,
      text,
    })

    console.log(`EMAIL SENT SUCCESSFULLY: ${subject}`)
  }
}