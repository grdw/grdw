---
layout: post
title: "Project Euler #39: Integer right triangles"
problem_type: euler
problem: 39
complexity: 1
---



**Introduction**
The problem description starts out with describing a "right-angle triangle" (meaning Pythagoras will come into play) and how there are three solutions where the perimeter (p) = 120. For which solution p ≤ 1000 do we get the maximum amount of solutions.

Pythagoras states that in a "right-angle triangle" `a^2 + b^2 = c^2`, where `c` is the diagonal side of the triangle. The perimeter is `a + b + c`. Firstly, I'll write a method trying to determine `c` from two digits:

```rust
fn calculate_c(a: u64, b: u64) -> u64 {
    let c = (a.pow(2) + b.pow(2)) as f64;

    c.sqrt() as u64
}

#[test]
fn test_pythagoras() {
    assert_eq!(calculate_c(30, 40), 50);
    assert_eq!(calculate_c(1, 120), 120);
}
```

We can already see that in this situation, 120 and 1 will give a `c` of 120, meaning that the perimeter is 141. Going forward with this problem, I'm going to assume that `a`, `b` and `c` are all > 1. The highest possible value of `a` (or `b` or `c`) is 998, implying that `b` and `c` are both 1, however that's impossible as we already showed above. However, for brute forcing purposes we'll keep it like this, and we'll clean it up later.

**Bug found!**
While trying to find the solution, I found a bug in my Pythagoras `calculate_c` method, namely because of the type casting. It could so happen that a number comes remarkably close, but it still fits because of the typecasting (which means nothing more than slicing off the decimals). An example here is 499 and 2, and also 120 and 1. These numbers don't fit the description of being an actual Pythagorean triplet, and we should return a `None` for those. Only whole numbers fit the description.

```rust
fn calculate_c(a: u64, b: u64) -> Option<u64> {
    let c = (a.pow(2) + b.pow(2)) as f64;
    let sqrt = c.sqrt();

    if sqrt.fract() == 0.0 {
        Some(sqrt as u64)
    } else {
        None
    }
}

#[test]
fn test_pythagoras() {
    assert_eq!(calculate_c(30, 40), Some(50));
    assert_eq!(calculate_c(499, 2), None);
    assert_eq!(calculate_c(1, 120), None);
}
```

Just to prove the original problem statement for a perimeter of 120, I wrote the following:

```rust
fn problem_39() -> u64 {
    let max: u64 = 1000;
    let max_r: u64 = 1000 - 2;
    let mut fits = vec![vec![]; (max + 1) as usize];

    for a in 1..=max_r {
        for b in a..=max_r {
            if let Some(c) = calculate_c(a, b) {
                let p = a + b + c;

                if p <= max {
                    fits[p as usize].push([a, b, c]);
                }
            }
        }
    }

    println!("{:?}", fits[120]);
    0
}
```

This code prints out: `[[20, 48, 52], [24, 45, 51], [30, 40, 50]]`, which is correct. The actual triplets aren't interesting to the problem, just the amount of triplets, so after some more fiddling I came up with this giant method:

```rust
fn problem_39() -> u64 {
    let max: u64 = 1000;
    let max_r: u64 = max - 2;
    let mut triplets = vec![0; (max + 1) as usize];
    let mut max_index = 0;
    let mut max_f = 0;

    for a in 1..=max_r {
        for b in a..=max_r {
            if let Some(c) = calculate_c(a, b) {
                let p = a + b + c;

                if p <= max {
                    triplets[p as usize] += 1;
                }
            }
        }
    }

    for (i, f) in triplets.iter().enumerate() {
        if *f > max_f {
            max_f = *f;
            max_index = i;
        }
    }

    max_index as u64
}

#[test]
fn test_problem_39() {
    assert_eq!(problem_39(), 840);
}
```

My answer is: a triangle with a perimeter of 840 has the most Pythagorean triplets. According to the answer sheet, that is correct.


