---
layout: post
title: "Project Euler #20: Factorial digit sum"
euler: 20
complexity: 1
---

{% include euler.html %}

**Introduction**
Find the sum of the digits in the number 100!.

This puzzle feels very similar to ["Power digit sum"](/2021/10/26/project-euler-16-power-digit-sum.html) and I'm pretty sure I can reuse `int_to_vec` and the trait I made for `Vec<u8>`, to resolve this problem as well.

```rust
fn problem_20(factor: u128) -> u64 {
    let mut start = vec![1];
    for n in 2..=factor {
        let result = int_to_vec(n);
        start.multiply(result)
    }
    start.iter().map(|&u| u as u64).sum()
}
```

Putting in 10 as an argument to `problem_20` I receive 27. For 100 I receive: 648 which is the correct answer. Because this felt too easy; to make it a bit more interesting, I would love it if we could call `to_vec()` directly on a u128 integer (or maybe any other u2^N integer). Also I would think it would be nice if I can do `start * result` instead of `start.multiply(result)`. Similarly for adding vectors to other vectors, I would love to be able to do `start + result`.

**int_to_vec() as a Trait**
Turning `int_to_vec()` into a `trait` is very simple. You define a `trait` and implement it on the primitive type `u128`. I'm not quite sure how to implement on the other primitives `u64` and `u32`, but a quick Google search suggests that I need to use `macro_rules!` for this, which doesn't look too great.

```rust
pub trait ToVector {
    fn to_vec(&self) -> Vec<u8>;
}

impl ToVector for u128 {
    fn to_vec(&self) -> Vec<u8> {
        let mut number = *self;
        let mut result = vec![];
        let mut tens: u128 = 10;

        while number > 0 {
            let base = number % tens;
            result.push((base / (tens / 10)) as u8);

            tens *= 10;
            number -= base;
        }
        result
    }
}
```

**Operation overloading for Vec\<u8\>**
There is a whole chapter in the Rust book dedicated to operation overloading [1], so going from there this should be relatively straight forward. First up I need to import `std::ops`. According to the rust-lang docs there are quite some traits to implement [2]. Considering that what I'm doing is destructive on the vector I believe we should implement `AddAssign` (`+=`) and `MulAssign` (`*=`). However, we're running into a little bit of a problem when doing this ...:

```rust
use std::ops;

impl ops::AddAssign<Vec<u8>> for Vec<u8> {
  /* ... */
}
```
... namely, that this is not allowed. Rust only allows you to do this once `Vec` is a struct that's known within the current crate. I believe this is a dead end, unless we create a new struct, which seems like a little too much work for what we're trying to achieve here.

**Sources**
\[1\] [https://doc.rust-lang.org/rust-by-example/trait/ops.html](https://doc.rust-lang.org/rust-by-example/trait/ops.html)

\[2\] [https://doc.rust-lang.org/core/ops/](https://doc.rust-lang.org/core/ops/)

{% include euler_complexity.html %}
