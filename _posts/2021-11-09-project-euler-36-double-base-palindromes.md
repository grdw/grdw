---
layout: post
title: "Project Euler #36: Double-base palindromes"
problem_type: euler
problem: 36
complexity: 1
---



**Introduction**
"Find the sum of all numbers, less than one million, which are palindromic in base 10 and base 2."

**Solution**
I've already solved this Euler puzzle some time ago, and this is the code I used:

```rust
fn is_palindrome(string: String) -> bool {
    let len = string.len() - 1;
    let end = string.len() / 2;

    string[0..end]
        .chars()
        .enumerate()
        .all(|(i,n)| n == string.chars().nth(len - i).unwrap())
}

fn sum_palindrome_base2_10(digits: u32) -> u32 {
    let mut sum_pal = 0;
    for i in 0..digits {
        let i_base10 = format!("{}", i);
        let i_base2 = format!("{:b}", i);

        if is_palindrome(i_base10) && is_palindrome(i_base2) {
            sum_pal += i;
        }
    }
    sum_pal
}

#[test]
fn palindrome_numbers_test() {
    assert_eq!(sum_palindrome_base2_10(586), 1055);
    assert_eq!(sum_palindrome_base2_10(1_000_000), 872187);
}
```

Nothing too complicated, I'd say. The only change I made is swapping out the `is_palindrome()` method with the one from ["Largest palindrome product"](/2021/10/23/project-euler-4-largest-palindrome-product.html). Added to that, I made a small little improvement by using `fold()` to sum the matched digits:

```rust
fn sum_palindrome_base2_10(digits: u32) -> u32 {
    (0..digits).fold(0, |acc, i| {
        let i_base10 = format!("{}", i);
        let i_base2 = format!("{:b}", i);

        if is_palindrome(i_base10) && is_palindrome(i_base2) {
            acc + i
        } else {
            acc
        }
    })
}

#[test]
fn palindrome_numbers_test() {
    assert_eq!(sum_palindrome_base2_10(586), 1055);
    assert_eq!(sum_palindrome_base2_10(1_000_000), 872187);
}
```


