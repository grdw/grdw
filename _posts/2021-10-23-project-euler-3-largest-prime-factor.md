---
layout: post
title: "Project Euler #3: Largest prime factor"
problem_type: euler
problem: 3
complexity: 2
---



This article features only an answer, because I've started writing from [problem 14](/2021/10/25/project-euler-14-longest-collatz-sequence.html).

```rust
fn is_prime(number: i64) -> bool {
    if number < 2 {
        return false
    }

    let mut is_prime: bool = true;
    let end = (number as f64).sqrt().floor() as i64;

    for i in 2..end+1 {
        if number % i == 0 {
            is_prime = false;
            break
        }
    }
    is_prime
}

fn prime_factor(number: i64) -> i64 {
    let mut highest_fac: i64 = 0;
    let mut factor: i64 = 2;
    let end = (number as f64).sqrt().floor() as i64;

    loop {
        factor += 1;

        if !is_prime(factor) {
            continue;
        }

        if number % factor == 0 && highest_fac < factor {
            highest_fac = factor;
        }

        if factor >= end {
            break
        }
    }
    highest_fac
}

#[test]
fn is_prime_tests() {
    assert_eq!(is_prime(1), false);
    assert_eq!(is_prime(2), true);
    assert_eq!(is_prime(3), true);
    assert_eq!(is_prime(4), false);
    assert_eq!(is_prime(5), true);
    assert_eq!(is_prime(7), true);
    assert_eq!(is_prime(1151), true);
    assert_eq!(is_prime(6228), false);
}

#[test]
fn prime_factors_test() {
    assert_eq!(prime_factor(13195), 29);
    assert_eq!(prime_factor(600851475143), 6857);
}
```


