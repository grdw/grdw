---
layout: post
title: "Project Euler #5: Smallest multiple"
problem_type: euler
problem: 5
complexity: 1
---



What is the smallest positive number that is evenly divisible by all of the numbers from 1 to 20?

The lazy and expensive way of doing this is:

```rust
fn problem_5() -> u64 {
    let mut start = 20;
    loop {
        if (1..=20).all(|x| start % x == 0) {
            break start
        }
        start += 1
    }
}

#[test]
fn test_problem_5() {
    assert_eq!(problem_5(), 0);
}
```

Voila! The answer is 232792560.

But a smarter way is increasing `start` by 20 each time, making the whole process 20 times faster.


