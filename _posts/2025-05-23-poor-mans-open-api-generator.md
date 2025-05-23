---
layout: post
title: "Poor mans open API generator"
---

### Problem
At my last moments of WeTransfer we were looking into generating code from OpenAPI specifications [1]. The reason being to generalize the amount of boiler-plate code and to regenerate code on-demand by some form of (custom) template. The idea mostly stayed on paper and we never really got hands on with it, only in so much that we generated a bunch of models/domains (or what you want to call it) based of the schemas. Funnily, the idea persisted in my head and at my most recent job I felt the need to investigate this a bit more thoroughly.

### The existing tooling
The OpenAPI tooling lists multiple solutions for generating code based on custom templating. The most prominent one is the aptly named `openapi-generator` [2]. It supports quite a bunch of languages and frameworks. Customization however is a massive pain. Altering an existing template _can_ be done, but completely changing an underlying generator requires you to write custom blobs of Java which goes a bit beyond what I ideally want.

Another tool I considered was `swagger-codegen` [3] but that tool is a previous iteration of the aforementioned tool so it faces a similar problem. You still have to write custom slabs of Java + a custom template, and it feels like quite a bunch of work for essentially generating a template.

### Sources

1. [swagger.io/specification](https://swagger.io/specification/)
2. [openapi-generator.tech/docs/templating](https://openapi-generator.tech/docs/templating/)
3. [swagger.io/tools/swagger-codegen](https://swagger.io/tools/swagger-codegen/)
