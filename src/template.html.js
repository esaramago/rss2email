export default class TemplateHTML {

  constructor(feeds) {
    this.feeds = feeds
  }

  render() {
    const html = `
      <html>
      <head>
        ${this.#renderCSS()}
      </head>

      ${this.#renderBody()}
    `
    return html.replaceAll('\n', '')
  }

  #renderBody() {
    return `
      <body>
        <header>
          <h1 style="margin-bottom: 5px;">RSS2Email</h1>
          <p style="margin-bottom: 60px;">Aqui estão os artigos da última semana das fontes RSS:</p>
        </header>
        <main>
          ${this.feeds.map(feed => {
            const color = feed.color || '#333'
            return ( feed.items.length ? `
              <section style="margin-bottom: 60px;">
                <h2 style="font-size: 16px; color: ${color}; margin-bottom: 15px;">${feed.title}</h2>
                ${feed.items.length ? feed.items.map(item => `
                    <article style="margin-bottom: 30px;">
                      <time>${new Date(item.pubDate).toLocaleDateString()}</time>
                      ${item.categories && item.categories.length ? `<p style="text-transform: uppercase;">${item.categories?.join(', ')}</p>` : ''}
                      <a href="${item.link}" style="color: ${color};">
                        <h3 style="font-size: 24px; line-height: 1.4; margin-bottom: 10px;">${item.title}</h3>
                      </a>
                      ${this.#getSummary(item)}
                    </article>
                  `).join('') : ''
                }
              </section>` : ''
            )
          }).join('')}
        </main>
        <footer>
          <p>&copy; 2026 Feed2Email. Todos os direitos reservados.</p>
          <p>Made with ❤️ by <a href="https://github.com/esaramago" target="_blank">Emanuel Saramago</a></p>
        </footer>
      </body>
    `
  }
  #renderCSS() {
    return /*css*/`
      <style>
        body {
          font-family: sans-serif;
          font-size: 16px;
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
          color: #333;
        }
        h1,
        h2,
        h3,
        p {
          margin: 0;
        }

        footer {
          margin-top: 80px;
          text-align: center;
          font-size: 14px;
          color: #666;
        }

      </style>
    `
  }

  #getSummary(item) {
    if (item.summary) {
      return item.summary
    } else if (item.contentSnippet) {
      return `<p>${item.contentSnippet}</p>`
    } else {
      return ''
    }
  }

}