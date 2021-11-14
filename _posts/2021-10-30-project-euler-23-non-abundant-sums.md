---
layout: post
title: "Project Euler #23: Non-abundant sums"
problem_type: euler
problem: 23
complexity: 3
---



**Introduction**
The puzzle is very clear: "Find the sum of all the positive integers which cannot be written as the sum of two abundant numbers." The puzzle specifies that all these numbers are below 28123. The problem consists of these parts, as far as I can see:

- Find all the abundant numbers up till 28123
- Add all the possible abundant numbers together in every which way and create a set X. Skip all the values that are > 28123.
- Loop over 0 till 28123, if the number is in the set X reject it and sum the total.

**Step 1: finding all abundant numbers**
Finding all abundant numbers is relatively straight forward. You start be creating a method to see which number is abundant. This method is a slightly altered variation from the method in ["Amicable numbers"](/2021/10/29/project-euler-21-amicable-numbers.html).

```rust
fn abundant(i: u32) -> bool {
    let sqrt = (i as f64).sqrt() as u32;
    let mut total_div = 1;
    for n in 2..=sqrt {
        if i % n == 0 {
            total_div += n + (i / n);
        }
    }
    total_div > i
}

#[test]
fn test_abundant() {
    assert_eq!(abundant(12), true);
    assert_eq!(abundant(28), false);
}
```

To grab all the possible abundant numbers do:

```rust
let all_abundant: Vec<u32> = (12..28123)
    .filter(|&n| abundant(n))
    .collect();
```

However, upon checking the list I see that I have a little bug. I see that 16 is in the list of abundant numbers, while it clearly isn't (1 + 2 + 4 + 8 = 15). The reason why I get this bug is because my code is doing 1 + 2 + 8 + 4 + 4 which is 18. For each number that is a perfect square I need to make an exception:

```rust
// There's probably a way to incorporate sqrt into
// the solution, but this is a little easier:
fn abundant(i: u32) -> bool {
    let sqrt = (i as f64).sqrt() as u32;
    let mut total_div = 1;
    for n in 2..=sqrt {
        if i % n == 0 {
            let total = if n == i / n {
                n
            } else {
                n + (i / n)
            };

            total_div += total;
        }
    }
    total_div > i
}

#[test]
fn test_abundant() {
    assert_eq!(abundant(12), true);
    assert_eq!(abundant(16), false);
    assert_eq!(abundant(28), false);
}
```

**Step 2: Creating the set**
Creating the set of all double abundant numbers, in theory should go something like this:

```rust
for i in &all_abundant {
    for j in &all_abundant {
        let sum = i + j;
        if sum < 28123 {
            sum_abundant.push(sum);
        }
    }
}
```

However, this is not the ideal way as it's very slow, considering there are 6965 abundant numbers, this will result in 6965^2 loop cycles. Added to the slowness, this is going to give duplicates. To reduce duplicates we need to do something clever. I'm going to start with some debugging by only checking the first 5 and see what they amount to:

```rust
for i in &all_abundant[0..5] {
    println!("-- {}", i);
    for j in &all_abundant[0..5] {
        let sum = i + j;
        println!("{} + {} = {:?}", i, j, sum);
        if sum < 28123 {
            sum_abundant.push(sum);
        }
    }
}
```

The first thing I notice is that `i * 2` can be added in one go and doesn't need to be calculated through the loop (saving 6965 loop cycles):

```rust
for i in &all_abundant[0..5] {
    println!("-- {}", i);
    sum_abundant.push(i * 2);
    for j in &all_abundant[0..5] {
        if i == j {
            continue
        }

        let sum = i + j;
        println!("{} + {} = {:?}", i, j, sum);
        if sum < 28123 {
            sum_abundant.push(sum);
        }
    }
}
```

The next thing I notice is that if `i <= j` I can skip all the other cycles as they'll happen in another f.e. when i = 12, in the next cycle j will appear as 18. This will also happen when i = 18. 12 + 18 is the same as 18 + 12 so that seems a bit redundant. Rewriting the loops a little and skipping the previous N items in the list, saves quite a lot of loop cycles. Additionally, we can stop the inner loop once the sum crosses the MAX (28123).

```rust
for i in 0..all_abundant.len() {
    for j in i..all_abundant.len() {
        let sum = all_abundant[i] + all_abundant[j];

        if sum < MAX {
            sum_abundant.push(sum);
        } else {
            break;
        }
    }
}
```

The weird thing is that you'd expect an array with less than 28123 items, but somehow, with this code, we end up with an array of `12_148_811` items, which is not what we want. There are probably tons of duplicates still floating around which we need to filter out.

The next thing I came up with is this:

```rust
// const MAX:u32 = 28123;

let mut lowest_double_abundant: Vec<u32> = all_abundant
    .iter()
    .map(|n| n * 2)
    .filter(|&m| m < MAX)
    .collect();

for i in 0..lowest_double_abundant.len()-1 {
    for j in 0..all_abundant.len() {
        let n = lowest_double_abundant[i];
        let m = lowest_double_abundant[i + 1];
        let o = (n / 2) + all_abundant[j];

        if o > n && o < m {
            lowest_double_abundant.push(o);
        }
    }
}
println!("{:?}", lowest_double_abundant.len());
```

So first I create the full list of the lowest double abundant numbers. When I loop over all the numbers, I check which abundant numbers can be added to a double abundant number without exceeding the next double abundant number. This gives me a set of 8253 numbers.

**Step 3: Filtering out the set**
The last step feels rather trivial but here it is:

```rust
let mut total = 0;
for i in 1..=MAX {
    if !lowest_double_abundant.contains(&i) {
        total += i;
    }
}
```

This gives me a total of `279_501_778` which seems way too high. Upon checking the answer 4179871, this seems to be the case. I clearly screwed up a thing or two, so it seems.

**Rabbit hole #1**
My original plan doesn't work quite as expected, and I seem to be missing quite a lot of numbers. Let's go back to step 1, and perhaps we can find a good solution. The problem clearly tells me about perfect numbers and deficient numbers, so I'll add tests for those, not quite sure how they'll come into play just yet.

```rust
fn sum_divisors(i: u32) -> u32 {
    let sqrt = (i as f64).sqrt() as u32;
    let mut total_div = 1;
    for n in 2..=sqrt {
        if i % n == 0 {
            let total = if n == i / n {
                n
            } else {
                n + (i / n)
            };
            total_div += total;
        }
    }
    total_div
}

fn abundant(i: u32) -> bool {
    sum_divisors(i) > i
}

fn perfect(i: u32) -> bool {
    sum_divisors(i) == i
}

fn deficient(i: u32) -> bool {
    sum_divisors(i) < i
}
```

Maybe an abundant number + another abundant number is always another abundant number? This seems to not be the case, but there's an odd pattern emerging when debugging this a little:

```rust
println!("    {:?}", &all_abundant[0..16]);
for n in &all_abundant[0..16] {
    print!("{} =", n);
    for m in &all_abundant[0..16] {
        let sum = n + m;
        //print!("{} + {} = {}", n, m, sum);

        if perfect(sum) {
            print!(" P, ");
        } else if deficient(sum) {
            print!(" D, ");
        } else if abundant(sum) {
            print!(" -, ");
        }
    }
    print!("\n");
}
```

The first thing I can conclude is: "you can't make a perfect number from two abundant numbers.". This means that all the perfect numbers from 1 till 28123 can be skipped. I feel like none of this is going to help me go further with the problem, I need to add one abundant number to another abundant number, where the lowest of such values is 24.

The list goes something like this:

```
Double abundant | Sum     | Difference with previous number
-------------------------------------------------------
24              | 12 + 12 | -
30              | 12 + 18 | 6
32              | 12 + 20 | 2
36              | 12 + 24 | 4
38              | 18 + 20 | 2
42              | 12 + 30 | 4
48              | 12 + 36 | 6
etc.
```

It always seems to be skipping in steps of 2 and all numbers are divisble by at least two? Whatever this is, it doesn't really seem to help me go forward with an answer.

**Back to the previous rabbit hole**
I'm not going to change my method. I still believe, checking which double abundant numbers lies between all the abundant numbers times 2, is the way forward. Furthermore, I did make the algorithm a little faster:

```rust
for i in 0..all_abundant.len() - 1 {
    let mut j = i;
    let mut double = all_abundant[i] * 2;
    let next_double = all_abundant[i + 1] * 2;

    if double > MAX { break };

    // Push 24, 36, 40, 48 etc.
    filter_set.push(double);

    // Loop from 24 till 36 and change `double` to the sum of
    // two abundant numbers until it goes over
    // or equals the next_double.
    while double < next_double {
        j += 1;
        double = all_abundant[i] + all_abundant[j];

        if double != next_double {
            filter_set.push(double);
        }
    }
}
```

Oddly enough, this gives me an array of 9918 numbers, which is higher than the 8253 numbers I got earlier with the slower algorithm. However, this doesn't really matter, because I still get a result of 261307216. I gave up on my method.

**Getting to the actual correct answer...**
After taking a shower, I came up with a way less complex approach. I figured that any number which is abundant I should persist in a vector of some kind. Then for each following number in the loop, I need to check with the previous list of abundant numbers. If reducing said number by any of the previous abundant numbers is also an abundant number, it is a double abundant number. My first attempt looks like this:


```rust
fn problem_23() -> u32 {
    let mut filter_set = vec![];
    let mut total = 0;

    for n in 1..=MAX {
        if filter_set.iter().any(|&f| abundant(n - f)) {
            continue;
        }

        if abundant(n) {
            filter_set.push(n);
        } else {
            total += n;
        }
    }

    total
}
```

So loop over all the numbers from 1 to 28123, check if the number is abundant. If it is an abundant number it is automatically excluded from the total. Store the abundant number in a vector and test for all the abundant numbers if the number minus that filter value is abundant. If that's the case, the loop should skip to the next number and not add anything to `total`. This approach gives me 100630861, which is a bit closer than before.

Perhaps there's some bug in my code. After tweaking it slightly I got it working:

```rust
fn problem_23() -> u32 {
    let mut filter_set = vec![];
    let mut total = 0;

    for n in 1..=MAX {
        let mut double_abundant = false;
        for f in &filter_set {
            if abundant(n - f) {
                double_abundant = true;
                break;
            }
        }

        if abundant(n) {
            filter_set.push(n);
        }

        if !double_abundant {
            total += n;
        }
    }

    total
}
```

This results in the correct answer of 4179871. It is still quite slow, because for each number that isn't a double abundant number, a potential 6965 numbers need to be checked. I do believe this can be done quite a lot faster by splitting the numbers in to odd and even numbers. The reason why I'm suggesting this is that almost all abundant numbers are divisible by 2 (the first which isn't is 945).

```rust
fn non_double_abundant(start: u32) -> u32 {
    let mut filter_set = vec![];
    let mut total = 0;
    let mut n = start;

    while n <= MAX {
        let mut double_abundant = false;

        for f in &filter_set {
            if abundant(n - f) {
                double_abundant = true;
                break;
            }
        }

        if abundant(n) {
            filter_set.push(n);
        }

        if !double_abundant {
            total += n;
        }

        n += 2;
    }
    total
}

fn problem_23() -> u32 {
    non_double_abundant(1) + non_double_abundant(2)
}
```

This is quite a bit faster already.


