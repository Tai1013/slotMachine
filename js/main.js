const app = new Vue({
    data() {
        return {
            bet: 10,
            totalBet: 500,
            double: 1,

            onload: false,
            resultData: [],
            onSpeedUp: false,
            speed: 15,
            reelWinData: [
                {
                    tile: [1, 1, 1],
                    bet: 10,
                    class: 'line456'
                },
                {
                    tile: [0, 0, 0],
                    bet: 5,
                    class: 'line123'
                },
                {
                    tile: [2, 2, 2],
                    bet: 5,
                    class: 'line789'
                },
                {
                    tile: [0, 1, 2],
                    bet: 1,
                    class: 'line159'
                },
                {
                    tile: [2, 1, 0],
                    bet: 1,
                    class: 'line357'
                },
            ]
        }
    },
    watch: {
        onSpeedUp() {
            if (this.onSpeedUp) this.speed = this.speed * 2
            else this.speed = this.speed / 2
        }
    },
    methods: {
        reset() {
            this.resultData.length = 0
            this.onload = false
        },

        start() {
            const min = 10
            const max = 30
            let momentum = Math.floor(Math.random() * (max - min + 1) + min);
            let maxTurns = []

            this.onload = !this.onload

            for (let i = 0; i < 3; i++) {
                const delayTurns = Math.floor(Math.random() * min + 1);
                if (i === 0) maxTurns.push(momentum)
                else {
                    momentum += delayTurns
                    maxTurns.push(momentum)
                }
            }
            this.$refs.reel1.run(maxTurns[0], this.onSpeedUp)
            this.$refs.reel2.run(maxTurns[1], this.onSpeedUp)
            this.$refs.reel3.run(maxTurns[2], this.onSpeedUp)
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
            let winBet = 0
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
                if (tile2Name == 'scatter' && tile3Name == 'scatter' && tile1Name != 'seven') tailBet = doubleBet * r1.bonus
                if (tile1Name == 'scatter' && tile3Name == 'scatter' && tile2Name != 'seven') tailBet = doubleBet * r2.bonus
                if (tile1Name == 'scatter' && tile2Name == 'scatter' && tile3Name != 'seven') tailBet = doubleBet * r3.bonus
                if (tile2Name == 'scatter' && tile1Name == tile3Name) tailBet = doubleBet * r1.bonus
                if (tile1Name == 'scatter' && tile2Name == tile3Name) tailBet = doubleBet * r2.bonus
                if (tile3Name == 'scatter' && tile1Name == tile2Name) tailBet = doubleBet * r2.bonus

                if (tailBet > 0) {
                    console.log('tailBet:' + tailBet + ' 水果倍率:' + tailBet / doubleBet)
                    console.log('lineBet:' + lineBet + ' 線倍率:' + data.bet)
                    this.animate(data.class)
                    winBet += (lineBet + tailBet)
                }
            })

            if (winBet == 0) this.end()
        },

        end() {
            this.resultData.length = 0
            this.onload = false
        },

        animate(className) {
            const slotMachineBox = document.querySelector('.slotMachine-reels')
            slotMachineBox.classList.add(className)
            this.$refs.winline.showLine(className)
            setTimeout(() => {
                slotMachineBox.classList.remove(className)
                this.$refs.winline.hideLine()
                this.end()
            }, 3000)
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
    mounted() {
    },
    methods: {
        getTileIndex(num) {
            const maxLength = this.reelTileData.length
            if (num >= maxLength) num -= maxLength
            if (num < 0) num += maxLength
            return num
        },
        run(maxTurns, onSpeedUp) {
            const reelTileHeight = document.querySelector('.slotMachine-reels').clientHeight / 3
            let turns = 0, speed = 0
            setTimeout(() => {
                const runReel = setInterval(() => {
                    if ((this.reelTileTop + speed + 0.1) < reelTileHeight) {
                        speed = speed < this.maxSpeed ? speed + 0.1 : this.maxSpeed
                        if (onSpeedUp) return this.reelTileTop += this.maxSpeed
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
    template: `<div :style="'margin-top:' + reelTileTop + 'px'" class="reel w-1/3">
        <img class="reel-image mx-auto" :src="reelTileData[getTileIndex(reelTileIndex - 2)].image">
        <img :id="'tile' + value" class="reel-image mx-auto" :src="reelTileData[getTileIndex(reelTileIndex - 1)].image">
        <img :id="'tile' + (value + 3)" class="reel-image mx-auto" :src="reelTileData[getTileIndex(reelTileIndex)].image">
        <img :id="'tile' + (value + 6)" class="reel-image mx-auto" :src="reelTileData[getTileIndex(reelTileIndex + 1)].image">
        <img class="reel-image mx-auto" :src="reelTileData[getTileIndex(reelTileIndex + 2)].image">
    </div>`
})

Vue.component('slot-line', {
    props: [],
    data() {
        return {
            line123: false,
            line456: false,
            line789: false,
            line159: false,
            line357: false,
        }
    },
    beforeMount() {
    },
    mounted() {
    },
    methods: {
        showLine(className) {
            this[className] = !this[className]
        },
        hideLine() {
            Object.assign(this.$data, this.$options.data());
        }
    },
    template: `<div style="z-index: -1;" class="absolute inset-0">
        <svg v-if="line123" xmlns="http://www.w3.org/2000/svg" class="absolute top-0 left-0 w-full h-1/3" viewBox="0 0 220 50" fill="none" stroke="#fff" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M0 25 H220" />
        </svg>
        <svg v-if="line456" xmlns="http://www.w3.org/2000/svg" class="absolute top-1/3 left-0 w-full h-1/3" viewBox="0 0 220 50" fill="none" stroke="#fff" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M0 25 H220" />
        </svg>
        <svg v-if="line789" xmlns="http://www.w3.org/2000/svg" class="absolute bottom-0 left-0 w-full h-1/3" viewBox="0 0 220 50" fill="none" stroke="#fff" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M0 25 H220" />
        </svg>
        <svg v-if="line159" xmlns="http://www.w3.org/2000/svg" class="absolute top-0 left-0 w-full h-full" viewBox="0 0 220 150" fill="none" stroke="#fff" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M0 25 H35 L185 125 H220" />
        </svg>
        <svg v-if="line357" xmlns="http://www.w3.org/2000/svg" class="absolute top-0 left-0 w-full h-full" viewBox="0 0 220 150" fill="none" stroke="#fff" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M0 125 H35 L185 25 H220" />
        </svg>
    </div>`
})

app.$mount('#app');