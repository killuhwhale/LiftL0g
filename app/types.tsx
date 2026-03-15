import {
  WorkoutGroupProps,
  FavoriteGymProps,
  FavoriteGymClassesProps,
  BodyMeasurementsProps,
} from "../src/app_components/Cards/types";

export interface UserProps {
  customer_id: string;
  email: string;
  id: number;
  sub_end_date: Date;
  subscribed: boolean;
  username: string;
  membership_on: boolean;
}

// {"customer_id": "cus_O9ot3Dfd0gseUi", "email": "andayac@gmail.com",
//  "id": 1, "sub_end_date": "2023-07-26T06:18:39.647132Z",
//  "subscribed": false,
//  "username": "andayac@gmail.com"}

export interface ProfileProps {
  user: UserProps;
  workout_groups: Array<WorkoutGroupProps>;
  favorite_gyms: Array<FavoriteGymProps>;
  favorite_gym_classes: Array<FavoriteGymClassesProps>;
  measurements: BodyMeasurementsProps;
}
