// @flow
import * as React from "react";
import { connect } from "react-redux";
import * as actions from "../actions";
import type { ContentRef } from "../state/refs";

type Props = {
  above: boolean,
  createCell: (type: string) => void,
  mergeCell: () => void
};

type ConnectedProps = {
  above: boolean,
  createCellAppend: (payload: *) => void,
  createCellBefore: (payload: *) => void,
  createCellAfter: (payload: *) => void,
  mergeCellAfter: (payload: *) => void,
  id?: string,
  contentRef: ContentRef
};

import {
  CodeOcticon,
  MarkdownOcticon,
  DownArrowOcticon
} from "@nteract/octicons";

export const PureCellCreator = (props: Props) => (
  <div className="creator-hover-mask">
    <div className="creator-hover-region">
      <div className="cell-creator">
        <button
          onClick={() => props.createCell("markdown")}
          title="create text cell"
          className="add-text-cell"
        >
          <span className="octicon">
            <MarkdownOcticon />
          </span>
        </button>
        <button
          onClick={() => props.createCell("code")}
          title="create code cell"
          className="add-code-cell"
        >
          <span className="octicon">
            <CodeOcticon />
          </span>
        </button>
        {props.above ? null : (
          <button
            onClick={() => props.mergeCell()}
            title="merge cells"
            className="merge-cell"
          >
            <span className="octicon">
              <DownArrowOcticon />
            </span>
          </button>
        )}
      </div>
    </div>
    <style jsx>{`
      .creator-hover-mask {
        display: block;
        position: relative;
        overflow: visible;
        height: 0px;
      }

      .creator-hover-region {
        position: relative;
        overflow: visible;
        top: -10px;
        height: 60px;
        text-align: center;
      }

      .cell-creator {
        display: none;
        background: var(--theme-cell-creator-bg);
        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.5);
        pointer-events: all;
        position: relative;
        top: -5px;
      }

      .cell-creator button {
        display: inline-block;

        width: 22px;
        height: 20px;
        padding: 0px 4px;

        text-align: center;

        border: none;
        outline: none;
        background: none;
      }

      .cell-creator button span {
        font-size: 15px;
        line-height: 1;

        color: var(--theme-cell-creator-fg);
      }

      .cell-creator button span:hover {
        color: var(--theme-cell-creator-fg-hover);
      }

      .creator-hover-region:hover > .cell-creator {
        display: inline-block;
      }

      .octicon {
        transition: color 0.5s;
      }
    `}</style>
  </div>
);

class CellCreator extends React.Component<ConnectedProps> {
  createCell: (type: string) => void;
  mergeCell: () => void;

  constructor(): void {
    super();
    this.createCell = this.createCell.bind(this);
    this.mergeCell = this.mergeCell.bind(this);
  }

  createCell(type: "code" | "markdown"): void {
    const {
      above,
      createCellAfter,
      createCellAppend,
      createCellBefore,
      id,
      contentRef
    } = this.props;

    if (!id) {
      createCellAppend({ cellType: type, contentRef });
      return;
    }

    above
      ? createCellBefore({ cellType: type, id, contentRef })
      : createCellAfter({ cellType: type, id, source: "", contentRef });
  }

  mergeCell(): void {
    const { mergeCellAfter, id, contentRef } = this.props;

    // We can't merge cells if we don't have a cell ID
    if (id) {
      mergeCellAfter({ id, contentRef });
    }
  }

  render(): React$Element<any> {
    return (
      <PureCellCreator
        above={this.props.above}
        createCell={this.createCell}
        mergeCell={this.mergeCell}
      />
    );
  }
}

const mapDispatchToProps = dispatch => ({
  createCellAppend: (payload: *) => dispatch(actions.createCellAppend(payload)),
  createCellBefore: (payload: *) => dispatch(actions.createCellBefore(payload)),
  createCellAfter: (payload: *) => dispatch(actions.createCellAfter(payload)),
  mergeCellAfter: (payload: *) => dispatch(actions.mergeCellAfter(payload))
});

export default connect(null, mapDispatchToProps)(CellCreator);
