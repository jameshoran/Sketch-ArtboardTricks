/*
 * Copyright 2017 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as util from './sketch-util';
import * as common from './common';
import * as prefs from './prefs';


export default function(context) {
  let page = context.document.currentPage();
  let currentPrefs = prefs.resolvePagePrefs(context, page);
  let artboardMetas = common.generateArtboardMetas(
      common.collectTargetArtboards(context));

  let uniqueYPositions = new Set(artboardMetas.map(meta => meta.t));
  let numRows = uniqueYPositions.size;

  // sort artboards top-down then left-right
  artboardMetas.sort((a, b) => {
    if (a.t == b.t) {
      return a.l - b.l;
    } else {
      return a.t - b.t;
    }
  });

  // update artboard names
  let row = 0;
  let col = -1;
  let subCol = 0;
  let lastMetaT = null;
  artboardMetas.forEach(meta => {
    // strip off current digits and dots
    let fullName = meta.artboard.name();
    let currentNamePath = fullName.substring(0, fullName.lastIndexOf('/') + 1);
    let currentName = fullName.slice(currentNamePath.length);
    let [_, currentNumber, baseName] = currentName.match(/^([\d.]*)[_-]?(.*)$/);

    if (lastMetaT === null || lastMetaT != meta.t) {
      lastMetaT = meta.t;
      ++row;
      subCol = 0;
      col = -1;
    }

    if (currentNumber.indexOf('.') >= 0) {
      // in a subcol
      ++subCol;
      col = Math.max(0, col);
    } else {
      // not in a subcol
      if (subCol >= 0) {
        // no longer in a subcol
        subCol = 0;
      }

      ++col;
    }

    // create prefix (e.g. "301" and "415.4" with subflows)
    let prefix = zeropad(row, numRows >= 10 ? 2 : 1)
        + currentPrefs.rowColSeparator
        + zeropad(col, 2)
        + (subCol > 0 ? '.' + (subCol) : '');

    // add prefix to the name
    meta.artboard.setName(`${currentNamePath}${prefix}${currentPrefs.numberTitleSeparator}${baseName}`);
  });
}


/**
 * Left-pads the given string with zeros to the given length.
 */
function zeropad(s, length = 1) {
  s = String(s);
  s = s || '';
  while (s.length < length) {
    s = '0' + s;
  }
  return s;
}

