---
layout: post
title: "My intercom - Part 2"
---

### Introduction
Quite a lot has happened since the [first article](/2023/01/28/my-intercom-part-1.html), and first I would like to start with some updates. I got some help from Madchicken, the creator of the Comelit client library. A library I briefly mentioned in my previous article. I thought there wouldn't be any helpful code in there, but there is actually. It's in the icona-bridge-client [1]. Furthermore, I made a GitHub repo for my project and to follow any live changes, I'd suggest to go there [2]. With that out of the way, let's continue on where we left off in the previous article:

### The CTPP and CBSP channel
To this day I still can't tell you what these abbreviations mean. In the previous article I encountered way easier abbreviations, and because of the JSON data that was attached to the requests and responses, you could kind of derrive some meaning. For CTPP and CBSP I honestly can't tell what the purpose is behind them.

*CBSP*
Let me start with the easiest of the two: CBSP. In the previous article I talked about channels and how the viper server clearly operates within a channel. A quick recap how it works:

- Open a channel with a name (f.e. CBSP) and two bytes as identifier.
- Do a certain amount of requests on a channel by identifier
- Close the channel by identifier

The CBSP channel is opened right before or after the CTPP channel is opened, and not a single request is being send over this particular channel. This is either because: the channel type is not used at all and it is a form of legacy, or the channel is opened only for requests to arrive at a deviation of this identifier (we'll get into that as soon as we touch upon UDP requests). For now CBSP can be ignored.

*CTPP*
By far the most requests, when
The PCAPDroid capture, shows that there's a CTPP command being executed to the doorbell, however, it deviates from the original pattern because at the initial command handshake, it adds a string which looks like a serial bus of sorts. The next TCP request, isn't a single set of bytes followed by a JSON string, but instead it's a series of serial busses squashed in with a lot of random bytes.

Are these the calls that open the door or? It does seem like it but why does it take ~50 requests to do so. That's an incredibly amount, and what is up with all these random bytes? I feel like the Comelit Android app is throwing me off for some reason.

Also, what is CTPP and CBSP, what does that stand for? Also, after one or two of these calls another call is made to get the configuration.

*What I think is happening:*

<img src="/img/2/door-setup.png" style="width: 100%">

Remember my drawing? I am using it again to explain what I think CTPP and CBSP are doing. My intercom is not actually called an intercom, but it's being referred to - in a lot of places - as an *extender*. I think the CTPP command makes a connection to the "Blackbox of magical relays"; pretty much saying "Hey, I'm extender such and such, could you please wire me through to the magic box". When you then proceed to ask for the configuration again, it should return a lot more data, and after a lot of code fiddling, it does, especially under the `vip`-key, which I'm singling out here:

```json
<8 random bytes>
{
  "vip": {
    "enabled": true,
    "apt-address": "SB000006",
    "apt-subaddress": 2,
    "logical-subaddress": 2,
    "apt-config": {
      "description": "",
      "call-divert-busy-en": false,
      "call-divert-address": "",
      "virtual-key-enabled": false
    },
    "user-parameters": {
      "forced": true,
      "apt-address-book": [],
      "switchboard-address-book": [
        {
          "id": 0,
          "name": "Secondary switchboard",
          "apt-address": "SBCPS007",
          "emergency-calls": false
        }
      ],
      "camera-address-book": [],
      "rtsp-camera-address-book": [],
      "entrance-address-book": [
        {
          "id": 0,
          "name": "Ingang",
          "apt-address": "SB100001"
        }
      ],
      "actuator-address-book": [
        {
          "id": 0,
          "name": "Algemeen relais",
          "apt-address": "SBIO0255",
          "module-index": 255,
          "output-index": 1
        }
      ],
      "opendoor-address-book": [
        {
          "id": 0,
          "name": "Toegangsslot",
          "apt-address": "SB100001",
          "output-index": 1,
          "secure-mode": false
        }
      ],
      "opendoor-actions": [
        {
          "id": 0,
          "action": "peer",
          "apt-address": "",
          "output-index": 1
        }
      ],
      "additional-actuator": {
        "id": 0,
        "enabled": true,
        "apt-address": "SBIO0255",
        "module-index": 255,
        "output-index": 1
      },
      "direct-link-address-book": [
        {
          "id": 0,
          "name": "Link 1",
          "url": "",
          "method": 1
        },
        {
          "id": 1,
          "name": "Link 2",
          "url": "",
          "method": 1
        },
        {
          "id": 2,
          "name": "Link 3",
          "url": "",
          "method": 1
        },
        {
          "id": 3,
          "name": "Link 4",
          "url": "",
          "method": 1
        }
      ]
    }
  }
}
```

Just like before I'm trying to lookup some of these terms on the internet to see if I can find anybody that has done something similar in the past.

### switchboard-address-book
This is the first keyword which catches my eye. It has an `apt-address` with the value `SBCPS007`. There are no CTPP calls made to this address, so I'm not sure what this is for. Looking on the internet I find some manuals to other intercom systems, but that's where this search ends.

### camera-address-book and rtsp-camera-address-book
It's funny to see these two being blank. I'd imagine that further down the line these will perhaps start containing values, or perhaps they are intentionally empty, who knows? Looking for "rtsp-camera-address-book¨, I find a GitHub issue [1] which unfortunately is all in Italian; I did leave a reply telling the people there I'm working on something similar [2]. It seems like most people over there are using the Comelit Hub to make requests, which is something that also happens on my end, but through an external hub.

### entrance-address-book
This key is also mentioned in the GitHub issue [10], and is of most interest to me because `SB100001` is seen a lot in the CTPP calls I captured with PCAPDroid. I imagine it's to make a connection from the magical relay box to "Ingang" (which is Dutch for "entry"). What's even weirder is that it's the same apt-address in "opendoor-address-book"; so I'm a bit confused which one it's actually using. So far my best guess is that it works probably something like this:

```
1. Comelit Mini-Wifi extender (My intercom)
2. The magical relay box
3. Entrance

[1] ---/ --- [2] ---/ --- [3]

Connect the extender with the relay box:
[1] -------- [2] ---/ --- [3]

Connect the relay box box with entrance:
[1] -------- [2] -------- [3]
```

After all of these connections are made, you should in theory check the camera and the entrance. But both entrances? And both camera's?

### opendoor-actions
Why does action say "peer"? "peer" as in p2p?

### additional-actuator
This one has a similar apt-address as actuator-address-book and I don't think that's actually being access by Comelit's Android application.

### direct-link-address-book
I couldn't possibly tell you what these four links are, but my guess is that they are perhaps spots to reserve in some administration system. For now the url's seem all empty.

### Sources

\[1\] [Icona bridge client](https://www.npmjs.com/package/comelit-client?activeTab=explore)

\[2\] [viper-client](github.com/grdw/viper-client)

\[1\] [Integrazione videocitofono comelit](https://github.com/madchicken/homebridge-comelit-hub/issues/33)

\[2\] [My comment](https://github.com/madchicken/homebridge-comelit-hub/issues/33#issuecomment-1407388952)
