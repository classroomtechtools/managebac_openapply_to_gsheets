function reports_() {
    return {
        tabular: tabular_,
        jsonsToRowsWithHeaderChange: jsonsToRowsWithHeaderChange_,
        jsonsToRowsWithNestedHeaders: jsonsToRowsWithNestedHeaders_
    }
}

/**
 * Data studio doesn't have any way to display values with row and column dimentions, only aggregates
 * So I need this convoluted code below to shape it to show the values in each column, when grouped
 * @param jsons {Object[]} - List of jsons to apply the reshaping
 * @param keys {string[]} - Two items which are primary keys for the jsons. The first item is the key for the individual, second the group by property
 * @param targets {string[]} - The json properties of which to show the value of
 * @param tranform {Object} - Hooks for changing the value of any property. Keys bear the same name of the property; should be functions
 */
function tabular_(jsons, keys, targets, transform = {}) {
    const [primaryKey, ...tabKeys] = keys;
    const transformer = new Proxy(transform, {
        get: (target, name) => target.hasOwnProperty(name) ? target[name] : a => a
    });
    const trans = (key, value, json) => transformer[key](value, json)

    // make dictionary where keys are keys[0] (id)
    const step = jsons.reduce(
        (acc, json) => {
            const primaryValue = trans(primaryKey, dottie.get(json, primaryKey), json);
            const tabValues = tabKeys.map(key => trans(key, dottie.get(json, key), json)).join('.');
            const path = `${primaryValue}.${tabValues}`;
            if (!acc.hasOwnProperty(primaryValue)) {
                const leftovers = { ...json };
                dottie._delete(leftovers, primaryKey);
                tabKeys.forEach(key => dottie._delete(leftovers, key));
                for (const target of targets) {
                    dottie._delete(leftovers, target);
                }

                acc[primaryValue] = {
                    ...leftovers
                };

                dottie.set(acc, path, {});
            }
            for (const target of targets) {
                const val = dottie.get(json, target);
                dottie.set(acc, path + '.' + target, transformer[target](val, json));
            }
            return acc;
        }, {}
    );

    const output_jsons = [];
    for (const prop in step) {
        const json = {
            [primaryKey]: prop,
            ...step[prop]  // the others
        }
        output_jsons.push(json);
    }

    return output_jsons;
}

/**
 * Use dottie's jsonsToRows but change the headers for more appropriate output column names
 *  use for tabular report building
 */
function jsonsToRowsWithHeaderChange_({ jsons, priorityHeaders = ['id'], delimiter = ' — ' }) {
    let output = dottie.jsonsToRows(jsons, priorityHeaders);

    const headers = output[0];

    for (let [idx, header] of headers.entries()) {
        const pieces = header.split('.');
        for (let [i, piece] of pieces.entries()) {
            pieces[i] = piece.charAt(0).toUpperCase() + piece.substr(1)
        }
        headers[idx] = pieces.join(delimiter);
    }

    output = [headers, ...output.slice(1)];
    return output;
}


function jsonsToRowsWithNestedHeaders_({ jsons, startingIndex = null, endingIndexOffset = null, priorityHeaders = ['id'], delimiter = ' — ' }) {
    if (!startingIndex || !endingIndexOffset) throw new Error("unPackIndex must be non-null and non-zero");
    let output = dottie.jsonsToRows(jsons, priorityHeaders);

    const firstHeaders = output[0];
    const unpack = firstHeaders.slice(startingIndex, firstHeaders.length + endingIndexOffset)
        .map(h => h.replace('[', '.').replace(']', '.').replace('..', '.').split('.'));
    const nestedHeaders = [];
    let timeThrough = 0;
    do {
        timeThrough += 1;
        let headers;
        if (timeThrough === 1)
            headers = [...firstHeaders.slice(0, startingIndex)];
        else {
            headers = [...Array(startingIndex).fill(null)];
        }
        for (const index of unpack.keys()) {
            const value = unpack[index].pop();
            headers.push(value);
        }
        if (timeThrough === 1)
            headers = [...headers, ...firstHeaders.slice(startingIndex + headers.length + endingIndexOffset)]
        else
            headers = [...headers, ...Array(Math.abs(endingIndexOffset)).fill(null)];
        nestedHeaders.push(headers);
    } while (unpack.every(p => p.length > 0));

    nestedHeaders.reverse();
    output = [...nestedHeaders, ...output.slice(1)];

    return output;

}
