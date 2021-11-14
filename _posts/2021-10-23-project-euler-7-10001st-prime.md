---
layout: post
title: "Project Euler #7: 10001st prime"
problem_type: euler
problem: 7
complexity: 1
---
Taking the `is_prime()` function from the ["Largest prime factor"](/2021/10/23/project-euler-3-largest-prime-factor.html), we can solve this relatively easily:

```rust
fn problem_7() -> u64 {
    let mut start = 1;
    let mut index = 0;

    loop {
        start += 1;

        if is_prime(start) {
            index += 1
        }

        if index == 10001 {
            break start
        }
    }
}

#[test]
fn test_problem_7() {
    assert_eq!(problem_7(), 104743);
}
```