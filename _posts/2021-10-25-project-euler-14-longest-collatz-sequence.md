---
layout: post
title: "Project Euler #14: Longest Collatz sequence"
problem_type: euler
problem: 14
complexity: 1
---

**Introduction**
The puzzle is called "Longest Collatz sequence" which starts off by stating that it's a sequence of positive integers. To build up such a sequence, we take any number. If it's an even number, we divide the number by 2. If the number is an uneven number we multiply by 3 and add 1. The result of that we loop back into the sequence until we are left with the final number, which is always 1. It also gives me an example to create such a sequence for the number 13.

13 is an odd number so following the rules it will give us this sequence:

```plaintext
13 -> 40 -> 20 -> 10 -> 5 -> 16 -> 8 -> 4 -> 2 -> 1

13 is an odd number so:
13 x 3 + 1 = 40

40 is an even number so:
40 / 2 = 20
etc.
```

This produces a chain of 10 numbers. The idea is to write a program that tests which number, up to 1.000.000, produces the longest chain.

**How to determine the length of a chain?**
The first step in this problem is to determine the length of a chain. I'm using a TDD approach, so the first thing I write is this:

```rust
fn chain_length(n: i32) -> i32 {
    0
}

#[test]
fn test_chain_length() {
    assert_eq!(chain_length(13), 10)
}
```

When running `cargo test` the test will report that the code isn't working. I know the chain ends whenever n = 1. I also know you can use a modulo to test if a number is odd or even. So my first solution would be this:

```rust
fn chain_length(mut n: i32) -> i32 {
    let mut count = 1;
    while n > 1 {
        if n % 2 == 0 {
            n /= 2
        } else {
            n = 3 * n + 1
        }
        count += 1
    }
    count
}

#[test]
fn test_chain_length() {
    assert_eq!(chain_length(13), 10)
}
```
It's not the most elegant looking code in the world, but the only other solutions I can come up with is using either recursion or using an infinite loop, which all come with their own complexities. As far as I see, this is the simplest approach.

**The answer**
 Let's actually check all the numbers from 2 up to 1.000.000. The reason I'm saying 2 is because that's the first positive number that will make the while-loop even trigger in the first place.

```rust
// Look at me swapping out those i32's for u32's.
// I sometimes forget what the difference is.. whoops.

fn problem_14() -> u32 {
    let mut answer = 0;
    let mut highest_chain = 1;
    for n in 2..=1_000_000 {
        let chain_len = chain_length(n);
        if chain_len > highest_chain {
            highest_chain = chain_len;
            answer = n
        }
    }
    answer
}

#[test]
fn test_max_chain_length() {
    assert_eq!(problem_14(), 10)
}
```

This code breaks pretty badly due to some 'overflow' error, so my immediate guess is to bump up those useless `u32`'s to some `u64`'s. When applying that change the code works and it returns me an answer: 837799. Upon checking the answer for probem 14 in the link above, that seems to be correct. The full code:

```rust
fn chain_length(mut n: u64) -> u64 {
    let mut count = 1;
    while n > 1 {
        if n % 2 == 0 {
            n /= 2
        } else {
            n = 3 * n + 1
        }
        count += 1
    }
    count
}

fn problem_14() -> u64 {
    let mut answer = 0;
    let mut highest_chain = 1;
    for n in 2..=1_000_000 {
        let chain_len = chain_length(n);
        if chain_len > highest_chain {
            highest_chain = chain_len;
            answer = n
        }
    }
    answer
}

#[test]
fn test_max_chain_length() {
    assert_eq!(problem_14(), 837799)
}

#[test]
fn test_chain_length() {
    assert_eq!(chain_length(13), 10)
}
```

**Improvements on the answer**
The first question I always have when writing any first version of code is: can this be done more elegantly? Because I use TDD, I can actually refactor some of this code and make it look a lot nicer. The only area of improvement I see is the `problem_14` method. My first idea here is to make use of some iterator methods that Rust gives us, which made me come up with this:

```rust
fn problem_14() -> u64 {
    (2..=1_000_000)
        .map(|n| (n, chain_length(n)))
        .max_by_key(|n| n.1)
        .unwrap().0
}
```

It's a bit more elegant, where elegant here just means shorter, but I'm still not a big fan of those `.1` and `.0` accessors that are required from mapping to a tuple. However, considering that the question is _which number produces the highest chain_ and not how high is _the highest chain_ I need to persist the number. As far as I see here, there is no way around the tuple.