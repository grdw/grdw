---
layout: post
title: "Project Euler #21: Amicable numbers"
euler: 21
complexity: 1
---

{% include euler.html %}

**Introduction**
Amicable numbers are numbers where d(a) = b and d(b) = a and a != b. To determine d(N), you find all divisors for N and sum them. You take that sum and check if d(Sum) returns the same N, if it does, it's a pair. If it doesn't, it isn't a pair. Find and sum up all the pairs below 10.000.

To determine the sum of divisors to a number you can do the following:

```rust
fn sum_divisors(i: u16) -> u16 {
    let sqrt = (i as f64).sqrt() as u16;
    let mut total_div = 1; // Every number is divisible by 1
    for n in 2..sqrt {
        if i % n == 0 {
            total_div += n + (i / n);
        }
    }
    total_div
}

#[test]
fn test_divisors() {
    assert_eq!(divisors(220), 284);
    assert_eq!(divisors(60), 108);
}
```

With that in place, an amicable pair can be thought of like this:

```rust
sum_divisors(sum_divisors(n)) == n;
```

Upon implementing this looks like:

```rust
fn problem_21() -> u16 {
    (0..10_000)
        .filter(|&n| sum_divisors(sum_divisors(n)) == n)
        .sum()
}
```

The code returns 40279 and upon checking the answer (31626), it seems like I did something wrong. I'm 8653 off, which is quite a lot. I believe I'm missing the part where a != b. Let's be actually correct this time about what amicable means and abstract it to a function returning a boolean:


```rust
fn amicable(i: u16) -> bool {
    let n = sum_divisors(i);

    n != i && sum_divisors(n) == i
}

#[test]
fn test_amicable() {
    assert_eq!(amicable(1), false);
    assert_eq!(amicable(220), true);
}
```

That seems to be the fix for my problem and it returns the correct result of 31626. The full code being:

```rust
fn sum_divisors(i: u16) -> u16 {
    let sqrt = (i as f64).sqrt() as u16;
    let mut total_div = 1;
    for n in 2..sqrt {
        if i % n == 0 {
            total_div += n + (i / n);
        }
    }
    total_div
}

#[test]
fn test_divisors() {
    assert_eq!(sum_divisors(220), 284);
    assert_eq!(sum_divisors(60), 108);
    assert_eq!(sum_divisors(sum_divisors(220)), 220);
}

fn amicable(i: u16) -> bool {
    let n = sum_divisors(i);

    n != i && sum_divisors(n) == i
}

#[test]
fn test_amicable() {
    assert_eq!(amicable(1), false);
    assert_eq!(amicable(220), true);
}

fn problem_21() -> u16 {
    (0..10_000)
        .filter(|&n| amicable(n))
        .sum()
}

#[test]
fn test_problem_21() {
    assert_eq!(problem_21(), 31626);
}
```
