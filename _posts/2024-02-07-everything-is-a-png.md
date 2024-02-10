---
layout: post
title: "Everything is a PNG"
---

<style>
img { image-rendering: crisp-edges; }
</style>

### Introduction
I want to preface this by saying that what is written in this article is purely an exercise of curiosity and simply a result of the question: "could this even be possible?". It's not a practical solution to anything, but more of a "What if?". All of this stems from a project I recently found called wave-share [1], which converts files to audio, which then can be picked up by a microphone. It's a pretty clever idea, and it got me thinking if file data can be converted to images. I'm certainly not the first to try and do funny things with file data, as I've seen people putting file data into YouTube videos [2], using Google Spreadsheets to store files [3], and so on.

### Everything in pixels!
My setup for this idea was simple: read a file in chunks, and turn every 3 bytes into an RGB value, where `#000000` is the lowest value and `#FFFFFF` is the highest value. The image would be a square and the pixels would be written from top-left to bottom-right. I opened up my editor, wrote some Rust, and with the image crate [4] to help me out, got something working fairly quickly [5].

My first attempt it could turn any file into a JPG. Now, some people will already spot the problem here, but I wasn't this clever yet, so I won't spoil anything. I used an image of a cat [6], and then to confirm that it was working as intended, I tried to convert the JPG filled with pixels back to the original cat. This didn't work because - spoiler - JPG compresses the image quite heavily which resulted in data-loss when converting back to the original cat.

I then switched over from JPG to PNG, fixed some other things [write this out], and found out that no such problem exists with PNG's. PNG's were the way to get a "cat to PNG back to cat"-cycle. This is what that looks like (for this example I did use a compressed version of the original image):

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

Now the first question of course is: is the cat that comes out in the end the same as the cat that I started with? And the answer is: no. The original cat actually has 12 extra bytes dangling at the end, making the MD5 incorrect. The reason for this is that the conversion to the PNG square adds 'junk' bytes at the end, as not every file size is a perfect square. This junk is then clipped off when converting it back to the original file, but in the original JPG there were already zeroes at the end anyway, so some extra bits get clipped off in the process. I could naturally store the original file size in the metadata of the PNG and make sure that when it converts back that it has the exact same size, but I didn't feel like making this too complicated considering its intentions.

### .txt files
From the cat I then moved on to simple text files. I converted a simple line of text to a PNG, and here it is:

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
Naturally this got me thinking: with this Rust code I can turn painting tools like Gimp or Paint into very poor text editors.

Here are some famous and not so famous pieces of text converted to PNG's:

<div>
    <img title="To be or not to be" width="50%" src="/img/3/13.png"/>
</div>

<div>
    <img title="Article I of UN human rights" width="50%" src="/img/3/14.png"/>
</div>

<div>
    <img title="First alinea of text about cats on Wikipedia" width="50%" src="/img/3/5.png"/>
</div>

Q: What would happen to images?
Q: What if you take a random PNG from the internet and try to convert it to text?

### Sources

1. [wave-share](https://github.com/ggerganov/wave-share)
2. [fvid](https://github.com/AlfredoSequeida/fvid/)
3. [spreadsheetfs](https://github.com/GunshipPenguin/spreadsheetfs)
4. [image crate](https://docs.rs/image/latest/image/)
5. [Link to GitHub]()
6. [wikipedia cat](https://upload.wikimedia.org/wikipedia/commons/d/d4/Cat_March_2010-1a.jpg)
