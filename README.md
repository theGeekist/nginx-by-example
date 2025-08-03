<p align="center">
  <img src="https://img.geekist.co/wp-content/uploads/1746074660-800x613.png" alt="NGINX by Example Vol 1 Cover" width="200" />
</p>

<h1 align="center">NGINX by Example Vol 1 - Verified Configs & Tests</h1>

<p align="center">
  <a href="https://geekmaster3.gumroad.com/l/nginx-by-example?utm_source=geekist&utm_medium=link&utm_campaign=nginx_gumroad" target="_blank" rel="noopener noreferrer">
    <img src="https://img.shields.io/badge/Support%20on%20Gumroad-36a9ae?style=for-the-badge&logo=gumroad&logoColor=white" alt="Buy on Gumroad" />
  </a>
  <a href="https://www.amazon.com/dp/B0F844D63G?utm_source=geekist&utm_medium=link&utm_campaign=nginx_kindle" target="_blank" rel="noopener noreferrer">
    <img src="https://img.shields.io/badge/Buy%20on%20Amazon-ff9900?style=for-the-badge&logo=amazon&logoColor=white" alt="Buy on Amazon" />
  </a>
  <a href="https://leanpub.com/nginxbyexample?utm_source=geekist&utm_medium=link&utm_campaign=nginx_leanpub" target="_blank" rel="noopener noreferrer">
    <img src="https://img.shields.io/badge/Back%20it%20on%20LeanPub-ffd966?style=for-the-badge&logo=leanpub&logoColor=black" alt="Buy on Leanpub" />
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
<br>
<br>
<p align="center">
  <sub>
    Proudly brought to you by 
    <a href="https://github.com/theGeekist" target="_blank">@theGeekist</a> and <a href="https://github.com/jasonnathan" target="_blank">@jasonnathan</a>
  </sub>
</p>
