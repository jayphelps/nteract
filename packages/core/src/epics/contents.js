/* @flow */
import { empty } from "rxjs/observable/empty";
import { of } from "rxjs/observable/of";
import {
  tap,
  filter,
  map,
  mergeMap,
  mapTo,
  switchMap,
  catchError
} from "rxjs/operators";
import { ofType } from "redux-observable";

import FileSaver from "file-saver";

import * as actions from "../actions";
import * as actionTypes from "../actionTypes";
import * as selectors from "../selectors";

import type { ActionsObservable } from "redux-observable";

import { contents } from "rx-jupyter";

import { fromJS, toJS, stringifyNotebook } from "@nteract/commutable";
import type { Notebook } from "@nteract/commutable";

export function fetchContentEpic(
  action$: ActionsObservable<*>,
  store: Store<*, *>
) {
  return action$.pipe(
    ofType(actionTypes.FETCH_CONTENT),
    switchMap((action: actionTypes.FetchContent) => {
      if (!action.payload || typeof action.payload.filepath !== "string") {
        return of({
          type: "ERROR",
          error: true,
          payload: { error: new Error("fetching content needs a payload") }
        });
      }

      const state = store.getState();

      const host = selectors.currentHost(state);
      if (host.type !== "jupyter") {
        // Dismiss any usage that isn't targeting a jupyter server
        return empty();
      }
      const serverConfig = selectors.serverConfig(host);

      return contents
        .get(serverConfig, action.payload.filepath, action.payload.params)
        .pipe(
          tap(xhr => {
            if (xhr.status !== 200) {
              throw new Error(xhr.response);
            }
          }),
          map(xhr => {
            return actions.fetchContentFulfilled({
              filepath: action.payload.filepath,
              model: xhr.response,
              kernelRef: action.payload.kernelRef,
              contentRef: action.payload.contentRef
            });
          }),
          catchError((xhrError: any) =>
            of(
              actions.fetchContentFailed({
                filepath: action.payload.filepath,
                error: xhrError,
                kernelRef: action.payload.kernelRef,
                contentRef: action.payload.contentRef
              })
            )
          )
        );
    })
  );
}

export function downloadString(
  fileContents: string,
  filepath: string,
  contentType: string
) {
  const filename = filepath.split("/").pop();
  const blob = new Blob([fileContents], { type: contentType });
  // NOTE: There is no callback for this, we have to rely on the browser
  //       to do this well, so we assume it worked
  FileSaver.saveAs(blob, filename);
}

export function saveContentEpic(
  action$: ActionsObservable<Action>,
  store: Store<*, *>
) {
  return action$.pipe(
    ofType(actionTypes.SAVE, actionTypes.DOWNLOAD_CONTENT),
    mergeMap(
      (
        action: actionTypes.Save | actionTypes.DownloadContent
      ): ActionsObservable<Action> => {
        const state = store.getState();

        const host = selectors.currentHost(state);
        if (host.type !== "jupyter") {
          // Dismiss any usage that isn't targeting a jupyter server
          return empty();
        }
        const contentRef = action.payload.contentRef;
        const content = selectors.content(state, { contentRef });

        // NOTE: This could save by having selectors for each model type
        //       have toDisk() selectors
        //       It will need to be cased off when we have more than one type
        //       of content we actually save
        if (!content) {
          const errorPayload = {
            error: new Error("Content was not set."),
            contentRef: action.payload.contentRef
          };
          if (action.type === actionTypes.DownloadContent) {
            return of(actions.downloadContentFailed(errorPayload));
          }
          return of(actions.saveFailed(errorPayload));
        }

        let filepath = content.filepath;

        // TODO: this default version should probably not be here.
        const appVersion = selectors.appVersion(state) || "0.0.0-beta";

        // This could be object for notebook, or string for files
        let serializedData: Notebook | string;
        let saveModel = {};
        if (content.type === "notebook") {
          // contents API takes notebook as raw JSON whereas downloading takes
          // a string
          serializedData = toJS(
            content.model.notebook.setIn(
              ["metadata", "nteract", "version"],
              appVersion
            )
          );
          saveModel = {
            content: serializedData,
            type: content.type
          };
        } else if (content.type === "file") {
          serializedData = content.model.text;
          saveModel = {
            content: serializedData,
            type: content.type,
            format: "text"
          };
        } else {
          // This shouldn't happen, is here for safety
          return empty();
        }

        switch (action.type) {
          case actionTypes.DOWNLOAD_CONTENT: {
            // FIXME: Convert this to downloadString, so it works for both files & notebooks
            if (
              content.type === "notebook" &&
              typeof serializedData === "object"
            ) {
              downloadString(
                stringifyNotebook(serializedData),
                filepath || "notebook.ipynb",
                "application/json"
              );
            } else if (
              content.type === "file" &&
              typeof serializedData === "string"
            ) {
              downloadString(
                serializedData,
                filepath,
                content.mimetype || "application/octet-stream"
              );
            } else {
              // This shouldn't happen, is here for safety
              return empty();
            }
            return of(
              actions.downloadContentFulfilled({
                contentRef: action.payload.contentRef
              })
            );
          }
          case actionTypes.SAVE: {
            const serverConfig = selectors.serverConfig(host);

            // if (action.type === actionTypes.SAVE)
            return contents.save(serverConfig, filepath, saveModel).pipe(
              mapTo(
                actions.saveFulfilled({ contentRef: action.payload.contentRef })
              ),
              catchError((error: Error) =>
                of(
                  actions.saveFailed({
                    error,
                    contentRef: action.payload.contentRef
                  })
                )
              )
            );
          }
          default:
            // NOTE: Flow types and our ofType should prevent reaching here, this
            // is here merely as safety
            return empty();
        }
      }
    )
  );
}
