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

  @media only screen and (max-width: 575px) {
    table.wordfeud.full { width: 100% }
  }
</style>

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
    ├── letterpoints.json
    └── wordlist.txt
```

The `letterpoints.json` will just be a simple JSON blob containing all the points to each letter. The `wordlist.txt` is a list of words. For now it's a txt file, but I imagine it will become a SQLite database while I continue on with this project, and this article. The program can be run as:

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
ILB

### Optimal plays
ILB

### Sources

\[1\] [Automatic Wordfeud Playing Bot](https://www.csc.kth.se/utbildning/kandidatexjobb/datateknik/2012/rapport/berntsson_martin_OCH_ericsson_fredric_K12012.pdf)

\[2\] [AOC 2022](https://github.com/grdw/aoc2022)

\[3\] [Wordfeud scoring](https://wordfeud.com/wf/help/)

\[4\] [Betekenis "Steps"](https://www.vandale.nl/gratis-woordenboek/nederlands/betekenis/steps)

\[5\] [Wordfeud dictionaries](https://wordfeud.com/dictionaries/)

\[6\] [Taaltik Wordfeud site](http://taaltik-wordfeud.keesing.com/)

\[7\] [OpenTaal wordlist](https://github.com/OpenTaal/opentaal-wordlist)
