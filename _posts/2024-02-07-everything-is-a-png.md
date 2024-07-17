---
layout: post
title: "Everything is a PNG"
---

<style>
img { image-rendering: crisp-edges; }
</style>

### Introduction
I want to preface this by saying that what is written in this article is purely an exercise of curiosity and simply a result of the question: "what if?". All of this stems from a project I recently found called wave-share [1], which converts files to audio, which then can be picked up by a microphone. It's a pretty clever idea, and it got me thinking if file data can be converted to images. I'm certainly not the first to try and do funny things with file data, as I've seen people putting file data into YouTube videos [2], using Google Spreadsheets to store files [3], and so on.

### Everything in pixels!
My setup for this idea was simple: read a file in chunks, and turn every 3 bytes into an RGB value, where `#000000` is the lowest value and `#FFFFFF` is the highest value. The image would be a square and the pixels would be written from top-left to bottom-right. I opened up my editor, wrote some Rust, and with the image crate [4] to help me out, got something working fairly quickly [5].

In my first attempt it would turn any file into a JPG. Now, some people will already spot the problem here, but I wasn't this clever yet, so I won't spoil anything. I used an image of a cat [6], and then to confirm that it was working as intended, I tried to convert the JPG filled with pixels back to the original cat. This didn't work because - spoiler - JPG compresses the image quite heavily which resulted in data-loss when converting back to the original cat.

I then switched over from JPG to PNG, and found out that PNG's don't suffer from compression problems. On top of that I get an extra byte per pixel as PNG's also have an alpha channel (so the range extends from `#00000000` to `#FFFFFFFF`). PNG's were the way to get a "cat to PNG back to cat"-cycle. This is what that looks like (for this example I did use a compressed version of the original image):

<div>
    <img title="Compressed cat" alt="compressed-cat" src="/img/3/1.jpg"/>
</div>

After running `cargo run img compressed-cat.jpg`:

<div>
    <img width="100%" title="Cat as PNG pixels" alt="cat-as-pixels" src="/img/3/2.png"/>
</div>

After running `cargo run unimg compressed-cat.jpg.png`:

<div>
    <img title="PNG pixels back to cat" alt="pixels-back-to-cat" src="/img/3/3.jpg"/>
</div>

Now the first question of course is: is the cat that comes out in the end the same as the cat that I started with? And the answer is: no. The original cat's bytesize is slightly smaller. The reason for this I have yet to explain, but I think it has something to do with the image library and the way it generates images. I could naturally store the original file size in the metadata of the PNG and make sure that when it converts back that it has the exact same size, but I didn't feel like making this too complicated considering its intentions.

### .txt files
From the cat image I moved on to simple text files. I converted a simple line of text to a PNG, and here it is:

<div>
    <img width="50%" title="?" alt="text" src="/img/3/4.png"/>
</div>

These 4 pixels spell out "hello world", and here is where I got curious what would happen to the text when I rotated these 4 pixels, or what would happen if you would invert the colors, grayscale the image, and so on. These are the text changes:

|Text           | Change | Image                                  |
|---------------|--------|----------------------------------------|
|hello world    | -      | <img width="20px" src="/img/3/4.png"/> |
|rld\nHello wo  | 90°    | <img width="20px" src="/img/3/6.png"/> |
|o woHellrld    | -90°   | <img width="20px" src="/img/3/7.png"/> |
|rld\n o woHell | 180°   | <img width="20px" src="/img/3/8.png"/> |
|o woHellrld    | flip-v | <img width="20px" src="/img/3/9.png"/> |
|rld\nHello wo  | flip-h | <img width="20px" src="/img/3/10.png"/> |
|\`\`\`lCCCommm | gray   | <img width="20px" src="/img/3/11.png"/> |
|l߈o            | invert | <img width="20px" src="/img/3/12.png"/> |

<br/>
Naturally this got me thinking: with this Rust code I can turn painting tools like Gimp or Paint into very poor text editors. It also brought up the question: out of all the PNG images that are out there on the internet, which one's will accidentally spell Shakespeare or any other famous piece of text? Just to show what you have to be looking for, here are some famous and not so famous pieces of text converted to PNG's:

<div>
    <img title="To be or not to be" width="50%" src="/img/3/13.png"/>
</div>

<div>
    <img title="Article I of UN human rights" width="50%" src="/img/3/14.png"/>
</div>

<div>
    <img title="First alinea of text about cats on Wikipedia" width="50%" src="/img/3/5.png"/>
</div>

Of course I was thinking to myself, the product of the conversion is also a file, so why not cycle over it a couple of times and see what would happen to an image or to text:

| # | Image                                   | Text        |
|---|-----------------------------------------|-------------|
| 0 | <img src="/img/3/15.jpg"/>              |  hello world  |
| 1 | <img width="80px" src="/img/3/16.png"/> | <img width="80px" src="/img/3/4.png"/> |
| 2 | <img width="80px" src="/img/3/17.png"/> | <img width="80px" src="/img/3/4.1.png"/> |
| 3 | <img width="80px" src="/img/3/18.png"/> | <img width="80px" src="/img/3/4.2.png"/> |
| 4 | <img width="80px" src="/img/3/19.png"/> | <img width="80px" src="/img/3/4.3.png"/> |
| 5 | <img width="80px" src="/img/3/20.png"/> | <img width="80px" src="/img/3/4.4.png"/> |
| 6 | <img width="80px" src="/img/3/21.png"/> | <img width="80px" src="/img/3/4.5.png"/> |
| 7 | <img width="80px" src="/img/3/22.png"/> | <img width="80px" src="/img/3/4.6.png"/> |
| 8 | <img width="80px" src="/img/3/23.png"/> | <img width="80px" src="/img/3/4.7.png"/> |

<br/>
What is interesting to notice is that the file size gradually keeps on increasing and increasing. I'm pretty sure this happens because of the PNG format and its headers taking up space.

### Concluding
Obviously this is a bad way of storing a file, but it was a fun exercise to obfuscate a file. The full code is available at GitHub [7]. It isn't at all performance optimized and for a big file it will likely take a long while for the code to render a PNG. There is an upper bound of PNG's of 2<sup>31</sup>-1 px, meaning this script can be used to store a file of up to 4 x 2<sup>31</sup>-1 bytes, so roughly ~1.9 GB. I'm curious to see what happens if I go over, and will definitely try to experiment more and come up with other "what if?"-projects in the future.

### Sources

1. [wave-share](https://github.com/ggerganov/wave-share)
2. [fvid](https://github.com/AlfredoSequeida/fvid/)
3. [spreadsheetfs](https://github.com/GunshipPenguin/spreadsheetfs)
4. [image crate](https://docs.rs/image/latest/image/)
5. [everything-is-a-png early version](https://github.com/grdw/everything-is-a-png/tree/f16b66c573f066ec6b3bc032eddd8fbe0d6278c7)
6. [wikipedia cat](https://upload.wikimedia.org/wikipedia/commons/d/d4/Cat_March_2010-1a.jpg)
7. [everything-is-a-png](https://github.com/grdw/everything-is-a-png)
