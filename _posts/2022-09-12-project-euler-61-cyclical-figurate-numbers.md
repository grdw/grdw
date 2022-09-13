---
layout: post
title: "Project Euler #61: Cyclical figurate numbers"
problem_type: euler
problem: 61
complexity: 1
---

### Introduction

> The ordered set of three 4-digit numbers: 8128, 2882, 8281, has three interesting properties.
>
> 1. The set is cyclic, in that the last two digits of each number is the first two digits of the next number (including the last number with the first).
> 2. Each polygonal type: triangle (P3,127=8128), square (P4,91=8281), and pentagonal (P5,44=2882), is represented by a different number in the set.
> 3. This is the only set of 4-digit numbers with this property.
>
> Find the sum of the only ordered set of six cyclic 4-digit numbers for which each polygonal type: triangle, square, pentagonal, hexagonal, heptagonal, and octagonal, is represented by a different number in the set.

### To start

The scope of this problem is rather small. There are only 8999 (1000 till 9999) numbers that are four digits in length. However, there are some special cases which can already be discarded f.e. the number 1000. There's no four digit number out there that starts with two 00's. When we filter off all the numbers that are divisible by 100, we are left with 8910 numbers.

To resolve the issue at hand though, we have to start with the smallest four digit triangle number, and find a square number which first two digits match with the last two digits of the smallest triangle number. If there's no such number, go onward to the next triangle number. If at any point we can't find the next pentagonal, hexagonal, etc. number, we have to start with a new triangle number. There's only one matching range of four digit numbers, which is the reason why.

The puzzle gives the functions to calculate the next range of triangle, square etc. numbers. First let's generate all the lists of four digit numbers that fall into each category. After writing some rust, my very basic Rust looks like such:

```rust
const MIN: u32 = 1000;
const MAX: u32 = 9999;

fn is_useful(n: u32) -> bool {
    n >= MIN && n <= MAX && n % 100 != 0
}

fn create_list(func: &dyn Fn(u32) -> u32) -> Vec<u32> {
    let mut n = 1;
    let mut list = vec![];
    loop {
        let t = func(n);

        if t > MAX {
            break;
        }

        if is_useful(t) {
            list.push(t)
        }

        n += 1
    }

    list
}

fn triangle(n: u32) -> u32 {
    n * (n + 1) / 2
}

fn square(n: u32) -> u32 {
    n * n
}

fn pentagonal(n: u32) -> u32 {
    (n * ((3 * n) - 1)) / 2
}

fn hexagonal(n: u32) -> u32 {
    n * ((2 * n) - 1)
}

fn heptonal(n: u32) -> u32 {
    (n * ((5 * n) - 3)) / 2
}

fn octagonal(n: u32) -> u32 {
    n * ((3 * n) - 2)
}
```

I can call `create_list` with any of the 6 functions to create a group of four digit numbers that are either triangle, square, pentagonal, etc. What catches my attention is that the group of numbers becomes smaller and smaller the further you go. There are 96 triangle numbers with four digits, but only 38 octagonal numbers.

Regardless we have six lists all with n digits, and my original plan still stays the same more or less. We start with a group of:

```
{Tr, Sq, Pe, Hex, Hep, Oct}
```
We'll start from the lowest `Tr` and find the next matching `Sq`. If none is available move to the next `Tr`, until the group is complete. We have to look out that whatever number we pick, it has to be unique to the group and have matching digits.

While starting to write some code I find my first bug. It seems like doing `n % 100 != 0` doesn't filter off any garbage four digit numbers. Number like 9801 are also false, because a four digit number can't start with "01". The correct way to filter these off is of course to check if the tens-value is higher than 9 (so `n % 100 > 9`).
