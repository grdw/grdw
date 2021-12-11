---
layout: post
title: "Project Euler #55: Lychrel numbers"
problem_type: euler
problem: 55
complexity: 1
---

### Introduction
"How many Lychrel numbers are there below ten-thousand?"

### Is a number a Lychrel number?
The puzzle states that we can take a max of 50 cycles before stopping to check if a number is a Lychrel number or not. My initial setup therefore will look like this:

```rust
fn is_lychrel(n: u32) -> bool {
    let mut cycles = 50;
    while cycles > 0 {
        cycles -= 1
    }
    false
}

fn problem_55() -> usize {
    (1..10_000).filter(|&n| is_lychrel(n)).count()
}

#[test]
fn test_problem_55() {
    assert_eq!(problem_55(), 1)
}
```

The next step is to write a method to test if a number is a Lychrel number or not. The two examples I'm given in the code are 196, for a false case, and 349 and 47 for positive cases. To play it safe - because I have the sneaking suspicion some of these numbers are going to exceed the max of a u128 - I'm going to cast all numbers to vectors, by reusing the `to_digits()` method from ["Permuted multiples"](/2021/11/21/project-euler-52-permuted-multiples.html).

The next step is to simply reverse the vector from `to_digits()` and sum it to the other vector by reusing `sum_vec()` from many a previous Euler puzzle. The `is_lychrel` method will start to look like this:

```rust
fn is_lychrel(n: u32) -> bool {
    let mut cycles = 50;
    let mut digits = to_digits(n);
    let mut is_lychrel = true;

    while cycles > 0 {
        let mut digits_rev = digits.clone();
        digits_rev.reverse();
        digits.sum_vec(&digits_rev);
        // if digits are a palindrome, set is_lychrel
        // to false and break

        cycles -= 1
    }
    is_lychrel
}
```

To test if the vector is a palindrome I'll reuse the method from ["Largest palindrome product"](/2021/10/23/project-euler-4-largest-palindrome-product.html) and tweak it slightly to be able to take a vector instead of a string.

After some fiddling, the answer I get is 249 Lychrel numbers, which is the correct answer. No optimization is needed, as it resolves in 0.08s.
