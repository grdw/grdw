---
layout: post
title: "Project Euler #34: Digit factorials"
euler: 34
complexity: 1
---

{% include euler.html %}

**Introduction**
Find the sum of all numbers which are equal to the sum of the factorial of their digits. You can skip 1 and 2, because they aren't sums.

**Part 1: factorial**
Because Rust doesn't have a factorial method we have to implement our own. Luckily this is fairly easy:

```rust
fn fact(mut i: u128) -> u128 {
    let mut total = 1;
    while i > 1 {
        total *= i;
        i -= 1;
    }
    total
}

#[test]
fn test_fact() {
    assert_eq!(fact(6), 720);
    assert_eq!(fact(16), 20922789888000);
}
```

**Part 2: Recycling int_to_vec()**
It's time to use `int_to_vec()` again from ["Power digit sum"](/2021/10/26/project-euler-16-power-digit-sum.html) and sum the factorials of the individual digits. My first attempt looks like this:

```rust
fn problem_34() -> u128 {
    let mut start = 3;

    loop {
        let digits = start.to_vec();
        let sum: u128 = digits.iter().map(|n| fact(*n)).sum();

        if sum == start {
            println!("{:?}", start);
        }

        start += 1;
    }

    0
}

#[test]
fn test_problem_34() {
    assert_eq!(problem_34(), 1);
}
```
However, it prints out 2 numbers (145 and 40585) and then it freezes. When do I stop? I don't believe the answer is 40585 + 145 = 40730 or is it?

**Part 3: When to stop the loop?**
We know that numbers can be formed from the digits 0-9. All their individual factorials are as follows:

```
0! = 1
1! = 1
2! = 2
3! = 6
4! = 24
5! = 120
6! = 720
7! = 5040
8! = 40320
9! = 362880
```

We can choose an infinite amount of each digit to form a number. Out of curiosity I checked the answer, and it is in fact 40730. However, this doesn't fully answer my question yet on why 40585 is the second and _only_ other number that fits this rule. Isn't there some number, beyond large, that will fit this description? Let's reason my way out of this one:

Let's start of with the lowest number 3 (which is 3! = 6) which isn't actually much of a sum. I believe the first value that fits the rule of being a sum is the number 10 (it becoming 1! + 0! = 2). To make that 2 turn into a 3 we need to write 12, 21 or 20.

I always require >1 digit to make a number of a single digit. The only exception is 3. I can't really see a working pattern here because my math skills are too poor to figure this out.

For now I'll loop until 40585, knowing that there is a smarter way of approaching this.

{% include euler_complexity.html %}