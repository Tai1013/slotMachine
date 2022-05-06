const app = new Vue({
    data() {
        return {
            bet: 10,
            totalBet: 1000.00,
            double: 1,
            onload: false,
            onRepeat: false,
            onSpeedUp: false,
            resultData: [],
            speed: 15,
            winLineTime: 2,
            reelWinData: [
                {
                    tile: [1, 1, 1],
                    bet: 5,
                    class: 'line456'
                },
                {
                    tile: [0, 0, 0],
                    bet: 2,
                    class: 'line123'
                },
                {
                    tile: [2, 2, 2],
                    bet: 2,
                    class: 'line789'
                },
                {
                    tile: [0, 1, 2],
                    bet: 0.5,
                    class: 'line159'
                },
                {
                    tile: [2, 1, 0],
                    bet: 0.5,
                    class: 'line357'
                },
            ],
            recordData: [],
            currentID: 0,
            currentDate: '',
            currentTime: '',
            currentReel: [],
            currentWin: 0,
            currentDetails: [],

            isScreen: false
        }
    },
    watch: {
        onSpeedUp() {
            if (this.onSpeedUp) {
                this.speed = this.speed * 3
                this.winLineTime = this.winLineTime / 2
            }
            else {
                this.speed = this.speed / 3
                this.winLineTime = this.winLineTime * 2
            }
        }
    },
    mounted() {
        this.getScreen()
        window.addEventListener('resize', this.getScreen)
    },
    methods: {
        getScreen() {
            const slotMachine = document.getElementById('slotMachineOutBox')
            const lineBet = document.getElementById('lineBet')
            const slotBet = document.getElementById('slotBet')
            const slotButton = document.getElementById('slotButton')
            const screenWidth = window.innerWidth - 5
            const screenHeight = window.innerHeight - 5
            
            if (screenWidth > screenHeight * 3 / 2) {
                slotMachine.style.width = screenHeight * 3 / 2 + 'px'
                slotMachine.style.height = screenHeight + 'px'
                lineBet.style.fontSize = '10vh'
                slotBet.style.fontSize = '6vh'
                slotButton.style.fontSize = '2.5vh'
            } else {
                slotMachine.style.width = screenWidth + 'px'
                slotMachine.style.height = screenWidth * 2 / 3 + 'px'
                lineBet.style.fontSize = '8vw'
                slotBet.style.fontSize = '4vw'
                slotButton.style.fontSize = '2vw'
            }

            if (screenWidth <= screenHeight) this.isScreen = true
            else this.isScreen = false
        },

        twoDigits(val) {
            if (val < 10) return "0" + val;
            return val;
        },

        reset() {
            Object.assign(this.$data, this.$options.data());
        },

        start() {
            const today = new Date()
            const min = 10
            const max = 30
            let momentum = Math.floor(Math.random() * (max - min + 1) + min);
            let maxTurns = []

            this.onload = !this.onload
            this.currentWin = 0
            this.currentID++
            this.currentDate = today.getFullYear() + '-' + this.twoDigits(today.getMonth() + 1) + '-' + this.twoDigits(today.getDate())
            this.currentTime = this.twoDigits(today.getHours()) + ":" + this.twoDigits(today.getMinutes()) + ":" + this.twoDigits(today.getSeconds())
            this.totalBet = this.totalBet - this.bet * this.double

            for (let i = 0; i < 3; i++) {
                const delayTurns = Math.floor(Math.random() * min + 1);
                if (i === 0) maxTurns.push(momentum)
                else {
                    momentum += delayTurns
                    maxTurns.push(momentum)
                }
            }
            this.$refs.reel1.run(maxTurns[0])
            this.$refs.reel2.run(maxTurns[1])
            this.$refs.reel3.run(maxTurns[2])
        },

        reelStopped(data) {
            const reelTotal = document.querySelectorAll('.reel').length
            this.resultData.push(data)
            if (this.resultData.length == reelTotal) {
                this.checkResult(this.resultData)
            }
        },

        checkResult(result) {
            const doubleBet = this.bet * this.double    //倍率下注額
            let resultData = []
            this.currentReel = [result[0][0].name, result[1][0].name, result[2][0].name, result[0][1].name, result[1][1].name, result[2][1].name, result[0][2].name, result[1][2].name, result[2][2].name]
            this.reelWinData.forEach((data, index) => {
                const r1 = result[0][data.tile[0]]
                const r2 = result[1][data.tile[1]]
                const r3 = result[2][data.tile[2]]

                const tile1Name = r1.name
                const tile2Name = r2.name
                const tile3Name = r3.name
                const lineBet = doubleBet * data.bet
                let tailBet = 0

                if (tile1Name == tile2Name && tile2Name == tile3Name) tailBet = doubleBet * r2.bonus
                if (tile2Name == 'scatter' && tile3Name == 'scatter' && tile1Name != 'seven') tailBet = doubleBet * r1.bonus / 4
                if (tile1Name == 'scatter' && tile3Name == 'scatter' && tile2Name != 'seven') tailBet = doubleBet * r2.bonus / 4
                if (tile1Name == 'scatter' && tile2Name == 'scatter' && tile3Name != 'seven') tailBet = doubleBet * r3.bonus / 4
                if (tile2Name == 'scatter' && tile1Name == tile3Name) tailBet = doubleBet * r1.bonus / 2
                if (tile1Name == 'scatter' && tile2Name == tile3Name) tailBet = doubleBet * r2.bonus / 2
                if (tile3Name == 'scatter' && tile1Name == tile2Name) tailBet = doubleBet * r2.bonus / 2

                if (tailBet > 0) {
                    resultData.push({
                        class: data.class,
                        winBet: lineBet + tailBet
                    })
                    this.currentDetails.push({
                        tail: [tile1Name, tile2Name, tile3Name],
                        winBet: lineBet + tailBet
                    })
                }
            })

            if (resultData.length > 0) {
                for (let i = 0; i < resultData.length; i++) {
                    setTimeout(() => {
                        this.animate(resultData[i].class, resultData[i].winBet, (i + 1) == resultData.length)
                        this.totalBet += resultData[i].winBet
                        this.currentWin += resultData[i].winBet
                    }, 1000 * this.winLineTime * i)
                }
            }
            else this.end()
        },

        end() {
            this.recordData.push({
                id: 'slot777-' + this.currentID,
                date: this.currentDate,
                time: this.currentTime,
                bet: this.bet,
                double: this.double,
                winBet: this.currentWin,
                winLoss: this.currentWin < 0 ? false : true,
                details: {
                    reel: this.currentReel,
                    win: this.currentDetails
                },
            })
            this.resultData.length = 0
            this.onload = false
            if (!this.onload && this.onRepeat) this.start()
        },

        animate(className, winBet, boolean) {
            const slotMachineBox = document.getElementById('slotReels')
            slotMachineBox.classList.add(className)
            this.$refs.winline.showLine(className, winBet)
            setTimeout(() => {
                slotMachineBox.classList.remove(className)
                this.$refs.winline.hideLine(className, boolean)
                if (boolean) this.end()
            }, 1000 * this.winLineTime)
        }
    }
})

Vue.component('slot-reel', {
    props: ['value', 'maxSpeed'],
    data() {
        return {
            reelTileTop: 0,
            reelTileIndex: 0,
            reelTileData: [],
            reelSourceData: [
                {
                    name: 'seven',
                    image: 'img/seven.png',
                    bonus: 64
                },
                {
                    name: 'scatter',
                    image: 'img/scatter.png',
                    bonus: 16
                },
                {
                    name: 'cherry',
                    image: 'img/cherry.png',
                    bonus: 8
                },
                {
                    name: 'grapes',
                    image: 'img/grapes.png',
                    bonus: 8
                },
                {
                    name: 'watermelon',
                    image: 'img/watermelon.png',
                    bonus: 4
                },
                {
                    name: 'plum',
                    image: 'img/plum.png',
                    bonus: 4
                },
                {
                    name: 'lemon',
                    image: 'img/lemon.png',
                    bonus: 1
                },
                {
                    name: 'orange',
                    image: 'img/orange.png',
                    bonus: 1
                },

            ],
        }
    },
    beforeMount() {
        let reels = []
        this.reelSourceData.forEach((data, index) => {
            let times = parseInt((index + 2) / 2)
            while (times > 0) {
                reels.push(data)
                times--
            }
        })

        function shuffle(array) {
            let reelTileIndex = array.length, currentIndex
            while (reelTileIndex > 0) {
                currentIndex = Math.floor(Math.random() * reelTileIndex);
                reelTileIndex--
                [array[reelTileIndex], array[currentIndex]] = [array[currentIndex], array[reelTileIndex]]
            }
            return array
        }

        this.reelTileData = shuffle(reels)
        this.reelTileIndex = this.reelTileData.length - 1
    },
    methods: {
        getTileIndex(num) {
            const maxLength = this.reelTileData.length
            if (num >= maxLength) num -= maxLength
            if (num < 0) num += maxLength
            return num
        },
        run(maxTurns) {
            const reelTileHeight = document.getElementById('slotReels').clientHeight / 3
            let turns = 0, speed = 0
            setTimeout(() => {
                const runReel = setInterval(() => {
                    if (turns == maxTurns - 1 && speed > 5 && this.reelTileTop < reelTileHeight) {
                        speed--
                        this.reelTileTop += speed
                    } else if ((this.reelTileTop + speed + 1) < reelTileHeight) {
                        speed = speed < this.maxSpeed ? speed + 1 : this.maxSpeed
                        this.reelTileTop += speed
                    } else {
                        this.reelTileTop = 0
                        turns++
                        if (this.reelTileIndex <= 0) this.reelTileIndex = this.reelTileData.length - 1
                        else this.reelTileIndex--
                    }
                    if (turns == maxTurns) {
                        clearInterval(runReel)
                        let resultData = []
                        resultData.push(this.reelTileData[this.getTileIndex(this.reelTileIndex - 1)])
                        resultData.push(this.reelTileData[this.getTileIndex(this.reelTileIndex)])
                        resultData.push(this.reelTileData[this.getTileIndex(this.reelTileIndex + 1)])
                        this.$emit('stopped', resultData)
                        return
                    }
                }, 1)
            }, 200 * this.value)
        }
    },
    template: `<div :style="'top:' + reelTileTop + 'px'" class="reel relative w-1/3">
        <img class="reel-image mx-auto" :src="reelTileData[getTileIndex(reelTileIndex - 2)].image">
        <img :id="'tile' + value" class="reel-image mx-auto" :src="reelTileData[getTileIndex(reelTileIndex - 1)].image">
        <img :id="'tile' + (value + 3)" class="reel-image mx-auto" :src="reelTileData[getTileIndex(reelTileIndex)].image">
        <img :id="'tile' + (value + 6)" class="reel-image mx-auto" :src="reelTileData[getTileIndex(reelTileIndex + 1)].image">
        <img class="reel-image mx-auto" :src="reelTileData[getTileIndex(reelTileIndex + 2)].image">
    </div>`
})

Vue.component('slot-line', {
    data() {
        return {
            line123: false,
            line456: false,
            line789: false,
            line159: false,
            line357: false,
            lineTop: 'top-1/3',
            lineBet: 0
        }
    },
    watch: {
        line123() {
            if (this.line123) this.lineTop = 'top-0'
            else this.lineTop = 'top-1/3'
        },
        line789() {
            if (this.line789) this.lineTop = 'bottom-0'
            else this.lineTop = 'top-1/3'
        },
    },
    methods: {
        showLine(className, winBet) {
            this[className] = true
            this.lineBet = winBet
        },
        hideLine(className, boolean) {
            this[className] = false
            if (boolean) this.lineBet = 0
        }
    },
    template: `<div class="absolute inset-0">
        <svg v-if="line123" xmlns="http://www.w3.org/2000/svg" style="z-index: -1;" class="absolute top-0 left-0 w-full h-1/3" viewBox="0 0 220 50" fill="none" stroke="#fff" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M0 25 H220" />
        </svg>
        <svg v-if="line456" xmlns="http://www.w3.org/2000/svg" style="z-index: -1;" class="absolute top-1/3 left-0 w-full h-1/3" viewBox="0 0 220 50" fill="none" stroke="#fff" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M0 25 H220" />
        </svg>
        <svg v-if="line789" xmlns="http://www.w3.org/2000/svg" style="z-index: -1;" class="absolute bottom-0 left-0 w-full h-1/3" viewBox="0 0 220 50" fill="none" stroke="#fff" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M0 25 H220" />
        </svg>
        <svg v-if="line159" xmlns="http://www.w3.org/2000/svg" style="z-index: -1;" class="absolute top-0 left-0 w-full h-full" viewBox="0 0 220 150" fill="none" stroke="#fff" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M0 25 H35 L185 125 H220" />
        </svg>
        <svg v-if="line357" xmlns="http://www.w3.org/2000/svg" style="z-index: -1;" class="absolute top-0 left-0 w-full h-full" viewBox="0 0 220 150" fill="none" stroke="#fff" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M0 125 H35 L185 25 H220" />
        </svg>
        <p v-show="lineBet > 0" id="lineBet" class="absolute left-0 m-0 p-0 w-full h-1/3 flex justify-center items-center font-bold" :class="lineTop">{{lineBet}}</p>
    </div>`
})

app.$mount('#app');