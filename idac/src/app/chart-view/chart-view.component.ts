import { Component, OnInit, Input, EventEmitter, Output, ElementRef, ViewChild, AfterViewInit, AfterViewChecked } from '@angular/core';
import { SpecTag } from '../chart-structure/chart-spec/spec-tag';
import { ChartSpec } from '../chart-structure/chart-spec/chart-spec';
import * as d3 from 'd3';
import { SvgContainerComponent } from '../svg-container/svg-container.component';
import { d3ImmediateChildren, d3AsSelectionArray, makeAbsoluteContext, mergeBoundingBoxes, zip } from '../utils';
import { translate } from '../chartutils';

@Component({
  selector: 'app-chart-view',
  templateUrl: './chart-view.component.html',
  styleUrls: ['./chart-view.component.scss']
})
export class ChartViewComponent implements OnInit, AfterViewChecked {

  @Input() src: string;
  @Input() chartSpec: ChartSpec;
  @Input() currentTag: SpecTag;
  @Output() currentTagChange: EventEmitter<SpecTag> = new EventEmitter();

  @ViewChild(SvgContainerComponent) svgContainer: SvgContainerComponent;

  svg: d3.Selection<SVGGElement, any, HTMLElement, any>;
  gClickHint: d3.Selection<any, any, any, any>;
  gHighlight: d3.Selection<any, any, any, any>;
  elementLink = {};
  ready = false;

  constructor() { }

  ngOnInit() {
  }

  onSVGInit() {
    this.ready = true;
    this.svg = d3.select(this.svgContainer.svgContainerDiv.nativeElement).select('svg');

    this.gHighlight = this.svg.append('g').classed('idac-highlights', true);
    this.gClickHint = this.svg.append('g').classed('idac-click-hint', true);

    const [annotationBackground, g2, annotationForeground] = d3AsSelectionArray(d3ImmediateChildren(this.svg, 'g'));
    const [title, legend, chart] = d3AsSelectionArray(d3ImmediateChildren(g2, 'g'));
    const items = d3AsSelectionArray(legend.selectAll('.legend'));
    const [marks, x, y, yLabel, xLabel] = d3AsSelectionArray(d3ImmediateChildren(chart, 'g'));
    const serieses = d3AsSelectionArray(d3ImmediateChildren(marks, 'g'));
    const rects = zip(serieses.map(d => d3AsSelectionArray(d3ImmediateChildren(d, 'rect'))));
    rects.forEach((elem: d3.Selection<any, any, any, any>[], i) => {
      elem.forEach(d => d.classed(`idac-bargroup-${i}`, true));
    });
    const bargroups = rects.map((_, i) => this.svg.selectAll(`.idac-bargroup-${i}`));
    const xTicks = d3AsSelectionArray(x.selectAll('.tick'));
    const yTicks = d3AsSelectionArray(y.selectAll('.tick'));

    const annotationRenderingArea = d3AsSelectionArray(
      d3ImmediateChildren(
        d3ImmediateChildren(annotationForeground, 'g'),
        'g')
      )[0];
    const renderedAnnotations = d3AsSelectionArray(d3ImmediateChildren(annotationRenderingArea, '*'));
    const annotationIds = renderedAnnotations.map(d => d.attr('class').split(' ')[0]);
    const uniqueAnnotationIds: string[] = annotationIds.reduce((accum, id) => {
      if (!accum.includes(id)) {
        accum.push(id);
      }
      return accum;
    }, []);
    const annotations = uniqueAnnotationIds.map(id => annotationForeground.selectAll(`.${id}`));

    const cs = this.chartSpec;
    const pairs = [
      [cs.title, title],
      [cs.y, y],
      [cs.x, x],
      [cs.legend, legend],
      [cs.marks, marks],
    ];
    cs.x.children.forEach((tick, i) => {
      pairs.push([tick, xTicks[i]]);
    });
    cs.legend.children.forEach((item, i) => {
      pairs.push([item, items[i]]);
    });
    cs.marks.children.forEach((bargroup, i) => {
      pairs.push([bargroup, (bargroups as any)[i]]);
      bargroup.children.forEach((bar, j) => {
        pairs.push([bar, d3AsSelectionArray(bargroups[i])[j]]);
      });
    });
    annotations.forEach((annotation, i) => {
      const tag = cs.annotations.findByAnnotation(cs.annotations.annotationInChartAccent(i));
      pairs.push([tag, annotation as any]);
    });
    this.elementLink = pairs.reduce((accum, [k, v]: [SpecTag, any]) => {
      accum[k._id] = v;
      return accum;
    }, {});

    Object.entries(this.elementLink).forEach(([tagId, selection]: [string, d3.Selection<any, any, any, any>]) => {
      const tag = this.chartSpec.findById(+tagId);
      const rect = this.makeRectFromBoundingBox(this.getMergedBoundingBox(selection), this.gClickHint)
        .style('fill', 'pink').style('fill-opacity', 0);
      rect.on('mouseover', function() { d3.select(this).style('fill-opacity', 0.5); });
      rect.on('mouseout', function() { d3.select(this).style('fill-opacity', 0); });
      rect.on('click', () => this._currentTagChange(tag));
    });
  }

  getMergedBoundingBox(selection: d3.Selection<any, any, any, any>) {
    const boundingBoxes = [
      ...selection.nodes().map(d => d3.select(d)),
      ...d3AsSelectionArray(selection.selectAll('*'))
    ].map(d => {
      const elem = d.node();
      const bbox = elem.getBBox();
      const convert = makeAbsoluteContext(elem, this.svg.node());
      return {
        ...convert(bbox.x, bbox.y),
        width: bbox.width,
        height: bbox.height
      };
    });
    const mergedBox = mergeBoundingBoxes(boundingBoxes);
    mergedBox.width = Math.max(mergedBox.width, 5);
    mergedBox.height = Math.max(mergedBox.height, 5);
    return mergedBox;
  }

  makeRectFromBoundingBox(box: any, location = null) {
    if (!location) {
      location = this.svg;
    }
    return location.append('rect').attr('transform', translate(box.x, box.y))
      .attr('width', box.width).attr('height', box.height);
  }

  ngAfterViewChecked() {
    if (this.ready) {
      this.svg.selectAll('.idac-highlight').remove();
      const target = this.elementLink[this.currentTag._id];
      if (target) {
        const mergedBox = this.getMergedBoundingBox(target);
        const highlightRect = this.makeRectFromBoundingBox(mergedBox, this.gHighlight)
          .style('fill', 'rgba(255, 255, 0, 0.5)')
          .classed('idac-highlight', true);

        // scroll horizontally
        const prevY = window.scrollY;
        highlightRect.node().scrollIntoView({inline: 'center'});
        window.scroll(window.scrollX, prevY);
      }
    }
  }

  _currentTagChange(tag: SpecTag) {
    this.currentTag = tag;
    this.currentTagChange.emit(this.currentTag);
  }

}
