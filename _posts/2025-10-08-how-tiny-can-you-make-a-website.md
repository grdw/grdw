---
layout: post
title: "How small can you make a website?"
tags: [raspberry pi, linux, busybox, tiny core linux]
img: /img/5/1.jpg
---

![rpi](/img/5/1.jpg)

This is going to be my 2nd article that falls into the 'what if?' category. Now, the question here is: how small can you make a website? First up, with website I mean rendering a page, from a piece of dusty hardware (see header image), available on some IP address.

I have a couple of requirements:

- Keep resource use (CPU/memory/IOPS) down to an absolute minimum
- Needs to be able to handle regular load (10 req/s) somewhat easily
- Render static HTML in a browser
- **Extra:** Needs to be run on hardware that's collected dust under my bed

How many parts can I legally strip from the server before it no longer is able to match these requirements?

## OS

Considering that the hardware I'm using - a Raspberry Pi B+ - will only be used for this single purpose, I'm not going to bother with Docker and/or Kubernetes. The reason being that those services in and of itself use resources as well, and we're trying to be as stingy as we can be. So we have to pick an operating system for the Raspberry Pi, that is the smallest thing we can find. It's also an older model Raspberry Pi making this a bit harder probably.

According to some online searches the smallest possible OS I could get away with is "piCore" [1] which is a port from "Tiny Core Linux". The image itself `piCore-16.0.0.img` is only 101MB in size, which is really small compared to Ubuntu server which for some reason is 3GB at this day and age [3]. Anyway, after flashing my SD card, and plugging it into the Raspberry Pi and hooking the HDMI cable to my TV it starts and I'm greeted with:

```
   ( '>')
  /) TC (\   Core is distributed with ABSOLUTELY NO WARRANTY.
 (/-_--_-\)           www.tinycorelinux.net

tc@box:~$
```

It also automatically sets up `sshd` so I can reach it through `ssh tc@<ip-address>` with the default password `piCore`.

Obviously the question is: is this the smallest possible OS out there? The answer to this is: no, but the alternatives are to use stripped back versions of the Linux kernel, and I don't feel too comfortable doing that yet, but who knows perhaps in the future I might revisit this article.

After following a tutorial on Tiny core and Busybox [2] I was able to very easily make a running website:

![little baby site](/img/5/2.jpg)

I did have to make some changes to the tutorial, and namely in their `/opt/bootlocal.sh` file. Mine looks roughly like this:

```bash
cp /mnt/mmcblk0p2/wwwsite/index.html /usr/local/httpd/bin/index.html
cd /usr/local/httpd/bin/
# There's a typo in the original article 'Sudo vs sudo'
sudo ./busybox httpd -p 80 -h /usr/local/httpd/bin/
cd /usr/local/etc/init.d/
./openssh start
cd /etc/init.d/services/
./tftpd start
```

The most significant change is in the `cp /mnt/....` line. Make sure that there's a persistence storage location, in my case that was `/mnt/mmcblk0p2` instead of the `/mnt/sda1` they mention in the tutorial. You can figure out the locations by running `sudo fdisk -l` and trying out which partition actually is persistent.

## Performance

Obviously, with the specs from the Raspberry Pi B+ (ARMv7 Processor BCM2835, with 1 GB of memory) I was curious: how many requests per second can Busybox handle before it starts to croak?

For this I'm using `siege` [4] to very simply start calling `http://192.168.178.50` with multiple concurrent clients. Obviously this doesn't mimic real latency as the calls come from within the house so to speak, but it will give somewhat of a benchmark. I'll also use `top` to monitor the CPU and memory use.

After running the following:

```bash
siege -t 1m -c 10 http://192.168.178.50
```

... here are the results:

```
Transactions:		       37307 hits
Availability:		      100.00 %
Elapsed time:		       59.93 secs
Data transferred:	        0.14 MB
Response time:		        0.02 secs
Transaction rate:	      622.51 trans/sec
Throughput:		        0.00 MB/sec
Concurrency:		        9.96
Successful transactions:       37307
Failed transactions:	           0
Longest transaction:	        0.18
Shortest transaction:	        0.01
```

The CPU peaked at ~47% of its total, and the memory use peaked at ~81Mb. What I will say is that it's not serving anything significant, except a single line of text. What if I actually make a single page of somewhat beefier HTML, so let me introduce, my new website:

![big website](/img/5/3.jpg)

My tiny website is now a whopping ~6 Kb after adding 10 paragraphs of lorem ipsum, which is better than the few bytes it had before. Obviously, this doesn't even come remotely close to the juggernauts of websites that exist out there today, however it would still be a part of the 1MB club [5]. Also, what if instead of 10 concurrent users, we go straight to 100 users:

```bash
siege -t 1m -c 100 http://192.168.178.50
```

Results:

```
Transactions:		       45047 hits
Availability:		      100.00 %
Elapsed time:		       59.36 secs
Data transferred:	      270.82 MB
Response time:		        0.13 secs
Transaction rate:	      758.88 trans/sec
Throughput:		        4.56 MB/sec
Concurrency:		       99.07
Successful transactions:       45047
Failed transactions:	           0
Longest transaction:	       14.72
Shortest transaction:	        0.01
```

And what do you know? It actually did a remarkable job. The CPU peaked at ~68% this time around and the memory use only got to ~109Mb. The longest transaction was 14.72 seconds, which is not the best, but handling ~100 concurrent requests, without blowing a fuse is pretty incredible.

Now, to stay true to the "What if?" nature of this article, what if we add even more power?

![spongebob](/img/5/4.gif)

```bash
siege -t 1m -c 1000 http://192.168.178.50
```

Result:

```
Transactions:		       46972 hits
Availability:		       99.99 %
Elapsed time:		       59.49 secs
Data transferred:	      282.39 MB
Response time:		        0.94 secs
Transaction rate:	      789.58 trans/sec
Throughput:		        4.75 MB/sec
Concurrency:		      745.12
Successful transactions:       46972
Failed transactions:	           7
Longest transaction:	       57.70
Shortest transaction:	        0.01
```

At a 1000 concurrent connections it finally starts to croak a little, and the CPU peaked at ~70% which is still not the full 99% I was expecting it to go for. Busybox probably starts to back-paddle quite a bunch, resulting in the longest transaction being 57.70s, and some of the siege clients raised connection timeouts:

```
[alert] socket: select and discovered it's not ready sock.c:384: Connection timed out
[alert] socket: read check timed out(30) sock.c:273: Connection timed out
```

.. but 99.99% availability is insane on an old Raspberry Pi B+ with ~745 concurrent users.

## Questions

Obviously this raises a bunch of questions in my mind, and I'll list them from most pressing to least pressing:

- Could I self-host this blog on this Raspberry Pi, and escape the clutches of Github pages?
- How would Apache/nginx/etc. compare to Busybox?
- Would an SSL certificate reduce the performance?
- What if you hook the Raspberry Pi up to a solar panel and a battery, could you make it a properly green server like all the other cool kids are doing? [6]
- What about 10.000 concurrent clients?

### Sources

1. [piCore](http://tinycorelinux.net/ports.html#piCore)
2. [Tiny Core Linux - Busybox](https://www.petenetlive.com/kb/article/0001697)
3. [Ubuntu server](https://ubuntu.com/download/server)
4. [Siege](https://www.joedog.org/siege-home/)
5. [1MB club](https://github.com/bradleytaunt/1mb-club)
6. [Solar website](https://solar.dri.es/)
