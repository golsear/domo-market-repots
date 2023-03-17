const { createApp } = Vue
const app = createApp()
app.use(antd)
const domo = window.domo
const datasets = window.datasets

//domo.onFiltersUpdate(console.log)

domo.onFiltersUpdate((value) => {
	// console.log('Filters', value)
})

// console.log(dayjs)

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
      startYear: dayjs('2021'),
      endYear: dayjs('2022'),
      markets: [
        { value: 'Mexico', label: 'Mexico' },
        { value: 'Global', label: 'Global' }
      ],
      firstMarket: 'Global',
      secondMarket: 'Mexico',
      allowedYears: ['2021', '2022', '2023']
    }
  },
  mounted () {
  	this.updateFilters()
  },
  methods: {
    sendMessage() {
				console.log('Send message')
      	// window.postMessage(JSON.stringify("Post message"), "*")
			},
    handleStartYear (date, dateString) {
    	console.log('handleStartYear', date, dateString)
      this.startYear = date
      this.updateFilters()
    },
    handleEndYear (date, dateString) {
    	console.log('handleEndYear', date, dateString)
      this.endYear = date
      this.updateFilters()
    },
    handleChangeFirstMarket (market) {
    	console.log('handleChangeFirstMarket', market)
      this.firstMarket = market
      this.updateFilters()
    },
    handleChangeSecondMarket (market) {
    	console.log('handleChangeSecondMarket', market)
      this.secondMarket = market
      this.updateFilters()
    },
    updateFilters () {
      const yearFilterValues = []
      const marketFilterValues = []
      
      if (this.startYear) {
          yearFilterValues.push(dayjs(this.startYear).format('YYYY'))
      }
      
      if (this.endYear) {
          yearFilterValues.push(dayjs(this.endYear).format('YYYY'))
      }
      
      if (this.firstMarket) {
          marketFilterValues.push(this.firstMarket)
      }
      
      if (this.secondMarket) {
          marketFilterValues.push(this.secondMarket)
      }
      
      domo.filterContainer([
        {
          dataSourceId: "f95f720f-fb3d-4f4c-bffd-7bd39e8ab12c",
          column: 'Year',
          operand: 'IN',
          label: 'Year',
          values: yearFilterValues,
          dataType: 'STRING'
        },
        {
          dataSourceId: "f95f720f-fb3d-4f4c-bffd-7bd39e8ab12c",
          column: 'Market',
          operand: 'IN',
          label: 'Market',
          values: marketFilterValues,
          dataType: 'STRING'
        }
      ])
      
      console.log('Update filters')
		},
    disabledDate (current) {
    	const currentYear =  current.format('YYYY')
      return !this.allowedYears.includes(currentYear)
    }
  }
})

app.mount('#app')