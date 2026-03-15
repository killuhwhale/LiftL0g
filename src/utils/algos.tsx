import { FunctionComponent } from "react";
import { TouchableWithoutFeedback, View, StyleSheet } from "react-native";
import { useTheme } from "styled-components";

interface Matches {
  items: number[];
  marks: string[];
}

export const DAYSOFWEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const dateFormat = (dd: Date) => {
  const d = new Date(dd);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
};
export const dateFormatDayOfWeek = (dd: Date) => {
  // return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  const d = new Date(dd);
  return `${DAYSOFWEEK[d.getDay()]} ${
    MONTHS[d.getMonth()]
  } ${d.getDate()}, ${d.getFullYear()}`;
};

export const jListToNumStr = (jsonListStr: string) => {
  try {
    const list = JSON.parse(jsonListStr);
    // return list.toString().replaceAll(',', ' ');
    return list.toString().replace(/,/g, " ");
  } catch (err) {
    console.log("Err jListToNumStr ", err);
  }
};

export const COLORSPALETTE = [
  "#fa4659",
  "#ed93cb",
  "#a3de83",
  "#2eb872",
  "#f469a9",

  "#fd2eb3",
  "#add1fc",
  "#9870fc",
];

export const ColorPalette: FunctionComponent<{
  onSelect(colorIdx: number): void;
  selectedIdx: number;
}> = (props) => {
  const boxSize = 16;
  const theme = useTheme();
  return (
    <View style={{ width: "100%", height: boxSize, flexDirection: "row" }}>
      {Array.from(Array(8).keys()).map((idx) => {
        return (
          <View
            key={idx}
            style={{
              width: boxSize,
              height: boxSize,
              backgroundColor: COLORSPALETTE[idx],
              margin: 1,
            }}
          >
            <TouchableWithoutFeedback
              style={{ width: "100%", height: "100%", margin: 1 }}
              onPress={() => props.onSelect(idx)}
            >
              <View
                style={[
                  {
                    width: boxSize,
                    height: boxSize,
                    backgroundColor: COLORSPALETTE[idx],
                  },
                  props.selectedIdx === idx
                    ? {
                        borderWidth: 3,
                        borderColor: theme.palette.text,
                      }
                    : {},
                ]}
              />
            </TouchableWithoutFeedback>
          </View>
        );
      })}
    </View>
  );
};

export const numberInputStyle = StyleSheet.create({
  containerStyle: {
    width: "100%",
  },
});

// https://gist.github.com/vpalos/4334557
export const filter = (query: string, items: string[], options) => {
  // option producer
  function option(name, value) {
    options = options || {};
    return typeof options[name] !== "undefined" ? options[name] : value;
  }

  // prepare options
  var o_case = option("case", false);
  var o_mark = option("mark", true);
  var o_prefix = option("prefix", "<strong>");
  var o_suffix = option("suffix", "</strong>");
  var o_word = option("word", true);
  var o_limit = option("limit", 0);

  // prepare query
  query = o_case ? query : query.toLowerCase();
  query = query.replace(/\s+/g, o_word ? " " : "");
  query = query.replace(/(^\s+|\s+$)/g, "");
  const queryList = query.split(o_word ? " " : "");

  var ql = queryList.length;

  // prepare results
  const matches: Matches = {
    items: [],
    marks: [],
  };

  // search
  for (var ii = 0, il = items.length; ii < il; ii++) {
    // prepare text
    var text = o_case ? items[ii] : items[ii].toLowerCase();

    var mark = "";

    // traverse
    var ti = 0;
    var wi = 0;
    var wl = 0;
    for (var qi = 0; qi < ql; qi++) {
      wl = queryList[qi].length;
      wi = text.indexOf(queryList[qi], ti);
      if (wi === -1) {
        break;
      }
      if (o_mark) {
        if (wi > 0) {
          mark += items[ii].slice(ti, wi);
        }
        mark += o_prefix + items[ii].slice(wi, wi + wl) + o_suffix;
      }
      ti = wi + wl;
    }

    // capture
    if (qi == ql) {
      if (o_mark) {
        mark += items[ii].slice(ti);
        matches.marks.push(mark);
      }
      if (matches.items.push(ii) === o_limit && o_limit) {
        break;
      }
    }
  }

  // ready
  return matches;
};

// https://www.freecodecamp.org/news/javascript-debounce-example/
export const debounce = (func, timeout = 300) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
};

export const validEmailRegex = new RegExp(
  "([!#-'*+/-9=?A-Z^-~-]+(.[!#-'*+/-9=?A-Z^-~-]+)*|\"([]!#-[^-~ \t]|(\\[\t -~]))+\")@([!#-'*+/-9=?A-Z^-~-]+(.[!#-'*+/-9=?A-Z^-~-]+)*|[[\t -Z^-~]*])"
);
