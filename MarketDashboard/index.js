
const { createApp } = Vue
const emitter = mitt()
const app = createApp()
app.use(antd)
console.log(dayjs)

const domo = window.domo
const datasets = window.datasets
const fields = [
  'Market', 
  'KPI', 
  'Description',
  'Date',
	'Value'
]
/*const orderby = [
  'Market', 
  'KPI',
  'Description'
]*/

// const query = `/data/v1/${datasets[0]}?fields=${fields.join()}&groupby=${groupby.join()}`
const query = `/data/v1/${datasets[0]}?fields=${fields.join()}&filter=Value!=''`

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
								:updateData="updateData" 
								:startYear="startYear"
								:endYear="endYear"
								:firstMarket="firstMarket"
								:secondMarket="secondMarket"
								:isShowGrid="isShowGrid"
								:postMessage="postMessage">
							</slot>
						</div>`,
  props: [],
  data () {
    return { 
      data: [],
      categoryDictionary,
      startYear: '',
      endYear: '',
      firstMarket: '',
      secondMarket: '',
      postMessage: ''
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
      return true
    	// return this.startYear && this.endYear && this.firstMarket && this.secondMarket
    }
  },
  created () {
    this.emitter.on('update-selector', (event) => {
      // console.log('update-selector', event)
      this[event.selector] = event.value
    })
  },
  mounted() {
  	domo
      .get(query)
      .then((data) => {
    		this.data = data
        console.log('data', this.data)
      	console.log('dataGroupByCategory', this.dataGroupByCategory);
      })
    
    	// window.removeEventListener("message", this.iframeEvent, false)
      // window.addEventListener("message", this.iframeEvent, false)
  },
  methods: {
    iframeEvent(event) {
      console.log('iframeEvent')
				//Verify App Domain
				// if(event.origin !== 'https://www.xyz.com') return;
				// console.log('data received:  ' + event.data);
      this.postMessage = 'Post message'
    },
    updateData () {
    	domo
      .get(query)
      .then((data) => {
    		this.data = data
      })
    },
    groupByProperty 
  }
})

app.component('KpiTable', {
  template: `<div><slot :data="data"></slot></div>`,
  props: ['data'],
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
      console.log('watch:data', data)
      console.log('dataByMarket', dataByMarket)
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
      this.emitter.emit('update-selector', {
        selector: 'startYear',
      	value: dateString
      })
      this.sendMessage()
    },
    handleEndYear (date, dateString) {
    	console.log('handleEndYear', date, dateString)
      this.emitter.emit('update-selector', {
        selector: 'endYear',
      	value: dateString
      })
    },
    handleChangeFirstMarket (market) {
    	console.log('handleChangeFirstMarket', market)
      this.firstMarket = market
      this.emitter.emit('update-selector', {
        selector: 'firstMarket',
      	value: market
      })
    },
    handleChangeSecondMarket (market) {
    	console.log('handleChangeSecondMarket', market)
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
