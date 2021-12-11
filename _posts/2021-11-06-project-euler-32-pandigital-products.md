---
layout: post
title: "Project Euler #32: Pandigital products"
problem_type: euler
problem: 32
complexity: 2
---

### Introduction
Find the sum of all products whose multiplicand/multiplier/product identity can be written as a 1 through 9 pandigital.

An example is:

```
39 × 186 = 7254

which contains the numbers 3,9,1,8,6,7,2,5,4 or sorted:
1,2,3,4,5,6,7,8,9
```

### Idea 1: brute forcing!
My first attempt at brute forcing is to take `{1,2,3,4,5,6,7,8,9}`, generate all possible permutations and for each permutation squeeze the `x` and `=` symbols in between. If we were to start with `{1,2,3,4,5,6,7,8,9}`, the amount of sums you can make are:

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

This means there are 28 variations per permutation multiplied by 9! (362880) which equals to 10.160.640 possibilities. Not only is that a lot, what is also unfortunate is that quite a lot of these 10.160.640 products are false statements. Just checking the 28 I mentioned above, not one of them is correct.

### Idea 2: More brute forcing!
Another brute forcing idea is to start from the highest number you can make, which is: 987.654.321 and determine the divisors of said number. You'll lower by 1 each time and check if any of the unique divisor pairs and the sum are pandigital 1 till 9. Now, we can already do something a bit smarter here and start from 98.765.432 purely because 987.654.321 will never become pandigital in its product, because all the numbers 1 till 9 are already taken. First up I'll steal the common divisors method from ["Amicable numbers"](/2021/10/29/project-euler-21-amicable-numbers.html) and tweak it slightly:

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

From this method we can already see very quickly which divisors won't be pandigital; let's exclude those by checking for duplicate numbers:

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

After some fiddling I figured that a good upper bound would be 98765. This is obviously a guess, but it does get the loop started, instead of going from 98765432 (which will take forever). After that code has run (in 2.35s, which is not awful) there's a list of numbers with all divisors containing numbers consisting of unique digits. Now obviously some of them don't contain all digits from 1 till 9 (like 6 = 3 x 2), so we'll filter those out by checking if all of these pairs are in fact pandigital:

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

The sum of all the _factors_ is 5541. However, the actual answer is 45228, meaning that I also need to push the totals? If I do that, the number becomes 61911, which is closer, but no cigar. To get the actual answer you require to only add the "total product" and remove the duplicates, which gives me the right answer:

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

### Improvement #1: Combining filters
The code above contains a filter to check for duplicate digits and a filter to check if the number is pandigital. This feels redundant, and we can combine both into one single filter. `valid_divisors` can be reduced to this:

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

### Improvement #2: Change the starting off point
After implementing the improved `valid_divisors()` method, the `problem_32()`-method can be slimmed down quite dramatically. The next thing to do is to see what the highest number in the loop is, which seems to be 7852, so we can start our loop from 7853. With both those changes, we can reduce `problem_32` down to:

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

Talking about refactoring! Obviously the 7853 is a magic number and feels a bit ugly. I feel this can probably be done a lot nicer, but I'll come back to it at a later point.

---

### Improvement on the upper bound
Coming back to this code a few days later, I see that 7853 is not a valid upper bound. To revisit this:

- 987654321 is the first upper bound I picked. However, that can never result in pandigital factors, because all the numbers have already been picked once.
- 98765432 was the second candidate. However, splitting that in its factors, is also impossible because no _two factors_ exist that would make this pandigital.

The idea for the upper bound relies on the _two factors_, what are the highest two factors that you can make? If we were to take the group of digits `{1,2,3,4,5,6,7,8,9}` and start splitting them up in odds and evens, from high to low: `{9,7,5,3,1}` and `{8,6,4,2}`. Those would be the highest two factors. However, their product will always contain duplicate digits because all the digits are in use.

To think about it in another way:

```
a * b = c

Where the length needs to be:
al + bl + cl = 9 digits.

What is the max value of c?
```

I can make `c` 9 digits long, but that means `a` and `b` need to be 0 digits long, which is impossible. `c` at least needs to be 7 digits long, so `a` and `b` can be 1 digit long, but the highest 1-digit product only gives a 2-digit number (`9 * 8`). So let's reduce `c` down to a 6-digit number, meaning `a` (or `b`) will be 2 digits and `b` (or `a`) will be 1 digit long. The highest possible product would be (`87 * 9`), which is a 3-digit number, not a 6-digit number. Let's repeat this process:

```
a b c
0 0 9 ❌ impossible
1 1 7 ❌ highest product 9 * 8 = 72 (2 digits)
2 1 6 ❌ highest product 87 * 9 = 783 (3 digits)
3 1 5 ❌ highest product 876 * 9 = 7884 (4 digits)
4 1 4 ✅ highest product 8765 * 9 = 78885 (5 digits)
```

`c` needs to be a 4-digit number, to make two factors of length 1 and length 4, where the highest possible number is 9876.
