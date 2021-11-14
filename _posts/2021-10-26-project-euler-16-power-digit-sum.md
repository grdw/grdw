---
layout: post
title: "Project Euler #16: Power digit sum"
problem_type: euler
problem: 16
complexity: 3
---

**Introduction**
2^16 = 32768. Summing up all individual digits (3 + 2 + 7 + 6 + 8) results in 26. What is the sum of the digits to 2^1000?

In Ruby this answer is super easy to acquire:

```ruby
(2**1000).to_s.each_chars.sum(&:to_i) # => 1366
```

There's probably a similar answer in Python I imagine. However, considering that I'm doing all these puzzles in Rust, I have to come up with something a bit more clever, knowing that Rust has no way to fit 2^1000 in any of its integers.

**Which power does fit?**
In the previous puzzle I found out Rust has a `u128` type which has a max value of 2^128 - 1. This means I can represent 2^1000 as (2^100)^10. But how are we going to multiply these large numbers without overflowing? A way of doing this is by using a vector. Combining that knowledge with my knowledge from my primary school days I should be able to solve it.

```
Showing off my primary school knowledge:

16 x 12
-------
10 x 10 = 100
 6 x 10 =  60
10 x 2  =  20
 6 x 2  =  12
         ----+
          192
```

I'll explain this program a little bit more in steps, but the way I approached it is like this:

1. First turn a number into a vector of it's bases. So 16 f.e. becomes `[6, 1]`. The reason why it is reversed I'll explain later.
2. Next up build a way to multiply these values.
3. Resolve the original puzzle.

**Step 1: converting a number to a vector**
For step 1 I wrote the following code:

```rust
fn int_to_vec(mut i: u128) -> Vec<u8> {
    let mut r = vec![];
    let mut n: u32 = 1;
    while i > 0 {
        let base = 10_u128.pow(n);
        let res = i % base;
        r.push((res / (base / 10)) as u8);
        n += 1;
        i -= res;
    }
    r
}

#[test]
fn test_int_to_vec() {
    assert_eq!(int_to_vec(16), vec![6, 1]);
    assert_eq!(int_to_vec(128), vec![8, 2, 1])
}
```

Nothing to out of the ordinary. Take a large number and turn it into an array of its bases. The reason why the result is reversed, is because it's easier to get to the base10 value by using the index of the vector.

**Step 2: multiplying factors**
The next step is writing code to multiply `[6, 1]` times `[2, 1]` or in normal human speak: 16 x 12. The full code goes something like this:

```rust
use std::cmp;

fn multiply(a: Vec<u8>, b: Vec<u8>) -> Vec<u8> {
    let mut result = vec![];

    for (i, x) in a.iter().enumerate() {
        for (j, y) in b.iter().enumerate() {
            let mut total = vec![0; i + j];
            let mut mul_vec = int_to_vec((x * y) as u128);

            total.append(&mut mul_vec);
            result = sum_arrays(result, total);
        }
    }

    result
}

// Takes two vectors and adds them to one another
fn sum_arrays(a: Vec<u8>, b: Vec<u8>) -> Vec<u8> {
    let len: usize = cmp::max(a.len(), b.len());
    let mut result = vec![0; len];

    for i in 0..len {
        let a_val = a.get(i).unwrap_or(&0);
        let b_val = b.get(i).unwrap_or(&0);
        let total = int_to_vec((a_val + b_val) as u128);

        for (j, t) in total.iter().enumerate() {
            let k = i + j;

            match result.get_mut(k) {
                Some(n) => *n += t,
                None => result.insert(k, *t)
            }
        }
    }

    result
}

#[test]
fn test_summing_arrays() {
    assert_eq!(
        sum_arrays(vec![], vec![0, 8]),
        vec![0, 8]
    );
    assert_eq!(
        sum_arrays(vec![0, 2, 1], vec![0, 8]),
        vec![0, 0, 2]
    );
    assert_eq!(
        sum_arrays(vec![2, 9], vec![0, 8]),
        vec![2, 7, 1]
    );
}

#[test]
fn test_summing_multiple_arrays() {
    let mut start = vec![1, 1, 1];
    start = sum_arrays(start, vec![1, 1, 2]);
    start = sum_arrays(start, vec![1, 1, 2]);

    assert_eq!(start, vec![3, 3, 5]);
}

#[test]
fn test_multiply() {
    assert_eq!(
        multiply(
            int_to_vec(16),
            int_to_vec(28)
        ),
        vec![8, 4, 4]
    )
}
```

It might seem like a lot to sink your teeth in, but essentially what happens is this (f.e. with 16 x 12).

```
16 x 12

16 to vec = [6,1]
12 to vec = [2,1]

Split it into:

6 x 2     => 12 => [2, 1]
6 x 1 (1) => 6  => [0, 6]
1 x 2 (1) => 2  => [0, 2]
1 x 1 (2) => 1  => [0, 0, 1]

The only thing left to do is to sum those arrays
much like in the primary school days:

[2, 1] + [0, 6] = [2, 7]
[2, 7] + [0, 2] = [2, 9]
[2, 9] + [0, 0, 1] = [2, 9, 1] => 192
```

There's some trickery required with summing values in arrays this way. Namely if two values have a remainder. I solved it by reusing `int_to_vec()` again and adding that array on top of the other. I know the max value will be `9 + 9 = 18` so I do see a potential area of improvement.

**Step 3: Actually resolving problem 16**
Using `int_to_vec()` and `multiply()` from the previous code I can resolve the puzzle like such:

```rust
fn problem_16(power: u32) -> u16 {
    let mut result = vec![1];
    let max_power = 100;
    let mut cycles = power / max_power;
    let rest = power % max_power;

    while cycles > 0 {
        result = multiply(result, int_to_vec(2_u128.pow(max_power)));
        cycles -= 1
    }

    if rest > 0 {
        result = multiply(result, int_to_vec(2_u128.pow(rest)));
    }

    result.iter().fold(0, |t, x| t + *x as u16)
}

#[test]
fn test_problem_16() {
    assert_eq!(problem_16(15), 26);
    assert_eq!(problem_16(115), 164);
    assert_eq!(problem_16(1000), 1366);
}
```

It is not the fastest code in the world but it does result in the correct answer!

**The clean up**
I'm not going to lie but the code parts that make up this puzzle look pretty rough. Let's start cleaning it up now that we have a working solution. Let's start with this method:

```rust
fn int_to_vec(mut i: u128) -> Vec<u8> {
    let mut r = vec![];
    let mut n: u32 = 1;
    while i > 0 {
        let base = 10_u128.pow(n);
        let res = i % base;
        r.push((res / (base / 10)) as u8);
        n += 1;
        i -= res;
    }
    r
}
```

My first problem with this code is the naming. When I'm going a little fast I'll always resort to the 26 variable names of the alphabet, however they are a bit semantically meaningless. Also the `.pow()` can be replaced by using `*= 10` instead. Now this method becomes:

```rust
fn int_to_vec(mut number: u128) -> Vec<u8> {
    let mut result = vec![];
    let mut tens: u128 = 10;

    while number > 0 {
        let base = number % tens;
        result.push((base / (tens / 10)) as u8);

        tens *= 10;
        number -= base;
    }
    result
}
```

This is a bit nicer but I'm still not a fan of that double division happening on line 7. I don't think I can fully resolve it so I'm going to leave it for what it is.

Onward to `sum_arrays()`. Currently this is what it looks like:

```rust
// Takes two vectors and adds them to one another
fn sum_arrays(a: Vec<u8>, b: Vec<u8>) -> Vec<u8> {
    let len: usize = cmp::max(a.len(), b.len());
    let mut result = vec![0; len];

    for i in 0..len {
        let a_val = a.get(i).unwrap_or(&0);
        let b_val = b.get(i).unwrap_or(&0);
        let total = int_to_vec((a_val + b_val) as u128);

        for (j, t) in total.iter().enumerate() {
            let k = i + j;

            match result.get_mut(k) {
                Some(n) => *n += t,
                None => result.insert(k, *t)
            }
        }
    }

    result
}

#[test]
fn test_summing_arrays() {
    assert_eq!(sum_arrays(vec![], vec![0, 8]), vec![0, 8]);
    assert_eq!(sum_arrays(vec![0, 2, 1], vec![0, 8]), vec![0, 0, 2]);
    assert_eq!(sum_arrays(vec![2, 9], vec![0, 8]), vec![2, 7, 1]);
}

#[test]
fn test_summing_multiple_arrays() {
    let mut start = vec![1, 1, 1];
    start = sum_arrays(start, vec![1, 1, 2]);
    start = sum_arrays(start, vec![1, 1, 2]);

    assert_eq!(start, vec![3, 3, 5]);
}
```

What I don't like about this is the `cmp::max()` trickery at the top of this method. Ideally I want some sort of `zip()`-method, to zip the iterator of the first vector `a` to the other vector `b`. However `zip()` in Rust is based on the smallest vector, which is a bit of an issue when one of your vectors is empty. The thing I stole of Stackoverflow [1] is using a `loop` and keep on calling `next()` on both iterators and only stop when both return `None`. After implementing, the code now looks like this:

```rust
fn sum_arrays(a: Vec<u8>, b: Vec<u8>) -> Vec<u8> {
    let mut result = vec![];
    let mut index = 0;
    let mut a_iter = a.iter();
    let mut b_iter = b.iter();

    loop {
        let total = match (a_iter.next(), b_iter.next()) {
            (Some(x), Some(y)) => *x + *y,
            (Some(x), None) => *x,
            (None, Some(y)) => *y,
            (None, None) => break
        };

        if total > 0 {
            let total = int_to_vec(total as u128);

            for (j, t) in total.iter().enumerate() {
                let k = index + j;

                match result.get_mut(k) {
                    Some(n) => *n += t,
                    None => result.insert(k, *t)
                }
            }
        } else {
            result.push(0);
        }

        index += 1;
    }

    result
}
```

I know what you are thinking: "yikes, this method is almost 25% larger than the previous", and you'd be right. Let's make it even worse:

```rust
fn sum_arrays(a: Vec<u8>, b: Vec<u8>) -> Vec<u8> {
    let mut result = vec![];
    let mut totals = vec![];
    let mut a_iter = a.iter();
    let mut b_iter = b.iter();

    loop {
        let total = match (a_iter.next(), b_iter.next()) {
            (Some(x), Some(y)) => *x + *y,
            (Some(x), None) => *x,
            (None, Some(y)) => *y,
            (None, None) => break
        };

        totals.push(total);
    }

    for (index, total) in totals.iter().enumerate() {
        if *total == 0 {
            result.push(0);
            continue
        }

        for (j, t) in int_to_vec(*total as u128).iter().enumerate() {
            let k = index + j;

            match result.get_mut(k) {
                Some(n) => *n += t,
                None => result.push(*t)
            }
        }
    }

    result
}
```

The code above technically still works but it does help me understand a lot more of the magic behind the first implementation. `totals` now contains all the "zipped" data from both arrays. Now some values in `totals` can be bigger than 9, which we call a remainder. These values have to shift one spot. However knowing that the maximum value is 18 (9 + 9) and the first digit always being 1, we can make the code look like this:

```rust
for (index, total) in totals.iter().enumerate() {
    if *total > 9 {
        match result.get_mut(index) {
            Some(n) => *n += (*total % 10),
            None => result.push(*total % 10)
        }

        match result.get_mut(index + 1) {
            Some(n) => *n += (total / 10),
            None => result.push(*total / 10)
        }
    } else {
        match result.get_mut(index) {
            Some(n) => *n += total,
            None => result.push(*total)
        }
    }
}
```

.. which simplified looks like this:

```rust
for (index, total) in totals.iter().enumerate() {
    let (div, modulo) = (total % 10, total / 10);

    match result.get_mut(index) {
        Some(n) => *n += div,
        None => result.push(div)
    }

    if modulo > 0 {
        match result.get_mut(index + 1) {
            Some(n) => *n += modulo,
            None => result.push(modulo)
        }
    }
}
```

The next step is to separate the `divs` from the `mods`:

```rust
fn sum_arrays(a: Vec<u8>, b: Vec<u8>) -> Vec<u8> {
    let mut divs = vec![];
    let mut mods = vec![];
    let mut a_iter = a.iter();
    let mut b_iter = b.iter();

    loop {
        let total = match (a_iter.next(), b_iter.next()) {
            (Some(x), Some(y)) => *x + *y,
            (Some(x), None) => *x,
            (None, Some(y)) => *y,
            (None, None) => break
        };

        let (div, modulo) = (total % 10, total / 10);
        divs.push(div);
        mods.push(modulo);
    }

    for (index, modulo) in mods.iter().enumerate() {
        if *modulo > 0 {
            match divs.get_mut(index + 1) {
                Some(n) => *n += modulo,
                None => divs.push(*modulo)
            }
        }
    }

    divs
}
```

To simplify this even further:

```rust
fn sum_arrays(a: Vec<u8>, b: Vec<u8>) -> Vec<u8> {
    let mut divs = vec![];
    let mut a_iter = a.iter();
    let mut b_iter = b.iter();
    let mut prev_mod = 0;

    loop {
        let total = match (a_iter.next(), b_iter.next()) {
            (Some(x), Some(y)) => *x + *y,
            (Some(x), None) => *x,
            (None, Some(y)) => *y,
            (None, None) => break
        };

        let (div, modulo) = (total % 10, total / 10);
        divs.push(div + prev_mod);
        prev_mod = modulo;
    }

    if prev_mod > 0 {
        divs.push(prev_mod);
    }

    divs
}
```

I'm satisfied with that function for now. I'm happy with the `multiply` method as it stands and the rest of the code. The full code I used is this:

```rust
const MAX_POWER: u32 = 100;

fn int_to_vec(mut number: u128) -> Vec<u8> {
    let mut result = vec![];
    let mut tens: u128 = 10;

    while number > 0 {
        let base = number % tens;
        result.push((base / (tens / 10)) as u8);

        tens *= 10;
        number -= base;
    }
    result
}

#[test]
fn test_int_to_vec() {
    assert_eq!(int_to_vec(0), vec![]);
    assert_eq!(int_to_vec(16), vec![6, 1]);
    assert_eq!(int_to_vec(128), vec![8, 2, 1])
}

fn sum_arrays(a: Vec<u8>, b: Vec<u8>) -> Vec<u8> {
    let mut divs = vec![];
    let mut a_iter = a.iter();
    let mut b_iter = b.iter();
    let mut prev_mod = 0;

    loop {
        let total = match (a_iter.next(), b_iter.next()) {
            (Some(x), Some(y)) => *x + *y,
            (Some(x), None) => *x,
            (None, Some(y)) => *y,
            (None, None) => break
        };

        let (div, modulo) = (total % 10, total / 10);
        divs.push(div + prev_mod);
        prev_mod = modulo;
    }

    if prev_mod > 0 {
        divs.push(prev_mod);
    }

    divs
}

#[test]
fn test_summing_arrays() {
    // 0 + 80 = 80
    assert_eq!(sum_arrays(vec![], vec![0, 8]), vec![0, 8]);
    // 120 + 80 = 200
    assert_eq!(sum_arrays(vec![0, 2, 1], vec![0, 8]), vec![0, 0, 2]);
    // 92 + 80 = 271
    assert_eq!(sum_arrays(vec![2, 9], vec![0, 8]), vec![2, 7, 1]);
}#[test]
fn test_summing_multiple_arrays() {
    let mut start = vec![1, 1, 1];
    start = sum_arrays(start, vec![1, 1, 2]);
    start = sum_arrays(start, vec![1, 1, 2]);

    assert_eq!(start, vec![3, 3, 5]);
}

fn multiply(a: Vec<u8>, b: Vec<u8>) -> Vec<u8> {
    let mut result = vec![];

    for (i, x) in a.iter().enumerate() {
        for (j, y) in b.iter().enumerate() {
            let mut total = vec![0; i + j];
            let mut mul_vec = int_to_vec((x * y) as u128);

            total.append(&mut mul_vec);
            result = sum_arrays(result, total);
        }
    }

    result
}

#[test]
fn test_multiply() {
    assert_eq!(
        multiply(
            int_to_vec(28),
            int_to_vec(16)
        ),
        vec![8, 4, 4]
    );

    assert_eq!(
        multiply(
            int_to_vec(28000),
            int_to_vec(1)
        ),
        vec![0, 0, 0, 8, 2]
    )
}

fn problem_16(power: u32) -> u16 {
    let mut result = vec![1];
    let cycles = power / MAX_POWER;
    let mut powers = vec![MAX_POWER; cycles as usize];
    let rest = power % MAX_POWER;

    if rest > 0 {
        powers.push(rest);
    }

    for p in &powers {
        result = multiply(result, int_to_vec(2_u128.pow(*p)));
    }

    result.iter().fold(0, |t, x| t + *x as u16)
}

#[test]
fn test_problem_16() {
    assert_eq!(problem_16(15), 26);
    assert_eq!(problem_16(115), 164);
    assert_eq!(problem_16(1000), 1366);
}
```

It's a little bit longer than the Ruby method.

---

**Improvement of the answer**
I made some improvements to the original answer, namely in the `sum_arrays` method and `multiply` method. It turns out I can simply do an inline update on the first array, supplied as an argument to those methods, in both cases. I also decided to update the naming of the variables a little bit and moving them into a `Trait`.

```rust
pub trait VecEx<U8> {
    fn sum_vec(&mut self, total: Vec<u8>);
    fn multiply(&mut self, total: Vec<u8>);
}

impl VecEx<u8> for Vec<u8> {
    fn sum_vec(&mut self, total: Vec<u8>) {
        let mut prev_div = 0;

        if self.len() < total.len() {
            self.resize(total.len(), 0);
        }

        for (i, x) in self.iter_mut().enumerate() {
            let subt = *x + total.get(i).unwrap_or(&0);
            let (div, modulo) = (subt / 10, subt % 10);

            *x = modulo + prev_div;
            prev_div = div;
        }

        if prev_div > 0 {
            self.push(prev_div);
        }
    }

    fn multiply(&mut self, m: Vec<u8>) {
        let mut totals = vec![];

        for (i, x) in self.iter().enumerate() {
            for (j, y) in m.iter().enumerate() {
                let mut total = vec![0; i + j];
                let mut mul_vec = int_to_vec((x * y) as u128);

                total.append(&mut mul_vec);
                totals.push(total);
            }
        }

        self.clear();
        for t in totals {
            self.sum_vec(t)
        }
    }
}
```

With this implementation in place I can do things like:

```rust
let mut vector = int_to_vec(15);
vector.multiply(int_to_vec(2)) // => [0, 3]
vector.sum_vec(int_to_vec(2)) // => [2, 3]
```

This is not only nicer, but because of the borrowing and inline updating of `vector` this saves quite a lot of memory to get to the final answer.

**Sources**

\[1\] [Stackoverflow: iterate two vectors with different lengths](https://stackoverflow.com/a/38168890/1694362){:target="_blank"}