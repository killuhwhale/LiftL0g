import {
  Container,
  darkRed,
  ErrorProps,
  isDateInFuture,
  lightenHexColor,
  mdFontSize,
  SCREEN_WIDTH
} from "@/src/app_components/shared";
import {
  TSButtonText,
  TSCaptionText,
  TSInputText,
  TSParagrapghText,
  TSSnippetText
} from "@/src/app_components/Text/Text";
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import Icon from "react-native-vector-icons/Ionicons";
import styled from "styled-components/native";

import {
  apiSlice,
  useGetProfileViewQuery,
  useUpdateUsernameMutation
} from "@/src/redux/api/apiSlice";
import { useTheme } from "styled-components/native";

import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Animated,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableHighlight,
  TouchableOpacity,
  View
} from "react-native";

import champs from "@/assets/images/champs_logo.png";

import {
  GymCardProps,
  GymClass,
  GymClassCardProps,
} from "@/src/app_components/Cards/types";
import Input from "@/src/app_components/Input/input";
import ActionCancelModal from "@/src/app_components/modals/ActionCancelModal";
import PurchaseModal from "@/src/app_components/modals/PurchaseModal";
import { debounce, dateFormatDayOfWeek } from "@/src/utils/algos";
import { DOMAIN_NAME, TestIDs } from "@/src/utils/constants";

import BannerAddMembership from "@/src/app_components/ads/BannerAd";
import { store } from "@/src/redux/store";
import AuthManager from "@/src/utils/auth";
import LinearGradient from "react-native-linear-gradient";
import Purchases, {
  PurchasesStoreProduct
} from "react-native-purchases";
import { UserProps } from "../types";

const PageContainer = styled(Container)`
  background-color: ${(props) => props.theme.palette.backgroundColor};
  justify-content: flex-start;
  width: 100%;
`;

interface UserInfoPanelProps {
  user: UserProps;
}
interface GymsPanelProps {
  data: GymCardProps[];
  onDelete(gym: GymCardProps): void;
}
interface FavGymCardProps {
  id?: string | number;
  user_id: string;
  date: string;
  gym: GymCardProps;
}
interface FavGymsPanelProps {
  data: FavGymCardProps[];
}
interface FavGymClassCardProps {
  id?: string | number;
  user_id: string;
  date: string;
  gym_class: GymClass;
}
interface FavGymClassesPanelProps {
  data: FavGymClassCardProps[];
}

// ─── Settings Row ────────────────────────────────────────────────────────────

interface SettingsRowProps {
  icon: string;
  title: string;
  onPress(): void;
  danger?: boolean;
  external?: boolean;
  testID?: string;
  rightContent?: React.ReactNode;
}

const SettingsRow: FunctionComponent<SettingsRowProps> = ({
  icon,
  title,
  onPress,
  danger,
  external,
  testID,
  rightContent,
}) => {
  const theme = useTheme();
  const color = danger ? theme.palette.AWE_Red : theme.palette.text;
  return (
    <TouchableHighlight
      testID={testID}
      underlayColor={theme.palette.darkGray}
      onPress={onPress}
      style={{ borderRadius: 8 }}
    >
      <View style={settingsRowStyle.row}>
        <Icon name={icon} color={color} style={settingsRowStyle.icon} />
        <TSSnippetText
          textStyles={[settingsRowStyle.label, { color }]}
        >
          {title}
        </TSSnippetText>
        {rightContent ?? (
          <Icon
            name={external ? "open-outline" : "chevron-forward"}
            color={theme.palette.gray}
            style={{ fontSize: 16 }}
          />
        )}
      </View>
    </TouchableHighlight>
  );
};

const settingsRowStyle = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    paddingHorizontal: 16,
  },
  icon: {
    fontSize: 20,
    width: 28,
  },
  label: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
  },
});

// ─── Section Header ───────────────────────────────────────────────────────────

const SectionHeader: FunctionComponent<{ title: string }> = ({ title }) => {
  const theme = useTheme();
  return (
    <View
      style={{
        paddingHorizontal: 16,
        paddingTop: 24,
        paddingBottom: 6,
      }}
    >
      <TSCaptionText
        textStyles={{
          color: theme.palette.gray,
          textTransform: "uppercase",
          letterSpacing: 1,
          fontSize: 11,
        }}
      >
        {title}
      </TSCaptionText>
    </View>
  );
};

// ─── Divider ─────────────────────────────────────────────────────────────────

const Divider: FunctionComponent = () => {
  const theme = useTheme();
  return (
    <View
      style={{
        height: 1,
        backgroundColor: theme.palette.darkGray,
        marginLeft: 52,
      }}
    />
  );
};

// ─── Username Panel ───────────────────────────────────────────────────────────

const UserInfoPanel: FunctionComponent<UserInfoPanelProps> = (props) => {
  const theme = useTheme();
  const { username } = props.user || { username: "" };
  const [showEditusername, setShowEditUsername] = useState(false);
  const [newUsername, setNewUsername] = useState(username);
  const [_updateUsername, { isLoading }] = useUpdateUsernameMutation();
  const [savedUsername, setSavedUsername] = useState(false);

  const manageUpdateUsername = async (text: string) => {
    const data = new FormData();
    data.append("username", text);
    if (!isLoading) {
      const res = await _updateUsername(data).unwrap();
      if (res.username) {
        setSavedUsername(true);
      }
    }
  };

  const updateUsername = useCallback(debounce(manageUpdateUsername, 2992), []);

  useEffect(() => {
    return function cleanup() {
      if (!savedUsername && username !== newUsername) {
        manageUpdateUsername(newUsername);
      }
    };
  }, [props]);

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
      }}
    >
      {showEditusername ? (
        <Input
          testID={TestIDs.ProfileEditUsernameField.name()}
          containerStyle={{
            backgroundColor: theme.palette.transparent,
            height: 35,
            borderRadius: 8,
            marginHorizontal: 4,
            flex: 1,
          }}
          inputStyles={{ textAlign: "center", fontSize: mdFontSize }}
          label=""
          onChangeText={(t: string) => {
            setNewUsername(t);
            setSavedUsername(false);
            updateUsername(t);
          }}
          value={newUsername}
          placeholder="Username"
        />
      ) : (
        <TSInputText textStyles={{ textAlign: "center", fontSize: 22 }}>
          {newUsername}
        </TSInputText>
      )}
      <TouchableOpacity
        testID={TestIDs.ProfileEditUsernameBtn.name()}
        onPress={() => setShowEditUsername(!showEditusername)}
        style={{ padding: 6, marginLeft: 6 }}
      >
        <Icon
          name={showEditusername ? "checkmark-circle-outline" : "pencil-outline"}
          color={theme.palette.gray}
          style={{ fontSize: 18 }}
        />
      </TouchableOpacity>
    </View>
  );
};

// ─── Premium Member Card ──────────────────────────────────────────────────────

const PremiumMemberCard: FunctionComponent<{
  subEndDate: Date;
  onRefresh(): void;
  fadeAnim: Animated.Value;
}> = ({ subEndDate, onRefresh, fadeAnim }) => {
  const theme = useTheme();
  return (
    <View style={{ paddingHorizontal: 16 }}>
      <LinearGradient
        colors={[theme.palette.AWE_Green, theme.palette.primary.main]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={premiumCardStyle.card}
      >
        <View style={premiumCardStyle.headerRow}>
          <Icon name="star" color="#FFD700" style={{ fontSize: 20 }} />
          <TSCaptionText textStyles={premiumCardStyle.title}>
            Premium Member
          </TSCaptionText>
          <TouchableOpacity onPress={onRefresh} style={{ marginLeft: "auto" }}>
            <Icon name="refresh-outline" color="#FFF" style={{ fontSize: 20 }} />
          </TouchableOpacity>
        </View>

        <TSSnippetText textStyles={premiumCardStyle.renewText}>
          Renews: {dateFormatDayOfWeek(subEndDate)}
        </TSSnippetText>

        <View style={premiumCardStyle.perksRow}>
          {["Ad-free", "15 workouts/day", "AI Generator", "Workout Plans"].map(
            (perk) => (
              <View key={perk} style={premiumCardStyle.perkBadge}>
                <TSSnippetText textStyles={premiumCardStyle.perkText}>
                  {perk}
                </TSSnippetText>
              </View>
            )
          )}
        </View>
      </LinearGradient>

      <Animated.Image
        source={champs}
        style={[
          premiumCardStyle.champsImage,
          { opacity: fadeAnim },
        ]}
      />
    </View>
  );
};

const premiumCardStyle = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  title: {
    color: "#FFF",
    fontSize: 17,
    marginLeft: 8,
    fontWeight: "bold",
  },
  renewText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    marginBottom: 12,
  },
  perksRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  perkBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  perkText: {
    color: "#FFF",
    fontSize: 11,
  },
  champsImage: {
    width: "100%",
    height: 180,
    borderRadius: 10,
    marginTop: 8,
  },
});

// ─── Profile (main) ───────────────────────────────────────────────────────────

const Profile: FunctionComponent = () => {
  const theme = useTheme();
  const router = useRouter();

  const { data, isLoading, isSuccess, isError, error } =
    useGetProfileViewQuery("");

  const loadedProductsRef = useRef(false);
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);
  const [makePurchaseLoading, setMakePurchaseLoading] = useState(false);
  const [curProducts, setCurProducts] = useState<
    PurchasesStoreProduct[] | null
  >(null);

  const invalidateUser = () => {
    store.dispatch(apiSlice.util.invalidateTags(["User"]));
  };

  const makePurchase = async (product: PurchasesStoreProduct | null) => {
    if (!product) return console.log("Cannot make purchase with null product");
    try {
      console.log("Making purchase....");
      const purchaseRes = await Purchases.purchaseStoreProduct(product);
      console.log("Made purchases for IAP: ", product.identifier, purchaseRes);
    } catch (err) {
      console.error("Error purchasing sub: ", err);
    }
    try {
      setMakePurchaseLoading(true);
      setTimeout(() => {
        invalidateUser();
        setMakePurchaseLoading(false);
        startThankYouFadeIn();
      }, 150);
    } catch (err) {
      console.log("Error invalidating user after makepurchase: ", err);
    }
  };

  useEffect(() => {
    if (data && !isLoading && !loadedProductsRef.current) {
      const setup = async () => {
        try {
          if (Platform.OS == "ios") {
            // RC is configured once at app startup in _layout.tsx
            await Purchases.setAttributes({
              userID: data?.user.id.toString(),
            });
            await Purchases.syncAttributesAndOfferingsIfNeeded();

            const offerings = await Purchases.getOfferings();
            const subOffering = offerings.all["monthly_membership_offering"];
            const products = subOffering?.availablePackages.map((p) => p.product) ?? [];
            console.log("Got subscription products from RC offering: ", products);
            loadedProductsRef.current = true;
            setCurProducts(products);
          } else if (Platform.OS == "android") {
            console.log("Skipping Android, not publishing yet.");
          }
        } catch (err) {
          console.log("Error getting offerings: ", err);
        }
      };

      setup()
        .then(() => (loadedProductsRef.current = true))
        .catch(console.log);
    }
  }, [data]);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const startThankYouFadeIn = () => {
    Animated.timing(fadeAnim, {
      delay: 250,
      toValue: 1,
      duration: 4000,
      useNativeDriver: true,
    }).start();
  };

  if (isSuccess && isDateInFuture(data.user)) {
    startThankYouFadeIn();
  } else if (isSuccess && !isDateInFuture(data.user)) {
    fadeAnim.setValue(0);
  }

  const logout = () => {
    AuthManager.logout()
      .then(() => console.log("ProfileSettings: Logged out"))
      .catch((err) => console.log("ProfileSettings Logout Error", err));
  };

  const isMember = isSuccess && isDateInFuture(data.user);

  // ── Error state ──────────────────────────────────────────────────────────

  if (isError) {
    let errorMessage = "";
    if ((typeof error).toString() == "SerializedError") {
      const _error = error as any;
      errorMessage = "error: " + _error.toString();
    } else if ((typeof error).toString() == "ErrorProps") {
      const _error = error as ErrorProps;
      errorMessage = `${_error.status} - ${_error.data}`;
    }
    return (
      <PageContainer>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24 }}>
          <Icon name="warning-outline" color={theme.palette.AWE_Red} style={{ fontSize: 40, marginBottom: 12 }} />
          <TSCaptionText textStyles={{ textAlign: "center", marginBottom: 16 }}>
            {errorMessage || "Something went wrong"}
          </TSCaptionText>
          <TouchableHighlight
            underlayColor={theme.palette.darkGray}
            style={{ borderRadius: 8, padding: 12 }}
            onPress={() => setShowConfirmLogout(true)}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Icon name="log-out" color={theme.palette.AWE_Red} style={{ fontSize: 22, marginRight: 8 }} />
              <TSSnippetText textStyles={{ color: theme.palette.AWE_Red }}>
                Logout
              </TSSnippetText>
            </View>
          </TouchableHighlight>
        </View>
        <ActionCancelModal
          actionText="Logout"
          closeText="Cancel"
          modalText="Are you sure you want to logout?"
          onAction={logout}
          modalVisible={showConfirmLogout}
          onRequestClose={() => setShowConfirmLogout(false)}
        />
      </PageContainer>
    );
  }

  // ── Loading state ─────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <PageContainer>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="small" color={theme.palette.text} />
        </View>
      </PageContainer>
    );
  }

  // ── No data ───────────────────────────────────────────────────────────────

  if (!isSuccess) {
    return (
      <PageContainer>
        <TSCaptionText>No Data</TSCaptionText>
      </PageContainer>
    );
  }

  // ── Success ───────────────────────────────────────────────────────────────

  const initials = (data.user.username ?? "?").charAt(0).toUpperCase();

  return (
    <PageContainer>
      <ScrollView
        style={{ width: "100%" }}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ──────────────────────────────────────────────────── */}
        <View style={profileStyles.header}>
          {/* Avatar circle */}
          <View
            style={[
              profileStyles.avatarCircle,
              { backgroundColor: isMember ? theme.palette.AWE_Green : theme.palette.darkGray },
            ]}
          >
            <TSParagrapghText textStyles={profileStyles.avatarInitial}>
              {initials}
            </TSParagrapghText>
          </View>

          {/* Username */}
          <View style={{ width: "70%", alignItems: "center" }}>
            <UserInfoPanel user={data.user} />
          </View>

          {/* Membership badge */}
          <View
            style={[
              profileStyles.memberBadge,
              {
                backgroundColor: isMember
                  ? lightenHexColor(theme.palette.AWE_Green, 0.15)
                  : theme.palette.darkGray,
              },
            ]}
          >
            <Icon
              name={isMember ? "star" : "star-outline"}
              color={isMember ? theme.palette.AWE_Green : theme.palette.gray}
              style={{ fontSize: 12, marginRight: 4 }}
            />
            <TSSnippetText
              textStyles={{
                color: isMember ? theme.palette.AWE_Green : theme.palette.gray,
                fontSize: 12,
              }}
            >
              {isMember ? "Premium Member" : "Free Account"}
            </TSSnippetText>
          </View>
        </View>

        {/* ── Subscription ────────────────────────────────────────────── */}
        <SectionHeader title="Subscription" />
        <View style={profileStyles.sectionCard}>
          {makePurchaseLoading ? (
            <View style={{ padding: 24, alignItems: "center" }}>
              <ActivityIndicator size="small" color={theme.palette.text} />
            </View>
          ) : isMember ? (
            <PremiumMemberCard
              subEndDate={data.user.sub_end_date}
              onRefresh={invalidateUser}
              fadeAnim={fadeAnim}
            />
          ) : (
            <View style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
              <View style={{ alignItems: "center" }}>
                <SubscriptionOffer
                  makePurchase={makePurchase}
                  products={curProducts}
                />
              </View>
            </View>
          )}
        </View>

        {/* ── Account ─────────────────────────────────────────────────── */}
        <SectionHeader title="Account" />
        <View
          style={[
            profileStyles.sectionCard,
            { backgroundColor: theme.palette.darkGray, marginHorizontal: 16, borderRadius: 12 },
          ]}
        >
          {/* Email display (non-tappable) */}
          <View style={[settingsRowStyle.row, { paddingVertical: 10 }]}>
            <Icon
              name="mail-outline"
              color={theme.palette.gray}
              style={settingsRowStyle.icon}
            />
            <TSSnippetText textStyles={{ color: theme.palette.gray, flex: 1, marginLeft: 8 }}>
              {data.user.email}
            </TSSnippetText>
          </View>
          <Divider />

          <SettingsRow
            icon="trophy-outline"
            title="Workout Item Maxes"
            onPress={() => router.push({ pathname: "/WorkoutItemMaxes", params: { userID: data.user.id } })}
          />
          <Divider />

          <SettingsRow
            icon="add-circle-outline"
            title="Create Personal Workout Group"
            testID={TestIDs.CreateWorkoutGroupScreenBtn.name()}
            onPress={() =>
              router.push({
                pathname: "/input_pages/gyms/CreateWorkoutGroupScreen",
                params: { ownedByClass: 0, ownerID: data.user.id.toString() },
              })
            }
          />
          <Divider />

          <SettingsRow
            icon="key-outline"
            title="Change Password"
            testID={TestIDs.ResetPasswordScreenBtn.name()}
            onPress={() => router.push({ pathname: "/input_pages/users/ResetPassword" })}
          />
          <Divider />

          <SettingsRow
            icon="refresh-outline"
            title="Refresh Subscription Status"
            onPress={invalidateUser}
            rightContent={
              <Icon
                name="refresh-outline"
                color={theme.palette.AWE_Green}
                style={{ fontSize: 16 }}
              />
            }
          />
        </View>

        {/* ── Legal ───────────────────────────────────────────────────── */}
        <SectionHeader title="Legal" />
        <View
          style={[
            profileStyles.sectionCard,
            { backgroundColor: theme.palette.darkGray, marginHorizontal: 16, borderRadius: 12 },
          ]}
        >
          <SettingsRow
            icon="document-text-outline"
            title="Terms of Use (EULA)"
            external
            onPress={() =>
              Linking.openURL(
                "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/"
              )
            }
          />
          <Divider />

          <SettingsRow
            icon="shield-checkmark-outline"
            title="Privacy Policy"
            external
            onPress={() =>
              Linking.openURL(
                "https://gist.github.com/killuhwhale/1613abbf3258807a5bc78e5fc5e569fb"
              )
            }
          />
          <Divider />

          <SettingsRow
            icon="person-remove-outline"
            title="Remove Account"
            danger
            external
            onPress={() => Linking.openURL(`https://${DOMAIN_NAME}/removeAccount`)}
          />
        </View>

        {/* ── Logout ──────────────────────────────────────────────────── */}
        <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
          <TouchableHighlight
            underlayColor={lightenHexColor(theme.palette.AWE_Red, 0.1)}
            style={[
              profileStyles.logoutBtn,
              { borderColor: theme.palette.AWE_Red },
            ]}
            onPress={() => setShowConfirmLogout(true)}
          >
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
              <Icon name="log-out-outline" color={theme.palette.AWE_Red} style={{ fontSize: 20, marginRight: 8 }} />
              <TSSnippetText textStyles={{ color: theme.palette.AWE_Red, fontSize: 15 }}>
                Logout
              </TSSnippetText>
            </View>
          </TouchableHighlight>
        </View>

        {/* ── Ad Banner (non-members only) ─────────────────────────────── */}
        {!isMember && (
          <View style={{ marginTop: 24 }}>
            <BannerAddMembership />
          </View>
        )}
      </ScrollView>

      {/* ── Modals ────────────────────────────────────────────────────── */}
      <ActionCancelModal
        actionText="Logout"
        closeText="Cancel"
        modalText="Are you sure you want to logout?"
        onAction={logout}
        modalVisible={showConfirmLogout}
        onRequestClose={() => setShowConfirmLogout(false)}
      />
    </PageContainer>
  );
};

const profileStyles = StyleSheet.create({
  header: {
    alignItems: "center",
    paddingTop: 32,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarInitial: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFF",
  },
  memberBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 8,
  },
  sectionCard: {
    alignSelf: "stretch",
  },
  logoutBtn: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
  },
});

export default Profile;

/** Code for Favorites in body of Profile, replace once we are using gyms and classes
 *
 *
  // const {
  //   data: dataGymFavs,
  //   isLoading: isLoadingGymFavs,
  //   isSuccess: isSuccessGymFavs,
  //   isError: isErrorGymFavs,
  //   error: errorGymFavs,
  // } = useGetProfileGymFavsQuery("");

  // const {
  //   data: dataGymClassFavs,
  //   isLoading: isLoadingGymClassFavs,
  //   isSuccess: isSuccessGymClassFavs,
  //   isError: isErrorGymClassFavs,
  //   error: errorGymClassFavs,
  // } = useGetProfileGymClassFavsQuery("");

  // const {
  //   data: usersGyms,
  //   isLoading: userGymsLoading,
  //   isSuccess: gymIsSuccess,
  //   isError: gymIsError,
  //   error: gymError,
  // } = useGetUserGymsQuery("");

  // const [deleteGymModalVisible, setDeleteGymModalVisibleVisible] =
  //   useState(false);

  // const [curDelGym, setCurDelGym] = useState({} as GymCardProps);

  // const [deleteGymMutation, { isLoading: deleteGymLoading }] =
  //   useDeleteGymMutation();

  // const onConfirmDelete = (gym: GymCardProps) => {
  //   setCurDelGym(gym);
  //   setDeleteGymModalVisibleVisible(true);
  // };

  // const onDelete = async () => {
  //   try {
  //     const deletedGym = await deleteGymMutation(curDelGym.id).unwrap();
  //     console.log("Deleted Gym: ", deletedGym);
  //     setDeleteGymModalVisibleVisible(false);
  //   } catch (error) {
  //     console.log("Error deleting gym: ", error);
  //   }
  // };
 *
 */

// ─── Preserved panel components (for future Gyms/Classes features) ────────────

const Touchable = styled.TouchableHighlight`
  height: 100%;
  border-radius: 25px;
`;

const GymsPanel: FunctionComponent<GymsPanelProps> = ({ data, onDelete }) => {
  const theme = useTheme();
  const router = useRouter();

  const goToGym = (gym: GymCardProps) => {
    router.push({ pathname: "/GymScreen", params: { ...gym } });
  };

  return (
    <View style={{ width: "100%" }}>
      {data.map((gym) => {
        const { id, date, desc, title, mainImage, logoImage, owner_id } = gym;
        return (
          <View
            style={{
              height: 35,
              justifyContent: "space-between",
              borderWidth: 1,
              borderColor: theme.palette.darkGray,
              borderRadius: 8,
              marginVertical: 8,
            }}
            key={`gym${id}`}
          >
            <TouchableHighlight
              key={id}
              underlayColor={theme.palette.transparent}
              onPress={() => goToGym(gym)}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingHorizontal: 16,
                  width: "100%",
                  height: "100%",
                }}
              >
                <TSParagrapghText>{title}</TSParagrapghText>
                <Icon
                  name="remove-circle-sharp"
                  color={darkRed}
                  style={{ fontSize: 24 }}
                  onPress={() => onDelete(gym)}
                />
              </View>
            </TouchableHighlight>
          </View>
        );
      })}
    </View>
  );
};

const FavGymsPanel: FunctionComponent<FavGymsPanelProps> = (props) => {
  const theme = useTheme();
  const router = useRouter();

  const goToGym = (gym: GymCardProps) => {
    router.push({ pathname: "/GymScreen", params: { ...gym } });
  };

  return (
    <View style={{ width: "100%" }}>
      {props.data.map((favGym) => {
        const {
          id,
          gym: { title, id: gym_id },
        } = favGym;
        return (
          <View
            style={{ height: 50, justifyContent: "space-between" }}
            key={`gymfav${id}_${gym_id}`}
          >
            <Touchable
              key={id}
              underlayColor={theme.palette.transparent}
              activeOpacity={0.9}
              onPress={() => goToGym(favGym.gym)}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Icon
                  name="star"
                  color={theme.palette.text}
                  style={{ fontSize: 24, margin: 12 }}
                />
                <TSCaptionText numberOfLines={1} textStyles={{ width: "80%" }}>
                  {title}
                </TSCaptionText>
              </View>
            </Touchable>
          </View>
        );
      })}
    </View>
  );
};

const FavGymClassesPanel: FunctionComponent<FavGymClassesPanelProps> = (
  props
) => {
  const theme = useTheme();
  const router = useRouter();
  const goToGymClass = (gymClass: GymClassCardProps) => {
    router.push({ pathname: "/GymClassScreen", params: { ...gymClass, private: String(gymClass.private) } });
  };

  return (
    <View style={{ width: "100%" }}>
      {props.data.map((favGymClass) => {
        const {
          id,
          gym_class: {
            title,
            id: gym_class_id,
            gym: { title: gymTitle },
          },
        } = favGymClass;
        return (
          <View
            style={{ height: 50, justifyContent: "space-between" }}
            key={`favclass${id}_${gym_class_id}`}
          >
            <Touchable
              key={id}
              underlayColor={theme.palette.transparent}
              activeOpacity={0.9}
              onPress={() =>
                goToGymClass(
                  favGymClass.gym_class as unknown as GymClassCardProps
                )
              }
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Icon
                  name="star"
                  color={theme.palette.text}
                  style={{ fontSize: 24, margin: 12 }}
                />
                <TSCaptionText numberOfLines={1} textStyles={{ width: "85%" }}>
                  {title} - {gymTitle}
                </TSCaptionText>
              </View>
            </Touchable>
          </View>
        );
      })}
    </View>
  );
};

// ─── Subscription Offer Card ──────────────────────────────────────────────────

type IAPSub = {
  makePurchase: (product: PurchasesStoreProduct | null) => Promise<void>;
  products: PurchasesStoreProduct[] | null;
};

function SubscriptionOffer({ products, makePurchase }: IAPSub) {
  const theme = useTheme();
  const product = products && products?.length > 0 ? products[0] : null;

  const [showPurchaseModal, setShowPruchaseModal] = useState(false);
  return (
    <LinearGradient
      colors={[theme.palette.primary.main, theme.palette.AWE_Green]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={offerStyles.card}
    >
      <TSCaptionText textStyles={offerStyles.headline}>Go Premium</TSCaptionText>
      <PurchaseModal
        modalVisible={showPurchaseModal}
        onRequestClose={() => setShowPruchaseModal(false)}
        product={product}
        makePurchase={makePurchase}
      />

      <View style={offerStyles.features}>
        <View style={offerStyles.featureRow}>
          <Icon name="close-outline" size={20} color="#FFF" />
          <TSSnippetText textStyles={offerStyles.featureText}>
            Ad-free experience
          </TSSnippetText>
        </View>
        <View style={offerStyles.featureRow}>
          <Icon name="apps-outline" size={20} color="#FFF" />
          <TSSnippetText textStyles={offerStyles.featureText}>
            Create up to 15 workouts/day
          </TSSnippetText>
        </View>
        <View style={offerStyles.featureRow}>
          <Icon name="barbell-outline" size={20} color="#FFF" />
          <TSSnippetText textStyles={offerStyles.featureText}>
            World Class workout plans
          </TSSnippetText>
        </View>
        <View style={offerStyles.featureRow}>
          <Icon name="sparkles-outline" size={20} color="#FFF" />
          <TSSnippetText textStyles={offerStyles.featureText}>
            AI-powered workout generator
          </TSSnippetText>
        </View>
      </View>

      <TouchableOpacity
        style={[offerStyles.button, { backgroundColor: theme.palette.AWE_Green }]}
        onPress={() => setShowPruchaseModal(true)}
      >
        <TSButtonText textStyles={offerStyles.buttonText}>
          Unlock Premium
        </TSButtonText>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const offerStyles = StyleSheet.create({
  card: {
    width: "90%",
    alignSelf: "center",
    borderRadius: 12,
    padding: 20,
    marginVertical: 8,
    elevation: 5,
  },
  headline: {
    color: "#FFF",
    fontSize: 24,
    textAlign: "center",
    marginBottom: 8,
  },
  features: {
    marginVertical: 12,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  featureText: {
    color: "#FFF",
    marginLeft: 8,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 12,
  },
  buttonText: {
    textAlign: "center",
    fontSize: 16,
  },
});
