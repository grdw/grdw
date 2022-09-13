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

... I'll write a method that confirms the above predicate, and which can do that rather fast. I have no idea how to resolve this, but I have to start somewhere. Furthermore, I'll take an `is_prime()` method from many a previous Euler assignment, and write my own `is_prime_pair_set()` method. My first attempt looks like such:

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

Obviously, we can make this a bit faster because the pairs of "3 and 11" are "311" and "113" which are the same pairs as "11 and 3" but in a different order. Both look the same, and don't have to be checked again. To make it slightly more optimal:

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

We could keep on increasing the right-most prime numbers, until a small "prime pair set" group starts to form. The initial group obviously isn't a "prime pair set". Also, the only possible prime value that we can change here in order to keep the prime group unique, is the last value. We can change that to 13, and keep on making the smallest possible increase to the numbers in the group until we find our solution. However, what is the smallest possible increase?

Another possible tactic is starting out with a group that looks like this:

```
{2, X1, X2, X3, X4}
```

We keep on changing `X1` until the prime pair set predicate holds true, and do the same for `X2`, `X3` and `X4`. The downside here is that we can get a group of primes which aren't necessarily the lowest sum. It could very well be that starting out with 3 or 5 or 7 or 11, instead of 2, gives us a range of prime numbers that sum up to something lower. Starting out with f.e. 2, can produce an upper bound. If any of the primes we pick exceed the previous upper bound, we can already quit and continue on with another prime number as the starting value. If we find anything lower, we save that value and use that as the "new upper bound". If our starting prime number (the first one of the group) equals to the dynamic upper bound, we can reasonably quit and assume that must be the lowest sum.

One little side note, we have to probably start from 3. Because starting from 2 will always make a number divisible by 2 and itself, which makes it a non-prime per definition. Another problematic prime number is 5, since the division rule of 5 prevents any of the concatenated groups from ever becoming a prime.

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
    assert_eq!(problem_60(5), 1); // I don't know the result
}
```

This resolves pretty quickly for a group of 4, and I actually get the correct value as described in the puzzle. But it takes a horrible amount of time to find a fifth number; high-likely because there isn't one. To prevent it from looking forever, I'm setting a static upper bound of `1_000_000`. Obviously, this is completely baseless, but it will prevent the code from looking till infinity and beyond for another prime number. If it hits the upper bound, I will reset the index to 1 and drop the rest of the values (where index > 1) from the group. The code should change `[3, 7, X2, X3, X4]`, to `[3, 11]` and continue from this new starting group. After implementing this, the code looks like this:

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

After leaving this running, it produced a result of 98003.

However, like I described earlier, this can be the highest possible value for a starting value of 3. But perhaps for 7 it will give us a lower value. Now that I know that the maximum is below 100K, I'll set the limit to 100K to make the algorithm a lot faster. Still with 100K as the upper bound, finding the first group takes a whopping 16.42 seconds, which is rather painful. I let the code run for another while until the first value of the group goes over the upper bound. Running this code, however, becomes rather painful performance wise, so perhaps 98003 is the answer? Spoiler alert: it isn't.

After letting this newer code run for a while, I'm seeing that there's definitely another group of 5 primes, starting with 13, which produces a lower upper bound. In the meantime, instead of calculating the next prime, I'll be using a sieving function to determine the next prime. This should be quite a bit faster. However, this is still painfully slow because of the height of the prime numbers it needs to validate. The highest can be a concatenation of 99.999 and 99.9999 because of my initial upper bound. Still, I'll use it to determine the next prime in the group, but I won't be using it to validate if a prime number is actually a prime number for my prime pair set function I wrote earlier.

With 13 as the initial prime in the group, a value appears of 26033, which is high likely the correct answer. I stop the code because it has to run for 15-20 minutes to even resolve all the possible prime groups with 13, that sum up to below 98003. The full code now looks like this:

```rust
fn problem_60(size: usize) -> u64 {
    let primes = sieve_of_erato(1_000_000);
    let mut upper_bound = 100_000;
    let mut group = vec![];
    let mut index = 0;
    let mut start = 0;

    loop {
        match group.get(index) {
            Some(_) => {
                group[index] = find_next(group[index], &primes)
            }
            None => {
                let value = if index > 0 {
                    group[index - 1]
                } else {
                    start
                };

                group.push(find_next(value, &primes))
            }
        }

        let total = group.iter().sum();

        if is_prime_pair_set(&group) {
            if group.len() == size {
                if total < upper_bound {
                    println!("🥁 {}", total);
                    group.truncate(1);
                    index = 0;
                    start = find_next(start, &primes);
                    upper_bound = total;
                }
                continue;
            }

            index += 1;
        }

        if group[0] > upper_bound {
            break;
        }

        // Piss poor reset function
        if total > upper_bound {
            if index < 3 {
                group.truncate(1);
                index = 0;
            } else {
                println!("{} {:?}", index, group);
                group.truncate(2);
                index = 1;
            }

        }
    }

    upper_bound
}
```

It's not the best looking code, and I'm not proud of it either, but it does give a result at some point. I'm kind of curious if extending the sieve till `10_000_000_000` will have a negative effect (to make the test for `is_prime` a bit faster).

### The 10_000_000_000 length array

Considering that these are all booleans, I'm kind of curious how much memory this will slurp. However, running this blurb of code ...

```rust
let sieve = sieve_of_erato(10_000_000_000);
```
... will for sure break your computer, and dumping this in some variable is going to eat way too much memory. Next idea!

### Caching the primes

I'm probably checking a lot of primes that I've already seen before in one shape or another, so it might be an idea to cache the known culprits.

With a simple `HashSet` as my cache, the code resolves in 121.41s, which is still a tad slow, but it does actually resolve in a reasonable time. That's to say, it performs better than > 60 minutes (I have no idea how slow the code above is, because I've been way to impatient to let it finish). The full code including the caching can be seen in the GitHub link below. On another machine, which has better specs, it finishes in 64.08s.

If I however compile the actual project with `cargo build --release` and run the optimized release binary, it manages to resolve in 5.01s. This is fast enough for my taste, but perhaps it can be done faster in some other shape or way. I will return to this one, because it is actually quite an interesting challenge. To be continued ...
