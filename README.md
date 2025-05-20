<p align="center">
  <img src="https://geekist.co/wp-content/uploads/PaperBack.png" alt="NGINX by Example Vol 1 Cover" width="200" />
</p>

<h1 align="center">NGINX by Example Vol 1 - Verified Configs & Tests</h1>

<p align="center">
  <a href="https://geekmaster3.gumroad.com/l/nginx-by-example">
    📘 <strong>Buy the Book</strong>
  </a>
</p>

<p align="center">
  Real-world patterns. Fully tested. Mapped one-to-one with the <a href="https://geekist.co/nginx-by-example">NGINX by Example</a> book.<br/>
  This repo contains the live configurations and automated test suite that backs every chapter.
</p>

## Quick Start

> **Requirements**
> [Bun](https://bun.sh/) installed globally
> Docker + Docker Compose
>   

### 1. Start the Docker environment

```bash
docker compose up -d --build
````

This starts:

* A custom NGINX container with SSL and test configs
* WordPress and MySQL (for `3.3_wp_fastcgi_cache`)

### 2. Run the tests

```bash
bun test
```

All tests are written in Bun’s native test runner and validate full NGINX behaviour via actual HTTP requests.

## Project Structure

```
.
├── docker/                 # NGINX container structure
│   ├── conf.d/             # Unused (default vhost configs)
│   ├── sites-enabled/      # Active site configs (symlinked per test)
│   ├── srv/                # Shared static assets (HTML, images, etc.)
│   ├── ocsp/ ssl/ cache/   # TLS and OCSP material
│   └── nginx.conf          # Custom NGINX entrypoint
├── docker-compose.yml      # Defines nginx, WordPress & MySQL
├── sections/               # Each section in the book is mapped here
│   ├── 1.1_ocsp_stapling/
│   ├── 2.5_smart_api_gateways/
│   └── 3.4_invisible_cdn/  # ...and so on
├── utils/                  # Test helper utilities (reload nginx, etc.)
├── bun.lockb / package.json / tsconfig.json
└── README.md               # This file
```

## Testing Philosophy

Each section follows the same pattern:

* `default.conf`: Minimal NGINX config for the use case
* `index.test.ts`: Test cases that simulate HTTP traffic and assert real behaviour
* Assets (e.g. `/images/logo.png`, `compressed.html`) are shared via `/srv`

The goal is to ensure every config in the book runs and behaves exactly as described, reproducibly and without handwaving.

## Need to Test a Single Section?

```bash
bun test sections/2.4_blue_green_deployments/index.test.ts
```

## Notes

* Brotli support is baked in using [`georgjung/nginx-brotli`](https://hub.docker.com/r/georgjung/nginx-brotli)
* OCSP stapling and TLS tests use local self-signed certs under `/docker/ssl/`
* WordPress tests use FastCGI cache and run against a real PHP-FPM container


## Book Reference

This test harness is the official companion to
**NGINX by Example Vol 1**

Each section here maps to a chapter in the book tested and reproducible.

Proudly brought to you by [@theGeekist](https://github.com/theGeekist)

Made with ☕, `Bun`, and the occasional `facepalm`.

> All TLS certificates and private keys in this repository are self-signed,
non-production and used exclusively for local and CI testing.
