const { createApp } = Vue
const emitter = mitt()
const app = createApp()
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
// const query = `/data/v1/${datasets[0]}?fields=${fields.join()}&filter=Value!=''`
const query = `/data/v1/${datasets[0]}?fields=${fields.join()}`
// const query = `/data/v1/${datasets[0]}?fields=${fields.join()}&filter=${filter.join()}`

domo.onFiltersUpdate((filters) => {
  // console.log('onFiltersUpdate')
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
        sourceCardURN: 474710820,
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
        sourceCardURN: 474710820,
        key: 'Year:',
        dataSourceId: 'f95f720f-fb3d-4f4c-bffd-7bd39e8ab12c'
    }
]

const mockDataByMarket = [
  {
    category: 'United Kingdom',
    data: [
      {
        Value: 0.28,
        Year: 2020
      },
      {
        Value: 0.41,
        Year: 2021
      }
    ]
  },
  {
    category: 'Argentina',
    data: [
      {
        Value: 0.21,
        Year: 2020
      },
      {
        Value: 0.59,
        Year: 2021
      }
    ]
  },
  {
    category: 'Mexico',
    data: [
      {
        Value: 0.33,
        Year: 2020
      },
      {
        Value: 0.37,
        Year: 2021
      }
    ]
  },
  {
    category: 'United States',
    data: [
      {
        Value: 0.45,
        Year: 2020
      },
      {
        Value: 0.28,
        Year: 2021
      }
    ]
  },
  {
    category: 'Global',
    data: [
      {
        Value: 0.48,
        Year: 2020
      },
      {
        Value: 0.24,
        Year: 2021
      }
    ]
  },
  {
    category: 'Mexico2',
    data: [
      {
        Value: 0.33,
        Year: 2020
      },
      {
        Value: 0.37,
        Year: 2021
      }
    ]
  },
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
   	
    memo[x[property]].push(x)
   	
    return memo
  }, {})
}

const round = (value) => {
   return Math.sign(value) * Math.round(Math.abs(value))
}

const mockupMode = false

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
      isLoading: false,
    }
  },
  computed: {
    dataGroupByCategory() {
      const groupedData = []
      const dataGroupByKPI = this.groupByProperty(this.data, 'KPI')
      
      console.log('dataGroupByKPI', dataGroupByKPI)
      
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
        //`Market in ['${this.firstMarket}', '${this.secondMarket}']`
      ]

			const query = `/data/v1/${datasets[0]}?fields=${fields.join()}&filter=${filter.join()}`
      
      return query
    }
  },
  created () {
    this.emitter.on('update-data', (event) => {
      this.updateData(event.filters)
    })
  },
  mounted () {
    if (mockupMode) {
    	this.emitter.emit('update-data', {
     		filters: mockFilters
  		})
    }
  },
  methods: {
    async getData () {
      try {
        this.setIsLoading(true)
        const data = await domo.get(this.query)
        this.setIsLoading(false)
        this.data = data 
        
        console.log('MarketDashboard: data', this.query, data)
      	console.log('dataGroupByCategory', this.dataGroupByCategory);    
      } catch (error) {
      	console.log(error)
        this.setIsLoading(false)
      }
    },
    setIsLoading (value) {
      const overflow = value ? 'hidden' : 'auto'
      this.isLoading = value
      document.body.style.overflow = overflow
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
  template: `<div class="kpi-table">
							<slot
								:data="data"
								:firstYear="firstYear"
								:secondYear="secondYear"
								:firstMarket="firstMarket"
								:secondMarket="secondMarket"
                :tableIndex="tableIndex"
								:firstKpiSum="firstKpiSumComputed"
								:secondKpiSum="secondKpiSumComputed"
                :firstKpiSumCss="firstKpiSumCssComputed"
                :secondKpiSumCss="secondKpiSumCssComputed">
							</slot>
						</div>`,
  props: [
    'data',
    'firstYear',
    'secondYear',
    'firstMarket',
    'secondMarket',
    'tableIndex',
    'firstKpiSum',
    'secondKpiSum'
  ],
  data () {
    return { 
      firstKpiSumValue: 0,
      secondKpiSumValue: 0,
    }
  },
  computed: {
    rows () {
    	return this.data.kpis.length
    },
    firstKpiSumComputed () {
    	return this.round(this.firstKpiSumValue / this.rows)
    },
    secondKpiSumComputed () {
    	return this.round(this.secondKpiSumValue / this.rows)
    },
    firstKpiSumCssComputed () {
      return this.getKpiSumCss('first')
    },
    secondKpiSumCssComputed () {
      return this.getKpiSumCss('second')
    },
  },
  created () {
    this.emitter.on(`'update-first-kpi-sum-${this.tableIndex}'`, (event) => {
      this.updateKpiSum('first', event.value) 
    })
    
    this.emitter.on(`'update-second-kpi-sum-${this.tableIndex}'`, (event) => {
      this.updateKpiSum('second', event.value)
    })
  },
  methods: {
  	updateKpiSum (key, value) {
    	this[`${key}KpiSumValue`] += value
    },
    getKpiSumCss (marketKey) {
      const kpiSum = this[`${marketKey}KpiSumValue`]
      
      return  Math.sign(kpiSum) === -1 ? 'poor' 
      : kpiSum <= 5 ? 'static' : 'good'
    },
    round
  }
})

app.component('KpiRow', {
  template: `<div>
							<slot 
								:tableIndex="tableIndex"
								:data="data" 
								:dataByMarket="dataByMarket"
								:firstYear="firstYear"
								:secondYear="secondYear"
								:firstMarket="firstMarket"
                :firstKpiChange="firstMarketKpiChange"
                :firstKpiChangeCss="firstMarketKpiChangeCss"  
								:description="kpiDescription"
								:secondMarket="secondMarket"
                :secondKpiChange="secondMarketKpiChange"
                :secondKpiChangeCss="secondMarketKpiChangeCss"
                :firstMarketData="firstMarketData"
                :secondMarketData="secondMarketData"
								:sparkLineData="sparkLineData"> 
							</slot>
						</div>`,
  props: [
    'data',
    'firstYear',
    'secondYear',
    'firstMarket',
    'secondMarket',
    'description',
    'firstKpiChange',
    'secondKpiChange',
    'tableIndex'
  ],
  data () {
    return { 
      dataByMarket: []
    }
  },
  computed: {
  	firstMarketData () {
      return this.getMarketData('first')
    },
    secondMarketData () {
    	return this.getMarketData('second')
    },
    kpiDescription () {
    	return this.dataByMarket.length 
        ? this.dataByMarket[0].data[0].Description : ''
    },
    firstMarketKpiChange () {
      return this.getMarketKpiChange('first')
    },
    firstMarketKpiChangeCss () {
      return this.getMarketKpiChangeCss('first')
    },
    secondMarketKpiChange () {
      return this.getMarketKpiChange('second')
    },
    secondMarketKpiChangeCss () {
      return this.getMarketKpiChangeCss('second')
    },
    sparkLineData () {
      if (mockupMode) {
          return this.mockSparkLineData
      }
      
      if (this.firstMarketData && 
          this.secondMarketData &&
          this.firstMarketData.data.length === 2 &&
          this.secondMarketData.data.length === 2) {
        let maxSelectedMarketsValue
        let minSelectedMarketsValue
        const firstMarketData = this.firstMarketData
        const secondMarketData = this.secondMarketData
        const firstValue = firstMarketData.data[1].Value;
				const secondValue = secondMarketData.data[1].Value;
        const dataByMarket = this.dataByMarket
        const dataByExcludedSelectedMarkets = dataByMarket.filter(obj => obj.category !== firstMarketData.category && obj.category !== secondMarketData.category)

        console.log('=== >>> ===')
        if (firstValue === secondValue) {
          maxSelectedMarketsValue = minSelectedMarketsValue = firstValue
        } else {
          if (firstValue > secondValue) {
            maxSelectedMarketsValue = firstValue
            minSelectedMarketsValue = secondValue
          } else {
            maxSelectedMarketsValue = secondValue
            minSelectedMarketsValue = firstValue
          }
        }

        const allValues = dataByMarket.map((obj) => {
      		return obj.data[1].Value
      	})
        const values = dataByExcludedSelectedMarkets.map((obj) => {
      		return obj.data[1].Value
      	})
        
        allValues.sort()
        values.sort()
        // maxSelectedMarketsValue = 0.5
        
        const closestMinMaxData = this.getClosestMaxMinMarketValues(dataByExcludedSelectedMarkets, maxSelectedMarketsValue, minSelectedMarketsValue)
        
        console.log('allValues', allValues)
        console.log('values', values)
        console.log('max value', Math.max(...allValues))
        console.log('minSelectedMarketsValue', minSelectedMarketsValue)
        console.log('maxSelectedMarketsValue', maxSelectedMarketsValue)
        console.log('closestMinMaxData', closestMinMaxData)
        console.log('=== <<< ===')
      	return { 
          closestMinMaxData,
          maxValue: Math.max(...allValues)
        }
      }            
    	return null
    },
    // Mockup data for developing
    mockSparkLineData () {
      const mockFirstMarketData = mockDataByMarket[0]
      const mockSecondMarketData = mockDataByMarket[5]
      
      if (mockFirstMarketData && 
          mockSecondMarketData &&
          mockFirstMarketData.data.length === 2 &&
          mockSecondMarketData.data.length === 2) {
        let maxSelectedMarketsValue
        let minSelectedMarketsValue
        const firstMarketData = mockFirstMarketData
        const secondMarketData = mockSecondMarketData
        const firstValue = firstMarketData.data[1].Value;
				const secondValue = secondMarketData.data[1].Value;
        const dataByMarket = mockDataByMarket
        const dataByExcludedSelectedMarkets = dataByMarket.filter(obj => obj.category !== firstMarketData.category && obj.category !== secondMarketData.category)

        console.log('=== >>> ===')
        if (firstValue === secondValue) {
          maxSelectedMarketsValue = minSelectedMarketsValue = firstValue
        } else {
          if (firstValue > secondValue) {
            maxSelectedMarketsValue = firstValue
            minSelectedMarketsValue = secondValue
          } else {
            maxSelectedMarketsValue = secondValue
            minSelectedMarketsValue = firstValue
          }
        }

        const allValues = dataByMarket.map((obj) => {
      		return obj.data[1].Value
      	})
        const values = dataByExcludedSelectedMarkets.map((obj) => {
      		return obj.data[1].Value
      	})
        
        allValues.sort()
        values.sort()
        // maxSelectedMarketsValue = 0.5
        
        const closestMinMaxData = this.getClosestMaxMinMarketValues(dataByExcludedSelectedMarkets, maxSelectedMarketsValue, minSelectedMarketsValue)
        
        console.log('allValues', allValues)
        console.log('values', values)
        console.log('max value', Math.max(...allValues))
        console.log('minSelectedMarketsValue', minSelectedMarketsValue)
        console.log('maxSelectedMarketsValue', maxSelectedMarketsValue)
        console.log('closestMinMaxData', closestMinMaxData)
        console.log('=== <<< ===')
      	return { 
          closestMinMaxData,
          maxValue: Math.max(...allValues)
        }
      }            
    	return null
    },
  },
  watch: {
    firstMarketKpiChange (value) {
      this.emitter.emit(`'update-first-kpi-sum-${this.tableIndex}'`, {
     		value
  		})
    },
    secondMarketKpiChange (value) {
      this.emitter.emit(`'update-second-kpi-sum-${this.tableIndex}'`, {
     		value
  		})
    },
    data (data) {
      const groupByMarket = data.kpiData ? this.groupByProperty(data.kpiData, 'Market') : []
      const dataByMarket = []
      
      for (const [category, data] of Object.entries(groupByMarket)) {
  			dataByMarket.push({
        	category,
          data: data
        })
			}
      console.log('dataByMarket', dataByMarket)
      console.log('groupByMarket', groupByMarket)
      this.dataByMarket = mockupMode ? mockDataByMarket : dataByMarket
    }
  },
  methods: {
    getClosestMaxMinMarketValues (arr, targetMaxValue, targetMinValue) {
      return arr.reduce((acc, curr) => {
        if (curr.data[1].Value < targetMaxValue) {
          if (curr.data[1].Value > acc.max.closestMin.value) {
            acc.max.closestMin.data = curr;
            acc.max.closestMin.value = curr.data[1].Value
          }
        }
        else {
          if (curr.data[1].Value < acc.max.closestMax.value && curr.data[1].Value !== targetMaxValue) {
            acc.max.closestMax.data = curr;
            acc.max.closestMax.value = curr.data[1].Value
          }
        }
        
        if (curr.data[1].Value < targetMinValue) {
          if (curr.data[1].Value > acc.min.closestMin.value) {
            acc.min.closestMin.data = curr;
            acc.min.closestMin.value = curr.data[1].Value
          }
        }
        else {
          if (curr.data[1].Value < acc.min.closestMax.value && curr.data[1].Value !== targetMinValue) {
            acc.min.closestMax.data = curr;
            acc.min.closestMax.value = curr.data[1].Value
          }
        }
        
        return acc;
      }, { 
         		max: {
        			closestMin: { data: {}, value: -Infinity }, 
        			closestMax: { data: {}, value: Infinity }
            },
         		min: {
        			closestMin: { data: {}, value: -Infinity }, 
        			closestMax: { data: {}, value: Infinity }
            } 
      	 }
      )
    },
  	groupByProperty,
    getMarketData (marketKey) {
      const data = this.dataByMarket.find((market) => market.category === this[`${marketKey}Market`])
      return data
    },
    getMarketKpiChange (marketKey) {
      const marketData = this[`${marketKey}MarketData`]
      console.log('getMarketKpiChange: marketData', marketData)
      
      if (!marketData || marketData.data.length < 2) {
      	return ''    
      }
      
      return this.round(((marketData.data[1].Value - marketData.data[0].Value) / marketData.data[0].Value) * 100) 
    },
    round,
    getMarketKpiChangeCss (marketKey) {
      const kpiChange = this[`${marketKey}MarketKpiChange`]
      
      return  Math.sign(kpiChange) === -1 ? 'poor' 
      : kpiChange <= 5 ? 'static' : 'good'
    }
  }
})

app.component('SparkLine', {
  template: `<div>
							<slot
								:firstMarketPoint="firstMarketPoint"
                :secondMarketPoint="secondMarketPoint"
                :maxMarketPoint="maxMarketPoint"
                :minMarketPoint="minMarketPoint"
                :lineRangeOffset="lineRangeOffset" 
                :lineSelectedRangeOffset="lineSelectedRangeOffset"> 
							</slot>
						</div>`,
  props: [
  	'firstMarketData',
    'secondMarketData',
    'data'
  ],
  data () {
    return { 
      
    }
  },
  computed: {
    maxValue () {
    	return this.data ? this.data.maxValue : 0
    },
    lineRangeOffset () {
    	if (this.firstMarketPoint && 
          this.secondMarketPoint &&
          this.minMarketPoint &&
          this.maxMarketPoint) {
      	
        const points = [
          this.firstMarketPoint,
          this.secondMarketPoint,
          this.minMarketPoint,
          this.maxMarketPoint,
        ]
        
        const offsets = points.reduce((acc, obj) => {
          if (obj.offset > acc.maxOffset) {
            acc.maxOffset = obj.offset
          }
          
          if (obj.offset < acc.minOffset) {
            acc.minOffset = obj.offset
          }
          
          return acc
        }, { maxOffset: -Infinity, minOffset: Infinity })
        
        return {
          left: offsets.minOffset, 
          right: 100 - offsets.maxOffset
        }   
      }
      
      return {
      	left: 0,
        right: 0
      }
    },
    lineSelectedRangeOffset () {
    	if (this.firstMarketPoint && this.secondMarketPoint) {
      	return {
          left: this.firstMarketPoint.offset > this.secondMarketPoint.offset ? this.secondMarketPoint.offset : this.firstMarketPoint.offset, 
          right: this.firstMarketPoint.offset > this.secondMarketPoint.offset ? 100 - this.firstMarketPoint.offset : 100 - this.secondMarketPoint.offset 
        }   
      }
      
      return {
      	left: 0,
        right: 0
      }
    },
    maxMarketPoint () {
    	if (this.data) {
        const maxPointData = this.data.closestMinMaxData.max
        return isFinite(maxPointData.closestMax.value) ? 
          this.getPoint(maxPointData.closestMax.data.data[1]) :
          	(isFinite(maxPointData.closestMin.value) ? 
          		this.getPoint(maxPointData.closestMin.data.data[1]) :
        			null)
      }
      
      return null
    },
    minMarketPoint () {
    	if (this.data) {
        const minPointData = this.data.closestMinMaxData.min
        return isFinite(minPointData.closestMin.value) ? 
          this.getPoint(minPointData.closestMin.data.data[1]) :
          	(isFinite(minPointData.closestMax.value) ? 
            	this.getPoint(minPointData.closestMax.data.data[1]) :
        			null)
      }
      
      return null
    },
  	firstMarketPoint () {
      if (this.firstMarketData && this.firstMarketData.data.length === 2) {
        return this.getPoint(this.firstMarketData.data[1])    
      }
      
      return null
    },
    secondMarketPoint () {
      if (this.secondMarketData && this.secondMarketData.data.length === 2) {
      	return this.getPoint(this.secondMarketData.data[1])     
      }
      
      return null
    }
  },
  watch: {
    
  },
  methods: {
    shortenNumber(num) {
      if (num >= 1000000000) {
        return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
      }
      if (num >= 1000000) {
        return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
      }
      if (num >= 1000) {
        return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
      }
      return num;
    },
  	getPoint (data) {
      console.log('getPoint: data', data)
      if (!data) {
        return null
      }
      const pointValue = data.Value 
      const market = data.Market
      const type = pointValue < 1 ? 'percent' : 'number'
      const value = type === 'percent' ? Math.round(pointValue * 100) : Math.round(pointValue)
      const offset = type === 'percent' ? 
            value : Math.round((value/this.maxValue)*100)
      const displayValue = type === 'percent' ? `${value}%` : this.shortenNumber(value)
      
      return {
        market,
        type,
      	displayValue,
        offset
      }
    },
    round
  }
})

app.mount('#app')
