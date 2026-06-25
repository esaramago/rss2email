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
        <p style="margin-bottom: 40px;">Aqui estão os artigos da última semana das fontes RSS:</p>
        <section>
          ${this.feeds.map(feed => {

            const color = feed.color || '#333'
            return `
              <h2 style="font-size: 30px; margin-bottom: 30px;">${feed.title}</h2>
              ${
                feed.items.length ? feed.items.map(item => `
                  <article style="margin-bottom: 40px;">
                    <time>${new Date(item.pubDate).toLocaleDateString()}</time>
                    ${item.categories ? `<p style="text-transform: uppercase;">${items.categories?.join(', ')}</p>` : ''}
                    <a href="${item.link}" style="color: ${color};">
                      <h3 style="font-size: 24px; line-height: 1.4; margin-bottom: 10px;">${item.title}</h3>
                    </a>
                    ${this.#getSummary(item)}
                  </article>
                `) : `
                  <p>Não há artigos novos nesta semana.</p>
                `
              }
            ` 
          })}
        </section>
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
          color: #333;
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        h1,
        h2,
        h3,
        p {
          margin: 0;
        }

        footer {
          margin-top: 60px;
          text-align: center;
          font-size: 14px;
          color: #555;
        }

        @media (prefers-color-scheme: dark) {
          body {
            backgroud-color: #212426;
            color: #FFF;
          }
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