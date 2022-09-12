---
layout: post
title: "Project Euler #60: Prime pair sets"
problem_type: euler
problem: 60
complexity: 3
---

### Introduction

This is the full description of the puzzle:

> The primes 3, 7, 109, and 673, are quite remarkable. By taking any two primes and concatenating them in any order the result will always be prime. For example, taking 7 and 109, both 7109 and 1097 are prime. The sum of these four primes, 792, represents the lowest sum for a set of four primes with this property.
>
> Find the lowest sum for a set of five primes for which any two primes concatenate to produce another prime.

### Firstly ...

I'll write a method that confirms the above, and can do that rather faster. I have no idea how to resolve this, but I have to start somewhere. I'll take an `is_prime()` method from many a previous euler assignment, and write my own `is_prime_pair_set()` method. This method looks like:

```rust
fn is_prime_pair_set(primes: Vec<u64>) -> bool {
    for i in 0..primes.len() {
        for j in 0..primes.len() {
            if primes[i] == primes[j] {
                continue;
            }

            let first_con = format!("{}{}", primes[i], primes[j])
                .parse::<u64>()
                .unwrap();

            let second_con = format!("{}{}", primes[j], primes[i])
                .parse::<u64>()
                .unwrap();

            if !is_prime(first_con) {
                return false
            }

            if !is_prime(second_con) {
                return false
            }
        };
    };

    true
}

#[test]
fn test_prime_pair_set() {
    assert_eq!(is_prime_pair_set(vec![3, 11, 109, 673]), false);
    assert_eq!(is_prime_pair_set(vec![3, 7, 109, 673]), true);
}
```

Obviously, we can make this a bit faster because the pairs of "3 and 11" are "311" and "113" which are the same pairs as "11 and 3" but in a different order. Both look the same, and don't have to be checked again. To make it slighty more optimal:

```rust
for i in 0..primes.len() {
    for j in (i+1)..primes.len() {
        let first_concat = format!("{}{}", primes[i], primes[j])
            .parse::<u64>()
            .unwrap();

        let second_concat = format!("{}{}", primes[j], primes[i])
            .parse::<u64>()
            .unwrap();

        if !is_prime(first_concat) {
            return false
        }

        if !is_prime(second_concat) {
            return false
        }
    };
};
```

Now that the easy part is out of the way, let's figure out the rest. Which five primes do we have to look for, and how do we find them? Assuming we have a group of the first lowest five primes:

```
{2, 3, 5, 7, 11}
```

These are obviously not a "prime pair set". Also, the only possible prime value that we can change here in order to keep the prime group unique, is the last value. We can change that to 13, and keep on making the smallest possible increase to the numbers in the group until we find our solution. However, what is the smallest possible increase?

Another possible tactic is starting out with a group that looks like:

```
{2, X1, X2, X3, X4}
```

We keep on changing `X1` until the prime pair set predicate holds true, and do the same for `X2`, `X3` and `X4`. The downside here is that we can get a group of primes which aren't necessarily the lowest sum. It could very well be that starting out with 3 or 5 or 7 or 11, instead of 2, gives us a range of prime numbers that sum up to something lower. Starting out with 2, does give us an upper bound. If any of the primes we pick exceed the previous upper bound, we can already quit and continue on with another prime number as the starting value. If we find anything lower, we save that value and use that as the "new upper bound". If our starting prime number (the first one of the group) equals to the dynamic upper bound, we can reasonably quit and assume that must be the lowest sum.

One little side note, we have to probably start from 3. Because starting from 2 will always make a number divisible by 2 and itself, which makes it a non-prime per definition.

My first attempt looks like this:

```rust
fn problem_60(size: usize) -> u64 {
    let mut group = vec![3, 5];
    let mut index = 1;

    loop {
        group[index] = next_prime(group[index]);

        if is_prime_pair_set(&group) {
            if index == size - 1 {
                break;
            }

            let next_prime = next_prime(group[index]);
            group.push(next_prime);
            index += 1;
        }

        println!("{:?}", group);
    }

    group.iter().sum()
}

#[test]
fn test_problem_60() {
    assert_eq!(problem_60(4), 792);
    assert_eq!(problem_60(5), 792);
}
```

This resolves pretty quickly for a group of 4, and I actually get the correct value as described in the puzzle. But it takes a horrible amount of time to find a fifth number; high-likely because there isn't one. To prevent it from looking forever, I'm setting a static upper bound of `1_000_000`. Obviously this is completely baseless, but it will prevent the code from looking till infinity and beyond for another prime number. After implementing this, the code looked like such:

```rust
let mut max = 1_000_000;
let mut group = vec![2];
let mut index = 0;

loop {
    group[index] = next_prime(group[index]);

    if is_prime_pair_set(&group) {
        if index == size - 1 {
            let total = group.iter().sum();

            if total < max {
                max = total
            }

            break;
        }

        let next_prime = next_prime(group[index]);
        group.push(next_prime);
        index += 1;
    }

    if group.iter().sum::<u64>() > max {
        for i in 1..index { group.pop(); }
        index = 1;
    }

    println!("{:?}", group);
}

max
```

This produced a result of 98003.

Like I described earlier, this can be the highest possible value for a starting value of 3. But perhaps for 5 it will give us a lower value. Now that I know that the maximum is below 100K I'll set the limit to 100K to make it a lot faster. Still with 100K as the upper bound, finding the first group takes a whopping 16.42 seconds, which is rather painful. I let the code run for another while until the first value of the group goes over the `max`. This doesn't exactly run in a timely fashion.... so perhaps 98003 is the answer? Spoiler alert: it isn't.

There's definitely another group of 5, starting with 13 as the prime number, which produces a lower upper bound. However, considering this is such a slow route. I decide to go with my first idea, and see if that will be any faster.
