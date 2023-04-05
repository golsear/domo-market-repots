const { createApp } = Vue
const app = createApp()
app.use(antd)
const domo = window.domo
const datasets = window.datasets

//domo.onFiltersUpdate(console.log)

domo.onFiltersUpdate((value) => {
	// console.log('Filters', value)
})

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
      markets: [
        { value: 'Global', label: 'Global' },
        { value: 'Australia', label: 'Australia' },
        { value: 'Brazil', label: 'Brazil' },
        { value: 'Canada', label: 'Canada' },
        { value: 'China', label: 'China' },
        { value: 'France', label: 'France' },
        { value: 'Germany', label: 'Germany' },
        { value: 'Hong Kong', label: 'Hong Kong' },
        { value: 'India', label: 'India' },
        { value: 'Italy', label: 'Italy' },
        { value: 'Japan', label: 'Japan' },
        { value: 'Mexico', label: 'Mexico' },
        { value: 'South Korea', label: 'South Korea' },
        { value: 'Switzerland', label: 'Switzerland' },
        { value: 'United Kingdom', label: 'United Kingdom' },
        { value: 'United States', label: 'United States' },
      ],
      firstMarket: 'United Kingdom',
      secondMarket: 'United States',
      allowedYears: ['2019', '2020', '2021', '2022', '2023'],
      startYear: dayjs('2021'),
      endYear: dayjs('2022'),
    }
  },
  mounted () {
  	this.updateFilters()
  },
  methods: {
    handleStartYear (date, dateString) {
    	this.startYear = date
      this.updateFilters()
    },
    handleEndYear (date, dateString) {
    	this.endYear = date
      this.updateFilters()
    },
    handleChangeFirstMarket (market) {
    	this.firstMarket = market
      this.updateFilters()
    },
    handleChangeSecondMarket (market) {
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
    },
    disabledDate (current) {
    	const currentYear =  current.format('YYYY')
      return !this.allowedYears.includes(currentYear)
    }
  }
})

app.mount('#app')