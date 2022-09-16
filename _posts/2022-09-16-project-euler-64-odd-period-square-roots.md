---
layout: post
title: "Project Euler #64: Odd period square roots"
problem_type: euler
problem: 64
complexity: 2
---

### Introduction

The puzzle explains that all square roots are periodic when written as continued fractions. It then goes on to give an example for the square root of 23. The example being:

<math>
  <msqrt>
    <mn>23</mn>
  </msqrt>
  <mo>=</mo>
    <mn>4</mn>
    <mo>+</mo>
    <msqrt><mn>23</mn></msqrt><mo>-</mo><mn>4</mn>

  <mo>=</mo>
    <mn>4</mn>
    <mo>+</mo>
    <mfrac>
      <mn>1</mn>
      <mfrac>
        <mn>1</mn>
        <msqrt>
          <mn>23</mn><mo>-</mo><mn>4</mn>
        </msqrt>
      </mfrac>
    </mfrac>

  <mo>=</mo>
    <mn>4</mn>
    <mo>+</mo>
    <mfrac>
      <mrow>
        <mn>1</mn>
      </mrow>
      <mrow>
        <mn>1</mn>
        <mo>+</mo>
        <mfrac>
          <mrow>
            <msqrt>
              <mn>23</mn>
            </msqrt>
            <mo>-</mo>
            <mn>3</mn>
          </mrow>
          <mrow>
            <mn>7</mn>
          </mrow>
        </mfrac>
      </mrow>
    </mfrac>
</math>

At this point I'm already confused, where does this magical 4 come from? I mean obviously any square root + x - x, is the same as that square root, but why 4? I guess I have to read up on square roots, and their relation to continued fractions.

It turns out a quick Google explains where the 4 comes from [1]. It's merely taking the actual square root of 23 and dropping all the digits that come after the comma, so basically flooring the number. This is what in the example is called a<sub>0</sub>.

To determine a<sub>1</sub> we take the square root of 23 minus said digit (4) over 1 (see the function below), which equals to 1.2565 (let's call this f<sub>1</sub>). Flooring this number makes 1, which is a<sub>1</sub>. To determine f<sub>x</sub> we execute the following function:

<math>
  <mn>f<sub>x</sub></mn>
  <mo>=</mo>
  <mfrac>
    <mrow>
      <mn>1</mn>
    </mrow>
    <mrow>
      (
      <mn>f<sub>prevx</sub></mn>
      <mo>-</mo>
      <mn>floor(f<sub>prevx</sub>)</mn>
      )
    </mrow>
  </mfrac>
</math>

To make a<sub>x</sub>, we do nothing more than flooring f<sub>x</sub>. We'll repeat this step until a repeating pattern appears, from a<sub>1</sub> onward (don't count a<sub>0</sub>). Why does somebody on Math exchange always make way more sense of these Euler introductions than the actual explanation itself?

### Setting up the code

The code itself isn't even that complicated when I fully understood what I was supposed to write. The idea here is to have a method which can detect if the square root of any `n` has an odd pattern. The thing I'm not 100% sure of, is if the rounding is going to work or not. The reason why I'm rounding my f<sub>x</sub> values (which in the code are denoted with the variable `t`), is because for the pattern of the sqaure root of 3 I'm hitting floating point errors. Another case which isn't in the examples are perfect squares, these should return false immediately.

```rust
fn odd_pattern(n: u64) -> bool {
    let mut t = (n as f64).sqrt();
    let mut ax = t.floor();
    let mut pattern = vec![];
    let mut i = 0;

    // If it's a perfect square
    if t == ax {
        return false
    }

    loop {
        t = 1.0 / (t - ax);
        ax = t.floor();

        let ar = (t * 1000.0).round() / 1000.0;

        if i > 0 && pattern[0] == ar {
            break;
        }

        pattern.push(ar);

        i += 1;
    }

    pattern.len() % 2 != 0
}
```

The example of N &#8805; 13, seems to succeed with the code above if written like:

```rust
(0..=13).filter(|x| odd_pattern(*x)).count() // Returns: 4
```

The real example returns:

```rust
(0..=10_000).filter(|x| odd_pattern(*x)).count() // Returns: 4057
```

The code takes a while to run (15.15s), but it returns 4057 squares. After checking, this seems to be the incorrect answer. Checking the document linked in the intro, it seems my answer is almost 4 times too high.

I imagine that the rounding is not ideal, and this makes more numbers appear as an 'odd pattern' than should be allowed. After increasing the precision of the rounding from 4 digits to 6 digits, my code gets stuck really fast. Specifically, it gets stuck on the number 329. I'm not sure if 329 even has a pattern to begin with? Perhaps I should use something more fancy to detect a 'pattern', other than checking if I've seen the previous first float?

We'll start with debugging 329. 329 has a repeating group that looks like: `{7,4,2,1,1,4,1,1,2,4,7,36}` [2]. However, due to repeating floating point errors, the second 7 comes out like 8.120709618354654. I imagine we need something beefier than a f64, which Rust unfortunately doesn't support.

After some more Google'ing I found this entire out of the box "continued fraction" solution in Rust, which slightly looks like mine but requires less rounding [3]. I'm not so sure what the purpose is of `m` and `d` in this function, or even what the underlying maths is supposed to be. I tweaked it slightly to make sure it tests for odd patterns, and doesn't return the full expansion. But to be 100% clear, I have no idea how it actually works. It would've been nice if the comments linked to an article I could read up on, but here we are.

After using this method, the code returns 1322 squares with odd periods, which is the correct answer.

### Sources

\[1\] [math.stackexchange.com](https://math.stackexchange.com/questions/265690/continued-fraction-of-a-square-root)

\[2\] [Continuous fraction calculator](https://r-knott.surrey.ac.uk/Fibonacci/cfCALC.html)

\[3\] [Reikna CF](https://docs.rs/reikna/latest/src/reikna/continued_fraction.rs.html#37-59)
