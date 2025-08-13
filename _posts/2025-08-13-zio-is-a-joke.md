---
layout: post
title: "Zio is a joke"
---

## Introduction

_This is a follow up from ["Scala and Zio humble beginnings"](/2025/05/24/scala-and-zio-humble-beginnings.html)._

I'm now 5 months into my Zio journey and I'm slowly but surely beginning to think that Zio is actually a joke; an elaborate prank made by some sketchy YouTubers. I'll make my case with an example of actual work that had to be done with some of the core details left out.

## How to simply raise a 403

Assume you have a backend service with 2 endpoints. One is allowed for users with a specific role, and the other endpoint is allowed for users with any role. In case the specific role is not provided for the one endpoint that requires it, raise a 403 Forbidden. The role is somewhere stuffed in the JWT claims, but for now I'm assuming the role is directly posted on the `Bearer` header to spare myself the JWT decoding. Assume this is the code:

```scala
import zio.{ ZIO, ZIOAppDefault, ZLayer }
import zio.http.{
  Handler,
  HandlerAspect,
  Method,
  Request,
  Response,
  RoutePattern,
  Routes,
  Server,
  handler,
  string
}
import zio.http.endpoint.Endpoint
import zio.schema.DeriveSchema
import java.io.IOException

object CarShop extends ZIOAppDefault {
  // Objects
  case class Car(brand: String)
  object Car {
    implicit val schema = DeriveSchema.gen[Car]
  }

  // Endpoints
  val listCarsEndpoint = Endpoint(RoutePattern.GET / "cars")
    .out[List[Car]]

  def listCarsHandler: Handler[Any, Nothing, Unit, List[Car]] =
    Handler.fromFunctionZIO { _: Unit =>
      ZIO.succeed(
        List(
          Car("Toyota"),
          Car("Honda")
        )
      )
  }

  val getCarEndpoint = Endpoint(RoutePattern.GET / "car" / string("brand"))
    .out[Car]

  def getCarHandler: Handler[Any, Nothing, String, Car] =
    Handler.fromFunctionZIO { brand: String =>
      ZIO.succeed(
        Car(brand)
      )
  }

  // Middleware, heavily simplified
  object BearerAuthMiddleware {
    def handler: HandlerAspect[Any, Unit] =
      HandlerAspect.interceptIncomingHandler {
        Handler.fromFunctionZIO[Request] { req =>
          req.headers.get("Authorization") match {
            case Some(auth) if auth.startsWith("Bearer ") =>
              ZIO.succeed((req, ()))
            case _ =>
              ZIO.fail(Response.unauthorized)
          }
        }
      }
  }

  val routes =
    Routes(
      listCarsEndpoint.implementHandler(listCarsHandler),
      getCarEndpoint.implementHandler(getCarHandler)
    ) @@ BearerAuthMiddleware.handler

  def run = Server.serve(routes).provide(Server.default)
}
```

Now you'd think this would be relatively straight-forward to implement, but let me assure you that it isn't, because Zio is a joke. To make it even simpler for myself in this article, I'll already be happy if I can expose the token (or whatever junk I post after the word `Bearer `) in the handler.

## CtxOut: the wrong way, or?
My initial, rather naive thought, was to tackle this from the `BearerAuthMiddleware`. Currently the middleware only checks for the actual header that's being passed, but it doesn't do anything else. So, I was hoping that it could expose the bearer token through the second argument in `ZIO.succeed((req, ()))` that's intentionally marked as `()`, which is Scala-speak for an empty return type which is actually the `CtxOut`. Lucky for me the `BearerAuthMiddleware` is a `HandlerAspect` and it has such a `CtxOut` which gets passed down to all the handlers that use it, what more do I want? It even tells me so in the nice little drawing on their website: [1].

Now, obviously when you add the bearer token to the `CtxOut` of all handlers, how do you get it out from the actual `listCarsHandler` and `getCarHandler` themselves?

Well, that isn't so easy. Initially, through a lot of searching online, I landed on this StackOverflow page [2]. What striked me was that this was one of the first times that somebody had a similar Zio question that was available on StackOverflow. However, what the StackOverflow answer is literally telling me, is that I shouldn't use `@@`, and that I should use an entirely new syntax of which I can't find anything in the Zio documentation. Also, knowing that this service of mine will get 4 or 5 more endpoints, I'm not about to make my implementation a whole lot worse by rewriting all my handlers and routes.

## Actually passing the token to the handler

Considering the `CtxOut` idea a dead-end, I marched onward to the next bad idea. Actually passing the token in the `Endpoint`. You see, in the code I conjured up, we're using something called "declarative endpoints" [3] which is a horrible idea in its own right, but considering people really love generating poor OpenAPI specs where I commit my labour, I guess I have to use it.

My thought was easy: add a `header(HeaderCodec.authorization)` to each endpoint declaration and puzzle my way from there. It would also make for a 'more correct' OpenAPI spec, or so I thought. Upon doing this, we immediately get an error in our code:

```
[error] /home/cake/Projects/scala-learning/zio/zio-http-auth/Main.scala:67:39: type mismatch;
[error]  found   : zio.http.Handler[Any,Nothing,String,CarShop.Car]
[error]  required: zio.http.Handler[?,zio.ZNothing,(String, zio.http.Header.Authorization),CarShop.Car]
[error]       getCarEndpoint.implementHandler(getCarHandler)
[error]                                       ^
[error] one error found
[error] (Compile / compileIncremental) Compilation failed
```

Now, this is rather easy to fix, just match the type! So, this is easier said than done, and after quite some bikeshedding I ended up with this:

```scala
// imports
import zio.http.Header.Authorization

object CarShop extends ZIOAppDefault {
  // ...

  val getCarEndpoint = Endpoint(RoutePattern.GET / "car" / string("brand"))
    .header(HeaderCodec.authorization)
    .out[Car]
    .outError[String](Status.InternalServerError)

  def getCarHandler: Handler[Any, String, (String, Authorization), Car] = Handler.fromFunctionZIO {
    case (brand: String, token: Authorization) =>
      ZIO.succeed(
        Car(s"$brand")
      )
    case _ =>
      ZIO.fail("boom!")
  }

  // ...
}
```

All of this, to just expose the bearer token in the handler.

## CtxOut: The right way

After a lot of eye-twitching it turns out that if you scroll far enough down in the swamp that is called the Zio documentation [4] the actual answer was there all along. You can get the bearer token by using `ZIO.serviceWith[<ClassOfThing>]`. According to the docs it would work something like this:

```scala
//... imports

object CarShop extends ZIOAppDefault {
  // Objects
  // ...

  // Endpoints
  // ...
  val getCarEndpoint = Endpoint(RoutePattern.GET / "car" / string("brand"))
    .out[Car]

  def getCarHandler: Handler[String, Nothing, String, Car] =
    Handler.fromFunctionZIO { brand: String =>
      ZIO.serviceWith[String] { n =>
        Car(s"$brand ($n)")
      }
  }

  // Middleware
  object BearerAuthMiddleware {
    def handler: HandlerAspect[Any, String] =
      HandlerAspect.interceptIncomingHandler {
        Handler.fromFunctionZIO[Request] { req =>
          req.headers.get("Authorization") match {
            case Some(auth) if auth.startsWith("Bearer ") =>
              ZIO.succeed((req, auth))
            case _ =>
              ZIO.fail(Response.unauthorized)
          }
        }
      }
  }

  // ... Routes
}
```

... and that is how you get the token into your handler, and how you waste literal hours. And who doesn't like that type signature of `[String, Nothing, String, Car]`, and how in a few months time I'll look back at this code, and have no idea which String matches with what?

## Confusion, confusion, oh confusion

This article is merely one example of how utterly sloppy the Zio community is with their documentation. Abstraction on abstraction on abstraction on magical trait on magical function on magical object on magical one lettered variable name. But curse you I shall if you don't abstract properly, and vague error messages I shall raise to thee! Witchcraft and wizardry are a thing of the past and always highly costly. In development time, and further more in resource consumption. Please stop doing it, and let this be a warning to the reader: stop building things in Zio, and pick instead something bland and boring with actual proper documentation. Unfortunately for me I'll continue with the pain and torture, and hopefully it well get me some more nice articles.

## Sources

1. [zio drawing of HandlerAspect](https://zio.dev/zio-http/reference/aop/handler_aspect/)
1. [Stackoverflow](https://stackoverflow.com/questions/77504825/how-to-get-a-value-of-handleraspects-ctxout-type-in-request-processing)
1. [zio - declarative endpoints](https://zio.dev/zio-http/reference/endpoint)
1. [prying out CtxOut](https://zio.dev/zio-http/reference/aop/handler_aspect/#leveraging-output-context)
