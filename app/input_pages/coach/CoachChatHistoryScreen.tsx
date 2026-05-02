import React, { FunctionComponent, useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "styled-components/native";
import { router, useFocusEffect } from "expo-router";
import Icon from "react-native-vector-icons/Ionicons";
import {
  TSCaptionText,
  TSInputTextSm,
  TSParagrapghText,
  TSTitleText,
} from "@/src/app_components/Text/Text";
import {
  ChatSession,
  deleteSession,
  getAllSessions,
  initChatDB,
} from "@/src/utils/chatDB";
import { Container } from "@/src/app_components/shared";
import styled from "styled-components/native";

const PageContainer = styled(Container)`
  background-color: ${(props) => props.theme.palette.backgroundColor};
  justify-content: flex-start;
  width: 100%;
`;

const formatDate = (ts: number) => {
  const d = new Date(ts);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
};

const CoachChatHistoryScreen: FunctionComponent = () => {
  const theme = useTheme();
  const [sessions, setSessions] = useState<ChatSession[]>([]);

  useFocusEffect(
    useCallback(() => {
      initChatDB();
      getAllSessions().then(setSessions);
    }, [])
  );

  const handleNewChat = () => {
    router.push("/input_pages/coach/CoachChatScreen");
  };

  const handleOpenSession = (session: ChatSession) => {
    router.push({
      pathname: "/input_pages/coach/CoachChatScreen",
      params: { sessionId: session.id, sessionTitle: session.title },
    });
  };

  const handleDelete = (session: ChatSession) => {
    Alert.alert(
      "Delete Chat",
      `Delete "${session.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteSession(session.id).then(() =>
              setSessions((prev) => prev.filter((s) => s.id !== session.id))
            );
          },
        },
      ]
    );
  };

  const renderSession = ({ item }: { item: ChatSession }) => {
    const title = item.title?.trim() || "New chat";
    const countText =
      item.message_count && item.message_count > 0
        ? `${item.message_count} ${item.message_count === 1 ? "message" : "messages"}`
        : null;
    const subtitle = [item.coach_type, countText].filter(Boolean).join(" · ");

    return (
      <TouchableOpacity
        onPress={() => handleOpenSession(item)}
        onLongPress={() => handleDelete(item)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 12,
          paddingHorizontal: 16,
          borderBottomWidth: 1,
          borderBottomColor: theme.palette.darkGray,
          width: "100%",
        }}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: `${theme.palette.AWE_Green}33`,
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
          }}
        >
          <Icon name="chatbubble-outline" size={18} color={theme.palette.AWE_Green} />
        </View>

        <View style={{ flex: 1, marginRight: 8, minWidth: 0 }}>
          <TSInputTextSm
            textStyles={{ color: theme.palette.text, fontWeight: "600" }}
            numberOfLines={1}
          >
            {title}
          </TSInputTextSm>
          {item.last_message_preview ? (
            <TSCaptionText
              textStyles={{ color: theme.palette.gray, marginTop: 2 }}
              numberOfLines={1}
            >
              {item.last_message_preview}
            </TSCaptionText>
          ) : null}
          {subtitle ? (
            <TSCaptionText
              textStyles={{ color: theme.palette.gray, marginTop: 2 }}
              numberOfLines={1}
            >
              {subtitle}
            </TSCaptionText>
          ) : null}
        </View>

        <TSCaptionText textStyles={{ color: theme.palette.gray }}>
          {formatDate(item.updated_at)}
        </TSCaptionText>
      </TouchableOpacity>
    );
  };

  return (
    <PageContainer>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 12,
          borderBottomWidth: 1,
          borderBottomColor: theme.palette.darkGray,
          alignSelf: "stretch",
          width: "100%",
        }}
      >
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
          <Icon name="chevron-back" size={26} color={theme.palette.text} />
        </TouchableOpacity>
        <TSTitleText textStyles={{ flex: 1, fontSize: 18 }}>
          Coach Chats
        </TSTitleText>
        <TouchableOpacity
          onPress={handleNewChat}
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: theme.palette.AWE_Green,
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 10,
          }}
        >
          <Icon name="add" size={18} color={theme.palette.white} style={{ marginRight: 4 }} />
          <TSCaptionText textStyles={{ color: theme.palette.white, fontWeight: "700" }}>
            New
          </TSCaptionText>
        </TouchableOpacity>
      </View>

      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id}
        renderItem={renderSession}
        style={{ alignSelf: "stretch", width: "100%" }}
        contentContainerStyle={{ flexGrow: 1 }}
        ListEmptyComponent={
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              paddingTop: 80,
              paddingHorizontal: 32,
            }}
          >
            <Icon
              name="chatbubbles-outline"
              size={52}
              color={theme.palette.gray}
              style={{ marginBottom: 16 }}
            />
            <TSParagrapghText
              textStyles={{ color: theme.palette.gray, textAlign: "center" }}
            >
              No chats yet. Start a conversation with your coach.
            </TSParagrapghText>
          </View>
        }
      />
    </PageContainer>
  );
};

export default CoachChatHistoryScreen;
