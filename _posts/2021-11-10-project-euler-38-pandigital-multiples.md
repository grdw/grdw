---
layout: post
title: "Project Euler #38: Pandigital multiples"
euler: 38
complexity: 1
---

{% include euler.html %}

**Introduction**
"What is the largest 1 to 9 pandigital 9-digit number that can be formed as the concatenated product of an integer with (1,2, ... , n) where n > 1?"

**Multiply concat**
Step 1 of this problem is taking an integer and multiplying it by 1,2,3 etc. and concatenating the answer to a total as a `String`.

```rust
fn multiply_concatenate(mut n: u64) -> String {
    let mut multiplier = 1;
    let mut total = String::from("");

    while multiplier > 0 {
        n *= multiplier;
        total.push_str(&format!("{}", n));
        multiplier += 1;
        break
    }

    total
}

#[test]
fn test_multiply_concatenate() {
    assert_eq!(multiply_concatenate(192), String::from("192384576"))
}
```

**Duplicate or pandigital**
Obviously the test fails at this point, and it returns "192". The trick right now is to check if each digit is unique (and remains unique), and if it becomes pandigital at one point. If both conditions are met, you can stop the while loop. In the case of a duplicate digit entering the `total` String, we should return a special type of `String` or a `None`. Using `Some` and `None` we get this function:

```rust
fn multiply_concatenate(n: u64) -> Option<String> {
    let mut multiplier = 1;
    let mut total = String::from("");
    let pandigital = vec!['1', '2', '3', '4', '5', '6', '7', '8', '9'];

    loop {
        total.push_str(&format!("{}", n * multiplier));

        let mut chars = total.chars().collect::<Vec<char>>();
        let duplicates = pandigital
            .iter()
            .any(|d1| {
                chars
                    .iter()
                    .filter(|d2| *d2 == d1)
                    .count() > 1
            });

        if duplicates {
            break None
        }

        chars.sort();

        if chars == pandigital {
            break Some(total)
        }

        multiplier += 1;
    }
}

#[test]
fn test_multiply_concatenate() {
    assert_eq!(multiply_concatenate(192), Some(String::from("192384576")));
    assert_eq!(multiply_concatenate(1), Some(String::from("123456789")));
    assert_eq!(multiply_concatenate(2), None)
}
```

**Solution**
The next step is to tackle the actual puzzle. The puzzle asks for _the largest possible number_ (meaning length in digits, in this particular case), implying there's no reasonable upper bound (I'm noticing a trend here). Considering the result of each product is concatenated to the total, the amount of digits duplicates (at least) very quickly after at least 2 cycles. So a reasonable upper bound would be to check until 99.999 (the highest number with 5 digits). The puzzle clearly isn't assuming 123.456.789 as a candidate. To get to the solution I did this:

```rust
fn problem_38() -> String {
    let mut max = 1;
    let mut result = String::from("");

    for n in 1..=99_999 {
        match multiply_concatenate(n) {
            Some(t) => {
                if n > max {
                    result = t;
                    max = n;
                }
            },
            None => {}
        }
    }
    result
}

#[test]
fn test_problem_38() {
    assert_eq!(problem_38(), String::from("932718654"));
}
```

Voila! The answer is "932718654".

---

**Improvements**
A thing I don't really like about Rust is empty match-branches; so let's get rid of those! The first step is to simply return a String for `multiply_concatenate`. In the `None`-case, return an empty string instead. After changing that, we can reduce `problem_38()` down to this:

```rust
fn problem_38() -> String {
    let mut result = String::from("");

    for n in 1..=99_999 {
        let t = multiply_concatenate(n);
        if !t.is_empty() {
            result = t;
        }
    }
    result
}

#[test]
fn test_problem_38() {
    assert_eq!(problem_38(), String::from("932718654"));
}
```

That's elegant enough for me!

{% include euler_complexity.html %}
