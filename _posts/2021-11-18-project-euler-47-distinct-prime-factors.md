---
layout: post
title: "Project Euler #47: Distinct prime factors"
problem_type: euler
problem: 47
complexity: 1
---

### Introduction
"The first two consecutive numbers to have two distinct prime factors are:

```
14 = 2 × 7
15 = 3 × 5
```

The first three consecutive numbers to have three distinct prime factors are:

```
644 = 2² × 7 × 23
645 = 3 × 5 × 43
646 = 2 × 17 × 19.
```

Find the first four consecutive integers to have four distinct prime factors each. What is the first of these numbers?"

### Step 1: reusing the prime_factors method
I already made a `prime_factors` method once in the past for ["Distinct powers"](/2021/11/04/project-euler-29-distinct-powers.html), so I'll start by reusing that method. The wonderful thing about that method is that it groups together unique prime factors already. The next thing I tried was to brute-force it, but it seems like this is a bit too slow...

### Step 2: Speeding up prime_factors
This is what the `prime_factors` method currently looks like:

```rust
fn prime_factors(mut number: u64) -> Vec<(u64, u64)> {
    let mut factors: Vec<(u64, u64)> = vec![];
    let mut factor: u64 = 2;

    while number > 1 {
        if is_prime(factor) && number % factor == 0 {
            match factors.iter().position(|(a,_)| *a == factor) {
                Some(index) => factors[index].1 += 1,
                None => factors.push((factor, 1))
            }

            number /= factor;
        } else {
            factor += 1;
        }
    }
    factors
}
```

However, after some searching on the internet [1] I found a method which only cares about the total count. After some small tweaks, it returns the unique count of primes.

```rust
fn prime_factors(mut number: u64) -> u64 {
    let mut count = 0;
    let mut factor: u64 = 2;
    let mut prev_factor = 0;

    while number > 1 {
        if number % factor == 0 {
            number /= factor;

            if factor != prev_factor {
                count += 1;
            }

            prev_factor = factor;
        } else {
            factor += 1;
        }
    }
    count
}

#[test]
fn test_prime_factors() {
    assert_eq!(prime_factors(2), 1);
    assert_eq!(prime_factors(210), 4);
    assert_eq!(prime_factors(644), 3);
}
```

The brute force attempt now looks like this:

```rust
fn problem_47() -> u64 {
    let mut start: u64 = 1;
    let mut prev_len: u64 = 0;
    let mut count = 0;

    loop {
        start += 1;

        let pf = prime_factors(start);

        if pf != prev_len {
            count = 0
        }

        if pf == 4  {
            count += 1
        }

        if count == 4 {
            break start - count + 1
        }

        prev_len = pf
    }
}

#[test]
fn test_problem_47() {
    assert_eq!(problem_47(), 134043);
}
```

Another one solved!

---

### Improvements
The current solution works, but it is rather slow. It takes the code 9.23 seconds to find the answer, which is not optimal. I'm curious to see if there are ways to speed it up. Obviously, we can skip all the prime numbers, because they only have one single prime factor. However, that would've already been resolved with the `prime_factors` method.

Another way of thinking about this would be: generate prime numbers one by one, test all possible combinations of that group in some shape or way. However, the downside is that multiple of the same prime can be picked. Also, there's no way of knowing which numbers live side by side, without pushing everything into an array, sorting and testing if there are four consecutive numbers.

After some more searching, I stumble upon "The Sieve of Eratosthenes" [2] [3]. It's funny how that keeps coming back, because I almost used it for another Euler problem not that long ago. Let's give that a whirl:

```rust
fn sieve_of_eras() -> Vec<u64> {
    let n = 1_000_000;
    let mut prime_factors = vec![0; n + 1];

    for i in 2..=n {
        if prime_factors[i] == 0 {
            let mut j = i;
            while j <= n {
                prime_factors[j] += 1;
                j += i
            }
        }
    }

    prime_factors
}

fn problem_47() -> u64 {
    let mut count = 0;
    let mut prev_count = 0;
    let mut solution = 0;
    let prime_factors = sieve_of_eras();

    for (i, prime_count) in prime_factors.iter().enumerate() {
        if *prime_count != prev_count {
            count = 0;
        }

        if *prime_count == 4 {
            count += 1;
        }

        if count == 4 {
            solution = i - 3;
            break;
        }

        prev_count = *prime_count;
    }

    solution as u64
}

#[test]
fn test_problem_47() {
    assert_eq!(problem_47(), 134043);
}
```

This is considerably faster! In fact, this runs in 0.11 seconds.

Just to make the code a bit more nice looking; another way of writing `problem_47()` is by using the `each_cons()` method from ["Sub-string divisibility"](/2021/11/14/project-euler-43-sub-string-divisibility.html):

```rust
fn problem_47() -> u64 {
    let mut count = 0;
    let prime_factors = sieve_of_eras();
    let group_size = 4;

    loop {
        let group = &prime_factors[count..count + group_size];

        if group.iter().all(|&d| d == 4) {
            break count as u64
        }

        count += 1;
    }
}

#[test]
fn test_problem_47() {
    assert_eq!(problem_47(), 134043);
}
```

### Sources

\[1\] [Quora: Can you determine how many prime factors a number has without determining what they are?](https://www.quora.com/Can-you-determine-how-many-prime-factors-a-number-has-without-determining-what-they-are-For-natural-number-n-how-many-prime-factors-does-n-have)

\[2\] [Count distinct prime factors](https://stackoverflow.com/a/17638003)

\[3\] [Sieve of Eratosthenes](https://en.wikipedia.org/wiki/Sieve_of_Eratosthenes)
