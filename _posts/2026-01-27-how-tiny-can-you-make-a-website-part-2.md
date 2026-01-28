---
layout: post
title: "How much smaller can you make a website?"
tags: [raspberry pi, linux, busybox, tiny core linux, rust]
img: /img/5/1.jpg
---

Here is part two to ["How small can you make a website?"](/2025/10/08/how-tiny-can-you-make-a-website.html). That particular article ended on me simply using Busybox, and calling it a day. However, what I was naturally curious about is compiling the whole server as a single Rust binary, which is what I did next:

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
    <p>
      Pellentesque cursus mi vel nisl placerat commodo. Phasellus arcu orci, rhoncus lacinia auctor pharetra, porta in lorem. Vestibulum eget nisi et arcu ultricies laoreet. Suspendisse volutpat ac sem et ornare. Etiam ipsum velit, laoreet in sapien vel, rutrum gravida eros. Fusce vitae molestie nisi, feugiat consectetur nibh. Vivamus id sem libero. Donec rhoncus sem sit amet risus feugiat, sit amet dapibus mauris posuere.
    </p>
    <p>
      Etiam quis pulvinar elit. Nulla ante nisi, imperdiet eu porta quis, ultricies sit amet augue. Etiam fringilla augue a ex mollis, quis convallis nulla gravida. Maecenas nec justo gravida, gravida lorem nec, rhoncus sem. Pellentesque posuere diam nec blandit gravida. Nullam a erat et nunc tempor sagittis. Suspendisse porta aliquam ipsum, ac euismod est pellentesque sit amet. Nunc elementum commodo libero, vel eleifend nisi hendrerit nec. Donec vel lacus sem. In eleifend velit auctor maximus ullamcorper. Donec ut lorem in tellus egestas luctus.
    </p>
    <p>
      Sed egestas sapien porttitor, consequat arcu quis, placerat odio. Integer molestie, eros et facilisis pulvinar, lacus lorem mattis felis, eget elementum mauris lacus non nisi. Vivamus ut ultricies nulla, id porttitor risus. Donec vel est nunc. Donec gravida sapien ut maximus imperdiet. Proin sed magna vitae metus blandit accumsan. Nulla sed tincidunt mi. Phasellus sed magna sit amet dolor mollis gravida. Mauris vitae feugiat massa, ut vulputate odio. Nulla facilisi. Donec ullamcorper ante rhoncus, elementum nulla ut, efficitur augue. In dapibus ut lacus in posuere. Maecenas consectetur luctus felis id imperdiet.
    </p>
    <p>
      Nam sagittis dolor volutpat ullamcorper aliquam. Sed pulvinar luctus velit non dignissim. Nunc eu eros vestibulum, mattis turpis sed, aliquam nibh. Interdum et malesuada fames ac ante ipsum primis in faucibus. Suspendisse dictum, nunc in auctor feugiat, lorem risus ullamcorper leo, faucibus tristique turpis quam et nisl. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Sed eleifend tincidunt arcu in lacinia. Sed vel consequat nisi. Nulla facilisi. Proin pulvinar ipsum in convallis rhoncus. Proin tempus elit nec blandit facilisis. Phasellus in varius magna, vitae viverra sem. Praesent hendrerit imperdiet commodo.
    </p>
    <p>
      Mauris vel justo ac justo aliquam volutpat quis a est. Quisque eget varius neque. Sed sed eros eget odio vestibulum maximus nec vitae purus. Vivamus rutrum, justo eu vulputate ornare, neque est tempus quam, vel dignissim quam velit sed dolor. Aenean eget nunc mi. Duis tempor pretium mi vitae suscipit. Aliquam facilisis gravida ante in euismod. Morbi ultrices orci quis blandit accumsan. Vestibulum massa risus, lobortis ac dui ac, rhoncus sollicitudin nulla. Donec et nisl nisl. Praesent feugiat lorem eu porttitor faucibus. Suspendisse erat nulla, congue id justo vel, commodo pretium metus. In molestie consectetur eros, ut pellentesque enim. Nunc hendrerit velit a dui iaculis, a sollicitudin nisl viverra. Morbi tempus neque in lacus tristique, et pretium lectus placerat.
    </p>
    <p>
      Duis est mi, fringilla non aliquet id, facilisis non lorem. Integer ut porttitor arcu, a eleifend orci. Donec eu lorem elementum, gravida metus non, efficitur tellus. Vestibulum euismod consequat nisi, id dictum dui gravida in. Phasellus eget nisl quis massa aliquet venenatis. Sed cursus at erat eu suscipit. Nunc et elementum augue. Donec vulputate libero at sem blandit ultricies. Phasellus mollis risus purus, vel iaculis risus semper eu. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec arcu dui, gravida ac odio ut, pharetra rhoncus dolor. Vestibulum lectus ligula, blandit sed aliquet et, iaculis a libero. Sed laoreet leo a urna bibendum venenatis ullamcorper ac lectus.
    </p>
    <p>
      Sed mollis ipsum a arcu viverra pretium. Proin hendrerit congue risus non rutrum. Sed pulvinar at tortor sed imperdiet. Donec tempus a nisi et fermentum. Praesent hendrerit posuere scelerisque. Duis eu nisi non eros tincidunt molestie. Maecenas euismod pretium dapibus.
    </p>
    <p>
      Praesent non augue ut tellus lobortis tristique. Praesent nec diam lacinia arcu semper auctor sed ut massa. Nullam semper turpis quis dolor scelerisque ultricies sit amet nec augue. Sed feugiat magna egestas vehicula finibus. Quisque eget dapibus ipsum. Proin porta accumsan magna vitae sodales. Aenean vulputate tristique purus eu viverra. Praesent convallis turpis non purus sodales vehicula. Integer faucibus vulputate felis, at dignissim libero sagittis quis. Nam nibh nulla, scelerisque id lacus et, faucibus suscipit diam. Vivamus lorem ipsum, ornare mattis feugiat nec, suscipit vel magna. Aenean lobortis condimentum molestie.
    </p>
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

Compiled with:

```
rustup target add armv7-unknown-linux-gnueabihf

# make changes to .cargo/config.toml
[target.armv7-unknown-linux-gnueabihf]
linker = "arm-linux-gnueabihf-gcc"

cargo build --release --target armv7-unknown-linux-gnueabihf
```

This results in a ±1.5MB binary. When copying it over to my old dusty Raspberry Pi B+, and sieging the server for a minute with 1000 concurrent connections, this is what ended up being the result:

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

When comparing that with the previous Busybox result:

|                     | Armv7 Rust binary | Busybox   |
| ------------------- | ----------------- | --------- |
| Transactions        | 90968             | 46972     |
| Availability        | 100.00%           | 99.99%    |
| Data transferred    | 540.22MB          | 282.39 MB |
| Response time       | 0.66 secs         | 0.94 secs |
| Failed transactions | 0                 | 7         |
| Longest transaction | 5.91              | 57.70     |

The dedicated binary naturally blows Busybox out of the water.
