import dotenv from 'dotenv'
import Parser from 'rss-parser'
import { createTransport } from 'nodemailer'
import { schedule } from 'node-cron'
import { readFile } from 'fs/promises'

dotenv.config()

class RSS2Email {

  rssFeeds = []
  transporter = null

  async main() {
    this.rssFeeds = JSON.parse(await readFile(new URL('./feeds.json', import.meta.url), 'utf8'))

    const smtpPort = Number(process.env.SMTP_PORT || 587)
    this.transporter = createTransport({
      host: process.env.SMTP_HOST,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
    })

    this.#checkFeeds()
  }

  async #checkFeeds() {

    const parser = new Parser()

    let articlesHTML = '' 

    for (const feed of this.rssFeeds) {
      const feedData = await parser.parseURL(feed.url)

      articlesHTML += `<h2 style="font-size: 30px; margin-bottom: 30px;">${feedData.title}</h2>`

      const thisWeekFeed = feedData.items.filter(item => {
        const pubDate = new Date(item.pubDate)
        const now = new Date()
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        return pubDate.getTime() >= oneWeekAgo.getTime()
      })

      if (thisWeekFeed.length > 0) {
        articlesHTML += `
          ${thisWeekFeed.map(item => `
            <article style="margin-bottom: 40px;">
              <time>${new Date(item.pubDate).toLocaleDateString()}</time>
              <a href="${item.link}" style="color: #007bff; text-decoration: underline;">
                <h3 style="margin: 0; font-size: 24px;">${item.title}</h3>
              </a>
              ${item.contentSnippet ? `<p>${item.contentSnippet}</p>` : ''}
            </article>
          `).join('')}
        `
      } else {
        articlesHTML += `<p>Não há artigos novos nesta semana.</p>`
      }
    }

    const startDate = new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000)
    const endDate = new Date()

    const content = `
      <div style="font-family: sans-serif; font-size: 16px; color: #333; width: 100%; max-width: 600px; margin: 0 auto; padding: 20px;">
        Aqui estão os artigos da última semana das fontes RSS:
        <section>
          ${articlesHTML}
        </section>
      </div>
    `.replaceAll('\n', '')

    await this.#sendEmail(
      `Artigos de ${startDate.getDate()} ${startDate.toLocaleString('default', { month: 'long' })} a ${endDate.getDate()} ${endDate.toLocaleString('default', { month: 'long' })}`,
      content
    )
  }

  async #sendEmail(subject, text) {
    await this.transporter.sendMail({
      from: `"RSS2Email" <${process.env.EMAIL_FROM}>`,
      to: process.env.EMAIL_TO,
      subject,
      text,
    })

    console.log(`Email sent: ${subject}`)
  }
}

const rss2Email = new RSS2Email()

// Execute once a day
schedule('0 0 * * *', () => rss2Email.main())

// Test execution
// rss2Email.main()