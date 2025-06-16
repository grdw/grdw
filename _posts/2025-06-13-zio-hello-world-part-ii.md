---
layout: post
title: "Zio: \"Hello, World\" Part II"
---

## Introduction
In my previous article [1] I wrote about how to setup Scala and how to write "Hello, World" in Zio. It turns out that there are tons of ways in Zio, that you can write "Hello, World". "Hello, World" is unironically helping me understand basic Zio concepts.

To reiterate the "Hello, World" example from the previous article ended up looking like this:

```scala
import zio.{ ZIO, ZIOAppDefault }
import java.io.IOException

object HelloWorld extends ZIOAppDefault {
  def run: ZIO[Any, IOException, Unit] =
    ZIO.succeed(println("Hello, World"))
}
```

I stopped using the `printLine` from Zio itself because it feels rather strange to use it when Scala has this exact concept already.

Also in that same article I was trying to solve the first Advent of Code 2019 puzzle, and got a rather strange error about layers which I got rather confused about, and ignored. Now the Zionomicon [2] in chapter 17.5 explains what "Layers" are, but does so in a very hands-on practical way, and explains it rather poorly. Not once does it make a simple layer, and it also barely explains in how many different ways you can make a layer. You can actually make "Hello, World" in layers, like this:

```scala
import zio.{ ZIO, ZIOAppDefault, ZLayer }
import java.io.IOException

object HelloLayerWorld extends ZIOAppDefault {
  def program: ZIO[PrintApp, IOException, Unit] =
    ZIO.serviceWithZIO[PrintApp](program => program.run)

  def run: ZIO[Any, IOException, Unit] =
    program.provide(
      HelloLayer.layer,
      WorldLayer.layer,
      PrintLayer.layer,
    )
}
...
```

Now I'm deliberately not explaining anything about what the layers look like yet.

### Sources
1. [Scala and Zio: Humble Beginnings](https://grdw.nl/2025/05/24/scala-and-zio-humble-beginnings.html)
2. [Zionomicon](https://www.zionomicon.com/)
