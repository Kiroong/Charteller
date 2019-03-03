import { SpecTag } from './spec-tag';
import { ChartSpec } from './chart-spec';
import { AttrInput } from './attributes';
import { ChartAccent } from '../chart-accent/chart-accent';

export class Title extends SpecTag {
    constructor(public _root: ChartSpec) {
        super('Title');
        this._parent = _root;
        this.attributes = {
            title: new AttrInput()
        };
    }
    fromChartAccent(ca: ChartAccent) {
        this.attributes = {
            title: new AttrInput(ca.chart.title.text)
        };
    }
    afterFromChartAccent() {
      this.descriptionRule = this.assembleDescriptionRules([
        ['This chart is titled "$(title)."', true],
      ]);
    }
}
