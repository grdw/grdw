---
layout: post
title: "Project Euler #42: Coded triangular numbers"
problem_type: euler
problem: 42
complexity: 1
---

{% include euler.html %}

**Introduction**
"Using a 16K text file containing nearly two-thousand common English words, how many are triangle words?"

A triangle word is a word which 'word value' is a triangular number. The method to generate triangular numbers is: 1/2n(n+1).

```
1 1
2 3
3 6
4 10
5 15
6 21
etc.
```

**The process**
I'll reuse the `alphabet_value()` method from ["Names scores"](/2021/10/30/project-euler-22-names-scores.html) to determine the value of a word. The next step is to check if that number is a triangular number. Is it possible to check if a number is a triangular number, or would I need to generate the first X triangular numbers? I guess the last process might be the way to go here, considering that my math skills are a bit lacking. The longest word in words.txt is 14 characters long, meaning that if they were all Z's, the highest possible word value would by 364. The code below generates all triangular numbers up till the first triangular number higher than 364.

```rust
fn triangle_number_generator() -> Vec<u32> {
    let max = 364;
    let mut start = 1;
    let mut result = vec![];

    loop {
        let triangle = (
            (0.5 * start as f32) * (start as f32 + 1.0)
        ) as u32;

        result.push(triangle);
        start += 1;

        if triangle > max {
            break result
        }
    }
}
```

All that's left to do is to loop over the list of names, calculate each word value, and check if that value is in the list of triangular numbers.

```rust
fn is_triangle(n: &str, list: &Vec<u32>) -> bool {
    let word_value = alphabet_value(n);

    list.contains(&word_value)
}

fn problem_42() -> usize {
    let contents = fs::read_to_string("p042_words.txt")
                      .unwrap_or("".to_string());

    let list = triangle_number_generator();

    contents.split(",").filter(|t| is_triangle(t, &list)).count()
}

#[test]
fn test_problem_42() {
    assert_eq!(problem_42(), 162);
}
```

The answer I get is 162 words are triangle words, which is the correct solution.

---

**Improvement of the answer**
Can you spot if a number is a triangular number, purely by the number itself? If you take f.e. 4, how would you know it isn't a triangular number? Could you simplify this `1/2n(n+1)` to `n = ?`. While searching for triangular numbers, I found a post on Stackoverflow that seems helpful [1]. It says you can spot it by doing `(sqrt(8n + 1) - 1) /2`; if the number returns a whole number, it's a triangular number. We can rewrite `is_triangle()` to this:

```rust
fn is_triangle(n: &str) -> bool {
    let word_value = alphabet_value(n) as f64;
    let square = ((8.0 * word_value + 1.0).sqrt() - 1.0) / 2.0;

    square.fract() == 0.0
}
```

**Sources**

\[1\] [Fastest method to define whether a number is a triangular number](https://stackoverflow.com/a/2913319/1694362)

{% include complexity.html %}
