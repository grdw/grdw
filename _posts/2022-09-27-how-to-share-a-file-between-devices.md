---
layout: post
title: "How to share a file between devices?"
---

### Introduction
Sharing a file accross devices is painful. You're on your phone but you want to access a file that's on your laptop, how do you do it? What about the other way around? Obviously if I were to ask my dad this question he would say: "through Google Drive". Or if you would've asked me 5 years ago, I would've said: "through Dropbox". To make this article a little harder, I'll be looking for the easiest and laziest way, to transfer a file from my phone to my laptop, and the other way around. I'll start out with a couple of rules:

1. I can't use an account from an existing online service (like Dropbox, Google Drive, WeTransfer, email drafts, etc.).
2. It needs to be useable for a non-technical person
3. It has to be consistent accross platforms

Relevant XKCD:

![img](https://imgs.xkcd.com/comics/file_transfer.png)

### "Impossible"
Now, you're looking at the ruleset and think to yourself: "this is impossible".

Apple's Airdrop functionality is a thing that comes remarkebly close. The only downside being that I only have one Apple device around the house, which makes it rather useless. Obviously it being an Apple product, it breaks rule number 3.

If I search online for my predicament, a Google Support page comes up with: "through the USB-cable" [1]. This seems like a solution, but it is not the easiest solution. Also, when was the last time you plugged your phone into the USB slot of your laptop? It might be the answer, but it doesn't feel like the easiest way. Also, I only seem to have USB-B to USB-C cables, and almost close to no USB-C to USB-C cables. Also, I can't connect a laptop to another laptop by USB cable.

Another alternative here is Bluetooth, that feature you accidentally turn on from the Android top menu that drains batteries really fast. It might make sense, but the whole pairing feels complex, and unusable for the normal day to day user, breaking rule number 2.

### Breaking rule number 2!
Imagine we can break rule 2. Bluetooth is allowed now, but let me skip that one for the time being. The obvious solution then would be secure copy or scp. You can copy files easily between UNIX devices, and even for Android phones there's an emulator [2] for it. However, even as a technical person I find this approach highly complicated - especially with regards to typing terminal commands on a phone. And what about the other way around, how would I copy a file from my laptop to my phone? Also, I have no idea how this would work for Windows devices in all honesty. If only I could do this, everywhere:

```bash
# From laptop to any device
scp file.jpg user@device:~
# From any device to laptop
scp user@device:file.jpg .
```

There's also the meriad of remote file systems, like NFS, SSHFS, etc. We might even consider FTP here at some point, but that all is going to be out of scope in this post.

### In an ideal world ...
... I would've been able to open op my phone, tap on a file from the file explorer, hit share and a device would be visible to which I can share said file. Again, opening up the "Files" app from an Android phone means opening up "Google Files", and naturally they want you to use Google Drive, which breaks rule number 1. Also, if we start out from my Ubuntu laptop there's no share button, and no Google Drive.

What's up with this disconnect?

### Designing it for non tech-savvy people
Secure copy is obviously way too tech-savvy, Bluetooth is as well, and you can bet that people have lost that USB cable. What people are used to is online tools. So the browser is an option, and obviously apps are an option. I wouldn't be able to explain any other tool to my parents, even if I tried really hard. I'm going to add one extra requirement and say: both devices need to live within the same network. Or in non-technical language: connected to the same router. To tackle the fact that both devices aren't in the same room; that's for another day entirely. I might accidentally fix that, but it's not a requirement.

From the browser there are a couple of things that I can try. Let me say that one of the rules isn't file size, and neither does it have to be efficient. The dumbest thing I can come up with is the URL itself, a simple GET request has an upper limit of 8 kB (or 8192 bytes). This is not a lot, but one could turn a file into a binary-octet stream and convert that stream directly to a string and read it from the URL. This can work like such: <a download="file.txt" href="data:application/octet-stream;charset=utf-8;base64,Zm9vIGJhcg==">text file</a>, or in code:

```html
<a download="file.txt" href="data:application/octet-stream;charset=utf-8;base64,Zm9vIGJhcg==">
  text file
</a>
```

All we would have to do here is create a simple HTML page with an upload input, add a file below 7 kB, turn it into a base64 string and copy it over to the receiving end through the URL. On the receiving end, it has to dynamically create a link element, parse the URL and put whatever is in there to the 'href' attribute. It's cross-platform, it's dumb and easy to use, but the 8 kB is a bit of a restriction. What if my file is bigger than 8 kB?

Also, this isn't very secure. Somebody can mingle with the URL and make me download all sorts of garbage.

A way out could be websockets; to be able to stream more than 8 kB of data between connecting clients, but that requires an entire websocket handler. In other words; a server that manages the websocket connections. We'll come back to websockets later.

### Resolving laptop to phone
Forgetting about my parents once more, a thing that does work is a very simple webserver that can serve a folder [3]. Combining small bits of Go I found on the internet I conjured up this masterpiece:

```go
package main

import (
	"log"
	"net/http"
	"os"
)

func main() {
	path, err := os.Getwd()
	if err != nil {
		log.Fatalf("error %s", err)
	}

	fs := http.FileServer(http.Dir(path + "/files"))
	http.ListenAndServe(":9000", fs)
}
```

In the files directory I put a simple 1 GB file, and I'll browse my own laptop from my phone. You can figure out the IP address from your laptop in Ubuntu by typing `ifconfig | grep 'inet 192'`; usually it starts with 192. Another way would be by logging into your router and figuring out the IP address there.

After typing in 192.168.1.13:9000 in the browser of my mobile phone, I see the files directory being served and I'm able to download the 1 GB file I put in that folder. Success!

### From mobile phone to laptop
The small titbit of code above can only serve files from my laptop, and can be received by my mobile phone, or anybody else within the same network that knows the IP address of my laptop. However, I can't do it the other way around. I can't run a Go binary from my Android phone, because phones are crippled from birth. The only software you can run are Android apps or web apps.

The natural progression here is to extend the Go code above with upload functionality. That way the phone can add files to the laptop, right? After writing a very basic uploader, it seems to work quite beautifully. I can now add a file from my phone to my laptop, and the other way around with two very basic Go files. In a way, I've resolved my own personal pain, but how can we make this better?

Looking into my Go project folder it currently looks like this:

```
.
├── files
│   ├── sleFinal.pdf2427904778
│   └── test.img
├── go.mod
├── index.html
├── laptop_to_phone
│   └── laptop_to_phone.go
└── phone_to_laptop
    └── phone_to_laptop.go

    3 directories, 6 files
```

I've added one `test.img` file to the files directory, which is the 1 GB file I generated earlier. And I've uploaded a PDF that was on my phone to my laptop. Great!

However, currently both flows are kind of inconsistent. Sharing a file from my laptop to my phone is rather painless, but the other way around is several times more complicated. Just look at this Go file and compare that with the other one:

```go
// phone_to_laptop.go

package main

import (
	"fmt"
	"io/ioutil"
	"net/http"
)

func uploadFile(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Uploading file...\n")

    // Limited to 20 MB
	r.ParseMultipartForm(10 << 20)
	file, handler, err := r.FormFile("myFile")
	if err != nil {
		fmt.Println("Error retreiving the file")
		return
	}

	defer file.Close()
	fmt.Printf("Uploaded File: %+v\n", handler.Filename)
	fmt.Printf("File Size: %+v\n", handler.Size)
	fmt.Printf("MIME Header: %+v\n", handler.Header)

	tempFile, err := ioutil.TempFile("files", handler.Filename)
	if err != nil {
		fmt.Println(err)
	}
	defer tempFile.Close()

	// read all of the contents of our uploaded file into a
	// byte array
	fileBytes, err := ioutil.ReadAll(file)
	if err != nil {
		fmt.Println(err)
	}
	// write this byte array to our temporary file
	tempFile.Write(fileBytes)
	// return that we have successfully uploaded our file!
	fmt.Fprintf(w, "Successfully Uploaded File\n")
}

func indexHandle(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "index.html")
}

func main() {
	http.HandleFunc("/upload", uploadFile)
	http.HandleFunc("/", indexHandle)
	http.ListenAndServe(":9000", nil)
}
```

Contents of `index.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>Uploader</title>
  </head>
  <body>
    <form
      enctype="multipart/form-data"
      action="/upload"
      method="post"
    >
      <input type="file" name="myFile" />
      <input type="submit" value="upload" />
    </form>
  </body>
</html>
```

The previous blob took 16 lines of code. This almost doubles that amount + I have to write a bit of frontend code. On top of that, it doesn't allow me to upload files bigger than 20 MB, since I'm limited by the backend. Obviously, I can severly improve that uploader and allow any file size I like. However, I'll pause right here for now.

### Websockets, a love story
We'll explore websockets next. I can make a simple little backend that can handle websockets. Web clients have websocket [4] functionality these days. We'll have to host the socket handler (or socket server) somewhere within my own network, since I'll only allow it to run from within my own network.

Each client will be able to connect to the websocket server from their respected devices, and are able to communicate to each other. In other words  send bytes from one to the other. A socket handler in Go looks roughly like this:

```go
package main

import (
	static "github.com/gin-contrib/static"
	"github.com/gin-gonic/gin"
	"gopkg.in/olahol/melody.v1"
)

func main() {
	r := gin.Default()
	m := melody.New()

	r.Use(static.Serve("/", static.LocalFile("./public", true)))

	r.GET("/ws", func(c *gin.Context) {
		m.HandleRequest(c.Writer, c.Request)
	})

	m.HandleMessage(func(s *melody.Session, msg []byte) {
		m.BroadcastOthers(msg, s)
	})

	r.Run(":8080")
}
```

I'm using two frameworks here, meaning I've officialy been cancelled from the Go community. In my defense, I didn't want to be going through the whole pain of implementing a websocket server from scratch, purely for trying something out.

The client-side code is where most of the magic recides at. Each client will be able to connect their respected devices and are able to communicate to each other, and send bytes from one to the other. However, to make this work a couple of things need to be kept in mind:

- I can't send a lot of data over the websocket server above, so each file needs to be sliced into pieces.
- The file pieces need to be stitched back together on the receiving end.

### _Sending files_
Sending a file over a websocket is not that complicated. Ever since JavaScript has introduced the `slice()` function to `File`, and the `FileReader()` API. We are pretty much on our merry way. Firstly we need to make sure to chunk the file into pieces:

```javascript
// To chunk a file into pieces:
// Assuming there's a multipart input element in the html body:
const chunkSize = 5 * 1024 * 1024;

for (const file of input.files) {
    let pointer = 0;

    while (pointer < file.size) {
        const slice = file.slice(pointer, pointer + chunkSize);
        // Do something with slice

        pointer += chunkSize;
    }
}
```

If I have, for example, a file that's 7MB, this code will chunk it into slices of 5MB and 2MB. The slice method will try to take 5MB of the end for the 2nd part, but it will read until the end (there's no need to recalculate the offset).

Secondly, we can read the slice into memory like such:

```javascript
function readChunk(blob) {
    const fr = new FileReader();

    fr.readAsArrayBuffer(blob);
    fr.addEventListener("load", function() {
        const buffer = fr.result;
        console.log(Array.from(new Uint8Array(buffer)));
    });
}
```

The reason why I'm converting it into an array is because I'll be sending it over a websocket later on, and this makes it a bit easier when converting it to JSON, and reading it back.

In the demo below I'm combining both the code snippets from above (feel free to inspect the source).

<form id="demo1-form">
  <input id="demo1-input" type="file" multiple/>
  <input type="submit" value="Send"/>
</form>

<pre id="demo1-result">
</pre>

<script language="javascript" type="text/javascript">
    (function(){
        "use strict";

        const chunkSize = 5 * 1024 * 1024;
        const form = document.getElementById("demo1-form");
        const input = document.getElementById("demo1-input");
        const result = document.getElementById("demo1-result");

        function readChunk(name, blob, part) {
            const fr = new FileReader();

            fr.readAsArrayBuffer(blob);
            fr.addEventListener("load", function() {
                const buffer = fr.result;
                result.innerHTML += "- Part #" + part + " of: " +
                    buffer.byteLength +
                    " bytes, from file: " +
                    name +
                    "\n";
            });
        }

        form.addEventListener("submit", function (e) {
            e.preventDefault();

            for (const file of input.files) {
                let pointer = 0;
                let part = 1;
                result.innerHTML += "File: " + file.name + "\n";

                while (pointer < file.size) {
                    const slice = file.slice(pointer, pointer + chunkSize);
                    readChunk(file.name, slice, part);
                    pointer += chunkSize;
                    part += 1;
                }
            }
      });
  })();
</script>

You can add some files and see the result of the chunking. As you can see it reads the chunks in a random fashion (unless you added a file that's below 5MB).

### _Receiving files_
Receiving files and stitching them back together is another ballgame entirely. As you can see from the demo above, file parts are chunked in a random way. Because of this, when stitching the parts back together you have to retain the order. The next demo is going to look a bit odd, but all this does is echo a file you upload back to yourself, all from within JavaScript.

See it as a really expensive way of doing:

```bash
cp file.xyz ~/Downloads
```

<form id="demo2-form">
  <input id="demo2-input" type="file" multiple/>
  <input type="submit" value="Send"/>
</form>

<pre id="demo2-result">
</pre>

<script language="javascript" type="text/javascript">
    (function(){
        const chunkSize = 5 * 1024 * 1024;
        const form = document.getElementById("demo2-form");
        const input = document.getElementById("demo2-input");
        const result = document.getElementById("demo2-result");
        let files = {};

        function complete(file) {
            // stitch and serve
        }

        function readChunk(name, blob, part) {
            const fr = new FileReader();

            fr.readAsArrayBuffer(blob);
            fr.addEventListener("load", function() {
                const buffer = fr.result;

                if (!files.hasOwnProperty(name) {
                    files[name] = [];
                }

                files[name][part] = Array.from(new Uint8Array(buffer));
                complete(files[name]);

                result.innerHTML += "- Part #" + (part + 1) + " of: " +
                    buffer.byteLength +
                    " bytes, from file: " +
                    name +
                    "\n";
            });
        }

        form.addEventListener("submit", function (e) {
            e.preventDefault();

            for (const file of input.files) {
                let pointer = 0;
                let part = 0;
                result.innerHTML += "File: " + file.name + "\n";

                while (pointer < file.size) {
                    const slice = file.slice(pointer, pointer + chunkSize);
                    readChunk(file.name, slice, part);
                    pointer += chunkSize;
                    part += 1;
                }
            }
      });
  });
</script>

### Concluding

### Sources

\[1\] [Transfer files between your computer & Android device](https://support.google.com/android/answer/9064445?hl=en)

\[2\] [Terminus Google Play Store](https://play.google.com/store/apps/details?id=com.server.auditor.ssh.client&hl=en&gl=US)

\[3\] [Beginners guide to serving files using HTTP servers in Go](https://medium.com/rungo/beginners-guide-to-serving-files-using-http-servers-in-go-4e542e628eac)

\[4\] [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
