<div align="center">
<samp>

# News Crawler

</samp>
</div>

## Overview

Web API for crawling articles from news sites.

## Tech Stack

- Node.js
- Hono.js
- Puppeteer

## Requirements

- Node.js v20.10.0 or later
- pnpm v8.15.1 or later

## Setup

1. Clone the repository
1. Install dependencies

   ```bash
   pnpm install
   ```

1. Run

   ```bash
   pnpm dev
   ```

## Supported Sites

- [NHK ニュース](https://www3.nhk.or.jp/news/)
- [Yahoo!ニュース](https://news.yahoo.co.jp/)

## API

### NHK

#### GET /category

Get categories.

##### Endpoint

```http
GET /api/nhk/category
```

#### GET /articles

Get a list of articles in a category.

##### Endpoint

```http
GET /api/nhk/articles?category_url=${category_url}
```

#### GET /article

Get article contents.

##### Endpoint

```http
GET /api/nhk/article?article_url=${article_url}
```

### Yahoo

#### GET /category

Get categories.

##### Endpoint

```http
GET /api/yahoo/category
```

#### GET /articles

Get a list of articles in a category.

##### Endpoint

```http
GET /api/yahoo/articles?category_url=${category_url}
```

#### GET /article

Get article contents.

##### Endpoint

```http
GET /api/yahoo/article?article_url=${article_url}
```

## License

MIT
