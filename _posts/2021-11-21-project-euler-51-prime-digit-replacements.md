---
layout: post
title: "Project Euler #51: Prime digit replacements"
problem_type: euler
problem: 51
complexity: 2
---

### Introduction
"Find the smallest prime which, by replacing part of the number (not necessarily adjacent digits) with the same digit, is part of an eight prime value family."

The idea is to take a prime number, like 13 and turn them into "families" which means:

```
13 is part of 2 families:
*3 {13, 23, 43, 53, 73, 83}
1* {11, 13, 17, 19}
...

113 is also part of 2 families:
### 3 {113, 223, 773, 883}
11* {113}

...
6451 is part of 4 families:
645* {6451}
64*1 {6421, 6451, 6481, 6491}
6*51 {6151, 6451, 6551}
*451 {1451, 4451, 6451, 7451}
```

The trick is to find the lowest number with a family count of 8.

### Brute forcing
With many of these challenges, I usually take a brute force approach. Using the Sieve of Eratosthenes, I can easily generate all prime numbers under 1.000.000. If that proves to be too little, we'll increase the group size.

### max_family_group()
My first idea for a method is to take a prime number, and return the highest family group count. My method looks something like this:

```rust
use std::str;

fn max_family_count(i: usize, sieve: &Vec<bool>) -> u64 {
    let s = i.to_string();
    let mut fam_count = 0;

    for (i, chrs) in s.chars().enumerate() {
        let start = if i == 0 { b'1' } else { b'0' };
        let mut sub_count = 0;

        for n in start..b'9' {
            let byte = &[n];
            let slice = &s;
            let replace_with = str::from_utf8(byte).unwrap();
            let new_digit: usize = slice
                .replace(chrs, replace_with)
                .parse()
                .unwrap();

            if sieve[new_digit] {
                sub_count += 1;
            }
        }

        if sub_count > fam_count {
            fam_count = sub_count;
        }
    }

    fam_count
}

#[test]
fn test_max_family_count() {
    let sieve = sieve_of_erato(10_000);

    assert_eq!(max_family_count(13, &sieve), 6);
    assert_eq!(max_family_count(23, &sieve), 6);
    assert_eq!(max_family_count(6451, &sieve), 4);
}
```

This time around, I tried to by as memory efficient as possible by using `str` as much as possible. The only hardship this code has is the `to_string()` method at the top. That's the only part I believe which is going to be heap allocated. I believe this method can do without the `to_string()`, but perhaps that optimization is not even needed.

### Solving problem 51
My first attempt at a solution looks like this:

```rust
fn problem_51() -> usize {
    let sieve = sieve_of_erato(1_000_000);
    let mut solution = 0;

    for n in 0..sieve.len() {
        if sieve[n] {
            let count = max_family_count(n, &sieve);
            if count == 8 {
                solution = n;
                break;
            }
        }
    }

    solution
}

#[test]
fn test_problem_51() {
    assert_eq!(problem_51(), 111857);
}
```

However, this proves to be incorrect, because the actual answer is `121313`. My `max_family_count()` method probably has some bugs.

### Debugging with 111857
I spot where my bug is quite easily. If we take a look at the replacements for 111857, this is what happens:

```
First cycle replace (1) with 1 till 9

111857
222857
333857
555857
666857
777857
888857

Next cycle, replace (1) with 0 till 9
857
111857
222857
333857
555857
666857
777857
888857
```

That 857 shouldn't be there! After extending the filtering on the `max_family_group()` method, I also took a look at `121313`. The biggest prime family I get for 121313, is when replacing 1's:

```
121313
222323
323333
424343
525353
626363
828383
```

However, these form a group of 7, meaning that either 727373 or 929393 are also prime numbers, but aren't being treated like such. It turns out 929393 is indeed a prime number, and I also spot my mistake in the code. Instead of writing `b'0'..b'9'` I should've written `b'0'..=b'9'`; classic.

### Full solution
The first step in my solution is to take any number and turn them into their unique digits:

```rust
fn unique_digits(number: usize) -> Vec<u8> {
    let mut digits = vec![];
    let mut digit_length = (number as f64).log10().ceil() as u32;

    while digit_length > 0 {
        let tens = 10_u64.pow(digit_length) as usize;
        let base = number % tens;
        let digit = (base / (tens / 10)) as u8;

        if !digits.contains(&digit) {
            digits.push(digit);
        }

        digit_length -= 1
    }

    digits
}

#[test]
fn test_unique_digits() {
    assert_eq!(unique_digits(6451), vec![6,4,5,1]);
    assert_eq!(unique_digits(121313), vec![1,2,3]);
}
```

The key thing here is to have the individual digits in 'order' as they appear in the number. This is relevant for the next method, because the first digit that appears in the sequence can't be replaced with a 0. After some refactoring, the `max_family_count()` method has been reduced to this:

```rust
fn max_family_count(i: usize, sieve: &Vec<bool>) -> u64 {
    let string = i.to_string();
    let digits = unique_digits(i);

    digits
        .iter()
        .enumerate()
        .map(|(i, digit)| {
            let start = if i == 0 { 1 } else { 0 };

            (start..=9)
                .map(|i| replace_digit(&string, *digit, i))
                .filter(|&nd| sieve[nd])
                .count()
        })
        .max()
        .unwrap_or(0) as u64
}

#[test]
fn test_max_family_count() {
    let sieve = sieve_of_erato(1_000_000);

    assert_eq!(max_family_count(13, &sieve), 6);
    assert_eq!(max_family_count(23, &sieve), 6);
    assert_eq!(max_family_count(6451, &sieve), 4);
    assert_eq!(max_family_count(111857, &sieve), 7);
    assert_eq!(max_family_count(121313, &sieve), 8);
}
```

The code starts by using the `unique_digits()` method I described earlier. The code loops over them and starts replacing digits from the `String`-version of the original number. It then proceeds to filter out all the primes and count them. The biggest group is eventually returned, or a 0 when no groups can be made.

### The hackery in `replace_digit()`
The `replace_digit()` method works by passing actual integers; which is possible by casting these to UTF-8 string slices directly. The way this works is as follows:

```rust
use std::str;

fn replace_digit(slice: &str, digit: u8, replacement: u8) -> usize {
    let utf8_offset = 48;
    let digit_byte = &[digit + utf8_offset];
    let digit_str = str::from_utf8(digit_byte).unwrap();
    let replacement_byte = &[replacement + utf8_offset];
    let replacement_str = str::from_utf8(replacement_byte).unwrap();

    slice
        .replace(digit_str, replacement_str)
        .parse()
        .unwrap()
}
```

This saves having to deal with `Regex` and being able to simply use `str::replace`, which replaces all instances of a certain string slice with another. In our case these are slices which look like "1", "2" etc. (to clarify: these are different from `char`'s, but since Rust doesn't have a `str#replace_char` method, this is the best I could come up with).

The `problem_51` method looks rather simple:

```rust
fn problem_51() -> usize {
    let sieve = sieve_of_erato(1_000_000);
    let mut solution = 0;

    for n in 0..sieve.len() {
        if sieve[n] {
            let count = max_family_count(n, &sieve);
            if count == 8 {
                solution = n;
                break;
            }
        }
    }

    solution
}

#[test]
fn test_problem_51() {
    assert_eq!(problem_51(), 121313);
}
```

Solved!
