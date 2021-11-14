---
layout: post
title: "Project Euler #31: Coin sums"
problem_type: euler
problem: 31
complexity: 3
---

**Introduction**
How many different ways can £2 be made using any number of coins?

Upon reading the full puzzle, this feels like one of those classic combination with repetition problems. However, I'm assuming there's a twist to the story. By converting all coin values to pence and by not even writing code, you can start listing them:

```
200 x 1p
198 x 1p + 2p
196 x 1p + 2 x 2p
195 x 1p + 1 x 5p
...
2 x 100p
1 x 200p
```

To start off, I think we should start with a simpler problem and ask ourselves: in how many ways can I make 1p? There's only 1 way, namely the 1p coin. What about 2p or 3p or 4p or 5p? This problem is getting increasingly more complicated the higher the total value becomes, so I'm going to look up some simple math equations which might help me. My first idea however was to use a cylinder: `[0, 0, 0, 0, 0, 0, 0, 0]` and see each value as n coins of value m. So 200p can be displayed as:

```
[0, 0, 0, 0, 0, 0, 0, 1] 1 of 200
[0, 0, 0, 0, 0, 0, 2, 0] 2 of 100
[0, 0, 0, 0, 0, 2, 1, 0] 1 of 100, 2 of 50
[0, 0, 0, 0, 0, 4, 0, 0] 4 of 50
... etc.
[200, 0, 0, 0, 0, 0, 0, 0] 200 of 1
```

The maximum values of each of these are:

```
[200, 100, 40, 20, 10, 4, 2, 1] MAX
```

I'm not sure how that's going to help me. Upon further research, I found a similar question on Stackexchange [1], however that question specifically mentions that the person only has 50 coins. Another question appears [2] which doesn't mention a specific amount of coins. The key word that's brought up after some searching is "partioning" [3] [4] [5]. At this point I just implemented a method from [5] which looks like this:

```rust
fn coin_values(value: usize) -> usize {
    let coins: Vec<usize> = vec![
        200,
        100,
        50,
        20,
        10,
        5,
        2,
        1
    ];

    let mut cylinder = vec![0; value + 1];
    cylinder[0] = 1;

    for c in &coins {
        for i in 0..=(value - c) {
            cylinder[i + *c] += cylinder[i];
        }
    }

    cylinder[value]
}

#[test]
fn test_problem_31() {
    assert_eq!(coin_values(200), 73682);
}
```

It's the correct answer, but I have no clue how this works from a math point of view. I'm not sure if I'm supposed to understand how any of this works, in all honesty.

**Sources**

\[1\] [How many combinations possible to make $10 from a set](https://math.stackexchange.com/questions/3774377/how-many-combinations-possible-to-make-10-from-a-set-amount-of-coins)

\[2\] [How many combinations of coins add up to $20](https://math.stackexchange.com/questions/3606321/how-many-combination-of-coins-add-up-to-20)

\[3\] [Partion (Number theory)](https://en.wikipedia.org/wiki/Partition_%28number_theory%29)

\[4\] [Integer Partitioning with Dynamic Programming](https://www.youtube.com/watch?v=3hc-Urx4S8g)

\[5\] [Change for a dollar](https://math.stackexchange.com/questions/176363/keep-getting-generating-function-wrong-making-change-for-a-dollar/176397#176397)