FROM nginx:1.29.4-alpine
COPY nginx.conf /etc/nginx/nginx.conf
COPY _site/ /usr/share/nginx/html/
