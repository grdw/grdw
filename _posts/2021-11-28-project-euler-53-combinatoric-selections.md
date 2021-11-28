---
layout: post
title: "Project Euler #53: Combinatoric selections"
problem_type: euler
problem: 53
complexity: 3
---

**Introduction**
I am shown the binomial coefficient. The puzzle asks which variations of N choose R, where 1 ≤ N ≤ 100, results in more than 1.000.000 combinations.

The main issue of this coding puzzle is the factorial, which lies at the heart of the binomial coefficient. Doing the factorial of 35 f.e. will not work because it's too big for Rust.

**Rabbit hole #1**
There is a way of working around that problem, namely by using vector multiplication. Vector multiplication is something we have done a lot already, namely in ["Power digit sum"](/2021/10/26/project-euler-16-power-digit-sum.html). By reusing most of the methods from "Power digit sum", I can make factorials which are quite sizeable:

```rust
fn fact(mut i: u128) -> Vec<u8> {
    let mut total = vec![1];
    while i > 1 {
        total.multiply_vec(&int_to_vec(i));
        i -= 1
    }
    total
}

#[test]
fn test_fact() {
    assert_eq!(fact(6), vec![0, 2, 7]);
    assert_eq!(fact(100).len(), 158);
}
```

The next problem to tackle is the binomial coefficient, which unfortunately contains a division. We can easily make both factorials as vectors:

```rust
let n_vec = fact(n);
let mut r_vec = fact(r);
r_vec.multiply_vec(&fact(n - r));

println!("{:?}", n_vec);
println!("{:?}", r_vec);
```

But how to divide these two vectors? I don't believe I actually need the "exact" number, all the puzzle is interested in, is which combinations of N and R exceed 1.000.000, or in other terms: which digits are of length > 5.

If I take a number of X digits long and divide it by a number of Y digits long, how long does that number get? Is it as easy as taking the length of N and subtracting it from the length of R (which is probably not true, but let's assume that's the case). How close to the answer do I get? Let's add a method like this:

```rust
fn more_than_1m(n: u128, r: u128) -> bool {
    let n_vec = fact(n);
    let mut r_vec = fact(r);
    r_vec.multiply_vec(&fact(n - r));

    (n_vec.len() - r_vec.len()) > 5
}

#[test]
fn test_more_than_1m() {
    assert_eq!(more_than_1m(5, 3), false);
    assert_eq!(more_than_1m(23, 10), true);
}
```

And let's try and resolve Problem 53:

```rust
fn problem_53() -> u64 {
    let mut counts = 0;

    for r in 1..=100 {
        for n in r..=100 {
            let n_vec = fact(n);
            let mut r_vec = fact(r);
            r_vec.multiply_vec(&fact(n - r));

            println!("{} ({}) {} ({})", n, n_vec.len(), r, r_vec.len());
            if (n_vec.len() - r_vec.len()) > 5 {
                counts += 1
            }
        }
    }
    counts
}
```

The above code is painfully slow, but after a whopping 213.21s it gives back 4096. Which is remarkably close, but the actual answer is 4075, meaning there were some answers that didn't abide by the rule I just mentioned earlier.

I'm officially stuck again, and I probably shouldn't have to do a factorial of a 100, 100 times. After some searching, I found a Stackexchange forum question about the binomial coefficient, which had one comment with only a Wikipedia link to "Pascal's rule" [1]. Don't you hate it, when it is just a link and nothing more than that, no explanation whatsoever as to how it can be used? As far as I can conclude from Wikipedia, it seems that I have to do calculate the binomial coefficient twice and sum both of those numbers, which is probably going to make my code even slower.

**Back to the code:**
Ideally in my code I'd only have to calculate the factorials from 1 till a 100, once. Like this:

```rust
let mut factorials = vec![];

for n in 1..=100 {
    factorials.push(fact(n))
}
```

My code would speed up a lot and look like this:

```rust
let mut counts = 0;
let mut factorials = vec![vec![0]];

for n in 1..=100 {
    factorials.push(fact(n))
}

for r in 1..=100 {
    for n in r..=100 {
        let n_vec = factorials[n].clone();
        let mut r_vec = factorials[r].clone();
        r_vec.multiply_vec(&factorials[n - r].clone());

        //println!("{} ({}) {} ({})", n, n_vec.len(), r, r_vec.len());
        if (n_vec.len() - r_vec.len()) > 5 {
            counts += 1
        }
    }
}
counts
```

However, this still takes 30.68 seconds, which is not fast.

**Back to the drawing board:**
I need to know the _length_ of a binomial coefficient. I don't need to know the actual coefficient itself, I couldn't care a thing about it. I only need to know if it exceeds 1m.

Let's first see if we can optimize the loop:

```rust
for r in 1..=100 {
    for n in r..=100 {
        println!("{} {} {}", n, r, n - r);
    }
}
```

So `n - r` sometimes turns out to be 0, which is useless because the binomial coefficient will always be 0 if that's the case. To fix this, we tweak the loop to look like:

```rust
for r in 1..=100 {
    for n in r + 1..=100 {
    }
}
```

In total there are 4950 possible loop cycles (if all of the combination of N choose R were over 1m that would be my answer). However, there are (4950 - 4075 =) 875 N choose R statements which aren't true and lower than 1m, so it seems. Let's look back at ["Lattice paths"](/2021/10/25/project-euler-15-lattice-paths.html) where I had to do something similar to factorials, so let's take 8 choose 6 f.e.:

```
n!
----------
r!(n - r)!

When fully writing it out:

8 * 7 * 6 * 5 * 4 * 3 * 2
---------------------------------
(6 * 5 * 4 * 3 * 2) * (2)

This can be reduced quite heavily to:

8 * 7
-----
2

28
```

Look at that. This means I only have to calculate the factorial of 8 up till 6 (meaning, 8 x 7). `r!` completely disappears here. Let's take another example and see if this rule of striping away `r!` holds up. Let's take 10 choose 3:

```
n!
----------
r!(n - r)!

When fully writing it out:

10 * 9 * 8 * 7 * 6 * 5 * 4 * 3 * 2
----------------------------------
(3 * 2) * (7 * 6 * 5 * 4 * 3 * 2)

This can be reduced quite heavily to:

10 * 9 * 8
----------
3 * 2

120
```

In this particular case, I'm crossing off `n - r`, because that's the biggest group in this example. This means that depending on if `n - r > r`, we should pick `n - r` or `r` as a break point for the `fact()` function. We'll divide by the lowest `n - r` or `r` factorial. After fiddling a bit with the code, it seems that the longest number has 94 digits, meaning that we can't exactly use a `u128`, but it was worth a shot to see if it were possible.

**Resolving the division in the binomial coefficient**
If I take any N choose R, the amount of products at the top and the bottom (including 1, for the bottom case), will be the same. Let's take 100 choose 3 for example:

```
100!
---------------
3! x (100 - 3)!

100!
--------
3! x 97!

I can get rid of 97! like this:

100 * 99 * 98
-------------
3 * 2 * 1

This equals 161.700 and is the same as:

100   99   98
--- x -- x --
3     2    1
```

If these individual fractures become higher than 1m, we can stop counting. In code this would go something like this:

```rust
fn partial_coeff(mut n: u64, mut m: u64) -> bool {
    let mut total: f64 = 1.0;

    loop {
        total *= n as f64 / m as f64;

        if total > 1_000_000.0 {
            break true
        }

        n -= 1;
        m -= 1;

        if m < 1 {
            break false
        }
    }
}

#[test]
fn test_partial_coeff() {
    assert_eq!(partial_coeff(100, 3), false);
    assert_eq!(partial_coeff(23, 10), true)
}
```

Not only is this the right way of resolving this problem, it also saves storing any number to some vector or having to calculate the factorial of a 100. Extra wins all around!

To resolve problem 53:

```rust
fn problem_53() -> u64 {
    let mut count = 0;

    for r in 1..=100 {
        for n in r + 1..=100 {
            let div = if (n - r) > r {
                r
            } else {
                n - r
            };

            if partial_coeff(n, div) {
                count += 1
            }
        }
    }
    count
}

#[test]
fn test_problem_53() {
    assert_eq!(problem_53(), 4075);
}
```

Voila! Done in 0.00s.

**Sources**

\[1\] [en.wikipedia.org/wiki/Pascal%27s_rule](https://en.wikipedia.org/wiki/Pascal%27s_rule){:target="_blank"}
