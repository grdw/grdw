---
layout: post
title: "How to cheat at Wordfeud?"
---

<style>
  table.wordfeud {
    table-layout: fixed;
    font-size: 70%;
    border-collapse: separate;
    border-spacing: 3px;
    background-color: #212020;
  }
  table.wordfeud td {
    width: 25px;
    height: 25px;
    padding: 6px 6px;
    overflow: hidden;
    color: white;
    background-color: #2c2f36;
    text-align: center;
    vertical-align: middle;
    position: relative;
    border-radius: 3px;
    border-width: 0 0 1px 1px;
    display: inline-block;
    white-space: nowrap;
  }
  table.wordfeud td.tl { background-color: #1d8fa0; }
  table.wordfeud td.tw { background-color: #9c471b; }
  table.wordfeud td.dl { background-color: #759e6a; }
  table.wordfeud td.dw { background-color: #c07921; }
  table.wordfeud td.or { background-color: #664563; }
  table.wordfeud td.l.n { background-color: #efe987; }
  table.wordfeud td.l {
    background-color: #f2efea; color: #000;
    font-size: 100%;
  }
  table.wordfeud td.l span {
    position: absolute;
    right: 3px;
    top: -2px;
    font-size: 60%;
  }

  @media only screen and (max-width: 649px) {
    table.wordfeud { font-size: 42%; }
    table.wordfeud td {
      width: 15px;
      height: 15px;
      padding: 3px 3px;
    }
</style>

> Editorial note: this article got written in 2022, but I never wrapped up this project (or this post) because it became to heady for my little noodle. All in all I still think it's worth posting if not for the beautiful little wordfeud tables I made in CSS. ✨ This post does end rather abruptly if you manage to make it all the way to the end.

### A story about Wordfeud
I play Wordfeud with my dad, _just_ my dad. It's the only reason why that ad-riddled, scrabble-like game is on my phone. Recently I stumbled upon a paper [1] which described an algorithm on how to best play "Wordfeud", by making a bot. There are many similar papers and blog articles on the internet, and of course many Wordfeud-cheat applications (most of them also ad-riddled). I'll never cheat playing with my dad (I imagine proof is required now), but I am willing to admit that I've used one of those Wordfeud-word generators or anagram-solvers against other random contestants in the past.

Having gone through the Advent of Code 2022 [2] this year (I didn't finish it, as you should), and now having a bit of a puzzle void to fill, I thought it would be fun to try and make my own Wordfeud solver.


### What is Wordfeud?
Wordfeud is a turn-based game like scrabble but it works a bit different than scrabble. You start with an empty scrabble board which looks like such:

<table class="wordfeud full">
  <tbody>
    <tr>
      <td class="tl">TL</td>
      <td></td>
      <td></td>
      <td></td>
      <td class="tw">TW</td>
      <td></td>
      <td></td>
      <td class="dl">DL</td>
      <td></td>
      <td></td>
      <td class="tw">TW</td>
      <td></td>
      <td></td>
      <td></td>
      <td class="tl">TL</td>
    </tr>
    <tr>
      <td></td>
      <td class="dl">DL</td>
      <td></td>
      <td></td>
      <td></td>
      <td class="tl">TL</td>
      <td></td>
      <td></td>
      <td></td>
      <td class="tl">TL</td>
      <td></td>
      <td></td>
      <td></td>
      <td class="dl">DL</td>
      <td></td>
    </tr>
    <tr>
      <td></td>
      <td></td>
      <td class="dw">DW</td>
      <td></td>
      <td></td>
      <td></td>
      <td class="dl">DL</td>
      <td></td>
      <td class="dl">DL</td>
      <td></td>
      <td></td>
      <td></td>
      <td class="dw">DW</td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <td></td>
      <td></td>
      <td></td>
      <td class="tl">TL</td>
      <td></td>
      <td></td>
      <td></td>
      <td class="dl">DL</td>
      <td></td>
      <td></td>
      <td></td>
      <td class="tl">TL</td>
      <td></td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <td class="tw">TW</td>
      <td></td>
      <td></td>
      <td></td>
      <td class="dw">DW</td>
      <td></td>
      <td class="dl">DL</td>
      <td></td>
      <td class="dl">DL</td>
      <td></td>
      <td class="dw">DW</td>
      <td></td>
      <td></td>
      <td></td>
      <td class="tw">TW</td>
    </tr>
    <tr>
      <td></td>
      <td class="tl">TL</td>
      <td></td>
      <td></td>
      <td></td>
      <td class="tl">TL</td>
      <td></td>
      <td></td>
      <td></td>
      <td class="tl">TL</td>
      <td></td>
      <td></td>
      <td></td>
      <td class="tl">TL</td>
      <td></td>
    </tr>
    <tr>
      <td></td>
      <td></td>
      <td class="dl">DL</td>
      <td></td>
      <td class="dl">DL</td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td class="dl">DL</td>
      <td></td>
      <td class="dl">DL</td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <td class="dl">DL</td>
      <td></td>
      <td></td>
      <td class="dw">DW</td>
      <td></td>
      <td></td>
      <td></td>
      <td class="or">S</td>
      <td></td>
      <td></td>
      <td></td>
      <td class="dw">DW</td>
      <td></td>
      <td></td>
      <td class="dl">DL</td>
    </tr>
    <tr>
      <td></td>
      <td></td>
      <td class="dl">DL</td>
      <td></td>
      <td class="dl">DL</td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td class="dl">DL</td>
      <td></td>
      <td class="dl">DL</td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <td></td>
      <td class="tl">TL</td>
      <td></td>
      <td></td>
      <td></td>
      <td class="tl">TL</td>
      <td></td>
      <td></td>
      <td></td>
      <td class="tl">TL</td>
      <td></td>
      <td></td>
      <td></td>
      <td class="tl">TL</td>
      <td></td>
    </tr>
    <tr>
      <td class="tw">TW</td>
      <td></td>
      <td></td>
      <td></td>
      <td class="dw">DW</td>
      <td></td>
      <td class="dl">DL</td>
      <td></td>
      <td class="dl">DL</td>
      <td></td>
      <td class="dw">DW</td>
      <td></td>
      <td></td>
      <td></td>
      <td class="tw">TW</td>
    </tr>
    <tr>
      <td></td>
      <td></td>
      <td></td>
      <td class="tl">TL</td>
      <td></td>
      <td></td>
      <td></td>
      <td class="dl">DL</td>
      <td></td>
      <td></td>
      <td></td>
      <td class="tl">TL</td>
      <td></td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <td></td>
      <td></td>
      <td class="dw">DW</td>
      <td></td>
      <td></td>
      <td></td>
      <td class="dl">DL</td>
      <td></td>
      <td class="dl">DL</td>
      <td></td>
      <td></td>
      <td></td>
      <td class="dw">DW</td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <td></td>
      <td class="dl">DL</td>
      <td></td>
      <td></td>
      <td></td>
      <td class="tl">TL</td>
      <td></td>
      <td></td>
      <td></td>
      <td class="tl">TL</td>
      <td></td>
      <td></td>
      <td></td>
      <td class="dl">DL</td>
      <td></td>
    </tr>
    <tr>
      <td class="tl">TL</td>
      <td></td>
      <td></td>
      <td></td>
      <td class="tw">TW</td>
      <td></td>
      <td></td>
      <td class="dl">DL</td>
      <td></td>
      <td></td>
      <td class="tw">TW</td>
      <td></td>
      <td></td>
      <td></td>
      <td class="tl">TL</td>
    </tr>
  </tbody>
</table>

Players, at the start of the game, are each given 7 letters, and take turns to lay a word to the table. The first player to start, lays a word that either horizontally or vertically overlays to the starting position **S** (in the actual game, the spot is marked with a star). In all consecutive turns players have to try and put words adjecant to the letters of the other words that already have been put to the table. If a player can't make a word, they're allowed to skip a turn, or exchange all or some of their letters. For each play, the player is rewarded with points. The player who lays the best words once the board is filled with a certain amount of letters, wins the game.

### What is the best word?
Scoring a word in Wordfeud works a little different than in scrabble. In regular scrabble there are only 'double letter' or 'tripple letter' tiles. In Wordfeud there are also 'double word' and 'tripple word' tiles. Also, it's allowed to lay words on the same axis, if the subsequent two-letter words form correct words as well. Next up, I'll go over some examples, to explain how the words are scored. The letter-values are taken from the way its counted in Dutch, which is different then in English [3]. To be clear; I'll be using the letter values from the second column, which are different then the third column.

Letter | Value NL | Value EN
-------|----------|---------
A      | 1        | 1
B      | 4        | 4
C      | 5        | 4
D      | 2        | 2
E      | 1        | 1
F      | 4        | 4
G      | 3        | 3
H      | 4        | 4
I      | 2        | 1
J      | 4        | 10
K      | 3        | 5
L      | 3        | 1
M      | 3        | 3
N      | 1        | 1
O      | 1        | 1
P      | 4        | 4
Q      | 10       | 10
R      | 2        | 1
S      | 2        | 1
T      | 2        | 1
U      | 2        | 2
V      | 4        | 4
W      | 5        | 4
X      | 8        | 8
Y      | 8        | 4
Z      | 5        | 10
?      | 0        | 0

---

### The starting position
<table class="wordfeud">
  <tbody>
    <tr>
      <td class="tl">TL</td>
      <td></td>
      <td></td>
      <td></td>
      <td class="tw">TW</td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <td></td>
      <td class="dl">DL</td>
      <td></td>
      <td></td>
      <td></td>
      <td class="tl">TL</td>
      <td></td>
    </tr>
    <tr>
      <td></td>
      <td></td>
      <td class="dw">DW</td>
      <td></td>
      <td></td>
      <td></td>
      <td class="dl">DL</td>
    </tr>
    <tr>
      <td></td>
      <td></td>
      <td></td>
      <td class="tl">TL</td>
      <td></td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <td class="tw">TW</td>
      <td></td>
      <td></td>
      <td></td>
      <td class="dw">DW</td>
      <td></td>
      <td class="dl">DL</td>
    </tr>
    <tr>
      <td></td>
      <td class="tl">TL</td>
      <td></td>
      <td></td>
      <td></td>
      <td class="tl">TL</td>
      <td></td>
    </tr>
    <tr>
      <td></td>
      <td></td>
      <td class="l">S<span>2</span></td>
      <td class="l">T<span>2</span></td>
      <td class="l">E<span>1</span></td>
      <td class="l">P<span>4</span></td>
      <td></td>
    </tr>
  </tbody>
</table>

The examples below all start from the 7x7 board above, featuring just the word "STEP". Step is Dutch for autoped, at least the one's you have to kick manually. All though I think the electrical one's are also called a "step".

### Simple example: 'STEPS'
<table class="wordfeud">
  <tbody>
    <tr>
      <td class="tl">TL</td>
      <td></td>
      <td></td>
      <td></td>
      <td class="tw">TW</td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <td></td>
      <td class="dl">DL</td>
      <td></td>
      <td></td>
      <td></td>
      <td class="tl">TL</td>
      <td></td>
    </tr>
    <tr>
      <td></td>
      <td></td>
      <td class="dw">DW</td>
      <td></td>
      <td></td>
      <td></td>
      <td class="dl">DL</td>
    </tr>
    <tr>
      <td></td>
      <td></td>
      <td></td>
      <td class="tl">TL</td>
      <td></td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <td class="tw">TW</td>
      <td></td>
      <td></td>
      <td></td>
      <td class="dw">DW</td>
      <td></td>
      <td class="dl">DL</td>
    </tr>
    <tr>
      <td></td>
      <td class="tl">TL</td>
      <td></td>
      <td></td>
      <td></td>
      <td class="tl">TL</td>
      <td></td>
    </tr>
    <tr>
      <td></td>
      <td></td>
      <td class="l">S<span>2</span></td>
      <td class="l">T<span>2</span></td>
      <td class="l">E<span>1</span></td>
      <td class="l">P<span>4</span></td>
      <td class="l n">S<span>2</span></td>
    </tr>
  </tbody>
</table>

This is the easiest example. The only play the player makes here is adding an "S"-tile to the existing word STEP, to make the word "STEPS", which is still a valid Dutch word according to the Van Dale dictionary [4]. In the example below the total amount of points would become: 2 + 2 + 1 + 4 + 2 = 11 points.

### Hitting both a triple and a double word tile with: "GEBAKJE"
<table class="wordfeud">
  <tbody>
    <tr>
      <td class="tl">TL</td>
      <td></td>
      <td></td>
      <td></td>
      <td class="l n">G<span>3</span></td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <td></td>
      <td class="dl">DL</td>
      <td></td>
      <td></td>
      <td class="l n">E<span>1</span></td>
      <td class="tl">TL</td>
      <td></td>
    </tr>
    <tr>
      <td></td>
      <td></td>
      <td class="dw">DW</td>
      <td></td>
      <td class="l n">B<span>4</span></td>
      <td></td>
      <td class="dl">DL</td>
    </tr>
    <tr>
      <td></td>
      <td></td>
      <td></td>
      <td class="tl">TL</td>
      <td class="l n">A<span>1</span></td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <td class="tw">TW</td>
      <td></td>
      <td></td>
      <td></td>
      <td class="l n">K<span>3</span></td>
      <td></td>
      <td class="dl">DL</td>
    </tr>
    <tr>
      <td></td>
      <td class="tl">TL</td>
      <td></td>
      <td></td>
      <td class="l n">J<span>4</span></td>
      <td class="tl">TL</td>
      <td></td>
    </tr>
    <tr>
      <td></td>
      <td></td>
      <td class="l">S<span>2</span></td>
      <td class="l">T<span>2</span></td>
      <td class="l">E<span>1</span></td>
      <td class="l">P<span>4</span></td>
      <td></td>
    </tr>
  </tbody>
</table>
In this board, we hit both the double word and the triple word multiplier by placing the word "GEBAKJE" (which is Dutch for a small cake) vertically down. The way this is scored is: (3 + 1 + 4 + 1 + 3 + 4 + 1) x 2 x 3 = 102 points.


### Laying a word horizontally adjecant: "RAAM"
<table class="wordfeud">
  <tbody>
    <tr>
      <td class="tl">TL</td>
      <td></td>
      <td></td>
      <td></td>
      <td class="tw">TW</td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <td></td>
      <td class="dl">DL</td>
      <td></td>
      <td></td>
      <td></td>
      <td class="tl">TL</td>
      <td></td>
    </tr>
    <tr>
      <td></td>
      <td></td>
      <td class="dw">DW</td>
      <td></td>
      <td></td>
      <td></td>
      <td class="dl">DL</td>
    </tr>
    <tr>
      <td></td>
      <td></td>
      <td></td>
      <td class="tl">TL</td>
      <td></td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <td class="tw">TW</td>
      <td></td>
      <td></td>
      <td></td>
      <td class="dw">DW</td>
      <td></td>
      <td class="dl">DL</td>
    </tr>
    <tr>
      <td></td>
      <td class="l n">R<span>2</span></td>
      <td class="l n">A<span>1</span></td>
      <td class="l n">A<span>1</span></td>
      <td class="l n">M<span>3</span></td>
      <td class="tl">TL</td>
      <td></td>
    </tr>
    <tr>
      <td></td>
      <td></td>
      <td class="l">S<span>2</span></td>
      <td class="l">T<span>2</span></td>
      <td class="l">E<span>1</span></td>
      <td class="l">P<span>4</span></td>
      <td></td>
    </tr>
  </tbody>
</table>
"RAAM" is Dutch for window, and can be placed horizontally adjecant to "STEP". The points in this case work as follows:

```
"RAAM" = (2 x 3) + 1 + 1 + 3 = 11
"ME"   = 3 + 1 = 4
"AT"   = 1 + 2 = 3
"AS"   = 1 + 2 = 3
```

Totalling 11 + 4 + 3 + 3 = 21 points.

### Clearing the board with MUFFINS
<table class="wordfeud">
  <tbody>
    <tr>
      <td class="tl">TL</td>
      <td></td>
      <td></td>
      <td></td>
      <td class="tw">TW</td>
      <td></td>
      <td class="l n">M<span>3</span></td>
    </tr>
    <tr>
      <td></td>
      <td class="dl">DL</td>
      <td></td>
      <td></td>
      <td></td>
      <td class="tl">TL</td>
      <td class="l n">U<span>2</span></td>
    </tr>
    <tr>
      <td></td>
      <td></td>
      <td class="dw">DW</td>
      <td></td>
      <td></td>
      <td></td>
      <td class="l n">F<span>4</span></td>
    </tr>
    <tr>
      <td></td>
      <td></td>
      <td></td>
      <td class="tl">TL</td>
      <td></td>
      <td></td>
      <td class="l n">F<span>4</span></td>
    </tr>
    <tr>
      <td class="tw">TW</td>
      <td></td>
      <td></td>
      <td></td>
      <td class="dw">DW</td>
      <td></td>
      <td class="l n">I<span>2</span></td>
    </tr>
    <tr>
      <td></td>
      <td class="tl">TL</td>
      <td></td>
      <td></td>
      <td></td>
      <td class="tl">TL</td>
      <td class="l n">N<span>1</span></td>
    </tr>
    <tr>
      <td></td>
      <td></td>
      <td class="l">S<span>2</span></td>
      <td class="l">T<span>2</span></td>
      <td class="l">E<span>1</span></td>
      <td class="l">P<span>4</span></td>
      <td class="l n">S<span>2</span></td>
    </tr>
  </tbody>
</table>

Once you've cleared all the 7 letters of your board, you're awarded a multiplier. The way this play adds up is like such:

```
MUFFINS = 3 + 2 + (4 x 2) + 4 + (2 x 2) + 1 + 2 = 24 points.
STEPS   = 11 points
```

An additional 40 points are awarded for placing all 7 tiles [3]:

24 + 11 + 40 = 75 points.

---

There's one other moment where extra points are awarded and it's when a player clears its board at the end of the game. If that happens, the remaining letter scores from the other player are added to the player who clears its board [3]. For the thing I'm planning to build we'll ignore this case.

### Finding a Dutch dictionary
Because I've been playing Wordfeud so much with my dad, I am aware that some Dutch words aren't valid plays and some of them are. For example, a lot of abbreviations aren't playable words like CD or WC (watercloset or toilet). However, some strange 2 letter words are allowed like "ST" (which is what you say to silence somebody or it could be short for "Saint") or "MN" which I have no idea what that means, but I know Wordfeud thinks that's fine. My best guess is that it means "hmmm"; the noise you make when you're thinking, or it could be short for "mijn".

Regardless, the Dutch dictionary can be found from the Wordfeud website [5], which links to a company called "Taaltik" which provides the official Wordfeud word list for the Dutch language. There I was able to validate that "MN" is short for "mijn"; finally some relieve. However, I'm trying to get a CSV/JSON/SQLITE list, but I'm not able to find anything on their website [6]. The website from Taaltik also hasn't been updated since 2014 (or the copyright year hasn't been adjusted at least). So, I have no clue where to find it.

As an alternative I did find the wordlist from "OpenTaal [7]" which is a giant ~5MB txt document. I imagine this will be fine for now, but getting the official Wordfeud words would be better of course.

### Setting up the project
I start out with a Rust project. In it there will be a data folder which will look like such:

```
data
└── nl
    ├── letterpoints.txt
    └── wordlist.txt
```

The `letterpoints.txt` will just be a simple CSV-like file containing all the points to each letter. The `wordlist.txt` is a list of words. For now it's a txt file, but I imagine it will become a SQLite database while I continue on with this project, and this article. The program can be run as:

```
cargo run nl "ABCDEFG"
```

The first argument `nl` is the language, the second argument will be the letters on the board. The board configuration will be the standard configuration, but knowing that a random configuration is possible, we should allow users to configure it as such. For the current board and the layout of the board I'll use two files: `layout.default.board` and `current.board`. The layout file will look like such:

```
3...5..2..5...3
.2...3...3...2.
..4...2.2...4..
...3...2...3...
5...4.2.2.4...5
.3...3...3...3.
..2.2.....2.2..
2..4...1...4..2
..2.2.....2.2..
.3...3...3...3.
5...4.2.2.4...5
...3...2...3...
..4...2.2...4..
.2...3...3...2.
3...5..2..5...3
```

And the start board (which will contain the actual letters) will be something like this:

```
...............
...............
...............
...............
...............
...............
...............
...............
...............
...............
...............
...............
...............
...............
...............
```

At the start of the game the grid is obviously empty. Adding the most recent game I'm playing against my dad, which I'm losing pretty badly (151 points vs 256 points), it would look something like this:


```
...............
...............
...............
...............
...............
...............
...............
.....MUFS......
.....N.I.......
....D.EX.V.....
G..LENTEDAG....
EN..S.ER..E....
BAROK.NEVELEN..
AS.....N..I....
K..ECHODE.D....
```

Configuring this is a bit painful, but it's not too bad. I mean, cheating doesn't need to become too easy. The output of my code would be all the words I can put to the current game with all their total points and where they can be put, obviously sorted by highest points first.

### Forming matching words
Now that I've laid out a basic structure for my project, it's time to start solving the first issue. The first issue is: what words can I form with my letters? We'll ignore the letters in the board for a moment and their placement, as that's an entirely different subject. For now, we'll just merely focus on the words we can make with the 7 letters we've been dealt, in other words, how do we solve anagrams? Lucky for me other people on the internet have already solved this [8]. The way to do this is as follows:

- Associate each letter with a prime: A = 1, B = 3, .... Z = 101.
- Calculate the prime factorization of each word in the `wordlist.txt`
- Calculate the prime factor of the letters you have and check which one's match.

Because there are 413.921 words in the wordlist that's provided by Opentaal, it might be an idea to store all these prime factorizations in a little SQLite database. It's a simple single-table database which looks like such:

```sql
CREATE TABLE words (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    word VARCHAR(15) NOT NULL UNIQUE,
    prime_factor BIGINT NOT NULL
);
CREATE INDEX prime_factor_index ON words (prime_factor);
```

After writing some code [II] I can setup the database (just on the first run) and only store words that are between 2 and 15 characters, and that contain letters only (no whitespace or numbers). In order to find matching words to my letters, all I need to do is perform a single query to the database. F.e. if I have the letters `TRESE`, this will become the prime factor 35111417. To give me all the anagrams of those letters, I can query the database like such:

```
SELECT word FROM words WHERE prime_factor = 35111417
```

This will just give me the anagrams for 5-letters in any order. However, I also have to include all the other lower-count letter combinations.

Imagine we have these 8 letters `ESTSREQZ`. We need to turn this blob of letters into its unique 2- till 8-letter combinations [9]. Combinations which would look like this:

```
2 letters:
EE EQ ER ES ET EZ QZ RE
RQ RZ SE SQ SR SS ST SZ
TE TQ TR TS TZ

3 letters:
EEQ EEZ EQZ ERE ERQ ERZ ESE ESQ
ESR ESS EST ESZ ETE ETQ ETR ETS
ETZ REQ REZ RQZ SEQ SEZ SQZ SRE
SRQ SRZ SSE SSQ SSR SSZ STE STQ
STR STS STZ TEQ TEZ TQZ TRE TRQ
TRZ TSE TSQ TSR TSZ

4 letters:
EEQZ EREQ EREZ ERQZ ESEQ
ESEZ ESQZ ESRE ESRQ ESRZ
ESSE ESSQ ESSR ESSZ ESTE
ESTQ ESTR ESTS ESTZ ETEQ
ETEZ ETQZ ETRE ETRQ ETRZ
ETSE ETSQ ETSR ETSZ REQZ
SEQZ SREQ SREZ SRQZ SSEQ
SSEZ SSQZ SSRE SSRQ SSRZ
STEQ STEZ STQZ STRE STRQ
STRZ STSE STSQ STSR STSZ
TEQZ TREQ TREZ TRQZ TSEQ
TSEZ TSQZ TSRE TSRQ TSRZ

5 letters:
EREQZ ESEQZ ESREQ ESREZ
ESRQZ ESSEQ ESSEZ ESSQZ
ESSRE ESSRQ ESSRZ ESTEQ
ESTEZ ESTQZ ESTRE ESTRQ
ESTRZ ESTSE ESTSQ ESTSR
ESTSZ ETEQZ ETREQ ETREZ
ETRQZ ETSEQ ETSEZ ETSQZ
ETSRE ETSRQ ETSRZ SREQZ
SSEQZ SSREQ SSREZ SSRQZ
STEQZ STREQ STREZ STRQZ
STSEQ STSEZ STSQZ STSRE
STSRQ STSRZ TREQZ TSEQZ
TSREQ TSREZ TSRQZ

6 letters:
ESREQZ ESSEQZ ESSREQ ESSREZ
ESSRQZ ESTEQZ ESTREQ ESTREZ
ESTRQZ ESTSEQ ESTSEZ ESTSQZ
ESTSRE ESTSRQ ESTSRZ ETREQZ
ETSEQZ ETSREQ ETSREZ ETSRQZ
SSREQZ STREQZ STSEQZ STSREQ
STSREZ STSRQZ TSREQZ

7 letters:
ESSREQZ ESTREQZ ESTSEQZ
ESTSREQ ESTSREZ ESTSRQZ
ETSREQZ STSREQZ

8 letters:
ESTSREQZ
```

After we have those combinations, we can easily turn them into all their unique prime factorizations and ask the database which anagrams it returns. At my current code [II] this will return:

```
2 letters:
EE EQ ER ES ET EZ QS RE
RS SE SS ST TE TS ZE ZS

3 letters:
EER EES EET ERE EST ETS REE RES
RET RSS SER SET TEE TER TES TSE
TSS ZEE ZES ZET

4 letters:
EERT EEST ERTS ESER ESTS
ETER REES REET REST RETZ
SERT SETS SETZ SSER STEE
STER TEER TEES TERE TESS
TREE TRES ZEER ZEET ZERE

5 letters:
EERST ESSER ESTER ESTSE
ETERS ETSER REEST RESET
SEZER STEER STRES TEERS
TREES ZESTE

6 letters:
ESTERS ETSERS SETERS
SEZERS TESSER ZEERST
```

Obviously, there are some non-valid Wordfeud words like `SS`, `QS`, `RSS` or `EE`. But that's the risk I'm accepting for now, having no access to the actual Wordfeud wordlist. I'm assuming there are some scrabble-rules which would filter those words off, but I can also make a very simple filter list later on in the project and discard any words that aren't valid.

At this point in the project I am already quite happy, because this is what most anagram-solvers and wordfeud helpers online are doing. However, I also have to include the joker-tile. And I still want to make it return the correct placement on the board.

### The Joker-tile
In Wordfeud players can be dealt a joker-tile or a `?`. This tile is worth 0 points, but you can use it for any letter of the alphabet. If I get the letters: `ST??R`, that means that I have 26<sup>2</sup> combinations of words to test for anagrams. I tried quite hard to find a rotational lock algorithm (to turn each question mark into 'A' till 'Z') but only manage to found some really overly complex solutions which all didn't make sense to me. What I did instead was use some basic math:

```rust
// The amount of letters in the alphabet
const LETTER_COUNT: usize = 26;

fn get_prime_factors(strings: &HashSet<String>) -> HashSet<u128> {
    let mut prime_factors = HashSet::new();

    for string in strings {
        let base = string.replace("?", "");
        let factor = self.prime_factor(&base);

        if base.len() < string.len() {
            let joker_count = string.len() - base.len();
            let total = LETTER_COUNT.pow(joker_count as u32);

            for i in 0..total {
                let mut new_factor = factor;
                for j in 0..joker_count {
                    let div = LETTER_COUNT.pow(j as u32);
                    let p = (i / div) % LETTER_COUNT;

                    new_factor *= self.primes[p];
                }
                prime_factors.insert(new_factor);
            }
        } else {
            prime_factors.insert(factor);
        }
    }

    prime_factors
}
```

The `get_prime_factors` method takes a set of strings and loops over all the individual strings. It then replaces all the `?` with nothing, and tests how many joker tiles are in that particular string. If there are none, this is the only factor to find an anagram for. If there is a question mark in the string we do the following:

First, we calculate the amount of factors we'll be generating by taking the power of the amount of letters in the alphabet (26) by the amount of joker tiles we have. 1 joker means 26 factors, 2 jokers means 676 factors, 3 jokers means 17576 factors (the max amount of jokers in the game is 2, but maybe the rules of the game change in the future), and so on. In the 2nd loop, we copy the original factor to a new value called `new_factor` and multiply that factor by the primes at index p. You should see it as follows, imagine we have three joker tiles:

```
At the first cycle (i = 0):
  (i / 1) % 26 = 0
  (i / 26) % 26 = 0
  (i / 676) % 26 = 0

  ['A', 'A', 'A']

...

At the 26th cycle (i = 25):
  (i / 1) % 26 = 25
  (i / 26) % 26 = 0
  (i / 676) % 26 = 0

  ['Z', 'A', 'A']

At the 27th cycle (i = 26):
  (i / 1) % 26 = 0
  (i / 26) % 26 = 1
  (i / 676) % 26 = 0

  ['A', 'B', 'A']

... and so on
```

The performance for 2 question marks doesn't quite suffer, but it does result in a very big IN-query to the SQLite database, where it seems it has absolutely no issue with it [III]. For fun I did a little test with `????` to see if Rust would start to show cracks, but it resulted in a nice 0.51s performance time, which is fast enough in my book. However, to really make it crack; after 5 joker tiles it took ~8 seconds, which is definitely too slow, but I won't be making this application for next level Wordfeud cheaters who are able to conjure up more joker tiles than are allowed in the game; sorry.

### Optimal plays
In the current phase of this project, I can manually determine the most optimal play at the start of the game. If we have the letters `ESTSREQZ` like the example earlier, my bet would be that the words "ZEERST" and "SEZERS" give the most points, considering both of them contain a "Z" which is 5 points. In fact both words score an equal 13 points. If this is the start of the game, when placing them on the board I would go and try to hit one of the orange double-word tiles on the left or the right, to score 26 points. For example:

<table class="wordfeud">
  <tbody>
    <tr>
      <td class="dw">DW</td>
      <td></td>
      <td></td>
      <td></td>
      <td class="dl">DL</td>
      <td></td>
      <td class="dl">DL</td>
      <td></td>
      <td></td>
      <td></td>
      <td class="dw">DW</td>
    </tr>
    <tr>
      <td></td>
      <td class="tl">TL</td>
      <td></td>
      <td></td>
      <td></td>
      <td class="dl">DL</td>
      <td></td>
      <td></td>
      <td></td>
      <td class="tl">TL</td>
      <td></td>
    </tr>
    <tr>
      <td></td>
      <td></td>
      <td class="dw">DW</td>
      <td></td>
      <td class="dl">DL</td>
      <td></td>
      <td class="dl">DL</td>
      <td></td>
      <td class="dw">DW</td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <td></td>
      <td></td>
      <td></td>
      <td class="tl">TL</td>
      <td></td>
      <td></td>
      <td></td>
      <td class="tl">TL</td>
      <td></td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <td class="dl">DL</td>
      <td></td>
      <td class="dl">DL</td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td class="dl">DL</td>
      <td></td>
      <td class="dl">DL</td>
    </tr>
    <tr>
      <td></td>
      <td class="dw">DW</td>
      <td></td>
      <td></td>
      <td></td>
      <td class="l n">Z<span>5</span></td>
      <td class="l n">E<span>1</span></td>
      <td class="l n">E<span>1</span></td>
      <td class="l n">R<span>2</span></td>
      <td class="l n">S<span>2</span></td>
      <td class="l n">T<span>2</span></td>
    </tr>
    <tr>
      <td class="dl">DL</td>
      <td></td>
      <td class="dl">DL</td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td class="dl">DL</td>
      <td></td>
      <td class="dl">DL</td>
    </tr>
    <tr>
      <td></td>
      <td></td>
      <td></td>
      <td class="tl">TL</td>
      <td></td>
      <td></td>
      <td></td>
      <td class="tl">TL</td>
      <td></td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <td></td>
      <td></td>
      <td class="dw">DW</td>
      <td></td>
      <td class="dl">DL</td>
      <td></td>
      <td class="dl">DL</td>
      <td></td>
      <td class="dw">DW</td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <td></td>
      <td class="tl">TL</td>
      <td></td>
      <td></td>
      <td></td>
      <td class="dl">DL</td>
      <td></td>
      <td></td>
      <td></td>
      <td class="tl">TL</td>
      <td></td>
    </tr>
    <tr>
      <td class="dw">DW</td>
      <td></td>
      <td></td>
      <td></td>
      <td class="dl">DL</td>
      <td></td>
      <td class="dl">DL</td>
      <td></td>
      <td></td>
      <td></td>
      <td class="dw">DW</td>
    </tr>
  </tbody>
</table>

However, in this scenario - assuming the origin (x,y) is at the top-left corner and knowing that I have to hit a tile at the middle (7,7) - any play starting from the following points would give me 26 points:

```
{x: 2, y: 7}
{x: 3, y: 7}
{x: 6, y: 7}
{x: 7, y: 7}
```

I am not going to get into "which of these 4 points is the most optimal play", but rather return the user that there are 4 options which equally result in 26 points (please use your brain to do the rest).

This is all nice, but most of the time there are already existing letters on the board which need to be taken into account. Let's take the game between me and my dad earlier on. Let's assume I have the letters `PEKDAAL` and not my existing set of letters with which I'm losing pretty badly.

```
PEKDAAL

...............
...............
...............
...............
...............
...............
...............
.....MUFS......
.....N.I.......
....D.EX.V.....
G..LENTEDAG....
EN..S.ER..E....
BAROK.NEVELEN..
AS.....N..I....
K..ECHODE.D....
```

How many possible plays are in this board? Ignoring all the bonus tiles, how many plays - invalid and valid - are in this board? And how would I query for them in my anagram wordlist SQLite database? Let's first just list all the possible plays by hand to see if there's some pattern to discover.

#### Bad idea #1:
First, let's see how many horizontal and vertical plays we have, put the letters in square brackets (`[]`) indicate that they're stuck in place, the numbers in between indicate how much space there is above/below left/right:

```
Vertical plays:

x
0  | 10 [GEBAK] 0
1  | 11 [NAS] 1
2  | 12 [R] 2
3  | 10 [L] 1 [O] 1 [E] 0
4  | 9  [DESK] 1 [C] 0
5  | 7  [MN] 1 [N] 3 [H] 0
6  | 7  [U] 1 [ETEN] 1 [O] 0
7  | 7  [FIXEREND] 0
8  | 7  [S] 2 [D] 1 [V] 1 [E] 0
9  | 9  [VA] 1 [E] 2
10 | 10 [GELID] 0
11 | 12 [E] 2
12 | 12 [N] 2
13 | 15 (Adjecant to NEVELEN)
15 | (NO POSSIBLE PLAYS)

Horizontal plays:

y
0  | (NO POSSIBLE PLAYS)
1  | (NO POSSIBLE PLAYS)
2  | (NO POSSIBLE PLAYS)
3  | (NO POSSIBLE PLAYS)
4  | (NO POSSIBLE PLAYS)
5  | (NO POSSIBLE PLAYS)
6  | 15 (Adjecant to MUFS)
7  | 5  [MUFS] 6
8  | 5  [N] 1 [I] 7
10 | 4  [D] 1 [EX] 1 [V] 5
11 | 0  [G] 2 [LENTEDAG] 4
12 | 0  [EN] 2 [S] 1 [ER] 2 [E] 4
13 | 0  [BAROK] 1 [NEVELEN] 2
14 | 0  [AS] 5 [N] 2 [I] 4
15 | 0  [K] 2 [ECHODE] 1 [D] 4
```

Let's start with the first play `10 [GEBAK] 0`. I have 7 letters which I can all space above `[GEBAK]`. There are words like that f.e. `VANILLEGEBAK` which I could play, but I have the letters `{PEKDAAL}`. In order to solve this I would query all the words which look like the following statement:

```sql
SELECT word FROM words WHERE word LIKE "__%GEBAK";
```

This would give me all the words that end on "GEBAK" but have at least 2 letters in front, so:

```
APPELGEBAK
BAGAGEBAK
BANKETGEBAK
BISCUITGEBAK
BLADERDEEGGEBAK
DIEPVRIESGEBAK
FEESTGEBAK
KERSTGEBAK
MOKKAGEBAK
SCHUIMGEBAK
SLAGROOMGEBAK
ZANDGEBAK
```

Before continueing on and calculating the prime-factors of the prefixes to GEBAK, let's take a more complex example like `0 [AS] 5 [N] 2 [I] 4`. This would result in a query like this:

```sql
SELECT word FROM words WHERE word LIKE "AS_____N__I___";
```

However I only have 7 letters to put, so this query needs to be split up, and will probably become something like:

```sql
SELECT word
FROM words
WHERE word LIKE "AS_____N__I" OR
      word LIKE "%N__I%" OR
      word LIKE "_I____" OR
      -- some other LIKE query
```

However this feels like a silly way of approaching this, because I'm ignoring all the letters above and below the empty spaces. I should probaby go for the `REGEXP` solution:

```sql
SELECT word
FROM words
WHERE word REGEXP "^AS[A-Z]{5}N[A-Z]{2}I$" OR
           REGEXP "^[A-Z]{1,4}N[A-Z]{2}I$" OR
           REGEXP "^[A-Z]{1,3}N[A-Z]{2}I[A-Z]{1,4}$" OR
           -- some other REGEX'es...
```

Or first, massage the data into something useful before jumping straight to the query. I think this idea dies pretty fast, because of all the complicated regular expressions I need to to put to the database.

### Idea #2
I can also approach this from all the possible points I can put a single letter. If we take a look at the example again, and indicate with a dot (.) where I can put a letter, this is what I get:

```





     ....
    .MUFS.
    .N.I..
.  .D.EX.V.
G..LENTEDAG.
EN..S.ER..E..
BAROK.NEVELEN.
AS.....N..I..
K..ECHODE.D.
```

I already have 40 points where I can put one (or more) letters. Together with the fact that I have 7 letters, already makes for 280 possible plays with just a single letter. With two or more letters things get a bit more complicated but not by that much. The code would've have to look - per letter point - if there's any amount of N-spaces above, below or to the left or the right from my current point.

### Sources

1. [Automatic Wordfeud Playing Bot](https://www.csc.kth.se/utbildning/kandidatexjobb/datateknik/2012/rapport/berntsson_martin_OCH_ericsson_fredric_K12012.pdf)
1. [AOC 2022](https://github.com/grdw/aoc2022)
1. [Wordfeud scoring](https://wordfeud.com/wf/help/)
1. [Betekenis "Steps"](https://www.vandale.nl/gratis-woordenboek/nederlands/betekenis/steps)
1. [Wordfeud dictionaries](https://wordfeud.com/dictionaries/)
1. [Taaltik Wordfeud site](http://taaltik-wordfeud.keesing.com/)
1. [OpenTaal wordlist](https://github.com/OpenTaal/opentaal-wordlist)
1. [An Algorithm for Finding Anagrams](https://hackernoon.com/an-algorithm-for-finding-anagrams-2fe7655de85b)
1. [Find distinct combinations of a given length](https://www.techiedelight.com/find-distinct-combinations-of-given-length/)

### Project stages

I. [Initial setup](https://github.com/grdw/wordfeud-cheater/tree/fef463b1bec37c34f40b2589220702952f7bf12a)
II. [Made an anagram solver!](https://github.com/grdw/wordfeud-cheater/tree/27b236cbb600c6252cf033a2707413db9040df2d)
III. [Included the joker tile](https://github.com/grdw/wordfeud-cheater/tree/f4c3c402a830d7c16bec3c25bfa9c07eb0eddbb3)
