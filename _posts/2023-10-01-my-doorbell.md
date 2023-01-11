---
layout: post
title: "My doorbell"
---

### Introduction
In this day and age it surprises me how many devices can connect to the internet. My doorbell for example has the ability to connect to the internet. This begs the question, can I unlock the two central doors from my apartment building from my laptop? Or can I snoop using the installed cameras? To give some context on how I'm living: I live in an apartment with two outside doors, the first door from the outside to inside the building is for the mailman to be able to enter the mailboxes, that door is always open from early morning to somewhere in the evening, and can be pushed open (which not everybody knows) and the other from the "mailbox area" to the rest of the building is always closed. Both doors can be opened using my doorbell (or intercom).

My doorbell is of a brand called Comelit, an Italian surveillance company [1], and the type is "Mini Wi-Fi" [2]. I'm naturally curious how much I can get from that Wifi connection. For what it seems, Comelit has a range of apps in the Google Play Store I can install, and which I have installed in the past. The "Comelit" app is pretty broken, you can set it up, for which it needs location access, which is only required because of tracking; they are after all a surveillance company. The app can record who stood in front of the door at certain points in time, and you can open the door from the app. However, after a while, for unknown reasons the app will forget that it has ever seen your doorbell and it will crash. Why can't I open these doors with my laptop?

### Connecting to my router
The first step to see if I can open my door with my laptop, is connecting my Comelit Mini Wi-Fi to the actual Wi-Fi. This is where the pain begins. There's no touchscreen on the doorbell so you have to navigate an on-screen keyboard using these horrible partially responsive buttons (it's as if somebody added a `rand > 0.2` somewhere in the hardware driver of those buttons). After typing in my Wifi password, it connects! Checking my router I see it pop-up as `DEV-18:3A:98` with the following IP `192.168.1.9`. After a while it dissappears from the radar. The reason for that is that after it is idle for a while, the doorbell will turn itself off and disconnect from the router.

Running `nmap -Pn 192.168.1.9`:

```
Starting Nmap 7.93 ( https://nmap.org ) at 2023-01-10 15:45 CET
Nmap scan report for 192.168.1.9
Host is up (0.000019s latency).
All 1000 scanned ports on 192.168.1.9 are in ignored states.
Not shown: 1000 filtered tcp ports (no-response)

Nmap done: 1 IP address (1 host up) scanned in 15.22 seconds
```

This means that not a single one of the top 1000 ports is opened. Time for a brute-force `nmap`:

```
nmap -p 1-65535 192.168.1.9
```

This returns:

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

It's nice to know my doorbell has memory, and it appearantly uses about half of its 54 MB. If I go to the `8443` page I'm being hit with a bad SSL certificate error, if I decide to trust it anyway I'm being pretty much redirected to the same page that lives on the `8080` port. Why does it have an https-alt without an SSL certificate?

After some Google'ing I find out that the default password is simply `admin` and with that I gain access to the device. It doesn't give me much, just options to reboot my doorbell, change the password on my doorbell and some device info. The device info page is the most interesting. It has two tables:

<img src="/img/2/2.png" style="width: 100%">

One table is called "Device info" and has two identifiers which I both blurred out. One is a UUID and the other an ID32, I'll trust that it is actually 32 characters long. The Cloud info is the most interesting table here. It says that I have a device that is "UNLINKED", which I can then "Unlink"; why haven't you done so yourself my dear doorbell?

### Available endpoints on 8080 and 8443
I'm wondering what endpoints I can call other than `/`. From the main `index.html` page, I can figure out there are a bunch of other visitable pages:

```
reboot.html
login.html
lang.html
jquery.min.js
jquery.inlineedit.js
```

It has been a while since I've seen some jquery to be honest. The JavaScript is pretty terrible and a sight for sore eyes; I'll spare you the details. This still doesn't entirely tell me what happens if I touch the buttons on the device or what the Comelit Android app actually uses. Time to get my hands on a Proxy application.

### Port 53 and 64100
Port 53 seems like a DNS port.

### Source

\[1\] [Comelit Group - About Page](https://www.comelitgroup.com/en/company/about-us/)

\[2\] [Mini Wi-Fi](https://www.comelitgroup.com/nl-nl/systemen/video-deurintercom/binnenshuis/)
