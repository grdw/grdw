---
layout: post
title: "Project Euler #49: Prime permutations"
problem_type: euler
problem: 49
complexity: 3
---

**Introduction**
"The arithmetic sequence, 1487, 4817, 8147, in which each of the terms increases by 3330, is unusual in two ways: (i) each of the three terms are prime, and, (ii) each of the 4-digit numbers are permutations of one another.

There are no arithmetic sequences made up of three 1-, 2-, or 3-digit primes, exhibiting this property, but there is one other 4-digit increasing sequence.

What 12-digit number do you form by concatenating the three terms in this sequence?"

**Rabbit hole #1**
**Algorithm shopping**
I need one permutation algorithm and one combination algorithm. One that takes all possible unique combinations of `{0,1,2,3,4,5,6,7,8,9}` but in subsets of 4 [1], and another that takes these groups of 4 and generates all permutations. The code for permutations already exists in ["Lexicographic permutations"](/2021/10/30/project-euler-24-lexicographic-permutations.html). After some fiddling, the code looks like this:

```rust
fn problem_49() -> u64 {
    let vec = vec![0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    let combo = Combo::new(4, vec);
    for c in combo.into_iter() {
        let mut primes = heap(c);
        primes.sort();
        if primes.len() > 2 {
            println!("{:?}", primes);
        }
    }

    0
}
```

The `heap` method only returns permutations that are prime numbers.

**Advanced gap detection**
The next step is quite tricky, but bear with me. The `heap()` method in our previous example returns a series of sorted prime numbers, so f.e.:

```
1487, 1847, 4817, 4871, 7481, 7841, 8147, 8741
```

I am looking for a 4-digit difference between any of these numbers. Let's start with a simpler example and look for a 1-digit difference incl. composites:

```
1, 2, 4, 7
```

The idea is to take the first digit and subtract it from each next digit and repeat, so:

```
Group: {1, 2, 4, 7}

Take 1, cycle through {2,4,7}:
2 - 1 = 1
4 - 1 = 3
7 - 1 = 6

Take 2, cycle through {4,7}:
4 - 2 = 2
7 - 2 = 5

Take 4, cycle through {7}:
7 - 4 = 3

---

The differences are:
{1,3,6}
{2,5}
{3}

You can jump from 1 to 4, by adding 3
You can jump from 4 to 7 by adding 3
So this is a match!
```

In code this looks something like this:

```rust
fn gaps(vec: &Vec<u64>) -> Vec<u64> {
    let l = vec.len();
    let mut differences: Vec<(usize, usize, u64)> = vec![];
    let mut train = vec![];

    for v in 0..l {
        for w in 0..v {
            let value = vec[v] - vec[w];
            let diff = (v, w, value);

            for t in &differences {
                if t.0 == w && t.2 == value && value > BOUND {
                    train.push(vec[t.1]);
                    train.push(vec[w]);
                    train.push(vec[v]);
                }
            }

            differences.push(diff);
        }
    }

    train
}
```

The idea is to store all previous differences, if any previous difference matches, check if the right side of that difference matches with the left side of the current difference (i.e. test if a chain can be formed). If that's the case, you're good!

The only two sets that match are: `1487, 4817, 8147` and `379, 3709, 7039`.

```rust
fn problem_49() -> Vec<u64> {
    let vec = vec![0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    let combo = Combo::new(4, vec);
    let mut result = vec![];

    for c in combo.into_iter() {
        let mut primes = heap(c);
        primes.sort();

        if primes.len() > 2 {
            let snake = gaps(&primes);

            if snake.len() > 0 && !primes.contains(&1487) {
                result = snake;
                break;
            }
        }
    }

    result
}

#[test]
fn test_problem_49() {
    assert_eq!(problem_49(), vec![379,3709,7039]);
}
```

However, the problem statement specifies that it needs to find a 12-digit number, mine is clearly 11 digits. Upon checking the answer (`[2969, 6299, 9629]`), I see what I did wrong. The combination algorithm only generates combinations of unique digits, not combinations with repeating digits.

**Idea #2**
The first idea was clearly a rabbit hole and didn't work, my next approach is to generate all prime numbers from 1000 till 9999 and see which one's belong to each other. There are only 1061 prime numbers in that range, so that shouldn't be too bad to do. Also, this is probably way nicer than having combination and permutation algorithms all over the place.

```rust
let mut groups: Vec<Vec<u64>> = vec![];
let mut primes = four_digit_primes();
let l = primes.len();

for i in 0..l {
    let pi_string = primes[i].to_string();

    for j in i+1..l {
        let pj_string = primes[j].to_string();

        if primes[j] > 0 && strict_match(&pi_string, &pj_string) {
            match groups.get_mut(i) {
                Some(v) => { v.push(primes[j]) },
                None => {
                    let mut group = vec![primes[i], primes[j]];
                    primes[j] = 0;
                    groups.push(group);
                }
            }
        }
    }
}
```

This method generates all groups of primes, formed from other digits. It's not the fastest method - because it works with string comparisons - but it does the trick.

The next thing is to copy the advanced gap detection from idea #1, because that still does the trick:

```rust
for g in &groups {
    if g.len() > 2 {
        let snake = gaps(&g);
        if snake.len() > 0 && !g.contains(&1487) {
            result = snake;
            break;
        }
    }
}

result // [2969, 6299, 9629]
```

Done!

**Sources**

\[1\] [Combinations#rust](https://rosettacode.org/wiki/Combinations#Rust)
