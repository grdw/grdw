---
layout: post
title: "Project Euler #30: Digit fifth powers"
problem_type: euler
problem: 30
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

---

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

My first improved method consists of three parts. The first part is to turn a number like 145 into (1 of 1, 1 of 4, 1 of 5):

```rust
fn reverse_number_system(num: u128) -> Vec<u32> {
    let l = num.to_vec();
    let mut result = vec![0;9];

    for n in &l {
        if *n == 0 { continue }

        result[*n as usize - 1] += 1
    }

    result
}

#[test]
fn test_reverse_number_system() {
    assert_eq!(
        reverse_number_system(16650),
        vec![1, 0, 0, 0, 1, 2, 0, 0, 0]
    );
    assert_eq!(
        reverse_number_system(194979),
        vec![1, 0, 0, 1, 0, 0, 1, 0, 3]
    );
}
```

The next step is to be able to take such a vector and return the 5th power sum of those numbers:

```rust
fn fifth_power_sum(nums: &Vec<u32>) -> u32 {
    nums
        .iter()
        .enumerate()
        .map(|(i, b)| (i as u32 + 1).pow(5) * b)
        .sum()
}

#[test]
fn test_fifth_power_sum() {
    assert_eq!(fifth_power_sum(&vec![1, 0, 0, 1, 5, 0, 0, 0, 0]), 16650);
    assert_eq!(fifth_power_sum(&vec![1, 0, 0, 1, 1, 0, 0, 0, 0]), 4150);
    assert_eq!(fifth_power_sum(&vec![2, 0, 0, 1, 1, 0, 0, 0, 0]), 4151);
    assert_eq!(fifth_power_sum(&vec![0, 0, 1, 1, 0, 0, 0, 1, 1]), 93084);
    assert_eq!(fifth_power_sum(&vec![0, 2, 0, 0, 0, 0, 2, 0, 1]), 92727);
    assert_eq!(fifth_power_sum(&vec![1, 0, 0, 1, 0, 0, 1, 0, 3]), 194979);
}
```

The next trick is to make a "permutation with repetition" loop. My idea here is to do it like a combination lock, you take a vector at start value `vec![0;9]` and add to the first 0 in that vector, once it reaches the highest number, in our case 3, reset to 0 and shift to the next value in the array. Like this:

```
0 0 0
1 0 0
2 0 0
3 0 0 RESET TO 0 0 0
0 1 0 MOVE INDEX BACK TO 0, BECAUSE 1 > 0
1 1 0
2 1 0
3 1 0 RESET TO 0 1 0
0 2 0 MOVE INDEX BACK TO 0, BECAUSE 2 > 0
1 2 0
2 2 0
3 2 0 ETC.
```

My kind of faulty implementation looks like this:

```rust
fn cycle() {
    let mut start:Vec<u32> = vec![0; 9];
    let mut index: usize = 0;

    while index < start.len() {
        if start[index] > 2 {
            start[index] = 0;
            index += 1;
        } else {
            start[index] += 1;
            if start[index] <= index as u32 {
                index = 0;
            }
            println!("{:?}", start);
        }
    }
}
```

I'm still relatively new to all this, but it almost does the job right. It ends a little too early, namely it ends at `[0, 0, 3, 3, 3, 3, 3, 3, 3]`, while it should end at `[3, 3, 3, 3, 3, 3, 3, 3, 3]`. I'm not entirely sure why it doesn't stop there, but this little cycle loop works for what I'm trying to achieve. If we add in the `fifth_power_sum()` and `reverse_number_system()` methods we get this:

```rust
fn problem_30_improved() -> u32 {
    let mut start:Vec<u32> = vec![0; 9];
    let mut index: usize = 0;
    let mut sum = 0;

    while index < start.len() {
        if start[index] > 2 {
            start[index] = 0;
            index += 1;
        } else {
            start[index] += 1;
            if start[index] <= index as u32 {
                index = 0;
            }

            let t = fifth_power_sum(&start);
            let s = reverse_number_system(t as u128);

            if s == start && t > 1 {
                sum += t
            }
        }
    }

    sum
}

#[test]
fn test_cycle() {
    assert_eq!(problem_30_improved(), 443839);
}
```

The improved version, is a lot faster than the older implementation:

```bash
time cargo test problem_30_brute_force
# test test_problem_30_brute_force ... ok
# test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 3 filtered out; finished in 0.98s

time cargo test problem_30_improved
# test test_problem_30_improved ... ok
# test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 3 filtered out; finished in 0.25s
```

It shaves of 0.74 seconds.

{% include complexity.html %}
