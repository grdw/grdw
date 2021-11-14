---
layout: post
title: "Project Euler #28: Number spiral diagonals"
problem_type: euler
problem: 28
complexity: 1
---



The puzzle is asking us to make a 2-D vector in a spiral form and to sum up all the diagonal values of that same spiral. This seems doable, but much like ["Largest product in a grid"](/2021/10/24/project-euler-11-largest-product-in-a-grid.html), this is going to be a lot of work, or is it? Let's start with the basics of being able to make such a grid:

```rust
fn make_spiral_grid(size: u16) -> Vec<Vec<u16>> {
    vec![vec![0]]
}

#[test]
fn test_make_spiral_grid() {
    let grid = make_spiral_grid(3);
    assert_eq!(grid[1][1], 1);
}
```

There's already an interesting question appearing at this point: do I actually need to draw out the actual grid? Let's see if we can do without it. A 3x3 grid would look like this:

```
7 8 9
6 1 2
5 4 3

7 + 1 + 9 + 5 + 3 = 25
```

This is a bit interesting because it consists of the same values as the 5x5 grid, but without the outer layer. For a 1001 by a 1001 spiral, we'll know the center value is 1. The top right value of the spiral will be 1001 x 1001 = 1002001. The top left value will be 1002001 - 1000 = 1001001. You'll go down another 1000 to go to the other corner of 100001, and another 1000 to go to the other.

Another way of looking at it, is like this:

```
21 22 23 24 25
20  7  8  9 10
19  6  1  2 11
18  5  4  3 12
17 16 15 14 13

The values are:

1 + 2 = 3
3 + 2 = 5
5 + 2 = 7
7 + 2 = 9 (3x3)

9  + 4 = 13
13 + 4 = 17
17 + 4 = 21
21 + 4 = 25 (5x5)

To make it a 7x7 grid:

25 + 6 = 31
31 + 6 = 37
37 + 6 = 43
43 + 6 = 49 (7x7)
```

What is happening here is: start with a number 1, increase that number by 2 for 4 cycles, 4 for the next, 6 for the next and loop until the number equals the power of the grid size. So f.e.: we know the total value for a 3x3 grid is 25, for a 5x5 grid it's 101 and for a 7x7 grid it's 261. So, for 1001x1001 grid it's ... ?

Writing this as a method is relatively easy:

```rust
fn count_spiral_grid(size: u64) -> u64 {
    let mut start = 1;
    let mut total = 0;
    let mut increase = 2;
    let mut cycles = 0;

    while start <= size.pow(2) {
        if cycles > 0 && cycles % 4 == 0 {
            increase += 2;
        }

        total += start;
        start += increase;
        cycles += 1;
    }

    total
}

#[test]
fn test_make_spiral_grid() {
    assert_eq!(count_spiral_grid(3), 25);
    assert_eq!(count_spiral_grid(5), 101);
    assert_eq!(count_spiral_grid(7), 261);
    assert_eq!(count_spiral_grid(1001), 669171001);
}
```

It seems that for a 1001x1001 size grid, the sum of its diagonal points equals to 669171001 and upon checking the answer with the sheet, that seems to be the correct answer.


