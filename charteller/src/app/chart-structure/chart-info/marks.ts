import { ChartAccent } from '../chart-accent/chart-accent';
import { Tag } from './tag';

export class Marks implements Tag {
  tagname: 'marks';
  children: Bargroup[];

  constructor(ca: ChartAccent) {
    this.tagname =  'marks';
    this.children = ca.dataset.rows.map(row => new Bargroup(row, ca));
  }
}

export class Bargroup implements Tag {
  tagname: 'bargroup';
  name: string;
  relationalRanges: any[];
  children: Bar[];

  constructor(row, ca: ChartAccent) {
    this.tagname = 'bargroup';
    this.name = row[ca.dataset.columns[0].name];
    this.children =  ca.dataset.columns.slice(1).map(column => column.name)
      .map(key => new Bar(key, row));
    this.relationalRanges = [];
  }
}
export class Bar implements Tag {
  tagname: 'bar';
  key: string;
  value: number;
  relationalRanges: any[];
  highlighted: boolean;

  constructor(key, row) {
    this.tagname = 'bar';
    this.key = key;
    this.value = row[key];
    this.relationalRanges = [];
    this.highlighted = false;
  }
}
