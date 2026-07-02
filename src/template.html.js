export default class TemplateHTML {

  constructor(feeds) {
    this.feeds = feeds
  }

  render() {
    const html = /*html*/`
      <html>
      <head>
        ${this.#renderCSS()}
      </head>

      ${this.#renderBody()}
    `
    return html.replaceAll('\n', '')
  }

  #renderBody() {
    return /*html*/`
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

  #getSummary(item) {
    let summary = ''
    if (item.summary) {
      summary = item.summary
    } else if (item.contentSnippet) {
      summary = `<p>${item.contentSnippet}</p>`
    }
    // if summary is longer than 300 characters, truncate it and add "[...]"
    if (summary.length > 300) {
      summary = summary.substring(0, 300) + '[...]'
    }
    return summary
  }

}