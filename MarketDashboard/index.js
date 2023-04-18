const { createApp } = Vue
const emitter = mitt()
const app = createApp()
const domo = window.domo
const datasets = window.datasets

const mockupMode = false
const mockupFilters = false

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
            'United Kingdom',
            'United States'
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
            '2021',
            '2022'
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
    category: 'Global',
    data: [
      {
        Value: 0.48,
        Year: 2020,
        Market: 'Global',
        Description: 'KPI description'
      },
      {
        Value: 0.1,
        Year: 2021,
        Market: 'Global',
        Description: 'KPI description'
      }
    ]
  },
  {
    category: 'Mexico',
    data: [
      {
        Value: 0.33,
        Year: 2020,
        Market: 'Mexico',
        Description: 'KPI description'
      },
      {
        Value: 0.12,
        Year: 2021,
        Market: 'Mexico',
        Description: 'KPI description'
      }
    ]
  },
  {
    category: 'United Kingdom',
    data: [
      {
        Value: 0.28,
        Year: 2020,
        Market: 'United Kingdom',
        Description: 'KPI description'
      },
      {
        Value: 0.3,
        Year: 2021,
        Market: 'United Kingdom',
        Description: 'KPI description'
      }
    ]
  },
  {
    category: 'Argentina',
    data: [
      {
        Value: 0.21,
        Year: 2020,
        Market: 'Argentina',
        Description: 'KPI description'
      },
      {
        Value: 0.5,
        Year: 2021,
        Market: 'Argentina',
        Description: 'KPI description'
      }
    ]
  },
  {
    category: 'United States',
    data: [
      {
        Value: 0.45,
        Year: 2020,
        Market: 'United States',
        Description: 'KPI description'
      },
      {
        Value: 0.8,
        Year: 2021,
        Market: 'United States',
        Description: 'KPI description'
      }
    ]
  },
  {
    category: 'Mexico2',
    data: [
      {
        Value: 0.33,
        Year: 2020,
        Market: 'Mexico2',
        Description: 'KPI description'
      },
      {
        Value: 0.9,
        Year: 2021,
        Market: 'Mexico2',
        Description: 'KPI description'
      }
    ]
  },
]

const mockMarketKeys = {
	first: 0,
  second: 4
}

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

const doubleRequestAnimationFrame = (callback) => {
  requestAnimationFrame(() => {
    requestAnimationFrame(callback)
  })
}

const forceNextTick = (callback) => {
  if (callback && typeof callback === 'function') {
    doubleRequestAnimationFrame(callback)
  } else {
    return new Promise(resolve => {
      doubleRequestAnimationFrame(resolve)
    })
  }
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
    if (mockupFilters) {
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
  	/*firstMarketData () {
      return this.getMarketData('first')
    },*/
    /*secondMarketData () {
    	return this.getMarketData('second')
    },*/
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
      
      const firstMarketData = this.getMarketData('first')
      const secondMarketData = this.getMarketData('second')
      
      if (firstMarketData && 
          secondMarketData &&
          firstMarketData.data.length === 2 &&
          secondMarketData.data.length === 2) {
        let maxSelectedMarketsValue
        let minSelectedMarketsValue
        // const firstMarketData = this.firstMarketData
        // const secondMarketData = this.secondMarketData
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
          maxValue: Math.max(...allValues),
          firstMarketData,
          secondMarketData
        }
      }            
    	return null
    },
    // Mockup data for developing
    mockSparkLineData () {
      // const firstMarketData = mockDataByMarket[0]
      // const secondMarketData = mockDataByMarket[1]
      const firstMarketData = this.getMarketData('first')
      const secondMarketData = this.getMarketData('second')
      
      if (firstMarketData && 
          secondMarketData &&
          firstMarketData.data.length === 2 &&
          secondMarketData.data.length === 2) {
        let maxSelectedMarketsValue
        let minSelectedMarketsValue
        // const firstMarketData = mockFirstMarketData
        // const secondMarketData = mockSecondMarketData
        const firstValue = firstMarketData.data[1].Value;
				const secondValue = secondMarketData.data[1].Value;
        const dataByMarket = mockDataByMarket
        const dataByExcludedSelectedMarkets = dataByMarket.filter(obj => obj.category !== firstMarketData.category && obj.category !== secondMarketData.category)

        console.log('=== >>> ===', firstValue, secondValue)
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
          maxValue: Math.max(...allValues),
          firstMarketData,
          secondMarketData
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
        if (curr.data[1].Value <= targetMaxValue) {
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
        
        if (curr.data[1].Value <= targetMinValue) {
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
      if (mockupMode) {
        const mockMarketKey = mockMarketKeys[marketKey] 
        const data = mockDataByMarket[mockMarketKey]
        return data
      }
      
      const data = this.dataByMarket.find((market) => market.category === this[`${marketKey}Market`])
      return data
    },
    getMarketKpiChange (marketKey) {
      const marketData = this.getMarketData(marketKey)
      // const marketData = this[`${marketKey}MarketData`]
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
								:setElement="setElement"
								:points="points"
								:overlap="overlap"> 
							</slot>
						</div>`,
  props: [
  	/*'firstMarketData',
    'secondMarketData',*/
    'data'
  ],
  data () {
    return { 
    	maxMarketPointRef: null,
      minMarketPointRef: null,
      firstMarketPointRef: null,
      secondMarketPointRef: null,
      overlap: {
      	minTitle: false,
        minValue: false,
        maxTitle: false,
        maxValue: false,
        secondValue: false
      },
      points: {
      	min: null,
        max: null,
        first: null,
        second: null
      }
    }
  },
  watch: {
  	data: {
     	handler(data, newData) {
        console.log('WATCH', data, newData) 
        this.updatePoints()
      },
     	deep: true
  	}
	},
  mounted () {
    console.log('SparkLine: mounted: data', this.data, this.secondMarketData, this.firstMarketData)
    this.updatePoints()
  },
  computed: {
    /* points () {
      return {
      	min: this.minMarketPoint, 
        max: this.maxMarketPoint, 
        first: this.firstMarketPoint, 
        second: this.secondMarketPoint
      }
    }, */
    maxValue () {
    	return this.data ? this.data.maxValue : 0
    },
    /*lineRangeOffset () {
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
    },*/
    /*lineSelectedRangeOffset () {
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
    },*/
    /*maxMarketPoint () {
    	if (this.data) {
        const maxPointData = this.data.closestMinMaxData.max
        return isFinite(maxPointData.closestMax.value) ? 
          this.getPoint(maxPointData.closestMax.data.data[1], 'maxMarketPoint') :
          	(isFinite(maxPointData.closestMin.value) ? 
          		this.getPoint(maxPointData.closestMin.data.data[1], 'maxMarketPoint') :
        			null)
      }
      
      return null
    },*/
    /*minMarketPoint () {
    	if (this.data) {
        const minPointData = this.data.closestMinMaxData.min
        return isFinite(minPointData.closestMin.value) ? 
          this.getPoint(minPointData.closestMin.data.data[1], 'minMarketPoint') :
          	(isFinite(minPointData.closestMax.value) ? 
            	this.getPoint(minPointData.closestMax.data.data[1], 'minMarketPoint') :
        			null)
      }
      
      return null
    },*/
  	/*firstMarketPoint () {
      if (this.firstMarketData && this.firstMarketData.data.length === 2) {
        return this.getPoint(this.firstMarketData.data[1], 'firstMarketPoint')    
      }
      
      return null
    },*/
    /*secondMarketPoint () {
      if (this.secondMarketData && this.secondMarketData.data.length === 2) {
      	return this.getPoint(this.secondMarketData.data[1], 'secondMarketPoint')     
      }
      
      return null
    }*/
  },
  methods: {
    updatePoints () {
    	/*this.$nextTick(() => {
        this.fixPosition()
      })*/
      this.setPoints()
    },
    setPoints () {
      if (this.data) {
      	const minPointData = this.data.closestMinMaxData.min
        const minPoint = isFinite(minPointData.closestMin.value) ?
              this.getPoint(minPointData.closestMin.data.data[1], 'minMarketPoint') :
              (isFinite(minPointData.closestMax.value) ?
                this.getPoint(minPointData.closestMax.data.data[1], 'minMarketPoint') :
                null)
        const maxPointData = this.data.closestMinMaxData.max
        const maxPoint = isFinite(maxPointData.closestMax.value) ? 
              this.getPoint(maxPointData.closestMax.data.data[1], 'maxMarketPoint') :
              (isFinite(maxPointData.closestMin.value) ? 
                this.getPoint(maxPointData.closestMin.data.data[1], 'maxMarketPoint') :
                null)
        const firstPoint = this.data.firstMarketData && this.data.firstMarketData.data.length === 2 ?
              this.getPoint(this.data.firstMarketData.data[1], 'firstMarketPoint') :
              null
        const secondPoint = this.data.secondMarketData && this.data.secondMarketData.data.length === 2 ?
              this.getPoint(this.data.secondMarketData.data[1], 'secondMarketPoint') :
              null
        const lineSelectedRange = this.getLineSelectedRange(firstPoint, secondPoint)
        const lineRange = this.getLineRange (firstPoint, secondPoint, minPoint, maxPoint)

        this.points = {
          min: minPoint,
          max: maxPoint,
          first: firstPoint,
          second: secondPoint,
          lineSelectedRange,
          lineRange
        }
        
        forceNextTick(() => {
      		this.fixPosition() 
      	})
      }
      
    
    },
    getLineSelectedRange (firstPoint, secondPoint) {
    	return firstPoint && secondPoint ?
      {
      	left: firstPoint.offset > secondPoint.offset ? secondPoint.offset : firstPoint.offset, 
        right: firstPoint.offset > secondPoint.offset ? 100 - firstPoint.offset : 100 - secondPoint.offset 
      } :   
      {
      	left: 0,
        right: 0
      }
    },
    getLineRange (firstPoint, secondPoint, minPoint, maxPoint) {
    	if (firstPoint && 
          secondPoint &&
          minPoint &&
          maxPoint) {
      	
        const points = [
          firstPoint,
          secondPoint,
          minPoint,
          maxPoint,
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
    fixPosition () {
    			const secondValueElClientRect = this.secondMarketPointRef ? this.secondMarketPointRef.querySelector('.kpi-point-value').getBoundingClientRect() : null
          const minValueElClientRect = this.minMarketPointRef ? this.minMarketPointRef.querySelector('.kpi-point-value').getBoundingClientRect() : null
          const minTitleElClientRect = this.minMarketPointRef ? this.minMarketPointRef.querySelector('.kpi-point-title').getBoundingClientRect() : null
          const maxValueElClientRect = this.maxMarketPointRef ? this.maxMarketPointRef.querySelector('.kpi-point-value').getBoundingClientRect() : null
          const maxTitleElClientRect = this.maxMarketPointRef ? this.maxMarketPointRef.querySelector('.kpi-point-title').getBoundingClientRect() : null
          const overlapMinValue = (
            									 minValueElClientRect &&
            									 secondValueElClientRect &&
            									 minValueElClientRect.left < secondValueElClientRect.right && 
                             	 minValueElClientRect.right > secondValueElClientRect.left 
          									 ) ||
                						 (
                               minValueElClientRect &&
                               maxValueElClientRect &&
                               minValueElClientRect.left < maxValueElClientRect.right && 
                               minValueElClientRect.right > maxValueElClientRect.left
                             )
          const overlapMinMaxTitle = (
                               minTitleElClientRect &&
                               maxTitleElClientRect &&
                               minTitleElClientRect.left < maxTitleElClientRect.right && 
                               minTitleElClientRect.right > maxTitleElClientRect.left
                             )                     
          const overlapMaxValue = (
                               maxValueElClientRect &&
                               secondValueElClientRect && 
                               maxValueElClientRect.left < secondValueElClientRect.right && 
                               maxValueElClientRect.right > secondValueElClientRect.left 
                             ) ||
                						 (
                               maxValueElClientRect &&
                               minValueElClientRect &&
                               maxValueElClientRect.left < minValueElClientRect.right && 
                               maxValueElClientRect.right > minValueElClientRect.left
                             )
          /*const overlapSecond = ( 
                              		secondValueElClientRect &&
                                  maxValueElClientRect && 
                                  secondValueElClientRect.left < maxValueElClientRect.right && 
                             		  secondValueElClientRect.right > maxValueElClientRect.left 
                                ) ||
                						 		( 
                              		secondValueElClientRect &&
                                  minValueElClientRect &&
                                  secondValueElClientRect.left < minValueElClientRect.right && 
                             		  secondValueElClientRect.right > minValueElClientRect.left 
                                )*/
          this.overlap = {
      			minTitle: overlapMinMaxTitle,
        		minValue: overlapMinValue,
        		maxTitle: overlapMinMaxTitle,
        		maxValue: overlapMaxValue,
        		secondValue: false
      		}
          // console.log(maxValueElClientRect, secondValueElClientRect)
          // console.log('OVERLAP', this.overlap)
    },
    setElement (el, key) {
      this[`${key}Ref`] = el
    },
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
  	getPoint (data, point) {
      console.log('getPoint: data', data)
      if (!data) {
        return null
      }
      const el = this[`${point}Ref`]
      
      const pointValue = data.Value 
      const market = data.Market
      const type = pointValue < 1 ? 'percent' : 'number'
      const value = type === 'percent' ? Math.round(pointValue * 100) : Math.round(pointValue)
      const offset = type === 'percent' ? 
            value : Math.round((value/this.maxValue)*100)
      const displayValue = type === 'percent' ? `${value}%` : this.shortenNumber(value)
      
      return {
        point,
        el,
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
