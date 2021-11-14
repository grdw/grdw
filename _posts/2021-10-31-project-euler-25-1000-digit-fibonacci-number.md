---
layout: post
title: "Project Euler #25: 1000-digit Fibonacci number"
problem_type: euler
problem: 25
complexity: 1
---



**Introduction**
What is the index of the first term in the Fibonacci sequence to contain 1000 digits?

I'm going to use the code I used for ["Even Fibonacci numbers"](/2021/10/23/project-euler-2-even-fibonacci-numbers.html), the 2nd Euler puzzle. The code to generating the Fibonacci numbers I used is this one:

```rust
let mut far = vec![1, 2];

loop {
    let n = far.remove(0);
    let m = far[0] + n;
    far.push(m);
    println!("{:?}", far);
}
```

This will go on until infinity, except right now I need to stop when the number is 1000 digits long. Even with the biggest integer u128 I can't store a 1000 digit integer, so I have to use my `int_to_vec()` and `sum_vec()` from ["Power digit sum"](/2021/10/26/project-euler-16-power-digit-sum.html). However, I need to tweak `sum_vec()` slightly because right now it can only sum up values that aren't bigger than 2 digits.

**Fixing sum_vec()**
To fix `sum_vec()` I'm going to write some tests which I know will fail:

```rust
#[test]
fn test_sum_vec() {
    let mut start = vec![9,9,9,9];
    start.sum_vec(vec![1]);
    assert_eq!(start, vec![0,0,0,0,1]);
    // currently returns [0,10,9,9]
}
```

This is a relatively simple fix, the `prev_div` (or the remainder) needs to be added constantly to the next cycle of numbers and passed on until it finally will be added in the end, like this:

```rust
impl VecEx<u8> for Vec<u8> {
    fn sum_vec(&mut self, total: &Vec<u8>) {
        let mut prev_div = 0;

        if self.len() < total.len() {
            self.resize(total.len(), 0);
        }

        for (i, x) in self.iter_mut().enumerate() {
            let subt = *x + total.get(i).unwrap_or(&0) + prev_div;
            let (div, modulo) = (subt / 10, subt % 10);

            *x = modulo;
            prev_div = div;
        }

        if prev_div > 0 {
            self.push(prev_div);
        }
    }
}
```

Another minor tweak I made is for `total` to be a reference, instead of passing the full vector along.

**Fibonacci with int_to_vec()**
While fiddling a little, I came up with this answer:

```rust
let mut far = 1.to_vec();
let mut addition = 2.to_vec();

loop {
    far.sum_vec(&addition);
    addition.sum_vec(&far);
    println!("{:?}", far);

    // An arbitrary break
    if far.len() > 2 {
        break;
    }
}
```

The funny thing is that this code skips 2 Fibonacci numbers ahead each time. So the output becomes {3,8,21,55,144}. Now, it could be that the number lies within an even index, _or not_. To get the other Fibonacci numbers {2,5,13,34,89,233} I have to change the `addition` variable to `1.to_vec()`. In theory, I can get to the answer now:

```rust
fn fibonacci_thousand(start: u128) -> u128 {
    let mut far = 1.to_vec();
    let mut addition = start.to_vec();
    let mut index = 2 + start;

    loop {
        far.sum_vec(&addition);
        addition.sum_vec(&far);
        index += 2;

        if far.len() > 1000 {
            break index;
        }
    }
}

#[test]
fn test_problem_25() {
    let odds = fibonacci_thousand(2);
    let evens = fibonacci_thousand(1);
    let mut result = 0;

    if odds > evens {
        result = evens;
    } else {
        result = odds;
    }

    assert_eq!(result, 4789);
}
```

I'm remarkably close to the actual answer (4789) which is 4782. I'm 7 indexes off, so it seems. Upon debugging my code, I found a little bug with the indexing. I thought I needed to offset the index by 2, but it seems like I don't have to do that. It still won't give me the correct answer, because it still looks like I'm 5 indexes off the mark. After some head scratching I figured out what it is, namely the ancient old `>` vs `>=`. It needs to stop at length 1000 not 1001. The full working code:

```rust
fn fibonacci_thousand(start: u128, max: usize) -> u128 {
    let mut far = 1.to_vec();
    let mut addition = start.to_vec();
    let mut index = start;

    loop {
        far.sum_vec(&addition);
        addition.sum_vec(&far);
        index += 2;

        if far.len() >= max {
            break index;
        }
    }
}

fn problem_25(max: usize) -> u128 {
    let i = fibonacci_thousand(2, max);
    let k = fibonacci_thousand(1, max);

    if i > k {
        k
    } else {
        i
    }
}

#[test]
fn test_problem_25() {
    assert_eq!(problem_25(1000), 4782);
}
```


