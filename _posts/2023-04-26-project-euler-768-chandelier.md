---
layout: post
title: "Project Euler #768: Chandelier"
problem_type: euler
problem: 768
complexity: 1
---

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

<pre>
       n
   n       n
 n           n
n             n
 n           n
   n       n
       n
</pre>

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

<p></p>
Now, my monkey brain sees that 21 - 15 = 6, and 28 - 21 = 7, so for N=18 I'm expecting there to be 28 + 8 = 36 solutions. Another thing I'm noticing when writing these out, is that the `(N - M) / 2` gives me the max amount of 'empty candleholders' if I place the candles in groups of 2. So:

| N   | M  | (N - M) / 2
|------------------------|
| 12  | 4  | 4
| 14  | 4  | 5
| 16  | 4  | 6

<p></p>
This is only true if I have 4 candles. For 6 candles, it becomes `(N - M) / 3`

| N   | M  | P  | (N - M) / P
|-----------------------------|
| 36  | 6  | 3  | 10
| 360 | 20 | 10 | 34

<p></p>
The groups I can make for N=12,M=4 are '4 empty spaces', '3/1 empty spaces' and '2 empty spaces'.
