---
layout: post
title: The screaming fridge and other hardware explorations
---

I've recently started exploring hardware and fiddling with sensors. I can confidentaly say I'm a pretty decent software developer, but hardware has always been a hurdle. The reason for it is that I have very poor experiences with it in the past. Naturally, to start learning, I wanted to make something for small. However I wanted to be more ambitious and solve a problem for all humanity and change the world, so I made a screaming fridge.

### Why?

Well initially the idea was that the fridge would start talking to you whenever you open the fridge door. It would demotivate you to start grabbing snacks; it basically started cursing at you for gaining so many lockdown kilo's. However I figured it would be much more fun (and it is much simpler) for it to start screaming at you like a 6-year old in a candystore.

### The parts

All I needed was a Raspberry PI, a Grove PI+ hat, a speaker and a sensor that can detect a door opening and closing. Now the initial sensor I bought for this was a Grove - IR proximity sensor. However it just doesn't work and it's a piece of garbage. I tried looking everywhere for documentation but instead found somebody else stuck on this green green world who has the exact same problem as I have. [I commented under this three year old thread and I got no replies](x).

I tossed it out of the equation and instead bought a Grove - Ultrasonic ranger. It sounds like something straight out of Star Wars, but better. This one did the trick almost immediately.

### The code

### Other incredibly dumb ideas that came before 'The Screaming Fridge':

Like all good projects it didn't start out like this. It started with another problem:

'Make a robot that reads 50 shades of gray to your friends and family who spend too long on your toilet.'

I build the automatic 50 shades of gray reciter in
