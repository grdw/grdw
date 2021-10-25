---
layout: post
title: "Project Euler #15: Lattice paths"
euler: 15
---

{% include euler.html %}

**Introduction**
This puzzle is called "Lattice paths" (no, not lettuce paths). The puzzle talks about a grid of 2x2 and how there are only 6 distinct ways of moving from the top left to the bottom right. How many ways are there for a 20x20 grid?

To draw out the example a bit more:

```
A 2x2 grid has 9 grid points:

A B C
D E F
G H I

All 6 possible routes to go from A -> I:
A B C F I
A B E F I
A B E H I
A D E F I
A D E H I
A D G H I
```

What if we took an even simpler example like a 1x1 grid?

```
A 1x1 grid which has 4 grid points:

A B
C D

You can go from A -> D in these routes:
A C D
A B D
```

I don't see it quite yet...
Let me take a bit more complex example with a 3x3 grid:

```
A 3x3 grid which has 16 grid points:

A B C D
E F G H
I J K L
M N O P

You can go from A -> P in these routes:

?
```

Now I'm not going to actually list them all quite yet, since that would be a little too much work, but I do already see a pattern emerge by doing this. For each grid length we see that there are (n + 1) ^ 2 grid points. So for 20 we'll have (20 + 1) ^ 2 = 441 grid points.

Let's go back to the example of a 2x2 by grid. In which other way can we visualize the routes, knowing we can only go down and to the right?

```
A B C
D E F
G H I

As a tree of all the routes:

    C
   / \
  B   F
 / \ / \
A   E   I
 \ / \ /
  D   H
   \ /
    G
```

That's interesting, so it looks like a diamond. I'm not sure what that even means, and I'm sure there are some math geniuses out there that will immediately see the answer, however I don't see it quite yet. Is it as easy as: from the root node A, it can only pick two routes B and D which themselves only have two routes, so 3 x 2 = 6?

Let's check how many routes there are for the 3x3 grid using a tree:


```
A 3x3 plane which has 16 grid points:

A B C D
E F G H
I J K L
M N O P

You can go from A -> P in these routes:

      D
     / \
    C   H
   / \ / \
  B   G   L
 / \ / \ / \
A   F   K   P
 \ / \ / \ /
  E   J   O
   \ / \ /
    I   N
     \ /
      M

A B C D H L P
A B C G H L P
A B C G K L P
A B C G K O P
A B F G K L P
A B F G K O P
A B F G H L P
A B F J N O P
A B F J K O P
A B F J K L P
etc.
```

There are 10 routes x 2 = 20 routes for a grid that's 3x3.

Some data for the various grid sizes:

```
Size:  | Routes | Amount of grid lines
-------|--------|---------------------
1      | 2      | 4
2      | 6      | 12
3      | 20     | 24
20     | ?      | ?
```

If I divide the amount of grid lines, by the size of the grid, this is what I get:

```
4 / 1 = 4   2*2
12 / 2 = 6  2*3
24 / 3 = 8  2*4
```

There's a pretty clear pattern here, namely `((size + 1) * 2) * size` gives me the amount of gridlines to a grid. Simplified, this becomes: `2 * size + 2 * size^2`. If we give an example for the number 20, that's:

```
2 * 20 + 2 * 20^2
40 + 2 * 400
40 + 800
840
```

Now, another pattern that emerges here is that the previous amount of gridlines + (`2*4`) happens to result in 20. Is it really that easy? Let's find out.

**Rabbit hole number #1**
I start with a while loop that counts back from the given grid size `n` to a minimum of 2. Using the TDD approach my code looks like this:

```rust
fn problem_15(mut n: i32) -> i32 {
    while n >= 2 {
        println!("{}", n);
        n -= 1
    }
    0
}


#[test]
fn test_problem_15() {
    assert_eq!(problem_15(2), 6);
    assert_eq!(problem_15(3), 20);
    assert_eq!(problem_15(20), 20);
}
```

To make the first 2 cases succeed I'll apply my new found logic:

```rust
fn problem_15(mut n: i32) -> i32 {
    let mut c = (n + 1) * 2;
    while n > 2 {
        c += n * 4;
        n -= 1
    }
    c
}


#[test]
fn test_problem_15() {
    assert_eq!(problem_15(2), 6);
    assert_eq!(problem_15(3), 20);
    assert_eq!(problem_15(20), 870);
}
```

After executing the code, the answer is right there. There are 870 possible routes for a 20x20 matrix. To validate if that's correct I'll check the answer with the sheet and it seems that this is super incorrect. I'm off by quite a lot actually. The actual correct answer seems to be 137846528820.

**Rabbit hole number #2**
Judging by the number I'm assuming factorials come into play one way or the other but I can't really see it yet. Knowing the answer to the problem, I can at least update my test:

```rust
fn problem_15(mut n: u64) -> u64 {
    let mut c = 0;
    c
}


#[test]
fn test_problem_15() {
    assert_eq!(problem_15(2), 6);
    assert_eq!(problem_15(3), 20);
    assert_eq!(problem_15(20), 137846528820);
}
```

To get a proper understand of the problem, I feel like I have to actually read up on Lattice paths to get an idea of what they are [1]. Reading through the Wikipedia article, it pretty much just gives us the answer to our problem: use the binomial coefficient. Turns out I wasn't that far off with my factorials. I'm not much of a mathematician, so I have to look up what the binomial coefficient is exactly. For the math noobs among us, me included, the method looks like this:

```
n! / r!(n - r)!
```

For a Lattice path, according to the Wikipedia article, you calculate it by taking a coordinate (x + y) over (x). To be clear about it: `n = (x + y)` and `r = x`. Because we're on a square grid and we'll always be moving from the top-left corner to the bottom-right corner, our `n` equals to `x * 2`. The code now looks like this.

```rust
fn fact(mut n: u64) -> u64 {
    match n {
        0 => 1,
        1 => 1,
        _ => fact(n - 1) * n
    }
}

fn problem_15(k: u64) -> u64 {
    let n = k * 2;

    fact(n) / (fact(k) * fact(n - k))
}


#[test]
fn test_problem_15() {
    assert_eq!(problem_15(2), 6);
    assert_eq!(problem_15(3), 20);
    assert_eq!(problem_15(20), 137846528820)
}

#[test]
fn test_factorial() {
    assert_eq!(fact(2), 2);
    assert_eq!(fact(3), 6);
    assert_eq!(fact(4), 24);
}
```

This code however doesn't work because it will overflow. Most likely having to do with the fact that we have a `fact(40)` to calculate, which simply doesn't fit in a 64-bit integer in rust. So let's try to get rid of it and simplify the `problem_15` method:

First I'm squashing down the `let n` into the method:

```rust
fn problem_15(k: u64) -> u64 {
    fact(k * 2) / (fact(k) * fact((k * 2) - k))
}
```

So with my minor math skills I can see that "(something * 2) - something" is the same as "one of something" so:


```rust
fn problem_15(k: u64) -> u64 {
    fact(k * 2) / (fact(k) * fact(k))
}
```

Now I'm a bit stuck because I don't know how to simplify factorials. After some searching I found a link on how to simplify factorials [2] however it is not quite what I'm looking for. I need something a bit simpler, so according to the dummies article [3] I can do the following:

```
Let's write problem_15 down like this:

(n * 2)!
---------
(n! * n!)

Let's imagine n = 3:

(3 * 2)!
---------
(3! * 3!)

That becomes:

6!
---------
(3! * 3!)

Writing that out it becomes:


6 * 5 * 4 * 3 * 2 * 1
---------------------
3 * 2 * 1 * 3 * 2 * 1

So simplified:

6 * 5 * 4
---------
3 * 2 * 1

So I can drop one n! if I only calculate the factorial of 6
up till three numbers.
```

Knowing that this is true, this will make my code a lot simpler. Taking the grid size as `k` I have to multiply that number by 2 and create two "factorials" for lack of a better term (which we'll call `o` and `p`) from `k` and `n`. If I then divide the result `o` by `p` I should get the correct answer:


```rust
fn problem_15(mut k: u64) -> u64 {
    let mut n = k * 2;
    let mut o = 1;
    let mut p = 1;

    while k > 0 {
        o *= n;
        p *= k;
        n -= 1;
        k -= 1
    }

    o / p
}


#[test]
fn test_problem_15() {
    assert_eq!(problem_15(2), 6);
    assert_eq!(problem_15(3), 20);
    assert_eq!(problem_15(20), 137846528820)
}
```

Fortunately this cleans up my code, but unfortunately rust still 'overflows' and tells me that there isn't enough space on a `u64` integer to run this calculation. However, I figured out recently that there is such a thing as a `u128` in rust, which fortunately does fit, giving me the _actual_ right answer this time:

```rust
fn problem_15(mut k: u128) -> u128 {
    let mut n = k * 2;
    let mut o = 1;
    let mut p = 1;

    while k > 0 {
        o *= n;
        p *= k;
        n -= 1;
        k -= 1
    }

    o / p
}


#[test]
fn test_problem_15() {
    assert_eq!(problem_15(2), 6);
    assert_eq!(problem_15(3), 20);
    assert_eq!(problem_15(20), 137846528820)
}
```

**Conclusion**
I really started off the wrong foot, and I should've just started by reading the Wikipedia article about Lattice paths. That would've probably saved me a lot of time on actually trying to figure this out in my head. I did learn some new things though, and I'm glad that rust actually does have a 128-bit integer which will probably become useful in future Euler exercises or any other coding challenges.

**Sources**
\[1\] [https://en.wikipedia.org/wiki/Lattice_path](https://en.wikipedia.orgi/wiki/Lattice_path)

\[2\] [https://www.chilimath.com/lessons/intermediate-algebra/simplifying-factorials-with-variables/](https://www.chilimath.com/lessons/intermediate-algebra/simplifying-factorials-with-variables/)

\[3\] [https://www.dummies.com/education/math/algebra/how-to-simplify-factorial-expressions/](https://www.dummies.com/education/math/algebra/how-to-simplify-factorial-expressions/)
