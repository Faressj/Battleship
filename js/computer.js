/*jslint browser this */
/*global _, player */

(function (global) {
    "use strict";

    var computer = _.assign({}, player, {
        grid: [],
        tries: [],
        fleet: [],
        game: null,
        play: function () {
            var self = this;
            setTimeout(function () {
                self.game.fire(this, 0, 0, function (hasSucced) {
                    self.tries[0][0] = hasSucced;
                });
            }, 2000);
        },
        isShipOk: function (callback) {
            var i = 0;
            var computerlignearray = [];
            var computercolonnearray = [];
            var computerposition1l;
            var computerposition2l;
            var computerposition3l;
            var computerposition4l;
            var computerposition1c;
            var computerposition2c;
            var computerposition3c;
            var computerposition4c;
            var j;
            this.fleet.forEach(function (ship, i) {
                computerligne = Math.floor(Math.random() * 9);
                while(computerlignearray.includes(computerligne) == true){
                    var computerligne = Math.floor(Math.random() * 9);
                }
                computerlignearray.push(computerligne);
                computercolonne = Math.floor(Math.random() * 5);
                while(computercolonnearray.includes(computercolonne) == true){
                    var computercolonne = Math.floor(Math.random() * 5);
                }
                computercolonnearray.push(computercolonne);
                if(i == 0){
                    computerposition1l = computerlignearray[i];
                    computerposition1c = computercolonnearray[i];
                }else if(i == 1){
                    computerposition2l = computerlignearray[i];
                    computerposition2c = computercolonnearray[i];
                }else if(i == 2){
                    computerposition3l = computerlignearray[i];
                    computerposition3c = computercolonnearray[i];
                }else if(i == 3){
                    computerposition4l = computerlignearray[i];
                    computerposition4c = computercolonnearray[i];
                }
                j = 0;
                while (j < ship.life) {
                    
                    if(i == 0){
                        this.grid[computerposition1l][computerposition1c] = ship.getId();
                        computerposition1c +=1;
                    }else if(i == 1){
                        this.grid[computerposition2l][computerposition2c] = ship.getId();
                        computerposition2c +=1;
                    }else if(i == 2){
                        this.grid[computerposition3l][computerposition3c] = ship.getId();
                        computerposition3c +=1;
                    }else if(i == 3){
                        this.grid[computerposition4l][computerposition4c] = ship.getId();
                        computerposition4c +=1;
                    }
                    j += 1;
                }


            }, this);
            console.log(this.grid);
            setTimeout(function () {
                callback();
            }, 500);
        },
        IA: function (){
            
        }
    });

    global.computer = computer;

}(this));