const { createApp } = Vue
const emitter = mitt()
const app = createApp()
const domo = window.domo
const datasets = window.datasets

const mockupMode = false
const mockupFilters = false
const mockLabels = true
const debugMode = false

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
            // 'United States'
          	//'Mexico'
          	'Global'
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
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(callback)
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
      
      if (debugMode) { console.log('MarketDashboard: computed: dataGroupByCategory: dataGroupByKPI', dataGroupByKPI) }
      
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
        if (debugMode) { 
        	console.log('MarketDashboard: getData: query, data', this.query, data)
      		console.log('MarketDashboard: getData: dataGroupByCategory', this.dataGroupByCategory)
        }
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
      if (debugMode) { console.log('MarketDashboard: updateData: filters', filters) }
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
        const firstValue = firstMarketData.data[1].Value;
				const secondValue = secondMarketData.data[1].Value;
        const dataByMarket = this.dataByMarket
        const dataByExcludedSelectedMarkets = dataByMarket.filter(obj => obj.category !== firstMarketData.category && obj.category !== secondMarketData.category)

        if (debugMode) { console.log('=== KpiRow: computed: sparkLineData >>>') }
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
        
        const closestMinMaxData = this.getClosestMaxMinMarketValues(dataByExcludedSelectedMarkets, maxSelectedMarketsValue, minSelectedMarketsValue)
        
        if (debugMode) { 
          console.log('KpiRow: computed: sparkLineData: allValues', allValues) 
 					console.log('KpiRow: computed: sparkLineData: values', values) 
        	console.log('KpiRow: computed: sparkLineData: max allValues', Math.max(...allValues))
          console.log('KpiRow: computed: sparkLineData: minSelectedMarketsValue', minSelectedMarketsValue)
          console.log('KpiRow: computed: sparkLineData: maxSelectedMarketsValue', maxSelectedMarketsValue)
          console.log('KpiRow: computed: sparkLineData: closestMinMaxData', closestMinMaxData)
          console.log('<<< KpiRow: computed: sparkLineData ===') 
        }
      	return { 
          closestMinMaxData,
          maxValue: Math.max(...allValues),
          minValue: Math.min(...allValues),
          firstMarketData,
          secondMarketData
        }
      }            
    	return null
    },
    // Mockup data for development
    mockSparkLineData () {
      const firstMarketData = this.getMarketData('first')
      const secondMarketData = this.getMarketData('second')
      
      if (firstMarketData && 
          secondMarketData &&
          firstMarketData.data.length === 2 &&
          secondMarketData.data.length === 2) {
        let maxSelectedMarketsValue
        let minSelectedMarketsValue
        const firstValue = firstMarketData.data[1].Value;
				const secondValue = secondMarketData.data[1].Value;
        const dataByMarket = mockDataByMarket
        const dataByExcludedSelectedMarkets = dataByMarket.filter(obj => obj.category !== firstMarketData.category && obj.category !== secondMarketData.category)

        if (debugMode) { console.log('=== KpiRow: computed: mockSparkLineData >>>') }
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
        
        const closestMinMaxData = this.getClosestMaxMinMarketValues(dataByExcludedSelectedMarkets, maxSelectedMarketsValue, minSelectedMarketsValue)
        
        if (debugMode) { 
          console.log('KpiRow: computed: mockSparkLineData: allValues', allValues) 
 					console.log('KpiRow: computed: mockSparkLineData: values', values) 
        	console.log('KpiRow: computed: mockSparkLineData: max allValues', Math.max(...allValues))
          console.log('KpiRow: computed: mockSparkLineData: minSelectedMarketsValue', minSelectedMarketsValue)
          console.log('KpiRow: computed: mockSparkLineData: maxSelectedMarketsValue', maxSelectedMarketsValue)
          console.log('KpiRow: computed: mockSparkLineData: closestMinMaxData', closestMinMaxData)
          console.log('<<< KpiRow: computed: mockSparkLineData ===') 
        }
        return { 
          closestMinMaxData,
          maxValue: Math.max(...allValues),
          minValue: Math.min(...allValues),
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
      if (debugMode) {
      	console.log('KpiRow: watch: data: dataByMarket', dataByMarket)
      	console.log('KpiRow: watch: data: groupByMarket', groupByMarket)
    	}
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
      if (debugMode) { console.log('KpiRow: getMarketKpiChange: marketData', marketData) }
      
      if (!marketData || marketData.data.length < 2) {
      	return ''    
      }
      
      return this.round(((marketData.data[1].Value - marketData.data[0].Value) / marketData.data[0].Value) * 100) 
    },
    round,
    getMarketKpiChangeCss (marketKey) {
      const kpiChange = this[`${marketKey}MarketKpiChange`]
      
      return Math.sign(kpiChange) === -1 ? 'poor' 
      : kpiChange <= 5 ? 'static' : 'good'
    }
  }
})

app.component('SparkLine', {
  template: `<div>
							<slot
								:setElement="setElement"
								:points="points"
								:overlap="overlap"
								:isOverlaps="isOverlaps"
								:offset="offset"
								:mock="mock"
                :mockLabels="mockLabels"
                :cssPointColor="cssPointColor"> 
							</slot>
						</div>`,
  props: [
  	'data'
  ],
  data () {
    return {
      mock: mockupMode || mockupFilters,
      mockLabels: mockLabels,
      mockLineRef: null,
      lineRef: null,
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
      isOverlaps: false,
      points: {
      	min: null,
        max: null,
        first: null,
        second: null
      },
      offset: {
      	mockLine: 10,
      }
    }
  },
  watch: {
  	data: {
     	handler(data, newData) {
        this.setPoints()
      },
     	deep: true
  	}
  },
  mounted () {
    if (debugMode) {
    	console.log('SparkLine: mounted: data', this.data)
    }
    this.setPoints()
  },
  computed: {
    maxValue () {
    	return this.data ? this.data.maxValue : 0
    },
    minValue () {
    	return this.data ? this.data.minValue : 0
    },
    cssPointColor () {
      return this.points.first && this.points.second ?
        ( this.points.first.value < this.points.second.value ? 'poor' : 'good' ) :
      	''
    }
  },
  methods: {
    setPoints () {
      if (this.data) {
        this.points = {
      		min: null,
        	max: null,
        	first: null,
        	second: null
      	}
        forceNextTick(() => {
          const firstPoint = this.data.firstMarketData && this.data.firstMarketData.data.length === 2 ?
                this.getPoint(this.data.firstMarketData.data[1], 'firstMarketPoint') :
                null
          const secondPoint = this.data.secondMarketData && this.data.secondMarketData.data.length === 2 ?
                this.getPoint(this.data.secondMarketData.data[1], 'secondMarketPoint') :
                null
          const lineSelectedRange = this.getLineSelectedRange(firstPoint, secondPoint)
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
          const lineRange = this.getLineRange (firstPoint, secondPoint, minPoint, maxPoint)
          
					this.points = {
            min: !firstPoint.isMin && !secondPoint.isMin ? minPoint : null,
            max: !firstPoint.isMax && !secondPoint.isMax ? maxPoint : null,
            first: firstPoint,
            second: secondPoint,
            lineSelectedRange,
            lineRange
          }
        })
        
        forceNextTick(() => {
          if (this.mockLabels) {
            this.fixPosition_()
          } else {
            this.fixPosition()
          }
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
    getBoundingClientRectWithTransform (element) {
      const clientRect = element?.getBoundingClientRect()
      const transform = window.getComputedStyle(element)?.getPropertyValue('transform')
      
      if (transform !== 'none') {
      	const matrix = transform.match(/^matrix\((.+)\)$/)
        if (matrix) {
          const matrixValues = matrix[1].split(', ')
          const translateX = parseInt(matrixValues[4])
          return {
            left: clientRect?.left + translateX,
            right: clientRect?.right + translateX,
            translateX,
            width: clientRect?.width
          }
        }
      } else {
      	return {
          left: clientRect?.left,
          right: clientRect?.right,
          translateX: null,
          width: clientRect?.width
        }
      }
      
      return {
        left: null,
        right: null,
        translateX: null,
        width: null
      }
    },
  	fixPosition_ () {
      const filteredPoints = []
      const filteredPointsKeys = ['min', 'max', 'second']
      for (const key in this.points) {
        if (this.points[key] && filteredPointsKeys.includes(key)) {
          filteredPoints.push(Object.assign({}, this.points[key]))
        }
      }
      const sortedPoints = filteredPoints.sort((a, b) => {
          return a.offset >= b.offset ? 1 : -1
      })
      
      const points = sortedPoints.map((point) => {
        const valueBounds = this[`${point.point}Ref`] ? this.getBoundingClientRectWithTransform(this[`${point.point}Ref`].querySelector('.kpi-point-value')) : null
        point.valueBounds = valueBounds
        
        if (point.point === 'minMarketPoint' || point.point === 'maxMarketPoint') {
        	const titleBounds = this[`${point.point}Ref`] ? this.getBoundingClientRectWithTransform(this[`${point.point}Ref`].querySelector('.kpi-point-title')) : null
          point.titleBounds = titleBounds
        }
        return point
       })
      
      this.preventLabelOverlap(points)
    },
    preventLabelOverlap(labelElems) {
      const minPoint = labelElems.find((point) => point.point === 'minMarketPoint')
      const maxPoint = labelElems.find((point) => point.point === 'maxMarketPoint')
      
      if (minPoint) {
        const minPointTitleWidth = minPoint.titleBounds ? minPoint.titleBounds.width : null
        this[`${minPoint.point}Ref`].querySelector('.kpi-point-title.kpi-point-title-mock').style.left = `${- minPointTitleWidth/2 + 4}px`
      } 
      if (maxPoint) {
        const maxPointTitleWidth = maxPoint.titleBounds ? maxPoint.titleBounds.width : null
        this[`${maxPoint.point}Ref`].querySelector('.kpi-point-title.kpi-point-title-mock').style.left = `${- maxPointTitleWidth/2 + 4}px`         
      }
      
      if (minPoint && maxPoint) {
        const minPointTitleBounds = minPoint.titleBounds
        const minPointTitleWidth = minPointTitleBounds.width
        const minPointTitleLeft = minPointTitleBounds.left - minPointTitleWidth/2 + 4
        const minPointTitleRight = minPointTitleBounds.right - minPointTitleWidth/2 + 4
        
        const maxPointTitleBounds = maxPoint.titleBounds
        const maxPointTitleWidth = maxPointTitleBounds.width
        const maxPointTitleLeft = maxPointTitleBounds.left - maxPointTitleWidth/2 + 4
        const maxPointTitleRight = maxPointTitleBounds.right - maxPointTitleWidth/2 + 4
            
        if ( minPointTitleRight > maxPointTitleLeft && minPointTitleLeft < maxPointTitleRight ) {
        	this.isOverlaps = true
        } else {
          this.isOverlaps = false
        }
      }
      ////////////
      const minOffset = 0  
      let offset = 0
      
      labelElems.forEach((labelElem, i) => {
        if (debugMode) { console.log('SparkLine: preventLabelOverlap: labelElem', labelElem) }
        
				const labelWidth = labelElem.valueBounds ? labelElem.valueBounds.width : null
				
        if (i > 0) {
        	const prevLabelElem = labelElems[i - 1]
      		const prevLabelElemValueBounds = prevLabelElem.valueBounds
      		const labelElemValueBounds = labelElem.valueBounds
        
        	if (labelElemValueBounds && prevLabelElemValueBounds) {
        		const prevLabelWidth = prevLabelElem.valueBounds.width
            const prevLabelLeft = prevLabelElem.valueBounds.left - prevLabelWidth/2 + 4
            const prevLabelRight = prevLabelElem.valueBounds.right - prevLabelWidth/2 + 4
						const labelLeft = labelElem.valueBounds.left - labelWidth/2 + 4
            const labelRight = labelElem.valueBounds.right - labelWidth/2 + 4
            
            if ( ( prevLabelRight + offset > labelLeft && prevLabelLeft + offset < labelRight ) ||
                 ( prevLabelRight + offset > labelLeft && prevLabelLeft + offset > labelRight ) ) {
        			offset = prevLabelRight + offset - labelLeft + minOffset
              this[`${labelElem.point}Ref`].querySelector('.kpi-point-value.kpi-point-value-mock').style.left = `${offset - labelWidth/2 + 4}px`
              if (debugMode) {
              	console.log('SparkLine: preventLabelOverlap: labelElem >', labelElem, offset, prevLabelLeft, prevLabelRight, labelLeft, labelRight)
            	}
            } else if (prevLabelRight + offset == labelLeft) {
            	offset = prevLabelWidth + offset
              if (debugMode) {
              	console.log('SparkLine: preventLabelOverlap: labelElem >>', labelElem, offset, prevLabelLeft, prevLabelRight, labelLeft, labelRight)
            	}
              this[`${labelElem.point}Ref`].querySelector('.kpi-point-value.kpi-point-value-mock').style.left = `${offset - labelWidth/2 + 4}px`
            } 
            else {
							if (debugMode) {
              	console.log('SparkLine: preventLabelOverlap: labelElem >>>', labelElem, offset, prevLabelLeft, prevLabelRight, labelLeft, labelRight)
            	}
              offset = 0
              this[`${labelElem.point}Ref`].querySelector('.kpi-point-value.kpi-point-value-mock').style.left = `${offset - labelWidth/2 + 4}px`
            }
          }
        } else {
					if (this[`${labelElem.point}Ref`]) {
            if (debugMode) { console.log('SparkLine: preventLabelOverlap: labelElem >>>>', labelElem) }
						offset = 0
            this[`${labelElem.point}Ref`].querySelector('.kpi-point-value.kpi-point-value-mock').style.left = `${offset - labelWidth/2 + 4}px`
          }
        }
      })
    },
    fixPosition () {
      const secondValueElBounds = this.secondMarketPointRef ? this.getBoundingClientRectWithTransform(this.secondMarketPointRef?.querySelector('.kpi-point-value')) : null
      const minValueElBounds = this.minMarketPointRef ? this.getBoundingClientRectWithTransform(this.minMarketPointRef?.querySelector('.kpi-point-value')) : null
      const minTitleElBounds = this.minMarketPointRef ? this.getBoundingClientRectWithTransform(this.minMarketPointRef?.querySelector('.kpi-point-title')) : null
      const maxValueElBounds = this.maxMarketPointRef ? this.getBoundingClientRectWithTransform(this.maxMarketPointRef?.querySelector('.kpi-point-value')) : null
      const maxTitleElBounds = this.maxMarketPointRef ? this.getBoundingClientRectWithTransform(this.maxMarketPointRef?.querySelector('.kpi-point-title')) : null
      const overlapMinValue = (
        minValueElBounds != null && secondValueElBounds != null &&
        minValueElBounds.left < secondValueElBounds.right &&
        minValueElBounds.right > secondValueElBounds.left
      ) || 
      (
        minValueElBounds != null && maxValueElBounds != null &&
        minValueElBounds.left < maxValueElBounds.right &&
        minValueElBounds.right > maxValueElBounds.left
      )
      
      const overlapMinMaxTitle = (
        minTitleElBounds != null && maxTitleElBounds != null &&
        minTitleElBounds.left < maxTitleElBounds.right &&
        minTitleElBounds.right > maxTitleElBounds.left
      )
      const overlapMaxValue = (
        maxValueElBounds != null && secondValueElBounds != null &&
        maxValueElBounds.left < secondValueElBounds.right &&
        maxValueElBounds.right > secondValueElBounds.left
      ) || 
      (
        maxValueElBounds != null && minValueElBounds != null &&
        maxValueElBounds.left < minValueElBounds.right &&
        maxValueElBounds.right > minValueElBounds.left
      )
                                                                          
      this.overlap = {
        minTitle: overlapMinMaxTitle,
        minValue: overlapMinValue,
        maxTitle: overlapMinMaxTitle,
        maxValue: overlapMaxValue,
        secondValue: false
      }
    },
    setElement (el, key) {
      this[`${key}Ref`] = el
    },
    shortenNumber(num) {
			//return num
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
			const displayValueSuffix = pointValue === this.maxValue ? '(max)' :
                                 (pointValue === this.minValue ? '(min)' : '')
      const displayValue = type === 'percent' ? `${value}%${displayValueSuffix}` : `${this.shortenNumber(value)}${displayValueSuffix}`
      
      return {
        point,
				value,
        el,
        market,
        type,
      	displayValue,
				displayValueSuffix,
        offset,
				isMax: pointValue === this.maxValue,
				isMin: pointValue === this.minValue
      }
    },
    round
  }
})

app.mount('#app')
