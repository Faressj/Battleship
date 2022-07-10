/*jslint browser this */
/*global _, player, computer, utils */

(function () {
    "use strict";
    var audioToucher = new Audio('sound/toucher.wav');
    var audioAqua = new Audio('sound/rate.wav');
    var audioTir = new Audio('sound/tir.wav');

    var game = {
        PHASE_INIT_PLAYER: "PHASE_INIT_PLAYER",
        PHASE_INIT_OPPONENT: "PHASE_INIT_OPPONENT",
        PHASE_PLAY_PLAYER: "PHASE_PLAY_PLAYER",
        PHASE_PLAY_OPPONENT: "PHASE_PLAY_OPPONENT",
        PHASE_GAME_OVER: "PHASE_GAME_OVER",
        PHASE_WAITING: "waiting",

        currentPhase: "",
        phaseOrder: [],
        // garde une référence vers l'indice du tableau phaseOrder qui correspond à la phase de jeu pour le joueur humain
        playerTurnPhaseIndex: 2,

        // l'interface utilisateur doit-elle être bloquée ?
        waiting: false,

        // garde une référence vers les noeuds correspondant du dom
        grid: null,
        miniGrid: null,

        // liste des joueurs
        players: [],

        // lancement du jeu
        init: function () {

            // initialisation
            this.grid = document.querySelector('.board .main-grid');
            this.miniGrid = document.querySelector('.left .mini-grid');

            // défini l'ordre des phases de jeu
            this.phaseOrder = [
                this.PHASE_INIT_PLAYER,
                this.PHASE_INIT_OPPONENT,
                this.PHASE_PLAY_PLAYER,
                this.PHASE_PLAY_OPPONENT,
                this.PHASE_GAME_OVER
            ];
            this.playerTurnPhaseIndex = 2;

            // initialise les joueurs
            this.setupPlayers();

            // ajoute les écouteurs d'événement sur la grille
            this.addListeners();

            // c'est parti !
            this.goNextPhase();
        },
        setupPlayers: function () {
            // donne aux objets player et computer une réference vers l'objet game
            player.setGame(this);
            computer.setGame(this);

            // todo : implémenter le jeu en réseaux
            this.players = [player, computer];

            this.players[0].init();
            this.players[1].init();
        },
        goNextPhase: function () {
            // récupération du numéro d'index de la phase courante
            var ci = this.phaseOrder.indexOf(this.currentPhase);
            var self = this;

            if (ci !== this.phaseOrder.length - 1) {
                this.currentPhase = this.phaseOrder[ci + 1];
            } else {
                this.currentPhase = this.phaseOrder[this.playerTurnPhaseIndex];
            }
            console.log(this.currentPhase);
            switch (this.currentPhase) {
            case this.PHASE_GAME_OVER:
                // detection de la fin de partie
                if (!this.gameIsOver()) {
                    // le jeu n'est pas terminé on recommence un tour de jeu
                    this.currentPhase = this.phaseOrder[this.playerTurnPhaseIndex];
                }
                break;
            case this.PHASE_INIT_PLAYER:
                utils.info("Placez vos bateaux");
                break;
            case this.PHASE_INIT_OPPONENT:
                this.wait();
                utils.info("En attente de votre adversaire");
                this.players[1].isShipOk(function () {
                    self.stopWaiting();
                    self.goNextPhase();
                });
                break;
            case this.PHASE_PLAY_PLAYER:
                utils.info("A vous de jouer, choisissez une case !");
                break;
            case this.PHASE_PLAY_OPPONENT:
                utils.info("A votre adversaire de jouer...");
                this.players[1].play();
                break;
            }

        },
        player0life: function (){
            var a = 0;
            var b = 0;
            while(a < this.players[0].grid.length){
                while(b < this.players[0].grid[a].length){
                    if(this.players[0].grid[a][b] > 0){
                        return true;
                    }
                    b = b+1;
                }
                b = 0;
                a = a+1;
            }
            return false;
        },
        player1life: function (){
            var c = 0;
            var d = 0;
            while(c< this.players[1].grid.length){
                while(d< this.players[1].grid[c].length){
                    if(this.players[1].grid[c][d] > 0){
                        return true;
                    }d = d+1;
                }
                d = 0;
                c = c+1;
            }
            return false;
        },
        gameIsOver: function () {
            var player0life = this.player0life();
            var player1life = this.player1life();
            if(player0life == false && player1life == false){
                console.log("égalité");
                return true;
            }else if(player0life == true && player1life == false){
                console.log("Tu as gagné");
                return true;
            }else if(player0life == false && player1life == true){
                console.log("Tu as perdu");
                return true;
            }else{
                this.goNextPhase();
                return false;
            }
        },
        getPhase: function () {
            if (this.waiting) {
                return this.PHASE_WAITING;
            }
            return this.currentPhase;
        },
        // met le jeu en mode "attente" (les actions joueurs ne doivent pas être pris en compte si le jeu est dans ce mode)
        wait: function () {
            this.waiting = true;
        },
        // met fin au mode mode "attente"
        stopWaiting: function () {
            this.waiting = false;
        },
        addListeners: function () {
            // on ajoute des acouteur uniquement sur la grid (délégation d'événement)
            this.grid.addEventListener('mousemove', _.bind(this.handleMouseMove, this));
            this.grid.addEventListener('click', _.bind(this.handleClick, this));
            this.grid.addEventListener('contextmenu', _.bind(this.rotation, this));
            this.grid.addEventListener('mouseover', _.bind(this.firehover, this));
            this.grid.addEventListener('mouseout', _.bind(this.firehover2, this));
        },
        rotation: function(e) {
            e.preventDefault();
            var ship = this.players[0].fleet[this.players[0].activeShip];
             if(this.players[0].orientation == 'V') {
                 this.players[0].orientation = 'H';
                 ship.dom.style.transform = 'rotate(0deg)';
             } else {
                 this.players[0].orientation = 'V';
                 ship.dom.style.transform = 'rotate(90deg)';
             }
             if(this.players[0].activeShip == 2 && this.players[0].orientation == 'V'){
                ship.dom.style.top = "" + utils.eq(e.target.parentNode) * utils.CELL_SIZE - ((600 + this.players[0].activeShip * 60) + 30) + "px";
                ship.dom.style.left = "" + utils.eq(e.target) * utils.CELL_SIZE - (Math.floor(ship.getLife() / 2) * utils.CELL_SIZE) + 30 + "px";
            }else{
                ship.dom.style.top = "" + (utils.eq(e.target.parentNode)) * utils.CELL_SIZE - (600 + this.players[0].activeShip * 60) + "px";
                ship.dom.style.left = "" + utils.eq(e.target) * utils.CELL_SIZE - Math.floor(ship.getLife() / 2) * utils.CELL_SIZE + "px";
            }
        },
        handleMouseMove: function (e) {
            // on est dans la phase de placement des bateau
            // actualdiv = e.target.parentNode + 
            if (this.getPhase() === this.PHASE_INIT_PLAYER && e.target.classList.contains('cell')) {
                var ship = this.players[0].fleet[this.players[0].activeShip];
                // si on a pas encore affiché (ajouté aux DOM) ce bateau
                if (!ship.dom.parentNode) {
                    this.grid.appendChild(ship.dom);
                    // passage en arrière plan pour ne pas empêcher la capture des événements sur les cellules de la grille
                    ship.dom.style.zIndex = -1;
                }

                // décalage visuelle, le point d'ancrage du curseur est au milieu du bateau
                if(this.players[0].activeShip == 2 && this.players[0].orientation == 'V'){
                    ship.dom.style.top = "" + utils.eq(e.target.parentNode) * utils.CELL_SIZE - ((600 + this.players[0].activeShip * 60) + 30) + "px";
                    ship.dom.style.left = "" + utils.eq(e.target) * utils.CELL_SIZE - (Math.floor(ship.getLife() / 2) * utils.CELL_SIZE) +30 + "px";
                }else{
                    ship.dom.style.top = "" + (utils.eq(e.target.parentNode)) * utils.CELL_SIZE - (600 + this.players[0].activeShip * 60) + "px";
                    ship.dom.style.left = "" + utils.eq(e.target) * utils.CELL_SIZE - Math.floor(ship.getLife() / 2) * utils.CELL_SIZE + "px";
                }
            }
        },
        firehover : function(e){
            if(this.getPhase() === this.PHASE_PLAY_PLAYER){
                e.target.style.backgroundImage = "url('img/canon.jpg')";
                e.target.style.backgroundSize = "contain";
            }
        },
        firehover2 :function(e){
            if(this.getPhase() === this.PHASE_PLAY_PLAYER && e.target.classList.contains('cell')){
                e.target.style.backgroundImage = "none";
            }
        },
        finalarray: [],
        arrayy: [],
        increment: null,
        handleClick: function (e) {
            if(this.currentPhase == "PHASE_INIT_PLAYER"){
                // self garde une référence vers "this" en cas de changement de scope
                var self = this;
                var index1 = null;
                var index = null;
                if(this.players[0].orientation == 'V'){
                    // PAS POSSIBLE DE CLIQUER SUR UN BATEAU
                    var index = null;
                    if(this.players[0].activeShip == 0 || this.players[0].activeShip == 1){
                        if(utils.eq(e.target.parentNode) == 0 || utils.eq(e.target.parentNode) == 1 || utils.eq(e.target.parentNode) == 9 || utils.eq(e.target.parentNode) == 8){
                            return false;
                        }
                    }else if(this.players[0].activeShip == 2){
                        if(utils.eq(e.target.parentNode) == 0 || utils.eq(e.target.parentNode) == 1 || utils.eq(e.target.parentNode) == 9){
                            return false;
                        }
                    }else if(this.players[0].activeShip == 3){
                        if(utils.eq(e.target.parentNode) == 0 || utils.eq(e.target.parentNode) == 9){
                            return false;
                        }
                    }
                    if(this.finalarray.length > 0){
                        for(index=0;index<this.finalarray.length; index++){
                            if(this.finalarray[index][0] == utils.eq(e.target) && this.finalarray[index][1] == utils.eq(e.target.parentNode)){
                                return false;
                            }else if(this.players[0].activeShip == 1){
                                if(this.finalarray[index][0] == utils.eq(e.target) && this.finalarray[index][1] == utils.eq(e.target.parentNode)-1 || this.finalarray[index][0] == utils.eq(e.target)  && this.finalarray[index][1] == utils.eq(e.target.parentNode)-2 ||  this.finalarray[index][0] == utils.eq(e.target)  && this.finalarray[index][1] == utils.eq(e.target.parentNode)+1 || this.finalarray[index][0] == utils.eq(e.target) && this.finalarray[index][1] == utils.eq(e.target.parentNode)+2){
                                    return false;
                                }
                            }else if(this.players[0].activeShip == 2){
                                if(this.finalarray[index][0] == utils.eq(e.target) && this.finalarray[index][1] == utils.eq(e.target.parentNode)-1 || this.finalarray[index][0] == utils.eq(e.target)  && this.finalarray[index][1] == utils.eq(e.target.parentNode)-2 ||  this.finalarray[index][0] == utils.eq(e.target) && this.finalarray[index][1] == utils.eq(e.target.parentNode)+1){
                                    return false;
                                }
                            }else if(this.players[0].activeShip == 3){
                                if(this.finalarray[index][0] == utils.eq(e.target) && this.finalarray[index][1] == utils.eq(e.target.parentNode)-1 ||  this.finalarray[index][0] == utils.eq(e.target)  && this.finalarray[index][1] == utils.eq(e.target.parentNode)+1){
                                    return false;
                                }
                            }else{
                                continue;
                            }
                        }
                    }
                    // si on a cliqué sur une cellule (délégation d'événement)
                    if (e.target.classList.contains('cell')) {
                        // si on est dans la phase de placement des bateau
                        if (this.getPhase() === this.PHASE_INIT_PLAYER) {
                            self.renderMiniMap();
                            // on enregistre la position du bateau, si cela se passe bien (la fonction renvoie true) on continue
                            //AJOUT DES COORDONNEES DES BATEAUX EN FONCTION DE LEUR TAILLE
                            if(this.players[0].activeShip == 0 || this.players[0].activeShip == 1){
                                for(index1 = 0; index1 < 3; index1++){
                                    this.arrayy.push(utils.eq(e.target), utils.eq(e.target.parentNode)-index1);
                                    this.finalarray.push(this.arrayy);
                                    this.arrayy = [];
                                }
                                for(index1 = 1; index1 < 3; index1++){
                                    this.arrayy.push(utils.eq(e.target), utils.eq(e.target.parentNode)+index1);
                                    this.finalarray.push(this.arrayy);
                                    this.arrayy = [];
                                }
                            }else if(this.players[0].activeShip == 2){
                                for(index1 = 0; index1 < 3; index1++){
                                    this.arrayy.push(utils.eq(e.target), utils.eq(e.target.parentNode)-index1);
                                    this.finalarray.push(this.arrayy);
                                    this.arrayy = [];
                                }
                                for(index1 = 1; index1 < 2; index1++){
                                    this.arrayy.push(utils.eq(e.target), utils.eq(e.target.parentNode)+index1);
                                    this.finalarray.push(this.arrayy);
                                    this.arrayy = [];
                                }
                            }else if(this.players[0].activeShip == 3){
                                for(index1 = 0; index1 < 2; index1++){
                                    this.arrayy.push(utils.eq(e.target), utils.eq(e.target.parentNode)-index1);
                                    this.finalarray.push(this.arrayy);
                                    this.arrayy = [];
                                }
                                for(index1 = 1; index1 < 2; index1++){
                                    this.arrayy.push(utils.eq(e.target), utils.eq(e.target.parentNode)+index1);
                                    this.finalarray.push(this.arrayy);
                                    this.arrayy = [];
                                }
                            }
                            if (this.players[0].setActiveShipPosition(utils.eq(e.target), utils.eq(e.target.parentNode))) {
                                // et on passe au bateau suivant (si il n'y en a plus la fonction retournera false)
                                if (!this.players[0].activateNextShip()) {
                                    this.wait();
                                    utils.confirm("Confirmez le placement ?", function () {
                                        // si le placement est confirmé
                                        self.stopWaiting();
                                        self.renderMiniMap();
                                        self.players[0].clearPreview();
                                        self.players[0].resetShipPlacement();
                                        self.goNextPhase();
                                    }, function () {
                                        location.reload();
                                        self.stopWaiting();
                                        // sinon, on efface les bateaux (les positions enregistrées), et on recommence
                                        self.players[0].resetShipPlacement();
                                        return false;
                                    });
                                }
                            }
                        // si on est dans la phase de jeu (du joueur humain)
                        } else if (this.getPhase() === this.PHASE_PLAY_PLAYER) {
                            this.players[0].play(utils.eq(e.target), utils.eq(e.target.parentNode));
                        }
                    }
                }else{
                    if(this.players[0].activeShip == 0 || this.players[0].activeShip == 1){
                        if(utils.eq(e.target) == 0 || utils.eq(e.target) == 1 || utils.eq(e.target) == 9 || utils.eq(e.target) == 8){
                            return false;
                        }
                    }else if(this.players[0].activeShip == 2){
                        if(utils.eq(e.target) == 0 || utils.eq(e.target) == 1 || utils.eq(e.target) == 9){
                            return false;
                        }
                    }else if(this.players[0].activeShip == 3){
                        if(utils.eq(e.target) == 0 || utils.eq(e.target) == 9){
                            return false;
                        }
                    }
                    if(this.finalarray.length > 0){
                        for(index=0;index<this.finalarray.length; index++){
                            if(this.finalarray[index][0] == utils.eq(e.target) && this.finalarray[index][1] == utils.eq(e.target.parentNode)){
                                return false;
                            }else if(this.players[0].activeShip == 1){
                                if(this.finalarray[index][0] == utils.eq(e.target)-1 && this.finalarray[index][1] == utils.eq(e.target.parentNode) || this.finalarray[index][0] == utils.eq(e.target)-2  && this.finalarray[index][1] == utils.eq(e.target.parentNode) ||  this.finalarray[index][0] == utils.eq(e.target)+1  && this.finalarray[index][1] == utils.eq(e.target.parentNode) || this.finalarray[index][0] == utils.eq(e.target)+2 && this.finalarray[index][1] == utils.eq(e.target.parentNode)){
                                    return false;
                                }
                            }else if(this.players[0].activeShip == 2){
                                if(this.finalarray[index][0] == utils.eq(e.target)-1 && this.finalarray[index][1] == utils.eq(e.target.parentNode) || this.finalarray[index][0] == utils.eq(e.target)-2  && this.finalarray[index][1] == utils.eq(e.target.parentNode) ||  this.finalarray[index][0] == utils.eq(e.target)+1  && this.finalarray[index][1] == utils.eq(e.target.parentNode)){
                                    return false;
                                }
                            }else if(this.players[0].activeShip == 3){
                                if(this.finalarray[index][0] == utils.eq(e.target)-1 && this.finalarray[index][1] == utils.eq(e.target.parentNode) ||  this.finalarray[index][0] == utils.eq(e.target)+1  && this.finalarray[index][1] == utils.eq(e.target.parentNode)){
                                    return false;
                                }
                            }else{
                                continue;
                            }
                        }
                    }
                    
                }
            }
            // si on a cliqué sur une cellule (délégation d'événement)
            if (e.target.classList.contains('cell')) {
                // si on est dans la phase de placement des bateau
                if (this.getPhase() === this.PHASE_INIT_PLAYER) {
                    self.renderMiniMap();
                    // on enregistre la position du bateau, si cela se passe bien (la fonction renvoie true) on continue
                    //AJOUT DES COORDONNEES DES BATEAUX EN FONCTION DE LEUR TAILLE
                    if(this.players[0].activeShip == 0 || this.players[0].activeShip == 1){
                        for(index1 = 0; index1 < 3; index1++){
                            this.arrayy.push(utils.eq(e.target)-index1, utils.eq(e.target.parentNode));
                            this.finalarray.push(this.arrayy);
                            this.arrayy = [];
                        }
                        for(index1 = 1; index1 < 3; index1++){
                            this.arrayy.push(utils.eq(e.target)+index1, utils.eq(e.target.parentNode));
                            this.finalarray.push(this.arrayy);
                            this.arrayy = [];
                        }
                    }else if(this.players[0].activeShip == 2){
                        for(index1 = 0; index1 < 3; index1++){
                            this.arrayy.push(utils.eq(e.target)-index1, utils.eq(e.target.parentNode));
                            this.finalarray.push(this.arrayy);
                            this.arrayy = [];
                        }
                        for(index1 = 1; index1 < 2; index1++){
                            this.arrayy.push(utils.eq(e.target)+index1, utils.eq(e.target.parentNode));
                            this.finalarray.push(this.arrayy);
                            this.arrayy = [];
                        }
                    }else if(this.players[0].activeShip == 3){
                        for(index1 = 0; index1 < 2; index1++){
                            this.arrayy.push(utils.eq(e.target)-index1, utils.eq(e.target.parentNode));
                            this.finalarray.push(this.arrayy);
                            this.arrayy = [];
                        }
                        for(index1 = 1; index1 < 2; index1++){
                            this.arrayy.push(utils.eq(e.target)+index1, utils.eq(e.target.parentNode));
                            this.finalarray.push(this.arrayy);
                            this.arrayy = [];
                        }
                    }
                    if (this.players[0].setActiveShipPosition(utils.eq(e.target), utils.eq(e.target.parentNode))) {
                        
                        // et on passe au bateau suivant (si il n'y en plus la fonction retournera false)

                        if (!this.players[0].activateNextShip()) {
                            this.wait();
                            utils.confirm("Confirmez le placement ?", function () {
                                // si le placement est confirmé
                                self.stopWaiting();
                                self.renderMiniMap();
                                self.players[0].clearPreview();
                                self.players[0].resetShipPlacement();
                                self.goNextPhase();
                            }, function () {
                                location.reload();
                                self.stopWaiting();
                                // sinon, on efface les bateaux (les positions enregistrées), et on recommence
                                self.players[0].resetShipPlacement();
                                return false;
                            });
                        }
                    }
                // si on est dans la phase de jeu (du joueur humain)
                } else if (this.getPhase() === this.PHASE_PLAY_PLAYER) {
                    this.players[0].play(utils.eq(e.target), utils.eq(e.target.parentNode));
                }
            }
                
            this.players[0].orientation = 'H';
            this.increment++;
            if(this.increment == 4){
                this.mypositions = this.finalarray;
                this.finalarray = [];
                this.increment = 0;
            }
        },

        // fonction utlisée par les objets représentant les joueurs (ordinateur ou non)
        // pour placer un tir et obtenir de l'adversaire l'information de réusssite ou non du tir

        fire: function (from, col, line, callback) {
            this.wait();
            var self = this;
            var msg = "";

            // determine qui est l'attaquant et qui est attaqué
            var target = this.players.indexOf(from) === 0
                ? this.players[1]
                : this.players[0];
            var shooter = this.players.indexOf(from) === 1
            ? this.players[0]
            : this.players[1];
            if (this.currentPhase === this.PHASE_PLAY_OPPONENT) {
                msg += "Votre adversaire vous a... ";
                this.currentPhase = this.phaseOrder[3];
            }

            // on demande à l'attaqué si il a un bateaux à la position visée
            // le résultat devra être passé en paramètre à la fonction de callback (3e paramètre)
            target.receiveAttack(col, line, function (hasSucceed) {
                setTimeout(function () {

                    audioToucher.play()  
                    if(target.role === 1) {
                        console.log("bien joué chacal");
                    self.animateFrame(col, line, "img/fire.png");
                    if(document.querySelectorAll('.main-grid>.row:nth-of-type('+(line+1)+')>.cell:nth-of-type('+(col+1)+')').item(0).style.backgroundColor === 'red') {
                        msg += "encore ";
                    }
                    renderMap()
                    console.log("réussi")
                    //document.querySelectorAll('.main-grid>.row:nth-of-type('+(line+1)+')>.cell:nth-of-type('+(col+1)+')').item(0).style.backgroundColor = 'red';
                } else if(target.role === 0) {

                    self.animateFrame(col, line, "img/fire.png");
                    renderMap()
                    console.log("réussi")
                    //document.querySelectorAll('.mini-grid>.row:nth-of-type('+(line+1)+')>.cell:nth-of-type('+(col+1)+')').item(0).style.backgroundColor = 'red';
                    var id = target.grid[line][col] - 1;
                    target.fleet[id].life -= 1;
                    if(target.fleet[id].life <= 0) {
                        document.querySelectorAll('.fleet>*')[id].className += ' sunk';
                    }
                    target.grid[line][col] = null;
                }})
                

                if (target === self.players[1] && self.grid.querySelector('.row:nth-child(' + (line + 1) + ') .cell:nth-child(' + (col + 1) + ')').style.background) {
                    msg += "Apprend a viser ...";
                } else if (hasSucceed) {
                    msg += "Touché !";
                    audioToucher.play()  
                } else {
                    console.log(target);
                    msg += "Manqué...";
                    audioAqua.play()
                }

                utils.info(msg);

                // on invoque la fonction callback (4e paramètre passé à la méthode fire)
                // pour transmettre à l'attaquant le résultat de l'attaque
                // self.renderMap();
                callback(hasSucceed);
                // on fait une petite pause avant de continuer...
                // histoire de laisser le temps au joueur de lire les message affiché
                setTimeout(function () {
                    self.stopWaiting();
                    self.goNextPhase();
                }, 1000);
            });
        },
        renderMap: function () {
            this.players[0].renderTries(this.grid);
        },
        renderMiniMap: function () {
            this.miniGrid.innerHTML = this.grid.innerHTML;
        }
    };

    // point d'entrée
    document.addEventListener('DOMContentLoaded', function () {
        game.init();
    });

}());