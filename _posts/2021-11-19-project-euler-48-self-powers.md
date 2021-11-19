---
layout: post
title: "Project Euler #48: Self powers"
problem_type: euler
problem: 48
complexity: 2
---

**Introduction**

"The series, 1^1 + 2^2 + 3^3 + ... + 10^10 = 10405071317.

Find the last ten digits of the series, 1^1 + 2^2 + 3^3 + ... + 1000^1000."

Right out the gate, we have a problem. If we were to solve this by code, in Rust, we'll be hit by the limit of an u128-bit integer pretty quickly. Namely, 26^26 is the upper bound of this method. In Ruby, there would be no concern whatsoever. In fact, I can get the answer pretty quickly by doing:

```ruby
(1..1000).map{|n| n**n }.sum

# Reading off the last 10 digits: 9110846700
```

Solved!

However, in Rust we have to do something a bit more clever.

**int_to_vec() and 10 digits**
In the past, to fit huge numbers I used `int_to_vec()` and I think we're going with the same approach here. The last time I used these methods was for the ["1000-digit Fibonacci number"](/2021/10/31/project-euler-25-1000-digit-fibonacci-number.html) problem. The first issue we have is, that within this trait we only made a method called `sum_vec()` and `multiply_vec()`, but no `power_vec()`. Before I'm going to implement `power_vec()`, I am aware of the 10 digits limitation. We need to train our methods to only take vectors of max length 11, the rest of the remainders don't matter.

**Adjusting multiply_vec()**
A reminder: `multiply_vec()` currently works something like this:

```
167 x 781

700 x 100 = 70000
700 x 60  = 42000
700 x 7   =  4900
80  x 100 =  8000
80  x 60  =  4800
80  x 7   =   560
1   x 100 =   100
1   x 60  =    60
1   x 7   =     7
----------------- +
           130427
```

However, for numbers >10 digits it should only do this up till 11 digits (including the only useful remainder). In specs this goes something like:

```rust
#[test]
fn test_vector_methods() {
    let mut n = 9_000_000_000_000.to_vec();
    n.multiply_vec(&9_000_000.to_vec());

    assert_eq!(n.len(), 11);
    assert_eq!(n, vec![0; 11]);
}
```

This would generate 11 0's.

**Writing power_vec()**
Writing `power_vec()` is fairly straight forward, it's basically multiplying with yourself n-times.

```rust
// Extend trait with 'power_vec'
impl VecEx<u8> for Vec<u8> {
  // ...
  fn power_vec(&mut self, power: u16) {
      let t = self.clone();
      for _ in 0..power {
          self.multiply_vec(&t)
      }
  }
}

#[test]
fn test_power_vec() {
    let mut t = 1000.to_vec();
    t.power_vec(1000);

    assert_eq!(t.len(), 11);
    assert_eq!(t, vec![0; 11]);
}
```

**Resolving problem_48**
To resolve this problem, the code will look something like this:

```rust
fn problem_48() -> u64 {
    let mut start: u128 = 0;
    let mut total = vec![];

    while start < 1000 {
        start += 1;

        let mut subtotal = start.to_vec();
        subtotal.power_vec(start as u16);
        total.sum_vec(&subtotal);
    }

    total.truncate(10);

    total
        .iter()
        .enumerate()
        .fold(0, |acc, (i, t)| acc + 10_u64.pow(i as u32) * *t as u64)
}

#[test]
fn test_problem_48() {
    assert_eq!(problem_48(), 9110846700);
}
```

Solved ... in 19.15 seconds. I'll come back to optimize it later.
