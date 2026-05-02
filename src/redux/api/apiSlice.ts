// Import the RTK Query methods from the React-specific entry point
import { BaseQueryFn, createApi } from "@reduxjs/toolkit/query/react";

import { BASEURL, devLog, isDevEnv, nodeEnv } from "@/src/utils/constants";
import {
  authDelete,
  authGet,
  authPost,
  refreshAccessToken,
} from "@/src/utils/fetchAPI";
import auth from "@/src/utils/auth";
import { Member } from "@/src/app_components/modals/types";
import { navigate } from "@/src/navigators/RootNavigation";
import { getToken, storeToken } from "@/src/utils/tokenUtils";
import { ErrorProps } from "@/src/app_components/shared";

// Dump Asyn Storage
// EncryptedStorage.getAllKeys((err, keys) => {
//   if (keys) {
//     EncryptedStorage.multiGet(keys, (error, stores) => {
//       stores?.map((result, i, store) => {
//         devLog('EncryptedStorage: ', {[store[i][0]]: store[i][1]});
//         return true;
//       });
//     });
//   }
// });

const asyncBaseQuery =
  (
    { baseUrl }: { baseUrl: string } = { baseUrl: "" },
  ): BaseQueryFn<
    {
      url: string;
      method?: string;
      data?: object;
      params?: { contentType: string };
    },
    any,
    ErrorProps
  > =>
  async ({ url, method, data, params }) => {
    try {
      if (!method) {
        method = "get";
      }
      const contentType = params?.contentType || "application/json";
      const authToken = await getToken();

      if (authToken == null) {
        return {
          error: {
            status: 0,
            data: "No auth token stored",
          },
        };
      }
      devLog("Has init req token: ", authToken);
      let options: { method: string; headers: any; body: any } = {
        method: method,
        headers: {
          "Content-Type": contentType, // This has been contentType since I created it and DELETE methods work. All of a sudden it stopped working... until changing it to 'Content-Type'
          // contentType: contentType, // This has been contentType since I created it and DELETE methods work. All of a sudden it stopped working... until changing it to 'Content-Type'
          Authorization: `Bearer ${authToken}`,
        },
        body: "",
      };
      devLog("ApiSlice");
      devLog("ApiSlice");
      devLog("Data: ", data);
      devLog("url/ method: ", baseUrl, url, method);

      /**
       *  Problem is that APISlice will trigger 5 actions on a page load.
       * Each of which will try to get a new token when it is bad.
       * We need a better way to handle this.
       *
       *
       */
      // Remove Authorization header when creating a new account
      if (url === "/users/" && (method === "POST" || method === "post")) {
        delete options.headers.Authorization;
      }

      if (
        method != "GET" &&
        data &&
        params?.contentType !== "multipart/form-data"
      ) {
        devLog("Stringifying body for JSON data: ", baseUrl + url);
        options.body = JSON.stringify(data);
      } else if (method != "GET") {
        options.body = data;
      }
      devLog("BODY: ", baseUrl + url, options);
      // We make the first auth request using access token
      const result = await fetch(baseUrl + url, options);

      devLog("BaseQuery fetch response pre-: ", result);
      const jResult = await result.json();
      devLog("BaseQuery fetch response: ", jResult);

      // if token is expired:
      if (result.status === 401 || jResult.code === "token_not_valid") {
        // Hit API w/ Refresh Token and update token.
        const refreshToken = await getToken(false);

        devLog("refreshToken: ", refreshToken);

        const res = await refreshAccessToken(`${BASEURL}/token/refresh/`);
        devLog("\n\n refreshAccessToken resp status: ", res.status);
        if (res.status === 400 || res.status === 401) {
          devLog("refreshAccessToken resp BAD!", res);

          navigate("AuthScreen", {});
          auth.logout();
          return { error: { status: 400, data: "Refresh token is bad" } };
        } else {
          devLog("refreshAccessToken resp good:", res, url, method);
          const accessTokenResult = await res.json();
          await storeToken(accessTokenResult.access);

          if (method === "get" || method == "GET") {
            return { data: await (await authGet(baseUrl + url)).json() };
          } else if (method == "post" || method == "POST") {
            return {
              data: await (
                await authPost(baseUrl + url, options.body, contentType)
              ).json(),
            };
          } else if (method == "delete" || method == "DELETE") {
            // We need a body for Delete requests since we want permissions to work as well.
            return {
              data: await (
                await authDelete(baseUrl + url, options.body, contentType)
              ).json(),
            };
          }
        }
      } else if (result.ok) {
        return { data: jResult };
      } else {
        return { error: { status: result.status, data: jResult } };
      }
      return { error: { status: 404, data: "Errorneous behavior!" } };
    } catch (err: any) {
      return {
        error: {
          status: 0,
          data: err.toString(),
        },
      };
    }
  };

// Define our single API slice object

export const apiSlice = createApi({
  // The cache reducer expects to be added at `state.api` (already default - this is optional)
  reducerPath: "api",
  // All of our requests will have URLs starting with '/fakeApi'
  baseQuery: asyncBaseQuery({ baseUrl: BASEURL }),
  tagTypes: [
    "Gyms",
    "UserGyms",
    "User",
    "UserAuth",
    "GymClasses",
    "GymClassWorkoutGroups",
    "UserWorkoutGroups",
    "UserTemplateWorkoutGroups",
    "WorkoutGroupWorkouts",
    "Workouts",
    "Coaches",
    "Members",
    "GymFavs",
    "GymClassFavs",
    "WorkoutItemMaxes",
    "StatsQuery",
    "DailySnapshot",
    "AppControl",
    "AD_UNITS",
    "TOKEN_STATUS",
  ],
  endpoints: (builder) => ({
    appControlMembershipOn: builder.query({
      query: (id) => {
        return { url: "//appcontrol/membership_on/" };
      },
      providesTags: ["AppControl"],
    }),
    // Users, Coaches and Members
    createUser: builder.mutation({
      query: (data = {}) => ({
        url: "/users/",
        method: "post",
        data,
        params: { contentType: "multipart/form-data" },
      }),
    }),
    updateUsername: builder.mutation({
      query: (data = {}) => ({
        url: "/users/update_username/",
        method: "POST",
        data,
        params: { contentType: "multipart/form-data" },
      }),
      invalidatesTags: ["User"],
    }),
    getUsers: builder.query({
      // The URL for the request is '/fakeApi/posts'
      query: () => {
        return { url: "/users/" };
      },
    }),
    createCoach: builder.mutation({
      query: (data = {}) => ({
        url: "/coaches/",
        method: "POST",
        data,
        params: { contentType: "multipart/form-data" },
      }),
      invalidatesTags: (result, err, arg) => [
        { type: "Coaches", id: arg.gym_class },
      ],
    }),
    getCoachesForGymClass: builder.query({
      // The URL for the request is '/fakeApi/posts'
      query: (id) => {
        return { url: `/coaches/${id}/coaches/` };
      },
      providesTags: (result, err, arg) => [{ type: "Coaches", id: arg }],
    }),
    deleteCoach: builder.mutation({
      query: (data = {}) => ({
        url: "/coaches/remove/",
        method: "DELETE",
        data,
        params: { contentType: "multipart/form-data" },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Coaches", id: result.gym_class },
      ],
    }),

    createMember: builder.mutation({
      query: (data = {}) => ({
        url: "/classMembers/",
        method: "POST",
        data,
        params: { contentType: "multipart/form-data" },
      }),
      invalidatesTags: (result, err, arg) => [
        { type: "Members", id: arg.gym_class },
      ],
    }),
    getMembersForGymClass: builder.query<Member[], string>({
      // The URL for the request is '/fakeApi/posts'
      query: (id) => {
        return { url: `/classMembers/${id}/members/` };
      },
      providesTags: (result, err, arg) => [{ type: "Members", id: arg }],
    }),
    deleteMember: builder.mutation({
      query: (data = {}) => ({
        url: "/classMembers/remove/",
        method: "DELETE",
        data,
        params: { contentType: "multipart/form-data" },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Members", id: result.gym_class },
      ],
    }),

    // Gyms
    getGyms: builder.query({
      query: () => {
        return { url: "/gyms/" };
      },
      providesTags: ["Gyms"],
    }),
    getUserGyms: builder.query({
      query: () => {
        return {
          url: "/gyms/user_gyms/",
          method: "get",
        };
      },
      providesTags: ["UserGyms"],
    }),
    createGym: builder.mutation({
      query: (data = {}) => ({
        url: "/gyms/",
        method: "POST",
        data: data,
        params: { contentType: "multipart/form-data" },
      }),
      invalidatesTags: ["Gyms", "UserGyms"],
    }),

    favoriteGym: builder.mutation({
      query: (data) => ({
        url: "/gyms/favorite/",
        method: "POST",
        data: data,
        params: { contentType: "multipart/form-data" },
      }),
      invalidatesTags: ["GymFavs"],
    }),
    unfavoriteGym: builder.mutation({
      query: (data) => ({
        url: "/gyms/unfavorite/",
        method: "DELETE",
        data,
        params: { contentType: "multipart/form-data" },
      }),
      invalidatesTags: ["GymFavs"],
    }),
    deleteGym: builder.mutation({
      query: (id) => ({
        url: `/gyms/${id}/`,
        method: "DELETE",
        data: { nonemptystupidandroid: 1 },
        params: { contentType: "application/json" },
      }),
      invalidatesTags: ["Gyms", "GymFavs", "UserGyms"],
    }),
    getGymDataView: builder.query({
      query: (id) => {
        return { url: `/gyms/${id}/gymsclasses/` };
      },
      //
      providesTags: (result, error, arg) => {
        return [{ type: "GymClasses", id: result?.id }];
      },
    }),

    // GymClass
    createGymClass: builder.mutation({
      query: (data = {}) => ({
        url: "/gymClasses/",
        method: "POST",
        data: data,
        params: { contentType: "multipart/form-data" },
      }),
      invalidatesTags: (result, error, arg) => {
        return [{ type: "GymClasses", id: arg.gym }];
      },
    }),

    getGymClassDataView: builder.query({
      query: (id) => {
        return { url: `/gymClasses/${id}/workouts/` };
      },
      providesTags: (result, error, arg) => {
        return [{ type: "GymClassWorkoutGroups", id: result.id }];
      },
    }),

    favoriteGymClass: builder.mutation({
      query: (data) => ({
        url: "/gymClasses/favorite/",
        method: "POST",
        data,
        params: { contentType: "multipart/form-data" },
      }),
      invalidatesTags: ["GymClassFavs"],
    }),
    unfavoriteGymClass: builder.mutation({
      query: (data) => ({
        url: "/gymClasses/unfavorite/",
        method: "DELETE",
        data,
        params: { contentType: "multipart/form-data" },
      }),
      invalidatesTags: ["GymClassFavs"],
    }),
    deleteGymClass: builder.mutation({
      query: (data) => ({
        url: `/gymClasses/${data.gymClassID}/`,
        method: "DELETE",
        data: { nonemptystupidandroid: 1 },
        params: { contentType: "application/json" },
      }),
      invalidatesTags: (result, err, arg) => [
        { type: "GymClasses", id: arg.gymID },
        "GymClassFavs",
      ], // Currently, favorites are fetched all at once and search in various places.
    }),

    // Workouts
    getWorkoutNames: builder.query({
      query: () => {
        return { url: "/workoutNames/" };
      },
    }),

    // Workout screen, returns workouts for WorkoutGroup
    // Create workoutItems also needs to invalidate this query
    getWorkoutsForGymClassWorkoutGroup: builder.query({
      query: (id) => {
        return { url: `/workoutGroups/${id}/class_workouts/` };
      },
      providesTags: (result, error, arg) => {
        return [{ type: "WorkoutGroupWorkouts", id: arg }, "UserWorkoutGroups"];
      },
    }),

    // WorkoutScreen
    getWorkoutsForUsersWorkoutGroup: builder.query({
      query: (id) => {
        return { url: `/workoutGroups/${id}/user_workouts/` };
      },
      providesTags: (result, error, arg) => {
        devLog("Provides tag, WorkoutGroupWorkouts: ", arg);
        return [{ type: "WorkoutGroupWorkouts", id: arg }];
      },
    }),
    createWorkoutGroup: builder.mutation({
      query: (data = {}) => ({
        url: "/workoutGroups/",
        method: "POST",
        data: data,
        params: { contentType: "multipart/form-data" },
      }),
      invalidatesTags: [{ type: "UserWorkoutGroups" }, "DailySnapshot"],
    }),
    duplicateWorkoutGroup: builder.mutation({
      query: (data = {}) => ({
        url: "/workoutGroups/duplicate/",
        method: "POST",
        data: data,
        params: { contentType: "multipart/form-data" },
      }),
      invalidatesTags: [{ type: "UserWorkoutGroups" }, "DailySnapshot"],
    }),
    finishWorkoutGroup: builder.mutation({
      query: (data = {}) => ({
        url: "/workoutGroups/finish/",
        method: "POST",
        data: data,
        params: { contentType: "multipart/form-data" },
      }),
      invalidatesTags: (result, error, arg) => {
        // inavlidates query for useGetWorkoutsForGymClassWorkoutGroupQuery
        const data = new Map<string, string>(arg._parts);

        return [
          { type: "WorkoutGroupWorkouts", id: data.get("group") },
          { type: "UserWorkoutGroups" },
          "StatsQuery",
          "DailySnapshot",
        ];
      },
    }),
    deleteWorkoutGroup: builder.mutation({
      query: (data) => {
        const mapData = new Map<string, string>(data._parts);

        return {
          url: `/workoutGroups/${mapData.get("id")}/`,
          method: "DELETE",
          data,
          params: { contentType: "multipart/form-data" },
        };
      },
      invalidatesTags: (result, err, arg) => {
        const data = new Map<string, string>(arg._parts);

        return data.get("owned_by_class")
          ? [
              { type: "GymClassWorkoutGroups", id: data.get("owner_id") },
              { type: "WorkoutGroupWorkouts", id: data.get("id") },
              "DailySnapshot",
            ]
          : [
              "UserWorkoutGroups",
              "DailySnapshot",
              { type: "UserWorkoutGroups" },
              { type: "WorkoutGroupWorkouts", id: data.get("id") },
            ];
      },
    }),

    updateWorkoutGroupTitle: builder.mutation({
      query: (data = {}) => ({
        url: "/workoutGroups/update_title/",
        method: "POST",
        data: data,
        params: { contentType: "application/json" },
      }),
      invalidatesTags: [
        { type: "UserWorkoutGroups" },
        { type: "WorkoutGroupWorkouts" },
      ],
    }),
    updateWorkoutGroupCaption: builder.mutation({
      query: (data = {}) => ({
        url: "/workoutGroups/update_caption/",
        method: "POST",
        data: data,
        params: { contentType: "application/json" },
      }),
      invalidatesTags: [
        { type: "UserWorkoutGroups" },
        { type: "WorkoutGroupWorkouts" },
      ],
    }),
    updateWorkoutGroupForDate: builder.mutation({
      query: (data = {}) => ({
        url: "/workoutGroups/update_for_date/",
        method: "POST",
        data: data,
        params: { contentType: "application/json" },
      }),
      invalidatesTags: [
        { type: "UserWorkoutGroups" },
        { type: "WorkoutGroupWorkouts" },
      ],
    }),

    createWorkout: builder.mutation({
      query: (data = {}) => ({
        url: "/workouts/",
        method: "POST",
        data: data,
        params: { contentType: "multipart/form-data" },
      }),
      // When creating a workout, we create it and then create the items immediately after.
      // So we will invalidate on createWorkoutItems
      // invalidatesTags: (result, error, arg) => {
      //   if (error) {
      //     return [];
      //   }
      //   const data = new Map<string, string>(arg._aprts);
      //   return [{type: 'WorkoutGroupWorkouts', id: data.get('group')}];
      // },
    }),

    //     updateWorkout
    // updateWorkoutItem
    // updateWorkoutDualItem

    updateWorkout: builder.mutation({
      query: (arg = {}) => {
        const data = new Map<string, string>(arg._parts);
        devLog("Update workout data: ", data);
        return {
          url: `/workouts/${data.get("id")}/`,
          method: "PUT",
          data: arg,
          params: { contentType: "multipart/form-data" },
        };
      },
      invalidatesTags: (result, error, arg) => {
        const data = new Map<string, string>(arg._parts);
        devLog("Invalidates tag, Workouts: ", data);
        return [
          { type: "WorkoutGroupWorkouts" },
          { type: "UserWorkoutGroups" },
          { type: "StatsQuery" },
          { type: "DailySnapshot" },
        ];
      },
    }),

    getWorkoutByID: builder.query({
      query: (id) => {
        return { url: `/workouts/${id}/` };
      },
      providesTags: (result, error, arg) => {
        devLog("Provides tag, Workouts: ", arg);
        return [{ type: "Workouts", id: arg }];
      },
    }),

    deleteWorkout: builder.mutation({
      query: (arg) => {
        const data = new Map<string, string>(arg._parts);

        return {
          url: `/workouts/${data.get("id")}/`,
          method: "DELETE",
          data: { nonemptystupidandroid: 1 },
          params: { contentType: "multipart/form-data" },
        };
      },
      invalidatesTags: (result, error, arg) => {
        if (error) {
          return [];
        }
        const data = new Map<string, string>(arg._parts);

        return [
          { type: "WorkoutGroupWorkouts", id: data.get("group") },
          { type: "UserWorkoutGroups" },
          { type: "StatsQuery" },
          { type: "DailySnapshot" },
        ];
      },
    }),

    createWorkoutItems: builder.mutation({
      query: (data = {}) => ({
        url: "/workoutItems/items/",
        method: "POST",
        data: data,
        params: { contentType: "multipart/form-data" },
      }),
      invalidatesTags: (resut, error, arg) => {
        const data = new Map<string, string>(arg._parts);
        // devLog(
        //   "Invalidating create normal Item: ",
        //   data.get("workout_group"),
        //   data
        // );
        return [
          { type: "WorkoutGroupWorkouts" },
          { type: "UserWorkoutGroups" },
          { type: "StatsQuery" },
          { type: "DailySnapshot" },
        ];
      },
    }),

    updateWorkoutItems: builder.mutation({
      query: (data = {}) => ({
        url: "/workoutItems/update_items/",
        method: "POST",
        data: data,
        params: { contentType: "multipart/form-data" },
      }),

      invalidatesTags: (resut, error, arg) => {
        const data = new Map<string, string>(arg._parts);
        // devLog(
        //   "Invalidating create normal Item: ",
        //   data.get("workout_group"),
        //   data
        // );
        return [
          { type: "WorkoutGroupWorkouts" },
          { type: "UserWorkoutGroups" },
          { type: "StatsQuery" },
          { type: "DailySnapshot" },
        ];
      },
    }),

    createWorkoutDualItems: builder.mutation({
      query: (data = {}) => ({
        url: "/workoutDualItems/items/",
        method: "POST",
        data: data,
        params: { contentType: "multipart/form-data" },
      }),
      invalidatesTags: (resut, error, arg) => {
        const data = new Map<string, string>(arg._parts);
        devLog(
          "Invalidating create Dual Item: ",
          data.get("workout_group"),
          data,
        );
        return [
          { type: "WorkoutGroupWorkouts" },
          { type: "UserWorkoutGroups" },
          { type: "StatsQuery" },
          { type: "DailySnapshot" },
        ];
      },
    }),

    recordWorkoutDualItems: builder.mutation({
      query: (data = {}) => ({
        url: "/workoutDualItems/record_items/",
        method: "POST",
        data: data,
        params: { contentType: "multipart/form-data" },
      }),
      invalidatesTags: (resut, error, arg) => {
        const data = new Map<string, string>(arg._parts);

        return [
          { type: "WorkoutGroupWorkouts" },
          { type: "UserWorkoutGroups" },
          { type: "StatsQuery" },
          { type: "DailySnapshot" },
        ];
      },
    }),

    updateWorkoutDualItems: builder.mutation({
      query: (data = {}) => ({
        url: "/workoutDualItems/update_items/",
        method: "POST",
        data: data,
        params: { contentType: "multipart/form-data" },
      }),
      invalidatesTags: (resut, error, arg) => {
        const data = new Map<string, string>(arg._parts);

        return [
          { type: "WorkoutGroupWorkouts" },
          { type: "UserWorkoutGroups" },
          { type: "StatsQuery" },
          { type: "DailySnapshot" },
        ];
      },
    }),

    // Completed Workouts
    createCompletedWorkout: builder.mutation({
      query: (data = {}) => ({
        url: "/completedWorkoutGroups/",
        method: "POST",
        data: data,
        params: { contentType: "multipart/form-data" },
      }),
      // IF user completes Class workout, Invalidate both UserWorkoutGroups and  classWorkoutGroups/classID
      // If user complete non class workout, just invaldiate UserWorkoutGroups

      // Should also invalidate WorkoutScreen so that it shows the new completedworkout so user can toggle back and forth.

      // From GymClass -> completed workout screen we get:
      /**
       * title
       * caption
       * for_date
       * workouts: []
       * workout_group: id
       */
      invalidatesTags: (result, error, arg) => {
        if (error) {
          return [];
        }

        const data = new Map<string, string>(arg._parts);
        // Cases:
        // 1. A user completes a WorkoutGroup from a gym Class
        // 2. A user completes a WorkoutGroup from another User.
        //      - TODO() We do not have a search feature, to find other users workouts yet.
        return [
          { type: "WorkoutGroupWorkouts", id: data.get("workout_group") }, // Reset WorkoutScreen
          { type: "UserWorkoutGroups" }, // Reset Profile workout list
          { type: "GymClassWorkoutGroups", id: data.get("owner_id") },
          { type: "StatsQuery" },
          { type: "DailySnapshot" },
        ];
      },
    }),
    getCompletedWorkout: builder.query({
      query: (id) => ({
        url: `/completedWorkoutGroups/${id}/completed_workout_group/`,
      }),
    }),
    getCompletedWorkoutByWorkoutID: builder.query({
      query: (id) => ({
        url: `/completedWorkoutGroups/${id}/completed_workout_group_by_og_workout_group/`,
      }),
      providesTags: (result, error, arg) => {
        return [{ type: "WorkoutGroupWorkouts", id: arg }];
      },
    }),
    deleteCompletedWorkoutGroup: builder.mutation({
      query: (data) => {
        const mappedData = new Map<string, string>(data._parts);
        return {
          url: `/completedWorkoutGroups/${mappedData.get("id")}/`,
          method: "DELETE",
          data: { nonemptystupidandroid: 1 },
          params: { contentType: "application/json" },
        };
      },
      invalidatesTags: (result, error, arg) => {
        if (error) {
          return [];
        }

        const data = new Map<string, string>(arg._parts);

        // Cases:
        // 1. A user completes a WorkoutGroup from a gym Class
        // 2. A user completes a WorkoutGroup from another User.
        //      - TODO() We do not have a search feature, to find other users workouts yet.
        return [
          { type: "WorkoutGroupWorkouts", id: data.get("workout_group") }, // Reset WorkoutScreen
          { type: "UserWorkoutGroups" }, // Reset Profile workout list
          { type: "GymClassWorkoutGroups", id: data.get("owner_id") },
          { type: "StatsQuery" },
          { type: "DailySnapshot" },
        ];
      },
    }),

    deleteCompletedWorkout: builder.mutation({
      query: (id) => ({
        url: `/completedWorkouts/${id}/`,
        method: "DELETE",
        data: { nonemptystupidandroid: 1 },
        params: { contentType: "application/json" },
      }),
      invalidatesTags: [
        { type: "WorkoutGroupWorkouts" },
        { type: "UserWorkoutGroups" },
        { type: "StatsQuery" },
        { type: "DailySnapshot" },
      ],
    }),

    bulkCreateTemplates: builder.mutation({
      query: (body) => {
        console.log("APLSLICE Bulk Template: body", body);
        return {
          url: `/bulktemplates/create_template/`,
          method: "POST",
          data: body,
        };
      },
      invalidatesTags: [
        { type: "WorkoutGroupWorkouts" },
        { type: "UserWorkoutGroups" },
      ],
    }),
    resetTemplates: builder.mutation({
      query: (body) => {
        return {
          url: `/bulktemplates/reset_template/`,
          method: "POST",
          data: body,
        };
      },
      invalidatesTags: [
        { type: "WorkoutGroupWorkouts" },
        { type: "UserWorkoutGroups" },
      ],
    }),

    // User and Profile
    getProfileView: builder.query({
      query: () => {
        return { url: "/profile/profile/" };
      },
      providesTags: ["User"],
    }),
    // Expanded Profile data view
    getProfileWorkoutGroups: builder.query({
      query: (page: number = 1) => {
        return { url: `/profile/workout_groups/?page=${page}` };
      },
      providesTags: (result, error, page) => [
        { type: "UserWorkoutGroups", id: page },
        { type: "UserWorkoutGroups" },
      ],
    }),

    getTemplateWorkoutGroups: builder.query({
      query: (templateName) => {
        return {
          url: `/profile/template_workout_groups/?template_name=${templateName}`,
        };
      },
      providesTags: (result, error, page) => [{ type: "UserWorkoutGroups" }],
    }),

    getLastXWorkoutGroups: builder.query({
      query: (userID) => {
        return {
          url: `/workoutGroups/last_x_workout_groups/?user_id=${userID}`,
        };
      },
      providesTags: (result, error, page) => [{ type: "UserWorkoutGroups" }],
    }),
    searchWorkoutGroups: builder.query({
      query: ({ query, userID }) => {
        return {
          url: `/profile/workout_group_query/?user_id=${userID}&query=${encodeURIComponent(
            query,
          )}`,
        };
      },
      providesTags: [{ type: "UserWorkoutGroups" }],
    }),

    createWorkoutPrompt: builder.mutation({
      query: ({
        prompt,
        userID,
        schemeTypeText,
        userMaxes,
        lastWorkoutGroups,
      }) => ({
        url: "/ai/create_workout/",
        method: "POST",
        data: {
          prompt,
          user_id: userID,
          scheme_type_text: schemeTypeText,
          userMaxes,
          lastWorkoutGroups,
        },
        params: { contentType: "application/json" },
      }),
    }),

    getProfileGymFavs: builder.query({
      query: () => {
        return { url: "/profile/gym_favs/" };
      },
      providesTags: ["GymFavs"],
    }),
    getProfileGymClassFavs: builder.query({
      query: () => {
        return { url: "/profile/gym_class_favs/" };
      },
      providesTags: ["GymClassFavs"],
    }),

    getUserInfo: builder.query({
      query: (id) => {
        return { url: "/users/user_info/" };
      },
      providesTags: ["User"],
    }),

    validateUserToken: builder.query({
      query: (id) => {
        return { url: "/users/user_info/" };
      },
      providesTags: ["UserAuth"],
    }),

    // Workout Maxes
    getUserWorkoutMaxes: builder.query({
      query: (user_id) => {
        return {
          url: `/maxes/list_workouts/?user_id=${user_id}`,
        };
      },
      providesTags: ["WorkoutItemMaxes"],
    }),

    getWorkoutMaxHistory: builder.query({
      query: (data) => {
        return {
          url: `/maxes/${data.workoutItemId}/history/?user_id=${data.user_id}`,
        };
      },
      providesTags: (result, error, workoutItemId) => [
        { type: "WorkoutItemMaxes", id: workoutItemId },
      ],
    }),

    getWorkoutMaxProgress: builder.query({
      query: (data) => {
        return { url: `/maxes/${data.workoutItemId}/progress/`, body: data };
      },
      providesTags: (result, error, workoutItemId) => [
        { type: "WorkoutItemMaxes", id: workoutItemId },
      ],
    }),

    updateWorkoutMax: builder.mutation({
      query: (data) => ({
        url: "/maxes/update_max/",
        method: "POST",
        data,
      }),
      invalidatesTags: ["WorkoutItemMaxes"],
    }),

    // Stats
    getCompletedWorkoutGroupsForUserByDateRange: builder.query({
      query: (data = {}) => {
        return {
          url: `/stats/${data.id}/user_workouts/?start_date=${data.startDate}&end_date=${data.endDate}`,
        };
      },
      providesTags: (result, error, arg) => {
        return [{ type: "StatsQuery", id: arg }];
      },
    }),

    getDailySnapshot: builder.query({
      query: (id) => {
        return { url: "/snapshot/user_daily/" };
      },
      providesTags: ["DailySnapshot"],
    }),

    getAdUnits: builder.query({
      query: (id) => {
        return { url: "/snapshot/ads/" };
      },
      providesTags: ["AD_UNITS"],
    }),

    ping: builder.query({
      query: () => ({ url: "/ping/" }),
    }),

    coachChat: builder.mutation({
      query: (data) => ({
        url: "/ai/chat/",
        method: "POST",
        data,
      }),
    }),

    getTokenStatus: builder.query({
      query: (userId) => ({ url: `/ai/token_status/?user_id=${userId}` }),
      providesTags: ["TOKEN_STATUS"],
    }),
  }),
});

// Export the auto-generated hook for the `getPosts` query endpoint
export const {
  useAppControlMembershipOnQuery,
  useCreateUserMutation,
  useUpdateUsernameMutation,
  useCreateCoachMutation,
  useGetCoachesForGymClassQuery,
  useDeleteCoachMutation,

  useCreateMemberMutation,
  useDeleteMemberMutation,
  useGetMembersForGymClassQuery,

  useGetUsersQuery,
  useGetGymsQuery,
  useGetGymDataViewQuery,

  useGetGymClassDataViewQuery,

  useGetUserInfoQuery,
  useValidateUserTokenQuery,
  useGetUserGymsQuery,
  useGetProfileViewQuery,
  useGetProfileWorkoutGroupsQuery,
  useGetTemplateWorkoutGroupsQuery,
  useGetLastXWorkoutGroupsQuery,
  useSearchWorkoutGroupsQuery,
  useCreateWorkoutPromptMutation,
  useGetProfileGymFavsQuery,
  useGetProfileGymClassFavsQuery,

  useGetWorkoutNamesQuery,

  useGetWorkoutsForGymClassWorkoutGroupQuery,
  useGetWorkoutsForUsersWorkoutGroupQuery,

  useGetCompletedWorkoutQuery,
  // usesTagLabelsByWorkoutIDQuery,
  useGetCompletedWorkoutByWorkoutIDQuery,
  useDeleteCompletedWorkoutGroupMutation,
  useDeleteCompletedWorkoutMutation,
  useBulkCreateTemplatesMutation,
  useResetTemplatesMutation,

  useCreateGymMutation,
  useDeleteGymMutation,
  useFavoriteGymMutation,
  useUnfavoriteGymMutation,

  useCreateGymClassMutation,
  useFavoriteGymClassMutation,
  useUnfavoriteGymClassMutation,
  useDeleteGymClassMutation,

  useFinishWorkoutGroupMutation,

  useDeleteWorkoutMutation,
  useGetWorkoutByIDQuery,
  useCreateWorkoutGroupMutation,
  useDuplicateWorkoutGroupMutation,
  useDeleteWorkoutGroupMutation,
  useUpdateWorkoutGroupTitleMutation,
  useUpdateWorkoutGroupCaptionMutation,
  useUpdateWorkoutGroupForDateMutation,
  useCreateWorkoutMutation,
  useUpdateWorkoutMutation,
  useCreateWorkoutItemsMutation,
  useUpdateWorkoutItemsMutation,
  useCreateWorkoutDualItemsMutation,
  useRecordWorkoutDualItemsMutation,
  useUpdateWorkoutDualItemsMutation,
  useCreateCompletedWorkoutMutation,
  useGetCompletedWorkoutGroupsForUserByDateRangeQuery,

  useGetUserWorkoutMaxesQuery,
  useGetWorkoutMaxHistoryQuery,
  useGetWorkoutMaxProgressQuery,
  useUpdateWorkoutMaxMutation,

  useGetDailySnapshotQuery,
  useGetAdUnitsQuery,
  useLazyPingQuery,
  useCoachChatMutation,
  useGetTokenStatusQuery,
  // usesTagLabelsGroupsForUserByDateRangeQuery,
} = apiSlice;
