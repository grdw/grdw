---
layout: post
title: "Project Euler #18: Maximum path sum I"
problem_type: euler
problem: 18
complexity: 2
---
**Introduction**

The puzzle starts out with explaining that there's a triangle. We start from the top and go down until we find the route which produces the highest number.

The example they give is:

```
   3
  7 4
 2 4 6
8 5 9 3

3 + 7 + 4 + 9 = 23
```
The puzzle is to give a solution for a more complex triangle:

```
              75
             95 64
            17 47 82
           18 35 87 10
          20 04 82 47 65
         19 01 23 75 03 34
        88 02 77 73 07 63 67
       99 65 04 28 06 16 70 92
      41 41 26 56 83 40 80 70 33
     41 48 72 33 47 32 37 16 94 29
    53 71 44 65 25 43 91 52 97 51 14
   70 11 33 28 77 73 17 78 39 68 17 57
  91 71 52 38 17 14 91 43 58 50 27 29 48
 63 66 04 68 89 53 67 30 73 16 69 87 40 31
04 62 98 27 23 09 70 98 73 93 38 53 60 04 23
```
The first step while writing code, is going to be finding a structure that works for containing these numbers in such a way. My first thought is: "this should be a tree", however I do think a two dimensional vector works just as well:

```rust
// Example with the small triangle:
let triangle = vec![
    vec![3],
    vec![7, 4],
    vec![2, 4, 6],
    vec![8, 5, 9, 3]
];
```

**The wrong route**
The reason I'm saying this is because, you can still limit the amount of choices here be taking slices of length 2 from the array below each time. The way this would work is like this:

```rust
// Taking the 'triangle' variable above as 't':
fn problem_18(mut t: Vec<Vec<u32>>) -> u32 {
    let mut result = t.remove(0)[0]; // This value is: 3
    let mut offset = 0;

    for sub_t in t {
        let mut max = 0;
        // - for the first cycle, look at [7, 4]
        // as subset from [7, 4]
        // the highest index = 0
        // - for the next cycle look at subset [2, 4]
        // as subset from [2, 4, 6]
        // the highest index = 1
        // - for the next cycle look at the subset [5, 9]
        // from [8, 5, 9, 3]
        // the highest index = 2
        for (i, val) in sub_t[offset..offset + 2].iter().enumerate() {
            if max < *val {
                max = *val;
                offset = i;
            }
        }
        result += max
    }

    result
}
```

I'm not sure if this is how I should interpret this triangle, or if I should actually use a tree. Because the puzzle isn't specific about this, it might be nice to explore both as possible answers. Putting the big triangle in the method above I get the answer 1036 while the answer says it's 1074 (38 off), meaning it's time to start debugging. The first thing I noticed is that the `offset` that's being picked is wrong while it descends down the triangle; the offset should add `i` to `offset`.

```rust
for (i, val) in sub_t[offset..offset + 2].iter().enumerate() {
    if max < *val {
        max = *val;
        offset += i;
    }
}
```
This changes the answer from 1036 to 1064 (which is 10 off from 1074). I Googled my faulty answer and somebody proceeded to explain why, causing me to read the actual approach (aren't there spoiler free hints anywhere?).

**The right route**
To resolve this you actually have to start from the _bottom_ of the triangle.  Technically, I didn't come up with this answer, which does feel a little bit like cheating. However, now that I know, let's draw out how that works anyway:

```
   3
  7 4
 2 4 6
8 5 9 3

Do 8 + 2 <> 5 + 2 . swap 2 with 10
Do 5 + 4 <> 9 + 4 . swap 4 with 13
Do 9 + 6 <> 6 + 3 . swap 6 with 15

   3
  7 4
 10 13 15

etc.
```

Even though I cheated a little bit, writing the code was still a bit of a challenge in Rust because of the inline updating of the `triangle` vector. However after some carefully picked `iter_mut()`'s I came up with this:

```rust
let mut inbetween = triangle.pop().unwrap();

for layer in triangle.iter_mut().rev() {
    for (index, value) in layer.iter_mut().enumerate() {
        let x1 = inbetween.get(index).unwrap();
        let x2 = inbetween.get(index + 1).unwrap_or(&0);

        if *value + x1 > *value + x2 {
            *value += x1
        } else {
            *value += x2
        }
    }

    inbetween = layer.to_vec();
}

triangle[0][0]
```