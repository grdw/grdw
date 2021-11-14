---
layout: post
title: "Project Euler #26: Reciprocal cycles"
problem_type: euler
problem: 26
complexity: 2
---
**Introduction**
The puzzle explains how fractions divide into decimal numbers. 1/6th equals to 0.166666 and therefor has a repeating cycle of 1-digit for 6. Other fractions, like 1/2 have no repeating cycle. Which denominator (D) below 1000 for the numerator of 1 has the highest recurring cycle?

**Use a float?**
The dumb-dumb in me immediately thinks: can you use a `f64`, cast it to a String and check if there's a pattern? The max number of digits behind the dot on a f64 are 17 digits. To show this:

```rust
let a: f64 = 1.0 / 7.0;
let b = format!("{}", a);
println!("{}", b.len()); // 19 (- 2 for the "0.")
```

I'm curious to see if 17 digits is enough? I'm assuming this is not enough, and I probably need to do something fancy and learn some math surrounding fractions. Or, can I just beef up both 1 and 7 with a lot of zeroes? This will still lead to the same problem of division and the maximum space of 17 digits on a `f64`. Looking on the internet for tools that might help me, I stumbled upon "Simple algorithm for arbitrary precision integer division" [1]. Maybe that might help? It didn't really help... Perhaps if I use integer division, I can figure it out:

```
1 / 3 = ?
10 / 3 = 3 (remainder 1), multiply remainder by 10 and divide again
10 / 3 = 3 (remainder 1), ad infinitum

1 / 8 = ?
10 / 8 = 1 (remainder 2)
20 / 8 = 2 (remainder 4)
40 / 8 = 5 (remainder 0) => 0

1 / 7 = ?
10 / 7 = 1 (remainder 3)
30 / 7 = 4 (remainder 2)
20 / 7 = 2 (remainder 6)
60 / 7 = 8 (remainder 4)
40 / 7 = 5 (remainder 5)
50 / 7 = 7 (remainder 1)
10 / 7 = ... ad infinitum, range of 6
```

This seems to be something worthwhile. A rough version looks like the code below. Noted: this compares remainders instead of the result from the division. I'm keeping the division just in case.

```rust
fn division(n: u128, d: u128) -> u64 {
    let mut div = n * 10 / d;
    let mut m = n * 10 % d;

    if m == 0 {
        return 0;
    }

    let mut range = vec![m];

    loop {
        div = div * 10 / d;
        m = m * 10 % d;

        if m == 0 {
            break 0;
        }

        if range[0] == m {
            break range.len() as u64;
        }

        range.push(m);
    }
}

#[test]
fn test_division() {
    assert_eq!(division(1, 2), 0);
    assert_eq!(division(1, 3), 1);
    assert_eq!(division(1, 4), 0);
    assert_eq!(division(1, 5), 0);
    assert_eq!(division(1, 6), 1);
    assert_eq!(division(1, 7), 6);
    assert_eq!(division(1, 8), 0);
    assert_eq!(division(1, 9), 1);
    assert_eq!(division(1, 10), 0);
}
```

The questions asks which denominator below 1000, gives the highest such cycle:

```rust
fn problem_26() -> u64 {
    let mut resulting_cycle_count = 0;
    for n in 1..1000 {
        let cycle_count = division(1, n);
        if cycle_count > resulting_cycle_count {
            resulting_cycle_count = cycle_count;
        }
    }
    resulting_cycle_count
}
```

Executing this code however results in the program freezing up and for what it seems: take forever and ever. I'm kind of curious for what number it freezes, and after some debugging it seems to be literally one of the next numbers over: 12. Dividing 1 by 12 on paper with the method I described above, we get this:

```
1 / 12
10 / 12 = this doesn't fit.
```

**Rabbit hole #1**
So 10 / 12 equals 0 with a remainder of 10. This actually results in data loss on the integer. To prevent this (and for any future number like 943 f.e.) we need to make the base expand to 1000. However, this comes with a little problem. Let's go back to our example with 3, 8 and 7 and use 1000 as our numerator:

```
1 / 3
1000 / 3 = 333 times, remainder of 1
1000 / 3 = 333 times, remainder of 1 => 1

1 / 8
1000 / 8 = 125 times, remainder of 0

1 / 7
1000 / 7 = 142 times, remainder of 6
6000 / 7 = 857 times, remainder of 1
1000 / 7 = 142 times  => group of 2
```

For 7 our group size just went from 6 to 2. Fun fact if you divide it by 100 instead of a 1000 you get a group size of 3. Just to show that:

```
1 / 7
100 / 7 = 14 times, remainder of 2
200 / 7 = 28 times, remainder of 4
400 / 7 = 57 times, remainder of 1
100 / 7 = .. => group of 3
```

So to summarize:

```
10 / 7   = group of 6 = 6 / 1
100 / 7  = group of 3 = 6 / 2
1000 / 7 = group of 2 = 6 / 3
```

If in the end we multiply the group we found by 3 we should be good, I imagine? Or are we? Let's check one more number:

```
1 / 11
10 / 11 = no fit

100 / 11 = 9, remainder 1
100 / 11 = 9, remainder 1 until the infite of time
```

This doesn't quite work out because 1/11 = 0.090909, so the actual answer should be 2. If we use 1000 it does seem to work out:

```
1 / 11
1000 / 11 = 90 times, remainder 10
10000 / 11 = 909 times, remainder 1
1000 / .. => group of 2
```

However, this conflicts with what I previously wrote down about multiplying groups by 3, since 11 clearly hasn't got 6 groups, but 2.

**The correct rabbit hole**
Let's go back to our little algorithm and simplify it a little:

```rust
fn division(n: u128, d: u128) -> u64 {
    let mut base = 10;
    let mut div = n;
    let mut m = n;
    let mut range = vec![];

    loop {
        div = div * base / d;
        m = m * base % d;

        if m == 0 {
            break 0;
        }

        if range.len() > 0 {
            if range[0] == m {
                break range.len() as u64;
            }
        }

        range.push(m);
    }
}
```

This only works for bases of 10. If `d` were to equal 12 this would result in an infinite loop. What if in those cases we multiplied the base by 10? So multiplying the base by 10 doesn't seem that useful. The reason we get an infinite on 12 is because the range starts to look like this {10,4,4,...} followed by an infinite amount of 4's. Meaning that if we changed the algorithm a little bit we get a result:

```rust
fn division(n: u128, d: u128) -> u64 {
    let base = 10;
    let mut div = n;
    let mut m = n;
    let mut range = vec![];

    loop {
        div = div * base / d;
        m = m * base % d;

        if m == 0 {
            break 0;
        }

        if range.len() > 0 {
            if range.contains(&m) {
                break range.len() as u64;
            }
        }

        range.push(m);
    }
}
```

I know this is less than ideal but it works for the numbers up till 1000. When using this algorithm I get the answer 97 which has 96 cycles. The actual correct number should be 983, meaning my algorithm still needs some improvements.

**I was already at the correct answer...**
After some more headscratching I figured out that the non-primary numbers are giving me a bit of a headache with resolving this puzzle. Infinite loops popping up everywhere, so my 2nd thought is:

```
Brainfarts.txt:

15 has the prime factors 3 and 5
1/15 = 1/3 * 1/5
1/3 has a group of 1, 1/5 has a group of 0
Does that mean 15 has a cyclical group of 1?
Yes it does!

60 has the prime factors 2, 3 and 5
1/60 = 1/2 * 1/3 * 1/5
Meaning this also results in a group of 1
Yes it does.

800 has the prime factors 2 and 5 meaning it's 0
1/800
Yes it does.
```

Perhaps splitting up every number in their unique prime factors first and checking each prime factor will work?

**... yes, this just happened**
How about: no. I just made a really dumb error 🙄️. For testing purposes I had it cycle from 1 till a 100, and I forgot to update the 100 to a 1000. My algorithm is actually already working.

```rust
fn division(n: u128, d: u128) -> u64 {
    let base = 10;
    let mut m = n;
    let mut range = vec![];

    loop {
        m = m * base % d;

        if m == 0 {
            break 0;
        }

        if range.len() > 0 {
            if range.contains(&m) {
                break range.len() as u64;
            }
        }

        range.push(m);
    }
}

#[test]
fn test_division_below_10() {
    assert_eq!(division(1, 2), 0);
    assert_eq!(division(1, 3), 1);
    assert_eq!(division(1, 4), 0);
    assert_eq!(division(1, 5), 0);
    assert_eq!(division(1, 6), 1);
    assert_eq!(division(1, 7), 6);
    assert_eq!(division(1, 8), 0);
    assert_eq!(division(1, 9), 1);
    assert_eq!(division(1, 10), 0);
}

#[test]
fn test_division_more_than_10() {
    // The interesting numbers:
    assert_eq!(division(1, 11), 2);
    assert_eq!(division(1, 12), 2);
    assert_eq!(division(1, 15), 1);
    assert_eq!(division(1, 97), 96);
    assert_eq!(division(1, 983), 982);
    assert_eq!(division(1, 60), 2);
}

fn problem_26() -> u128 {
    let mut resulting_cycle_count = 0;
    let mut number = 0;
    for n in 1..1000 {
        let cycle_count = division(1, n);
        if cycle_count > resulting_cycle_count {
            resulting_cycle_count = cycle_count;
            number = n;
        }
    }
    number
}

#[test]
fn test_problem_26() {
    assert_eq!(problem_26(), 983);
}
```

This gives me the correct answer of 983.

---

**Improvements on the answer**
Coming back to this a day later, I think the algorithm can be improved a little. The answer for 1/12 is now 2, while the actual answer should be 1. In the grander scheme of things this doesn't really matter, but I would like to tweak this nontheless, just to be correct. To fix it properly I have to make a minor change for whenever `range` starts to populate:

```rust
fn cycle_count(n: u128, d: u128) -> u64 {
    let base = 10;
    let mut m = n;
    let mut range = vec![];

    loop {
        m = m * base % d;

        if m == 0 {
            break 0;
        }

        if range.len() > 0 {
            if range[range.len() - 1] == m {
                break 1;
            } else if range.contains(&m) {
                break range.len() as u64;
            }
        }

        range.push(m);
    }
}
```

So `range[range.len() - 1]` contains the last added remainder, however I'm wondering if I can get rid of `range.contains(&m)` and squash both ideas into a single solution. First up I'm going to lift the `if range.len() > 0`-block into a single function:

```rust
fn range_pattern_count(range: &Vec<u128>, m: u128) -> u64 {
    if range.len() > 0 {
        if range[range.len() - 1] == m {
            1
        } else if range.contains(&m) {
            range.len() as u64
        } else {
            0
        }
    } else {
        0
    }
}

#[test]
fn test_range_pattern_count() {
    assert_eq!(range_pattern_count(&vec![], 1), 0);
    assert_eq!(range_pattern_count(&vec![1], 1), 1);
    assert_eq!(range_pattern_count(&vec![5, 2], 2), 1);
    assert_eq!(range_pattern_count(&vec![1, 2, 3], 1), 3);
}
```

The first refactoring is quite simple; nothing too fancy is happening just yet. All I did was include an early return for if `range` happens to be empty:

```rust
if range.len() == 0 {
    return 0;
}

if range[range.len() - 1] == m {
    1
} else if range.contains(&m) {
    range.len() as u64
} else {
    0
}
```

Now the 0's are actually not really 0's but `null`. As Rust doesn't have a `null` we need to use `Option` which can return `Some(n)` or `None`. Using that pattern we get:

```rust
fn range_pattern_count(range: &Vec<u128>, m: u128) -> Option<u64> {
    if range.len() == 0 {
        return None;
    }

    let mut count = 0;
    let mut iter = range.iter().rev();

    loop {
        count += 1;

        let val = iter.next().unwrap_or(&0);
        if *val == m {
            break Some(count)
        } else if *val == 0 {
            break None
        }
    }
}
```

It's a little lengthier, but it does look a bit more Rust-ey. Looking at the `cycle_count` method I can now do this:

```rust
fn cycle_count(n: u128, d: u128) -> u64 {
    let base = 10;
    let mut m = n;
    let mut range = vec![];

    loop {
        m = m * base % d;

        if m == 0 {
            break 0;
        }

        if let Some(rpc) = range_pattern_count(&range, m) {
            break rpc;
        }

        range.push(m);
    }
}
```

Quite tidy if I say so myself. One small thing: I updated all the `u128`'s and `u64`'s to `u16`'s to save some memory; it all still fits, considering the max integer is 1000. Full improved code:

```rust
fn range_pattern_count(range: &Vec<u16>, m: u16) -> Option<u16> {
    if range.len() == 0 {
        return None;
    }

    let mut count = 0;
    let mut iter = range.iter().rev();

    loop {
        count += 1;

        let val = iter.next().unwrap_or(&0);
        if *val == m {
            break Some(count)
        } else if *val == 0 {
            break None
        }
    }
}

#[test]
fn test_range_pattern_count() {
    assert_eq!(range_pattern_count(&vec![], 1), None);
    assert_eq!(range_pattern_count(&vec![1], 1), Some(1));
    assert_eq!(range_pattern_count(&vec![5, 2], 2), Some(1));
    assert_eq!(range_pattern_count(&vec![5, 10, 1, 2], 2), Some(1));
    assert_eq!(range_pattern_count(&vec![1, 2, 3], 1), Some(3));
    assert_eq!(range_pattern_count(&vec![1, 2, 3], 4), None);
}

fn cycle_count(n: u16, d: u16) -> u16 {
    let base = 10;
    let mut m = n;
    let mut range = vec![];

    loop {
        m = m * base % d;

        if m == 0 {
            break 0;
        }

        if let Some(rpc) = range_pattern_count(&range, m) {
            break rpc;
        }

        range.push(m);
    }
}

#[test]
fn test_cycle_count_below_10() {
    assert_eq!(cycle_count(1, 2), 0);
    assert_eq!(cycle_count(1, 3), 1);
    assert_eq!(cycle_count(1, 4), 0);
    assert_eq!(cycle_count(1, 5), 0);
    assert_eq!(cycle_count(1, 6), 1);
    assert_eq!(cycle_count(1, 7), 6);
    assert_eq!(cycle_count(1, 8), 0);
    assert_eq!(cycle_count(1, 9), 1);
    assert_eq!(cycle_count(1, 10), 0);
}

#[test]
fn test_cycle_count_more_than_10() {
    // The interesting numbers:
    assert_eq!(cycle_count(1, 11), 2);
    assert_eq!(cycle_count(1, 12), 1);
    assert_eq!(cycle_count(1, 15), 1);
    assert_eq!(cycle_count(1, 97), 96);
    assert_eq!(cycle_count(1, 983), 982);
    assert_eq!(cycle_count(1, 60), 1);
}

fn problem_26() -> u16 {
    let mut resulting_cycle_count = 0;
    let mut number = 0;
    for n in 1..1000 {
        let cycle_count = cycle_count(1, n);
        if cycle_count > resulting_cycle_count {
            resulting_cycle_count = cycle_count;
            number = n;
        }
    }
    number
}

#[test]
fn test_problem_26() {
    assert_eq!(problem_26(), 983);
}
```

**Sources**

\[1\] [An Algorithm for Arbitrary Precision Integer Division](http://justinparrtech.com/JustinParr-Tech/an-algorithm-for-arbitrary-precision-integer-division/){:target="_blank"}