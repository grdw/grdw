---
layout: post
title: "How much smaller can you make a website?"
tags: [raspberry pi, linux, busybox, tiny core linux, rust]
img: /img/5/1.jpg
---

Here is part two to ["How small can you make a website?"](/2025/10/08/how-tiny-can-you-make-a-website.html). That adventure ended on me simply using Busybox, and calling it a day. However, what I was naturally curious about is compiling the whole server as a single Rust binary, which is what I did next:

```rust
use std::convert::Infallible;
use std::net::SocketAddr;

use http_body_util::Full;
use hyper::body::Bytes;
use hyper::server::conn::http1;
use hyper::service::service_fn;
use hyper::{Request, Response};
use hyper_util::rt::TokioIo;
use tokio::net::TcpListener;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let addr = SocketAddr::from(([0, 0, 0, 0], 3000));
    let listener = TcpListener::bind(addr).await?;

    loop {
        let (stream, _) = listener.accept().await?;

        let io = TokioIo::new(stream);

        tokio::task::spawn(async move {
            if let Err(err) = http1::Builder::new()
                .serve_connection(io, service_fn(hello))
                .await
            {
                eprintln!("Error serving connection: {:?}", err);
            }
        });
    }
}

async fn hello(_: Request<hyper::body::Incoming>) -> Result<Response<Full<Bytes>>, Infallible> {
    Ok(
        Response::new(
            Full::new(
                Bytes::from(
"<!DOCTYPE html>
<html>
  <head>
    <title>This is a small website</title>
  </head>
  <body>
    <p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec porttitor enim nisl, tincidunt mattis turpis consectetur eu. Nam non imperdiet nulla. Praesent ullamcorper elit a tristique facilisis. Suspendisse potenti. Aenean dapibus erat ac posuere eleifend. Nunc consectetur elementum metus, sit amet posuere augue dictum eget. Praesent ac ornare urna, vel interdum enim. Nunc aliquet dapibus sapien vel suscipit. Nulla vel elit placerat, sollicitudin enim at, iaculis risus. Cras pretium hendrerit leo, eget sodales ligula dapibus nec. In ac nisl non ligula consectetur accumsan in eu est. Sed porta laoreet porta. Aliquam euismod nisi imperdiet, ullamcorper quam non, posuere massa. Proin rutrum est vel consequat volutpat.
    </p>
    <!--.... 8 more paragraphs of lorum ipsum -->
    <p>
      Duis sed bibendum lectus. Duis purus nibh, ultrices at velit vel, eleifend pharetra eros. Donec euismod scelerisque finibus. Morbi sodales at mi at iaculis. Praesent ornare consequat ante a sagittis. Maecenas ut vehicula metus. Sed tincidunt lacus eget odio ullamcorper, eu tempor ligula fringilla. Morbi quis eros et nunc dictum mattis eu sed purus. Sed venenatis, velit at iaculis congue, est purus blandit nulla, quis mattis nunc leo vitae ex.
    </p>
  </body>
</html>"
                )
            )
        )
    )
}
```

Because this still runs on the same Raspberry Pi B+ I had to compile it with an `arm7` linker. So in order to achieve that a couple of changes were required. First up, in this little Rust project, I had to add another compile target:

```bash
rustup target add armv7-unknown-linux-gnueabihf
```

Next I had to make some changes to `.cargo/config.toml`:

```toml
[target.armv7-unknown-linux-gnueabihf]
linker = "arm-linux-gnueabihf-gcc"
```

Finally, I could compile a release build:

```bash
cargo build --release --target armv7-unknown-linux-gnueabihf
```

This results in quite a small ±1.5MB binary. When copying it over to my old dusty Raspberry Pi B+, and sieging the server for a minute with 1000 concurrent connections like I did in my previous article, this is what ended up being the result:

```
Lifting the server siege...
Transactions:                  90968 hits
Availability:                 100.00 %
Elapsed time:                  60.50 secs
Data transferred:             540.22 MB
Response time:                  0.66 secs
Transaction rate:            1503.60 trans/sec
Throughput:                     8.93 MB/sec
Concurrency:                  989.45
Successful transactions:       90968
Failed transactions:               0
Longest transaction:            5.91
Shortest transaction:           0.01
```

|                     | Armv7 Rust binary | Busybox   |
| ------------------- | ----------------- | --------- |
| Transactions        | 90968             | 46972     |
| Availability        | 100.00%           | 99.99%    |
| Data transferred    | 540.22MB          | 282.39 MB |
| Response time       | 0.66 secs         | 0.94 secs |
| Failed transactions | 0                 | 7         |
| Longest transaction | 5.91              | 57.70     |

When comparing that with the previous Busybox result, the dedicated binary naturally blows Busybox out of the water. However, what I wasn't expecting was to what extent. It is able to process double the amount of transactions while barely breaking a sweat. Obviously the code example is absolutely ridiculous especially knowing that somebody else already build exactly what I want out of the box, and it's called '[static web server](https://static-web-server.net/getting-started/)' (nice to just say what's on the tin). After downloading the binary for `armv7-unknown-linux-gnueabihf` and copy/pasting my entire blog over, it's time for another siege:

|                     | static web server + blog | Armv7 Rust binary | Busybox   |
| ------------------- | ------------------------ | ----------------- | --------- |
| Transactions        | 23956                    | 90968             | 46972     |
| Availability        | 100.00%                  | 100.00%           | 99.99%    |
| Data transferred    | 607.47MB                 | 540.22MB          | 282.39 MB |
| Response time       | 2.26 secs                | 0.66 secs         | 0.94 secs |
| Failed transactions | 0                        | 0                 | 7         |
| Longest transaction | 26.28                    | 5.91              | 57.70     |

About that: the average response time of 2.26 secs is a bit rough for 1000 req/s and the biggest offender here is the main png image I have on the frontpage which is 80KB. With a tool called `pngquant` I can squeeze that png down to something smaller, and shrink it right down to 35KB. After doing so, we end up with these results:

|                     | static web server | static web server (smaller png) |
| ------------------- | ----------------- | ------------------------------- |
| Transactions        | 23956             | 43838                           |
| Availability        | 100.00%           | 100.00%                         |
| Data transferred    | 607.47MB          | 517.43MB                        |
| Response time       | 2.26 secs         | 1.32 secs                       |
| Failed transactions | 0                 | 0                               |
| Longest transaction | 26.28             | 13.18                           |

It's fascinating that just shrinking one png down already has such a massive effect on the siege output. We almost doubled our overall transaction count while halfing our response time. It almost makes me think to start drawing out a funny little SVG and just throwing that into the HTML so siege does not have to download a single image; I will make a mental note of this. Obviously browsers will just cache the image, but I want to see higher numbers!

In another article I'm going to add some more features (and I will probably end up ditching tinycorelinux for alpine), because namely I want:

- An easy firewall setup through `ufw`
- An easy way of adding an SSL certificate by leveraging let's encrypt
- Logging + monitoring capabilities in a terminal
- tmux

... all so I can finally ditch GitHub pages and claim that I have the smallest, tiniest website running on some old dusty Raspberry Pi hardware.
