import { Dimensions, Platform } from "react-native";
import styled from "styled-components/native";
import { WorkoutStats } from "../app_components/Stats/StatsPanel";
import { SPACES_URL } from "../utils/constants";
import {
  WorkkoutItemsList,
  WorkoutCardProps,
  WorkoutDualItemProps,
  AnyWorkoutItem,
  WorkoutItemProps,
  WorkoutNameProps,
} from "./Cards/types";

import twrnc from "twrnc";
import { UserProps } from "@/app/types";
import { WorkoutMaxProps } from "@/app/WorkoutItemMaxes";
import { StatProps } from "@/hooks/useStats";

export const Container = styled.View`
  flex: 1;
  align-items: center;
  background-color: ${(props) => props.theme.palette.backgroundColor};
`;
export type ErrorProps = {
  status: number;
  data: string;
};
const KG2LB = 2.20462;
const LB2KG = 0.453592;

export const SCREEN_WIDTH = Dimensions.get("screen").width;
export const SCREEN_HEIGHT = Dimensions.get("screen").height;
export function lightenHexColor(hexColor: string, factor: number): string {
  // Convert hex to RGB
  let r: number = parseInt(hexColor.substring(1, 3), 16);
  let g: number = parseInt(hexColor.substring(3, 5), 16);
  let b: number = parseInt(hexColor.substring(5, 7), 16);

  // Lighten the color
  r = Math.round(r * factor);
  g = Math.round(g * factor);
  b = Math.round(b * factor);

  // Ensure values are within [0, 255]
  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));

  // Convert RGB back to HEX
  return `#${r.toString(16).padStart(2, "0")}${g
    .toString(16)
    .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

export const lightRed = twrnc.color("bg-red-400");
export const red = twrnc.color("bg-red-500");
export const darkRed = twrnc.color("bg-red-800");
export const green = twrnc.color("bg-emerald-600");

export const tsPageTitle: number = Platform.OS === "ios" ? 20 : 20;
export const tsParagrapgh: number = Platform.OS === "ios" ? 12 : 12;
export const tsListTitle: number = Platform.OS === "ios" ? 14 : 14; // medium weight
export const tsSnippet: number = Platform.OS === "ios" ? 11 : 11;
export const tsCaption: number = Platform.OS === "ios" ? 11 : 11; // lighter color
export const tsButton: number = Platform.OS === "ios" ? 14 : 14; // medium weight
export const tsInput: number = Platform.OS === "ios" ? 16 : 16;
export const tsInputSm: number = Platform.OS === "ios" ? 9 : 9;
export const tsDate: number = Platform.OS === "ios" ? 9 : 9;

// Deprecated....
export const titleFontSize: number = Platform.OS === "ios" ? 44 : 44;
export const lgFontSize: number = Platform.OS === "ios" ? 32 : 32;
export const regFontSize: number = Platform.OS === "ios" ? 20 : 20;
export const mdFontSize: number = Platform.OS === "ios" ? 18 : 18;
export const smFontSize: number = Platform.OS === "ios" ? 12 : 12;
export const xsmFontSize: number = Platform.OS === "ios" ? 10 : 10;

const cardWidth = SCREEN_WIDTH * 0.92;
const itemWidth = cardWidth * 0.42;

export const WORKOUTITEM_WIDTH: number =
  Platform.OS === "ios" ? itemWidth : itemWidth;

export const WORKOUTITEM_HEIGHT: number = Platform.OS === "ios" ? 150 : 150;

export const STANDARD_W = "STANDARD";
export const REPS_W = "REPS";
export const ROUNDS_W = "ROUNDS";
export const CREATIVE_W = "CREATIVE";

export const WORKOUT_TYPES: Array<string> = [
  STANDARD_W,
  REPS_W,
  ROUNDS_W,
  CREATIVE_W,
];
export const WORKOUT_TYPE_LABELS: Array<string> = [
  "",
  "Rep scheme",
  "Rounds",
  "Time",
  "Score",
];
export const AddItemFontsize = 14;

export const DURATION_UNITS: Array<string> = ["sec", "mins"];
export const WEIGHT_UNITS: Array<string> = ["kg", "lb", "%"];
export const WEIGHT_UNITS_SET: Set<string> = new Set(["kg", "lb"]);
export const PERCENTAGE_UNITS: Set<string> = new Set(["%"]);
export const BODYWEIGHT_UNITS: Set<string> = new Set(["bw"]);
export const DISTANCE_UNITS_SET: Set<string> = new Set(["m", "yd"]);
export const DISTANCE_UNITS: Array<string> = ["m", "yd"];

export const GYM_MEDIA = 0;
export const CLASS_MEDIA = 1;
export const WORKOUT_MEDIA = 2;
export const NAME_MEDIA = 3;
export const USER_MEDIA = 4;
export const COMPLETED_WORKOUT_MEDIA = 5;
export const MEDIA_CLASSES: Array<string> = [
  "gyms",
  "classes",
  "workouts",
  "names",
  "users",
  "completedWorkouts",
];

export const GymTitleLimit = 50;
export const GymDescLimit = 280;
export const GymClassTitleLimit = 50;
export const GymClassDescLimit = 280;
export const WorkoutGroupTitleLimit = 50;
export const WorkoutGroupDescLimit = 280;
export const WorkoutTitleLimit = 50;
export const WorkoutDescLimit = 280;
export const CompletedWorkoutGroupCaptionLimit = 280;
export const WorkoutDualItemCreativePenaltyLimit = 280;
export const MaxDigits = 9;
export const SchemeTextLimit = 20;
export const CreateSchemeInstructionLimit = 100;

// Url for Digital Ocean Spaces API
export const withSpaceURL = (
  url: string,
  mediaClassID: number,
  mediaClass: string
) => {
  return `${SPACES_URL}/fitform/${mediaClass}/${mediaClassID}/${url}`;
};

export function shuffle<T>(array: T[]) {
  for (let i = array.length - 1; i > 0; i--) {
    // pick a random index from 0 to i
    const j = Math.floor(Math.random() * (i + 1));
    // swap array[i] and array[j]
    [array[i], array[j]] = [array[j], array[i]];
  }
}

export const nanOrNah = (str: string) => {
  return isNaN(parseInt(str)) ? 0 : parseInt(str);
};
export const numFilter = (str: string): string => {
  const r = str.replace(/[^0-9]/g, "");
  return r;
};
export const numFilterWithSpaces = (str: string): string => {
  const r = str.replace(/[^0-9\s]/g, "");
  const hasSpace = r[r.length - 1] === " ";
  return hasSpace ? r.trim() + " " : r.trim();
};
export const displayJList = (weights: string) => {
  return weights ? weights.toString().replace("[", "").replace("]", "") : " ";
};
// Converts string of nums to stringified number[]
export const jList = (str: string): string => {
  if (!str) {
    return JSON.stringify([]);
  }
  const S = str.trim();
  if (!S) {
    return JSON.stringify([]);
  }
  return JSON.stringify(S.split(" ").map((strnum: string) => parseInt(strnum)));
};

export function jsonCopy<T>(item: T): T {
  return JSON.parse(JSON.stringify(item));
}

export const TEMPLATE_NAMES = ["5_3_1", "GIL_CYCLE"];

export function fillTemplateWorkoutItems(
  rawItems: Array<{
    workout: number;
    name: WorkoutNameProps;
    sets: number;
    reps: number[];
    weights: number[];
    duration?: number[];
    distance?: number[];
    duration_unit?: number;
    distance_unit?: number;
    weight_unit?: string;
    order?: number;
  }>
): AnyWorkoutItem[] {
  return rawItems.map((item, idx) => {
    const {
      workout,
      name,
      sets,
      reps,
      weights,
      duration,
      distance,
      duration_unit,
      distance_unit,
      weight_unit,
      order,
    } = item;
    console.log("We have a prob with weights: ", weights);
    const weightString = weights.toString().replaceAll(",", " ");
    console.log("weightString.length", weightString);
    const ans = weightString.length > 2 ? weightString : "[0]";

    console.log("repssss", reps);
    console.log("dist", distance);
    console.log("duration", duration);

    return {
      workout,
      name,
      ssid: -1,
      constant: false,
      pause_duration: 0,
      sets: sets ? sets : 1,

      // join arrays into comma-strings (the format your API expects)
      reps: reps?.toString().replaceAll(",", " ") ?? "[0]",
      duration: duration?.toString().replaceAll(",", " ") ?? "[0]",
      distance: distance?.toString().replaceAll(",", " ") ?? "[0]",

      duration_unit: duration_unit ?? 0,
      distance_unit: distance_unit ?? 0,

      //   weights: weights?.join(",") ?? "",
      weights: ans,
      //   weights: "[0]",
      weight_unit: weight_unit ?? "kg",

      rest_duration: 0,
      rest_duration_unit: 0,
      percent_of: "",

      order: order ?? idx,
      date: "",
      id: 0,
    } as AnyWorkoutItem;
  });
}

export const defaultStats = {
  totalReps: 0,
  totalLbs: 0,
  totalKgs: 0,

  // Total duration seconds
  totalTime: 0,
  totalKgSec: 0,
  totalLbSec: 0,

  // Total Distance Meters
  totalDistanceM: 0,
  totalDistanceY: 0,
  totalKgM: 0,
  totalLbM: 0,
  key: "",
} as WorkoutStats;

const dotProd = (a: number[], b: number[]): number => {
  if (!a.length || !b.length || !(a.length === b.length)) {
    return 0;
  }
  const A = [...a];
  b.forEach((n, i) => {
    A[i] *= b[i];
  });

  return A.reduce((p, c) => p + c, 0);
};

const expandArray = (arr, len) => {
  // If arr is length 1, we will expand the arr to length: len and fill with value: arr[0] else we willl fill with 0 .
  return arr.length < 2
    ? Array.from({ length: len }, (v, i) => (arr.length == 1 ? arr[0] : 0))
    : arr;
};

export class CalcWorkoutStats {
  /** To use:
   *
   * setWorkoutParams(schemeRounds, schemeType, items)
   * calc()
   *
   */
  schemeRounds: string;
  schemeType: number;
  items: WorkkoutItemsList;
  workoutItemMaxesMap: Map<string, WorkoutMaxProps>;

  isFormatted = false;
  ownedByClass = false;
  tags = {};
  names = {};

  // Formatted values
  fTags = {};
  fNames = {};

  constructor(workoutItemMaxesMap: Map<string, WorkoutMaxProps>) {
    this.schemeRounds = "";
    this.schemeType = -1;
    this.items = [];
    this.workoutItemMaxesMap = workoutItemMaxesMap;
  }

  getStats() {
    if (!this.isFormatted) {
      Object.keys(this.tags).map((key) => {
        if (!this.fTags[key]) {
          this.fTags[key] = {};
        }

        Object.keys(this.tags[key]).map((inKey) => {
          if (inKey == "key") {
            this.fTags[key][inKey] = this.tags[key][inKey];
          } else {
            this.fTags[key][inKey] = parseInt(this.tags[key][inKey]);
          }
        });
      });

      Object.keys(this.names).map((key) => {
        if (!this.fNames[key]) {
          this.fNames[key] = {};
        }

        Object.keys(this.names[key]).map((inKey) => {
          if (inKey == "key") {
            this.fNames[key][inKey] = this.names[key][inKey];
          } else {
            this.fNames[key][inKey] = parseInt(this.names[key][inKey]);
          }
        });
      });
    }

    this.isFormatted = true;
    return [this.fTags, this.fNames] as StatProps[];
  }

  setWorkoutParams(
    schemeRounds: string,
    schemeType: number,
    items: WorkkoutItemsList
  ) {
    this.schemeRounds = schemeRounds;
    this.schemeType = schemeType;
    this.items = items;
  }

  calcItemReps(
    item: AnyWorkoutItem,
    loadFactorKG: number,
    loadFactorLB: number,
    pCat: string,
    workoutName: string,
    quantity: number | null,
    totalVol: number,
    sets: number | null
  ) {
    console.log("Calculating item reps: ", sets, quantity, totalVol);
    totalVol = totalVol ? totalVol : 0;

    if (sets && quantity) {
      this.tags[pCat].totalReps += sets * quantity;
      this.names[workoutName].totalReps += sets * quantity;
    }
    // Convert weights based on native item weight unit
    if (item.weight_unit == "kg") {
      this.tags[pCat].totalLbs += totalVol * loadFactorLB * KG2LB;
      this.names[workoutName].totalLbs += totalVol * loadFactorLB * KG2LB;

      this.tags[pCat].totalKgs += totalVol * loadFactorKG;
      this.names[workoutName].totalKgs += totalVol * loadFactorKG;
    } else {
      this.tags[pCat].totalLbs += totalVol * loadFactorLB;
      this.names[workoutName].totalLbs += totalVol * loadFactorLB;

      this.tags[pCat].totalKgs += totalVol * loadFactorKG * LB2KG;
      this.names[workoutName].totalKgs += totalVol * loadFactorKG * LB2KG;
    }
  }

  calcItemDuration(
    item: AnyWorkoutItem,
    pCat: string,
    workoutName: string,
    quantity: number | null,
    totalVol: number,
    sets: number | null
  ) {
    // If unit is in seconds, our value is already in seconds, else it is in mins, multiple to convert to seconds.
    const durUnitMultiplier = item.duration_unit === 0 ? 1 : 60;
    console.log(
      "Calc w/ duration multiplier: ",
      durUnitMultiplier,
      item.duration_unit
    );

    if (sets && quantity) {
      this.tags[pCat].totalTime += quantity * sets * durUnitMultiplier;
      this.names[workoutName].totalTime += quantity * sets * durUnitMultiplier;
    }

    if (item.weight_unit == "kg") {
      this.tags[pCat].totalKgSec += totalVol;
      this.names[workoutName].totalKgSec += totalVol;

      this.tags[pCat].totalLbSec += totalVol * KG2LB;
      this.names[workoutName].totalLbSec += totalVol * KG2LB;
    } else {
      this.tags[pCat].totalKgSec += totalVol * LB2KG;
      this.names[workoutName].totalKgSec += totalVol * LB2KG;

      this.tags[pCat].totalLbSec += totalVol;
      this.names[workoutName].totalLbSec += totalVol;
    }
  }

  calcItemDistance(
    item: AnyWorkoutItem,
    pCat: string,
    workoutName: string,
    quantity: number | null,
    totalVol: number,
    sets: number | null
  ) {
    // Distance
    if (sets && quantity) {
      this.tags[pCat].totalDistanceM += quantity * sets;
      this.names[workoutName].totalReps += quantity * sets;
    }

    if (item.weight_unit == "kg") {
      this.tags[pCat].totalKgM += totalVol;
      this.names[workoutName].totalKgM += totalVol;

      this.tags[pCat].totalLbM += totalVol * KG2LB;
      this.names[workoutName].totalLbM += totalVol * KG2LB;
    } else {
      this.tags[pCat].totalKgM += totalVol * LB2KG;
      this.names[workoutName].totalKgM += totalVol * LB2KG;

      this.tags[pCat].totalLbM += totalVol;
      this.names[workoutName].totalLbM += totalVol;
    }
  }

  getLoadFactors(
    item: AnyWorkoutItem,
    totalVol: number,
    maxVal: number,
    maxUnit: string,
    quantity: number
  ) {
    const itemWeightKG = item.weight_unit == "kg" ? totalVol : totalVol * LB2KG;
    const itemWeightLB = item.weight_unit == "kg" ? totalVol * KG2LB : totalVol;

    // Adjust maxval to match totalVal calculation (single rep vs set of reps)
    if (maxVal == -1) {
      maxVal = totalVol; // user didnt record max, we just usse vol to maintain normal calcs
    } else {
      maxVal = maxVal * item.sets! * quantity!; //  We need to calculate for the total sets, we just have a weight for a single weight.  0 case: if we do have any sets, no vol
    }

    const maxValKG = maxUnit == "kg" ? maxVal : maxVal * LB2KG;
    const maxValLB = maxUnit == "kg" ? maxVal * KG2LB : maxVal;

    const _loadFactorKG = itemWeightKG / maxValKG;
    const _loadFactorLB = itemWeightLB / maxValLB;

    console.log(
      `Load factor for ${item.name.name}`,
      itemWeightKG,
      itemWeightLB,
      maxVal,
      maxValKG,
      maxValLB,
      itemWeightLB,
      maxValLB,
      _loadFactorKG,
      _loadFactorLB,
      quantity
    );

    const loadFactorKG = _loadFactorKG ? _loadFactorKG : 1;
    const loadFactorLB = _loadFactorLB ? _loadFactorLB : 1;
    console.log("Returning factors: ", loadFactorKG, loadFactorLB);

    return [loadFactorKG, loadFactorLB];
  }

  calcStandardScheme(
    item: AnyWorkoutItem,
    maxVal: number,
    maxUnit: string,
    pCat: string,
    workoutName: string
  ) {
    console.log("calcStandardScheme obj: ", item);
    const weights = JSON.parse(item.weights);
    console.log("calcStandardScheme weights: ", item.sets, weights);
    // Expand a single value arrray
    const itemWeights = expandArray(weights, item.sets);
    console.log("calcStandardScheme itemWeights");
    const itemReps = JSON.parse(item.reps);
    console.log("calcStandardScheme itemReps");
    const itemDuration = JSON.parse(item.duration);
    console.log("calcStandardScheme itemDuration");
    const durationUnit = item.duration_unit;
    console.log("calcStandardScheme durationUnit");
    const itemDistance = JSON.parse(item.distance);
    console.log("calcStandardScheme itemDistance");

    // Quantity is single, weights are mutlitple
    const quantity = itemReps[0]
      ? itemReps[0]
      : itemDuration[0]
      ? itemDuration[0]
      : itemDistance[0]
      ? itemDistance[0]
      : 0;

    const totalVol =
      quantity *
      (weights.length == 0 ? 0 : itemWeights.reduce((p, c) => p + c, 0));
    console.log("Calcccc: ", quantity, totalVol, itemWeights, weights);
    const [loadFactorKG, loadFactorLB] = this.getLoadFactors(
      item,
      totalVol,
      maxVal,
      maxUnit,
      quantity
    );

    // The problem is that we need to calculate a load for a bunch of weights, instead of iterating over each one,
    // we will operate on the total, so our maxVal, if not given because user hasnt recorded yet, we will just use the weight they used.
    // But if they did record a max then we will need to multiply it by sets to get the factor acurately

    // Note: Weright and set should be euqal, we count reps and totalVol independently since we can do reps without weight and thus no vol...
    // console.log('CALC Standard Scheme:: ', quantity, weights, itemWeights);
    if (itemReps[0]) {
      //Reps
      this.calcItemReps(
        item,
        loadFactorKG,
        loadFactorLB,
        pCat,
        workoutName,
        quantity,
        totalVol,
        item.sets
      );
    } else if (itemDuration[0]) {
      // Duration
      this.calcItemDuration(
        item,
        pCat,
        workoutName,
        quantity,
        totalVol,
        item.sets
      );
    } else if (itemDistance[0]) {
      this.calcItemDistance(
        item,
        pCat,
        workoutName,
        quantity,
        totalVol,
        item.sets
      );
    }
  }

  calcRepsScheme(
    item: AnyWorkoutItem,
    maxVal: number,
    maxUnit: string,
    pCat: string,
    workoutName: string
  ) {
    const repsPerRounds = parseNumList(this.schemeRounds); // Comes from previous screen, param, string
    const reps = JSON.parse(item.reps);
    const itemReps =
      reps.length === 1 ? expandArray(reps, repsPerRounds.length) : reps;

    console.log("Item repszzz: ", this.schemeRounds, repsPerRounds);

    const durations = JSON.parse(item.duration);
    const itemDuration =
      durations.length === 1
        ? expandArray(durations, repsPerRounds.length)
        : durations;

    const distances = JSON.parse(item.distance);
    const itemDistance =
      distances.length === 1
        ? expandArray(distances, repsPerRounds.length)
        : distances;

    const weights = JSON.parse(item.weights); // Comes from API, JSON string list
    const itemWeights =
      weights.length == 1
        ? expandArray(weights, repsPerRounds.length)
        : weights;

    repsPerRounds.forEach((roundReps, idx) => {
      const quantity = itemReps[idx]
        ? itemReps[idx]
        : itemDuration[idx]
        ? itemDuration[idx]
        : itemDistance[idx]
        ? itemDistance[idx]
        : 0;

      // If the item is constant then we do not do it according to the current round reps
      // E.g we do not do the quanitity 21,15,9 times, we do it once per round.
      const totalVol =
        (item.constant ? 1 : roundReps) * quantity * itemWeights[idx];
      console.log(
        "calcRepsScheme  itemReps: ",
        totalVol,
        itemWeights,
        itemReps
      );
      const [loadFactorKG, loadFactorLB] = this.getLoadFactors(
        item,
        totalVol,
        maxVal,
        maxUnit,
        roundReps
      );
      // console.log(
      //   'Total vol: ',
      //   quantity,
      //   itemDuration,
      //   item.name.name,
      //   totalVol,
      //   itemWeights,
      //   weights,
      // );
      // Reps
      if (itemReps[0]) {
        this.calcItemReps(
          item,
          loadFactorKG,
          loadFactorLB,
          pCat,
          workoutName,
          itemReps[idx],
          totalVol,
          item.constant ? 1 : roundReps
        );
      } else if (itemDuration[0]) {
        // Duration
        this.calcItemDuration(
          item,
          pCat,
          workoutName,
          itemDuration[idx],
          totalVol,
          item.constant ? 1 : roundReps
        );
      } else if (itemDistance[0]) {
        this.calcItemDistance(
          item,
          pCat,
          workoutName,
          itemDistance[idx],
          totalVol,
          item.constant ? 1 : roundReps
        );
      }
    });
  }

  calcRoundsScheme(
    item: AnyWorkoutItem,
    maxVal: number,
    maxUnit: string,
    pCat: string,
    workoutName: string
  ) {
    const rounds = parseInt(this.schemeRounds);
    const reps = JSON.parse(item.reps);
    const distance = JSON.parse(item.distance);
    const duration = JSON.parse(item.duration);
    const _weights = JSON.parse(item.weights);

    const itemReps = reps.length === 1 ? expandArray(reps, rounds) : reps;
    const itemDistance =
      distance.length === 1 ? expandArray(distance, rounds) : distance;
    const itemDuration =
      duration.length === 1 ? expandArray(duration, rounds) : duration;
    const weights =
      _weights.length === 1 ? expandArray(_weights, rounds) : _weights;

    // Reps
    if (itemReps[0]) {
      //Reps
      // If the
      const totalVol = dotProd(itemReps, weights);
      // console.log("Dot Product: ", quantity, weights, totalVol)
      const _totalReps = itemReps.reduce((p, c) => p + c, 0);
      this.tags[pCat].totalReps += _totalReps;
      this.names[workoutName].totalReps += _totalReps;
      // TODO() Verify _totalReps is appropriate for getLoadFactors
      const [loadFactorKG, loadFactorLB] = this.getLoadFactors(
        item,
        totalVol,
        maxVal,
        maxUnit,
        _totalReps
      );

      this.calcItemReps(
        item,
        loadFactorKG,
        loadFactorLB,
        pCat,
        workoutName,
        null,
        totalVol,
        null
      );
    } else if (itemDuration[0]) {
      const totalVol = dotProd(itemDuration, weights);
      const total = itemDuration.reduce((p, c) => p + c, 0);

      console.log(
        "Calculate duration: ",
        itemDuration,
        weights,
        totalVol,
        total
      );
      const durUnitMultiplier = item.duration_unit === 0 ? 1 : 60;
      this.tags[pCat].totalTime += total * durUnitMultiplier;
      this.names[workoutName].totalTime += total * durUnitMultiplier;

      this.calcItemDuration(item, pCat, workoutName, null, totalVol, null);
    } else if (itemDistance[0]) {
      const totalVol = dotProd(itemDistance, weights);
      const total = itemDistance.reduce((p, c) => p + c, 0);

      let totalMeters = 0;
      let totalYards = 0;
      //  meter = 0
      if (item.distance_unit == 0) {
        totalMeters = total;
        totalYards = total * 0.9144;
      } else {
        totalMeters = total * 1.09361;
        totalYards = total;
      }

      this.tags[pCat].totalDistanceM += totalMeters;
      this.names[workoutName].totalDistanceM += totalMeters;

      this.tags[pCat].totalDistanceY += totalYards;
      this.names[workoutName].totalDistanceY += totalYards;

      console.log("Calculating Distance for Item: ", workoutName);
      this.calcItemDistance(item, pCat, workoutName, null, totalVol, null);
    }
  }

  getRecord(item: AnyWorkoutItem, key: string) {
    return item[`r_${key}`];
  }

  // calcRecordScheme essentailly will calculate anything (really doesnt calculate anything, just reports or tallys up the total from the recorded values unless owned by class.)
  calcRecordScheme(
    item: AnyWorkoutItem,
    maxVal: number,
    maxUnit: string,
    pCat: string,
    workoutName: string
  ) {
    // Problem is, we dont know how much was accomplished until after the fact.
    // WE can calculate what a single round would be, then once we save this as completed, we can calculate the toatls....
    // For now, we will calc a single round only.
    // Wellll welll well, we finally have a solution....
    // Now we just need to know if this is owned by the class because then we will calculate normally with .reps and not .r_reps
    // But when the item is from  a workout that is completed => completedDualItem, or regular => workoutItem
    //   Then, if the workout is owned by a class, it will be normal.
    // if ownedByClass // should onyl be true when user is on WorkoutsScreen viewing a class workout
    //    const itemReps = JSON.parse(item.reps);
    // else //
    //    const itemReps = JSON.parse(item.r_reps);
    //
    //
    //
    //

    const itemReps = this.ownedByClass
      ? JSON.parse(item.reps)
      : JSON.parse(this.getRecord(item, "reps"));
    const itemDuration = this.ownedByClass
      ? JSON.parse(item.duration)
      : JSON.parse(this.getRecord(item, "duration"));
    const itemDistance = this.ownedByClass
      ? JSON.parse(item.distance)
      : JSON.parse(this.getRecord(item, "distance"));
    const weights = this.ownedByClass
      ? JSON.parse(item.weights)
      : JSON.parse(this.getRecord(item, "weights"));

    // Reps
    if (itemReps[0]) {
      //Reps
      const totalVol = dotProd(itemReps, weights);

      const [loadFactorKG, loadFactorLB] = this.getLoadFactors(
        item,
        totalVol,
        maxVal,
        maxUnit,
        itemReps[0]
      );
      this.calcItemReps(
        item,
        loadFactorKG,
        loadFactorLB,
        pCat,
        workoutName,
        itemReps[0],
        totalVol,
        1
      );
      // console.log("Dot Product: ", quantity, weights, totalVol)
    } else if (itemDuration[0]) {
      const totalVol = dotProd(itemDuration, weights);
      this.calcItemDuration(
        item,
        pCat,
        workoutName,
        itemDuration[0],
        totalVol,
        1
      );
    } else if (itemDistance[0]) {
      const totalVol = dotProd(itemDistance, weights);
      this.calcItemDistance(
        item,
        pCat,
        workoutName,
        itemDistance[0],
        totalVol,
        1
      );
    }
  }

  checkInItemTagAndName(pCat: string, workoutName: string) {
    if (!this.tags[pCat]) {
      this.tags[pCat] = { ...defaultStats, key: pCat } as WorkoutStats;
    }
    if (!this.names[workoutName]) {
      this.names[workoutName] = {
        ...defaultStats,
        key: workoutName,
      } as WorkoutStats;
    }
  }
  //Given a single WorkoutGroup, calc stats
  calc(): boolean {
    this.isFormatted = false;
    try {
      this.items.forEach((item) => {
        let currentStat = this.workoutItemMaxesMap.get(item.name.id.toString());
        if (currentStat && !currentStat.current_max) {
          currentStat = {
            id: currentStat.id,
            name: currentStat.name,
            current_max: {
              id: "",
              max_value: -1,
              unit: "",
              last_updated: "",
            },
          };
        } else if (!currentStat) {
          currentStat = {
            id: "",
            name: item.name.name,
            current_max: {
              id: "",
              max_value: -1,
              unit: "",
              last_updated: "",
            },
          };
        }
        console.log("currentStat: ", currentStat);

        const maxVal = currentStat.current_max.max_value;
        const maxUnit = currentStat.current_max.unit;

        // TODO if we dont have a max, we should just use the weight use so our factor is just 1.
        // Since we passdown the itenm, we can pull the max close to where we need it, but then we just duplicate the code a bit
        // Lets just try to get it if its null, we will pass in 0.

        // console.log("\n Calc item (max):", item.name.id.toString(), maxVal);

        // Tags
        const pCat = item.name.primary?.title;
        const sCat = item.name.secondary?.title;
        if (pCat === undefined) {
          console.error("Primary category is undefined: ", item.name, item);
        }

        // Title
        const workoutName = item.name.name;
        this.checkInItemTagAndName(pCat, workoutName);

        if (WORKOUT_TYPES[this.schemeType] == STANDARD_W) {
          console.log("Calculating statndard");
          // console.log('calculating Standarad!!!!!!!!!!111');
          // TODO () Add maxVal to this so we an use it to calculate loads
          this.calcStandardScheme(item, maxVal, maxUnit, pCat, workoutName);
        } else if (WORKOUT_TYPES[this.schemeType] == REPS_W) {
          // TODO () Add maxVal to this so we an use it to calculate loads
          this.calcRepsScheme(item, maxVal, maxUnit, pCat, workoutName);
        } else if (WORKOUT_TYPES[this.schemeType] == ROUNDS_W) {
          // TODO () Add maxVal to this so we an use it to calculate loads
          this.calcRoundsScheme(item, maxVal, maxUnit, pCat, workoutName);
        }
        // else if (WORKOUT_TYPES[this.schemeType] == CREATIVE_W) {
        // The other workout types are all record types with r_ prefix
        // calcDuationScheme will calculate all of these types. No
        else {
          // TODO () Add maxVal to this so we an use it to calculate loads
          this.calcRecordScheme(item, maxVal, maxUnit, pCat, workoutName);
        }
      });
      // console.log('Calc res ', this.getStats());
      return true;
    } catch (err) {
      console.log("Calc err: ", err);
    }

    return false;
  }

  sumObj(a: { [key: string]: number }, b: { [key: string]: number }) {
    // Given a, the obj, add it to b which has the obj but different values,,,
    // E.g. A=> {"key": "Squat", "totalDistanceM": 0, "totalDistanceY": 0, "totalKgM": 0, "totalKgSec": 0, "totalKgs": 3515, "totalLbM": 0, "totalLbSec": 0, "totalLbs": 7750, "totalReps": 50, "totalTime": 0}
    const total: { [key: string]: number } = {};

    Object.keys(a).forEach((metric) => {
      if (metric != "key") {
        console.log("sumObj: ", `Adding ${a[metric]} to ${b[metric]}`);
        total[metric] = a[metric] + b[metric];
        console.log("SumRes: ", total[metric]);
      }
    });

    total["key"] = a.key;
    console.log("Return from sumObj: ", total);
    return total;
  }

  calcMultiJSON(data: WorkoutCardProps[], ownedByClass = false) {
    this.isFormatted = false;
    this.ownedByClass = ownedByClass;
    // console.log('CalcMulti Data: ', data);
    const allTags: { [key: string]: any } = {};
    const allItems: { [key: string]: any } = {};

    data.forEach((workout) => {
      // const {
      //   scheme_rounds,
      //   scheme_type,
      //   workout_items,
      //   completed_workout_items,
      // } = workout as WorkoutCardProps;

      const stats = workout.stats;

      if (!stats) return;

      if (stats && stats.items) {
        Object.keys(stats!.items!).map((key) => {
          if (allItems[key]) {
            allItems[key] = this.sumObj(stats!.items[key], allItems[key]);
          } else {
            allItems[key] = stats!.items[key];
          }
        });
      }

      if (stats && stats.tags) {
        Object.keys(stats!.tags!).map((key) => {
          if (allTags[key]) {
            // console.log("Adding to allTags: ", stats!.tags[key]);
            allTags[key] = this.sumObj(stats!.tags[key], allTags[key]);
          } else {
            // console.log("First in allTags: ", stats!.tags[key]);
            allTags[key] = stats!.tags[key];
          }
        });
      }
    });

    this.tags = allTags;
    this.names = allItems;
    return true;
  }

  calcMulti(data: WorkoutCardProps[], ownedByClass = false) {
    this.isFormatted = false;
    this.ownedByClass = ownedByClass;
    // console.log('CalcMulti Data: ', data);
    data.forEach((workout) => {
      const {
        scheme_rounds,
        scheme_type,
        workout_items,
        completed_workout_items,
      } = workout as WorkoutCardProps;
      // console.log(
      //   '\n\n Calc Multiz: ',
      //   workout_items,
      //   completed_workout_items,
      //   '\n\n',
      // );

      this.setWorkoutParams(
        scheme_rounds,
        scheme_type,
        workout_items
          ? workout_items
          : completed_workout_items
          ? completed_workout_items
          : []
      );

      this.calc();
    });
  }

  reset() {
    this.schemeRounds = "";
    this.schemeType = -1;
    this.ownedByClass = false;
    this.items = [];

    this.tags = {};
    this.names = {};
    this.fTags = {};
    this.fNames = {};
  }
}

export const parseNumList = (reps): number[] => {
  // Converts string of number into number[]

  // A string is representing a single number or a list of space delimited numbers.
  // Works for reps and weights, now we will support "[1,2,3]"
  const result = JSON.parse(jList(reps));
  return result.length > 0 ? result : [0];
};

export const formatLongDate = (date: Date) => {
  const monthNames = [
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
  const day = date.getDate();
  const monthIndex = date.getMonth();
  const year = date.getFullYear();
  // console.log('Long date: ', monthNames[monthIndex] + ' ' + day + ', ' + year);
  return monthNames[monthIndex] + " " + day + ", " + year;
};

export function isDateInFuture(user: UserProps, ignoreFlag = false): boolean {
  if (!user) return false;
  const date = user.sub_end_date;
  const membership_on = user.membership_on;

  // membership_on == false => membersip features are not turned 'on'
  if (!membership_on && !ignoreFlag) {
    return true;
  }

  if (typeof date == typeof "") {
    return new Date(date) > new Date();
  }
  return date > new Date();
}

export function limitTextLength(t: string, limit: number) {
  return t.length > limit ? t.substring(0, limit) : t;
}
