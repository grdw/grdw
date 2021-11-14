---
layout: post
title: "Project Euler #22: Names scores"
problem_type: euler
problem: 22
complexity: 1
---

{% include euler.html %}

**Introduction**
You're given a file with names, calculate the sum of all the name scores. A name score can be determined by summing up all individual character positions in the alphabet and multiply it by the index of that name within the sorted list of names. This particular puzzle is incredibly easy and in all honestly wasn't much of a challenge. There are sometimes those Euler puzzles that feel a little bit too easy. The full code I used is this:

```rust
use std::fs;

fn alphabet_value(name: &str) -> u32 {
    name
        .chars()
        .map(|c| {
            match (b'A'..=b'Z').position(|l| l as char == c) {
                Some(n) => (n + 1) as u32,
                None => 0
            }
        })
        .sum()
}

fn problem_22() -> u32 {
    let contents = fs::read_to_string("p022_names.txt")
                      .unwrap_or("".to_string());

    let mut names: Vec<&str> = contents.split(",").collect();

    names.sort();

    names
        .iter()
        .enumerate()
        .map(|(i, name)| alphabet_value(name) * (i as u32 + 1))
        .sum()
}
```

Giving me the correct answer of 871198282. The only tricky bit was figuring out how to create a range from A till Z, but a quick Google search gave me that answer [1]. I also did cheat a little and dropped all the double quotes from the `p022_names.txt` file.

**Sources**

\[1\] [Rust-lang/Iteration thought alphabets](https://users.rust-lang.org/t/iteration-thought-alphabets/30078/3){:target="_blank"}

{% include complexity.html %}
