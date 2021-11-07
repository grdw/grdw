---
layout: post
title: "Project Euler #32: Pandigital products"
euler: 32
complexity: 2
---

{% include euler.html %}

**Introduction**
Find the sum of all products whose multiplicand/multiplier/product identity can be written as a 1 through 9 pandigital.

An example they give us is:

```
39 × 186 = 7254

which contains the numbers 3,9,1,8,6,7,2,5,4 or sorted:
1,2,3,4,5,6,7,8,9
```

**Idea 1: brute forcing!**
The first brute force idea I have is to take `{1,2,3,4,5,6,7,8,9}`, generate all possible permutations and for each permutation squeeze the `x` and `=` symbols in between. So if we start off with `{1,2,3,4,5,6,7,8,9}`, the amount of sums you can make are:

```
1 * 2345678 = 9 F
1 * 234567 = 89 F
1 * 23456 = 789 F
1 * 2345 = 6789 F
1 * 234 = 56789 F
1 * 23 = 456789 F
1 * 2 = 3456789 F
12 * 345678 = 9 F
12 * 34567 = 89 F
12 * 3456 = 789 F
12 * 345 = 6789 F
12 * 34 = 56789 F
12 * 3 = 456789 F
123 * 45678 = 9 F
123 * 4567 = 89 F
123 * 456 = 789 F
123 * 45 = 6789 F
123 * 4 = 56789 F
1234 * 5678 = 9 F
1234 * 567 = 89 F
1234 * 56 = 789 F
1234 * 5 = 6789 F
12345 * 678 = 9 F
12345 * 67 = 89 F
12345 * 6 = 789 F
123456 * 78 = 9 F
123456 * 7 = 89 F
1234567 * 8 = 9 F
```

There are 28 variations per permutation, times 9! (362880) which equals to 10.160.640 possibilities. Not only is that a lot, what's also unfortunate is that quite a lot of these 10.160.640 products are false statements. Just checking the 28 I mentioned above, not one of them is correct.

**Idea 2: More brute forcing!**
Another idea I have is to start from the highest number you can make, which is: 987.654.321 and determine the divisors of said number. You'll lower by 1 each time and check if any of the unique divisor pairs and the sum are pandigital 1 till 9. Now, we can already do something a bit smarter here and start from 98.765.432 purely because 987.654.321 will never become pandigital in it's product because all the numbers 1 till 9 are already taken. Let's see how far this will get me. So first I'll steal the common divisors method from ["Amicable numbers"](/2021/10/29/project-euler-21-amicable-numbers.html) and tweak it slightly:

```rust
fn divisors(i: u64) -> Vec<u64> {
    let sqrt = (i as f64).sqrt() as u64;
    let mut total_div = vec![];
    for n in 2..=sqrt {
        if i % n == 0 {
            if n == i / n {
                total_div.push(n);
            } else {
                total_div.push(n);
                total_div.push(i / n);
            }
        }
    }
    total_div
}

#[test]
fn test_common_divisors() {
    assert_eq!(divisors(60), vec![2, 30, 3, 20, 4, 15, 5, 12, 6, 10]);
    assert_eq!(divisors(64), vec![2, 32, 4, 16, 8])
}
```

From this method we can already see very quickly which divisors won't be pandigital. So let's exclude those:

```rust
fn valid_divisors(i: u64, d1: u64, d2: u64) -> bool {
    let mut s = i.to_string();
    s.push_str(&d1.to_string());
    s.push_str(&d2.to_string());

    if s.contains('0') {
        return false
    }

    let vector: Vec<char> = s.chars().collect();
    let mut y = vector.clone();
    y.sort();
    y.dedup();

    vector.len() == y.len()
}

#[test]
fn test_valid_divisors() {
    assert_eq!(valid_divisors(7254, 39, 186), true);
    assert_eq!(valid_divisors(7254, 39, 187), false);
    assert_eq!(valid_divisors(7254, 0, 187), false);
}

fn divisors(i: u64) -> Vec<u64> {
    let sqrt = (i as f64).sqrt() as u64;
    let mut total_div = vec![];
    for n in 2..=sqrt {
        if i % n == 0 {
            if !valid_divisors(i, n, i / n) { continue };

            total_div.push(n);
            total_div.push(i / n);
        }
    }
    total_div
}

#[test]
fn test_common_divisors() {
    assert_eq!(divisors(60), vec![]);
    assert_eq!(divisors(7254), vec![39, 186]);
    assert_eq!(divisors(64), vec![]);
}
```

The next step would be to start from 98765432 and go down until 0 and see which divisors are listed. This will be slow...

```rust
fn problem_32() {
    let mut n = 98765432;
    let mut all_divisors = vec![];
    while n > 0 {
        let mut d = divisors(n);
        if !d.is_empty() {
            println!("{}", n);
            all_divisors.append(&mut d);
        }
        n -= 1;
    }
    println!("{:?}", all_divisors);
}

#[test]
fn test_problem_32() {
    problem_32()
}
```

So after some fiddling I figured that the number of the product at max can be 98765 high. This is obviously a guess, but it does get the loop started, instead of going from 98765432 (which will take forever). After that code has run (in 2.35s, which is not awful) there's a list of numbers with all divisors containing unique numbers. Now obviously some of them don't contain all numbers from 1 till 9, so we'll filter those out:

```rust
fn problem_32() -> u64 {
    let mut n = 98765;
    let mut all_ns: Vec<(u64, u64, u64)> = vec![];

    while n > 0 {
        let d = divisors(n);

        if !d.is_empty() {
            for (d1, d2) in &d {
                all_ns.push((n, *d1, *d2));
            }
        }
        n -= 1;
    }

    let mut all_factors = vec![];
    for (sum, f1, f2) in all_ns {
        let mut string = sum.to_string();
        string.push_str(&f1.to_string());
        string.push_str(&f2.to_string());

        let mut sorted: Vec<char> = string.chars().collect();
        sorted.sort();

        if sorted == vec!['1','2','3','4','5','6','7','8','9'] {
            all_factors.push(f1);
            all_factors.push(f2);
        }
    }

    all_factors.iter().sum()
}

#[test]
fn test_problem_32() {
    assert_eq!(problem_32(), 5541);
}
```

The sum of all the _products_ is 5541. The actual answer is 45228, meaning that I also need to push the totals? If I do that, the number becomes 61911, which is closer, but no cigar. So to get the actual answer you require to only add the "total product" and remove the duplicates, which gives me the right answer:

```rust
fn problem_32() -> u64 {
    let mut n = 98765;
    let mut all_ns: Vec<(u64, u64, u64)> = vec![];

    while n > 0 {
        let d = divisors(n);

        if !d.is_empty() {
            for (d1, d2) in &d {
                all_ns.push((n, *d1, *d2));
            }
        }
        n -= 1;
    }

    let mut all_factors = vec![];
    for (sum, f1, f2) in all_ns {
        let mut string = sum.to_string();
        string.push_str(&f1.to_string());
        string.push_str(&f2.to_string());

        let mut sorted: Vec<char> = string.chars().collect();
        sorted.sort();

        if sorted == vec!['1','2','3','4','5','6','7','8','9'] {
            all_factors.push(sum);
        }
    }

    all_factors.sort();
    all_factors.dedup();
    all_factors.iter().sum()
}

#[test]
fn test_problem_32() {
    assert_eq!(problem_32(), 45228);
}
```

---

**Improvements of the answer**
First up we're going to change `valid_divisors()` to this:

```rust
fn valid_divisors(i: u64, d1: u64, d2: u64) -> bool {
    let mut s = i.to_string();
    s.push_str(&d1.to_string());
    s.push_str(&d2.to_string());

    let mut vector: Vec<char> = s.chars().collect();
    vector.sort();
    vector == vec!['1','2','3','4','5','6','7','8','9']
}
```

After applying that change, we can reduce `problem_32` down quite dramatically. Alongside that change; the next thing to do is to see what the highest number in the loop is, which seems to be 7852, so we can start our loop from 7853. All in all, we can reduce `problem_32` down to:

```rust
fn problem_32() -> u64 {
    let mut n = 7853;
    let mut all_products: Vec<u64> = vec![];

    while n > 0 {
        let d = divisors(n);

        if !d.is_empty() {
            all_products.push(n);
        }
        n -= 1;
    }

    all_products.sort();
    all_products.dedup();
    all_products.iter().sum()
}

#[test]
fn test_problem_32() {
    assert_eq!(problem_32(), 45228);
}
```

Talking about refactoring! Obviously the 7853 is a magic number and feels a bit ugly. I feel this can probably be done a lot nicer, but I'll come back to it at a later point!

{% include euler_complexity.html %}
