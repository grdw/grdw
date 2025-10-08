---
layout: post
title: "How tiny can you make a website?"
---

## Introduction

![rpi](/img/5/1.cropped.jpg)

This is going to be my 2nd article that falls into the 'what if?' category. Now, the question here is: how tiny can you make a website? First up, with website I mean rendering a page, from a piece of hardware (see header image), available on some IP address.

I have a couple of requirements:

- Keep resource use (CPU/memory/IOPS) down to an absolute minimum
- Needs to be able to handle regular load (10 req/s) somewhat easily
- Render static HTML in a browser

How many parts can I legally strip from the server before it no longer is able to match these requirements?

## OS

Considering that the hardware I'm using - a Raspberry Pi B+ - will only be used for this single purpose, I'm not going to bother with Docker and/or Kubernetes. The reason being that those services in and of itself use resources as well, and we're trying to be as stingy as we can be. So we have to pick an operating system for the Raspberry Pi, that is the smallest thing we can find. It's also an older model Raspberry Pi making this a bit harder probably.

According to some online searches the smallest possible OS I could get away with is "piCore" [1] which is a port from "Tiny Core Linux". After flashing my SD card it starts and I'm greeted with:

```
   ( '>')
  /) TC (\   Core is distributed with ABSOLUTELY NO WARRANTY.
 (/-_--_-\)           www.tinycorelinux.net

tc@box:~$
```

It also automatically sets up `sshd` so I can reach it through `ssh tc@<ip-address>` with the default password `piCore`.

Obviously the question is: is this the smallest possible OS out there?


### Sources

1. [piCore](http://tinycorelinux.net/ports.html#piCore)
