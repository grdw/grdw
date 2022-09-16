---
layout: post
title: "Project Euler #62: Cubic permutations"
problem_type: euler
problem: 62
complexity: 1
---

### Introduction

The full text of the puzzle reads the following:

> The cube, 41063625 (345<sup>3</sup>), can be permuted to produce two other cubes: 56623104 (384<sup>3</sup>) and 66430125 (405<sup>3</sup>). In fact, 41063625 is the smallest cube which has exactly three permutations of its digits which are also cube.
>
> Find the smallest cube for which exactly five permutations of its digits are cube.

### Starting out

I started out with the initial idea of having an infinite loop that keeps on cubing an ever-increasing number `n`. We take all the permutations of `n`, and test if they're cube. If we find 5 cubes, we can stop the loop. The downside to this is "taking all the permutations of `n`". A number like 41063625 already has (40320) `8!` permutations. That's quite a lot of calculations to test if _just three_ of these are a cube. This solution is going to be dreadfully slow.

The other idea I had was to keep the infinite loop, but instead if we find a permutation in one of the previous variations of `n` we would merely keep a list of permutations per key. If we find 5 permutations, stop the loop and print out the first item of the list of permutations.

### The code

To keep the list of previous permutations, we would be using a `HashMap`. The key would merely be the digits of the cubed number sorted as a string. We can use the `entry()` method on a hash map, to either modify the existing vector, if there is one available, or add a new vector with the cube stored inside of it. We stop the loop once 5 permutations are found, and return the first item (which is going to be the lowest value) of the list of permutations.

```rust
let mut list: HashMap<String, Vec<u128>> = HashMap::new();
let mut n: u128 = 1;

loop {
    let cube = n.pow(3);
    let mut r_chars: Vec<char> = cube
        .to_string()
        .chars()
        .collect();

    r_chars.sort_by(|a, b| a.cmp(b)); // Sort chars
    let key: String = r_chars.into_iter().collect();

    list
        .entry(key.clone())
        .and_modify(|c| c.push(cube))
        .or_insert(vec![cube]);

    if let Some(n) = list.get(&key) {
        if n.len() == 5 {
            return n[0]
        }
    }

    n += 1;
}
```

The code runs in 0.05s and returns the correct answer of 127035954683.
