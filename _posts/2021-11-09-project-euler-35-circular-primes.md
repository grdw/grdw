---
layout: post
title: "Project Euler #35: Circular primes"
euler: 35
complexity: 1
---

{% include euler.html %}

**Introduction**
"How many circular primes are there below one million?"

The first step in solving this puzzle, is to steal `is_prime` from many a previous Euler exercise. The next step is to write a method to test if a prime number is also a rotary prime number, my first iteration goes something like this:

```rust
fn rotary(number: u64) -> bool {
    let mut chars = number.to_string().chars().collect::<Vec<char>>();

    (0..chars.len()).all(|_| {
        chars.rotate_left(1);

        let rotated: u64 = chars
            .iter()
            .collect::<String>()
            .parse()
            .unwrap();

        is_prime(rotated)
    })
}

#[test]
fn test_rotary() {
    assert_eq!(rotary(1970), false);
    assert_eq!(rotary(197), true);
    assert_eq!(rotary(19), false);
    assert_eq!(rotary(2), true);
}
```

To solve the actual puzzle:

```rust
fn problem_35() -> usize {
    (1..=1_000_000)
        .filter(|n| is_prime(*n) && rotary(*n))
        .collect::<Vec<u64>>()
        .len()
}

#[test]
fn test_problem_35() {
    assert_eq!(problem_35(), 55)
}
```

The answer is 55 prime numbers. Easy enough.

{% include euler_complexity.html %}
