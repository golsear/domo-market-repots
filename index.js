
const { createApp } = Vue
const emitter = mitt()
const app = createApp({
  			components: { Datepicker: VueDatePicker },
    	})



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

app.config.globalProperties.emitter = emitter

app.component('MarketDashboard', {
  template: `<div><slot :data="dataGroupByCategory" :updateData="updateData" :handleDate="handleDate" :date="date"></slot></div>`,
  props: [],
  data () {
    return { 
      data: [],
      categoryDictionary,
      date: ''
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
        console.log('res', data)
      	console.log('data', this.data)
      	console.log('dataGroupByCategory', this.dataGroupByCategory);
      })
  },
  methods: {
    handleDate (date) {
    	console.log('date', date)
      this.date = date
    },
    updateData () {
    	domo
      .get(query)
      .then((data) => {
    		this.data = data
      })
    },
  	groupByProperty (arr, property) {
    	return arr.reduce((memo, x) => {
    		if (!memo[x[property]]) { 
          memo[x[property]] = [] 
        }
    		memo[x[property]].push(x);
    		return memo;
  		}, {});
    },
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
  template: `<div><slot :data="data" :d="ddd"></slot></div>`,
  props: ['data'],
  computed: {
  	ddd () {
      const d = this.data.kpiData
      console.log('d', d)
    	return d
    }
  },
  mounted() {
  	// console.log('mounted KpiRow', this.data)
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