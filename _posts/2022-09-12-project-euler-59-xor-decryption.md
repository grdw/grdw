---
layout: post
title: "Project Euler #59: XOR decryption"
problem_type: euler
problem: 59
complexity: 1
---

### Introduction

I'm skipping problem 58 for now, considering I resolved that in Go. Considering I find Go not that interesting of a programming language to talk about, I'm postponing that article for another time.

Problem 59 starts out as follows:

> Each character on a computer is assigned a unique code and the preferred standard is ASCII (American Standard Code for Information Interchange). For example, uppercase A = 65, asterisk (\*) = 42, and lowercase k = 107.
>
> A modern encryption method is to take a text file, convert the bytes to ASCII, then XOR each byte with a given value, taken from a secret key. The advantage with the XOR function is that using the same encryption key on the cipher text, restores the plain text; for example, 65 XOR 42 = 107, then 107 XOR 42 = 65.

The puzzle then continues on, giving us an encrypted message to solve. The password has three lowercase characters. The text contains common English words. Give the sum of all the ASCII characters of the original text.

### Starting out

The cipher contains a bunch of integers split with a comma. I'm assuming I need some sort of "integer" to ASCII function, which in rust is really plain and simple [1]:

```rust
let a = 65u8 as char;
println!("{}", a) // gives "A"
```

First up, I'll parse the entire file and load it entirely into memory (considering it's only 4 Kilobyte in size, I'm fine with this). I'm splitting all the individual integers on a comma and turn them into a `u8`. This way I can easily cast them as `char` primitives.

Before doing that last step, I have to brute force my way to find the right three letter lowercase password. All the lower case letters in ASCII range from 97 till 122. So my first brainless code looks like this:

```rust
const ASCII_MIN:u8 = 97;
const ASCII_MAX:u8 = 122;

#[derive(Debug, PartialEq)]
struct Password(u8, u8, u8);

impl Iterator for Password {
    type Item = Self;

    fn next(&mut self) -> Option<Self::Item> {
        // Bad stink stink code
        if self.2 < ASCII_MAX {
            self.2 += 1;
        } else {
            self.2 = ASCII_MIN;

            if self.1 < ASCII_MAX {
                self.1 += 1;
            } else {
                self.1 = ASCII_MIN;

                if self.0 < ASCII_MAX {
                    self.0 += 1;
                } else {
                    // BORK
                }
            }
        }

        Some(Password(self.0, self.1, self.2))
    }
}
```

If we start out with `Password(97, 97, 97)` and just keep on calling `next()` we should get a nice iterator that will keep on adding 1 to the 2nd 97 value, and once it hits the max of 122, it will add 1 to the next value, resets the second one, and keeps on going. Obviously, my first attempt at this code looks like absolute shit, but it works according to the tests. After some refactoring, the code looks like this:

```rust
const ASCII_MIN:u8 = 97;
const ASCII_MAX:u8 = 122;

#[derive(Debug, PartialEq)]
struct Password(u8, u8, u8);

#[derive(Debug)]
enum Action {
    AddTo2,
    AddTo1,
    AddTo0,
    Max
}

impl Iterator for Password {
    type Item = Self;

    fn next(&mut self) -> Option<Self::Item> {
        let action: Action =
            if self.2 < ASCII_MAX {
                Action::AddTo2
            } else if self.1 < ASCII_MAX {
                Action::AddTo1
            } else if self.0 < ASCII_MAX {
                Action::AddTo0
            } else {
                Action::Max
            };

        match action {
            Action::AddTo2 => {
                self.2 += 1;
                Some(Password(self.0, self.1, self.2))
            }
            Action::AddTo1 => {
                self.1 += 1;
                self.2 = ASCII_MIN;
                Some(Password(self.0, self.1, self.2))
            },
            Action::AddTo0 => {
                self.0 += 1;
                self.1 = ASCII_MIN;
                self.2 = ASCII_MIN;
                Some(Password(self.0, self.1, self.2))
            },
            Action::Max => None
        }
    }
}
```

I'm assuming there's a really nice and easy way of doing this, but considering I'm not some mathematical genius, this is what I came up with (I will return to this).

The next step is to try out every possible password until an English word will start forming in the text. Considering English is not my first language, I'm assuming the word 'and' or 'the' will be most likely present in the text. My money is on the word "and". To achieve this I wrote the following:

```rust
let mut password = Password(ASCII_MIN, ASCII_MIN, ASCII_MIN - 1);

loop {
    match password.next() {
        Some(next_password) {
            let string = parse_password(&list, next_password);
            if string.contains("and") {
                println!("{}", string);
                break;
            }
        },
        None => break
    }
}
```

The `parse_password` function looks as follows:

```rust
fn parse_password(text: &Vec<u8>, password: Password) -> String {
    let mut result = String::from("");
    let pw = vec![password.0, password.1, password.2];

    for i in 0..text.len() {
        let res = text[i] ^ pw[i % pw.len()];
        result.push(res as char);
    };
    result
}
```

However, after running my code I get a whole lot of gibberish:

```
...$nn$nia:em{landv4!M:vmvm$in...
               ---
               But it has 'and'!
```

Checking for "the" comes up with a similar result:

```
...yahcahi:xayctheg...
               ---
               It has "the"!
```

Perhaps I need to check if the word "and" is encapsulated with whitespace, so " and "; as though it is in the middle of a sentence. That does the trick! I get the text:

> An extract taken from the introduction of one of Euler's most celebrated papers, "De summis serierum reciprocarum" [On the sums of series of reciprocals]: I have recently found, quite unexpectedly, an elegant expression for the entire sum of this series 1 + 1/4 + 1/9 + 1/16 + etc., which depends on the quadrature of the circle, so that if the true sum of this series is obtained, from it at once the quadrature of the circle follows. Namely, I have found that the sum of this series is a sixth part of the square of the perimeter of the circle whose diameter is 1; or by putting the sum of this series equal to s, it has the ratio sqrt(6) multiplied by s to 1 of the perimeter to the diameter. I will soon show that the sum of this series to be approximately 1.644934066842264364; and from multiplying this number by six, and then taking the square root, the number 3.141592653589793238 is indeed produced, which expresses the perimeter of a circle whose diameter is 1. Following again the same steps by which I had arrived at this sum, I have discovered that the sum of the series 1 + 1/16 + 1/81 + 1/256 + 1/625 + etc. also depends on the quadrature of the circle. Namely, the sum of this multiplied by 90 gives the biquadrate (fourth power) of the circumference of the perimeter of a circle whose diameter is 1. And by similar reasoning I have likewise been able to determine the sums of the subsequent series in which the exponents are even numbers.

Calculating the sum of ASCII characters is rather easy in Rust:

```rust
string.as_bytes().iter().map(|x| *x as u64).sum()
```

This returns 129448, which is the correct answer.

---

### Improvements

I used a tuple type for Password, while I should've clearly used a vector. The solution with a vector goes something like this:

```rust
const ASCII_MIN:u8 = 97;
const ASCII_MAX:u8 = 122;

#[derive(Debug, PartialEq)]
struct Password(Vec<u8>);

impl Iterator for Password {
    type Item = Self;

    fn next(&mut self) -> Option<Self::Item> {
        if self.0.iter().all(|&n| n == ASCII_MAX) {
            return None
        }

        let max = self.0.len();

        for i in (0..max).rev() {
            if self.0[i] < ASCII_MAX {
                self.0[i] += 1;
                break;
            } else {
                self.0[i] = ASCII_MIN;
            }
        }

        Some(Password(self.0.clone()))
    }
}
```

Instead of passing three individual integers to Password, I can add a vector of integers. The `Iterator` took a little bit of trouble to implement, but the idea is to keep adding values from right &rarr; left. This simple algorithm will add 1 to the right-most value as long as it stays under 122. If it goes over, it will reset the value at that position back to the original value and increments the next right-most value. If all the values equal to 122, it will return a `None`. The loop will break if a value got added, because at most `next()` should increment a single value in the vector, and not do anything more.

### Sources

\[1\] [reddit.com/r/rust/u8_to_char_using_ascii_encoding](https://www.reddit.com/r/rust/comments/2veszg/u8_to_char_using_ascii_encoding/)
