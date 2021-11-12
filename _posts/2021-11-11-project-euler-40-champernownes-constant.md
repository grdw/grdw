---
layout: post
title: "Project Euler #40: Champernowne's constant"
euler: 40
complexity: 1
---

{% include euler.html %}

**Introduction**
The puzzle starts by showing us an irrational decimal fraction which looks like this:

```
             |
             V
0.123456789101112131415161718192021...
```

The 12th digit in that decimal fraction is a 1. It took me a little while to figure out the pattern, but it is really simple:

```
0.1 2 3 4 5 6 7 8 9 10 11 12 13 14
```

Find d1 × d10 × d100 × d1000 × d10000 × d100000 × d1000000.

**Champernowne's method**
The first part is to make a method, which returns the Champernowne's constant as a vector:

```rust
fn champernowne(max: u64) -> Vec<u8> {
    let mut s = String::from("");

    for n in 1..=max {
        s.push_str(&n.to_string());
    }

    s.chars()
        .map(|n| n.to_digit(10).unwrap() as u8)
        .collect()
}

#[test]
fn test_champernowne() {
    assert_eq!(champernowne(12), vec![1,2,3,4,5,6,7,8,9,1,0,1,1,1,2]);
}
```

Nothing too complex yet. The next trick is to make a vector of length 1.000.000. This is _not_ the same as `champernowne(1_000_000)`. We need to tweak our method a little, and check if the string `s` becomes over a million in length (or in our case: `max`).

```rust
fn champernowne(max: u64) -> Vec<u8> {
    let mut s = String::from("");

    for n in 1..=max {
        s.push_str(&n.to_string());

        if s.len() >= max as usize {
            break;
        }
    }

    s.chars()
        .map(|n| n.to_digit(10).unwrap() as u8)
        .collect()
}

#[test]
fn test_champernowne() {
    assert_eq!(champernowne(12), vec![1,2,3,4,5,6,7,8,9,1,0,1,1]);
    assert_eq!(champernowne(12).len(), 13);
}
```

The method produces a vector with some extra bits near the end, which is fine for what we're trying to achieve. We do have to take into account that we don't count the leading 0 in our solution, so all the indexes that are mentioned in the problem statement need to be reduced by 1. Being aware of that situation, the solution to `problem_40()` becomes 210.

```rust
fn problem_40() -> u64 {
    let c = champernowne(1_000_000);

    c[0] * c[9] * c[99] * c[999] * c[9999] * c[99_999] * c[999_999]
}

#[test]
fn test_problem_40() {
    assert_eq!(problem_40(), 210);
}
```

{% include euler_complexity.html %}
