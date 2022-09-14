---
layout: post
title: "Project Euler #61: Cyclical figurate numbers"
problem_type: euler
problem: 61
complexity: 3
---

### Introduction

> The ordered set of three 4-digit numbers: 8128, 2882, 8281, has three interesting properties.
>
> 1. The set is cyclic, in that the last two digits of each number is the first two digits of the next number (including the last number with the first).
> 2. Each polygonal type: triangle (P3,127=8128), square (P4,91=8281), and pentagonal (P5,44=2882), is represented by a different number in the set.
> 3. This is the only set of 4-digit numbers with this property.
>
> Find the sum of the only ordered set of six cyclic 4-digit numbers for which each polygonal type: triangle, square, pentagonal, hexagonal, heptagonal, and octagonal, is represented by a different number in the set.

### To start

The scope of this problem is rather small. There are only 8999 (1000 till 9999) numbers that are four digits in length. However, there are some special cases which can already be discarded, f.e. the number 1000. There's no four-digit number out there that starts with two 00s. When we filter off all the numbers that are divisible by 100, we are left with 8910 numbers.

The puzzle gives the functions to calculate the ranges of triangle- , square- etc. numbers. First, let's generate all the lists of four-digit numbers that fall into each category. After writing some Rust, my very basic code looks like such:

```rust
const MIN: u32 = 1000;
const MAX: u32 = 9999;

fn is_useful(n: u32) -> bool {
    n >= MIN && n <= MAX && n % 100 != 0
}

fn create_list(func: &dyn Fn(u32) -> u32) -> Vec<u32> {
    let mut n = 1;
    let mut list = vec![];
    loop {
        let t = func(n);

        if t > MAX {
            break;
        }

        if is_useful(t) {
            list.push(t)
        }

        n += 1
    }

    list
}

fn triangle(n: u32) -> u32 {
    n * (n + 1) / 2
}

fn square(n: u32) -> u32 {
    n * n
}

fn pentagonal(n: u32) -> u32 {
    (n * ((3 * n) - 1)) / 2
}

fn hexagonal(n: u32) -> u32 {
    n * ((2 * n) - 1)
}

fn heptonal(n: u32) -> u32 {
    (n * ((5 * n) - 3)) / 2
}

fn octagonal(n: u32) -> u32 {
    n * ((3 * n) - 2)
}
```

I can call `create_list` with any of the 6 functions to create a group of four-digit numbers that are either triangle, square, pentagonal, etc. What catches my attention is that the group of numbers become smaller the further you go. There are 96 triangle numbers with four digits, but only 38 octagonal numbers.

```
{Tr, Sq, Pe, Hex, Hep, Oct}
```

We'll start from the lowest `Tr` and find the next matching `Sq`. If no `Sq` can be found, move to the next `Tr` etc. until the group is complete. We have to look out that whatever number we pick, it has to be unique to the group and have matching digits.

While starting to write some code, I find my first bug. It seems like doing `n % 100 != 0` doesn't filter off any garbage four-digit numbers. Numbers like 9801 are also false, because a four-digit number can't start with "01". The correct way to filter these off is of course to check if the tens-value is higher than 9 (so `n % 100 > 9`).

### My approach

As you might have guess from the above; at first I misread this puzzle, and thought that the set was ordered. This is _not_ the case, and I lost quite a bit of time only to realize there's no group of numbers out there in an ordered sequence of `{Tr, Sq, Pe, Hex, Hep, Oct}`. The group can be in _any_ order, as long as it uses one number from each of the groups.

```rust
let list = vec![
    create_list(&triangle),
    create_list(&square),
    create_list(&pentagonal),
    create_list(&hexagonal),
    create_list(&heptagonal),
    create_list(&octagonal)
]
```

The way I resolved it is to first make a list of all the 6 possible groups of 4 digits numbers (as seen above). I decided to start from the triangle numbers, but you can start from any of the lists in reality, considering the group is "circular". Imagine the list is `[1010, 2010, 3010]`, I'll turn this into `[[(1010, 0)], [(2010, 0)], [(3010, 0)]]`. The 0 here denotes the list, and each individual 'array' is the start of a 'route'.

The idea is to append a matching route from one of the other lists (which hasn't already been picked) to every other route. If multiple options are possible, we duplicate the route with the matched route added.

The next step is to filter off any of the routes which didn't end up having any next route. We keep on repeating this process until all the routes are at the length of 6.

The final step is to check which route "digit matches" between the first and last digit (to make it fully circular).

The full code looks like:

```rust
let mut length = 1;
let mut routes: Vec<Vec<(u32, usize)>> = list[0]
    .iter()
    .map(|v| vec![(*v, 0)] )
    .collect();

loop {
    for route_index in 0..routes.len() {
        let route = &routes[route_index];
        let last_el = route[route.len() - 1].0;
        let skipped_indexes: Vec<usize> = route
            .iter()
            .map(|(_, li)| *li)
            .collect();

        for li in 0..list.len() {
            if skipped_indexes.contains(&li) {
                continue;
            }

            for n in &list[li] {
                if digit_match(&last_el, n) {
                    let mut new_route = routes[route_index].clone();
                    new_route.push((*n, li));

                    routes.push(new_route);
                }
            }
        }
    }

    routes.retain(|v| v.len() > length - 1);
    length += 1;

    if length > list.len() {
        break;
    }
}
```

And the final step:

```rust
// Test if there's a route that's circular
for route in &routes {
    if digit_match(&route[5].0, &route[0].0) {
        return route
            .iter()
            .map(|(n, _)| n)
            .sum::<u32>()
    }
}
```

The solution ends up being 28684, which is the correct answer!

It resolves in 0.05 seconds which is fast enough for me.
