---
layout: post
title: "My doorbell"
---

### Introduction
In this day and age a surprising amount of devices can be hooked to the internet. My doorbell for example can be connected to the Wi-Fi. This peeked my interest, can I unlock the two central doors from my apartment building from my laptop or any other device? Or can I snoop using the installed cameras?

You'd think that there'd would be software for this already, but considering most intercom systems use propietary software and unrecognizable protocols, this is a lot hard than it should be. What follows in this article is a project which lasted months, all because: "I don't like the interface of my doorbell".

To give some context on my apartment and the use of the doorbell: the doorbell can open two doors. The first door, is a door from the outside world to the inside of the building. It's used by f.e. the mailman to be able to enter the mailboxes. That door is always open from early morning to somewhere in the evening, and can be pushed open (which not everybody knows). The second door from the "mailbox area" to the rest of the building is always closed, and to open that door, somebody needs to ring the intercom after which I need to push some buttons on my doorbell (or naturally you can open it if you have a key).

![cat-doorbell](/img/2/3.png)

My doorbell is from a brand called Comelit, an Italian surveillance company [1], and the type is "Mini Wi-Fi" [2]. Out of the box, Comelit has a range of apps in the Google Play Store you can install, to connect with your doorbell and open the door. Now, I could stop right here, and call it a day, because essentially the Android app allows me to open the door, I wanted to go further. The main "Comelit" app is the one I've installed in the past and for the sake of this article. It's a pretty terrible app from the users' point of view. F.e. after you set it up, it needs location access, which is only required because of tracking (they are after all a surveillance company). Another bad example is that the intercom doesn't always show up in the app, even after somebody ringed my doorbell. It's very sluggish in detecting that the doorbell comes online (more on that later).

The app also has a ton of useless features because it can also support all other sorts of Comelit home automation devices which I don't own. Other useless features are things like: record who stood in front of the door at certain points in time. But - credit where credit is due - the best feature it has is: you can open the door from the app, and naturally see who stands in front of your door. And to return to my original question, can this also be done from my laptop instead of having to rely on a pretty mediocre app?

### Connecting to my router
The first step to see if I can open my door with my laptop, is connecting my Comelit Mini Wi-Fi to the actual Wi-Fi. This is where the pain begins. There's no touchscreen on the doorbell so you have to navigate an on-screen keyboard using these horrible partially responsive touch-only buttons (it's as if somebody added a `rand > 0.2` somewhere in the hardware driver of those buttons). After typing in my Wi-Fi password, it connects! Checking my router I see it pop-up as `DEV-18:3A:98` with the following internal IP `192.168.1.9`. After a while it dissappears from the router, which initially confused me. However, the reason for that is that after it is idle for a while, the doorbell will turn itself off and disconnect from the router.

### What runs on my doorbell?
Knowing that it is possible to control the doorbell through an Android application there must be a server of sorts running on my doorbell. To figure out what that is I use `nmap`, a pretty standard port scanner. So first I run:

```
nmap -Pn 192.168.1.9
```

Which returns me the following details:

```
Starting Nmap 7.93 ( https://nmap.org ) at 2023-01-10 15:45 CET
Nmap scan report for 192.168.1.9
Host is up (0.000019s latency).
All 1000 scanned ports on 192.168.1.9 are in ignored states.
Not shown: 1000 filtered tcp ports (no-response)

Nmap done: 1 IP address (1 host up) scanned in 15.22 seconds
```

This response means that not a single one of the top 1000 ports is opened. This asks for a brute-force `nmap`:

```
nmap -p 1-65535 192.168.1.9
```

This returns a bit more information:

```
Starting Nmap 7.93 ( https://nmap.org ) at 2023-01-10 15:50 CET
Nmap scan report for 192.168.1.9
Host is up (0.0057s latency).
Not shown: 65380 closed tcp ports (conn-refused), 151 filtered tcp ports (no-response)
PORT      STATE SERVICE
53/tcp    open  domain
8080/tcp  open  http-proxy
8443/tcp  open  https-alt
64100/tcp open  unknown

Nmap done: 1 IP address (1 host up) scanned in 134.15 seconds
```

Success!

### HTTP-ports 8080 and 8443
Ports `8080` and `8443` are browsable from the internet. When browsing port 8080 I'm being hit with a page which requires a password, a page with the name "Extender - Index". It looks like this:

<img src="/img/2/1.png" style="width: 100%">

It's nice to know my doorbell has memory, and it appearantly uses about half of its 54 MB. If I go to the `8443` page I'm being hit with a bad SSL certificate error, if I decide to trust it anyway I'm being pretty much redirected to the same page that lives on the `8080` port. Why does it have an https-alt without an SSL certificate? I'm assuming the SSL certificate is only valid for the internal domain that is resolved by the domain server on port 53.

After some Google'ing I find out that the default password is simply `admin` and with that I gain access to the device. It doesn't give me much, just options to reboot my doorbell, change the password on my doorbell and some device info. The device info page is the most interesting. It has two tables:

<img src="/img/2/2.png" style="width: 100%">

One table is called "Device info" and has two identifiers which I both blurred out. One is a UUID and the other a 32-byte string; I'll trust that it is actually 32 characters long. The Cloud info is the most interesting table here. It says that I have a device that is "UNLINKED", which I can then "Unlink"; confusing.

### Port 64100
Checking the nmap scan there's one other port that's left, which is port 64100. Could that be the port the Comelit Android app actually uses? To confirm this I installed an Android app called "PCAPDroid" (it's essentially Wireshark for Android) [3] to see what requests Comelit actually makes from the app to open the door, and perhaps see images from the camera and what not. Alongside that I tried to reverse engineer the Comelit APK through various tooling, and all in all this is what I found out:

- The Android app uses port 64100.
- It allows a mix of TCP/UDP requests
- It uses some sort of a JSON API / mixed with RTSP

Initally I thought whatever lives on that port would speak HTTP, so in order to naively repeat a request to my doorbell I did:

```
curl --data '{BLURB OF JSON I TOOK FROM PCAPDroid}'
     http://192.168.1.9:61400
```

And it returned me this:

```
curl: (1) Received HTTP/0.9 when not allowed
```

This means that whatever lives on port 61400 doesn't speak http version 1.0 or later. I can use the `--http0.9` flag and get a response, but it just returns a blurb of unreadable bytes. I turn back to the logs I received from "PCAPDroid", and in there I inspect some of the JSON responses (partially redacted, and formatted). For example:

```json
<8 partially readable bytes>
{
  "message":"get-configuration",
  "message-type":"response",
  "message-id":2,
  "response-code":200,
  "response-string":"OK",
  "viper-server":{
    "local-address":"192.168.1.9",
    "local-tcp-port":64100,
    "local-udp-port":64100,
    "remote-address":"",
    "remote-tcp-port":64100,
    "remote-udp-port":64100
  },
  "viper-client":{
    "description":"XXXX"
  },
  "viper-p2p":{
    "mqtt":{
      "role":"a",
      "base":"XXXX",
      "server":"tls://hub-vc-vip.cloud.comelitgroup.com:443",
      "auth":{
        "method":["CCS_TOKEN","CCS_DEVICE"]
      }
    },
    "http":{
      "role":"a",
      "duuid":"XXXX"
    },
    "stun":{
      "server":[
        "turn-1-de.cloud.comelitgroup.com:3478",
        "turn-1-de.cloud.comelitgroup.com:3478"
      ]
    }
  },
  "sbc":{
    "pm-always-on":false
  },
  "vip":{
    "enabled":true,
    "apt-address":"SB000006",
    "apt-subaddress":2,
    "logical-subaddress":2,
    "apt-config":{
      "description":"",
      "call-divert-busy-en":false,
      "call-divert-address":"",
      "virtual-key-enabled":false
    }
  },
  "building-config":{
    "description":"yourbuilding"
  }
}
```

If I look up some of the terms in this JSON blob on the internet, I find a lot of interesting things. The first thing that I look for is "viper-server", which returns nothing of interest. If I extend the search to "viper-server Comelit", I kid you not, the first hit is an IP address of somebody's actual doorbell, followed by a technical manual from Comelit (funny), followed by three more doorbells that are accessible from the internet.

Obviously I try to see if the default `admin` password works, and it fortunately doesn't. It's still pretty awful that these doorbells are accessible from the internet and indexed by Google, because an IP address can very easily be converted to a physical location. Later on, in this article I'll try and see if the ports 64100 are open as well for these doorbells.

The next keyword is the `viper-p2p` entry. It mentions a thing called a stun server [4], which is a term I'm familar with because I recently experimented with WebRTC in relation to file transfering. This search also didn't give me much, and was pretty much a dead-end. The next thing I see is `mqtt` which is something I do not know, but it's a messaging protocol for IoT devices, which my doorbell is of course. The server is located elsewhere on the planet, and is controlled by Google, which is something I found out by doing a simple ping to the server that is listed:

```
ping hub-vc-vip.cloud.comelitgroup.com -p 443

PING hub-vc-vip.cloud.comelitgroup.com (34.77.55.26) 56(84) bytes of data.
64 bytes from 26.55.77.34.bc.googleusercontent.com (34.77.55.26): icmp_seq=1 ttl=105 time=18.9 ms
64 bytes from 26.55.77.34.bc.googleusercontent.com (34.77.55.26): icmp_seq=2 ttl=105 time=17.5 ms
```

### Can it speak MQTT?
Naturally my first guess is that MQTT [5] must also be the protocol it speaks on port 64100, but after inspecting some of the finer details in Wireshark (since PCAPDroid allows you to download the dump as a PCAP file and open it in Wireshark), it turns out that is simply not the case. The MQTT server is present in the *configuration of the doorbell*, but not once does my doorbell actually reach out to this server, so in the configuration response above, it's completely useless.

### The NPM comelit-client
Continueing on my search of trying to understand how my doorbell works, I find out that Comelit has an NPM client [6]. I try to read the code and in there, I can find only one useful bit of code. Appearantly if you open a UDP socket, and call it with `INFO` it will return you some more hardware information. To write a bit of Rust around it, this is what you can do essentially:

```rust
use std::net::UdpSocket;
use std::time::Duration;

const LOCAL_IP: &'static str = "0.0.0.0:7432";
const DOORBELL: &'static str = "192.168.1.9:24199";

fn main() {
    let info = "INFO".as_bytes();
    let udp_socket = UdpSocket::bind(LOCAL_IP).expect("Boom!");
    udp_socket
        .set_read_timeout(Some(Duration::from_millis(10)))
        .unwrap();

    let mut buf = [0; 256];
    udp_socket.send_to(&info, &DOORBELL).unwrap();
    let receive = udp_socket.recv_from(&mut buf);
    println!("{:?}", buf);
}
```

The `buf` will print out some bytes, and when converting specific ranges to a string, I'm able to find out more about my doorbell like it's mac address and some other hardware information.

### To continue on with port 64100 though:
As you can see above I called port 24199 and not 64100. I still don't know what protocol it speaks, and from all the information I've gathered thusfar it seems like this is a custom protocol and one where I can't find anything about online. My only step right now is to figure out how the protocol works by hand. First, just to confirm that it accepts both TCP and UDP calls I do a simple test with netcat:

```
netcat -v 192.168.1.9 64100
Connection to 192.168.1.9 64100 port [tcp/*] succeeded!

netcat -v -u 192.168.1.9 64100
Connection to 192.168.1.9 64100 port [udp/*] succeeded!
```

Furthermore it seems like all the TCP requests (I'll handle the UDP one's later), especially the one's that contain JSON are all prefixed with 8 bytes. Now my question is: does it really matter what bytes are being set there? So, firstly I'm making a test request by writing these bytes to a file called `test_request`:

```
        {"message":"get-configuration","addressbooks":"none","message-type":"request","message-id":2}
```

The 8-whitespaces are intentional. Then I do:

```
netcat -v 192.168.1.9 64100 < test_request
```

Which returns a set of 18 non-parseable bytes:

```
\u0000
\u0006
\n
\u0000
\u0000
\u0000
\u0000
\u0000
\xEF
\u0001
\u0003
\u0000
\u0002
\u0000
\u0000
\u0000
\u0000
\u0000
```

It clearly doesn't return a response, so I'm doing something wrong. It's probably safe to assume the protocol rejects my request. However, these bytes do tell me something because it looks not to unfamilair to some of the requests I captured with PCAPdroid.

Going back to Wireshark I can actaully see a similar response, except after the "\u0002" come two more zero's and two control bytes. Naturally, I'm actually curious if it matters what these two bytes are set to in all honesty, which we'll figure out later.

After a lot of fiddling and manually setting bits and what not, I figured it out. To sucessfully make a call to my intercom this is what the Android app essentially does.

1. It opens up a TCP stream.
2. It sends an "intent" to do a certain command over that TCP stream.
3. It executes the actual command over that TCP stream.

To elaborate on each step:

---

*Step 1: Open up a Tcp Stream to the doorbell.*

In Rust opening up a TCP Stream is done like such:

```rust
use std::env;
use std::fs;
use std::io::prelude::*;
use std::net::TcpStream;
use std::time::Duration;

const TOKEN: &'static str = "TOKEN";
const DOORBELL_IP: &'static str = "192.168.1.9";
const DOORBELL_PORT: u16 = 64100;

fn main() {
    let token = env::var(TOKEN).unwrap();

    let doorbell = format!("{}:{}",
                           DOORBELL_IP,
                           DOORBELL_PORT);

    let mut stream = TcpStream::connect(doorbell)
        .expect("Doorbell unavailable");

    stream.set_read_timeout(Some(Duration::from_millis(5000))).unwrap();
    stream.set_write_timeout(Some(Duration::from_millis(5000))).unwrap();
}
```

Now you're probably wondering what the `TOKEN` is, but that's the ID32 token that I described earlier. You can run this code by doing:

```
TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx cargo run main
```

Replace the x's by the ID32 token.

*Step 2: Telling the doorbell which command you'd like to execute:*

The bytes to send are the following:

```
00 06 0f 00 00 00 00 00  cd ab 01 00 07 00 00 00
55 41 55 54 2f 1a 00
```

The first 16 bytes are always the same, the next 7 are the command followed by 2 control bytes. The commands that are visible from the PCAPDroid dump are:

```
UAUT (I'm assuming this is to authorize)
UCFG (This is to get some config)
INFO (No idea what this is for?)
FRCG (Facial recognition?)
PUSH (I'm assuming this is to get some push token)
```

To add to the code above:

```rust
use std::env;
use std::fs;
use std::io::prelude::*;
use std::net::TcpStream;
use std::time::Duration;

const TOKEN: &'static str = "TOKEN";
const DOORBELL_IP: &'static str = "192.168.1.9";
const DOORBELL_PORT: u16 = 64100;

fn main() {
    let token = env::var(TOKEN).unwrap();

    let doorbell = format!("{}:{}",
                           DOORBELL_IP,
                           DOORBELL_PORT);

    let mut stream = TcpStream::connect(doorbell)
        .expect("Doorbell unavailable");

    stream.set_read_timeout(Some(Duration::from_millis(5000))).unwrap();
    stream.set_write_timeout(Some(Duration::from_millis(5000))).unwrap();

    let s = 117;
    let pre_aut = make_command("UAUT", s);
    let r = tcp_call(&mut stream, &pre_aut);
    println!("{:02x?}", r);
}

fn make_command(command: &'static str, control: u8) -> Vec<u8> {
    // This is the command prefix I see flying by
    // every time
    let command_prefix = [
        0,   6,   15, 0, 0, 0, 0, 0,
        205, 171, 1,  0, 7, 0, 0, 0
    ];

    // The command is then made and two control bytes are
    // added to the end
    let b_comm = command.as_bytes();
    [&command_prefix, &b_comm[..], &[control, 95, 0][..]].concat()
}

fn tcp_call(stream: &mut TcpStream, bytes: &[u8]) -> Option<[u8; 256]> {
    let mut buf = [0; 256];
    return match stream.write(bytes) {
        Ok(_) => {
            match stream.read(&mut buf) {
                Ok(_) => Some(buf),
                Err(_) => None
            }
        },
        Err(_) => None
    }
}
```


*Step 2: Executing the actual command*
The command is formatted as JSON as described above and the 8 bytes that are put in front are:

```
00 06 6d 00 2f 1a 00 00
      ^  ^  ^  ^
      |  |  |  |
      |  |  The same control bits from the command above
      |  |
      Tells you the length of the response
```

So the first two bytes are always "00 06". The next two bytes reveal the length of the response in a very convoluted way. "6d 00" means the stream body is 109 bytes long. However, if the bytes f.e. read "6d 01" it would mean that it is (109 + 255 + 1) = 365 bytes long. The generic formula is:

```
(byte3 to decimal) + ((byte4 to decimal) * 255) + byte4 to decimal
```

I'm ignoring this for now, to write some ugly hacky code, this should work:


```rust
use std::env;
use std::fs;
use std::io::prelude::*;
use std::net::TcpStream;
use std::time::Duration;

const TOKEN: &'static str = "TOKEN";
const DOORBELL_IP: &'static str = "192.168.1.9";
const DOORBELL_PORT: u16 = 64100;

fn main() {
    let token = env::var(TOKEN).unwrap();

    let doorbell = format!("{}:{}",
                           DOORBELL_IP,
                           DOORBELL_PORT);

    let mut stream = TcpStream::connect(doorbell)
        .expect("Doorbell unavailable");
    let s = 117;

    stream.set_read_timeout(Some(Duration::from_millis(5000))).unwrap();
    stream.set_write_timeout(Some(Duration::from_millis(5000))).unwrap();

    let pre_aut = make_command("UAUT", s);
    let r = tcp_call(&mut stream, &pre_aut);
    println!("{:02x?}", r);

    let aut = make_uaut_command(&token, s);
    let r = tcp_call(&mut stream, &aut);

    match r {
        Some(aut_b) => {
            println!("{:02x?}", aut_b);
            println!("WE'RE IN!");
        },
        None => println!("SADNESS")
    }
}

fn make_command(command: &'static str, control: u8) -> Vec<u8> {
    // This is the command prefix I see flying by
    // every time
    let command_prefix = [
        0,   6,   15, 0, 0, 0, 0, 0,
        205, 171, 1,  0, 7, 0, 0, 0
    ];

    // The command is then made and two control bytes are
    // added to the end
    let b_comm = command.as_bytes();
    [&command_prefix, &b_comm[..], &[control, 95, 0][..]].concat()
}

fn make_uaut_command(token: &String, control: u8) -> Vec<u8> {
    let command_prefix = [
        0, 6, 109, 0, control, 95, 0, 0
    ];
    let raw_com = fs::read_to_string("UAUT.json").unwrap();
    let com = raw_com.replace("USER-TOKEN", token);
    let b_com = com.as_bytes();
    [&command_prefix, &b_com[..]].concat()
}

fn tcp_call(stream: &mut TcpStream, bytes: &[u8]) -> Option<[u8; 256]> {
    let mut buf = [0; 256];
    return match stream.write(bytes) {
        Ok(_) => {
            match stream.read(&mut buf) {
                Ok(_) => Some(buf),
                Err(_) => None
            }
        },
        Err(_) => None
    }
}
```

*Step 3: Success!*
You should get a JSON response in return which looks like this (I added line breaks and whitespaces for readability):

```json
{
  "message":"access",
  "message-type":"response",
  "message-id":1,
  "response-code":200,
  "response-string":"Access Granted"
}
```

---

Naturally after this one succeeded I could execute the rest of the requests I captured, and mostly this went fine until one of the ..

This is all good and nice but this request doesn't exactly do anything other than authenticate with my doorbell and make presumeably a session over there. I can do some of the subsequent requests, but I'm still a bit confused as to what I can do next. I still can't exactly figure out what call the Android app makes as soon as I hit the slider to open the door.

If I check my PCAP file I do see a long list of UDP requests which all seem encrypted in some shape or way. My guess is that these are mostly the images that are streamed back to my device from the camera's of the intercom.

### Source

\[1\] [Comelit Group - About Page](https://www.comelitgroup.com/en/company/about-us/)

\[2\] [Mini Wi-Fi](https://www.comelitgroup.com/nl-nl/systemen/video-deurintercom/binnenshuis/)

\[3\] [Wireshark alternatives for Android](https://techwiser.com/wireshark-alternatives-for-android/)

\[4\] [STUN server](https://www.3cx.com/pbx/what-is-a-stun-server/)

\[5\] [MQTT](https://mqtt.org/)

\[6\] [NPM Comelit-client](https://www.npmjs.com/package/comelit-client?activeTab=explore)

\[7\] [ViP Manager](https://pro.comelitgroup.com/nl-nl/downloads/vip-system-3/software-6/vip-manager)

\[8\] [How to reverse engineer an android application in 3 easy steps](https://medium.com/dwarsoft/how-to-reverse-engineer-an-android-application-in-3-easy-steps-dwarsoft-mobile-880d268bdc90)
