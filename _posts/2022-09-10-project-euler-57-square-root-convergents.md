---
layout: post
title: "Project Euler #57: Square root convergents"
problem_type: euler
problem: 57
complexity: 3
---

### Introduction
The puzzle starts out with the following statement:

> It is possible to show that the square root of two can be expressed as an infinite continued fraction.

It then displays the fraction as such: `√2 = 1 + 1 / (2 + 1 / (2 + 1 / (2 + 1 / 2)))`. You can basically go on and on and on, until infinity.

By keeping on expanding the fraction, the fraction can be simplified. The first four expansions look like:

1. 1 + 1/2 = 3/2 = 1.5
2. 1 + (1 / (2 + 1/2)) = 7/5 = 1.4
3. 1 + (1 / (2 + 1/(2 + 1/2))) = 17/12 = 1.41666...
4. 1 + (1 / (2 + 1/(2 + 1/(2 + 1/2)))) = 41/29 = 1.41379...

The next bunch look like: 90/70, 239/169, 577/408. It then explains that the 8th expansion looks like 1393/985, and it is the first expansion where the number of digits in the numerator exceeds the number of digits in the denominator.

The puzzle is: "How many fractions, in the first 1000 expansions, have more digits in the numerator than the denominator?".

### Starting out

I started out on the wrong foot here. I started with trying to be able to make a data structure that could accommodate an infinite fraction; pretty much like a binary tree. What I envisioned, was the following:

```
   1
 /   \
1     2
    /   \
   1     2
       /   \
      1     2
           / \
          .. ..
```

Making such a tree wouldn't be the issue here, it is setting up the tree that's going to be the problem, and writing all that code to collapse it back into a fraction, yikes. Considering how many people have solved this on Euler's website, this has to be a lot easier. I then started to Google because this became complicated too fast. After some searching I came across this bit on Rosetta code's [1], it was a bit helpful, but it still felt overly complex.

I got the correct 'float' values from it, but not the fractions, which is what the puzzle really wants me to do.

Looking at the fractions:

```
3 2
7 5
17 12
41 29
99 70
239 169
577 408
```

It seems like the next denominator is always the sum of the previous numerator and denominator, and the numerator is always the sum of the previous denominator and the current one. In code it would be like this:

```rust
let mut prev_den = 0;
let mut num = 3;
let mut den = 2;

for _ in 1..1000 {
    prev_den = den;
    den += num;
    num = den + prev_den;
}
```

However, doing this till a 1000 causes an overflow, even with a `u128`. My plan is to use part of the same solution of problem 16, 20 and others, to be able to store bigger numbers.

This turns into the following code:

```rust
let mut prev_den = 0.to_vec();
let mut num = 3.to_vec();
let mut den = 2.to_vec();

for _ in 1..1000 {
    prev_den = den.clone();
    den = den.sum_vec(&num);
    num = den.sum_vec(&prev_den);
}
```

The solution indeed becomes rather easy because all I have to do now is check the lengths of the arrays, and test if the one from the numerator is higher than the one from the denominator.

For the code I wrote, I get 144 matching fractions for 1000 expansions.

### ❌ 144 is incorrect

My first attempt is a fluke, and at first glance I'm not sure why exactly. It seems like I screwed up the `sum_vec` method I tried to tweak because the value 10 pops up once or twice in some vectors, which is not good. One such example is:

```
239 + 169 = 408

However in my code it becomes:

[9, 3, 2] + [9, 6, 1] = [8, 10, 3]
```

It doesn't carry over the 1 correctly. After some tweaking and slapping myself in the face (because I've solved this bug already once before ...). I run the code again and get 153! Which is the correct answer.

It takes 0.21s to resolve it, which is fast enough in my book.

### Sources

\[1\] [rosettacode.org/wiki/Continued_fraction](https://rosettacode.org/wiki/Continued_fraction)
