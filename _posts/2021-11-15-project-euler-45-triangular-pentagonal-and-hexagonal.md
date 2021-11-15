---
layout: post
title: "Project Euler #45: Triangular, pentagonal, and hexagonal"
problem_type: euler
problem: 45
complexity: 1
---

**Introduction**
Here we go: in this puzzle, we're combining ["Coded triangular numbers"](/2021/11/13/project-euler-42-coded-triangle-numbers.html) and ["Pentagon numbers"](/2021/11/14/project-euler-44-pentagon-numbers.html) with something called hexagonal numbers. A hexagonal number can be made with the following formula: n(2n - 1). The puzzle states:

"It can be verified that T285 = P165 = H143 = 40755.

Find the next triangle number that is also pentagonal and hexagonal."

**Setup**
The first thing I'll be doing is using `is_triangular()` from ["Coded triangular numbers"](/2021/11/13/project-euler-42-coded-triangle-numbers.html) and `is_pentagonal()` from ["Pentagon numbers"](/2021/11/14/project-euler-44-pentagon-numbers.html). The next method I need is an `is_hexagonal()` method, which is something I can take from Wikipedia [1].

```rust
fn is_hexagonal(i: u64) -> bool {
    let h = ((((8 * i) + 1) as f64).sqrt() + 1.0) / 4.0;

    h.fract() == 0.0
}

#[test]
fn test_is_hexagonal() {
    assert_eq!(is_hexagonal(6), true);
    assert_eq!(is_hexagonal(2), false);
}
```

**Solution**
The solution can be found like such:

```rust
fn problem_45() -> u64 {
    let mut n: u64 = 40755;
    loop {
        n += 1;

        if is_triangular(n) && is_pentagonal(n) && is_hexagonal(n) {
            break n
        }
    }
}

#[test]
fn test_problem_45() {
    assert_eq!(problem_45(), 1533776805);
}
```

**Improvement**
Obviously, the code is slow. It takes ~27 seconds before it is finished, and I can do something clever to speed it up. Instead of moving `n` forward by 1, `n` can go forward hexagonally (if that's a word), as that's the method that will cause the biggest increase:

```rust
fn problem_45() -> u64 {
    let mut n: u64 = 143;
    loop {
        n += 1;

        let m = n * ((2 * n) - 1);

        if is_triangular(m) && is_pentagonal(m) {
            break m
        }
    }
}

#[test]
fn test_problem_45() {
    assert_eq!(problem_45(), 1533776805);
}
```

Voilà! It finished in 0.10s. Alongside that, this saves the need for an `is_hexagonal()` method.

**Sources**

\[1\] [Hexagonal number](https://en.wikipedia.org/wiki/Hexagonal_number)
