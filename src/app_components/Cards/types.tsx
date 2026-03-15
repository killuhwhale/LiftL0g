import { ImageSourcePropType } from "react-native";
import { Int32 } from "react-native/Libraries/Types/CodegenTypes";

export interface GymCardProps {
  id: string;
  title: string;
  desc: string;
  owner_id: string;
  date: string;
  mainImage: string;
  logoImage: string;
}
export interface GymCardListProps {
  data: Array<GymCardProps>;
}

export interface GymClassCardProps {
  id: string;
  title: string;
  private: boolean;
  desc: string;
  date: string;
  gym: string;
  mainImage: string;
  logoImage: string;
}

export type Gym = {
  id?: string;
  title: string;
  desc: string;
  owner_id: string;
  date: string;
};
export type GymClass = {
  id?: string;
  gym: Gym;
  title: string;
  private: boolean;
  desc: string;
  date: string;
};

export interface GymClassCardListProps {
  data: Array<GymClassCardProps>;
}

export interface WorkoutCategoryProps {
  title: string;
}

export interface WorkoutNameProps {
  id: number;
  name: string;
  desc?: string;
  categories?: WorkoutCategoryProps[];
  primary?: WorkoutCategoryProps;
  secondary?: WorkoutCategoryProps;
  media_ids?: string;
  date?: string;
}

export interface WorkoutNameSimpleProps {
  id: number;
  name: string;
  desc: string;
  categories: WorkoutCategoryProps[];
  primary: string;
  secondary: string;
  media_ids: string;
  date: string;
}

export type AnyWorkoutItem = WorkoutItemProps & WorkoutDualItemProps;
export type WorkkoutItemsList = Array<AnyWorkoutItem>;

export interface WorkoutItemProps {
  id: number;
  name: WorkoutNameProps;
  ssid: number;
  constant: boolean;

  sets: number;
  reps: string;
  pause_duration: number;
  duration: string;
  duration_unit: number;
  distance: string;
  distance_unit: number;
  weights: string;
  weight_unit: string;

  rest_duration: number;
  rest_duration_unit: number;
  percent_of: string;
  order: number;
  date: string;
  workout: number;
  uuid?: string;
  penalty?: string;
}

export interface WorkoutDualItemProps {
  id: number;
  name: WorkoutNameProps;
  ssid: number;
  constant: boolean;

  sets: number;
  reps: string;
  pause_duration: number;
  duration: string;
  duration_unit: number;
  distance: string;
  distance_unit: number;
  weights: string;
  weight_unit: string;
  rest_duration: number;
  rest_duration_unit: number;
  percent_of: string;

  finished?: boolean;
  penalty?: string;
  r_sets?: number;
  r_reps?: string;
  r_pause_duration?: number;
  r_duration?: string;
  r_duration_unit?: number;
  r_distance?: string;
  r_distance_unit?: number;
  r_weights?: string;
  r_weight_unit?: string;
  r_rest_duration?: number;
  r_rest_duration_unit?: number;
  r_percent_of?: string;

  order: number;
  date: string;
  workout: number;
  uuid?: string;
}

// TODO() refactor and remove.... possibly w/ WorkkoutItemsList
export interface WorkoutItemListProps {
  data: Array<WorkoutItemProps>;
}

export interface WorkoutStatsProps {
  items: any;
  tags: any;
}

export interface WorkoutCardProps {
  id: number;
  group?: WorkoutGroupProps;
  workout_items?: WorkkoutItemsList;
  completed_workout_items?: Array<WorkoutItemProps>;
  title: string;
  desc: string;
  instruction?: string;
  scheme_type: number;
  scheme_rounds: string;
  date: string;
  for_date?: string;
  editable?: boolean;
  testID?: string;
  ownedByClass: boolean;
  stats?: WorkoutStatsProps;
  navToWorkoutScreenWithItems: () => void;
}

export type WorkoutItems = WorkoutItemProps[] | WorkoutDualItemProps[];

export interface WorkoutCardListProps {
  data: Array<WorkoutCardProps>;
  editable?: boolean;
  group: WorkoutGroupProps;
  navToWorkoutScreenWithItems: (
    workoutGroupID: string,
    workoutGroupTitle: string,
    workoutID: string,
    schemeType: number,
    items: WorkoutItems,
    workoutTitle: string,
    workoutDesc: string,
    scheme_rounds: string,
    instruction: string
  ) => void;
}

export interface WorkoutGroupCardProps {
  id: number;
  title: string;
  caption: string;
  owner_id?: string; // For workoutgroud
  owned_by_class?: boolean; // For workoutgroud
  user_id?: string; // For completeworkoutgroud
  workout_group?: WorkoutGroupCardProps; // For completeworkoutgroud
  media_ids: string;
  date: string;
  for_date: string;
  finished?: boolean;
  editable?: boolean;
  userCanEdit?: boolean;
  completed?: boolean;
  archived: boolean;
  date_archived: string;
}

export interface WorkoutGroupCardListProps {
  data: Array<WorkoutGroupCardProps>;
  editable: boolean;
}

export interface WorkoutGroupProps {
  id: number;
  title: string;
  caption: string;
  user_owner_id?: string; // When owned_by_class = True, this represents the user ID of the owner of the Gym.
  owner_id: string;
  owned_by_class: boolean;
  media_ids: string;
  date: string;
  workouts?: Array<WorkoutCardProps>;
  completed_workouts?: Array<WorkoutCardProps>;
  for_date: string;
  finished?: boolean; // Done editing all workouts
  completed?: boolean; // When a user completes a workout from antoer group... not being used yet....
  archived: boolean;
  date_archived: string;
}

export interface FavoriteGymProps {
  id: number;
  user_id: string;
  gym: GymCardProps;
  date: string;
}

export interface FavoriteGymClassesProps {
  id: number;
  user_id: string;
  gym_class: GymCardProps;
  date: string;
}

export interface BodyMeasurementsProps {
  id: number;
  user_id: string;
  bodyweight: number;
  bodyweight_unit: string;
  bodyfat: number;
  armms: number;
  calves: number;
  neck: number;
  thighs: number;
  chest: number;
  waist: number;
  date: string;
}
