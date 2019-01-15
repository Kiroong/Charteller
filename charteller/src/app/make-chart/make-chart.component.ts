import { Component, OnInit } from '@angular/core';
import { ChartSpec } from '../chart-structure/chart-spec/chart-spec';

@Component({
  selector: 'app-make-chart',
  templateUrl: './make-chart.component.html',
  styleUrls: ['./make-chart.component.scss']
})
export class MakeChartComponent implements OnInit {

  chartSpec: ChartSpec;

  constructor() { }

  ngOnInit() {
    this.chartSpec = new ChartSpec();

    this.chartSpec.legend.addChild.value();
    this.chartSpec.legend.addChild.value();
    this.chartSpec.legend.items.value.forEach((item, i) => item.text.value = `Series ${i + 1}`);
    this.chartSpec.x.addChild.value();
    this.chartSpec.x.addChild.value();
    this.chartSpec.x.ticks.value.forEach((tick, i) => tick.text.value = `Group ${i + 1}`);
    this.chartSpec.marks.bargroups.value.forEach((bargroup, i) => {
      bargroup.bars.value.forEach((bar, j) => {
        bar.value.value =  2 * i + j + 1;
      });
    });
  }

}
