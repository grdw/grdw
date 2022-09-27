---
layout: post
title: "How to share a file between devices?"
---

### Introduction

Sharing a file accross devices is painful. You're on your phone but you want to access a file that's on your laptop, how do you do it? Obviously if I were to ask my dad this question he would say: "through Google Drive". Or if you would've asked me 5 years ago, I would've said: "through Dropbox". To make this article a little bit harder, I'll be looking for the easiest and laziest way, to transfer a file from my phone to my laptop. I'll start out with a couple of rules:

1. You can't use an account from an existing online service (like Dropbox, Google Drive, WeTransfer, email drafts, etc.).
2. It needs to be useable for a non-technical person
3. It's cross platform

### "Impossible"
Now, you're thinking: "this is impossible". The only way this can be done is through WeTransfer, but I'd still have to access my email for it, which is not allowed according to rule 1. Plus, it's not lazy enough, I have to drag the file to WeTransfer, upload it, open up my email, download the file, it's too many hoops.

Apple's Airdrop functionality is a thing that comes remarkebly close. The only downside being that I only have one Apple device around the house, which makes it rather useless. Obviously it being an Apple product, It breaks rule number 3.

If I Google my predicament, a Google Support page comes up with: "through the USB-cable" [1]. This seems like a solution, but it is not the easiest solution. Also, when was the last time you plugged your phone into your USB slot of your laptop? It might be the answer, but it doesn't feel like the easiest way.

Another alternative here is Bluetooth, that feature you accidentally turn on from the Android top menu that drains batteries really fast. It might make sense, but the whole pairing feels complex, and unusable for the normal day to day user, breaking rule number 2.

### Breaking rule number 2!
Imagine we can break rule 2. Bluetooth is allowed now, but let me skip that one for the time being. The obvious solution then would be secure copy or scp. You can copy files easily between UNIX devices, and even for Android phones there's an emulator [2] for it. However, even as a technical person I find this approach highly complicated - especially with regards to typing terminal commands on a phone. And what about the other way around, how would I copy a file from my laptop to my phone? Also, I have no idea how this would work for Windows devices in all honesty.

### Sources

\[1\] [Transfer files between your computer & Android device](https://support.google.com/android/answer/9064445?hl=en)

\[2\] [Terminus Google Play Store](https://play.google.com/store/apps/details?id=com.server.auditor.ssh.client&hl=en&gl=US)
