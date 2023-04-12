<template>
    <div class="line-container" ref="lineContainer">
      <svg class="line" viewBox="0 0 100 4">
        <line x1="0" y1="50%" x2="100" y2="50%" stroke="black" stroke-width="4"/>
        <g>
          <circle class="dot" :cx="dot1Position" cy="50%" r="6"/>
          <text class="label" :x="dot1Position" y="60%" text-anchor="middle">{{ dot1Label }}</text>
        </g>
        <g>
          <circle class="dot" :cx="dot2Position" cy="50%" r="6"/>
          <text class="label" :x="dot2Position" y="60%" text-anchor="middle">{{ dot2Label }}</text>
        </g>
        <g>
          <circle class="dot" :cx="dot3Position" cy="50%" r="6"/>
          <text class="label" :x="dot3Position" y="60%" text-anchor="middle">{{ dot3Label }}</text>
        </g>
        <g>
          <circle class="dot" :cx="dot4Position" cy="50%" r="6"/>
          <text class="label" :x="dot4Position" y="60%" text-anchor="middle">{{ dot4Label }}</text>
        </g>
      </svg>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        dot1Label: 'Label 1',
        dot2Label: 'Label 2',
        dot3Label: 'Label 3',
        dot4Label: 'Label 4',
        dot1Position: 10,
        dot2Position: 30,
        dot3Position: 70,
        dot4Position: 90,
        resizeTimeout: null,
      };
    },
    mounted() {
      this.updateDotPositions();
      window.addEventListener('resize', this.throttledUpdateDotPositions);
    },
    methods: {
      updateDotPositions() {
        const containerWidth = this.$refs.lineContainer.clientWidth;
        const dotInterval = containerWidth / 4;
        this.dot1Position = dotInterval - 5;
        this.dot2Position = dotInterval * 2 - 5;
        this.dot3Position = dotInterval * 3 - 5;
        this.dot4Position = dotInterval * 4 - 5;
      },
      throttle(callback, delay) {
        let lastCall = 0;
        return function (...args) {
          const now = new Date().getTime();
          if (now - lastCall < delay) {
            return;
          }
          lastCall = now;
          callback(...args);
        };
      },
    },
    computed: {
      throttledUpdateDotPositions() {
        return this.throttle(this.updateDotPositions, 100);
      },
    },
  };
  </script>
  
  <style scoped>
  .line-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100px;
    margin: 20px;
  }
  
  .dot {
    fill: black;
  }
  
  .label {
    font-size: 10px;
    fill: white;
    text-transform: uppercase;
  }
  
  </style>
  