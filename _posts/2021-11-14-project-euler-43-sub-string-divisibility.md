---
layout: post
title: "Project Euler #43: Sub-string divisibility"
problem_type: euler
problem: 43
complexity: 2
---
**Introduction**
"The number, 1406357289, is a 0 to 9 pandigital number because it is made up of each of the digits 0 to 9 in some order, but it also has a rather interesting sub-string divisibility property."

It continues by stating:

- d2d3d4=406 is divisible by 2
- d3d4d5=063 is divisible by 3
- d4d5d6=635 is divisible by 5
- d5d6d7=357 is divisible by 7
- d6d7d8=572 is divisible by 11
- d7d8d9=728 is divisible by 13
- d8d9d10=289 is divisible by 17

Find the sum of all 0 to 9 pandigital numbers with this property.

**Step 1: Heap's algorithm, again**
First up I'll reuse Heap's algorithm from ["Pandigital prime"](/2021/11/12/project-euler-41-pandigital-prime.html) with the group `{0,1,2,3,4,5,6,7,8,9}` and generate all possible permutations.

**Step 2: Sub-string divisibility**
The next part is to take one of these permutations and loop over them in groups of three. If this were Ruby, this would be really easy because Ruby has an `each_cons()` method, where Rust doesn't have one. Luckily they're really easy to make:

```rust
let group_size = 2
let n = digits.len() - group_size;
let mut i = 1;

while n > i {
    let d = &digits[i..=i + group_size];
    println!("{:?}", d);
    i += 1
}
```

The next part is to take the slice `d`, turn it into an integer and check if it's divisible by any of the first 7 prime numbers, in succession. By reusing the `divisors()` method from ["Pandigital products"](/2021/11/06/project-euler-32-pandigital-products.html), I can check if any of the divisors matches. In code, this would look something like this:

```rust
fn is_divisible(digits: &Vec<char>) -> bool {
    let group_size = 2;
    let max = digits.len() - group_size;
    let primes = vec![2, 3, 5, 7, 11, 13, 17];
    let mut i = 1;

    loop {
        let d = &digits[i..=i + group_size];
        let n: u64 = d
            .iter()
            .collect::<String>()
            .parse()
            .unwrap();

        // Yeah, I know I could've just used a modulo, but
        // I only figured that out later....
        if !divisors(n).contains(&primes[i - 1]) {
            break false
        }

        i += 1;

        if i >= max {
            break true
        }
    }
}

#[test]
fn test_is_divisible() {
    let g1 = vec!['1','4','0','6','3','5','7','2','8','9'];
    let g2 = vec!['4','0','1','6','3','5','7','2','8','9'];

    assert_eq!(is_divisible(&g1), true);
    assert_eq!(is_divisible(&g2), false)
}
```

**Solving the actual problem**
I know that in the starting position of the group, `9876543210`, the sub-string divisibility rule doesn't match, so I can skip that initial permutation in Heap's algorithm. After some fiddling, the solution I get is 16695334890:

```rust
fn problem_43() -> u64 {
    let mut sum: u64 = 0;
    let mut digits = vec![
        '9', '8', '7', '6', '5', '4', '3', '2', '1', '0'
    ];

    let mut result: Vec<usize> = vec![0; digits.len()];
    let mut i = 0;

    while i < digits.len() {
        if result[i] < i {
            if i % 2 == 0 {
                digits.swap(0, i);
            } else {
                digits.swap(result[i], i);
            }

            if is_divisible(&digits) {
                let n: u64 = digits
                    .iter()
                    .collect::<String>()
                    .parse()
                    .unwrap();

                sum += n;
            }
            result[i] += 1;
            i = 0;
        } else {
            result[i] = 0;
            i += 1
        }
    }

    sum
}

#[test]
fn test_problem_43() {
    assert_eq!(problem_43(), 16695334890)
}
```

Another one solved!

---

**Speed improvements**
Getting to the answer takes the code ~13 seconds, which is not fast. The reason for this is that it has to go over 10! (3.628.800) permutations. Obviously, a lot of these I can skip by making use of the divisibility rules. For example: the divisibility rule of 2 states that a number, divisible by 2, has to end on an even number. Looking at a more complex example: for a number to be divisible by 3, the sum of its digits has to by divisible by 3 (this implies parsing, summing etc.). However, the divisibility rule for 5 states that the number has to end on a 5 or a 0.

If I were to take the simplest divisibility rules, the ones of 2 and 5, than I know that the digit on the 3rd index has to be an even number, and the digit on the 5th index has to be a 5 or a 0. Perhaps by looking at those two facts, I can speed up the code. Firstly, I'll add a method called `fits_div_rule_2_and_5()`:

```rust
fn fits_div_rule_2_and_5(digits: &Vec<char>) -> bool {
    let rule_two = digits[3].to_digit(10).unwrap();
    let rule_five = digits[5];

    rule_two % 2 == 0 && (rule_five == '5' || rule_five == '0')
}

#[test]
fn test_fits_div_rule_2_and_5() {
    let g1 = vec!['0','0','0','2','0','5','0','0','0','0'];
    let g2 = vec!['0','0','0','3','0','5','0','0','0','0'];
    let g3 = vec!['0','0','0','2','0','6','0','0','0','0'];

    assert_eq!(fits_div_rule_2_and_5(&g1), true);
    assert_eq!(fits_div_rule_2_and_5(&g2), false);
    assert_eq!(fits_div_rule_2_and_5(&g3), false)
}
```

Secondly, I'll add this method _before_ checking if the permutation is divisible by primes in `problem_43()` like this:

```rust
if fits_div_rule_2_and_5(&digits) && is_divisible(&digits) {
    let n: u64 = digits
        .iter()
        .collect::<String>()
        .parse()
        .unwrap();

    sum += n;
}
```

Let's see how much faster `problem_43()` becomes by applying this change:

```
Before:
  time cargo test problem_43
  cargo test problem_43  13.52s user 0.07s system 100% cpu 13.565 total

After:
  time cargo test problem_43
  cargo test problem_43  3.44s user 0.09s system 100% cpu 3.498 total
```

It shaves of 10 whole seconds!

**Another speed improvement in divisors**
Another improvement I see is in the `is_divisors()` and `divisors()` methods. Currently, we're grabbing _all_ divisors, which is obviously a bit too much. If we find one of the matching prime numbers, the code can stop checking for further divisors:

```rust
fn divisible_by_prime(i: u64, p: u64) -> bool {
    let sqrt = (i as f64).sqrt() as u64;
    let mut has_divisor_p = false

    for n in 2..=sqrt {
        if i % n == 0 && p == n {
            has_divisor_p = true;
            break;
        }
    }

    has_divisor_p
}
```

Not only does this return a simple boolean, it also saves storing a lot of pointless vectors. Let's see if this shaves off time:

```
After improvement #1:
  time cargo test problem_43
  cargo test problem_43  3.44s user 0.09s system 100% cpu 3.498 total

After improvement #2:
  time cargo test problem_43
  cargo test problem_43  2.44s user 0.08s system 100% cpu 2.506 total
```

It saves us a whole second, which is always nice.

Another thing I noticed is that the whole `divisible_by_prime` method is a bit redundant, and can be replaced with a modulo. It shaves off half a second again, which is nice. In total, I managed to reduce 11.5 seconds:

```
Before:
  time cargo test problem_43
  cargo test problem_43  13.52s user 0.07s system 100% cpu 13.565 total

After:
  time cargo test problem_43
  cargo test problem_43  1.89s user 0.02s system 99% cpu 1.910 total
```

As far as speed improvements go, this is fine for me.