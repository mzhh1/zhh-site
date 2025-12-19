# 配置网页服务

## 1.需要拥有一个项目。想一个前缀名xx，(端口号yy)。

## 2.在腾讯云添加xx.mzhh.xyz的域名解析(A记录)。

## 3.添加nginx配置

sudo nano /etc/nginx/sites-available/xx.mzhh.xyz

### 反向代理

添加

```
server {
    listen 80;
    # 如果有域名，请将 localhost 替换为你的域名，例如: server_name example.com;
    server_name xx.mzhh.xyz;

    location / {
        # 转发到 Next.js 应用
        proxy_pass http://localhost:50101;

        # 标准代理头设置
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # 传递真实 IP
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 可选：增加 gzip 压缩提高性能
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

### 静态文件托管

```
server {
    listen 80;
    server_name xx.mzhh.xyz; # 请修改为你的域名或 IP

    # 重要：指向 npm run build 后生成的 out 目录的绝对路径
    # 如果是 Docker 部署，这里通常是 /usr/share/nginx/html
    root /home/ubuntu/code/zz/out;
    
    index index.html;

    # 开启 Gzip 压缩，减少传输体积
    gzip on;
    gzip_min_length 1k;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/javascript application/json application/javascript application/x-javascript application/xml;
    gzip_vary on;

    location / {
        # Next.js 静态导出的核心路由配置
        # 1. $uri: 尝试直接匹配文件（如 /robots.txt, /favicon.ico）
        # 2. $uri.html: 尝试匹配同名 HTML 文件（关键：让 /callback 能访问到 callback.html）
        # 3. $uri/index.html: 尝试匹配目录下的 index.html
        # 4. =404: 找不到则返回 404
        try_files $uri $uri.html $uri/index.html =404;
    }

    # 静态资源长期缓存
    # Next.js 编译的 JS/CSS 文件名包含哈希，内容变文件名才会变，因此可以安全地设置 1 年缓存
    location /_next/static/ {
        alias /home/ubuntu/code/expression-surface/out/_next/static/;
        expires 365d;
        access_log off;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # 404 页面处理
    error_page 404 /404.html;
    location = /404.html {
        internal;
    }
}
```

## 4.生效nginx配置

sudo ln -s /etc/nginx/sites-available/xx.mzhh.xyz /etc/nginx/sites-enabled/

sudo nginx -t

sudo systemctl reload nginx

## 5.使用certbot注册https

