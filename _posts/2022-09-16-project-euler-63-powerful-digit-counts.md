---
layout: post
title: "Project Euler #63: Powerful digit counts"
problem_type: euler
problem: 63
complexity: 1
---

### Introduction

> The 5-digit number, 16807=7<sup>5</sup>, is also a fifth power. Similarly, the 9-digit number, 134217728=8<sup>9</sup>, is a ninth power.
>
> How many n-digit positive integers exist which are also an nth power?

### The solution

Because this problem is quite easy to solve, I'm jumping straight to the solution. The code looks as follows:

```rust
let mut count = 0;
let mut start: u128 = 1;
let mut pow = 1;
let mut prev_count = 0;

loop {
    let n = start.pow(pow);
    let n_len = ((n as f64).log10() + 1.0) as u32;

    if pow == n_len {
        count += 1;
    } else if n_len > pow {
        start = 1;
        pow += 1;

        if prev_count == count {
            break;
        }

        prev_count = count;
    }

    start += 1;
}

count
```

The main gist is to start an infinite loop, and have two functions that are in the form of <math>n = x<sup>y</sup></math>, and <math>n_len = log<sub>10</sub>(n)</math>. If `y` equals to `n_len`, it counts towards the total, if it doesn't increase `x`, and if `y` exceeds `n_len` we can increase `y` by 1 and reset `x` to 1.

We keep the loop going until the total count no longer increases for said power. This will result in a total of 49 integers.
