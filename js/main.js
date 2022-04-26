
const app = new Vue({
    data() {
        return {
            onload: false,
            reelTop: 0,
            reelSpeed: 10,
            reelTurns: 20,

            probabilityTotal: 50,
            probability: [],
            machineData: [
                {
                    name: 'seven',
                    image: 'img/seven.png',
                    sum: 2
                },
                {
                    name: 'cherry',
                    image: 'img/cherry.png',
                    sum: 3
                },
                {
                    name: 'grapes',
                    image: 'img/grapes.png',
                    sum: 5
                },
                {
                    name: 'lemon',
                    image: 'img/lemon.png',
                    sum: 5
                },
                {
                    name: 'orange',
                    image: 'img/orange.png',
                    sum: 5
                },
                {
                    name: 'plum',
                    image: 'img/plum.png',
                    sum: 10
                },
                {
                    name: 'scatter',
                    image: 'img/scatter.png',
                    sum: 10
                },
                {
                    name: 'watermelon',
                    image: 'img/watermelon.png',
                    sum: 10
                },
            ],
            resultData: [],

            reelData1: {
                id: 1,
                top: 0,
                image: [],
                name: []
            },
            reelData2: {
                id: 2,
                top: 0,
                image: [],
                name: []
            },
            reelData3: {
                id: 3,
                top: 0,
                image: [],
                name: []
            },
        }
    },
    created() {
        const reelHeight = document.querySelector('.slotMachine-reels').clientWidth / 3
        this.reelTop = reelHeight

        //機率
        for (let i = 0; i < this.machineData.length; i++) {
            for (let j = 0; j < this.machineData[i].sum; j++) {
                this.probability.push(i)
            }
        }
        this.initial(this.reelData1)
        this.initial(this.reelData2)
        this.initial(this.reelData3)
    },
    mounted() {

    },
    methods: {
        getProbability() {
            const probabilityIndex = Math.floor(Math.random() * 50);
            const reelIndex = this.probability[probabilityIndex]
            return reelIndex
        },

        initial(reel) {
            for (let i = 0; i < 5; i++) {
                reel.image.push(this.machineData[this.getProbability()].image)
                reel.name.push(this.machineData[this.getProbability()].name)
            }
        },

        reset() {
            
        },

        start() {
            this.onload = !this.onload
            this.resultData = this.$options.data().resultData
            this.run(this.reelData1)
            this.run(this.reelData2, 200)
            this.run(this.reelData3, 400)
        },

        run(reel, delay = 0) {
            setTimeout(() => {
                let turns = 0, speed = 0
                const startReel = setInterval(() => {
                    if (reel.top < this.reelTop) {
                        if (speed < this.reelSpeed) speed += 0.05
                        else speed = this.reelSpeed
                        reel.top += speed
                    }
                    else {
                        reel.top = 0
                        if (turns == this.reelTurns) {
                            clearInterval(startReel)
                            this.resultData[reel.id - 1] = reel.name
                            this.end(reel.name)
                            return
                        }
                        reel.image.pop()
                        reel.image.unshift(this.machineData[this.getProbability()].image)
                        turns++
                    }
                }, 1)
            }, delay)
        },

        end(result) {
            const reelTotal = document.querySelectorAll('.reel').length
            if (this.resultData.length == reelTotal) {
                this.onload = !this.onload
            }
        }
    }
})

app.$mount('#app');