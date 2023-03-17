
const { createApp } = Vue
const emitter = mitt()
const app = createApp()
app.use(antd)
// console.log(dayjs)

const domo = window.domo
const datasets = window.datasets
const fields = [
  'Market', 
  'KPI', 
  'Description',
  'Year',
  'Date',
	'Value'
]

const filter = [
	"Value != ''",
  "Year in ['2021', '2022']",
  "Market in ['Argentina', 'Mexico']"
]
/*const orderby = [
  'Market', 
  'KPI',
  'Description'
]*/

// const query = `/data/v1/${datasets[0]}?fields=${fields.join()}&groupby=${groupby.join()}`
const query = `/data/v1/${datasets[0]}?fields=${fields.join()}&filter=Value!=''`
// const query = `/data/v1/${datasets[0]}?fields=${fields.join()}&filter=${filter.join()}`

domo.onFiltersUpdate((filters) => {
  console.log('onFiltersUpdate')
	emitter.emit('update-data', {
     filters
  })
})

const mockFilters = [
    {
        column: 'Market',
        operand: 'IN',
        values: [
            'Global',
            'Mexico'
        ],
        dataType: 'string',
        label: 'Market',
        sourceCardURN: 1349532511,
        key: 'Market:',
        dataSourceId: 'f95f720f-fb3d-4f4c-bffd-7bd39e8ab12c'
    },
    {
        column: 'Year',
        operand: 'IN',
        values: [
            '2020',
            '2021'
        ],
        dataType: 'numeric',
        label: 'Year',
        sourceCardURN: 1349532511,
        key: 'Year:',
        dataSourceId: 'f95f720f-fb3d-4f4c-bffd-7bd39e8ab12c'
    }
]


const categoryDictionary = {
  "Brand strength": [
    "Brand awareness (Watch category)",
    "Brand familiarity",
    "Brand love",
    "Association with achievement",
    "Net promoter score",
    "Earned Coverage Sentiment score"
  ],
  "CSR & Planet": [
    "Association to CSR & Planet (Average)",
    "Perpetual Planet Survey",
    "Reptrak Score Citizenship score",
    "Rolex.org traffic"
  ],
  "Digital strength": [
    "Rolex.com traffic (all sources)",
    "Organic search",
    "Social media followers"
  ],
  "Retailer quality": [
    "Visits to Rolex section of Retailer website",
    "Retailer traffic from organic search",
    "Retailer social media followers",
    "Store image deployment"
  ],
  "Sponsoring": [
    "Number of testimonees",
    "Number of events",
    "Association with sports",
    "Association with arts",
    "Net sponsorship value"
  ]
}

const groupByProperty = (arr, property) => {
    	return arr.reduce((memo, x) => {
    		if (!memo[x[property]]) { 
          memo[x[property]] = [] 
        }
    		memo[x[property]].push(x);
    		return memo;
  		}, {});
    }

app.config.globalProperties.emitter = emitter

app.component('MarketDashboard', {
  template: `<div>
							<slot 
								:data="dataGroupByCategory" 
								:firstYear="firstYear"
								:secondYear="secondYear"
								:firstMarket="firstMarket"
								:secondMarket="secondMarket"
								:isShowGrid="isShowGrid"
								:postMessage="postMessage"
								:isLoading="isLoading">
							</slot>
						</div>`,
  props: [],
  data () {
    return { 
      data: [],
      categoryDictionary,
      firstYear: '',
      secondYear: '',
      firstMarket: '',
      secondMarket: '',
      postMessage: '',
      isLoading: false
    }
  },
  computed: {
    dataGroupByCategory() {
      const groupedData = []
      const dataGroupByKPI = this.groupByProperty(this.data, 'KPI')
      
      // console.log('dataGroupByKPI', dataGroupByKPI)
      
      for (const [category, kpiCategories] of Object.entries(this.categoryDictionary)) {
        const kpis = []
        
        for (const kpiCategory of kpiCategories) {
          kpis.push({
          	kpiCategory,
            kpiData: dataGroupByKPI[kpiCategory]
          })
				}
        
        groupedData.push({
        	category,
          kpis
        })
      }
      
      return groupedData
    },
    isShowGrid () {
      // return true
    	return this.firstYear && 
             this.secondYear &&
        		 this.firstYear !== this.secondYear &&	
             this.firstMarket &&
             this.secondMarket &&
             this.firstMarket !== this.secondMarket
    },
    query () {
      const fields = [
        'Market', 
        'KPI', 
        'Description',
        'Year',
        'Date',
        'Value'
      ]

      const filter = [
        "Value != ''",
        `Year in ['${this.firstYear}', '${this.secondYear}']`,
        `Market in ['${this.firstMarket}', '${this.secondMarket}']`
      ]

			const query = `/data/v1/${datasets[0]}?fields=${fields.join()}&filter=${filter.join()}`
      
      return query
    }
  },
  created () {
    //console.log('created')
    /*this.emitter.on('update-selector', (event) => {
      this[event.selector] = event.value
      this.getData()
    })*/
    
    this.emitter.on('update-data', (event) => {
      this.updateData(event.filters)
    })
  },
  mounted () {
    /*this.emitter.emit('update-data', {
     filters: mockFilters
  	})*/
  },
  methods: {
    async getData () {
      try {
        this.isLoading = true 
        // const query = `/data/v1/${datasets[0]}?fields=${fields.join()}&filter=Value!=''`
        
        //if (!this.isShowGrid) {
        console.log('query', this.query)
        const data = await domo.get(this.query) 
        this.data = data 
        this.isLoading = false
        console.log('data', this.data)
      	console.log('dataGroupByCategory', this.dataGroupByCategory);    
        //}
      } catch (error) {
      	console.log(error)
        this.isLoading = false
      }
    },
    groupByProperty,
    updateData (filters) {
    	console.log('updateData:filters', filters)
      const marketFilter = filters.filter((filter) => filter.column === 'Market')[0]
      const yearFilter = filters.filter((filter) => filter.column === 'Year')[0]
      if (marketFilter && yearFilter) {
        const markets = marketFilter.values
        const years = yearFilter.values
        
        if (markets.length === 2 && years.length === 2) {
        	this.firstMarket = markets[0]
        	this.secondMarket = markets[1]
        	this.firstYear = years[0]
        	this.secondYear = years[1]
          this.$nextTick(() => this.getData())
        }
      }
    }
  }
})

app.component('KpiTable', {
  template: `<div>
							<slot 
								:data="data"
								:firstYear="firstYear"
								:secondYear="secondYear"
								:firstMarket="firstMarket"
								:secondMarket="secondMarket"
							>
							</slot>
						</div>`,
  props: [
    'data',
    'firstYear',
    'secondYear',
    'firstMarket',
    'secondMarket'
  ],
  mounted() {
  	// console.log('mounted KpiTable', this.data)
  }
})

app.component('KpiRow', {
  template: `<div>
							<slot :data="data" :dataByMarket="dataByMarket"> 
							</slot>
						</div>`,
  props: ['data'],
  data () {
    return { 
      dataByMarket: [],
    }
  },
  watch: {
  	data (data) {
    	const groupByMarket = data.kpiData ? this.groupByProperty(data.kpiData, 'Market') : []
      const dataByMarket = []
      
      for (const [category, data] of Object.entries(groupByMarket)) {
  			dataByMarket.push({
        	category,
          data: data.slice(-2)
        })
			}
      // console.log('watch:data', data)
      // console.log('dataByMarket', dataByMarket)
      console.log('groupByMarket', groupByMarket)
      this.dataByMarket = groupByMarket
    }
  },
  mounted() {
  	// console.log('mounted KpiRow', this.data)
  },
  methods: {
  	groupByProperty
  }
})

app.component('Selectors', {
  template: `<div>
							<slot 
								:firstYear="firstYear"
								:secondYear="secondYear"
								:handleFirstYear="handleFirstYear"
								:handleSecondYear="handleSecondYear"
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
      firstYear: '',
      secondYear: '',
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
				// console.log('Send message')
      	// window.postMessage(JSON.stringify("Post message"), "*")
			},
    handleFirstYear (date, dateString) {
    	// console.log('handleFirstYear', date, dateString)
      this.emitter.emit('update-selector', {
        selector: 'firstYear',
      	value: dateString
      })
    },
    handleSecondYear (date, dateString) {
    	// console.log('handleSecondYear', date, dateString)
      this.emitter.emit('update-selector', {
        selector: 'secondYear',
      	value: dateString
      })
    },
    handleChangeFirstMarket (market) {
    	// console.log('handleChangeFirstMarket', market)
      this.firstMarket = market
      this.emitter.emit('update-selector', {
        selector: 'firstMarket',
      	value: market
      })
    },
    handleChangeSecondMarket (market) {
    	// console.log('handleChangeSecondMarket', market)
      this.secondMarket = market
      this.emitter.emit('update-selector', {
        selector: 'secondMarket',
      	value: market
      })
    },
    disabledDate (current) {
    	const currentYear =  current.format('YYYY')
      return !this.allowedYears.includes(currentYear)
    }
  }
})

app.mount('#app')
