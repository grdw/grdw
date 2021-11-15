---
layout: post
title: "Project Euler #46: Goldbach's other conjecture"
problem_type: euler
problem: 46
complexity: 1
---

**Introduction**
"It was proposed by Christian Goldbach that every odd composite number can be written as the sum of a prime and twice a square.

It turns out that the conjecture was false.

What is the smallest odd composite that cannot be written as the sum of a prime and twice a square?"

**Solution**
The loop we're going to make is a loop that starts at 1 and skips all the prime numbers and even numbers. Each prime number we encounter, we'll store inside a vector. For each next odd number we encounter we'll test if that number can be written as any of those previous primes we encountered and a square, once that condition no longer holds, we've found our answer. The method to test for this will look something like this:

```rust
fn is_prime_and_square(
    n: u64,
    primes: &Vec<u64>,
    squares: &Vec<u64>) -> bool {

    let mut goldbachs_conjecture = false;

    'outer: for p in primes {
        let t = n - p;

        for s in squares {
            let double = s * 2;

            if t < double { continue };

            if t - double == 0 {
                goldbachs_conjecture = true;
                break 'outer;
            }
        }
    }

    goldbachs_conjecture
}

#[test]
fn test_is_prime_and_square() {
    let primes = vec![2, 3, 5, 7, 11, 13];
    let squares = vec![1, 4, 9, 16, 25, 36];

    assert_eq!(is_prime_and_square(9, &primes, &squares), true);
    assert_eq!(is_prime_and_square(15, &primes, &squares), true);
    assert_eq!(is_prime_and_square(25, &primes, &squares), true);
}
```

Alongside the primes, the loop will also store all the squares it encounters, and I'll compare them with each other.

To get to the actual solution, I wrote my initial code like this:

```rust
fn problem_46() -> u64 {
    let mut start = 2;
    let mut primes = vec![];
    let mut squares = vec![1];

    loop {
        if !is_prime(start) && start % 2 == 1 {
            if !is_prime_and_square(start, &primes, &squares) {
                break start
            }
        }

        if is_prime(start) {
            primes.push(start);
        }

        squares.push(start.pow(2));

        start += 1;
    }
}

#[test]
fn test_problem_46() {
    assert_eq!(problem_46(), 5777)
}
```

Solved!

**Improvements**
The code results in the correct answer, but it takes 10.38 seconds to get to that answer. The reason for that is because the `squares`-vector becomes absurdly large. I believe it's faster to make the squares vector on the fly, and only make _double_ squares up to the value of `start`. To do that a bit smartly, I can do something like this:

```rust
let mut squares = vec![];

for p in 1..=((start / 2) as f64).sqrt() as u64 {
    squares.push(p.pow(2) * 2));
}
```

If I were to f.e. take the number 645, I don't want to create a 645 long vector with the power of 645 in there, multiplied by 2 (which is 416.025 * 2 = 832.050). The maximum number of double squares that make sense here are ~17, which is the square root of `start` divided by 2. If I were to take the power of 17 and multiply it by 2, I get 578 (which fits nicely within 645). If we go one number up, to 18, the number becomes 648, which no longer fits.

Obviously, I can squeeze that idea in my `is_prime_and_square()` method like such:


```rust
fn is_prime_and_square(n: u64, primes: &Vec<u64>) -> bool {
    let mut goldbachs_conjecture = false;
    let mut squares = vec![];

    for p in 1..=((n / 2) as f64).sqrt() as u64 {
        squares.push(p.pow(2) * 2);
    }

    'outer: for p in primes {
        let t = n - p;

        for ds in &squares {
            if t < *ds { continue };

            if t - ds == 0 {
                goldbachs_conjecture = true;
                break 'outer;
            }
        }
    }

    goldbachs_conjecture
}

#[test]
fn test_is_prime_and_square() {
    let primes = vec![2, 3, 5, 7, 11, 13];

    assert_eq!(is_prime_and_square(9, &primes), true);
    assert_eq!(is_prime_and_square(15, &primes), true);
    assert_eq!(is_prime_and_square(25, &primes), true);
}
```

By applying this, the `problem_46()` method becomes very small and very fast:

```rust
fn problem_46() -> u64 {
    let mut start = 2;
    let mut primes = vec![];

    loop {
        if start % 2 == 1 &&
           !is_prime(start) &&
           !is_prime_and_square(start, &primes) {
            break start
        }

        if is_prime(start) {
            primes.push(start);
        }

        start += 1;
    }
}

#[test]
fn test_problem_46() {
    assert_eq!(problem_46(), 5777)
}
```

It finishes in 0.14 seconds.

---

**Further improvements**
There is room for some clean-up. Mainly I see that I can squash the "double squares"-method described above, together with the inner loop of `is_prime_and_square()` like such:

```rust
fn is_prime_and_square(n: u64, primes: &Vec<u64>) -> bool {
    let mut goldbachs_conjecture = false;

    'outer: for p in primes {
        let t = n - p;
        let max = ((t / 2) as f64).sqrt() as u64;

        for n in 1..=max {
            if t - (n.pow(2) * 2) == 0 {
                goldbachs_conjecture = true;
                break 'outer;
            }
        }
    }

    goldbachs_conjecture
}

#[test]
fn test_is_prime_and_square() {
    let primes = vec![2, 3, 5, 7, 11, 13];

    assert_eq!(is_prime_and_square(9, &primes), true);
    assert_eq!(is_prime_and_square(15, &primes), true);
    assert_eq!(is_prime_and_square(25, &primes), true);
}
```

I don't think this can be squeezed into some `any()`-type of situation and resolve it in a bit more functional-programming kind of way, purely because we break the outer loop.
