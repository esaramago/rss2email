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

    let postsHTML = '' 

    for (const feed of this.rssFeeds) {
      const feedData = await parser.parseURL(feed.url)
      const thisWeekFeed = feedData.items.filter(item => {
        const pubDate = new Date(item.pubDate)
        const now = new Date()
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        return pubDate.getTime() >= oneWeekAgo.getTime()
      })

      postsHTML += `<h2>${feed.name}</h2>`

      if (thisWeekFeed.length > 0) {
        postsHTML += `
          <ul>
            ${thisWeekFeed.map(item => `
              <li>
                <time>${new Date(item.pubDate).toLocaleDateString()}</time>
                <a href="${item.link}">${item.title}</a>
              </li>
            `).join('')}
          </ul>
        `
      } else {
        postsHTML += `<p>No new posts this week.</p>`
      }
    }

    const dates = `From ${new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString()} to ${new Date().toLocaleDateString()}`

    await this.#sendEmail(
      `RSS4Email - ${dates}`,
      `Here are the latest posts from your RSS feeds:\n\n${postsHTML}`
    )
  }

  async #sendEmail(subject, text) {
    await this.transporter.sendMail({
      from: `"RSS Bot" <${process.env.SMTP_USER}>`,
      to: process.env.EMAIL_TO,
      subject,
      text,
    })

    console.log(`Email sent: ${subject}`)
  }
}


// Executa de hora a hora (ou ajusta no Coolify)
//schedule('0 * * * *', () => rss2Email.main())

const rss2Email = new RSS2Email()
rss2Email.main()