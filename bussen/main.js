(function () {
    "use strict";

    const maxPlayers = 8;
    const cardCount = 4;
    const deckURL = "https://www.deckofcardsapi.com";
    let arena = document.getElementById("players-arena");
    let area = document.querySelector(".player-area");

    class Player {
        constructor(username, cards) {
            this.username = username;
            this.cards = cards;
        }

        valid() {
            if (this.username == "") { return false; }
            if (this.cards.length != cardCount) { return false; }
            return true;
        }

        render() {
            let el = area.cloneNode(true);
            let header = el.querySelector("h2");
            let cards = el.querySelectorAll(".cards .card");
            header.innerHTML = this.username;
            el.classList.remove("hidden");
            arena.appendChild(el);

            for (let i = 0; i <= cards.length; i++) {
                let img = cards[i].querySelector("img.front");
                let backImg = cards[i].querySelector("img.back");
                console.log(cards[i], img, backImg);
                img.setAttribute("src", this.cards[i].images.png);
                backImg.setAttribute("src", deckURL + "/static/img/back.png");
            }
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
