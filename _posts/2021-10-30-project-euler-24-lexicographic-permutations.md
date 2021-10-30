---
layout: post
title: "Project Euler #24: Lexicographic permutations"
euler: 24
complexity: 2
---

{% include euler.html %}

**Introduction**
The lexicographic permutations of 0, 1 and 2 are:

012   021   102   120   201   210

What is the millionth lexicographic permutation of the digits 0, 1, 2, 3, 4, 5, 6, 7, 8 and 9?

The puzzle is very specific about "lexicographic", meaning: in order from smallest to highest. The set {0,1,2} has 3 items and therefor has a 3! (= 6) permutations. The set {0,1,2,3,4,5,6,7,8,9} has 10 items and therefor has a 10! (= 3.628.800) permutations. The permutations move in a very specific way because - to stay in order from low to high - they'll go like this:

```
0123456789
0123456798
0123456978
0123456987
etc. until:
9876543210
```

The first question I have is how many cycles does it take before we end up with: {1,0,2,3,4,5,6,7,8,9}? I believe the answer is 10! / 10, but I'm not entirely sure about this. To skip to {2,0,1,2,3,4,5,6,7,8,9} would take another 10! / 10 cycles. Perhaps to answer this we can draw out all the lexicographic permutations of {0,1,2,3}. There are 24 permutations:

```
0123 one group of 6 (4!/4)
0132
0213 the 1 changes into a 2 at n = 3
0231
0312
0321
--
1023
1032
1203
1230
1302
1320
--
2013
2031
2103
2130
2301
2310
--
3012
3021
3102
3120
3201
3210
```

This does proof my point, but how many steps would this cost: {0,2,1,3,4,5,6,7,8,9}? I think looking back at my group of 4 I think the answer is `n!/n/2`, but I'll probably need to validate that with some code. First up I need a method to calculate a factorial:

```rust
fn factorial(mut i: u64) -> u64 {
    let mut total = 2;
    while i > 2 {
        total *= i;
        i -= 1
    }
    total
}

#[test]
fn test_factorial() {
    assert_eq!(factorial(5), 120);
    assert_eq!(factorial(4), 24);
    assert_eq!(factorial(3), 6);
}
```

The next step is to make a group and start swapping:

```rust
fn problem_24(group: &mut Vec<u8>, rotations: u64) {

}

#[test]
fn test_problem_24() {
    let mut group = vec![0,1,2];
    problem_24(&mut group, 2);
    assert_eq!(group, vec![1, 0, 2]);
}
```

But how would we swap? Furthermore, how would we make each group if we start with the input as the lexicographical group at its starting formation? Taking the example of the group {0,1,2,3}:

```
01) 0123 START
02) 0132 SWAP 2 WITH 3
03) 0213 SWAP 1 WITH 2
04) 0231 SWAP 1 WITH 2, SWAP 1 WITH 3
05) 0312 SWAP 1 WITH 3, SWAP 1 WITH 2
06) 0321 SWAP 1 WITH 3
--
07) 1023 SWAP 0 WITH 1
08) 1032 SWAP 0 WITH 1, SWAP 2 WITH 3
09) 1203 SWAP 0 WITH 1, SWAP 0 WITH 2
10) 1230 SWAP 0 WITH 1, SWAP 0 WITH 2, SWAP 0 WITH 3
11) 1302 SWAP 0 WITH 1, SWAP 0 WITH 3, SWAP 0 WITH 2
12) 1320 SWAP 0 WITH 1, SWAP 0 WITH 3
--
13) 2013 SWAP 0 WITH 2, SWAP 0 WITH 1
14) 2031 SWAP 0 WITH 2, SWAP 0 WITH 1, SWAP 1 WITH 3
15) 2103 SWAP 0 WITH 2
16) 2130 SWAP 0 WITH 2, SWAP 0 WITH 3
17) 2301 SWAP 0 WITH 2, SWAP 1 WITH 3
18) 2310 SWAP 0 WITH 2, SWAP 1 WITH 3, SWAP 0 WITH 1
--
19) 3012 SWAP 0 WITH 3, SWAP 0 WITH 1, SWAP 1 WITH 2
20) 3021 SWAP 0 WITH 3, SWAP 0 WITH 1
21) 3102 SWAP 0 WITH 3, SWAP 0 WITH 2
22) 3120 SWAP 0 WITH 3
23) 3201 SWAP 0 WITH 3, SWAP 1 WITH 2, SWAP 0 WITH 1
24) 3210 SWAP 0 WITH 3, SWAP 1 WITH 2
```

As you can see: it sometimes takes more than 2 swaps to make a certain permutation from the starting point {0,1,2,3}, but it seems the max is capped at 3 moves for a group of 4. Does that also mean that for a group of 10, the max swaps is 9? I don't quite see the logic here yet, if I were to do this 12 times. How would that link to those set of swaps, landing me with the group {1,3,2,0}? Especially in relation with increasing the size of the group.

Another way of maybe looking at this problem is by turning it into a tree:

```
   1 - - 2  ( 0 1 2 )
  /
 0 - 2 - 1  ( 0 2 1 )
/
-1 = 0 - 2  ( 1 0 2 )
\    2 - 0  ( 1 2 0 )
 2 - 0 - 1  ( 2 0 1 )
  \
   1 - - 0  ( 2 1 0 )
```

If I were to say move from {0,1,2} -> {2,1,0} I'd know it will take 5 rotations to get there because it's the amount of edges at the end minus 1.Let's stop right here, and maybe there's some existing algorithm that might prove itself to be useful.

**Displaying all possible permutations**
To display all possible permutations of a group there's Heap's algorithm [1]. Implementing the pseudo-code from Wikipedia this looks like:

```rust
let mut result: Vec<usize> = vec![0; vector.len()];
let mut i = 0;

println!("{:?}", vector);
while i < vector.len() {
    if result[i] < i {
        if i % 2 == 0 {
            vector.swap(0, i);
        } else {
            vector.swap(result[i], i);
        }

        println!("{:?}", vector);
        result[i] += 1;
        i = 0;
    } else {
        result[i] = 0;
        i += 1
    }
}
```

This actually works, but the vectors look all scrambled in a somewhat random fashion. It's not a lexographical permutation just yet... Another method of generating permutations is by 'simple recursion' as described here [2] and implemented here [3]. This comes remarkably close; close, but no cigar. We need to find yet another method to build up permutations (there are quite a lot, browsing the internet). The one that does seem to provide a lexographical order is Ord-Smith's algorithm [4], so let's use that one:

```rust
fn reverse(vec: &mut Vec<u8>, mut a: usize, mut b: usize) {
    while a < b {
        vec.swap(a, b);
        a += 1;
        b -= 1;
    }
}

fn ord_smith(vec: &mut Vec<u8>, s: usize) {
    if s == vec.len() - 1 {
        println!("RESULT: {:?}", vec);
        return
    }

    for i in 0..vec.len() - s {
        if i > 0 {
            reverse(vec, s + 1, vec.len() - 1);
            vec.swap(s, s + i);
        }
        ord_smith(vec, s + 1);
    }
}
```

We can pretty much solve it with this algorithm, providing some very basic tweaks:

```rust
fn ord_smith(vec: &mut Vec<u8>, s: usize, count: &mut u32, max: u32) {
    if s == vec.len() - 1 {
        *count += 1;
        if *count == max {
            println!("RESULT: {:?}", vec);
        }
        return
    }

    for i in 0..vec.len() - s {
        if i > 0 {
            reverse(vec, s + 1, vec.len() - 1);
            vec.swap(s, s + i);
        }
        ord_smith(vec, s + 1, count, max);
    }
}
```

The result you can get by doing:

```rust
#[test]
fn test_ord_smith() {
    let mut count = 0;
    let mut group = vec![0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    ord_smith(&mut group, 0, &mut count, 1000000);
}
```

Which results in the group: {2, 7, 8, 3, 9, 1, 5, 4, 6, 0}, which is the correct answer. It's really funny to me that an algorithm from 1968 actually managed to solve this problem. It follows the rule: if it ain't broken, don't fix it.

**Sources**

- \[1\] [https://en.wikipedia.org/wiki/Heap%27s_algorithm](https://en.wikipedia.org/wiki/Heap%27s_algorithm)
- \[2\] [https://www.baeldung.com/cs/array-generate-all-permutations](https://www.baeldung.com/cs/array-generate-all-permutations)
- \[3\] [https://stackoverflow.com/questions/7537791/understanding-recursion-to-generate-permutations](https://stackoverflow.com/questions/7537791/understanding-recursion-to-generate-permutations)
- \[4\] [https://mathsanew.com/articles_html/27/permutations_with_recursionli5.html](https://mathsanew.com/articles_html/27/permutations_with_recursionli5.html)

{% include euler_complexity.html %}

