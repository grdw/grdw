---
layout: post
title: "Project Euler #50: Consecutive prime sum"
problem_type: euler
problem: 50
complexity: 2
---

### Introduction
"Which prime, below one-million, can be written as the sum of the most consecutive primes?"

### Part 1: Sieve of Eratosthenes
To generate all the primes under 1.000.000, I'll be using a sieve. The reason for this, is because it's a faster method of generating prime numbers than using a standard for loop and checking each individual number. The sieve of Eratosthenes goes something like this:

```rust
fn sieve_of_erato(n: usize) -> Vec<bool> {
    let mut primes = vec![true; n + 1];
    let max = (n as f64).sqrt() as usize;

    for i in 2..=max {
        if primes[i] {
            let mut j = i.pow(2);
            while j <= n {
                primes[j] = false;
                j += i
            }
        }
    }

    primes
}

#[test]
fn test_sieve_of_erato() {
    let sieves = sieve_of_erato(20);
    assert_eq!(sieves[2], true);
    assert_eq!(sieves[4], false);
}
```

It generates a vector of the first 1.000.000 primes in 0.1s, which is quite fast.

### Part 2: Each consecutive
The puzzle is looking for consecutive groups of primes, meaning we have to write an `each_cons()`-loop. At first my idea was to take the method from ["Substring divisibility"](/2021/11/14/project-euler-43-sub-string-divisibility.html), however this method proves to be a tad slow, especially since we have to sum each subgroup, while increasing the group size. A couple of smart things we can do:

- The subgroup size (or chain length, as it is called in the code) can start at 21, as the problem statement gives us that fact as a handlebar.
- Because we need to sum, we only need to take the first 21 digits to sum the first group. In a for loop, we'll add the next digit on top, remove the previous digit from the original group; repeat until we're at the end.

To show the second point in code:

```rust
// Slow variation
let max_l = primes.len() - chain_length;

for p in 1..max_l {
    let mut sum: usize = primes[p..p + chain_length].iter().sum();

    // Test if sum is prime
}
```

```rust
// Fast variation
let max_l = primes.len() - chain_length;
let mut sum: usize = primes[0..chain_length].iter().sum();

for p in 1..max_l {
    sum += primes[p - 1 + chain_length];
    sum -= primes[p - 1];

    // Test if sum is prime
}
```

### Nitting it together
The full code goes something like this: firstly, I'll use the sieve of Eratosthenes, to generate a list of the first primes under 1.000.000. The next part is where I'll create an unspecified loop (since I've no idea what the max chain length is going to be), where we add 1 to `chain_length` each cycle and test if any of the consecutive groups of primes is a prime. If it is, store it in `max_prime`. Once the initial sum, becomes higher than 1.000.000, stop the loop, because there's no point in continuing any further.

```rust
const MAX_N: usize = 1_000_000;

fn problem_50() -> u64 {
    let mut chain_length = 21;
    let mut max_prime = 0;

    let sieve = sieve_of_erato(MAX_N);
    let mut primes = vec![];

    for n in 2..sieve.len() {
        if sieve[n] {
            primes.push(n);
        }
    }

    loop {
        let max_l = primes.len() - chain_length;
        let mut sum: usize = primes[0..chain_length].iter().sum();

        // If the initial sum goes over 1m, stop!
        if sum > MAX_N {
            break;
        }

        for p in 1..max_l {
            sum += primes[p - 1 + chain_length];
            sum -= primes[p - 1];

            if sum < sieve.len() && sieve[sum] {
                max_prime = sum;
            }
        }

        chain_length += 1;
    }

    max_prime as u64
}

#[test]
fn test_problem_50() {
    assert_eq!(problem_50(), 997651);
}
```

Solved!
