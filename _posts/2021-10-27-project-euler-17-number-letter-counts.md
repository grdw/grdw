---
layout: post
title: "Project Euler #17: Number letter counts"
euler: 17
complexity: 1
---

{% include euler.html %}

**Introduction**
The puzzle is simple enough: count the amount of characters it takes to write out 1 till 1000 in the British English language.

The first thing I need is a mapping of all the possible unique words. Now the puzzle states its only interested in the length of each word, so the word itself can be ditched in favor of the length of each term (f.e. one = 3 letters). However, for readability I'll keep the `str` representation in the code.

```rust
use std::collections::HashMap;

let spoken_lengths = HashMap::from([
    (1, "one".len()),
    (2, "two".len()),
    (3, "three".len()),
    (4, "four".len()),
    (5, "five".len()),
    (6, "six".len()),
    (7, "seven".len()),
    (8, "eight".len()),
    (9, "nine".len()),
    (10, "ten".len()),
    (11, "eleven".len()),
    (12, "twelve".len()),
    (13, "thirteen".len()),
    (14, "fourteen".len()),
    (15, "fifteen".len()),
    (16, "sixteen".len()),
    (17, "seventeen".len()),
    (18, "eighteen".len()),
    (19, "nineteen".len()),
    (20, "twenty".len()),
    (30, "thirty".len()),
    (40, "fourty".len()),
    (50, "fifty".len()),
    (60, "sixty".len()),
    (70, "seventy".len()),
    (80, "eighty".len()),
    (90, "ninety".len()),
    (100, "hundred".len()),
    (1000, "thousand".len())
]);
```

Next up I'll need a method, to determine the length of a number as its written variation. To create such a method I'll add some tests:

```rust
#[test]
fn test_int_to_spoken_len() {
    assert_eq!(int_to_spoken_len(1), 3);
    // one hundred and fifteen = 20, don't count spaces
    assert_eq!(int_to_spoken_len(115), 20);
    // nine hundred and ninety nine
    assert_eq!(int_to_spoken_len(999), 24);
}
```

The method is not to complex, but a bit gross:

```rust
let mut total: u64 = 0;
let mut base = 100;

while i > 0 {
    match spoken_lengths.get(&i) {
        Some(n) => {
            total += *n as u64;
            i = 0
        },
        None => {
            let (hun_div, hun_mod) = (i / base, i % base);

            if hun_div > 0 && base == 100 {
                total += spoken_lengths[&hun_div] as u64;
                total += spoken_lengths[&base] as u64;

                if hun_mod > 0 {
                    // To count "and"
                    total += 3
                }
            }

            if hun_div > 0 && base == 10 {
                let tens = hun_div * base;
                total += spoken_lengths[&tens] as u64;
            }

            i -= base * hun_div;
            base /= 10;
        }
    }
}

total
```

To resolve the actual problem:

```rust
fn problem_17() -> u64 {
    (1..=1000).map(|n| int_to_spoken_len(n)).sum()
}

#[test]
fn test_problem_17() {
    assert_eq!(problem_17(), 21218)
}
```

My current answer is 21218. However, looking at the actual correct answer, it should be 21124, meaning I'm 21218 - 21124 = 94 characters off the mark. Which means I probably have a bug somewhere in my code (or multiple). So upon dumping out all the numbers and their total length, I found out some interesting mistakes:

```
number | length
100    | 7      ("one hundred") <-- this should actually be 10
1000   | 8      ("one thousand") <-- this should actually be 11
```

After I fixed that little problem, I get '21224' instead of '21124'; technically adding 6 characters to the pile (so the difference is +100). The second mistake I made was a typo in my list; so "fourty" should've been "forty". This causes the number to lower to '21124', which is the correct answer.

The full code is quite the eyesore, but it works:

```rust
use std::collections::HashMap;

fn int_to_spoken_len(mut i: u64) -> usize {
    let spoken_lengths = HashMap::from([
        (1, "one".len()),
        (2, "two".len()),
        (3, "three".len()),
        (4, "four".len()),
        (5, "five".len()),
        (6, "six".len()),
        (7, "seven".len()),
        (8, "eight".len()),
        (9, "nine".len()),
        (10, "ten".len()),
        (11, "eleven".len()),
        (12, "twelve".len()),
        (13, "thirteen".len()),
        (14, "fourteen".len()),
        (15, "fifteen".len()),
        (16, "sixteen".len()),
        (17, "seventeen".len()),
        (18, "eighteen".len()),
        (19, "nineteen".len()),
        (20, "twenty".len()),
        (30, "thirty".len()),
        (40, "forty".len()),
        (50, "fifty".len()),
        (60, "sixty".len()),
        (70, "seventy".len()),
        (80, "eighty".len()),
        (90, "ninety".len()),
        (100, "hundred".len()),
        (1000, "thousand".len())
    ]);

    let mut total = 0;
    let mut base = 100;

    if i == 100 || i == 1000 {
        // Adding 'one' for 100 and 1000
        total += 3;
    }

    while i > 0 {
        match spoken_lengths.get(&i) {
            Some(length) => {
                total += *length;
                i = 0
            },
            None => {
                let (base_div, base_mod) = (i / base, i % base);

                if base_div > 0 && base == 100 {
                    total += spoken_lengths[&base_div];
                    total += spoken_lengths[&base];

                    if base_mod > 0 {
                        // To count "and"
                        total += 3
                    }
                }

                if base_div > 0 && base == 10 {
                    let tens = base_div * base;
                    total += spoken_lengths[&tens];
                }

                i -= base * base_div;
                base /= 10;
            }
        }
    }

    total
}

#[test]
fn test_int_to_spoken_len() {
    assert_eq!(int_to_spoken_len(1), 3);
    // twenty one
    assert_eq!(int_to_spoken_len(21), 9);
    // one hundred
    assert_eq!(int_to_spoken_len(100), 10);
    // one hundred and fifteen = 20, don't count spaces
    assert_eq!(int_to_spoken_len(115), 20);
    // nine hundred and ninety nine
    assert_eq!(int_to_spoken_len(999), 24);
}

fn problem_17() -> usize {
    (1..=1000).map(|n| int_to_spoken_len(n)).sum()
}

#[test]
fn test_problem_17() {
    assert_eq!(problem_17(), 21124)
}
```

Can this code be improved? Well, perhaps it can! If we were to change the `HashMap` to a `Vec<usize>` it might become a little bit more readable:

```rust
fn int_to_spoken_len(mut i: usize) -> usize {
    let mut spoken_lengths: Vec<usize> = vec![0; 1001];
    spoken_lengths[1] = "one".len();
    spoken_lengths[2] = "two".len();
    // etc.

    let mut total = 0;
    let mut base = 100;

    if i == 100 || i == 1000 {
        // Adding 'one' for 100 and 1000
        total += 3;
    }

    while i > 0 {
        if spoken_lengths[i] > 0 {
            total += spoken_lengths[i];
            break
        }
        else {
            let (base_div, base_mod) = (i / base, i % base);

            if base_div > 0 && base == 100 {
                total += spoken_lengths[base_div];
                total += spoken_lengths[base];

                if base_mod > 0 {
                    // To count "and"
                    total += 3
                }
            }

            if base_div > 0 && base == 10 {
                total += spoken_lengths[base_div * base];
            }

            i -= base * base_div;
            base /= 10;
        }
    }

    total
}
```

However, I do feel this is "as good as it gets". In Ruby you can cheat this of course with a single one-liner:

```ruby
require "humanize" # gem install humanize
(1..1000).sum {|a| a.humanize.gsub(/[ -]/, '').length }
```

😴
