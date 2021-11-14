---
layout: post
title: "Project Euler #37: Truncatable primes"
problem_type: euler
problem: 37
complexity: 1
---

{% include euler.html %}

**Introduction**
"Find the sum of the only eleven primes that are both truncatable from left to right and right to left."

**Solution**
I've already solved this Euler puzzle some time ago, and the code I used is in the GitHub link below. The answer is 748317. The meat and bones of this puzzle is in determining if a prime number is truncatable or not:

```rust
fn is_truncatable_prime(number: i64) -> bool {
    if !is_prime(number) || number < 10 {
        return false;
    }

    let mut truncatable = true;
    let n = number.to_string();

    for i in 0..n.len() {
        let r_slice: i64 = n[0..i+1].parse().unwrap_or(-1);
        let l_slice: i64 = n[i..n.len()].parse().unwrap_or(-1);

        if !is_prime(r_slice) || !is_prime(l_slice) {
            truncatable = false;
            break;
        }
    }

    truncatable
}

#[test]
fn is_truncatable_test() {
    assert_eq!(is_truncatable_prime(4), false);
    assert_eq!(is_truncatable_prime(2), false);
    assert_eq!(is_truncatable_prime(3), false);
    assert_eq!(is_truncatable_prime(5), false);
    assert_eq!(is_truncatable_prime(7), false);
    assert_eq!(is_truncatable_prime(11), false);
    assert_eq!(is_truncatable_prime(233), false);
    assert_eq!(is_truncatable_prime(4733), false);
    assert_eq!(is_truncatable_prime(3797), true);
}
```

The idea is to take a number, turn it into a `String` and create string slices left and right and check if one or the other isn't a prime. This is logically similar to checking if both are prime. If a number is found which isn't prime, `truncatable` equals to false and the method returns. If all of them remain prime while slicing down, like in the case of 3797, the method returns true. To resolve the actual puzzle, make an infinite loop and pause once you've found all the 11 truncatable primes.

---

**Improvements**
There's a small improvement on `is_truncatable_prime()`, namely to use `.all()` to reduce some code:

```rust
fn is_truncatable_prime(number: i64) -> bool {
    if !is_prime(number) || number < 10 {
        return false;
    }

    let n = number.to_string();

    (0..n.len()).all(|i| {
        let r_slice: i64 = n[0..i+1].parse().unwrap_or(-1);
        let l_slice: i64 = n[i..n.len()].parse().unwrap_or(-1);

        is_prime(r_slice) && is_prime(l_slice)
    })
}
```

{% include euler_complexity.html %}
