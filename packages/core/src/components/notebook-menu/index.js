// @flow
import * as Immutable from "immutable";
import * as React from "react";
import * as actions from "../../actions";
import * as selectors from "../../selectors";
import Menu, { SubMenu, Divider, MenuItem } from "rc-menu";
import type { ContentRef, KernelRef, KernelspecsRef } from "../../state/refs";
import type { KernelspecsByRefRecord } from "../../state/entities";
import { MENU_ITEM_ACTIONS, MENUS } from "./constants";
import { MODAL_TYPES } from "../modal-controller";
import { connect } from "react-redux";
import { localCss } from "./styles";

// To allow actions that can take dynamic arguments (like selecting a kernel
// based on the host's kernelspecs), we have some simple utility functions to
// stringify/parse actions/arguments.
const createActionKey = (action, ...args) => [action, ...args].join(":");
const parseActionKey = key => key.split(":");

type Props = {
  persistAfterClick?: boolean,
  defaultOpenKeys?: Array<string>,
  openKeys?: Array<string>,
  currentKernelRef: ?KernelRef,
  saveNotebook: ?(payload: *) => void,
  downloadNotebook: ?(payload: *) => void,
  executeCell: ?(payload: *) => void,
  executeAllCells: ?(payload: *) => void,
  executeAllCellsBelow: ?(payload: *) => void,
  clearAllOutputs: ?(payload: *) => void,
  unhideAll: ?(*) => void,
  cutCell: ?(payload: *) => void,
  copyCell: ?(payload: *) => void,
  mergeCellAfter: ?(payload: *) => void,
  notebook: Immutable.Map<string, *>,
  pasteCell: ?(payload: *) => void,
  createCellAfter: ?(payload: *) => void,
  changeCellType: ?(payload: *) => void,
  setTheme: ?(theme: ?string) => void,
  openAboutModal: ?() => void,
  changeKernelByName: ?(payload: {
    kernelSpecName: string,
    oldKernelRef: ?KernelRef,
    contentRef: ContentRef
  }) => void,
  restartKernel: ?(payload: *) => void,
  restartKernelAndClearOutputs: ?(payload: *) => void,
  killKernel: ?(payload: *) => void,
  interruptKernel: ?(payload: *) => void,
  currentContentRef: ContentRef,
  currentKernelspecsRef: ?KernelspecsRef,
  currentKernelspecs: ?KernelspecsByRefRecord
};

type State = {
  openKeys?: Array<string>
};

class PureNotebookMenu extends React.Component<Props, State> {
  static defaultProps = {
    cellFocused: null,
    saveNotebook: null,
    downloadNotebook: null,
    currentKernelRef: null,
    executeCell: null,
    executeAllCells: null,
    executeAllCellsBelow: null,
    clearAllOutputs: null,
    unhideAll: null,
    cutCell: null,
    copyCell: null,
    mergeCellAfter: null,
    pasteCell: null,
    createCellAfter: null,
    setCellTypeCode: null,
    setCellTypeMarkdown: null,
    setTheme: null,
    openAboutModal: null,
    changeKernelByName: null,
    restartKernel: null,
    killKernel: null,
    interruptKernel: null,
    currentKernelspecsRef: null,
    currentKernelspecs: null
  };
  state = {};
  handleClick = ({ key }: { key: string }) => {
    const {
      persistAfterClick,
      saveNotebook,
      downloadNotebook,
      changeKernelByName,
      currentKernelRef,
      copyCell,
      createCellAfter,
      cutCell,
      executeCell,
      executeAllCells,
      executeAllCellsBelow,
      clearAllOutputs,
      unhideAll,
      mergeCellAfter,
      openAboutModal,
      pasteCell,
      setTheme,
      changeCellType,
      restartKernel,
      restartKernelAndClearOutputs,
      killKernel,
      interruptKernel,
      currentContentRef,
      currentKernelspecsRef,
      currentKernelspecs
    } = this.props;
    const [action, ...args] = parseActionKey(key);
    switch (action) {
      case MENU_ITEM_ACTIONS.SAVE_NOTEBOOK:
        if (saveNotebook) {
          saveNotebook({ contentRef: currentContentRef });
        }
        break;
      case MENU_ITEM_ACTIONS.DOWNLOAD_NOTEBOOK:
        if (downloadNotebook) {
          downloadNotebook({ contentRef: currentContentRef });
        }
        break;
      case MENU_ITEM_ACTIONS.COPY_CELL:
        if (copyCell) {
          copyCell({ contentRef: currentContentRef });
        }
        break;
      case MENU_ITEM_ACTIONS.CUT_CELL:
        if (cutCell) {
          cutCell({ contentRef: currentContentRef });
        }
        break;
      case MENU_ITEM_ACTIONS.PASTE_CELL:
        if (pasteCell) {
          pasteCell({ contentRef: currentContentRef });
        }
        break;
      case MENU_ITEM_ACTIONS.MERGE_CELL_AFTER:
        if (mergeCellAfter) {
          mergeCellAfter({ contentRef: currentContentRef });
        }
        break;
      case MENU_ITEM_ACTIONS.CREATE_CODE_CELL:
        if (createCellAfter) {
          createCellAfter({
            cellType: "code",
            source: "",
            contentRef: currentContentRef
          });
        }
        break;
      case MENU_ITEM_ACTIONS.CREATE_MARKDOWN_CELL:
        if (createCellAfter) {
          createCellAfter({
            cellType: "markdown",
            source: "",
            contentRef: currentContentRef
          });
        }
        break;
      case MENU_ITEM_ACTIONS.SET_CELL_TYPE_CODE:
        if (changeCellType) {
          changeCellType({
            to: "code",
            contentRef: currentContentRef
          });
        }
        break;
      case MENU_ITEM_ACTIONS.SET_CELL_TYPE_MARKDOWN:
        if (changeCellType) {
          changeCellType({
            to: "markdown",
            contentRef: currentContentRef
          });
        }
        break;
      case MENU_ITEM_ACTIONS.EXECUTE_ALL_CELLS:
        if (executeAllCells) {
          executeAllCells({ contentRef: currentContentRef });
        }
        break;
      case MENU_ITEM_ACTIONS.EXECUTE_ALL_CELLS_BELOW:
        if (executeAllCellsBelow) {
          executeAllCellsBelow({ contentRef: currentContentRef });
        }
        break;
      case MENU_ITEM_ACTIONS.UNHIDE_ALL:
        if (unhideAll) {
          unhideAll({
            outputHidden: false,
            inputHidden: false,
            contentRef: currentContentRef
          });
        }
        break;
      case MENU_ITEM_ACTIONS.CLEAR_ALL_OUTPUTS:
        if (clearAllOutputs) {
          clearAllOutputs({ contentRef: currentContentRef });
        }
        break;
      case MENU_ITEM_ACTIONS.SET_THEME_DARK:
        if (setTheme) {
          setTheme("dark");
        }
        break;
      case MENU_ITEM_ACTIONS.SET_THEME_LIGHT:
        if (setTheme) {
          setTheme("light");
        }
        break;
      case MENU_ITEM_ACTIONS.OPEN_ABOUT:
        if (openAboutModal) {
          openAboutModal();
        }
        break;
      case MENU_ITEM_ACTIONS.INTERRUPT_KERNEL:
        if (interruptKernel) {
          interruptKernel({ kernelRef: currentKernelRef });
        }
        break;
      case MENU_ITEM_ACTIONS.RESTART_KERNEL:
        if (restartKernel) {
          restartKernel({
            kernelRef: currentKernelRef,
            contentRef: currentContentRef
          });
        }
        break;
      case MENU_ITEM_ACTIONS.KILL_KERNEL:
        if (killKernel) {
          killKernel({ kernelRef: currentKernelRef });
        }
        break;
      case MENU_ITEM_ACTIONS.RESTART_AND_CLEAR_OUTPUTS:
        if (restartKernelAndClearOutputs) {
          restartKernelAndClearOutputs({
            kernelRef: currentKernelRef,
            contentRef: currentContentRef
          });
        }
        break;
      case MENU_ITEM_ACTIONS.CHANGE_KERNEL:
        if (changeKernelByName) {
          changeKernelByName({
            oldKernelRef: currentKernelRef,
            contentRef: currentContentRef,
            kernelSpecName: args[0]
          });
        }
        break;
      default:
        console.log(`unhandled action: ${action}`);
    }

    if (!persistAfterClick) {
      this.setState({ openKeys: [] });
    }
  };
  handleOpenChange = (openKeys: Array<string>) => {
    if (!this.props.persistAfterClick) {
      this.setState({ openKeys });
    }
  };
  componentWillMount() {
    // This ensures that we can still initially set defaultOpenKeys when
    // persistAfterClick is true.
    this.setState({ openKeys: this.props.defaultOpenKeys });
  }
  render() {
    const {
      currentKernelspecs,
      defaultOpenKeys,
      persistAfterClick
    } = this.props;
    const { openKeys } = this.state;
    const menuProps: Object = {
      mode: "horizontal",
      onClick: this.handleClick,
      onOpenChange: this.handleOpenChange,
      defaultOpenKeys: defaultOpenKeys,
      selectable: false
    };
    if (!persistAfterClick) {
      menuProps.openKeys = openKeys;
    }
    return (
      <div>
        <Menu {...menuProps}>
          <SubMenu key={MENUS.FILE} title="File">
            <MenuItem key={createActionKey(MENU_ITEM_ACTIONS.SAVE_NOTEBOOK)}>
              Save
            </MenuItem>
            <MenuItem
              key={createActionKey(MENU_ITEM_ACTIONS.DOWNLOAD_NOTEBOOK)}
            >
              Download (.ipynb)
            </MenuItem>
          </SubMenu>
          <SubMenu key={MENUS.EDIT} title="Edit">
            <MenuItem key={createActionKey(MENU_ITEM_ACTIONS.CUT_CELL)}>
              Cut Cell
            </MenuItem>
            <MenuItem key={createActionKey(MENU_ITEM_ACTIONS.COPY_CELL)}>
              Copy Cell
            </MenuItem>
            <MenuItem key={createActionKey(MENU_ITEM_ACTIONS.PASTE_CELL)}>
              Paste Cell Below
            </MenuItem>
            <MenuItem key={createActionKey(MENU_ITEM_ACTIONS.MERGE_CELL_AFTER)}>
              Merge With Cell Below
            </MenuItem>
            <Divider />
            <SubMenu key={MENUS.EDIT_SET_CELL_TYPE} title="Cell Type">
              <MenuItem
                key={createActionKey(MENU_ITEM_ACTIONS.SET_CELL_TYPE_CODE)}
              >
                Code
              </MenuItem>
              <MenuItem
                key={createActionKey(MENU_ITEM_ACTIONS.SET_CELL_TYPE_MARKDOWN)}
              >
                Markdown
              </MenuItem>
            </SubMenu>
          </SubMenu>
          <SubMenu key={MENUS.VIEW} title="View">
            <SubMenu key={MENUS.VIEW_THEMES} title="themes">
              <MenuItem
                key={createActionKey(MENU_ITEM_ACTIONS.SET_THEME_LIGHT)}
              >
                light
              </MenuItem>
              <MenuItem key={createActionKey(MENU_ITEM_ACTIONS.SET_THEME_DARK)}>
                dark
              </MenuItem>
            </SubMenu>
          </SubMenu>
          <SubMenu key={MENUS.CELL} title="Cell">
            <MenuItem
              key={createActionKey(MENU_ITEM_ACTIONS.EXECUTE_ALL_CELLS)}
            >
              Run All Cells
            </MenuItem>
            <MenuItem
              key={createActionKey(MENU_ITEM_ACTIONS.EXECUTE_ALL_CELLS_BELOW)}
            >
              Run All Cells Below
            </MenuItem>
            <Divider />
            <SubMenu key={MENUS.CELL_CREATE_CELL} title="New Cell">
              <MenuItem
                key={createActionKey(MENU_ITEM_ACTIONS.CREATE_CODE_CELL)}
              >
                Code
              </MenuItem>
              <MenuItem
                key={createActionKey(MENU_ITEM_ACTIONS.CREATE_MARKDOWN_CELL)}
              >
                Markdown
              </MenuItem>
            </SubMenu>
            <Divider />

            <MenuItem
              key={createActionKey(MENU_ITEM_ACTIONS.CLEAR_ALL_OUTPUTS)}
            >
              Clear All Outputs
            </MenuItem>

            <MenuItem key={createActionKey(MENU_ITEM_ACTIONS.UNHIDE_ALL)}>
              Unhide All Input and Output
            </MenuItem>
          </SubMenu>

          <SubMenu key={MENUS.RUNTIME} title="Runtime">
            <MenuItem key={createActionKey(MENU_ITEM_ACTIONS.INTERRUPT_KERNEL)}>
              Interrupt
            </MenuItem>
            <Divider />
            <MenuItem key={createActionKey(MENU_ITEM_ACTIONS.KILL_KERNEL)}>
              Halt
            </MenuItem>
            <MenuItem key={createActionKey(MENU_ITEM_ACTIONS.RESTART_KERNEL)}>
              Restart
            </MenuItem>
            <MenuItem
              key={createActionKey(MENU_ITEM_ACTIONS.RESTART_AND_CLEAR_OUTPUTS)}
            >
              Restart and Clear All Cells
            </MenuItem>
            <Divider />
            <SubMenu
              key={MENUS.RUNTIME_CHANGE_KERNEL}
              title="Change Kernel"
              disabled={!currentKernelspecs}
            >
              {currentKernelspecs
                ? currentKernelspecs.byName
                    .keySeq()
                    .map(name => [
                      name,
                      currentKernelspecs.byName.getIn([name, "displayName"])
                    ])
                    .toArray()
                    .map(([name, displayName]) => {
                      return (
                        <MenuItem
                          key={createActionKey(
                            MENU_ITEM_ACTIONS.CHANGE_KERNEL,
                            name
                          )}
                        >
                          {displayName}
                        </MenuItem>
                      );
                    })
                : null}
            </SubMenu>
          </SubMenu>

          <SubMenu key={MENUS.HELP} title="Help">
            <MenuItem key={createActionKey(MENU_ITEM_ACTIONS.OPEN_ABOUT)}>
              About
            </MenuItem>
          </SubMenu>
        </Menu>
        <style global jsx>
          {localCss}
        </style>
        <style jsx>{`
          position: sticky;
          top: 0;
          // TODO: this is getting ridiculous...
          z-index: 10000;
        `}</style>
      </div>
    );
  }
}

// TODO: this forces the menu to re-render on cell focus. The better option is
// to alter how the actions work to just target the currently focused cell.
// That said, we *may* not have a great way of getting around this as we'll need
// information about the current document to decide which menu items are
// available...
const mapStateToProps = state => {
  const contentRef = selectors.currentContentRef(state);
  if (!contentRef) {
    throw new Error("There must be a contentRef for this menu");
  }

  return {
    currentKernelRef: selectors.currentKernelRef(state),
    currentContentRef: contentRef,
    currentKernelspecsRef: selectors.currentKernelspecsRef(state),
    currentKernelspecs: selectors.currentKernelspecs(state)
  };
};

const mapDispatchToProps = dispatch => ({
  saveNotebook: (payload: *) => dispatch(actions.save(payload)),
  downloadNotebook: (payload: *) => dispatch(actions.downloadContent(payload)),
  executeCell: (payload: *) => dispatch(actions.executeCell(payload)),
  executeAllCells: (payload: *) => dispatch(actions.executeAllCells(payload)),
  executeAllCellsBelow: (payload: *) =>
    dispatch(actions.executeAllCellsBelow(payload)),
  clearAllOutputs: (payload: *) => dispatch(actions.clearAllOutputs(payload)),
  unhideAll: payload => dispatch(actions.unhideAll(payload)),
  cutCell: (payload: *) => dispatch(actions.cutCell(payload)),
  copyCell: (payload: *) => dispatch(actions.copyCell(payload)),
  pasteCell: (payload: *) => dispatch(actions.pasteCell(payload)),
  mergeCellAfter: (payload: *) => dispatch(actions.mergeCellAfter(payload)),
  createCellAfter: (payload: *) => dispatch(actions.createCellAfter(payload)),
  changeCellType: (payload: *) => dispatch(actions.changeCellType(payload)),
  setTheme: theme => dispatch(actions.setTheme(theme)),
  openAboutModal: () =>
    dispatch(actions.openModal({ modalType: MODAL_TYPES.ABOUT })),
  changeKernelByName: payload => dispatch(actions.changeKernelByName(payload)),
  restartKernel: payload => dispatch(actions.restartKernel(payload)),
  restartKernelAndClearOutputs: payload =>
    dispatch(actions.restartKernel({ ...payload, clearOutputs: true })),
  killKernel: payload => dispatch(actions.killKernel(payload)),
  interruptKernel: payload => dispatch(actions.interruptKernel(payload))
});

const NotebookMenu = connect(mapStateToProps, mapDispatchToProps)(
  PureNotebookMenu
);

// We export this for testing purposes.
export { PureNotebookMenu };

export default NotebookMenu;
