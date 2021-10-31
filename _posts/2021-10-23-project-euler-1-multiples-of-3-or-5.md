---
layout: post
title: "Project Euler #1: Multiples of 3 or 5"
euler: 1
complexity: 1
---

{% include euler.html %}

This article features only an answer, because I've started writing from [problem 14](/2021/10/25/project-euler-14-longest-collatz-sequence.html).

```rust
fn multiples_of_3_and_5(n: i32) -> i32 {
    let mut total: i32 = 0;
    for i in 0..n {
        if i % 3 == 0 || i % 5 == 0  {
            total += i
        }
    };
    total
}

#[test]
fn find_multiples_of_3_and_5() {
    assert_eq!(multiples_of_3_and_5(10), 23);
    assert_eq!(multiples_of_3_and_5(1000), 233168);
}
```

{% include euler_complexity.html %}
