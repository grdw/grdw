---
layout: post
title: "Project Euler #768: Chandelier"
problem_type: euler
problem: 768
complexity: 4
---

<style>
div.circles { 
    position: relative; 
    height: 224px;
    margin-bottom: 18px;
    font-family: monospace;
}
div.circles > div { 
    position: absolute; 
    color: gray; 
}
</style>

### Introduction

I was skipping through the Euler exercises to find a hard one that seems solveable until I came accross the 'Chandelier' exercise. It reads: 

> A certain type of chandelier contains a circular ring of `n` evenly spaced candleholders. If only one candle is fitted, then the chandelier will be imbalanced. However, if a second identical candle is placed in the opposite candleholder (assuming `n` is even) then perfect balance will be achieved and the chandelier will hang level.
>
> Let `f(n, m)` be the number of ways of arranging `m` identical candles in distinct sockets of a chandelier with `n` candleholders such that the chandelier is perfectly balanced.
>
> [..]
>
> Find `f(360, 20)`

### Examples

In the examples it states that `f(4, 2)` equals to 2. This is correct because when drawing this visually, this looks like:

<pre>
  <span class='accent'>M</span>
n   n
  <span class='accent'>M</span>
</pre>

<pre>
  n
<span class='accent'>M   M</span>
  n
</pre>

It also claims that `f(12, 4)` equals to 15, and `f(36, 6)` equals to 876. I won't draw the last one, but I'll try and attempt `f(12, 4)` to see if this makes sense. 12 candleholders will look like this:

<div class="circles">
  <div>N</div>
  <div>N</div>
  <div>N</div>
  <div>N</div>
  <div>N</div>
  <div>N</div>
  <div>N</div>
  <div>N</div>
  <div>N</div>
  <div>N</div>
  <div>N</div>
  <div>N</div>
</div>

If I were to lay these all out in a row (instead of in a circular shape), and try out all different candle positions, I get (where M is a candle, and `_` is a holder):

```
With 2 spaces:
M _ _ M _ _ M _ _ M _ _ 
_ M _ _ M _ _ M _ _ M _
_ _ M _ _ M _ _ M _ _ M

With 3/1 spaces:
M _ _ _ M _ M _ _ _ M _ 
_ M _ _ _ M _ M _ _ _ M
M _ M _ _ _ M _ M _ _ _
_ M _ M _ _ _ M _ M _ _
_ _ M _ M _ _ _ M _ M _
_ _ _ M _ M _ _ _ M _ M

With no spaces:
M M _ _ _ _ M M _ _ _ _ 
_ M M _ _ _ _ M M _ _ _
_ _ M M _ _ _ _ M M _ _
_ _ _ M M _ _ _ _ M M _
_ _ _ _ M M _ _ _ _ M M
M _ _ _ _ M M _ _ _ _ M
```

It seems that's correct. The first observation I have is that regardless of the value of `n`, if I only have 2 candles, than the only way I can balance the chandelier, is by putting them accross from each other (meaning an `n / 2` amount of solutions). Unless of course, there are so many candleholders that an off by 1 "unbalance" wouldn't be noticed in real life situations. However, that's probably not what this problem is discussing. 

The amount of candles and candleholders have to be _even_ numbers, else the chandelier will be unbalanced. Another obvious statement is that if `n = m`, there's only one way to balance the chandelier because it would simply fill all the candleholders.

| N    | M    | Balanced positions
|----------------------------------|
| 2    | 2    | 1
| 1000 | 1000 | 1
| 2    | 4    | 2
| 2    | 1000 | 500
| 12   | 2    | 6
| 12   | 4    | 15

I have two variables I can tune, one is the amount of candleholders and the other the amount of candles. I am not going to look up anything online yet, but I'll try and see if t here's a linear correlation by changing either one of these variables.

### Example: changing the amount of candleholders
For this example I'll take 4 candles and I'll keep that static. I want to figure out what happens if I have 12, 14, 16, 18, 20 candleholders and see if I can predict from 12 to 14 to 16 holders, how many balanced positions there will be for 18 holders and 20 holders.

We already know that for 12 holders and 4 candles, there are 15 positions. If we change this to 14 holders we get the following:

```
2/3 spaces (7):
M _ _ M _ _ _ M _ _ M _ _ _ 
_ M _ _ M _ _ _ M _ _ M _ _
_ _ M _ _ M _ _ _ M _ _ M _ 
_ _ _ M _ _ M _ _ _ M _ _ M
M _ _ _ M _ _ M _ _ _ M _ _
_ M _ _ _ M _ _ M _ _ _ M _
_ _ M _ _ _ M _ _ M _ _ _ M

5 spaces (7):
M M _ _ _ _ _ M M _ _ _ _ _
_ M M _ _ _ _ _ M M _ _ _ _ 
_ _ M M _ _ _ _ _ M M _ _ _ 
_ _ _ M M _ _ _ _ _ M M _ _ 
_ _ _ _ M M _ _ _ _ _ M M _ 
_ _ _ _ _ M M _ _ _ _ _ M M
M _ _ _ _ _ M M _ _ _ _ _ M

4/1 spaces (7):
M _ _ _ _ M _ M _ _ _ _ M _
_ M _ _ _ _ M _ M _ _ _ _ M
M _ M _ _ _ _ M _ M _ _ _ _
_ M _ M _ _ _ _ M _ M _ _ _
_ _ M _ M _ _ _ _ M _ M _ _
_ _ _ M _ M _ _ _ _ M _ M _
_ _ _ _ M _ M _ _ _ _ M _ M
```

For N=16 we get:

```
3 spaces (4):
M _ _ _ M _ _ _ M _ _ _ M _ _ _
_ M _ _ _ M _ _ _ M _ _ _ M _ _ 
_ _ M _ _ _ M _ _ _ M _ _ _ M _
_ _ _ M _ _ _ M _ _ _ M _ _ _ M

6 spaces (8):
M M _ _ _ _ _ _ M M _ _ _ _ _ _
_ M M _ _ _ _ _ _ M M _ _ _ _ _
_ _ M M _ _ _ _ _ _ M M _ _ _ _
_ _ _ M M _ _ _ _ _ _ M M _ _ _
_ _ _ _ M M _ _ _ _ _ _ M M _ _ 
_ _ _ _ _ M M _ _ _ _ _ _ M M _
_ _ _ _ _ _ M M _ _ _ _ _ _ M M
M _ _ _ _ _ _ M M _ _ _ _ _ _ M

1/5 spaces (8):
M _ M _ _ _ _ _ M _ M _ _ _ _ _
_ M _ M _ _ _ _ _ M _ M _ _ _ _ 
_ _ M _ M _ _ _ _ _ M _ M _ _ _ 
_ _ _ M _ M _ _ _ _ _ M _ M _ _ 
_ _ _ _ M _ M _ _ _ _ _ M _ M _
_ _ _ _ _ M _ M _ _ _ _ _ M _ M
M _ _ _ _ _ M _ M _ _ _ _ _ M _
_ M _ _ _ _ _ M _ M _ _ _ _ _ M

2/4 spaces (8):
M _ _ M _ _ _ _ M _ _ M _ _ _ _
_ M _ _ M _ _ _ _ M _ _ M _ _ _
_ _ M _ _ M _ _ _ _ M _ _ M _ _ 
_ _ _ M _ _ M _ _ _ _ M _ _ M _
_ _ _ _ M _ _ M _ _ _ _ M _ _ M
M _ _ _ _ M _ _ M _ _ _ _ M _ _
_ M _ _ _ _ M _ _ M _ _ _ _ M _
_ _ M _ _ _ _ M _ _ M _ _ _ _ M
```

| N  | M | Balanced positions
|-----------------------------|
| 12 | 4 | 15
| 14 | 4 | 21
| 16 | 4 | 28
| 18 | 4 | 36?
| 20 | 4 | 45?

<p></p>
Now, my monkey brain sees that 21 - 15 = 6, and 28 - 21 = 7, so for N=18 I'm expecting there to be 28 + 8 = 36 solutions. Another thing I'm noticing while I I'm writing these out, is that the `(N - M) / 2` gives me the max amount of 'empty candleholders' if I place the candles in groups of 2. So:

| N   | M  | (N - M) / 2
|------------------------|
| 12  | 4  | 4
| 14  | 4  | 5
| 16  | 4  | 6

<p></p>
This is however, only true if I have 4 candles. For now, let's see if my guess of 36 solutions for N=18,M=4 is actually correct:

```
7 spaces (9)   | M M _ _ _ _ _ _ _ M M _ _ _ _ _ _ _
6/1 spaces (9) | M _ M _ _ _ _ _ _ M _ M _ _ _ _ _ _ 
5/2 spaces (9) | M _ _ M _ _ _ _ _ M _ _ M _ _ _ _ _ 
4/3 spaces (9) | M _ _ _ M _ _ _ _ M _ _ _ M _ _ _ _
```

This ends up being 9 x 4 = 36 possibilities. For N=20,M=4, we would get:

```
8 spaces (10)   | M M _ _ _ _ _ _ _ _ M M _ _ _ _ _ _ _ _
7/1 spaces (10) | M _ M _ _ _ _ _ _ _ M _ M _ _ _ _ _ _ _
6/2 spaces (10) | M _ _ M _ _ _ _ _ _ M _ _ M _ _ _ _ _ _
5/3 spaces (10) | M _ _ _ M _ _ _ _ _ M _ _ _ M _ _ _ _ _
4 spaces (5)    | M _ _ _ _ M _ _ _ _ M _ _ _ _ M _ _ _ _
```

So this seems correct for 4 candles, every increase of 2 candleholders will increase the amount of balanced candle positions with whatever number it previously increased, plus 1.

To prove this, we'll change the amount of candles to 6, and see if this holds true.

| N  | M | Balanced positions
|-----------------------------|
| 8  | 6 | 2
| 10 | 6 | 15
| 12 | 6 | 24 (+9)
| 14 | 6 | 35 (+11)
| 16 | 6 | 56 (+21)
| 18 | 6 | 78 (+22) 
| 20 | 6 | 

```
N=10
M M M _ _ M M M _ _ (5)
M _ M M _ M M _ M _ (5)
M M _ M _ M _ M M _ (5)

N=12
M M M _ _ _ M M M _ _ _ (6) 3 spaces
M _ M M _ _ M _ M M _ _ (6) 1/2 spaces, 1/2 candles
M _ _ M M _ M _ _ M M _ (6) 2/1 spaces, 1/2 candles
M _ M _ M _ M _ M _ M _ (2) 1 space
M M _ _ M M _ _ M M _ _ (4) 2 spaces

N=14
M M M _ _ _ _ M M M _ _ _ _ (7) 4 spaces
M _ M M _ _ _ M _ M M _ _ _ (7) 1/3 spaces, 1/2 candles
M _ _ _ M M _ M _ _ _ M M _ (7) 3/1 spaces, 1/2 candles
M _ _ M M _ _ M _ _ M M _ _ (7) 2 spaces
M _ M _ M _ _ M _ M _ M _ _ (7) 1/1/2 spaces

* In this case you can't make groups of 2 candles together

N=16
M M M _ _ _ _ _ M M M _ _ _ _ _ (8) 5 spaces
M M _ M _ _ _ _ M M _ M _ _ _ _ (8) 1/4 spaces, 2/1 candles
M _ M M _ _ _ _ M _ M M _ _ _ _ (8) 1/4 spaces, 1/2 candles
M M _ _ M _ _ _ M M _ _ M _ _ _ (8) 2/3 spaces, 2/1 candles
M M _ _ _ M _ _ M M _ _ _ M _ _ (8) 3/2 spaces, 2/1 candles
M _ M _ M _ _ _ M _ M _ M _ _ _ (8) 1/1/3 spaces
M _ M _ _ M _ _ M _ M _ _ M _ _ (8) 1/2/2 spaces

* Also, in this case you can't make groups of 2 candles together
```

That +1 theory went out of the door real fast, because as you can see with 6 candles the amount of balanced positions first increases by 11, and then it doesn't increase by 12 the next iteration, but by 21 instead.

```
N=18
M M M _ _ _ _ _ _ M M M _ _ _ _ _ _ (9) 6 spaces
M M _ M _ _ _ _ _ M M _ M _ _ _ _ _ (9) 1/5 spaces, 2/1 candles
M _ M M _ _ _ _ _ M _ M M _ _ _ _ _ (9) 1/5 spaces, 1/2 candles
M M _ _ M _ _ _ _ M M _ _ M _ _ _ _ (9) 2/4 spaces, 2/1 candles
M _ _ M M _ _ _ _ M _ _ M M _ _ _ _ (9) 2/4 spaces, 1/2 candles
M _ _ _ M M _ _ _ M _ _ _ M M _ _ _ (9) 3 spaces
M _ _ M _ M _ _ _ M _ _ M _ M _ _ _ (9) 2/1/3 spaces
M M _ _ _ _ M M _ _ _ _ M M _ _ _ _ (6) 4 spaces, 2 candles
M _ M _ M _ _ _ _ M _ M _ M _ _ _ _ (9) 1/1/4 spaces
```

For N=18, 78 positions hold true, unless I made a mistake, of course. Because I haven't found a reasonable pattern yet. Let's instead increase the amount of candles and see what that does to the amount of possible positions.

### Example: changing the amount of candles
Let's flip the assumption and instead freeze the amount of candleholders. I'll freeze them to 14 and change the amount of candles. However, first I'll start by taking some of the previous data, and we end up with getting these tables:

| N  | M | Balanced positions
|-----------------------------|
| 14 | 2 | 7 
| 14 | 4 | 21 (increase of 14)
| 14 | 6 | 35 (increase of 14)
| 16 | 2 | 8
| 16 | 4 | 28 (increase of 20)
| 16 | 6 | 56 (increase of 28)
| 18 | 2 | 9
| 18 | 4 | 36 (increase of 27)
| 18 | 6 | 78 (increase of 42)

<p></p>
There's not really a 'pattern' here, which makes sense also because if you add more candles to the N=14 situation the function will not keep on increasing of course:

| N  | M  | Balanced positions
|------------------------------|
| 14 | 0  | 1
| 14 | 2  | 7 
| 14 | 4  | 21
| 14 | 6  | 35 
| 14 | 8  | 35
| 14 | 10 | 21
| 14 | 12 | 7
| 14 | 14 | 1

<p></p>
Let's do N=14, M=12 first:

```
M M M M M M _ M M M M M M _
```

That's the only formation that balances the candleholders, and it can be shifted around 7 times, much like N=14,M=2. If we look at N=14,M=10, you'd end up with the same situation as N=14,M=4 but with the amount of candles and the amount of empty candleholders _in reverse_, and the same can be said for N=14,M=8. To make the pattern fully complete, you can argue that there's only one possible position for 0 candles. What this does mean is that `f(360, 20)` should give the same amount of balanced positions as `f(360, 340)`; arguing that it gives the same amount of empty candleholders _or_ candles.

| N/M    | 12 | 14 | 16 | 18 | 20                    |
|----------------------------------------------------|
| **0**  |  1 |  1 |  1 |  1 |  1
| **2**  |  6 |  7 |  8 |  9 | 10
| **4**  | 15 | 21 | 28 | 36 | 45
| **6**  | 24 | 35 | 56 | 78 |
| **8**  | 15 | 35 |
| **10** |  6 | 21 | 56 |
| **12** |  1 |  7 | 28 | 78 |
| **14** |    |  1 |  8 | 36 |
| **16** |    |    |  1 |  9 | 45    
| **18** |    |    |    |  1 | 10
| **20** |    |    |    |    |  1 

<p></p>

Considering, that either I made an error by hand in the first segment of this post (which could very easily be the case) or I am not looking at this problem correctly. I can't seem to figure out the 'pattern' if there is any to begin with. Perhaps it's split on even and uneven chandeliers (f.e. for 14 candleholders there's not one 'top' count, but two?). Perhaps there's only a pattern for M=20, like there is for M=12, but not for any individual increases of M? Another approach I might take is the brute force route where I go over every possible configuration of the candles and test if they are balanced or not, but that seems like a really painful slow solution for 360 choose 20.

### The spaces
Let me start with the spaces for 360n 20m. The lowest amount of candles I can place individually is 1 followed by 17 spaces ((360 - 20) / 20 = 17) while keeping the chandelier balanced. The maximum is 20 / 2 = 10 candles on one end of the chandelier, and 10 candles on the other end, with 340 / 2 = 170 spaces in between.

The rule is that for each we can make N rotation variations depending on the amount of spaces we have in between the original configuration. So for `1m-17n-{20}` there are 18 positions, for `10m-170n-{2}` there are 180 positions.

If we start with those 'extremes' we should be able to figure out all the patterns that are between those two.

I can generate them by hand quite easily, but at some point it gets quite hard. The smallest group seems to be 17 spaces + 1 candle, then we have to go up to 34 spaces + 2 candles in order to remain balanced; it all depends on valid orubourous configurations. Perhaps we can denote it as "smallest repeating group". 

| \# candles     | cycle         | repeats |
|------------------------------------------|
| 1 candle (18)  | 1m-17n        | 20
| 2 candles (36) | 1m-16n-1m-18n | 10
|                | 1m-14n-1m-20n | 10
|                | 1m-12n-1m-22n | 10
|                | 1m-10n-1m-24n | 10
|                | 1m-8n-1m-26n  | 10
|                | 1m-6n-1m-28n  | 10
|                | 1m-4n-1m-30n  | 10
|                | 1m-2n-1m-32n  | 10
|                | 2m-34n        | 10
| 3 candles      | ...
| 10 candles     | 10m-170n      | 2

<p></p>
I don't think there's a way to balance 3 candles in a circular motion, because I have 20 candles which I can't cut in 3 parts effectively, or can I? This formation could be valid 1m-50n-1m-2n-1m-2n-{5}, but it doesn't fit in a circular motion properly, so the chandelier will be unbalanced, perhaps there is some shape as 2m-xn-1m-yn-{z}, which will not worke either because I don't have 30 candles. So, no matter how I look at this there are no groups to be made with 3 candles. From some small bit of code I wrote, I see I can make groups of: 1,2,4,5 and 10 candles. For some reason my code also returns 8 candles, but I'm pretty sure that one isn't possible as well, since with 8 candles we would get 2m-xn-6m-yn-{z} type solutions, which would end with a problem, because 20 cannot be divided by 8. 

<script language="javascript">
let circles = document.querySelectorAll('div.circles');
const topOffset = 5;
const leftOffset = 5;

Array.prototype.forEach.call(circles, function (circle) {
    let innerCircles = circle.querySelectorAll('div');

    Array.prototype.forEach.call(innerCircles, function (c, index) {
        let angle = index * Math.PI / (innerCircles.length / 2);
        c.style.top = topOffset + Math.sin(angle) * 5 + 'em';
        c.style.left = leftOffset + Math.cos(angle) * 5 + 'em';
    });
});
</script>

