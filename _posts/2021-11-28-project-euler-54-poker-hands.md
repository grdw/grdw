---
layout: post
title: "Project Euler #54: Poker hands"
problem_type: euler
problem: 54
complexity: 1
---

**Introduction**
I am explained the game of poker, which is a highly needed because I've only played a single game in my life. There's text file containing poker hands. The format is: each line contains 10 cards, where the first 5 cards belong to Player 1 and the other 5 cards belong to Player 2. The puzzle wants to know how many times Player 1 wins the game over Player 2.

**Calculating the value of a hand**
The first step is calculating the value of "a hand". According to the game of poker, there are 10 possible outcomes. Let's start with that, and we'll deal with the edge cases later. The first step is to take a hand and turn them into individual cards:

```rust
fn hand_to_cards(hand: &str) -> Vec<&str> {
    let mut cards = vec![];
    let mut p = 0;
    let max = hand.len();

    while p >= 0 {
        let card = &hand[p..=p + 1];
        cards.push(card);
        p += 3;

        if p > max {
            break;
        }
    }
    cards
}

fn value_hand(hand: &str) -> u16 {
    let cards = hand_to_cards(hand);
    println!("{:?}", cards);
    0
}

#[test]
fn test_value_hand() {
    assert_eq!(value_hand("5H 5C 6S 7S KD"), 1)
}
```

In Rust, we can do something nice with the `struct` keyword like this:

```rust
#[derive(Debug)]
struct PokerHand<'a>(Vec<&'a str>);
```

Meaning, I can use `PokerHand` as the place to store the individual cards and implement methods on the `PokerHand` struct, to see what kind of value it has. My idea currently is to start from the highest possible value (a royal flush) and go down to straight flush etc.

After an hour of coding, I have [all the hands in place](https://github.com/grdw/euler/blob/19aa6567ee207dadf5141836d48e2c617790be94/rust/problem_0054/src/main.rs). It's a little too much code to share nicely in a code block, so I hope the link to said commit would be fine.

The `value_hand` method can now be written like such:

```rust
fn value_hand(hand: &str) -> u16 {
    let cards = hand_to_cards(hand);
    cards.value()
}

#[test]
fn test_value_hand() {
    assert_eq!(value_hand("5H 5C 6S 7S KD"), 1)
}
```

The next step is to check how many games Player 1 just wins and print out the ties:

```rust
let mut wins = 0;

for game in &games {
    let v1 = value_hand(&game[0..14]);
    let v2 = value_hand(&game[15..]);

    if v1 > v2 {
        wins += 1
    } else if v1 == v2 {
        println!("{:?}", game);
    }
}
wins
```

It seems like Player 1 beats Player 2 261 times, but there are a lot of ties. The goal is to have no more ties. By far the most ties are with "high card" hands. However, before solving them one by one, let's figure out a method to get rid of the ties.

hand            | current | values
----------------|---------|----------------------------------------------------
high card       | 0       | 5 (7), ... 12 (A)\*\*
one pair        | 1       | 0 (2), 1 (3), ... 12 (A)
two pairs       | 2       | Multiply pair values? So the highest is 11 (K) * 12 (A) = 132
three of a kind | 3       | 0 (2), 1 (3), ... 12 (A)
straight        | 4       | There are 7 possible straights, meaning 0 till 6
flush           | 5       | 0\*
full house      | 6       | Multiply three of a kind values, with pair values, the max being 12 (A) * 11 (K) = 132
four of a kind  | 7       | 0 (2), 1 (3), ... 12 (A)
straight flush  | 8       | There are 7 possible straights, meaning 0 till 6\*
royal flush     | 9       | 0\*

\* I don't think a suite is higher than another suite.

\*\* With 5 cards per hand, the lowest theoretical value is a single 7.

The lowest value hand would be `2S 3D 4C 5S 7D`. This hand would be valued as a "high card" 7, I imagine. Turning the 7 value card into a 6 makes it a straight. Turning the 7 into any of the other values (2, 3, 4, 5) makes "one pair".

The puzzle explains a lovely edge case, though:

Player 1             | Player 2
---------------------|-----------------------
4D 6S 9H QH QC       | 3D 6D 7H QD QS
Pair of Queens       | Pair of Queens
Highest card Nine    | Highest card Seven

In this case, the highest cards are compared. If those also tie, the next highest cards are compared, etc. I need an iterator on `PokerHand`, giving the highest card to the lowest card by calling `.next()`. Calling it once should give me the highest value, calling it another time should give me the next highest value, etc.

The first step here is sorting the cards before they go into the `PokerHand` struct. While implementing the sorting, I spotted a pretty gnarly bug in my `is_straight()` method, [which I had to fix first](https://github.com/grdw/euler/commit/b1d7b2e3e4c51e60f096e3b080a30f598ed2b8ac). After some more fiddling and after reading some very extensive blog posts on how to implement an iterator properly, I got an iterator:

```rust
struct PokerHandIter<'a> {
    inner: &'a PokerHand<'a>,
    index: usize
}

impl Iterator for PokerHandIter<'_> {
    type Item = usize;

    fn next(&mut self) -> Option<usize> {
        if self.index >= self.inner.0.len() {
            None
        } else {
            let card = self.inner.0[self.index];
            let value = CARDS
                .iter()
                .position(|&r| r == card.chars().nth(0).unwrap())
                .unwrap();

            self.index += 1;
            Some(CARDS.len() - value)
        }
    }
}
```

After writing the correct loop for it, I get an answer to problem 54. According to [my current code](https://github.com/grdw/euler/blob/4f53dcc84570564e36a17da6a88f35106221c3f9/rust/problem_0054/src/main.rs), 491 games are awarded to Player 1. Upon checking the answer, which is 376, it seems that I'm awarding a little too many games to Player 1. Looking at my code, I do spot that I probably need to break when Player 2 holds a higher card than Player 1, which drops the amount of wins to 359. This means that there are probably cases with one pair and a single high card, where the single high card is higher than the value of the one pair.

**One hour further**
I managed to resolve it. Upon investigating all the hands, it seemed like the only duplicate ranks were for "one pair" and "high hand". Not once was there a case where Player 1 and Player 2 had a "one pair", followed by the same high hand.In most cases the resolve was like this:

- On `PokerHand` include an empty vector (or array)
- Whenever you hit a "pair" of any kind, push the value of that pair.
- For each hand, push the highest card into said empty vector
- Instead of iterating over the card values, iterate over these 'state' values instead.

Voila, solved!

---

**Improvements**
This puzzle is not really _that_ complicated, it's just a lot of work. An improvement I see is using the `PartialOrd`-trait. This way I could do:

```rust
let hand = PokerHand::sorted(cards);
let other_hand = PokerHand::sorted(cards);

if hand > other_hand {
   println!("WINNER! to hand");
}
```

However, I'll improve that at a later moment considering that is going to need a lot of rewriting.
