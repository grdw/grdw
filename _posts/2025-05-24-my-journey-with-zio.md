---
layout: post
title: "My journey with Zio"
---

## Introduction

Zio is a framework for Scala, to be more precise - and I'm quoting from the front-page of the website - it's a "type-safe, composable asynchronous and concurrent" framework for Scala. So what can you do with it? Well, with Zio you can literally build anything you want. A web service, check! A little command line application, check! Kafka consumers, Kafka producers, SQS clients, gRPC servers; let all things be Zio! It's the Swiss-army knife of the Scala world.

This blog post is describing some of my experiences with learning Zio and Scala, and all the hurdles I met (and am still meeting), of which there are plenty. This article is roughly split into four sections: setup, a hello-world example, solving the Day 1 puzzle of the Advent Of Code 2019, and a conclusion block in the end.

## Setup

First up I needed Scala on my computer so I installed `sdkman` [1] to help with installing a specific Scala version. Considering most of the code I'm writing in this post uses Scala 2, I ran:

```bash
sdk install scala 2.13.16
```

.. and I'm off to the races.

### Setting up a Zio project

For setting up a Zio project I went to the place where you can learn about Zio: [zio.dev](https://zio.dev/). I'm met with one of those standard websites for any framework to any programming language, and I click on "Overview". It tells me in order to setup Zio I need to put the following in my `build.sbt`:

```scala
libraryDependencies += "dev.zio" %% "zio" % "2.1.18"
```

And if I want to use "streams", whatever those might be, it tells me to include another similar looking line\*, which I'm ignoring for now.

My initial gut reaction to this is: what in the bleep is a `build.sbt`? The author of this text assumes I'm using `sbt` for my project and not anything else like `gradle`. So, there are no alternatives in this case according to the author of setting up Zio if I have to purely read the documentation. It also doesn't give me a full example of what such a `build.sbt` must look like, so I make a directory called `hello-world` and a blank `build.sbt` and copy/paste that single line into it, just as it's described in the documentation.

Naturally I still have to install `sbt`, and I execute a bunch of steps [2]. Namely the following:

```bash
# To install the correct JDK:
sdk install java 17.0.15-tem

# To install sbt
sdk install sbt
```

It would be nice if the Zio docs linked to this bit of setup to make it a bit more clear for the newbies. Regardless, after all of that is done I can type:

```bash
sbt
# And you're greeted with:
sbt:hello-world>
```

For fun I type: `run` and see a `RuntimeException`. Essentially all I have is a `build.sbt` in a folder called `hello-world` with not a single line of Scala in it.

What it does generate after doing the above, are two folders `project` and `target` which contain a whole slew of files which I'm also ignoring right now for my own sanity.

## "Hello, World"

To make some Zio code and make a boring "Hello, World" in Zio I make a `Main.scala` in the base folder and fill it out with even less Zio code than the example on the "Overview" page. What I ended up with is this:

```bash
# output of tree -L 1 .
.
├── build.sbt
├── Main.scala
├── project
└── target
```

```scala
// Contents of Main.scala
import zio._
import zio.Console._

object HelloWorld extends ZIOAppDefault {
  def run = printLine("Hello, World")
}

// Contents of build.sbt
libraryDependencies += "dev.zio" %% "zio" % "2.1.18"
```

Opening up `sbt`, I can finally type `run` without any errors, and it correctly returns `Hello, World`.  Beautiful.

Immediately a couple of things already strike me. I'm extending from something called `ZIOAppDefault` and I've no idea what that is. This is where source inspection comes in handy and having your editor be a useful tool. I've setup my editor (`nvim`) with `metals` [3] so I can type `gD` to get the definition of what is under my cursor. I can also use a smaller pop-out window with `K`.

It turns out `ZIOAppDefault` extends from another trait called `ZIOApp` , which extends from many other things; turtles all the way down. This is absolutely not interesting for the sake of this article, but good to be aware of.

What _is_ interesting to mention is that `printLine()` is not the standard Scala `println()`, so to make the code break I swap them out:

```scala
// Contents of Main.scala
import zio._
import zio.Console._

object HelloWorld extends ZIOAppDefault {
  def run = println("Hello, World")
}
```

All of a sudden the return type to `run()` is incorrect, because `println` returns a void - or `Unit` as it is called in Scala - while `run()` expects a `ZIO[Any, Any, Any]`. Type inference is the devil, especially when learning a new language or framework; I want my code to be as explicit as possible. Also having learned Rust and Golang you _always_ explicitly state your return types, so for the sake of being a good boy scout I will also do that with any future Scala code I write. The type I get suggested from my editor is: `ZIO[Any, Any, Any]` so I will use that:

```scala
// Contents of Main.scala
import zio._
import zio.Console._

object HelloWorld extends ZIOAppDefault {
  def run: ZIO[Any, Any, Any] =
    printLine("Hello, World")
}
```

Now my obvious issue is that `Any` is too vague, so looking up the definition of `printLine()` it should actually be: `ZIO[Any, IOException, Unit]`. When using that as my type I get the following error: `Not found IOException`. After looking up under which namespace `IOException` lives, I can make the full example:

```scala
// Contents of Main.scala
import zio._
import zio.Console._
import java.io.IOException

object HelloWorld extends ZIOAppDefault {
  def run: ZIO[Any, IOException, Unit] =
    printLine("Hello, World")
}
```

... and that's how you do `Hello, World`?

Well, we can optimize this further. Notice those underscores in the imports from zio? This means that I import _everything_ that lives under that namespace, which is of course way too much for something as plain as "Hello, World". All I'm using is `ZIO` and `ZIOAppDefault`, and of course `printLine`. `Unit` and `Any` are always present to Scala so you don't have to explicitly import them. To be as explicit as I can be, I end up with the following code:

```scala
// Contents of Main.scala
import zio.{ ZIO, ZIOAppDefault }
import zio.Console.printLine
import java.io.IOException

object HelloWorld extends ZIOAppDefault {
  def run: ZIO[Any, IOException, Unit] =
    printLine("Hello, World")
}
```

... and finally I have what I would call an acceptable "Hello, World" in Zio.

## Solving AOC 2019 part 1
As a good benchmark, and learning exercise, to see what a framework or language has under its belt, I'll try to solve one of the many Advent Of Code puzzles. I haven't done all of them yet so I'll try and solve the day 1 puzzle of the Advent Of Code 2019 with Zio [4]. For this I want to achieve a couple of things:

- Use TDD (Test driven development)
- Using basic file IO
- Being able to do `sbt 'run 1 1 input'` to indicate which day to run (1 till 25), which part to run (1 or 2) and which file to read for input. So, make use of command line arguments.

### Project setup struggles
I start my project again similarly as the "Hello, World" example above, by making a `build.sbt` and dunking in that single dependency line. Of course I want to have access to testing, so I also import all the libraries the documentation says I need to import under 'Reference -> Testing -> Installation' [5]. The full `build.sbt` looks like such:

```scala
libraryDependencies += "dev.zio" %% "zio" % "2.1.18"

libraryDependencies ++= Seq(
  "dev.zio" %% "zio-test"          % "2.1.18" % Test,
  "dev.zio" %% "zio-test-sbt"      % "2.1.18" % Test,
  "dev.zio" %% "zio-test-magnolia" % "2.1.18" % Test
)
```

The first basic point that I can make is: "do I _really_ need all of these libraries?". And the answer to that is: no, if you keep it all very basic. However, that's not what the documentation states.

The bigger hurdle I encounter is again in the documentation, because I'm not sure what to do next because the Zio docs don't specify if the tests need to live inside of the code that you're testing _or_ if this is supposed to be put into a separate file? I'm going to assume Zio is not as cool as Rust, and assume it's a separate file, so my folder structure becomes something like this:

```bash
.
├── build.sbt
├── Main.scala
├── MainSpec.scala
├── project
└── target
```

However, this doesn't work because of the `% Test`-bits that are stated in the test dependencies. After some Googling it turns out that `% Test` implies that these dependencies are only available to tests that live in `src/test/scala` [6]. The reason for this is pretty obvious, it's to make sure that once you compile the code, you don't accidentally bloat your final compiled code with any test code. Again, it would have been nice if Zio specifies this in their documentation, or link to this detail in the sbt documentation. After changing stuff around my folder structure it starts to look like this:

```bash
.
├── build.sbt
├── Main.scala
└── src
    └── test
        └── scala
            └── MainSpec.scala
```

However, this still doesn't quite look that nice, so after some fiddling I settle on the following folder structure (also to maybe one day solve the other AOC 2019 problems):

```bash
.
├── build.sbt
└── src
    ├── main
    │   └── scala
    │       └── aoc2019
    │           ├── DayOne.scala
    │           └── Main.scala
    └── test
        └── scala
            └── aoc2019
                └── DayOneSpec.scala

```

This seems to be a somewhat okay setup for now. The layers of folders I have to set up is quite jarring, but remembering Java from the good 'ol college days, I'm not quite sure if there's a way around this. After declaring the package names everywhere as `aoc2019` I'm properly setup to attempt the first puzzle of the Advent of Code 2019. While doing all of this, the feature I miss from `sbt` is to do `sbt new name-of-thing` and it just spewing out a similar folder structure to the thing above, but it seems like that's all based around custom third-party templates it needs to fetch from some GitHub repo, instead of having a very strongly opinionated one-size-fits all solution, kind of like I'm used to from doing `cargo new` in Rust.

Regardless, the first thing I do is write some basic boilerplate in `Main.scala`, `DayOne.scala` and in `DayOneSpec.scala`:

```scala
// ./src/main/scala/aoc2019/Main.scala
package aoc2019

import zio.{ZIO, ZIOAppDefault}

object Solutions extends ZIOAppDefault {
  def run: ZIO[Any, Any, Any] =
    DayOne.solution
}

// ./src/main/scala/aoc2019/DayOne.scala
package aoc2019

import zio.ZIO

object DayOne {
  def solution: ZIO[Any, Any, Any] =
    ZIO.succeed("placeholder")
}

// ./src/test/scala/aoc2019/DayOneSpec.scala
package aoc2019

import zio._
import zio.test._
import zio.test.Assertion._

object DayOneSpec extends ZIOSpecDefault {
  def spec = suite("DayOneSpec")(
    test("gives the correct solution") {
      for {
        output      <- DayOne.solution
      } yield assertTrue(output == "placeholder")
    }
  )
}
```

Running `test` in `sbt` gives a green light, so my TDD-setup is complete. Of course I need to get rid of those pesky underscores in the imports of my test suite, and naturally be explicit in my type declaration for `def spec`. Because naturally, I have to stay somewhat true to the "Hello, World" adventure I went through. After being more explicit with my imports the code looks like this:

```scala
package aoc2019

import zio.test.ZIOSpecDefault
import zio.test.assertTrue

// ... rest of code
```

The next challenge is assigning an explicit type to `def spec` so I can end up with:

```scala
def spec: SomeType
```

The type of the `suite()` function is `Spec[suiteConstructor.OutEnvironment, suiteContructor.OutError]`. Now I'm thinking: what is `suiteConstructor`? Well it's an `implicit`, the full definition of `suite()` actually looks like this:

```scala
def suite[In](label: String)(specs: In*)(implicit
    suiteConstructor: SuiteConstructor[In],
    sourceLocation: SourceLocation,
    trace: Trace
  ): Spec[suiteConstructor.OutEnvironment, suiteConstructor.OutError] =
    zio.test.suite(label)(specs: _*)
```

> ### Tangent: parenthesis and implicits
> ... and this brings me to the most annoying Scala-feature: implicits. I already mentioned that I'd like to be as explicit as possible, and it just so happens that the definition of this feature is the literal antonym of explicit. Just look at that method, it has not one set of parenthesis, it has three. This actually makes me wonder if Scala has a limit to how many parenthesis a function can actually have. Turns out it hasn't got a limit and this is perfectly street legal:
>
```scala
def sillyConcat(a: String)(b: String)(c: String)(d: String)(e: String)(f: String)(g: String)(h: String): String = a + b + c + d + e + f + g + h
sillyConcat("a")("b")("c")("d")("e")("f")("g")("h")
```
>
> Whoever came up with this design, I love it. It's so ridiculous and over the top that it puts a smile on my face. Why you wouldn't just write it like such and just keep it vanilla is beyond me:
>
```scala
def sillyConcat(a: String, b: String, c: String, d: String, e: String, f: String, g: String, h: String): String = a + b + c + d + e + f + g + h
sillyConcat("a", "b", "c", "d", "e", "f", "g", "h")
```
>
> With that silliness out of the way, it's time to talk implicits. An implicit allows you to define a 'contextual parameter' so that you can write multiple functions of the same name for various types of objects. Other programming languages will just say: just write multiple functions with different sounding names, or implement the same function _per type_ but Scala takes a detour and with implicits does exactly the same, but in such a way that it becomes incredibly obscure to the reader what the code is actually doing because looking at the `suite` example from earlier, I'm not actually calling the third bracket `()` when setting up my tests. Coming from professionally writing Golang this is almost the complete reverse design philosophy.

With that tangent out of the way, I don't see a way of setting the type of `def spec: ...` without really banging my head against the wall multiple times in a row, so I'm leaving it as is, purely because it is test code after all and it's probably not worth the effort.

### Command line args

One of the first things I want to add to my Advent Of Code 2019 `Main.scala` is the ability to have command line arguments in order to run a solution for a certain day and a certain part. For this to work I must use `ZIOAppArgs`. An example goes roughly like this:

```scala
package aoc2019

import zio.{ZIO, ZIOAppArgs, ZIOAppDefault}
import zio.Console.printLine

object Solutions extends ZIOAppDefault {
  def run: ZIO[Any, Any, Any] =
    for {
      args <- ZIOAppArgs.getArgs
      _ <- printLine(s"Received arguments: ${args.mkString(", ")}")
    } yield()
}
```

This will merely take the arguments and print them to the screen. The downside however is the above code-example doesn't work. Instead what I get back is this:

```plaintext
[error]
[error] ──── ZIO APP ERROR ───────────────────────────────────────────────────
[error]
[error]  Your effect requires a service that is not in the environment.
[error]  Please provide a layer for the following type:
[error]
[error]    1. zio.ZIOAppArgs
[error]
[error]  Call your effect's provide method with the layers you need.
[error]  You can read more about layers and providing services here:
[error]
[error]    https://zio.dev/reference/contextual/
[error]
[error] ──────────────────────────────────────────────────────────────────────
[error]
[error]       args <- ZIOAppArgs.getArgs
[error]            ^
[error] one error found
[error] (Compile / compileIncremental) Compilation failed
```

![confused](/img/4/confused.gif)

A couple of questions:

- What is 'provide method'?
- What are layers?

Following the link [7] I'd imagine that Zio's documentation would hand me a shovel to dig me out of the mess I just made, but instead I'm met with a wall of text that only mentions the 'provide method' once.

What I imagine is throwing the error is the fact that I described my type for `run` as `ZIO[Any, Any, Any]` and that I should probably be a bit more explicit. Literally changing this into `ZIO[ZIOAppArgs, Any, Any]` already resolves the error. Nice going with the error-handling there buddy, just say that my types don't match instead of throwing the wrong book at me.

After some more fiddling and doing some heavy-leaning on auto-completion I get this beauty:

```scala
package aoc2019

import zio.{
  Chunk,
  IO,
  Task,
  ZIO,
  ZIOAppArgs,
  ZIOAppDefault
}
import zio.Console.printLine
import java.io.Serializable

object Solutions extends ZIOAppDefault {
  def validateArgs(args: Chunk[String]): IO[String, (Int, Int, String)] =
    args.toList match {
      case dayStr :: partStr :: input :: Nil =>
        for {
          day  <- ZIO.attempt(dayStr.toInt).orElseFail("Day must be an integer")
          _    <- ZIO.fail("Day must be between 1 and 25.").unless(day >= 1 && day <= 25)

          part <- ZIO.attempt(partStr.toInt).orElseFail("Part must be an integer")
          _    <- ZIO.fail("Part must be between 1 and 2.").unless(part >= 1 && part <= 2)

        } yield (day, part, input)
      case _ =>
        ZIO.fail("Usage: run <1-25> <1-2> <path-to-input>")
    }

  def runAoc(day: Int, part: Int, input: String): Task[Int] =
    day match {
      case 1 => DayOne.solution(part, input)
      case _ => ???
    }

  def run: ZIO[ZIOAppArgs, Serializable, Any] =
    for {
      args              <- ZIOAppArgs.getArgs
      validatedArgs     <- validateArgs(args).mapError(err => s"$err")
      (day, part, input) = validatedArgs
      result            <- runAoc(day, part, input)
      _                 <- printLine(s"⭐ d$day p$part: $result")
    } yield()
}
```

It has some type validation for the arguments, and routes these arguments to a specific Advent Of Code solution for a specific day and a specific part. However, it looks like hot trash. Can that for-comprehension go any further horizontally? It also has one of my least favorite features of any programming language, logic _at the end of a long line of code_. In Ruby you can conjure up this lovely joke:

```ruby
def a_very_long_method_name_with_a_single_arg(explicit_arg:)
  1 + explicit_arg
end

def nananana
 false
end

a_very_long_method_name_with_a_single_arg(explicit_arg: 2) if nananana
```

Notice the `if false` at the end? I probably didn't make my method name long enough to prove the point, but assume there's some blocks of modules and classes around this so it's indented 4 times at least (use your imagination a little). The amount of times I spend being confused and running my code over and over and over, only to realize that all the way at the end of my screen somebody decided to dump some logic and that's the reason why a method didn't run has at least been worth a few weeks of salary.

So seeing a line like this is giving me the wrong type of goosebumps:

```scala
ZIO.fail("Day must be between 1 and 25.").unless(day >= 1 && day <= 25)
```

It ain't pretty. Perhaps I should invest in one of those 100" ultra-wide, 8K screens so I can at least scroll far enough horizontally instead of working from a laptop screen all the time.

How to make this nicer? Well, ideally I want something like this:

```plaintext
# pseudo-code:

args = getArguments
day, part, input = parse(args)
if validDay(day) && validPart(part) {
  runAoc(day, part, input)
} else {
  throw Error()
}
```

After quite some frustrations with ZIO types and to make `parseArguments` work with any of the `URIO`, `IO`, `Task` types, I just settled on some plain and simple Scala in order to not _have_ to deal with those:

```scala
package aoc2019

import zio.{
  Chunk,
  Task,
  ZIO,
  ZIOAppArgs,
  ZIOAppDefault
}
import zio.Console.printLine
import java.io.Serializable

object Solutions extends ZIOAppDefault {
  def runAoc(day: Int, part: Int, input: String): Task[Int] =
    day match {
      case 1 => DayOne.solution(part, input)
      case _ => ???
    }

  def parseArguments(args: Chunk[String]): (Int, Int, String) =
    args.toVector match {
      case dayStr +: partStr +: input +: Nil =>
        (dayStr.toInt, partStr.toInt, input)
      case _ =>
        throw new IllegalArgumentException(
            "Usage: run <1-25> <1-2> <path-to-input>"
        )
    }

  def run: ZIO[ZIOAppArgs, Serializable, Any] =
    for {
      args   <- ZIOAppArgs.getArgs
      (day, part, input) = parseArguments(args)

      _      <- ZIO
                 .fail("Day must be between 1 and 25.")
                 .unless(day >= 1 && day <= 25)

      _      <- ZIO
                 .fail("Part must be between 1 and 2.")
                 .unless(part >= 1 && part <= 2)

      result <- runAoc(day, part, input)
      _      <- printLine(s"⭐ d$day p$part: $result")
    } yield()
}
```

This still has the `unless()`'s at the end of the `ZIO.fail("")` lines, but this already looks a lot more readable with the use of some line-breaks. For the keen reader, it also does not throw a nice error any more if a user does something like `sbt 'run dog cat input'` because _I'm_ the user, and I'm fine if that blows up in my face.

> ### Tangent: Zio's scope
> What I will say is that I have no clue if this counts as 'it being written in Zio' because I'm essentially just parsing the command line arguments with pure Scala and not with Zio. Obviously that's an inherently confusing statement because Zio _is written in_ Scala, so "what do you mean by this?" I hear you thinking. Well the biggest problem I have so far with Zio is the public interface. What is the public interface of Zio? Because it has decided to wrap very basic functionality like `printLine` instead of suggesting to do something like this:
>
```scala
ZIO.succeed(println("Hello, World"))
```
>
> It almost causes me to think Zio can be seen in the same limelight as something like processing [8] where every bit of Scala code can be wrapped up inside a nice Zio box. So mentally it becomes this:
>
```
┌────────────────────┐
│     ┌─────────────┐│
│     │       ┌────┐││
│zio  │scala  │java│││
│     │       └────┘││
│     └─────────────┘│
└────────────────────┘
```
>
> Rather than what it should be:
>
```
┌────────────────────┐
│             ┌─────┐│
│zio + scala  │java ││
│             └─────┘│
└────────────────────┘
```
>
> Of course it _is_ the latter, but the scope of Zio is so enormous that it almost starts to slip and slide into the above image at points.

### Actually solving the Advent Of Code Day 1.

Well it turns out that's not even that hard with Zio, and after not really struggling all that much and relying again on a lot of auto-completion I ended up with this:

```scala
package aoc2019

import zio.{Task, ZIO}

object DayOne {
  def solution(part: Int, input: String): Task[Int] =
    ZIO.readFile(input)
      .flatMap(content => ZIO.succeed(
        content
          .lines()
          .mapToInt(digit =>
            part match {
              case 1 => totalMass(digit.toInt)
              case 2 => wishfulTotalMass(digit.toInt)
              case _ => throw new IllegalArgumentException("Invalid part specified")
            }
          )
          .sum()
      ))
      .orElseFail(new Exception("Failed to read input file"))

  def totalMass(mass: Int): Int = mass / 3 - 2

  def wishfulTotalMass(mass: Int): Int = {
    var totalFuel = 0
    var currentMass = mass
    while (currentMass > 0) {
      currentMass = totalMass(currentMass)
      if (currentMass > 0) totalFuel += currentMass
    }
    return totalFuel
  }
}
```

Let's zoom in on the `solution()` function because the other two aren't really that interesting. The `solution()` function starts with:

```scala
ZIO.readFile(input)
```

Now this of course reads the complete file in memory which for the Advent Of Code is usually fine considering the input files are quite small, but in real life this is a massive code stink. Imagine you have a 100GB file; good luck loading that into memory. Now you'd hope Zio would have a nice and easy way of letting you make a file-pointer and read a file line-by-line, but this is yet another one of those examples where the internet just doesn't have any decent tutorials or examples for. So with AI being the hippest thing around, this is what ChatGPT manages to conjure up if I ask it:

"Write a small program in Scala/Zio that reads a file line by line"

This is what it returns:

```scala
import zio._
import zio.stream._
import java.nio.file.Paths

object FileReaderApp extends ZIOAppDefault {

  // Path to the file you want to read
  val filePath = Paths.get("example.txt")

  val readFile: ZIO[Any, Throwable, Unit] =
    ZStream
      .fromPath(filePath)           // Create a stream from the file path
      .via(ZPipeline.utf8Decode)    // Decode bytes to UTF-8
      .via(ZPipeline.splitLines)    // Split the stream into lines
      .foreach(line => ZIO.debug(s"Line: $line")) // Process each line

  def run: ZIO[ZIOAppArgs with Scope, Any, Any] =
    readFile.catchAll(e => ZIO.logError(s"Error reading file: ${e.getMessage}"))
}
```

Without testing for correctness, what's immediately apparent is that it needs quite some boilerplate and some random Java internal, for something this straight-forward. If I ask our dearest friend ChatGPT to instead give me the exact same code but in pure Scala this time, so without Zio, I get:

```scala
import scala.io.Source
import scala.util.{Try, Using}

object FileReaderApp {
  def main(args: Array[String]): Unit = {
    val fileName = "example.txt" // Replace with your file path

    val result = Using(Source.fromFile(fileName)) { source =>
      for (line <- source.getLines()) {
        println(s"Line: $line")
      }
    }

    result.failed.foreach { e =>
      Console.err.println(s"Error reading file: ${e.getMessage}")
    }
  }
}
```

Again not testing for correctness, this is what I imagine these things look like knowing how to make this in Ruby and Golang. Also by comparing the two you must notice that I now need an entire separate library in Zio called `zio-streams`, \*the one I willfully ignored in my "Hello, World" example, while with just Scala I just rely on some imports from the standard library. Now as an extra step I ask ChatGPT to wrap the above inside of Zio:

```scala
import zio._
import scala.io.Source
import scala.util.Using

object FileReaderWrappedInZio extends ZIOAppDefault {
  def readFileLineByLine(fileName: String): ZIO[Any, Throwable, Unit] =
    ZIO.attemptBlocking {
      Using(Source.fromFile(fileName)) { source =>
        for (line <- source.getLines()) {
          println(s"Line: $line")
        }
      }.get // Throws if the Using block failed
    }

  override def run: ZIO[ZIOAppArgs with Scope, Any, Any] =
    readFileLineByLine("example.txt")
      .catchAll(e => ZIO.logError(s"Error reading file: ${e.getMessage}"))
}
```

... and this further proves my point I made earlier of the blurriness of Scala and Zio, and what Zio is actually trying to be.

### Actually actually solving the Advent Of Code Day 1.

To continue on with the `solution()` function I've reduced it to the following:

```scala
ZIO.readFile(input)
  .flatMap(content => ZIO.succeed(
    content
      .lines()
      .mapToInt(_digit => 1)
      .sum()
  ))
```

`flatMap` is essentially saying 'use the result of the previous effect, which in this case is the content it read from the input path, and do something with it to return another result'. In the code example it just sums the line length in a very convoluted way, and wraps it in nice and green Zio-wrapping paper (`ZIO.succeed`). Of course the actual code tests which mapping function to use based on the part we're trying to solve, and that's day 1 done, and I get two stars for my trouble.

## Concluding
I would like to conclude this article by raising some points that I've noticed so far a few months into the Scala and Zio journey. They're in order from serious to less serious:

- Learning Scala and Zio hand-in-hand can be quite jarring. The flaky documentation of Zio and the amount that's implied throughout the documentation is quite frustrating for beginners. This does not only go for actual code, but also for things like assumptions in setup, folder structures, etc.
- The error-handling can be outright confusing. A tremendous help would be having code-examples that are executable by the Scala REPL, or simply by copy/pasting them around in your own code-base, so that you know what Zio would expect you to do.
- Because Zio is functional in nature, it seems that the public interface has 'everything' which makes it so that every bit of Scala code can become Zio wrapping paper. This scares me because if popularity starts to dwindle a massive project like Zio _can_ and will start to show cracks because it essentially has to support _everything_.
- Never thought I would've so much fun writing "Hello, World".
- Just to really make Scala struggle I want to how many parenthesis are too many parenthesis:

```ruby
# Store in function_hell.rb
size = 500
File.open("function.scala", "w") do |file|
  f = "object functionHell {\n"
  f += "  def main(args: Array[String]): Unit = {\n"
  f += "    println(f"
  size.times.map do |i|
    f += "(#{i})"
  end
  f += ")\n"
  f += "  }\n\n"
  f += "  def f"
  size.times.map do |i|
    f += "(x#{i}: Int)"
  end

  f += ": Int =\n    "
  size.times.map do |i|
    f += "x#{i}"
    f += " + " unless i == size - 1
  end
  f += "\n}\n"

  file.write(f)
end
```

To run:

```plaintext
ruby function_hell.rb && scalac function.scala && scala functionHell
```

... and a big fat `java.lang.StackOverflowError` for my troubles. After tweaking the `size` a bunch it seems the upper limit is 179 parenthesis. Just to show you the beauty of a function I made:

```scala
object functionHell {
  def main(args: Array[String]): Unit = {
    println(f(0)(1)(2)(3)(4)(5)(6)(7)(8)(9)(10)(11)(12)(13)(14)(15)(16)(17)(18)(19)(20)(21)(22)(23)(24)(25)(26)(27)(28)(29)(30)(31)(32)(33)(34)(35)(36)(37)(38)(39)(40)(41)(42)(43)(44)(45)(46)(47)(48)(49)(50)(51)(52)(53)(54)(55)(56)(57)(58)(59)(60)(61)(62)(63)(64)(65)(66)(67)(68)(69)(70)(71)(72)(73)(74)(75)(76)(77)(78)(79)(80)(81)(82)(83)(84)(85)(86)(87)(88)(89)(90)(91)(92)(93)(94)(95)(96)(97)(98)(99)(100)(101)(102)(103)(104)(105)(106)(107)(108)(109)(110)(111)(112)(113)(114)(115)(116)(117)(118)(119)(120)(121)(122)(123)(124)(125)(126)(127)(128)(129)(130)(131)(132)(133)(134)(135)(136)(137)(138)(139)(140)(141)(142)(143)(144)(145)(146)(147)(148)(149)(150)(151)(152)(153)(154)(155)(156)(157)(158)(159)(160)(161)(162)(163)(164)(165)(166)(167)(168)(169)(170)(171)(172)(173)(174)(175)(176)(177)(178))
  }

  def f(x0: Int)(x1: Int)(x2: Int)(x3: Int)(x4: Int)(x5: Int)(x6: Int)(x7: Int)(x8: Int)(x9: Int)(x10: Int)(x11: Int)(x12: Int)(x13: Int)(x14: Int)(x15: Int)(x16: Int)(x17: Int)(x18: Int)(x19: Int)(x20: Int)(x21: Int)(x22: Int)(x23: Int)(x24: Int)(x25: Int)(x26: Int)(x27: Int)(x28: Int)(x29: Int)(x30: Int)(x31: Int)(x32: Int)(x33: Int)(x34: Int)(x35: Int)(x36: Int)(x37: Int)(x38: Int)(x39: Int)(x40: Int)(x41: Int)(x42: Int)(x43: Int)(x44: Int)(x45: Int)(x46: Int)(x47: Int)(x48: Int)(x49: Int)(x50: Int)(x51: Int)(x52: Int)(x53: Int)(x54: Int)(x55: Int)(x56: Int)(x57: Int)(x58: Int)(x59: Int)(x60: Int)(x61: Int)(x62: Int)(x63: Int)(x64: Int)(x65: Int)(x66: Int)(x67: Int)(x68: Int)(x69: Int)(x70: Int)(x71: Int)(x72: Int)(x73: Int)(x74: Int)(x75: Int)(x76: Int)(x77: Int)(x78: Int)(x79: Int)(x80: Int)(x81: Int)(x82: Int)(x83: Int)(x84: Int)(x85: Int)(x86: Int)(x87: Int)(x88: Int)(x89: Int)(x90: Int)(x91: Int)(x92: Int)(x93: Int)(x94: Int)(x95: Int)(x96: Int)(x97: Int)(x98: Int)(x99: Int)(x100: Int)(x101: Int)(x102: Int)(x103: Int)(x104: Int)(x105: Int)(x106: Int)(x107: Int)(x108: Int)(x109: Int)(x110: Int)(x111: Int)(x112: Int)(x113: Int)(x114: Int)(x115: Int)(x116: Int)(x117: Int)(x118: Int)(x119: Int)(x120: Int)(x121: Int)(x122: Int)(x123: Int)(x124: Int)(x125: Int)(x126: Int)(x127: Int)(x128: Int)(x129: Int)(x130: Int)(x131: Int)(x132: Int)(x133: Int)(x134: Int)(x135: Int)(x136: Int)(x137: Int)(x138: Int)(x139: Int)(x140: Int)(x141: Int)(x142: Int)(x143: Int)(x144: Int)(x145: Int)(x146: Int)(x147: Int)(x148: Int)(x149: Int)(x150: Int)(x151: Int)(x152: Int)(x153: Int)(x154: Int)(x155: Int)(x156: Int)(x157: Int)(x158: Int)(x159: Int)(x160: Int)(x161: Int)(x162: Int)(x163: Int)(x164: Int)(x165: Int)(x166: Int)(x167: Int)(x168: Int)(x169: Int)(x170: Int)(x171: Int)(x172: Int)(x173: Int)(x174: Int)(x175: Int)(x176: Int)(x177: Int)(x178: Int): Int =
    x0 + x1 + x2 + x3 + x4 + x5 + x6 + x7 + x8 + x9 + x10 + x11 + x12 + x13 + x14 + x15 + x16 + x17 + x18 + x19 + x20 + x21 + x22 + x23 + x24 + x25 + x26 + x27 + x28 + x29 + x30 + x31 + x32 + x33 + x34 + x35 + x36 + x37 + x38 + x39 + x40 + x41 + x42 + x43 + x44 + x45 + x46 + x47 + x48 + x49 + x50 + x51 + x52 + x53 + x54 + x55 + x56 + x57 + x58 + x59 + x60 + x61 + x62 + x63 + x64 + x65 + x66 + x67 + x68 + x69 + x70 + x71 + x72 + x73 + x74 + x75 + x76 + x77 + x78 + x79 + x80 + x81 + x82 + x83 + x84 + x85 + x86 + x87 + x88 + x89 + x90 + x91 + x92 + x93 + x94 + x95 + x96 + x97 + x98 + x99 + x100 + x101 + x102 + x103 + x104 + x105 + x106 + x107 + x108 + x109 + x110 + x111 + x112 + x113 + x114 + x115 + x116 + x117 + x118 + x119 + x120 + x121 + x122 + x123 + x124 + x125 + x126 + x127 + x128 + x129 + x130 + x131 + x132 + x133 + x134 + x135 + x136 + x137 + x138 + x139 + x140 + x141 + x142 + x143 + x144 + x145 + x146 + x147 + x148 + x149 + x150 + x151 + x152 + x153 + x154 + x155 + x156 + x157 + x158 + x159 + x160 + x161 + x162 + x163 + x164 + x165 + x166 + x167 + x168 + x169 + x170 + x171 + x172 + x173 + x174 + x175 + x176 + x177 + x178
}
```

This outputs 15931, and I'm really hoping that this feature of having 179 parenthesis came as a request from a developer within the Scala community. Hopefully Scala 3 allows more parenthesis.

### Sources

1. [sdkman](https://sdkman.io/sdks#scala)
2. [sbt](https://www.scala-sbt.org/1.x/docs/Setup.html)
3. [nvim-metals](https://github.com/scalameta/nvim-metals)
4. [aoc 2019 day 1](https://adventofcode.com/2019/day/1)
5. [zio-test](https://zio.dev/reference/test/installation)
6. [sbt-testing](https://www.scala-sbt.org/1.x/docs/Testing.html)
7. [zio contextual](https://zio.dev/reference/contextual/)
8. [processing](https://processing.org/)
