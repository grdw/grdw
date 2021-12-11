---
layout: post
title: "Project Euler #34: Digit factorials"
problem_type: euler
problem: 34
complexity: 1
---

### Introduction
Find the sum of all numbers which are equal to the sum of the factorial of their digits. You can skip 1 and 2, because they aren't sums.

### Part 1: factorial
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

### Part 2: Recycling int_to_vec()
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

### Part 3: When to stop the loop?
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

It will always require >1 digit to make a number of a single digit. The only exception is 3 (which is not a sum). The upper bound I imagined would be 9.999.999 considering the sum length (2.540.160) is the same as the amount of digits. When doing 9! * 8 or 99.999.999, the length of its sum is lower than 8, and it will therefor never be able to match. However, letting the loop go till that far knowing it won't do much for the better part of the program, is a bit silly.

For now I'll loop until 40585, knowing that there is a smarter way of approaching this.

---

### The upper bound
The clear mystery to this Euler puzzle is the upper bound. What is the upper bound? I've looked online at other answers and I see a lot of people simply using 9!7 (2.540.160) as the upper bound, but I fail to see why that's a reasonable upper bound. The reason why I'm questioning this, is because 2.540.160 is going to be turned into factorials again, which will result in 869. It just so happens to be that 145 and 40585 are lower than 9!7. My initial understanding is that 9.999.999 is the upper bound, because the length of digits (7) will not exceed the length of the _sum_ of its factorials. Perhaps a more "reasonable upper bound" is the _first number_ where the sum of its factorials and the initial number both equal to the length of 7 digits? By taking a calculator, the first number for which this is true is: 1.000.999. 9!3 is equal to 1.088.640 and the rest are all 1's. It's not bullet proof, but it does feel like a more reasonable approach?
