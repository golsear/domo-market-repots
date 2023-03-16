const { createApp } = Vue
const emitter = mitt()
const app = createApp()
app.use(antd)
// console.log(dayjs)
const domo = window.domo
const datasets = window.datasets

app.config.globalProperties.emitter = emitter

app.component('Selectors', {
  template: `<div>
							<slot 
								:startYear="startYear"
								:endYear="endYear"
								:handleStartYear="handleStartYear"
								:handleEndYear="handleEndYear"
								:markets="markets"
								:firstMarket="firstMarket"
								:secondMarket="secondMarket"
								:handleChangeFirstMarket="handleChangeFirstMarket"
								:handleChangeSecondMarket="handleChangeSecondMarket"
								:disabledDate="disabledDate">
              </slot>
						</div>`,
  props: [],
  data () {
    return { 
      startYear: '',
      endYear: '',
      markets: [
        { value: 'Mexico', label: 'Mexico' },
        { value: 'Global', label: 'Global' }
      ],
      firstMarket: undefined,
      secondMarket: undefined,
      allowedYears: ['2021', '2022', '2023']
    }
  },
  methods: {
    sendMessage() {
				console.log('Send message')
      	// window.postMessage(JSON.stringify("Post message"), "*")
			},
    handleStartYear (date, dateString) {
    	console.log('handleStartYear', date, dateString)
      this.sendMessage()
    },
    handleEndYear (date, dateString) {
    	console.log('handleEndYear', date, dateString)
    },
    handleChangeFirstMarket (market) {
    	console.log('handleChangeFirstMarket', market)
      this.firstMarket = market
    },
    handleChangeSecondMarket (market) {
    	console.log('handleChangeSecondMarket', market)
      this.secondMarket = market
    },
    disabledDate (current) {
    	const currentYear =  current.format('YYYY')
      return !this.allowedYears.includes(currentYear)
    }
  }
})

app.mount('#app')