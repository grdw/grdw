---
layout: post
title: "Project Euler #33: Digit cancelling fractions"
problem_type: euler
problem: 33
complexity: 2
---

{% include euler.html %}

**Introduction**
The puzzle starts out by explaining that 49/98th is a curious fraction, as it can simplify to 4/8th (or 1/2). The puzzle specifies that 4/8th can be obtained by "cancelling" out the 9's. There are four fractions with two digits in the numerator and denominator, all less than one in value, that follow that "cancelling rule". It then continues with: "If the product of these four fractions is given in its lowest common terms, find the value of the denominator.". I'm not sure what that means entirely, but let's start with simplifying fractions! The first step is to simplify fully:

```rust
fn simplify_fraction(num: f64, den: f64) -> Vec<u16> {
    let factor = den / num;
    let mut n = den.sqrt() as u16;
    let mut result = vec![];

    while n > 0 {
        let div_num = n as f64;
        let div_den = n as f64 * factor;

        if (div_num.fract() + div_den.fract()) == 0.0 {
            result = vec![
                div_num as u16,
                div_den as u16
            ];
        }
        n -= 1;
    }

    result
}

#[test]
fn test_simplify_fraction() {
    assert_eq!(simplify_fraction(49.0, 98.0), vec![1, 2]);
    assert_eq!(simplify_fraction(6.0, 9.0), vec![2, 3]);
    assert_eq!(simplify_fraction(60.0, 90.0), vec![2, 3]);
}
```

It might be that this can be done simpler, but this is the code I've got so far. The next step would be to detect if any of the simpler fractions I get at `result = vec![..]` are made from dropped digits. This can be achieved with some String manipulation:

```rust
fn cancelled_simplified(
    num: f64,
    den: f64,
    simple_num: f64,
    simple_den: f64) -> bool {

    let mut index = 0;
    let mut full_s = num.to_string();
    full_s.push_str(&den.to_string());

    let mut simple_s = simple_num.to_string();
    simple_s.push_str(&simple_den.to_string());

    for f in simple_s.chars() {
        let value = match full_s.find(f) {
            Some(t) => t,
            None => 0
        };
        index += value
    }

    index == 3
}

#[test]
fn test_cancelled_simplified() {
    assert_eq!(cancelled_simplified(49.0, 98.0, 4.0, 8.0), true);
    assert_eq!(cancelled_simplified(49.0, 98.0, 1.0, 2.0), false);
    assert_eq!(cancelled_simplified(30.0, 50.0, 3.0, 5.0), false);
}
```

What I'm suggesting here is that 49.0 and 98.0 together as a string look like "4998" and the simplified fraction looks like "48". If both values from the simple fraction are on the outside, its positions count up towards 3, the same if they were on the inside. All other variations will count the `index` up to 2 or 4 or if no matches are found, the `index` becomes 0. I'm not 100% sure if this will do the trick, but it might?

Let's try and tackle the full problem now:

```rust
fn problem_33() -> u64 {
    for num in 10..=99 {
        for den in 10..=99 {
            let num_f: f64 = num as f64;
            let den_f: f64 = den as f64;

            if (num_f / den_f) < 1.0 {
                let simplified = simplify_fraction(num_f, den_f);
                if !simplified.is_empty() {
                    println!("{:?}", simplified);
                }
            }
        }
    }
    0
}

#[test]
fn test_problem_33() {
    assert_eq!(problem_33(), 1);
}
```

From the `println!`-statements, I can already see that this isn't working, because I get more than 4 answers. This probably has to do with my little `index == 3` trick, f.e. 80 / 96 can be simplified to 5 / 6 and that will return an index of 3. After a bit of an ugly hack to `cancelled_simplified()`, it starts to filter out more values and after some more fiddling and trying and more refactoring I get this method:

```rust
fn cancelled_simplified(
    num: f64,
    den: f64,
    simple_num: f64,
    simple_den: f64) -> bool {

    let full_s = format!("{}{}", num, den);
    let small_s = format!("{}{}", simple_num, simple_den);
    let all_present = small_s.chars().all(|x| full_s.contains(x));

    let mut index = 0;
    for f in small_s.chars() {
        let m = full_s.find(f);

        if m.is_some() {
            index += m.unwrap();
        }
    }

    all_present && index == 3 &&
        (full_s.chars().nth(1).unwrap() == full_s.chars().nth(2).unwrap())
}

#[test]
fn test_cancelled_simplified() {
    assert_eq!(cancelled_simplified(49.0, 98.0, 4.0, 8.0), true);
    assert_eq!(cancelled_simplified(49.0, 98.0, 1.0, 2.0), false);
    assert_eq!(cancelled_simplified(30.0, 50.0, 3.0, 5.0), false);
    assert_eq!(cancelled_simplified(80.0, 96.0, 5.0, 6.0), false);
    assert_eq!(cancelled_simplified(72.0, 96.0, 9.0, 12.0), false);
    assert_eq!(cancelled_simplified(46.0, 92.0, 2.0, 4.0), false);
    assert_eq!(cancelled_simplified(15.0, 50.0, 3.0, 10.0), false);
    assert_eq!(cancelled_simplified(24.0, 42.0, 4.0, 7.0), false);
    assert_eq!(cancelled_simplified(12.0, 24.0, 1.0, 2.0), false);
}
```

It won't win any beauty pageants, but it does give us back the only 4 fractions that follow the rules:

```
16 / 64 => 1 / 4
19 / 95 => 1 / 5
26 / 65 => 2 / 5
49 / 98 => 4 / 8
```

Right now I'm not so sure what I need to do with these values in all honesty; it wants me to multiply the denominators which would be `4 x 5 x 5 x 8 = 800`, however it specifies "lowest common terms" which means I need to divide by the product of the numerators which is 8, so the answer is 100. In code:

```rust
fn problem_33() -> u16 {
    let mut total_n = 1;
    let mut total_d = 1;

    for num in 10..=99 {
        for den in 10..=99 {
            let num_f: f64 = num as f64;
            let den_f: f64 = den as f64;

            if (num_f / den_f) < 1.0 {
                let simplified = simplify_fraction(num_f, den_f);

                if !simplified.is_empty() {
                    total_n *= simplified[0];
                    total_d *= simplified[1];
                }
            }
        }
    }
    total_d / total_n
}

#[test]
fn test_problem_33() {
    assert_eq!(problem_33(), 100);
}
```

One tricky part I forgot to mention is that only the insides of the full fraction, when represented as a string, should match and _not_ the outsides. So f.e. 24 / 32th (`2432`) can be simplified to 3 / 4th, but because the 2's are on the outside, this doesn't check out (also the 3 and 4 swap spots).

---

**Improvements**
`cancelled_simplified()` can be reduced further to:

```rust
fn cancelled_simplified(
    num: f64,
    den: f64,
    simple_num: f64,
    simple_den: f64) -> bool {

    let full_s = format!("{}{}", num, den);
    let small_s = format!("{}{}", simple_num, simple_den);
    let all_present = small_s.chars().all(|x| full_s.contains(x));

    all_present &&
        (full_s.chars().nth(1).unwrap() == full_s.chars().nth(2).unwrap()) &&
        (full_s.chars().nth(0).unwrap() == small_s.chars().nth(0).unwrap()) &&
        (full_s.chars().nth(3).unwrap() == small_s.chars().nth(1).unwrap())

}
```

To get rid of all those `.chars().nth(y).unwrap()` chains, I decided to create a little method to clean up my code considerably:

```rust
fn get_char(string: &String, pos: usize) -> char {
    string.chars().nth(pos).unwrap()
}

fn cancelled_simplified(
    num: f64,
    den: f64,
    simple_num: f64,
    simple_den: f64) -> bool {

    let full_s = format!("{}{}", num, den);
    let small_s = format!("{}{}", simple_num, simple_den);
    let all_present = small_s.chars().all(|x| full_s.contains(x));

    all_present &&
        get_char(&full_s, 1) == get_char(&full_s, 2) &&
        get_char(&full_s, 0) == get_char(&small_s, 0) &&
        get_char(&full_s, 3) == get_char(&small_s, 1)
}
```

After some further exploring and with my tests in place, I decided to see if it was possible to drop `all_present` from this method, and it seems like I can. Apparently that's been taken care of by the character comparisons:

```rust
fn get_char(string: &String, pos: usize) -> char {
    string.chars().nth(pos).unwrap()
}

fn cancelled_simplified(
    num: f64,
    den: f64,
    simple_num: f64,
    simple_den: f64) -> bool {

    let full_s = format!("{}{}", num, den);
    let small_s = format!("{}{}", simple_num, simple_den);

    get_char(&full_s, 1) == get_char(&full_s, 2) &&
    get_char(&full_s, 0) == get_char(&small_s, 0) &&
    get_char(&full_s, 3) == get_char(&small_s, 1)
}
```

I think this is as nice as it gets.

{% include complexity.html %}
