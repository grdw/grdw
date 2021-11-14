---
layout: post
title: "Project Euler #27: Quadratic primes"
problem_type: euler
problem: 27
complexity: 1
---
**Introduction**
Find the product of the coefficients, a and b, for the quadratic expression that produces the maximum number of primes for consecutive values of n, starting with n = 0. A couple of things we know:

- The quadratic notation is `n^2 + an + b`.
- The ranges of a are 1..1000.
- The ranges of b are 1..=1000.
- The ranges of n are 0 up till a value until no prime is found.

**Validating n^2 + n + 41**
The puzzle states that the above method returns a maximum of 40 prime numbers. Let's first proof that with some code. We'll take the `is_prime` method from ["Largest prime factor"](/2021/10/23/project-euler-3-largest-prime-factor.html) and add some code around it:

```rust
fn max_primes(a: u64, b: u64) -> u64 {
    let mut n: u64 = 0;
    let mut count = 0;
    loop {
        let sum = n.pow(2) + (a * n) + b;

        if is_prime(sum) {
            count += 1;
        } else {
            break count;
        }
        n += 1;
    }
}

#[test]
fn test_max_primes() {
    assert_eq!(max_primes(1, 41), 40);
}
```

40 primes seems to be correct. Let's also try this for the other case where `a` and `b` are 79 and 1601 respectively. According to the puzzle it should return 80 primes. This is where we hit problem number #1. The 79 needs to be a -79. After switching around some `u64`'s with `i64`'s, 80 seems to be the correct number of primes:

```rust
fn max_primes(a: i64, b: i64) -> u64 {
    let mut n: i64 = 0;
    let mut count = 0;
    loop {
        let sum = n.pow(2) + (a * n) + b;

        if is_prime(sum as u64) {
            count += 1;
        } else {
            break count;
        }
        n += 1;
    }
}

#[test]
fn test_max_primes() {
    assert_eq!(max_primes(1, 41), 40);
    assert_eq!(max_primes(-79, 1601), 80);
}
```

Next up, the puzzle wants to know for which `a` or `b` value it returns the highest group of primes. Assuming _both_ `a` or `b` can be negative, I have to loop from -1000 till a 1000 for `b` and -999 till 999 for `a`? This is an assumption, and I might be wrong but let's try it out:

```rust
fn problem_27() -> i64 {
    let mut max = 0;
    let mut max_product = (0, 0);
    let pos_neg = [(1, 1), (-1, 1), (1, -1), (-1, -1)];

    for a in 1..1000 {
        for b in 1..=1000 {
            for (p1, p2) in &pos_neg {
                let current_max = max_primes(a * p1, b * p2);
                if current_max > max {
                    max = current_max;
                    max_product = (a, b);
                }
            }
        }
    }

    max_product.0 * max_product.1
}
```

The first problem, is that this code will run forever and ever. I'm kind of curious why it is this slow. Let's reduce 1000 to a 100 and print out the values of `a` and `b` while we're doing this. The first case I have, where the code seems to run forever, is: `1, -59`. Upon further investigation, it seems that casting -59 from an `i64` to a `u64` turns -59 into `18446744073709551557`, which is quite a high number to check. I believe I should use `abs()` on the result of `sum` in `max_primes()` to fix that little issue. After making that change, I get a result:

```rust
fn problem_27() -> i64 {
    let mut max = 0;
    let mut max_product = (0, 0);
    let pos_neg = [(1, 1), (-1, 1), (1, -1), (-1, -1)];

    for a in 1..1000 {
        for b in 1..=1000 {
            for (p1, p2) in &pos_neg {
                let current_max = max_primes(a * p1, b * p2);
                if current_max > max {
                    max = current_max;
                    max_product = (a, b);
                }
            }
        }
    }

    max_product.0 * max_product.1
}

#[test]
fn test_problem_27() {
    assert_eq!(problem_27(), 59231);
}
```

Upon checking the answer, I almost got it correct, but I missed something tiny, namely to turn the factors into their negative values for `max_product`. After applying that change, it does give back the actual correct answer of -59231:

```rust
fn problem_27() -> i64 {
    let mut max = 0;
    let mut max_product = 0;
    let pos_neg = [(1, 1), (-1, 1), (1, -1), (-1, -1)];

    for a in 1..1000 {
        for b in 1..=1000 {
            for (p1, p2) in &pos_neg {
                let current_max = max_primes(a * p1, b * p2);

                if current_max > max {
                    max = current_max;
                    max_product = (a * p1) * (b * p2);
                }
            }
        }
    }

    max_product
}

#[test]
fn test_problem_27() {
    assert_eq!(problem_27(), -59231);
}
```