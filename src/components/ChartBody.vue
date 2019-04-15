<script lang="ts">

import { Component, Prop, Vue, Watch, Mixins } from 'vue-property-decorator';
import Chart from "chart.js";
import { Line, Bar, Scatter, mixins } from "vue-chartjs";

@Component({})
export default class ChartBody extends Mixins(Scatter, mixins.reactiveProp) {
  @Prop() public chartData!: Chart.ChartData;
  @Prop() public chartOptions!: Chart.ChartOptions;

  @Watch('chartOptions')
  options_changed(to: Chart.ChartOptions) {
    this.rerender()
  }


  public mounted() {
    return this.rerender()
  }

  rerender() {
    this.renderChart(this.chartData, this.chartOptions);
  }
}
</script>
