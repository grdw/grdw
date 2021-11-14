---
layout: post
title: "Project Euler #19: Counting Sundays"
problem_type: euler
problem: 19
complexity: 1
---

{% include euler.html %}

**Introduction**
The puzzle asks: "how many Sundays fell on the first of the month during the twentieth century (1 Jan 1901 to 31 Dec 2000)?"

Initially I start out with this:

```rust
fn problem_19() -> u32 {
    for year in 1901..=2000 {
        for month in 0..=11 {
            // How many days?
            // Incl. leap years.
        }
    }

    0
}

#[test]
fn test_sundays() {
    assert_eq!(problem_19(), 1);
}
```

The next step is to determine the amount of days per month. It's a pretty steady number except on a leap year.

```rust
for year in 1901..=2000 {
    // There are 4 months which are 30 days long:
    // September, April, June and November.
    // The rest of the 7 months are 31 days long,
    // except February which has 28 days except on leap years.
    let mut month_lengths = vec![
        31, // January,
        0,  // February,
        31, // March
        30, // April
        31, // May
        30, // June
        31, // July
        31, // August
        30, // September
        31, // October
        30, // November
        31 // December
    ];
    // Since 2000 is divisble by 400, it's therefor also divisible
    // by 4, so there's no need to apply that rule here.
    month_lengths[1] = if year % 4 == 0 {
        29
    } else {
        28
    };

    for month in 0..=11 {
        for day in 0..month_lengths[month] {
            println!("{}", day + 1);
        }
    }
}
```

The next part of this puzzle is to find out on which day the first of January 1901 landed. Google has the answer here: "Tuesday", which is the 2nd day of the week. Including in the weekdays I guess I can start counting.

```rust
let mut weekday = 1;
for month in 0..=11 {
    for day in 0..month_lengths[month] {
        if day == 0 && weekday % 7 == 6 {
            total_sundays += 1
        }

        weekday += 1;
    }
}
```

The answer I receive from the code is: 175 Sundays landed on the first day of a month. Upon checking the correct answer, I find out the actual answer should be 171 Sundays, meaning I'm 4 off. I also found out why, it was because I was resetting the `weekdays` to Tuesday every year which is not really what happens in real life. After fixing that little mistake I got the correct answer of 171 Sundays.

**Improvements**
In the code `month_lengths` only has to be initiated once, instead of every loop cycle. Also I feel I can do something smart with the way we determine if it's a Sunday on the first of the month. Considering we're only interested in one day of the month, it feels a little bit useless to loop over each day of the month regardless. The code therefor can be shortened to:

```rust
fn problem_19() -> u32 {
    let mut total_sundays = 0;
    let mut weekday = 1;
    // There are 4 months which are 30 days long:
    // September, April, June and November.
    // The rest of the 7 months are 31 days long,
    // except February which has 28 days except on leap years.
    let mut month_lengths = vec![
        31, // January
        0,  // February
        31, // March
        30, // April
        31, // May
        30, // June
        31, // July
        31, // August
        30, // September
        31, // October
        30, // November
        31 // December
    ];

    for year in 1901..=2000 {
        // Since 2000 is divisible by 400, it's therefor also divisible
        // by 4, so there's no need to apply that rule here.
        month_lengths[1] = if year % 4 == 0 {
            29
        } else {
            28
        };

        for month in 0..=11 {
            if weekday % 7 == 6 {
                total_sundays += 1
            }
            weekday += month_lengths[month];
        }
    }

    total_sundays
}
```

{% include euler_complexity.html %}
