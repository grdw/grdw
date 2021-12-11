---
layout: post
title: "Project Euler #52: Permuted multiples"
problem_type: euler
problem: 52
complexity: 1
---

### Introduction
"It can be seen that the number, 125874, and its double, 251748, contain exactly the same digits, but in a different order.

Find the smallest positive integer, x, such that 2x, 3x, 4x, 5x, and 6x, contain the same digits."

### Solution
I'll reuse the `unique_digits` method from the [previous Euler puzzle](/2021/11/21/project-euler-51-prime-digit-replacements.html) and slightly alter it to be more in line with `int_to_vec()` of ["Power digit sum"](/2021/10/26/project-euler-16-power-digit-sum.html). The next thing I did was to sort the digits that come out in the end.

To resolve problem 52:

```rust
fn problem_52() -> u64 {
    let mut x = 1;

    loop {
        let dx = to_digits(x);

        if (2..=6).all(|m| to_digits(x * m) == dx) {
            break x
        }

        x += 1
    }
}

#[test]
fn test_problem_52() {
    assert_eq!(problem_52(), 142857);
}
```

Solved! This one was too easy.
