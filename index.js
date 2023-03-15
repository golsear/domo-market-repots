
const { createApp } = Vue
const emitter = mitt()
const app = createApp()
app.use(antd)
console.log(dayjs)

console.log(window)

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
								:changeYear="changeYear">
							</slot>
						</div>`,
  props: [],
  data () {
    return { 
      data: [],
      categoryDictionary,
      startYear: '',
      endYear: ''
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
  },
  mounted() {
  	domo
      .get(query)
      .then((data) => {
    		this.data = data
        console.log('data', this.data)
      	console.log('dataGroupByCategory', this.dataGroupByCategory);
      })
  },
  methods: {
    changeYear (date, dateString) {
    	console.log('changeYear', date, dateString)
    },
    updateData () {
    	domo
      .get(query)
      .then((data) => {
    		this.data = data
      })
    },
    groupByProperty 
  	/* groupByProperty (arr, property) {
    	return arr.reduce((memo, x) => {
    		if (!memo[x[property]]) { 
          memo[x[property]] = [] 
        }
    		memo[x[property]].push(x);
    		return memo;
  		}, {});
    },*/
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
  computed: {
  	/*dataByMarket () {
      const groupByMarket = this.data.kpiData ? this.groupByProperty(this.data.kpiData, 'Market') : []
      const dataByMarket = []
      
      for (const [key, value] of Object.entries(groupByMarket)) {
  			console.log(key, value)
        dataByMarket.push({
        	category: key,
          data: value.slice(-2)
        })
			}
      
      console.log('groupMyMarket', dataByMarket)
    	return groupByMarket
    }*/
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


app.mount('#app')
 /*createApp({
    data() {
      return {
        message: 'Hello Vue!'
      }
    }
  }).mount('#app')*/