---
layout: post
title: "Project Euler #12: Highly divisible triangular number"
problem_type: euler
problem: 12
complexity: 1
---

This article features only an answer, because I've started writing from [problem 14](/2021/10/25/project-euler-14-longest-collatz-sequence.html).

```rust
fn num_factors(n: i64) -> i64 {
    if n == 1 {
        return n;
    }

    let t = (n as f64).sqrt() as i64;
    let mut d = 2; // You always have 2 divisors, 1 and yourself

    for i in 2..=t {
        if n % i == 0 {
            d += 2
        }
    }

    d
}

fn problem_12(max_divs: i64) -> i64 {
    let mut i = 1;
    let mut j = 1;

    loop {
        i += 1;
        j += i;

        let o = num_factors(j);

        if o > max_divs {
            break j
        }
    }
}

#[test]
fn test_triangle_five_hundred() {
    assert_eq!(problem_12(5), 28);
    assert_eq!(problem_12(500), 76576500);
}

#[test]
fn test_num_factors() {
    assert_eq!(num_factors(60), 12);
    assert_eq!(num_factors(1), 1);
    assert_eq!(num_factors(3), 2);
    assert_eq!(num_factors(6), 4);
    assert_eq!(num_factors(10), 4);
}
```
