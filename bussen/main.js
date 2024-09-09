(function () {
    "use strict";

    const maxPlayers = 8;
    const cardCount = 4;
    const cardValues = "1234567890JQKA";
    const deckURL = "https://www.deckofcardsapi.com";
    let arena = document.getElementById("players-arena");
    let area = document.querySelector(".player-area");

    class Player {
        constructor(username, cards) {
            this.username = username;
            this.cards = cards;
            this.round = 0;
            this.el = null;
        }

        valid() {
            if (this.username == "") { return false; }
            if (this.cards.length != cardCount) { return false; }
            return true;
        }

        pickCard(e) {
            const targetValues = e.target.value.split("-");
            const cardCode = this.cards[this.round].code;

            switch (targetValues[0]) {
                case "r1":
                console.log(this.checkValidSuit(cardCode, targetValues[1]));
                break;
                case "r2":
                console.log(this.checkHigherLower(targetValues[1]));
                break;
                case "r3":
                console.log(this.checkInOrOut(targetValues[1]));
                break;
                case "r4":
                break;
                default:
                console.error("Invalid value");
                break;
            }

            this.activateNextRound();
        }

        checkValidSuit(cardCode, color) {
            switch (color) {
                case "red":
                  return cardCode[1] == "H" || cardCode[1] == "D";
                break;
                case "black":
                  return cardCode[1] == "C" || cardCode[1] == "S";
                break;
                default:
                  console.error("Invalid color")
                break;
            }
        }

        checkHigherLower(guess) {
            const prevCode = this.cards[0].code;
            const cardCode = this.cards[1].code;
            const prevValue = this.cardCodeToValue(prevCode[0]);
            const value = this.cardCodeToValue(cardCode[0]);

            switch (guess) {
                case "higher":
                    return value > prevValue;
                break;
                case "lower":
                    return value < prevValue;
                break;
                case "pole":
                    return value == prevValue;
                break;
                default:
                  console.error("Invalid guess")
                break;
            }
        }

        checkInOrOut(guess) {
            const firstCode = this.cards[0].code;
            const secondCode = this.cards[1].code;
            const currentCode = this.cards[2].code;
            const firstValue = this.cardCodeToValue(firstCode[0]);
            const secondValue = this.cardCodeToValue(secondCode[0]);
            const currentValue = this.cardCodeToValue(currentCode[0]);
            const lowerBound = Math.min(prevValue, value);
            const upperBound = Math.max(prevValue, value);

            switch (guess) {
                case "inside":
                  return currentValue > lowerBound && currentValue < upperBound;
                break;
                case "outside":
                  return currentValue < lowerBound || currentValue > upperBound;
                break;
                case "pole":
                  return currentValue == firstValue || currentValue == secondValue;
                break;
                default:
                  console.error("Invalid guess")
                break;
            }
        }

        checkFinalRound(guess) {
            switch (guess) {
                case "yes":
                break;
                case "no":
                break;
                case "disco":
                break;
                case "pole":
                break;
                default:
                  console.error("Invalid guess")
                break;
            }
        }

        cardCodeToValue(letter) {
            return cardValues.indexOf(letter);
        }

        activateNextRound() {
            let cardWrappers = this.el.querySelectorAll(".card-wrapper");
            let front = cardWrappers[this.round].querySelector(".card .front");
            let back = cardWrappers[this.round].querySelector(".card .back");

            for (let i = 0; i < cardWrappers.length; i++) {
                cardWrappers[i].classList.remove("active");
            }

            front.classList.remove("hidden");
            back.classList.add("hidden");

            if (this.round < cardCount) {
                this.round += 1;
                cardWrappers[this.round].classList.add("active");
            }
        }

        render() {
            let el = area.cloneNode(true);
            let header = el.querySelector("h2");
            let cards = el.querySelectorAll(".cards .card");
            let buttons = el.querySelectorAll("button");
            header.innerHTML = this.username;
            el.classList.remove("hidden");

            for (let i = 0; i < cards.length; i++) {
                let img = cards[i].querySelector("img.front");
                let backImg = cards[i].querySelector("img.back");
                img.setAttribute("src", this.cards[i].images.png);
                backImg.setAttribute("src", deckURL + "/static/img/back.png");
            }

            for (const button of buttons) {
                button.addEventListener("click", this.pickCard.bind(this));
            }

            arena.appendChild(el);
            this.el = el;
        }
    }

    class Players {
        constructor() {
            this.players = [];
        }

        add(player) {
            if (this.players.length > maxPlayers) {
                return
            }
            this.players.push(player);
            player.render();
        }
    }

    class Game {
        constructor() {
            this.deckID = null;
            this.players = new Players();
            this.addForm = document.getElementById("bussen-players-add");
        }

        addPlayer(e) {
            e.preventDefault();
            const formData = new FormData(this.addForm);
            const username = formData.get("username");
            const drawURL = deckURL + "/api/deck/" + this.deckID + "/draw/?count=" + cardCount;
            fetch(drawURL)
                .then(function(response) {
                    return response.json();
                })
                .then(function(data) {
                    const player = new Player(username, data.cards);
                    if (player.valid()) {
                        this.players.add(player);
                        this.addForm.reset();
                    }
                }.bind(this))
                .catch(function(err) {
                    console.error(err);
                });
        }

        setDeckID(data) {
            this.deckID = data.deck_id;
        }

        setup() {
            this.addForm.onsubmit = this.addPlayer.bind(this);
            const newDeckURL = deckURL + "/api/deck/new/shuffle/?deck_count=1";
            fetch(newDeckURL)
                .then(function(response) {
                    return response.json();
                })
                .then(this.setDeckID.bind(this))
                .catch(function(err) {
                    console.error(err);
                });
        }
    }

    const game = new Game();
    game.setup();
})();
