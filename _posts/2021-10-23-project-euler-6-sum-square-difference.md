---
layout: post
title: "Project Euler #6: Sum square difference"
problem_type: euler
problem: 6
complexity: 1
---

{% include euler.html %}

This article features only an answer, because I've started writing from [problem 14](/2021/10/25/project-euler-14-longest-collatz-sequence.html).

```rust
fn problem_6() -> u128 {
    let mut sum: u128 = 0;
    let mut n_sum: u128 = 0;
    for n in 1..100 {
        sum += (n as u128).pow(2);
        n_sum += n;
    }
    n_sum.pow(2) - sum
}

#[test]
fn test_problem_6() {
    assert_eq!(problem_6(), 24174150);
}
```

{% include complexity.html %}
