---
layout: post
title: "Project Euler #56: Powerful digit sum"
problem_type: euler
problem: 56
complexity: 1
---

### Introduction
"Considering natural numbers of the form, a<sup>b</sup>, where a, b < 100, what is the maximum digital sum?"

### Part 1: sum_vec(), mul_vec() and to_digits()
I'll be reusing the code originally started in ["Power digit sum"](/2021/10/26/project-euler-16-power-digit-sum.html) to form the base of this puzzle. The next part is to take the power of a 100 of each digit and check which consecutive iteration of each vector contains the most digits (so: multiply by the same vector each time).

```rust
fn max_power_digit_sum(digit: u128) -> u64 {
    let mul_digits = digit.to_digits();
    let mut digits = digit.to_digits();
    let mut max = 0;

    for _ in 2..=100 {
        digits.mul_vec(&mul_digits);

        let sum = digits.iter().fold(0, |acc, &n| acc + n as u64);

        if sum > max {
            max = sum;
        }
    }

    max
}

#[test]
fn test_max_power_digit_sum() {
    assert_eq!(max_power_digit_sum(10), 1);
    assert_eq!(max_power_digit_sum(99), 972);
}
```

### Part 2: Resolving problem 56
To resolve problem 56 do the following:

```rust
fn problem_56() -> u64 {
    let mut max = 0;
    let mut a = 99;

    while a > 2 {
        let pds = max_power_digit_sum(a);
        if pds > max {
            max = pds
        }
        a -= 1;
    }

    max
}

#[test]
fn test_problem_56() {
    assert_eq!(problem_56(), 972);
}
```

The code is not fast, but it results in the right answer. It resolves in 9.16s.
