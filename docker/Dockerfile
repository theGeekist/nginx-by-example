FROM georgjung/nginx-brotli:mainline

RUN mkdir -p /etc/nginx/conf.d \
    && mkdir -p /etc/nginx/sites-available \
    && mkdir -p /etc/nginx/sites-enabled \
    && mkdir -p /etc/nginx/snippets \
    && mkdir -p /etc/nginx/ssl \
    && mkdir -p /etc/nginx/oscp \
    && mkdir -p /etc/nginx/srv

COPY ./nginx.conf /etc/nginx/nginx.conf
