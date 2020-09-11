---
layout: post
title: The shape of memory issues
---

This story will not be about memory issues in brains or the inner workings of Alzheimers, dementia or similar diseases. In fact, it's a story about how I resolved two memory issues in a Ruby backend once. Hopefully it might provide some useful tooling and details in how to debug these kind of issues. I would also like to start out with saying that before all this, I wasn't as knowledgeable about memory and especially how it worked in a Ruby environment.

Before starting to describe the actual memory issues and some of the tooling I used, or the setup of this backend itself, I'd like to teach you what various shapes of memory issues there are when plotting memory consumption over time. There are three distinct shapes you should be frightened of and I'll list them from least worrying to most worrying:

**Memory bloat:**

![bloat](/img/1/1.png)

The memory jumps up significantly. Some memory will be freed along the way, but overall the total memory will grow in large quantities in small amounts of time. The total accumulated memory keeps persisting and eventually it will cause the memory to overflow.

**Memory fragmentation:**

![bloat](/img/1/2.png)

The shape of memory fragmentation is logarithmically. This means the total memory used will grow and grow and will try to reach a point it can never reach. Usually these issues are slow moving.

**Memory leak:**

![bloat](/img/1/3.png)

The shape of a memory leak is linear. The total memory use will go up and up in a linear fashion and eventually it will run out. Much like fragmentation, these issues are slow moving.

In theory these are the three core ‘memory issue shapes' I've learned about. However this doesn't take away that you can actually combine either one of these. So with this knowledge, what does this look like to you:

![bloat](/img/1/4.png)

## The backend and the patch

To tell a little bit about this Ruby backend: it's written in Sinatra, it runs on a bunch of puma servers and has a bunch of background workers for longer running jobs. It's nothing too out of the ordinary, except that the puma servers ran out of memory on September 10th, 2018. It caused a partial outage, but nothing too bad. The next day an engineer was assigned to the problem and naturally he had a choice to make: investigate the problem for a couple of weeks and fix it or patch it. At the time it was rather busy, so we decided to patch it. We introduced [a gem](https://github.com/schneems/puma_worker_killer) that would restart our puma servers every hour to free up memory.

![bloat](/img/1/5.png)

We were however aware that we still needed to do some actual research in how this could've happened. On December the 14th of the same year a small investigation occurred in which we concluded that it wasn't leaking memory. The gem was working fine, so the incentive to further investigate this issue was not a thing and we closed the issue.

Christmas 2018 happened, which was pretty good. New years eve came around and eventually it became 2019. Valentine's day and the Easter bunny came around as well and when the weather in the Netherlands finally started to look fine, a new version of puma was being released on June 25th 2019. Because of this newer version – and you guessed it – our restarting patch became incompatible so we had to remove it. After a deploy we figured that we still hadn't fixed the actual memory issue, so we reverted back to the older version including our patch. This is what that looked like from a memory point of view:

![bloat](/img/1/6.png)

When filtering out the puma servers:

![bloat](/img/1/8.png)

and when filtering out the background workers:

![bloat](/img/1/7.png)

Like I mentioned earlier on in the article: two memory issues. Let's start from least frightening to more frightening.

## Bloaty background workers

**The problem:**

To scroll back to the three memory shapes, the shape of this chart looks rather familiar, namely that this is classic memory bloat. Memory is being allocated and because of its size, Ruby thinks that this particular piece of memory must be important, so it persists it for quite a while. After an hour it increases again, rinse and repeat.

**The solution:**

It turned out that there was a cronjob who's sole purpose was to read logs, compress them, store them elsewhere for safekeeping and delete them. Our backend grew and grew, so we naturally acquired more logs. The logs were persisted in a single array and then compressed, wherein lied the issue. This array became incredibly large and this naturally had to be done in batches. After fixing this, the problem went away our memory looked good and healthy again for the background workers:

![bloat](/img/1/9.png)

## One down, one to go!

Now onward to the frightening memory issue: the one in the puma servers; the one that started it all.

![bloat](/img/1/4.png)

By simply looking at this graph, it looks like a leak, however back in December 2018 we concluded it wasn't leak. Considering all possibilities, my first hypothesis was that the investigation back in December was incorrect and it must be a leak.

I changed two things to find it: I installed a tool called [rbtrace](https://github.com/tmm1/rbtrace) on our production environment and naturally I had to drop our puma server restarting patch. I deployed these changes and started to measure away. Because memory leaks take a while to reveal their ugly face, I had to wait a bunch of hours between taking measurements and I had to remind myself to revert everything back to normal when the day was over, in case it would run out of memory at night.

This is what the graph looked like at the time:

![bloat](/img/1/13.png)

Now this graph depicts an entirely different memory problem. At the time when making this screenshot I was still convinced the puma server was leaking memory, knew nothing about memory fragmentation and naturally I couldn't find anything which even remotely looked like a leak.

The logical next theory in finding this ninja leak would be that an underlying C-library was leaking in one of the Ruby dependencies. The way to measure this according to some articles I read, was to compile Ruby with [jemalloc](http://jemalloc.net/).

**Excerpt rbtrace results:**

Time   | RSS Size (pmap) | Total heap size (rbtrace)
-------|-----------------|---------------------------
 8:57  | 1.89GB          | +/- 38.12MB
 13:25 | 1.95GB          | +/- 38,12MB

Simultaneously I was analysing the rbtrace results and found them to be rather strange. When checking the memory usage of the actual puma server and comparing it with the actual size that Ruby is aware of, it turned out that Ruby forgets quite a big chunk of it. Ruby, in a way, suffers from Alzheimers disease.

All of this left me rather confused and a bit frustrated. I was walking around trying to make sense of it, while another coworker was overhearing me sighing rather loudly when I was going to the toilet. He asked what was going on and I explained this particular problem. He said that he once read an article about this memory discrepancy in Ruby and he would link it to me. I briefly [skimmed the article](https://www.joyfulbikeshedding.com/blog/2019-03-14-what-causes-ruby-memory-bloat.html) and there was a striking image in there:

![bloat](/img/1/11.png)

See! Ruby has Alzheimer's disease.

After figuring this out, I knew I couldn't really rely on the results of rbtrace, so instead I started to pry around in the actual memory itself to see if I could learn anything from it. To do this, you need to have some Linux knowledge and especially how to access memory or rather how to turn working memory into actual files on disk. There are a couple of helpful commands to search for namely: [pmap](https://linux.die.net/man/1/pmap) and [gdb](https://www.gnu.org/software/gdb/). After some more analysis I found that there were large blobs of memory retained for large periods of time. Upon checking what was stored inside these blobs, I found that they were mostly response bodies from requests to the puma server which were a little bit to beefy.

This finding changed the conclusion of the problem to memory bloat. Retaining memory over a long period of time, while not cleaning it up is classic memory bloat. However the chart now doesn't line up with the actual memory usage. I also continued with the leaking C-library theory, because that also had some merit. I deployed the 'Ruby with jemalloc'-solution to production to actually prove this theory, while having the benefit of real life production traffic. To my surprise it solved our memory issue:

![bloat](/img/1/12.png)

**But why?!**

I was happy that it was fixed, but at the time I didn't understood why this solution even remotely worked. However, today, with my limited knowledge I can say this: a side-effect of compiling Ruby with jemalloc, is that jemalloc starts to combat memory fragmentation. The puma workers were experiencing this particular memory issue. On top of this, my other conclusion of it being memory bloat was also correct. Imagine if you were to combine both memory bloat and memory fragmentation into a single shape, it will start to look linear. This in turn will give you the false idea that it's a memory leak, when looked at it from a short period of time.

All in all I would like to end with this: memory issues are unique cases, there's usually no standard solution to them; there's no standard default StackOverflow answer available. When you're dealing with a leak or fragmentation, measure memory usage over a longer period of time and be patient (I need to tattoo this one on my arm).
