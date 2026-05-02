import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Animated,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Share,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
// TODO: swap back to expo-clipboard after next dev-client rebuild
// import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { useTheme } from "styled-components/native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import Icon from "react-native-vector-icons/Ionicons";
import { TSCaptionText, TSInputTextSm, TSTitleText } from "@/src/app_components/Text/Text";
import { useCoachChatMutation, useGetProfileViewQuery } from "@/src/redux/api/apiSlice";
import {
  CoachMemory,
  CoachProfile,
  buildCoachPrompt,
  buildMemoryContext,
  getCoachMemory,
  getCoachProfile,
  mergeCoachMemory,
} from "@/src/utils/coachStorage";
import {
  ChatMessage,
  createSession,
  getMessages,
  initChatDB,
  insertMessage,
  updateSessionTitle,
} from "@/src/utils/chatDB";

// ── Typing indicator ──────────────────────────────────────────────────────────

const TypingIndicator: FunctionComponent = () => {
  const theme = useTheme();
  const dots = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

  useEffect(() => {
    const anims = dots.map((dot, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 150),
          Animated.timing(dot, { toValue: -6, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0,  duration: 300, useNativeDriver: true }),
          Animated.delay(600 - i * 150),
        ])
      )
    );
    anims.forEach((a) => a.start());
    return () => anims.forEach((a) => a.stop());
  }, []);

  return (
    <View style={{ flexDirection: "row", paddingHorizontal: 20, paddingBottom: 10, alignItems: "flex-end" }}>
      <View style={{
        width: 30, height: 30, borderRadius: 15,
        backgroundColor: theme.palette.AWE_Green,
        alignItems: "center", justifyContent: "center", marginRight: 8,
      }}>
        <Icon name="person" size={16} color={theme.palette.white} />
      </View>
      <View style={{
        flexDirection: "row", alignItems: "center",
        backgroundColor: theme.palette.darkGray,
        borderRadius: 16, borderBottomLeftRadius: 4,
        paddingHorizontal: 14, paddingVertical: 12,
      }}>
        {dots.map((dot, i) => (
          <Animated.View key={i} style={{
            width: 7, height: 7, borderRadius: 3.5,
            backgroundColor: theme.palette.gray,
            marginHorizontal: 2,
            transform: [{ translateY: dot }],
          }} />
        ))}
      </View>
    </View>
  );
};

// ── Main screen ───────────────────────────────────────────────────────────────

const CoachChatScreen: FunctionComponent = () => {
  const theme = useTheme();
  const params = useLocalSearchParams();
  const flatListRef = useRef<FlatList>(null);

  // If sessionId is passed, we're resuming; otherwise it's a new chat
  const existingSessionId = params.sessionId as string | undefined;

  const [profile,   setProfile]   = useState<CoachProfile | null>(null);
  const [memory,    setMemory]    = useState<CoachMemory | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(existingSessionId ?? null);
  const [messages,  setMessages]  = useState<ChatMessage[]>([]);
  const [input,     setInput]     = useState("");
  const [copiedId,  setCopiedId]  = useState<string | null>(null);
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [sendChat, { isLoading }] = useCoachChatMutation();
  const { data: profileData } = useGetProfileViewQuery("");

  useFocusEffect(
    useCallback(() => {
      initChatDB();
      getCoachProfile().then(setProfile);
      getCoachMemory().then(setMemory);

      if (existingSessionId) {
        setSessionId(existingSessionId);
        getMessages(existingSessionId).then(setMessages);
      } else {
        setSessionId(null);
        setMessages([]);
      }
    }, [existingSessionId])
  );

  // Clear copied-indicator timer on unmount
  useEffect(() => {
    return () => {
      if (copiedTimer.current) clearTimeout(copiedTimer.current);
    };
  }, []);

  const scrollToBottom = () =>
    flatListRef.current?.scrollToEnd({ animated: true });

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleCopy = async (item: ChatMessage) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // TODO: once dev-client is rebuilt with expo-clipboard, replace Share with:
    //   await Clipboard.setStringAsync(item.content);
    await Share.share({ message: item.content });
    if (copiedTimer.current) clearTimeout(copiedTimer.current);
    setCopiedId(item.id);
    copiedTimer.current = setTimeout(() => setCopiedId(null), 1800);
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading || !profile) return;

    setInput("");

    // ── Create session on first message ──────────────────────────────────────
    let activeSessionId = sessionId;
    if (!activeSessionId) {
      const newId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const truncatedTitle = text.length > 50 ? text.slice(0, 47) + "..." : text;
      await createSession(newId, truncatedTitle, profile.coachType);
      activeSessionId = newId;
      setSessionId(newId);
    }

    // ── Persist + display user message ───────────────────────────────────────
    const userMsg: ChatMessage = {
      id: `${Date.now()}-u`,
      session_id: activeSessionId,
      role: "user",
      content: text,
      created_at: Date.now(),
    };
    await insertMessage(userMsg);
    setMessages((prev) => [...prev, userMsg]);

    const history = messages.map((m) => ({ role: m.role, content: m.content }));

    try {
      const result = await sendChat({
        message: text,
        history,
        coach_type:     profile.coachType,
        goals:          profile.goals,
        fitness_info:   profile.fitnessInfo,
        memory_context: buildMemoryContext(memory),
        user_id:        profileData?.user?.id,
      }).unwrap();

      if (result.reply) {
        const coachMsg: ChatMessage = {
          id: `${Date.now()}-a`,
          session_id: activeSessionId,
          role: "assistant",
          content: result.reply,
          created_at: Date.now(),
        };
        await insertMessage(coachMsg);
        setMessages((prev) => [...prev, coachMsg]);

        // Persist any new user facts the AI extracted
        if (result.memory_update && typeof result.memory_update === "object") {
          await mergeCoachMemory(result.memory_update);
          // Update local state so the next message in this session uses fresh memory
          const updated = { ...(memory ?? {}), ...result.memory_update, last_updated: Date.now() };
          setMemory(updated);
        }
      }
    } catch {
      const errMsg: ChatMessage = {
        id: `${Date.now()}-e`,
        session_id: activeSessionId,
        role: "assistant",
        content: "Sorry, something went wrong. Try again.",
        created_at: Date.now(),
      };
      await insertMessage(errMsg);
      setMessages((prev) => [...prev, errMsg]);
    }
  };

  const handleGenerateWorkout = () => {
    if (!profile) return;

    router.push({
      pathname: "/input_pages/gyms/AIQuickWorkoutScreen",
      params: {
        initialPrompt: buildCoachPrompt(profile),
      },
    });
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser  = item.role === "user";
    const isCopied = copiedId === item.id;

    return (
      <View style={{
        flexDirection: "row",
        justifyContent: isUser ? "flex-end" : "flex-start",
        marginBottom: 10,
        paddingHorizontal: 12,
      }}>
        {!isUser && (
          <View style={{
            width: 30, height: 30, borderRadius: 15,
            backgroundColor: theme.palette.AWE_Green,
            alignItems: "center", justifyContent: "center",
            marginRight: 8, marginTop: 2,
          }}>
            <Icon name="person" size={16} color={theme.palette.white} />
          </View>
        )}

        {/* Long-pressable bubble */}
        <Pressable
          onLongPress={() => handleCopy(item)}
          delayLongPress={350}
          style={({ pressed }) => ({
            maxWidth: "75%",
            paddingVertical: 10,
            paddingHorizontal: 14,
            borderRadius: 16,
            borderBottomRightRadius: isUser ? 4 : 16,
            borderBottomLeftRadius: isUser ? 16 : 4,
            backgroundColor: isCopied
              ? (isUser ? theme.palette.AWE_Blue : theme.palette.gray)
              : pressed
              ? (isUser ? `${theme.palette.AWE_Green}cc` : `${theme.palette.darkGray}99`)
              : (isUser ? theme.palette.AWE_Green : theme.palette.darkGray),
          })}
        >
          <TSInputTextSm textStyles={{
            color: isUser ? theme.palette.white : theme.palette.text,
            lineHeight: 20,
          }}>
            {item.content}
          </TSInputTextSm>

          {/* "Copied ✓" indicator — appears in-bubble, no layout shift */}
          {isCopied && (
            <View style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 6,
              paddingTop: 6,
              borderTopWidth: 1,
              borderTopColor: isUser
                ? "rgba(255,255,255,0.3)"
                : "rgba(255,255,255,0.15)",
            }}>
              <Icon
                name="checkmark-circle"
                size={12}
                color={isUser ? theme.palette.white : theme.palette.AWE_Green}
                style={{ marginRight: 4 }}
              />
              <TSCaptionText textStyles={{
                color: isUser ? theme.palette.white : theme.palette.AWE_Green,
                fontSize: 11,
              }}>
                Copied
              </TSCaptionText>
            </View>
          )}
        </Pressable>
      </View>
    );
  };

  const headerTitle = (params.sessionTitle as string) || profile?.coachType || "Coach";

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.palette.backgroundColor }}
      behavior={Platform.OS === "ios" ? "padding" : "padding"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 105 : 95}
    >
      {/* Header */}
      <View style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: theme.palette.darkGray,
      }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
          <Icon name="chevron-back" size={26} color={theme.palette.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <TSTitleText textStyles={{ fontSize: 17 }} numberOfLines={1}>
            {headerTitle}
          </TSTitleText>
          {profile?.goals?.length > 0 && (
            <TSCaptionText textStyles={{ color: theme.palette.gray }}>
              {profile.goals.join(" · ")}
            </TSCaptionText>
          )}
        </View>
        <View style={{
          width: 10, height: 10, borderRadius: 5,
          backgroundColor: theme.palette.AWE_Green,
        }} />
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={{ paddingVertical: 16, flexGrow: 1 }}
        onContentSizeChange={scrollToBottom}
        ListEmptyComponent={
          <View style={{
            flex: 1, justifyContent: "center", alignItems: "center",
            paddingHorizontal: 32, paddingTop: 80,
          }}>
            <Icon name="chatbubble-ellipses-outline" size={48}
              color={theme.palette.gray} style={{ marginBottom: 16 }} />
            <TSCaptionText textStyles={{ color: theme.palette.gray, textAlign: "center" }}>
              Ask your coach anything.
            </TSCaptionText>
          </View>
        }
      />

      {isLoading && <TypingIndicator />}

      {/* Input bar */}
      <View style={{
        flexDirection: "row",
        alignItems: "flex-end",
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: theme.palette.darkGray,
        backgroundColor: theme.palette.backgroundColor,
      }}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Message your coach..."
          placeholderTextColor={theme.palette.gray}
          multiline
          style={{
            flex: 1,
            backgroundColor: theme.palette.darkGray,
            borderRadius: 20,
            paddingHorizontal: 16,
            paddingVertical: 10,
            color: theme.palette.text,
            fontSize: 14,
            maxHeight: 100,
            marginRight: 8,
          }}
        />
        <TouchableOpacity
          onPress={handleSend}
          disabled={!input.trim() || isLoading}
          style={{
            width: 42, height: 42, borderRadius: 21,
            backgroundColor: input.trim() && !isLoading
              ? theme.palette.AWE_Green
              : theme.palette.gray,
            alignItems: "center", justifyContent: "center",
          }}
        >
          <Icon name="send" size={18} color={theme.palette.white} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default CoachChatScreen;
