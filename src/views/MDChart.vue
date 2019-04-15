<template lang="pug">
#mdchart
  v-toolbar#mdchart-tb(light color="white" flat)
    v-toolbar-title chart
  #mdchart-content
    .status(v-bind="statusbind") {{ status.text }}
    ChartBody.chartbody(:chart-data="chartData", :chart-options="chartOptions")
    .operations
      .options
        h5 DataSeries
        .parse
          v-btn(@click="parse") Parse
        h5 X-Axis
        .xaxis
          v-btn-toggle(v-model="xAxisType" mandatory)
            v-btn(flat value="linear")
              v-icon linear_scale
            v-btn(flat value="logarithmic") Log
        h5 Y-Axis
        .yaxis
          v-btn-toggle(v-model="yAxisType" mandatory)
            v-btn(flat value="linear")
              v-icon linear_scale
            v-btn(flat value="logarithmic") Log
      .data
        textarea(v-model="datatext" no-resize)
</template>

<script lang="ts">

import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import Chart from "chart.js";
import ChartBody from '../components/ChartBody.vue';
import _ from 'underscore';


const FONT_COLOR = "black";
const GRID_LINES_SETTING = {
  display: true,
  drawOnChartArea: false,
  color: "black",
  zeroLineColor: "black"
};

type AxisType = "linear" | "logarithmic"

const Colors = ["blue", "red", "green", "orange"]

@Component({
  components: {
    ChartBody,
  },
})
export default class MDChart extends Vue {
  @Prop() public document_id!: string
  public chartTitle: string = "Vue Chartjs Demo";
  private status: {
    text: string
    cssclass?: string
    cssstyle?: string
  } = { text: "init." }
  get statusbind() {
    return {
      class: this.status.cssclass || "",
      style: this.status.cssstyle || "",
    }
  }
  private datatext: string = ""
  private cdataseries: { x:number, y:number }[][] = []
  private xAxisType: AxisType = "linear"
  private yAxisType: AxisType = "linear"

  emit_status(text: string, errornous = false) {
    this.status = {
      text,
      cssclass: errornous ? "error" : "",
    }
  }

  get chartOptions(): Chart.ChartOptions {
    return {
      responsive: true,
      maintainAspectRatio: false,
      legend: {
        // display: false
        onClick(event, legendItem) {
          return;
        },
        fullWidth: true,
      },
      layout: {
        padding: {
          top: 20,
          left: 20,
          bottom: 20,
          right: 20
        }
      },
      scales: {
        xAxes: [ this.xAxis ],
        yAxes: [ this.yAxis ],
      }
    };
  }

  get xAxis() {
    return {
      type: this.xAxisType,
      gridLines: GRID_LINES_SETTING,
      ticks: {
        autoSkip: true,
        fontColor: FONT_COLOR,
        fontSize: 14,
        // min: 0,
        // max: 100,
        min: 0,
        max: 100,
      },
      scaleLabel: {
        display: true,
        fontColor: FONT_COLOR,
        // labelString: "月",
      },
    }
  }

  get yAxis() {
    return {
      type: this.yAxisType,
      gridLines: GRID_LINES_SETTING,
      scaleLabel: {
        display: true,
        fontColor: FONT_COLOR,
        // labelString: "湿度(%)"
      },
      ticks: {
        autoSkip: true,
        fontColor: FONT_COLOR,
        fontSize: 14,
        // min: 0,
        // max: 100,
        min: 0,
        max: 100,
      },
    }
  }

  public created() {
    this.datagen()
    
  }

  get chartData(): Chart.ChartData {
    return {
      datasets: this.cdataseries.map((arr,i) => ({
        type: "line",
        label: "",
        backgroundColor: Colors[(i+1)%4],
        borderColor: "#6090EF",
        fill: false,
        data: arr
      }))
    };
  }

  // [data series]
  datagen() {
    const arr: { x:number, y:number }[] = [];
    const baseNumber = 100
    for (let i = 0; i < 50 ; i++) {
      arr.push({
        x: Math.floor(Math.random() * baseNumber),
        y: Math.floor(Math.random() * baseNumber),
      });
    }
    this.datatext = arr.map(r => `${r.x} ${r.y}`).join("\n")
    this.parse()
  }

  parse_datatext(): { x:number, y:number }[][] {
    try {
      const txt = (this.datatext || "").trim()
      const arr: { x:number, y:number }[][] = [[]]
      txt.split(/\n/).forEach(line => {
        const blank_line = line.match(/^\s*$/)
        if (blank_line) {
          if (arr.length === 0 || arr[arr.length-1].length > 0) {
            console.log(line)
            arr.push([])
          }
          return
        }
        const xy = line.split(" ")
        const x = parseFloat(xy[0])
        const y = parseFloat(xy[1])
        if (typeof x === "number" && typeof y === "number") {
          arr[arr.length-1].push({ x, y })
        }
      })
      return arr.filter(sarr => sarr.length > 0)
    } catch(e) {
      this.emit_status("parse error", true)
      return []
    }
  }
  
  parse() {
    const dt = this.parse_datatext()
    console.log(dt)
    if (dt) {
      this.emit_status(`parsed(${dt.length} items).`)
      this.cdataseries = dt
    }
  }
}
</script>

<style scoped lang="stylus">
@import "../assets/common"
#mdchart
  height 100%
  margin 0
  display flex
  flex-direction column
  flex-wrap wrap

  #mdchart-tb
    flex-grow 0
    flex-shrink 0
    flex-basis auto

  #mdchart-content
    flex-grow 1
    flex-shrink 1
    // overflow hidden
    display flex
    flex-direction column

    .status
      padding 4px
      text-align left
      flex-grow 0
      flex-shrink 0

    .chartbody
      overflow hidden
      position relative

    .operations
      flex-grow 1
      flex-shrink 1
      display flex
      flex-direction row
      .options
        display flex
        flex-direction column
        flex-grow 0
        flex-shrink 0
      .data
        flex-grow 1
        flex-shrink 1
        padding 4px
        textarea 
          font-family cd-font-family
          outline none
          height 100%
          width 100%
          resize none
          padding 4px
          border 1px solid #888

</style>
