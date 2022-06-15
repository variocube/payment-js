import * as React from "react";
import {Component, CSSProperties} from "react";

export class SvgLoader extends Component<{ svgString: string, className?: string, style?: CSSProperties }> {

    constructor(props: any) {
        super(props);

        SvgLoader.computeSvgViewport();
    }

    componentDidMount() {
        SvgLoader.computeSvgViewport();
    }

    componentDidUpdate(): void {
        SvgLoader.computeSvgViewport();
    }

    private static computeSvgViewport() {
        const icons = document.getElementsByClassName('vcp-icon');
        for (let i = 0; i < icons.length; i++) {
            const item = icons.item(i);
            if (item != null) {
                const svg = item.querySelector('svg');
                if (svg) {
                    const bB = svg.getBBox();
                    svg.setAttribute('viewBox', bB.x + ',' + bB.y + ',' + bB.width + ',' + bB.height);
                }
            }
        }
    }

    render() {
        const {svgString, className, style} = this.props;
        return <div className={['vcp-icon', className].join(' ')} style={style} dangerouslySetInnerHTML={{__html: svgString}} />;
    }
}