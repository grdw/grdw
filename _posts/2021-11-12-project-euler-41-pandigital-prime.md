---
layout: post
title: "Project Euler #41: Pandigital prime"
problem_type: euler
problem: 41
complexity: 2
---



**Introduction**
"We shall say that an n-digit number is pandigital if it makes use of all the digits 1 to n exactly once. For example, 2143 is a 4-digit pandigital and is also prime.

What is the largest n-digit pandigital prime that exists?"

**is_prime() and is_pandigital()**
We'll reuse the `is_prime()` method from previous Euler exercises and add another method, `is_pandigital()` to the mix. The idea here is to brute-force the solution. The `is_pandigital()` method will look something like this:

```rust
fn is_pandigital(number: u64) -> bool {
    let n: Vec<char> = number.to_string().chars().collect();
    let mut v = n.clone();
    v.sort();
    v.dedup();

    n.len() == v.len()
}

#[test]
fn test_is_pandigital() {
    assert_eq!(is_pandigital(1), true);
    assert_eq!(is_pandigital(11), false);
    assert_eq!(is_pandigital(21), true);
}
```

**Commence the brute-forcing!**
The highest possible pandigital number you can make is `987654321` so if we start from there and go backwards by one, we only need to stop once we find the first prime pandigital number that matches. While starting to work towards the solution, I figured `0` is not allowed as a digit and my `is_pandigital()` method isn't accounting for that situation. After tweaking it, this is the brute-forcing attempt:

```rust
fn problem_41() -> u64 {
    let mut max = 987654321;

    loop {
        if is_prime(max) && is_pandigital(max) {
            break max
        }

        max -= 1
    }
}
```

*COUGH COUGH*, this isn't a success, let me tell you. It's painfully slow and after running this loop for over 5 minutes there still is no answer. I probably need to use a different method of generating prime numbers or I need to always make pandigital numbers. Let's try the last method.

**Always making pandigital numbers**
A pandigital number is a number from 1 till n with only unique digits. If we are to count them from low to high, it goes something like this:

```
1 till 9
12 till 19
21,23 till 29
31,32,34 till 39
41,42,43,45 till 49
```

My first question is, is there a number which uses all digits 1 till 9 which also happens to be a prime number? Let's try and figure that out by using one of the many permutation algorithms I used in ["Lexicographic permutations"](/2021/10/30/project-euler-24-lexicographic-permutations.html). Using Heap's algorithm, this is what I get:

```rust
let mut vector = vec!['1', '2', '3', '4', '5', '6', '7', '8', '9'];
let mut result: Vec<usize> = vec![0; vector.len()];
let mut i = 0;

let n: u64 = vector.iter().collect::<String>().parse().unwrap();
if is_prime(n) {
    println!("{}", n);
}

while i < vector.len() {
    if result[i] < i {
        if i % 2 == 0 {
            vector.swap(0, i);
        } else {
            vector.swap(result[i], i);
        }

        let n: u64 = vector.iter().collect::<String>().parse().unwrap();
        if is_prime(n) {
            println!("{}", n);
        }
        result[i] += 1;
        i = 0;
    } else {
        result[i] = 0;
        i += 1
    }
}
```

Not a single thing got printed, so it seems like there's not a single permutation of `{1,2,3,4,5,6,7,8,9}` which is a prime number. The next step is to arbitrarily drop digits from this list and try this method again and again. First, I put the Heap permutation algorithm inside a `highest_heap_prime`-method like this:

```rust
fn highest_heap_prime(mut vector: Vec<char>) -> u64 {
    let mut max: u64 = 0;
    let mut result: Vec<usize> = vec![0; vector.len()];
    let mut i = 0;

    let n: u64 = vector
        .iter()
        .collect::<String>()
        .parse()
        .unwrap();

    if is_prime(n) {
        max = n;
    }

    while i < vector.len() {
        if result[i] < i {
            if i % 2 == 0 {
                vector.swap(0, i);
            } else {
                vector.swap(result[i], i);
            }

            let n: u64 = vector
                .iter()
                .collect::<String>()
                .parse()
                .unwrap();

            if n > max && is_prime(n) {
                max = n;
            }
            result[i] += 1;
            i = 0;
        } else {
            result[i] = 0;
            i += 1
        }
    }

    max
}
```

You can give the method any vector, it will make every permutation of said vector and return the highest prime number it can make from any unique combination of digits. This way we can resolve problem 41 like such:

```rust
fn problem_41() -> u64 {
    let mut vector = vec!['1', '2', '3', '4', '5', '6', '7', '8', '9'];
    let mut max = 0;

    for n in 0..vector.len() {
        let l = vector.remove(n);
        let hhp = highest_heap_prime(vector.clone());
        if hhp > max {
            max = hhp;
        }
        vector.insert(n, l);
    }

    max
}

#[test]
fn test_highest_pandigital_prime() {
    assert_eq!(problem_41(), 98765431)
}
```

The answer I get from this code is 98765431, which is incorrect. Looking back at the assignment in combination with the correct answer of 7652413, I spot my mistake. You have to check the numbers 1 *to* n, which means 98765431 obviously isn't a candidate. As soon as the 9 doesn't fit, it can be dropped off, which is even nicer. After some fiddling, this is the final working code:

```rust
fn problem_41() -> u64 {
    let mut vector = vec!['9', '8', '7', '6', '5', '4', '3', '2', '1'];
    let mut max = 0;

    for _ in 0..vector.len() {
        vector.remove(0);

        let hhp = highest_heap_prime(vector.clone());
        if hhp > max {
            max = hhp;
            break;
        }
    }

    max
}

#[test]
fn test_highest_pandigital_prime() {
    assert_eq!(problem_41(), 7652413)
}
```


