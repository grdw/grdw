---
layout: post
title: "Project Euler #4: Largest palindrome product"
euler: 4
complexity: 1
---

{% include euler.html %}

This little puzzle asks to find the largest palindrome product of two 3-digit numbers. All the 3-digit numbers range from 100 to 999 and the result should be a palindrome. This is fairly easy:

```rust
fn is_palindrome(x: u32) -> bool {
    let string = x.to_string();
    let len = string.len() - 1;
    let end = string.len() / 2;

    string[0..end]
        .chars()
        .enumerate()
        .all(|(i,n)| n == string.chars().nth(len - i).unwrap())
}

#[test]
fn is_palindrome_test() {
    assert_eq!(is_palindrome(1), true);
    assert_eq!(is_palindrome(12), false);
    assert_eq!(is_palindrome(11), true);
    assert_eq!(is_palindrome(101), true);
    assert_eq!(is_palindrome(1001), true);
    assert_eq!(is_palindrome(10101), true);
}

fn problem_4() -> u32 {
    let mut max = 0;
    for i in 100..=999 {
        for j in 100..=999 {
            let product = i * j;
            if product > max && is_palindrome(product) {
                max = product;
            }
        }
    }
    max
}

#[test]
fn test_problem_4() {
    assert_eq!(problem_4(), 906609)
}
```

Voila! The answer is 906609.

{% include euler_complexity.html %}
