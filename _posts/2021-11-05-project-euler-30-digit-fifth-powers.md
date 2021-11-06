---
layout: post
title: "Project Euler #30: Digit fifth powers"
euler: 30
complexity: 1
---

{% include euler.html %}

**Introduction**
The puzzle states that there are only three numbers that can be written as their sum of fourth power digits. 1^4 is not included; so start from 2.

Find the sum of all the numbers that can be written as the sum of fifth powers of their digits.

The first thing I always try to do is proof the first statement with some code:

```rust
fn power_digits(num: u8) -> Vec<u64> {
    vec![]
}

#[test]
fn test_power_digits() {
    assert_eq!(power_digits(4), vec![1634, 8208, 9474]);
}
```

The first questions I have is: does the fact that the numbers are of length 4 trivial or not? Can I lazily assume that for the powers of 5, these numbers are only going to be 5 digits long? Let's assume that the boundaries are between 2 and 9999 for a fourth power number. If I use `int_to_vec()` from ["Power digit sum"](/2021/10/26/project-euler-16-power-digit-sum.html) I come up with this proof:

```rust
fn problem_30() -> Vec<u128>{
    let mut matches = vec![];

    for n in 2..=9999 {
        let result: u128 = n.to_vec()
            .iter()
            .map(|d| (*d as u128).pow(4))
            .fold(0, |dp, acc| acc + dp);

        if n == result {
            matches.push(n);
        }
    }

    matches
}

#[test]
fn test_power_digits() {
    assert_eq!(problem_30(), vec![1634, 8208, 9474]);
}
```

This is correct! So step 1 is complete. To stay in line with the exercise, I'll sum the matches array at the end to get 19316. If we were to do the same trick for 2 till 99.999 and use the powers of 5 this is what happens:

```rust
fn problem_30() -> u128 {
    let mut matches = vec![];
    for n in 2..=99999 {
        let result: u128 = n.to_vec()
            .iter()
            .map(|d| (*d as u128).pow(5))
            .fold(0, |dp, acc| acc + dp);

        if n == result {
            matches.push(n);
        }
    }
    matches.iter().fold(0, |p, acc| *acc + p)
}

#[test]
fn test_power_digits() {
    assert_eq!(problem_30(), 248860);
}
```

I get the answer 248860 which seems to be incorrect. The right answer is 443839. If I amp up the range from 99.999 to 999.999, I do get the correct answer. It seems like there's a number with 6 digits (or multiple), that if the power of 5 is taken of those digits, it results in the same number.

**Improvements on the answer**
I believe this can be done a bit smarter. Upon inspecting the numbers, it seems like 4151 is a number for which the 5th power "rule" holds true. However, that means 1145 should also return 4151, which is much earlier in the cycle. Another example, 4150, already returns true for (0)145. In fact, we'd only have to move up till 147999 (which is 194979), to return all the possible variations.

```
First | Fifth power number
145     4150
1145    4151
3489    93084
22779   92727
44578   54748
147999  194979
```

However I'm not entirely sure how to make this smarter, without giving myself a really painful headache.

{% include euler_complexity.html %}
