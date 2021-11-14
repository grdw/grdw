---
layout: post
title: "Project Euler #11: Largest product in a grid"
problem_type: euler
problem: 11
complexity: 2
---
This was quite a doable puzzle, but it was a lot of work. If you follow the link, it specifies to find the largest product in a 20x20 grid. You can look down, up, left, right and diagonally.

I'm not going to talk about my first approach, because that was a nightmare. It worked, but it was the most insanely redundant code ever. After quite some refactoring, I got to the answer I currently have. Without going into the nightmare code, I'm going to talk about how I managed to solve it, with relatively _little_ code.

The first part is to create a method which can calculate 4 consecutive points in a grid in any given direction:

```rust
const SPOTS:i32 = 3;

fn factor_points(grid: &Vec<Vec<i32>>,
                 y: i32,
                 x: i32,
                 dir_y: i32,
                 dir_x: i32) -> i32 {

    let mut total = 1;
    let temp = vec![];

    for n in 0..=SPOTS {
        let y = y + n * dir_y;
        let x = x + n * dir_x;
        let y_row = grid.get(y as usize).unwrap_or(&temp);
        let x_value = y_row.get(x as usize).unwrap_or(&0);

        total *= x_value;
    }
    total
}

#[test]
fn test_factor_points() {
    let diagonal_grid = vec![
        vec![1, 2, 3, 4, 5],
        vec![2, 10, 1, 1, 1],
        vec![3, 1, 10, 1, 1],
        vec![4, 1, 1, 5, 1],
       	vec![5, 1, 1, 1, 25]
    ];

    // Look L->R from 0,0
    assert_eq!(factor_points(&diagonal_grid, 0, 0, 0, 1), 24);
    // Look T->D from 1,0
    assert_eq!(factor_points(&diagonal_grid, 1, 0, 1, 0), 120);
    // Look T->D + L->R from 0,0
    assert_eq!(factor_points(&diagonal_grid, 0, 0, 1, 1), 500);
    // Look T->D + L->R from 1,1
    assert_eq!(factor_points(&diagonal_grid, 1, 1, 1, 1), 12500);
    // Look D->T + R->L from 4,4
    assert_eq!(factor_points(&diagonal_grid, 4, 4, -1, -1), 12500);
    // Look T->D + L->R from 2,2
    assert_eq!(factor_points(&diagonal_grid, 2, 2, 1, 1), 0);
}
```

With `y` and `x` you give an offset, with `dir_y` and `dir_x` you determine the direction to look in. Possible values for `dir_*` arguments are: `{-1,0,1}`. Depending on the arguments provided in `dir_*` it will always move 3 or 0 spots down, left, right and/or up. The catch with this function is that you can give `y` and `x` values which are off the grid, which will always result in 0.

To get the answer:

```rust
fn max_product_for_grid(grid: Vec<Vec<i32>>) -> i32 {
    let grid_size = grid.len() as i32;
    let directions = vec![
        (1, -1),  (1, 0),  (1, 1), // TL  T  TR
        (0, -1),           (0, 1), // L      R
        (-1, -1), (-1, 0), (-1, 1) // BL  B  BR
    ];

    let mut highest_factor: i32 = 0;

    for y in 0..grid_size {
        for x in 0..grid_size {
            for (dy, dx) in &directions {
                let factor = factor_points(&grid, y, x, *dy, *dx);
                highest_factor = max(highest_factor, factor);
            }
        }
    }

    highest_factor
}

#[test]
fn test_problem_11() {
    let grid = vec![
      vec![08, 02, 22, 97, 38, 15, 00, 40, 00, 75, 04, 05, 07, 78, 52, 12, 50, 77, 91, 08],
      vec![49, 49, 99, 40, 17, 81, 18, 57, 60, 87, 17, 40, 98, 43, 69, 48, 04, 56, 62, 00],
      vec![81, 49, 31, 73, 55, 79, 14, 29, 93, 71, 40, 67, 53, 88, 30, 03, 49, 13, 36, 65],
      vec![52, 70, 95, 23, 04, 60, 11, 42, 69, 24, 68, 56, 01, 32, 56, 71, 37, 02, 36, 91],
      vec![22, 31, 16, 71, 51, 67, 63, 89, 41, 92, 36, 54, 22, 40, 40, 28, 66, 33, 13, 80],
      vec![24, 47, 32, 60, 99, 03, 45, 02, 44, 75, 33, 53, 78, 36, 84, 20, 35, 17, 12, 50],
      vec![32, 98, 81, 28, 64, 23, 67, 10, 26, 38, 40, 67, 59, 54, 70, 66, 18, 38, 64, 70],
      vec![67, 26, 20, 68, 02, 62, 12, 20, 95, 63, 94, 39, 63, 08, 40, 91, 66, 49, 94, 21],
      vec![24, 55, 58, 05, 66, 73, 99, 26, 97, 17, 78, 78, 96, 83, 14, 88, 34, 89, 63, 72],
      vec![21, 36, 23, 09, 75, 00, 76, 44, 20, 45, 35, 14, 00, 61, 33, 97, 34, 31, 33, 95],
      vec![78, 17, 53, 28, 22, 75, 31, 67, 15, 94, 03, 80, 04, 62, 16, 14, 09, 53, 56, 92],
      vec![16, 39, 05, 42, 96, 35, 31, 47, 55, 58, 88, 24, 00, 17, 54, 24, 36, 29, 85, 57],
      vec![86, 56, 00, 48, 35, 71, 89, 07, 05, 44, 44, 37, 44, 60, 21, 58, 51, 54, 17, 58],
      vec![19, 80, 81, 68, 05, 94, 47, 69, 28, 73, 92, 13, 86, 52, 17, 77, 04, 89, 55, 40],
      vec![04, 52, 08, 83, 97, 35, 99, 16, 07, 97, 57, 32, 16, 26, 26, 79, 33, 27, 98, 66],
      vec![88, 36, 68, 87, 57, 62, 20, 72, 03, 46, 33, 67, 46, 55, 12, 32, 63, 93, 53, 69],
      vec![04, 42, 16, 73, 38, 25, 39, 11, 24, 94, 72, 18, 08, 46, 29, 32, 40, 62, 76, 36],
      vec![20, 69, 36, 41, 72, 30, 23, 88, 34, 62, 99, 69, 82, 67, 59, 85, 74, 04, 36, 16],
      vec![20, 73, 35, 29, 78, 31, 90, 01, 74, 31, 49, 71, 48, 86, 81, 16, 23, 57, 05, 54],
      vec![01, 70, 54, 71, 83, 51, 54, 69, 16, 92, 33, 48, 61, 43, 52, 01, 89, 19, 67, 48]
    ];

    assert_eq!(max_product_for_grid(grid), 70600674);
}
```

---

**Improvements**
I figured I can make `factor_points()` a little smaller, namely because I can use `fold()` on the range `(0..=SPOTS)` like this:

```rust
const SPOTS:i32 = 3;

fn factor_points(grid: &Vec<Vec<i32>>,
                 y: i32,
                 x: i32,
                 dir_y: i32,
                 dir_x: i32) -> i32 {

    let temp = vec![];

    (0..=SPOTS).fold(1, |acc, n| {
        let y = y + n * dir_y;
        let x = x + n * dir_x;
        let y_row = grid.get(y as usize).unwrap_or(&temp);
        let x_value = y_row.get(x as usize).unwrap_or(&0);

        acc * x_value
    })
}
```
